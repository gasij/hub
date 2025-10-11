import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    const parts = [user.lastName, user.firstName];
    if (user.patronymic) {
      parts.push(user.patronymic);
    }
    return parts.join(' ');
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <h2>Система заявок</h2>
            </Link>
          </div>

          <div className="navbar-menu">
            <Link to="/" className="navbar-link">
              Главная
            </Link>
          </div>

          <div className="navbar-user">
            <Link to="/login" className="navbar-link">
              Войти
            </Link>
            <Link to="/register" className="navbar-link register-link">
              Регистрация
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <h2>Система заявок</h2>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Заявки
          </Link>
          <Link to="/tickets/new" className="navbar-link">
            Создать заявку
          </Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="navbar-link">
              Пользователи
            </Link>
          )}
        </div>

            <div className="navbar-user">
              <Link to="/profile" className="navbar-link profile-button">
                Профиль
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Выйти
              </button>
            </div>
      </div>
    </nav>
  );
};

export default Navbar;
