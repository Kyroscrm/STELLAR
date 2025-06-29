import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import CustomerForm from '@/components/CustomerForm';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { CustomerFormData } from '@/types/app-types';

interface EditCustomerDialogProps {
  customer: Customer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditCustomerDialog = React.forwardRef<HTMLButtonElement, EditCustomerDialogProps>(({
  customer,
  trigger,
  onSuccess
}, ref) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCustomer } = useCustomers();

  const handleSubmit = async (data: CustomerFormData) => {
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
        <Button ref={ref} variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update information for {customer.first_name} {customer.last_name}
          </DialogDescription>
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
});

EditCustomerDialog.displayName = 'EditCustomerDialog';

export default EditCustomerDialog;
