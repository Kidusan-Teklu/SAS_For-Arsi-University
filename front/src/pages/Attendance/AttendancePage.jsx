import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './AttendancePage.css';

const API_URL = 'http://localhost:8000/api';

const AttendancePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markAttendanceData, setMarkAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    time_in: '',
    time_out: '',
    status: 'present'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      
      // If the user is a student or employee, fetch their attendance
      if (currentUser && (currentUser.role === 'student' || currentUser.role === 'employee')) {
        const response = await axios.get(`${API_URL}/attendance/user/${currentUser.id}/`);
        setAttendanceRecords(response.data);
      } 
      // If admin or instructor, fetch all attendance records
      else {
        const response = await axios.get(`${API_URL}/attendance/all/`);
        setAttendanceRecords(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load attendance data');
      setLoading(false);
      console.error('Attendance fetch error:', err);
    }
  };
  
  useEffect(() => {
    fetchAttendance();
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMarkAttendanceData({
      ...markAttendanceData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!markAttendanceData.date || !markAttendanceData.status) {
      setSubmitError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitSuccess(false);
      
      // Prepare attendance data
      const attendanceData = {
        ...markAttendanceData,
        user: currentUser.id
      };
      
      // Submit attendance
      await axios.post(`${API_URL}/attendance/mark/`, attendanceData);
      
      // Show success message
      setSubmitSuccess(true);
      
      // Reset form
      setMarkAttendanceData({
        date: new Date().toISOString().split('T')[0],
        time_in: '',
        time_out: '',
        status: 'present'
      });
      
      // Refresh attendance records
      fetchAttendance();
      
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Failed to mark attendance. Please try again.');
      setSubmitting(false);
      console.error('Attendance submit error:', err);
    }
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().substring(0, 8); // Format: HH:MM:SS
  };
  
  const handleQuickCheckIn = async () => {
    try {
      setSubmitting(true);
      
      // Prepare attendance data
      const attendanceData = {
        date: new Date().toISOString().split('T')[0],
        time_in: getCurrentTime(),
        status: 'present',
        user: currentUser.id
      };
      
      // Submit attendance
      await axios.post(`${API_URL}/attendance/mark/`, attendanceData);
      
      // Show success message
      setSubmitSuccess(true);
      
      // Refresh attendance records
      fetchAttendance();
      
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Failed to check in. Please try again.');
      setSubmitting(false);
      console.error('Check-in error:', err);
    }
  };
  
  const handleQuickCheckOut = async () => {
    try {
      setSubmitting(true);
      
      // Find today's attendance record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords.find(record => 
        record.date === today && record.user && record.user._id === currentUser.id
      );
      
      if (!todayRecord) {
        setSubmitError('No check-in record found for today. Please check in first.');
        setSubmitting(false);
        return;
      }
      
      // Prepare attendance data
      const attendanceData = {
        date: today,
        time_in: todayRecord.time_in,
        time_out: getCurrentTime(),
        status: 'present',
        user: currentUser.id
      };
      
      // Submit attendance
      await axios.post(`${API_URL}/attendance/mark/`, attendanceData);
      
      // Show success message
      setSubmitSuccess(true);
      
      // Refresh attendance records
      fetchAttendance();
      
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Failed to check out. Please try again.');
      setSubmitting(false);
      console.error('Check-out error:', err);
    }
  };
  
  return (
    <div>
      <Navigation />
      <div className="attendance-container">
        <h1>Attendance Management</h1>
        
        {(currentUser?.role === 'student' || currentUser?.role === 'employee') && (
          <div className="quick-actions">
            <button 
              className="quick-action-button check-in"
              onClick={handleQuickCheckIn}
              disabled={submitting}
            >
              Quick Check In
            </button>
            <button 
              className="quick-action-button check-out"
              onClick={handleQuickCheckOut}
              disabled={submitting}
            >
              Quick Check Out
            </button>
          </div>
        )}
        
        {(currentUser?.role === 'student' || currentUser?.role === 'employee') && (
          <div className="mark-attendance-section">
            <h2>Mark Attendance</h2>
            
            {submitSuccess && (
              <div className="success-message">Attendance marked successfully!</div>
            )}
            
            {submitError && (
              <div className="error-message">{submitError}</div>
            )}
            
            <form onSubmit={handleSubmit} className="attendance-form">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={markAttendanceData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time_in">Time In</label>
                <input
                  type="time"
                  id="time_in"
                  name="time_in"
                  value={markAttendanceData.time_in}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time_out">Time Out</label>
                <input
                  type="time"
                  id="time_out"
                  name="time_out"
                  value={markAttendanceData.time_out}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={markAttendanceData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Mark Attendance'}
              </button>
            </form>
          </div>
        )}
        
        <div className="attendance-records-section">
          <h2>Attendance Records</h2>
          
          {loading ? (
            <div className="loading">Loading attendance records...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : attendanceRecords.length > 0 ? (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {(currentUser?.role === 'instructor' || currentUser?.role === 'admin_official' || 
                      currentUser?.role === 'super_admin') && <th>User</th>}
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className={`status-${record.status}`}>
                      <td>{record.date}</td>
                      {(currentUser?.role === 'instructor' || currentUser?.role === 'admin_official' || 
                        currentUser?.role === 'super_admin') && (
                        <td>
                          {record.user && typeof record.user === 'object' 
                            ? record.user.name 
                            : 'Unknown'}
                        </td>
                      )}
                      <td>
                        <span className={`status-badge ${record.status}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td>{record.time_in || 'N/A'}</td>
                      <td>{record.time_out || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage; 