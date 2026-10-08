import api from './api';

const ticketService = {
  // Create a new support ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  // Get tickets with optional filtering by customerId or agentId
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  // Get single ticket details by ID
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket status
  updateStatus: async (id, status) => {
    const response = await api.put(`/tickets/${id}/status`, { status });
    return response.data;
  },

  // Add a response to a ticket thread
  addResponse: async (ticketId, responseData) => {
    const response = await api.post(`/tickets/${ticketId}/responses`, responseData);
    return response.data;
  },

  // Get all responses for a ticket
  getResponses: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/responses`);
    return response.data;
  }
};

export default ticketService;
