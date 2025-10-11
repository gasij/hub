import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    role: 'student',
    groupName: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    role: 'student',
    groupName: ''
  });
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Поскольку у нас нет API для получения всех пользователей,
      // будем использовать поиск с пустым запросом или создадим новый API
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      const data = await userService.searchUsers(searchTerm);
      setUsers(data);
    } catch (err) {
      setError('Ошибка поиска пользователей');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      patronymic: user.patronymic || '',
      role: user.role,
      groupName: user.groupName || ''
    });
  };

  const handleSaveUser = async () => {
    try {
      await userService.updateUser(editingUser.id, editForm);
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...editForm }
          : u
      ));
      setEditingUser(null);
    } catch (err) {
      setError('Ошибка обновления пользователя');
      console.error('Error updating user:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      firstName: '',
      lastName: '',
      patronymic: '',
      role: 'student',
      groupName: ''
    });
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await userService.createUser(createForm);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        patronymic: '',
        role: 'student',
        groupName: ''
      });
    } catch (err) {
      setError('Ошибка создания пользователя');
      console.error('Error creating user:', err);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setCreateForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      patronymic: '',
      role: 'student',
      groupName: ''
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setDeletingUser(null);
    } catch (err) {
      setError('Ошибка удаления пользователя');
      console.error('Error deleting user:', err);
    }
  };

  const handleCancelDelete = () => {
    setDeletingUser(null);
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': '#dc3545',
      'student': '#28a745'
    };
    return colors[role] || '#6c757d';
  };

  const getRoleText = (role) => {
    const texts = {
      'admin': 'Администратор',
      'student': 'Студент'
    };
    return texts[role] || role;
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

  const getUserDisplayName = (user) => {
    const parts = [user.lastName, user.firstName];
    if (user.patronymic) {
      parts.push(user.patronymic);
    }
    return parts.join(' ');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="user-management-container">
        <div className="access-denied">
          <h2>Доступ запрещен</h2>
          <p>Только администраторы могут управлять пользователями</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading">Загрузка пользователей...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-container">
        <div className="error">{error}</div>
        <button onClick={loadUsers} className="retry-button">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>Управление пользователями</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-user-button"
          >
            + Создать пользователя
          </button>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Всего</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {users.filter(u => u.role === 'admin').length}
              </span>
              <span className="stat-label">Админов</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {users.filter(u => u.role === 'student').length}
              </span>
              <span className="stat-label">Студентов</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Поиск пользователей по имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Поиск
          </button>
        </form>
        <button onClick={loadUsers} className="refresh-button">
          Обновить
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Пользователи не найдены</p>
        </div>
      ) : (
        <div className="users-list">
          {users.map(userItem => (
            <div key={userItem.id} className="user-card">
              <div className="user-info">
                <div className="user-name">
                  {getUserDisplayName(userItem)}
                </div>
                <div className="user-email">{userItem.email}</div>
                {userItem.groupName && (
                  <div className="user-group">{userItem.groupName}</div>
                )}
                <div className="user-dates">
                  <span>Зарегистрирован: {formatDate(userItem.createdAt)}</span>
                </div>
              </div>
              
              <div className="user-actions">
                <span 
                  className="user-role"
                  style={{ backgroundColor: getRoleColor(userItem.role) }}
                >
                  {getRoleText(userItem.role)}
                </span>
                <div className="action-buttons">
                  <button 
                    onClick={() => handleEditUser(userItem)}
                    className="edit-button"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => setDeletingUser(userItem)}
                    className="delete-button"
                    disabled={userItem.id === user?.id}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Редактировать пользователя</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Имя:</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Фамилия:</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Отчество:</label>
                <input
                  type="text"
                  value={editForm.patronymic}
                  onChange={(e) => setEditForm({...editForm, patronymic: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Роль:</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                >
                  <option value="student">Студент</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Группа:</label>
                <input
                  type="text"
                  value={editForm.groupName}
                  onChange={(e) => setEditForm({...editForm, groupName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="edit-actions">
              <button onClick={handleCancelEdit} className="cancel-button">
                Отмена
              </button>
              <button onClick={handleSaveUser} className="save-button">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания пользователя */}
      {showCreateModal && (
        <div className="create-modal">
          <div className="create-modal-content">
            <h3>Создать нового пользователя</h3>
            <div className="create-form">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Пароль:</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Имя:</label>
                <input
                  type="text"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Фамилия:</label>
                <input
                  type="text"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Отчество:</label>
                <input
                  type="text"
                  value={createForm.patronymic}
                  onChange={(e) => setCreateForm({...createForm, patronymic: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Роль:</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                >
                  <option value="student">Студент</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Группа:</label>
                <input
                  type="text"
                  value={createForm.groupName}
                  onChange={(e) => setCreateForm({...createForm, groupName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="create-actions">
              <button onClick={handleCancelCreate} className="cancel-button">
                Отмена
              </button>
              <button onClick={handleCreateUser} className="create-button">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deletingUser && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Подтверждение удаления</h3>
            <p>
              Вы уверены, что хотите удалить пользователя{' '}
              <strong>{getUserDisplayName(deletingUser)}</strong>?
            </p>
            <p className="warning-text">
              Это действие нельзя отменить!
            </p>
            
            <div className="delete-actions">
              <button onClick={handleCancelDelete} className="cancel-button">
                Отмена
              </button>
              <button 
                onClick={() => handleDeleteUser(deletingUser.id)} 
                className="confirm-delete-button"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
