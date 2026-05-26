import { useEffect, useState } from 'react';

// True when the viewport is at or below a mobile breakpoint. Drives auto-fullscreen
// and hiding the device frame on phones.
export function useIsMobile(maxWidth = 640) {
  const query = `(max-width: ${maxWidth}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
