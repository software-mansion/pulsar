export const API_SERVER_URL = 'https://pulsar-server.swmansion.com';
// export const API_SERVER_URL = 'http://localhost:8080';

export const SOCKET_SERVER_URL = 'wss://pulsar-server.swmansion.com';
// export const SOCKET_SERVER_URL = 'ws://localhost:8080';

// Origin of the Pulsar Studio web app — the "Edit in Studio" button appends
// `/open?preset=<name>` to this (see components/studioLink.ts). It must be the base
// under which Studio's SPA is actually served (Studio uses root routing, no basename),
// so if Studio moves to a sub-path the SPA needs a matching router basename. Flip to the
// localhost line while running Studio locally (`studio` dev server, port 5182).
export const STUDIO_URL = 'https://pulsar.swmansion.com/studio';
// export const STUDIO_URL = 'http://localhost:5182';
