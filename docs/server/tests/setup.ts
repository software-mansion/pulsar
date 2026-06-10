// Runs before any test module is imported (jest `setupFiles`). config.ts throws
// if DATABASE_URL is unset, and importing app/routes/figma-projects pulls it in.
// The value is never dialed: figma-projects tests inject an in-memory pg-mem
// pool, and the HTTP/WS tests never touch the DB.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';
