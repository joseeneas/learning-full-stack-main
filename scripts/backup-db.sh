#!/usr/bin/env zsh
set -euo pipefail
# Backup PostgreSQL database using pg_dump (custom format)
# Usage: ./scripts/backup-db.sh [backup-dir]
# Env vars (override as needed): DB_HOST, DB_PORT, DB_NAME, DB_USER, PGPASSWORD

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-syscomz}
DB_USER=${DB_USER:-syscomz}
OUT_DIR=${1:-backups}
mkdir -p "$OUT_DIR"
TS=$(date +%Y%m%d-%H%M%S)
FILE="$OUT_DIR/${DB_NAME}_${TS}.dump"

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "WARN: PGPASSWORD not set; pg_dump may prompt for password" >&2
fi

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$FILE"

echo "Backup created: $FILE"
