import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateClinicalChatFallback } from "../src/utils/clinicalAssistantFallback.ts";

dotenv.config();

function getApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  )?.trim();
}

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = getApiKey();
  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

async function callGemini(ai: GoogleGenAI, prompt: string, systemInstruction: string): Promise<string> {
  const timeoutMs = 12000;
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${model} after ${timeoutMs}ms`)), timeoutMs))
      ]) as any;

      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`[Vercel chat-ai] Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Semua model AI sedang tidak tersedia.");
}

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

    const ai = getAIClient();
    if (!ai) {
      const fallback = generateClinicalChatFallback(message);
      return res.status(200).json({ reply: fallback });
    }

    const systemInstruction = `Kamu adalah "Asisten AI Klinis PIOBARI" (Pelayanan Informasi Obat RSUD Palembang BARI).
Tugasmu adalah memberikan konsultasi klinis farmakologi, dosis obat, skrining interaksi, kompatibilitas IV, keamanan kehamilan/laktasi FDA, penyesuaian gangguan ginjal/hati, dan Evidence-Based Medicine (EBM).
Karakter: Sangat profesional, presisi, berbasis sains farmasi klinis dan Formularium Nasional/RSUD Palembang BARI.
Format: Gunakan markdown yang rapi dengan heading, poin-poin tebal, dan referensi resmi di bagian bawah.
Bahasa: Bahasa Indonesia formal medis.`;

    const contextHistory = history
      .slice(-4)
      .map((h: any) => `${h.role === "user" ? "Pengguna" : "Asisten"}: ${h.content}`)
      .join("\n");

    const prompt = contextHistory
      ? `Riwayat Diskusi:\n${contextHistory}\n\nPertanyaan Terbaru:\n${message}`
      : message;

    try {
      const reply = await callGemini(ai, prompt, systemInstruction);
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
