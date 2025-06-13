// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddAppointment from './pages/AddAppointment';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './pages/DashboardLayout';
import { authService } from './services/auth';
import './App.css';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        // Optionally verify token with backend
        const verifyResult = await authService.verifyToken();
        if (verifyResult) {
          setUser(currentUser);
        } else {
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

 return (
    <Router>
      <Routes>
        {/* Protected Dashboard Layout Routes */}
        {user && (
          <Route path="/" element={<DashboardLayout user={user} handleLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="add-appointment"
              element={<ProtectedRoute><AddAppointment /></ProtectedRoute>}
            />
            <Route
              path="appointments"
              element={<ProtectedRoute><Appointments /></ProtectedRoute>}
            />
            <Route
              path="edit-profile"
              element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
            />
          </Route>
        )}

        {/* Public Routes */}
        {!user && (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;