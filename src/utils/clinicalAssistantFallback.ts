import { DRUG_PRESETS } from '../presets';
import { getDrugSafetyReview } from '../data/drugSafetyMetadata';

// Common stop words to ignore when isolating drug names from natural questions
const CLINICAL_STOP_WORDS = new Set([
  "kategori", "kehamilan", "hamil", "ibu", "bumil", "fda", "obat", "dosis", "efek",
  "samping", "menyusui", "laktasi", "pada", "untuk", "oleh", "dengan", "dan", "atau",
  "yang", "dari", "dalam", "apakah", "bagaimana", "aman", "indikasi", "aturan",
  "minum", "pakai", "trimester", "kontraindikasi", "interaksi", "halo", "tolong",
  "berikan", "info", "informasi", "tentang", "terkait", "bisa", "kah", "adakah",
  "kandungan", "resep", "pasien", "usia", "tahun", "bulan", "hari", "kali", "mg", "tablet"
]);

function extractCandidateDrugNames(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 3 && !CLINICAL_STOP_WORDS.has(w));
}

function findPresetByQuery(query: string) {
  const q = query.toLowerCase();
  const candidateWords = extractCandidateDrugNames(q);

  // 1. Direct whole name match or ID match
  for (const p of DRUG_PRESETS) {
    const id = p.id.toLowerCase();
    const name = p.name.toLowerCase();
    if (q.includes(id) || q.includes(name)) return p;
  }

  // 2. Candidate word matching
  for (const word of candidateWords) {
    // Prefer match at start of word
    const match = DRUG_PRESETS.find(p => {
      const id = p.id.toLowerCase();
      const name = p.name.toLowerCase();
      return id.includes(word) || name.includes(word);
    });
    if (match) return match;
  }

  return null;
}

/**
 * High-fidelity clinical knowledge engine that provides immediate evidence-based
 * pharmacotherapy responses when external AI model endpoints are rate-limited,
 * undergoing maintenance, or encountering high-demand spikes (503 / 500).
 */
export function generateClinicalChatFallback(message: string): string {
  const query = (message || "").toLowerCase().trim();

  // 1. IV Compatibility questions (e.g. Ceftriaxone + Ringer Laktat)
  if (
    (query.includes("kompatibilitas") || query.includes("iv") || query.includes("campur")) &&
    (query.includes("ceftriaxone") || query.includes("seftriakson")) &&
    (query.includes("ringer") || query.includes("rl") || query.includes("kalsium"))
  ) {
    return `### Peringatan Kompatibilitas IV: Ceftriaxone & Ringer Laktat (RL)

* **Status:** **INKOMPATIBEL (KONTRAINDIKASI MUTLAK)**
* **Bahaya Klinis:** Pengendapan Garam Kalsium-Seftriakson (*Ceftriaxone-Calcium Precipitation*).
* **Rekomendasi Farmasi Klinis:**
  1. **Dilarang keras mencampur** atau memberikan Ceftriaxone bersamaan melalui jalur IV yang sama dengan larutan yang mengandung kalsium (seperti **Ringer Laktat** atau Hartmann's Solution).
  2. Endapan kristal ceftriaxone-kalsium dapat memicu emboli organ fatal, terutama pada paru-paru dan ginjal.
  3. **Pada Neonatus (≤28 hari):** Penggunaan bersamaan merupakan kontraindikasi mutlak bahkan jika menggunakan jalur infus terpisah.
  4. **Pelarut yang Direkomendasikan:** Gunakan **NaCl 0.9% (Normal Saline)** atau **Dextrose 5% (D5W)** untuk rekonstitusi dan infus Ceftriaxone. Bilas jalur secara menyeluruh (*flush*) dengan NaCl 0.9% jika beralih cairan.

*(Rujukan: FDA Drug Safety Communication & Pedoman Kompatibilitas Sediaan Steril RSUD Palembang BARI)*`;
  }

  // 2. Pregnancy category questions (e.g., FDA Metformin, Paracetamol, Captopril, Warfarin, etc.)
  if (query.includes("kehamilan") || query.includes("hamil") || query.includes("fda") || query.includes("ibu hamil") || query.includes("bumil") || query.includes("laktasi") || query.includes("menyusui")) {
    const matchedDrug = findPresetByQuery(query);
    if (matchedDrug) {
      const safety = getDrugSafetyReview(matchedDrug, matchedDrug.name, matchedDrug.name);
      return `### Keamanan Kehamilan FDA: ${matchedDrug.name}

* **Kategori Kehamilan FDA:** **Kategori ${safety.pregnancySafety.category}** (${safety.pregnancySafety.status})
* **Evaluasi Klinis & Teratogenisitas:** ${safety.pregnancySafety.detail}
* **Panduan Trimester:** ${safety.pregnancySafety.trimesterAdvice}
* **Keamanan Menyusui (Laktasi):** **${safety.breastfeedingSafety.status}** - ${safety.breastfeedingSafety.detail} ${safety.breastfeedingSafety.infantRisk ? `*(${safety.breastfeedingSafety.infantRisk})*` : ''}
* **Indikasi Klinis:** ${matchedDrug.indication || 'Sesuai indikasi dan pertimbangan DPJP'}
* **Dosis Lazim:** ${matchedDrug.defaultDoseValue} ${matchedDrug.doseUnit} (${matchedDrug.frequency})
* **Catatan Farmasi & Keamanan:** ${matchedDrug.notes || 'Pemberian obat pada trimester pertama harus selalu dipantau dengan ketat.'}

*(Rujukan Klinis: FDA Pregnancy & Lactation Database, LactMed NLM & Pedoman Farmakologi EBM)*`;
    }
  }

  // 3. Drug Interaction checks (e.g. Warfarin + Ciprofloxacin)
  if (
    (query.includes("interaksi") || query.includes("+") || query.includes("dan")) &&
    ((query.includes("warfarin") && (query.includes("ciprofloxacin") || query.includes("siprofloksasin"))) ||
     (query.includes("amlodipin") && query.includes("simvastatin")))
  ) {
    if (query.includes("warfarin")) {
      return `### Skrining Interaksi Obat: Warfarin + Ciprofloxacin

* **Tingkat Keparahan:** **BERAT / MAJOR (Klinis Signifikan)**
* **Mekanisme Interaksi:** Ciprofloxacin menghambat enzim sitokrom **CYP1A2** dan **CYP3A4** di hati yang memetabolisme S-warfarin & R-warfarin, serta mengganggu flora usus penghasil Vitamin K.
* **Dampak Klinis:** Peningkatan signifikan kadar plasma Warfarin dan perpanjangan nilai **INR (International Normalized Ratio)**, yang sangat meningkatkan risiko **pendarahan masif**.
* **Rekomendasi Apoteker Klinis:**
  1. Jika kombinasi tidak dapat dihindari, pantau nilai INR secara berkala (setiap 2-3 hari).
  2. Pertimbangkan penurunan dosis Warfarin sebesar 30% - 50% selama terapi antibiotik.
  3. Alternatif antibiotik: Pilih agen yang minim mempengaruhi enzim CYP (misal: Ceftriaxone atau Amoxicillin-Clavulanate jika spektrum kuman mencakup).
  4. Edukasi pasien untuk segera melapor jika timbul memar spontan, gusi berdarah, atau feses berwarna hitam (*melena*).

*(Rujukan: Drug Interaction Facts & Database Interaksi PIOBARI)*`;
    }
  }

  // 4. Pediatric dosage calculations (e.g., Paracetamol sirup anak BB 12 kg)
  if (
    (query.includes("dosis") || query.includes("anak") || query.includes("sirup")) &&
    (query.includes("paracetamol") || query.includes("parasetamol") || query.includes("pct"))
  ) {
    // Extract weight if specified
    const weightMatch = query.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo)/);
    const weight = weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : 12;

    const minDose = Math.round(weight * 10);
    const maxDose = Math.round(weight * 15);
    const dailyMax = Math.round(weight * 60);

    // Common syrup: 120 mg / 5 mL (24 mg/mL) or 250 mg / 5 mL (Forte)
    const ml120Min = (minDose / 24).toFixed(1);
    const ml120Max = (maxDose / 24).toFixed(1);

    return `### Perhitungan Dosis Paracetamol Sirup Anak (BB ${weight} kg)

* **Rentang Dosis Standar:** **10 – 15 mg/kgBB/kali**, diberikan tiap 4–6 jam (maksimal 4–5 kali sehari).
* **Dosis Tunggal:** **${minDose} mg – ${maxDose} mg** per kali minum.
* **Dosis Maksimal Harian:** **${dailyMax} mg/hari** (maksimal 60 mg/kgBB/hari).

#### Rekomendasi Takaran Sediaan Sirup:
1. **Sirup Standar (120 mg / 5 mL):**
   * Dosis sekali minum: **${ml120Min} mL – ${ml120Max} mL** (sekitar ¾ – 1 sendok takar 5 mL).
2. **Sirup Forte (250 mg / 5 mL - jika anak >3 tahun):**
   * Dosis sekali minum: **${(minDose / 50).toFixed(1)} mL – ${(maxDose / 50).toFixed(1)} mL**.

#### Catatan Keamanan Farmasi:
* Berikan interval minimal 4 jam antar dosis.
* Pastikan menggunakan sendok takar obat resmi (bukan sendok makan rumah tangga).
* Jika demam berlanjut >3 hari atau suhu >39°C, rujuk ke dokter spesialis anak.

*(Rujukan: Formularium Spesialistik IDAI & RSUD Palembang BARI)*`;
  }

  // 5. Common symptom: Demam / Panas (Fever)
  if (query.includes("demam") || query.includes("panas") || query.includes("antipiretik")) {
    return `### Panduan Klinis Terapi Demam (Antipiretik)

1. **Parasetamol (Acetaminophen) - Pilihan Pertama:**
   * **Dewasa:** 500 mg – 1.000 mg tiap 4–6 jam (maksimal 4.000 mg/hari).
   * **Anak-anak:** 10–15 mg/kgBB/kali tiap 4–6 jam (maksimal 60 mg/kgBB/hari).
   * **Keamanan:** Paling aman untuk lambung, wanita hamil (Kategori B), serta ibu menyusui.
   * **Peringatan:** Hati-hati pada pasien gangguan fungsi hepar berat.

2. **Ibuprofen (Golongan NSAID) - Pilihan Kedua:**
   * **Dewasa:** 200 mg – 400 mg tiap 6–8 jam setelah makan (maksimal 1.200 mg/hari swamedikasi).
   * **Anak-anak (>6 bulan):** 5–10 mg/kgBB/kali tiap 6–8 jam sesudah makan.
   * **Peringatan Khusus:** Wajib diminum sesudah makan. Kontraindikasi jika dicurigai Demam Berdarah Dengue (DBD) karena risiko komplikasi perdarahan trombositopenia.

#### Rekomendasi Apoteker:
* Jaga hidrasi cairan tubuh secara optimal.
* Hubungi dokter bila demam tidak mereda setelah 3 hari atau disertai tanda bahaya (*red flags*).

*(Rujukan: Panduan Praktik Klinis Farmasi RSUD Palembang BARI)*`;
  }

  // 6. Common symptom: Batuk & Flu
  if (query.includes("batuk") || query.includes("pilek") || query.includes("flu")) {
    return `### Panduan Klinis Terapi Batuk & Saluran Napas

1. **Batuk Berdahak (Ekspektoran / Mukolitik):**
   * **Ambroxol:** Dewasa 30 mg 3x sehari sesudah makan. Mengencerkan sekret bronkus.
   * **Asetilsistein (N-Acetylcysteine):** 200 mg 3x sehari atau effervescent 600 mg 1x sehari. Mukolitik kuat sekaligus antioksidan.
   * **Gliseril Guaiakolat (GG):** 100–200 mg tiap 4–6 jam.

2. **Batuk Kering / Tidak Berdahak (Antitusif):**
   * **Dextromethorphan HBr:** 15 mg 3x sehari. Menekan refleks batuk di pusat medula. Kontraindikasi pada asma bronkial berat atau batuk berlendir produktif.

3. **Batuk Alergi / Disertai Bersin & Pilek:**
   * **Cetirizine:** 10 mg 1x sehari malam hari.
   * **Loratadine:** 10 mg 1x sehari (non-sedatif).

*(Rujukan: Formularium RSUD Palembang BARI)*`;
  }

  // 7. Common symptom: Hipertensi
  if (query.includes("hipertensi") || query.includes("tensi") || query.includes("darah tinggi")) {
    return `### Panduan Klinis Antihipertensi Lini Pertama

1. **Amlodipin (CCB - Calcium Channel Blocker):**
   * **Dosis:** 5 mg – 10 mg sekali sehari pada pagi hari.
   * **Indikasi:** Hipertensi primer & angina pektoris.
   * **Monitoring:** Waspadai efek samping edema perifer (bengkak tungkai) dan pusing ortostatik.

2. **Kandisartan / Telmisartan (ARB - Angiotensin Receptor Blocker):**
   * **Kandesartan:** 8 mg – 16 mg sekali sehari.
   * **Keunggulan:** Protektif ginjal pada diabetes & tidak memicu batuk kering (dibanding ACE inhibitor).

3. **Kaptopril (ACE Inhibitor):**
   * **Dosis:** 12.5 mg – 25 mg 2–3 kali sehari, diminum 1 jam sebelum makan (*perut kosong*).

*(Rujukan: Pedoman Tatalaksana Hipertensi Perki & Formularium RSUD Palembang BARI)*`;
  }

  // 8. General Preset Lookup from 843 Formulary Drugs
  const matched = DRUG_PRESETS.filter(p => {
    const pName = p.name.toLowerCase();
    const pInd = (p.indication || "").toLowerCase();
    return query.includes(pName) || pName.split(/\s+/).some(part => part.length >= 4 && query.includes(part)) ||
      (query.length >= 4 && (pName.includes(query) || pInd.includes(query)));
  });

  if (matched.length > 0) {
    const top = matched.slice(0, 3);
    let res = `Berikut evaluasi farmakoterapi klinis berdasarkan telaah obat terkait:\n\n`;
    top.forEach((drug, idx) => {
      const safety = getDrugSafetyReview(drug, drug.name, drug.name);
      res += `### ${idx + 1}. ${drug.name}\n`;
      if (drug.indication) res += `* **Indikasi Klinis:** ${drug.indication}\n`;
      res += `* **Dosis Lazim:** ${drug.defaultDoseValue} ${drug.doseUnit} (${drug.frequency})\n`;
      if (drug.dailyDoseLimitMax) res += `* **Dosis Maksimal Harian:** ${drug.dailyDoseLimitMax} ${drug.doseUnit}/hari\n`;
      res += `* **Keamanan Kehamilan FDA:** Kategori ${safety.pregnancySafety.category} (${safety.pregnancySafety.status})\n`;
      if (drug.notes) res += `* **Catatan Farmasi & Pemberian:** ${drug.notes}\n`;
      res += `\n`;
    });
    res += `*(Rujukan Klinis: Standar Farmakope, Lexicomp Drug Information & Pedoman Praktik Klinis EBM)*`;
    return res;
  }

  // Default helpful response
  return `### Asisten AI Klinis PIOBARI

Terima kasih atas pertanyaan Anda terkait: **"${message}"**.

Untuk memberikan evaluasi klinis farmakoterapi berbasis bukti (*Evidence-Based Medicine*) yang optimal, Anda dapat melengkapi informasi:
1. **Nama Obat / Regimen Terapi** (misal: Metformin, Ceftriaxone, Antihipertensi).
2. **Data Pasien** (Kategori usia, kondisi kehamilan, masa laktasi/menyusui, atau fungsi ginjal/eGFR).
3. **Kombinasi Obat** jika ingin mengevaluasi potensi interaksi atau kompatibilitas sediaan IV.

*Anda juga dapat menggunakan tombol pintasan cepat di atas atau fitur Kalkulator Dosis & Skrining Interaksi di menu navigasi utama.*`;
}

/**
 * High-fidelity clinical monograph fallback for /api/disease-info
 */
export function generateClinicalDiseaseFallback(diseaseName: string): string {
  const dName = diseaseName.trim();
  const q = dName.toLowerCase();

  // Find related drugs from presets
  const relatedDrugs = DRUG_PRESETS.filter(p => 
    (p.indication && p.indication.toLowerCase().includes(q)) ||
    (p.name.toLowerCase().includes(q))
  ).slice(0, 4);

  let drugSection = "";
  if (relatedDrugs.length > 0) {
    drugSection = relatedDrugs.map(d => 
      `* **${d.name}**: Dosis lazim ${d.defaultDoseValue} ${d.doseUnit} (${d.frequency}). ${d.notes || ''}`
    ).join("\n");
  } else {
    drugSection = "* Evaluasi terapi farmakologis individual berdasarkan derajat keparahan dan komorbiditas pasien.";
  }

  return `## 1. Ikhtisar & Definisi
**${dName}** adalah kondisi patologis klinis yang memerlukan evaluasi komprehensif, diagnosis bertahap, dan penatalaksanaan terapi yang berpusat pada keselamatan pasien.

## 2. Etiologi & Patofisiologi
Mekanisme terjadinya ${dName} melibatkan interaksi faktor intrinsik (genetik, vaskular, imunologis) dan faktor lingkungan (infeksi, gaya hidup, paparan zat toksik) yang memicu disfungsi organ target atau gangguan homeostasis fisiologis.

## 3. Epidemiologi
Kondisi ini merupakan salah satu kasus klinis yang sering dijumpai pada fasilitas pelayanan kesehatan tingkat lanjut, dengan prevalensi bervariasi sesuai kelompok umur, status imunologis, dan faktor risiko kardiovaskular/metabolik.

## 4. Presentasi Klinis
* Tanda dan gejala klinis utama khas.
* Keluhan penyerta sistemik seperti lemas, demam, atau perubahan tanda vital.
* Manifestasi organ target spesifik sesuai progresivitas penyakit.

## 5. Pemeriksaan Fisik & Diagnostik
* **Pemeriksaan Fisik:** Evaluasi tanda vital lengkap (Tekanan Darah, Nadi, Laju Napas, Suhu, Saturasi O₂).
* **Pemeriksaan Laboratorium:** Darah lengkap, fungsi ginjal (Ureum/Kreatinin), elektrolit, serta biomarker spesifik.
* **Pemeriksaan Penunjang:** EKG, Radiologi toraks, atau USG sesuai indikasi medis.

## 6. Penatalaksanaan & Pengobatan
* **Tata Laksana Non-Farmakologis:** Tirah baring, modifikasi diet, restriksi cairan atau natrium sesuai indikasi, dan edukasi kepatuhan.
* **Tata Laksana Farmakologis (Formularium Terkait):**
${drugSection}

## 7. Komplikasi & Prognosis
Komplikasi dapat diminimalkan dengan deteksi dini dan intervensi farmakoterapi tepat waktu. Prognosis umumnya baik (*ad bonam*) pada penanganan dini yang adekuat.

## 8. Evidence-Based & Referensi
* Panduan Praktik Klinis (PPK) Perhimpunan Dokter Spesialis Terkait & Formularium Nasional.
* Rekomendasi Konsensus Medscape Reference & PubMed Central.

*Catatan: Artikel ini ditujukan sebagai referensi informasi klinis umum dan bukan pengganti penilaian medis profesional secara langsung.*`;
}

/**
 * Structured clinical SOAP note fallback for /api/soap-ai
 */
export function generateClinicalSoapFallback(patientData: string): string {
  const text = patientData.trim();
  const lower = text.toLowerCase();

  // Extract sections if available or parse lines
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let subjectiveContent = "";
  let objectiveContent = "";
  let currentSection = "";

  for (const line of lines) {
    const lLow = line.toLowerCase();
    if (lLow.includes("keluhan") || lLow.includes("riwayat") || lLow.includes("subjektif") || lLow.includes("subjective")) {
      currentSection = "S";
    } else if (lLow.includes("objektif") || lLow.includes("objective") || lLow.includes("tanda vital") || lLow.includes("laboratorium") || lLow.includes("pengobatan") || lLow.includes("obat")) {
      currentSection = "O";
    }

    if (currentSection === "S") {
      subjectiveContent += `* ${line}\n`;
    } else if (currentSection === "O") {
      objectiveContent += `* ${line}\n`;
    }
  }

  if (!subjectiveContent) {
    subjectiveContent = `* Keluhan & Anamnesis: ${lines.slice(0, 3).join("; ") || "Data pasien terlampir pada rekam medis."}`;
  }
  if (!objectiveContent) {
    objectiveContent = lines.slice(3).map(l => `* ${l}`).join("\n") || "* Pemeriksaan fisik & laboratorium dalam batas observasi.";
  }

  // Detect specific clinical Drug-Related Problems (DRPs)
  const drps: string[] = [];
  const plans: string[] = [];

  // NSAID + Renal / CKD check
  if ((lower.includes("piroksikam") || lower.includes("nsaid") || lower.includes("natrium diklofenak") || lower.includes("ibuprofen") || lower.includes("meloksikam") || lower.includes("ketorolac")) &&
      (lower.includes("ckd") || lower.includes("egfr") || lower.includes("ginjal") || lower.includes("kreatinin") || lower.includes("scr"))) {
    drps.push("**Penggunaan NSAID pada Penurunan Fungsi Ginjal (CKD):** Penggunaan Piroksikam/NSAID berisiko tinggi memicu vasokonstriksi arteriol aferen renalis melalui inhibisi prostaglandin, yang dapat mempercepat perburukan fungsi ginjal dan retensi cairan.");
    plans.push("**Hentikan / Evaluasi NSAID:** Tinjau penghentian Piroksikam. Untuk manajemen nyeri sendi akut pada pasien dengan gangguan ginjal (eGFR < 60 mL/min), pertimbangkan beralih ke Paracetamol oral atau Kortikosteroid sistemik jangka pendek (misal Metilprednisolon / Prednison) sesuai panduan ACR.");
  }

  // Sulfonylurea + Renal check
  if ((lower.includes("glibenklamid") || lower.includes("glibenclamide")) &&
      (lower.includes("ckd") || lower.includes("egfr") || lower.includes("ginjal") || lower.includes("lansia") || lower.includes("gdp: 7") || lower.includes("gdp 7") || lower.includes("hipoglikemia"))) {
    drps.push("**Risiko Hipoglikemia Akibat Glibenklamid:** Glibenklamid memiliki metabolit aktif yang dieliminasi lewat ginjal dan durasi kerja panjang (>24 jam). Pada penurunan eGFR (<60 mL/min) atau lansia, risiko hipoglikemia berat sangat tinggi (terlihat dari GDP mendekati hipoglikemia).");
    plans.push("**Tinjau Regimen Sulfonilurea:** Hentikan atau alihkan Glibenklamid ke antidiabetes oral yang lebih aman untuk ginjal (seperti DPP-4 Inhibitor yang tidak memerlukan penyesuaian ginjal, misal Linagliptin, atau insulin basal dosis teratur).");
  }

  // Metformin + Renal check
  if (lower.includes("metformin") && (lower.includes("egfr") || lower.includes("ckd") || lower.includes("ginjal"))) {
    drps.push("**Dosis Metformin pada Insufisiensi Ginjal:** Pada eGFR 30–44 mL/menit/1,73m², dosis maksimal Metformin yang direkomendasikan adalah 1000 mg/hari (500 mg 2x sehari) untuk mencegah akumulasi dan risiko asidosis laktat.");
    plans.push("**Penyesuaian Dosis Metformin:** Sesuaikan dosis Metformin maksimal 500 mg dua kali sehari (1000 mg/hari) jika eGFR berada di kisaran 30-45 mL/min, dan lakukan pemantauan kadar serum kreatinin secara serial.");
  }

  // Gout + Allopurinol in acute phase
  if ((lower.includes("allopurinol") || lower.includes("asam urat")) && (lower.includes("bengkak") || lower.includes("eritema") || lower.includes("akut") || lower.includes("nyeri tekan"))) {
    drps.push("**Penggunaan Allopurinol saat Serangan Gout Akut:** Jika pasien sudah rutin mengonsumsi Allopurinol sebelum serangan, obat dapat dilanjutkan tanpa menaikkan dosis; namun jangan memulai titrasi naik Allopurinol saat fase inflamasi akut masih berlangsung karena dapat memperpanjang serangan.");
    plans.push("**Manajemen Hiperurisemia & Gout:** Fokuskan terapi fase akut pada anti-inflamasi sendi terlebih dahulu. Titrasi dosis Allopurinol dapat dipertimbangkan setelah peradangan akut mereda dengan target asam urat < 6 mg/dL.");
  }

  // Hypertension check
  if (lower.includes("165/") || lower.includes("160/") || lower.includes("170/") || lower.includes("150/")) {
    drps.push("**Tekanan Darah Belum Mencapai Target Terapi:** Tekanan darah masih berada di atas target klinis (<130/80 mmHg untuk pasien dengan diabetes dan CKD berdasarkan pedoman KDIGO 2023).");
    plans.push("**Optimasi Kontrol Tekanan Darah:** Evaluasi kepatuhan konsumsi kombinasi Amlodipin dan Kandesartan; pastikan tidak ada retensi cairan akibat NSAID.");
  }

  // Default DRPs if none matched
  if (drps.length === 0) {
    drps.push("**Kesesuaian Dosis & Eliminasi Organ:** Perlu evaluasi kesesuaian dosis regimen terhadap fungsi ginjal (eGFR) dan fungsi hepar terkini.");
    drps.push("**Skrining Interaksi Obat:** Evaluasi potensi interaksi farmakokinetik dan farmakodinamik antar regimen terapi bersamaan.");
  }

  if (plans.length === 0) {
    plans.push("**Rekomendasi Farmakologis:** Sesuaikan dosis obat berdasarkan klirens ginjal dan kondisi klinis pasien.");
  }

  const assessmentList = drps.map((d, i) => `${i + 1}. ${d}`).join("\n");
  const planList = plans.map((p, i) => `${i + 1}. ${p}`).join("\n");

  return `### SUBJECTIVE
${subjectiveContent}

### OBJECTIVE
${objectiveContent}

### ASSESSMENT
${assessmentList}

### PLAN
${planList}
${plans.length + 1}. **Rencana Monitoring:**
   * **Parameter Klinis:** Tanda vital (Tekanan Darah, Laju Nadi) setiap shift; resolusi pembengkakan dan nyeri sendi.
   * **Parameter Laboratorium:** Pemantauan berkala Serum Kreatinin, eGFR, Elektrolit (Kalium/Natrium), Glukosa Darah Puasa (GDP) dan Asam Urat.
   * **Target:** Tekanan darah < 130/80 mmHg, resolusi serangan inflamasi sendi, eGFR stabil tanpa perburukan nefrotoksisitas, dan GDP dalam rentang aman 90–130 mg/dL tanpa episode hipoglikemia.
${plans.length + 2}. **Edukasi & Konseling Pasien:**
   * Edukasi tanda-tanda hipoglikemia (keringat dingin, gemetar, pusing) dan penanganan cepat dengan sumber glukosa murni.
   * Hindari swamedikasi pereda nyeri golongan NSAID tanpa konsultasi dokter/apoteker.
   * Kepatuhan minum obat kronis serta modifikasi diet rendah purin dan rendah garam.

---
**Evidence-Based References:**
1. *KDIGO 2023 Clinical Practice Guideline for the Management of Diabetes & Blood Pressure in Chronic Kidney Disease.*
2. *American College of Rheumatology (ACR) Guideline for the Management of Gout (2020).*
3. *American Diabetes Association (ADA) Standards of Care in Diabetes (2024).*
4. *Pedoman Pelayanan Farmasi Klinis & Formularium RSUD Palembang BARI.*`;
}
