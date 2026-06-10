import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { corsMiddleware } from './middleware';
import { getRoutes } from './routes';
import { WebSocketHandler } from './websocket-handler';
import { ConnectionManager } from './connection-manager';
import { RateLimiterOptions } from './rate-limiter';

export interface CreateAppOptions {
  // Override pairing brute-force limiter tunables (used by tests).
  rateLimiter?: RateLimiterOptions;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server } as { server: http.Server });
  const connectionManager = new ConnectionManager();
  const wsHandler = new WebSocketHandler(wss, connectionManager, options.rateLimiter);
  const routes = getRoutes(connectionManager);

  app.use(corsMiddleware);
  // Preview payloads (full figma-project config) can exceed express's default
  // 100kb body limit; raise it to a bounded ceiling rather than reject with 413.
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use('/', routes);

  return { app, server, wss, wsHandler };
}
