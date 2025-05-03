import React from 'react';
import RolePage from '../../components/RolePage';

const ClassesPage = () => {
  const instructorFeatures = [
    {
      icon: '🎓',
      title: 'My Classes',
      description: 'View and manage all your assigned classes and student lists.',
      buttonText: 'View Classes'
    },
    {
      icon: '✓',
      title: 'Mark Attendance',
      description: 'Take attendance for your classes and record student presence/absence.',
      buttonText: 'Take Attendance'
    },
    {
      icon: '📊',
      title: 'Attendance Statistics',
      description: 'View attendance statistics and patterns for your classes.',
      buttonText: 'View Statistics'
    },
    {
      icon: '📝',
      title: 'Generate Reports',
      description: 'Create attendance reports for your classes and share with department.',
      buttonText: 'Generate Report'
    },
    {
      icon: '📅',
      title: 'My Schedule',
      description: 'View your teaching schedule, classes, and other academic activities.',
      buttonText: 'View Schedule'
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Create and send announcements to students in your classes.',
      buttonText: 'Send Announcement'
    }
  ];

  return (
    <RolePage 
      title="Instructor Dashboard"
      roleName="Instructor"
      features={instructorFeatures}
    />
  );
};

export default ClassesPage; 