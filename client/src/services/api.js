import axios from 'axios';

/**
 * NestMatch Central Axios API Client
 * Configured with environment-based base URL for backend REST API.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: inject Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nestmatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 and parse standardized response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint =
        error.config.url?.includes('/auth/login') ||
        error.config.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        // Clear expired or invalid token
        localStorage.removeItem('nestmatch_token');
        localStorage.removeItem('nestmatch_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

