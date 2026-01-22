import http from 'http';
import WebSocket from 'ws';
import { ExtendedWebSocket, ChannelActivity } from './types';
import { ChannelManager } from './channel-manager';
import {
  PORT,
  DEFAULT_CHANNEL,
  WEBSOCKET_OPEN_STATE,
  QUERY_CHANNEL_ACTIVITY,
  QUERY_CHANNEL_INFO,
  NOTIFICATION_INITIAL_STATUS,
  NOTIFICATION_CHANNEL_ACTIVITY_RESPONSE,
  NOTIFICATION_CHANNEL_INFO_RESPONSE,
  NOTIFICATION_ERROR
} from './constants';

export class WebSocketHandlers {
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
      type: NOTIFICATION_INITIAL_STATUS,
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
    if (data.query === QUERY_CHANNEL_ACTIVITY) {
      this.handleChannelActivityQuery(ws);
    } else if (data.query === QUERY_CHANNEL_INFO && data.channel !== undefined) {
      this.handleChannelInfoQuery(ws, data.channel);
    }
  }

  private handleChannelActivityQuery(ws: ExtendedWebSocket): void {
    ws.send(JSON.stringify({
      type: NOTIFICATION_CHANNEL_ACTIVITY_RESPONSE,
      channelActivity: this.channelManager.getChannelActivity(),
      timestamp: new Date()
    }));
  }

  private handleChannelInfoQuery(ws: ExtendedWebSocket, channelParam: any): void {
    const channelId = parseInt(channelParam, 10);
    const activity = this.channelManager.getChannelActivity();
    const channelInfo = activity[channelId] || { clientCount: 0, clients: [] };

    ws.send(JSON.stringify({
      type: NOTIFICATION_CHANNEL_INFO_RESPONSE,
      channel: channelId,
      ...channelInfo,
      timestamp: new Date()
    }));
  }

  private sendErrorResponse(ws: ExtendedWebSocket, message: string): void {
    ws.send(JSON.stringify({
      type: NOTIFICATION_ERROR,
      message,
      timestamp: new Date()
    }));
  }
}
