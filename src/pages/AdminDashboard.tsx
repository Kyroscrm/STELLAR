
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardMetrics from '@/components/DashboardMetrics';

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
          <p className="text-gray-600">Overview of your CRM performance</p>
        </div>
      </div>

      {/* All the dashboard metrics and analytics */}
      <DashboardMetrics />
    </div>
  );
};

export default AdminDashboard;
