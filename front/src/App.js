import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketDetails from './components/TicketDetails';
import HomePage from './components/HomePage';
import UserManagement from './components/UserManagement';
import Profile from './components/Profile';
import SimpleAnimatedBackground from './components/SimpleAnimatedBackground';
import CursorTrail from './components/CursorTrail';
import LogoBackground from './components/LogoBackground';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <SimpleAnimatedBackground />
          <LogoBackground />
          <CursorTrail />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets/new" 
              element={
                <ProtectedRoute>
                  <TicketForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets/:id" 
              element={
                <ProtectedRoute>
                  <TicketDetails />
                </ProtectedRoute>
              } 
            />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
