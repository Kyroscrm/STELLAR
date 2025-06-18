
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface InvoiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (statuses: string[]) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  amountRange: { min: number; max: number };
  onAmountRangeChange: (range: { min: number; max: number }) => void;
  onClearFilters: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  amountRange,
  onAmountRangeChange,
  onClearFilters
}) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' }
  ];

  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const hasActiveFilters = statusFilter.length > 0 || 
    dateRange.from || 
    dateRange.to || 
    amountRange.min > 0 || 
    amountRange.max < 10000;

  // Handle date range selection with proper typing
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange({
        from: range.from,
        to: range.to
      });
    } else {
      onDateRangeChange({});
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search invoices by number, title, or customer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant={statusFilter.includes(option.value) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer hover:opacity-80 transition-opacity',
                  statusFilter.includes(option.value) ? option.color : ''
                )}
                onClick={() => toggleStatus(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    'Pick a date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  } as DateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={amountRange.min || ''}
              onChange={(e) => onAmountRangeChange({
                ...amountRange,
                min: Number(e.target.value) || 0
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={amountRange.max === 10000 ? '' : amountRange.max}
              onChange={(e) => onAmountRangeChange({
                ...amountRange,
                max: Number(e.target.value) || 10000
              })}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceFilters;
