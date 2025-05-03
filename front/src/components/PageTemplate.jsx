import React from 'react';
import Navigation from './Navigation/Navigation';

const PageTemplate = ({ title, children }) => {
  return (
    <div className="page-container">
      <Navigation />
      <div className="page-content">
        <h1 className="page-title">{title}</h1>
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate; 