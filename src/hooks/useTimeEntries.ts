import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  job_id?: string;
  crew_id?: string;
  start_time?: string;
  end_time?: string;
  entry_type?: 'regular' | 'overtime' | 'travel' | 'break';
  hourly_rate?: number;
  description?: string;
  approved?: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface TimeEntryFilters {
  job_id?: string;
  user_id?: string;
  crew_id?: string;
  approved?: boolean;
  entry_type?: 'regular' | 'overtime' | 'travel' | 'break';
  start_date?: string;
  end_date?: string;
}

// Simple activity logging function to avoid dependency issues
const logTimeEntryActivity = async (action: string, entityId: string, description: string) => {
  try {
    // Use simplified Supabase RPC call that matches our new function signature
    await supabase.rpc('log_activity', {
      p_action: action,
      p_entity_type: 'time_entries',
      p_entity_id: entityId,
      p_description: description
    });
  } catch (error) {
    // Silent fail for activity logging to not break main functionality
    // Activity logging failures should not interrupt the main time entry operations
  }
};

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  // Fetch time entries with optional filters
  const fetchTimeEntries = async (filters?: TimeEntryFilters) => {
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build the query for time_entries table with error handling
      // Use any cast since the table might not exist in types yet
      const { data, error: fetchError } = await (supabase as any)
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(100);

      if (fetchError) {
        // Check if it's a table doesn't exist error
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('does not exist') || fetchError.message.includes('relation') || fetchError.message.includes('table')) {
          setError('Time entries table not found. Please contact administrator to set up the database.');
          setTimeEntries([]);
          setHasInitialized(true);
          return;
        }
        throw new Error(`Failed to fetch time entries: ${fetchError.message}`);
      }

      // Apply filters on the client side for now since we need to handle RLS properly
      let filteredData = data || [];

      if (filters?.job_id) {
        filteredData = filteredData.filter((entry: any) => entry.job_id === filters.job_id);
      }
      if (filters?.user_id) {
        filteredData = filteredData.filter((entry: any) => entry.user_id === filters.user_id);
      }
      if (filters?.crew_id) {
        filteredData = filteredData.filter((entry: any) => entry.crew_id === filters.crew_id);
      }
      if (filters?.approved !== undefined) {
        filteredData = filteredData.filter((entry: any) => entry.approved === filters.approved);
      }
      if (filters?.entry_type) {
        filteredData = filteredData.filter((entry: any) => entry.entry_type === filters.entry_type);
      }
      if (filters?.start_date) {
        filteredData = filteredData.filter((entry: any) => entry.start_time >= filters.start_date!);
      }
      if (filters?.end_date) {
        filteredData = filteredData.filter((entry: any) => entry.start_time <= filters.end_date!);
      }

      // Transform the data to match our TimeEntry interface
      const transformedData: TimeEntry[] = filteredData.map((entry: any) => ({
        id: entry.id,
        job_id: entry.job_id,
        user_id: entry.user_id,
        crew_id: entry.crew_id || undefined,
        start_time: entry.start_time,
        end_time: entry.end_time || undefined,
        duration_hours: entry.duration_hours || 0,
        entry_type: entry.entry_type || 'regular',
        hourly_rate: entry.hourly_rate || undefined,
        total_cost: entry.total_cost || 0,
        description: entry.description || undefined,
        approved: entry.approved || false,
        approved_by: entry.approved_by || undefined,
        approved_at: entry.approved_at || undefined,
        created_at: entry.created_at || new Date().toISOString(),
        updated_at: entry.updated_at || new Date().toISOString(),
      }));

      setTimeEntries(transformedData);
      setHasInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries';
      setError(errorMessage);
      setTimeEntries([]); // Set empty array to prevent UI crashes
      setHasInitialized(true);

      // Only show toast for non-table-missing errors
      if (!errorMessage.includes('table not found')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
        entry_type: timeEntryData.entry_type || 'regular',
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
        .select('*')
        .single();

      if (createError) {
        // Revert optimistic update
        setTimeEntries(prev => prev.filter(entry => entry.id !== tempId));
        throw new Error(`Failed to create time entry: ${createError.message}`);
      }

      // Transform the response data
      const transformedData: TimeEntry = {
        id: data.id,
        job_id: data.job_id,
        user_id: data.user_id,
        crew_id: data.crew_id || undefined,
        start_time: data.start_time,
        end_time: data.end_time || undefined,
        duration_hours: data.duration_hours || 0,
        entry_type: data.entry_type || 'regular',
        hourly_rate: data.hourly_rate || undefined,
        total_cost: data.total_cost || 0,
        description: data.description || undefined,
        approved: data.approved || false,
        approved_by: data.approved_by || undefined,
        approved_at: data.approved_at || undefined,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      // Replace optimistic update with real data
      setTimeEntries(prev =>
        prev.map(entry => entry.id === tempId ? transformedData : entry)
      );

      // Log activity
      await logTimeEntryActivity(
        'create',
        transformedData.id,
        `Time entry created for job ${timeEntryData.job_id}`
      );

      toast({
        title: "Success",
        description: "Time entry created successfully",
      });

      return transformedData;
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
      await logTimeEntryActivity(
        'update',
        data.id,
        `Time entry updated`
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
      await logTimeEntryActivity(
        'delete',
        id,
        'Time entry deleted'
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

  // Manual initialization to prevent automatic fetching
  const initializeTimeEntries = () => {
    if (!hasInitialized) {
      fetchTimeEntries();
    }
  };

  // Remove automatic useEffect to prevent infinite loops
  // Components should call initializeTimeEntries manually when needed

  return {
    timeEntries,
    loading,
    error,
    hasInitialized,
    fetchTimeEntries,
    initializeTimeEntries,
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
