import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use environment variable or default to localhost
// Cast import.meta to any to resolve TypeScript error about missing 'env' property
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: In Module 2 (Auth), we will inject the JWT token here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with a status code outside 2xx range
      console.error('API Error:', error.response.data);

      // specific error handling (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        // TODO: Handle token expiration / logout
        console.warn('Unauthorized access - redirecting to login');
        // window.location.href = '/login'; // Uncomment when auth is ready
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;