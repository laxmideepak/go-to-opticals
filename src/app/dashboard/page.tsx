import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  return (
    <ProtectedRoute resource="dashboard" action="read">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <AnalyticsDashboard />
      </div>
    </ProtectedRoute>
  );
} 