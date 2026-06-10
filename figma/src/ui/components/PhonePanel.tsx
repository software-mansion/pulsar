import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

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
    <details className="accordion" style={{ margin: '8px', borderTop: 'none', paddingTop: 0 }}>
      <summary className="row" style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>
        <span className="caret" aria-hidden="true">▸</span>
        Phone
        {status === 'connected' && (
          <span className="tag active" style={{ margin: 0 }}>Connected</span>
        )}
      </summary>

      <div className="col" style={{ marginTop: 8, gap: 6 }}>
        <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
          Pair the Pulsar app to feel real haptics on your device when you preview a preset.
        </p>

        {status === 'idle' && (
          <button className="primary" onClick={startPairing}>Pair with phone</button>
        )}
        {status === 'requesting' && <span className="muted">Requesting channel…</span>}
        {status === 'awaiting-phone' && (
          <div className="col">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Scan with Pulsar"
                style={{ width: 220, height: 220, alignSelf: 'center', borderRadius: 4 }}
              />
            )}
            <div className="row">
              <span className="muted">Code:</span>
              <span className="mono" style={{ fontWeight: 700 }}>{code}</span>
              <div className="spacer" />
              <button className="ghost" onClick={disconnect}>Cancel</button>
            </div>
            <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
              Open the Pulsar mobile app and scan the QR (or enter the code).
            </span>
          </div>
        )}
        {status === 'connected' && (
          <div className="row">
            <span style={{ color: 'green', fontWeight: 600 }}>● Connected</span>
            <div className="spacer" />
            <button className="ghost" onClick={disconnect}>Disconnect</button>
          </div>
        )}
        {status === 'error' && (
          <div className="col">
            <span style={{ color: 'crimson' }}>Error: {error ?? 'unknown'}</span>
            <button className="ghost" onClick={startPairing}>Retry</button>
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
