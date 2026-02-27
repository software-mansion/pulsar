import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { API_SERVER_URL, SOCKET_SERVER_URL } from '../config';

import style from './Connection.module.scss';
import commonStyle from '../common.module.scss';
import refreshIcon from '../../assets/new_assets/refresh.svg';
import disconnectIcon from '../../assets/new_assets/unplug.svg';
import { Accordion } from '../Accordion/Accordion';
import { Point } from '../Point/Point';

declare global {
  interface Window {
    connectionChannel: number;
  }
}

export default function Connection() {
  const [paired, setPaired] = useState<boolean>(false);
  const [channel, setChannel] = useState<number | string>('Loading...');
  const [status, setStatus] = useState<boolean>(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);

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
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case 'connection_established':
          {
            localStorage.setItem('hapticsToken', data.token);
            setStatus(true);
            setPaired(true);
          }
          break;
        case 'connection_restored':
          {
            setStatus(true);
          }
          break;
        case 'peer_disconnected':
          {
            setStatus(false);
          }
          break;
      }
    };
  }

  useEffect(() => {
    if (channel !== 'Loading...') {
      setDeepLinkUrl(`pulsarapp://connect?code=${channel}`);
    } else {
      setDeepLinkUrl('');
    }
  }, [channel]);

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
  }

  return (
    <div className={['not-content', style.background].join(' ')}>
      <div className={style.content}>
        <div className={style.title}>Connect phone</div>
        <div className={style.subtitle}>
          Connect your haptic device first. Pair it with the app now so you can test the presets.
        </div>

        {!paired ? (
          <div className={style.codebox}>
            <img
              src={refreshIcon.src}
              alt="Refresh"
              className={`${style.icon}`}
              onClick={handleReset}
            />

            <div className={style.connectionData}>
              <div className={style.codeSection}>
                <div className={style.prompt}>Your pairing code:</div>
                <div className={style.code}>{channel}</div>
              </div>

              {deepLinkUrl && <div className={style.alternative}>or</div>}

              <div className={style.qrSection}>
                {deepLinkUrl && (
                  <div className={style.qrWrap}>
                    <div className={style.prompt}>Scan to open PulsarApp</div>
                    <QRCodeCanvas
                      value={deepLinkUrl}
                      size={200}
                      bgColor="#e1f3fa"
                      fgColor="#001a72"
                    />
                  </div>
                )}
              </div>
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
            <div className={style.promptSuccess}>Pulsar is paired with your phone.</div>
            <div className={style.subPrompt}>Now just open pulsar app.</div>
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
              <div>Download the PulsarApp for App Store or Play Store.</div>
            </Point>
            <Point index={2}>
              <div>Open Playground and find Device Connection section.</div>
            </Point>
            <Point index={3}>
              <div>
                Type Paring code into PulsarApp and click Connect button or scan the QR code.
              </div>
            </Point>
          </Accordion>
        )}
      </div>
    </div>
  );
}
