
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingWrapper, TableSkeleton } from './LoadingWrapper';
import { NoDataFallback } from './FallbackUI';

interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    header: string;
    accessorKey?: keyof T;
    accessorFn?: (item: T) => React.ReactNode;
    className?: string;
  }>;
  loading?: boolean;
  error?: Error | null;
  emptyStateEntity?: 'invoices' | 'estimates' | 'jobs' | 'customers' | 'leads' | 'tasks';
  onCreateNew?: () => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  emptyStateEntity,
  onCreateNew,
  className = ""
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (error) {
    return (
      <LoadingWrapper loading={false} error={error}>
        {null}
      </LoadingWrapper>
    );
  }

  if (data.length === 0) {
    return emptyStateEntity ? (
      <NoDataFallback entity={emptyStateEntity} onCreateNew={onCreateNew} />
    ) : (
      <div className="text-center py-8 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {column.accessorFn 
                    ? column.accessorFn(item)
                    : column.accessorKey 
                    ? String(item[column.accessorKey] || '')
                    : ''
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
