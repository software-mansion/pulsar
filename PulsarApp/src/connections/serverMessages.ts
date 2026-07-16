import { Presets, type Pattern } from 'react-native-pulsar';

import { playPattern } from '@/src/haptics/playPattern';

import type { Connection, PreviewUpdate, ProducerType, Track } from './types';

interface ServerMessage {
  type?: string;
  token?: string;
  message?: unknown;
  name?: string;
  previewToken?: string;
  producerType?: ProducerType;
  figmaProjectName?: string;
}

export interface ServerMessageHandlers {
  patchConnection: (id: string, patch: Partial<Connection>) => void;
  notify: (found: boolean, name: string) => void;
  playPreset: (pattern: Pattern) => boolean;
  emitPreviewUpdate: (id: string, update: Omit<PreviewUpdate, 'nonce'>) => void;
  track: Track;
}

// The identity fields a producer may relay at (re)establish. Only the ones
// actually present are patched, so a reconnect never blanks a known value.
function relayedIdentity(json: ServerMessage): Partial<Connection> {
  return {
    ...(json.name ? { name: json.name } : {}),
    ...(json.previewToken ? { previewToken: json.previewToken } : {}),
    ...(json.producerType ? { producerType: json.producerType } : {}),
    ...(json.figmaProjectName ? { figmaProjectName: json.figmaProjectName } : {}),
  };
}

// A producer sends either a preset *name* (a string, to play now) or a
// structured live-preview update (an object). Branch on the shape so neither
// path can throw on the other's payload.
function handleBroadcast(id: string, message: unknown, handlers: ServerMessageHandlers) {
  if (typeof message === 'string') {
    handlers.notify(playPattern(message), message);
    return;
  }
  if (!message || typeof message !== 'object') return;

  const kind = (message as { kind?: unknown }).kind;

  if (kind === 'haptic-preset' && (message as { pattern?: unknown }).pattern) {
    // A full JSON preset pushed from Pulsar Studio. Unlike the string path, this
    // ALWAYS plays the supplied waveform via the composer — never a same-named
    // built-in — so an edited preset plays as edited. Older app builds don't
    // match this branch (the object isn't a 'preview-*'), so they harmlessly
    // ignore it: the backward-compat seam.
    const preset = message as { kind: string; name?: string; pattern: Pattern };
    handlers.notify(handlers.playPreset(preset.pattern), preset.name ?? 'Haptic preset');
    return;
  }

  // Covers both the haptics-config relay (diff/refetch) and the designer-focus
  // frame jump (preview-frame-focus). Forwarded verbatim to the live preview.
  if (typeof kind === 'string' && kind.startsWith('preview-')) {
    handlers.emitPreviewUpdate(id, message as Omit<PreviewUpdate, 'nonce'>);
  }
}

export function handleServerMessage(id: string, raw: string, handlers: ServerMessageHandlers) {
  let json: ServerMessage;
  try {
    json = JSON.parse(raw);
  } catch {
    return;
  }

  switch (json.type) {
    case 'connection_established':
      if (!json.token) break;
      handlers.patchConnection(id, {
        token: json.token,
        status: 'connected',
        ...relayedIdentity(json),
      });
      // A short buzz confirms the new pairing to the user.
      Presets.breakingWave();
      handlers.track('device_connected', { connection_type: 'new' });
      break;

    case 'connection_restored':
      // Silent (no buzz): this is a background reconnect, not a user action.
      handlers.patchConnection(id, { status: 'connected', ...relayedIdentity(json) });
      handlers.track('device_connected', { connection_type: 'restored' });
      break;

    case 'peer_disconnected':
      handlers.patchConnection(id, { status: 'waiting' });
      break;

    case 'pong':
      break;

    case 'broadcast':
      handleBroadcast(id, json.message, handlers);
      break;
  }
}
