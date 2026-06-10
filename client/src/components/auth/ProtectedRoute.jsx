import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/20 border-t-teal-500"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading VoyageHub...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and store original path for redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
