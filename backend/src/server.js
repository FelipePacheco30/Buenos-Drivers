import http from 'http';
import app from './app.js';
import { initWebSocket } from './config/websocket.js';
import documentExpirationJob from './jobs/documentExpiration.job.js';
import renewalCleanupJob from './jobs/renewalCleanup.job.js';

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);

  
  setTimeout(() => {
    documentExpirationJob();
  }, 4000);

  setInterval(() => {
    documentExpirationJob();
  }, 6 * 60 * 60 * 1000);

  
  setTimeout(() => {
    renewalCleanupJob();
  }, 6000);

  setInterval(() => {
    renewalCleanupJob();
  }, 12 * 60 * 60 * 1000);
});
