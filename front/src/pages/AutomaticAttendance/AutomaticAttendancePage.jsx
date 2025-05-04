import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './AutomaticAttendancePage.css';

const API_URL = 'http://localhost:8000/api';

export default function AutomaticAttendancePage() {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [cameraLogs, setCameraLogs] = useState([]);
  const [activeCamera, setActiveCamera] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  useEffect(() => {
    // Simulate loading camera logs
    const loadCameraLogs = async () => {
      setLoading(true);
      
      // For test users, simulate API response with mock data
      if (currentUser && currentUser.email && 
          currentUser.email.startsWith('test.') && 
          currentUser.email.endsWith('@example.com')) {
        
        // Generate mock camera logs
        const mockLogs = generateMockCameraLogs();
        
        // Simulate loading delay
        setTimeout(() => {
          setCameraLogs(mockLogs);
          setLoading(false);
        }, 1500);
        
        return;
      }
      
      // For real implementation, fetch from API
      try {
        const response = await axios.get(`${API_URL}/attendance/camera-logs/`);
        setCameraLogs(response.data);
      } catch (error) {
        console.error('Error fetching camera logs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCameraLogs();
  }, [currentUser]);
  
  // Generate mock camera logs for test users
  const generateMockCameraLogs = () => {
    const campusLocations = [
      { id: 'cam1', name: 'Computer Science Building - Room 101' },
      { id: 'cam2', name: 'Computer Science Building - Room 203' },
      { id: 'cam3', name: 'Library - Study Area 2' },
      { id: 'cam4', name: 'Student Center - Main Hall' },
      { id: 'cam5', name: 'Engineering Building - Lab 3' }
    ];
    
    const currentDate = new Date();
    const logs = [];
    
    // Generate logs for the past 7 days
    for (let i = 0; i < 7; i++) {
      const logDate = new Date();
      logDate.setDate(currentDate.getDate() - i);
      
      // Add 2-3 camera detections for each day
      const detectionsCount = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < detectionsCount; j++) {
        const location = campusLocations[Math.floor(Math.random() * campusLocations.length)];
        
        // Random hour between 8 AM and 5 PM
        const hour = Math.floor(Math.random() * 9) + 8;
        const minute = Math.floor(Math.random() * 60);
        
        logDate.setHours(hour, minute, 0);
        
        logs.push({
          id: `log-${i}-${j}`,
          cameraId: location.id,
          location: location.name,
          timestamp: new Date(logDate),
          status: Math.random() > 0.1 ? 'present' : 'uncertain',
          confidenceScore: Math.random() > 0.1 ? (Math.random() * 20 + 80).toFixed(1) : (Math.random() * 30 + 50).toFixed(1)
        });
      }
    }
    
    // Sort logs by timestamp descending (most recent first)
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  // Filter logs based on active camera and date
  const getFilteredLogs = () => {
    return cameraLogs.filter(log => {
      const matchesCamera = activeCamera === 'all' || log.cameraId === activeCamera;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp).toDateString();
        const filterDate = new Date();
        
        if (dateFilter === 'today') {
          matchesDate = logDate === filterDate.toDateString();
        } else if (dateFilter === 'yesterday') {
          filterDate.setDate(filterDate.getDate() - 1);
          matchesDate = logDate === filterDate.toDateString();
        } else if (dateFilter === 'thisWeek') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = new Date(log.timestamp) >= weekAgo;
        }
      }
      
      return matchesCamera && matchesDate;
    });
  };
  
  // Get unique camera locations for filter
  const getCameraLocations = () => {
    const locations = new Map();
    
    cameraLogs.forEach(log => {
      if (!locations.has(log.cameraId)) {
        locations.set(log.cameraId, log.location);
      }
    });
    
    return Array.from(locations).map(([id, name]) => ({ id, name }));
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const filteredLogs = getFilteredLogs();
  const cameraLocations = getCameraLocations();
  
  return (
    <div>
      <Navigation />
      <div className="automatic-attendance-container">
        <h1>Automatic Attendance Tracking</h1>
        
        <div className="info-card">
          <h2>About Automatic Facial Recognition</h2>
          <p>
            This page shows a log of when you were detected by the university's classroom cameras.
            The system uses advanced facial recognition to automatically mark your attendance when
            you're present in classrooms, libraries, and other campus facilities.
          </p>
          <div className="info-stats">
            <div className="stat">
              <span className="stat-value">{cameraLogs.length}</span>
              <span className="stat-label">Total Detections</span>
            </div>
            <div className="stat">
              <span className="stat-value">{cameraLocations.length}</span>
              <span className="stat-label">Unique Locations</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {cameraLogs.filter(log => log.status === 'present').length}
              </span>
              <span className="stat-label">Successful Recognitions</span>
            </div>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filter-group">
            <label>Location:</label>
            <select 
              value={activeCamera} 
              onChange={(e) => setActiveCamera(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Locations</option>
              {cameraLocations.map(camera => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Time Period:</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
            </select>
          </div>
        </div>
        
        <div className="attendance-logs">
          <h2>Detection Logs</h2>
          
          {loading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Loading camera logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className={log.status === 'uncertain' ? 'uncertain-row' : ''}>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>{formatTime(log.timestamp)}</td>
                      <td>{log.location}</td>
                      <td>
                        <span className={`status-badge ${log.status}`}>
                          {log.status === 'present' ? 'Recognized' : 'Uncertain'}
                        </span>
                      </td>
                      <td>
                        <div className="confidence-meter">
                          <div 
                            className="confidence-bar" 
                            style={{ 
                              width: `${log.confidenceScore}%`,
                              backgroundColor: log.status === 'present' ? '#27ae60' : '#f39c12'
                            }}
                          ></div>
                          <span className="confidence-value">{log.confidenceScore}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-logs-message">
              <p>No detection logs found for the selected filters.</p>
            </div>
          )}
        </div>
        
        <div className="note-container">
          <p>
            <strong>Note:</strong> "Uncertain" detections may occur when the system cannot verify your identity
            with high confidence, such as in poor lighting conditions or when your face is partially obscured. 
            These do not count as attendance.
          </p>
          <p>
            To improve recognition accuracy, please upload clear frontal face photos in your profile.
          </p>
        </div>
      </div>
    </div>
  );
} 