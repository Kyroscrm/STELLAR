import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input
   */
  label: string;
  /**
   * Help text to describe the input
   */
  helpText?: string;
  /**
   * Error message when validation fails
   */
  error?: string;
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Whether to hide the label visually (still available to screen readers)
   */
  hideLabel?: boolean;
  /**
   * Whether to show the optional/required indicator
   */
  showRequiredIndicator?: boolean;
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      helpText,
      error,
      required,
      hideLabel,
      showRequiredIndicator = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helpTextId = React.useId();
    const errorId = React.useId();

    const ariaDescribedby = [
      helpText ? helpTextId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {showRequiredIndicator && (
            <span className="ml-1" aria-hidden="true">
              {required ? '*' : '(optional)'}
            </span>
          )}
        </label>
        {helpText && (
          <p id={helpTextId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={ariaDescribedby || undefined}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
            error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

export { AccessibleInput };
