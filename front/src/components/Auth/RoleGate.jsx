import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RoleGate({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <p>Access Denied</p>;
  }

  return <>{children}</>;
}