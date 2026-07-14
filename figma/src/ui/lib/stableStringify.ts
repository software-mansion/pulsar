// Deterministic JSON: keys sorted recursively so two structurally-equal
// payloads (built locally vs. parsed back from the server) stringify
// identically. Used purely for "did anything actually change?" comparisons.
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const norm = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (seen.has(v as object)) return null;
    seen.add(v as object);
    if (Array.isArray(v)) return v.map(norm);
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) out[k] = norm(obj[k]);
    return out;
  };
  return JSON.stringify(norm(value));
}
