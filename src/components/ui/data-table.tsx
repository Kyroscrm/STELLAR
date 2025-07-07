import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Search } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import EditTaskDialog from '@/components/EditTaskDialog';
import { Task } from '@/hooks/useTasks';
import SkeletonLoader from '@/components/ui/skeleton-loader';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  actions?: Array<{
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive';
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onBulkAction?: (action: string, items: T[]) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No data found',
  actions = [],
  onEdit,
  onDelete,
  onBulkAction,
  searchPlaceholder = "Search..."
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter data based on search term with real-time search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(column => {
        if (column.searchable === false) return false;
        const value = column.key === 'id' ? item.id : item[column.key as keyof T];
        return String(value || '').toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key: String(key),
      direction: current.key === String(key) && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(sortedData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const renderCellValue = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const value = column.key === 'id' ? item.id : item[column.key as keyof T];
    return String(value || '');
  };

  const isTask = (item: T): item is T & Task => {
    return 'title' in item && 'status' in item;
  };

  if (loading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error.message || 'An error occurred while loading data.'}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedItems.size > 0 && onBulkAction && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('delete', sortedData.filter(item => selectedItems.has(item.id)))}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {(onBulkAction || selectedItems.size > 0) && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.size === sortedData.length && sortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={column.width}>
                  {column.sortable !== false ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 font-semibold"
                    >
                      {column.header}
                      {sortConfig.key === String(column.key) && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete || actions.length > 0) && (
                <TableHead className="w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete || actions.length > 0 ? 1 : 0) + (onBulkAction ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm ? (
                    <div>
                      <p className="mb-1">No results found for "{searchTerm}"</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id}>
                  {(onBulkAction || selectedItems.size > 0) && (
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, index) => {
                    const value = column.key === 'id' ? item.id : item[column.key as keyof T];
                    return (
                      <TableCell key={index} className="px-6 py-4 text-sm text-gray-900">
                        {column.render ? column.render(item) : String(value || '')}
                      </TableCell>
                    );
                  })}
                  {(onEdit || onDelete || actions.length > 0) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'destructive' ? 'text-red-600' : ''}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                          {onEdit && isTask(item) && (
                            <EditTaskDialog
                              task={item}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  Edit
                                </DropdownMenuItem>
                              }
                            />
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
