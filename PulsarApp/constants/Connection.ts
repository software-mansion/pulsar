export const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
// export const API_SERVER_URL = 'http://localhost:8080';

export const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';
// export const SOCKET_SERVER_URL = 'ws://localhost:8080';

export const FIGMA_PREVIEW_URL = 'https://docs.swmansion.com/pulsar/figma-preview/';
// Local override for testing live haptics-config updates against a
// listener-equipped preview before docs is redeployed: run
// `cd figma/preview && npm run dev` (serves :5173) and swap the line above for
// the one below. iOS simulator reaches the host via localhost; a physical
// device needs the machine's LAN IP instead.
// export const FIGMA_PREVIEW_URL = 'http://localhost:5173/';

