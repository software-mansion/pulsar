import { useEffect, useState } from "react";
import Modal from "./Modal";
import { API_SERVER_URL, SOCKET_SERVER_URL } from "./config";

declare global {
  interface Window {
    connectionChannel: number;
  }
}

export default function Connection({hideSubtitle = false, children}: {hideSubtitle?: boolean, children?: any}) {
  const [channel, setChannel] = useState<number | string>('Loading...');
  const [status, setStatus] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  function connectToServer() {
    const clientId = localStorage.getItem('hapticsClientId');
    const clientIdQuery = clientId ? `&lastClientId=${clientId}` : '';

    const preferredChannel = localStorage.getItem('hapticsChannel');
    const preferredChannelQuery = preferredChannel ? `&preferred=${preferredChannel}` : '';

    fetch(`${API_SERVER_URL}/generate-channel?${preferredChannelQuery}${clientIdQuery}`)
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        console.error('Failed to get channel from server');
        return;
      }
      console.log('Received channel from server:', data);
      const channelNumber = data.channel;
      setChannel(channelNumber);
      localStorage.setItem('hapticsChannel', channelNumber);
      localStorage.setItem('hapticsBroadcastToken', data.token);

      const statusWs = new WebSocket(`${SOCKET_SERVER_URL}?status=true&channel=${channelNumber}`);
      statusWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
          case 'initial_status': {
            console.log('Connected to status server');
            console.log('Subscribed to channel:', data.subscribedChannel);
            console.log('Current activity:', data.channelActivity);
            const channel = data.channelActivity[channelNumber];
            if (channel) {
              const clientId = channel.clients[channel.clients.length - 1].id;
              localStorage.setItem('hapticsClientId', clientId);
              setStatus(true);
            }
            break;
          }
            
          case 'client_joined': {
            console.log(`New client ${data.clientId} joined channel ${data.channel}`, data);
            const channel = data.channelActivity[data.channel];
            const clientId = channel.clients[channel.clients.length - 1].id;
            localStorage.setItem('hapticsClientId', clientId);
            setStatus(true);
            break;
          }
            
          case 'client_left':
            console.log(`Client ${data.clientId} left channel ${data.channel}`);
            setStatus(false);
            break;
        }
      };
    });
  }
  
  useEffect(() => {
    connectToServer();
  }, []);

  function handleReset() {
    localStorage.removeItem('hapticsChannel');
    localStorage.removeItem('hapticsClientId');
    localStorage.removeItem('hapticsBroadcastToken');
    setStatus(false);
    connectToServer();
  }

  return <div className="not-content connectionBox">
    {!hideSubtitle &&
    <div className="desc">Connect your app to a haptic device. Type this number into <b>PulsarApp</b>.</div>}
    {!hideSubtitle &&
    <div className="desc">How to connect device? 🤔 - <span className="clickableText" onClick={() => setShowHelp(true)}>Connection guide</span></div>}
    <div className="inLineTop">
      <div>
        <div className="topMargin"><b>Paring code:</b></div>
        <div className="inLine">
          <div className="paringCode">{channel}</div>
          <div className="connection-svg-button" onClick={handleReset}>
            <svg viewBox="0 0 119.4 122.88"><path d="M83.91,26.34a43.78,43.78,0,0,0-22.68-7,42,42,0,0,0-24.42,7,49.94,49.94,0,0,0-7.46,6.09,42.07,42.07,0,0,0-5.47,54.1A49,49,0,0,0,30,94a41.83,41.83,0,0,0,18.6,10.9,42.77,42.77,0,0,0,21.77.13,47.18,47.18,0,0,0,19.2-9.62,38,38,0,0,0,11.14-16,36.8,36.8,0,0,0,1.64-6.18,38.36,38.36,0,0,0,.61-6.69,8.24,8.24,0,1,1,16.47,0,55.24,55.24,0,0,1-.8,9.53A54.77,54.77,0,0,1,100.26,108a63.62,63.62,0,0,1-25.92,13.1,59.09,59.09,0,0,1-30.1-.25,58.45,58.45,0,0,1-26-15.17,65.94,65.94,0,0,1-8.1-9.86,58.56,58.56,0,0,1,7.54-75,65.68,65.68,0,0,1,9.92-8.09A58.38,58.38,0,0,1,61.55,2.88,60.51,60.51,0,0,1,94.05,13.3l-.47-4.11A8.25,8.25,0,1,1,110,7.32l2.64,22.77h0a8.24,8.24,0,0,1-6.73,9L82.53,43.31a8.23,8.23,0,1,1-2.9-16.21l4.28-.76Z"/></svg>
          </div>
        </div>
      </div>
      <div className="connectionStatus topMargin">
        <b>Connection status:</b>
        {status ? <div className="connection connection-success"></div> : <div className="connection connection-error"></div>}
      </div>
    </div>
    {showHelp && <Modal title="Connection guide" reset={() => setShowHelp(false)}>{children}</Modal>}
  </div>;
}