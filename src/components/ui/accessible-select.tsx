import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AccessibleSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /**
   * Label for the select
   */
  label: string;
  /**
   * Help text to describe the select
   */
  helpText?: string;
  /**
   * Error message when validation fails
   */
  error?: string;
  /**
   * Whether the select is required
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
  /**
   * Options for the select
   */
  options: AccessibleSelectOption[];
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
}

const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
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
      options,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
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
          htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={ariaDescribedby || undefined}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
            error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ value, label: optionLabel, disabled }) => (
            <option key={value} value={value} disabled={disabled}>
              {optionLabel}
            </option>
          ))}
        </select>
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

AccessibleSelect.displayName = 'AccessibleSelect';

export { AccessibleSelect };
