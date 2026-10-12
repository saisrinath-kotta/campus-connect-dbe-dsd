const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

try {
  localStorage.removeItem('campus_user');
} catch (e) {}

/**
 * Storage helpers for current user context (session-scoped)
 */
export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('campus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    localStorage.removeItem('campus_user');
    if (user) {
      sessionStorage.setItem('campus_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('campus_user');
    }
  } catch (e) {}
}

/**
 * Generic request helper with error parsing and automatic role headers
 */
// Mock fallbacks for static hosting (GitHub Pages preview) when backend is not running
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'KL DeepTech AI Hackathon 2026',
    description: '36-hour collegiate hackathon building intelligent agent workflows and neural computer vision applications.',
    category: 'TECHNICAL',
    date: '2026-10-24T09:00:00',
    venue: 'R&D Block Seminar Hall 1, KL Campus',
    capacity: 250,
    registered_count: 184,
    club_name: 'ZeroOne Coding Club',
    organizer: 'Prof. Rao & ZeroOne Core Team',
    status: 'ACTIVE'
  },
  {
    id: 2,
    title: 'Robotics & Autonomous Systems Expo',
    description: 'Hands-on live demonstration of LiDAR mapping, drone flight paths, and robotic arm automation.',
    category: 'WORKSHOP',
    date: '2026-10-28T14:00:00',
    venue: 'Mechanical Engineering Central Lab',
    capacity: 120,
    registered_count: 98,
    club_name: 'Robotics & Automation Society',
    organizer: 'Dr. Suresh Kumar',
    status: 'ACTIVE'
  },
  {
    id: 3,
    title: 'Surabhi National Cultural Festival 2026',
    description: 'Grand annual inter-collegiate cultural fest celebrating classical dance, vocal concerts, and theater arts.',
    category: 'CULTURAL',
    date: '2026-11-05T17:30:00',
    venue: 'Open Air Amphitheatre',
    capacity: 1500,
    registered_count: 890,
    club_name: 'KL Cultural Sampradaya',
    organizer: 'Student Affairs Council',
    status: 'ACTIVE'
  },
  {
    id: 4,
    title: 'Cloud DevOps & Kubernetes Masterclass',
    description: 'Master CI/CD pipelines, container orchestration, microservices deployment, and serverless scaling.',
    category: 'TECHNICAL',
    date: '2026-11-12T10:00:00',
    venue: 'Computer Science Lab 4',
    capacity: 100,
    registered_count: 85,
    club_name: 'IEEE Student Branch',
    organizer: 'IEEE Computer Society',
    status: 'ACTIVE'
  }
];

const MOCK_CLUBS = [
  {
    id: 1,
    name: 'ZeroOne Coding Club',
    category: 'Technical',
    description: 'Premier competitive coding, algorithmic design, and full-stack software development community at KL.',
    lead_name: 'K. Sai Srinath',
    email: 'zeroone@campusconnect.local',
    member_count: 420
  },
  {
    id: 2,
    name: 'Robotics & Automation Society',
    category: 'Robotics',
    description: 'Innovating in embedded electronics, drone navigation systems, and hardware design.',
    lead_name: 'A. Vikram',
    email: 'robotics@campusconnect.local',
    member_count: 280
  },
  {
    id: 3,
    name: 'IEEE Student Branch',
    category: 'Technical',
    description: 'Global technical chapter fostering engineering excellence, research papers, and technical summits.',
    lead_name: 'P. Sneha',
    email: 'ieee@campusconnect.local',
    member_count: 350
  },
  {
    id: 4,
    name: 'KL Cultural Sampradaya',
    category: 'Cultural',
    description: 'Preserving and performing traditional classical arts, music recitals, dramatic plays, and fest celebrations.',
    lead_name: 'R. Ananya',
    email: 'sampradaya@campusconnect.local',
    member_count: 510
  }
];

const MOCK_ITEMS = [
  {
    item_id: 1,
    id: 1,
    item_name: 'AirPods Pro Case',
    title: 'AirPods Pro Case',
    description: 'White wireless earbuds case found in library silent study zone',
    category: 'Electronics',
    item_type: 'Found',
    location: 'Central Library Floor 2',
    contact_info: 'security@campusconnect.local',
    date_reported: '2026-10-10',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60'
  },
  {
    item_id: 2,
    id: 2,
    item_name: 'Dell XPS 15 Silver Laptop',
    title: 'Dell XPS 15 Silver Laptop',
    description: 'Found inside Central Library 2nd floor silent reading zone near cubicle 14.',
    category: 'Electronics',
    item_type: 'Found',
    location: 'Central Library Floor 2',
    contact_info: 'security@campusconnect.local',
    date_reported: '2026-10-10',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=500&q=80'
  },
  {
    item_id: 3,
    id: 3,
    item_name: 'Titan Black Leather Chronograph Watch',
    title: 'Titan Black Leather Chronograph Watch',
    description: 'Misplaced around Sports Complex badminton court during evening practice session.',
    category: 'Accessories',
    item_type: 'Lost',
    location: 'Indoor Sports Complex',
    contact_info: 'student@campusconnect.local',
    date_reported: '2026-10-09',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80'
  },
  {
    item_id: 4,
    id: 4,
    item_name: 'Campus Student ID Card & Keyfob',
    title: 'Campus Student ID Card & Keyfob',
    description: 'Found at cafeteria billing desk counter 3 with blue KL lanyard.',
    category: 'ID Card',
    item_type: 'Found',
    location: 'Main Student Food Court',
    contact_info: 'helpdesk@campusconnect.local',
    date_reported: '2026-10-11',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80'
  },
  {
    item_id: 5,
    id: 5,
    item_name: 'Blue Hydro Flask',
    title: 'Blue Hydro Flask',
    description: 'Insulated sports water bottle misplaced near student activity center',
    category: 'Drinkware',
    item_type: 'Lost',
    location: 'Student Activity Center',
    contact_info: 'student@campusconnect.local',
    date_reported: '2026-10-11',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60'
  }
];

const MOCK_COMPLAINTS = [
  {
    id: 1,
    title: 'Hostel Block 3 High-Speed Wi-Fi Disconnection',
    description: 'Wi-Fi access point in 3rd floor west wing experiences intermittent packet loss during peak study hours.',
    category: 'IT_INFRASTRUCTURE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    student_id: 1,
    student_name: 'Demo Student',
    created_at: '2026-10-08T11:20:00'
  },
  {
    id: 2,
    title: 'Computer Science Lab 4 Air Conditioning Maintenance',
    description: 'Unit 2 compressor requires filter cleaning and temperature sensor calibration.',
    category: 'FACILITIES',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    student_id: 1,
    student_name: 'Demo Student',
    created_at: '2026-10-05T09:15:00'
  }
];

function getMockFallbackResponse(endpoint, options) {
  const cleanEp = endpoint.split('?')[0];
  const method = (options.method || 'GET').toUpperCase();

  if (cleanEp === '/api/dashboard/stats') {
    return {
      total_events: 12,
      active_registrations: 3,
      registered_events_count: 2,
      resolved_complaints: 18,
      pending_complaints: 3,
      total_clubs: 8,
      lost_found_items: 14
    };
  }
  if (cleanEp === '/api/events') {
    if (method === 'POST') {
      try {
        const parsed = JSON.parse(options.body || '{}');
        return { id: Date.now(), ...parsed, registered_count: 0, status: 'ACTIVE' };
      } catch {
        return { id: Date.now(), title: 'New Event', registered_count: 0, status: 'ACTIVE' };
      }
    }
    return MOCK_EVENTS;
  }
  if (cleanEp.startsWith('/api/events/') && cleanEp.endsWith('/register')) {
    return { success: true, message: 'Successfully registered for event (Demo Mode)' };
  }
  if (cleanEp.startsWith('/api/events/')) {
    const id = parseInt(cleanEp.replace('/api/events/', ''), 10);
    return MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  }
  if (cleanEp === '/api/clubs') {
    return MOCK_CLUBS;
  }
  if (cleanEp.startsWith('/api/clubs/')) {
    const id = parseInt(cleanEp.replace('/api/clubs/', ''), 10);
    return MOCK_CLUBS.find(c => c.id === id) || MOCK_CLUBS[0];
  }
  if (cleanEp === '/api/lost-found') {
    if (method === 'POST') {
      try {
        const parsed = JSON.parse(options.body || '{}');
        return { id: Date.now(), ...parsed, status: 'ACTIVE', date_reported: new Date().toISOString() };
      } catch {
        return { id: Date.now(), title: 'Reported Item', status: 'ACTIVE' };
      }
    }
    return MOCK_ITEMS;
  }
  if (cleanEp === '/api/complaints') {
    if (method === 'POST') {
      try {
        const parsed = JSON.parse(options.body || '{}');
        return { id: Date.now(), ...parsed, status: 'SUBMITTED', created_at: new Date().toISOString() };
      } catch {
        return { id: Date.now(), title: 'New Complaint', status: 'SUBMITTED' };
      }
    }
    return MOCK_COMPLAINTS;
  }
  if (cleanEp.includes('/registrations')) {
    return [
      { id: 101, event_id: 1, user_id: 1, registration_date: '2026-10-09', event: MOCK_EVENTS[0] },
      { id: 102, event_id: 2, user_id: 1, registration_date: '2026-10-10', event: MOCK_EVENTS[1] }
    ];
  }
  if (cleanEp === '/api/ai/chat') {
    return {
      response: 'Hello! I am your CampusConnect AI Assistant. In this live web preview mode, I can help you explore upcoming hackathons, tech workshops, student clubs, lost & found logs, and grievance submissions.',
      intent: 'general_assistance',
      suggestions: [
        'What events are happening this week?',
        'Tell me about ZeroOne Coding Club',
        'How do I report a misplaced item?'
      ]
    };
  }
  if (cleanEp.includes('/api/ai/image')) {
    return {
      engine: 'Gemini Vision Multi-Modal AI',
      analysis: {
        item_name: 'AirPods Pro Case',
        confidence: 0.94,
        category: 'Electronics',
        dominant_colors: ['White', 'Silver'],
        distinguishing_features: ['Glossy white charging case', 'LED indicator light', 'Lightning charge port']
      },
      matches: [
        {
          match_score: 94,
          match_reasons: ['High visual similarity with library item', 'Matching white earbuds case profile'],
          match_reason: 'High visual and category match',
          item: MOCK_ITEMS[0]
        },
        {
          match_score: 74,
          match_reasons: ['Electronics category overlap', 'Found in same campus library zone'],
          match_reason: 'Category match in library zone',
          item: MOCK_ITEMS[1]
        }
      ],
      recommendations: [
        'Check with Central Library Security Desk with serial number proof',
        'Verify your student ID at the help desk counter to claim item'
      ]
    };
  }
  if (cleanEp === '/api/users') {
    return [
      { id: 1, name: 'Demo Student', email: 'student@campusconnect.local', role: 'STUDENT', department: 'Computer Science' },
      { id: 2, name: 'Demo Coordinator', email: 'coordinator@campusconnect.local', role: 'COORDINATOR', department: 'Information Technology' },
      { id: 3, name: 'Demo Admin', email: 'admin@campusconnect.local', role: 'ADMIN', department: 'Administration' }
    ];
  }
  if (cleanEp === '/api/auth/login') {
    return {
      user: { id: 1, name: 'Demo Student', email: 'student@campusconnect.local', role: 'STUDENT', department: 'Computer Science' },
      token: 'demo-static-token'
    };
  }

  return { success: true };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Attach user context headers if available
  const currentUser = getStoredUser();
  const defaultHeaders = {};
  
  if (currentUser) {
    defaultHeaders['X-User-Id'] = String(currentUser.id);
    defaultHeaders['X-User-Role'] = String(currentUser.role || 'STUDENT');
  }

  // Handle FormData vs JSON
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg = (isJson && data.detail) 
        ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        : (data.message || `Request failed with status ${res.status}`);
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`Backend request failed for ${endpoint}. Using interactive demo fallback for static preview:`, err);
    return getMockFallbackResponse(endpoint, options);
  }
}

// ---------------- Authentication API ----------------
export async function loginUser(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(userData) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getCurrentUser() {
  return request('/api/auth/me');
}


// ---------------- Clubs API ----------------
export async function getClubs() {
  return request('/api/clubs');
}

export async function getClub(clubId) {
  return request(`/api/clubs/${clubId}`);
}

export async function createClub(clubData) {
  return request('/api/clubs', {
    method: 'POST',
    body: JSON.stringify(clubData),
  });
}

export async function updateClub(clubId, clubData) {
  return request(`/api/clubs/${clubId}`, {
    method: 'PUT',
    body: JSON.stringify(clubData),
  });
}

export async function deleteClub(clubId) {
  return request(`/api/clubs/${clubId}`, {
    method: 'DELETE',
  });
}

// ---------------- Events API ----------------
export async function getEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.club_id) query.append('club_id', params.club_id);
  if (params.search) query.append('search', params.search);
  const qs = query.toString();
  return request(`/api/events${qs ? `?${qs}` : ''}`);
}

export async function getEvent(eventId) {
  return request(`/api/events/${eventId}`);
}

export async function createEvent(eventData) {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function updateEvent(eventId, eventData) {
  return request(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
}

export async function deleteEvent(eventId) {
  return request(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
}

// ---------------- Registrations API ----------------
export async function registerForEvent(eventId, studentId) {
  return request(`/api/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId }),
  });
}

export async function cancelRegistration(registrationId) {
  return request(`/api/registrations/${registrationId}`, {
    method: 'DELETE',
  });
}

export async function getEventRegistrations(eventId) {
  return request(`/api/events/${eventId}/registrations`);
}

export async function getUserRegistrations(userId) {
  return request(`/api/users/${userId}/registrations`);
}

// ---------------- Lost & Found API ----------------
export async function getLostFoundItems(params = {}) {
  const query = new URLSearchParams();
  if (params.item_type) query.append('item_type', params.item_type);
  if (params.category) query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  const qs = query.toString();
  return request(`/api/lost-found${qs ? `?${qs}` : ''}`);
}

export async function reportLostFoundItem(itemData) {
  return request('/api/lost-found', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

export async function updateLostFoundItem(itemId, itemData) {
  return request(`/api/lost-found/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
}

export async function deleteLostFoundItem(itemId) {
  return request(`/api/lost-found/${itemId}`, {
    method: 'DELETE',
  });
}

// ---------------- Complaints API ----------------
export async function getComplaints(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.category) query.append('category', params.category);
  if (params.priority) query.append('priority', params.priority);
  if (params.student_id) query.append('student_id', params.student_id);
  if (params.search) query.append('search', params.search);
  const qs = query.toString();
  return request(`/api/complaints${qs ? `?${qs}` : ''}`);
}

export async function getComplaint(complaintId) {
  return request(`/api/complaints/${complaintId}`);
}

export async function fileComplaint(complaintData) {
  return request('/api/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
}

export async function updateComplaint(complaintId, complaintData) {
  return request(`/api/complaints/${complaintId}`, {
    method: 'PUT',
    body: JSON.stringify(complaintData),
  });
}

export async function deleteComplaint(complaintId) {
  return request(`/api/complaints/${complaintId}`, {
    method: 'DELETE',
  });
}

// ---------------- AI Agent API ----------------

export async function chatWithAIAgent({ message, history = [], userId = null, role = 'STUDENT' }) {
  return request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      history,
      user_id: userId,
      role,
    }),
  });
}

export async function searchItemsWithAIImage(searchPayload) {
  // Can be JSON or FormData
  if (searchPayload instanceof FormData) {
    return request('/api/ai/image-upload-search', {
      method: 'POST',
      body: searchPayload,
    });
  }
  return request('/api/ai/image-search', {
    method: 'POST',
    body: JSON.stringify(searchPayload),
  });
}


// ---------------- Users & Dashboard API ----------------
export async function getUsers(role = null) {
  const endpoint = role ? `/api/users?role=${role}` : '/api/users';
  return request(endpoint);
}

export async function getDashboardStats(userId = null) {
  const endpoint = userId ? `/api/dashboard/stats?user_id=${userId}` : '/api/dashboard/stats';
  return request(endpoint);
}

export { API_BASE_URL };
