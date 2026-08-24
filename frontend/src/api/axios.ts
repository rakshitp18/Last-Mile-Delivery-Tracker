import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
  ? 'https://shipit-sl8q.onrender.com/api'
  : 'http://localhost:8088/api';

const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || defaultApiUrl;
const BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gatiman_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for centralized error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 if unauthorized
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('gatiman_auth_token');
        localStorage.removeItem('gatiman_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
