import React from 'react';
import RolePage from '../../components/RolePage';

const AdministrationPage = () => {
  const adminFeatures = [
    {
      icon: '📢',
      title: 'Campus Announcements',
      description: 'Create and manage announcements for the entire university.',
      buttonText: 'Create Announcement'
    },
    {
      icon: '🏢',
      title: 'Facility Management',
      description: 'Manage university facilities, rooms, and resources.',
      buttonText: 'Manage Facilities'
    },
    {
      icon: '📅',
      title: 'Event Calendar',
      description: 'Manage university events, holidays, and important dates.',
      buttonText: 'View Calendar'
    },
    {
      icon: '📊',
      title: 'Administrative Reports',
      description: 'Generate administrative reports for university management.',
      buttonText: 'Generate Reports'
    },
    {
      icon: '👥',
      title: 'Department Coordination',
      description: 'Coordinate activities between different university departments.',
      buttonText: 'View Departments'
    },
    {
      icon: '📝',
      title: 'Policy Management',
      description: 'Manage and distribute university policies and procedures.',
      buttonText: 'Manage Policies'
    }
  ];

  return (
    <RolePage 
      title="Administrative Management"
      roleName="Administrative Officer"
      features={adminFeatures}
    />
  );
};

export default AdministrationPage; 