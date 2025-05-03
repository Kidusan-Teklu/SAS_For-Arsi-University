import React from 'react';
import './ReportCard.css';

export default function ReportCard({ title, description, date }) {
  return (
    <div className="report-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <p>Date: {date}</p>
    </div>
  );
}