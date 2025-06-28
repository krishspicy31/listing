/**
 * Header component with sticky navigation and Submit Event CTA
 * Mobile-first responsive design with hamburger menu
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface HeaderProps {
  /** Custom className for additional styling */
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  // Throttle utility function
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // Handle scroll effect for header background with throttling
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 10);
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [throttle]);

  // Handle focus management for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && firstMenuItemRef.current) {
      // Focus the first menu item when menu opens
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 100); // Small delay to ensure the menu is rendered
    }
  }, [isMobileMenuOpen]);

  const handleSubmitEvent = () => {
    router.push('/login');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const navigationItems = [
    { label: 'Events', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' 
          : 'bg-white border-b border-gray-100',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 cursor-pointer"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="md" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <motion.span
                  className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-200 cursor-pointer"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmitEvent}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                Submit Event
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmitEvent}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Submit
              </Button>
            </motion.div>

            {/* Hamburger Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <motion.div
                    animate={isMobileMenuOpen ? "open" : "closed"}
                    className="w-6 h-6 flex flex-col justify-center items-center"
                  >
                    <motion.span
                      className="w-5 h-0.5 bg-gray-600 block"
                      variants={{
                        closed: { rotate: 0, y: 0 },
                        open: { rotate: 45, y: 6 }
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="w-5 h-0.5 bg-gray-600 block mt-1"
                      variants={{
                        closed: { opacity: 1 },
                        open: { opacity: 0 }
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="w-5 h-0.5 bg-gray-600 block mt-1"
                      variants={{
                        closed: { rotate: 0, y: 0 },
                        open: { rotate: -45, y: -6 }
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64"
                id="mobile-menu"
                role="menu"
                aria-label="Mobile navigation menu"
              >
                <nav className="flex flex-col space-y-6 mt-8" role="none">
                  {navigationItems.map((item, index) => (
                    <Link key={item.label} href={item.href}>
                      <motion.span
                        ref={index === 0 ? firstMenuItemRef : null}
                        role="menuitem"
                        tabIndex={0}
                        className="text-lg font-medium text-gray-900 hover:text-orange-500 transition-colors duration-200 cursor-pointer block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md px-2 py-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                          }
                        }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
