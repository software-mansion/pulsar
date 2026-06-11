import type { PreviewPayload } from '../types';

// Pulsar backend that stores the preview payload by token. Set in .env.local
// (gitignored) as VITE_API_SERVER_URL; .env.example documents the variable.
const API_SERVER_URL = "https://pulsar-server.swmansion.com";

// Read a query param from the current URL, falling back to the parent window's
// URL when we're embedded inside an <iframe srcdoc>. Srcdoc iframes always read
// `location.search === ''` because their effective URL is the synthetic
// `about:srcdoc`, so we have to climb up one level — this is what the docs
// `/figma-preview` page (docs/src/components/preview/Preview.astro) relies on to
// forward its own query string into the embed. Same-origin only; any
// SecurityError on a cross-origin parent falls back to no value.
function getParamFromUrl(name: string): string | null {
  const own = new URLSearchParams(location.search).get(name);
  if (own) return own;
  if (window.parent !== window) {
    try {
      return new URLSearchParams(window.parent.location.search).get(name);
    } catch {
      // cross-origin parent — give up and behave like there's no param.
    }
  }
  return null;
}

// Normalize the server's { success, config } envelope into a PreviewPayload.
function parseEnvelope(data: {
  success?: boolean;
  config?: PreviewPayload | string;
}): PreviewPayload | null {
  if (!data?.success || !data.config) return null;
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
}

// Fetch the preview payload. Two paths, tried in priority order:
//   1. `?file=<fileKey>` — design-data path. The haptics live in the Figma file;
//      the server reads them via the REST API (using the designer's OAuth grant)
//      and returns the same payload shape. No DB row, no per-share token.
//   2. `?token=<token>`  — legacy DB path. The plugin published a payload to the
//      server, keyed by token. Used when the designer hasn't connected Figma.
export async function readPayload(): Promise<PreviewPayload | null> {
  if (!API_SERVER_URL) {
    console.error('VITE_API_SERVER_URL is not set. Copy .env.example to .env.local.');
    return null;
  }

  const fileKey = getParamFromUrl('file');
  if (fileKey) {
    try {
      const res = await fetch(`${API_SERVER_URL}/figma-design/${encodeURIComponent(fileKey)}`);
      if (res.ok) {
        const payload = parseEnvelope(await res.json());
        if (payload) return payload;
      }
    } catch {
      // Fall through to the token path below.
    }
  }

  const token = getParamFromUrl('token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return parseEnvelope(await res.json());
  } catch {
    return null;
  }
}
