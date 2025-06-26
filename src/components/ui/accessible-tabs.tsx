import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface AccessibleTab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccessibleTabsProps {
  /**
   * Array of tab configurations
   */
  tabs: AccessibleTab[];
  /**
   * Default active tab ID
   */
  defaultTabId?: string;
  /**
   * Callback when tab changes
   */
  onChange?: (tabId: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Label for the tablist (required for accessibility)
   */
  label: string;
}

export function AccessibleTabs({
  tabs,
  defaultTabId,
  onChange,
  className,
  label,
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id);
  const [focusedTab, setFocusedTab] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (focusedTab !== null && tabRefs.current[focusedTab]) {
      tabRefs.current[focusedTab]?.focus();
    }
  }, [focusedTab]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index - 1;
        if (newIndex < 0) newIndex = tabs.length - 1;
        while (newIndex >= 0 && tabs[newIndex].disabled) {
          newIndex--;
          if (newIndex < 0) newIndex = tabs.length - 1;
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = index + 1;
        if (newIndex >= tabs.length) newIndex = 0;
        while (newIndex < tabs.length && tabs[newIndex].disabled) {
          newIndex++;
          if (newIndex >= tabs.length) newIndex = 0;
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        while (newIndex < tabs.length && tabs[newIndex].disabled) {
          newIndex++;
        }
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabs.length - 1;
        while (newIndex >= 0 && tabs[newIndex].disabled) {
          newIndex--;
        }
        break;
    }

    if (newIndex !== null && newIndex >= 0 && newIndex < tabs.length) {
      setFocusedTab(newIndex);
    }
  };

  const handleClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        role="tablist"
        aria-label={label}
        className="border-b border-gray-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => (tabRefs.current[index] = el)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => !tab.disabled && handleClick(tab.id)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={() => setFocusedTab(index)}
            disabled={tab.disabled}
            className={cn(
              'px-4 py-2 border-b-2 -mb-px text-sm font-medium',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={cn(
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-4',
            activeTab === tab.id ? 'block' : 'hidden'
          )}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
