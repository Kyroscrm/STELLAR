import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/hooks/useRBAC';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login'
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { role, hasPermission, loading: rbacLoading } = useRBAC();
  const location = useLocation();

  // Show loading while authentication or RBAC is loading
  if (authLoading || rbacLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && role) {
    const hasAllowedRole = allowedRoles.includes(role.name);
    if (!hasAllowedRole) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Access Denied</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have the required role to access this page.
                Required roles: {allowedRoles.join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );

    if (!hasAllRequiredPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Insufficient Permissions</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have the required permissions to access this page.
                Required permissions: {requiredPermissions.join(', ')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Component wrapper for permission-based rendering
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires ALL permissions, if false requires ANY
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  fallback = null,
  requireAll = true
}) => {
  const { role: userRole, hasPermission } = useRBAC();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const checkFn = requireAll
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p));

    if (!checkFn) {
      return <>{fallback}</>;
    }
  }

  // Check single role
  if (role && userRole?.name !== role) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles.length > 0 && userRole) {
    const hasAllowedRole = roles.includes(userRole.name);
    if (!hasAllowedRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
