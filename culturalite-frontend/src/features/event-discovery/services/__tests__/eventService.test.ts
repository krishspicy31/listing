/**
 * Unit tests for eventService
 * Tests API calls, error handling, and retry mechanisms
 */

import { getApprovedEvents, getApprovedEventsWithRetry, EventServiceError } from '../eventService';
import { EventListResponse } from '@/types/event';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock event data
const mockEventResponse: EventListResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      title: 'Jazz Night',
      description: 'Jazz music event',
      city: 'New York',
      event_date: '2025-07-15T19:00:00.000Z',
      image_url: 'https://example.com/jazz.jpg',
      category: { name: 'Music', slug: 'music' }
    },
    {
      id: 2,
      title: 'Art Exhibition',
      description: 'Modern art exhibition',
      city: 'Los Angeles',
      event_date: '2025-07-20T10:00:00.000Z',
      image_url: 'https://example.com/art.jpg',
      category: { name: 'Art', slug: 'art' }
    }
  ]
};

describe('eventService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getApprovedEvents', () => {
    it('fetches events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventResponse,
      } as Response);

      const result = await getApprovedEvents();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockEventResponse);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events/',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('builds query string correctly for city filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventResponse,
      } as Response);

      await getApprovedEvents({ city: 'New York' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events/?city=New+York',
        expect.any(Object)
      );
    });

    it('builds query string correctly for category filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventResponse,
      } as Response);

      await getApprovedEvents({ category: 'Music' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events/?category=Music',
        expect.any(Object)
      );
    });

    it('builds query string correctly for both filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventResponse,
      } as Response);

      await getApprovedEvents({ city: 'New York', category: 'Music' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events/?city=New+York&category=Music',
        expect.any(Object)
      );
    });

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error occurred' }),
      } as Response);

      const result = await getApprovedEvents();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Server error occurred');
        expect(result.error.statusCode).toBe(500);
      }
    });

    it('handles HTTP error without JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => { throw new Error('Invalid JSON'); },
      } as Response);

      const result = await getApprovedEvents();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('HTTP 404: Not Found');
        expect(result.error.statusCode).toBe(404);
      }
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await getApprovedEvents();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Unable to connect to the server');
        expect(result.error.statusCode).toBe(0);
      }
    });

    it('handles invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await getApprovedEvents();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid response format from server');
      }
    });

    it('handles invalid events data format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: 'not an array' }),
      } as Response);

      const result = await getApprovedEvents();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid events data format');
      }
    });
  });

  describe('getApprovedEventsWithRetry', () => {
    it('succeeds on first attempt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventResponse,
      } as Response);

      const result = await getApprovedEventsWithRetry();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on server errors with exponential backoff', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: async () => ({ error: 'Server error' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: async () => ({ error: 'Server error' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEventResponse,
        } as Response);

      const resultPromise = getApprovedEventsWithRetry();

      // Fast-forward timers for exponential backoff
      await jest.advanceTimersByTimeAsync(1000); // First retry after 1s
      await jest.advanceTimersByTimeAsync(2000); // Second retry after 2s

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 10000); // Increase timeout

    it('does not retry on client errors (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not found' }),
      } as Response);

      const result = await getApprovedEventsWithRetry();

      expect(result.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    }, 10000);

    it('stops retrying after max attempts', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      const resultPromise = getApprovedEventsWithRetry(undefined, 2);

      // Fast-forward through all retry delays
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000);
  });

  describe('EventServiceError', () => {
    it('creates error with message and status code', () => {
      const error = new EventServiceError('Test error', 500);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('EventServiceError');
    });

    it('creates error with original error', () => {
      const originalError = new Error('Original');
      const error = new EventServiceError('Test error', 500, originalError);
      
      expect(error.originalError).toBe(originalError);
    });
  });
});
