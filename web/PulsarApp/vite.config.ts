import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "pulsar-haptics": resolve(__dirname, "../Pulsar/src/index.ts"),
    },
  },
  server: {
    port: 5180,
  },
});
