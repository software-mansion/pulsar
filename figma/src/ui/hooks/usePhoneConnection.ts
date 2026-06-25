import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';

// Keep the sender socket alive so the server's heartbeat sweep doesn't reap it
// while the phone is away. Matches the docs Connection component's interval.
const PING_INTERVAL_MS = 25_000;

// Human label the phone shows for this producer in its connection list. The OS
// is best-effort from the plugin iframe's userAgent; the bare "Figma Plugin"
// fallback is fine when it can't be determined.
function detectOS(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Win/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return '';
}
const CONNECTION_NAME = `Figma Plugin${detectOS() ? ` ${detectOS()}` : ''}`;

// Producer identity advertised on the sender handshake; the server relays it to
// the phone on (re)establish. All additive, so older servers/apps simply ignore
// what they don't understand:
//   name            - generic label ("Figma Plugin macOS")
//   producerType    - lets the phone tell a Figma producer from a browser
//   figmaProjectName- the document name, shown as the connection's label
//   previewToken    - the live-preview share token (when available)
function identityParams(previewToken?: string | null, documentName?: string | null): string {
  return (
    `&name=${encodeURIComponent(CONNECTION_NAME)}` +
    `&producerType=figma` +
    (documentName ? `&figmaProjectName=${encodeURIComponent(documentName)}` : '') +
    (previewToken ? `&previewToken=${encodeURIComponent(previewToken)}` : '')
  );
}

// Pairing flow for a phone that hasn't been linked yet. Once a token exists the
// connection is `paired` and this no longer drives the UI - the live `connected`
// flag does. Kept separate so a phone dropping out (`peer_disconnected`) flips
// the indicator off without discarding the pairing and forcing a re-scan.
export type PhonePhase = 'idle' | 'requesting' | 'awaiting-phone' | 'error';

// Coarse connection health for the status dots (in the configurator step + the tab):
//   connected - phone reachable (green)
//   warn      - a problem: paired but offline, or a pairing error (amber)
//   pending   - pairing in progress, nothing wrong yet (blue)
export type PhoneStatus = 'connected' | 'warn' | 'pending';

export function phoneStatusOf(phone: Pick<PhoneConnection, 'connected' | 'paired' | 'phase'>): PhoneStatus {
  if (phone.connected) return 'connected';
  if (phone.phase === 'error' || phone.paired) return 'warn';
  return 'pending';
}

export interface PhoneConnection {
  // True once a phone is paired (we hold a token), regardless of live reachability.
  paired: boolean;
  // The live link to the phone (paired + currently reachable).
  connected: boolean;
  phase: PhonePhase;
  code: string | null;
  qrDataUrl: string | null;
  error: string | null;
  startPairing: () => void;
  // Re-establish the link: reopens the socket for a paired phone, or starts a
  // fresh pairing when not paired yet (e.g. after an error).
  refresh: () => void;
  disconnect: () => void;
}

interface Params {
  token: string | null;
  onTokenChange: (t: string | null) => void;
  // Reports the live link to the phone (distinct from being paired). The owner
  // gates "play on phone" on this so we don't broadcast into a dead channel.
  onConnectedChange: (connected: boolean) => void;
  // Resolves (publishing if needed) this file's read-only preview token so the
  // unified QR can both open the live preview and pair playback. Resolves null
  // when the file isn't preview-ready - then we pair with the code alone.
  ensureSharedPreview: () => Promise<string | null>;
  // The current file's preview token; lets us relay it to an already-paired
  // phone once it first becomes available.
  previewToken: string | null;
  // The Figma document name, advertised as the connection label on the phone.
  documentName: string | null;
  // True while the user is viewing the pairing step (Live preview tab, file key
  // set). Begins pairing automatically so the QR appears without a click. It
  // only *starts* a connection - it never tears one down, so the link survives
  // leaving the tab. Tearing down is disconnect() or the plugin window closing.
  autoStart: boolean;
}

// Owns the producer-side pairing socket to the Pulsar relay and the pairing
// state machine. Lives at the app root (not inside the tab panel) so the live
// link to the phone persists across tab switches - it dies only on an explicit
// disconnect() or when the plugin window (and this hook) unmounts.
export function usePhoneConnection({
  token,
  onTokenChange,
  onConnectedChange,
  ensureSharedPreview,
  previewToken,
  documentName,
  autoStart
}: Params): PhoneConnection {
  const [code, setCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<PhonePhase>('idle');
  // Live link to the phone. Paired (token != null) but `connected === false`
  // means the phone is away - the server keeps our socket and will push
  // `connection_restored` when it returns.
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  // Preview token captured at pairing time, used to build the QR deterministically.
  const [pairPreviewToken, setPairPreviewToken] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  // The token our current socket is bound to. Lets the token effect below tell
  // "restored from storage" (open a socket) apart from "just paired" (the
  // pairing socket already owns it - don't reopen and churn the connection).
  const boundTokenRef = useRef<string | null>(null);
  // The preview token we last advertised to the phone, so a later change can be
  // relayed exactly once without re-opening the socket on every render.
  const lastSentPreviewRef = useRef<string | null>(null);

  const paired = token != null;

  useEffect(() => {
    onConnectedChange(connected);
  }, [connected, onConnectedChange]);

  // Build the unified QR: when a preview token is available it opens the live
  // preview *and* pairs playback (figma host); otherwise it pairs playback only
  // (connect host). Both carry the producer name for the phone's connection list.
  useEffect(() => {
    if (!code) return;
    // With a preview token: `figma` host so the app opens the live preview and
    // pairs. Without one: the root scheme (not the `connect` host), so the QR
    // stays backward compatible with apps already in the stores - they route
    // `pulsarapp:///` to their home screen and pair from `code` there.
    const deepLink = pairPreviewToken
      ? `pulsarapp://figma?token=${encodeURIComponent(pairPreviewToken)}` +
        `&code=${encodeURIComponent(code)}&name=${encodeURIComponent(CONNECTION_NAME)}`
      : `pulsarapp:///?code=${encodeURIComponent(code)}&name=${encodeURIComponent(CONNECTION_NAME)}`;
    QRCode.toDataURL(deepLink, {
      margin: 1,
      color: { dark: '#001a72', light: '#e1f3fa' },
      width: 220
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [code, pairPreviewToken]);

  // Open a sender socket and wire up the shared message handling + keepalive.
  // `params` selects new_connection (pairing) vs reuse_connection (restore).
  const openSocket = (params: string) => {
    wsRef.current?.close();
    const ws = new WebSocket(`${SOCKET_SERVER_URL}/?type=sender${params}`);
    wsRef.current = ws;

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
    }, PING_INTERVAL_MS);
    ws.addEventListener('close', () => clearInterval(ping));

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          // Fresh pairing completed - claim the token before handing it up so
          // the token effect sees the socket already bound and doesn't reopen.
          case 'connection_established':
            if (msg.token) {
              boundTokenRef.current = msg.token;
              onTokenChange(msg.token);
            }
            setConnected(true);
            setCode(null);
            setError(null);
            break;
          // Phone came back on a still-paired channel.
          case 'connection_restored':
            setConnected(true);
            setError(null);
            break;
          // Phone went away. Stay paired - the server holds our socket and will
          // send connection_restored when it returns.
          case 'peer_disconnected':
            setConnected(false);
            break;
        }
      } catch {}
    };
    ws.onerror = () => {
      setConnected(false);
      if (!paired) {
        setError('WebSocket error');
        setPhase('error');
      }
    };
    return ws;
  };

  // Persistent connection for an already-paired phone (restored from storage).
  // Skipped right after pairing, where the pairing socket already owns the token
  // (boundTokenRef), so we don't tear down a healthy connection.
  useEffect(() => {
    if (!token) {
      boundTokenRef.current = null;
      return;
    }
    if (boundTokenRef.current === token) return;
    boundTokenRef.current = token;
    lastSentPreviewRef.current = previewToken;
    openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}${identityParams(previewToken, documentName)}`);
    // previewToken is folded into the restore handshake; the dedicated effect
    // below handles it changing afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Relay a preview token to an already-connected phone once it first becomes
  // available (e.g. the user adds the Figma file key after pairing). Re-opens
  // the sender socket with the token so the server pushes connection_restored -
  // carrying it - to the phone. Guarded so it fires only on a genuine change.
  useEffect(() => {
    if (!paired || !connected || !token || !previewToken) return;
    if (lastSentPreviewRef.current === previewToken) return;
    lastSentPreviewRef.current = previewToken;
    openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}${identityParams(previewToken, documentName)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewToken, paired, connected, token]);

  // Close the socket only when the hook itself unmounts - i.e. the plugin window
  // closes. Switching tabs doesn't unmount the app root, so the link persists.
  useEffect(
    () => () => {
      wsRef.current?.close();
      wsRef.current = null;
    },
    []
  );

  const startPairing = async () => {
    setError(null);
    setPhase('requesting');
    try {
      // Resolve the preview token first so the unified QR can carry it.
      // Best-effort: a null result (file not preview-ready) just pairs playback.
      let preview: string | null = null;
      try {
        preview = await ensureSharedPreview();
      } catch {
        preview = null;
      }
      const r = await fetch(`${API_SERVER_URL}/create-channel`);
      const j = await r.json();
      if (!j.success) throw new Error('Server refused channel creation');
      const newCode: string = j.code;
      setPairPreviewToken(preview);
      lastSentPreviewRef.current = preview;
      setCode(newCode);
      setPhase('awaiting-phone');
      openSocket(`&action=new_connection&code=${newCode}${identityParams(preview, documentName)}`);
    } catch (e) {
      setError((e as Error).message);
      setPhase('error');
    }
  };

  // Auto-start pairing while the user is on the pairing step and not yet paired,
  // so the QR shows without a click. `setPhase('requesting')` at the top of
  // startPairing flips us out of 'idle' immediately, so this fires once per
  // pairing attempt rather than looping.
  useEffect(() => {
    if (autoStart && !token && phase === 'idle') startPairing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, token, phase]);

  // Manually re-establish the link. For a paired phone, reopen the reuse socket
  // so the server pushes a fresh connection_restored if it's reachable; for an
  // unpaired one, just (re)start pairing.
  const refresh = () => {
    if (token) {
      lastSentPreviewRef.current = previewToken;
      openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}${identityParams(previewToken, documentName)}`);
    } else {
      startPairing();
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    boundTokenRef.current = null;
    lastSentPreviewRef.current = null;
    setConnected(false);
    onTokenChange(null);
    setCode(null);
    setPairPreviewToken(null);
    setPhase('idle');
  };

  return { paired, connected, phase, code, qrDataUrl, error, startPairing, refresh, disconnect };
}

export async function broadcastToPhone(token: string, presetName: string) {
  try {
    await fetch(`${API_SERVER_URL}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: presetName, token })
    });
  } catch (e) {
    console.warn('broadcast failed', e);
  }
}

// Relay a structured object to the paired phone over the same channel. The
// server JSON.parses the `message`, so an object survives the relay structured
// (bare preset names stay strings - see connection-manager.broadcastChannel).
// Used to push live haptics-config updates to an open live preview.
export async function broadcastPreviewUpdate(token: string, payload: unknown) {
  try {
    await fetch(`${API_SERVER_URL}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: JSON.stringify(payload), token })
    });
  } catch (e) {
    console.warn('preview-update broadcast failed', e);
  }
}
