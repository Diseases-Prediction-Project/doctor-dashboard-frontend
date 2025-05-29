import API from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/users/login', { email, password });
      const { accessToken, ...user } = response.data;
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
      const response = await API.post('/users/signup', userData);
      const { accessToken, ...user } = response.data;
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
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  verifyToken: async () => {
    try {
      const response = await API.post('/auth/verify');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};