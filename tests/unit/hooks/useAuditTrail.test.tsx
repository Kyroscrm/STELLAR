import { renderHook, act } from '@testing-library/react-hooks';
import { useAuditTrail } from '../../../src/hooks/useAuditTrail';
import { supabase } from '../../../src/integrations/supabase/client';
import { mockActivityLogs, mockUser } from '../../__mocks__/supabaseClient';

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

describe('useAuditTrail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAuditRecords', () => {
    // Happy path
    test('should fetch and map audit records', async () => {
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockActivityLogs,
            error: null
          })
        })
      });

      const { result } = renderHook(() => useAuditTrail());

      let records;
      await act(async () => {
        records = await result.current.fetchAuditRecords();
      });

      expect(supabase.from).toHaveBeenCalledWith('activity_logs');
      expect(records).toHaveLength(mockActivityLogs.length);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Edge case - filter by entity type and ID
    test('should filter by entity type and ID when provided', async () => {
      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValue({
        data: [mockActivityLogs[0]],
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
        eq: eqMock,
        order: orderMock
      });

      selectMock.mockReturnValue({
        eq: eqMock,
        order: orderMock
      });

      eqMock.mockReturnValue({
        eq: eqMock,
        order: orderMock
      });

      const { result } = renderHook(() => useAuditTrail());

      await act(async () => {
        await result.current.fetchAuditRecords('customers', '123e4567-e89b-12d3-a456-426614174001');
      });

      expect(supabase.from).toHaveBeenCalledWith('activity_logs');
    });

    // Failure scenario
    test('should handle errors when fetching records fails', async () => {
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      const { result } = renderHook(() => useAuditTrail());

      let records;
      await act(async () => {
        records = await result.current.fetchAuditRecords();
      });

      expect(records).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('logCustomAuditEvent', () => {
    // Happy path
    test('should log a custom audit event successfully', async () => {
      // Mock Supabase response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useAuditTrail());

      let success;
      await act(async () => {
        success = await result.current.logCustomAuditEvent(
          'created',
          'customers',
          '123e4567-e89b-12d3-a456-426614174001',
          'Customer created'
        );
      });

      expect(supabase.rpc).toHaveBeenCalledWith('log_activity', {
        p_action: 'created',
        p_entity_type: 'customers',
        p_entity_id: '123e4567-e89b-12d3-a456-426614174001',
        p_description: 'Customer created'
      });
      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    // Failure scenario
    test('should handle errors when logging fails', async () => {
      // Mock Supabase error response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      const { result } = renderHook(() => useAuditTrail());

      let success;
      await act(async () => {
        success = await result.current.logCustomAuditEvent(
          'created',
          'customers',
          '123e4567-e89b-12d3-a456-426614174001',
          'Customer created'
        );
      });

      expect(success).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('setRequestMetadata', () => {
    // Happy path
    test('should set request metadata successfully', async () => {
      // Mock Supabase response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useAuditTrail());

      let success;
      await act(async () => {
        success = await result.current.setRequestMetadata(
          '127.0.0.1',
          'Test User Agent',
          '123e4567-e89b-12d3-a456-426614174010'
        );
      });

      expect(supabase.rpc).toHaveBeenCalledWith('set_request_metadata', {
        p_ip_address: '127.0.0.1',
        p_user_agent: 'Test User Agent',
        p_session_id: '123e4567-e89b-12d3-a456-426614174010'
      });
      expect(success).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    // Failure scenario
    test('should handle errors when setting metadata fails', async () => {
      // Mock Supabase error response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      const { result } = renderHook(() => useAuditTrail());

      let success;
      await act(async () => {
        success = await result.current.setRequestMetadata(
          '127.0.0.1',
          'Test User Agent',
          '123e4567-e89b-12d3-a456-426614174010'
        );
      });

      expect(success).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getEntityAuditLogs', () => {
    // Happy path
    test('should fetch entity audit logs successfully', async () => {
      // Mock Supabase response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockActivityLogs,
        error: null
      });

      const { result } = renderHook(() => useAuditTrail());

      let logs;
      await act(async () => {
        logs = await result.current.getEntityAuditLogs(
          'customers',
          '123e4567-e89b-12d3-a456-426614174001'
        );
      });

      expect(supabase.rpc).toHaveBeenCalledWith('get_entity_audit_logs', {
        p_entity_type: 'customers',
        p_entity_id: '123e4567-e89b-12d3-a456-426614174001',
        p_limit: 100,
        p_offset: 0
      });
      expect(logs).toEqual(mockActivityLogs);
      expect(result.current.loading).toBe(false);
    });

    // Failure scenario
    test('should handle errors when fetching entity logs fails', async () => {
      // Mock Supabase error response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      const { result } = renderHook(() => useAuditTrail());

      let logs;
      await act(async () => {
        logs = await result.current.getEntityAuditLogs(
          'customers',
          '123e4567-e89b-12d3-a456-426614174001'
        );
      });

      expect(logs).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getUserActivity', () => {
    // Happy path
    test('should fetch user activity logs successfully', async () => {
      // Mock Supabase response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockActivityLogs,
        error: null
      });

      const { result } = renderHook(() => useAuditTrail());

      let logs;
      await act(async () => {
        logs = await result.current.getUserActivity(
          mockUser.id,
          '2023-01-01',
          '2023-01-31'
        );
      });

      expect(supabase.rpc).toHaveBeenCalledWith('get_user_activity', {
        p_user_id: mockUser.id,
        p_from_date: '2023-01-01',
        p_to_date: '2023-01-31',
        p_limit: 100,
        p_offset: 0
      });
      expect(logs).toEqual(mockActivityLogs);
      expect(result.current.loading).toBe(false);
    });

    // Edge case - default parameters
    test('should use default parameters when not provided', async () => {
      // Mock Supabase response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockActivityLogs,
        error: null
      });

      const { result } = renderHook(() => useAuditTrail());

      await act(async () => {
        await result.current.getUserActivity();
      });

      expect(supabase.rpc).toHaveBeenCalledWith('get_user_activity', {
        p_user_id: undefined,
        p_from_date: undefined,
        p_to_date: undefined,
        p_limit: 100,
        p_offset: 0
      });
    });

    // Failure scenario
    test('should handle errors when fetching user activity fails', async () => {
      // Mock Supabase error response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      const { result } = renderHook(() => useAuditTrail());

      let logs;
      await act(async () => {
        logs = await result.current.getUserActivity(mockUser.id);
      });

      expect(logs).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });
});
