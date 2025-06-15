
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  FileText, 
  Receipt, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Leads',
      value: stats.totalLeads,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Estimates',
      value: stats.totalEstimates,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Invoices',
      value: stats.totalInvoices,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Draft Estimates',
      value: stats.draftEstimates,
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Overview of your CRM performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New customer added</p>
                  <p className="text-sm text-gray-600">2 minutes ago</p>
                </div>
                <Badge variant="outline">Customer</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Estimate created</p>
                  <p className="text-sm text-gray-600">15 minutes ago</p>
                </div>
                <Badge variant="outline">Estimate</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Job completed</p>
                  <p className="text-sm text-gray-600">1 hour ago</p>
                </div>
                <Badge variant="outline">Job</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium">Add Customer</p>
                <p className="text-sm text-gray-600">Create new customer</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium">New Estimate</p>
                <p className="text-sm text-gray-600">Create estimate</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Briefcase className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Create Job</p>
                <p className="text-sm text-gray-600">Start new job</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Receipt className="h-6 w-6 text-red-600 mb-2" />
                <p className="font-medium">Send Invoice</p>
                <p className="text-sm text-gray-600">Generate invoice</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
