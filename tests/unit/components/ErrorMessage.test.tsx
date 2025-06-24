import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '../../../src/components/ui/error-message';

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    render(<ErrorMessage message="Failed to load data" />);

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorMessage message="Failed to load data" title="Error Occurred" />);

    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const mockRetry = jest.fn();
    render(<ErrorMessage message="Failed to load data" onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Failed to load data" />);

    const retryButton = screen.queryByRole('button', { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('renders with warning severity', () => {
    render(<ErrorMessage message="Warning message" severity="warning" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('bg-yellow-50');
  });

  it('renders with info severity', () => {
    render(<ErrorMessage message="Info message" severity="info" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('bg-blue-50');
  });

  it('renders with custom className', () => {
    render(<ErrorMessage message="Error message" className="custom-class" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('custom-class');
  });
});
