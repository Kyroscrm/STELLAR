import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTimeEntries, CreateTimeEntryData } from '@/hooks/useTimeEntries';
import { useCrews } from '@/hooks/useCrews';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, Square, Users, DollarSign } from 'lucide-react';

interface TimeEntryFormProps {
  jobId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  jobId,
  userId,
  onSuccess,
  onCancel
}) => {
  const { createTimeEntry, clockIn, loading, initializeTimeEntries } = useTimeEntries();
  const { crews, fetchCrews } = useCrews();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    entry_type: 'regular' as const,
    hourly_rate: '',
    crew_id: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize data when component mounts
  useEffect(() => {
    initializeTimeEntries();
    fetchCrews();
  }, [initializeTimeEntries, fetchCrews]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_time) {
      toast({
        title: "Error",
        description: "Start time is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const timeEntryData: CreateTimeEntryData = {
        job_id: jobId,
        user_id: userId,
        start_time: formData.start_time,
        entry_type: formData.entry_type,
        crew_id: formData.crew_id || undefined,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        description: formData.description || undefined,
      };

      if (formData.end_time) {
        timeEntryData.end_time = formData.end_time;
      }

      const result = await createTimeEntry(timeEntryData);

      if (result) {
        toast({
          title: "Success",
          description: "Time entry created successfully",
        });

        // Reset form
        setFormData({
          start_time: new Date().toISOString().slice(0, 16),
          end_time: '',
          entry_type: 'regular',
          hourly_rate: '',
          crew_id: '',
          description: '',
        });

        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create time entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickClockIn = async () => {
    // Validate required fields
    if (!jobId) {
      toast({
        title: "Error",
        description: "Job ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await clockIn(
        jobId,
        userId,
        formData.crew_id || undefined,
        formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined
      );

      if (result) {
        toast({
          title: "Clocked In",
          description: "Time tracking started successfully",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 ? diffHours.toFixed(2) : '0.00';
    }
    return '0.00';
  };

  const calculateEstimatedCost = () => {
    const duration = parseFloat(calculateDuration());
    const rate = parseFloat(formData.hourly_rate || '0');
    return (duration * rate).toFixed(2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Log Work Time
        </CardTitle>
        <CardDescription>
          Track time spent on this job with detailed entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
            <Button
              type="button"
              onClick={handleQuickClockIn}
              disabled={isSubmitting || loading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Quick Clock In
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duration: {calculateDuration()}h
            </Badge>
            {formData.hourly_rate && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Est. Cost: ${calculateEstimatedCost()}
              </Badge>
            )}
          </div>

          {/* Time Entry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                min={formData.start_time}
              />
            </div>

            {/* Entry Type */}
            <div className="space-y-2">
              <Label htmlFor="entry_type">Entry Type</Label>
              <Select
                value={formData.entry_type}
                onValueChange={(value) => handleInputChange('entry_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Time</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                  <SelectItem value="travel">Travel Time</SelectItem>
                  <SelectItem value="break">Break Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
              />
            </div>

            {/* Crew Assignment */}
            {crews.length > 0 && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="crew_id" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assigned Crew
                </Label>
                <Select
                  value={formData.crew_id}
                  onValueChange={(value) => handleInputChange('crew_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crew (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No crew assignment</SelectItem>
                    {crews.map((crew) => (
                      <SelectItem key={crew.id} value={crew.id}>
                        {crew.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Work Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the work performed during this time..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Log Time Entry
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimeEntryForm;
