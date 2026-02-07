import pkg from 'pg';
import env from './env.js';

const { Pool } = pkg;

const pool = new Pool({
  host: env.DATABASE.HOST,
  port: env.DATABASE.PORT,
  database: env.DATABASE.NAME,
  user: env.DATABASE.USER,
  password: env.DATABASE.PASSWORD,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('📦 PostgreSQL conectado');
});

pool.on('error', (err) => {
  console.error('❌ Erro no PostgreSQL', err);
  process.exit(1);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
