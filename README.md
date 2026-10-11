# 🎓 CampusConnect — KL University Centralized Academic Portal

[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_Tool_Calling_%26_Vision-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Academic_Evaluation-orange.svg)]()

> **CampusConnect** is a centralized, AI-augmented student and administrative platform developed for **KL University**. It integrates event registrations, student club management, grievance redressal, agentic tool-calling conversational AI, and computer vision-based lost-and-found matching into a responsive dual-portal experience.

---

## 👥 Project Team & Mentorship

- **Project Guide:**
  - **Dr. Rafeeq Mohammed** (Faculty Guide)
- **Team Members:**
  - **Anvith Kumar**
  - **K. Sai Srinath**
  - **Gokul Arnav**
  - **S. Keerthana**
  - **V. Keerthana**

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Dual Portals (Student & Admin)
- **Student Portal:**
  - Register for upcoming campus events and hackathons with real-time capacity counters.
  - Track registered events with timestamps and calendar details in *My Registrations*.
  - File grievance tickets with categories (Hostel, Academics, Mess, Security, Infrastructure) and live resolution tracking.
  - Explore campus clubs and activities.
- **Admin Portal:**
  - Full CRUD operations on university events (create, update schedule, change venue, manage capacities).
  - Inspect student registration rosters per event with attendee details and download counts.
  - Review, categorize, resolve, and publish official responses to student complaints.
  - Moderate Lost & Found inventory and mark items as claimed or returned.

### 2. 🤖 Agentic AI Campus Assistant (`/chatbot`)
- Powered by **Google Gemini** with structured function calling / tool execution.
- Connected directly to the live PostgreSQL database to:
  - Query upcoming event schedules, locations, and remaining capacities.
  - Lookup active student clubs and their leads.
  - Register authenticated students for events on request through conversational commands.
  - Search lost and found records dynamically.

### 3. 👁️ AI Computer Vision & Semantic Image Search (`/lost-found`)
- Multi-modal visual inspection for lost and found items.
- Extracts visual category hints, dominant colors, and distinguishing item attributes.
- Runs ranked similarity matching against active database records with real-time confidence scores.
- One-click testing with pre-curated campus sample items or custom photo uploads.

### 4. 🎨 Design System & Theme Engine
- **Light Theme:** Warm ivory (`#f7f4ed`), soft neutral surfaces (`#ede8de`), teal (`#0d9488`), and indigo (`#4f46e5`) accents. Zero pure white cards or harsh black boxes.
- **Dark Theme:** Deep slate (`#0b0f19`) with translucent glassmorphic surfaces (`rgba(17, 24, 39, 0.78)`).
- **System Theme:** Automatically adapts to operating system color scheme preferences.
- **Mobile-First Responsive Engine:** Smoothly scales from mobile viewports (360px–430px), tablets (768px), to 4K displays with dedicated slide-out navigation drawer.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["React 18 + Vite Frontend"] -->|"REST APIs (axios)"| API["FastAPI Backend (Port 8000)"]
    API -->|"SQLAlchemy ORM"| DB[("PostgreSQL Database")]
    API -->|"Generative AI SDK"| Gemini["Google Gemini API (Agentic Tools & Vision)"]
    Client -->|"Theme Engine"| CSS["Vanilla CSS Tokens & Responsive System"]
```

---

## 🗂️ Project Structure

```
campusconnect/
├── backend/
│   ├── main.py              # FastAPI application entrypoint & API routes
│   ├── models.py            # SQLAlchemy database models (Users, Events, Registrations, etc.)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # PostgreSQL session management & connection pool
│   ├── ai_agent.py          # Gemini AI agent with tool calling & computer vision search
│   ├── seed.py              # Database seeder script
│   ├── test_api.py          # Automated API test suite (32 tests)
│   └── requirements.txt     # Python dependencies
├── database/
│   └── schema.sql           # PostgreSQL table definitions & initial constraints
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, EventCard, ClubCard, EventForm, etc.
│   │   ├── context/         # ThemeContext (Light/Dark/System) & UserContext (Auth)
│   │   ├── pages/           # Dashboard, Events, Clubs, AIChatbot, AIImageSearch, Complaints, ManageEvents
│   │   ├── services/        # Axios API client functions
│   │   ├── index.css        # Centralized theme tokens, utilities & responsive engine
│   │   ├── App.jsx          # Route definitions & application layout
│   │   └── main.jsx         # React root initialization
│   ├── package.json         # Node.js project manifest & scripts
│   └── vite.config.js       # Vite build & development proxy configuration
└── .gitignore               # Ignored environments, logs, and build artifacts
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & `npm`
- **PostgreSQL** instance running locally or on cloud
- **Google Gemini API Key**

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables in backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campusconnect
GEMINI_API_KEY=your_gemini_api_key_here

# Seed initial database records
python seed.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173`

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with instant test credentials:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campusconnect.local` | `student123` | Event registration, My Registrations, File Complaints, AI Chatbot |
| **Administrator** | `admin@campusconnect.local` | `admin123` | Event Management (CRUD), Student Rosters, Complaint Resolution |

---

## 🧪 Testing

Run the automated backend test suite:
```bash
cd backend
python test_api.py
```
*(All 32 test cases cover authentication, registrations, permissions, event CRUD, grievance workflow, and AI tools).*

---

## 📜 Acknowledgements & Academic Notice
Developed for academic presentation and university evaluation at **KL University**. Guided by **Dr. Rafeeq Mohammed**.
