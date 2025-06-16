
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'admin' | 'manager' | 'staff' | 'user')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'isLoading:', isLoading, 'allowedRoles:', allowedRoles);

  if (isLoading) {
    console.log('ProtectedRoute - showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - role not allowed, redirecting to home. User role:', user.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
