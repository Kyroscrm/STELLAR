import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import { useCustomers } from '@/hooks/useCustomers';
import { useJobs } from '@/hooks/useJobs';
import { useEstimates } from '@/hooks/useEstimates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { leads, loading: leadsLoading } = useLeads();
  const { customers, loading: customersLoading } = useCustomers();
  const { jobs, loading: jobsLoading } = useJobs();
  const { estimates, loading: estimatesLoading } = useEstimates();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate dashboard metrics
  const totalRevenue = estimates
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + (e.total_amount || 0), 0);

  const activeJobs = jobs.filter(j => ['scheduled', 'in_progress'].includes(j.status || ''));
  const newLeads = leads.filter(l => l.status === 'new');
  const monthlyRevenue = estimates
    .filter(e => {
      const createdAt = new Date(e.created_at || '');
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear() &&
             e.status === 'approved';
    })
    .reduce((sum, e) => sum + (e.total_amount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Final<span className="text-secondary">Roofing</span> CRM
              </h1>
              <p className="text-gray-600">Welcome back, {user.first_name || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-6">
            <div className="space-y-2">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button 
                variant={activeTab === 'leads' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('leads')}
              >
                <Users className="h-4 w-4 mr-2" />
                Leads ({newLeads.length})
              </Button>
              <Button 
                variant={activeTab === 'customers' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('customers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Customers ({customers.length})
              </Button>
              <Button 
                variant={activeTab === 'jobs' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('jobs')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs ({activeJobs.length})
              </Button>
              <Button 
                variant={activeTab === 'estimates' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('estimates')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Estimates ({estimates.length})
              </Button>
              <Button 
                variant={activeTab === 'calendar' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{newLeads.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +5 from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeJobs.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {jobs.filter(j => j.status === 'completed').length} completed this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Current month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                          </div>
                          <Badge className={getStatusColor(lead.status || 'new')}>
                            {lead.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-600">
                              {job.customers ? 
                                `${(job.customers as any).first_name} ${(job.customers as any).last_name}` : 
                                'No customer assigned'
                              }
                            </p>
                          </div>
                          <Badge className={getStatusColor(job.status || 'quoted')}>
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Leads Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Lead
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search leads..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Contact</th>
                          <th className="text-left p-4 font-medium">Source</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Value</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads
                          .filter(lead => 
                            !searchTerm || 
                            `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                                <p className="text-sm text-gray-600">{lead.address}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-sm">{lead.email}</p>
                                <p className="text-sm">{lead.phone}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{lead.source}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(lead.status || 'new')}>
                                {lead.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              ${lead.estimated_value?.toLocaleString() || '0'}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">Convert</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Customers Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Customer
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search customers..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Contact</th>
                          <th className="text-left p-4 font-medium">Address</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers
                          .filter(customer => 
                            !searchTerm || 
                            `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((customer) => (
                          <tr key={customer.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                                <p className="text-sm text-gray-600">{customer.company_name}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-sm">{customer.email}</p>
                                <p className="text-sm">{customer.phone}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{customer.address}</p>
                              <p className="text-sm">{customer.city}, {customer.state} {customer.zip_code}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="outline">Edit</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Jobs Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search jobs..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Job Title</th>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Budget</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs
                          .filter(job => 
                            !searchTerm || 
                            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (job.customers && `${(job.customers as any).first_name} ${(job.customers as any).last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((job) => (
                          <tr key={job.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{job.title}</p>
                                <p className="text-sm text-gray-600">{job.address}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              {job.customers ? (
                                <div>
                                  <p className="font-medium">{(job.customers as any).first_name} {(job.customers as any).last_name}</p>
                                  <p className="text-sm text-gray-600">{(job.customers as any).email}</p>
                                </div>
                              ) : (
                                <p>No customer assigned</p>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(job.status || 'quoted')}>
                                {job.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              ${job.budget?.toLocaleString() || '0'}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="outline">Edit</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'estimates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Estimates Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Estimate
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search estimates..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Estimate #</th>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Job</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimates
                          .filter(estimate => 
                            !searchTerm || 
                            estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (estimate.customers && `${(estimate.customers as any).first_name} ${(estimate.customers as any).last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (estimate.jobs && estimate.jobs.title.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((estimate) => (
                          <tr key={estimate.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <p className="font-medium">{estimate.estimate_number}</p>
                            </td>
                            <td className="p-4">
                              {estimate.customers ? (
                                <div>
                                  <p className="font-medium">{(estimate.customers as any).first_name} {(estimate.customers as any).last_name}</p>
                                  <p className="text-sm text-gray-600">{(estimate.customers as any).email}</p>
                                </div>
                              ) : (
                                <p>No customer assigned</p>
                              )}
                            </td>
                            <td className="p-4">
                              {estimate.jobs ? (
                                <p className="font-medium">{estimate.jobs.title}</p>
                              ) : (
                                <p>No job assigned</p>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(estimate.status || 'draft')}>
                                {estimate.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              ${estimate.total_amount?.toLocaleString() || '0'}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">Convert to Invoice</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Calendar</h2>
              <Card>
                <CardContent>
                  {/* Add calendar component here */}
                  <p>Calendar content will be here.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
