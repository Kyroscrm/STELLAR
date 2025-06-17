
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Calendar, Clock, User, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import TaskFormDialog from '@/components/TaskFormDialog';
import ViewTaskDialog from '@/components/ViewTaskDialog';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// Sortable Task Card Component
interface SortableTaskCardProps {
  task: any;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onEdit, onView, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusBadgeColor(task.status)} variant="outline">
              {task.status}
            </Badge>
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {task.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="space-y-2">
            {task.estimated_hours && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimated_hours}h estimated
              </div>
            )}
            
            {task.due_date && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}

            {task.assigned_to && (
              <div className="flex items-center text-xs text-gray-500">
                <User className="h-3 w-3 mr-1" />
                Assigned
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TaskKanbanBoard = () => {
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);

  const columns = [
    { status: 'pending', title: 'Pending', color: 'bg-gray-100' },
    { status: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { status: 'completed', title: 'Completed', color: 'bg-green-100' },
    { status: 'cancelled', title: 'Cancelled', color: 'bg-red-100' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if we're dropping over a valid column
    const validStatuses = columns.map(col => col.status);
    if (!validStatuses.includes(newStatus)) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    const success = await updateTask(taskId, { status: newStatus as any });
    if (success) {
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskSuccess = () => {
    setShowNewTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskCancel = () => {
    setShowNewTaskForm(false);
    setEditingTask(null);
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
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-gray-600">Manage your project tasks</p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-screen">
          {columns.map((column) => (
            <SortableContext 
              key={column.status}
              items={getTasksByStatus(column.status).map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4" id={column.status}>
                <div className={`p-4 rounded-lg ${column.color}`}>
                  <h3 className="font-semibold text-center">
                    {column.title} ({getTasksByStatus(column.status).length})
                  </h3>
                </div>
                
                <div className="space-y-3 min-h-[400px]">
                  {getTasksByStatus(column.status).map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onView={() => setViewingTask(task)}
                      onDelete={() => setDeleteTaskId(task.id)}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="cursor-move shadow-lg rotate-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {activeTask.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  {activeTask.estimated_hours && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {activeTask.estimated_hours}h estimated
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Task Dialog */}
      <TaskFormDialog
        open={showNewTaskForm}
        onOpenChange={setShowNewTaskForm}
        onSuccess={handleTaskSuccess}
        onCancel={handleTaskCancel}
      />

      {/* Edit Task Dialog */}
      {editingTask && (
        <TaskFormDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSuccess={handleTaskSuccess}
          onCancel={handleTaskCancel}
        />
      )}

      {/* View Task Dialog */}
      {viewingTask && (
        <ViewTaskDialog
          task={viewingTask}
          open={!!viewingTask}
          onOpenChange={(open) => !open && setViewingTask(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskKanbanBoard;
