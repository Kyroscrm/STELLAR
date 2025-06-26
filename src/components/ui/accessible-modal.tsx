import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * The modal's title
   */
  title: string;
  /**
   * The modal's description
   */
  description?: string;
  /**
   * Whether to show the close button
   */
  showCloseButton?: boolean;
  /**
   * Whether to close on escape key
   */
  closeOnEscape?: boolean;
  /**
   * Whether to close on overlay click
   */
  closeOnOverlayClick?: boolean;
  /**
   * Initial element to focus when modal opens
   */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  initialFocusRef,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  // Store the element that had focus before the modal opened
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Set initial focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      // Return focus to the previously focused element when the modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto',
          className
        )}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
        <h2 id={titleId} className="text-lg font-semibold mb-2">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export { AccessibleModal };
