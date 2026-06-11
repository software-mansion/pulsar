// Runs before any test module is imported (jest `setupFiles`). config.ts throws
// if DATABASE_URL is unset, and importing app/routes/figma-projects pulls it in.
// The value is never dialed: figma-projects tests inject an in-memory pg-mem
// pool, and the HTTP/WS tests never touch the DB.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';

// Configure Figma OAuth so isFigmaOAuthConfigured() is true and the OAuth routes
// are mounted (rather than returning 503). config.ts reads these at import time,
// so they must be set here before any module pulls it in. Tests mock global
// fetch, so no real Figma endpoint is ever hit.
process.env.FIGMA_OAUTH_CLIENT_ID = process.env.FIGMA_OAUTH_CLIENT_ID || 'test-client-id';
process.env.FIGMA_OAUTH_CLIENT_SECRET = process.env.FIGMA_OAUTH_CLIENT_SECRET || 'test-secret';
process.env.FIGMA_OAUTH_REDIRECT_URI =
  process.env.FIGMA_OAUTH_REDIRECT_URI || 'https://example.test/figma-auth/callback';
