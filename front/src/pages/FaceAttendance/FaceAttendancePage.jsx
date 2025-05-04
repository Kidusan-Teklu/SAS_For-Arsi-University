import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import FaceCapture from '../../components/FaceCapture/FaceCapture';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './FaceAttendancePage.css';

const API_URL = 'http://localhost:8000/api';

export default function FaceAttendancePage() {
  const { currentUser } = useContext(AuthContext);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // Handle image capture from webcam
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setVerificationStatus('');
    setErrorMessage('');
    setAttendanceMarked(false);
  };

  // Verify captured face and mark attendance
  const verifyAndMarkAttendance = async () => {
    if (!capturedImage) {
      setErrorMessage('Please capture an image first');
      return;
    }

    setIsProcessing(true);
    setVerificationStatus('Verifying your identity...');

    // For test users, simulate successful verification after a delay
    if (currentUser.email.startsWith('test.') && currentUser.email.endsWith('@example.com')) {
      setTimeout(() => {
        // Random confidence score between 70% and 99%
        const confidenceScore = Math.floor(Math.random() * 30) + 70;
        setVerificationStatus(`Identity verified successfully! (${confidenceScore}% confidence)`);
        
        setTimeout(() => {
          setVerificationStatus('Marking attendance...');
          
          setTimeout(() => {
            setVerificationStatus('Attendance marked successfully!');
            setAttendanceMarked(true);
            setIsProcessing(false);
          }, 1000);
        }, 1000);
      }, 2000);
      
      return;
    }

    try {
      // Step 1: Send captured image for verification
      const verificationResponse = await axios.post(`${API_URL}/recognition/verify/`, {
        user_id: currentUser.id,
        image_data: capturedImage
      });

      const result = verificationResponse.data;
      if (result.verified) {
        setVerificationStatus(`Identity verified successfully! (${result.confidence}% confidence)`);
        
        // Step 2: Mark attendance
        try {
          const attendanceResponse = await axios.post(`${API_URL}/attendance/mark/`, {
            user: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            time_in: new Date().toTimeString().split(' ')[0],
            status: 'present'
          });
          
          setVerificationStatus('Attendance marked successfully!');
          setAttendanceMarked(true);
        } catch (attendanceError) {
          console.error('Error marking attendance:', attendanceError);
          setErrorMessage('Verification successful, but failed to mark attendance.');
        }
      } else {
        if (result.error) {
          setVerificationStatus(`Verification failed: ${result.error}`);
        } else {
          setVerificationStatus(`Identity verification failed (${result.confidence}% confidence). Please try again.`);
        }
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setErrorMessage('Error during verification. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset captured image and status
  const resetCapture = () => {
    setCapturedImage(null);
    setVerificationStatus('');
    setErrorMessage('');
    setAttendanceMarked(false);
  };

  // Toggle the information panel
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div>
      <Navigation />
      <div className="face-attendance-container">
        <h1>Face Recognition Attendance</h1>
        
        <div className="method-tabs">
          <div className="tab active">Manual Check-in</div>
          <Link to="/automatic-attendance" className="tab-link">
            <div className="tab">Automatic Check-in Logs</div>
          </Link>
        </div>
        
        <div className="info-banner">
          <div className="info-header" onClick={toggleInfo}>
            <span className="info-icon">ℹ️</span>
            <span>About the Face Recognition System</span>
            <span className={`toggle-icon ${showInfo ? 'open' : ''}`}>▼</span>
          </div>
          
          {showInfo && (
            <div className="info-content">
              <p>The Smart Attendance System uses facial recognition technology to streamline attendance tracking at Arsi University.</p>
              
              <h3>Two Ways to Mark Attendance:</h3>
              <ol>
                <li>
                  <strong>Manual Check-in (Current Page):</strong> Use your device's camera to capture your face and mark attendance manually.
                </li>
                <li>
                  <strong>Automatic Check-in:</strong> Classroom security cameras automatically detect and recognize students, marking attendance without any student action required. <Link to="/automatic-attendance" className="view-logs-link">View your detection logs</Link>
                </li>
              </ol>
              
              <h3>How It Works:</h3>
              <ol>
                <li>Security cameras capture video footage of students in classrooms</li>
                <li>Advanced AI algorithms detect and identify faces</li>
                <li>The system compares detected faces with registered student profiles</li>
                <li>Attendance is automatically marked for recognized students</li>
                <li>Students receive real-time notifications of their attendance status</li>
              </ol>
              
              <p className="note">Note: For the automatic system to work, you must upload clear images of your face in your profile page.</p>
            </div>
          )}
        </div>
        
        <p className="attendance-info">
          Use your camera to mark your attendance using facial recognition.
          Make sure you're in a well-lit area and looking directly at the camera.
        </p>

        {!capturedImage ? (
          <div className="camera-section">
            <FaceCapture onImageCapture={handleImageCapture} />
          </div>
        ) : (
          <div className="verification-section">
            <div className="captured-image-container">
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="captured-image" 
              />
            </div>
            
            <div className="action-buttons">
              <button 
                className="verify-button"
                onClick={verifyAndMarkAttendance}
                disabled={isProcessing || attendanceMarked}
              >
                {isProcessing ? 'Processing...' : 'Verify & Mark Attendance'}
              </button>
              
              <button 
                className="retake-button"
                onClick={resetCapture}
                disabled={isProcessing}
              >
                Retake
              </button>
            </div>
            
            {verificationStatus && (
              <div className={`verification-status ${attendanceMarked ? 'success' : ''}`}>
                {verificationStatus}
              </div>
            )}
            
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            {attendanceMarked && (
              <div className="success-details">
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Time: {new Date().toLocaleTimeString()}</p>
                <p>Status: Present</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 