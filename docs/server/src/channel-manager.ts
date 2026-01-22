import WebSocket from 'ws';
import {
  ClientMetadata,
  ExtendedWebSocket,
  ChannelActivity,
  ChannelGenerationResult,
  HealthStats
} from './types';
import {
  DEFAULT_CHANNEL,
  MIN_CHANNEL_DIGITS,
  MAX_CHANNEL_DIGITS,
  TOKEN_GENERATION_ATTEMPTS,
  WEBSOCKET_OPEN_STATE,
  NOTIFICATION_CLIENT_JOINED,
  NOTIFICATION_CLIENT_LEFT,
  NOTIFICATION_CLIENT_ERROR
} from './constants';

export class ChannelManager {
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
      type: NOTIFICATION_CLIENT_JOINED,
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

    const notificationType = reason === 'error' ? NOTIFICATION_CLIENT_ERROR : NOTIFICATION_CLIENT_LEFT;
    this.notifyStatusClients({
      type: notificationType,
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

  getHealthStats(): HealthStats {
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
