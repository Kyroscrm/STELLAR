import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import { useLeads, Lead } from '@/hooks/useLeads';

// Use the same LeadFormData type as defined in LeadForm.tsx
type LeadFormData = {
  first_name: string;
  last_name: string;
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  zip_code?: string | undefined;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost' | 'converted';
  source: 'website' | 'referral' | 'google_ads' | 'facebook' | 'direct_mail' | 'cold_call' | 'trade_show' | 'other';
  estimated_value?: number | undefined;
  expected_close_date?: string | undefined;
  score?: number | undefined;
  notes?: string | undefined;
};

interface EditLeadDialogProps {
  lead: Lead;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditLeadDialog = React.forwardRef<HTMLButtonElement, EditLeadDialogProps>(({
  lead,
  trigger,
  onSuccess
}, ref) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateLead } = useLeads();

  const handleSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const success = await updateLead(lead.id, data);
      if (success) {
        setOpen(false);
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button ref={ref} variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update information for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={lead}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
});

EditLeadDialog.displayName = 'EditLeadDialog';

export default EditLeadDialog;
