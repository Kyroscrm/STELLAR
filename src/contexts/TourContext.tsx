import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { mainTourSteps, leadsTourSteps, estimatesTourSteps, invoicesTourSteps, jobsTourSteps, tasksTourSteps } from '@/lib/tour-steps';
import { TourContext } from './TourContextExports';

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTour, setCurrentTour] = useState<string>('');
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const location = useLocation();

  // Check if it's the user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedApp');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedApp', 'true');
    }
  }, []);

  // Start a tour
  const startTour = (tourName: string = 'main') => {
    let tourSteps: Step[] = [];

    switch (tourName) {
      case 'leads':
        tourSteps = leadsTourSteps;
        break;
      case 'estimates':
        tourSteps = estimatesTourSteps;
        break;
      case 'invoices':
        tourSteps = invoicesTourSteps;
        break;
      case 'jobs':
        tourSteps = jobsTourSteps;
        break;
      case 'tasks':
        tourSteps = tasksTourSteps;
        break;
      default:
        tourSteps = mainTourSteps;
    }

    setSteps(tourSteps);
    setCurrentTour(tourName);
    setStepIndex(0);
    setIsRunning(true);
  };

  // End the current tour
  const endTour = () => {
    setIsRunning(false);
    setCurrentTour('');
    setStepIndex(0);
    setSteps([]);
  };

  // Reset all tours (clear localStorage flags)
  const resetTours = () => {
    localStorage.removeItem('hasVisitedApp');
    localStorage.removeItem('completedTours');
    setIsFirstVisit(true);
  };

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      endTour();

      // Mark tour as completed
      const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
      if (!completedTours.includes(currentTour)) {
        completedTours.push(currentTour);
        localStorage.setItem('completedTours', JSON.stringify(completedTours));
      }
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  const value = {
    startTour,
    endTour,
    resetTours,
    isFirstVisit
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        steps={steps}
        run={isRunning}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            primaryColor: '#3b82f6',
          }
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour'
        }}
      />
    </TourContext.Provider>
  );
};

// Re-export useTour for convenience
export { useTour } from './TourContextExports';
