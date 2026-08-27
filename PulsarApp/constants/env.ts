// Which Pulsar backend tier this build talks to, and the hosts for each tier.
//
// PulsarApp is an Expo/React Native app, so the tier is fixed at BUILD time.
// Resolution:
//   1. An explicit `EXPO_PUBLIC_PULSAR_ENV` (local | staging | production) wins —
//      set it in `.env` to point a build at a specific tier (e.g. run a dev build
//      against staging). Expo inlines `EXPO_PUBLIC_*` values at build time.
//   2. Otherwise it follows the build mode: `__DEV__` → local, release → production.
//      So a Metro dev build automatically targets your local server and a release
//      build targets production, with no source edits.
//
// This mirrors Studio (`studio/src/env.ts`) and the Figma plugin
// (`figma/src/ui/lib/env.ts`) in pulsar-private — the same `local | staging |
// production` concept and host map, adapted to Expo. This is the one place the
// mobile app's backend hosts live; before this they were hard-coded to production
// in constants/Connection.ts with a commented-out localhost line you swapped by hand.

export type PulsarEnv = 'local' | 'staging' | 'production';

export interface PulsarHosts {
  /** Relay/pairing HTTP API (create-channel, broadcast). */
  api: string;
  /** Relay/pairing WebSocket. */
  socket: string;
  /** Figma live-preview base URL (opened inside the app's WebView). */
  preview: string;
}

const HOSTS: Record<PulsarEnv, PulsarHosts> = {
  local: {
    api: 'http://localhost:8080',
    socket: 'ws://localhost:8080',
    // iOS simulator reaches the host via localhost; a physical device needs the
    // machine's LAN IP instead (swap localhost for it in your local `.env` build).
    preview: 'http://localhost:5173/',
  },
  staging: {
    api: 'https://pulsar-server.swmtest.xyz',
    socket: 'wss://pulsar-server.swmtest.xyz',
    preview: 'https://pulsar.swmtest.xyz/figma-preview/',
  },
  production: {
    api: 'https://pulsar-server.swmansion.com',
    socket: 'wss://pulsar-server.swmansion.com',
    // The live preview is served by the Studio deployment, at the APEX — NOT
    // under the /studio prefix (that path falls through to the Studio SPA's
    // index.html). Mirrors the Figma plugin's `preview` host.
    preview: 'https://pulsar.swmansion.com/figma-preview/',
  },
};

function resolveEnv(): PulsarEnv {
  const explicit = process.env.EXPO_PUBLIC_PULSAR_ENV?.trim().toLowerCase();
  if (explicit === 'local' || explicit === 'staging' || explicit === 'production') {
    return explicit;
  }
  return __DEV__ ? 'local' : 'production';
}

export const PULSAR_ENV: PulsarEnv = resolveEnv();
export const PULSAR_HOSTS: PulsarHosts = HOSTS[PULSAR_ENV];
