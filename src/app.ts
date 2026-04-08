import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { corsMiddleware } from './middleware';
import { getRoutes } from './routes';
import { WebSocketHandler } from './websocket-handler';
import { ConnectionManager } from './connection-manager';

export function createApp() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server } as { server: http.Server });
  const connectionManager = new ConnectionManager();
  const wsHandler = new WebSocketHandler(wss, connectionManager);
  const routes = getRoutes(connectionManager);

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/', routes);

  return { app, server, wss, wsHandler };
}
