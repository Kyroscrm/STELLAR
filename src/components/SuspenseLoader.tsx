import React from 'react';

interface SuspenseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default SuspenseLoader;
