import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RequireAuth from './RequireAuth';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    patronymic: user?.patronymic || '',
    groupName: user?.groupName || ''
  });

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // Здесь будет логика сохранения профиля
    console.log('Saving profile:', editForm);
    setIsEditing(false);
    // TODO: Добавить API вызов для обновления профиля
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      patronymic: user?.patronymic || '',
      groupName: user?.groupName || ''
    });
    setIsEditing(false);
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
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const getUserDisplayName = () => {
    if (user) {
      return `${user.firstName} ${user.lastName}${user.patronymic ? ' ' + user.patronymic : ''}`;
    }
    return '';
  };

  return (
    <RequireAuth>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initials">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{getUserDisplayName()}</h1>
            <div className="profile-role">
              <span 
                className="role-badge"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                {getRoleText(user?.role)}
              </span>
            </div>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Информация о профиле</h2>
            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Имя:</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Отчество:</label>
                    <input
                      type="text"
                      name="patronymic"
                      value={editForm.patronymic}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Группа:</label>
                    <input
                      type="text"
                      name="groupName"
                      value={editForm.groupName}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button onClick={handleCancelEdit} className="cancel-button">
                      Отмена
                    </button>
                    <button onClick={handleSaveProfile} className="save-button">
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-fields">
                  <div className="field">
                    <span className="field-label">Имя:</span>
                    <span className="field-value">{user?.firstName}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Фамилия:</span>
                    <span className="field-value">{user?.lastName}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Отчество:</span>
                    <span className="field-value">{user?.patronymic || 'Не указано'}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Группа:</span>
                    <span className="field-value">{user?.groupName || 'Не указана'}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Email:</span>
                    <span className="field-value">{user?.email}</span>
                  </div>
                  <div className="field">
                    <span className="field-label">Роль:</span>
                    <span className="field-value">
                      <span 
                        className="role-text"
                        style={{ color: getRoleColor(user?.role) }}
                      >
                        {getRoleText(user?.role)}
                      </span>
                    </span>
                  </div>
                  <div className="field">
                    <span className="field-label">Дата регистрации:</span>
                    <span className="field-value">{formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>


          {!isEditing && (
            <div className="profile-actions">
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-profile-button"
              >
                Редактировать профиль
              </button>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
};

export default Profile;
