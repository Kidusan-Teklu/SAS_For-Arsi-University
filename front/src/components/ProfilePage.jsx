import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import axios from 'axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    // Fetch user profile data from the backend
    axios.get('http://127.0.0.1:8000/api/user/profile/')
      .then(response => {
        setProfile(response.data);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
      });

    // Fetch user attendance data from the backend
    axios.get('http://127.0.0.1:8000/api/attendance/user/')
      .then(response => {
        setAttendance(response.data);
      })
      .catch(error => {
        console.error('Error fetching attendance data:', error);
      });
  }, []);

  const handleChangePassword = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/user/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    })
      .then(response => {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(error => {
        setPasswordMessage('Error changing password. Please try again.');
        console.error('Error changing password:', error);
      });
  };

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <div className="profile-details">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>

      <h2>Attendance Records</h2>
      <div className="attendance-records">
        {attendance.length > 0 ? (
          <ul>
            {attendance.map((record, index) => (
              <li key={index}>
                Date: {record.date}, Status: {record.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No attendance records found.</p>
        )}
      </div>

      <h2>Change Password</h2>
      <form className="change-password-form" onSubmit={handleChangePassword}>
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
      {passwordMessage && <p>{passwordMessage}</p>}
    </div>
  );
}