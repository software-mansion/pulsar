// Backend hosts for the current tier (local | staging | production). The tier is
// resolved once in constants/env.ts — set `EXPO_PUBLIC_PULSAR_ENV` in `.env` to
// override, otherwise a dev build targets local and a release build targets
// production. See constants/env.ts for the full host map and resolution rules.

import { PULSAR_HOSTS } from '@/constants/env';

export const API_SERVER_URL = PULSAR_HOSTS.api;

export const SOCKET_SERVER_URL = PULSAR_HOSTS.socket;

export const FIGMA_PREVIEW_URL = PULSAR_HOSTS.preview;
