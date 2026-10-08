import api from './api';

const authService = {
  // Register a new customer
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user (Customer, Agent, or Admin)
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.id) {
      localStorage.setItem('helpdesk_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Get currently logged-in user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('helpdesk_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('helpdesk_user');
  }
};

export default authService;
