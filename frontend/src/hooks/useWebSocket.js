// hooks/useWebSocket.js
import { useEffect, useRef, useState } from "react";

export default function useWebSocket(baseUrl = "ws://localhost:3333/ws") {
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    const userRaw = sessionStorage.getItem("user") || localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.id;
    if (!userId) return;

    function connect() {
      const ws = new WebSocket(`${baseUrl}?user_id=${encodeURIComponent(userId)}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setEvents((prev) => [...prev, data]);
        } catch {
          // ignora
        }
      };

      ws.onclose = () => {
        // tenta reconectar de forma simples
        reconnectRef.current = setTimeout(connect, 1200);
      };

      ws.onerror = () => {
        // erro pode disparar close em seguida
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [baseUrl]);

  const sendMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
      return true;
    }
    return false;
  };

  return { events, sendMessage };
}
