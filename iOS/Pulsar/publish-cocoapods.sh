#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PODSPEC_PATH="$ROOT_DIR/Pulsar-haptics.podspec"
LINT_ONLY=false
ALLOW_WARNINGS=true

usage() {
  cat <<'EOF'
Usage: ./publish-cocoapods.sh [options]

Publishes the Pulsar iOS package to CocoaPods Trunk.

Options:
  --lint-only      Run podspec validation without publishing.
  --no-warnings    Do not pass --allow-warnings to CocoaPods.
  --help           Show this help message.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --lint-only)
      LINT_ONLY=true
      ;;
    --no-warnings)
      ALLOW_WARNINGS=false
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v pod >/dev/null 2>&1; then
  echo "CocoaPods is not installed. Install it with: gem install cocoapods" >&2
  exit 1
fi

if [[ ! -f "$PODSPEC_PATH" ]]; then
  echo "Missing podspec at $PODSPEC_PATH" >&2
  exit 1
fi

if [[ ! -f "$ROOT_DIR/LICENSE" ]]; then
  echo "Missing LICENSE file. CocoaPods expects it to exist next to the podspec." >&2
  exit 1
fi

cd "$ROOT_DIR"

VERSION="$(sed -n "s/.*s\\.version[[:space:]]*=[[:space:]]*'\\([^']*\\)'.*/\\1/p" "$PODSPEC_PATH" | head -n 1)"

if [[ -z "$VERSION" ]]; then
  echo "Unable to read the podspec version from $PODSPEC_PATH" >&2
  exit 1
fi

COMMON_ARGS=("$PODSPEC_PATH")
if [[ "$ALLOW_WARNINGS" == true ]]; then
  COMMON_ARGS+=(--allow-warnings)
fi

echo "Preparing CocoaPods release for Pulsar $VERSION"

echo "Verifying local Trunk session..."
if ! TRUNK_OUTPUT="$(pod trunk me 2>&1)"; then
  echo "$TRUNK_OUTPUT" >&2
  echo "Trunk verification failed. Register this machine first with:" >&2
  echo "  pod trunk register you@example.com \"Your Name\" --description=\"$(hostname)\"" >&2
  exit 1
fi

echo "Linting podspec..."
pod spec lint "${COMMON_ARGS[@]}"

if [[ "$LINT_ONLY" == true ]]; then
  echo "Lint completed successfully. Skipping publish because --lint-only was passed."
  exit 0
fi

echo "Publishing Pulsar $VERSION to CocoaPods Trunk..."
pod trunk push "${COMMON_ARGS[@]}"

echo "Publish completed."
