import {
  sanitizeInput,
  RateLimiter,
  validateFormData,
  validateAuthentication,
  validatePermission,
  enforcePolicy,
  SecurityError,
  isSupabaseError,
  handleSupabaseError
} from '../../../src/lib/security';
import { z } from 'zod';
import { supabase } from '../../../src/integrations/supabase/client';
import { ApiError } from '../../../src/types/app-types';

// Mock supabase
jest.mock('../../../src/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getUser: jest.fn()
      },
      rpc: jest.fn()
    }
  };
});

describe('Security Utilities', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    // Happy path
    test('should sanitize input by removing script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      expect(sanitizeInput(input)).toBe('Hello');
    });

    // Edge case
    test('should sanitize javascript: protocol', () => {
      const input = 'javascript:alert("XSS")';
      expect(sanitizeInput(input)).toBe('alert("XSS")');
    });

    // Failure scenario
    test('should sanitize event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      expect(sanitizeInput(input)).toBe('<div >Click me</div>');
    });
  });

  describe('RateLimiter', () => {
    // Happy path
    test('should allow requests within rate limit', () => {
      const limiter = new RateLimiter();
      expect(limiter.checkLimit('test-key', 5, 1000)).toBe(true);
      expect(limiter.checkLimit('test-key', 5, 1000)).toBe(true);
      expect(limiter.checkLimit('test-key', 5, 1000)).toBe(true);
    });

    // Edge case
    test('should block requests exceeding rate limit', () => {
      const limiter = new RateLimiter();
      expect(limiter.checkLimit('test-key-2', 2, 1000)).toBe(true);
      expect(limiter.checkLimit('test-key-2', 2, 1000)).toBe(true);
      expect(limiter.checkLimit('test-key-2', 2, 1000)).toBe(false);
    });

    // Failure scenario
    test('should reset rate limit after window expires', async () => {
      const limiter = new RateLimiter();
      expect(limiter.checkLimit('test-key-3', 1, 100)).toBe(true);
      expect(limiter.checkLimit('test-key-3', 1, 100)).toBe(false);

      // Wait for rate limit window to expire
      await new Promise(resolve => setTimeout(resolve, 110));
      expect(limiter.checkLimit('test-key-3', 1, 100)).toBe(true);
    });
  });

  describe('validateFormData', () => {
    // Define a test schema
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(18)
    });

    // Happy path
    test('should validate and sanitize valid data', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      };

      const result = validateFormData(data, testSchema);
      expect(result).toEqual(data);
    });

    // Edge case
    test('should sanitize string inputs', () => {
      const data = {
        name: ' Test User <script>alert("XSS")</script>',
        email: 'test@example.com',
        age: 25
      };

      const result = validateFormData(data, testSchema);
      expect(result.name).toBe('Test User ');
    });

    // Failure scenario
    test('should throw error for invalid data', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: 15
      };

      expect(() => validateFormData(data, testSchema)).toThrow();
    });
  });

  describe('validateAuthentication', () => {
    // Happy path
    test('should return user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

      const user = await validateAuthentication();
      expect(user).toEqual(mockUser);
    });

    // Failure scenario
    test('should throw SecurityError when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });

      await expect(validateAuthentication()).rejects.toThrow(SecurityError);
    });

    // Edge case
    test('should throw SecurityError when auth error occurs', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      });

      await expect(validateAuthentication()).rejects.toThrow(SecurityError);
    });
  });

  describe('validatePermission', () => {
    // Happy path
    test('should return true when user has permission', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      const result = await validatePermission('customers:read');
      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: mockUser.id,
        permission_name: 'customers:read'
      });
    });

    // Failure scenario
    test('should throw SecurityError when user lacks permission', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: false, error: null });

      await expect(validatePermission('customers:delete')).rejects.toThrow(SecurityError);
    });

    // Edge case
    test('should throw SecurityError when permission check fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'Permission check failed' } });

      await expect(validatePermission('customers:update')).rejects.toThrow(SecurityError);
    });
  });

  describe('enforcePolicy', () => {
    // Happy path
    test('should execute operation when permission is granted', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      const mockOperation = jest.fn().mockResolvedValue({ data: 'success' });
      const result = await enforcePolicy('customers:read', mockOperation);

      expect(mockOperation).toHaveBeenCalled();
      expect(result).toEqual({ data: 'success' });
    });

    // Failure scenario
    test('should not execute operation when permission is denied', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: false, error: null });

      const mockOperation = jest.fn().mockResolvedValue({ data: 'success' });

      await expect(enforcePolicy('customers:delete', mockOperation)).rejects.toThrow(SecurityError);
      expect(mockOperation).not.toHaveBeenCalled();
    });
  });

  describe('isSupabaseError', () => {
    // Happy path
    test('should identify Supabase API errors', () => {
      const error: ApiError = {
        data: null,
        error: { message: 'API error', code: 'ERROR_CODE' }
      };
      expect(isSupabaseError(error)).toBe(true);
    });

    // Edge cases
    test('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(isSupabaseError(error)).toBe(false);
    });

    test('should return false for null or undefined', () => {
      expect(isSupabaseError(null)).toBe(false);
      expect(isSupabaseError(undefined)).toBe(false);
    });
  });

  describe('handleSupabaseError', () => {
    // Happy path
    test('should convert Supabase API error to Error', () => {
      const apiError: ApiError = {
        data: null,
        error: { message: 'API error message', code: 'ERROR_CODE' }
      };
      const result = handleSupabaseError(apiError);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('API error message');
    });

    // Edge case
    test('should return the original error if already an Error', () => {
      const error = new Error('Original error');
      const result = handleSupabaseError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Original error');
    });

    // Failure scenario
    test('should return generic error for unknown error types', () => {
      const result = handleSupabaseError('string error');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });
});
