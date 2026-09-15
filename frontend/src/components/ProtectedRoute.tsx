import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAPI';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // Wait for auth to initialize to avoid premature redirects
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] animate-pulse">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6">
          <div className="h-8 w-48 bg-gray-100 dark:bg-white/10 rounded-md" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

