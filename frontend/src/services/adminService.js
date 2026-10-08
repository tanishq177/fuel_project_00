import api from './api';

const adminService = {
  // Get all users or filter by role (e.g. { role: 'SUPPORT_AGENT' })
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get all tickets across the platform
  getAllTickets: async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
  },

  // Assign a support agent to a ticket
  assignAgent: async (ticketId, agentId) => {
    const response = await api.put(`/admin/tickets/${ticketId}/assign/${agentId}`);
    return response.data;
  }
};

export default adminService;
