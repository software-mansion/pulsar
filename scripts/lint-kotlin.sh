#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v ktlint >/dev/null 2>&1; then
  echo "ktlint not installed. Install: brew install ktlint" >&2
  exit 1
fi

echo "==> ktlint Android/Pulsar"
ktlint "$ROOT/Android/Pulsar/src/**/*.kt"

echo "==> ktlint react-native-pulsar android"
ktlint "$ROOT/react-native/react-native-pulsar/android/src/**/*.kt"
