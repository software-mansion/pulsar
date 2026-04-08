import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { API_SERVER_URL, SOCKET_SERVER_URL } from '../config';

import style from './Connection.module.scss';
import refreshIcon from '../../assets/new_assets/refresh.svg';
import disconnectIcon from '../../assets/new_assets/unplug.svg';
import appleStoreBadge from '../../assets/interactive-playground/apple.svg';
import googlePlayBadge from '../../assets/interactive-playground/google.png';
import { Accordion } from '../Accordion/Accordion';
import { Point } from '../Point/Point';

declare global {
  interface Window {
    connectionChannel: number;
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export default function Connection() {
  const [paired, setPaired] = useState<boolean>(false);
  const [channel, setChannel] = useState<number | string>('Loading...');
  const [status, setStatus] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  const deepLinkUrl = channel !== 'Loading...' ? `pulsarapp:///?code=${channel}` : '';

  function createChannel() {
    setChannel('Loading...');
    fetch(`${API_SERVER_URL}/create-channel`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          console.error('Failed to get channel from server');
          return;
        }
        const channelNumber = data.code;
        setChannel(channelNumber);

        webSocketConnection(channelNumber);
      });
  }

  function webSocketConnection(channelNumber?: string) {
    let token = null;
    if (localStorage.getItem('hapticsToken')) {
      token = localStorage.getItem('hapticsToken');
    }
    let params = '';
    if (token) {
      params = `&action=reuse_connection&token=${token}`;
    } else {
      params = `&action=new_connection&code=${channelNumber}`;
    }

    if (ws.current !== null) {
      ws.current.close();
    }
    ws.current = new WebSocket(`${SOCKET_SERVER_URL}?type=sender${params}`);
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25_000);
    ws.current.addEventListener('close', () => clearInterval(pingInterval));
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case 'connection_established':
          {
            localStorage.setItem('hapticsToken', data.token);
            setStatus(true);
            setPaired(true);
            window.posthog?.capture('device_connected', { connection_type: 'new' });
          }
          break;
        case 'connection_restored':
          {
            setStatus(true);
            window.posthog?.capture('device_connected', { connection_type: 'restored' });
          }
          break;
        case 'peer_disconnected':
          {
            setStatus(false);
            window.posthog?.capture('device_disconnected');
          }
          break;
      }
    };
  }

  useEffect(() => {
    if (localStorage.getItem('hapticsToken')) {
      webSocketConnection();
      setPaired(true);
    } else {
      createChannel();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  function handleReset() {
    localStorage.removeItem('hapticsToken');
    setStatus(false);
    createChannel();
    setPaired(false);
    window.posthog?.capture('reset_connection');
  }

  return (
    <div className={['not-content', style.background].join(' ')}>
      <div className={style.content}>
        <div className={style.title}>Connect your phone</div>
        <div className={style.subtitle}>Pair your phone to feel the presets on your device.</div>

        {!paired ? (
          <div className={style.codebox}>
            <img
              src={refreshIcon.src}
              alt="Refresh"
              className={`${style.icon}`}
              onClick={handleReset}
            />

            {deepLinkUrl && (
              <div className={style.qrWrap}>
                <div className={style.prompt}>Scan with your phone to connect</div>
                <QRCodeCanvas value={deepLinkUrl} size={200} bgColor="#e1f3fa" fgColor="#001a72" />
              </div>
            )}

            <div className={style.fallback}>
              <span className={style.fallbackLabel}>or enter code manually:</span>
              <span className={style.code}>{channel}</span>
            </div>

            <div className={style.status}>
              <div className={style.desc}>{status ? 'Phone connected' : 'Phone not connected'}</div>
              <div
                className={`${style.indicator} ${status ? style.connected : style.disconnected}`}
              ></div>
            </div>
          </div>
        ) : (
          <div className={style.codebox}>
            <img
              src={disconnectIcon.src}
              alt="Disconnect"
              className={`${style.icon}`}
              onClick={handleReset}
            />
            <div className={style.promptSuccess}>Your phone is paired.</div>
            <div className={style.subPrompt}>Open PulsarApp to feel the presets.</div>
            <div className={style.status}>
              <div className={style.desc}>{status ? 'Phone connected' : 'Phone not connected'}</div>
              <div
                className={`${style.indicator} ${status ? style.connected : style.disconnected}`}
              ></div>
            </div>
          </div>
        )}

        {!paired && (
          <Accordion title="How to connect a device? 🤔">
            <Point index={1}>
              <div>Download the Pulsar app from the <a href="https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104" target="_blank" rel="noopener noreferrer">App Store</a>.</div>
            </Point>
            <Point index={2}>
              <div>Scan QRCode to open PulsarApp and connect your device.</div>
            </Point>
            <Point index={3}>
              <div>After you connect your device, you will feel the presets on your phone.</div>
            </Point>
            <Point index={4}>
              <div>If you have any problem with QRCode just enter the code manually.</div>
            </Point>
          </Accordion>
        )}

        {!paired && (
          <div className={style.storeButtons}>
            <a
              href="https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appleStoreBadge.src} alt="Download on the App Store" className={style.storeBadge} />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={googlePlayBadge.src} alt="Get it on Google Play" className={style.storeBadge} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
