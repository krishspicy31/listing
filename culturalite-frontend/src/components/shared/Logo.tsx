/**
 * Logo component for CulturaLite brand
 * Responsive logo with cultural design elements
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Size variant of the logo */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for additional styling */
  className?: string;
  /** Whether to show text alongside the icon */
  showText?: boolean;
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Logo Icon - Cultural mandala-inspired design */}
      <div className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg',
        sizeClasses[size]
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3/5 h-3/5"
          role="img"
          aria-label="CulturaLite logo - Cultural mandala design"
        >
          <title>CulturaLite Logo</title>
          {/* Simplified mandala/cultural pattern */}
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 7l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z"/>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={cn(
          'font-bold text-gray-900 tracking-tight',
          textSizeClasses[size]
        )}>
          Cultura<span className="text-orange-500">Lite</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
