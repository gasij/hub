import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { useNavigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import './TicketForm.css';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ticketService.createTicket(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ошибка создания заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="ticket-form-container">
        <div className="ticket-form-card">
          <h2>Создать заявку</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Заголовок:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength="200"
                placeholder="Краткое описание проблемы"
              />
              <small className="char-count">
                {formData.title.length}/200 символов
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Подробное описание проблемы или запроса"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="cancel-button"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Создание...' : 'Создать заявку'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
};

export default TicketForm;
