import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Set the API URL
const API_URL = 'http://localhost:8000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if user is logged in on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`Attempting login with email: ${email}`);
      
      // Clear any existing tokens and headers
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      // Regular login flow
      const response = await axios.post(`${API_URL}/login/`, { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data.token) {
        throw new Error('No token received from server');
      }
      
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setCurrentUser(user);
      
      // Save to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'Login failed. Please check your credentials.');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', err.message);
        setError('Failed to login. Please try again.');
      }
      setLoading(false);
      return false;
    }
  };
  
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/register/`, userData);
      
      const { token, user } = response.data;
      
      // Save to state
      setToken(token);
      setCurrentUser(user);
      
      // Save to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      return false;
    }
  };
  
  const logout = () => {
    // Remove from state
    setToken('');
    setCurrentUser(null);
    
    // Remove from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    
    // For admin and super_admin, allow access to everything
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return true;
    
    // If the required role is an array, check if user's role is in the array
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentUser.role);
    }
    
    // For specific role checks
    if (requiredRole) {
      return currentUser.role === requiredRole;
    }
    
    // If no specific role required, just check if user is logged in
    return true;
  };
  
  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};