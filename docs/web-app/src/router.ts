import { useEffect, useState } from 'react';

/**
 * Hash routing keeps the app a single static file — no server rewrites needed
 * for the GitHub Pages deploy — while still giving real back/forward buttons
 * and shareable links to individual demos.
 */

export function useRoute(): [string, (route: string) => void] {
  const [route, setRoute] = useState(() => readHash());

  useEffect(() => {
    const onHashChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return [route, navigate];
}

export function navigate(route: string) {
  if (readHash() === route) return;
  window.location.hash = route;
}

function readHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash === '' ? 'presets' : hash;
}
