
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');
export const descriptionSchema = z.string().max(1000, 'Description too long');
export const amountSchema = z.number().min(0, 'Amount must be positive');

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Rate limiting for client-side (basic implementation)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  checkLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Security validation for form inputs
export const validateFormData = (data: Record<string, any>, schema: z.ZodSchema) => {
  try {
    // Sanitize string inputs
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return schema.parse(sanitizedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
};

// Security headers check
export const checkSecurityHeaders = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = response.headers;
    
    return {
      hasCSP: headers.has('content-security-policy'),
      hasHSTS: headers.has('strict-transport-security'),
      hasXFrameOptions: headers.has('x-frame-options'),
      hasXContentTypeOptions: headers.has('x-content-type-options'),
      hasReferrerPolicy: headers.has('referrer-policy')
    };
  } catch (error) {
    console.error('Security headers check failed:', error);
    return null;
  }
};
