
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldErrorProps {
  error?: string;
}

const FormFieldError: React.FC<FormFieldErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
};

export default FormFieldError;
