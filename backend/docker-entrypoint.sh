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

echo "🌱 Seed usuários (hash real)..."
node scripts/seedUsers.js


echo "✅ Banco pronto"

echo "🚀 Iniciando API..."
exec npm run start
