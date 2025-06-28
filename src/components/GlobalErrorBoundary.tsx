
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  module?: string;
}

class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to external service in production (without console statements)
    if (process.env.NODE_ENV === 'production') {
      // Error reporting to external service would go here
    }

    // Show toast notification
    toast.error(`Error in ${this.props.module || 'application'}`, {
      description: error.message,
      duration: 5000,
    });
  }

  retry = () => {
    if (this.state.retryCount < 3) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      });
      toast.success('Retrying...');
    } else {
      toast.error('Max retry attempts reached. Please refresh the page.');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return <ErrorFallback
        error={this.state.error!}
        retry={this.retry}
        module={this.props.module}
        retryCount={this.state.retryCount}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
  module?: string;
  retryCount: number;
}> = ({ error, retry, module, retryCount }) => {
  const handleGoHome = () => {
    // Simple fallback: reload the page to admin
    window.location.href = '/admin';
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">
            {module ? `Error in ${module}` : 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md font-mono max-h-32 overflow-y-auto">
            {error.message}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={retry}
              className="flex-1"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount >= 3 ? 'Max Retries' : `Try Again (${retryCount}/3)`}
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ErrorFallback, GlobalErrorBoundary };
