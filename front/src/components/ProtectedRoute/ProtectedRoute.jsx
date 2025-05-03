import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, hasRole, loading } = useContext(AuthContext);
  
  console.log("ProtectedRoute - Current User:", currentUser);
  console.log("ProtectedRoute - Required Role:", requiredRole);
  
  // Show loading state if auth is still being checked
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Special case for test users - allow access to all routes based on role
  if (currentUser && currentUser.email && currentUser.email.startsWith('test.') && currentUser.email.endsWith('@example.com')) {
    console.log("Test user detected, checking role-based access");
    
    // If a specific role is required, check if the test user has that role
    if (requiredRole && !hasRole(requiredRole)) {
      console.log("Test user doesn't have required role, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    console.log("No user logged in, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If role is required and user doesn't have it, redirect to dashboard
  if (requiredRole && !hasRole(requiredRole)) {
    console.log("User doesn't have required role, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise render the children
  console.log("Access granted");
  return children;
};

export default ProtectedRoute; 