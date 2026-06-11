import { Pool, PoolConfig } from 'pg';
import { DATABASE_URL } from './config';

// Shared pg pool, used by every DB-backed module (figma-projects, figma-oauth).
// Extracted here so the test seam (__setPoolForTests) swaps a single in-memory
// pool that all modules then read through — otherwise each module would dial
// its own connection and tests couldn't inject pg-mem consistently.

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

export function getPool(): Pool {
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
