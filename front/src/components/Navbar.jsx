import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">SAS</div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/attendance">Attendance</a></li>
        <li><a href="/reports">Reports</a></li>
        <li><a href="/notifications">Notifications</a></li>
      </ul>
    </nav>
  );
}