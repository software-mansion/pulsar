export const PORT = process.env.PORT || 8080;

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL env var is required (inject it into the container at runtime).');
}
export const DATABASE_URL: string = url;

// --- Figma OAuth (optional) -------------------------------------------------
// Config for the "read haptics directly from the Figma file" flow. It is
// deliberately optional: deployments that only use the token/DB preview path
// (and the test suite) must still boot without these set. The OAuth routes
// return 503 when isFigmaOAuthConfigured() is false, rather than crashing at
// import time the way DATABASE_URL does.
export const FIGMA_OAUTH_CLIENT_ID = process.env.FIGMA_OAUTH_CLIENT_ID ?? '';
export const FIGMA_OAUTH_CLIENT_SECRET = process.env.FIGMA_OAUTH_CLIENT_SECRET ?? '';
// Must exactly match a callback URL registered on the Figma OAuth app, e.g.
// https://pulsar-server.swmansion.com/figma-auth/callback
export const FIGMA_OAUTH_REDIRECT_URI = process.env.FIGMA_OAUTH_REDIRECT_URI ?? '';
// The plugin id whose private pluginData we read via the REST `plugin_data`
// param. We actually store the haptics under *shared* plugin data (namespace
// below), so this is informational/forward-compatible; the read uses "shared".
export const FIGMA_PLUGIN_ID = process.env.FIGMA_PLUGIN_ID ?? '';
// Namespace used by the plugin's setSharedPluginData calls. Must match
// SHARED_NS in figma/src/main/code.ts.
export const FIGMA_SHARED_NAMESPACE = process.env.FIGMA_SHARED_NAMESPACE || 'pulsar';

export function isFigmaOAuthConfigured(): boolean {
  return Boolean(
    FIGMA_OAUTH_CLIENT_ID && FIGMA_OAUTH_CLIENT_SECRET && FIGMA_OAUTH_REDIRECT_URI,
  );
}
