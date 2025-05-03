import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';
import './ManageEmployeesPage.css';

const ManageEmployeesPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState('employees');

  // Mock data for employees
  const employees = [
    { id: 1, name: 'John Doe', position: 'Instructor', department: 'Computer Science', status: 'Active' },
    { id: 2, name: 'Jane Smith', position: 'Department Head', department: 'Mathematics', status: 'Active' },
    { id: 3, name: 'Robert Johnson', position: 'Employee', department: 'HR', status: 'On Leave' },
    { id: 4, name: 'Emily Davis', position: 'Instructor', department: 'Physics', status: 'Active' },
    { id: 5, name: 'Michael Wilson', position: 'Employee', department: 'Finance', status: 'Inactive' },
  ];

  // Mock data for attendance overview
  const attendanceData = {
    today: { present: 85, absent: 10, late: 5 },
    thisWeek: { present: 88, absent: 7, late: 5 },
    thisMonth: { present: 90, absent: 6, late: 4 }
  };

  return (
    <PageTemplate title="HR Management">
      <div className="hr-dashboard">
        <div className="hr-welcome">
          <h2>Welcome, {currentUser?.name}</h2>
          <p>Role: {currentUser?.role}</p>
        </div>

        <div className="hr-tabs">
          <button 
            className={`tab-btn ${selectedTab === 'employees' ? 'active' : ''}`}
            onClick={() => setSelectedTab('employees')}
          >
            Employees
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setSelectedTab('attendance')}
          >
            Attendance Overview
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'reports' ? 'active' : ''}`}
            onClick={() => setSelectedTab('reports')}
          >
            Reports
          </button>
        </div>

        {selectedTab === 'employees' && (
          <div className="hr-employees">
            <div className="employees-header">
              <h3>Employee Management</h3>
              <button className="add-employee-btn">Add New Employee</button>
            </div>
            
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>
                      <span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn">View</button>
                        <button className="edit-btn">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'attendance' && (
          <div className="hr-attendance">
            <h3>Attendance Overview</h3>
            
            <div className="attendance-stats">
              <div className="stat-card">
                <h4>Today</h4>
                <div className="attendance-chart">
                  <div className="chart-bar present" style={{ width: `${attendanceData.today.present}%` }}>
                    <span>{attendanceData.today.present}% Present</span>
                  </div>
                  <div className="chart-bar late" style={{ width: `${attendanceData.today.late}%` }}>
                    <span>{attendanceData.today.late}% Late</span>
                  </div>
                  <div className="chart-bar absent" style={{ width: `${attendanceData.today.absent}%` }}>
                    <span>{attendanceData.today.absent}% Absent</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>This Week</h4>
                <div className="attendance-chart">
                  <div className="chart-bar present" style={{ width: `${attendanceData.thisWeek.present}%` }}>
                    <span>{attendanceData.thisWeek.present}% Present</span>
                  </div>
                  <div className="chart-bar late" style={{ width: `${attendanceData.thisWeek.late}%` }}>
                    <span>{attendanceData.thisWeek.late}% Late</span>
                  </div>
                  <div className="chart-bar absent" style={{ width: `${attendanceData.thisWeek.absent}%` }}>
                    <span>{attendanceData.thisWeek.absent}% Absent</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <h4>This Month</h4>
                <div className="attendance-chart">
                  <div className="chart-bar present" style={{ width: `${attendanceData.thisMonth.present}%` }}>
                    <span>{attendanceData.thisMonth.present}% Present</span>
                  </div>
                  <div className="chart-bar late" style={{ width: `${attendanceData.thisMonth.late}%` }}>
                    <span>{attendanceData.thisMonth.late}% Late</span>
                  </div>
                  <div className="chart-bar absent" style={{ width: `${attendanceData.thisMonth.absent}%` }}>
                    <span>{attendanceData.thisMonth.absent}% Absent</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="attendance-actions">
              <button className="action-btn">View Detailed Report</button>
              <button className="action-btn">Download CSV</button>
              <button className="action-btn">Print Report</button>
            </div>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="hr-reports">
            <h3>HR Reports</h3>
            <p>Select a report type to generate:</p>
            
            <div className="report-types">
              <div className="report-card">
                <h4>Employee Attendance</h4>
                <p>View and analyze employee attendance patterns</p>
                <button className="generate-btn">Generate</button>
              </div>
              
              <div className="report-card">
                <h4>Department Performance</h4>
                <p>Compare attendance across departments</p>
                <button className="generate-btn">Generate</button>
              </div>
              
              <div className="report-card">
                <h4>Absence Analysis</h4>
                <p>Track and analyze absence patterns</p>
                <button className="generate-btn">Generate</button>
              </div>
              
              <div className="report-card">
                <h4>Custom Report</h4>
                <p>Generate a report with custom parameters</p>
                <button className="generate-btn">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};

export default ManageEmployeesPage; 