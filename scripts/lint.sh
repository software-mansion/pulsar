#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILED=0

run() {
  local name="$1"
  local script="$2"
  echo ""
  echo "======================================"
  echo "  $name"
  echo "======================================"
  if ! "$ROOT/scripts/$script"; then
    FAILED=1
    echo "[FAIL] $name"
  fi
}

run "JS/TS" "lint-js.sh"
run "Kotlin" "lint-kotlin.sh"
run "Swift" "lint-swift.sh"

exit "$FAILED"
