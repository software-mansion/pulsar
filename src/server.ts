import express from 'express';
import http from 'http';
import { ChannelManager } from './channel-manager';
import { WebSocketHandlers } from './websocket-handlers';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { PORT } from './constants';

// ===== APPLICATION SETUP =====

const app = express();
const server = http.createServer(app);
const channelManager = new ChannelManager();
const wsHandlers = new WebSocketHandlers(channelManager);

// ===== INITIALIZE =====

setupMiddleware(app);
setupRoutes(app, channelManager);
setupWebSocket(server, wsHandlers);

// ===== SERVER STARTUP =====

server.listen(PORT, () => {
  logServerStartup();
});

function logServerStartup(): void {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  POST http://localhost:${PORT}/broadcast?channel=<number>&token=<token> - Send JSON data with valid token`);
  console.log(`  GET  http://localhost:${PORT}/health - Check server status`);
  console.log(`  GET  http://localhost:${PORT}/generate-channel?preferred=<number>&lastClientId=<id> - Get channel number and token`);
  console.log('');
  console.log('WebSocket usage:');
  console.log(`  Connect to data channel: ws://localhost:${PORT}?channel=<number>`);
  console.log(`  Connect to status updates (all channels): ws://localhost:${PORT}?status=true`);
  console.log(`  Connect to status updates (specific channel): ws://localhost:${PORT}?status=true&channel=<number>`);
  console.log('');
  console.log('Security:');
  console.log('  - Channel tokens are required for broadcasting');
  console.log('  - Generate channel numbers to receive tokens');
  console.log('  - Tokens are automatically cleaned up when channels become empty');
}
