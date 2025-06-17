
import React, { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Calendar, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import NewJobForm from '@/components/NewJobForm';
import EditJobDialog from '@/components/EditJobDialog';
import { toast } from 'sonner';

const JobKanbanBoard = () => {
  const { jobs, loading, updateJob, deleteJob } = useJobs();
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const columns = [
    { status: 'quoted', title: 'Quoted', color: 'bg-gray-100' },
    { status: 'approved', title: 'Approved', color: 'bg-blue-100' },
    { status: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
    { status: 'completed', title: 'Completed', color: 'bg-green-100' },
    { status: 'cancelled', title: 'Cancelled', color: 'bg-red-100' },
  ];

  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status);
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const success = await updateJob(jobId, { status: newStatus as any });
    if (success) {
      toast.success(`Job moved to ${newStatus}`);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    
    try {
      await deleteJob(deleteJobId);
      setDeleteJobId(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'quoted': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJobSuccess = () => {
    setShowNewJobForm(false);
  };

  const handleJobCancel = () => {
    setShowNewJobForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Jobs</h2>
          <p className="text-gray-600">Manage your project pipeline</p>
        </div>
        <Button onClick={() => setShowNewJobForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-screen">
        {columns.map((column) => (
          <div key={column.status} className="space-y-4">
            <div className={`p-4 rounded-lg ${column.color}`}>
              <h3 className="font-semibold text-center">
                {column.title} ({getJobsByStatus(column.status).length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {getJobsByStatus(column.status).map((job) => (
                <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {job.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditJobDialog 
                            job={job}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Create Estimate</DropdownMenuItem>
                          <DropdownMenuItem>Create Task</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {columns.map((col) => (
                            col.status !== job.status && (
                              <DropdownMenuItem 
                                key={col.status}
                                onClick={() => handleStatusChange(job.id, col.status)}
                              >
                                Move to {col.title}
                              </DropdownMenuItem>
                            )
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteJobId(job.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge className={getStatusBadgeColor(job.status)} variant="outline">
                      {job.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {job.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {job.budget && (
                        <div className="flex items-center text-xs text-gray-500">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${Number(job.budget).toLocaleString()}
                        </div>
                      )}
                      
                      {job.estimated_hours && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.estimated_hours}h estimated
                        </div>
                      )}
                      
                      {job.start_date && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(job.start_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showNewJobForm} onOpenChange={setShowNewJobForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
          </DialogHeader>
          <NewJobForm 
            onSuccess={handleJobSuccess}
            onCancel={handleJobCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobKanbanBoard;
