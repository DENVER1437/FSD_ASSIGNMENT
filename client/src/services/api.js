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

export default api;
