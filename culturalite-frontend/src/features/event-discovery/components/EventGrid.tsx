/**
 * EventGrid component for displaying events in a responsive grid layout
 * Implements specified breakpoints and accessibility features
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface EventGridProps {
  /** Array of events to display */
  events: Event[];
  /** Custom className for additional styling */
  className?: string;
  /** Optional click handler for event cards */
  onEventClick?: (event: Event) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Optional retry handler for error state */
  onRetry?: () => void;
  /** Optional submit event handler for empty state */
  onSubmitEvent?: () => void;
  /** Whether the current empty state is due to active filters */
  hasActiveFilters?: boolean;
  /** Handler for clearing filters when no results found */
  onClearFilters?: () => void;
}

/**
 * Empty state component when no events are available
 * Follows front-end spec for user-friendly messaging
 */
function EmptyState({
  message,
  onSubmitEvent,
  hasActiveFilters = false,
  onClearFilters
}: {
  message: string;
  onSubmitEvent?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div 
      className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Empty state icon */}
      <div className="w-16 h-16 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" 
          />
        </svg>
      </div>
      
      {/* Empty state message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Events Found
      </h3>
      <p className="text-gray-600 max-w-md leading-relaxed">
        {message}
      </p>
      
      {/* Clear Filters Button (for filtered empty states) */}
      {hasActiveFilters && onClearFilters && (
        <div className="mt-6">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            onClick={onClearFilters}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Filters
          </button>
        </div>
      )}

      {/* Call to action for organizers (only when no active filters) */}
      {!hasActiveFilters && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3">
            Are you an event organizer?
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            onClick={() => {
              if (onSubmitEvent) {
                onSubmitEvent();
              } else {
                // Fallback navigation to login page for event submission
                window.location.href = '/login';
              }
            }}
          >
            Submit Your Event
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Error state component for API errors
 * Provides retry functionality and user-friendly messaging
 */
function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <div 
      className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Error icon */}
      <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      {/* Error message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Events
      </h3>
      <p className="text-gray-600 max-w-md leading-relaxed mb-6">
        {error}
      </p>
      
      {/* Retry button */}
      {onRetry && (
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          onClick={onRetry}
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * EventGrid component with responsive layout and accessibility
 * Implements specified breakpoints:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1024px): 2 columns  
 * - Desktop (1024px - 1440px): 3 columns
 * - Large screens (> 1440px): 4 columns
 */
export function EventGrid({
  events,
  className,
  onEventClick,
  isLoading = false,
  error,
  onRetry,
  onSubmitEvent,
  hasActiveFilters = false,
  onClearFilters
}: EventGridProps) {
  // Handle error state
  if (error) {
    return (
      <div 
        className={cn(
          'grid grid-cols-1',
          className
        )}
        role="main"
        aria-label="Events grid"
      >
        <ErrorState
          error={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // Handle empty state
  if (!isLoading && events.length === 0) {
    const emptyMessage = hasActiveFilters
      ? "No events found for your selected filters. Try adjusting your search criteria or clear filters to see all events."
      : "No events are currently available. Check back soon for new cultural experiences!";

    return (
      <div
        className={cn(
          'grid grid-cols-1',
          className
        )}
        role="main"
        aria-label="Events grid"
      >
        <EmptyState
          message={emptyMessage}
          onSubmitEvent={onSubmitEvent}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        // Responsive grid with specified breakpoints
        'grid gap-6',
        'grid-cols-1', // Mobile: 1 column (< 768px)
        'md:grid-cols-2', // Tablet: 2 columns (768px - 1024px)
        'lg:grid-cols-3', // Desktop: 3 columns (1024px - 1440px)  
        '2xl:grid-cols-4', // Large: 4 columns (> 1440px)
        className
      )}
      role="main"
      aria-label={`Events grid showing ${events.length} events`}
    >
      {events.map((event) => (
        <div
          key={event.id}
          className="focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 rounded-xl"
        >
          <EventCard
            event={event}
            onClick={onEventClick}
            className="h-full" // Ensure consistent card heights
          />
        </div>
      ))}
    </div>
  );
}

export default EventGrid;
