import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Automatic fallback: If placeholder URL or empty in production, route to live Render backend
if (!rawBaseUrl || rawBaseUrl.includes('your-backend-url')) {
  if (import.meta.env.PROD) {
    rawBaseUrl = 'https://digital-contact-manager.onrender.com/api';
  } else {
    rawBaseUrl = 'http://localhost:5000/api';
  }
}

const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('dcm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor: Standardize error messages and handle 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid token if not on login/register endpoints
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('dcm_token');
        localStorage.removeItem('dcm_user');
        // Let the app re-render or trigger logout
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;
