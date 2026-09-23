import dotenv from "dotenv";
import { generateClinicalChatFallback } from "../src/utils/clinicalAssistantFallback.ts";
import {
  getAIClient,
  callGeminiAdaptive,
  CHAT_SYSTEM_INSTRUCTION,
  buildChatPrompt
} from "../src/utils/aiPrompts.ts";

dotenv.config();

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const rawMessage = req.body?.message;
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, 3000) : "";

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    const ai = getAIClient(req);
    if (!ai) {
      const fallback = generateClinicalChatFallback(message);
      return res.status(200).json({ reply: fallback });
    }

    const prompt = buildChatPrompt(message, history);

    try {
      const reply = await callGeminiAdaptive(ai, prompt, {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        maxTotalTimeMs: 8500,
        maxOutputTokens: 1200,
        temperature: 0.2,
        tag: "Vercel chat-ai"
      });
      return res.status(200).json({ reply });
    } catch (geminiError: any) {
      console.warn("[Vercel chat-ai] Gemini error, returning clinical fallback:", geminiError?.message);
      const fallbackReply = generateClinicalChatFallback(message);
      return res.status(200).json({ reply: fallbackReply });
    }
  } catch (err: any) {
    console.error("[Vercel chat-ai] Unexpected error:", err);
    const safeFallback = generateClinicalChatFallback(req.body?.message || "");
    return res.status(200).json({ reply: safeFallback });
  }
}
