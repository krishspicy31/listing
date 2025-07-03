/**
 * Unit tests for AuthService
 * Tests authentication service functionality including login, register, logout, and token management
 */

import { authService, LoginCredentials, RegisterData } from '@/features/vendor-dashboard/services/authService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('register', () => {
    const mockRegisterData: RegisterData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      password_confirm: 'SecurePass123!',
      first_name: 'Test',
      last_name: 'User',
      organization_name: 'Test Org'
    };

    it('should register user successfully', async () => {
      const mockResponse = {
        message: 'Registration successful! Please log in to continue.',
        user: {
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
        }
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authService.register(mockRegisterData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/register/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockRegisterData),
        })
      );
    });

    it('should handle registration failure', async () => {
      const mockErrorResponse = {
        error: 'Invalid registration data.',
        details: { email: ['A user with this email already exists.'] }
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      const result = await authService.register(mockRegisterData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid registration data.');
      expect(result.error?.details).toEqual(mockErrorResponse.details);
    });

    it('should handle network errors during registration', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await authService.register(mockRegisterData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Registration failed');
    });
  });

  describe('login', () => {
    const mockLoginCredentials: LoginCredentials = {
      username: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should login user successfully', async () => {
      const mockResponse = {
        access: 'mock_access_token',
        user: {
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
        }
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authService.login(mockLoginCredentials);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'culturalite_access_token',
        'mock_access_token'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'culturalite_user',
        JSON.stringify(mockResponse.user)
      );
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login/',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockLoginCredentials),
        })
      );
    });

    it('should handle login failure', async () => {
      const mockErrorResponse = {
        error: 'Invalid credentials',
        details: 'No active account found with the given credentials'
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      const result = await authService.login(mockLoginCredentials);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid credentials');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockAccessToken = 'mock_access_token';
      localStorageMock.getItem.mockReturnValue(mockAccessToken);

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Successfully logged out.' }),
      } as Response);

      await authService.logout();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout/',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`,
          },
        })
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_user');
    });

    it('should clear local storage even if server request fails', async () => {
      localStorageMock.getItem.mockReturnValue('mock_access_token');

      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      await authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_user');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        access: 'new_access_token',
        message: 'Token refreshed successfully'
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await authService.refreshToken();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/refresh/',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'culturalite_access_token',
        'new_access_token'
      );
    });

    it('should handle refresh token failure', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid refresh token' }),
      } as Response);

      const result = await authService.refreshToken();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_user');
    });

    it('should handle network errors during refresh', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await authService.refreshToken();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('culturalite_user');
    });
  });

  describe('token management', () => {
    it('should check if user is authenticated', () => {
      // Mock both access token and user data
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'culturalite_access_token') {
          // Return a valid JWT token that's not expired
          const payload = { exp: Math.floor(Date.now() / 1000) + 3600 }; // Expires in 1 hour
          const token = `header.${btoa(JSON.stringify(payload))}.signature`;
          return token;
        }
        if (key === 'culturalite_user') {
          return JSON.stringify({ id: 1, email: 'test@example.com' });
        }
        return null;
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('culturalite_access_token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('culturalite_user');
    });

    it('should return false if no access token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should get access token', () => {
      const mockToken = 'mock_access_token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = authService.getAccessToken();

      expect(result).toBe(mockToken);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('culturalite_access_token');
    });

    it('should get user data', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        profile: { role: 'vendor' }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.getUser();

      expect(result).toEqual(mockUser);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('culturalite_user');
    });

    it('should return null for invalid user data', () => {
      localStorageMock.getItem.mockReturnValue('invalid_json');

      const result = authService.getUser();

      expect(result).toBeNull();
    });

    it('should check if token is expired', () => {
      // Mock a token that expires in the future
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const mockToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`;
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = authService.isTokenExpired();

      expect(result).toBe(false);
    });

    it('should detect expired token', () => {
      // Mock a token that expired in the past
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const mockToken = `header.${btoa(JSON.stringify({ exp: pastTime }))}.signature`;
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = authService.isTokenExpired();

      expect(result).toBe(true);
    });

    it('should handle invalid token format', () => {
      localStorageMock.getItem.mockReturnValue('invalid_token');

      const result = authService.isTokenExpired();

      expect(result).toBe(true);
    });
  });
});
