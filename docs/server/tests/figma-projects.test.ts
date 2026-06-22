import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createFigmaProject,
  getFigmaProject,
  getFigmaProjectByPublicToken,
  updateFigmaProject,
  setFigmaProjectVisibility,
  purgeExpiredFigmaProjects,
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
      const { token, publicToken } = await createFigmaProject('{}');
      expect(await getFigmaProject(token)).toEqual({
        config: '{}',
        revision: 0,
        isPublic: true,
        publicToken,
      });
    });

    it('migration (ADD COLUMN IF NOT EXISTS) is safe to re-run', async () => {
      // The additive migration is what keeps already-deployed tables working
      // across restarts; re-running it must be a no-op. (We exercise the
      // migration statement directly: pg-mem can't model a second
      // CREATE TABLE IF NOT EXISTS over NOW() defaults, but real Postgres can.)
      await expect(
        mem.query(
          'ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS public_token TEXT',
        ),
      ).resolves.toBeDefined();
    });

    it('backfills public_token = token for pre-split (legacy) rows', async () => {
      // Simulate a row created before public_token existed: drop the column and
      // insert a row that only has the (then-dual-purpose) `token`.
      await mem.query('ALTER TABLE figma_projects DROP COLUMN public_token');
      await mem.query(
        "INSERT INTO figma_projects (token, config, revision, is_public) VALUES ('legacy-tok', '{\"v\":1}', 0, TRUE)",
      );

      // Re-apply the additive migration statements directly. (We can't call the
      // whole ensureFigmaProjectsTable again — pg-mem can't model its leading
      // CREATE TABLE IF NOT EXISTS over NOW() defaults a second time — so we
      // exercise the exact ADD COLUMN + backfill SQL it runs.)
      await mem.query('ALTER TABLE figma_projects ADD COLUMN IF NOT EXISTS public_token TEXT');
      await mem.query('UPDATE figma_projects SET public_token = token WHERE public_token IS NULL');

      const ownerSnap = await getFigmaProject('legacy-tok');
      expect(ownerSnap).toEqual({
        config: '{"v":1}',
        revision: 0,
        isPublic: true,
        publicToken: 'legacy-tok',
      });
      // The legacy token now works on the read path too (public_token = token),
      // so already-distributed share links keep resolving.
      const publicSnap = await getFigmaProjectByPublicToken('legacy-tok');
      expect(publicSnap).toEqual({
        config: '{"v":1}',
        revision: 0,
        isPublic: true,
        publicToken: 'legacy-tok',
      });
    });

    it('backfill does not clobber rows that already have a public_token', async () => {
      // A row created post-split has a distinct public_token; the backfill
      // UPDATE (… WHERE public_token IS NULL) must leave it untouched.
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      expect(publicToken).not.toBe(token);

      await mem.query('UPDATE figma_projects SET public_token = token WHERE public_token IS NULL');

      const snap = await getFigmaProject(token);
      expect(snap!.publicToken).toBe(publicToken);
    });
  });

  describe('createFigmaProject', () => {
    it('inserts a row and returns distinct edit + public tokens with revision 0', async () => {
      const { token, publicToken, revision } = await createFigmaProject('{"hello":"world"}');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(typeof publicToken).toBe('string');
      expect(publicToken.length).toBeGreaterThan(0);
      // The whole point: the read-only share token is NOT the secret edit token.
      expect(publicToken).not.toBe(token);
      expect(revision).toBe(0);

      const snap = await getFigmaProject(token);
      expect(snap).toEqual({
        config: '{"hello":"world"}',
        revision: 0,
        isPublic: true,
        publicToken,
      });
    });

    it('returns revision as a JS number, not a bigint string', async () => {
      const { token } = await createFigmaProject('{}');
      const snap = await getFigmaProject(token);
      expect(typeof snap!.revision).toBe('number');
    });
  });

  describe('getFigmaProject (by edit token)', () => {
    it('returns null for an unknown token', async () => {
      expect(await getFigmaProject('nope')).toBeNull();
    });

    it('does NOT resolve when given the public token (edit token only)', async () => {
      const { publicToken } = await createFigmaProject('{}');
      expect(await getFigmaProject(publicToken)).toBeNull();
    });
  });

  describe('getFigmaProjectByPublicToken (read path)', () => {
    it('resolves a project by its public token', async () => {
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      expect(await getFigmaProjectByPublicToken(publicToken)).toEqual({
        config: '{"v":1}',
        revision: 0,
        isPublic: true,
        publicToken,
      });
      // And it must NOT resolve when given the secret edit token.
      expect(await getFigmaProjectByPublicToken(token)).toBeNull();
    });

    it('returns null for an unknown public token', async () => {
      expect(await getFigmaProjectByPublicToken('nope')).toBeNull();
    });

    it('still returns the row when private (route layer enforces visibility)', async () => {
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      await setFigmaProjectVisibility(token, false);
      const snap = await getFigmaProjectByPublicToken(publicToken);
      expect(snap).toEqual({ config: '{"v":1}', revision: 0, isPublic: false, publicToken });
    });
  });

  describe('updateFigmaProject — unconditional', () => {
    it('bumps revision and replaces config', async () => {
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      const res = await updateFigmaProject(token, '{"v":2}');
      expect(res).toEqual({ kind: 'ok', revision: 1 });

      const snap = await getFigmaProject(token);
      expect(snap).toEqual({ config: '{"v":2}', revision: 1, isPublic: true, publicToken });
    });

    it('returns not_found for a missing token', async () => {
      const res = await updateFigmaProject('ghost', '{}');
      expect(res).toEqual({ kind: 'not_found' });
    });

    it('returns not_found when given the public token (writes need the edit token)', async () => {
      const { publicToken } = await createFigmaProject('{"v":1}');
      const res = await updateFigmaProject(publicToken, '{"v":2}');
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
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      // Move the server to revision 1.
      await updateFigmaProject(token, '{"v":2}');
      // Now push against the stale base 0.
      const res = await updateFigmaProject(token, '{"v":3}', 0);
      expect(res).toEqual({
        kind: 'conflict',
        current: { config: '{"v":2}', revision: 1, isPublic: true, publicToken },
      });

      // The conflicting write must NOT have been applied.
      const snap = await getFigmaProject(token);
      expect(snap).toEqual({ config: '{"v":2}', revision: 1, isPublic: true, publicToken });
    });

    it('returns not_found when the token no longer exists', async () => {
      const res = await updateFigmaProject('ghost', '{}', 3);
      expect(res).toEqual({ kind: 'not_found' });
    });
  });

  describe('setFigmaProjectVisibility', () => {
    it('new projects are public by default', async () => {
      const { token } = await createFigmaProject('{}');
      const snap = await getFigmaProject(token);
      expect(snap!.isPublic).toBe(true);
    });

    it('flips a project to private and back without touching the revision', async () => {
      const { token, publicToken } = await createFigmaProject('{"v":1}');
      // Move the revision off 0 so we can prove a visibility toggle leaves it.
      await updateFigmaProject(token, '{"v":2}');

      const off = await setFigmaProjectVisibility(token, false);
      expect(off).toEqual({ kind: 'ok', isPublic: false });
      const priv = await getFigmaProject(token);
      expect(priv).toEqual({ config: '{"v":2}', revision: 1, isPublic: false, publicToken });

      const on = await setFigmaProjectVisibility(token, true);
      expect(on).toEqual({ kind: 'ok', isPublic: true });
      const pub = await getFigmaProject(token);
      expect(pub).toEqual({ config: '{"v":2}', revision: 1, isPublic: true, publicToken });
    });

    it('returns not_found for a missing token', async () => {
      expect(await setFigmaProjectVisibility('ghost', false)).toEqual({ kind: 'not_found' });
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
