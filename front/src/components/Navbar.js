import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <button type="button" className="theme-switch" onClick={toggleTheme} role="switch" aria-label="Переключить тему" aria-checked={theme === 'dark'} title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
              <span className="theme-switch-slider" data-theme={theme} aria-hidden />
            </button>
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
              <button type="button" className="theme-switch" onClick={toggleTheme} role="switch" aria-label="Переключить тему" aria-checked={theme === 'dark'} title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
                <span className="theme-switch-slider" data-theme={theme} aria-hidden />
              </button>
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
