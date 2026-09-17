import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createApiMiddleware } from "./src/studio/server/api-router";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use the API middleware we found in the repo
  const apiMiddleware = createApiMiddleware();
  app.use(async (req, res, next) => {
    // The middleware expects (req, res, next). Express handles it natively.
    await apiMiddleware(req, res, next);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
