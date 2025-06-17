
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobs, JobWithCustomer } from '@/hooks/useJobs';
import { MapPin, DollarSign, Calendar, User, MoreVertical, Eye, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ViewJobDialog from './ViewJobDialog';
import EditJobDialog from './EditJobDialog';
import { toast } from 'sonner';

// Define job status columns
const columns = [
  { id: 'quoted', title: 'Quoted', color: 'bg-blue-50 border-blue-200' },
  { id: 'approved', title: 'Approved', color: 'bg-green-50 border-green-200' },
  { id: 'scheduled', title: 'Scheduled', color: 'bg-purple-50 border-purple-200' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' },
];

interface SortableJobCardProps {
  job: JobWithCustomer;
  onEdit: () => void;
  onView: () => void;
}

const SortableJobCard: React.FC<SortableJobCardProps> = ({ job, onEdit, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuItem>Create Estimate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            {job.customers && (
              <div className="flex items-center text-gray-600">
                <User className="h-3 w-3 mr-1" />
                {job.customers.first_name} {job.customers.last_name}
              </div>
            )}
            {job.address && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{job.address}</span>
              </div>
            )}
            {job.budget && (
              <div className="flex items-center text-green-600 font-medium">
                <DollarSign className="h-3 w-3 mr-1" />
                ${job.budget.toLocaleString()}
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center text-gray-600">
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

const JobKanbanBoard: React.FC = () => {
  const { jobs, updateJob, loading } = useJobs();
  const [activeJob, setActiveJob] = useState<JobWithCustomer | null>(null);
  const [jobsByStatus, setJobsByStatus] = useState<Record<string, JobWithCustomer[]>>({});
  const [editingJob, setEditingJob] = useState<JobWithCustomer | null>(null);
  const [viewingJob, setViewingJob] = useState<JobWithCustomer | null>(null);

  // Group jobs by status
  useEffect(() => {
    const grouped = jobs.reduce((acc, job) => {
      const status = job.status || 'quoted';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(job);
      return acc;
    }, {} as Record<string, JobWithCustomer[]>);

    setJobsByStatus(grouped);
  }, [jobs]);

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find(j => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as string;

    // Check if we're dropping over a valid column
    const validStatuses = columns.map(col => col.id);
    if (!validStatuses.includes(newStatus)) return;

    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === newStatus) return;

    // Update job status with optimistic UI
    const success = await updateJob(jobId, { status: newStatus as any });
    if (success) {
      toast.success(`Job moved to ${newStatus.replace('_', ' ')}`);
    }
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
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {columns.map((column) => (
            <SortableContext 
              key={column.id}
              items={jobsByStatus[column.id]?.map(job => job.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col" id={column.id}>
                <div className={`p-4 rounded-lg border-2 border-dashed ${column.color} min-h-[500px]`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {jobsByStatus[column.id]?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {(jobsByStatus[column.id] || []).map((job) => (
                      <SortableJobCard
                        key={job.id}
                        job={job}
                        onEdit={() => setEditingJob(job)}
                        onView={() => setViewingJob(job)}
                      />
                    ))}
                  </div>
                </div>
              </div>
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
                  {activeJob.customers && (
                    <div className="flex items-center text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {activeJob.customers.first_name} {activeJob.customers.last_name}
                    </div>
                  )}
                  {activeJob.budget && (
                    <div className="flex items-center text-green-600 font-medium">
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

      {/* Edit Job Dialog */}
      {editingJob && (
        <EditJobDialog
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          onSuccess={() => setEditingJob(null)}
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
    </div>
  );
};

export default JobKanbanBoard;
