import React from 'react';
import './AttendanceTable.css';

interface Attendance {
  id: string;
  date: string;
  time_in?: string;
  time_out?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface AttendanceTableProps {
  attendances: Attendance[];
  loading: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendances, loading }) => {
  if (loading) {
    return <div className="loading">Loading attendance data...</div>;
  }

  if (attendances.length === 0) {
    return <div className="no-data">No attendance records found.</div>;
  }

  return (
    <div className="attendance-table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.time_in || '-'}</td>
              <td>{record.time_out || '-'}</td>
              <td>
                <span className={`status-badge ${record.status}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
