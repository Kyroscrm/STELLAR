
import React, { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NewLeadForm from '@/components/NewLeadForm';
import ConvertLeadDialog from '@/components/ConvertLeadDialog';
import ConfirmDialog from '@/components/ConfirmDialog';

const LeadsPage = () => {
  const { leads, loading, deleteLead, fetchLeads } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [convertDialog, setConvertDialog] = useState<{
    open: boolean;
    lead?: any;
  }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    lead?: any;
  }>({ open: false });

  const filteredLeads = leads.filter(lead => {
    return !searchTerm || 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
  });

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    won: leads.filter(l => l.status === 'won').length,
    totalValue: leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-purple-100 text-purple-800';
      case 'referral': return 'bg-green-100 text-green-800';
      case 'social_media': return 'bg-blue-100 text-blue-800';
      case 'google_ads': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteLead = (lead: any) => {
    setDeleteConfirm({ open: true, lead });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.lead) {
      await deleteLead(deleteConfirm.lead.id);
      setDeleteConfirm({ open: false });
    }
  };

  const handleConvertLead = (lead: any) => {
    setConvertDialog({ open: true, lead });
  };

  const handleFormSuccess = async () => {
    setShowNewLeadForm(false);
    await fetchLeads();
  };

  const handleConversionSuccess = async () => {
    setConvertDialog({ open: false });
    await fetchLeads();
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-600">Manage your potential customers</p>
        </div>
        <Button onClick={() => setShowNewLeadForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold">{leadStats.qualified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Won</p>
                <p className="text-2xl font-bold">{leadStats.won}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${leadStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {lead.first_name} {lead.last_name}
                    {lead.score >= 80 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusColor(lead.status || 'new')}>
                      {lead.status || 'new'}
                    </Badge>
                    <Badge variant="outline" className={getSourceColor(lead.source || 'website')}>
                      {lead.source || 'website'}
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                    <DropdownMenuItem>Create Estimate</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                    {lead.status !== 'won' && (
                      <DropdownMenuItem onClick={() => handleConvertLead(lead)}>
                        Convert to Customer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteLead(lead)}
                    >
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
                {lead.estimated_value && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Estimated Value: ${lead.estimated_value.toLocaleString()}
                  </div>
                )}
                {lead.expected_close_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Expected Close: {new Date(lead.expected_close_date).toLocaleDateString()}
                  </div>
                )}
                {lead.score !== null && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="font-medium">Lead Score: {lead.score}/100</p>
                  </div>
                )}
                {lead.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {lead.notes}
                  </p>
                )}
                <div className="text-xs text-gray-400">
                  Created {new Date(lead.created_at || '').toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No leads found matching your search.</p>
          <Button className="mt-4" onClick={() => setShowNewLeadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Lead
          </Button>
        </div>
      )}

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <NewLeadForm 
          onClose={() => setShowNewLeadForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Convert Lead Dialog */}
      <ConvertLeadDialog
        open={convertDialog.open}
        onOpenChange={(open) => setConvertDialog({ open })}
        lead={convertDialog.lead}
        onSuccess={handleConversionSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        title="Delete Lead"
        description={`Are you sure you want to delete ${deleteConfirm.lead?.first_name} ${deleteConfirm.lead?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default LeadsPage;
