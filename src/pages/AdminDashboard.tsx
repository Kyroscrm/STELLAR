
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/hooks/useCustomers';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import DashboardMetrics from '@/components/DashboardMetrics';
import RecentActivity from '@/components/RecentActivity';

const AdminDashboard = () => {
  const { customers, loading: customersLoading } = useCustomers();
  const { leads, loading: leadsLoading } = useLeads();
  const { jobs, loading: jobsLoading } = useJobs();

  const isLoading = customersLoading || leadsLoading || jobsLoading;

  // Calculate metrics
  const totalCustomers = customers.length;
  const totalLeads = leads.length;
  const activeJobs = jobs.filter(job => job.status === 'in_progress').length;
  const totalJobs = jobs.length;

  // Calculate revenue (from completed jobs)
  const totalRevenue = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + (job.total_cost || 0), 0);

  const quickActions = [
    { 
      title: 'Add New Lead', 
      href: '/admin/leads', 
      icon: UserPlus, 
      color: 'bg-blue-500',
      description: 'Capture new potential customers'
    },
    { 
      title: 'Create Customer', 
      href: '/admin/customers', 
      icon: Users, 
      color: 'bg-green-500',
      description: 'Add existing customers to your database'
    },
    { 
      title: 'Schedule Job', 
      href: '/admin/jobs', 
      icon: Calendar, 
      color: 'bg-purple-500',
      description: 'Plan and organize upcoming work'
    },
    { 
      title: 'Create Estimate', 
      href: '/admin/estimates', 
      icon: FileText, 
      color: 'bg-orange-500',
      description: 'Generate professional project quotes'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to Final Roofing & Retro-Fit CRM - Your business overview
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                <p className="text-xs text-gray-500">of {totalJobs} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Dashboard Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Metrics Component */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardMetrics />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <AlertCircle className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Authentication: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">CRM Flow: Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
