'use client';

/**
 * Dashboard Layout
 * Protected layout for vendor dashboard pages
 */

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requireRole="vendor">
      {children}
    </ProtectedRoute>
  );
}
