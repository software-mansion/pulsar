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

// A media clip a phone downloads to play in sync with the haptics. Mirrors Studio's
// `MediaRef` (device/toPattern.ts): `clipId` addresses the delivered bytes (the phone's
// cache/dedupe key), `downloadUrl` is where it fetches them.
export interface BroadcastMediaRef {
  clipId: string;
  downloadUrl: string;
  contentType: string;
  size: number;
}

// A haptics-only preset from Studio or the Figma plugin. Older producers send no
// `resourceId`, so the phone keys the library entry on the name instead.
export interface PatternHapticsBroadcast {
  kind: 'haptic-preset';
  name?: string;
  pattern: Pattern;
  resourceId?: string;
  version?: string;
}

// A preset scored to an AUDIO file, pushed from Studio (see device/toPattern.ts). The
// clip is already trimmed, so the pattern and the audio both play from t=0.
export interface AudioHapticsBroadcast {
  kind: 'audio-haptics';
  resourceId: string;
  version: string;
  name: string;
  durationMs: number;
  pattern: Pattern;
  audio: BroadcastMediaRef;
  volume?: number;
  offsetMs?: number;
  // The trim window into the audio file (absent = whole file). The SDK plays only this
  // window via `Pattern.sound` start/duration, so the whole file is downloaded once and a
  // trim change never re-downloads.
  window?: { startMs: number; durationMs: number };
}

// A preset scored to a Lottie ANIMATION, pushed from Studio. The animation is downloaded
// and rendered in lockstep with the haptics off a shared clock.
export interface AnimationHapticsBroadcast {
  kind: 'animation-haptics';
  resourceId: string;
  version: string;
  name: string;
  durationMs: number;
  pattern: Pattern;
  animation: BroadcastMediaRef & {
    totalFrames: number;
    frameRate: number;
    width: number;
    height: number;
  };
}

export interface ServerMessageHandlers {
  patchConnection: (id: string, patch: Partial<Connection>) => void;
  notify: (found: boolean, name: string) => void;
  // Everything a producer pushes lands on the player sheet for connection `id`.
  startPatternHaptics: (id: string, message: PatternHapticsBroadcast) => void;
  startAudioHaptics: (id: string, message: AudioHapticsBroadcast) => void;
  startAnimationHaptics: (id: string, message: AnimationHapticsBroadcast) => void;
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
    // Plays the supplied waveform, never a same-named built-in, so an edited preset
    // plays as edited.
    handlers.startPatternHaptics(id, message as PatternHapticsBroadcast);
    return;
  }

  // A media-backed haptic from Studio: an audio clip or a Lottie animation the phone
  // downloads and plays in sync (see MediaSessionContext). Older app builds don't match
  // these kinds and harmlessly ignore them — the same backward-compat seam.
  if (kind === 'audio-haptics' && (message as { audio?: unknown }).audio) {
    handlers.startAudioHaptics(id, message as AudioHapticsBroadcast);
    return;
  }
  if (kind === 'animation-haptics' && (message as { animation?: unknown }).animation) {
    handlers.startAnimationHaptics(id, message as AnimationHapticsBroadcast);
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
