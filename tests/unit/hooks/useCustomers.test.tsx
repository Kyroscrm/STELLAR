import { renderHook, act } from '@testing-library/react';
import { useCustomers } from '../../../src/hooks/useCustomers';
import { supabase } from '../../../src/integrations/supabase/client';
import { mockCustomers, mockUser } from '../../__mocks__/supabaseClient';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../../../src/integrations/supabase/client', () => {
  return {
    supabase: {
      from: jest.fn(),
      rpc: jest.fn()
    }
  };
});

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123e4567-e89b-12d3-a456-426614174000' },
    session: { access_token: 'mock-token' }
  })
}));

jest.mock('../../../src/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

jest.mock('../../../src/hooks/useOptimisticUpdate', () => ({
  useOptimisticUpdate: () => ({
    executeUpdate: jest.fn((_, actualUpdate, rollback, options) => actualUpdate())
  })
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('useCustomers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCustomers', () => {
    // Happy path
    test('should fetch customers successfully', async () => {
      // Mock Supabase response for enforcePolicy
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      // Mock Supabase response for fetch
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCustomers,
          error: null
        })
      });

      const { result } = renderHook(() => useCustomers());

      await act(async () => {
        await result.current.fetchCustomers();
      });

      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: mockUser.id,
        permission_name: 'customers:read'
      });
      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(result.current.customers).toEqual(mockCustomers);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Failure scenario - permission denied
    test('should handle permission denied error', async () => {
      // Mock Supabase response for enforcePolicy - permission denied
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: false, error: null });

      const { result } = renderHook(() => useCustomers());

      await act(async () => {
        await result.current.fetchCustomers();
      });

      expect(result.current.customers).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
    });

    // Failure scenario - fetch error
    test('should handle fetch error', async () => {
      // Mock Supabase response for enforcePolicy
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      // Mock Supabase response for fetch - with error
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      const { result } = renderHook(() => useCustomers());

      await act(async () => {
        await result.current.fetchCustomers();
      });

      expect(result.current.customers).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).not.toBe(null);
    });
  });

  describe('createCustomer', () => {
    // Happy path
    test('should create customer successfully', async () => {
      const newCustomer = {
        first_name: 'New',
        last_name: 'Customer',
        email: 'new@example.com',
        phone: '555-123-4567'
      };

      const createdCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174099',
        ...newCustomer,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock Supabase response for enforcePolicy
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      // Mock Supabase response for insert
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [createdCustomer],
            error: null
          })
        }),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: createdCustomer,
          error: null
        })
      });

      const { result } = renderHook(() => useCustomers());

      let customer;
      await act(async () => {
        customer = await result.current.createCustomer(newCustomer);
      });

      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: mockUser.id,
        permission_name: 'customers:create'
      });
      expect(supabase.from).toHaveBeenCalledWith('customers');
      expect(customer).toEqual(createdCustomer);
    });

    // Failure scenario - permission denied
    test('should handle permission denied error when creating', async () => {
      const newCustomer = {
        first_name: 'New',
        last_name: 'Customer',
        email: 'new@example.com',
        phone: '555-123-4567'
      };

      // Mock Supabase response for enforcePolicy - permission denied
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: false, error: null });

      const { result } = renderHook(() => useCustomers());

      let customer;
      await act(async () => {
        customer = await result.current.createCustomer(newCustomer);
      });

      expect(customer).toBe(null);
    });
  });

  describe('updateCustomer', () => {
    // Setup
    beforeEach(() => {
      // Mock initial customers state
      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];
    });

    // Happy path
    test('should update customer successfully', async () => {
      const customerId = mockCustomers[0].id;
      const updates = {
        first_name: 'Updated',
        email: 'updated@example.com'
      };

      const updatedCustomer = {
        ...mockCustomers[0],
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Mock Supabase response for enforcePolicy
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      // Mock Supabase response for update
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: updatedCustomer,
                  error: null
                })
              })
            })
          })
        })
      });

      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];

      let success;
      await act(async () => {
        success = await result.current.updateCustomer(customerId, updates);
      });

      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: mockUser.id,
        permission_name: 'customers:update'
      });
      expect(success).toBe(true);
    });

    // Failure scenario
    test('should handle error when updating non-existent customer', async () => {
      const nonExistentId = 'non-existent-id';
      const updates = {
        first_name: 'Updated',
        email: 'updated@example.com'
      };

      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];

      let success;
      await act(async () => {
        success = await result.current.updateCustomer(nonExistentId, updates);
      });

      expect(success).toBe(false);
    });
  });

  describe('deleteCustomer', () => {
    // Setup
    beforeEach(() => {
      // Mock initial customers state
      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];
    });

    // Happy path
    test('should delete customer successfully', async () => {
      const customerId = mockCustomers[0].id;

      // Mock Supabase response for enforcePolicy
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: true, error: null });

      // Mock Supabase response for delete
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];

      let success;
      await act(async () => {
        success = await result.current.deleteCustomer(customerId);
      });

      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: mockUser.id,
        permission_name: 'customers:delete'
      });
      expect(success).toBe(true);
    });

    // Failure scenario
    test('should handle error when deleting non-existent customer', async () => {
      const nonExistentId = 'non-existent-id';

      const { result } = renderHook(() => useCustomers());
      result.current.customers = [...mockCustomers];

      let success;
      await act(async () => {
        success = await result.current.deleteCustomer(nonExistentId);
      });

      expect(success).toBe(false);
    });
  });
});
