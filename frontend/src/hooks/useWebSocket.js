


import { useEffect, useState } from "react";

let sharedWs = null;
let sharedBaseUrl = null;
let sharedUserId = null;
let reconnectTimer = null;
let isConnecting = false;
let sharedEvents = [];
const subscribers = new Set();

function notify() {
  const snapshot = sharedEvents;
  subscribers.forEach((fn) => fn(snapshot));
}

function getUserIdFromStorage() {
  const userRaw = sessionStorage.getItem("user") || localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  return user?.id || null;
}

function connect(baseUrl, userId) {
  if (!baseUrl || !userId) return;
  if (isConnecting) return;
  isConnecting = true;

  try {
    if (sharedWs) {
      try {
        sharedWs.close();
      } catch {
        
      }
      sharedWs = null;
    }

    const ws = new WebSocket(`${baseUrl}?user_id=${encodeURIComponent(userId)}`);
    sharedWs = ws;
    sharedBaseUrl = baseUrl;
    sharedUserId = userId;

    ws.onopen = () => {
      isConnecting = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        sharedEvents = [...sharedEvents, data].slice(-300);
        notify();
      } catch {
        
      }
    };

    ws.onclose = () => {
      isConnecting = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        const uid = getUserIdFromStorage();
        if (!uid) return;
        connect(sharedBaseUrl || baseUrl, uid);
      }, 1200);
    };

    ws.onerror = () => {
      
    };
  } catch {
    isConnecting = false;
  }
}

function ensureConnected(baseUrl) {
  const userId = getUserIdFromStorage();
  if (!userId) return;

  const mustReconnect =
    !sharedWs ||
    sharedWs.readyState === WebSocket.CLOSED ||
    sharedWs.readyState === WebSocket.CLOSING ||
    sharedBaseUrl !== baseUrl ||
    sharedUserId !== userId;

  if (mustReconnect) connect(baseUrl, userId);
}

export default function useWebSocket(baseUrl = "ws://localhost:3333/ws") {
  const [events, setEvents] = useState(sharedEvents);

  useEffect(() => {
    ensureConnected(baseUrl);

    const sub = (evs) => setEvents(evs);
    subscribers.add(sub);
    
    sub(sharedEvents);

    return () => {
      subscribers.delete(sub);
      
      if (subscribers.size === 0) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = null;
        if (sharedWs) {
          try {
            sharedWs.close();
          } catch {
            
          }
        }
        sharedWs = null;
        sharedBaseUrl = null;
        sharedUserId = null;
      }
    };
  }, [baseUrl]);

  const sendMessage = (msg) => {
    if (sharedWs && sharedWs.readyState === WebSocket.OPEN) {
      sharedWs.send(JSON.stringify(msg));
      return true;
    }
    return false;
  };

  return { events, sendMessage };
}
