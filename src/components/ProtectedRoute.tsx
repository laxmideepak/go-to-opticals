'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessResource } from '@/types/auth';
import LoginForm from './LoginForm';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  resource, 
  action, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user || !canAccessResource(user, resource, action)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this resource.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Required: {action} permission on {resource}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your role: {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 