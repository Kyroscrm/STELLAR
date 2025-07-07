import { createContext, useContext } from 'react';
import { CallBackProps, STATUS, Step } from 'react-joyride';

type TourContextType = {
  startTour: (tourName?: string) => void;
  endTour: () => void;
  resetTours: () => void;
  isFirstVisit: boolean;
};

export const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};