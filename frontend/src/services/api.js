// ==============================================================================
// Axios HTTP Client & API Service Layer (api.js)
// Phase 7 - Hardened Interceptors, Error Categorization, and Real-Time APIs
// ==============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically omit Content-Type for FormData so the browser generates correct multipart boundaries
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Structured Error Handling & Session Expiration Guard
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Network Disconnect or Server Down
    if (!error.response) {
      const networkError = new Error(
        'Unable to communicate with CivicConnect server. Please check your internet connection or verify the backend is running.'
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // 2. Authentication Expiration / Invalid Token (401)
    if (status === 401) {
      localStorage.removeItem('civic_token');
      localStorage.removeItem('civic_user');

      const currentPath = window.location.pathname;
      const isPublicRoute =
        currentPath.includes('/login') ||
        currentPath.includes('/register') ||
        currentPath.includes('/about') ||
        currentPath.includes('/contact') ||
        currentPath.includes('/track') ||
        currentPath === '/';

      if (!isPublicRoute) {
        window.location.href = '/login?sessionExpired=true';
      }
    }

    // 3. User-Friendly Error Message Enrichment
    const message =
      data?.message ||
      (status === 403
        ? 'Access forbidden: You do not have permission for this municipal action.'
        : status === 404
        ? 'The requested resource was not found.'
        : status === 409
        ? 'Conflict: A duplicate record already exists in the system.'
        : status === 429
        ? 'Request rate limit exceeded. Please wait a moment and try again.'
        : status >= 500
        ? 'Municipal server error. The engineering team has been alerted.'
        : 'An unexpected application error occurred.');

    const enrichedError = new Error(message);
    enrichedError.status = status;
    enrichedError.data = data;
    enrichedError.response = error.response;

    return Promise.reject(enrichedError);
  }
);

// ------------------------------------------------------------------------------
// Authentication API
// ------------------------------------------------------------------------------
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ------------------------------------------------------------------------------
// Citizen Complaint API
// ------------------------------------------------------------------------------
export const complaintAPI = {
  create: (complaintData) => api.post('/complaints', complaintData),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  update: (id, updateData) => api.patch(`/complaints/${id}`, updateData),
  getHistory: (id) => api.get(`/complaints/${id}/history`),
  trackPublic: (identifier) => api.get(`/complaints/track/${identifier}`),
};

// ------------------------------------------------------------------------------
// Municipal Admin Complaint API
// ------------------------------------------------------------------------------
export const adminComplaintAPI = {
  getAll: (params) => api.get('/admin/complaints', { params }),
  getStats: () => api.get('/admin/complaints/stats'),
  verify: (id, data = {}) => api.patch(`/admin/complaints/${id}/verify`, data),
  reject: (id, data) => api.patch(`/admin/complaints/${id}/reject`, data),
  assign: (id, data) => api.patch(`/admin/complaints/${id}/assign`, data),
  changePriority: (id, data) => api.patch(`/admin/complaints/${id}/priority`, data),
  getAuditLogs: (params) => api.get('/admin/complaints/audit-logs', { params }),
};

// ------------------------------------------------------------------------------
// Municipal Admin Analytics API
// ------------------------------------------------------------------------------
export const adminAnalyticsAPI = {
  getOverview: (params) => api.get('/admin/analytics/overview', { params }),
  getWorkers: () => api.get('/admin/analytics/workers'),
  getWards: () => api.get('/admin/analytics/wards'),
  getComplaintLocations: (params) => api.get('/admin/analytics/complaint-locations', { params }),
};

// ------------------------------------------------------------------------------
// Municipal Admin Field Worker Management API
// ------------------------------------------------------------------------------
export const adminWorkerAPI = {
  getAll: () => api.get('/admin/workers'),
  create: (workerData) => api.post('/admin/workers', workerData),
};

// ------------------------------------------------------------------------------
// Municipal Admin User Directory API
// ------------------------------------------------------------------------------
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  toggleStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
};

// ------------------------------------------------------------------------------
// Field Worker Complaint API
// ------------------------------------------------------------------------------
export const workerComplaintAPI = {
  getAssigned: (params) => api.get('/workers/complaints', { params }),
  getById: (id) => api.get(`/workers/complaints/${id}`),
  startWork: (id, data = {}) => api.patch(`/workers/complaints/${id}/start`, data),
  resolve: (id, resolutionData) => api.patch(`/workers/complaints/${id}/resolve`, resolutionData),
};

// ------------------------------------------------------------------------------
// Field Worker Personal Analytics API
// ------------------------------------------------------------------------------
export const workerAnalyticsAPI = {
  getOverview: () => api.get('/workers/analytics/overview'),
  getTaskLocations: (params) => api.get('/workers/analytics/task-locations', { params }),
};

// ------------------------------------------------------------------------------
// Real-Time Notification API
// ------------------------------------------------------------------------------
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// ------------------------------------------------------------------------------
// Citizen Feedback & Satisfaction Rating API
// ------------------------------------------------------------------------------
export const feedbackAPI = {
  submit: (complaintId, feedbackData) =>
    api.post(`/complaints/${complaintId}/feedback`, feedbackData),
  getByComplaint: (complaintId) => api.get(`/complaints/${complaintId}/feedback`),
  getAll: (params) => api.get('/feedback', { params }),
};

// ------------------------------------------------------------------------------
// India-Wide Geospatial & Geocoding API
// ------------------------------------------------------------------------------
export const geoAPI = {
  search: (query, limit = 8) => api.get('/geo/search', { params: { q: query, limit } }),
  reverse: (lat, lng) => api.get('/geo/reverse', { params: { lat, lng } }),
};

// ------------------------------------------------------------------------------
// AI Civic Intelligence & Assistant API
// ------------------------------------------------------------------------------
export const aiAPI = {
  classify: (data) => api.post('/ai/classify', data),
  checkDuplicates: (data) => api.post('/ai/check-duplicates', data),
  assistant: (data) => api.post('/ai/assistant', data),
  getHotspots: () => api.get('/ai/hotspots'),
  getEscalations: () => api.get('/ai/escalations'),
};

// ------------------------------------------------------------------------------
// Public Civic Infrastructure Asset API (QR Reporting)
// ------------------------------------------------------------------------------
export const assetAPI = {
  getById: (assetId) => api.get(`/assets/${assetId}`),
  getAll: (params) => api.get('/assets', { params }),
  create: (data) => api.post('/assets', data),
};

// ------------------------------------------------------------------------------
// Community Feed & Public Transparency API
// ------------------------------------------------------------------------------
export const communityAPI = {
  getFeed: (params) => api.get('/community/feed', { params }),
  toggleUpvote: (complaintId) => api.post(`/community/${complaintId}/upvote`),
  getTransparency: () => api.get('/community/transparency'),
};

export default api;
