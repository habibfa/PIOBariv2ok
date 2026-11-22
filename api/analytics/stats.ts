import { initAnalyticsEngine, getAggregatedAnalytics } from "../_analyticsEngine.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    initAnalyticsEngine();
    const rawRange = String(req.query?.timeRange || "24h");
    const allowedRanges = ["24h", "7d", "30d", "6m", "1y", "all"];
    const timeRange = (allowedRanges.includes(rawRange) ? rawRange : "24h") as '24h' | '7d' | '30d' | '6m' | '1y' | 'all';
    const timezone = (req.query?.timezone as string) || 'Asia/Jakarta';
    const stats = getAggregatedAnalytics(timeRange, timezone, req);
    return res.status(200).json(stats);
  } catch (err: any) {
    console.error("[Vercel Analytics Stats Error]", err);
    return res.status(500).json({ error: "Gagal mengambil data statistik analitik." });
  }
}
