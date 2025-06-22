
import { useState } from 'react';
import { validateFormData } from '@/lib/security';
import { z } from 'zod';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';

interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: Record<string, string[]> | null;
  fieldErrors: Record<string, string> | null;
}

export const useDataValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { handleError } = useErrorHandler();

  const validateData = async <T>(data: Record<string, any>, schema: z.ZodSchema<T>): Promise<ValidationResult<T>> => {
    setIsValidating(true);
    try {
      const validatedData = validateFormData(data, schema);
      return { 
        success: true, 
        data: validatedData, 
        errors: null, 
        fieldErrors: null 
      };
    } catch (error: any) {
      console.error('Validation error:', error);
      
      let fieldErrors: Record<string, string> = {};
      let errorMessages: Record<string, string[]> = {};
      
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errorMessages[path]) {
            errorMessages[path] = [];
          }
          errorMessages[path].push(err.message);
          fieldErrors[path] = err.message; // Use first error for field-level display
        });
        
        toast.error('Validation failed', {
          description: 'Please check the form for errors and try again.'
        });
      } else {
        // Handle other validation errors
        const message = error.message || 'Validation failed';
        handleError(error, { 
          title: 'Validation Error',
          showToast: true 
        });
        errorMessages.general = [message];
      }
      
      return { 
        success: false, 
        data: null, 
        errors: errorMessages, 
        fieldErrors 
      };
    } finally {
      setIsValidating(false);
    }
  };

  const validateAndSubmit = async <T, R>(
    data: Record<string, any>, 
    schema: z.ZodSchema<T>, 
    submitFn: (validatedData: T) => Promise<R>
  ): Promise<R | null> => {
    const validation = await validateData(data, schema);
    if (validation.success && validation.data) {
      try {
        return await submitFn(validation.data);
      } catch (error) {
        handleError(error, { 
          title: 'Submission Error',
          showToast: true 
        });
        return null;
      }
    }
    return null;
  };

  const validateField = async <T>(
    fieldName: string,
    value: any,
    schema: z.ZodSchema<T>
  ): Promise<{ isValid: boolean; error?: string }> => {
    try {
      // Create a simple validation object for the field
      const tempData = { [fieldName]: value };
      
      // Try to parse just this field value directly
      if (schema instanceof z.ZodObject) {
        const shape = schema._def.schema || schema.shape;
        if (shape && shape[fieldName]) {
          await shape[fieldName].parseAsync(value);
        } else {
          // Fallback: validate the whole object
          await schema.parseAsync(tempData);
        }
      } else {
        // For non-object schemas, validate directly
        await schema.parseAsync(value);
      }
      
      return { isValid: true };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => 
          err.path.length === 0 || err.path.includes(fieldName)
        );
        return { 
          isValid: false, 
          error: fieldError?.message || 'Invalid value' 
        };
      }
      return { 
        isValid: false, 
        error: 'Validation error' 
      };
    }
  };

  return {
    validateData,
    validateAndSubmit,
    validateField,
    isValidating
  };
};
