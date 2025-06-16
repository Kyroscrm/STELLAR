
import React from 'react';

interface FormFieldErrorProps {
  error?: string;
}

const FormFieldError: React.FC<FormFieldErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <p className="text-sm text-red-600 mt-1">{error}</p>
  );
};

export default FormFieldError;
