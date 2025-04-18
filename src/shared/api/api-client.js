// Base API client for making HTTP requests
import { getErrorMessage } from '../utils/toast';

const API_BASE_URL = 'http://34.44.61.236:3000/api';

// Helper to get the auth token from local storage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Generic request function that handles auth headers and JSON parsing
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set up headers with auth token if available
  const headers = {
    ...options.headers,
  };
  
  // Only set Content-Type for requests with body data
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  // Don't stringify FormData objects
  if (config.body && !(config.body instanceof FormData) && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  
  // Debug log request details
  console.log(`API Request to ${url}:`, {
    method: options.method,
    headers,
    body: options.body instanceof FormData ? '[FormData]' : options.body
  });
  
  try {
    const response = await fetch(url, config);
    console.log(`API Response from ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers])
    });
    
    // Check if the response is successful but empty or non-JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }
    
    // For file downloads, return the raw response
    if (response.headers.get('content-disposition')?.includes('attachment')) {
      return response.blob();
    }
    
    // Try to parse the JSON response
    try {
      const data = await response.json();
      console.log(`API Response data:`, data);
      
      // If the response is not ok, throw an error with the response data
      if (!response.ok) {
        const errorMessage = data.error || data.message || 'An error occurred';
        const error = new Error(errorMessage);
        error.response = { data, status: response.status };
        throw error;
      }
      
      return data;
    } catch (parseError) {
      // If we can't parse JSON, but response is ok, return success
      if (response.ok) {
        return { success: true };
      }
      
      // Handle specific error cases
      if (response.status === 400 && parseError.message.includes('JSON')) {
        // This could be an empty body error with JSON content-type
        const error = new Error('Request format error: ' + parseError.message);
        error.response = { status: response.status };
        throw error;
      }
      
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    throw error;
  }
};

// Utility methods for different HTTP methods
const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: data,
  }),
  
  put: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: data,
  }),
  
  delete: (endpoint, options = {}) => {
    // For DELETE requests, don't set Content-Type header by default
    // as Fastify will expect a body if Content-Type is 'application/json'
    const deleteOptions = {
      ...options,
      method: 'DELETE',
      headers: {
        ...options.headers,
      }
    };
    
    // Only if body exists, set the Content-Type
    if (options.body) {
      deleteOptions.headers['Content-Type'] = 'application/json';
    }
    
    return request(endpoint, deleteOptions);
  },

  // Helper to get the auth token
  getAuthToken,

  // Helper to get the base URL
  getBaseUrl: () => API_BASE_URL,
};

export default apiClient;