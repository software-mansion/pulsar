// Pulsar live-preview server protocol. Pure network helpers (no React) used by
// the preview-sync hook to publish/fetch the bindings payload by token.
//
// Server <-> client sync state: the server keeps a monotonic `revision` per
// project; the client remembers the revision it last synced (its "base") so it
// can detect when the row changed underneath it and reconcile.

// Pulsar backend that stores the preview payload by token. Kept in sync with
// PhonePanel.API_SERVER_URL.
export const API_SERVER_URL = 'https://pulsar-server.swmansion.com';

// Default live-preview app URL. Pinned at build time: localhost while
// developing the plugin (vite dev → import.meta.env.DEV === true), production
// host otherwise. The user can also override this per-install via
// Settings → Live preview (Preview base URL override) - handy for pointing a
// production-built plugin at a locally-hosted docs/preview instance.
const DEFAULT_PREVIEW_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5173/'
  : 'https://docs.swmansion.com/pulsar/figma-preview/';

export function resolvePreviewBaseUrl(override: string): string {
  const trimmed = override.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_PREVIEW_BASE_URL;
}

// POST the preview payload. Returns the secret edit token, a read-only
// publicToken for share links, a read-only previewToken for the pairing QR
// (always serves, independent of share-link visibility), and the revision.
export async function createProject(
  payload: unknown
): Promise<{ token: string; publicToken: string; previewToken: string; revision: number }> {
  const res = await fetch(`${API_SERVER_URL}/figma-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload })
  });
  const data = (await res.json().catch(() => null)) as
    | {
        success: boolean;
        token?: string;
        publicToken?: string;
        previewToken?: string;
        revision?: number;
        error?: string;
        detail?: string;
      }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success || !data.token || !data.publicToken) {
    throw new Error(data?.error || 'No token returned');
  }
  return {
    token: data.token,
    publicToken: data.publicToken,
    // Fall back to the share token against an older server that predates the
    // split (mirrors the server's preview_token = public_token backfill).
    previewToken: data.previewToken ?? data.publicToken,
    revision: data.revision ?? 0
  };
}

// Result of a conditional update: applied (new revision), gone (404, caller
// should recreate), or conflict (server moved on - carries the current
// snapshot so the caller can reconcile).
export type UpdateResult =
  | { kind: 'ok'; revision: number }
  | { kind: 'gone' }
  | { kind: 'conflict'; config: unknown; revision: number };

// PUT the payload at an existing token. When `baseRevision` is non-null the
// update is conditional and a server-side change yields a 'conflict'.
export async function updateProject(
  token: string,
  payload: unknown,
  baseRevision: number | null
): Promise<UpdateResult> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: payload, baseRevision })
  });
  if (res.status === 404) return { kind: 'gone' };
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; revision?: number; config?: unknown; error?: string; detail?: string }
    | null;
  if (res.status === 409) {
    return { kind: 'conflict', config: data?.config ?? null, revision: data?.revision ?? 0 };
  }
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success) throw new Error(data?.error || 'Update failed');
  return { kind: 'ok', revision: data.revision ?? 0 };
}

// Outcome of an owner GET: the stored snapshot, a revoked (private) link, or a
// missing row. Only 'missing' means forget the token. ('private' is only
// reachable against an older server that still 403s the owner read.)
export type FetchResult =
  | {
      kind: 'ok';
      config: unknown;
      revision: number;
      isPublic: boolean;
      publicToken: string | null;
      // Read-only private preview token (the pairing QR). Null against an older
      // server that predates the split.
      previewToken: string | null;
    }
  | { kind: 'private' }
  | { kind: 'missing' };

// GET the owner's project by its secret edit token. Also returns the read-only
// share + preview tokens so the plugin can (re)learn them for a legacy share.
export async function fetchProject(token: string): Promise<FetchResult> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}`);
  if (res.status === 404) return { kind: 'missing' };
  // Only an older (pre-split) server 403s the owner read; treat as private.
  if (res.status === 403) return { kind: 'private' };
  const data = (await res.json().catch(() => null)) as
    | {
        success: boolean;
        config?: unknown;
        revision?: number;
        isPublic?: boolean;
        publicToken?: string;
        previewToken?: string;
        error?: string;
        detail?: string;
      }
    | null;
  if (!res.ok) {
    const msg = data?.error ?? `Server responded ${res.status}`;
    throw new Error(data?.detail ? `${msg} (${data.detail})` : msg);
  }
  if (!data?.success) throw new Error(data?.error || 'Fetch failed');
  return {
    kind: 'ok',
    config: data.config ?? null,
    revision: data.revision ?? 0,
    isPublic: data.isPublic ?? true,
    publicToken: data.publicToken ?? null,
    // Fall back to the share token against an older (pre-split) server.
    previewToken: data.previewToken ?? data.publicToken ?? null
  };
}

// Outcome of a visibility PATCH: whether the server accepted it, plus the
// current share token after the change. Re-publishing (private → public)
// rotates publicToken server-side, so the caller must adopt the returned value.
export interface VisibilityResult {
  ok: boolean;
  publicToken: string | null;
}

// PATCH a token's share-link visibility (public ⇄ private). Separate from
// updateProject so a config sync and a visibility toggle never get conflated.
export async function setProjectVisibility(
  token: string,
  isPublic: boolean
): Promise<VisibilityResult> {
  const res = await fetch(`${API_SERVER_URL}/figma-project/${encodeURIComponent(token)}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublic })
  });
  if (!res.ok) return { ok: false, publicToken: null };
  const data = (await res.json().catch(() => null)) as
    | { success?: boolean; publicToken?: string }
    | null;
  return { ok: !!data?.success, publicToken: data?.publicToken ?? null };
}
