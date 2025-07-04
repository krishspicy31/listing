/**
 * Event API service for fetching events from the backend
 * Implements proper error handling and TypeScript typing
 */

import {
  EventListResponse,
  EventQueryParams
} from '@/types/event';

/**
 * Base API URL from environment variables
 * Falls back to localhost for development
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Custom error class for API-related errors
 */
export class EventServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EventServiceError';
  }
}

/**
 * Result type for event service operations
 * Provides type-safe success/error handling
 */
export type EventServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: EventServiceError;
};

/**
 * Build query string from parameters
 * Handles optional city and category filtering
 */
function buildQueryString(params?: EventQueryParams): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  if (params.city) {
    searchParams.append('city', params.city);
  }
  
  if (params.category) {
    searchParams.append('category', params.category);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetch approved events from the backend API
 * Supports optional filtering by city and category
 * 
 * @param params - Optional query parameters for filtering
 * @returns Promise with typed result containing events or error
 */
export async function getApprovedEvents(
  params?: EventQueryParams
): Promise<EventServiceResult<EventListResponse>> {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}/events/${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      cache: 'default',
    });

    // Handle non-200 status codes
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        // Runtime validation of error response structure
        if (errorData && typeof errorData === 'object' && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new EventServiceError(
        errorMessage,
        response.status
      );
    }

    // Parse and validate response
    const data = await response.json();

    // Runtime validation of response structure
    if (!data || typeof data !== 'object') {
      throw new EventServiceError('Invalid response format from server');
    }

    // Validate EventListResponse structure
    if (typeof data.count !== 'number' ||
        !Array.isArray(data.results) ||
        (data.next !== null && typeof data.next !== 'string') ||
        (data.previous !== null && typeof data.previous !== 'string')) {
      throw new EventServiceError('Invalid response structure from server');
    }
    return {
      success: true,
      data: data as EventListResponse
    };

  } catch (error) {
    // Handle different types of errors
    if (error instanceof EventServiceError) {
      return {
        success: false,
        error
      };
    }
    
    // Handle network errors, timeout, etc.
    // Check for common network-related TypeError instances
    if (error instanceof TypeError && (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED')
      )) {
      return {
        success: false,
        error: new EventServiceError(
          'Unable to connect to the server. Please check your internet connection.',
          0,
          error
        )
      };
    }
    
    // Handle other unexpected errors
    return {
      success: false,
      error: new EventServiceError(
        'An unexpected error occurred while fetching events.',
        0,
        error
      )
    };
  }
}

/**
 * Retry mechanism for failed requests
 * Implements exponential backoff for better reliability
 * 
 * @param params - Optional query parameters for filtering
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise with typed result containing events or error
 */
export async function getApprovedEventsWithRetry(
  params?: EventQueryParams,
  maxRetries: number = 3
): Promise<EventServiceResult<EventListResponse>> {
  let lastError: EventServiceError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await getApprovedEvents(params);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't retry on client errors (4xx) or final attempt
    if (
      attempt === maxRetries ||
      (result.error.statusCode && result.error.statusCode >= 400 && result.error.statusCode < 500)
    ) {
      break;
    }

    // Exponential backoff: wait 1s, 2s, 4s between retries
    const delay = Math.pow(2, attempt) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Ensure lastError is defined before returning
  if (!lastError) {
    lastError = new EventServiceError('Unknown error occurred during retry attempts');
  }

  return {
    success: false,
    error: lastError
  };
}

/**
 * Fetch available cities from approved events
 * Returns unique city names for filter dropdown
 *
 * @returns Promise with typed result containing city names or error
 */
export async function getAvailableCities(): Promise<EventServiceResult<string[]>> {
  try {
    const url = `${API_BASE_URL}/events/cities/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'default',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch available cities.';

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Use default error message if response is not JSON
      }

      return {
        success: false,
        error: new EventServiceError(errorMessage, response.status)
      };
    }

    const cities: string[] = await response.json();

    return {
      success: true,
      data: cities
    };
  } catch (error) {
    // Handle network errors and other unexpected errors
    return {
      success: false,
      error: new EventServiceError(
        'An unexpected error occurred while fetching cities.',
        0,
        error
      )
    };
  }
}

/**
 * Fetch available categories from the backend
 * Returns all category names for filter dropdown
 *
 * @returns Promise with typed result containing category names or error
 */
export async function getAvailableCategories(): Promise<EventServiceResult<string[]>> {
  try {
    const url = `${API_BASE_URL}/events/categories/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'default',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch available categories.';

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Use default error message if response is not JSON
      }

      return {
        success: false,
        error: new EventServiceError(errorMessage, response.status)
      };
    }

    const categories: string[] = await response.json();

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    // Handle network errors and other unexpected errors
    return {
      success: false,
      error: new EventServiceError(
        'An unexpected error occurred while fetching categories.',
        0,
        error
      )
    };
  }
}
