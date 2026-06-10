import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createFigmaProject,
  getFigmaProject,
  updateFigmaProject,
  purgeExpiredFigmaProjects,
  ensureFigmaProjectsTable,
} from '../src/figma-projects';
import { useInMemoryFigmaDb, closeInMemoryFigmaDb, InMemoryFigmaDb } from './helpers/figmaDb';

describe('figma-projects (in-memory pg)', () => {
  let mem: InMemoryFigmaDb;

  beforeEach(async () => {
    mem = await useInMemoryFigmaDb();
  });

  afterEach(async () => {
    await closeInMemoryFigmaDb();
  });

  describe('ensureFigmaProjectsTable', () => {
    it('creates a usable schema (proven by the suite running against it)', async () => {
      // beforeEach already ran ensureFigmaProjectsTable; a basic round-trip
      // confirms the table + columns exist.
      const { token } = await createFigmaProject('{}');
      expect(await getFigmaProject(token)).toEqual({ config: '{}', revision: 0 });
    });

    it('migration (ADD COLUMN IF NOT EXISTS) is safe to re-run', async () => {
      // The additive migration is what keeps already-deployed tables working
      // across restarts; re-running it must be a no-op. (We exercise the
      // migration statement directly: pg-mem can't model a second
      // CREATE TABLE IF NOT EXISTS over NOW() defaults, but real Postgres can.)
      await expect(
        mem.query(
          'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 0',
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('createFigmaProject', () => {
    it('inserts a row and returns a token with revision 0', async () => {
      const { token, revision } = await createFigmaProject('{"hello":"world"}');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(revision).toBe(0);

      const snap = await getFigmaProject(token);
      expect(snap).toEqual({ config: '{"hello":"world"}', revision: 0 });
    });

    it('returns revision as a JS number, not a bigint string', async () => {
      const { token } = await createFigmaProject('{}');
      const snap = await getFigmaProject(token);
      expect(typeof snap!.revision).toBe('number');
    });
  });

  describe('getFigmaProject', () => {
    it('returns null for an unknown token', async () => {
      expect(await getFigmaProject('nope')).toBeNull();
    });
  });

  describe('updateFigmaProject — unconditional', () => {
    it('bumps revision and replaces config', async () => {
      const { token } = await createFigmaProject('{"v":1}');
      const res = await updateFigmaProject(token, '{"v":2}');
      expect(res).toEqual({ kind: 'ok', revision: 1 });

      const snap = await getFigmaProject(token);
      expect(snap).toEqual({ config: '{"v":2}', revision: 1 });
    });

    it('returns not_found for a missing token', async () => {
      const res = await updateFigmaProject('ghost', '{}');
      expect(res).toEqual({ kind: 'not_found' });
    });
  });

  describe('updateFigmaProject — conditional (optimistic concurrency)', () => {
    it('applies when baseRevision matches the current revision', async () => {
      const { token } = await createFigmaProject('{"v":1}');
      const res = await updateFigmaProject(token, '{"v":2}', 0);
      expect(res).toEqual({ kind: 'ok', revision: 1 });
    });

    it('reports conflict with the current snapshot when baseRevision is stale', async () => {
      const { token } = await createFigmaProject('{"v":1}');
      // Move the server to revision 1.
      await updateFigmaProject(token, '{"v":2}');
      // Now push against the stale base 0.
      const res = await updateFigmaProject(token, '{"v":3}', 0);
      expect(res).toEqual({ kind: 'conflict', current: { config: '{"v":2}', revision: 1 } });

      // The conflicting write must NOT have been applied.
      const snap = await getFigmaProject(token);
      expect(snap).toEqual({ config: '{"v":2}', revision: 1 });
    });

    it('returns not_found when the token no longer exists', async () => {
      const res = await updateFigmaProject('ghost', '{}', 3);
      expect(res).toEqual({ kind: 'not_found' });
    });
  });

  describe('purgeExpiredFigmaProjects', () => {
    it('returns 0 when nothing is expired', async () => {
      await createFigmaProject('{}');
      expect(await purgeExpiredFigmaProjects()).toBe(0);
    });

    it('deletes rows whose updated_at is older than the TTL', async () => {
      const { token: stale } = await createFigmaProject('{"old":true}');
      const { token: fresh } = await createFigmaProject('{"new":true}');

      // Back-date the stale row past the 90-day TTL.
      const past = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
      await mem.query('UPDATE figma_projects SET updated_at = $1 WHERE token = $2', [past, stale]);

      const deleted = await purgeExpiredFigmaProjects();
      expect(deleted).toBe(1);
      expect(await getFigmaProject(stale)).toBeNull();
      expect(await getFigmaProject(fresh)).not.toBeNull();
    });
  });
});
