import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';

const TicketCard = ({ ticket, onStatusUpdate, isAdmin, getStatusColor, getStatusText }) => {
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus) => {
    if (!isAdmin) return;
    
    try {
      setUpdating(true);
      await ticketService.updateTicketStatus(ticket.id, newStatus);
      onStatusUpdate(ticket.id, newStatus);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Ошибка обновления статуса заявки');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="ticket-card" onClick={() => navigate(`/tickets/${ticket.id}`)}>
      <div className="ticket-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <span 
          className="ticket-status"
          style={{ backgroundColor: getStatusColor(ticket.status) }}
        >
          {getStatusText(ticket.status)}
        </span>
      </div>

      <div className="ticket-body">
        <p className="ticket-description">
          {ticket.description.length > 150 
            ? `${ticket.description.substring(0, 150)}...` 
            : ticket.description
          }
        </p>
      </div>

      <div className="ticket-footer">
        <div className="ticket-info">
          <div className="ticket-author">
            <strong>Автор:</strong> {getAuthorName(ticket.author)}
            {ticket.author.groupName && (
              <span className="ticket-group"> ({ticket.author.groupName})</span>
            )}
          </div>
          <div className="ticket-dates">
            <span>Создана: {formatDate(ticket.createdAt)}</span>
            {ticket.updatedAt !== ticket.createdAt && (
              <span>Обновлена: {formatDate(ticket.updatedAt)}</span>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="ticket-actions">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="status-select"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="new">Новая</option>
              <option value="in_progress">В работе</option>
              <option value="resolved">Решена</option>
              <option value="rejected">Отклонена</option>
              <option value="closed">Закрыта</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
