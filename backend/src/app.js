import express from 'express';
import routes from './routes/index.js';

const app = express();

// Middleware para parse de JSON
app.use(express.json());

// Rotas da aplicação
app.use(routes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

export default app;
