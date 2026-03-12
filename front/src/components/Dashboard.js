import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TicketList from './TicketList';
import RequireAuth from './RequireAuth';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  return (
    <RequireAuth>
      <div className="dashboard">
        {user?.role === 'admin' && (
        <div className="dashboard-header">
            <div className="admin-filters">
              <div className="filter-container">
                <label htmlFor="status-filter" className="filter-label">
                  Фильтр по статусу заявок:
                </label>
                <select 
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Все заявки</option>
                  <option value="new">Новые</option>
                  <option value="in_progress">В работе</option>
                  <option value="resolved">Решённые</option>
                  <option value="closed">Закрытые</option>
                </select>
              </div>
            </div>
        </div>
        )}
        
        <TicketList statusFilter={statusFilter} />
      </div>
    </RequireAuth>
  );
};

export default Dashboard;
