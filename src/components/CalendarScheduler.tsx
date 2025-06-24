
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { useTasks } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay, parseISO } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Clock,
    Edit,
    Eye,
    MapPin,
    Plus,
    Trash2,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  job_id?: string;
  task_id?: string;
  attendees?: string[];
  all_day: boolean;
}

const CalendarScheduler = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { jobs } = useJobs();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for new events
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    job_id: '',
    task_id: '',
    all_day: false
  });

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to fetch calendar events: ${error.message}`);
      } else {
        toast.error('Failed to fetch calendar events');
      }
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!user || !newEvent.title) return;

    try {
      const eventData = {
        ...newEvent,
        user_id: user.id,
        start_time: newEvent.all_day
          ? `${format(selectedDate, 'yyyy-MM-dd')}T00:00:00`
          : `${format(selectedDate, 'yyyy-MM-dd')}T${newEvent.start_time}:00`,
        end_time: newEvent.all_day
          ? `${format(selectedDate, 'yyyy-MM-dd')}T23:59:59`
          : `${format(selectedDate, 'yyyy-MM-dd')}T${newEvent.end_time}:00`,
        job_id: newEvent.job_id || null,
        task_id: newEvent.task_id || null
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast.success('Event created successfully');
      setIsCreateModalOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        job_id: '',
        task_id: '',
        all_day: false
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to create event: ${error.message}`);
      } else {
        toast.error('Failed to create event');
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully');
      setIsViewModalOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to delete event: ${error.message}`);
      } else {
        toast.error('Failed to delete event');
      }
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(parseISO(event.start_time), date)
    );
  };

  const getDaysWithEvents = () => {
    return events.map(event => parseISO(event.start_time));
  };

  const getJobTitle = (jobId: string | null) => {
    if (!jobId) return null;
    const job = jobs.find(j => j.id === jobId);
    return job?.title;
  };

  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.title;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Event title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="all_day"
                      checked={newEvent.all_day}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, all_day: e.target.checked }))}
                    />
                    <Label htmlFor="all_day">All day event</Label>
                  </div>

                  {!newEvent.all_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_id">Related Job</Label>
                      <Select
                        value={newEvent.job_id}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, job_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Job</SelectItem>
                          {jobs.map(job => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task_id">Related Task</Label>
                      <Select
                        value={newEvent.task_id}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, task_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Task</SelectItem>
                          {tasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createEvent} disabled={!newEvent.title}>
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasEvents: getDaysWithEvents()
            }}
            modifiersStyles={{
              hasEvents: { backgroundColor: '#3B82F6', color: 'white' }
            }}
          />
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedEvent(event);
                  setIsViewModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {!event.all_day && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                      </div>
                    )}
                    {event.all_day && (
                      <Badge variant="outline" className="text-xs mt-1">
                        All Day
                      </Badge>
                    )}
                    {event.location && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No events scheduled for this date
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-gray-600 mt-2">{selectedEvent.description}</p>
                )}
              </div>

              <div className="space-y-2">
                {!selectedEvent.all_day ? (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(parseISO(selectedEvent.start_time), 'MMMM d, yyyy h:mm a')} -
                    {format(parseISO(selectedEvent.end_time), 'h:mm a')}
                  </div>
                ) : (
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(parseISO(selectedEvent.start_time), 'MMMM d, yyyy')} (All Day)
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedEvent.location}
                  </div>
                )}

                {selectedEvent.job_id && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2" />
                    Job: {getJobTitle(selectedEvent.job_id)}
                  </div>
                )}

                {selectedEvent.task_id && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2" />
                    Task: {getTaskTitle(selectedEvent.task_id)}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteEvent(selectedEvent.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarScheduler;
