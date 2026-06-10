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
// lets older deployments pick up `revision` without a manual migration.
export async function ensureFigmaProjectsTable(): Promise<void> {
  await getPool().query(
    `CREATE TABLE IF NOT EXISTS figma_projects (
      token TEXT PRIMARY KEY,
      config TEXT NOT NULL,
      revision BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );
  await getPool().query(
    'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0',
  );
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
}

// `conflict` carries the current server snapshot so the caller can reconcile.
export type FigmaProjectUpdateResult =
  | { kind: 'ok'; revision: number }
  | { kind: 'not_found' }
  | { kind: 'conflict'; current: FigmaProjectSnapshot };

export async function createFigmaProject(
  config: string,
): Promise<{ token: string; revision: number }> {
  const token = generateToken();
  const result = await getPool().query<{ revision: string }>(
    'INSERT INTO figma_projects (token, config, revision) VALUES ($1, $2, 0) RETURNING revision',
    [token, config],
  );
  schedulePurge();
  return { token, revision: Number(result.rows[0]?.revision ?? 0) };
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

export async function getFigmaProject(token: string): Promise<FigmaProjectSnapshot | null> {
  const result = await getPool().query<{ config: string; revision: string }>(
    'SELECT config, revision FROM figma_projects WHERE token = $1',
    [token],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { config: row.config, revision: Number(row.revision) };
}
