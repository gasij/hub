import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import RequireAuth from './RequireAuth';
import './TicketDetails.css';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTicket(id);
      setTicket(data);
    } catch (err) {
      setError('Ошибка загрузки заявки');
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!user || user.role !== 'admin') return;
    
    try {
      setUpdating(true);
      const updatedTicket = await ticketService.updateTicketStatus(id, newStatus);
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Ошибка обновления статуса заявки');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#28a745',
      'in_progress': '#ffc107',
      'resolved': '#17a2b8',
      'rejected': '#dc3545',
      'closed': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'new': 'Новая',
      'in_progress': 'В работе',
      'resolved': 'Решена',
      'rejected': 'Отклонена',
      'closed': 'Закрыта'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (author) => {
    const parts = [author.lastName, author.firstName];
    if (author.patronymic) {
      parts.push(author.patronymic);
    }
    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="ticket-details-container">
        <div className="loading">Загрузка заявки...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details-container">
        <div className="error">{error || 'Заявка не найдена'}</div>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="ticket-details-container">
        <div className="ticket-details-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Назад к списку
          </button>
          <div className="ticket-status-section">
            <span 
              className="ticket-status-badge"
              style={{ backgroundColor: getStatusColor(ticket.status) }}
            >
              {getStatusText(ticket.status)}
            </span>
            {user?.role === 'admin' && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="status-select"
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решена</option>
                <option value="rejected">Отклонена</option>
                <option value="closed">Закрыта</option>
              </select>
            )}
          </div>
        </div>

        <div className="ticket-details-card">
          <h1 className="ticket-title">{ticket.title}</h1>
          
          <div className="ticket-meta">
            <div className="ticket-author">
              <strong>Автор:</strong> {getAuthorName(ticket.author)}
              {ticket.author.groupName && (
                <span className="ticket-group"> ({ticket.author.groupName})</span>
              )}
            </div>
            <div className="ticket-dates">
              <div><strong>Создана:</strong> {formatDate(ticket.createdAt)}</div>
              {ticket.updatedAt !== ticket.createdAt && (
                <div><strong>Обновлена:</strong> {formatDate(ticket.updatedAt)}</div>
              )}
            </div>
          </div>

          <div className="ticket-description">
            <h3>Описание</h3>
            <p>{ticket.description}</p>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default TicketDetails;
