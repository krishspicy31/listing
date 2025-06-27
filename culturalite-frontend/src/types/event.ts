/**
 * TypeScript interfaces for Event data matching backend API response
 * Based on Django Event and Category models from Story 1.3
 */

/**
 * Category interface matching backend CategorySerializer
 * Contains basic category information for nested representation in events
 */
export interface Category {
  /** Category name (e.g., 'Music', 'Dance', 'Festival') */
  name: string;
  /** URL-friendly version of the name */
  slug: string;
}

/**
 * Event interface matching backend EventSerializer
 * Contains all required fields for public API with nested category information
 */
export interface Event {
  /** Unique event identifier */
  id: number;
  /** Event title */
  title: string;
  /** Detailed event description */
  description: string;
  /** City where the event takes place */
  city: string;
  /** Event date and time in ISO 8601 format */
  event_date: string;
  /** URL of the event's image hosted on Cloudinary */
  image_url: string;
  /** Nested category object */
  category: Category;
}

/**
 * API response interface for paginated event list
 * Matches Django REST Framework pagination format
 */
export interface EventListResponse {
  /** Total number of events */
  count: number;
  /** URL for next page of results (null if no next page) */
  next: string | null;
  /** URL for previous page of results (null if no previous page) */
  previous: string | null;
  /** Array of event objects */
  results: Event[];
}

/**
 * API error response interface
 * Standard error format for API responses
 */
export interface ApiError {
  /** Error message */
  error: string;
  /** Optional detailed error information */
  details?: string;
}

/**
 * Event service response type
 * Union type for successful response or error
 */
export type EventServiceResponse = EventListResponse | ApiError;

/**
 * Query parameters for event filtering
 * Supports city and category filtering as implemented in backend
 */
export interface EventQueryParams {
  /** Filter events by city (case-insensitive) */
  city?: string;
  /** Filter events by category name (case-insensitive) */
  category?: string;
}
