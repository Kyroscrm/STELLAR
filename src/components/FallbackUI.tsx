
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Briefcase, DollarSign, Plus, Wifi, WifiOff } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

interface NoDataFallbackProps {
  entity: 'invoices' | 'estimates' | 'jobs' | 'customers' | 'leads' | 'tasks';
  onCreateNew?: () => void;
}

export const NoDataFallback: React.FC<NoDataFallbackProps> = ({ entity, onCreateNew }) => {
  const config = {
    invoices: {
      icon: <DollarSign className="h-12 w-12" />,
      title: 'No invoices found',
      description: 'Get started by creating your first invoice.',
      actionLabel: 'Create Invoice'
    },
    estimates: {
      icon: <FileText className="h-12 w-12" />,
      title: 'No estimates found',
      description: 'Create estimates to provide quotes to your customers.',
      actionLabel: 'Create Estimate'
    },
    jobs: {
      icon: <Briefcase className="h-12 w-12" />,
      title: 'No jobs found',
      description: 'Start managing your projects by creating jobs.',
      actionLabel: 'Create Job'
    },
    customers: {
      icon: <Users className="h-12 w-12" />,
      title: 'No customers found',
      description: 'Add customers to start building relationships.',
      actionLabel: 'Add Customer'
    },
    leads: {
      icon: <Users className="h-12 w-12" />,
      title: 'No leads found',
      description: 'Track potential customers and convert them to sales.',
      actionLabel: 'Add Lead'
    },
    tasks: {
      icon: <FileText className="h-12 w-12" />,
      title: 'No tasks found',
      description: 'Organize your work by creating and tracking tasks.',
      actionLabel: 'Create Task'
    }
  };

  const { icon, title, description, actionLabel } = config[entity];

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onCreateNew}
    />
  );
};

export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <WifiOff className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-600">Connection Lost</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-4">
          Unable to connect to the server. Please check your internet connection.
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <Wifi className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const PermissionDeniedFallback: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <FileText className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-yellow-600">Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600">
          You don't have permission to access this resource. Contact your administrator if you believe this is an error.
        </p>
      </CardContent>
    </Card>
  );
};

export const LoadingCard: React.FC<{ title?: string; className?: string }> = ({ 
  title = "Loading...", 
  className = "" 
}) => {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </CardContent>
    </Card>
  );
};
