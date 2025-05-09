import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './ClassesPage.css';

const API_URL = 'http://localhost:8000/api';

const ClassesPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('classes');
  const [newSchedule, setNewSchedule] = useState({
    course: '',
    room: '',
    day: 'Monday',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (currentUser && currentUser.username) {
        try {
          await fetchClasses();
          await fetchSchedules();
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data. Please try again.');
        }
      } else {
        setError('User information not found. Please log in again.');
      }
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Fetching classes for instructor:', currentUser.username);
      const response = await axios.get(`${API_URL}/classes/instructor/${currentUser.username}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Classes response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setClasses(response.data);
        console.log('Set classes:', response.data.length);
      } else {
        console.error('Invalid classes response format:', response.data);
        setError('Failed to load classes: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'Failed to fetch classes');
      } else {
        setError('Failed to fetch classes. Please try again.');
      }
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Fetching schedules for instructor:', currentUser.username);
      const response = await axios.get(`${API_URL}/schedules/instructor/${currentUser.username}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Schedules response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setSchedules(response.data);
        console.log('Set schedules:', response.data.length);
      } else {
        console.error('Invalid schedules response format:', response.data);
        setError('Failed to load schedules: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'Failed to fetch schedules');
      } else {
        setError('Failed to fetch schedules. Please try again.');
      }
      throw err; // Re-throw to be caught by the parent try-catch
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Find the selected class to get its ID
      const selectedClass = classes.find(c => c.course_name === newSchedule.course);
      if (!selectedClass) {
        setError('Please select a valid course');
        return;
      }

      // Format the schedule data according to the backend's expectations
      const scheduleData = {
        class_id: selectedClass._id, // Use the class's _id
        instructor: currentUser.username,
        room: newSchedule.room,
        day: newSchedule.day,
        start_time: newSchedule.start_time + ':00', // Add seconds to match backend format
        end_time: newSchedule.end_time + ':00' // Add seconds to match backend format
      };

      console.log('Submitting schedule data:', scheduleData);

      const response = await axios.post(`${API_URL}/schedules/`, scheduleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Schedule created successfully:', response.data);
      await fetchSchedules();
      setNewSchedule({
        course: '',
        room: '',
        day: 'Monday',
        start_time: '',
        end_time: ''
      });
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating schedule:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'Failed to create schedule');
      } else {
        setError('Failed to create schedule. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a useEffect to log classes when they change
  useEffect(() => {
    console.log('Current classes:', classes);
  }, [classes]);

  // Update the course selection dropdown to show course code and name
  const renderCourseOptions = () => {
    if (!classes || classes.length === 0) {
      return <option value="">No courses available</option>;
    }
    return (
      <>
        <option value="">Select a Course</option>
        {classes.map((classItem) => (
          <option key={classItem._id} value={classItem.course_name}>
            {classItem.course_code} - {classItem.course_name}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="classes-page">
      <div className="classes-header">
        <h1>Class Management</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'classes' ? 'active' : ''} 
            onClick={() => setActiveTab('classes')}
          >
            My Classes
          </button>
          <button 
            className={activeTab === 'schedules' ? 'active' : ''} 
            onClick={() => setActiveTab('schedules')}
          >
            Schedule Management
          </button>
          <button 
            className={activeTab === 'attendance' ? 'active' : ''} 
            onClick={() => setActiveTab('attendance')}
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'classes' && (
        <div className="classes-section">
          <h2>My Classes</h2>
          {loading ? (
            <div className="loading">Loading classes...</div>
          ) : classes.length > 0 ? (
            <div className="classes-grid">
              {classes.map((classItem) => (
                <div key={classItem.id} className="class-card">
                  <h3>{classItem.course_name}</h3>
                  <p>Department: {classItem.department}</p>
                  <p>Students: {classItem.student_count}</p>
                  <button onClick={() => window.location.href = `/attendance?class=${classItem.id}`}>
                    Take Attendance
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No classes assigned yet.</p>
          )}
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="schedules-section">
          <h2>Schedule Management</h2>
          <form onSubmit={handleScheduleSubmit} className="schedule-form">
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <select
                id="course"
                name="course"
                value={newSchedule.course}
                onChange={handleInputChange}
                required
              >
                {renderCourseOptions()}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="room">Room</label>
              <input
                type="text"
                id="room"
                name="room"
                value={newSchedule.room}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="day">Day</label>
              <select
                id="day"
                name="day"
                value={newSchedule.day}
                onChange={handleInputChange}
                required
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={newSchedule.start_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={newSchedule.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Create Schedule</button>
          </form>

          <div className="schedules-list">
            <h3>Current Schedules</h3>
            {schedules.length > 0 ? (
              <div className="schedules-grid">
                {schedules.map((schedule) => {
                  // Find the class details for this schedule
                  const classDetails = classes.find(c => c._id === schedule.class_id);
                  return (
                    <div key={schedule._id} className="schedule-card">
                      <h4>{classDetails ? `${classDetails.course_code} - ${classDetails.course_name}` : 'Unknown Course'}</h4>
                      <p>Room: {schedule.room}</p>
                      <p>Day: {schedule.day}</p>
                      <p>Time: {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</p>
                      <p>Instructor: {schedule.instructor}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No schedules created yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="attendance-reports-section">
          <h2>Attendance Reports</h2>
          <div className="reports-filters">
            <select>
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.course_name}
                </option>
              ))}
            </select>
            <input type="date" />
            <button>Generate Report</button>
          </div>
          <div className="reports-content">
            <p>Select a class and date to view attendance reports.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage; 