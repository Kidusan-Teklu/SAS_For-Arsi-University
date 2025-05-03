import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navigation.css';

export default function Navigation() {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = !!currentUser;
  
  // Get user role
  const userRole = currentUser?.role || '';
  
  // Check if user has specific roles
  const isAdmin = userRole === 'admin';
  const isHrOfficer = userRole === 'hr_officer';
  const isDepartmentHead = userRole === 'department_head';
  const isInstructor = userRole === 'instructor';
  const isFinanceOfficer = userRole === 'finance_officer';
  const isAdminOfficer = userRole === 'administrative_officer';
  const isStudent = userRole === 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-logo">
        <Link to="/">Arsi University</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
        
        {isLoggedIn && (
          <>
            <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
            <li><Link to="/attendance" className={location.pathname === '/attendance' ? 'active' : ''}>Attendance</Link></li>
            
            {/* Face recognition attendance for students */}
            {isStudent && (
              <li><Link to="/face-attendance" className={location.pathname === '/face-attendance' ? 'active' : ''}>Face Check-in</Link></li>
            )}
            
            {/* Reports only visible to admin, HR, department heads, and instructors */}
            {(isAdmin || isHrOfficer || isDepartmentHead || isInstructor || isFinanceOfficer) && (
              <li><Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>Reports</Link></li>
            )}
            
            {/* Admin link only for admin users */}
            {isAdmin && (
              <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin Panel</Link></li>
            )}
            
            {/* HR links */}
            {isHrOfficer && (
              <li><Link to="/manage-employees" className={location.pathname === '/manage-employees' ? 'active' : ''}>Manage Employees</Link></li>
            )}
            
            {/* Department head links */}
            {isDepartmentHead && (
              <li><Link to="/department" className={location.pathname === '/department' ? 'active' : ''}>Department</Link></li>
            )}
            
            {/* Instructor links */}
            {isInstructor && (
              <li><Link to="/classes" className={location.pathname === '/classes' ? 'active' : ''}>Classes</Link></li>
            )}
            
            {/* Finance officer links */}
            {isFinanceOfficer && (
              <li><Link to="/finance" className={location.pathname === '/finance' ? 'active' : ''}>Finance</Link></li>
            )}
            
            {/* Administrative officer links */}
            {isAdminOfficer && (
              <li><Link to="/administration" className={location.pathname === '/administration' ? 'active' : ''}>Administration</Link></li>
            )}
            
            <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link></li>
          </>
        )}
        
        {isLoggedIn ? (
          <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
        ) : (
          <li><Link to="/login" className="login-btn">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}