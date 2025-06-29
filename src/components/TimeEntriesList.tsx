import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTimeEntries, TimeEntry, TimeEntryFilters } from '@/hooks/useTimeEntries';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Play,
  Square,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Search,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

interface TimeEntriesListProps {
  jobId?: string;
  userId?: string;
  showFilters?: boolean;
  onEntrySelect?: (entry: TimeEntry) => void;
}

const TimeEntriesList: React.FC<TimeEntriesListProps> = ({
  jobId,
  userId,
  showFilters = true,
  onEntrySelect
}) => {
  const {
    timeEntries,
    loading,
    hasInitialized,
    fetchTimeEntries,
    initializeTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    clockOut,
    approveTimeEntry,
    getTotals
  } = useTimeEntries();

  const { toast } = useToast();

  const [filters, setFilters] = useState<TimeEntryFilters>({
    job_id: jobId,
    user_id: userId,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Initialize time entries manually to prevent infinite loops
  useEffect(() => {
    if (!hasInitialized) {
      initializeTimeEntries();
    }
  }, [hasInitialized, initializeTimeEntries]);

  // Apply filters when filters change (but not on mount)
  useEffect(() => {
    if (hasInitialized) {
      fetchTimeEntries(filters);
    }
  }, [filters, hasInitialized]);

  // Filter entries based on search term
  const filteredEntries = timeEntries.filter(entry =>
    !searchTerm ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (key: keyof TimeEntryFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const handleClockOut = async (entryId: string) => {
    const result = await clockOut(entryId);
    if (result) {
      toast({
        title: "Clocked Out",
        description: "Time entry completed successfully",
      });
    }
  };

  const handleApprove = async (entryId: string) => {
    // Get current user ID (you might need to get this from auth context)
    const currentUserId = userId || 'current-user-id'; // Replace with actual current user logic
    const result = await approveTimeEntry(entryId, currentUserId);
    if (result) {
      toast({
        title: "Approved",
        description: "Time entry approved successfully",
      });
    }
  };

  const handleDelete = async (entryId: string) => {
    const result = await deleteTimeEntry(entryId);
    if (result) {
      toast({
        title: "Deleted",
        description: "Time entry deleted successfully",
      });
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'overtime': return 'bg-orange-100 text-orange-800';
      case 'travel': return 'bg-purple-100 text-purple-800';
      case 'break': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isActiveEntry = (entry: TimeEntry) => {
    return entry.start_time && !entry.end_time;
  };

  const totals = getTotals(filteredEntries);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading time entries...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Entries
            </CardTitle>
            <CardDescription>
              Track and manage work time entries
            </CardDescription>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{formatDuration(totals.totalHours)}</div>
              <div className="text-gray-500">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">${totals.totalCost.toFixed(2)}</div>
              <div className="text-gray-500">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-600">{formatDuration(totals.approvedHours)}</div>
              <div className="text-gray-500">Approved</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search time entries..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filters.approved?.toString() || ''}
                onChange={(e) => handleFilterChange('approved', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All Entries</option>
                <option value="true">Approved Only</option>
                <option value="false">Pending Approval</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filters.entry_type || ''}
                onChange={(e) => handleFilterChange('entry_type', e.target.value as 'regular' | 'overtime' | 'travel' | 'break' | '')}
              >
                <option value="">All Types</option>
                <option value="regular">Regular</option>
                <option value="overtime">Overtime</option>
                <option value="travel">Travel</option>
                <option value="break">Break</option>
              </select>
            </div>
          </div>
        )}

        {/* Time Entries Table */}
        {filteredEntries.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={`hover:bg-gray-50 ${isActiveEntry(entry) ? 'bg-green-50' : ''}`}
                    onClick={() => onEntrySelect?.(entry)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {formatDateTime(entry.start_time)}
                          </span>
                        </div>
                        {entry.end_time && (
                          <div className="text-xs text-gray-500">
                            to {formatDateTime(entry.end_time)}
                          </div>
                        )}
                        {isActiveEntry(entry) && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Play className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">
                        {formatDuration(entry.duration_hours)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getEntryTypeColor(entry.entry_type)}>
                        {entry.entry_type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">
                          ${entry.total_cost.toFixed(2)}
                        </span>
                      </div>
                      {entry.hourly_rate && (
                        <div className="text-xs text-gray-500">
                          @ ${entry.hourly_rate}/hr
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.approved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {entry.description || 'No description'}
                      </div>
                      {entry.job && (
                        <div className="text-xs text-gray-500">
                          Job: {entry.job.title}
                        </div>
                      )}
                      {entry.crew && (
                        <div className="text-xs text-gray-500">
                          Crew: {entry.crew.name}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isActiveEntry(entry) && (
                            <DropdownMenuItem onClick={() => handleClockOut(entry.id)}>
                              <Square className="h-4 w-4 mr-2" />
                              Clock Out
                            </DropdownMenuItem>
                          )}

                          {!entry.approved && (
                            <DropdownMenuItem onClick={() => handleApprove(entry.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => onEntrySelect?.(entry)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this time entry? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(entry.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Entries</h3>
            <p className="text-gray-500">
              {searchTerm || Object.keys(filters).length > 2
                ? 'No time entries match your current filters.'
                : 'Start tracking time by creating your first time entry.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeEntriesList;
