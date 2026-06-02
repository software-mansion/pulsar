import { Pool } from 'pg';
import crypto from 'crypto';
import { DATABASE_URL } from './config';

// Single shared pool for the lifetime of the process. Neon requires TLS.
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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

export async function createFigmaProject(config: string): Promise<string> {
  await ensureFigmaProjectsTable();
  const token = generateToken();
  await pool.query(
    'INSERT INTO figma_projects (token, config) VALUES ($1, $2)',
    [token, config],
  );
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
