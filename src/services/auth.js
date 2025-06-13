import API from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/users/login', { email, password });
      const { accessToken, ...user } = response.data;
      
      // Check if user is a doctor
      if (!user.profile || !user.profile.isDoctor) {
        return { 
          success: false, 
          error: 'Access denied. This portal is for doctors only.' 
        };
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid credentials' 
      };
    }
  },

  signup: async (userData) => {
    try {
      // Ensure the user is signing up as a doctor
      const signupData = {
        ...userData,
        profile: {
          ...userData.profile,
          isDoctor: true,
          isPatient: false
        }
      };
      
      const response = await API.post('/users/signup', signupData);
      const { accessToken, ...user } = response.data;
      
      // Double-check that the created user is a doctor
      if (!user.profile || !user.profile.isDoctor) {
        return { 
          success: false, 
          error: 'Failed to create doctor account. Please try again.' 
        };
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor');
    localStorage.removeItem('doctorAccount');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // Ensure the user is a doctor
    if (!user.profile || !user.profile.isDoctor) {
      authService.logout();
      return null;
    }
    
    return user;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  verifyToken: async () => {
    try {
      const response = await API.post('/auth/verify');
      
      // Also verify that the stored user is a doctor
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (!user.profile || !user.profile.isDoctor) {
          authService.logout();
          return null;
        }
      }
      
      return response.data;
    } catch (error) {
      return null;
    }
  },
};