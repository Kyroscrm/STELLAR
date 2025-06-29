import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';

interface ViewLeadDialogProps {
  lead: Lead;
  trigger?: React.ReactNode;
}

const ViewLeadDialog = React.forwardRef<HTMLButtonElement, ViewLeadDialogProps>(({ lead, trigger }, ref) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button ref={ref} variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>
            View detailed information for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {lead.first_name} {lead.last_name}
              </h3>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(lead.status || 'new')}>
                  {lead.status}
                </Badge>
                <Badge className={getSourceColor(lead.source || 'website')}>
                  {lead.source}
                </Badge>
                {lead.score !== undefined && (
                  <Badge variant="outline">
                    Score: {lead.score}/100
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {lead.phone}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {(lead.address || lead.city || lead.state || lead.zip_code) && (
            <div className="space-y-3">
              <h4 className="font-medium">Address</h4>
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                <div>
                  {lead.address && <div>{lead.address}</div>}
                  {(lead.city || lead.state || lead.zip_code) && (
                    <div>
                      {lead.city && lead.city}{lead.city && lead.state && ', '}{lead.state} {lead.zip_code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lead Details */}
          <div className="space-y-3">
            <h4 className="font-medium">Lead Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.estimated_value && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  Est. Value: ${lead.estimated_value.toLocaleString()}
                </div>
              )}
              {lead.expected_close_date && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Close Date: {new Date(lead.expected_close_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-3">
              <h4 className="font-medium">Notes</h4>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-600">Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>Created: {new Date(lead.created_at).toLocaleString()}</div>
              <div>Updated: {new Date(lead.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ViewLeadDialog.displayName = 'ViewLeadDialog';

export default ViewLeadDialog;
