import React from 'react';
import './NotificationCard.css';

export default function NotificationCard({ recipient, message }) {
  return (
    <div className="notification-card">
      <h3>To: {recipient}</h3>
      <p>{message}</p>
    </div>
  );
}