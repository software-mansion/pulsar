import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import iconSmartphone from '../assets/icon-smartphone.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconQr from '../assets/icon-qr-code.svg';

const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';

// Keep the sender socket alive so the server's heartbeat sweep doesn't reap it
// while the phone is away. Matches the docs Connection component's interval.
const PING_INTERVAL_MS = 25_000;

// Pairing flow for a phone that hasn't been linked yet. Once a token exists the
// panel is `paired` and this no longer drives the UI — the live `connected`
// flag does. Kept separate so a phone dropping out (`peer_disconnected`) flips
// the indicator off without discarding the pairing and forcing a re-scan.
type Phase = 'idle' | 'requesting' | 'awaiting-phone' | 'error';

export default function PhonePanel({
  token,
  onTokenChange,
  onConnectedChange
}: {
  token: string | null;
  onTokenChange: (t: string | null) => void;
  // Reports the live link to the phone (distinct from being paired). The parent
  // gates "play on phone" on this so we don't broadcast into a dead channel.
  onConnectedChange?: (connected: boolean) => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  // Live link to the phone. Paired (token != null) but `connected === false`
  // means the phone is away — the server keeps our socket and will push
  // `connection_restored` when it returns.
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  // The token our current socket is bound to. Lets the token effect below tell
  // "restored from storage" (open a socket) apart from "just paired" (the
  // pairing socket already owns it — don't reopen and churn the connection).
  const boundTokenRef = useRef<string | null>(null);

  const paired = token != null;

  useEffect(() => {
    onConnectedChange?.(connected);
  }, [connected, onConnectedChange]);

  useEffect(() => {
    if (!code) return;
    QRCode.toDataURL(`pulsarapp:///?code=${code}`, {
      margin: 1,
      color: { dark: '#001a72', light: '#e1f3fa' },
      width: 220
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [code]);

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
          // Fresh pairing completed — claim the token before handing it up so
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
          // Phone went away. Stay paired — the server holds our socket and will
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
    openSocket(`&action=reuse_connection&token=${encodeURIComponent(token)}`);
  }, [token]);

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
      const r = await fetch(`${API_SERVER_URL}/create-channel`);
      const j = await r.json();
      if (!j.success) throw new Error('Server refused channel creation');
      const newCode: string = j.code;
      setCode(newCode);
      setPhase('awaiting-phone');
      openSocket(`&action=new_connection&code=${newCode}`);
    } catch (e) {
      setError((e as Error).message);
      setPhase('error');
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    boundTokenRef.current = null;
    setConnected(false);
    onTokenChange(null);
    setCode(null);
    setPhase('idle');
  };

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconSmartphone} alt="" />
        </span>
        <span className="acc-title">Phone</span>
        {paired && (
          <span className={`tag ${connected ? 'active' : ''}`} style={{ margin: 0 }}>
            {connected ? 'Connected' : 'Offline'}
          </span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body" style={{ gap: 8 }}>
        {paired ? (
          <div className="phone-card">
            <span className="phone-card-ic">
              <img src={iconSmartphone} alt="" />
            </span>
            <div className="phone-card-main">
              <div className="phone-card-title">
                <span className={`status-dot ${connected ? 'ok' : 'err'}`} />
                {connected ? 'Connected' : 'Phone offline'}
              </div>
              <p className="phone-card-text">
                {connected
                  ? 'Your phone will play each preset as you preview it.'
                  : 'Paired, but your phone isn’t reachable. Open the Pulsar app to reconnect.'}
              </p>
              <button className="ghost" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        ) : (
          <>
            {phase === 'idle' && (
              <div className="phone-card">
                <span className="phone-card-ic">
                  <img src={iconSmartphone} alt="" />
                </span>
                <div className="phone-card-main">
                  <div className="phone-card-title">
                    <span className="status-dot" />
                    Not connected
                  </div>
                  <p className="phone-card-text">
                    Pair the Pulsar app to feel real haptics on your device while you preview a preset.
                  </p>
                  <button className="primary preset-action-btn" onClick={startPairing}>
                    <img src={iconQr} alt="" width={14} height={14} />
                    <span>Pair with phone</span>
                  </button>
                </div>
              </div>
            )}

            {phase === 'requesting' && (
              <div className="phone-card">
                <span className="phone-card-ic">
                  <img src={iconSmartphone} alt="" />
                </span>
                <div className="phone-card-main">
                  <div className="phone-card-title">
                    <span className="status-dot" />
                    Requesting channel…
                  </div>
                </div>
              </div>
            )}

            {phase === 'awaiting-phone' && (
              <div className="phone-await">
                {qrDataUrl && <img className="phone-qr" src={qrDataUrl} alt="Scan with Pulsar" />}
                <div className="row" style={{ gap: 8 }}>
                  <span className="muted">Code</span>
                  <span className="mono" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>{code}</span>
                </div>
                <p className="phone-card-text" style={{ marginBottom: 0 }}>
                  Open the Pulsar mobile app and scan the QR (or enter the code).
                </p>
                <button className="ghost" onClick={disconnect}>Cancel</button>
              </div>
            )}

            {phase === 'error' && (
              <div className="phone-card">
                <span className="phone-card-ic">
                  <img src={iconSmartphone} alt="" />
                </span>
                <div className="phone-card-main">
                  <div className="phone-card-title">
                    <span className="status-dot err" />
                    Couldn’t connect
                  </div>
                  <p className="phone-card-text">{error ?? 'Unknown error.'}</p>
                  <button className="ghost" onClick={startPairing}>Retry</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
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
