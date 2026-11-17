#!/usr/bin/env bash
# `flutter test` for one package. The flutter tool rewrites analysis_options.yaml (adds analyzer excludes) and
# pub get re-resolves pubspec.lock files; restore them afterwards so the gate leaves the worktree as it found it.
# Usage: flutter-test.sh <package-dir>
set -uo pipefail
PKG="${1:?package dir}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT/$PKG" || exit 1

SNAP="$(mktemp -d)"
keep=(analysis_options.yaml pubspec.lock example/pubspec.lock)
for f in "${keep[@]}"; do
  [ -f "$f" ] && mkdir -p "$SNAP/$(dirname "$f")" && cp "$f" "$SNAP/$f"
done

flutter test
status=$?

for f in "${keep[@]}"; do
  if [ -f "$SNAP/$f" ]; then cp "$SNAP/$f" "$f"; elif git ls-files --error-unmatch "$f" >/dev/null 2>&1; then :; else rm -f "$f"; fi
done
rm -rf "$SNAP"
exit $status
