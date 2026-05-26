import type { PreviewPayload } from '../types';

// Decode the base64 JSON payload the plugin stuffs into the URL hash:
//   #data=<base64( JSON PreviewPayload )>
export function readPayload(): PreviewPayload | null {
  const hash = location.hash.replace(/^#/, '');
  const m = hash.match(/(?:^|&)data=([^&]+)/);
  if (!m) return null;
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))));
    return JSON.parse(json) as PreviewPayload;
  } catch {
    return null;
  }
}
