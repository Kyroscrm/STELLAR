import { renderHook, act } from '@testing-library/react'
import { useDataRetention, RetentionPolicyType } from '../useDataRetention'
import { supabase } from '@/integrations/supabase/client'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { useErrorHandler } from '../useErrorHandler'
import { SupabaseClient } from '@supabase/supabase-js'

type MockSupabaseClient = {
  from: (table: string) => {
    select: Mock
    insert: Mock
    update: Mock
    delete: Mock
    eq: Mock
  }
  rpc: Mock
}

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({ data: null, error: null }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
      eq: vi.fn().mockReturnValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockReturnValue({ data: null, error: null }),
  } as MockSupabaseClient,
}))

// Mock the error handler
jest.mock('../useErrorHandler', () => ({
  useErrorHandler: jest.fn(() => ({
    handleError: jest.fn(),
    handleSuccess: jest.fn()
  }))
}))

describe('useDataRetention', () => {
  const mockPolicy = {
    id: '123e4567-e89b-12d3-a456-426614174011',
    table_name: 'test_table',
    retention_days: 30,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    created_by: mockUser.id,
    updated_by: mockUser.id,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches policies on mount', async () => {
    const mockPolicies = [
      {
        id: '1',
        table_name: 'leads',
        retention_period_days: 30,
        policy_type: 'automatic' as RetentionPolicyType,
        compliance_requirement: 'GDPR',
        auto_delete: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user_id: 'user-1',
      },
    ]

    const mockFrom = (supabase as unknown as MockSupabaseClient).from('data_retention_policies')
    mockFrom.select.mockReturnValue({
      data: mockPolicies,
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.policies).toEqual(mockPolicies)
    expect(result.current.error).toBe(null)
  })

  it('creates a new policy', async () => {
    const newPolicy = {
      table_name: 'customers',
      retention_period_days: 60,
      policy_type: 'manual' as RetentionPolicyType,
      compliance_requirement: 'CCPA',
      auto_delete: false,
    }

    const mockResponse = {
      data: [{ ...newPolicy, id: '2' }],
      error: null,
    }

    const mockFrom = (supabase as unknown as MockSupabaseClient).from('data_retention_policies')
    mockFrom.insert.mockReturnValue(mockResponse)
    mockFrom.select.mockReturnValue({
      data: mockResponse.data,
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      await result.current.createPolicy(newPolicy)
    })

    expect(supabase.from).toHaveBeenCalledWith('data_retention_policies')
    expect(mockFrom.insert).toHaveBeenCalledWith(newPolicy)
  })

  it('updates an existing policy', async () => {
    const policyId = '1'
    const updates = {
      auto_delete: true,
    }

    const mockResponse = {
      data: [{ id: policyId, ...updates }],
      error: null,
    }

    const mockFrom = (supabase as unknown as MockSupabaseClient).from('data_retention_policies')
    mockFrom.update.mockReturnValue(mockResponse)
    mockFrom.select.mockReturnValue({
      data: mockResponse.data,
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      await result.current.updatePolicy(policyId, updates)
    })

    expect(supabase.from).toHaveBeenCalledWith('data_retention_policies')
    expect(mockFrom.update).toHaveBeenCalledWith(updates)
  })

  it('deletes a policy', async () => {
    const policyId = '1'

    const mockResponse = {
      data: [{ id: policyId }],
      error: null,
    }

    const mockFrom = (supabase as unknown as MockSupabaseClient).from('data_retention_policies')
    mockFrom.delete.mockReturnValue(mockResponse)
    mockFrom.select.mockReturnValue({
      data: [],
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      await result.current.deletePolicy(policyId)
    })

    expect(supabase.from).toHaveBeenCalledWith('data_retention_policies')
    expect(mockFrom.delete).toHaveBeenCalled()
  })

  it('generates a retention report', async () => {
    const mockReport = [
      { table_name: 'leads', records_to_delete: 5 },
      { table_name: 'customers', records_to_delete: 3 },
    ]

    const mockRpc = (supabase as unknown as MockSupabaseClient).rpc
    mockRpc.mockReturnValue({
      data: mockReport,
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      const report = await result.current.generateRetentionReport()
      expect(report).toEqual(mockReport)
    })

    expect(mockRpc).toHaveBeenCalledWith('generate_retention_report')
  })

  it('schedules automatic cleanup', async () => {
    const enabled = true

    const mockRpc = (supabase as unknown as MockSupabaseClient).rpc
    mockRpc.mockReturnValue({
      data: { enabled },
      error: null,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      await result.current.scheduleAutomaticCleanup(enabled)
    })

    expect(mockRpc).toHaveBeenCalledWith('schedule_automatic_cleanup', {
      enabled,
    })
  })

  it('handles errors gracefully', async () => {
    const error = new Error('Database error')

    const mockFrom = (supabase as unknown as MockSupabaseClient).from('data_retention_policies')
    mockFrom.select.mockReturnValue({
      data: null,
      error,
    })

    const { result } = renderHook(() => useDataRetention())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(error)
    expect(result.current.policies).toEqual([])
  })
})
