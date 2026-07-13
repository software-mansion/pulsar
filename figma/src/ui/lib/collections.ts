// Return a new Set with `key` toggled - added if absent, removed if present.
// Copies (never mutates the input), so it's safe to use directly in a React
// state updater: setThing((prev) => toggleInSet(prev, key)).
export function toggleInSet<T>(set: Set<T>, key: T): Set<T> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
