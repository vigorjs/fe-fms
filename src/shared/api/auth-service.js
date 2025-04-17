// Authentication API service
import apiClient from './api-client';

// For debugging
console.log('Auth service initialized');

const authService = {
  // Register a new user
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  // Login user
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  
  // Get current user profile
  getProfile: () => {
    return apiClient.get('/auth/me');
  },
};

export default authService;