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
    groupName: '',
    birthDate: '',
    course: '',
    direction: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    role: 'student',
    groupName: '',
    birthDate: '',
    course: '',
    direction: ''
  });
  const [deletingUser, setDeletingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      groupName: user.groupName || '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
      course: user.course || '',
      direction: user.direction || ''
    });
  };

  const handleSaveUser = async () => {
    try {
      const payload = {
        ...editForm,
        birthDate: editForm.birthDate || null
      };
      await userService.updateUser(editingUser.id, payload);
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
      groupName: '',
      birthDate: '',
      course: '',
      direction: ''
    });
  };

  const handleCreateUser = async () => {
    try {
      const payload = {
        ...createForm,
        birthDate: createForm.birthDate || null
      };
      const newUser = await userService.createUser(payload);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        patronymic: '',
        role: 'student',
        groupName: '',
        birthDate: '',
        course: '',
        direction: ''
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
      groupName: '',
      birthDate: '',
      course: '',
      direction: ''
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

  const handleOpenChangePassword = (userItem) => {
    setPasswordUser(userItem);
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError('');
  };

  const handleCancelChangePassword = () => {
    setPasswordUser(null);
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    try {
      await userService.changeUserPassword(passwordUser.id, newPassword);
      handleCancelChangePassword();
    } catch (err) {
      setPasswordError(err?.message || 'Ошибка смены пароля');
    }
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
                    onClick={() => handleOpenChangePassword(userItem)}
                    className="password-button"
                    title="Сменить пароль"
                  >
                    Пароль
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

              <div className="form-group">
                <label>Дата рождения (для справок):</label>
                <input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Курс:</label>
                <input
                  type="text"
                  placeholder="1, 2, 3..."
                  value={editForm.course}
                  onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Направление подготовки:</label>
                <input
                  type="text"
                  placeholder="Специальность / направление"
                  value={editForm.direction}
                  onChange={(e) => setEditForm({...editForm, direction: e.target.value})}
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
              <div className="form-group">
                <label>Дата рождения (для справок):</label>
                <input
                  type="date"
                  value={createForm.birthDate}
                  onChange={(e) => setCreateForm({...createForm, birthDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Курс:</label>
                <input
                  type="text"
                  placeholder="1, 2, 3..."
                  value={createForm.course}
                  onChange={(e) => setCreateForm({...createForm, course: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Направление подготовки:</label>
                <input
                  type="text"
                  placeholder="Специальность / направление"
                  value={createForm.direction}
                  onChange={(e) => setCreateForm({...createForm, direction: e.target.value})}
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

      {/* Модальное окно смены пароля */}
      {passwordUser && (
        <div className="password-modal">
          <div className="password-modal-content">
            <h3>Сменить пароль</h3>
            <p className="password-modal-user">
              Пользователь: <strong>{getUserDisplayName(passwordUser)}</strong>
            </p>
            <div className="password-form">
              <div className="form-group">
                <label>Новый пароль:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Не менее 6 символов"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Подтвердите пароль:</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                />
              </div>
              {passwordError && (
                <div className="password-error">{passwordError}</div>
              )}
            </div>
            <div className="password-actions">
              <button onClick={handleCancelChangePassword} className="cancel-button">
                Отмена
              </button>
              <button onClick={handleChangePassword} className="save-button">
                Сохранить пароль
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
