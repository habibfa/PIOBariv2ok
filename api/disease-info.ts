import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateClinicalDiseaseFallback } from "../src/utils/clinicalAssistantFallback.ts";

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

async function callGemini(ai: GoogleGenAI, prompt: string): Promise<string> {
  const timeoutMs = 5000;
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${model}`)), timeoutMs))
      ]) as any;

      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`[Vercel disease-info] Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Semua model AI sedang tidak tersedia.");
}

export default async function handler(req: any, res: any) {
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
    const rawDisease = req.body?.diseaseName;
    const diseaseName = typeof rawDisease === "string" ? rawDisease.trim().slice(0, 200) : "";

    if (!diseaseName) {
      return res.status(400).json({ error: "Silakan berikan nama penyakit yang valid." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(200).json({ text: generateClinicalDiseaseFallback(diseaseName) });
    }

    const prompt = `Anda adalah sistem pakar medis seperti Medscape Diseases & Conditions.
Berikan artikel klinis terperinci mengenai penyakit: "${diseaseName}".
Gunakan format markdown dan sertakan bagian-bagian berikut:
1. **Ikhtisar/Definisi**
2. **Etiologi & Patofisiologi** (Penyebab dan mekanisme penyakit)
3. **Epidemiologi**
4. **Presentasi Klinis** (Tanda dan gejala)
5. **Pemeriksaan Fisik & Diagnostik** (Pemeriksaan fisik dan lab/imaging yang relevan)
6. **Penatalaksanaan & Pengobatan** (Tata laksana farmakologis dan non-farmakologis, pedoman umum)
7. **Komplikasi & Prognosis**
8. **Evidence-Based & Referensi** (Sertakan daftar panduan klinis utama atau literatur/jurnal medis terkait seperti pedoman medis, Medscape, PubMed, dll yang menjadi dasar dari informasi tersebut)

Format dalam bahasa Indonesia yang sangat klinis, akurat, profesional, namun mudah dibaca. Pastikan untuk memisahkan setiap bagian dengan heading markdown (H2 atau H3).

Penafian (sertakan di paling bawah, cetak miring): *Catatan: Artikel ini ditujukan sebagai referensi informasi klinis umum dan bukan pengganti penilaian medis profesional secara langsung.*`;

    try {
      const responseText = await callGemini(ai, prompt);
      return res.status(200).json({ text: responseText });
    } catch (geminiErr: any) {
      console.warn("[Vercel disease-info] Gemini failed, using fallback:", geminiErr?.message);
      return res.status(200).json({ text: generateClinicalDiseaseFallback(diseaseName) });
    }
  } catch (err: any) {
    console.error("[Vercel disease-info] Unexpected error:", err);
    return res.status(200).json({ text: generateClinicalDiseaseFallback(req.body?.diseaseName || "Penyakit") });
  }
}
