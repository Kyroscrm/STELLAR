import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleTableColumn<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface AccessibleTableProps<T> {
  /**
   * Table columns configuration
   */
  columns: AccessibleTableColumn<T>[];
  /**
   * Data to display in the table
   */
  data: T[];
  /**
   * Caption for the table (required for accessibility)
   */
  caption: string;
  /**
   * Whether to enable sorting
   */
  sortable?: boolean;
  /**
   * Number of rows per page
   */
  rowsPerPage?: number;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Error state
   */
  error?: string;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function AccessibleTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  sortable = true,
  rowsPerPage = 10,
  isLoading,
  error,
  emptyMessage = 'No data available',
  className,
}: AccessibleTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [announcement, setAnnouncement] = useState('');
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    let newRow = rowIndex;
    let newCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = Math.min(data.length - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = Math.max(0, colIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCol = Math.min(columns.length - 1, colIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        if (e.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case 'End':
        e.preventDefault();
        if (e.ctrlKey) {
          newRow = data.length - 1;
          newCol = columns.length - 1;
        } else {
          newCol = columns.length - 1;
        }
        break;
      case 'PageUp':
        e.preventDefault();
        handlePageChange(Math.max(1, currentPage - 1));
        return;
      case 'PageDown':
        e.preventDefault();
        handlePageChange(Math.min(totalPages, currentPage + 1));
        return;
    }

    setFocusedCell({ row: newRow, col: newCol });
    const cell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    if (cell instanceof HTMLElement) {
      cell.focus();
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setFocusedCell({ row: 0, col: 0 });
    setAnnouncement(`Page ${newPage} of ${totalPages}`);
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      const result = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (isLoading) {
    return <div role="status" aria-live="polite">Loading data...</div>;
  }

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (!data.length) {
    return <div role="status">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table
          className={cn('min-w-full divide-y divide-gray-200', className)}
          role="grid"
          aria-labelledby={`table-${caption}`}
        >
          <caption id={`table-${caption}`} className="sr-only">
            {caption}
          </caption>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.accessor)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  aria-sort={sortColumn === column.accessor ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortable !== false && (
                    <button
                      className="group inline-flex"
                      onClick={() => {
                        if (sortColumn === column.accessor) {
                          const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                          setSortDirection(newDirection);
                          setAnnouncement(`Sorted ${column.header} ${newDirection === 'asc' ? 'ascending' : 'descending'}`);
                        } else {
                          setSortColumn(column.accessor);
                          setSortDirection('asc');
                          setAnnouncement(`Sorted ${column.header} ascending`);
                        }
                      }}
                      aria-label={`Sort by ${column.header}`}
                    >
                      {column.header}
                      <span className="ml-2 invisible group-hover:visible">
                        {sortColumn === column.accessor ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td
                    key={String(column.accessor)}
                    className="px-6 py-4 whitespace-nowrap"
                    tabIndex={focusedCell.row === rowIndex && focusedCell.col === colIndex ? 0 : -1}
                    onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
                    role="gridcell"
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {column.cell ? column.cell(row[column.accessor], row) : String(row[column.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
