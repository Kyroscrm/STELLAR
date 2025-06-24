import React, { useState } from 'react';
import { useLeads, Lead } from '@/hooks/useLeads';
import ViewLeadDialog from '@/components/ViewLeadDialog';
import EditLeadDialog from '@/components/EditLeadDialog';
import CreateLeadDialog from '@/components/CreateLeadDialog';
import CreateEstimateFromLeadDialog from '@/components/CreateEstimateFromLeadDialog';
import ConvertLeadDialog from '@/components/ConvertLeadDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SkeletonLoader from '@/components/ui/skeleton-loader';
import ErrorMessage from '@/components/ui/error-message';
import { LEAD_STATUS_COLORS } from '@/types/supabase-enums';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LeadsPage = () => {
  const { leads, loading, error, updateLead, deleteLead, fetchLeads } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [convertLeadDialogOpen, setConvertLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getStatusColor = (status: string) => {
    return LEAD_STATUS_COLORS[status as keyof typeof LEAD_STATUS_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-orange-100 text-orange-800';
      case 'google_ads': return 'bg-indigo-100 text-indigo-800';
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'direct_mail': return 'bg-yellow-100 text-yellow-800';
      case 'cold_call': return 'bg-red-100 text-red-800';
      case 'trade_show': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm ||
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    potentialRevenue: leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await updateLead(leadId, { status: newStatus as 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'converted' });
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(leadId);
    }
  };

  const handleEditSuccess = () => {
    fetchLeads();
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertLeadDialogOpen(true);
  };

  const handleConvertSuccess = () => {
    setConvertLeadDialogOpen(false);
    setSelectedLead(null);
    fetchLeads();
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error.message || "Failed to load leads. Please try again."}
          onRetry={fetchLeads}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads Management</h1>
          <p className="text-gray-600">Track and manage potential customers</p>
        </div>
        <div className="flex gap-2">
          <CreateLeadDialog onSuccess={fetchLeads} />
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <SkeletonLoader type="stats" count={5} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold">{leadStats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <p className="text-2xl font-bold">{leadStats.new}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600">Contacted</p>
              <p className="text-2xl font-bold">{leadStats.contacted}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-2xl font-bold">{leadStats.qualified}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600">Potential Revenue</p>
              <p className="text-2xl font-bold">${leadStats.potentialRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
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
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="converted">Converted</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="google_ads">Google Ads</option>
          <option value="facebook">Facebook</option>
          <option value="direct_mail">Direct Mail</option>
          <option value="cold_call">Cold Call</option>
          <option value="trade_show">Trade Show</option>
          <option value="other">Other</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <SkeletonLoader type="card" count={6} />
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No leads found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {lead.first_name} {lead.last_name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getStatusColor(lead.status || 'new')}>
                        {lead.status}
                      </Badge>
                      <Badge className={getSourceColor(lead.source || 'website')}>
                        {lead.source}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <ViewLeadDialog
                          lead={lead}
                          trigger={<span className="w-full cursor-pointer">View Details</span>}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <EditLeadDialog
                          lead={lead}
                          onSuccess={handleEditSuccess}
                          trigger={<span className="w-full cursor-pointer">Edit Lead</span>}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <CreateEstimateFromLeadDialog
                          lead={lead}
                          onSuccess={fetchLeads}
                          trigger={<span className="w-full cursor-pointer">Create Estimate</span>}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConvertLead(lead)}>
                        Convert to Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLead(lead.id)}>
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {lead.phone}
                    </div>
                  )}
                  {lead.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {lead.address}
                      {lead.city && `, ${lead.city}`}
                      {lead.state && `, ${lead.state}`}
                    </div>
                  )}
                  {lead.created_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Added {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {lead.estimated_value > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Est. Value: ${lead.estimated_value.toLocaleString()}
                    </div>
                  )}
                  {lead.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      {lead.notes.substring(0, 100)}
                      {lead.notes.length > 100 && '...'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Convert Lead Dialog */}
      {selectedLead && (
        <ConvertLeadDialog
          lead={selectedLead}
          open={convertLeadDialogOpen}
          onOpenChange={setConvertLeadDialogOpen}
          onSuccess={handleConvertSuccess}
        />
      )}
    </div>
  );
};

export default LeadsPage;
