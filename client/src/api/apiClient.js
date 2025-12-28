// api/apiClient.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5174',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add auth headers if needed
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;