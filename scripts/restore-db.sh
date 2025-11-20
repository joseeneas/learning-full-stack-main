#!/usr/bin/env zsh
set -euo pipefail
# Restore PostgreSQL database from a pg_dump custom format file
# Usage: ./scripts/restore-db.sh <dump-file>
# Env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, PGPASSWORD

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump-file>" >&2
  exit 1
fi
DUMP_FILE=$1
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-syscomz}
DB_USER=${DB_USER:-syscomz}

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Dump file not found: $DUMP_FILE" >&2
  exit 1
fi

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "WARN: PGPASSWORD not set; pg_restore may prompt for password" >&2
fi

echo "Dropping and recreating database $DB_NAME (ensure you really want this)."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "REVOKE CONNECT ON DATABASE $DB_NAME FROM PUBLIC;" || true
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';" || true
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$DUMP_FILE"

echo "Restore completed from $DUMP_FILE"
