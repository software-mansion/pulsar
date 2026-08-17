import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';

// Keep the screen from auto-locking while the owning screen is focused.
//
// expo-keep-awake's own `useKeepAwake` is mount-scoped, which is wrong for tab
// screens: the tabs stay mounted in the background, so the lock would survive
// switching away. Gating on focus releases it as soon as the user leaves.
//
// Each call site passes its own `tag` - locks are reference-counted per tag, so
// a shared tag would let one screen's cleanup release another screen's lock.
export function useKeepAwakeWhileFocused(tag: string) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    // Swallow failures: on an unsupported platform (web without the Wake Lock
    // API) this is a no-op we don't want surfacing as an unhandled rejection.
    activateKeepAwakeAsync(tag).catch(() => {});

    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [isFocused, tag]);
}
