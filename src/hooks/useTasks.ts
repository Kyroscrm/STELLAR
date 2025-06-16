
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Task = Tables<'tasks'>;
type TaskInsert = Omit<TablesInsert<'tasks'>, 'user_id'>;
type TaskUpdate = TablesUpdate<'tasks'>;

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      console.log(`Fetched ${data?.length || 0} tasks`);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError(error);
      toast.error('Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskInsert) => {
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      toast.success('Task created successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: data.id,
        action: 'created',
        description: `Task created: ${data.title}`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    if (!user) {
      toast.error('You must be logged in to update tasks');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast.success('Task updated successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: id,
        action: 'updated',
        description: `Task updated`
      });

      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tasks');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
      
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: id,
        action: 'deleted',
        description: `Task deleted`
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  // Alias for addTask to match component expectations
  const addTask = createTask;

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    addTask,
    updateTask,
    deleteTask
  };
};
