import NotificationDashboard from '@/components/NotificationDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

export default function NotificationsPage() {
  return (
    <ProtectedRoute resource="notifications" action="read">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <NotificationDashboard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 