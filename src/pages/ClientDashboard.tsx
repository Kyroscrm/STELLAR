
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Download, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  // Mock client data
  const projects = [
    {
      id: '1',
      name: 'Complete Roof Replacement',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-01-15',
      estimatedCompletion: '2024-02-28',
      budget: 45000,
      spent: 29250
    },
    {
      id: '2',
      name: 'Roof Repair & Gutters',
      status: 'completed',
      progress: 100,
      startDate: '2023-11-01',
      estimatedCompletion: '2023-12-15',
      budget: 25000,
      spent: 24500
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      project: 'Complete Roof Replacement',
      amount: 15000,
      date: '2024-01-15',
      status: 'paid',
      dueDate: '2024-01-30'
    },
    {
      id: 'INV-002',
      project: 'Complete Roof Replacement',
      amount: 14250,
      date: '2024-02-01',
      status: 'paid',
      dueDate: '2024-02-15'
    },
    {
      id: 'INV-003',
      project: 'Complete Roof Replacement',
      amount: 15750,
      date: '2024-02-10',
      status: 'pending',
      dueDate: '2024-02-25'
    }
  ];

  const messages = [
    {
      id: '1',
      from: 'Project Manager',
      subject: 'Roof Progress Update',
      date: '2024-02-10',
      preview: 'The new shingles installation is complete and we\'re moving on to gutters...',
      unread: true
    },
    {
      id: '2',
      from: 'Admin Team',
      subject: 'Final Invoice - Roof Repair Project',
      date: '2024-01-20',
      preview: 'Please find attached the final invoice for your roof repair project...',
      unread: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Implement invoice download functionality
    console.log('Downloading invoice:', invoiceId);
  };

  const handlePayInvoice = (invoiceId: string) => {
    // Implement payment functionality
    console.log('Processing payment for invoice:', invoiceId);
  };

  const handleProjectDetails = (projectId: string) => {
    // Implement project details view
    console.log('Viewing project details:', projectId);
  };

  const handleDownloadReports = (projectId: string) => {
    // Implement report download functionality
    console.log('Downloading reports for project:', projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">
                Final Roofing<span className="text-secondary"> & Retro-Fit</span>
              </h1>
              <p className="text-gray-600">Client Portal</p>
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
                    { id: 'projects', label: 'My Projects', icon: Home },
                    { id: 'invoices', label: 'Invoices', icon: FileText },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
                    { id: 'messages', label: 'Messages', icon: MessageSquare }
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
                      {item.id === 'messages' && (
                        <Badge variant="secondary" className="ml-auto">
                          {messages.filter(m => m.unread).length}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">My Projects</h2>
                
                {projects.map(project => (
                  <Card key={project.id} className="shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getStatusColor(project.status)} text-white`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>Started: {new Date(project.startDate).toLocaleDateString()}</div>
                          <div>Est. Completion: {new Date(project.estimatedCompletion).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Budget</div>
                            <div className="text-lg font-semibold text-primary">
                              ${project.budget.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Spent</div>
                            <div className="text-lg font-semibold text-secondary">
                              ${project.spent.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleProjectDetails(project.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReports(project.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Reports
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Invoices & Payments</h2>
                
                <div className="space-y-4">
                  {invoices.map(invoice => (
                    <Card key={invoice.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{invoice.id}</div>
                            <div className="text-sm text-gray-600">{invoice.project}</div>
                            <div className="text-xs text-gray-500">
                              Issued: {new Date(invoice.date).toLocaleDateString()} • 
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              ${invoice.amount.toLocaleString()}
                            </div>
                            <Badge className={`${getStatusColor(invoice.status)} text-white`}>
                              {invoice.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {invoice.status === 'pending' && (
                              <Button size="sm" className="bg-secondary text-primary hover:bg-secondary/90" onClick={() => handlePayInvoice(invoice.id)}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Messages</h2>
                
                <div className="space-y-4">
                  {messages.map(message => (
                    <Card key={message.id} className={message.unread ? 'ring-2 ring-secondary/20' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">{message.subject}</div>
                              {message.unread && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{message.from}</div>
                            <div className="text-sm text-gray-500 mt-2">{message.preview}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Upcoming Schedule</h2>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                      <p>Your project team will schedule appointments as needed and notify you in advance.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
