import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import TicketCard from './TicketCard';
import './TicketList.css';

const TicketList = ({ statusFilter = 'all' }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    // Перезагружаем заявки при изменении фильтра
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTickets(statusFilter);
      setTickets(data);
    } catch (err) {
      setError('Ошибка загрузки заявок');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (ticketId, newStatus) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
        : ticket
    ));
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

  if (loading) {
    return (
      <div className="ticket-list-container">
        <div className="loading">Загрузка заявок...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-list-container">
        <div className="error">{error}</div>
        <button onClick={loadTickets} className="retry-button">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h2>Заявки</h2>
        <div className="ticket-stats">
          <div className="stat">
            <span className="stat-number">{tickets.length}</span>
            <span className="stat-label">Всего</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {tickets.filter(t => t.status === 'new').length}
            </span>
            <span className="stat-label">Новых</span>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>Заявок пока нет</p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusUpdate={handleStatusUpdate}
              isAdmin={user?.role === 'admin'}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
