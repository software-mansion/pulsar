import type { PreviewPayload } from '../types';

// Pulsar backend that stores the preview payload by token. Set in .env.local
// (gitignored) as VITE_API_SERVER_URL; .env.example documents the variable.
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;

// Read the `?token=` query param from the current URL, falling back to the
// parent window's URL when we're embedded inside an <iframe srcdoc>. Srcdoc
// iframes always read `location.search === ''` because their effective URL is
// the synthetic `about:srcdoc`, so we have to climb up one level — this is
// what the docs `/figma-preview` page (docs/src/components/preview/Preview.astro)
// relies on to forward its own query string into the embed. Same-origin only;
// any SecurityError on a cross-origin parent falls back to no token.
function getTokenFromUrl(): string | null {
  const own = new URLSearchParams(location.search).get('token');
  if (own) return own;
  if (window.parent !== window) {
    try {
      return new URLSearchParams(window.parent.location.search).get('token');
    } catch {
      // cross-origin parent — give up and behave like there's no token.
    }
  }
  return null;
}

// Fetch the preview payload from the server using the `?token=` query param.
export async function readPayload(): Promise<PreviewPayload | null> {
  if (!API_SERVER_URL) {
    console.error('VITE_API_SERVER_URL is not set. Copy .env.example to .env.local.');
    return null;
  }
  const token = getTokenFromUrl();
  if (!token) return null;
  try {
    const res = await fetch(
      `${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { success: boolean; config?: PreviewPayload | string };
    if (!data.success || !data.config) return null;
    // Server returns the parsed object when storage was JSON; fall back to
    // parsing if it handed back a raw string for any reason.
    if (typeof data.config === 'string') {
      try {
        return JSON.parse(data.config) as PreviewPayload;
      } catch {
        return null;
      }
    }
    return data.config;
  } catch {
    return null;
  }
}
