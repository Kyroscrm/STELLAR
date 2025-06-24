import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TourProvider, useTour } from '../../../src/contexts/TourContext';

// Mock react-joyride
jest.mock('react-joyride', () => {
  return {
    __esModule: true,
    default: (props: {
      run: boolean;
      steps: Record<string, unknown>[];
      callback: (data: Record<string, unknown>) => void
    }) => {
      return (
        <div data-testid="joyride-mock">
          <div data-testid="joyride-run">{String(props.run)}</div>
          <div data-testid="joyride-steps-count">{props.steps.length}</div>
          <button
            data-testid="joyride-finish-button"
            onClick={() => props.callback({ action: 'next', index: props.steps.length - 1, status: 'finished', type: 'step:after' })}
          >
            Finish Tour
          </button>
          <button
            data-testid="joyride-skip-button"
            onClick={() => props.callback({ action: 'skip', status: 'skipped', type: 'tour:skip' })}
          >
            Skip Tour
          </button>
        </div>
      );
    },
    STATUS: {
      FINISHED: 'finished',
      SKIPPED: 'skipped',
    }
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the tour context
const TestComponent = () => {
  const { startTour, endTour, resetTours, isFirstVisit } = useTour();

  return (
    <div>
      <div data-testid="is-first-visit">{String(isFirstVisit)}</div>
      <button data-testid="start-tour" onClick={() => startTour('main')}>Start Tour</button>
      <button data-testid="end-tour" onClick={endTour}>End Tour</button>
      <button data-testid="reset-tours" onClick={resetTours}>Reset Tours</button>
    </div>
  );
};

describe('TourProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should provide tour context with correct values', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <TestComponent />
        </TourProvider>
      </MemoryRouter>
    );

    // Initially, isFirstVisit should be true
    expect(screen.getByTestId('is-first-visit').textContent).toBe('true');

    // Joyride should not be running initially
    expect(screen.getByTestId('joyride-run').textContent).toBe('false');
  });

  it('should start tour when startTour is called', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <TestComponent />
        </TourProvider>
      </MemoryRouter>
    );

    // Start the tour
    fireEvent.click(screen.getByTestId('start-tour'));

    // Joyride should be running
    expect(screen.getByTestId('joyride-run').textContent).toBe('true');

    // Steps should be loaded
    expect(parseInt(screen.getByTestId('joyride-steps-count').textContent || '0')).toBeGreaterThan(0);
  });

  it('should end tour and update localStorage when tour is finished', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <TestComponent />
        </TourProvider>
      </MemoryRouter>
    );

    // Start the tour
    fireEvent.click(screen.getByTestId('start-tour'));

    // Finish the tour
    fireEvent.click(screen.getByTestId('joyride-finish-button'));

    // Joyride should not be running
    expect(screen.getByTestId('joyride-run').textContent).toBe('false');

    // isFirstVisit should be false
    expect(screen.getByTestId('is-first-visit').textContent).toBe('false');

    // localStorage should be updated
    expect(localStorageMock.getItem('hasSeenTour')).toBe('true');
  });

  it('should end tour and update localStorage when tour is skipped', () => {
    render(
      <MemoryRouter>
        <TourProvider>
          <TestComponent />
        </TourProvider>
      </MemoryRouter>
    );

    // Start the tour
    fireEvent.click(screen.getByTestId('start-tour'));

    // Skip the tour
    fireEvent.click(screen.getByTestId('joyride-skip-button'));

    // Joyride should not be running
    expect(screen.getByTestId('joyride-run').textContent).toBe('false');

    // isFirstVisit should be false
    expect(screen.getByTestId('is-first-visit').textContent).toBe('false');

    // localStorage should be updated
    expect(localStorageMock.getItem('hasSeenTour')).toBe('true');
  });

  it('should reset tour state when resetTours is called', () => {
    // Set localStorage to indicate tour has been seen
    localStorageMock.setItem('hasSeenTour', 'true');

    render(
      <MemoryRouter>
        <TourProvider>
          <TestComponent />
        </TourProvider>
      </MemoryRouter>
    );

    // Initially, isFirstVisit should be false
    expect(screen.getByTestId('is-first-visit').textContent).toBe('false');

    // Reset tours
    fireEvent.click(screen.getByTestId('reset-tours'));

    // isFirstVisit should be true
    expect(screen.getByTestId('is-first-visit').textContent).toBe('true');

    // localStorage should be cleared
    expect(localStorageMock.getItem('hasSeenTour')).toBeNull();
  });
});
