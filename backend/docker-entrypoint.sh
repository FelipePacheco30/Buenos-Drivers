#!/bin/sh
set -e

echo "⏳ Aguardando Postgres ficar disponível..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
  sleep 2
done

DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo "🗄️ Executando migrations..."
for file in /database/migrations/*.sql; do
  echo "→ Rodando migration: $(basename "$file")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "🌱 Executando seeds (ordem controlada)..."

echo "→ users.seed.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /database/seeds/users.seed.sql

echo "→ drivers.seed.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /database/seeds/drivers.seed.sql

echo "→ trips.seed.sql"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /database/seeds/trips.seed.sql

echo "✅ Banco pronto"

echo "🚀 Iniciando API..."
exec npm run start
