import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Set default test credentials for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('test.admin@example.com');
      setPassword('password123');
    }
  }, []);
  
  useEffect(() => {
    // Update error message if auth context has an error
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    console.log('Attempting login with:', { email, password });
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed');
        setError('Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  const loginAsTestUser = async (role) => {
    setLoading(true);
    setError('');
    
    let testEmail = '';
    
    switch(role) {
      case 'admin':
        testEmail = 'test.admin@example.com';
        break;
      case 'student':
        testEmail = 'test.student@example.com';
        break;
      case 'employee':
        testEmail = 'test.employee@example.com';
        break;
      case 'department_head':
        testEmail = 'test.department.head@example.com';
        break;
      case 'instructor':
        testEmail = 'test.instructor@example.com';
        break;
      case 'hr_officer':
        testEmail = 'test.hr.officer@example.com';
        break;
      case 'finance_officer':
        testEmail = 'test.finance.officer@example.com';
        break;
      case 'administrative_officer':
        testEmail = 'test.administrative.officer@example.com';
        break;
      default:
        testEmail = 'test.admin@example.com';
    }
    
    setEmail(testEmail);
    setPassword('password123');
    
    try {
      const success = await login(testEmail, 'password123');
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Test user login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Test login error:', err);
      setError('An error occurred during test login');
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Login to Smart Attendance System</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="test-users">
          <h3>Quick Login (Test Users)</h3>
          <div className="test-user-buttons">
            <button 
              onClick={() => loginAsTestUser('admin')}
              className="test-user-btn admin"
              disabled={loading}
            >
              Admin
            </button>
            <button 
              onClick={() => loginAsTestUser('hr_officer')}
              className="test-user-btn hr"
              disabled={loading}
            >
              HR Officer
            </button>
            <button 
              onClick={() => loginAsTestUser('department_head')}
              className="test-user-btn department"
              disabled={loading}
            >
              Department Head
            </button>
            <button 
              onClick={() => loginAsTestUser('instructor')}
              className="test-user-btn instructor"
              disabled={loading}
            >
              Instructor
            </button>
            <button 
              onClick={() => loginAsTestUser('finance_officer')}
              className="test-user-btn finance"
              disabled={loading}
            >
              Finance
            </button>
            <button 
              onClick={() => loginAsTestUser('administrative_officer')}
              className="test-user-btn admin-officer"
              disabled={loading}
            >
              Admin Officer
            </button>
            <button 
              onClick={() => loginAsTestUser('student')}
              className="test-user-btn student"
              disabled={loading}
            >
              Student
            </button>
            <button 
              onClick={() => loginAsTestUser('employee')}
              className="test-user-btn employee"
              disabled={loading}
            >
              Employee
            </button>
          </div>
          <p className="test-user-note">All test users use password: "password123"</p>
        </div>
        
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 