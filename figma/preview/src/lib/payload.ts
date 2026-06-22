import type { PreviewPayload } from '../types';

// Pulsar backend that stores the preview payload by token. Set in .env.local
// (gitignored) as VITE_API_SERVER_URL; .env.example documents the variable.
const API_SERVER_URL = "https://pulsar-server.swmansion.com";

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

// Outcome of loading the payload, so the UI can distinguish the empty states:
//   - 'ok'       → we have a payload to render.
//   - 'private'  → the owner revoked the share link (server replied 403).
//   - 'no-token' → no ?token= in the URL (the bare preview app).
//   - 'missing'  → token present but the project is gone / unreadable (404 etc.).
export type PayloadResult =
  | { status: 'ok'; payload: PreviewPayload }
  | { status: 'private' }
  | { status: 'no-token' }
  | { status: 'missing' };

// Fetch the preview payload from the server using the `?token=` query param.
export async function readPayload(): Promise<PayloadResult> {
  if (!API_SERVER_URL) {
    console.error('VITE_API_SERVER_URL is not set. Copy .env.example to .env.local.');
    return { status: 'missing' };
  }
  const token = getTokenFromUrl();
  if (!token) return { status: 'no-token' };
  try {
    // Read through the public, read-only route. The `?token=` in a share link is
    // the project's read-only public token; it can view but never modify.
    const res = await fetch(
      `${API_SERVER_URL}/figma-project/public/${encodeURIComponent(token)}`,
    );
    // 403 = the owner made this preview private. Surface it distinctly so the UI
    // can explain the link was revoked rather than showing "no design loaded".
    if (res.status === 403) return { status: 'private' };
    if (!res.ok) return { status: 'missing' };
    const data = (await res.json()) as { success: boolean; config?: PreviewPayload | string };
    if (!data.success || !data.config) return { status: 'missing' };
    // Server returns the parsed object when storage was JSON; fall back to
    // parsing if it handed back a raw string for any reason.
    if (typeof data.config === 'string') {
      try {
        return { status: 'ok', payload: JSON.parse(data.config) as PreviewPayload };
      } catch {
        return { status: 'missing' };
      }
    }
    return { status: 'ok', payload: data.config };
  } catch {
    return { status: 'missing' };
  }
}
