// context/NotificationContext.jsx
import React, { createContext, useContext, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { messages, sendMessage } = useWebSocket("ws://localhost:3333/ws");
  const [notifications, setNotifications] = useState([]);

  // Atualiza notificações sempre que chegam novas mensagens
  React.useEffect(() => {
    if (messages.length > 0) {
      setNotifications((prev) => [...messages, ...prev]);
    }
  }, [messages]);

  return (
    <NotificationContext.Provider
      value={{ notifications, sendMessage }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook para acessar notificações
export const useNotificationContext = () => useContext(NotificationContext);
