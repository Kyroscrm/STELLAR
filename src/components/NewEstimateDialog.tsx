
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EstimateForm from '@/components/EstimateForm';
import { useEstimates } from '@/hooks/useEstimates';
import { useEstimateLineItems } from '@/hooks/useEstimateLineItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EstimateFormData } from '@/lib/validation';

interface NewEstimateDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const NewEstimateDialog: React.FC<NewEstimateDialogProps> = ({
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEstimate } = useEstimates();
  const { addMultipleLineItems } = useEstimateLineItems();
  const { user } = useAuth();

  const handleSuccess = async (data: EstimateFormData) => {
    setIsSubmitting(true);
    try {
      const estimateData = {
        title: data.title,
        description: data.description || '',
        estimate_number: data.estimate_number,
        customer_id: data.customer_id || null,
        job_id: data.job_id || null,
        valid_until: data.valid_until || null,
        tax_rate: data.tax_rate || 0,
        status: data.status || 'draft',
        notes: data.notes || '',
        terms: data.terms || '',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0
      };

      const result = await createEstimate(estimateData);

      if (result) {
        // Use the centralized line item logic from the hook
        if (data.lineItems && data.lineItems.length > 0) {
          await addMultipleLineItems(result.id, data.lineItems);
        }

        setOpen(false);
        onSuccess?.();
        toast.success('Estimate created successfully');
      }
    } catch (error) {
      toast.error('Failed to create estimate: ' + (error instanceof Error ? error.message : 'Unknown error'));
      toast.error('Failed to create estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      New Estimate
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Estimate</DialogTitle>
        </DialogHeader>
        <EstimateForm
          onSubmit={handleSuccess}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewEstimateDialog;
