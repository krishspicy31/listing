/**
 * API client with automatic JWT token handling and retry logic
 * Automatically injects authorization headers and handles token refresh
 */

import { authService } from '@/features/vendor-dashboard/services/authService';

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
  retryOnUnauthorized?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

class ApiClient {
  private readonly baseUrl: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Make an API request with automatic token handling
   */
  async request<T = any>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true,
      retryOnUnauthorized = true,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if required and available
    if (requireAuth) {
      const token = authService.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else if (authService.isAuthenticated()) {
        // User should be authenticated but no token available
        return {
          success: false,
          error: {
            message: 'Authentication required',
            status: 401,
          },
        };
      }
    }

    // Prepare request config
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include httpOnly cookies for refresh tokens
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && requireAuth && retryOnUnauthorized) {
        return this.handleUnauthorized(endpoint, options);
      }

      // Parse response
      const responseData = await this.parseResponse(response);

      if (response.ok) {
        return {
          success: true,
          data: responseData,
        };
      } else {
        return {
          success: false,
          error: {
            message: responseData.error || responseData.message || 'Request failed',
            status: response.status,
            details: responseData,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          details: error,
        },
      };
    }
  }

  /**
   * Handle unauthorized responses with token refresh
   */
  private async handleUnauthorized<T>(
    endpoint: string,
    options: ApiClientOptions
  ): Promise<ApiResponse<T>> {
    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshSuccess = await authService.refreshToken();
      
      if (refreshSuccess) {
        // Process queued requests
        this.processQueue(null);
        
        // Retry original request
        return this.request<T>(endpoint, { ...options, retryOnUnauthorized: false });
      } else {
        // Refresh failed, redirect to login
        this.processQueue(new Error('Token refresh failed'));
        
        // Clear auth state and redirect to login
        await authService.logout();
        
        // If we're in a browser environment, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return {
          success: false,
          error: {
            message: 'Authentication expired. Please log in again.',
            status: 401,
          },
        };
      }
    } catch (error) {
      this.processQueue(error);
      return {
        success: false,
        error: {
          message: 'Authentication error',
          status: 401,
          details: error,
        },
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T = any>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
