import React from 'react';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '../../../src/components/ui/skeleton-loader';

describe('SkeletonLoader', () => {
  it('renders table skeleton with correct count and columns', () => {
    render(<SkeletonLoader type="table" count={3} columns={4} />);

    // Check for table header row
    const headerCells = screen.getAllByTestId('skeleton-table-header-cell');
    expect(headerCells.length).toBe(4); // 4 columns

    // Check for table body rows
    const rows = screen.getAllByTestId('skeleton-table-row');
    expect(rows.length).toBe(3); // 3 rows as specified by count

    // Each row should have 4 cells
    const bodyCells = screen.getAllByTestId('skeleton-table-cell');
    expect(bodyCells.length).toBe(3 * 4); // 3 rows * 4 columns
  });

  it('renders card skeleton with correct count', () => {
    render(<SkeletonLoader type="card" count={5} />);

    const cards = screen.getAllByTestId('skeleton-card');
    expect(cards.length).toBe(5);
  });

  it('renders stats skeleton with correct count', () => {
    render(<SkeletonLoader type="stats" count={4} />);

    const stats = screen.getAllByTestId('skeleton-stat');
    expect(stats.length).toBe(4);
  });

  it('renders list skeleton with correct count', () => {
    render(<SkeletonLoader type="list" count={6} />);

    const listItems = screen.getAllByTestId('skeleton-list-item');
    expect(listItems.length).toBe(6);
  });

  it('renders detail skeleton', () => {
    render(<SkeletonLoader type="detail" />);

    expect(screen.getByTestId('skeleton-detail')).toBeInTheDocument();
  });

  it('applies custom className to the skeleton', () => {
    render(<SkeletonLoader type="card" count={1} className="custom-class" />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass('custom-class');
  });

  it('defaults to card type if no type is provided', () => {
    render(<SkeletonLoader count={2} />);

    const cards = screen.getAllByTestId('skeleton-card');
    expect(cards.length).toBe(2);
  });
});
