import axios, { AxiosInstance } from 'axios';

// Use Vite's import.meta.env for environment variables
// API calls to /api are proxied to http://localhost:3000 by Vite
// @ts-expect-error - import.meta.env is available in Vite
const API_URL = (import.meta.env.VITE_API_URL) || '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for user-friendly error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or timeout
      error.userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Something went wrong on our end. Please try again later.';
    } else if (error.response.status === 429) {
      error.userMessage = 'Too many requests. Please wait a moment and try again.';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
