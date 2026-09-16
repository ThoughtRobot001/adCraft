import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createApiMiddleware } from "./src/studio/server/api-router";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "adcraft-api-router",
      configureServer(server) {
        server.middlewares.use(createApiMiddleware());
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill process.env in client if needed for safe fallback
    "process.env": {},
  },
});
