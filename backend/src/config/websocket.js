import { WebSocketServer } from 'ws';
import env from './env.js';

const clients = new Map();

export function initWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: env.WEBSOCKET.PATH,
  });

  wss.on('connection', (ws, request) => {
    const params = new URLSearchParams(request.url.split('?')[1]);
    const userId = params.get('user_id');

    if (!userId) {
      ws.close();
      return;
    }

    clients.set(userId, ws);

    ws.on('close', () => {
      clients.delete(userId);
    });
  });

  console.log('🔌 WebSocket ativo');
}

export function sendToUser(userId, payload) {
  const client = clients.get(userId);
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

export function broadcast(payload) {
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
