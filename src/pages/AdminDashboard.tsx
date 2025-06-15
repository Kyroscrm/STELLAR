
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomers } from '@/hooks/useCustomers';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { useEstimates } from '@/hooks/useEstimates';
import { useInvoices } from '@/hooks/useInvoices';
import { useTasks } from '@/hooks/useTasks';
import DashboardMetrics from '@/components/DashboardMetrics';
import RecentActivity from '@/components/RecentActivity';
import SecurityDashboard from '@/components/SecurityDashboard';
import ActivityLogViewer from '@/components/ActivityLogViewer';
import SecuritySettings from '@/components/SecuritySettings';
import DashboardStats from '@/components/DashboardStats';
import { GlobalSearch } from '@/components/ui/global-search';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ToastProvider from '@/components/ToastProvider';

const AdminDashboard = () => {
  const { customers, loading: customersLoading } = useCustomers();
  const { leads, loading: leadsLoading } = useLeads();
  const { jobs, loading: jobsLoading } = useJobs();
  const { estimates, loading: estimatesLoading } = useEstimates();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { tasks, loading: tasksLoading } = useTasks();
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = customersLoading || leadsLoading || jobsLoading || 
                   estimatesLoading || invoicesLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Welcome to your CRM overview</p>
            </div>
            <div className="w-80">
              <GlobalSearch />
            </div>
          </div>

          {/* Tabs for different dashboard views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardStats 
                customers={customers}
                leads={leads}
                jobs={jobs}
                estimates={estimates}
                invoices={invoices}
                tasks={tasks}
              />

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary>
                  <DashboardMetrics />
                </ErrorBoundary>
                <ErrorBoundary>
                  <RecentActivity />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <ErrorBoundary>
                <SecurityDashboard />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ErrorBoundary>
                <ActivityLogViewer />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <ErrorBoundary>
                <SecuritySettings />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
};

export default AdminDashboard;
