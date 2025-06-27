/**
 * EventFilters component for filtering events by city and category
 * Uses shadcn/ui Select components with accessibility and responsive design
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Filter option interfaces
interface FilterOption {
  value: string;
  label: string;
}

interface EventFiltersProps {
  /** Current city filter value */
  selectedCity: string;
  /** Current category filter value */
  selectedCategory: string;
  /** Available city options */
  cityOptions: FilterOption[];
  /** Available category options */
  categoryOptions: FilterOption[];
  /** Loading state for filter options */
  isLoadingOptions?: boolean;
  /** Error state for filter options */
  optionsError?: string;
  /** Handler for city filter change */
  onCityChange: (city: string) => void;
  /** Handler for category filter change */
  onCategoryChange: (category: string) => void;
  /** Handler for clearing all filters */
  onClearFilters: () => void;
  /** Custom className for additional styling */
  className?: string;
  /** Handler for retrying failed filter options fetch */
  onRetryOptions?: () => void;
}

/**
 * Loading skeleton for filter dropdowns
 */
function FilterSkeleton() {
  return (
    <div className="h-9 w-full bg-gray-200 animate-pulse rounded-md" />
  );
}

/**
 * Error state component for filter options
 */
function FilterError({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            className="w-5 h-5 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-sm text-red-700">{error}</span>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * EventFilters component with responsive layout and accessibility
 * Implements city and category filtering with proper loading and error states
 */
export function EventFilters({
  selectedCity,
  selectedCategory,
  cityOptions,
  categoryOptions,
  isLoadingOptions = false,
  optionsError,
  onCityChange,
  onCategoryChange,
  onClearFilters,
  className,
  onRetryOptions
}: EventFiltersProps) {
  // Track if any filters are active (not default values)
  const hasActiveFilters = selectedCity !== 'all' || selectedCategory !== 'all';

  // Handle error state
  if (optionsError) {
    return (
      <div className={cn('w-full', className)}>
        <FilterError error={optionsError} onRetry={onRetryOptions} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'w-full space-y-4',
        className
      )}
      role="search"
      aria-label="Event filters"
    >
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* City Filter */}
        <div className="flex-1 min-w-0">
          <label 
            htmlFor="city-filter" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City
          </label>
          {isLoadingOptions ? (
            <FilterSkeleton />
          ) : (
            <Select
              value={selectedCity}
              onValueChange={onCityChange}
            >
              <SelectTrigger 
                id="city-filter"
                className="w-full min-h-[44px] sm:min-h-[36px]" // Touch-friendly on mobile
                aria-label="Filter events by city"
              >
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-0">
          <label 
            htmlFor="category-filter" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category
          </label>
          {isLoadingOptions ? (
            <FilterSkeleton />
          ) : (
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
            >
              <SelectTrigger 
                id="category-filter"
                className="w-full min-h-[44px] sm:min-h-[36px]" // Touch-friendly on mobile
                aria-label="Filter events by category"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex-shrink-0 sm:mt-7">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]" // Touch-friendly on mobile
              aria-label="Clear all filters"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Summary (for screen readers) */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {hasActiveFilters ? (
          `Filters active: ${selectedCity !== 'all' ? `City: ${selectedCity}` : ''} ${
            selectedCategory !== 'all' ? `Category: ${selectedCategory}` : ''
          }`.trim()
        ) : (
          'No filters active, showing all events'
        )}
      </div>
    </div>
  );
}

export default EventFilters;
