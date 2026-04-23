import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [assistantOpen, setAssistantOpen] = useState(false);

  const toggleAssistant = () => setAssistantOpen(prev => !prev);
  const openAssistant = () => setAssistantOpen(true);
  const closeAssistant = () => setAssistantOpen(false);

  return (
    <UIContext.Provider value={{ assistantOpen, toggleAssistant, openAssistant, closeAssistant }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
