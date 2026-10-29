import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralised error + 401 handling
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Unable to connect to the server. Is the backend running?'));
    }
    const { status, data } = error.response;
    if (status === 401) {
      localStorage.removeItem('vms_token');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    let message = 'An unexpected error occurred.';
    if (data) {
      if (typeof data === 'string') message = data;
      else if (typeof data.detail === 'string') message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail.map((e) => e.msg).join(', ');
      else if (data.message) message = data.message;
    }
    if (status === 403) message = 'You do not have permission to do this.';
    if (status === 404) message = 'Resource not found.';
    if (status === 500) message = 'Server error. Please try again later.';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authAPI = {
  register: (d) => api.post('/register', d, { headers: { 'Content-Type': 'application/json' } }),
  login: (form) => api.post('/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
  me: () => api.get('/me'),
};

// Complaints  — POST uses multipart/form-data (backend schema)
export const complaintsAPI = {
  create: (data) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('category', data.category);
    fd.append('priority', data.priority);
    fd.append('location', data.location);
    if (data.attachment) fd.append('attachment', data.attachment);
    return api.post('/complaints', fd);
  },
  list: () => api.get('/complaints'),
  history: (id) => api.get(`/complaints/${id}/history`),
};

// Student
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
};

// Volunteer
export const volunteerAPI = {
  getTasks: () => api.get('/volunteer/tasks'),
  completeTask: (id) => api.put(`/volunteer/tasks/${id}/complete`),
  getDashboard: () => api.get('/volunteer/dashboard'),
};

// Admin — server-side filters + pagination
export const adminAPI = {
  getComplaints: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.priority) q.append('priority', params.priority);
    if (params.category) q.append('category', params.category);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    const qs = q.toString();
    return api.get(`/admin/complaints${qs ? `?${qs}` : ''}`);
  },
  searchComplaints: (q) => api.get(`/admin/complaints/search?q=${encodeURIComponent(q)}`),
  assignComplaint: (id, data) => api.put(`/admin/complaints/${id}/assign`, data, { headers: { 'Content-Type': 'application/json' } }),
  verifyComplaint: (id) => api.put(`/admin/complaints/${id}/verify`),
  getDashboard: () => api.get('/admin/dashboard'),
  // Returns users with role=volunteer from db.users — the correct source for assignment
  getVolunteerUsers: () => api.get('/admin/users/volunteers'),
};

// Volunteers list (for assign modal)
export const volunteersAPI = {
  list: () => api.get('/volunteers'),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  unread: () => api.get('/notifications/unread'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Analytics — 4 real endpoints
export const analyticsAPI = {
  byCategory: () => api.get('/analytics/categories'),
  byPriority: () => api.get('/analytics/priority'),
  byStatus: () => api.get('/analytics/status'),
  leaderboard: () => api.get('/analytics/leaderboard'),
};

export default api;
