import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  user: process.env.POSTGRES_USER || 'buenos',
  password: process.env.POSTGRES_PASSWORD || 'buenos',
  database: process.env.POSTGRES_DB || 'buenos',
});


pool.on('connect', () => {
  console.log('🟢 PostgreSQL conectado');
});

pool.on('error', (err) => {
  console.error('🔴 Erro inesperado no PostgreSQL', err);
  process.exit(1);
});

/**
 * Query helper
 * @param {string} text
 * @param {Array} params
 */
export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}
