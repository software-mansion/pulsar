import { Router, Request, Response } from 'express';
import { ConnectionManager } from './connection-manager';

interface BroadcastBody {
  message: string;
  token: string;
}

export function getRoutes(connectionManager: ConnectionManager): Router {
  const router = Router();

  router.get('/create-channel', (_: Request, res: Response) => {
    const code = connectionManager.getParingCode();
    if (code === '-1') {
      return res.status(500).json({
        success: false,
        error: 'Unable to generate unique channel code'
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
        error: 'Message is required'
      });
    }
    let returnMessage = connectionManager.broadcastChannel(message, token);
    res.json({
      message: returnMessage,
    });
  });

  return router;
}
