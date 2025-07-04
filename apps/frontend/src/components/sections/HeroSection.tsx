/**
 * Hero section with compelling messaging and call-to-action
 * Features gradient background and cultural design elements
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  /** Custom className for additional styling */
  className?: string;
  /** Callback for "Start Browsing" button click */
  onStartBrowsing?: () => void;
}

export function HeroSection({ className, onStartBrowsing }: HeroSectionProps) {
  const handleStartBrowsing = () => {
    if (onStartBrowsing) {
      onStartBrowsing();
    } else {
      // Default behavior: scroll to events section
      const eventsSection = document.getElementById('events-section');
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Cultural pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="cultural-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="2" fill="currentColor" />
                <path
                  d="M10 5 L12 8 L15 8 L12.5 10.5 L13.5 13.5 L10 11.5 L6.5 13.5 L7.5 10.5 L5 8 L8 8 Z"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cultural-pattern)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Discover Cultural Events{' '}
            <span className="text-orange-500 relative">
              Near You
              {/* Decorative underline */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Celebrate music, dance, and tradition — all in one place. 
            Connect with your cultural heritage and discover amazing experiences happening in your city.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleStartBrowsing}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Start Browsing Events
                <motion.svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-lg"
                onClick={() => {
                  try {
                    const submitSection = document.getElementById('submit-cta-section');
                    if (submitSection) {
                      submitSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      console.warn('Submit CTA section element not found for smooth scroll');
                    }
                  } catch (error) {
                    console.error('Error during smooth scroll to submit section:', error);
                  }
                }}
              >
                Submit Your Event
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats or Trust Indicators */}
          <motion.div
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
              <div className="text-sm text-gray-600 font-medium">Cultural Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
              <div className="text-sm text-gray-600 font-medium">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">10K+</div>
              <div className="text-sm text-gray-600 font-medium">Happy Attendees</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 text-orange-200 opacity-30">
        <motion.svg
          viewBox="0 0 24 24"
          fill="currentColor"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </motion.svg>
      </div>

      <div className="absolute bottom-10 right-10 w-16 h-16 text-orange-200 opacity-30">
        <motion.svg
          viewBox="0 0 24 24"
          fill="currentColor"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none" />
        </motion.svg>
      </div>
    </section>
  );
}

export default HeroSection;
