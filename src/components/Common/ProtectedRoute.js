import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../../utils/auth';

const ProtectedRoute = ({ user, adminOnly = false, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin(user)) {
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;