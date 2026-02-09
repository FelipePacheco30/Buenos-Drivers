// hooks/useWebSocket.js
import { useEffect, useState, useRef } from "react";
import { getToken } from "../services/api";

export default function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`${url}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Erro ao parsear mensagem WS:", err);
      }
    };

    ws.onclose = () => console.log("WebSocket fechado");
    ws.onerror = (err) => console.error("WebSocket erro:", err);

    return () => ws.close();
  }, [url]);

  const sendMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return { messages, sendMessage };
}
