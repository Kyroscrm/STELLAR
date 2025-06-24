
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface FormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export class FormErrorBoundary extends React.Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Form error is caught and handled by the error boundary state
    toast.error('Form submission failed', {
      description: error.message,
      duration: 5000,
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">{this.state.error?.message || 'An error occurred while processing the form'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.retry}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
