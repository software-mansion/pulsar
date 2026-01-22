import { Request, Response, Express } from 'express';
import { ChannelManager } from './channel-manager';
import { ChannelGenerationResult } from './types';
import { DEFAULT_CHANNEL } from './constants';

export function setupRoutes(app: Express, channelManager: ChannelManager): void {
  app.post('/broadcast', (req: Request, res: Response) =>
    handleBroadcast(req, res, channelManager)
  );

  app.get('/health', (req: Request, res: Response) =>
    handleHealth(req, res, channelManager)
  );

  app.get('/generate-channel', (req: Request, res: Response) =>
    handleGenerateChannel(req, res, channelManager)
  );
}

// ===== BROADCAST ENDPOINT =====

function handleBroadcast(req: Request, res: Response, channelManager: ChannelManager): void {
  try {
    const { channel, token } = extractBroadcastParams(req);

    if (!isValidChannel(channel)) {
      res.status(400).json({
        success: false,
        error: 'Invalid channel number. Channel must be a non-negative integer.'
      });
      return;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required. Please provide a valid token for this channel.',
        channel
      });
      return;
    }

    if (!channelManager.validateChannelToken(channel, token)) {
      res.status(403).json({
        success: false,
        error: 'Invalid or expired token for this channel. Please generate a new channel number.',
        channel
      });
      return;
    }

    const broadcastData = {
      ...req.body,
      timestamp: new Date(),
      source: 'http-endpoint'
    };

    const sentCount = channelManager.broadcastToChannel(channel, broadcastData);

    res.json({
      success: true,
      message: `Data broadcasted successfully to channel ${channel}`,
      channel,
      clientCount: sentCount,
      data: broadcastData
    });
  } catch (error) {
    console.error('Error broadcasting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast data'
    });
  }
}

function extractBroadcastParams(req: Request): { channel: number; token: string } {
  const channelParam = req.query.channel;
  const tokenParam = req.query.token;

  const channel = channelParam !== undefined ? parseInt(String(channelParam), 10) : DEFAULT_CHANNEL;
  const token = String(tokenParam || '');

  return { channel, token };
}

function isValidChannel(channel: number): boolean {
  return !isNaN(channel) && channel >= 0;
}

// ===== HEALTH ENDPOINT =====

function handleHealth(req: Request, res: Response, channelManager: ChannelManager): void {
  res.json({
    status: 'healthy',
    ...channelManager.getHealthStats(),
    timestamp: new Date()
  });
}

// ===== GENERATE CHANNEL ENDPOINT =====

function handleGenerateChannel(req: Request, res: Response, channelManager: ChannelManager): void {
  try {
    const { preferred, lastClientId } = extractGenerateChannelParams(req);

    if (req.query.preferred && preferred === null) {
      res.status(400).json({
        success: false,
        error: 'Invalid preferred channel number. Must be a positive integer.',
        timestamp: new Date()
      });
      return;
    }

    const result = channelManager.generateChannelNumber(preferred, lastClientId);

    if (!result) {
      res.status(503).json({
        success: false,
        error: 'All channel numbers up to 8 digits are currently in use',
        timestamp: new Date()
      });
      return;
    }

    const message = generateChannelMessage(result, preferred);

    res.json({
      success: true,
      channel: result.channel,
      token: result.token,
      digits: result.digits,
      preferred: result.preferred,
      reconnect: result.reconnect || false,
      requestedPreferred: preferred,
      lastClientId,
      message,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error generating channel number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate channel number',
      timestamp: new Date()
    });
  }
}

function extractGenerateChannelParams(req: Request): { preferred: number | null; lastClientId: string | null } {
  const preferredParam = req.query.preferred ? String(req.query.preferred) : null;
  const lastClientIdParam = req.query.lastClientId ? String(req.query.lastClientId) : null;

  const preferred = preferredParam && !isNaN(Number(preferredParam)) && parseInt(preferredParam, 10) > 0
    ? parseInt(preferredParam, 10)
    : null;

  const lastClientId = lastClientIdParam && lastClientIdParam.trim().length > 0
    ? lastClientIdParam.trim()
    : null;

  return { preferred, lastClientId };
}

function generateChannelMessage(result: ChannelGenerationResult, preferred: number | null): string {
  if (result.reconnect) {
    return `Client is still connected to preferred channel ${result.channel}, maintaining connection`;
  }
  if (result.preferred) {
    return `Preferred channel number ${result.channel} is available`;
  }
  if (preferred) {
    return `Preferred channel ${preferred} was taken, generated alternative ${result.digits}-digit channel number: ${result.channel}`;
  }
  return `Generated unused ${result.digits}-digit channel number: ${result.channel}`;
}
