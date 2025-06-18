
import React, { useState } from 'react';
import CustomerForm from '@/components/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { toast } from 'sonner';

interface NewCustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onClose?: () => void;
  customer?: any;
}

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
  onSuccess,
  onCancel,
  onClose,
  customer
}) => {
  const { createCustomer, updateCustomer } = useCustomers();
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
        company_name: data.company_name,
        notes: data.notes,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
      };

      let success;
      if (customer) {
        success = await updateCustomer(customer.id, cleanedData);
      } else {
        const result = await createCustomer(cleanedData);
        success = !!result;
      }

      if (success) {
        toast.success(customer ? 'Customer updated successfully' : 'Customer created successfully');
        onSuccess();
        onClose?.();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onClose?.();
  };

  return (
    <CustomerForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={customer}
      isSubmitting={isSubmitting}
    />
  );
};

export default NewCustomerForm;
