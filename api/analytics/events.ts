import { initAnalyticsEngine, getStoredEvents } from "../_analyticsEngine.js";

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
    const category = req.query?.category as string | undefined;
    const region = req.query?.region as string | undefined;
    const search = req.query?.search as string | undefined;
    const rawLimit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 150;
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 150 : rawLimit, 250));

    const events = getStoredEvents({ category, region, search, limit });
    return res.status(200).json({ events });
  } catch (err: any) {
    console.error("[Vercel Analytics Events Error]", err);
    return res.status(500).json({ error: "Gagal mengambil log events.", events: [] });
  }
}
