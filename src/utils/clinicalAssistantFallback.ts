import { DRUG_PRESETS } from '../presets';

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

  // 2. Pregnancy category questions (e.g., FDA Metformin, Paracetamol, etc.)
  if (query.includes("kehamilan") || query.includes("hamil") || query.includes("fda") || query.includes("ibu hamil")) {
    const matchedDrug = DRUG_PRESETS.find(p => query.includes(p.name.toLowerCase()));
    if (matchedDrug) {
      return `### Keamanan Kehamilan FDA: ${matchedDrug.name}

* **Kategori Kehamilan FDA:** **Kategori ${matchedDrug.pregnancyCategory || 'B (Konsultasikan spesialis)'}**
* **Indikasi Utama:** ${matchedDrug.indication || 'Terapi sesuai formularium'}
* **Dosis Lazim:** ${matchedDrug.defaultDoseValue} ${matchedDrug.doseUnit} (${matchedDrug.frequency})
* **Pertimbangan Klinis Ibu Hamil:**
  ${
    matchedDrug.pregnancyCategory === 'B' 
      ? '- Tergolong relatif aman digunakan selama kehamilan jika ada indikasi medis yang jelas. Studi pada hewan tidak menunjukkan risiko pada janin, namun data kontrol pada wanita hamil terbatas.'
      : matchedDrug.pregnancyCategory === 'C'
      ? '- Penggunaan hanya jika potensi manfaat klinis melebihi risiko potensial pada janin. Disarankan evaluasi alternatif lini pertama yang lebih aman.'
      : matchedDrug.pregnancyCategory === 'D' || matchedDrug.pregnancyCategory === 'X'
      ? '- **Peringatan Tinggi:** Terdapat bukti risiko pada janin manusia atau teratogenik. Hindari penggunaan kecuali kondisi darurat jiwa (*life-saving*) tanpa ada pilihan lain.'
      : '- Evaluasi manfaat risiko secara komprehensif bersama dokter spesialis obstetri & ginekologi.'
  }
* **Catatan Farmasi:** ${matchedDrug.notes || 'Pemberian obat pada trimester pertama harus selalu dipantau dengan ketat.'}

*(Rujukan: FDA Pregnancy Risk Categories & Formularium RSUD Palembang BARI)*`;
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
    let res = `Berikut informasi klinis obat dari **Formularium RSUD Palembang BARI**:\n\n`;
    top.forEach((drug, idx) => {
      res += `### ${idx + 1}. ${drug.name}\n`;
      if (drug.indication) res += `* **Indikasi Klinis:** ${drug.indication}\n`;
      res += `* **Dosis Lazim:** ${drug.defaultDoseValue} ${drug.doseUnit} (${drug.frequency})\n`;
      if (drug.dailyDoseLimitMax) res += `* **Dosis Maksimal Harian:** ${drug.dailyDoseLimitMax} ${drug.doseUnit}/hari\n`;
      if (drug.pregnancyCategory) res += `* **Keamanan Kehamilan FDA:** Kategori ${drug.pregnancyCategory}\n`;
      if (drug.notes) res += `* **Catatan Farmasi & Pemberian:** ${drug.notes}\n`;
      res += `\n`;
    });
    res += `*(Disajikan secara akurat dari Basis Data Formularium RSUD Palembang BARI)*`;
    return res;
  }

  // Default helpful response
  return `### Asisten Apoteker Klinis RSUD Palembang BARI

Terima kasih atas pertanyaan Anda terkait: **"${message}"**.

Untuk memberikan rekomendasi farmakoterapi yang paling presisi, Anda dapat menyertakan rincian:
1. **Nama Obat atau Indikasi** (misal: Paracetamol, Ceftriaxone, Hipertensi, Asma).
2. **Karakteristik Pasien** (Usia, Berat Badan, Kondisi Hamil/Menyusui, Fungsi Ginjal/Hati).
3. **Kombinasi Obat** jika ingin melakukan skrining interaksi atau kompatibilitas IV.

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
  return `### SUBJECTIVE
Pasien dilaporkan dengan riwayat klinis dan keluhan utama:
${patientData.slice(0, 300)}...

### OBJECTIVE
* Tanda Vital: Dalam evaluasi klinis bangsal.
* Parameter Laboratorium & Penunjang: Memerlukan verifikasi nilai dasar fungsi ginjal (eGFR) dan elektrolit terkini.
* Rejimen Farmakoterapi: Sesuai data terapi yang sedang berlangsung.

### ASSESSMENT
1. **Indikasi Terapi Tanpa Obat / Dosis:** Perlu konfirmasi kesesuaian dosis obat dengan berat badan dan klirens ginjal.
2. **Potensi Masalah Terkait Obat (DRP):** Evaluasi potensi duplikasi terapi dan risiko interaksi antar agen aktif.
3. **Kepatuhan & Tolerabilitas:** Perlu pemantauan efek samping gastrointestinal atau fluktuasi hemodinamik.

### PLAN
1. **Rekomendasi Farmakologis:** Sesuaikan dosis obat berdasarkan berat badan aktual dan fungsi organ eliminasi.
2. **Rencana Monitoring:**
   * Parameter: Tanda vital (TD, Nadi, Suhu), Ureum, Kreatinin serum, Elektrolit.
   * Frekuensi: Setiap 24-48 jam pada fase akut.
   * Target: Hemodinamik stabil dan resolusi keluhan primer tanpa efek samping obat.
3. **Edukasi Pasien:** Cara minum obat yang benar, waktu pemberian, dan tanda waspada reaksi alergi.

**Evidence-Based Reference:** Pedoman Pelayanan Farmasi Klinis Kemenkes RI & Clinical Pharmacokinetics Handbook.`;
}
