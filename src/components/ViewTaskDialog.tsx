
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Calendar, Clock, User, Briefcase } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '@/types/supabase-enums';

interface ViewTaskDialogProps {
  task: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ViewTaskDialog: React.FC<ViewTaskDialogProps> = ({ 
  task, 
  trigger, 
  open: controlledOpen,
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      View Details
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <div className="flex gap-2 mt-2">
                <Badge className={TASK_STATUS_COLORS[task.status || 'pending']}>
                  {task.status}
                </Badge>
                <Badge className={TASK_PRIORITY_COLORS[task.priority || 'medium']}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.due_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg">
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {(task.estimated_hours || task.actual_hours) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {task.estimated_hours && (
                    <div className="text-sm">
                      <span className="text-gray-500">Estimated:</span> {task.estimated_hours}h
                    </div>
                  )}
                  {task.actual_hours && (
                    <div className="text-sm">
                      <span className="text-gray-500">Actual:</span> {task.actual_hours}h
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {task.job_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Related Job
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-600">
                    Job #{task.job_id.substring(0, 8)}
                  </div>
                </CardContent>
              </Card>
            )}

            {task.assigned_to && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    User #{task.assigned_to.substring(0, 8)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Created: {new Date(task.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(task.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTaskDialog;
