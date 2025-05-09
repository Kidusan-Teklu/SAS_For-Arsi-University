import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navigation from '../../components/Navigation/Navigation';
import { FaDownload, FaPrint, FaFilter, FaChartBar, FaCalendarAlt, FaUsers, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './ReportsPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_URL = 'http://localhost:8000/api';

const ReportsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    type: 'all'
  });

  // Mock data for demonstration
  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business',
    'Economics'
  ];

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Summary', icon: <FaCalendarAlt /> },
    { id: 'department', name: 'Department Performance', icon: <FaBuilding /> },
    { id: 'student', name: 'Student Attendance', icon: <FaUsers /> },
    { id: 'employee', name: 'Employee Attendance', icon: <FaUsers /> },
    { id: 'analytics', name: 'Attendance Analytics', icon: <FaChartBar /> }
  ];

  // Add new state for charts
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch attendance data from the API
      const response = await axios.get(`${API_URL}/attendance/all/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          date_from: filters.startDate,
          date_to: filters.endDate,
          department: filters.department || undefined
        }
      });

      // Process the attendance data into reports
      const attendanceData = response.data;
      
      // Generate different types of reports based on the data
      const generatedReports = [
        {
          id: 1,
          title: 'Monthly Attendance Summary',
          date: new Date().toISOString().split('T')[0],
          type: 'attendance',
          department: filters.department || 'All',
          data: generateAttendanceSummary(attendanceData)
        },
        {
          id: 2,
          title: 'Department Performance Report',
          date: new Date().toISOString().split('T')[0],
          type: 'department',
          department: 'All',
          data: generateDepartmentPerformance(attendanceData)
        },
        {
          id: 3,
          title: 'Student Attendance Analysis',
          date: new Date().toISOString().split('T')[0],
          type: 'student',
          department: 'All',
          data: generateStudentAnalysis(attendanceData)
        }
      ];

      setReports(generatedReports);
      setLoading(false);

      // Generate chart data
      const chartData = generateChartData(attendanceData);
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const generateAttendanceSummary = (attendanceData) => {
    const total = attendanceData.length;
    const present = attendanceData.filter(record => record.status === 'completed').length;
    const absent = attendanceData.filter(record => record.status === 'absent').length;
    const late = attendanceData.filter(record => record.status === 'late').length;

    return {
      present,
      absent,
      late,
      total
    };
  };

  const generateDepartmentPerformance = (attendanceData) => {
    const departmentStats = {};
    
    attendanceData.forEach(record => {
      const dept = record.user.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          total: 0,
          present: 0
        };
      }
      
      departmentStats[dept].total++;
      if (record.status === 'completed') {
        departmentStats[dept].present++;
      }
    });

    return {
      departments: Object.entries(departmentStats).map(([name, stats]) => ({
        name,
        attendance: Math.round((stats.present / stats.total) * 100)
      }))
    };
  };

  const generateStudentAnalysis = (attendanceData) => {
    const studentStats = {};
    
    attendanceData.forEach(record => {
      if (record.user.department) {
        if (!studentStats[record.user.department]) {
          studentStats[record.user.department] = {
            total: 0,
            present: 0
          };
        }
        
        studentStats[record.user.department].total++;
        if (record.status === 'completed') {
          studentStats[record.user.department].present++;
        }
      }
    });

    const departments = Object.entries(studentStats)
      .map(([dept, stats]) => ({
        department: dept,
        attendance: Math.round((stats.present / stats.total) * 100)
      }))
      .sort((a, b) => b.attendance - a.attendance);

    return {
      totalStudents: attendanceData.length,
      averageAttendance: Math.round(
        departments.reduce((acc, curr) => acc + curr.attendance, 0) / departments.length
      ),
      topPerforming: departments.slice(0, 3).map(d => d.department)
    };
  };

  const generateChartData = (attendanceData) => {
    // Attendance Summary Chart (Pie Chart)
    const summaryData = generateAttendanceSummary(attendanceData);
    const summaryChartData = {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [
        {
          data: [summaryData.present, summaryData.absent, summaryData.late],
          backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
          borderColor: ['#388E3C', '#D32F2F', '#FFA000'],
          borderWidth: 1,
        },
      ],
    };

    // Department Performance Chart (Bar Chart)
    const deptData = generateDepartmentPerformance(attendanceData);
    const deptChartData = {
      labels: deptData.departments.map(dept => dept.name),
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: deptData.departments.map(dept => dept.attendance),
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          borderWidth: 1,
        },
      ],
    };

    // Student Attendance Trend (Line Chart)
    const trendData = generateAttendanceTrend(attendanceData);
    const trendChartData = {
      labels: trendData.dates,
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: trendData.rates,
          borderColor: '#9C27B0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return {
      summary: summaryChartData,
      department: deptChartData,
      trend: trendChartData,
    };
  };

  const generateAttendanceTrend = (attendanceData) => {
    // Group attendance by date
    const attendanceByDate = {};
    attendanceData.forEach(record => {
      const date = record.date;
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {
          total: 0,
          present: 0,
        };
      }
      attendanceByDate[date].total++;
      if (record.status === 'completed') {
        attendanceByDate[date].present++;
      }
    });

    // Calculate attendance rates
    const dates = Object.keys(attendanceByDate).sort();
    const rates = dates.map(date => {
      const stats = attendanceByDate[date];
      return Math.round((stats.present / stats.total) * 100);
    });

    return {
      dates,
      rates,
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = () => {
    fetchReports();
    setShowCharts(true);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Create a CSV string from the report data
      let csvContent = '';
      
      switch (report.type) {
        case 'attendance':
          csvContent = `Attendance Summary\n\n`;
          csvContent += `Total,Present,Absent,Late\n`;
          csvContent += `${report.data.total},${report.data.present},${report.data.absent},${report.data.late}\n`;
          break;
          
        case 'department':
          csvContent = `Department Performance\n\n`;
          csvContent += `Department,Attendance Rate\n`;
          report.data.departments.forEach(dept => {
            csvContent += `${dept.name},${dept.attendance}%\n`;
          });
          break;
          
        case 'student':
          csvContent = `Student Attendance Analysis\n\n`;
          csvContent += `Total Students,${report.data.totalStudents}\n`;
          csvContent += `Average Attendance,${report.data.averageAttendance}%\n`;
          csvContent += `Top Performing Departments\n`;
          report.data.topPerforming.forEach(dept => {
            csvContent += `${dept}\n`;
          });
          break;
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.title}_${report.date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handlePrintReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Create a printable version of the report
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>${report.title}</h1>
          <p>Date: ${report.date}</p>
          <p>Department: ${report.department}</p>
          <div id="report-content"></div>
        </body>
      </html>
    `);

    // Add report-specific content
    const contentDiv = printWindow.document.getElementById('report-content');
    switch (report.type) {
      case 'attendance':
        contentDiv.innerHTML = `
          <table>
            <tr><th>Metric</th><th>Count</th></tr>
            <tr><td>Total</td><td>${report.data.total}</td></tr>
            <tr><td>Present</td><td>${report.data.present}</td></tr>
            <tr><td>Absent</td><td>${report.data.absent}</td></tr>
            <tr><td>Late</td><td>${report.data.late}</td></tr>
          </table>
        `;
        break;
        
      case 'department':
        contentDiv.innerHTML = `
          <table>
            <tr><th>Department</th><th>Attendance Rate</th></tr>
            ${report.data.departments.map(dept => `
              <tr>
                <td>${dept.name}</td>
                <td>${dept.attendance}%</td>
              </tr>
            `).join('')}
          </table>
        `;
        break;
        
      case 'student':
        contentDiv.innerHTML = `
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Students</td><td>${report.data.totalStudents}</td></tr>
            <tr><td>Average Attendance</td><td>${report.data.averageAttendance}%</td></tr>
          </table>
          <h3>Top Performing Departments</h3>
          <ul>
            ${report.data.topPerforming.map(dept => `<li>${dept}</li>`).join('')}
          </ul>
        `;
        break;
    }

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="reports-page">
      <Navigation />
      
      <div className="reports-container">
        <h1>Reports & Analytics</h1>
        
        <div className="reports-filters">
          <div className="filter-group">
            <label>
              <FaCalendarAlt /> Start Date
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              <FaCalendarAlt /> End Date
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              <FaBuilding /> Department
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
            <label>
              <FaFilter /> Report Type
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="all">All Reports</option>
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="generate-btn" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>

        {showCharts && chartData && (
          <div className="charts-section">
            <h2>Visual Analytics</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Attendance Summary</h3>
                <div className="chart-container">
                  <Pie
                    data={chartData.summary}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        title: {
                          display: true,
                          text: 'Overall Attendance Distribution',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3>Department Performance</h3>
                <div className="chart-container">
                  <Bar
                    data={chartData.department}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: 'Department-wise Attendance Rates',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Attendance Rate (%)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3>Attendance Trend</h3>
                <div className="chart-container">
                  <Line
                    data={chartData.trend}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: 'Attendance Rate Over Time',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Attendance Rate (%)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="reports-grid">
          {reportTypes.map(type => (
            <div key={type.id} className="report-type-card">
              <div className="report-icon">{type.icon}</div>
              <h3>{type.name}</h3>
              <p>Generate detailed {type.name.toLowerCase()} reports</p>
              <button 
                className="view-btn"
                onClick={() => setSelectedReport(type.id)}
              >
                View Reports
              </button>
            </div>
          ))}
        </div>

        <div className="reports-list">
          <h2>Recent Reports</h2>
          
          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length > 0 ? (
            <div className="reports-table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
              {reports.map(report => (
                    <tr key={report.id}>
                      <td>{report.title}</td>
                      <td>{report.date}</td>
                      <td>{report.type}</td>
                      <td>{report.department}</td>
                      <td className="action-buttons">
                        <button 
                          className="action-btn download"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <FaDownload /> Download
                        </button>
                        <button 
                          className="action-btn print"
                          onClick={() => handlePrintReport(report.id)}
                        >
                          <FaPrint /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">No reports available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 