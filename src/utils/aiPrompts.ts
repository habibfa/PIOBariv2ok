import { GoogleGenAI } from "@google/genai";

export const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.8-flash"
];

export function getApiKey(req?: any): string | undefined {
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

export function getAIClient(req?: any): GoogleGenAI | null {
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

/**
 * Executes a resilient cascade across candidate Gemini models with adaptive timeout
 * that respects Vercel Serverless Function 10s ceiling and prevents 504 Gateway Timeouts.
 */
export async function callGeminiAdaptive(
  ai: GoogleGenAI,
  prompt: string,
  options?: {
    systemInstruction?: string;
    maxTotalTimeMs?: number;
    temperature?: number;
    maxOutputTokens?: number;
    tag?: string;
  }
): Promise<string> {
  const maxTotalTimeMs = options?.maxTotalTimeMs || 8500;
  const tag = options?.tag || "ai-call";
  const startTime = Date.now();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    const elapsed = Date.now() - startTime;
    const remainingTime = maxTotalTimeMs - elapsed;

    // Must have at least 2.5s left to attempt a generation call
    if (remainingTime < 2500) {
      console.warn(`[${tag}] Insufficient time left (${remainingTime}ms) before serverless ceiling. Breaking cascade.`);
      break;
    }

    try {
      const config: any = {
        temperature: options?.temperature ?? 0.2
      };
      if (options?.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options?.maxOutputTokens) {
        config.maxOutputTokens = options.maxOutputTokens;
      }

      const res = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout ${model} after ${remainingTime}ms`)), remainingTime)
        )
      ]) as any;

      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`[${tag}] Model ${model} failed after ${Date.now() - startTime}ms:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Semua model AI sedang tidak tersedia.");
}

// -------------------------------------------------------------
// 1. Clinical SOAP Generator
// -------------------------------------------------------------
export const SOAP_SYSTEM_INSTRUCTION =
  "You are an elite Clinical Pharmacologist and Board-Certified Pharmacotherapy Specialist writing structured clinical SOAP notes for hospital electronic medical records. Always respond in Indonesian.";

export function buildSoapPrompt(patientData: string): string {
  return `Role: Kamu adalah apoteker klinis di bangsal penyakit dalam yang menulis catatan SOAP untuk rekam medis.

Goal: Ubah data pasien mentah menjadi catatan SOAP terstruktur dengan fokus pada penilaian farmakoterapi dan Drug Related Problems (DRP).

Context: Data pasien akan diberikan berupa keluhan, riwayat penyakit, daftar obat, hasil lab, dan tanda vital. Pembaca catatan adalah dokter penanggung jawab pelayanan (DPJP) dan apoteker klinis lain.

Requirements:
- Kelompokkan menjadi empat bagian utama: SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN. PASTIKAN JUDUL BAGIAN INI DITULIS MENGGUNAKAN HURUF KAPITAL SEMUA (UPPERCASE) dengan heading markdown (contoh: ### SUBJECTIVE).
- Pada SUBJECTIVE: Rangkum keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu, riwayat alergi, dan riwayat pengobatan sebelumnya.
- Pada OBJECTIVE: Cantumkan tanda-tanda vital (TD, HR, RR, Suhu), parameter lab spesifik (fungsi ginjal eGFR/Cr, glukosa darah, asam urat, elektrolit), dan daftar obat yang sedang digunakan saat ini.
- Pada ASSESSMENT: Identifikasi setiap Drug Related Problem (DRP) secara spesifik (misal: pemilihan obat tidak tepat, dosis berlebih/kurang, interaksi obat bermakna klinis, kontraindikasi fungsi organ, risiko hipoglikemia/nefrotoksisitas) disertai penjelasan patofisiologi/farmakokinetik singkat. Gunakan daftar bernomor.
- Pada PLAN: Berikan rekomendasi perubahan regimen terapi (penghentian, penyesuaian dosis, atau penggantian obat alternatif yang lebih aman), rekomendasi monitoring terinci (parameter klinis dan laboratorium, target terapi), serta edukasi konseling pasien. Gunakan daftar bernomor.
- WAJIB Sertakan referensi Evidence-Based Medicine (EBM) terkini, literatur, guideline resmi (seperti KDIGO, ADA, PERKENI, PERKI, ACR, Formularium Nasional/RSUD Palembang BARI) pada bagian akhir.

Output Format: Markdown rapi dengan heading tiap bagian SOAP (### SUBJECTIVE, ### OBJECTIVE, ### ASSESSMENT, ### PLAN). Assessment dan Plan memakai daftar bernomor. Maksimal 500 kata.

Restrictions: Jangan membuat data fiktif yang tidak diberikan. Jangan memberi dosis pasti tanpa data penunjang berat badan atau fungsi ginjal jika diperlukan.

Data Pasien:
${patientData}`;
}

// -------------------------------------------------------------
// 2. Asisten AI Klinis (Chat AI)
// -------------------------------------------------------------
export const CHAT_SYSTEM_INSTRUCTION =
  `Kamu adalah "Asisten AI Klinis PIOBARI" (Pelayanan Informasi Obat RSUD Palembang BARI).
Tugasmu adalah memberikan konsultasi klinis farmakologi, perhitungan dosis obat, skrining interaksi obat, kompatibilitas IV, keamanan kehamilan/laktasi FDA, penyesuaian gangguan ginjal/hati, dan Evidence-Based Medicine (EBM).
Karakter: Sangat profesional, presisi, ramah, berbasis sains farmasi klinis dan Formularium Nasional/RSUD Palembang BARI.
Format: Gunakan format markdown yang rapi dengan heading, poin-poin tebal yang jelas, dan referensi resmi di bagian bawah jika relevan.
Bahasa: Bahasa Indonesia formal medis yang mudah dipahami tenaga kesehatan maupun pasien.`;

export function buildChatPrompt(message: string, history?: any[]): string {
  let conversationContext = "";
  if (Array.isArray(history) && history.length > 0) {
    const safeHistory = history.slice(-6);
    conversationContext = safeHistory
      .map((h: any) => {
        const role = h.role === "user" ? "Pengguna" : "Asisten AI Klinis";
        const content = typeof h.content === "string" ? h.content.slice(0, 2000) : "";
        return `${role}: ${content}`;
      })
      .filter((line: string) => line.length > 0)
      .join("\n");
  }

  return conversationContext
    ? `Riwayat Percakapan Sebelumnya:\n${conversationContext}\n\nPertanyaan Terbaru Pengguna: ${message}\n\nJawaban Asisten AI Klinis:`
    : `Pertanyaan Pengguna: ${message}\n\nJawaban Asisten AI Klinis:`;
}
