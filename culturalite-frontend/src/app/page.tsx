/**
 * CulturaLite Homepage - Mobile-first cultural events discovery platform
 * Features hero section, event grid, filters, and vendor CTA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Event, EventQueryParams } from '@/types/event';
import {
  getApprovedEventsWithRetry,
  getAvailableCities,
  getAvailableCategories
} from '@/features/event-discovery/services/eventService';
import { EventGrid } from '@/features/event-discovery/components/EventGrid';
import { EventFilters } from '@/features/event-discovery/components/EventFilters';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { CTABanner } from '@/components/sections/CTABanner';

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

  // Reduced motion preference detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
    } catch (error) {
      console.error('Error fetching events:', error);
      const errorMessage = error instanceof Error
        ? `Failed to load events: ${error.message}`
        : 'An unexpected error occurred while loading events.';
      setError(errorMessage);
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
    } catch (error) {
      console.error('Error fetching filter options:', error);
      const errorMessage = error instanceof Error
        ? `Failed to load filter options: ${error.message}`
        : 'Failed to load filter options.';
      setOptionsError(errorMessage);
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection onStartBrowsing={() => {
        try {
          const eventsSection = document.getElementById('events-section');
          if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.warn('Events section element not found for smooth scroll');
          }
        } catch (error) {
          console.error('Error during smooth scroll:', error);
        }
      }} />

      {/* Main Content */}
      <main id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Happening Now
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing cultural experiences in your city
          </p>
        </motion.div>
        {/* Event Filters - Sticky on scroll */}
        <motion.div
          className="sticky top-16 lg:top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
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
        </motion.div>

        {/* Loading State */}
        {loadingState === 'loading' && (
          <motion.div
            className="flex justify-center py-16"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          >
            <LoadingSpinner
              size="lg"
              message="Loading cultural events..."
              showText={true}
            />
          </motion.div>
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <motion.div
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
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
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Events
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <motion.button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                onClick={handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Events Grid */}
        {loadingState === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EventGrid
              events={events}
              onEventClick={handleEventClick}
              onRetry={handleRetry}
              onSubmitEvent={handleSubmitEvent}
              hasActiveFilters={selectedCity !== 'all' || selectedCategory !== 'all'}
              onClearFilters={handleClearFilters}
              className="animate-fade-in"
            />
          </motion.div>
        )}
      </main>

      {/* CTA Banner for Vendors */}
      <CTABanner onSubmitEvent={handleSubmitEvent} className="mt-16" />

      {/* Footer */}
      <Footer className="mt-16" />
    </div>
  );
}
