import { WebSocketServer } from 'ws';
import env from './env.js';
import UsersRepository from '../modules/users/repository.js';
import MessagesService from '../modules/messages/service.js';

const clients = new Map();

export function initWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: env.WEBSOCKET.PATH,
  });

  wss.on('connection', async (ws, request) => {
    try {
      const params = new URLSearchParams(request.url.split('?')[1]);
      // compat: aceita user_id (preferido) ou token (token = userId no nosso backend DEV)
      const userId = params.get('user_id') || params.get('token');

      if (!userId) {
        ws.close();
        return;
      }

      const user = await UsersRepository.findById(userId);
      if (!user) {
        ws.close();
        return;
      }

      clients.set(userId, { ws, user });

      ws.on('message', async (raw) => {
        try {
          const parsed = JSON.parse(String(raw || ''));

          // envio de chat via WS (opcional; também existe REST)
          // ADMIN: { type:'CHAT_SEND', driver_id:'uuid', body:'...' }
          // DRIVER: { type:'CHAT_SEND', body:'...' } -> driverId inferido pelo userId
          if (parsed?.type === 'CHAT_SEND') {
            const body = String(parsed.body || '').trim();
            if (!body) return;

            if (user.role === 'ADMIN') {
              const driverId = String(parsed.driver_id || '').trim();
              if (!driverId) return;
              await MessagesService.sendAdminMessageRealtime({
                adminUserId: user.id,
                driverId,
                body,
              });
              return;
            }

            if (user.role === 'DRIVER') {
              await MessagesService.sendDriverMessageRealtime({
                driverUserId: user.id,
                body,
              });
            }
          }
        } catch {
          // ignora payload inválido
        }
      });

      ws.on('close', () => {
        clients.delete(userId);
      });
    } catch {
      ws.close();
    }
  });

  console.log('🔌 WebSocket ativo');
}

export function sendToUser(userId, payload) {
  const client = clients.get(userId);
  const ws = client?.ws;
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export function broadcast(payload) {
  clients.forEach(({ ws }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  });
}

export function getConnectedUsers() {
  return Array.from(clients.values()).map((c) => c.user);
}
