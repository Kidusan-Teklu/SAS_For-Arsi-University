import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';
import './AdminPage.css';

const AdminPage = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <PageTemplate title="Admin Panel">
      <div className="admin-dashboard">
        <div className="admin-welcome">
          <h2>Welcome, {currentUser?.name}</h2>
          <p>Role: {currentUser?.role}</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">248</p>
          </div>
          <div className="stat-card">
            <h3>Departments</h3>
            <p className="stat-number">12</p>
          </div>
          <div className="stat-card">
            <h3>Attendance Rate</h3>
            <p className="stat-number">92%</p>
          </div>
          <div className="stat-card">
            <h3>System Uptime</h3>
            <p className="stat-number">99.9%</p>
          </div>
        </div>

        <div className="admin-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn">Manage Users</button>
            <button className="action-btn">System Settings</button>
            <button className="action-btn">View Reports</button>
            <button className="action-btn">Backup Data</button>
          </div>
        </div>

        <div className="admin-recent">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>New user registered: John Doe</li>
            <li>System update deployed: v2.1.4</li>
            <li>Department "Computer Science" added</li>
            <li>Backup completed successfully</li>
            <li>User role updated: Jane Smith (Instructor → Department Head)</li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
};

export default AdminPage; 