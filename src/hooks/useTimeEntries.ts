import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditTrail } from '@/hooks/useAuditTrail';

export interface TimeEntry {
  id: string;
  job_id: string;
  user_id: string;
  crew_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours: number;
  entry_type: 'regular' | 'overtime' | 'travel' | 'break';
  hourly_rate?: number;
  total_cost: number;
  description?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  job?: {
    id: string;
    title: string;
    customer_id: string;
  };
  user?: {
    id: string;
    email: string;
  };
  crew?: {
    id: string;
    name: string;
  };
}

export interface CreateTimeEntryData {
  job_id: string;
  user_id: string;
  crew_id?: string;
  start_time: string;
  end_time?: string;
  entry_type?: 'regular' | 'overtime' | 'travel' | 'break';
  hourly_rate?: number;
  description?: string;
}

export interface UpdateTimeEntryData {
  id: string;
  end_time?: string;
  entry_type?: 'regular' | 'overtime' | 'travel' | 'break';
  hourly_rate?: number;
  description?: string;
  approved?: boolean;
}

export interface TimeEntryFilters {
  job_id?: string;
  user_id?: string;
  crew_id?: string;
  start_date?: string;
  end_date?: string;
  approved?: boolean;
  entry_type?: 'regular' | 'overtime' | 'travel' | 'break';
}

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logActivity } = useAuditTrail();

  // Fetch time entries with optional filters
  const fetchTimeEntries = async (filters?: TimeEntryFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          job:jobs(id, title, customer_id),
          user:auth.users(id, email),
          crew:crews(id, name)
        `)
        .order('start_time', { ascending: false });

      // Apply filters
      if (filters?.job_id) {
        query = query.eq('job_id', filters.job_id);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.crew_id) {
        query = query.eq('crew_id', filters.crew_id);
      }
      if (filters?.approved !== undefined) {
        query = query.eq('approved', filters.approved);
      }
      if (filters?.entry_type) {
        query = query.eq('entry_type', filters.entry_type);
      }
      if (filters?.start_date) {
        query = query.gte('start_time', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('start_time', filters.end_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch time entries: ${fetchError.message}`);
      }

      setTimeEntries(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create time entry with optimistic update
  const createTimeEntry = async (timeEntryData: CreateTimeEntryData): Promise<TimeEntry | null> => {
    try {
      // Validation
      if (!timeEntryData.job_id || !timeEntryData.user_id || !timeEntryData.start_time) {
        throw new Error('Job ID, User ID, and start time are required');
      }

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticEntry: TimeEntry = {
        id: tempId,
        ...timeEntryData,
        duration_hours: 0,
        total_cost: 0,
        approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTimeEntries(prev => [optimisticEntry, ...prev]);

      const { data, error: createError } = await supabase
        .from('time_entries')
        .insert([timeEntryData])
        .select(`
          *,
          job:jobs(id, title, customer_id),
          user:auth.users(id, email),
          crew:crews(id, name)
        `)
        .single();

      if (createError) {
        // Revert optimistic update
        setTimeEntries(prev => prev.filter(entry => entry.id !== tempId));
        throw new Error(`Failed to create time entry: ${createError.message}`);
      }

      // Replace optimistic update with real data
      setTimeEntries(prev =>
        prev.map(entry => entry.id === tempId ? data : entry)
      );

      // Log activity
      await logActivity(
        'create',
        'time_entry',
        data.id,
        `Time entry created for job ${timeEntryData.job_id}`,
        { duration_hours: data.duration_hours, total_cost: data.total_cost }
      );

      toast({
        title: "Success",
        description: "Time entry created successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create time entry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update time entry with optimistic update
  const updateTimeEntry = async (updateData: UpdateTimeEntryData): Promise<TimeEntry | null> => {
    try {
      if (!updateData.id) {
        throw new Error('Time entry ID is required');
      }

      // Optimistic update
      setTimeEntries(prev =>
        prev.map(entry =>
          entry.id === updateData.id
            ? { ...entry, ...updateData, updated_at: new Date().toISOString() }
            : entry
        )
      );

      const { data, error: updateError } = await supabase
        .from('time_entries')
        .update(updateData)
        .eq('id', updateData.id)
        .select(`
          *,
          job:jobs(id, title, customer_id),
          user:auth.users(id, email),
          crew:crews(id, name)
        `)
        .single();

      if (updateError) {
        // Revert optimistic update
        await fetchTimeEntries();
        throw new Error(`Failed to update time entry: ${updateError.message}`);
      }

      // Update with real data
      setTimeEntries(prev =>
        prev.map(entry => entry.id === updateData.id ? data : entry)
      );

      // Log activity
      await logActivity(
        'update',
        'time_entry',
        data.id,
        `Time entry updated`,
        { changes: updateData }
      );

      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update time entry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete time entry with optimistic update
  const deleteTimeEntry = async (id: string): Promise<boolean> => {
    try {
      if (!id) {
        throw new Error('Time entry ID is required');
      }

      // Store original for potential revert
      const originalEntry = timeEntries.find(entry => entry.id === id);

      // Optimistic update
      setTimeEntries(prev => prev.filter(entry => entry.id !== id));

      const { error: deleteError } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Revert optimistic update
        if (originalEntry) {
          setTimeEntries(prev => [originalEntry, ...prev]);
        }
        throw new Error(`Failed to delete time entry: ${deleteError.message}`);
      }

      // Log activity
      await logActivity(
        'delete',
        'time_entry',
        id,
        'Time entry deleted',
        { deleted_entry: originalEntry }
      );

      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete time entry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Clock in - create a new time entry with current time
  const clockIn = async (jobId: string, userId: string, crewId?: string, hourlyRate?: number): Promise<TimeEntry | null> => {
    return createTimeEntry({
      job_id: jobId,
      user_id: userId,
      crew_id: crewId,
      start_time: new Date().toISOString(),
      hourly_rate: hourlyRate,
      description: 'Clock in'
    });
  };

  // Clock out - update existing time entry with end time
  const clockOut = async (timeEntryId: string): Promise<TimeEntry | null> => {
    return updateTimeEntry({
      id: timeEntryId,
      end_time: new Date().toISOString()
    });
  };

  // Approve time entry
  const approveTimeEntry = async (id: string, userId: string): Promise<TimeEntry | null> => {
    return updateTimeEntry({
      id,
      approved: true
    });
  };

  // Get time entries for a specific job
  const getTimeEntriesByJob = (jobId: string) => {
    return timeEntries.filter(entry => entry.job_id === jobId);
  };

  // Get time entries for a specific user
  const getTimeEntriesByUser = (userId: string) => {
    return timeEntries.filter(entry => entry.user_id === userId);
  };

  // Calculate total hours and costs
  const getTotals = (entries: TimeEntry[] = timeEntries) => {
    return entries.reduce((totals, entry) => ({
      totalHours: totals.totalHours + (entry.duration_hours || 0),
      totalCost: totals.totalCost + (entry.total_cost || 0),
      approvedHours: totals.approvedHours + (entry.approved ? (entry.duration_hours || 0) : 0),
      approvedCost: totals.approvedCost + (entry.approved ? (entry.total_cost || 0) : 0),
    }), {
      totalHours: 0,
      totalCost: 0,
      approvedHours: 0,
      approvedCost: 0,
    });
  };

  // Initialize
  useEffect(() => {
    fetchTimeEntries();
  }, []);

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    clockIn,
    clockOut,
    approveTimeEntry,
    getTimeEntriesByJob,
    getTimeEntriesByUser,
    getTotals,
    refetch: fetchTimeEntries,
  };
}
