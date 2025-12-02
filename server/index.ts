import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Example usage of environment variables
const WTR_ISSUER_ADDRESS = process.env.WTR_ISSUER_ADDRESS;
const WTR_ISSUER_SEED = process.env.WTR_ISSUER_SEED;
const WTR_MPT_ID = process.env.WTR_MPT_ID;

// console.log("Loaded WTR Issuer Details:", {
//   address: WTR_ISSUER_ADDRESS,
//   seed: WTR_ISSUER_SEED,
//   mptId: WTR_MPT_ID,
// });

console.log('[server/index.ts] Backend starting...');
import userRoutes from './userRoutes';
import oracleRoutes from './oracleRoutes';

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Commented logging for error responses to reduce console clutter
      if (capturedJsonResponse && 'error' in capturedJsonResponse) {
        // log(logLine);
      } else {
        log(logLine);
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use('/api', userRoutes);
  app.use('/api', oracleRoutes); // Register oracleRoutes

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`Open the app: http://localhost:${port}`);
  });
})();
