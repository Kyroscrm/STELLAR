import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ClipboardList,
  Star,
  Calendar,
  Target
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import SuspenseLoader from '@/components/SuspenseLoader';

// Lazy load components
const ConversionMetrics = React.lazy(() => import('@/components/ConversionMetrics'));
const AdvancedAnalyticsDashboard = React.lazy(() => import('@/components/AdvancedAnalyticsDashboard'));
const FollowUpReminders = React.lazy(() => import('@/components/FollowUpReminders'));

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-red-600'
  };

  const isPositive = change >= 0;

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-white' : 'text-red-200'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardMetrics: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate actual metrics from real data
  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: 0, // Real change calculation would need historical data
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Active Projects',
      value: stats.totalJobs,
      change: 0, // Real change calculation would need historical data
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'New Leads',
      value: stats.totalLeads,
      change: 0, // Real change calculation would need historical data
      icon: <Users className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Customer Rating',
      value: '4.9', // This can remain as it comes from website
      change: 0,
      icon: <Star className="h-6 w-6" />,
      color: 'orange' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Advanced Analytics Dashboard */}
      <Suspense fallback={<SuspenseLoader />}>
        <AdvancedAnalyticsDashboard />
      </Suspense>

      {/* Conversion Analytics Section */}
      <Suspense fallback={<SuspenseLoader />}>
        <ConversionMetrics />
      </Suspense>

      {/* Follow-up Reminders */}
      <Suspense fallback={<SuspenseLoader />}>
        <FollowUpReminders />
      </Suspense>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              This Week's Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Completed Projects</p>
                  <p className="text-sm text-green-600">Projects finished this week</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.totalJobs}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">New Estimates</p>
                  <p className="text-sm text-blue-600">Estimates sent to clients</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalEstimates}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">New Customers</p>
                  <p className="text-sm text-purple-600">Added this week</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Monthly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Revenue Goal</span>
                  <span className="text-sm text-gray-600">$150,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min((stats.totalRevenue / 150000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((stats.totalRevenue / 150000) * 100)}% completed (${stats.totalRevenue.toLocaleString()})
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">New Customers</span>
                  <span className="text-sm text-gray-600">25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((stats.totalCustomers / 25) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((stats.totalCustomers / 25) * 100)}% completed ({stats.totalCustomers} customers)
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Project Completion</span>
                  <span className="text-sm text-gray-600">30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min((stats.totalJobs / 30) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((stats.totalJobs / 30) * 100)}% completed ({stats.totalJobs} projects)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;
