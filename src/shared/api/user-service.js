// User management API service
import apiClient from './api-client';

const userService = {
  // Get all users with pagination
  getUsers: (page = 1, limit = 10) => {
    return apiClient.get(`/users?page=${page}&limit=${limit}`);
  },
  
  // Search users
  searchUsers: (searchParams) => {
    const { search, role, page = 1, limit = 10 } = searchParams;
    let queryString = `?page=${page}&limit=${limit}`;
    
    if (search) {
      queryString += `&search=${encodeURIComponent(search)}`;
    }
    
    if (role) {
      queryString += `&role=${role}`;
    }
    
    return apiClient.get(`/users/search${queryString}`);
  },
  
  // Get user by ID
  getUserById: (userId) => {
    return apiClient.get(`/users/${userId}`);
  },
  
  // Create an admin user (SUPER_ADMIN only)
  createAdmin: (userData) => {
    return apiClient.post('/users/admin', userData);
  },
  
  // Create a super admin (requires special header)
  createSuperAdmin: (userData, superAdminKey) => {
    return apiClient.post('/users/super-admin', userData, {
      headers: {
        'X-Super-Admin-Key': superAdminKey
      }
    });
  },
  
  // Update user role
  updateUserRole: (userId, role) => {
    return apiClient.post('/users/role', { userId, role });
  },
  
  // Update user details
  updateUser: (userId, userData) => {
    return apiClient.put(`/users/${userId}`, userData);
  },
  
  // Delete a user
  deleteUser: (userId) => {
    return apiClient.delete(`/users/${userId}`);
  }
};

export default userService;