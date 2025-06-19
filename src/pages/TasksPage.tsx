import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useJobs } from '@/hooks/useJobs';
import TaskFormDialog from '@/components/TaskFormDialog';
import EditTaskDialog from '@/components/EditTaskDialog';
import ViewTaskDialog from '@/components/ViewTaskDialog';
import TaskKanbanBoard from '@/components/TaskKanbanBoard';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '@/types/supabase-enums';

const TasksPage: React.FC = () => {
  const { tasks, loading, deleteTask } = useTasks();
  const { jobs } = useJobs();
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
  };

  const handleView = (task: Task) => {
    setViewTask(task);
  };

  const columns: Column<Task>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (task) => (
        <div className="font-medium">{task.title}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (task) => (
        <Badge className={TASK_STATUS_COLORS[task.status || 'pending']}>
          {task.status}
        </Badge>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (task) => (
        <Badge className={TASK_PRIORITY_COLORS[task.priority || 'medium']}>
          {task.priority}
        </Badge>
      )
    },
    {
      key: 'job_id',
      header: 'Job',
      render: (task) => task.job_id ? getJobTitle(task.job_id) : '-'
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (task) => task.due_date ? (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(task.due_date).toLocaleDateString()}
        </div>
      ) : '-'
    },
    {
      key: 'estimated_hours',
      header: 'Est. Hours',
      render: (task) => task.estimated_hours ? (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {task.estimated_hours}h
        </div>
      ) : '-'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <TaskFormDialog 
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <TaskKanbanBoard />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={tasks}
                columns={columns}
                loading={loading}
                emptyMessage="No tasks found"
                actions={[
                  {
                    label: 'View',
                    onClick: handleView
                  },
                  {
                    label: 'Edit',
                    onClick: (task) => {
                      // Edit functionality handled by EditTaskDialog
                    }
                  },
                  {
                    label: 'Delete',
                    onClick: handleDelete,
                    variant: 'destructive'
                  }
                ]}
                onEdit={(task) => {
                  // This will be handled by the DataTable's internal edit trigger
                }}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Task Dialog */}
      {viewTask && (
        <ViewTaskDialog
          task={viewTask}
          open={!!viewTask}
          onOpenChange={(open) => !open && setViewTask(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;
