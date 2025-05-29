import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Check both authentication and doctor status
  if (!isAuthenticated || !user || !user.profile || !user.profile.isDoctor) {
    authService.logout(); // Clear any invalid session
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;