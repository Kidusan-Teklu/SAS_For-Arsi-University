import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaBell, FaLock, FaClock, FaChartBar } from 'react-icons/fa';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="overlay">
          <h1>Arsi University Smart Attendance System</h1>
          <p>Modern attendance tracking with facial recognition and biometric systems</p>
          <Link to="/login">
            <button className="cta-button">Get Started</button>
          </Link>
        </div>
      </header>

      <section className="features-section">
        <h2>Why Choose Our System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>AI-Powered</h3>
            <p>Facial recognition for students and biometric verification for employees.</p>
          </div>
          <div className="feature-card">
            <FaBell className="feature-icon" />
            <h3>Real-Time Notifications</h3>
            <p>Instant alerts for attendance events and important updates.</p>
          </div>
          <div className="feature-card">
            <FaLock className="feature-icon" />
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security for all your sensitive data.</p>
          </div>
          <div className="feature-card">
            <FaClock className="feature-icon" />
            <h3>Time-Saving</h3>
            <p>Automated processes save hours of manual attendance recording.</p>
          </div>
          <div className="feature-card">
            <FaChartBar className="feature-icon" />
            <h3>Comprehensive Reports</h3>
            <p>Detailed analytics and attendance pattern reports.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>About Arsi University</h2>
        <p>
          Arsi University is committed to implementing innovative solutions to enhance 
          educational administration. Our Smart Attendance System represents our dedication 
          to leveraging technology for improved efficiency and student success.
        </p>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Arsi University Smart Attendance System. All rights reserved.</p>
      </footer>
    </div>
  );
}
