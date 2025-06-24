import { renderHook, act } from '@testing-library/react';
import { useOptimisticUpdate } from '../../../src/hooks/useOptimisticUpdate';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../../src/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn()
  })
}));

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute update successfully', async () => {
    // Mock state and functions
    const mockState = ['item1', 'item2'];
    let state = [...mockState];
    const setState = jest.fn((newState) => {
      state = typeof newState === 'function' ? newState(state) : newState;
    });

    // Optimistic update function
    const optimisticUpdate = jest.fn(() => {
      setState([...state, 'optimistic-item']);
    });

    // Actual update function
    const actualUpdate = jest.fn(async () => {
      return 'server-item';
    });

    // Rollback function
    const rollback = jest.fn(() => {
      setState(mockState);
    });

    // Options
    const options = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      successMessage: 'Update successful',
      errorMessage: 'Update failed'
    };

    const { result } = renderHook(() => useOptimisticUpdate());

    // Execute the update
    let returnValue;
    await act(async () => {
      returnValue = await result.current.executeUpdate(
        optimisticUpdate,
        actualUpdate,
        rollback,
        options
      );
    });

    // Verify the functions were called
    expect(optimisticUpdate).toHaveBeenCalled();
    expect(actualUpdate).toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
    expect(options.onSuccess).toHaveBeenCalledWith('server-item');
    expect(options.onError).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Update successful');
    expect(toast.error).not.toHaveBeenCalled();
    expect(returnValue).toBe('server-item');
    expect(result.current.isUpdating).toBe(false);
  });

  test('should handle error and rollback on failure', async () => {
    // Mock state and functions
    const mockState = ['item1', 'item2'];
    let state = [...mockState];
    const setState = jest.fn((newState) => {
      state = typeof newState === 'function' ? newState(state) : newState;
    });

    // Optimistic update function
    const optimisticUpdate = jest.fn(() => {
      setState([...state, 'optimistic-item']);
    });

    // Actual update function that fails
    const error = new Error('Server error');
    const actualUpdate = jest.fn(async () => {
      throw error;
    });

    // Rollback function
    const rollback = jest.fn(() => {
      setState(mockState);
    });

    // Options
    const options = {
      onSuccess: jest.fn(),
      onError: jest.fn(),
      successMessage: 'Update successful',
      errorMessage: 'Update failed'
    };

    const { result } = renderHook(() => useOptimisticUpdate());

    // Execute the update and expect it to throw
    await act(async () => {
      try {
        await result.current.executeUpdate(
          optimisticUpdate,
          actualUpdate,
          rollback,
          options
        );
      } catch (e) {
        // Expected error
      }
    });

    // Verify the functions were called
    expect(optimisticUpdate).toHaveBeenCalled();
    expect(actualUpdate).toHaveBeenCalled();
    expect(rollback).toHaveBeenCalled();
    expect(options.onSuccess).not.toHaveBeenCalled();
    expect(options.onError).toHaveBeenCalledWith(error);
    expect(toast.success).not.toHaveBeenCalled();
    expect(result.current.isUpdating).toBe(false);
  });

  test('should use default messages when not provided', async () => {
    // Mock state and functions
    const mockState = ['item1', 'item2'];
    let state = [...mockState];
    const setState = jest.fn((newState) => {
      state = typeof newState === 'function' ? newState(state) : newState;
    });

    // Optimistic update function
    const optimisticUpdate = jest.fn(() => {
      setState([...state, 'optimistic-item']);
    });

    // Actual update function
    const actualUpdate = jest.fn(async () => {
      return 'server-item';
    });

    // Rollback function
    const rollback = jest.fn(() => {
      setState(mockState);
    });

    const { result } = renderHook(() => useOptimisticUpdate());

    // Execute the update with no options
    await act(async () => {
      await result.current.executeUpdate(
        optimisticUpdate,
        actualUpdate,
        rollback
      );
    });

    // Verify default messages were used
    expect(toast.success).toHaveBeenCalledWith('Update successful');
  });
});
