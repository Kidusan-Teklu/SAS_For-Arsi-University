import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './Dashboard.css';
import { FaUserCheck, FaUserClock, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // If the user is a student or employee, fetch their attendance
        if (currentUser && (currentUser.role === 'student' || currentUser.role === 'employee')) {
          const response = await axios.get(`${API_URL}/attendance/user/${currentUser.id}/`);
          const attendanceData = response.data;
          
          // Calculate stats
          const totalAttendance = attendanceData.length;
          const presentCount = attendanceData.filter(a => a.status === 'present').length;
          const absentCount = attendanceData.filter(a => a.status === 'absent').length;
          const lateCount = attendanceData.filter(a => a.status === 'late').length;
          
          setStats({
            totalAttendance,
            presentCount,
            absentCount,
            lateCount,
          });
          
          // Get most recent 5 attendance records
          const sorted = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
          setRecentAttendance(sorted);
        } 
        // If admin or instructor, fetch all attendance records
        else {
          const response = await axios.get(`${API_URL}/attendance/all/`);
          const attendanceData = response.data;
          
          // Calculate stats
          const totalAttendance = attendanceData.length;
          const presentCount = attendanceData.filter(a => a.status === 'present').length;
          const absentCount = attendanceData.filter(a => a.status === 'absent').length;
          const lateCount = attendanceData.filter(a => a.status === 'late').length;
          
          setStats({
            totalAttendance,
            presentCount,
            absentCount,
            lateCount,
          });
          
          // Get most recent 5 attendance records
          const sorted = [...attendanceData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
          setRecentAttendance(sorted);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error('Dashboard error:', err);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="dashboard-container">
          <div className="loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <Navigation />
        <div className="dashboard-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navigation />
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome, {currentUser?.name || 'User'}!</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Total Attendance</h3>
              <p className="stat-value">{stats.totalAttendance}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon present">
              <FaUserCheck />
            </div>
            <div className="stat-content">
              <h3>Present</h3>
              <p className="stat-value">{stats.presentCount}</p>
              <p className="stat-percentage">
                {stats.totalAttendance > 0 
                  ? `${Math.round((stats.presentCount / stats.totalAttendance) * 100)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon absent">
              <FaUserClock />
            </div>
            <div className="stat-content">
              <h3>Absent</h3>
              <p className="stat-value">{stats.absentCount}</p>
              <p className="stat-percentage">
                {stats.totalAttendance > 0 
                  ? `${Math.round((stats.absentCount / stats.totalAttendance) * 100)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon late">
              <FaCalendarCheck />
            </div>
            <div className="stat-content">
              <h3>Late</h3>
              <p className="stat-value">{stats.lateCount}</p>
              <p className="stat-percentage">
                {stats.totalAttendance > 0 
                  ? `${Math.round((stats.lateCount / stats.totalAttendance) * 100)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Attendance</h2>
          
          {recentAttendance.length > 0 ? (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((attendance, index) => (
                    <tr key={index} className={`status-${attendance.status}`}>
                      <td>{attendance.date}</td>
                      <td>
                        <span className={`status-badge ${attendance.status}`}>
                          {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </span>
                      </td>
                      <td>{attendance.time_in || 'N/A'}</td>
                      <td>{attendance.time_out || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No recent attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 