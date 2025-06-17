
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useClientPortalAuth, useClientPortalData } from '@/hooks/useClientPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Home, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Download, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { customerId, isAuthenticated, isLoading: authLoading, logout } = useClientPortalAuth(token || undefined);
  const { customer, jobs, estimates, invoices, documents, loading: dataLoading, error } = useClientPortalData(customerId);
  
  const [activeTab, setActiveTab] = useState('projects');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/client/login${token ? `?token=${token}` : ''}`);
    }
  }, [authLoading, isAuthenticated, navigate, token]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-bold text-primary">
                  Final Roofing<span className="text-secondary"> & Retro-Fit</span>
                </h1>
                <p className="text-gray-600">Client Portal</p>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (job: any) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'active' || job.status === 'in-progress') return 65;
    if (job.status === 'quoted') return 25;
    return 0;
  };

  const handleDownloadEstimate = (estimateId: string) => {
    toast.info('PDF download functionality would be implemented here');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info('PDF download functionality would be implemented here');
  };

  const handleApproveEstimate = async (estimateId: string) => {
    toast.info('Estimate approval functionality would be implemented here');
  };

  const handlePayInvoice = (invoiceId: string) => {
    toast.info('Payment processing would be implemented here');
  };

  const unreadMessages = 2; // This would come from a messages system

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
              <span className="text-sm text-gray-600">
                Welcome, {customer?.first_name} {customer?.last_name}
              </span>
              <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
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
                    { id: 'projects', label: 'My Projects', icon: Home, count: jobs.length },
                    { id: 'estimates', label: 'Estimates', icon: FileText, count: estimates.length },
                    { id: 'invoices', label: 'Invoices', icon: DollarSign, count: invoices.length },
                    { id: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages }
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
                      {item.count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.count}
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
                
                {jobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-gray-600">Your projects will appear here once they're created.</p>
                    </CardContent>
                  </Card>
                ) : (
                  jobs.map(project => (
                    <Card key={project.id} className="shadow-lg">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`${getStatusColor(project.status)} text-white`}>
                                {getStatusIcon(project.status)}
                                <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
                              </Badge>
                            </div>
                            {project.description && (
                              <p className="text-gray-600 mt-2">{project.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {project.start_date && (
                              <div>Started: {new Date(project.start_date).toLocaleDateString()}</div>
                            )}
                            {project.end_date && (
                              <div>Est. Completion: {new Date(project.end_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-gray-600">{calculateProgress(project)}%</span>
                            </div>
                            <Progress value={calculateProgress(project)} className="h-2" />
                          </div>
                          
                          {(project.budget || project.total_cost) && (
                            <div className="grid grid-cols-2 gap-4">
                              {project.budget && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-sm text-gray-600">Budget</div>
                                  <div className="text-lg font-semibold text-primary">
                                    ${Number(project.budget).toLocaleString()}
                                  </div>
                                </div>
                              )}
                              {project.total_cost && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-sm text-gray-600">Total Cost</div>
                                  <div className="text-lg font-semibold text-secondary">
                                    ${Number(project.total_cost).toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Reports
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Estimates Tab */}
            {activeTab === 'estimates' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Estimates</h2>
                
                {estimates.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Estimates Yet</h3>
                      <p className="text-gray-600">Your estimates will appear here once they're created.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {estimates.map(estimate => (
                      <Card key={estimate.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{estimate.estimate_number}</div>
                              <div className="text-sm text-gray-600">{estimate.title}</div>
                              <div className="text-xs text-gray-500">
                                Created: {new Date(estimate.created_at).toLocaleDateString()}
                                {estimate.valid_until && (
                                  <> • Valid until: {new Date(estimate.valid_until).toLocaleDateString()}</>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                ${Number(estimate.total_amount || 0).toLocaleString()}
                              </div>
                              <Badge className={`${getStatusColor(estimate.status)} text-white`}>
                                {estimate.status?.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDownloadEstimate(estimate.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              {estimate.status === 'draft' && (
                                <Button size="sm" className="bg-secondary text-primary hover:bg-secondary/90" onClick={() => handleApproveEstimate(estimate.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Invoices & Payments</h2>
                
                {invoices.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
                      <p className="text-gray-600">Your invoices will appear here once they're created.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {invoices.map(invoice => (
                      <Card key={invoice.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{invoice.invoice_number}</div>
                              <div className="text-sm text-gray-600">{invoice.title}</div>
                              <div className="text-xs text-gray-500">
                                Issued: {new Date(invoice.created_at).toLocaleDateString()}
                                {invoice.due_date && (
                                  <> • Due: {new Date(invoice.due_date).toLocaleDateString()}</>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                ${Number(invoice.total_amount || 0).toLocaleString()}
                              </div>
                              <Badge className={`${getStatusColor(invoice.payment_status || invoice.status)} text-white`}>
                                {(invoice.payment_status || invoice.status)?.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              {invoice.payment_status === 'unpaid' && (
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
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Messages</h2>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
                    <p className="text-gray-500">
                      Direct messaging with your project team will be available soon.
                    </p>
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
