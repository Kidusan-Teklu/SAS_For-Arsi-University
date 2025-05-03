import React from 'react';
import './ScheduleCard.css';

export default function ScheduleCard({ lecturer, room, dateTime }) {
  return (
    <div className="schedule-card">
      <h3>Lecturer: {lecturer}</h3>
      <p>Room: {room}</p>
      <p>Date & Time: {dateTime}</p>
    </div>
  );
}