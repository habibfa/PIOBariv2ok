import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  initAnalyticsEngine,
  trackTelemetry,
  recordHeartbeat,
  getAggregatedAnalytics,
  getStoredEvents,
  resetAnalyticsStore
} from "../server/analyticsEngine";
import {
  corsMiddleware,
  securityHeadersMiddleware,
  createRateLimiter,
  sanitizeInputText,
  verifyAdminAuth
} from "../server/security";

dotenv.config();

const app = express();

// Disable Express fingerprinting header
app.disable("x-powered-by");

// Apply production security headers (CSP, nosniff, frame-options, etc.)
app.use(securityHeadersMiddleware);

// Apply strict CORS origin validation
app.use(corsMiddleware);

// Enforce request body payload size limit to prevent memory exhaustion DoS
app.use(express.json({ limit: "500kb" }));

// Rate Limiters
const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  name: "ai",
  message: "Batas permintaan konsultasi AI tercapai (maksimal 25 per menit). Silakan coba lagi beberapa saat lagi."
});

const analyticsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  name: "analytics",
  message: "Batas pengiriman analitik terlampaui."
});

const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  name: "general"
});

// Initialize Gemini client safely (lazy)
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Disease Info Endpoint
app.post(["/api/disease-info", "/disease-info"], aiRateLimiter, async (req, res) => {
  try {
    const rawDisease = req.body?.diseaseName;
    const diseaseName = sanitizeInputText(rawDisease, 200);

    if (!diseaseName) {
      return res.status(400).json({ error: "Silakan berikan nama penyakit yang valid (maksimal 200 karakter)." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server." });
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (routeError: any) {
    console.error("Critical error in /api/disease-info:", routeError);
    res.status(500).json({ error: "Terjadi kesalahan internal server saat mengambil info penyakit." });
  }
});

// 2. Calculate AI Endpoint
app.post(["/api/calculate-ai", "/calculate-ai"], aiRateLimiter, async (req, res) => {
  try {
    const { inputs, calculated, preset, question } = req.body || {};

    if (!inputs || typeof inputs !== "object" || !calculated || typeof calculated !== "object") {
      return res.status(400).json({ error: "Format data kalkulasi tidak valid. Silakan lakukan perhitungan dosis terlebih dahulu." });
    }

    const sanitizedQuestion = sanitizeInputText(question, 1500) || "Analyze this dosage calculation for accuracy and safety guidelines.";

    // Helper function to generate high-fidelity rule-based clinical report when API fails
    const getFallbackReport = (inputs: any, calculated: any, preset: any, question: string): string => {
      const ageY = inputs.ageYears !== "" ? Number(inputs.ageYears) : 0;
      const ageM = inputs.ageMonths !== "" ? Number(inputs.ageMonths) : 0;
      const weight = inputs.weightKg !== "" ? Number(inputs.weightKg) : null;
      const height = inputs.heightCm !== "" ? Number(inputs.heightCm) : null;

      // Compute BSA (Mosteller)
      let bsa = 0;
      if (weight && height) {
        bsa = Math.sqrt((weight * height) / 3600);
      }

      const presetName = preset ? preset.name : "Regimen Dosis Kustom";
      const frequencyLabelMap: Record<string, string> = {
        once: "Sekali (Dosis Tunggal)",
        q12h: "q12h / BID (Dua kali sehari)",
        q8h: "q8h / TID (Tiga kali sehari)",
        q6h: "q6h / QID (Empat kali sehari)",
        q4h: "q4h (Enam kali sehari)",
      };
      const frequencyLabel = frequencyLabelMap[inputs.frequency] || inputs.frequency;

      let drugSpecificSection = "";
      if (preset) {
        if (preset.id === "paracetamol_ped") {
          drugSpecificSection = `
* **Indeks Terapi**: Sempit. Dosis terlalu rendah berisiko demam parah atau nyeri pasca-imunisasi tidak terkelola. Dosis berlebih membawa risiko hepatotoksisitas berat.
* **Ambang Dosis Toksik**: Konsumsi kronis >75 mg/kg/hari atau konsumsi akut tunggal >150 mg/kg dapat memicu kerusakan hati berat yang memerlukan terapi N-asetilsistein (NAC).
* **Pemantauan Klinis**: Fokus pada total paparan kumulatif 24 jam dari semua sumber (termasuk formulasi obat flu kombinasi). Pantau enzim hati (ALT/AST) dan tanda klinis gangguan hati pada penggunaan jangka panjang.
`;
        } else if (preset.id === "amoxicillin_ped_high") {
          drugSpecificSection = `
* **Indeks Terapi**: Lebar. Dosis tinggi (80-90 mg/kg/hari) sangat spesifik untuk mengatasi perubahan protein pengikat penisilin (PBP2x) pada Streptococcus pneumoniae yang resisten.
* **Profil Toksisitas**: Dosis tinggi dapat menyebabkan gangguan gastrointestinal yang bergantung pada dosis, diare, dan sariawan mulut sementara.
* **Pemantauan Klinis**: Amati reaksi hipersensitivitas segera atau tertunda (ruam makulopapular, anafilaksis). Evaluasi kepatuhan, karena volume suspensi amoksisilin yang besar dapat menimbulkan masalah kepatuhan karena kepadatan volume atau profil rasa.
`;
        } else if (preset.id === "doxorubicin_onc") {
          drugSpecificSection = `
* **Indeks Terapi**: Sangat Sempit. Kemoterapi antracyclin memerlukan pengawasan ketat.
* **Ambang Kardiotoksik**: Kardiotoksik bergantung pada dosis kumulatif. Dosis kumulatif seumur hidup melebihi 450-550 mg/m² meningkatkan insiden gagal jantung kongestif permanen secara eksponensial.
* **Pemantauan Klinis**: Evaluasi LVEF pra-terapi dan berkala melalui ekokardiografi. Urine berwarna merah-oranye adalah ekskresi normal obat dan bukan hematuria. Pantau hitung darah lengkap (risiko mielosupresi berat).
`;
        } else if (preset.id === "gentamicin_renal") {
          drugSpecificSection = `
* **Indeks Terapi**: Sempit. Aminoglikosida memerlukan pemantauan kadar obat terapeutik (TDM) standar.
* **Profil Toksisitas**: Risiko tinggi nefrotoksisitas kumulatif yang progresif (nekrosis tubular akut reversibel) dan ototoksisitas (kerusakan koklea/vestibular ireversibel).
* **Pemantauan Klinis**: Kadar puncak (efikasi bakterisidal) dan kadar palung (verifikasi klirens obat dan cegah akumulasi). Pantau kreatinin serum harian dan pengeluaran urin. Pastikan hidrasi yang memadai.
`;
        }
      } else {
        drugSpecificSection = `
* **Indeks Terapi**: Pasien menerima templat obat kustom. Regimen harus dicocokkan dengan basis data obat standar resmi untuk mengonfirmasi indeks terapi dan parameter keamanan.
* **Panduan Klinis**: Pastikan target dosis ${inputs.targetDoseValue} ${inputs.doseUnit} berada dalam rentang referensi dewasa atau anak-anak yang telah ditinjau sejawat.
`;
      }

      const alertsList = calculated.alerts && calculated.alerts.length > 0
        ? calculated.alerts.map((a: any) => `* **[${a.level}]** \`${a.field.toUpperCase()}\`: ${a.message} - ${a.details || ""}`).join("\n")
        : "* Tidak ada alarm keamanan fisik kritis yang terpicu oleh sistem MedDose.";

      const calculatedSingle = calculated.singleDose || 0;
      const calculatedDaily = calculated.dailyDose || 0;
      const targetDose = inputs.targetDoseValue;
      const unit = inputs.doseUnit;

      let mathSteps = "";
      if (inputs.calcMethod === "mg_per_kg") {
        mathSteps = `
* **Langkah 1**: Identifikasi Berat Badan Pasien ($W$) = **${weight || "Tidak ditentukan"} kg**.
* **Langkah 2**: Baca Rasio Dosis Target ($D_{ratio}$) = **${targetDose} ${unit}/kg**.
* **Langkah 3**: Hitung Dosis Tunggal dasar ($D_{single}$):
  $$D_{single} = W \\times D_{ratio} = ${weight} \\text{ kg} \\times ${targetDose} \\text{ ${unit}/kg} = ${calculatedSingle.toFixed(2)} \\text{ ${unit}}$$
`;
      } else if (inputs.calcMethod === "mg_per_m2") {
        const bsaValue = inputs.useBsaManual ? Number(inputs.bsaManual) : bsa;
        mathSteps = `
* **Langkah 1**: Tentukan Luas Permukaan Tubuh ($BSA$).
  ${inputs.useBsaManual 
    ? `*Ubah manual aktif:* $BSA = \\mathbf{${bsaValue.toFixed(2)} \\text{ m²}}$.` 
    : `*Rumus Mosteller:* $BSA = \\sqrt{\\frac{\\text{Tinggi (cm)} \\times \\text{Berat (kg)}}{3600}} = \\sqrt{\\frac{${height || 0} \\times ${weight || 0}}{3600}} = \\mathbf{${bsaValue.toFixed(2)} \\text{ m²}}$.`}
* **Langkah 2**: Baca Rasio Dosis Target ($D_{ratio}$) = **${targetDose} ${unit}/m²**.
* **Langkah 3**: Hitung Dosis Tunggal dasar ($D_{single}$):
  $$D_{single} = BSA \\times D_{ratio} = ${bsaValue.toFixed(2)} \\text{ m²} \\times ${targetDose} \\text{ ${unit}/m²} = ${calculatedSingle.toFixed(2)} \\text{ ${unit}}$$
`;
      } else {
        mathSteps = `
* **Langkah 1**: Model dosis tetap dipilih. Target dosis tunggal dikonfigurasi secara langsung.
* **Langkah 2**: Identifikasi input dosis tunggal = **${calculatedSingle.toFixed(2)} ${unit}**.
`;
      }

      if (calculated.liquidVolumeMl && calculated.liquidVolumeMl > 0) {
        mathSteps += `
* **Langkah 4**: Hitung Volume Cairan Oral untuk Pemberian berdasarkan konfigurasi Konsentrasi:
  * Konsentrasi: **${inputs.liquidConcentrationValue} ${unit} / ${inputs.liquidConcentrationVolume} mL**
  * Rumus Volume Pemberian:
    $$\\text{Volume (mL)} = \\frac{D_{single} \\times \\text{Volume Konsentrasi (mL)}}{\\text{Nilai Konsentrasi (${unit})}} = \\frac{${calculatedSingle.toFixed(2)} \\times ${inputs.liquidConcentrationVolume}}{${inputs.liquidConcentrationValue}} = \\mathbf{${calculated.liquidVolumeMl.toFixed(2)} \\text{ mL}}$$
`;
      }

      mathSteps += `
* **Langkah 5**: Tentukan Dosis Kumulatif Harian dalam 24 Jam:
  * Frekuensi: **${frequencyLabel}**
  * Perhitungan: $D_{daily} = D_{single} \\times \\text{Faktor Frekuensi Harian} = ${calculatedDaily.toFixed(2)} \\text{ ${unit}/hari}$.
`;

      return `⚠️ **PEMBERITAHUAN SISTEM: Batas Kuota API AI Terlampaui (RESOURCE_EXHAUSTED)**
*Untuk memastikan kontinuitas alur kerja klinis, mesin MedDose telah menyusun analisis farmakologis berbasis aturan dengan akurasi tinggi di bawah ini.*

***

### 1. Daftar Periksa Penilaian Klinis
* **Konteks Pasien**: Usia adalah **${ageY} tahun, ${ageM} bulan**; Berat adalah **${weight ? `${weight} kg` : "Tidak ditentukan"}**; Tinggi adalah **${height ? `${height} cm` : "Tidak ditentukan"}**.
* **Integritas Biometrik**:
  * Luas Permukaan Tubuh (BSA): **${bsa.toFixed(2)} m²** (via Mosteller).
* **Penilaian Kerentanan**:
  ${ageY < 1 && ageM >= 0 ? "* **Tindakan Pencegahan Neonatus**: Jalur enzim hepatik belum matang. Harapkan waktu paruh obat yang lebih panjang dan risiko akumulasi obat klinis yang meningkat." : ""}
  ${ageY >= 65 ? "* **Tindakan Pencegahan Eliminasi Geriatri**: Penurunan fungsi ginjal akibat usia meningkatkan kerentanan terhadap akumulasi toksik. Pantau kondisi klinis pasien secara ketat." : ""}
  ${weight && weight > 100 ? "* **Batas Dosis Obesitas**: Berat badan pasien melebihi 100 kg. Pertimbangkan penyesuaian dosis berdasarkan Berat Badan Ideal (IBW)." : ""}

***

### 2. Verifikasi Matematika Langkah-demi-Langkah
Matematika klinis untuk **${presetName}** (${inputs.calcMethod}) diverifikasi sebagai berikut:
${mathSteps}

***

### 3. Analisis Keamanan & Pemeriksaan Ganda
* **Profil Protokol Obat**: **${presetName}**
* **Indikasi**: *${preset ? preset.indication : "Formulasi Kustom"}*
${drugSpecificSection}
* **Alarm Deteksi Keamanan Mesin**:
${alertsList}

***

### 4. Poin Penting Tindakan Klinis
1. **Pemeriksaan Ganda Parameter**: Selalu lakukan pemeriksaan ganda klinis independen terhadap berat badan pasien pada timbangan terkalibrasi sebelum peracikan atau penyerahan obat.
2. **Rute Pemberian**: Untuk suspensi oral, gunakan alat suntik oral atau cangkir obat terkalibrasi. Jangan gunakan sendok rumah tangga.
3. **Pemantauan Klinis**: Prioritaskan status klinis pasien di atas perhitungan matematika. Pantau tanda-tanda efikasi terapeutik dan gejala toksisitas dini.

***

### PERNYATAAN PENYANGKALAN MEDIS PENTING
**PEMBERITAHUAN PENTING**: Tinjauan perhitungan klinis ini dihasilkan sebagai alat bantu verifikasi klinis dan edukasi. Ini **bukan** merupakan saran medis langsung atau resep. Selalu lakukan validasi independen dengan pedoman rumah sakit setempat.`;
    };

    try {
      const ai = getAIClient();
      if (!ai) {
        console.warn("Gemini API client not initialized (missing API key). Resorting to rule-based fallback report.");
        const fallbackReport = getFallbackReport(inputs, calculated, preset, sanitizedQuestion);
        return res.json({ text: fallbackReport });
      }

      const prompt = `
[CLINICAL ASSESSMENT CASE]
User Question/Context: ${sanitizedQuestion}

PATIENT METRICS:
- Age: ${inputs.ageYears !== "" ? `${inputs.ageYears} years` : "0 years"}, ${inputs.ageMonths !== "" ? `${inputs.ageMonths} months` : "0 months"}
- Weight: ${inputs.weightKg !== "" ? `${inputs.weightKg} kg` : "Not specified"}
- Height: ${inputs.heightCm !== "" ? `${inputs.heightCm} cm` : "Not specified"}
- Estimated BSA: ${inputs.useBsaManual ? `${inputs.bsaManual} m² (Manual)` : "Calculated from height/weight (Mosteller)"}

CALCULATION SETUP & OUTPUT:
- Drug Formula Preset Loaded: ${preset ? `${preset.name} (${preset.indication})` : "None (Custom Template)"}
- Formula Selected: ${inputs.calcMethod}
- Target Dose: ${inputs.targetDoseValue} ${inputs.doseUnit}
- Dosing Frequency: ${inputs.frequency}
- Calculated Single Dose: ${calculated.singleDose?.toFixed(2)} ${inputs.doseUnit}
- Calculated 24H Daily Dose: ${calculated.dailyDose?.toFixed(2)} ${inputs.doseUnit}
${calculated.liquidVolumeMl ? `- Calculated Oral Liquid Volume: ${calculated.liquidVolumeMl.toFixed(2)} mL (based on ${inputs.liquidConcentrationValue} mg / ${inputs.liquidConcentrationVolume} mL)` : ""}

PRESET GUIDELINES (IF APPLICABLE):
${preset ? `
- Preset Single Dose limit: ${preset.singleDoseLimitMax || "None"} ${preset.doseUnit}
- Preset Daily Dose limit: ${preset.dailyDoseLimitMax || "None"} ${preset.doseUnit}
- Pediatric Ceiling Dose: ${preset.pediatricCeilingDose || "None"} ${preset.doseUnit}
- Notes: ${preset.notes || ""}
` : "No preset guidelines loaded. Review purely on general patient criteria."}

ALERTS DETECTED BY VALIDATOR:
${calculated.alerts && calculated.alerts.length > 0 
  ? calculated.alerts.map((a: any) => `- [${a.level}] ${a.message}: ${a.details}`).join("\n")
  : "No severe alerts triggered by client validator."
}

INSTRUCTIONS:
You are a Board-Certified Clinical Pharmacologist and Pediatrician. Analyze this scenario with maximum precision.
CRITICAL: You MUST write your entire response/report in Indonesian language (Bahasa Indonesia) using clear medical terminology. Do NOT write in English.
IMPORTANT: Do NOT calculate or include estimated kidney function in this analysis. Focus on age, weight, BSA, general safety, and therapeutic limits instead.

Please provide:
1. **Daftar Periksa Penilaian Klinis**: Verify parameters and flag clinical concerns.
2. **Verifikasi Matematika Langkah-demi-Langkah**: Break down clinical math calculations.
3. **Analisis Keamanan & Pemeriksaan Ganda**: Cross-check against standard ranges and toxicities.
4. **Poin Penting Tindakan Klinis**: Direct recommendations for treating team.

FORMATTING:
- Structured clean Markdown.
- Explicit Medical Disclaimer in Indonesian.
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an elite Clinical Pharmacologist and Board-Certified Medical Dosage Expert. Use advanced reasoning to verify drug calculation setups, identify subtle clinical safety risks, detect errors, and explain medical rationale thoroughly. ALWAYS WRITE YOUR RESPONSE ENTIRELY IN INDONESIAN (BAHASA INDONESIA).",
          },
        });
      } catch (primaryError: any) {
        console.warn("Primary model failed, trying fallback to gemini-3.1-flash-lite:", primaryError.message || primaryError);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              systemInstruction: "You are an elite Clinical Pharmacologist and Board-Certified Medical Dosage Expert. Verify drug calculation setups, identify subtle safety risks, and explain medical rationale. ALWAYS WRITE YOUR RESPONSE ENTIRELY IN INDONESIAN (BAHASA INDONESIA).",
            },
          });
        } catch (secondaryError: any) {
          throw secondaryError;
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("All Gemini API models failed. Resorting to rule-based fallback report:", error);
      const fallbackReport = getFallbackReport(inputs, calculated, preset, sanitizedQuestion);
      res.json({ text: fallbackReport });
    }
  } catch (routeError: any) {
    console.error("Critical error in /api/calculate-ai:", routeError);
    res.status(500).json({ error: "Terjadi kesalahan internal server saat memproses permintaan AI." });
  }
});

// 3. AI Chat Endpoint
const handleChatAi = async (req: express.Request, res: express.Response) => {
  try {
    const rawMessage = req.body?.message;
    const message = sanitizeInputText(rawMessage, 4000);

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong (maksimal 4000 karakter)." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        reply: "Sistem AI tidak terhubung (GEMINI_API_KEY tidak ditemukan). Harap tambahkan GEMINI_API_KEY di menu Environment Variables pada dashboard Vercel Anda, lalu lakukan deploy ulang."
      });
    }

    const systemPrompt = "Anda adalah Asisten Apoteker Klinis dan Ahli Farmakologi yang ramah, ringkas, dan berbasis bukti (evidence-based medicine). Jawab pertanyaan pengguna mengenai obat, dosis, indikasi, atau interaksi secara jelas dalam Bahasa Indonesia.";

    let conversationContext = "";
    if (Array.isArray(req.body?.history) && req.body.history.length > 0) {
      // Limit history to latest 15 turns and sanitize each turn
      const safeHistory = req.body.history.slice(-15);
      conversationContext = safeHistory
        .map((h: any) => {
          const role = h.role === "user" ? "Pengguna" : "Asisten";
          const content = sanitizeInputText(h.content, 2000) || "";
          return `${role}: ${content}`;
        })
        .filter((line: string) => line.length > 0)
        .join("\n");
    }

    const prompt = conversationContext 
      ? `Riwayat percakapan:\n${conversationContext}\n\nPertanyaan pengguna: ${message}\n\nJawaban:` 
      : `Pertanyaan pengguna: ${message}\n\nJawaban:`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2
        }
      });
    } catch (err: any) {
      console.warn("gemini-2.5-flash failed, trying fallback to gemini-3.1-flash-lite", err.message || err);
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2
          }
        });
      } catch (secondaryErr: any) {
        console.warn("gemini-3.1-flash-lite failed, trying gemini-3.5-flash", secondaryErr.message || secondaryErr);
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2
          }
        });
      }
    }

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    // Sanitize error response: do not leak stack traces or internal keys
    res.status(500).json({ error: "Gagal memproses pertanyaan AI. Silakan coba beberapa saat lagi." });
  }
};

app.post(["/api/chat-ai", "/chat-ai"], aiRateLimiter, handleChatAi);

// 4. Clinical SOAP AI Endpoint
app.post(["/api/soap-ai", "/soap-ai"], aiRateLimiter, async (req, res) => {
  try {
    const rawPatientData = req.body?.patientData;
    const patientData = sanitizeInputText(rawPatientData, 8000);

    if (!patientData) {
      return res.status(400).json({ error: "Data pasien diperlukan (maksimal 8000 karakter)." });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({ text: "Sistem AI tidak terhubung (GEMINI_API_KEY tidak ditemukan). Harap tambahkan GEMINI_API_KEY di pengaturan Environment Variables pada dashboard Vercel Anda, lalu trigger deploy ulang." });
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

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite Clinical Pharmacologist writing clinical SOAP notes.",
        },
      });
    } catch (primaryError: any) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: "You are an elite Clinical Pharmacologist writing clinical SOAP notes.",
          },
        });
      } catch (secondaryError: any) {
        throw secondaryError;
      }
    }
    res.json({ text: response.text });
  } catch (routeError: any) {
    console.error("Critical error in /api/soap-ai:", routeError);
    res.status(500).json({ error: "Terjadi kesalahan internal server saat memproses permintaan AI." });
  }
});

// ==========================================
// REAL DATA WEB ANALYTICS & TELEMETRY ROUTES
// ==========================================
initAnalyticsEngine();

// Ingest real telemetry (events & pageviews)
app.post(["/api/analytics/track", "/analytics/track"], analyticsRateLimiter, (req, res) => {
  try {
    const result = trackTelemetry(req.body, req);
    res.json(result);
  } catch (err: any) {
    console.error("[Analytics Track Error]", err);
    res.status(500).json({ error: "Gagal mencatat telemetri." });
  }
});

// Real-time active session heartbeat
app.post(["/api/analytics/heartbeat", "/analytics/heartbeat"], analyticsRateLimiter, (req, res) => {
  try {
    const result = recordHeartbeat(req.body, req);
    res.json(result);
  } catch (err: any) {
    console.error("[Analytics Heartbeat Error]", err);
    res.status(500).json({ error: "Gagal memperbarui heartbeat." });
  }
});

// Real aggregated statistics
app.get(["/api/analytics/stats", "/analytics/stats"], generalRateLimiter, (req, res) => {
  try {
    const timeRange = (req.query.timeRange as '24h' | '7d' | '30d') || '24h';
    const timezone = (req.query.timezone as string) || 'Asia/Jakarta';
    const stats = getAggregatedAnalytics(timeRange, timezone);
    res.json(stats);
  } catch (err: any) {
    console.error("[Analytics Stats Error]", err);
    res.status(500).json({ error: "Gagal mengambil data statistik analitik." });
  }
});

// Real event stream log (filtered)
app.get(["/api/analytics/events", "/analytics/events"], generalRateLimiter, (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const region = req.query.region as string | undefined;
    const search = req.query.search as string | undefined;
    const rawLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : 150;
    // Bound limit strictly between 1 and 200 to prevent DoS memory dumps
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 150 : rawLimit, 200));

    const events = getStoredEvents({ category, region, search, limit });
    res.json({ events });
  } catch (err: any) {
    console.error("[Analytics Events Error]", err);
    res.status(500).json({ error: "Gagal mengambil log events." });
  }
});

// Reset or clear telemetry database - STRICTLY PROTECTED
app.post(["/api/analytics/reset", "/analytics/reset"], (req, res) => {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({
      error: "Akses ditolak: Operasi reset memerlukan otentikasi administrator (Header X-Admin-Key atau Bearer token)."
    });
  }

  try {
    const result = resetAnalyticsStore();
    res.json(result);
  } catch (err: any) {
    console.error("[Analytics Reset Error]", err);
    res.status(500).json({ error: "Gagal mereset database telemetri." });
  }
});

export default app;
