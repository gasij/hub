import api from './api';

export const ticketService = {
  // Получение всех заявок с возможностью фильтрации по статусу
  async getTickets(statusFilter = 'all') {
    try {
      const url = statusFilter === 'all' ? '/tickets' : `/tickets?status=${statusFilter}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Получение заявки по ID
  async getTicket(id) {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Создание новой заявки
  async createTicket(ticketData) {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Обновление статуса заявки (только для админов)
  async updateTicketStatus(id, status) {
    try {
      const response = await api.patch(`/tickets/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
