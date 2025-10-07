import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAPI';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('authToken') : false;
  
  // Only redirect when there's definitely no token; avoids rapid redirects while auth initializes
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

