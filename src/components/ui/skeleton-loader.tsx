import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SkeletonType = 'table' | 'card' | 'list' | 'stats' | 'detail';

interface SkeletonLoaderProps {
  count?: number;
  type?: SkeletonType;
  className?: string;
  columns?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 5,
  type = 'card',
  className = '',
  columns = 4
}) => {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={count} columns={columns} className={className} />;
    case 'stats':
      return <StatsSkeleton count={count} className={className} />;
    case 'detail':
      return <DetailSkeleton className={className} />;
    case 'list':
      return <ListSkeleton count={count} className={className} />;
    default:
      return <CardSkeleton count={count} className={className} />;
  }
};

const TableSkeleton: React.FC<{ rows: number; columns: number; className?: string }> = ({ rows, columns, className }) => {
  return (
    <div className={cn("w-full", className)} data-testid="skeleton-container">
      <div className="border rounded-md">
        {/* Table Header */}
        <div className="border-b p-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-8 flex-1" data-testid="skeleton-table-header-cell" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4 border-b last:border-0" data-testid="skeleton-table-row">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="h-6 flex-1"
                  data-testid="skeleton-table-cell"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CardSkeleton: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} data-testid="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden" data-testid="skeleton-card">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const StatsSkeleton: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)} data-testid="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} data-testid="skeleton-stat">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="mr-4">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ListSkeleton: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
  return (
    <div className={cn("space-y-2", className)} data-testid="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-md" data-testid="skeleton-list-item">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};

const DetailSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)} data-testid="skeleton-container">
      <div data-testid="skeleton-detail">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
