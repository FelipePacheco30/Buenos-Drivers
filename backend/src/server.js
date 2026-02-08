import app from './app.js';
import env from './config/env.js';

const PORT = env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Buenos Drivers API rodando na porta ${PORT}`);
});
