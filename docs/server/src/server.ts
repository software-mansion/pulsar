import WebSocket from 'ws';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';

// ===== CONSTANTS =====
const PORT = process.env.PORT || 8080;
const DEFAULT_CHANNEL = 0;
const MIN_CHANNEL_DIGITS = 4;
const MAX_CHANNEL_DIGITS = 8;
const TOKEN_GENERATION_ATTEMPTS = 100;
const WEBSOCKET_OPEN_STATE = 1;

// ===== INTERFACES =====
interface ClientMetadata {
  id: string;
  channel: number;
  joinTime: Date;
}

interface ExtendedWebSocket extends WebSocket {
  channel?: number;
  clientId?: string;
}

interface ChannelInfo {
  clientCount: number;
  clients: Array<{ id: string; joinTime?: Date }>;
}

interface ChannelActivity {
  [channelId: number]: ChannelInfo;
}

interface ChannelGenerationResult {
  channel: number;
  token: string;
  digits: number;
  preferred: boolean;
  reconnect: boolean;
}

// ===== CHANNEL MANAGER =====
class ChannelManager {
  private channels: Map<number, Set<ExtendedWebSocket>>;
  private clientMetadata: Map<ExtendedWebSocket, ClientMetadata>;
  private statusClients: Set<ExtendedWebSocket>;
  private statusClientChannels: Map<ExtendedWebSocket, number>;
  private channelTokens: Map<number, string>;

  constructor() {
    this.channels = new Map();
    this.clientMetadata = new Map();
    this.statusClients = new Set();
    this.statusClientChannels = new Map();
    this.channelTokens = new Map();
  }

  // ===== TOKEN GENERATION & VALIDATION =====

  private generateChannelToken(): string {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `token_${timestamp}_${random1}${random2}`;
  }

  validateChannelToken(channel: number, token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    const storedToken = this.channelTokens.get(channel);
    return storedToken === token;
  }

  private storeChannelToken(channel: number, token: string): void {
    this.channelTokens.set(channel, token);
    console.log(`Token stored for channel ${channel}`);
  }

  private removeChannelToken(channel: number): void {
    if (this.channelTokens.has(channel)) {
      this.channelTokens.delete(channel);
      console.log(`Token removed for channel ${channel}`);
    }
  }

  // ===== CLIENT ID GENERATION =====

  private generateClientId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `client_${timestamp}_${random}`;
  }

  // ===== CLIENT MANAGEMENT =====

  addClient(ws: ExtendedWebSocket, channel: number): { clientId: string; metadata: ClientMetadata } {
    const clientId = this.generateClientId();
    const metadata: ClientMetadata = {
      id: clientId,
      channel,
      joinTime: new Date()
    };

    console.log(`Adding client ${clientId} to channel ${channel}`);

    this.clientMetadata.set(ws, metadata);
    ws.channel = channel;
    ws.clientId = clientId;

    this.addClientToChannel(channel, ws);

    this.notifyStatusClients({
      type: 'client_joined',
      channel,
      clientId,
      timestamp: new Date(),
      channelActivity: this.getChannelActivity()
    });

    return { clientId, metadata };
  }

  removeClient(ws: ExtendedWebSocket, reason: string = 'disconnected'): void {
    const metadata = this.clientMetadata.get(ws);
    if (!metadata) {
      console.log(`Attempted to remove client with no metadata (reason: ${reason})`);
      return;
    }

    const { channel, id: clientId } = metadata;
    this.removeClientFromChannel(channel, ws);

    this.notifyStatusClients({
      type: reason === 'error' ? 'client_error' : 'client_left',
      channel,
      clientId,
      error: reason === 'error' ? 'WebSocket error' : undefined,
      timestamp: new Date(),
      channelActivity: this.getChannelActivity()
    });

    this.clientMetadata.delete(ws);
    console.log(`Client ${clientId} metadata removed`);
  }

  private addClientToChannel(channel: number, ws: ExtendedWebSocket): void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
      console.log(`Created new channel ${channel}`);
    }
    this.channels.get(channel)!.add(ws);
    console.log(`Channel ${channel} now has ${this.channels.get(channel)!.size} clients`);
  }

  private removeClientFromChannel(channel: number, ws: ExtendedWebSocket): void {
    const channelClients = this.channels.get(channel);
    if (!channelClients) {
      console.log(`Channel ${channel} not found when removing client`);
      return;
    }

    const wasInChannel = channelClients.has(ws);
    channelClients.delete(ws);
    console.log(`Client was ${wasInChannel ? 'found' : 'NOT found'} in channel ${channel}`);

    if (channelClients.size === 0) {
      this.channels.delete(channel);
      this.removeChannelToken(channel);
      console.log(`Channel ${channel} deleted (empty)`);
    } else {
      console.log(`Channel ${channel} still has ${channelClients.size} clients`);
    }
  }

  // ===== BROADCASTING =====

  broadcastToChannel(channel: number, message: any): number {
    const channelClients = this.channels.get(channel);
    if (!channelClients) {
      console.log(`No clients found in channel ${channel}`);
      return 0;
    }

    const messageStr = JSON.stringify(message);
    console.log(`Broadcasting to channel ${channel}, ${channelClients.size} potential recipients`);

    const sentCount = this.sendToActiveClients(channelClients, messageStr);
    this.cleanupEmptyChannel(channel);

    console.log(`Successfully sent to ${sentCount} clients in channel ${channel}`);
    return sentCount;
  }

  private sendToActiveClients(clients: Set<ExtendedWebSocket>, message: string): number {
    let sentCount = 0;
    const deadClients: ExtendedWebSocket[] = [];

    clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      } else {
        deadClients.push(client);
      }
    });

    deadClients.forEach((client) => clients.delete(client));
    return sentCount;
  }

  private cleanupEmptyChannel(channel: number): void {
    const clients = this.channels.get(channel);
    if (clients && clients.size === 0) {
      this.channels.delete(channel);
      this.removeChannelToken(channel);
      console.log(`Channel ${channel} deleted after cleanup`);
    }
  }

  // ===== STATUS & MONITORING =====

  getChannelActivity(): ChannelActivity {
    const activity: ChannelActivity = {};
    this.channels.forEach((clients: Set<ExtendedWebSocket>, channelId: number) => {
      const activeClients = this.getActiveClients(clients);
      activity[channelId] = {
        clientCount: activeClients.length,
        clients: activeClients.map((ws: ExtendedWebSocket) => ({
          id: this.clientMetadata.get(ws)?.id || 'unknown',
          joinTime: this.clientMetadata.get(ws)?.joinTime
        }))
      };
    });
    return activity;
  }

  private getActiveClients(clients: Set<ExtendedWebSocket>): ExtendedWebSocket[] {
    return Array.from(clients).filter((client) => client.readyState === WebSocket.OPEN);
  }

  getHealthStats() {
    let totalClients = 0;
    const channelStats: { [key: number]: number } = {};

    this.channels.forEach((clients: Set<ExtendedWebSocket>, channelId: number) => {
      const activeCount = this.getActiveClients(clients).length;
      channelStats[channelId] = activeCount;
      totalClients += activeCount;
    });

    return {
      totalConnectedClients: totalClients,
      channelCount: this.channels.size,
      channels: channelStats
    };
  }

  // ===== STATUS CLIENTS =====

  addStatusClient(ws: ExtendedWebSocket, subscribedChannel: number | null = null): void {
    this.statusClients.add(ws);
    if (subscribedChannel !== null) {
      this.statusClientChannels.set(ws, subscribedChannel);
      console.log(`Status client subscribed to channel: ${subscribedChannel}`);
    } else {
      console.log('Status client subscribed to all channels');
    }
  }

  removeStatusClient(ws: ExtendedWebSocket): void {
    this.statusClients.delete(ws);
    this.statusClientChannels.delete(ws);
  }

  notifyStatusClients(notification: any): void {
    const message = JSON.stringify(notification);
    const notificationChannel = notification.channel;
    const deadClients: ExtendedWebSocket[] = [];

    this.statusClients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        const subscribedChannel = this.statusClientChannels.get(client);
        const shouldSend = this.shouldNotifyClient(subscribedChannel, notificationChannel);

        if (shouldSend) {
          client.send(message);
        }
      } else {
        deadClients.push(client);
      }
    });

    deadClients.forEach((client) => this.removeStatusClient(client));
  }

  private shouldNotifyClient(subscribedChannel: number | undefined, notificationChannel: number): boolean {
    // Send if client has no filter (subscribed to all) OR subscribed to this channel
    return subscribedChannel === undefined || subscribedChannel === notificationChannel;
  }

  // ===== CHANNEL GENERATION =====

  generateChannelNumber(
    preferred: number | null = null,
    lastClientId: string | null = null
  ): ChannelGenerationResult | null {
    // Check if client is still connected to preferred channel
    if (preferred && lastClientId && this.isClientStillConnected(preferred, lastClientId)) {
      const token = this.channelTokens.get(preferred);
      return {
        channel: preferred,
        token,
        digits: preferred.toString().length,
        preferred: true,
        reconnect: true
      };
    }

    // Try preferred channel first
    if (preferred && !this.channels.has(preferred)) {
      const token = this.generateChannelToken();
      this.storeChannelToken(preferred, token);
      return {
        channel: preferred,
        token,
        digits: preferred.toString().length,
        preferred: true,
        reconnect: false
      };
    }

    // Generate new channel number
    return this.generateNewChannelNumber();
  }

  private isClientStillConnected(channel: number, clientId: string): boolean {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return false;

    for (const client of channelClients) {
      if (client.clientId === clientId && client.readyState === WEBSOCKET_OPEN_STATE) {
        console.log(`Client ${clientId} is still connected to channel ${channel}`);
        return true;
      }
    }
    return false;
  }

  private generateNewChannelNumber(): ChannelGenerationResult | null {
    for (let digits = MIN_CHANNEL_DIGITS; digits <= MAX_CHANNEL_DIGITS; digits++) {
      // Try random generation first
      const randomResult = this.tryRandomChannels(digits);
      if (randomResult) return randomResult;

      // Fall back to sequential search
      const sequentialResult = this.trySequentialChannels(digits);
      if (sequentialResult) return sequentialResult;
    }

    return null; // All channels exhausted
  }

  private tryRandomChannels(digits: number): ChannelGenerationResult | null {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    for (let attempt = 0; attempt < TOKEN_GENERATION_ATTEMPTS; attempt++) {
      const channel = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!this.channels.has(channel)) {
        const token = this.generateChannelToken();
        this.storeChannelToken(channel, token);
        return {
          channel,
          token,
          digits,
          preferred: false,
          reconnect: false
        };
      }
    }
    return null;
  }

  private trySequentialChannels(digits: number): ChannelGenerationResult | null {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    for (let i = min; i <= max; i++) {
      if (!this.channels.has(i)) {
        const token = this.generateChannelToken();
        this.storeChannelToken(i, token);
        return {
          channel: i,
          token,
          digits,
          preferred: false,
          reconnect: false
        };
      }
    }
    return null;
  }
}

// ===== WEBSOCKET HANDLERS =====
class WebSocketHandlers {
  private channelManager: ChannelManager;

  constructor(channelManager: ChannelManager) {
    this.channelManager = channelManager;
  }

  // ===== DATA CONNECTION HANDLER =====

  handleDataConnection(ws: ExtendedWebSocket, req: http.IncomingMessage): void {
    const channel = this.extractChannelFromUrl(req.url);

    try {
      const result = this.channelManager.addClient(ws, channel);
      const clientId = result.clientId;

      console.log(`New client connected to channel ${channel} (ID: ${clientId})`);

      this.sendWelcomeMessage(ws, channel, clientId);
      this.setupDataConnectionHandlers(ws, clientId, channel);
    } catch (error) {
      console.error('Error adding client:', error);
      ws.close(1011, 'Server error during connection setup');
    }
  }

  private extractChannelFromUrl(url: string | undefined): number {
    try {
      const parsedUrl = new URL(url || '', `http://localhost:${PORT}`);
      const channelParam = parsedUrl.searchParams.get('channel');
      const channel = parseInt(String(channelParam), 10);
      return !isNaN(channel) && channel >= 0 ? channel : DEFAULT_CHANNEL;
    } catch (error) {
      console.error('Error parsing WebSocket URL:', error);
      return DEFAULT_CHANNEL;
    }
  }

  private sendWelcomeMessage(ws: ExtendedWebSocket, channel: number, clientId: string): void {
    ws.send(JSON.stringify({
      message: `Connected to WebSocket server on channel ${channel}`,
      channel,
      clientId,
      timestamp: new Date()
    }));
  }

  private setupDataConnectionHandlers(ws: ExtendedWebSocket, clientId: string | null, channel: number): void {
    ws.on('message', (message: WebSocket.RawData) => {
      this.handleClientMessage(message, clientId);
    });

    ws.on('close', (code, reason) => {
      console.log(`Client ${clientId} disconnected from channel ${channel} (code: ${code}, reason: ${reason})`);
      this.channelManager.removeClient(ws, 'disconnected');
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.channelManager.removeClient(ws, 'error');
    });
  }

  private handleClientMessage(message: WebSocket.RawData, clientId: string | null): void {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message from client ${clientId}:`, data);
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  }

  // ===== STATUS CONNECTION HANDLER =====

  handleStatusConnection(ws: ExtendedWebSocket, req: http.IncomingMessage): void {
    const subscribedChannel = this.extractChannelFilter(req.url);

    console.log('New status client connected');
    this.channelManager.addStatusClient(ws, subscribedChannel);

    this.sendInitialStatusMessage(ws, subscribedChannel);
    this.setupStatusConnectionHandlers(ws);
  }

  private extractChannelFilter(url: string | undefined): number | null {
    try {
      const parsedUrl = new URL(url || '', `http://localhost:${PORT}`);
      const channelParam = parsedUrl.searchParams.get('channel');
      if (!channelParam) return null;

      const channel = parseInt(channelParam.trim(), 10);
      return !isNaN(channel) && channel >= 0 ? channel : null;
    } catch (error) {
      return null;
    }
  }

  private sendInitialStatusMessage(ws: ExtendedWebSocket, subscribedChannel: number | null): void {
    const allActivity = this.channelManager.getChannelActivity();
    const filteredActivity = this.filterActivityByChannel(allActivity, subscribedChannel);

    const message = {
      type: 'initial_status',
      message: this.getInitialStatusMessage(subscribedChannel),
      subscribedChannel,
      channelActivity: filteredActivity,
      timestamp: new Date()
    };

    ws.send(JSON.stringify(message));
  }

  private getInitialStatusMessage(subscribedChannel: number | null): string {
    if (subscribedChannel === null) {
      return 'Connected to status WebSocket server, subscribed to all channels';
    }
    return `Connected to status WebSocket server, subscribed to channel: ${subscribedChannel}`;
  }

  private filterActivityByChannel(activity: ChannelActivity, channel: number | null): ChannelActivity {
    if (channel === null) return activity;

    const filtered: ChannelActivity = {};
    if (activity[channel]) {
      filtered[channel] = activity[channel];
    }
    return filtered;
  }

  private setupStatusConnectionHandlers(ws: ExtendedWebSocket): void {
    ws.on('message', (message: WebSocket.RawData) => {
      this.handleStatusQuery(ws, message);
    });

    ws.on('close', () => {
      console.log('Status client disconnected');
      this.channelManager.removeStatusClient(ws);
    });

    ws.on('error', (error) => {
      console.error('Status WebSocket error:', error);
      this.channelManager.removeStatusClient(ws);
    });
  }

  // ===== STATUS QUERY HANDLER =====

  private handleStatusQuery(ws: ExtendedWebSocket, message: WebSocket.RawData): void {
    try {
      const data = JSON.parse(message.toString());
      this.processStatusQuery(ws, data);
    } catch (error) {
      console.error('Error parsing status client message:', error);
      this.sendErrorResponse(ws, 'Invalid message format');
    }
  }

  private processStatusQuery(ws: ExtendedWebSocket, data: any): void {
    if (data.query === 'channel_activity') {
      this.handleChannelActivityQuery(ws);
    } else if (data.query === 'channel_info' && data.channel !== undefined) {
      this.handleChannelInfoQuery(ws, data.channel);
    }
  }

  private handleChannelActivityQuery(ws: ExtendedWebSocket): void {
    ws.send(JSON.stringify({
      type: 'channel_activity_response',
      channelActivity: this.channelManager.getChannelActivity(),
      timestamp: new Date()
    }));
  }

  private handleChannelInfoQuery(ws: ExtendedWebSocket, channelParam: any): void {
    const channelId = parseInt(channelParam, 10);
    const activity = this.channelManager.getChannelActivity();
    const channelInfo = activity[channelId] || { clientCount: 0, clients: [] };

    ws.send(JSON.stringify({
      type: 'channel_info_response',
      channel: channelId,
      ...channelInfo,
      timestamp: new Date()
    }));
  }

  private sendErrorResponse(ws: ExtendedWebSocket, message: string): void {
    ws.send(JSON.stringify({
      type: 'error',
      message,
      timestamp: new Date()
    }));
  }
}

// ===== MAIN APPLICATION =====
const app = express();
const server = http.createServer(app);
const channelManager = new ChannelManager();
const wsHandlers = new WebSocketHandlers(channelManager);

// ===== MIDDLEWARE =====

app.use(setupCors);
app.use(express.json());

function setupCors(req: Request, res: Response, next: NextFunction): void {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, content-type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

// ===== WEBSOCKET SETUP =====

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: ExtendedWebSocket, req: http.IncomingMessage) => {
  const isStatusConnection = isStatusRequest(req.url);

  if (isStatusConnection) {
    wsHandlers.handleStatusConnection(ws, req);
  } else {
    wsHandlers.handleDataConnection(ws, req);
  }
});

function isStatusRequest(url: string | undefined): boolean {
  try {
    const parsedUrl = new URL(url || '', `http://localhost:${PORT}`);
    return parsedUrl.searchParams.get('status') === 'true';
  } catch {
    return false;
  }
}

// ===== API ENDPOINTS =====

// Broadcast endpoint
app.post('/broadcast', handleBroadcast);

function handleBroadcast(req: Request, res: Response): void {
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

// Health endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    ...channelManager.getHealthStats(),
    timestamp: new Date()
  });
});

// Generate channel endpoint
app.get('/generate-channel', handleGenerateChannel);

function handleGenerateChannel(req: Request, res: Response): void {
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