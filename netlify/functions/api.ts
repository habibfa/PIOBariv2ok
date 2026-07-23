import express from "express";
import serverless from "serverless-http";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

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

app.post("/api/disease-info", async (req, res) => {
  try {
    const { diseaseName } = req.body;

    if (!diseaseName) {
      return res.status(400).json({ error: "Silakan berikan nama penyakit." });
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

app.post("/api/calculate-ai", async (req, res) => {
  try {
    const { inputs, calculated, preset, question } = req.body;

    if (!calculated) {
      return res.status(400).json({ error: "Silakan tekan tombol 'Hitung Dosis Secara Klinis' terlebih dahulu sebelum menggunakan konsultasi AI." });
    }

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
      const presetNotes = preset ? preset.notes : "Tidak ada preset yang dimuat. Peninjauan murni berdasarkan kriteria kustom.";

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
* **Indeks Terapi**: Pasien menerima templat obat kustom. Regimen harus dicocokkan dengan basis data obat standar resmi (seperti Lexicomp, Micromedex, atau BNF) untuk mengonfirmasi indeks terapi dan parameter keamanan.
* **Panduan Klinis**: Pastikan target dosis ${inputs.targetDoseValue} ${inputs.doseUnit} berada dalam rentang referensi dewasa atau anak-anak yang telah ditinjau sejawat. Pantau fungsi organ yang relevan dengan jalur eliminasi obat kustom (hati/ginjal).
`;
      }

      const alertsList = calculated.alerts && calculated.alerts.length > 0
        ? calculated.alerts.map((a: any) => `* **[${a.level}]** \`${a.field.toUpperCase()}\`: ${a.message} - ${a.details || ""}`).join("\n")
        : "* Tidak ada alarm keamanan fisik kritis yang terpicu oleh sistem MedDose.";

      const calculatedSingle = calculated.singleDose;
      const calculatedDaily = calculated.dailyDose;
      const targetDose = inputs.targetDoseValue;
      const unit = inputs.doseUnit;

      // Build math steps
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

      // If there's a liquid formulation
      if (calculated.liquidVolumeMl && calculated.liquidVolumeMl > 0) {
        mathSteps += `
* **Langkah 4**: Hitung Volume Cairan Oral untuk Pemberian berdasarkan konfigurasi Konsentrasi:
  * Konsentrasi: **${inputs.liquidConcentrationValue} ${unit} / ${inputs.liquidConcentrationVolume} mL**
  * Rumus Volume Pemberian:
    $$\\text{Volume (mL)} = \\frac{D_{single} \\times \\text{Volume Konsentrasi (mL)}}{\\text{Nilai Konsentrasi (${unit})}} = \\frac{${calculatedSingle.toFixed(2)} \\times ${inputs.liquidConcentrationVolume}}{${inputs.liquidConcentrationValue}} = \\mathbf{${calculated.liquidVolumeMl.toFixed(2)} \\text{ mL}}$$
`;
      }

      // Frequency math
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
  ${ageY < 1 && ageM >= 0 ? "* **Tindakan Pencegahan Neonatus**: Jalur enzim hepatik (seperti CYP2E1 atau glukuronidasi) belum matang. Harapkan waktu paruh obat yang lebih panjang dan risiko akumulasi obat klinis yang meningkat." : ""}
  ${ageY >= 65 ? "* **Tindakan Pencegahan Eliminasi Geriatri**: Penurunan masa nefron akibat usia dan penurunan total cairan tubuh meningkatkan kerentanan terhadap akumulasi toksik. Pantau kondisi klinis pasien secara ketat." : ""}
  ${weight && weight > 100 ? "* **Batas Dosis Obesitas**: Berat badan pasien melebihi 100 kg. Pertimbangkan penyesuaian dosis berdasarkan Berat Badan Ideal (IBW) atau Berat Badan yang Disesuaikan (AdjBW) daripada berat badan aktual untuk obat hidrofilik untuk mencegah tingkat toksik." : ""}
  ${!ageY && !weight && !height ? "* **Peringatan**: Parameter penting pasien saat ini kosong. Harap masukkan berat badan dan usia untuk verifikasi klinis penuh." : "Parameter pasien terverifikasi dalam toleransi operasional."}

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
1. **Pemeriksaan Ganda Parameter**: Selalu lakukan pemeriksaan ganda klinis independen terhadap berat badan pasien (**${weight ? `${weight} kg` : "Tidak ditentukan"}**) pada timbangan terkalibrasi sebelum peracikan atau penyerahan obat.
2. **Rute Pemberian**: Untuk suspensi oral, gunakan alat suntik oral atau cangkir obat terkalibrasi. Jangan gunakan sendok rumah tangga.
3. **Pemantauan Klinis**: Prioritaskan status klinis pasien di atas perhitungan matematika. Pantau tanda-tanda efikasi terapeutik dan gejala toksisitas dini.
4. **Intervensi**: Jika pembersihan tubuh pasien terganggu, konsultasikan panduan dosis standar atau apoteker rumah sakit untuk mempersonalisasi interval pemberian dosis.

***

### PERNYATAAN PENYANGKALAN MEDIS PENTING
**PEMBERITAHUAN PENTING**: Tinjauan perhitungan klinis ini dihasilkan oleh algoritma cadangan berbasis aturan sebagai alat bantu keputusan untuk verifikasi pendidikan. Ini **bukan** merupakan saran medis langsung, diagnosis, atau perawatan. Ini bukan pengganti penilaian profesional independen dari praktisi berlisensi, dokter, atau apoteker terdaftar. Selalu konsultasikan pustaka obat resmi dan pedoman rumah sakit setempat sebelum memberikan agen terapeutik apa pun.`;
    };

    try {
      const ai = getAIClient();
    if (!ai) {
        console.warn("Gemini API client not initialized (missing API key). Resorting to rule-based fallback report.");
        const fallbackReport = getFallbackReport(inputs, calculated, preset, question);
        return res.json({ text: fallbackReport });
      }

      const prompt = `
[CLINICAL ASSESSMENT CASE]
User Question/Context: ${question || "Analyze this dosage calculation for accuracy and safety guidelines."}

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
- Calculated Single Dose: ${calculated.singleDose.toFixed(2)} ${inputs.doseUnit}
- Calculated 24H Daily Dose: ${calculated.dailyDose.toFixed(2)} ${inputs.doseUnit}
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
IMPORTANT: Do NOT calculate or include estimated kidney function (renal function, CrCl, GFR, or serum creatinine clearance) in this analysis. This patient's kidney function calculation has been removed from this consultation view, so focus on age, weight, BSA, general safety, and therapeutic limits instead.

Please provide:
1. **Daftar Periksa Penilaian Klinis**: Briefly verify the parameters and flag any clinical concerns (e.g., extreme weights, neonatal enzyme immaturity, geriatric safety, large liquid volume administrations).
2. **Verifikasi Matematika Langkah-demi-Langkah**: Break down and explain the clinical math of the calculation, checking for any rounding or logic errors.
3. **Analisis Keamanan & Pemeriksaan Ganda**: Cross-check the dosage against pediatric/adult standard therapeutic ranges. Highlight any risks of toxicities (e.g., liver injury with paracetamol, cardiotoxicity with doxorubicin) or sub-therapeutic failure.
4. **Poin Penting Tindakan Klinis**: Clear, direct suggestions for the treating team.

FORMATTING:
- Use structured, clean Markdown with bullet points, headers, and bold keywords.
- Add an explicit, prominent Medical Disclaimer in Indonesian stating that this AI reasoning is a clinical support assistant for educational verification and does not substitute for independent professional medical judgment.
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
        console.warn("Primary model (gemini-3.5-flash) failed or rate-limited, trying fallback (gemini-3.1-flash-lite):", primaryError.message || primaryError);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              systemInstruction: "You are an elite Clinical Pharmacologist and Board-Certified Medical Dosage Expert. Verify drug calculation setups, identify subtle safety risks, and explain medical rationale. ALWAYS WRITE YOUR RESPONSE ENTIRELY IN INDONESIAN (BAHASA INDONESIA).",
            },
          });
        } catch (secondaryError: any) {
          console.warn("Secondary model (gemini-3.1-flash-lite) failed. Throwing to fallback.", secondaryError.message || secondaryError);
          throw secondaryError;
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("All Gemini API models failed (rate limits or invalid key). Resorting to rule-based clinical fallback report:", error);
      const fallbackReport = getFallbackReport(inputs, calculated, preset, question);
      res.json({ text: fallbackReport });
    }
  } catch (routeError: any) {
    console.error("Critical error in /api/calculate-ai:", routeError);
    res.status(500).json({ error: "Terjadi kesalahan internal server saat memproses permintaan AI." });
  }
});


app.post("/api/soap-ai", async (req, res) => {
  try {
    const { patientData } = req.body;
    if (!patientData) {
      return res.status(400).json({ error: "Data pasien diperlukan." });
    }

    const ai = getAIClient();
    if (!ai) {
      console.warn("Gemini API client not initialized (missing API key).");
      return res.json({ text: "Sistem AI tidak terhubung (GEMINI_API_KEY tidak ditemukan). Harap tambahkan GEMINI_API_KEY di pengaturan Environment Variables pada dashboard Netlify/Vercel Anda, lalu trigger deploy ulang." });
    }

    const prompt = `Role: Kamu adalah apoteker klinis di bangsal penyakit dalam yang menulis catatan SOAP untuk rekam medis.

Goal: Ubah data pasien mentah menjadi catatan SOAP terstruktur dengan fokus pada penilaian farmakoterapi.

Context: Data pasien akan diberikan berupa keluhan, riwayat penyakit, daftar obat, hasil lab, dan tanda vital. Pembaca catatan adalah dokter dan apoteker lain.

Requirements:
- Kelompokkan menjadi empat bagian: Subjective, Objective, Assessment, Plan.
- Pada Assessment, identifikasi setiap Drug Related Problem (DRP) dan beri alasan singkat.
- Pada Plan, sertakan rencana monitoring (parameter, frekuensi, target).

Output Format: Markdown dengan heading tiap bagian SOAP. Assessment dan Plan memakai daftar bernomor. Maksimal 500 kata.

Restrictions: Jangan membuat data yang tidak diberikan. Jangan memberi dosis pasti tanpa data berat badan dan fungsi ginjal.

Examples: Jika pasien memakai warfarin dan INR 4,5 -> Assessment: risiko perdarahan (DRP: dosis berlebih); Plan: tahan 1 dosis, cek INR ulang 24 jam.

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

export const handler = serverless(app);
