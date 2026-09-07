#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "==> Installing react-native-pulsar (lib)"
npm --prefix "$ROOT/react-native/react-native-pulsar" install

echo "==> Installing docs"
npm --prefix "$ROOT/docs" install

echo "==> Done"
