#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"

required_migrations=(
  "20260210113000_add_remy_chat_tables.sql"
  "20260210134000_remy_chat_provider_hardening.sql"
)

echo "Running Remy chat preflight checks..."

for migration in "${required_migrations[@]}"; do
  if [[ ! -f "$MIGRATIONS_DIR/$migration" ]]; then
    echo "ERROR: missing migration $migration"
    exit 1
  fi
done

if ! grep -q "openai_last_response_id" "$MIGRATIONS_DIR/20260210134000_remy_chat_provider_hardening.sql"; then
  echo "ERROR: provider hardening migration is missing openai_last_response_id"
  exit 1
fi

if ! grep -q "provider_request_id" "$MIGRATIONS_DIR/20260210134000_remy_chat_provider_hardening.sql"; then
  echo "ERROR: provider hardening migration is missing provider_request_id"
  exit 1
fi

echo "OK: required Remy chat migrations are present."
echo "Next: run 'supabase db push' and verify the deployment target has applied both migrations."

