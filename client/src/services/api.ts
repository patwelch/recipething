// src/services/api.ts
import axios from 'axios';

// Define the base URL for your backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Use env variable or default

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from where you store it (e.g., localStorage)
    const token = localStorage.getItem('authToken'); // Adjust key name if needed

    if (token) {
      // Add the Authorization header if the token exists
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401 redirects)
apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired or invalid)
      console.error('Unauthorized access - redirecting to login.');
      // Clear token and user state (implement this logic, maybe via Redux dispatch)
      localStorage.removeItem('authToken');
      // Redirect to login page
      // Use window.location or preferably react-router's navigation methods if accessible here
      window.location.href = '/login'; // Simple redirect, consider better integration
    }
    return Promise.reject(error);
  }
);


export default apiClient;