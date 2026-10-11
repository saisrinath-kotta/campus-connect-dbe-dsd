import sys
from datetime import datetime, timedelta
from sqlalchemy import text
from database import engine, SessionLocal, Base
from models import User, Club, Event, EventRegistration, LostFoundItem, Complaint


def init_database():
    """Ensure all required tables and columns exist in PostgreSQL."""
    with engine.connect() as conn:
        # If users table already exists, ensure password column exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(200) DEFAULT 'student123',
                department VARCHAR(100),
                year INT,
                role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.commit()

        # Add password column to users if missing
        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'users'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'users' AND column_name = 'password'
                    ) THEN
                        ALTER TABLE users ADD COLUMN password VARCHAR(200) DEFAULT 'student123';
                    END IF;
                END IF;
            END $$;
        """))
        conn.commit()

        # Add capacity column to events if missing
        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'events'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'events' AND column_name = 'capacity'
                    ) THEN
                        ALTER TABLE events ADD COLUMN capacity INT NOT NULL DEFAULT 50;
                    END IF;
                END IF;
            END $$;
        """))
        conn.commit()

        # Ensure lost_found columns and correct foreign key exist
        conn.execute(text("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'lost_found'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'lost_found' AND column_name = 'category'
                    ) THEN
                        ALTER TABLE lost_found ADD COLUMN category VARCHAR(100) DEFAULT 'General';
                    END IF;
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'lost_found' AND column_name = 'image_url'
                    ) THEN
                        ALTER TABLE lost_found ADD COLUMN image_url TEXT;
                    END IF;
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'lost_found' AND column_name = 'contact_info'
                    ) THEN
                        ALTER TABLE lost_found ADD COLUMN contact_info VARCHAR(150);
                    END IF;

                    -- Fix foreign key constraint to point to users(id)
                    ALTER TABLE lost_found DROP CONSTRAINT IF EXISTS lost_found_student_id_fkey;
                    BEGIN
                        ALTER TABLE lost_found ADD CONSTRAINT lost_found_student_id_fkey 
                        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL;
                    EXCEPTION WHEN others THEN
                        NULL;
                    END;
                END IF;

                -- Ensure complaints table columns exist
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'complaints'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'complaints' AND column_name = 'priority'
                    ) THEN
                        ALTER TABLE complaints ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium';
                    END IF;
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'complaints' AND column_name = 'admin_response'
                    ) THEN
                        ALTER TABLE complaints ADD COLUMN admin_response TEXT;
                    END IF;
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'complaints' AND column_name = 'updated_at'
                    ) THEN
                        ALTER TABLE complaints ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                    END IF;
                END IF;
            END $$;
        """))
        conn.commit()



    # Create any tables defined in models that don't yet exist
    from models import Base
    Base.metadata.create_all(bind=engine)
    print("[INFO] Database schema verified and updated successfully.")


def seed_database():
    init_database()
    db = SessionLocal()
    try:
        print("[INFO] Checking and seeding CampusConnect database...")

        # 1. Seed Demo Users with passwords
        users_data = [
            {
                "name": "Demo Student",
                "email": "student@campusconnect.local",
                "password": "student123",
                "department": "Computer Science",
                "year": 3,
                "role": "STUDENT"
            },
            {
                "name": "Demo Coordinator",
                "email": "coordinator@campusconnect.local",
                "password": "coordinator123",
                "department": "Information Technology",
                "year": 4,
                "role": "COORDINATOR"
            },
            {
                "name": "Demo Admin",
                "email": "admin@campusconnect.local",
                "password": "admin123",
                "department": "Administration",
                "year": 4,
                "role": "ADMIN"
            }
        ]

        user_instances = {}
        for u_data in users_data:
            user = db.query(User).filter(User.email == u_data["email"]).first()
            if not user:
                user = User(
                    name=u_data["name"],
                    email=u_data["email"],
                    password=u_data["password"],
                    department=u_data["department"],
                    year=u_data["year"],
                    role=u_data["role"]
                )
                db.add(user)
                db.flush()
                print(f"  [+] Added User: {user.name} ({user.role})")
            else:
                user.name = u_data["name"]
                user.password = u_data["password"]
                user.department = u_data["department"]
                user.year = u_data["year"]
                user.role = u_data["role"]
                db.flush()
                print(f"  [*] User already exists: {user.name} ({user.role})")
            user_instances[user.role] = user


        # 2. Seed Clubs
        clubs_data = [
            {
                "name": "Coding Club",
                "description": "Fostering programming excellence, competitive coding, and web development skills among students."
            },
            {
                "name": "Robotics & AI Society",
                "description": "Hands-on robotics hardware building, IoT experiments, and applied artificial intelligence workshops."
            },
            {
                "name": "Cultural Club",
                "description": "Annual cultural celebrations, music, arts, drama, and festive events across campus."
            },
            {
                "name": "Sports Club",
                "description": "Encouraging sportsmanship, fitness, athletics, and university-level tournaments."
            }
        ]

        club_instances = {}
        for club_info in clubs_data:
            club = db.query(Club).filter(Club.name == club_info["name"]).first()
            if not club:
                club = Club(name=club_info["name"], description=club_info["description"])
                db.add(club)
                db.flush()
                print(f"  [+] Added Club: {club.name}")
            else:
                club.description = club_info["description"]
                db.flush()
                print(f"  [*] Club already exists: {club.name}")
            club_instances[club.name] = club

        # 3. Seed Events
        now = datetime.utcnow()
        events_data = [
            {
                "title": "Campus Hackathon",
                "description": "Inter-college coding and problem-solving competition.",
                "event_date": now + timedelta(days=5, hours=4),
                "location": "Main Auditorium",
                "capacity": 100,
                "club_name": "Coding Club"
            },
            {
                "title": "Robotics Workshop",
                "description": "Hands-on robotics workshop for students.",
                "event_date": now + timedelta(days=12, hours=2),
                "location": "Innovation Lab",
                "capacity": 50,
                "club_name": "Robotics & AI Society"
            },
            {
                "title": "Web Development Seminar",
                "description": "Full-stack web development seminar.",
                "event_date": now + timedelta(days=18, hours=6),
                "location": "Seminar Hall",
                "capacity": 80,
                "club_name": "Coding Club"
            },
            {
                "title": "Cultural Fest",
                "description": "Annual cultural celebration.",
                "event_date": now + timedelta(days=25, hours=5),
                "location": "Open Air Theatre",
                "capacity": 200,
                "club_name": "Cultural Club"
            }
        ]

        event_instances = {}
        events_added = 0
        for ev_info in events_data:
            club = club_instances.get(ev_info["club_name"])
            existing_event = db.query(Event).filter(Event.title == ev_info["title"]).first()
            if not existing_event:
                event = Event(
                    title=ev_info["title"],
                    description=ev_info["description"],
                    event_date=ev_info["event_date"],
                    location=ev_info["location"],
                    capacity=ev_info["capacity"],
                    club_id=club.club_id if club else None
                )
                db.add(event)
                db.flush()
                events_added += 1
                print(f"  [+] Added Event: {ev_info['title']} (Capacity: {ev_info['capacity']})")
                event_instances[event.title] = event
            else:
                existing_event.capacity = ev_info["capacity"]
                existing_event.location = ev_info["location"]
                existing_event.description = ev_info["description"]
                existing_event.club_id = club.club_id if club else existing_event.club_id
                db.flush()
                print(f"  [*] Event already exists: {ev_info['title']} (Capacity: {existing_event.capacity})")
                event_instances[existing_event.title] = existing_event

        # 4. Optional initial registration for demo student
        demo_student = user_instances.get("STUDENT")
        hackathon_event = event_instances.get("Campus Hackathon")
        if demo_student and hackathon_event:
            existing_reg = db.query(EventRegistration).filter(
                EventRegistration.student_id == demo_student.id,
                EventRegistration.event_id == hackathon_event.event_id
            ).first()
            if not existing_reg:
                reg = EventRegistration(
                    student_id=demo_student.id,
                    event_id=hackathon_event.event_id
                )
        # 5. Seed Lost & Found Items for AI Image Search & Campus Tracking
        lost_found_data = [
            {
                "item_name": "Apple AirPods Pro (White case)",
                "description": "White Apple AirPods Pro inside wireless charging case found near Study Desk 14. Has small scratch on back lid.",
                "item_type": "Found",
                "category": "Electronics",
                "location": "Central Library, 2nd Floor Silent Zone",
                "status": "Active",
                "contact_info": "Library Security Desk (lib-security@kluniversity.in)",
                "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60"
            },
            {
                "item_name": "KL University Student ID Card - CSE",
                "description": "Official plastic RFID Student Identity Card for Priya Sharma, Department of Computer Science, Reg No: 2200030112.",
                "item_type": "Found",
                "category": "ID Card",
                "location": "Cafeteria Block B Cashier Counter",
                "status": "Active",
                "contact_info": "Admin Student Affairs Desk",
                "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60"
            },
            {
                "item_name": "Midnight Blue Hydro Flask Water Bottle",
                "description": "32oz stainless steel insulated water bottle in dark navy blue color, with silver cap and KL Robotics sticker.",
                "item_type": "Lost",
                "category": "Drinkware",
                "location": "Main Sports Complex, Court 2",
                "status": "Active",
                "contact_info": "student@campusconnect.local",
                "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60"
            },
            {
                "item_name": "Casio Scientific Calculator fx-991EX",
                "description": "Black and silver Casio ClassWiz fx-991EX engineering calculator left behind after exam session.",
                "item_type": "Found",
                "category": "Electronics",
                "location": "Computer Lab 3, 3rd Floor CSE Block",
                "status": "Active",
                "contact_info": "CSE Department Lab In-Charge",
                "image_url": "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60"
            },
            {
                "item_name": "Wildcraft Black Tech Backpack",
                "description": "Water-resistant black polyester Wildcraft laptop backpack with red zipper accents containing engineering notebooks.",
                "item_type": "Lost",
                "category": "Bags",
                "location": "Mechanical Workshop Seminar Room",
                "status": "Active",
                "contact_info": "student@campusconnect.local",
                "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60"
            },
            {
                "item_name": "Silver Keychain with Honda Bike Key & KL Tag",
                "description": "Metallic ring holding Honda two-wheeler smart key, small brass house key, and red fabric KL lanyard tag.",
                "item_type": "Found",
                "category": "Keys",
                "location": "East Gate Student Parking Stand 2",
                "status": "Active",
                "contact_info": "Main Gate Campus Security Booth",
                "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=60"
            }
        ]

        for lf_data in lost_found_data:
            existing_lf = db.query(LostFoundItem).filter(LostFoundItem.item_name == lf_data["item_name"]).first()
            if not existing_lf:
                lf_item = LostFoundItem(
                    item_name=lf_data["item_name"],
                    description=lf_data["description"],
                    item_type=lf_data["item_type"],
                    category=lf_data["category"],
                    location=lf_data["location"],
                    status=lf_data["status"],
                    contact_info=lf_data["contact_info"],
                    image_url=lf_data["image_url"],
                    student_id=demo_student.id if demo_student and lf_data["item_type"] == "Lost" else None
                )
                db.add(lf_item)
                print(f"  [+] Added Lost/Found: {lf_item.item_name} ({lf_item.item_type})")
            else:
                existing_lf.category = lf_data["category"]
                existing_lf.contact_info = lf_data["contact_info"]
                existing_lf.image_url = lf_data["image_url"]
                existing_lf.location = lf_data["location"]
                existing_lf.description = lf_data["description"]

        # 6. Seed Sample Complaints
        complaints_data = [
            {
                "title": "Wi-Fi Connectivity Drop in Hostel Block C",
                "description": "High packet loss and intermittent disconnections on student Wi-Fi network between 8 PM and 11 PM on the 3rd floor of Hostel Block C.",
                "category": "Hostel",
                "priority": "High",
                "status": "In Progress",
                "admin_response": "IT infrastructure team has scheduled an access-point firmware upgrade and antenna re-alignment on Thursday."
            },
            {
                "title": "Projector HDMI Cable Fault in CSE Seminar Hall 3",
                "description": "The ceiling mounted Epson projector HDMI signal drops intermittently during lab sessions and presentations.",
                "category": "Infrastructure",
                "priority": "Medium",
                "status": "Pending",
                "admin_response": None
            },
            {
                "title": "Extended Study Hours in Central Library During Mid-Terms",
                "description": "Requesting 24/7 access to the ground floor reading room during semester examinations next week.",
                "category": "Library",
                "priority": "Low",
                "status": "Resolved",
                "admin_response": "Approved. The Central Library ground floor silent reading hall will remain open 24 hours with security staff posted."
            }
        ]

        if demo_student:
            for c_data in complaints_data:
                existing_c = db.query(Complaint).filter(Complaint.title == c_data["title"]).first()
                if not existing_c:
                    complaint = Complaint(
                        student_id=demo_student.id,
                        title=c_data["title"],
                        description=c_data["description"],
                        category=c_data["category"],
                        priority=c_data["priority"],
                        status=c_data["status"],
                        admin_response=c_data["admin_response"]
                    )
                    db.add(complaint)
                    print(f"  [+] Added Complaint: {complaint.title} ({complaint.status})")
                else:
                    existing_c.priority = c_data["priority"]
                    existing_c.status = c_data["status"]
                    existing_c.admin_response = c_data["admin_response"]

        db.commit()
        print(f"\n[SUCCESS] Seeding complete! Database is ready for CampusConnect Phase 1 & Complaints System.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error while seeding database: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
