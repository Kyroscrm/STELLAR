import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'admin' | 'staff' | 'manager')[];
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission
}) => {
  const { user, isLoading, checkPermission } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    const checkUserPermission = async () => {
      if (!user || !requiredPermission) {
        setHasPermission(requiredPermission ? false : true);
        setPermissionChecked(true);
        return;
      }

      try {
        const result = await checkPermission(requiredPermission);
        setHasPermission(result);
      } catch (error) {
        setHasPermission(false);
      } finally {
        setPermissionChecked(true);
      }
    };

    checkUserPermission();
  }, [user, requiredPermission, checkPermission]);

  // Show loading state while authentication or permission check is in progress
  if (isLoading || (requiredPermission && !permissionChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check permission-based access if specified
  if (requiredPermission && !hasPermission) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
