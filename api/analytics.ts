import {
  initAnalyticsEngine,
  trackTelemetry,
  recordHeartbeat,
  getAggregatedAnalytics,
  getStoredEvents,
  resetAnalyticsStore
} from "./_analyticsEngine.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    initAnalyticsEngine();

    const rawUrl = req.url || "";
    const queryPath = Array.isArray(req.query?.path)
      ? req.query.path.join("/")
      : (req.query?.path as string) || (req.query?.action as string) || "";
    const matchedPath = (req.headers?.["x-matched-path"] as string) ||
                        (req.headers?.["x-forwarded-uri"] as string) ||
                        (req.headers?.["x-vercel-matched-path"] as string) || "";
    const fullRoute = `${rawUrl} ${queryPath} ${matchedPath}`.toLowerCase();

    // 1. Ingest telemetry (events & pageviews)
    if ((fullRoute.includes("track") || queryPath === "track") && req.method === "POST") {
      const result = trackTelemetry(req.body, req);
      return res.status(200).json(result);
    }

    // 2. Real-time active session heartbeat
    if ((fullRoute.includes("heartbeat") || queryPath === "heartbeat") && req.method === "POST") {
      const result = recordHeartbeat(req.body, req);
      return res.status(200).json(result);
    }

    // 3. Stored events log
    if (fullRoute.includes("events") || queryPath === "events") {
      const category = req.query?.category as string | undefined;
      const region = req.query?.region as string | undefined;
      const search = req.query?.search as string | undefined;
      const rawLimit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 150;
      const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 150 : rawLimit, 250));

      const events = getStoredEvents({ category, region, search, limit });
      return res.status(200).json({ events });
    }

    // 4. Reset telemetry database
    if ((fullRoute.includes("reset") || queryPath === "reset") && req.method === "POST") {
      const resetResult = resetAnalyticsStore();
      return res.status(200).json(resetResult);
    }

    // 5. Aggregated statistics (default for GET or /stats)
    if (fullRoute.includes("stats") || queryPath === "stats" || req.method === "GET") {
      const rawRange = String(req.query?.timeRange || "24h");
      const allowedRanges = ["24h", "7d", "30d", "6m", "1y", "all"];
      const timeRange = (allowedRanges.includes(rawRange) ? rawRange : "24h") as '24h' | '7d' | '30d' | '6m' | '1y' | 'all';
      const timezone = (req.query?.timezone as string) || 'Asia/Jakarta';
      const stats = getAggregatedAnalytics(timeRange, timezone, req);
      return res.status(200).json(stats);
    }

    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    console.error("[Vercel Analytics Error]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
