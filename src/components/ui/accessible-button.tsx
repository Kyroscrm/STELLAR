import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The accessible label for screen readers. If not provided, uses the button's content.
   */
  ariaLabel?: string;
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Additional classes to apply to the button
   */
  className?: string;
  /**
   * The variant style of the button
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  /**
   * The size of the button
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /**
   * Whether to announce loading state changes to screen readers
   */
  announceLoadingState?: boolean;
}

/**
 * An accessible button component that follows WCAG 2.1 guidelines.
 * Includes proper ARIA attributes, keyboard handling, and visual focus indicators.
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  loading = false,
  disabled = false,
  className,
  variant = 'primary',
  size = 'default',
  type = 'button',
  announceLoadingState = true,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const loadingAnnounceRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(loading);

  // Handle loading state announcements
  useEffect(() => {
    if (announceLoadingState && loading !== prevLoadingRef.current) {
      const message = loading ? 'Loading, please wait...' : 'Loading complete';
      if (loadingAnnounceRef.current) {
        loadingAnnounceRef.current.textContent = message;
      }
      prevLoadingRef.current = loading;
    }
  }, [loading, announceLoadingState]);

  // Base styles for the button
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  // Size styles
  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      buttonRef.current?.click();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={loading || disabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="presentation"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
      {announceLoadingState && (
        <div
          ref={loadingAnnounceRef}
          role="status"
          aria-live="polite"
          className="sr-only"
        />
      )}
    </>
  );
};

export default AccessibleButton;
