#!/usr/bin/env bash
# ESLint only the changed JS/TS files of one package: main still carries pre-existing violations,
# so linting the whole package would fail every task. Usage: eslint-changed.sh <package-dir>
set -uo pipefail
PKG="${1:?package dir}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

files=()
while IFS= read -r f; do
  case "$f" in
    "$PKG"/node_modules/*|"$PKG"/lib/*) continue ;;
    "$PKG"/*.js|"$PKG"/*.jsx|"$PKG"/*.ts|"$PKG"/*.tsx|"$PKG"/*.mjs) [ -f "$ROOT/$f" ] && files+=("${f#"$PKG"/}") ;;
  esac
done <<< "${FACTORY_CHANGED_FILES:-}"

if [ ${#files[@]} -eq 0 ]; then
  echo "no changed JS/TS files in $PKG"
  exit 0
fi
cd "$ROOT/$PKG" && npx eslint --max-warnings=0 "${files[@]}"
