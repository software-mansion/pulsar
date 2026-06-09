import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@pulsar/haptics": resolve(__dirname, "../Pulsar/src/index.ts"),
    },
  },
  server: {
    port: 5180,
  },
});
