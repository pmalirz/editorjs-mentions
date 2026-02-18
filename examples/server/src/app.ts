import cors from "cors";
import express from "express";
import type { MentionSource } from "./types";

export function createApp(source: MentionSource): express.Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/mentions/users", async (req, res) => {
    try {
      const query = typeof req.query.query === "string" ? req.query.query : "";
      const trigger = typeof req.query.trigger === "string" ? req.query.trigger : "@";
      const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : 8;
      const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 8;

      const items = await source.search({ query, trigger, limit });
      res.json({ items });
    } catch (error) {
      res.status(500).json({
        error: "Failed to load mention candidates",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return app;
}

