
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { DashboardStatsData } from '@/types/app-types';

type DashboardStatsProps = DashboardStatsData;

const DashboardStats: React.FC<DashboardStatsProps> = ({
  customers,
  leads,
  jobs,
  estimates,
  invoices,
  tasks
}) => {
  // Calculate metrics
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

  const activeLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted').length;
  const activeJobs = jobs.filter(j => j.status === 'in_progress').length;

  return (
    <>
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
                <p className="text-2xl font-bold">{activeLeads}</p>
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
                <p className="text-2xl font-bold">{activeJobs}</p>
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
                  <Clock className="h-5 w-5 text-blue-600" />
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
    </>
  );
};

export default DashboardStats;
