import { Router, Request, Response } from 'express';
import { ConnectionManager } from './connection-manager';
import { createFigmaProject, getFigmaProject, updateFigmaProject } from './figma-projects';
import { isFigmaOAuthConfigured } from './config';
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  upsertGrant,
  markPendingComplete,
  readPending,
  mapFileToUser,
  getAccessTokenForFile,
} from './figma-oauth';
import { fetchPreviewPayload } from './figma-design';

interface BroadcastBody {
  message: string;
  token: string;
}

interface FigmaProjectBody {
  // Free-form config, stored as a JSON string.
  config: unknown;
  // Optimistic-concurrency base: the client's last-synced revision. When set,
  // the update applies only if the server is still at it (else 409).
  baseRevision?: number | null;
}

export function getRoutes(connectionManager: ConnectionManager): Router {
  const router = Router();

  router.get('/create-channel', (_: Request, res: Response) => {
    const code = connectionManager.getParingCode();
    if (code === '-1') {
      return res.status(500).json({
        success: false,
        error: 'Unable to generate unique channel code',
      });
    }
    res.json({
      success: true,
      code,
    });
  });

  router.post('/broadcast', (req: Request<{}, {}, BroadcastBody>, res: Response) => {
    const { message, token } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }
    let returnMessage = connectionManager.broadcastChannel(message, token);
    res.json({
      message: returnMessage,
    });
  });

  // Create a project row; returns its token + revision.
  router.post(
    '/figma-project',
    async (req: Request<{}, {}, FigmaProjectBody>, res: Response) => {
      const { config } = req.body ?? {};
      if (config === undefined || config === null) {
        return res.status(400).json({ success: false, error: 'config is required' });
      }
      const serialized = typeof config === 'string' ? config : JSON.stringify(config);
      try {
        const { token, revision } = await createFigmaProject(serialized);
        res.json({ success: true, token, revision });
      } catch (err) {
        console.error('createFigmaProject failed:', err);
        res.status(500).json({ success: false, error: 'Failed to create figma project' });
      }
    },
  );

  // Update a project's config, optionally conditional on baseRevision.
  router.put(
    '/figma-project/:token',
    async (req: Request<{ token: string }, {}, FigmaProjectBody>, res: Response) => {
      const { token } = req.params;
      const { config, baseRevision } = req.body ?? {};
      if (config === undefined || config === null) {
        return res.status(400).json({ success: false, error: 'config is required' });
      }
      // baseRevision is optional, but if present it must be a real number — it
      // goes into a numeric SQL comparison, so reject junk up front rather than
      // letting it reach the driver as a silent conflict-detection failure.
      if (
        baseRevision !== undefined &&
        baseRevision !== null &&
        !Number.isFinite(baseRevision)
      ) {
        return res
          .status(400)
          .json({ success: false, error: 'baseRevision must be a number or null' });
      }
      const serialized = typeof config === 'string' ? config : JSON.stringify(config);
      try {
        const result = await updateFigmaProject(token, serialized, baseRevision);
        if (result.kind === 'ok') {
          return res.json({ success: true, revision: result.revision });
        }
        if (result.kind === 'not_found') {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }
        // Conflict: hand back the current snapshot so the client can reconcile.
        let current: unknown = result.current.config;
        try {
          current = JSON.parse(result.current.config);
        } catch {
          // not JSON — return the raw string
        }
        return res.status(409).json({
          success: false,
          error: 'conflict',
          config: current,
          revision: result.current.revision,
        });
      } catch (err) {
        console.error('updateFigmaProject failed:', err);
        res.status(500).json({ success: false, error: 'Failed to update figma project' });
      }
    },
  );

  // Fetch a project's config + revision by token.
  router.get('/figma-project/:token', async (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    try {
      const snapshot = await getFigmaProject(token);
      if (snapshot === null) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      let parsed: unknown = snapshot.config;
      try {
        parsed = JSON.parse(snapshot.config);
      } catch {
        // not JSON — return the raw string
      }
      res.json({ success: true, config: parsed, revision: snapshot.revision });
    } catch (err) {
      console.error('getFigmaProject failed:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch figma project' });
    }
  });

  // --- Figma OAuth: read haptics straight from the design file --------------
  // The designer authenticates once; the backend keeps their refresh token; the
  // preview reads the file with it so viewers stay anonymous. See figma-oauth.ts.

  // Reject the whole OAuth surface cleanly when env isn't configured, so a
  // partial deploy returns 503 instead of throwing on a missing client secret.
  function requireOAuth(res: Response): boolean {
    if (isFigmaOAuthConfigured()) return true;
    res.status(503).json({ success: false, error: 'Figma OAuth is not configured' });
    return false;
  }

  // Step 1: the plugin opens this in a browser. We bounce to Figma's consent
  // screen, carrying the plugin-generated `state` so the callback + poll match.
  router.get('/figma-auth/login', (req: Request, res: Response) => {
    if (!requireOAuth(res)) return;
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!state) {
      res.status(400).send('Missing state');
      return;
    }
    res.redirect(buildAuthorizeUrl(state));
  });

  // Step 2: Figma redirects here after the designer clicks Allow. Exchange the
  // (30s-lived) code for tokens, store the grant, and mark the handshake done.
  router.get('/figma-auth/callback', async (req: Request, res: Response) => {
    if (!requireOAuth(res)) return;
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) {
      res.status(400).send('Missing code or state');
      return;
    }
    try {
      const tokens = await exchangeCodeForTokens(code);
      const figmaUser = tokens.user_id;
      if (!figmaUser) throw new Error('Figma token response had no user_id');
      await upsertGrant(figmaUser, tokens.refresh_token);
      await markPendingComplete(state, figmaUser);
      res
        .status(200)
        .send(
          '<!doctype html><meta charset="utf-8"><title>Connected</title>' +
            '<body style="font-family:sans-serif;padding:2rem;text-align:center">' +
            '<h2>Figma connected ✓</h2><p>You can close this tab and return to the plugin.</p></body>',
        );
    } catch (err) {
      console.error('figma-auth callback failed:', err);
      res.status(502).send('Figma authentication failed. Close this tab and try again.');
    }
  });

  // Step 3: the plugin polls this until the callback lands. Returns only a
  // boolean + the connected user id — never the tokens.
  router.get('/figma-auth/status', async (req: Request, res: Response) => {
    if (!requireOAuth(res)) return;
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!state) {
      res.status(400).json({ success: false, error: 'Missing state' });
      return;
    }
    try {
      const figmaUser = await readPending(state);
      res.json({ success: true, connected: figmaUser !== null, figmaUser });
    } catch (err) {
      console.error('figma-auth status failed:', err);
      res.status(500).json({ success: false, error: 'Failed to read auth status' });
    }
  });

  // Step 4: when the designer shares a file, record which grant can read it so
  // the anonymous preview can later be resolved by fileKey alone.
  router.put(
    '/figma-file-grant/:fileKey',
    async (req: Request<{ fileKey: string }, {}, { figmaUser?: string }>, res: Response) => {
      if (!requireOAuth(res)) return;
      const { fileKey } = req.params;
      const figmaUser = req.body?.figmaUser;
      if (!figmaUser) {
        res.status(400).json({ success: false, error: 'figmaUser is required' });
        return;
      }
      try {
        await mapFileToUser(fileKey, figmaUser);
        res.json({ success: true });
      } catch (err) {
        console.error('figma-file-grant failed:', err);
        res.status(500).json({ success: false, error: 'Failed to map file to grant' });
      }
    },
  );

  // Step 5: the preview calls this with just a fileKey. We read the live file
  // with the owning grant's token and rebuild the preview payload from the
  // haptics stored in the design. Shape matches GET /figma-project/:token so
  // the preview's loader is identical.
  router.get('/figma-design/:fileKey', async (req: Request<{ fileKey: string }>, res: Response) => {
    if (!requireOAuth(res)) return;
    const { fileKey } = req.params;
    try {
      const accessToken = await getAccessTokenForFile(fileKey);
      if (!accessToken) {
        return res.status(404).json({ success: false, error: 'File not shared or grant missing' });
      }
      const payload = await fetchPreviewPayload(fileKey, accessToken);
      if (!payload) {
        return res.status(502).json({ success: false, error: 'Could not read file from Figma' });
      }
      res.json({ success: true, config: payload });
    } catch (err) {
      console.error('figma-design read failed:', err);
      res.status(500).json({ success: false, error: 'Failed to read figma design' });
    }
  });

  return router;
}
