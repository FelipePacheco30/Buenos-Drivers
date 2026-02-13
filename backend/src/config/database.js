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






export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

export async function ensureSystemMessageEventEnum() {
  await query(
    `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_message_event') THEN
        CREATE TYPE system_message_event AS ENUM ('BAN', 'DOC_EXPIRING', 'APPROVED');
      END IF;
    END$$;
    `
  );

  await query(
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = 'system_message_event'
          AND e.enumlabel = 'BAN_DOCS'
      ) THEN
        ALTER TYPE system_message_event ADD VALUE 'BAN_DOCS';
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = 'system_message_event'
          AND e.enumlabel = 'REPUTATION_SUSPEND'
      ) THEN
        ALTER TYPE system_message_event ADD VALUE 'REPUTATION_SUSPEND';
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = 'system_message_event'
          AND e.enumlabel = 'REPUTATION_WARNING'
      ) THEN
        ALTER TYPE system_message_event ADD VALUE 'REPUTATION_WARNING';
      END IF;
    END$$;
    `
  );
}
