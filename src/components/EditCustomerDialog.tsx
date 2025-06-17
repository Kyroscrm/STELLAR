
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import CustomerForm from '@/components/CustomerForm';
import { useCustomers, Customer } from '@/hooks/useCustomers';

interface EditCustomerDialogProps {
  customer: Customer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({ 
  customer, 
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCustomer } = useCustomers();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const success = await updateCustomer(customer.id, data);
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
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={customer}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
