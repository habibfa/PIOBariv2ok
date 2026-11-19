import {
  initReviewsEngine,
  getReviewsData,
  addSiteReview,
  markReviewHelpful,
  addAdminReplyToReview,
  deleteSiteReview
} from "./_reviewsEngine";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    initReviewsEngine();

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    if (req.method === "GET") {
      return res.status(200).json(getReviewsData());
    }

    if (req.method === "POST") {
      const action = req.query?.action || body?.action;
      const id = req.query?.id || body?.id;
      if (action === "helpful" && id) {
        return res.status(200).json(markReviewHelpful(String(id)));
      }
      if (action === "reply" && id) {
        return res.status(200).json(addAdminReplyToReview(String(id), body?.replyText || ""));
      }
      const result = addSiteReview(body || {});
      return res.status(201).json(result);
    }

    if (req.method === "DELETE") {
      const id = req.query?.id || body?.id;
      if (!id) {
        return res.status(400).json({ error: "ID ulasan diperlukan." });
      }
      return res.status(200).json(deleteSiteReview(String(id)));
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "Gagal memproses ulasan situs." });
  }
}
