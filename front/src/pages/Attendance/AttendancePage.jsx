import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './AttendancePage.css';

const API_URL = 'http://localhost:8000/api';

const AttendancePage = () => {
  const { currentUser, token } = useContext(AuthContext);
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
      setError('');
      
      // Check if token exists
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      let response;
      let endpoint;
      
      // If the user is a student or employee, fetch their attendance
      if (currentUser && (currentUser.role === 'student' || currentUser.role === 'employee')) {
        endpoint = `${API_URL}/attendance/user/${currentUser.id}/`;
        console.log('Fetching attendance for user:', currentUser.id);
      } 
      // If instructor, fetch attendance records for students in their department
      else if (currentUser && currentUser.role === 'instructor') {
        endpoint = `${API_URL}/attendance/all/`;
        console.log('Fetching attendance for instructor department:', currentUser.department);
      }
      // If admin, fetch all attendance records
      else {
        endpoint = `${API_URL}/attendance/all/`;
        console.log('Fetching all attendance records');
      }
      
      // Add department parameter for instructor
      if (currentUser?.role === 'instructor') {
        response = await axios.get(endpoint, {
          params: {
            department: currentUser.department
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      console.log('Attendance response:', response.data);
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setAttendanceRecords(response.data);
          console.log('Set attendance records:', response.data.length);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
          setAttendanceRecords([]);
        }
      } else {
        console.log('No attendance data received');
        setAttendanceRecords([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Attendance fetch error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          setError(err.response.data.error || 'Failed to load attendance data. Please try again.');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', err.message);
        setError('Failed to load attendance data. Please try again.');
      }
      setAttendanceRecords([]);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentUser && token) {
      fetchAttendance();
    }
  }, [currentUser, token]);
  
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
      setSubmitError('');
      setSubmitSuccess(false);
      
      const attendanceData = {
        date: new Date().toISOString().split('T')[0],
        time_in: getCurrentTime(),
        status: 'present',
        user: currentUser.id
      };
      
      await axios.post(`${API_URL}/attendance/mark/`, attendanceData);
      
      setSubmitSuccess(true);
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
      setSubmitError('');
      setSubmitSuccess(false);
      
      const attendanceData = {
        date: new Date().toISOString().split('T')[0],
        time_out: getCurrentTime(),
        status: 'present',
        user: currentUser.id
      };
      
      await axios.post(`${API_URL}/attendance/mark/`, attendanceData);
      
      setSubmitSuccess(true);
      fetchAttendance();
      setSubmitting(false);
    } catch (err) {
      setSubmitError('Failed to check out. Please try again.');
      setSubmitting(false);
      console.error('Check-out error:', err);
    }
  };
  
  return (
    <div className="page-container">
      <Navigation />
      <div className="main-content">
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
    </div>
  );
};

export default AttendancePage; 