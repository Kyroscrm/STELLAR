
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart3,
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock CRM data
  const stats = {
    totalLeads: 127,
    activeProjects: 23,
    monthlyRevenue: 450000,
    completedProjects: 89
  };

  const leads = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      project: 'Kitchen Remodel',
      status: 'hot',
      value: 45000,
      source: 'Website',
      date: '2024-02-10',
      notes: 'Ready to start ASAP, budget approved'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike.r@email.com',
      phone: '(555) 234-5678',
      project: 'Bathroom Addition',
      status: 'warm',
      value: 32000,
      source: 'Referral',
      date: '2024-02-08',
      notes: 'Comparing quotes, needs to decide by end of month'
    },
    {
      id: '3',
      name: 'Jennifer Chen',
      email: 'jen.chen@email.com',
      phone: '(555) 345-6789',
      project: 'Home Addition',
      status: 'cold',
      value: 85000,
      source: 'Google Ads',
      date: '2024-02-05',
      notes: 'Still planning, timeline flexible'
    }
  ];

  const projects = [
    {
      id: '1',
      name: 'Kitchen Renovation - Johnson',
      client: 'Sarah Johnson',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      budget: 45000,
      spent: 29250,
      team: ['John D.', 'Mike S.']
    },
    {
      id: '2',
      name: 'Bathroom Remodel - Smith',
      client: 'Robert Smith',
      status: 'planning',
      progress: 15,
      startDate: '2024-02-20',
      endDate: '2024-03-30',
      budget: 25000,
      spent: 3750,
      team: ['Lisa R.', 'Tom K.']
    }
  ];

  const recentActivity = [
    { id: '1', type: 'lead', message: 'New lead from website: Kitchen remodel inquiry', time: '2 hours ago' },
    { id: '2', type: 'project', message: 'Project update: Johnson Kitchen - 65% complete', time: '4 hours ago' },
    { id: '3', type: 'payment', message: 'Payment received: $15,000 from Smith project', time: '6 hours ago' },
    { id: '4', type: 'quote', message: 'Quote sent to Mike Rodriguez - $32,000', time: '1 day ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      case 'in-progress': return 'bg-green-500';
      case 'planning': return 'bg-orange-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Users className="h-4 w-4" />;
      case 'project': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'quote': return <BarChart3 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">
                ProBuild<span className="text-secondary">CRM</span>
              </h1>
              <p className="text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'leads', label: 'Leads', icon: Users },
                    { id: 'projects', label: 'Projects', icon: Calendar },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === item.id ? 'bg-primary/5 text-primary border-r-2 border-primary' : 'text-gray-700'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Leads</p>
                          <p className="text-2xl font-bold text-primary">{stats.totalLeads}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Projects</p>
                          <p className="text-2xl font-bold text-primary">{stats.activeProjects}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-primary">${stats.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completed Projects</p>
                          <p className="text-2xl font-bold text-primary">{stats.completedProjects}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="mt-1 p-1 rounded-full bg-primary/10 text-primary">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary">Lead Management</h2>
                  <Button className="bg-secondary text-primary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Leads List */}
                <div className="space-y-4">
                  {leads.map(lead => (
                    <Card key={lead.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{lead.name}</h3>
                              <Badge className={`${getStatusColor(lead.status)} text-white`}>
                                {lead.status.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  {lead.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  {lead.phone}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-medium">Project:</span> {lead.project}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Value:</span> ${lead.value.toLocaleString()}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Source:</span> {lead.source}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <p className="text-sm text-gray-700">{lead.notes}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" className="bg-secondary text-primary hover:bg-secondary/90">
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary">Project Management</h2>
                  <Button className="bg-secondary text-primary hover:bg-secondary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>

                <div className="space-y-4">
                  {projects.map(project => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <p className="text-gray-600">Client: {project.client}</p>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} text-white`}>
                            {project.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="font-semibold">${project.budget.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Spent: ${project.spent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Timeline</p>
                            <p className="font-semibold">{new Date(project.startDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">End: {new Date(project.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Team</p>
                            <p className="font-semibold">{project.team.join(', ')}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex-1 mr-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Analytics & Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lead Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">68%</div>
                      <p className="text-sm text-gray-600">↑ 12% from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Average Project Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">$42,500</div>
                      <p className="text-sm text-gray-600">↑ 5% from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
                      <p className="text-sm text-gray-600">Based on 127 reviews</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Project Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">94%</div>
                      <p className="text-sm text-gray-600">On-time delivery</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
