import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Система управления заявками
          </h1>
          <p className="hero-subtitle">
            Удобная платформа для подачи и отслеживания заявок студентов
          </p>
          
          {isAuthenticated ? (
            <div className="authenticated-section">
              <p className="welcome-message">
                Добро пожаловать, {user?.firstName}!
              </p>
              <div className="action-buttons">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  Перейти к заявкам
                </button>
                <button 
                  onClick={() => navigate('/tickets/new')}
                  className="btn btn-secondary"
                >
                  Создать заявку
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-section">
              <p className="guest-message">
                Для работы с заявками необходимо войти в систему
              </p>
              <div className="action-buttons">
                <button 
                  onClick={handleGetStarted}
                  className="btn btn-primary"
                >
                  Войти в систему
                </button>
                <button 
                  onClick={handleRegister}
                  className="btn btn-outline"
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="cta-section">
        <div className="container">
          <h2>Готовы начать?</h2>
          <p>Войдите в систему или зарегистрируйтесь, чтобы начать работу с заявками</p>
          <div className="cta-buttons">
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary btn-large"
            >
              {isAuthenticated ? 'Перейти к заявкам' : 'Войти в систему'}
            </button>
            {!isAuthenticated && (
              <button 
                onClick={handleRegister}
                className="btn btn-outline btn-large"
              >
                Зарегистрироваться
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
