import { useCallback, useEffect, useState } from 'react';

// In-app "fullscreen": hide the app chrome (header, panel, card) so the Figma
// content fills the whole browser viewport. Not the browser's OS fullscreen.
// Escape exits.
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(() => setIsFullscreen(true), []);
  const exit = useCallback(() => setIsFullscreen(false), []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  return { isFullscreen, enter, exit };
}
