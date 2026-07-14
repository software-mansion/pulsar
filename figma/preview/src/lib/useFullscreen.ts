import { useCallback, useState } from 'react';
import { useEscapeKey } from './useEscapeKey';

// In-app "fullscreen": hide the app chrome (header, panel, card) so the Figma
// content fills the whole browser viewport. Not the browser's OS fullscreen.
// Escape exits.
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(() => setIsFullscreen(true), []);
  const exit = useCallback(() => setIsFullscreen(false), []);

  useEscapeKey(exit, isFullscreen);

  return { isFullscreen, enter, exit };
}
