/**
 * Call-to-Action Banner for event vendors
 * Features gradient background and compelling messaging for event organizers
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Reusable animated checkmark component
interface AnimatedCheckmarkProps {
  delay?: number;
}

const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({ delay = 0 }) => (
  <motion.svg
    className="w-6 h-6 mr-3 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    transition={{ duration: 0.3, delay }}
    viewport={{ once: true }}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </motion.svg>
);

interface CTABannerProps {
  /** Custom className for additional styling */
  className?: string;
  /** Callback for "Submit Your Event" button click */
  onSubmitEvent?: () => void;
}

export function CTABanner({ className, onSubmitEvent }: CTABannerProps) {
  const handleSubmitEvent = () => {
    if (onSubmitEvent) {
      onSubmitEvent();
    }
  };

  return (
    <section 
      id="submit-cta-section"
      className={cn('relative overflow-hidden', className)}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 60 60"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="cta-pattern"
                x="0"
                y="0"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="15" cy="15" r="3" fill="white" />
                <path
                  d="M15 8 L18 12 L22 12 L19 15 L20 19 L15 17 L10 19 L11 15 L8 12 L12 12 Z"
                  fill="white"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Hosting a Cultural Event?
            </h2>
            
            <p className="text-xl text-orange-100 leading-relaxed mb-8 max-w-lg">
              Join our platform and connect with thousands of culture enthusiasts. 
              Submit your event to reach more people and celebrate our rich heritage together.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-orange-100">
                <AnimatedCheckmark delay={0.2} />
                <span className="text-lg">Free event listing</span>
              </div>

              <div className="flex items-center text-orange-100">
                <AnimatedCheckmark delay={0.3} />
                <span className="text-lg">Reach thousands of attendees</span>
              </div>

              <div className="flex items-center text-orange-100">
                <AnimatedCheckmark delay={0.4} />
                <span className="text-lg">Easy event management</span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmitEvent}
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Submit Your Event
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
          </motion.div>

          {/* Illustration/Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Main illustration container */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                {/* Cultural event icons */}
                <div className="grid grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white/20 rounded-2xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-white">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">Music</p>
                  </motion.div>

                  <motion.div
                    className="bg-white/20 rounded-2xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-white">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">Dance</p>
                  </motion.div>

                  <motion.div
                    className="bg-white/20 rounded-2xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-white">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v9h2v-9zm4 0h-2v9h2v-9zm4 0h-2v9h2v-9zm2.5-9H18V0h-2v2H8V0H6v2H3.5C2.67 2 2 2.67 2 3.5v1C2 5.33 2.67 6 3.5 6H4v13.5C4 20.88 5.12 22 6.5 22h11c1.38 0 2.5-1.12 2.5-2.5V6h.5C21.33 6 22 5.33 22 4.5v-1C22 2.67 21.33 2 20.5 2z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">Festival</p>
                  </motion.div>

                  <motion.div
                    className="bg-white/20 rounded-2xl p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-white">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">Art</p>
                  </motion.div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-300 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;
