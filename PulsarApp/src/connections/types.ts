export type ConnectionStatus =
  | 'connecting' // socket opening, no server ack yet
  | 'waiting' // on the server, producer not present (peer away / not paired yet)
  | 'connected' // paired with the producer — broadcasts will play
  | 'offline' // socket closed cleanly (e.g. backgrounded) — will reconnect
  | 'error'; // connection attempt failed

export type ProducerType = 'figma' | 'browser';

export interface Connection {
  id: string;
  // Strong-channel token, known once `connection_established` arrives. Null
  // while a fresh pairing is still in flight.
  token: string | null;
  // Human label shown in the list. Provisional until the server relays the
  // producer's advertised name (e.g. "Figma Plugin macOS").
  name: string;
  status: ConnectionStatus;
  // Figma preview share token relayed by the producer, if any — lets the row
  // offer "Open preview".
  previewToken?: string;
  // What kind of producer paired with us, relayed at (re)establish. Absent on
  // older producers — fall back to inferring from `previewToken` (see
  // `connectionType`).
  producerType?: ProducerType;
  // `figma.root.name`, relayed by the Figma plugin. Absent for browsers and
  // older plugins.
  figmaProjectName?: string;
  // User-edited label. Takes precedence over the relayed name so a rename isn't
  // overwritten by `connection_restored` on the next reconnect.
  customName?: string;
  createdAt: number;
}

export interface PersistedConnection {
  id: string;
  token: string;
  name: string;
  previewToken?: string;
  producerType?: ProducerType;
  figmaProjectName?: string;
  customName?: string;
  createdAt?: number;
}

export interface ReceivedPattern {
  found: boolean;
  name: string;
}

// A live haptics-config update relayed by the Figma plugin over the paired
// channel, destined for an open live preview. The payload is forwarded verbatim
// to the WebView (figma.tsx); we only read `previewToken` (to match the right
// open preview) here. `nonce` is monotonic so an identical repeat still
// re-triggers the consumer effect.
export interface PreviewUpdate {
  kind: 'preview-haptics-diff' | 'preview-haptics-refetch' | 'preview-frame-focus';
  previewToken?: string;
  fromRevision?: number;
  toRevision?: number;
  diff?: unknown;
  // Set only on 'preview-frame-focus': the top-level frame the designer focused,
  // which the open live preview should present, plus its human-readable name for
  // the preview's "current screen" indicator.
  nodeId?: string;
  frameName?: string;
  nonce: number;
}

// Identity a QR/deep link carries up front, ahead of the server relay.
export interface AddByCodeOptions {
  name?: string;
  previewToken?: string;
  producerType?: ProducerType;
}

// Narrowed to the JSON values PostHog accepts.
export type Track = (event: string, properties?: Record<string, string | number | boolean>) => void;

// What kind of producer a connection is. Prefer the relayed `producerType`;
// fall back to the presence of a preview token (only the Figma plugin sends one).
export function connectionType(c: Connection): ProducerType {
  return c.producerType ?? (c.previewToken ? 'figma' : 'browser');
}

// The label to show in the list: a user rename wins, then the Figma project
// name, then the producer-advertised name.
export function connectionDisplayName(c: Connection): string {
  return c.customName?.trim() || c.figmaProjectName || c.name;
}
