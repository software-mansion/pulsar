#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILED=0

run() {
  local dir="$1"
  echo "==> eslint $dir"
  if ! npm --prefix "$ROOT/$dir" run lint --silent; then
    FAILED=1
  fi
}

run "PulsarApp"
run "react-native/react-native-pulsar"

exit "$FAILED"
