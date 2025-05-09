import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaBell, FaLock, FaClock, FaChartBar, FaUniversity, FaGraduationCap, FaUsers, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="overlay">
          <div className="header-content">
            <h1>Arsi University Smart Attendance System</h1>
            <p>Revolutionizing attendance management with cutting-edge technology</p>
            <div className="cta-buttons">
              <Link to="/login">
                <button className="cta-button primary">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2>Why Choose Our System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>AI-Powered</h3>
            <p>Advanced facial recognition for students and biometric verification for employees.</p>
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

      <section className="stats-section">
        <div className="stats-wrapper">
          <div className="stats-container">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <h3>5,000+</h3>
              <p>Active Students</p>
            </div>
            <div className="stat-item">
              <FaUniversity className="stat-icon" />
              <h3>8</h3>
              <p>Academic Colleges</p>
            </div>
            <div className="stat-item">
              <FaGraduationCap className="stat-icon" />
              <h3>98%</h3>
              <p>Attendance Rate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>About Arsi University</h2>
          <p>
            Arsi University is committed to implementing innovative solutions to enhance 
            educational administration. Our Smart Attendance System represents our dedication 
            to leveraging technology for improved efficiency and student success.
          </p>
          <div className="about-features">
            <div className="about-feature">
              <h4>Innovation</h4>
              <p>Leading the way in educational technology</p>
            </div>
            <div className="about-feature">
              <h4>Excellence</h4>
              <p>Committed to academic and administrative excellence</p>
            </div>
            <div className="about-feature">
              <h4>Community</h4>
              <p>Building a connected university community</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-wrapper">
          <div className="cta-content">
            <h2>Transform Your Attendance Management</h2>
            <p>Experience the future of attendance tracking with our advanced biometric system</p>
            <Link to="/login">
              <button className="cta-button primary">Get Started Now</button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-wrapper">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: info@arsiuniversity.edu.et</p>
              <p>Phone: +251 954 710 882</p>
              <p>Address: Asella, Oromia, Ethiopia</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <Link to="/login">Login</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="footer-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://facebook.com/arsiuniversity" target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="social-icon" />
                </a>
                <a href="https://twitter.com/arsiuniversity" target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="social-icon" />
                </a>
                <a href="https://linkedin.com/school/arsi-university" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Arsi University Smart Attendance System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
