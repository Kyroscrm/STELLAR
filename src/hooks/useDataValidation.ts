
import { useState } from 'react';
import { validateFormData } from '@/lib/security';
import { z } from 'zod';
import { toast } from 'sonner';

export const useDataValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateData = async (data: Record<string, any>, schema: z.ZodSchema) => {
    setIsValidating(true);
    try {
      const validatedData = validateFormData(data, schema);
      return { success: true, data: validatedData, errors: null };
    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + error.message);
      return { success: false, data: null, errors: error.message };
    } finally {
      setIsValidating(false);
    }
  };

  const validateAndSubmit = async (
    data: Record<string, any>, 
    schema: z.ZodSchema, 
    submitFn: (validatedData: any) => Promise<any>
  ) => {
    const validation = await validateData(data, schema);
    if (validation.success) {
      return await submitFn(validation.data);
    }
    return null;
  };

  return {
    validateData,
    validateAndSubmit,
    isValidating
  };
};
