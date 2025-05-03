import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/dashboard">SAS</Link>
        </div>
        
        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/attendance" onClick={() => setMenuOpen(false)}>Attendance</Link>
            </li>
            <li className="nav-item">
              <Link to="/reports" onClick={() => setMenuOpen(false)}>Reports</Link>
            </li>
            {currentUser && currentUser.role === 'admin_official' && (
              <li className="nav-item">
                <Link to="/users" onClick={() => setMenuOpen(false)}>Users</Link>
              </li>
            )}
          </ul>
          
          <div className="user-menu">
            {currentUser ? (
              <div className="user-info">
                <FaUserCircle className="user-icon" />
                <span className="user-name">{currentUser.name}</span>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-link">Login</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 