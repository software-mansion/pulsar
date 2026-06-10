import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import iconSmartphone from '../assets/icon-smartphone.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconQr from '../assets/icon-qr-code.svg';

const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';

type Status = 'idle' | 'requesting' | 'awaiting-phone' | 'connected' | 'error';

export default function PhonePanel({
  token,
  onTokenChange
}: {
  token: string | null;
  onTokenChange: (t: string | null) => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(token ? 'connected' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => () => wsRef.current?.close(), []);

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

  // If we already have a token, try to reconnect (server sends connection_restored
  // when the phone is still paired).
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(
      `${SOCKET_SERVER_URL}/?type=sender&action=reuse_connection&token=${encodeURIComponent(token)}`
    );
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'connection_restored') setStatus('connected');
        if (msg.type === 'peer_disconnected') setStatus('idle');
      } catch {}
    };
    ws.onerror = () => setStatus('error');
    return () => ws.close();
  }, [token]);

  const startPairing = async () => {
    setError(null);
    setStatus('requesting');
    try {
      const r = await fetch(`${API_SERVER_URL}/create-channel`);
      const j = await r.json();
      if (!j.success) throw new Error('Server refused channel creation');
      const newCode: string = j.code;
      setCode(newCode);
      setStatus('awaiting-phone');
      const ws = new WebSocket(
        `${SOCKET_SERVER_URL}/?type=sender&action=new_connection&code=${newCode}`
      );
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'connection_established' && msg.token) {
            onTokenChange(msg.token);
            setStatus('connected');
          }
          if (msg.type === 'peer_disconnected') setStatus('idle');
        } catch {}
      };
      ws.onerror = () => {
        setStatus('error');
        setError('WebSocket error');
      };
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    onTokenChange(null);
    setCode(null);
    setStatus('idle');
  };

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconSmartphone} alt="" />
        </span>
        <span className="acc-title">Phone</span>
        {status === 'connected' && (
          <span className="tag active" style={{ margin: 0 }}>Connected</span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body" style={{ gap: 8 }}>
        {status === 'idle' && (
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

        {status === 'requesting' && (
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

        {status === 'awaiting-phone' && (
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

        {status === 'connected' && (
          <div className="phone-card">
            <span className="phone-card-ic">
              <img src={iconSmartphone} alt="" />
            </span>
            <div className="phone-card-main">
              <div className="phone-card-title">
                <span className="status-dot ok" />
                Connected
              </div>
              <p className="phone-card-text">
                Your phone will play each preset as you preview it.
              </p>
              <button className="ghost" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        )}

        {status === 'error' && (
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
