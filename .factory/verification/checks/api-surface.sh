#!/bin/sh
# Custom check (05 §2.3, parse: json): exported API surface of the package entry points vs the base commit.
# Removed or renamed exports are reported as breaking (data.breaking) so the merge router treats them as
# risky; the check itself passes unless API_SURFACE_STRICT=1. Env: FACTORY_BASE_SHA.
set -u
mkdir -p .factory-out
emit() { printf '{"status":"%s","summary":"%s","failures":[],"evidence":%s,"data":%s}\n' "$1" "$2" "$3" "$4"; }
ENTRIES="${API_ENTRIES:-}"
if [ -z "$ENTRIES" ]; then
  for f in src/index.ts src/index.js src/index.mjs index.ts index.js src/lib.rs __init__.py; do [ -f "$f" ] && ENTRIES="$ENTRIES $f"; done
fi
if [ -z "$ENTRIES" ]; then emit skip "no entry point found (set API_ENTRIES)" '[]' '{"breaking":null,"additive":0}'; exit 0; fi
BASE="${FACTORY_BASE_SHA:-HEAD}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
exports_of() { grep -E '^(export |pub (fn|struct|enum|trait|mod|const|type) |def |class )' | sed -E 's/[[:space:]]+/ /g; s/ *\{.*$//; s/ *=.*$//' | sort -u; }
: > "$TMP/base"; : > "$TMP/head"
for e in $ENTRIES; do
  git show "$BASE:$e" 2>/dev/null | exports_of >> "$TMP/base" || true
  exports_of < "$e" >> "$TMP/head"
done
sort -u -o "$TMP/base" "$TMP/base"; sort -u -o "$TMP/head" "$TMP/head"
REMOVED=$(comm -23 "$TMP/base" "$TMP/head" | wc -l | tr -d ' ')
ADDED=$(comm -13 "$TMP/base" "$TMP/head" | wc -l | tr -d ' ')
{ echo "# API surface ($ENTRIES)"; echo; echo "## Removed"; comm -23 "$TMP/base" "$TMP/head"; echo; echo "## Added"; comm -13 "$TMP/base" "$TMP/head"; } > .factory-out/api-surface.md
EV='[{"kind":"api-diff","path":".factory-out/api-surface.md"}]'
if [ "$REMOVED" -gt 0 ]; then
  ST=pass; [ "${API_SURFACE_STRICT:-0}" = "1" ] && ST=fail
  emit "$ST" "API surface: $REMOVED export(s) removed or changed, $ADDED added" "$EV" "{\"breaking\":true,\"additive\":$ADDED}"
else
  emit pass "API surface: $ADDED export(s) added, none removed" "$EV" "{\"breaking\":false,\"additive\":$ADDED}"
fi
