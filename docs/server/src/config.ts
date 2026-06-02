export const PORT = process.env.PORT || 8080;

// Neon Postgres connection string for the Figma plugin project store. Must be
// provided via env (see .env.example). No inline fallback — keeping the URL out
// of the source tree avoids ever committing credentials.
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL env var is required. Copy docs/server/.env.example to .env and set the value.'
  );
}
export const DATABASE_URL: string = url;
