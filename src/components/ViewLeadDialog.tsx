
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';

interface ViewLeadDialogProps {
  lead: Lead;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ViewLeadDialog: React.FC<ViewLeadDialogProps> = ({ 
  lead, 
  trigger, 
  open: controlledOpen,
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      View Details
    </Button>
  );

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
      case 'referral': return 'bg-orange-100 text-orange-800';
      case 'social_media': return 'bg-pink-100 text-pink-800';
      case 'google_ads': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {lead.first_name} {lead.last_name}
              </h3>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(lead.status || 'new')}>
                  {lead.status}
                </Badge>
                <Badge className={getSourceColor(lead.source || 'website')}>
                  {lead.source}
                </Badge>
              </div>
            </div>
            {lead.score && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Score</div>
                <div className="text-2xl font-bold text-green-600">{lead.score}/100</div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {(lead.address || lead.city || lead.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    {lead.address && <div>{lead.address}</div>}
                    {(lead.city || lead.state) && (
                      <div>{lead.city}{lead.city && lead.state && ', '}{lead.state} {lead.zip_code}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lead.estimated_value && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Estimated Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${lead.estimated_value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {lead.expected_close_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expected Close Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg">
                    {new Date(lead.expected_close_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Created: {new Date(lead.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(lead.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLeadDialog;
