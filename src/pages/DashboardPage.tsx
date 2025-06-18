
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, Calendar } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { useEstimates } from '@/hooks/useEstimates';
import { useInvoices } from '@/hooks/useInvoices';
import { useTasks } from '@/hooks/useTasks';

const DashboardPage = () => {
  const { user } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();
  const { leads, loading: leadsLoading } = useLeads();
  const { jobs, loading: jobsLoading } = useJobs();
  const { estimates, loading: estimatesLoading } = useEstimates();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { tasks, loading: tasksLoading } = useTasks();

  const isLoading = customersLoading || leadsLoading || jobsLoading || estimatesLoading || invoicesLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        customers={customers || []}
        leads={leads || []}
        jobs={jobs || []}
        estimates={estimates || []}
        invoices={invoices || []}
        tasks={tasks || []}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium">Add Customer</h3>
                <p className="text-sm text-gray-600">Create new customer</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium">New Estimate</h3>
                <p className="text-sm text-gray-600">Create new estimate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
