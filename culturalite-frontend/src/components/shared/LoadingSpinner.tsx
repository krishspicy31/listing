/**
 * LoadingSpinner component for displaying loading states
 * Follows accessibility guidelines and brand colors from front-end spec
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for additional styling */
  className?: string;
  /** Loading message for screen readers */
  message?: string;
  /** Whether to show the loading text */
  showText?: boolean;
}

/**
 * Accessible loading spinner component
 * Uses brand primary color (#F97316) and proper ARIA attributes
 */
export function LoadingSpinner({ 
  size = 'md', 
  className,
  message = 'Loading events...',
  showText = true
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center space-y-3',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Animated spinner using CSS animation */}
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-orange-500',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      
      {/* Loading text */}
      {showText && (
        <p 
          className={cn(
            'text-gray-600 font-medium',
            textSizeClasses[size]
          )}
        >
          {message}
        </p>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">
        {message}
      </span>
    </div>
  );
}

/**
 * Inline loading spinner for smaller spaces
 * Minimal version without text
 */
export function InlineLoadingSpinner({ 
  size = 'sm',
  className 
}: Pick<LoadingSpinnerProps, 'size' | 'className'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-orange-500',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full page loading overlay
 * Used for initial page loads
 */
export function FullPageLoader({ 
  message = 'Loading...' 
}: Pick<LoadingSpinnerProps, 'message'>) {
  return (
    <div 
      className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
      role="status"
      aria-live="assertive"
      aria-label={message}
    >
      <LoadingSpinner 
        size="lg" 
        message={message}
        showText={true}
      />
    </div>
  );
}

export default LoadingSpinner;
