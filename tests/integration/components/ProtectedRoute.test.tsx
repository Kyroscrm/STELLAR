import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../../src/components/ProtectedRoute';
import { AuthContext } from '../../../src/contexts/AuthContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ProtectedRoute Integration Tests', () => {
  // Reset mocks between tests
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  // Test component to render inside ProtectedRoute
  const TestComponent = () => <div>Protected Content</div>;

  // Happy path - authenticated user with permission
  test('should render protected content when user is authenticated and has permission', () => {
    // Mock authenticated user with permission
    const authValue = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'mock-token' },
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      checkPermission: jest.fn().mockResolvedValue(true)
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute permission="customers:read">
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Check if protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Failure scenario - authenticated user without permission
  test('should redirect when user is authenticated but lacks permission', () => {
    // Mock authenticated user without permission
    const authValue = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'mock-token' },
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      checkPermission: jest.fn().mockResolvedValue(false)
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute permission="customers:read">
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Check if navigation to login occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Failure scenario - unauthenticated user
  test('should redirect when user is not authenticated', () => {
    // Mock unauthenticated user
    const authValue = {
      user: null,
      session: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      checkPermission: jest.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute permission="customers:read">
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Check if navigation to login occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  // Edge case - loading state
  test('should show loading state when auth is loading', () => {
    // Mock loading state
    const authValue = {
      user: null,
      session: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: true,
      checkPermission: jest.fn()
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute permission="customers:read">
                <TestComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Should not navigate or render protected content while loading
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
