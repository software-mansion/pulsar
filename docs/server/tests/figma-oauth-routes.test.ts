import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';
import { useInMemoryFigmaDb, closeInMemoryFigmaDb, InMemoryFigmaDb } from './helpers/figmaDb';
import { ensureFigmaOAuthTables } from '../src/figma-oauth';

// End-to-end of the design-data OAuth flow, with global fetch mocked so no real
// Figma endpoint is hit: connect (login → callback → status) → map a file to the
// grant → read the design payload back via REST.
describe('Figma OAuth + design-data routes', () => {
  let app: import('express').Express;
  let mem: InMemoryFigmaDb;
  const realFetch = globalThis.fetch;

  // A file response shaped like Figma's REST API, with one bound element carrying
  // shared plugin data under the `pulsar` namespace.
  const fileResponse = {
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '0:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '1:1',
              name: 'Home',
              type: 'FRAME',
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
              children: [
                {
                  id: '1:2',
                  name: 'CTA',
                  type: 'INSTANCE',
                  absoluteBoundingBox: { x: 20, y: 700, width: 335, height: 48 },
                  sharedPluginData: {
                    pulsar: {
                      binding: JSON.stringify({
                        presetId: 'success',
                        presetName: 'Success',
                        isCustom: false,
                        preset: {
                          name: 'Success',
                          description: '',
                          tags: [],
                          duration: 1,
                          discretePattern: [],
                          continuousPattern: { amplitude: [], frequency: [] },
                        },
                      }),
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  beforeEach(async () => {
    mem = await useInMemoryFigmaDb();
    await ensureFigmaOAuthTables();
    app = createApp({ rateLimiter: { sweepIntervalMs: 0 } }).app;

    const okJson = (body: unknown) => ({
      ok: true,
      status: 200,
      json: async () => body,
      text: async () => JSON.stringify(body),
    });

    globalThis.fetch = jest.fn(async (input: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url === 'https://api.figma.com/v1/oauth/token') {
        return okJson({
          access_token: 'access-1',
          refresh_token: 'refresh-1',
          expires_in: 7776000,
          user_id: 'user-1',
        });
      }
      if (url === 'https://api.figma.com/v1/oauth/refresh') {
        return okJson({ access_token: 'access-2' });
      }
      if (url.startsWith('https://api.figma.com/v1/files/')) {
        return okJson(fileResponse);
      }
      throw new Error(`unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;
  });

  afterEach(async () => {
    globalThis.fetch = realFetch;
    await closeInMemoryFigmaDb();
  });

  it('login redirects to the Figma consent screen carrying the state', async () => {
    const res = await request(app).get('/figma-auth/login?state=abc');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('https://www.figma.com/oauth');
    expect(res.headers.location).toContain('state=abc');
    expect(res.headers.location).toContain('scope=file_content%3Aread');
  });

  it('login 400s without a state', async () => {
    const res = await request(app).get('/figma-auth/login');
    expect(res.status).toBe(400);
  });

  it('runs the full connect → map → read flow', async () => {
    // 1. Callback exchanges the code, stores the grant, marks the handshake done.
    const cb = await request(app).get('/figma-auth/callback?code=xyz&state=st-1');
    expect(cb.status).toBe(200);
    expect(cb.text).toContain('connected');

    // 2. The plugin polls and sees the connection.
    const status = await request(app).get('/figma-auth/status?state=st-1');
    expect(status.status).toBe(200);
    expect(status.body).toMatchObject({ connected: true, figmaUser: 'user-1' });

    // 3. The designer shares: map the file to the grant.
    const map = await request(app)
      .put('/figma-file-grant/FILEKEY')
      .send({ figmaUser: 'user-1' });
    expect(map.status).toBe(200);
    expect(map.body.success).toBe(true);

    // 4. The (anonymous) preview reads the design payload via REST.
    const design = await request(app).get('/figma-design/FILEKEY');
    expect(design.status).toBe(200);
    expect(design.body.success).toBe(true);
    expect(design.body.config.fileKey).toBe('FILEKEY');
    expect(design.body.config.elements).toHaveLength(1);
    expect(design.body.config.elements[0]).toMatchObject({
      id: '1:2',
      presetName: 'Success',
      frameId: '1:1',
    });
    expect(design.body.config.bindings['1:2']).toBeDefined();
  });

  it('status reports not-connected for an unknown state', async () => {
    const res = await request(app).get('/figma-auth/status?state=never');
    expect(res.body).toMatchObject({ connected: false, figmaUser: null });
  });

  it('design read 404s for a file that was never shared', async () => {
    const res = await request(app).get('/figma-design/UNKNOWN');
    expect(res.status).toBe(404);
  });

  it('file-grant 400s without a figmaUser', async () => {
    const res = await request(app).put('/figma-file-grant/FILEKEY').send({});
    expect(res.status).toBe(400);
  });
});
