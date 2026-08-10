// Pulsar backend + Studio hosts for the docs playground/pairing components.
//
// Resolved from the build environment instead of the old hand-swapped
// commented-out localhost lines. Resolution:
//   1. An explicit `PUBLIC_PULSAR_ENV` (local | staging | production) wins — set
//      it in docs/.env to force a tier (Astro only exposes `PUBLIC_`-prefixed
//      vars to client code).
//   2. Otherwise it follows the build mode: `npm run dev` (astro dev) → local,
//      `astro build` → production.
// So running the docs locally automatically talks to a local server (port 8080)
// and Studio (port 5182); the deployed docs talk to production.

export type PulsarEnv = 'local' | 'staging' | 'production';

interface PulsarHosts {
  api: string;
  socket: string;
  // Origin of the Pulsar Studio web app — the "Edit in Studio" button appends
  // `/open?preset=<name>` to this (see components/studioLink.ts). It must be the
  // base under which Studio's SPA is actually served (Studio uses root routing,
  // no basename), so if Studio moves to a sub-path the SPA needs a matching
  // router basename.
  studio: string;
}

const HOSTS: Record<PulsarEnv, PulsarHosts> = {
  local: {
    api: 'http://localhost:8080',
    socket: 'ws://localhost:8080',
    studio: 'http://localhost:5182',
  },
  // PLACEHOLDER: no staging tier exists yet — fill in when provisioned.
  staging: {
    api: 'https://pulsar-server-staging.swmansion.com',
    socket: 'wss://pulsar-server-staging.swmansion.com',
    studio: 'https://pulsar-staging.swmansion.com/studio',
  },
  production: {
    api: 'https://pulsar-server.swmansion.com',
    socket: 'wss://pulsar-server.swmansion.com',
    studio: 'https://pulsar.swmansion.com/studio',
  },
};

function resolveEnv(): PulsarEnv {
  const explicit = (import.meta.env.PUBLIC_PULSAR_ENV as string | undefined)
    ?.trim()
    .toLowerCase();
  if (explicit === 'local' || explicit === 'staging' || explicit === 'production') {
    return explicit;
  }
  return import.meta.env.DEV ? 'local' : 'production';
}

export const PULSAR_ENV: PulsarEnv = resolveEnv();

const hosts = HOSTS[PULSAR_ENV];

export const API_SERVER_URL = hosts.api;
export const SOCKET_SERVER_URL = hosts.socket;
export const STUDIO_URL = hosts.studio;
