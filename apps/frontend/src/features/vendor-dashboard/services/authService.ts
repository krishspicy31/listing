/**
 * Authentication service for vendor registration, login, and JWT token management
 * Handles secure token storage and automatic refresh
 */

export interface LoginCredentials {
  username: string; // Email used as username
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  organization_name?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  profile: {
    id: number;
    role: string;
    organization_name?: string;
    phone_number?: string;
    website?: string;
    bio?: string;
    avatar?: string;
    city?: string;
    country?: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface AuthResponse {
  access: string;
  user: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'culturalite_access_token';
  private readonly USER_KEY = 'culturalite_user';
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  // Note: Refresh token is now stored in httpOnly cookie, not localStorage

  /**
   * Register a new vendor user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ message: string; user: User }>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result,
        };
      } else {
        return {
          success: false,
          error: {
            message: result.error || 'Registration failed',
            details: result.details || result,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Registration failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Login user and store JWT tokens
   * Refresh token is automatically stored in httpOnly cookie by the server
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for httpOnly refresh token
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok) {
        // Store access token and user data (refresh token is in httpOnly cookie)
        this.setAccessToken(result.access);
        this.setUser(result.user);

        return {
          success: true,
          data: result,
        };
      } else {
        return {
          success: false,
          error: {
            message: result.error || 'Login failed',
            details: result.details || result,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Network error during login',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Logout user and clear stored data
   * Refresh token in httpOnly cookie is automatically sent and cleared by server
   */
  async logout(): Promise<void> {
    try {
      // Attempt to blacklist the refresh token on the server
      await fetch(`${this.API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        credentials: 'include', // Include httpOnly cookie with refresh token
      });
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Failed to logout on server:', error);
    } finally {
      // Always clear local storage (httpOnly cookie is cleared by server)
      this.clearTokens();
      this.clearUser();
    }
  }

  /**
   * Refresh access token using httpOnly cookie refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include httpOnly cookie with refresh token
      });

      if (response.ok) {
        const result = await response.json();

        // Update stored access token (refresh token is automatically updated in cookie)
        this.setAccessToken(result.access);

        return true;
      } else {
        // Refresh failed, clear stored tokens
        this.clearTokens();
        this.clearUser();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on network error
      this.clearTokens();
      this.clearUser();
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const user = this.getUser();

    // Check if we have both token and user data
    if (!accessToken || !user) {
      return false;
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      return false;
    }

    return true;
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get current user data
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Set access token
   */
  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set user data
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all tokens (access token only, refresh token is in httpOnly cookie)
   */
  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Clear user data
   */
  private clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}

// Export singleton instance
export const authService = new AuthService();
