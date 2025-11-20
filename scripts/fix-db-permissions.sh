#!/usr/bin/env zsh
set -euo pipefail
# Fix ownership/privileges on local PostgreSQL 'syscomz' database for role 'syscomz'.
# Usage (preferred): SUPERUSER=postgres PGPASSWORD=<superuser_password> ./scripts/fix-db-permissions.sh
# If the cluster was initialized with POSTGRES_USER=syscomz and that role is superuser, you can omit SUPERUSER and just set PGPASSWORD for syscomz.

DB=syscomz
ROLE=syscomz
HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-5432}
SUPER=${SUPERUSER:-postgres}

echo "[info] Target DB: $DB  Role: $ROLE  Superuser: $SUPER"

show_roles() {
  psql -h "$HOST" -p "$PORT" -U "$SUPER" -d "$DB" -v ON_ERROR_STOP=0 -c "SELECT rolname, rolsuper FROM pg_roles WHERE rolname IN ('$ROLE','$SUPER');" || true
}

echo "[info] Checking role superuser flags (requires superuser connect)..."
show_roles || echo "[warn] Could not verify roles (superuser password may be missing). Proceeding with best-effort grants."

run_psql() {
  local user=$1
  shift
  psql -h "$HOST" -p "$PORT" -U "$user" -d "$DB" -v ON_ERROR_STOP=1 -c "$@"
}

echo "[step] Transferring schema ownership to $ROLE (idempotent)"
(run_psql "$SUPER" "ALTER SCHEMA public OWNER TO $ROLE;" || run_psql "$ROLE" "ALTER SCHEMA public OWNER TO $ROLE;") || true

echo "[step] Granting database privileges"
(run_psql "$SUPER" "GRANT ALL PRIVILEGES ON DATABASE $DB TO $ROLE;" || run_psql "$ROLE" "GRANT ALL PRIVILEGES ON DATABASE $DB TO $ROLE;") || true

echo "[step] Granting schema usage/create"
(run_psql "$SUPER" "GRANT USAGE, CREATE ON SCHEMA public TO $ROLE;" || run_psql "$ROLE" "GRANT USAGE, CREATE ON SCHEMA public TO $ROLE;") || true

echo "[step] Granting table & sequence privileges"
(run_psql "$SUPER" "GRANT ALL ON ALL TABLES IN SCHEMA public TO $ROLE;" || run_psql "$ROLE" "GRANT ALL ON ALL TABLES IN SCHEMA public TO $ROLE;") || true
(run_psql "$SUPER" "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $ROLE;" || run_psql "$ROLE" "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $ROLE;") || true

echo "[step] Ensuring sequence 'student_sequence' exists & owned by $ROLE"
(run_psql "$SUPER" "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='S' AND c.relname='student_sequence' AND n.nspname='public') THEN EXECUTE 'CREATE SEQUENCE public.student_sequence START WITH 1 INCREMENT BY 1'; END IF; END $$;" || run_psql "$ROLE" "CREATE SEQUENCE IF NOT EXISTS public.student_sequence START WITH 1 INCREMENT BY 1") || true
(run_psql "$SUPER" "ALTER SEQUENCE IF EXISTS public.student_sequence OWNER TO $ROLE;" || run_psql "$ROLE" "ALTER SEQUENCE IF EXISTS public.student_sequence OWNER TO $ROLE;") || true

echo "[step] Transferring ownership of table 'student' if present"
(run_psql "$SUPER" "ALTER TABLE IF EXISTS public.student OWNER TO $ROLE;" || run_psql "$ROLE" "ALTER TABLE IF EXISTS public.student OWNER TO $ROLE;") || true

echo "[step] Setting default privileges for future objects"
(run_psql "$ROLE" "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $ROLE;" || true)
(run_psql "$ROLE" "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $ROLE;" || true)

echo "[verify] Listing ownership of student objects"
(run_psql "$SUPER" "\\dt+ public.student" || run_psql "$ROLE" "\\dt+ public.student") || true
(run_psql "$SUPER" "\\ds+ public.student_sequence" || run_psql "$ROLE" "\\ds+ public.student_sequence") || true

echo "[done] Permissions fix attempted. You can now rerun seeding."
