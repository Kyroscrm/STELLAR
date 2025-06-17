
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
  const { user, loading, profile } = useAuth();

  if (showLoading && loading) {
    return <LoadingWrapper loading={true} error={null}>{null}</LoadingWrapper>;
  }

  if (!user) {
    return fallback || <NetworkErrorFallback />;
  }

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <PermissionDeniedFallback />;
  }

  return <>{children}</>;
};
