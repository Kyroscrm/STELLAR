
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import TaskForm from '@/components/TaskForm';
import { useTasks, Task } from '@/hooks/useTasks';

interface EditTaskDialogProps {
  task: Task;
  trigger?: React.ReactNode;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ 
  task, 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateTask } = useTasks();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const success = await updateTask(task.id, data);
      if (success) {
        setOpen(false);
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
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={task}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
