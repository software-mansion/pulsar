#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v swiftlint >/dev/null 2>&1; then
  echo "swiftlint not installed. Install: brew install swiftlint" >&2
  exit 1
fi

echo "==> swiftlint iOS/Pulsar"
swiftlint lint --quiet "$ROOT/iOS/Pulsar"

echo "==> swiftlint react-native-pulsar ios"
swiftlint lint --quiet "$ROOT/react-native/react-native-pulsar/ios"
