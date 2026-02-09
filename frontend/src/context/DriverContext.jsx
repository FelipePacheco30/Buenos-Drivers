// context/DriverContext.jsx
import React, { createContext, useContext } from "react";
import useDriverStatus from "../hooks/useDriverStatus";

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const { earnings, loading, error, refresh } = useDriverStatus();

  return (
    <DriverContext.Provider value={{ earnings, loading, error, refresh }}>
      {children}
    </DriverContext.Provider>
  );
};

// Hook para acessar dados do motorista
export const useDriverContext = () => useContext(DriverContext);
