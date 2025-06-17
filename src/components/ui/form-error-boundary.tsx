
import React from 'react';
import { ErrorBoundary } from './error-boundary';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ children, onRetry }) => {
  return (
    <ErrorBoundary fallback={({ error, retry }) => (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-600 font-medium">Form Error</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
        <button 
          onClick={onRetry || retry}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    )}>
      {children}
    </ErrorBoundary>
  );
};
