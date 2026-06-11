import { Router, Request, Response } from 'express';
import { ConnectionManager } from './connection-manager';
import {
  createFigmaProject,
  getFigmaProject,
  setFigmaProjectVisibility,
  updateFigmaProject,
} from './figma-projects';

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

interface FigmaVisibilityBody {
  // true → anyone with the link can view; false → the link is revoked and GET
  // refuses to serve the config.
  isPublic: boolean;
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

  // Toggle a project's share-link visibility. Separate from PUT (config sync) so
  // a background autosync can never accidentally re-expose a link the owner made
  // private — only this explicit call changes who can view.
  router.patch(
    '/figma-project/:token/visibility',
    async (req: Request<{ token: string }, {}, FigmaVisibilityBody>, res: Response) => {
      const { token } = req.params;
      const { isPublic } = req.body ?? {};
      if (typeof isPublic !== 'boolean') {
        return res
          .status(400)
          .json({ success: false, error: 'isPublic must be a boolean' });
      }
      try {
        const result = await setFigmaProjectVisibility(token, isPublic);
        if (result.kind === 'not_found') {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }
        return res.json({ success: true, isPublic: result.isPublic });
      } catch (err) {
        console.error('setFigmaProjectVisibility failed:', err);
        res
          .status(500)
          .json({ success: false, error: 'Failed to update figma project visibility' });
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
      // Private link: the row exists but the owner revoked access. Refuse to
      // serve the config to anyone holding the token (403, distinct from the
      // 404 "no such project" so the preview can show a tailored message).
      if (!snapshot.isPublic) {
        return res.status(403).json({ success: false, error: 'private' });
      }
      let parsed: unknown = snapshot.config;
      try {
        parsed = JSON.parse(snapshot.config);
      } catch {
        // not JSON — return the raw string
      }
      res.json({ success: true, config: parsed, revision: snapshot.revision, isPublic: true });
    } catch (err) {
      console.error('getFigmaProject failed:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch figma project' });
    }
  });

  return router;
}
