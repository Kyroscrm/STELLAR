
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  job_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogs();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTasks(data || []);
      console.log(`Successfully fetched ${data?.length || 0} tasks`);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    // Optimistic update
    const tempTask: Task = {
      ...taskData,
      id: `temp-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [tempTask, ...prev]);

    try {
      console.log('Creating task:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic update with real data
      setTasks(prev => prev.map(t => t.id === tempTask.id ? data : t));
      
      await logActivity('create', 'task', data.id, `Created task: ${data.title}`);
      toast.success('Task created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      // Rollback optimistic update
      setTasks(prev => prev.filter(t => t.id !== tempTask.id));
      toast.error('Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const optimisticTask = tasks.find(t => t.id === id);
    if (optimisticTask) {
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ));
    }

    try {
      console.log('Updating task:', id, updates);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update with real data
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      
      await logActivity('update', 'task', id, `Updated task: ${data.title}`);
      toast.success('Task updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      // Rollback optimistic update
      if (optimisticTask) {
        setTasks(prev => prev.map(t => t.id === id ? optimisticTask : t));
      }
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('Authentication required');
      return false;
    }

    // Optimistic update
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      console.log('Deleting task:', id);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await logActivity('delete', 'task', id, `Deleted task: ${taskToDelete?.title}`);
      toast.success('Task deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      // Rollback optimistic update
      if (taskToDelete) {
        setTasks(prev => [...prev, taskToDelete].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      toast.error('Failed to delete task');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks
  };
};
