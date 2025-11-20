#!/usr/bin/env zsh
set -euo pipefail
# Check student row counts for different connection parameters.
# Usage: ./scripts/check-student-counts.sh
# Override connection via env vars before running.
# Example:
#   DB_HOST=localhost DB_PORT=5432 DB_NAME=syscomz DB_USER=eneas ./scripts/check-student-counts.sh

print_count() {
  local label=$1
  local host=$2
  local port=$3
  local db=$4
  local user=$5
  if [[ -z "${PGPASSWORD:-}" ]]; then
    echo "(May prompt for password for $label)" >&2
  fi
  echo "\n[label=$label host=$host db=$db]";
  psql -h "$host" -p "$port" -U "$user" -d "$db" -Atc "SELECT COUNT(*) FROM student;" 2>/dev/null || echo "Failed to query student count for $label"
}

# Default/local
print_count "default-local" "${DB_HOST:-localhost}" "${DB_PORT:-5432}" "${DB_NAME:-syscomz}" "${DB_USER:-syscomz}"

# Example alt profile (eneas user)
print_count "eneas-local" "${ENEAS_HOST:-localhost}" "${ENEAS_PORT:-5432}" "${ENEAS_DB:-syscomz}" "${ENEAS_USER:-eneas}"

# Example remote dev (set envs before running)
if [[ -n "${DEV_HOST:-}" ]]; then
  print_count "remote-dev" "${DEV_HOST}" "${DEV_PORT:-5432}" "${DEV_DB:-syscomz}" "${DEV_USER:-syscomz}"
fi

echo "\nDone."
