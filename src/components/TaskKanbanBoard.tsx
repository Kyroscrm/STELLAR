import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Calendar, Clock, User, Edit, Trash2, Eye, Search, Filter, List as ListIcon, BarChart3, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TaskFormDialog from '@/components/TaskFormDialog';
import ViewTaskDialog from '@/components/ViewTaskDialog';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// Define valid task statuses that match Supabase enum
const VALID_TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
type ValidTaskStatus = typeof VALID_TASK_STATUSES[number];

// Define kanban columns with proper status mapping
const columns = [{
  status: 'pending',
  title: 'Pending',
  color: 'bg-blue-50 border-blue-200',
  count: 0
}, {
  status: 'in_progress',
  title: 'In Progress',
  color: 'bg-orange-50 border-orange-200',
  count: 0
}, {
  status: 'completed',
  title: 'Completed',
  color: 'bg-green-50 border-green-200',
  count: 0
}, {
  status: 'cancelled',
  title: 'Cancelled',
  color: 'bg-red-50 border-red-200',
  count: 0
}];

// Droppable Column Component
interface DroppableColumnProps {
  column: typeof columns[0];
  children: React.ReactNode;
  taskCount: number;
}
const DroppableColumn: React.FC<DroppableColumnProps> = ({
  column,
  children,
  taskCount
}) => {
  const {
    setNodeRef,
    isOver
  } = useSortable({
    id: column.status,
    data: {
      type: 'column',
      status: column.status
    }
  });
  return <div ref={setNodeRef} className="space-y-4" id={column.status}>
      <div className={`p-4 rounded-lg border-2 transition-colors ${column.color} ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <h3 className="font-semibold text-center text-gray-700">
          {column.title} ({taskCount})
        </h3>
      </div>
      
      <div className="space-y-3 min-h-[400px] transition-colors rounded-lg p-2" style={{
      backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
    }}>
        {children}
      </div>
    </div>;
};

// Sortable Task Card Component
interface SortableTaskCardProps {
  task: any;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}
const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  onEdit,
  onView,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task: task
    }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-3 cursor-move hover:shadow-md transition-shadow bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => {
                e.stopPropagation();
                onView();
              }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => {
                e.stopPropagation();
                onEdit();
              }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={e => {
                e.stopPropagation();
                onDelete();
              }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusBadgeColor(task.status)} variant="outline">
              {task.status?.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {task.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>}
          
          <div className="space-y-2">
            {task.estimated_hours && <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimated_hours}h estimated
              </div>}
            
            {task.due_date && <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </div>}

            {task.assigned_to && <div className="flex items-center text-xs text-gray-500">
                <User className="h-3 w-3 mr-1" />
                Assigned
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
const TaskKanbanBoard = () => {
  const {
    tasks,
    loading,
    updateTask,
    deleteTask
  } = useTasks();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });
  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Calculate metrics
  const totalTasks = filteredTasks.length;
  const pendingTasks = getTasksByStatus('pending').length;
  const inProgressTasks = getTasksByStatus('in_progress').length;
  const completedTasks = getTasksByStatus('completed').length;
  const handleDragStart = (event: DragStartEvent) => {
    const {
      active
    } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    setActiveTask(null);
    if (!over) return;
    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine the new status based on drop target
    let newStatus: ValidTaskStatus | null = null;

    // Check if dropping directly over a column
    if (VALID_TASK_STATUSES.includes(over.id as ValidTaskStatus)) {
      newStatus = over.id as ValidTaskStatus;
    }
    // Check if dropping over another task, get its column status
    else {
      const targetTask = tasks.find(t => t.id === over.id);
      if (targetTask && VALID_TASK_STATUSES.includes(targetTask.status as ValidTaskStatus)) {
        newStatus = targetTask.status as ValidTaskStatus;
      }
    }
    if (!newStatus || task.status === newStatus) return;
    try {
      const success = await updateTask(taskId, {
        status: newStatus
      });
      if (success) {
        const statusDisplay = newStatus.replace('_', ' ');
        toast.success(`Task moved to ${statusDisplay}`);
      } else {
        toast.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    // Allow dropping over columns, tasks, or any valid drop target
  };
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await deleteTask(deleteTaskId);
      setDeleteTaskId(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
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
    return <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* Header Section - Blue Background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Task Management</h1>
              <p className="text-blue-100">Organize, track, and complete your team's work efficiently</p>
            </div>
            <div className="hidden md:block">
              <img alt="Task Management" className="w-32 h-20 rounded-lg object-cover" src="/lovable-uploads/9e3f6abc-5416-43d5-b655-52bba8811ab8.png" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <Button onClick={() => setShowNewTaskForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks by title, description, status..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-80" />
            </div>
            
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Kanban
              </Button>
              <Button variant="outline" size="sm">
                <ListIcon className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold">{totalTasks}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{pendingTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressTasks}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{completedTasks}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <p className="text-gray-600 text-sm">Manage your project tasks</p>
            </div>
            <Button onClick={() => setShowNewTaskForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {columns.map(column => <SortableContext key={column.status} items={[column.status, ...getTasksByStatus(column.status).map(task => task.id)]} strategy={verticalListSortingStrategy}>
                  <DroppableColumn column={column} taskCount={getTasksByStatus(column.status).length}>
                    {getTasksByStatus(column.status).map(task => <SortableTaskCard key={task.id} task={task} onEdit={() => setEditingTask(task)} onView={() => setViewingTask(task)} onDelete={() => setDeleteTaskId(task.id)} />)}
                  </DroppableColumn>
                </SortableContext>)}
            </div>

            <DragOverlay>
              {activeTask ? <Card className="cursor-move shadow-lg rotate-3 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {activeTask.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      {activeTask.estimated_hours && <div className="flex items-center text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {activeTask.estimated_hours}h estimated
                        </div>}
                    </div>
                  </CardContent>
                </Card> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* New Task Dialog */}
      <TaskFormDialog open={showNewTaskForm} onOpenChange={setShowNewTaskForm} onSuccess={handleTaskSuccess} onCancel={handleTaskCancel} />

      {/* Edit Task Dialog */}
      {editingTask && <TaskFormDialog task={editingTask} open={!!editingTask} onOpenChange={open => !open && setEditingTask(null)} onSuccess={handleTaskSuccess} onCancel={handleTaskCancel} />}

      {/* View Task Dialog */}
      {viewingTask && <ViewTaskDialog task={viewingTask} open={!!viewingTask} onOpenChange={open => !open && setViewingTask(null)} />}

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
    </div>;
};
export default TaskKanbanBoard;