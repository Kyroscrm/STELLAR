
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  Settings
} from 'lucide-react';
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
import { GlobalSearch } from '@/components/ui/global-search';

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

  // Calculate key metrics
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

  const pendingEstimates = estimates.filter(estimate => estimate.status === 'sent').length;
  const activeTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueInvoices = invoices.filter(invoice => 
    invoice.status === 'sent' && 
    invoice.due_date && 
    new Date(invoice.due_date) < new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Leads</p>
                    <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new' || l.status === 'contacted').length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue (Paid)</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'in_progress').length}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          {(pendingEstimates > 0 || activeTasks > 0 || overdueInvoices > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingEstimates > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Pending Estimates</p>
                        <p className="text-sm text-yellow-600">{pendingEstimates} estimates awaiting response</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTasks > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Active Tasks</p>
                        <p className="text-sm text-blue-600">{activeTasks} tasks in progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {overdueInvoices > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Overdue Invoices</p>
                        <p className="text-sm text-red-600">{overdueInvoices} invoices past due</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardMetrics />
            <RecentActivity />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityLogViewer />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
