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
      <div className="navbar" style={{ display: 'flex', gap: '10px', padding: '10px', backgroundColor: '#1abc9c', color: '#fff' }}>
        {user && (
          <>
            <Link style={{ color: 'white' }} to="/dashboard">Dashboard</Link>
            <Link style={{ color: 'white' }} to="/appointments">Appointments</Link>
            <Link style={{ color: 'white' }} to="/add-appointment">Add Appointment</Link>
            <Link style={{ color: 'white' }} to="/edit-profile">Edit Profile</Link>
          </>
        )}
        {!user && (
          <>
            <Link style={{ color: 'white' }} to="/login">Login</Link>
            <Link style={{ color: 'white' }} to="/signup">Sign Up</Link>
          </>
        )}
        {user && (
          <>
            <span style={{ marginLeft: 'auto', color: '#fff' }}>
              Dr. {user.profile?.lastName || user.email}
            </span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
          </>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-appointment" element={
            <ProtectedRoute>
              <AddAppointment />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;