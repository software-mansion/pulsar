import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';
import { useInMemoryFigmaDb, closeInMemoryFigmaDb, InMemoryFigmaDb } from './helpers/figmaDb';

// HTTP contract tests. The figma-project routes run through the real handlers
// backed by an in-memory pg-mem pool (injected via the helper), so create /
// update / get / conflict paths are exercised against a real query engine.
describe('HTTP routes', () => {
  let app: import('express').Express;
  let mem: InMemoryFigmaDb;

  beforeEach(async () => {
    mem = await useInMemoryFigmaDb();
    app = createApp({ rateLimiter: { sweepIntervalMs: 0 } }).app;
  });

  afterEach(async () => {
    await closeInMemoryFigmaDb();
  });

  describe('GET /create-channel', () => {
    it('returns a 4-digit pairing code', async () => {
      const res = await request(app).get('/create-channel');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toMatch(/^\d{4}$/);
    });
  });

  describe('POST /broadcast', () => {
    it('returns 400 when message is missing', async () => {
      const res = await request(app).post('/broadcast').send({ token: 'x' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: 'Message is required' });
    });

    it('reports no active connection for an unknown token (still 200)', async () => {
      const res = await request(app).post('/broadcast').send({ message: 'hi', token: 'nope' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Invalid token or no active connection found');
    });
  });

  describe('POST /figma-project', () => {
    it('returns 400 when config is missing', async () => {
      const res = await request(app).post('/figma-project').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: 'config is required' });
    });

    it('creates a project and returns token + revision 0', async () => {
      const res = await request(app)
        .post('/figma-project')
        .send({ config: { hello: 'world' } });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.revision).toBe(0);
    });

    it('round-trips an object config back through GET (parsed)', async () => {
      const config = { a: 1, nested: { b: [2, 3] } };
      const created = await request(app).post('/figma-project').send({ config });
      const token = created.body.token;

      const got = await request(app).get(`/figma-project/${token}`);
      expect(got.status).toBe(200);
      expect(got.body).toEqual({ success: true, config, revision: 0, isPublic: true });
    });

    it('stores a non-JSON string config and returns it raw on GET', async () => {
      const created = await request(app).post('/figma-project').send({ config: 'plain text' });
      const got = await request(app).get(`/figma-project/${created.body.token}`);
      expect(got.body.config).toBe('plain text');
    });
  });

  describe('GET /figma-project/:token', () => {
    it('returns 404 for an unknown token', async () => {
      const res = await request(app).get('/figma-project/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Project not found' });
    });
  });

  describe('PUT /figma-project/:token', () => {
    async function create(config: unknown) {
      const res = await request(app).post('/figma-project').send({ config });
      return res.body.token as string;
    }

    it('unconditional update bumps the revision', async () => {
      const token = await create({ v: 1 });
      const res = await request(app).put(`/figma-project/${token}`).send({ config: { v: 2 } });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, revision: 1 });
    });

    it('conditional update succeeds when baseRevision matches', async () => {
      const token = await create({ v: 1 });
      const res = await request(app)
        .put(`/figma-project/${token}`)
        .send({ config: { v: 2 }, baseRevision: 0 });
      expect(res.status).toBe(200);
      expect(res.body.revision).toBe(1);
    });

    it('returns 409 with the current snapshot on a stale baseRevision', async () => {
      const token = await create({ v: 1 });
      await request(app).put(`/figma-project/${token}`).send({ config: { v: 2 } }); // -> rev 1
      const res = await request(app)
        .put(`/figma-project/${token}`)
        .send({ config: { v: 3 }, baseRevision: 0 });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        error: 'conflict',
        config: { v: 2 },
        revision: 1,
      });
    });

    it('returns 404 when the token does not exist', async () => {
      const res = await request(app).put('/figma-project/ghost').send({ config: { v: 1 } });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Project not found' });
    });

    it('returns 400 when config is missing', async () => {
      const token = await create({ v: 1 });
      const res = await request(app).put(`/figma-project/${token}`).send({ baseRevision: 0 });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: 'config is required' });
    });

    it('returns 400 for a non-numeric baseRevision', async () => {
      const token = await create({ v: 1 });
      // NaN/Infinity can't be used here — JSON.stringify turns them into null,
      // which is the valid "unconditional" case. A string or object survives the
      // wire as a non-number and must be rejected.
      for (const bad of ['abc', { nope: true }]) {
        const res = await request(app)
          .put(`/figma-project/${token}`)
          .send({ config: { v: 2 }, baseRevision: bad });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('baseRevision must be a number or null');
      }
    });

    it('treats null baseRevision as an unconditional update (no 400)', async () => {
      const token = await create({ v: 1 });
      const res = await request(app)
        .put(`/figma-project/${token}`)
        .send({ config: { v: 2 }, baseRevision: null });
      expect(res.status).toBe(200);
      expect(res.body.revision).toBe(1);
    });
  });

  describe('PATCH /figma-project/:token/visibility', () => {
    async function create(config: unknown) {
      const res = await request(app).post('/figma-project').send({ config });
      return res.body.token as string;
    }

    it('makes a project private, then GET returns 403 instead of the config', async () => {
      const token = await create({ v: 1 });

      const patched = await request(app)
        .patch(`/figma-project/${token}/visibility`)
        .send({ isPublic: false });
      expect(patched.status).toBe(200);
      expect(patched.body).toEqual({ success: true, isPublic: false });

      const got = await request(app).get(`/figma-project/${token}`);
      expect(got.status).toBe(403);
      expect(got.body).toEqual({ success: false, error: 'private' });
    });

    it('re-publishing a private project restores GET access', async () => {
      const token = await create({ v: 1 });
      await request(app).patch(`/figma-project/${token}/visibility`).send({ isPublic: false });

      const patched = await request(app)
        .patch(`/figma-project/${token}/visibility`)
        .send({ isPublic: true });
      expect(patched.body).toEqual({ success: true, isPublic: true });

      const got = await request(app).get(`/figma-project/${token}`);
      expect(got.status).toBe(200);
      expect(got.body).toEqual({ success: true, config: { v: 1 }, revision: 0, isPublic: true });
    });

    it('owners can still PUT config to a private project (sync keeps working)', async () => {
      const token = await create({ v: 1 });
      await request(app).patch(`/figma-project/${token}/visibility`).send({ isPublic: false });

      const put = await request(app).put(`/figma-project/${token}`).send({ config: { v: 2 } });
      expect(put.status).toBe(200);
      // Still private after a config sync — only the explicit PATCH re-exposes it.
      const got = await request(app).get(`/figma-project/${token}`);
      expect(got.status).toBe(403);
    });

    it('returns 400 when isPublic is missing or not a boolean', async () => {
      const token = await create({ v: 1 });
      for (const bad of [undefined, 'true', 1, null]) {
        const res = await request(app)
          .patch(`/figma-project/${token}/visibility`)
          .send({ isPublic: bad });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('isPublic must be a boolean');
      }
    });

    it('returns 404 for an unknown token', async () => {
      const res = await request(app)
        .patch('/figma-project/ghost/visibility')
        .send({ isPublic: false });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Project not found' });
    });
  });

  describe('server errors', () => {
    // Drop the table so the next query throws, exercising the 500 catch paths.
    async function breakSchema() {
      await mem.query('DROP TABLE figma_projects');
    }

    it('POST returns a generic 500 (no error detail leaked) when the query fails', async () => {
      await breakSchema();
      const res = await request(app).post('/figma-project').send({ config: { a: 1 } });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to create figma project' });
      expect(res.body).not.toHaveProperty('detail');
    });

    it('GET returns a generic 500 (no error detail leaked) when the query fails', async () => {
      await breakSchema();
      const res = await request(app).get('/figma-project/anything');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to fetch figma project' });
      expect(res.body).not.toHaveProperty('detail');
    });

    it('PUT returns a generic 500 (no error detail leaked) when the query fails', async () => {
      await breakSchema();
      const res = await request(app).put('/figma-project/anything').send({ config: { a: 1 } });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to update figma project' });
      expect(res.body).not.toHaveProperty('detail');
    });

    it('PATCH visibility returns a generic 500 when the query fails', async () => {
      await breakSchema();
      const res = await request(app)
        .patch('/figma-project/anything/visibility')
        .send({ isPublic: false });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        error: 'Failed to update figma project visibility',
      });
      expect(res.body).not.toHaveProperty('detail');
    });
  });

  describe('CORS', () => {
    it('short-circuits an OPTIONS preflight with 200 + CORS headers', async () => {
      const res = await request(app).options('/figma-project/x');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('*');
      expect(res.headers['access-control-allow-methods']).toContain('PUT');
    });

    it('sets the allow-origin header on normal responses', async () => {
      const res = await request(app).get('/create-channel');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });
});
