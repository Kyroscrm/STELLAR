
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingDisplayProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ 
  message = "Loading...",
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <Loader2 className={`animate-spin mx-auto mb-4 ${sizeClasses[size]}`} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingDisplay;
