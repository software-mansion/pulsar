import crypto from 'crypto';
import { getPool } from './db';
import {
  FIGMA_OAUTH_CLIENT_ID,
  FIGMA_OAUTH_CLIENT_SECRET,
  FIGMA_OAUTH_REDIRECT_URI,
} from './config';

// Storage + token-exchange for the "read haptics straight from the Figma file"
// preview path. Three tables:
//   - figma_oauth_grants:  one row per Figma user who connected the plugin.
//     Holds the long-lived refresh token (the only secret we persist).
//   - figma_file_grants:   maps a fileKey -> the user whose grant can read it.
//     Written when the designer shares a file from the plugin.
//   - figma_oauth_pending: short-lived handshake rows keyed by the OAuth
//     `state` nonce. The browser callback writes one; the polling plugin reads
//     it to learn the connection succeeded (and which user it was).
//
// Refresh tokens never leave the server: the plugin poll only ever sees a
// boolean + the figma user id, and the preview only ever sees extracted
// haptics. This is what lets viewers stay anonymous.

const FIGMA_TOKEN_URL = 'https://api.figma.com/v1/oauth/token';
const FIGMA_REFRESH_URL = 'https://api.figma.com/v1/oauth/refresh';
export const FIGMA_AUTHORIZE_URL = 'https://www.figma.com/oauth';
// Scope required to read file contents (incl. pluginData/sharedPluginData).
// `file_read`/`files:read` are deprecated in favour of this narrower scope.
export const FIGMA_OAUTH_SCOPE = 'file_content:read';

// Pending handshake rows older than this are dead — the auth code expired (30s)
// long ago, so a row that never completed is just garbage. Purged opportunistically.
const PENDING_TTL_MINUTES = 15;

export async function ensureFigmaOAuthTables(): Promise<void> {
  const pool = getPool();
  await pool.query(
    `CREATE TABLE IF NOT EXISTS figma_oauth_grants (
      figma_user_id TEXT PRIMARY KEY,
      refresh_token TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS figma_file_grants (
      file_key TEXT PRIMARY KEY,
      figma_user_id TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS figma_oauth_pending (
      state TEXT PRIMARY KEY,
      figma_user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
}

export function newOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

// Build the Figma authorize URL the designer's browser is sent to. `state` ties
// the eventual callback back to the polling plugin session.
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: FIGMA_OAUTH_CLIENT_ID,
    redirect_uri: FIGMA_OAUTH_REDIRECT_URI,
    scope: FIGMA_OAUTH_SCOPE,
    state,
    response_type: 'code',
  });
  return `${FIGMA_AUTHORIZE_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  const raw = `${FIGMA_OAUTH_CLIENT_ID}:${FIGMA_OAUTH_CLIENT_SECRET}`;
  return 'Basic ' + Buffer.from(raw).toString('base64');
}

interface FigmaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id?: string;
}

// Exchange a one-time auth code for tokens. The client_secret is sent here
// (HTTP Basic), server-side only — this is why the flow can't be pure-client.
export async function exchangeCodeForTokens(code: string): Promise<FigmaTokenResponse> {
  const res = await fetch(FIGMA_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      redirect_uri: FIGMA_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Figma token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as FigmaTokenResponse;
}

// Trade a stored refresh token for a fresh short-lived access token.
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(FIGMA_REFRESH_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ refresh_token: refreshToken }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Figma token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function upsertGrant(figmaUserId: string, refreshToken: string): Promise<void> {
  await getPool().query(
    `INSERT INTO figma_oauth_grants (figma_user_id, refresh_token, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (figma_user_id)
     DO UPDATE SET refresh_token = EXCLUDED.refresh_token, updated_at = NOW()`,
    [figmaUserId, refreshToken],
  );
}

export async function getGrantRefreshToken(figmaUserId: string): Promise<string | null> {
  const result = await getPool().query<{ refresh_token: string }>(
    'SELECT refresh_token FROM figma_oauth_grants WHERE figma_user_id = $1',
    [figmaUserId],
  );
  return result.rows[0]?.refresh_token ?? null;
}

// Record that this handshake completed. Also opportunistically clears stale rows.
export async function markPendingComplete(state: string, figmaUserId: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO figma_oauth_pending (state, figma_user_id)
     VALUES ($1, $2)
     ON CONFLICT (state) DO UPDATE SET figma_user_id = EXCLUDED.figma_user_id`,
    [state, figmaUserId],
  );
  await pool
    .query(
      `DELETE FROM figma_oauth_pending WHERE created_at < NOW() - INTERVAL '${PENDING_TTL_MINUTES} minutes'`,
    )
    .catch(() => undefined);
}

// Poll target: returns the connected user id once the callback has run, else null.
export async function readPending(state: string): Promise<string | null> {
  const result = await getPool().query<{ figma_user_id: string }>(
    'SELECT figma_user_id FROM figma_oauth_pending WHERE state = $1',
    [state],
  );
  return result.rows[0]?.figma_user_id ?? null;
}

export async function mapFileToUser(fileKey: string, figmaUserId: string): Promise<void> {
  await getPool().query(
    `INSERT INTO figma_file_grants (file_key, figma_user_id, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (file_key)
     DO UPDATE SET figma_user_id = EXCLUDED.figma_user_id, updated_at = NOW()`,
    [fileKey, figmaUserId],
  );
}

export async function getUserForFile(fileKey: string): Promise<string | null> {
  const result = await getPool().query<{ figma_user_id: string }>(
    'SELECT figma_user_id FROM figma_file_grants WHERE file_key = $1',
    [fileKey],
  );
  return result.rows[0]?.figma_user_id ?? null;
}

// Resolve a fresh access token for whatever grant owns this file. null when the
// file was never shared or its grant has gone missing.
export async function getAccessTokenForFile(fileKey: string): Promise<string | null> {
  const figmaUserId = await getUserForFile(fileKey);
  if (!figmaUserId) return null;
  const refresh = await getGrantRefreshToken(figmaUserId);
  if (!refresh) return null;
  return refreshAccessToken(refresh);
}
