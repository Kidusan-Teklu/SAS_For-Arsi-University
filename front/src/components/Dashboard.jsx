import React from 'react';
import './Dashboard.css';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>Select a section from the navigation bar to get started.</p>
      </main>
      <Footer />
    </div>
  );
}