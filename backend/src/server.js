import http from 'http';
import app from './app.js';
import { initWebSocket } from './config/websocket.js';
import documentExpirationJob from './jobs/documentExpiration.job.js';

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);

  // roda uma vez ao subir (DEV) e depois a cada 6h
  setTimeout(() => {
    documentExpirationJob();
  }, 4000);

  setInterval(() => {
    documentExpirationJob();
  }, 6 * 60 * 60 * 1000);
});
