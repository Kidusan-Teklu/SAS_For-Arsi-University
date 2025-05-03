import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageTemplate from './PageTemplate';
import './RolePage.css';

const RolePage = ({ title, roleName, features }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <PageTemplate title={title}>
      <div className="role-dashboard">
        <div className="role-welcome">
          <h2>Welcome, {currentUser?.name}</h2>
          <p>Role: {roleName || currentUser?.role}</p>
        </div>

        <div className="role-features">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon || '📊'}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <button className="feature-btn">{feature.buttonText || 'View'}</button>
            </div>
          ))}
        </div>

        <div className="role-recent">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-time">Today, 9:30 AM</div>
              <div className="activity-content">Logged into the system</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">Yesterday, 4:15 PM</div>
              <div className="activity-content">Updated profile information</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">Yesterday, 10:45 AM</div>
              <div className="activity-content">Viewed attendance records</div>
            </div>
            <div className="activity-item">
              <div className="activity-time">Aug 25, 2:30 PM</div>
              <div className="activity-content">Generated monthly report</div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default RolePage; 