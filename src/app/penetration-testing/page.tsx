'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import PenetrationTestingDashboard from '@/components/PenetrationTestingDashboard';

export default function PenetrationTestingPage() {
  return (
    <ProtectedRoute requiredPermissions={['security:admin']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-8 px-4">
          <PenetrationTestingDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
} 