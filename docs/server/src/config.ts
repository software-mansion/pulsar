export const PORT = process.env.PORT || 8080;

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL env var is required (inject it into the container at runtime).');
}
export const DATABASE_URL: string = url;
