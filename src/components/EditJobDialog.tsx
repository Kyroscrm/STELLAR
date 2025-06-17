
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import NewJobForm from '@/components/NewJobForm';
import { useJobs, Job } from '@/hooks/useJobs';

interface EditJobDialogProps {
  job: Job;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const EditJobDialog: React.FC<EditJobDialogProps> = ({ 
  job, 
  trigger,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateJob } = useJobs();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const success = await updateJob(job.id, data);
      if (success) {
        setOpen(false);
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
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
      <DialogTrigger asChild>
        {trigger ? (
          <div onClick={() => setOpen(true)}>{trigger}</div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <NewJobForm
          onSuccess={handleSubmit}
          onCancel={handleCancel}
          initialData={job}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
