import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export type Task = Tables<'tasks'>;
type TaskInsert = Omit<TablesInsert<'tasks'>, 'user_id'>;
type TaskUpdate = TablesUpdate<'tasks'>;

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: TaskInsert) => Promise<Task | null>;
  addTask: (taskData: TaskInsert) => Promise<Task | null>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<boolean>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, session } = useAuth();
  const { handleError } = useErrorHandler();
  const { executeUpdate } = useOptimisticUpdate();

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
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error: unknown) {
      const taskError = error instanceof Error ? error : new Error('Failed to fetch tasks');
      setError(taskError);
      handleError(taskError, { title: 'Failed to fetch tasks' });
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

    try {
      return await executeUpdate(
        // Optimistic update
        () => setTasks(prev => [optimisticTask, ...prev]),
        // Actual update
        async () => {
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

          return data;
        },
        // Rollback
        () => setTasks(prev => prev.filter(t => t.id !== optimisticTask.id)),
        {
          successMessage: 'Task created successfully',
          errorMessage: 'Failed to create task'
        }
      );
    } catch (error: unknown) {
      return null;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    if (!validateUserAndSession()) return false;

    // Store original for rollback
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) {
      handleError(new Error('Task not found'), { title: 'Update Failed' });
      return false;
    }

    const optimisticTask = { ...originalTask, ...updates, updated_at: new Date().toISOString() };

    try {
      return await executeUpdate(
        // Optimistic update
        () => setTasks(prev => prev.map(t => t.id === id ? optimisticTask : t)),
        // Actual update
        async () => {
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

          return true;
        },
        // Rollback
        () => setTasks(prev => prev.map(t => t.id === id ? originalTask : t)),
        {
          successMessage: 'Task updated successfully',
          errorMessage: 'Failed to update task'
        }
      );
    } catch (error: unknown) {
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!validateUserAndSession()) return;

    // Store original for rollback
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) {
      handleError(new Error('Task not found'), { title: 'Delete Failed' });
      return;
    }

    try {
      await executeUpdate(
        // Optimistic update
        () => setTasks(prev => prev.filter(t => t.id !== id)),
        // Actual update
        async () => {
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

          return true;
        },
        // Rollback
        () => setTasks(prev => [...prev, originalTask].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )),
        {
          successMessage: 'Task deleted successfully',
          errorMessage: 'Failed to delete task'
        }
      );
    } catch (error: unknown) {
      // Error handling is managed by executeUpdate
    }
  };

  // Alias for addTask to match component expectations
  const addTask = createTask;

  useEffect(() => {
    if (user && session) {
      fetchTasks();
    }
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
