import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateClinicalSoapFallback } from "../src/utils/clinicalAssistantFallback.ts";

dotenv.config();

function getApiKey(req?: any): string | undefined {
  const headerKey = req?.headers?.["x-api-key"] || req?.headers?.["authorization"]?.replace(/^Bearer\s+/i, "");
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    (typeof headerKey === "string" && headerKey.trim().length > 10 ? headerKey.trim() : undefined)
  )?.trim();
}

function getAIClient(req?: any): GoogleGenAI | null {
  const apiKey = getApiKey(req);
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite", // ultra fast, lower latency for SOAP generation
  "gemini-2.5-flash",
  "gemini-3.8-flash"
];

async function callGemini(ai: GoogleGenAI, prompt: string, systemInstruction: string): Promise<string> {
  const timeoutMs = 20000;
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
            maxOutputTokens: 2000
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${model}`)), timeoutMs))
      ]) as any;

      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`[Vercel soap-ai] Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Semua model AI sedang tidak tersedia.");
}

export default async function handler(req: any, res: any) {
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
    const rawPatientData = req.body?.patientData;
    const patientData = typeof rawPatientData === "string" ? rawPatientData.trim().slice(0, 8000) : "";

    if (!patientData) {
      return res.status(400).json({ error: "Data pasien diperlukan." });
    }

    const ai = getAIClient(req);
    if (!ai) {
      return res.status(200).json({ text: generateClinicalSoapFallback(patientData) });
    }

    const prompt = `Role: Kamu adalah apoteker klinis di bangsal penyakit dalam yang menulis catatan SOAP untuk rekam medis.

Goal: Ubah data pasien mentah menjadi catatan SOAP terstruktur dengan fokus pada penilaian farmakoterapi.

Context: Data pasien akan diberikan berupa keluhan, riwayat penyakit, daftar obat, hasil lab, dan tanda vital. Pembaca catatan adalah dokter dan apoteker lain.

Requirements:
- Kelompokkan menjadi empat bagian: SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN. PASTIKAN JUDUL BAGIAN INI DITULIS MENGGUNAKAN HURUF KAPITAL SEMUA (UPPERCASE).
- Pada Assessment, identifikasi setiap Drug Related Problem (DRP) dan beri alasan singkat.
- Pada Plan, sertakan rencana monitoring (parameter, frekuensi, target).
- WAJIB Sertakan referensi Evidence-Based Medicine (EBM), literatur, jurnal, atau guideline medis pada bagian akhir.

Output Format: Markdown dengan heading tiap bagian SOAP. Assessment dan Plan memakai daftar bernomor. Maksimal 500 kata.

Restrictions: Jangan membuat data yang tidak diberikan. Jangan memberi dosis pasti tanpa data berat badan dan fungsi ginjal.

Data pasien:
${patientData}`;

    try {
      const responseText = await callGemini(ai, prompt, "You are an elite Clinical Pharmacologist writing clinical SOAP notes.");
      return res.status(200).json({ text: responseText });
    } catch (geminiError: any) {
      console.warn("[Vercel soap-ai] Gemini failed, using fallback:", geminiError?.message);
      return res.status(200).json({ text: generateClinicalSoapFallback(patientData) });
    }
  } catch (err: any) {
    console.error("[Vercel soap-ai] Unexpected error:", err);
    return res.status(200).json({ text: generateClinicalSoapFallback(req.body?.patientData || "") });
  }
}
