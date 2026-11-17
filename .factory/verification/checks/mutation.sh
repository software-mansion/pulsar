#!/bin/sh
# Custom check (05 §2.3, parse: json): mutation testing restricted to changed source files.
# Stryker for JS/TS, mutmut for Python. Reports the mutation score; fails below MUTATION_MIN (default 0.6).
# Env: FACTORY_CHANGED_SRC (newline-separated), FACTORY_OUT_DIR.
set -u
MIN="${MUTATION_MIN:-0.6}"
mkdir -p .factory-out
emit() { printf '{"status":"%s","summary":"%s","failures":[],"evidence":%s,"data":%s}\n' "$1" "$2" "$3" "$4"; }
FILES=$(printf '%s\n' "${FACTORY_CHANGED_SRC:-}" | grep -E '\.(ts|tsx|js|jsx|mjs|py)$' | grep -vE '\.(test|spec)\.' || true)
if [ -z "$FILES" ]; then emit skip "no changed source files to mutate" '[]' '{"score":null}'; exit 0; fi

if [ -f package.json ] && [ -d node_modules/@stryker-mutator/core ]; then
  MUTATE=$(printf '%s' "$FILES" | grep -vE '\.py$' | paste -sd, -)
  npx stryker run --mutate "$MUTATE" --reporters json,clear-text --jsonReporter.fileName .factory-out/mutation.json >&2 || true
  SCORE=$(node -e 'const r=require("./.factory-out/mutation.json");let k=0,t=0;for(const f of Object.values(r.files||{}))for(const m of f.mutants||[]){if(["Killed","Timeout"].includes(m.status))k++;if(!["Ignored","CompileError","RuntimeError"].includes(m.status))t++;}console.log(t?(k/t).toFixed(3):"null")' 2>/dev/null || echo null)
elif command -v mutmut >/dev/null 2>&1; then
  PATHS=$(printf '%s' "$FILES" | grep -E '\.py$' | paste -sd, -)
  mutmut run --paths-to-mutate "$PATHS" >&2 || true
  KILLED=$(mutmut results 2>/dev/null | grep -ci 'killed' || echo 0)
  SURVIVED=$(mutmut results 2>/dev/null | grep -ci 'survived' || echo 0)
  T=$((KILLED + SURVIVED)); SCORE=null
  [ "$T" -gt 0 ] && SCORE=$(awk "BEGIN{printf \"%.3f\", $KILLED/$T}")
else
  emit skip "no mutation tool installed (Stryker or mutmut)" '[]' '{"score":null}'; exit 0
fi
EV='[{"kind":"mutation-report","path":".factory-out/mutation.json"}]'
if [ "$SCORE" = "null" ]; then emit skip "mutation run produced no score" "$EV" '{"score":null}'; exit 0; fi
if awk "BEGIN{exit !($SCORE < $MIN)}"; then
  emit fail "mutation score $SCORE < $MIN on changed files (tests do not catch injected faults)" "$EV" "{\"score\":$SCORE}"
else
  emit pass "mutation score $SCORE on changed files" "$EV" "{\"score\":$SCORE}"
fi
