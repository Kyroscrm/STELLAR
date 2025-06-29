import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewCustomerForm from '@/components/NewCustomerForm';

interface CreateCustomerDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      New Customer
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database with contact and billing information.
          </DialogDescription>
        </DialogHeader>
        <NewCustomerForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerDialog;
