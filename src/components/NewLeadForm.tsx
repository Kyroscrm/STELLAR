
import LeadForm from '@/components/LeadForm';
import { useLeads } from '@/hooks/useLeads';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface NewLeadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onClose?: () => void;
  lead?: any;
}

const NewLeadForm: React.FC<NewLeadFormProps> = ({
  onSuccess,
  onCancel,
  onClose,
  lead
}) => {
  const { createLead, updateLead } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Ensure required fields are provided
      const cleanedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        status: data.status,
        source: data.source,
        estimated_value: data.estimated_value || undefined,
        expected_close_date: data.expected_close_date,
        score: data.score || 0,
        notes: data.notes,
      };

      let success;
      if (lead) {
        success = await updateLead(lead.id, cleanedData);
      } else {
        const result = await createLead(cleanedData);
        success = !!result;
      }

      if (success) {
        toast.success(lead ? 'Lead updated successfully' : 'Lead created successfully');
        onSuccess();
        onClose?.();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to save lead: ${error.message}`);
      } else {
        toast.error('Failed to save lead');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onClose?.();
  };

  return (
    <LeadForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={lead}
      isSubmitting={isSubmitting}
    />
  );
};

export default NewLeadForm;
