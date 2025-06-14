
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Job {
  id: string;
  title: string;
  status: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  address?: string;
  customers?: {
    first_name: string;
    last_name: string;
  };
  estimated_hours?: number;
  description?: string;
}

const JobKanbanBoard = () => {
  const { jobs, loading, updateJob } = useJobs();
  const [columns, setColumns] = useState({
    quoted: { title: 'Quoted', jobs: [] as Job[] },
    scheduled: { title: 'Scheduled', jobs: [] as Job[] },
    in_progress: { title: 'In Progress', jobs: [] as Job[] },
    completed: { title: 'Completed', jobs: [] as Job[] },
    cancelled: { title: 'Cancelled', jobs: [] as Job[] }
  });

  useEffect(() => {
    const newColumns = {
      quoted: { title: 'Quoted', jobs: [] as Job[] },
      scheduled: { title: 'Scheduled', jobs: [] as Job[] },
      in_progress: { title: 'In Progress', jobs: [] as Job[] },
      completed: { title: 'Completed', jobs: [] as Job[] },
      cancelled: { title: 'Cancelled', jobs: [] as Job[] }
    };

    jobs.forEach(job => {
      const status = job.status || 'quoted';
      if (newColumns[status as keyof typeof newColumns]) {
        newColumns[status as keyof typeof newColumns].jobs.push(job);
      }
    });

    setColumns(newColumns);
  }, [jobs]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId as keyof typeof columns];
    const destColumn = columns[destination.droppableId as keyof typeof columns];
    const draggedJob = sourceColumn.jobs.find(job => job.id === draggableId);

    if (!draggedJob) return;

    // Update job status
    await updateJob(draggableId, { status: destination.droppableId as any });

    // Update local state
    const newSourceJobs = Array.from(sourceColumn.jobs);
    const newDestJobs = Array.from(destColumn.jobs);

    newSourceJobs.splice(source.index, 1);
    newDestJobs.splice(destination.index, 0, { ...draggedJob, status: destination.droppableId });

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        jobs: newSourceJobs
      },
      [destination.droppableId]: {
        ...destColumn,
        jobs: newDestJobs
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Jobs Kanban Board</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <Badge variant="secondary">{column.jobs.length}</Badge>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {column.jobs.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm line-clamp-2">
                                  {job.title}
                                </CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Edit Job</DropdownMenuItem>
                                    <DropdownMenuItem>Create Estimate</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <Badge className={`${getStatusColor(job.status)} w-fit`}>
                                {job.status}
                              </Badge>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {job.customers && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <User className="h-3 w-3 mr-1" />
                                    {job.customers.first_name} {job.customers.last_name}
                                  </div>
                                )}
                                {job.address && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">{job.address}</span>
                                  </div>
                                )}
                                {job.budget && (
                                  <div className="flex items-center text-xs font-medium text-green-600">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${job.budget.toLocaleString()}
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  {job.start_date && (
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(job.start_date).toLocaleDateString()}
                                    </div>
                                  )}
                                  {job.estimated_hours && (
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {job.estimated_hours}h
                                    </div>
                                  )}
                                </div>
                                {job.description && (
                                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded line-clamp-2">
                                    {job.description}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default JobKanbanBoard;
