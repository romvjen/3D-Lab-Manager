import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * Protected route wrapper for admin area
 * Requires user to be authenticated and have admin role
 */
const AdminProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has admin role or required role
  const userRole = user?.role || 'student';
  const hasAccess = userRole === 'admin' || (requiredRole && userRole === requiredRole);

  if (!hasAccess) {
    console.warn(`Access denied. User role: ${userRole}, Required: ${requiredRole || 'admin'}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
