import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePermission, enforcePolicy, SecurityError } from './security';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define types for mocked responses
type MockAuthResponse = {
  data: { user: User | null };
  error: { message: string } | null;
};

type MockRpcResponse = {
  data: boolean | null;
  error: { message: string } | null;
};

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    rpc: vi.fn()
  }
}));

describe('RBAC Security Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validatePermission', () => {
    it('should return true when user has permission', async () => {
      // Mock authentication
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as User },
        error: null
      } as MockAuthResponse);

      // Mock has_permission RPC call
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null
      } as MockRpcResponse);

      const result = await validatePermission('leads:read');
      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: 'test-user-id',
        permission_name: 'leads:read'
      });
    });

    it('should throw SecurityError when user does not have permission', async () => {
      // Mock authentication
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as User },
        error: null
      } as MockAuthResponse);

      // Mock has_permission RPC call returning false
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null
      } as MockRpcResponse);

      await expect(validatePermission('leads:delete')).rejects.toThrow(SecurityError);
      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: 'test-user-id',
        permission_name: 'leads:delete'
      });
    });

    it('should throw SecurityError when permission check fails', async () => {
      // Mock authentication
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as User },
        error: null
      } as MockAuthResponse);

      // Mock has_permission RPC call returning an error
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      } as MockRpcResponse);

      await expect(validatePermission('leads:read')).rejects.toThrow(SecurityError);
      expect(supabase.rpc).toHaveBeenCalledWith('has_permission', {
        user_id: 'test-user-id',
        permission_name: 'leads:read'
      });
    });

    it('should throw SecurityError when user is not authenticated', async () => {
      // Mock authentication failure
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      } as MockAuthResponse);

      await expect(validatePermission('leads:read')).rejects.toThrow(SecurityError);
      expect(supabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe('enforcePolicy', () => {
    it('should execute operation when user has permission', async () => {
      // Mock validatePermission to succeed
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as User },
        error: null
      } as MockAuthResponse);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null
      } as MockRpcResponse);

      const mockOperation = vi.fn().mockResolvedValue({ success: true });
      const result = await enforcePolicy('leads:read', mockOperation);

      expect(result).toEqual({ success: true });
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should not execute operation when user lacks permission', async () => {
      // Mock validatePermission to fail
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user-id' } as User },
        error: null
      } as MockAuthResponse);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null
      } as MockRpcResponse);

      const mockOperation = vi.fn().mockResolvedValue({ success: true });

      await expect(enforcePolicy('leads:delete', mockOperation)).rejects.toThrow(SecurityError);
      expect(mockOperation).not.toHaveBeenCalled();
    });
  });
});
