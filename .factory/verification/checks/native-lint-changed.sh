#!/usr/bin/env bash
# ktlint / swiftlint on the changed Kotlin / Swift files only (main has thousands of pre-existing violations).
# Usage: native-lint-changed.sh kotlin|swift
set -uo pipefail
LANG_="${1:?kotlin|swift}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
[ "$LANG_" = kotlin ] && ext=kt || ext=swift

files=()
while IFS= read -r f; do
  case "$f" in
    */build/*|*/.build/*|*/.tmp/*|*/node_modules/*|*/Pods/*) continue ;;
    *."$ext") [ -f "$ROOT/$f" ] && files+=("$ROOT/$f") ;;
  esac
done <<< "${FACTORY_CHANGED_FILES:-}"

if [ ${#files[@]} -eq 0 ]; then
  echo "no changed .$ext files"
  exit 0
fi
if [ "$LANG_" = kotlin ]; then
  ktlint "${files[@]}"
else
  swiftlint lint --quiet --strict "${files[@]}"
fi
