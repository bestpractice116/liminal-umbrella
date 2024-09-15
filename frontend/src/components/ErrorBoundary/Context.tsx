import { createContext } from 'react';
import { ErrorBoundaryContextType } from './types';

export const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null);
