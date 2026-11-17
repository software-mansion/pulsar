#!/bin/sh
# Custom check (05 §2.3, parse: json): compare the OpenAPI document against the base commit.
# Last stdout line is the JSON result. Uses `oasdiff` (https://github.com/oasdiff/oasdiff) when installed.
# data.breaking feeds the merge risk model (api_breaking). Env: FACTORY_BASE_SHA, FACTORY_OUT_DIR.
set -u
SPEC="${OPENAPI_SPEC:-}"
if [ -z "$SPEC" ]; then
  for f in openapi.yaml openapi.yml openapi.json api/openapi.yaml docs/openapi.yaml; do
    [ -f "$f" ] && SPEC="$f" && break
  done
fi
OUT="${FACTORY_OUT_DIR:-.factory-out}"; mkdir -p "$OUT" .factory-out
emit() { printf '{"status":"%s","summary":"%s","failures":[],"evidence":%s,"data":%s}\n' "$1" "$2" "$3" "$4"; }

if [ -z "$SPEC" ]; then emit skip "no OpenAPI document found" '[]' '{"breaking":null,"additive":0}'; exit 0; fi
BASE="${FACTORY_BASE_SHA:-HEAD}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
if ! git show "$BASE:$SPEC" > "$TMP/base.spec" 2>/dev/null; then
  emit pass "OpenAPI document is new" '[]' '{"breaking":false,"additive":1}'; exit 0
fi
if cmp -s "$TMP/base.spec" "$SPEC"; then emit pass "OpenAPI: no change" '[]' '{"breaking":false,"additive":0}'; exit 0; fi
if ! command -v oasdiff >/dev/null 2>&1; then
  emit skip "OpenAPI changed; install oasdiff to classify the change" '[]' '{"breaking":null,"additive":0}'; exit 0
fi
oasdiff changelog "$TMP/base.spec" "$SPEC" > .factory-out/api-diff.md 2>&1 || true
BREAKING=$(oasdiff breaking "$TMP/base.spec" "$SPEC" 2>/dev/null | grep -c 'error' || true)
TOTAL=$(grep -c '^- ' .factory-out/api-diff.md 2>/dev/null || echo 0)
EV='[{"kind":"api-diff","path":".factory-out/api-diff.md"}]'
if [ "${BREAKING:-0}" -gt 0 ]; then
  emit pass "OpenAPI: $BREAKING breaking change(s)" "$EV" "{\"breaking\":true,\"additive\":$TOTAL}"
else
  emit pass "OpenAPI: $TOTAL additive change(s)" "$EV" "{\"breaking\":false,\"additive\":$TOTAL}"
fi
