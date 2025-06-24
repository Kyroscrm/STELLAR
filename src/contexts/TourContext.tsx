import React, { createContext, useState, useContext, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { mainTourSteps, leadsTourSteps, estimatesTourSteps, invoicesTourSteps, jobsTourSteps, tasksTourSteps } from '@/lib/tour-steps';

type TourContextType = {
  startTour: (tourName?: string) => void;
  endTour: () => void;
  resetTours: () => void;
  isFirstVisit: boolean;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    return localStorage.getItem('hasSeenTour') !== 'true';
  });
  const location = useLocation();

  useEffect(() => {
    // Check if this is the first visit to the admin dashboard
    if (location.pathname === '/admin' && isFirstVisit) {
      setTimeout(() => {
        startTour('main');
      }, 1000);
    }
  }, [location.pathname, isFirstVisit]);

  const getStepsForTour = (tourName: string): Step[] => {
    switch (tourName) {
      case 'main':
        return mainTourSteps;
      case 'leads':
        return leadsTourSteps;
      case 'estimates':
        return estimatesTourSteps;
      case 'invoices':
        return invoicesTourSteps;
      case 'jobs':
        return jobsTourSteps;
      case 'tasks':
        return tasksTourSteps;
      default:
        return mainTourSteps;
    }
  };

  const startTour = (tourName = 'main') => {
    setSteps(getStepsForTour(tourName));
    setRunTour(true);
  };

  const endTour = () => {
    setRunTour(false);
    if (isFirstVisit) {
      localStorage.setItem('hasSeenTour', 'true');
      setIsFirstVisit(false);
    }
  };

  const resetTours = () => {
    localStorage.removeItem('hasSeenTour');
    setIsFirstVisit(true);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      endTour();
    }
  };

  return (
    <TourContext.Provider value={{ startTour, endTour, resetTours, isFirstVisit }}>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        disableCloseOnEsc
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#0f766e', // Match your primary color
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '8px',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#0f766e',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
      />
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
