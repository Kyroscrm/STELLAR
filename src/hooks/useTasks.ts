
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast'; // Corrected import path
import { Database } from '@/integrations/supabase/types';

export type Task = Database['public']['Tables']['tasks']['Row'];

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
          .eq('user_id', user.id) // Assuming tasks are user-specific
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }
        
        setTasks(data || []);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err);
        toast({
          title: "Error fetching tasks",
          description: err.message || "Could not retrieve tasks from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Placeholder functions for CRUD operations
  // TODO: Implement these with Supabase calls
  const addTask = async (newTaskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    console.log('Adding task:', newTaskData);
    // Example: const { data, error } = await supabase.from('tasks').insert([{ ...newTaskData, user_id: user.id }]).select();
    toast({ title: "Task added (mock)" });
  };

  const updateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
    console.log('Updating task:', taskId, updatedTaskData);
    // Example: const { data, error } = await supabase.from('tasks').update(updatedTaskData).eq('id', taskId).select();
    toast({ title: "Task updated (mock)" });
  };

  const deleteTask = async (taskId: string) => {
    console.log('Deleting task:', taskId);
    // Example: const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    toast({ title: "Task deleted (mock)", variant: "destructive" });
  };


  return { tasks, loading, error, addTask, updateTask, deleteTask };
};
