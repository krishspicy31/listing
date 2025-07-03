'use client';

/**
 * Protected Route Component
 * Wraps components that require authentication and redirects to login if not authenticated
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'vendor' | 'admin';
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Loading component for authentication check
 */
const DefaultLoadingComponent = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Checking Authentication
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we verify your access...
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
      </div>
    </motion.div>
  </div>
);

/**
 * Unauthorized access component
 */
const UnauthorizedComponent = ({ requiredRole }: { requiredRole?: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          {requiredRole 
            ? `You need ${requiredRole} privileges to access this page.`
            : 'You do not have permission to access this page.'
          }
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <a
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * Protected Route Component
 */
export default function ProtectedRoute({
  children,
  requireRole,
  fallbackPath = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
      return;
    }

    // Check role-based access if required
    if (requireRole && user?.profile?.role !== requireRole) {
      // For role mismatch, we don't redirect but show unauthorized component
      return;
    }
  }, [isAuthenticated, isLoading, user, requireRole, router, fallbackPath]);

  // Show loading component while checking authentication
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show unauthorized if not authenticated (while redirect is happening)
  if (!isAuthenticated) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Show unauthorized if role requirement not met
  if (requireRole && user?.profile?.role !== requireRole) {
    return <UnauthorizedComponent requiredRole={requireRole} />;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking if user has specific role
 */
export function useRequireRole(requiredRole: 'vendor' | 'admin'): boolean {
  const { user, isAuthenticated } = useAuth();
  
  return isAuthenticated && user?.profile?.role === requiredRole;
}

/**
 * Hook for checking if user is vendor
 */
export function useIsVendor(): boolean {
  return useRequireRole('vendor');
}

/**
 * Hook for checking if user is admin
 */
export function useIsAdmin(): boolean {
  return useRequireRole('admin');
}
