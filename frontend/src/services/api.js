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
    console.error(`API Error on [${options.method || 'GET'}] ${url}:`, err);
    throw err;
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
