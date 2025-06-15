
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
