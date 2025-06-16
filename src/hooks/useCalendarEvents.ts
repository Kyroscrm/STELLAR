
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  attendees?: string[];
  job_id?: string;
  task_id?: string;
  created_at: string;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('end_time', endDate.toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
      toast.success('Event created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      toast.error('Failed to create event');
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? data : event
      ).sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
      toast.success('Event updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating calendar event:', error);
      toast.error('Failed to update event');
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
    } catch (error: any) {
      console.error('Error deleting calendar event:', error);
      toast.error('Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents
  };
};
