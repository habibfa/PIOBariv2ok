import {
  initAnalyticsEngine,
  trackTelemetry,
  recordHeartbeat,
  getAggregatedAnalytics,
  getStoredEvents,
  resetAnalyticsStore
} from "../server/analyticsEngine.ts";
import { verifyAdminAuth } from "../server/security.ts";

initAnalyticsEngine();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = req.url || "";

  try {
    if (url.includes("/track") && req.method === "POST") {
      const result = trackTelemetry(req.body, req);
      return res.status(200).json(result);
    }

    if (url.includes("/heartbeat") && req.method === "POST") {
      const result = recordHeartbeat(req.body, req);
      return res.status(200).json(result);
    }

    if (url.includes("/stats") && req.method === "GET") {
      const timeRange = (req.query?.timeRange as '24h' | '7d' | '30d') || '24h';
      const timezone = (req.query?.timezone as string) || 'Asia/Jakarta';
      const stats = getAggregatedAnalytics(timeRange, timezone);
      return res.status(200).json(stats);
    }

    if (url.includes("/events") && req.method === "GET") {
      const isAuthorized = verifyAdminAuth(req);
      if (!isAuthorized) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const limit = Math.min(Number(req.query?.limit) || 50, 200);
      const events = getStoredEvents({ limit });
      return res.status(200).json(events);
    }

    if (url.includes("/reset") && req.method === "POST") {
      const isAuthorized = verifyAdminAuth(req);
      if (!isAuthorized) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const resetResult = resetAnalyticsStore();
      return res.status(200).json(resetResult);
    }

    // Default status
    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    console.error("[Vercel Analytics Error]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
