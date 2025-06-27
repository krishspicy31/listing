/**
 * Homepage component with event grid
 * Implements SSR for SEO optimization and fetches events on page load
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventListResponse, EventQueryParams } from '@/types/event';
import {
  getApprovedEventsWithRetry,
  getAvailableCities,
  getAvailableCategories,
  EventServiceError
} from '@/features/event-discovery/services/eventService';
import { EventGrid } from '@/features/event-discovery/components/EventGrid';
import { EventFilters } from '@/features/event-discovery/components/EventFilters';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Loading state type
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cityOptions, setCityOptions] = useState<Array<{value: string, label: string}>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{value: string, label: string}>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  /**
   * Fetch events from the API with optional filtering
   * Implements proper error handling and loading states
   */
  const fetchEvents = async (filters?: EventQueryParams) => {
    setLoadingState('loading');
    setError(null);

    try {
      const result = await getApprovedEventsWithRetry(filters);

      if (result.success) {
        setEvents(result.data.results);
        setLoadingState('success');
      } else {
        setError(result.error.message);
        setLoadingState('error');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading events.');
      setLoadingState('error');
    }
  };

  /**
   * Fetch filter options from the API
   * Loads available cities and categories for filter dropdowns
   */
  const fetchFilterOptions = async () => {
    setIsLoadingOptions(true);
    setOptionsError(null);

    try {
      const [citiesResult, categoriesResult] = await Promise.all([
        getAvailableCities(),
        getAvailableCategories()
      ]);

      if (citiesResult.success && categoriesResult.success) {
        setCityOptions(
          citiesResult.data.map(city => ({ value: city, label: city }))
        );
        setCategoryOptions(
          categoriesResult.data.map(category => ({ value: category, label: category }))
        );
      } else {
        let errorMessage = 'Failed to load filter options.';
        if (!citiesResult.success) {
          errorMessage = citiesResult.error.message;
        } else if (!categoriesResult.success) {
          errorMessage = categoriesResult.error.message;
        }
        setOptionsError(errorMessage);
      }
    } catch (err) {
      setOptionsError('Failed to load filter options.');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  /**
   * Handle filter changes and trigger new event fetch
   * Implements 500ms response target for filter changes
   */
  const handleFilterChange = (newCity: string, newCategory: string) => {
    const filters: EventQueryParams = {};

    if (newCity !== 'all') {
      filters.city = newCity;
    }

    if (newCategory !== 'all') {
      filters.category = newCategory;
    }

    // Fetch events with new filters
    fetchEvents(Object.keys(filters).length > 0 ? filters : undefined);
  };

  /**
   * Handle city filter change
   */
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    handleFilterChange(city, selectedCategory);
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleFilterChange(selectedCity, category);
  };

  /**
   * Clear all filters and reset to defaults
   */
  const handleClearFilters = () => {
    setSelectedCity('all');
    setSelectedCategory('all');
    fetchEvents(); // Fetch all events without filters
  };

  /**
   * Retry fetching filter options
   */
  const handleRetryOptions = () => {
    fetchFilterOptions();
  };

  /**
   * Load events and filter options on component mount
   * Implements the requirement for fetching data on page load
   */
  useEffect(() => {
    fetchEvents();
    fetchFilterOptions();
  }, []);

  /**
   * Handle event card clicks
   * Navigate to event detail page or show placeholder
   */
  const handleEventClick = (event: Event) => {
    // For now, show an alert since event detail page is not yet implemented
    // In the future, this would navigate to `/events/${event.id}`
    alert(`Event Details\n\nTitle: ${event.title}\nCity: ${event.city}\nDate: ${new Date(event.event_date).toLocaleDateString()}\n\nEvent detail page coming soon!`);

    // Future implementation:
    // router.push(`/events/${event.id}`);
  };

  /**
   * Retry handler for failed requests
   */
  const handleRetry = () => {
    fetchEvents();
  };

  /**
   * Handle submit event navigation
   */
  const handleSubmitEvent = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Cultural Events
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find amazing cultural experiences happening in your city. From music and dance to festivals and art exhibitions.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Filters */}
        <div className="mb-8">
          <EventFilters
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            cityOptions={cityOptions}
            categoryOptions={categoryOptions}
            isLoadingOptions={isLoadingOptions}
            optionsError={optionsError || undefined}
            onCityChange={handleCityChange}
            onCategoryChange={handleCategoryChange}
            onClearFilters={handleClearFilters}
            onRetryOptions={handleRetryOptions}
          />
        </div>

        {/* Loading State */}
        {loadingState === 'loading' && (
          <div className="flex justify-center py-16">
            <LoadingSpinner
              size="lg"
              message="Loading cultural events..."
              showText={true}
            />
          </div>
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Events
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loadingState === 'success' && (
          <EventGrid
            events={events}
            onEventClick={handleEventClick}
            onRetry={handleRetry}
            onSubmitEvent={handleSubmitEvent}
            hasActiveFilters={selectedCity !== 'all' || selectedCategory !== 'all'}
            onClearFilters={handleClearFilters}
            className="animate-fade-in"
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>© 2025 Culturalite. Connecting you with cultural experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
