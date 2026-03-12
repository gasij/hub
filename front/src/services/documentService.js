import api from './api';

export const documentService = {
  // Получение документа по ID (возвращает { blob, fileName } для корректного скачивания)
  async getDocument(id) {
    try {
      const response = await api.get(`/documents/${id}`, {
        responseType: 'blob'
      });
      let fileName = null;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        // filename*=UTF-8''encoded-name или filename="name"
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/i);
        if (utf8Match && utf8Match[1]) {
          try {
            fileName = decodeURIComponent(utf8Match[1].replace(/"/g, ''));
          } catch (_) {
            fileName = utf8Match[1];
          }
        }
        if (!fileName) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) fileName = match[1].replace(/['"]/g, '').trim();
        }
      }
      const contentType = response.headers['content-type'] || '';
      if (!fileName) {
        const ext = contentType.includes('wordprocessingml') || contentType.includes('msword') ? '.docx' : '.pdf';
        fileName = `document${ext}`;
      }
      return { blob: response.data, fileName };
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

