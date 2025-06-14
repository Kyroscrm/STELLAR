
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTasks } from '@/hooks/useTasks';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2,
  MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TaskKanbanBoard = () => {
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const { jobs } = useJobs();

  const columns = {
    pending: { title: 'To Do', color: 'bg-gray-100' },
    in_progress: { title: 'In Progress', color: 'bg-blue-100' },
    completed: { title: 'Completed', color: 'bg-green-100' }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as 'pending' | 'in_progress' | 'completed';
    
    await updateTask(draggableId, { status: newStatus });
  };

  const getJobTitle = (jobId: string | null) => {
    if (!jobId) return 'No Job';
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className={`${column.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="outline">
                  {getTasksByStatus(status).length}
                </Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                    }`}
                  >
                    {getTasksByStatus(status).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg' : 'hover:shadow-md'
                            } transition-all`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {task.title}
                                </CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                    <DropdownMenuItem>Assign User</DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => deleteTask(task.id)}
                                    >
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <Badge className={getPriorityColor(task.priority || 'medium')}>
                                {task.priority}
                              </Badge>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                              {task.description && (
                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {getJobTitle(task.job_id)}
                              </div>

                              {task.due_date && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}

                              {task.estimated_hours && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimated_hours}h estimated
                                  {task.actual_hours && ` / ${task.actual_hours}h actual`}
                                </div>
                              )}

                              {task.assigned_to && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Assigned to:</span>
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {task.assigned_to.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              )}
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

export default TaskKanbanBoard;
