import WebSocket from 'ws';

// ===== CLIENT MANAGEMENT =====
export interface ClientMetadata {
  id: string;
  channel: number;
  joinTime: Date;
}

export interface ExtendedWebSocket extends WebSocket {
  channel?: number;
  clientId?: string;
}

// ===== CHANNEL INFORMATION =====
export interface ChannelInfo {
  clientCount: number;
  clients: Array<{ id: string; joinTime?: Date }>;
}

export interface ChannelActivity {
  [channelId: number]: ChannelInfo;
}

// ===== CHANNEL GENERATION =====
export interface ChannelGenerationResult {
  channel: number;
  token: string;
  digits: number;
  preferred: boolean;
  reconnect: boolean;
}

// ===== HEALTH STATISTICS =====
export interface HealthStats {
  totalConnectedClients: number;
  channelCount: number;
  channels: { [key: number]: number };
}
