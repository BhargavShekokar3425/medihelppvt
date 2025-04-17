import { createContext, useContext } from 'react';
import { useBackend } from '../hooks/useBackend';

// Create context
const BackendContext = createContext(null);

// Context provider component
export const BackendProvider = ({ children }) => {
  const backend = useBackend();
  
  return (
    <BackendContext.Provider value={backend}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the backend context
export const useBackendContext = () => {
  const context = useContext(BackendContext);
  
  if (!context) {
    throw new Error('useBackendContext must be used within a BackendProvider');
  }
  
  return context;
};

export default BackendContext;
