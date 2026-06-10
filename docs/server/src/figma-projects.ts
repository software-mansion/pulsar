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

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: buildSslOption(),
});

pool.on('error', (err) => {
  console.error('pg pool error:', err);
});

let initPromise: Promise<void> | null = null;

// Lazily create the table on first use so importing the module doesn't block
// startup if the DB is briefly unreachable.
export function ensureFigmaProjectsTable(): Promise<void> {
  if (!initPromise) {
    initPromise = pool
      .query(
        `CREATE TABLE IF NOT EXISTS figma_projects (
          token TEXT PRIMARY KEY,
          config TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      )
      .then(() => undefined)
      .catch((err) => {
        // Reset so a later request can retry the bootstrap.
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

function generateToken(): string {
  // 32 bytes -> 64 hex chars. Plenty of entropy, URL-safe.
  return crypto.randomBytes(32).toString('hex');
}

const PROJECT_TTL_DAYS = 90;
const PURGE_THROTTLE_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;

export async function purgeExpiredFigmaProjects(): Promise<number> {
  await ensureFigmaProjectsTable();
  const result = await pool.query(
    `DELETE FROM figma_projects WHERE updated_at < NOW() - INTERVAL '${PROJECT_TTL_DAYS} days'`,
  );
  return result.rowCount ?? 0;
}

function schedulePurge(): void {
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

export async function createFigmaProject(config: string): Promise<string> {
  await ensureFigmaProjectsTable();
  const token = generateToken();
  await pool.query(
    'INSERT INTO figma_projects (token, config) VALUES ($1, $2)',
    [token, config],
  );
  schedulePurge();
  return token;
}

export async function updateFigmaProject(token: string, config: string): Promise<boolean> {
  await ensureFigmaProjectsTable();
  const result = await pool.query(
    'UPDATE figma_projects SET config = $1, updated_at = NOW() WHERE token = $2',
    [config, token],
  );
  return result.rowCount > 0;
}

export async function getFigmaProject(token: string): Promise<string | null> {
  await ensureFigmaProjectsTable();
  const result = await pool.query<{ config: string }>(
    'SELECT config FROM figma_projects WHERE token = $1',
    [token],
  );
  return result.rows[0]?.config ?? null;
}
