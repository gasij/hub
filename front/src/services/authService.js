import api from './api';

export const authService = {
  // Регистрация пользователя
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Вход в систему
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Выход из системы
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Получение текущего пользователя
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Проверка авторизации
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
