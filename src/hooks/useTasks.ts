
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
  const { user, session } = useAuth();

  const validateUserAndSession = () => {
    if (!user || !session) {
      const errorMsg = 'Authentication required. Please log in again.';
      setError(new Error(errorMsg));
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const fetchTasks = async () => {
    if (!validateUserAndSession()) return;
    
    setLoading(true);
    setError(null);
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
      setError(error);
      toast.error('Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskInsert) => {
    if (!validateUserAndSession()) return null;

    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      ...taskData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Task;

    // Optimistic update
    setTasks(prev => [optimisticTask, ...prev]);

    try {
      console.log('Creating task:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      // Replace optimistic with real data
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? data : t));
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: data.id,
        action: 'created',
        description: `Task created: ${data.title}`
      });

      toast.success('Task created successfully');
      console.log('Task created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      // Rollback optimistic update
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      toast.error(error.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) {
      toast.error('Task not found');
      return false;
    }

    // Optimistic update
    const optimisticTask = { ...originalTask, ...updates, updated_at: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === id ? optimisticTask : t));

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
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: id,
        action: 'updated',
        description: `Task updated: ${data.title}`
      });

      toast.success('Task updated successfully');
      console.log('Task updated successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      // Rollback optimistic update
      setTasks(prev => prev.map(t => t.id === id ? originalTask : t));
      toast.error(error.message || 'Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) {
      toast.error('Task not found');
      return;
    }

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      console.log('Deleting task:', id);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: id,
        action: 'deleted',
        description: `Task deleted: ${originalTask.title}`
      });

      toast.success('Task deleted successfully');
      console.log('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      // Rollback optimistic update
      setTasks(prev => [...prev, originalTask].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error(error.message || 'Failed to delete task');
    }
  };

  // Alias for addTask to match component expectations
  const addTask = createTask;

  useEffect(() => {
    fetchTasks();
  }, [user, session]);

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
