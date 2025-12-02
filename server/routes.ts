import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import deviceRoutes from "./deviceRoutes";
import userRoutes from "./userRoutes";
import express from "express";
import { MultiPurposeTokensManager } from "./multiPurposeTokens";
import { incrementWtrClaimsAndReceived } from "./devicesDb";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.use("/api", userRoutes);
  app.use("/api", deviceRoutes);
  app.use("/api", router); // Mount the MPT router here

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

const router = express.Router();
const mptManager = new MultiPurposeTokensManager();

// Holder Opt-In
router.post("/holder-opt-in", async (req, res) => {
  const { account, seed } = req.body;
  if (!account || !seed) {
    return res.status(400).json({ error: "Account and seed are required." });
  }

  try {
    const result = await mptManager.holderOptIn(account, seed);
    res.json({ success: result });
  } catch (error) {
    console.error("Error in holder opt-in:", error);
    res.status(500).json({ error: "Failed to opt-in holder." });
  }
});

// Authorize Holder
router.post("/authorize-holder", async (req, res) => {
  const { account } = req.body;
  if (!account) {
    return res.status(400).json({ error: "Account is required." });
  }

  try {
    const result = await mptManager.authorizeHolder(account);
    res.json({ success: result });
  } catch (error) {
    console.error("Error in authorize holder:", error);
    res.status(500).json({ error: "Failed to authorize holder." });
  }
});

// Mint
router.post("/mint", async (req, res) => {
  const { account, amount } = req.body;
  console.log("[POST /api/mint] Received request:", { account, amount });

  if (!account || !amount) {
    console.error("[POST /api/mint] Missing account or amount");
    return res.status(400).json({ error: "Account and amount are required." });
  }

  try {
    const result = await mptManager.makePayment(account, amount);
    console.log("[POST /api/mint] Mint result:", result);

    // If mint was successful, update device claims/received/lastClaim
    if (result.success) {
      // Amount is a string (float), but DB expects integer (MPT units, AssetScale=2)
      let intAmount = 0;
      try {
        intAmount = Math.round(parseFloat(amount) * 100); // AssetScale=2
      } catch (e) {
        intAmount = 0;
      }
      if (intAmount > 0) {
        incrementWtrClaimsAndReceived(account, intAmount);
      }
    }

    res.json(result);
  } catch (error) {
    console.error("[POST /api/mint] Error in mint:", error);
    res.status(500).json({ error: "Failed to mint." });
  }
});

export default router;
