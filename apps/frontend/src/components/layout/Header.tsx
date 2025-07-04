/**
 * Header component with sticky navigation and Submit Event CTA
 * Mobile-first responsive design with hamburger menu
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, Plus } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

interface HeaderProps {
  /** Custom className for additional styling */
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
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
    if (isAuthenticated) {
      router.push('/dashboard/submit-event');
    } else {
      router.push('/login');
    }
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user?.name) {
      const names = user.name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return 'U';
  };

  const navigationItems = [
    { label: 'Events', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Additional navigation items for authenticated users
  const authenticatedNavItems = isAuthenticated ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Events', href: '/dashboard/events' },
  ] : [];

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
            {/* Authenticated user navigation */}
            {isAuthenticated && authenticatedNavItems.map((item) => (
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

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Submit Event Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmitEvent}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                {isAuthenticated ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Event
                  </>
                ) : (
                  'Submit Event'
                )}
              </Button>
            </motion.div>

            {/* User Menu for Authenticated Users */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profile?.avatar} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="font-medium">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmitEvent}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 py-2 rounded-lg text-sm"
              >
                {isAuthenticated ? <Plus className="w-4 h-4" /> : 'Submit'}
              </Button>
            </motion.div>

            {/* Mobile User Avatar for Authenticated Users */}
            {isAuthenticated && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            )}

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
                <div className="flex flex-col h-full">
                  {/* User Info for Authenticated Users */}
                  {isAuthenticated && (
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-200 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.profile?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-orange-100 text-orange-700">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.profile?.role}</p>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-6" role="none">
                    {/* Regular Navigation Items */}
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

                    {/* Authenticated User Navigation */}
                    {isAuthenticated && authenticatedNavItems.map((item, index) => (
                      <Link key={item.label} href={item.href}>
                        <motion.span
                          role="menuitem"
                          tabIndex={0}
                          className="text-lg font-medium text-gray-900 hover:text-orange-500 transition-colors duration-200 cursor-pointer block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md px-2 py-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navigationItems.length + index) * 0.1 }}
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

                  {/* Mobile Auth Actions */}
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    {isAuthenticated ? (
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login">
                          <Button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full"
                          >
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button
                            onClick={() => setIsMobileMenuOpen(false)}
                            variant="outline"
                            className="w-full"
                          >
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
