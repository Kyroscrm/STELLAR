
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export type Task = Database['public']['Tables']['tasks']['Row'];

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }
      
      setTasks(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err);
      toast.error('Error fetching tasks: ' + (err.message || 'Could not retrieve tasks from the server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (newTaskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTaskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      toast.success('Task added successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: data.id,
        action: 'created',
        description: `Task created: ${newTaskData.title}`
      });

      return data;
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error('Error creating task: ' + (err.message || 'Could not create the task.'));
      return null;
    }
  };

  const updateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTaskData)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ));
      
      toast.success('Task updated successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: taskId,
        action: 'updated',
        description: `Task updated: ${data.title}`
      });

      return data;
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error('Error updating task: ' + (err.message || 'Could not update the task.'));
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        entity_type: 'task',
        entity_id: taskId,
        action: 'deleted',
        description: `Task deleted`
      });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toast.error('Error deleting task: ' + (err.message || 'Could not delete the task.'));
    }
  };

  return { 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask,
    fetchTasks 
  };
};
