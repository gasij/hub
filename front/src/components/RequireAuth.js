import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './RequireAuth.css';

const RequireAuth = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="require-auth">
        <div className="require-auth-content">
          <div className="require-auth-icon">🔒</div>
          <h2>Требуется авторизация</h2>
          <p>Для выполнения этого действия необходимо войти в систему</p>
          <div className="require-auth-buttons">
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Войти
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn btn-outline"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireAuth;
