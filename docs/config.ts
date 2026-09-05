export const BASE_PATH = '/pulsar';

// Also imported by vite.web-app.config.ts, which runs in Node without import.meta.env.
const env: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

// Public, write-only key — see src/analytics/README.md.
export const POSTHOG_CONFIG = {
  apiKey: env.PUBLIC_POSTHOG_KEY || 'phc_im7iDRXp3hg6VQ2teOcYCLVsUddGtNOn2ntKdgGk9J0',
  apiHost: env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
} as const;

export const GTM_CONFIG = {
  id: 'GTM-56HH2V3G',
} as const;
