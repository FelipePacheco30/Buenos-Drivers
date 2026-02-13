import http from 'http';
import app from './app.js';
import { initWebSocket } from './config/websocket.js';
import { ensureSystemMessageEventEnum } from './config/database.js';
import documentExpirationJob from './jobs/documentExpiration.job.js';
import renewalCleanupJob from './jobs/renewalCleanup.job.js';

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

initWebSocket(server);

function runWithRetry(name, fn, { initialDelayMs = 4000, maxDelayMs = 30000 } = {}) {
  let delay = initialDelayMs;
  const attempt = async () => {
    try {
      await fn();
      console.log(`✅ ${name} executado com sucesso`);
    } catch (e) {
      console.error(`❌ ${name} falhou, tentando novamente em ${Math.round(delay / 1000)}s`, e);
      setTimeout(attempt, delay);
      delay = Math.min(maxDelayMs, Math.round(delay * 1.6));
    }
  };
  setTimeout(attempt, delay);
}

server.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);

  runWithRetry(
    'Pré-check: enum de mensagens + job de documentos',
    async () => {
      await ensureSystemMessageEventEnum();
      await documentExpirationJob();
    },
    { initialDelayMs: 4000, maxDelayMs: 30000 }
  );

  setInterval(() => {
    ensureSystemMessageEventEnum()
      .then(() => documentExpirationJob())
      .catch((e) => console.error('Erro ao preparar enums de mensagens', e));
  }, 6 * 60 * 60 * 1000);

  runWithRetry('Job de limpeza de renovações', async () => renewalCleanupJob(), {
    initialDelayMs: 6000,
    maxDelayMs: 30000,
  });

  setInterval(() => {
    renewalCleanupJob();
  }, 12 * 60 * 60 * 1000);
});
