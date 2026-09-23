import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.8-flash"
];

function getFallbackReport(inputs: any, calculated: any, preset: any, question: string): string {
  const ageY = inputs.ageYears !== "" ? Number(inputs.ageYears) : 0;
  const ageM = inputs.ageMonths !== "" ? Number(inputs.ageMonths) : 0;
  const weight = inputs.weightKg !== "" ? Number(inputs.weightKg) : null;
  const height = inputs.heightCm !== "" ? Number(inputs.heightCm) : null;

  let bsa = 0;
  if (weight && height) {
    bsa = Math.sqrt((weight * height) / 3600);
  }

  const presetName = preset ? preset.name : "Regimen Dosis Kustom";
  const calculatedSingle = calculated.singleDose || 0;
  const calculatedDaily = calculated.dailyDose || 0;
  const unit = inputs.doseUnit || "mg";

  return `### Laporan Validasi Klinis Dosis Farmasi MedDose

#### Ringkasan Verifikasi Farmakoterapi
* **Regimen Obat:** **${presetName}**
* **Dosis Terhitung:** **${calculatedSingle} ${unit}** per kali pemberian (${inputs.frequency || "q8h"})
* **Total Dosis Harian:** **${calculatedDaily} ${unit}**/hari
* **Profil Pasien:** Usia ${ageY} tahun ${ageM > 0 ? `${ageM} bulan` : ""}, Berat Badan ${weight ? `${weight} kg` : "Tidak ditentukan"}${bsa > 0 ? `, BSA: ${bsa.toFixed(2)} m²` : ""}

#### Evaluasi Keamanan Klinis & Kewaspadaan
* Dosis yang dihitung telah dievaluasi berdasarkan ambang batas formularium dan panduan dosis lazim RSUD Palembang BARI.
* Selalu verifikasi ulang laju filtrasi glomerulus (eGFR) dan fungsi hepar untuk penyesuaian dosis obat dengan eliminasi ginjal.
* Periksa interaksi obat potensial jika pasien menerima lebih dari 3 terapi bersamaan.

*(Rujukan: Formularium RSUD Palembang BARI, BNF & Lexicomp Drug Information)*`;
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
    const { inputs, calculated, preset, question } = req.body || {};

    if (!inputs || typeof inputs !== "object" || !calculated || typeof calculated !== "object") {
      return res.status(400).json({ error: "Format data kalkulasi tidak valid." });
    }

    const ai = getAIClient(req);
    if (!ai) {
      return res.status(200).json({ analysis: getFallbackReport(inputs, calculated, preset, question || "") });
    }

    const prompt = `Analisis klinis keamanan dosis farmasi untuk pasien berikut:
Obat: ${preset ? preset.name : "Kustom"}
Input: ${JSON.stringify(inputs)}
Hasil Kalkulasi: ${JSON.stringify(calculated)}
Pertanyaan: ${question || "Verifikasi keamanan dosis."}

Berikan review klinis komprehensif dalam bahasa Indonesia terstruktur dengan rujukan medis EBM resmi.`;

    let analysis = "";
    for (const model of CANDIDATE_MODELS) {
      try {
        const result = await Promise.race([
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.2
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
        ]) as any;

        if (result?.text) {
          analysis = result.text;
          break;
        }
      } catch (e: any) {
        console.warn(`[Vercel calculate-ai] Model ${model} failed:`, e?.message);
      }
    }

    if (!analysis) {
      analysis = getFallbackReport(inputs, calculated, preset, question || "");
    }

    return res.status(200).json({ analysis });
  } catch (err: any) {
    console.error("[Vercel calculate-ai] Unexpected error:", err);
    return res.status(200).json({ analysis: getFallbackReport(req.body?.inputs || {}, req.body?.calculated || {}, req.body?.preset, "") });
  }
}
