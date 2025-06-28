import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MapPin, Calendar, DollarSign, Clock, User } from 'lucide-react';
import { JobWithCustomer } from '@/hooks/useJobs';
import { JOB_STATUS_COLORS } from '@/types/supabase-enums';

interface ViewJobDialogProps {
  job: JobWithCustomer;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ViewJobDialog: React.FC<ViewJobDialogProps> = ({
  job,
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
          <DialogTitle>Job Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <Badge className={JOB_STATUS_COLORS[job.status || 'quoted']}>
                {job.status}
              </Badge>
            </div>
          </div>

          {/* Customer Information */}
          {job.customers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{job.customers.first_name} {job.customers.last_name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{job.address}</div>
                </CardContent>
              </Card>
            )}

            {(job.start_date || job.end_date) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {job.start_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">Start:</span> {new Date(job.start_date).toLocaleDateString()}
                    </div>
                  )}
                  {job.end_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">End:</span> {new Date(job.end_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(job.budget || job.total_cost) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {job.budget && (
                    <div className="text-sm">
                      <span className="text-gray-500">Budget:</span> ${job.budget.toLocaleString()}
                    </div>
                  )}
                  {job.total_cost && (
                    <div className="text-sm">
                      <span className="text-gray-500">Total Cost:</span> ${job.total_cost.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(job.estimated_hours || job.actual_hours) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {job.estimated_hours && (
                    <div className="text-sm">
                      <span className="text-gray-500">Estimated:</span> {job.estimated_hours}h
                    </div>
                  )}
                  {job.actual_hours && (
                    <div className="text-sm">
                      <span className="text-gray-500">Actual:</span> {job.actual_hours}h
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {job.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{job.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Created: {new Date(job.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(job.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewJobDialog;
