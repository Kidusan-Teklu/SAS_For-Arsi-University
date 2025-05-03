import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation/Navigation';
import './ReportsPage.css';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Simulate loading reports data
    const timer = setTimeout(() => {
      setReports([
        { id: 1, title: 'Monthly Attendance Summary', date: '2025-05-01', type: 'Attendance' },
        { id: 2, title: 'Department Performance', date: '2025-05-02', type: 'Performance' },
        { id: 3, title: 'Absenteeism Analysis', date: '2025-05-03', type: 'Attendance' },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="reports-page">
      <Navigation />
      
      <div className="reports-container">
        <h1>Reports</h1>
        
        <div className="reports-section">
          <h2>Available Reports</h2>
          
          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length > 0 ? (
            <div className="reports-list">
              {reports.map(report => (
                <div key={report.id} className="report-card">
                  <h3>{report.title}</h3>
                  <p>Date: {report.date}</p>
                  <p>Type: {report.type}</p>
                  <button className="view-report-button">View Report</button>
                  <button className="download-report-button">Download</button>
                </div>
              ))}
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