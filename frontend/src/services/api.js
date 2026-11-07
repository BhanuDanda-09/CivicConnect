import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('civic_token')) {
        localStorage.removeItem('civic_token');
        localStorage.removeItem('civic_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
