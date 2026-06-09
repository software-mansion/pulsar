import { Router, Request, Response } from 'express';
import { ConnectionManager } from './connection-manager';
import { createFigmaProject, getFigmaProject, updateFigmaProject } from './figma-projects';

interface BroadcastBody {
  message: string;
  token: string;
}

interface FigmaProjectBody {
  // Free-form configuration object the plugin wants to persist. We store it as
  // a JSON string so the schema stays stable as the plugin payload evolves.
  config: unknown;
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
      code: connectionManager.getParingCode(),
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

  // Create a Figma project record and return a token identifying it. The
  // plugin POSTs its current payload here right before sharing a preview link.
  router.post(
    '/figma-project',
    async (req: Request<{}, {}, FigmaProjectBody>, res: Response) => {
      const { config } = req.body ?? {};
      if (config === undefined || config === null) {
        return res.status(400).json({ success: false, error: 'config is required' });
      }
      const serialized = typeof config === 'string' ? config : JSON.stringify(config);
      try {
        const token = await createFigmaProject(serialized);
        res.json({ success: true, token });
      } catch (err) {
        console.error('createFigmaProject failed:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to create figma project',
          detail: (err as Error)?.message,
        });
      }
    },
  );

  // Update an existing project's config. Lets the plugin reuse a token across
  // shares without spamming new rows.
  router.put(
    '/figma-project/:token',
    async (req: Request<{ token: string }, {}, FigmaProjectBody>, res: Response) => {
      const { token } = req.params;
      const { config } = req.body ?? {};
      if (config === undefined || config === null) {
        return res.status(400).json({ success: false, error: 'config is required' });
      }
      const serialized = typeof config === 'string' ? config : JSON.stringify(config);
      try {
        const ok = await updateFigmaProject(token, serialized);
        if (!ok) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }
        res.json({ success: true });
      } catch (err) {
        console.error('updateFigmaProject failed:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to update figma project',
          detail: (err as Error)?.message,
        });
      }
    },
  );

  // Fetch a project's stored configuration by token. Returns the raw object the
  // plugin originally stored (parsed back from the stored JSON string).
  router.get('/figma-project/:token', async (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    try {
      const config = await getFigmaProject(token);
      if (config === null) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      let parsed: unknown = config;
      try {
        parsed = JSON.parse(config);
      } catch {
        // Stored value wasn't JSON — fall back to the raw string.
      }
      res.json({ success: true, config: parsed });
    } catch (err) {
      console.error('getFigmaProject failed:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch figma project',
        detail: (err as Error)?.message,
      });
    }
  });

  return router;
}
