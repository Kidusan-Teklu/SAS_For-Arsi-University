import React from 'react';
import './NotificationList.css';
import NotificationCard from './NotificationCard';

export default function NotificationList({ notifications }) {
  return (
    <div className="notification-list">
      <h2>Notifications</h2>
      {notifications.map((notification, index) => (
        <NotificationCard
          key={index}
          recipient={notification.recipient}
          message={notification.message}
        />
      ))}
    </div>
  );
}