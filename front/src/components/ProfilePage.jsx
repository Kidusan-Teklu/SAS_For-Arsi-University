import React, { useEffect, useState, useContext } from 'react';
import './ProfilePage.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Use a consistent API URL
const API_URL = 'http://localhost:8000/api';

export default function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current user from context:', currentUser);
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    // Set default authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch user profile
    axios.get(`${API_URL}/user/profile/`)
      .then(response => {
        console.log('Profile data received:', response.data);
        console.log('User role:', response.data.role);
        setProfile(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      });
      
    // Fetch attendance history
    axios.get(`${API_URL}/attendance/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        user_id: localStorage.getItem('userId')
      }
    })
      .then(response => {
        setAttendanceHistory(response.data);
      })
      .catch(error => {
        console.error('Error fetching attendance history:', error);
      });
  }, []);
  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    // Change user password
    axios.post(`${API_URL}/user/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword
    })
      .then(response => {
        // Handle success
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(error => {
        // Handle error
        setPasswordMessage('Error changing password. Please try again.');
        console.error('Error changing password:', error);
      });
  };

  if (loading) {
    return <p>Loading profile data...</p>;
  }
  
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!profile) {
    return <p>Failed to load profile data</p>;
  }

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      {/* Debug info */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
        <p><strong>Debug Info</strong></p>
        <p>Profile Role: {profile.role}</p>
        <p>Context User Role: {currentUser?.role}</p>
        <p>Should Show Admin Notice: {(profile.role === 'super_admin' || profile.role === 'admin') ? 'Yes' : 'No'}</p>
      </div>
      {/* End debug info */}
      <div className="profile-details">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Department:</strong> {profile.department}</p>
      </div>

      <h2>Recent Attendance</h2>
      <div className="attendance-records">
        {profile.recent_attendance && profile.recent_attendance.length > 0 ? (
          <ul>
            {profile.recent_attendance.map((record, index) => (
              <li key={index}>
                Date: {new Date(record.date).toLocaleDateString()}, 
                Time In: {record.time_in}, 
                Time Out: {record.time_out || 'Not checked out'}, 
                Status: {record.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent attendance records found.</p>
        )}
      </div>
      
      <h2>Recent Notifications</h2>
      <div className="notifications">
        {profile.notifications && profile.notifications.length > 0 ? (
          <ul>
            {profile.notifications.map((notification, index) => (
              <li key={index} className={notification.is_read ? 'read' : 'unread'}>
                {notification.message}
                <span className="notification-time">
                  {new Date(notification.sent_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications.</p>
        )}
      </div>

      <h2>Change Password</h2>
      <form className="change-password-form" onSubmit={handlePasswordChange}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
      {passwordMessage && <p className="password-message">{passwordMessage}</p>}
      
      {/* Admin User Management Notice */}
      {(profile.role === 'super_admin' || profile.role === 'admin') && (
        <div className="admin-notice">
          <h2>User Management</h2>
          <p>User management has been moved to a dedicated page for better organization and improved functionality.</p>
          <Link to="/user-management" className="user-management-link">Go to User Management</Link>
        </div>
      )}
    </div>
  );
}