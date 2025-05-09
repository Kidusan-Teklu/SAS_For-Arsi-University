import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = !!currentUser;
  
  // Get user role
  const userRole = currentUser?.role || '';
  
  // Check if user has specific roles
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isHrOfficer = userRole === 'HR';
  const isDepartmentHead = userRole === 'DEPT_HEAD';
  const isInstructor = userRole === 'instructor';
  const isFinanceOfficer = userRole === 'FINANCE';
  const isAdminOfficer = userRole === 'administrative_officer';
  const isStudent = userRole === 'student';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src="/arsi.png" alt="Arsi University Logo" />
          <span>Arsi University</span>
        </Link>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          
          {isLoggedIn && (
            <>
              <Link 
                to="/attendance" 
                className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Attendance
              </Link>
              
              {/* Face recognition attendance for students */}
              {isStudent && (
                <Link 
                  to="/face-attendance" 
                  className={`nav-link ${location.pathname === '/face-attendance' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Face Check-in
                </Link>
              )}
              
              {/* Reports only visible to admin, HR, department heads, and instructors */}
              {(isAdmin || isHrOfficer || isDepartmentHead || isInstructor || isFinanceOfficer) && (
                <Link 
                  to="/reports" 
                  className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Reports
                </Link>
              )}
              
              {/* Admin links only for admin users */}
              {isAdmin && (
                <>
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Admin Panel
                  </Link>
                  <Link 
                    to="/user-management" 
                    className={`nav-link ${location.pathname === '/user-management' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    User Management
                  </Link>
                </>
              )}
              
              {/* HR links */}
              {isHrOfficer && (
                <Link 
                  to="/manage-employees" 
                  className={`nav-link ${location.pathname === '/manage-employees' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Manage Employees
                </Link>
              )}
              
              {/* Department head links */}
              {isDepartmentHead && (
                <Link 
                  to="/department" 
                  className={`nav-link ${location.pathname === '/department' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Department
                </Link>
              )}
              
              {/* Instructor links */}
              {isInstructor && (
                <Link 
                  to="/classes" 
                  className={`nav-link ${location.pathname === '/classes' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Classes
                </Link>
              )}
              
              {/* Finance officer links */}
              {isFinanceOfficer && (
                <Link 
                  to="/finance" 
                  className={`nav-link ${location.pathname === '/finance' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Finance
                </Link>
              )}
              
              {/* Administrative officer links */}
              {isAdminOfficer && (
                <Link 
                  to="/administration" 
                  className={`nav-link ${location.pathname === '/administration' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Administration
                </Link>
              )}
              
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
            </>
          )}
          
          {isLoggedIn ? (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;