
import React from 'react';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';

interface CriticalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface CriticalErrorBoundaryProps {
  children: React.ReactNode;
}

class CriticalErrorBoundary extends React.Component<CriticalErrorBoundaryProps, CriticalErrorBoundaryState> {
  constructor(props: CriticalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CriticalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Critical Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would log to your error tracking service
      console.error('Critical error logged:', { error, errorInfo });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <GlobalErrorHandler error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export default CriticalErrorBoundary;
