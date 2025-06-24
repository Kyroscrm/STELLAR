
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import { useLeads, Lead } from '@/hooks/useLeads';
import { LeadFormData } from '@/types/app-types';

interface EditLeadDialogProps {
  lead: Lead;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditLeadDialog: React.FC<EditLeadDialogProps> = ({
  lead,
  trigger,
  onSuccess
}) => {
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
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
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
};

export default EditLeadDialog;
