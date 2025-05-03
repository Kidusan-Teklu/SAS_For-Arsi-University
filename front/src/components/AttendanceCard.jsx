import React from 'react';
import './AttendanceCard.css';

export default function AttendanceCard({ userId, date, status }) {
  return (
    <div className="attendance-card">
      <h3>{userId}</h3>
      <p>Date: {date}</p>
      <p>Status: {status}</p>
    </div>
  );
}