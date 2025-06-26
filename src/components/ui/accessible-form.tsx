import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * The form's accessible name
   */
  'aria-label'?: string;
  /**
   * ID of element that labels the form
   */
  'aria-labelledby'?: string;
  /**
   * ID of element that describes the form
   */
  'aria-describedby'?: string;
  /**
   * Whether the form has validation errors
   */
  hasErrors?: boolean;
  /**
   * Error message when form validation fails
   */
  errorMessage?: string;
  /**
   * Success message when form submission succeeds
   */
  successMessage?: string;
}

const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({ className, children, hasErrors, errorMessage, successMessage, ...props }, ref) => {
    const formId = React.useId();
    const errorId = React.useId();
    const successId = React.useId();

    const ariaDescribedby = [
      props['aria-describedby'],
      hasErrors && errorMessage ? errorId : null,
      successMessage ? successId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <form
        ref={ref}
        className={cn('space-y-4', className)}
        aria-invalid={hasErrors}
        aria-describedby={ariaDescribedby || undefined}
        {...props}
      >
        {children}
        {hasErrors && errorMessage && (
          <div
            id={errorId}
            role="alert"
            aria-live="assertive"
            className="text-red-600 text-sm"
          >
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            id={successId}
            role="status"
            aria-live="polite"
            className="text-green-600 text-sm"
          >
            {successMessage}
          </div>
        )}
      </form>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

export { AccessibleForm };
