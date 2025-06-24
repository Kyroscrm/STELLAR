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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JobWithCustomer, useJobs } from '@/hooks/useJobs';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, DollarSign, Edit, Eye, MapPin, MoreVertical, Plus, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import JobForm from './JobForm';
import ViewJobDialog from './ViewJobDialog';

// Define valid job statuses that match Supabase enum
const VALID_JOB_STATUSES = ['quoted', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;
type ValidJobStatus = typeof VALID_JOB_STATUSES[number];

// Define job status columns
const columns = [
  { id: 'quoted', title: 'Quoted', color: 'bg-blue-50 border-blue-200' },
  { id: 'approved', title: 'Approved', color: 'bg-green-50 border-green-200' },
  { id: 'scheduled', title: 'Scheduled', color: 'bg-purple-50 border-purple-200' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' },
];

// Droppable Column Component
interface DroppableColumnProps {
  column: typeof columns[0];
  children: React.ReactNode;
  jobCount: number;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, children, jobCount }) => {
  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      status: column.id
    }
  });

  return (
    <div ref={setNodeRef} className="space-y-4" id={column.id}>
      <div className={`p-4 rounded-lg transition-colors ${column.color} ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <h3 className="font-semibold text-center">
          {column.title} ({jobCount})
        </h3>
      </div>

      <div className="space-y-3 min-h-[400px] transition-colors rounded-lg p-2"
           style={{ backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
        {children}
      </div>
    </div>
  );
};

// Sortable Job Card Component
interface SortableJobCardProps {
  job: JobWithCustomer;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

const SortableJobCard: React.FC<SortableJobCardProps> = ({ job, onEdit, onView, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: {
      type: 'job',
      job: job
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {job.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-md">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge className={getStatusBadgeColor(job.status)} variant="outline">
            {job.status?.replace('_', ' ')}
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {job.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {job.description}
            </p>
          )}

          <div className="space-y-2">
            {job.customers && (
              <div className="flex items-center text-xs text-gray-500">
                <User className="h-3 w-3 mr-1" />
                {job.customers.first_name} {job.customers.last_name}
              </div>
            )}

            {job.budget && (
              <div className="flex items-center text-xs text-gray-500">
                <DollarSign className="h-3 w-3 mr-1" />
                ${job.budget.toLocaleString()}
              </div>
            )}

            {job.address && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {job.address}
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
    </div>
  );
};

const JobKanbanBoard = () => {
  const { jobs, loading, updateJob, deleteJob } = useJobs();
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobWithCustomer | null>(null);
  const [viewingJob, setViewingJob] = useState<JobWithCustomer | null>(null);
  const [activeJob, setActiveJob] = useState<JobWithCustomer | null>(null);

  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find(j => j.id === active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveJob(null);

    if (!over) {
      return;
    }

    const jobId = active.id as string;
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      return;
    }

    // Determine the new status based on drop target
    let newStatus: ValidJobStatus | null = null;

    // Check if dropping directly over a column
    if (VALID_JOB_STATUSES.includes(over.id as ValidJobStatus)) {
      newStatus = over.id as ValidJobStatus;
    }
    // Check if dropping over another job, get its column status
    else {
      const targetJob = jobs.find(j => j.id === over.id);
      if (targetJob && VALID_JOB_STATUSES.includes(targetJob.status as ValidJobStatus)) {
        newStatus = targetJob.status as ValidJobStatus;
      }
    }

    // If we still don't have a valid status, try to find it from the drop zone
    if (!newStatus) {
      // Check if the over.id corresponds to any column container
      const column = columns.find(col => over.id.toString().includes(col.id));
      if (column) {
        newStatus = column.id as ValidJobStatus;
      }
    }

    if (!newStatus) {
      toast.error('Invalid drop target');
      return;
    }

    // Don't update if status hasn't changed
    if (job.status === newStatus) {
      return;
    }

    try {
      // Update job status with optimistic UI
      const success = await updateJob(jobId, { status: newStatus });

      if (success) {
        const statusDisplay = newStatus.replace('_', ' ');
        toast.success(`Job moved to ${statusDisplay}`);
      } else {
        toast.error('Failed to update job status');
      }
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Allow dropping over columns, jobs, or any valid drop target
    const isValidDropTarget =
      VALID_JOB_STATUSES.includes(over.id as ValidJobStatus) ||
      jobs.some(j => j.id === over.id) ||
      columns.some(col => over.id.toString().includes(col.id));
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;

    try {
      await deleteJob(deleteJobId);
      setDeleteJobId(null);
    } catch (error) {
      // Error handling is done in the deleteJob function
    }
  };

  const handleJobSuccess = () => {
    setShowNewJobForm(false);
    setEditingJob(null);
  };

  const handleJobCancel = () => {
    setShowNewJobForm(false);
    setEditingJob(null);
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
          <p className="text-gray-600">Manage your project jobs</p>
        </div>
        <Button onClick={() => setShowNewJobForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 min-h-screen">
          {columns.map((column) => (
            <SortableContext
              key={column.id}
              items={[
                column.id, // Add column as droppable target
                ...getJobsByStatus(column.id).map(job => job.id)
              ]}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                column={column}
                jobCount={getJobsByStatus(column.id).length}
              >
                {getJobsByStatus(column.id).map((job) => (
                  <SortableJobCard
                    key={job.id}
                    job={job}
                    onEdit={() => setEditingJob(job)}
                    onView={() => setViewingJob(job)}
                    onDelete={() => setDeleteJobId(job.id)}
                  />
                ))}
              </DroppableColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeJob ? (
            <Card className="cursor-move shadow-lg rotate-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeJob.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  {activeJob.budget && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${activeJob.budget.toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Job Dialog */}
      <JobForm
        open={showNewJobForm}
        onOpenChange={setShowNewJobForm}
        onSuccess={handleJobSuccess}
        onCancel={handleJobCancel}
      />

      {/* Edit Job Dialog */}
      {editingJob && (
        <JobForm
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          onSuccess={handleJobSuccess}
          onCancel={handleJobCancel}
        />
      )}

      {/* View Job Dialog */}
      {viewingJob && (
        <ViewJobDialog
          job={viewingJob}
          open={!!viewingJob}
          onOpenChange={(open) => !open && setViewingJob(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
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
