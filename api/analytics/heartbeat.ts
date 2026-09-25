import { initAnalyticsEngine, recordHeartbeat } from "../../server/analyticsEngine.ts";

initAnalyticsEngine();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const result = recordHeartbeat(req.body, req);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[Vercel Analytics Heartbeat Error]", err);
    return res.status(500).json({ error: "Gagal memperbarui heartbeat." });
  }
}
