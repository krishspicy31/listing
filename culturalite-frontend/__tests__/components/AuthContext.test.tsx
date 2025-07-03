/**
 * Unit tests for AuthContext
 * Tests authentication context provider and hooks
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { authService } from '@/features/vendor-dashboard/services/authService';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock authService
jest.mock('@/features/vendor-dashboard/services/authService', () => ({
  authService: {
    isAuthenticated: jest.fn(),
    getUser: jest.fn(),
    isTokenExpired: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

// Test component that uses useAuth hook
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login({ username: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({
        email: 'test@example.com',
        password: 'password',
        password_confirm: 'password',
        first_name: 'Test',
        last_name: 'User'
      })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('AuthProvider', () => {
    it('should provide initial loading state', () => {
      (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
      (authService.getUser as jest.Mock).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('loading');
    });

    it('should initialize with authenticated user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockReturnValue(mockUser);
      (authService.isTokenExpired as jest.Mock).mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });

    it('should handle expired token and refresh', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockReturnValue(mockUser);
      (authService.isTokenExpired as jest.Mock).mockReturnValue(true);
      (authService.refreshToken as jest.Mock).mockResolvedValue(true);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.refreshToken).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should handle failed token refresh', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockReturnValue(mockUser);
      (authService.isTokenExpired as jest.Mock).mockReturnValue(true);
      (authService.refreshToken as jest.Mock).mockResolvedValue(false);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.refreshToken).toHaveBeenCalled();
        expect(authService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should handle initialization errors', async () => {
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });
  });

  describe('login function', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
      (authService.getUser as jest.Mock).mockReturnValue(null);
      (authService.login as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          access: 'mock_token',
          user: mockUser
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'password'
        });
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle login failure', async () => {
      (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
      (authService.getUser as jest.Mock).mockReturnValue(null);
      (authService.login as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          message: 'Invalid credentials',
          details: 'Login failed'
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      let result;
      await act(async () => {
        const loginButton = screen.getByText('Login');
        loginButton.click();
        // We need to wait for the login promise to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(authService.login).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('register function', () => {
    it('should handle successful registration', async () => {
      (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
      (authService.getUser as jest.Mock).mockReturnValue(null);
      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          message: 'Registration successful',
          user: { id: 1, email: 'test@example.com' }
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      await act(async () => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login?message=Registration successful! Please log in to continue.');
      });
    });
  });

  describe('logout function', () => {
    it('should handle logout', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockReturnValue(mockUser);
      (authService.isTokenExpired as jest.Mock).mockReturnValue(false);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should handle logout errors gracefully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        profile: {
          id: 1,
          role: 'vendor',
          organization_name: 'Test Org',
          is_verified: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUser as jest.Mock).mockReturnValue(mockUser);
      (authService.isTokenExpired as jest.Mock).mockReturnValue(false);
      (authService.logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
