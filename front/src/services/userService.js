import api from './api';

export const userService = {
  // Поиск пользователей (только для админов)
  async searchUsers(searchTerm) {
    try {
      const response = await api.get(`/users/search?searchTerm=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Получение всех пользователей (только для админов)
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Обновление пользователя (только для админов)
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Удаление пользователя (только для админов)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Создание пользователя (только для админов)
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
