// ===== SERVER CONFIGURATION =====
export const PORT = process.env.PORT || 8080;

// ===== DEFAULT VALUES =====
export const DEFAULT_CHANNEL = 0;

// ===== CHANNEL GENERATION LIMITS =====
export const MIN_CHANNEL_DIGITS = 4;
export const MAX_CHANNEL_DIGITS = 8;
export const TOKEN_GENERATION_ATTEMPTS = 100;

// ===== WEBSOCKET STATES =====
export const WEBSOCKET_OPEN_STATE = 1;

// ===== STATUS QUERY TYPES =====
export const QUERY_CHANNEL_ACTIVITY = 'channel_activity';
export const QUERY_CHANNEL_INFO = 'channel_info';

// ===== NOTIFICATION TYPES =====
export const NOTIFICATION_CLIENT_JOINED = 'client_joined';
export const NOTIFICATION_CLIENT_LEFT = 'client_left';
export const NOTIFICATION_CLIENT_ERROR = 'client_error';
export const NOTIFICATION_INITIAL_STATUS = 'initial_status';
export const NOTIFICATION_CHANNEL_ACTIVITY_RESPONSE = 'channel_activity_response';
export const NOTIFICATION_CHANNEL_INFO_RESPONSE = 'channel_info_response';
export const NOTIFICATION_ERROR = 'error';
