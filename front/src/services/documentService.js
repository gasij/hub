import api from './api';

export const documentService = {
  // Получение документа по ID
  async getDocument(id) {
    try {
      const response = await api.get(`/documents/${id}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Получение документа по ID заявки
  async getDocumentByTicket(ticketId) {
    try {
      const response = await api.get(`/documents/ticket/${ticketId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Получение списка документов пользователя
  async getMyDocuments() {
    try {
      const response = await api.get('/documents/my-documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Скачивание документа
  downloadDocument(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

