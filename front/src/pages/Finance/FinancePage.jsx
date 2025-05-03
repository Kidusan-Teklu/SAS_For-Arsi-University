import React from 'react';
import RolePage from '../../components/RolePage';

const FinancePage = () => {
  const financeFeatures = [
    {
      icon: '💰',
      title: 'Payroll Management',
      description: 'Manage employee payroll based on attendance and work hours.',
      buttonText: 'Manage Payroll'
    },
    {
      icon: '📊',
      title: 'Attendance Reports',
      description: 'View attendance reports for payroll calculation and financial planning.',
      buttonText: 'View Reports'
    },
    {
      icon: '📉',
      title: 'Financial Analysis',
      description: 'Analyze financial impacts of attendance patterns and work hours.',
      buttonText: 'View Analysis'
    },
    {
      icon: '📝',
      title: 'Generate Statements',
      description: 'Generate financial statements and reports for departments.',
      buttonText: 'Generate Statements'
    },
    {
      icon: '🔍',
      title: 'Audit Tools',
      description: 'Tools for auditing attendance data for financial compliance.',
      buttonText: 'Audit Data'
    },
    {
      icon: '⚙️',
      title: 'Finance Settings',
      description: 'Configure finance-related settings for the attendance system.',
      buttonText: 'Configure'
    }
  ];

  return (
    <RolePage 
      title="Finance Management"
      roleName="Finance Officer"
      features={financeFeatures}
    />
  );
};

export default FinancePage; 