import API from './api';

export const profileService = {
  // Get profile by ID
  getProfile: async (profileId) => {
    try {
      const response = await API.get(`/profile/${profileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  },

  // Create profile
  createProfile: async (profileData) => {
    try {
      const response = await API.post('/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create profile' 
      };
    }
  },

  // Update profile
  updateProfile: async (profileId, profileData) => {
    try {
      const response = await API.patch(`/profile/${profileId}`, profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  },

  // Delete profile
  deleteProfile: async (profileId) => {
    try {
      const response = await API.delete(`/profile/${profileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete profile' 
      };
    }
  }
};