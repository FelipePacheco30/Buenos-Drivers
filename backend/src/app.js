import express from 'express';
import cors from 'cors';

import routes from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';
import websocket from './config/websocket.js';
import documentExpirationJob from './jobs/documentExpiration.job.js';

const app = express();

/**
 * =====================
 * Middlewares globais
 * =====================
 */
app.use(cors());
app.use(express.json());

/**
 * =====================
 * Rotas
 * =====================
 */
app.use('/api', routes);

/**
 * =====================
 * WebSocket
 * =====================
 */
websocket.initialize(app);

/**
 * =====================
 * Job automático diário
 * =====================
 */
setInterval(documentExpirationJob, 1000 * 60 * 60 * 24); // 24h

/**
 * =====================
 * Tratamento de erros
 * =====================
 */
app.use(errorMiddleware);

export default app;
