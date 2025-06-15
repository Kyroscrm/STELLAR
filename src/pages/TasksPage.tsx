
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskKanbanBoard from '@/components/TaskKanbanBoard';
import TaskFormDialog from '@/components/TaskFormDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  ClipboardList,
  User,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  Kanban,
  List as ListIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TasksPage = () => {
  const { tasks, loading, error } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">Error loading tasks: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Task Management</h1>
              <p className="text-blue-100 text-lg">Organize, track, and complete your team's work efficiently</p>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop"
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-64 h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <TaskFormDialog />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-10 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold">{taskStats.total}</p>
                </div>
                <ClipboardList className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{taskStats.pending}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{taskStats.inProgress}</p>
                </div>
                <Zap className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{taskStats.completed}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {viewMode === 'kanban' ? (
          <TaskKanbanBoard />
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Task List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop"
                    alt="Empty state"
                    className="mx-auto w-48 h-32 object-cover rounded-lg mb-6 opacity-60"
                  />
                  <p className="text-gray-500 text-lg mb-4">No tasks found.</p>
                  <TaskFormDialog trigger={
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Task
                    </Button>
                  } />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status || 'pending')}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority || 'medium')}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {task.estimated_hours || 0}h est
                            {task.actual_hours ? ` / ${task.actual_hours}h actual` : ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <TaskFormDialog 
                                task={task}
                                trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit Task</DropdownMenuItem>}
                              />
                              <DropdownMenuItem className="text-red-600">
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
