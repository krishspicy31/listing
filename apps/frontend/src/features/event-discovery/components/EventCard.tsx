/**
 * EventCard component for displaying individual event information
 * Uses shadcn/ui Card component with accessibility and responsive design
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Event } from '@/types/event';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EventCardProps {
  /** Event data to display */
  event: Event;
  /** Custom className for additional styling */
  className?: string;
  /** Optional click handler for card interaction */
  onClick?: (event: Event) => void;
}

/**
 * Format date for display
 * Converts ISO 8601 date to readable format
 */
function formatEventDate(dateString: string): string {
  // Check for null or undefined dateString
  if (!dateString) {
    console.warn('formatEventDate: dateString is null or undefined');
    return 'Date TBD';
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('formatEventDate: Invalid date string:', dateString);
      return 'Date TBD';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('formatEventDate: Error parsing date:', dateString, error);
    return 'Date TBD';
  }
}

/**
 * Truncate text to specified number of lines
 * Uses CSS for proper ellipsis handling
 */
function TruncatedText({
  text,
  maxLines = 2,
  className
}: {
  text: string;
  maxLines?: number;
  className?: string;
}) {
  // Generate dynamic line-clamp class
  const lineClampClass = `line-clamp-${maxLines}`;

  return (
    <p
      className={cn(
        'overflow-hidden text-ellipsis',
        lineClampClass,
        className
      )}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
      }}
      title={text} // Show full text on hover
    >
      {text}
    </p>
  );
}

/**
 * EventCard component with full accessibility support
 * Implements 16:9 aspect ratio images, keyboard navigation, and ARIA labels
 */
export function EventCard({ event, className, onClick }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(event);
    }
  };

  // Generate alt text for accessibility
  const imageAlt = `Event image for ${event.title} in ${event.city}`;
  
  // Generate ARIA label for the card
  const cardAriaLabel = `${event.title}, ${event.category.name} event in ${event.city} on ${formatEventDate(event.event_date)}`;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
        'focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2',
        'bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={cardAriaLabel}
    >
      <CardContent className="p-0">
        {/* Image Container with 16:9 Aspect Ratio */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse bg-gray-200 w-full h-full" />
            </div>
          )}
          
          <Image
            src={imageError ? '/images/event-placeholder.svg' : event.image_url}
            alt={imageAlt}
            fill
            className={cn(
              'object-cover transition-transform duration-200 group-hover:scale-105',
              imageLoading && 'opacity-0'
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
            priority={false} // Enable lazy loading for performance
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm"
              aria-label={`Category: ${event.category.name}`}
            >
              {event.category.name}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Event Title */}
          <TruncatedText
            text={event.title}
            maxLines={2}
            className="text-lg font-semibold text-gray-900 leading-tight"
          />

          {/* Date and City */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span 
              className="flex items-center space-x-1"
              aria-label={`Date: ${formatEventDate(event.event_date)}`}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span>{formatEventDate(event.event_date)}</span>
            </span>

            <span 
              className="flex items-center space-x-1"
              aria-label={`Location: ${event.city}`}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <span>{event.city}</span>
            </span>
          </div>

          {/* Event Description Preview */}
          <TruncatedText
            text={event.description}
            maxLines={2}
            className="text-sm text-gray-600 leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default EventCard;
