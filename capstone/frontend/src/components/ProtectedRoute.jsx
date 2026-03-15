import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScaleLoader } from 'react-spinners';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <ScaleLoader
          color={"#AACDBE"} 
          loading={true}     
          height={35}        // height of the bars
          width={4}          // width of each bar
          margin={2}         // space between bars
          radius={2}         // border radius of bars
          speedMultiplier={1} // speed 
          aria-label="Loading Spinner" 
          data-testid="loader" 
        />
      </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'representative':
        return <Navigate to="/rep" replace />;
      case 'applicant':
        return <Navigate to="/applicant" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;