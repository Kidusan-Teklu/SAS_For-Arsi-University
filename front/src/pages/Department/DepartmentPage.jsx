import React from 'react';
import RolePage from '../../components/RolePage';

const DepartmentPage = () => {
  const departmentFeatures = [
    {
      icon: '👥',
      title: 'Department Staff',
      description: 'View and manage all staff in your department including instructors and employees.',
      buttonText: 'Manage Staff'
    },
    {
      icon: '📅',
      title: 'Schedule Management',
      description: 'Create and manage teaching schedules, meetings, and department events.',
      buttonText: 'View Schedules'
    },
    {
      icon: '📊',
      title: 'Attendance Overview',
      description: 'Monitor attendance rates and patterns for your department staff and students.',
      buttonText: 'View Attendance'
    },
    {
      icon: '📝',
      title: 'Department Reports',
      description: 'Generate comprehensive reports on performance, attendance, and other metrics.',
      buttonText: 'Generate Reports'
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Create and send announcements to all department staff and students.',
      buttonText: 'Create Announcement'
    },
    {
      icon: '⚙️',
      title: 'Department Settings',
      description: 'Configure department rules, policies, and other administrative settings.',
      buttonText: 'Configure'
    }
  ];

  return (
    <RolePage 
      title="Department Management"
      roleName="Department Head"
      features={departmentFeatures}
    />
  );
};

export default DepartmentPage; 