
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingWrapper } from './LoadingWrapper';
import { PermissionDeniedFallback, NetworkErrorFallback } from './FallbackUI';

interface ProtectedContentProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'client';
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  requiredRole,
  fallback,
  showLoading = true
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || <NetworkErrorFallback />;
  }

  // For now, assume all authenticated users have access
  // This can be extended when user roles are properly implemented
  if (requiredRole) {
    // Role checking will be implemented when user profile/role system is ready
  }

  return <>{children}</>;
};
