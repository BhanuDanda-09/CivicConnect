// ==============================================================================
// Axios HTTP Client & API Service Layer (api.js)
// ==============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

    // If payload is FormData, do not set application/json
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('civic_token');
      localStorage.removeItem('civic_user');

      // Only redirect if not already on public authentication routes
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/about') &&
        !currentPath.includes('/contact') &&
        currentPath !== '/'
      ) {
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Citizen Complaint API
export const complaintAPI = {
  create: (complaintData) => api.post('/complaints', complaintData),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  update: (id, updateData) => api.patch(`/complaints/${id}`, updateData),
  getHistory: (id) => api.get(`/complaints/${id}/history`),
};

// Municipal Admin Complaint API
export const adminComplaintAPI = {
  getAll: (params) => api.get('/admin/complaints', { params }),
  getStats: () => api.get('/admin/complaints/stats'),
  verify: (id, data = {}) => api.patch(`/admin/complaints/${id}/verify`, data),
  reject: (id, data) => api.patch(`/admin/complaints/${id}/reject`, data),
  assign: (id, data) => api.patch(`/admin/complaints/${id}/assign`, data),
  changePriority: (id, data) => api.patch(`/admin/complaints/${id}/priority`, data),
};

// Municipal Admin Analytics API
export const adminAnalyticsAPI = {
  getOverview: (params) => api.get('/admin/analytics/overview', { params }),
  getWorkers: () => api.get('/admin/analytics/workers'),
  getWards: () => api.get('/admin/analytics/wards'),
  getComplaintLocations: (params) => api.get('/admin/analytics/complaint-locations', { params }),
};

// Municipal Admin Field Worker Management API
export const adminWorkerAPI = {
  getAll: () => api.get('/admin/workers'),
  create: (workerData) => api.post('/admin/workers', workerData),
};

// Municipal Admin User Directory API
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  toggleStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
};

// Field Worker Complaint API
export const workerComplaintAPI = {
  getAssigned: (params) => api.get('/workers/complaints', { params }),
  getById: (id) => api.get(`/workers/complaints/${id}`),
  startWork: (id, data = {}) => api.patch(`/workers/complaints/${id}/start`, data),
  resolve: (id, resolutionData) => api.patch(`/workers/complaints/${id}/resolve`, resolutionData),
};

// Field Worker Personal Analytics API
export const workerAnalyticsAPI = {
  getOverview: () => api.get('/workers/analytics/overview'),
  getTaskLocations: (params) => api.get('/workers/analytics/task-locations', { params }),
};

export default api;
