import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardControls from '@/components/DashboardControls';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import SuspenseLoader from '@/components/SuspenseLoader';

// Lazy load the DashboardMetrics component
const DashboardMetrics = React.lazy(() => import('@/components/DashboardMetrics'));

const AdminDashboard = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to your CRM overview</p>
        </div>
        <Button asChild>
          <Link to="/admin/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Dashboard Controls (Search, Overview, Security, Activity, Settings) */}
      <DashboardControls />

      {/* All the dashboard metrics and analytics */}
      <Suspense fallback={<SuspenseLoader />}>
        <DashboardMetrics />
      </Suspense>
    </div>
  );
};

export default AdminDashboard;
