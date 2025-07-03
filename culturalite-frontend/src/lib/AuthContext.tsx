'use client';

/**
 * Authentication context provider for managing global auth state
 * Provides user authentication status, user data, and auth methods
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginCredentials, RegisterData, ApiResponse } from '@/features/vendor-dashboard/services/authService';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Methods
  login: (credentials: LoginCredentials) => Promise<ApiResponse<any>>;
  register: (data: RegisterData) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from stored data
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        const storedUser = authService.getUser();
        
        if (storedUser) {
          // Check if token is expired
          if (authService.isTokenExpired()) {
            // Try to refresh token
            const refreshSuccess = await authService.refreshToken();
            
            if (refreshSuccess) {
              setUser(storedUser);
            } else {
              // Refresh failed, clear auth state
              await authService.logout();
              setUser(null);
            }
          } else {
            setUser(storedUser);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted auth state
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginCredentials): Promise<ApiResponse<any>> => {
    try {
      setIsLoading(true);
      
      const result = await authService.login(credentials);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Login failed',
          details: error,
        },
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<ApiResponse<any>> => {
    try {
      setIsLoading(true);
      
      const result = await authService.register(data);
      
      if (result.success) {
        // Redirect to login page after successful registration
        router.push('/login?message=Registration successful! Please log in to continue.');
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Registration failed',
          details: error,
        },
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear auth state
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await authService.logout();
      setUser(null);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout request fails
      setUser(null);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data from storage
   */
  const refreshUser = () => {
    const storedUser = authService.getUser();
    setUser(storedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  return auth;
}
