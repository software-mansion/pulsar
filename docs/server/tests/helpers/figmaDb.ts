// In-memory Postgres for figma-projects tests. pg-mem's createPg() adapter
// returns a pg-compatible Pool, which we inject into figma-projects via its
// test-only seam so no real database is dialed.
import { newDb, IMemoryDb } from 'pg-mem';
import {
  __setPoolForTests,
  __closePoolForTests,
  __setPurgeEnabledForTests,
  ensureFigmaProjectsTable,
} from '../../src/figma-projects';

export interface InMemoryFigmaDb {
  db: IMemoryDb;
  // Run arbitrary SQL against the same in-memory db (e.g. to back-date rows).
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number }>;
}

// Create a fresh in-memory db, wire it into figma-projects, and create the
// schema. Call in beforeEach for full isolation between tests.
export async function useInMemoryFigmaDb(): Promise<InMemoryFigmaDb> {
  // Suppress the fire-and-forget GC purge so it can't run against a torn-down
  // pool between tests (the purge logic is covered directly elsewhere).
  __setPurgeEnabledForTests(false);
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();
  __setPoolForTests(pool);
  await ensureFigmaProjectsTable();
  return {
    db,
    query: (sql, params) => pool.query(sql, params),
  };
}

// Drop and close the injected pool so jest doesn't warn about open handles.
export async function closeInMemoryFigmaDb(): Promise<void> {
  await __closePoolForTests();
}
