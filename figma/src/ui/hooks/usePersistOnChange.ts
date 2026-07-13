import { useEffect, useRef } from 'react';

// Run `persist` whenever `value` changes, but skip the initial mount so a value
// just loaded from the main thread (via `init`) isn't immediately written back -
// which would clobber the stored value before it's restored. Uses a ref flag, so
// unlike a `useState` guard it doesn't cost an extra render.
export function usePersistOnChange<T>(value: T, persist: () => void) {
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    persist();
    // Intentionally keyed on `value` only - `persist` is re-created each render
    // but we only want to run it on a real value change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
