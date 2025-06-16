
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewJobForm from '@/components/NewJobForm';
import { JobWithCustomer } from '@/hooks/useJobs';

interface EditJobDialogProps {
  job: JobWithCustomer | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditJobDialog: React.FC<EditJobDialogProps> = ({ job, open, onClose, onSuccess }) => {
  if (!job) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <NewJobForm
          job={job}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
