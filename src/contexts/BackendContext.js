import React, { createContext, useContext } from 'react';
import { useBackendState } from '../hooks/useBackendState';

// Create Context
const BackendContext = createContext(null);

// Provider Component
export const BackendProvider = ({ children }) => {
  const backendState = useBackendState();
  
  return (
    <BackendContext.Provider value={backendState}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom Hook for using the context
export const useBackendContext = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackendContext must be used within a BackendProvider');
  }
  return context;
};

export default BackendContext;
