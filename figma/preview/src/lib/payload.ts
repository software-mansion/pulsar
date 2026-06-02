import type { PreviewPayload } from '../types';

// Pulsar backend that stores the preview payload by token. Set in .env.local
// (gitignored) as VITE_API_SERVER_URL; .env.example documents the variable.
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;

// Fetch the preview payload from the server using the `?token=` query param.
export async function readPayload(): Promise<PreviewPayload | null> {
  if (!API_SERVER_URL) {
    console.error('VITE_API_SERVER_URL is not set. Copy .env.example to .env.local.');
    return null;
  }
  const token = new URLSearchParams(location.search).get('token');
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
