import { Pool, PoolConfig } from 'pg';
import crypto from 'crypto';
import { DATABASE_URL } from './config';

// SSL is opt-in: managed providers (Neon, RDS, etc.) need it, but self-hosted
// Postgres on the same private network typically does not — and forcing TLS
// against a server that doesn't speak it makes the connection fail outright.
// Enable by setting DATABASE_SSL=1/true/require (rejectUnauthorized=false to
// tolerate managed providers' chains without bundling root certs).
function buildSslOption(): PoolConfig['ssl'] {
  const flag = (process.env.DATABASE_SSL ?? '').toLowerCase().trim();
  if (flag === '1' || flag === 'true' || flag === 'require' || flag === 'yes') {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

// The pool is created lazily on first query, not at import time, so tests can
// swap in an in-memory pool (pg-mem) before any real connection is dialed.
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: DATABASE_URL, ssl: buildSslOption() });
    _pool.on('error', (err) => {
      console.error('pg pool error:', err);
    });
  }
  return _pool;
}

// Test-only seam: inject a pg-compatible pool (e.g. from pg-mem's
// db.adapters.createPg()) before any query runs. Never used in production.
export function __setPoolForTests(pool: Pool): void {
  _pool = pool;
}

// Test-only: drop and close the current pool so suites don't leak handles.
export async function __closePoolForTests(): Promise<void> {
  const pool = _pool;
  _pool = null;
  if (pool) await pool.end().catch(() => undefined);
}

// Create the table once at startup (see server.ts). ADD COLUMN IF NOT EXISTS
// lets older deployments pick up new columns without a manual migration.
export async function ensureFigmaProjectsTable(): Promise<void> {
  await getPool().query(
    `CREATE TABLE IF NOT EXISTS figma_projects (
      token TEXT PRIMARY KEY,
      public_token TEXT,
      config TEXT NOT NULL,
      revision BIGINT NOT NULL DEFAULT 0,
      is_public BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
  await getPool().query(
    'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0',
  );
  // is_public is additive too: already-deployed tables pick it up here and
  // existing rows default to public (the pre-feature behaviour — anyone with
  // the link could view), so the migration doesn't silently hide live shares.
  await getPool().query(
    'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE',
  );
  // Read-only share token, distinct from the secret edit `token`. Backfill
  // pre-split rows to `token` so links already in the wild keep resolving.
  await getPool().query(
    'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS public_token TEXT',
  );
  await getPool().query(
    'UPDATE figma_projects SET public_token = token WHERE public_token IS NULL',
  );
  // Index for the public read lookup. Swallow failures — pg-mem (tests) lacks
  // CREATE INDEX IF NOT EXISTS, and it's an optimisation, not a correctness need.
  try {
    await getPool().query(
      'CREATE INDEX IF NOT EXISTS figma_projects_public_token_idx ON figma_projects (public_token)',
    );
  } catch (err) {
    console.warn('skipping public_token index creation:', err);
  }
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const PROJECT_TTL_DAYS = 90;
const PURGE_THROTTLE_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;
// Tests disable the fire-and-forget purge so its async query can't outlive a
// test and run against a torn-down pool. Production leaves it enabled.
let purgeEnabled = true;
export function __setPurgeEnabledForTests(enabled: boolean): void {
  purgeEnabled = enabled;
}

export async function purgeExpiredFigmaProjects(): Promise<number> {
  const result = await getPool().query(
    `DELETE FROM figma_projects WHERE updated_at < NOW() - INTERVAL '${PROJECT_TTL_DAYS} days'`,
  );
  return result.rowCount ?? 0;
}

function schedulePurge(): void {
  if (!purgeEnabled) return;
  const now = Date.now();
  if (now - lastPurgeAt < PURGE_THROTTLE_MS) return;
  lastPurgeAt = now;
  purgeExpiredFigmaProjects().then(
    (count) => {
      if (count > 0) {
        console.log(
          `purged ${count} figma project(s) inactive for >${PROJECT_TTL_DAYS} days`,
        );
      }
    },
    (err) => {
      lastPurgeAt = 0;
      console.error('purgeExpiredFigmaProjects failed:', err);
    },
  );
}

export interface FigmaProjectSnapshot {
  config: string;
  revision: number;
  // When false the share link is revoked: the public read route refuses to
  // serve the config. The owner read (by edit token) ignores this flag.
  isPublic: boolean;
  // Read-only share token, returned to the owner to build share links/QRs.
  publicToken: string;
}

// Result of toggling a project's visibility. `not_found` mirrors update's shape
// so the route can reuse the 404 path.
export type FigmaProjectVisibilityResult =
  | { kind: 'ok'; isPublic: boolean }
  | { kind: 'not_found' };

// `conflict` carries the current server snapshot so the caller can reconcile.
export type FigmaProjectUpdateResult =
  | { kind: 'ok'; revision: number }
  | { kind: 'not_found' }
  | { kind: 'conflict'; current: FigmaProjectSnapshot };

export async function createFigmaProject(
  config: string,
): Promise<{ token: string; publicToken: string; revision: number }> {
  const token = generateToken();
  const publicToken = generateToken();
  const result = await getPool().query<{ revision: string }>(
    'INSERT INTO figma_projects (token, public_token, config, revision) VALUES ($1, $2, $3, 0) RETURNING revision',
    [token, publicToken, config],
  );
  schedulePurge();
  return { token, publicToken, revision: Number(result.rows[0]?.revision ?? 0) };
}

// Bump a project's config + revision. When `baseRevision` is given the update
// is conditional (applies only if the row is still at that revision, else
// `conflict`); null/undefined does an unconditional update.
export async function updateFigmaProject(
  token: string,
  config: string,
  baseRevision?: number | null,
): Promise<FigmaProjectUpdateResult> {
  if (baseRevision === undefined || baseRevision === null) {
    const result = await getPool().query<{ revision: string }>(
      'UPDATE figma_projects SET config = $1, updated_at = NOW(), revision = revision + 1 WHERE token = $2 RETURNING revision',
      [config, token],
    );
    if (result.rowCount === 0) return { kind: 'not_found' };
    return { kind: 'ok', revision: Number(result.rows[0].revision) };
  }

  const result = await getPool().query<{ revision: string }>(
    'UPDATE figma_projects SET config = $1, updated_at = NOW(), revision = revision + 1 WHERE token = $2 AND revision = $3 RETURNING revision',
    [config, token, baseRevision],
  );
  if (result.rowCount === 1) {
    return { kind: 'ok', revision: Number(result.rows[0].revision) };
  }
  // 0 rows: token gone, or its revision moved on. Tell the two apart.
  const current = await getFigmaProject(token);
  if (current === null) return { kind: 'not_found' };
  return { kind: 'conflict', current };
}

// Flip a project's share-link visibility. Touches updated_at (so toggling keeps
// the row alive under the TTL purge) but deliberately leaves `revision` alone —
// visibility isn't part of the config, so this must not provoke a spurious
// optimistic-concurrency conflict on the owner's next config PUT.
export async function setFigmaProjectVisibility(
  token: string,
  isPublic: boolean,
): Promise<FigmaProjectVisibilityResult> {
  const result = await getPool().query<{ is_public: boolean }>(
    'UPDATE figma_projects SET is_public = $1, updated_at = NOW() WHERE token = $2 RETURNING is_public',
    [isPublic, token],
  );
  if (result.rowCount === 0) return { kind: 'not_found' };
  return { kind: 'ok', isPublic: result.rows[0].is_public };
}

// Look up a project by its secret edit token (owner operations + owner read).
export async function getFigmaProject(token: string): Promise<FigmaProjectSnapshot | null> {
  const result = await getPool().query<{
    config: string;
    revision: string;
    is_public: boolean;
    public_token: string;
  }>(
    'SELECT config, revision, is_public, public_token FROM figma_projects WHERE token = $1',
    [token],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    config: row.config,
    revision: Number(row.revision),
    isPublic: row.is_public,
    publicToken: row.public_token,
  };
}

// Look up a project by its read-only public token (the share path; the route
// layer enforces is_public on top of this).
export async function getFigmaProjectByPublicToken(
  publicToken: string,
): Promise<FigmaProjectSnapshot | null> {
  const result = await getPool().query<{
    config: string;
    revision: string;
    is_public: boolean;
    public_token: string;
  }>(
    'SELECT config, revision, is_public, public_token FROM figma_projects WHERE public_token = $1',
    [publicToken],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    config: row.config,
    revision: Number(row.revision),
    isPublic: row.is_public,
    publicToken: row.public_token,
  };
}
