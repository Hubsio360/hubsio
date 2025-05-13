
import React from 'react';
import { DataProvider as DataContextProvider } from './DataContext';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DataContextProvider>{children}</DataContextProvider>;
};
