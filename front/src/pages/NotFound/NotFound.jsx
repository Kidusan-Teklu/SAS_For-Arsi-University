import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="home-button">Go to Home</Link>
          <Link to="/dashboard" className="dashboard-button">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 