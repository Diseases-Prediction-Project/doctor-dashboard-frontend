import API from './api';

export const usersService = {
  // Get current user details
  getCurrentUser: async (userId) => {
    try {
      const response = await API.get(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch user' 
      };
    }
  },

  // Get user by email
  getUserByEmail: async (email) => {
    try {
      const response = await API.get(`/users/email/${email}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'User not found' 
      };
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await API.patch(`/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user' 
      };
    }
  },

  // Get all doctors
  getAllDoctors: async (queryParams = {}) => {
    try {
      const response = await API.get('/users/doctors', { params: queryParams });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch doctors' 
      };
    }
  },

  // Get all patients
  getAllPatients: async (queryParams = {}) => {
    try {
      const response = await API.get('/users/patients', { params: queryParams });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch patients' 
      };
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await API.delete(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  }
};