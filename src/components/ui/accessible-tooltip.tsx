import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleTooltipProps {
  /**
   * Content to show in the tooltip
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip
   */
  children: React.ReactElement;
  /**
   * Position of the tooltip
   */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Delay before showing tooltip (ms)
   */
  showDelay?: number;
  /**
   * Delay before hiding tooltip (ms)
   */
  hideDelay?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function AccessibleTooltip({
  content,
  children,
  position = 'top',
  showDelay = 200,
  hideDelay = 150,
  className,
}: AccessibleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Position the tooltip relative to the trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
    }

    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;
  };

  const showTooltip = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(updatePosition);
    }, showDelay);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // Handle keyboard interactions
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Update position when content changes
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [content, isVisible]);

  // Clone the trigger element and add necessary props
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: () => {
      setIsFocused(true);
      showTooltip();
    },
    onBlur: () => {
      setIsFocused(false);
      hideTooltip();
    },
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  });

  return (
    <>
      {trigger}
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={cn(
            'fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg',
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
              position === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
              position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
              position === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2'
            )}
          />
        </div>
      )}
    </>
  );
}
