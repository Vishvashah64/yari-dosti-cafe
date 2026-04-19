import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // You can add a 'loading' check here if you have one in your Context
  // if (loading) return <div>Loading...</div>; 

  if (!user) {
    // User is not logged in at all
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    // User is logged in but not an admin
    return <Navigate to="/" />;
  }

  // All good, render the dashboard
  return children;
};

export default ProtectedRoute;