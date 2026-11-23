export type MedscapeSpecialtyId =
  | "all"
  | "cardiology"
  | "nephrology"
  | "critical_care"
  | "hepatology"
  | "pulmonology"
  | "neurology"
  | "hematology"
  | "endocrinology"
  | "obgyn"
  | "pediatrics"
  | "pharmacology";

export interface SpecialtyMeta {
  id: MedscapeSpecialtyId;
  label: string;
  englishRef: string;
  description: string;
}

export type CalcFieldType = "number" | "select" | "checkbox";

export interface CalcFieldOption {
  label: string;
  value: number;
}

export interface CalcField {
  key: string;
  label: string;
  type: CalcFieldType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean;
  helper?: string;
  badgeText?: string;
  options?: CalcFieldOption[];
}

export interface CalcSecondaryMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CalcComputeResult {
  primaryValue: string;
  primaryUnit?: string;
  severity: "normal" | "low" | "moderate" | "high" | "critical";
  categoryLabel: string;
  interpretation: string;
  secondaryMetrics?: CalcSecondaryMetric[];
  formulaDisplay: string;
  reference: string;
}

export interface MedscapeCalculatorDef {
  id: string;
  title: string;
  englishTitle: string;
  specialty: Exclude<MedscapeSpecialtyId, "all">;
  shortDesc: string;
  keywords: string[];
  fields: CalcField[];
  compute: (values: Record<string, number | boolean>) => CalcComputeResult;
}

export const MEDSCAPE_SPECIALTIES: SpecialtyMeta[] = [
  { id: "all", label: "Semua Spesialisasi", englishRef: "All Specialties", description: "Seluruh 37 kalkulator klinis referensi Medscape dalam Bahasa Indonesia" },
  { id: "cardiology", label: "Kardiologi", englishRef: "Cardiology", description: "Risiko stroke AF, perdarahan antikoagulan, QTc & nyeri dada" },
  { id: "nephrology", label: "Nefrologi & Elektrolit", englishRef: "Nephrology & Electrolytes", description: "FENa/FEUrea, Anion Gap, koreksi Ca/Na, osmolalitas & defisit cairan" },
  { id: "critical_care", label: "IGD & Perawatan Kritis", englishRef: "Critical Care & Emergency", description: "GCS, Formula Parkland luka bakar, Rumus Winter & skor NEWS2" },
  { id: "hepatology", label: "Gastro & Hepatologi", englishRef: "Gastroenterology & Hepatology", description: "MELD-Na, Child-Pugh, FIB-4/APRI & Diskriminan Maddrey" },
  { id: "pulmonology", label: "Pulmonologi & Vaskular", englishRef: "Pulmonology & Vascular", description: "Gradien A-a O₂, Wells PE, Wells DVT & Kriteria Light" },
  { id: "neurology", label: "Neurologi", englishRef: "Neurology", description: "Skor ABCD² pasca-TIA & Skor ICH perdarahan intraserebral" },
  { id: "hematology", label: "Hematologi & Onkologi", englishRef: "Hematology & Oncology", description: "ANC neutropenia, Indeks Retikulosit (RPI) & Skor 4Ts (HIT)" },
  { id: "endocrinology", label: "Endokrinologi & Metabolik", englishRef: "Endocrinology & Metabolism", description: "Konversi HbA1c–eAG, HOMA-IR & estimasi LDL Friedewald/Sampson" },
  { id: "obgyn", label: "Obstetri & Ginekologi", englishRef: "Obstetrics & Gynecology", description: "Skor Bishop induksi persalinan & Skor APGAR bayi baru lahir" },
  { id: "pediatrics", label: "Pediatri", englishRef: "Pediatrics", description: "Cairan rumatan Holliday-Segar, Centor/McIsaac & estimasi BB anak" },
  { id: "pharmacology", label: "Farmakologi & Konversi Lab", englishRef: "Clinical Pharmacology & Conversions", description: "Ekuivalensi kortikosteroid & konversi satuan laboratorium SI" },
];

const num = (v: Record<string, number | boolean>, key: string, fallback = 0): number => {
  const raw = v[key];
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  return fallback;
};

const bool = (v: Record<string, number | boolean>, key: string): boolean => Boolean(v[key]);

const f = (n: number, d = 2): string => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n);
};

export const MEDSCAPE_CALCULATORS: MedscapeCalculatorDef[] = [
  // ==========================================================================
  // 1. KARDIOLOGI
  // ==========================================================================
  {
    id: "cha2ds2-vasc",
    title: "Skor CHA₂DS₂-VASc (Risiko Stroke AF)",
    englishTitle: "CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk",
    specialty: "cardiology",
    shortDesc: "Menilai risiko stroke iskemik tahunan & indikasi antikoagulan oral pada pasien fibrilasi atrium non-valvular.",
    keywords: ["af", "fibrilasi atrium", "stroke", "antikoagulan", "warfarin", "doac", "kardiologi"],
    fields: [
      { key: "chf", label: "Gagal Jantung Kongestif / Disfungsi LV (C)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "htn", label: "Hipertensi atau sedang terapi antihipertensi (H)", type: "checkbox", defaultValue: true, badgeText: "+1" },
      {
        key: "age",
        label: "Kelompok Usia Pasien (A)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "< 65 tahun (0 poin)", value: 0 },
          { label: "65–74 tahun (+1 poin)", value: 1 },
          { label: "≥ 75 tahun (+2 poin)", value: 2 },
        ],
      },
      { key: "dm", label: "Diabetes Melitus (D)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "stroke", label: "Riwayat Stroke / TIA / Tromboemboli (S₂)", type: "checkbox", defaultValue: false, badgeText: "+2" },
      { key: "vasc", label: "Penyakit Vaskular (IMA, PAD, Plak Aorta) (V)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      {
        key: "sex",
        label: "Jenis Kelamin (Sc)",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "Laki-laki (0 poin)", value: 0 },
          { label: "Perempuan (+1 poin)", value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const score =
        (bool(v, "chf") ? 1 : 0) +
        (bool(v, "htn") ? 1 : 0) +
        num(v, "age") +
        (bool(v, "dm") ? 1 : 0) +
        (bool(v, "stroke") ? 2 : 0) +
        (bool(v, "vasc") ? 1 : 0) +
        num(v, "sex");
      const isFemale = num(v, "sex") === 1;
      const annualRiskMap = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2];
      const annualRisk = annualRiskMap[Math.min(score, 9)];
      const lowCut = isFemale ? 1 : 0;
      const modCut = isFemale ? 2 : 1;
      let severity: CalcComputeResult["severity"] = "low";
      let categoryLabel = "Risiko Rendah — Tidak Perlu Antikoagulan";
      let interpretation = "Risiko stroke tahunan sangat rendah. Terapi antitrombotik/antikoagulan umumnya tidak direkomendasikan.";
      if (score >= (isFemale ? 3 : 2)) {
        severity = score >= 4 ? "critical" : "high";
        categoryLabel = "Risiko Tinggi — Direkomendasikan Antikoagulan Oral";
        interpretation = "Antikoagulan oral (DOAC lebih disukai dibanding antagonis vitamin K bila tidak ada kontraindikasi) direkomendasikan kuat sesuai pedoman ESC/AHA.";
      } else if (score === modCut && score > lowCut) {
        severity = "moderate";
        categoryLabel = "Risiko Menengah — Pertimbangkan Antikoagulan Oral";
        interpretation = "Pertimbangkan terapi antikoagulan oral dengan mengevaluasi keseimbangan risiko perdarahan (skor HAS-BLED) dan preferensi pasien.";
      }
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (maks 9)",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          { label: "Estimasi Risiko Stroke / Tahun", value: `${f(annualRisk, 1)}%` },
          { label: "Ambang Antikoagulasi", value: isFemale ? "≥ 3 poin (Perempuan)" : "≥ 2 poin (Laki-laki)" },
        ],
        formulaDisplay: `Skor = C + H + A₂ + D + S₂ + V + Sc = ${score} poin`,
        reference: "Adaptasi Medscape Medical Calculators · Lip GYH et al. (Chest 2010) & ESC Guidelines",
      };
    },
  },
  {
    id: "has-bled",
    title: "Skor HAS-BLED (Risiko Perdarahan Antikoagulan)",
    englishTitle: "HAS-BLED Score for Major Bleeding Risk",
    specialty: "cardiology",
    shortDesc: "Mengestimasi risiko perdarahan mayor 1 tahun pada pasien fibrilasi atrium yang menerima terapi antikoagulasi.",
    keywords: ["hasbled", "perdarahan", "bleeding", "antikoagulan", "warfarin", "inr", "kardiologi"],
    fields: [
      { key: "h", label: "Hipertensi tidak terkontrol (TDS > 160 mmHg)", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "renal", label: "Fungsi Ginjal Abnormal (Dialisis / Transplantasi / Cr > 2,26 mg/dL)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "liver", label: "Fungsi Hati Abnormal (Sirosis / Bilirubin > 2× / AST·ALT > 3×)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "s", label: "Riwayat Stroke", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "b", label: "Riwayat / Predisposisi Perdarahan Mayor", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "l", label: "INR Labil (TTR < 60% bila memakai warfarin)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "e", label: "Usia Lanjut (> 65 tahun)", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "drugs", label: "Obat Pemicu Perdarahan (Antiplatelet / OAINS)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "alcohol", label: "Konsumsi Alkohol Berlebih (≥ 8 gelas/minggu)", type: "checkbox", defaultValue: false, badgeText: "+1" },
    ],
    compute: (v) => {
      const keys = ["h", "renal", "liver", "s", "b", "l", "e", "drugs", "alcohol"];
      const score = keys.reduce((acc, k) => acc + (bool(v, k) ? 1 : 0), 0);
      const riskTable = ["1,13%", "1,02%", "1,88%", "3,74%", "8,70%", "12,5%+"];
      const riskStr = riskTable[Math.min(score, 5)];
      const severity: CalcComputeResult["severity"] = score >= 3 ? "high" : score === 2 ? "moderate" : "low";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (maks 9)",
        severity,
        categoryLabel: score >= 3 ? "Risiko Perdarahan Tinggi (≥ 3)" : score === 2 ? "Risiko Perdarahan Sedang" : "Risiko Perdarahan Rendah",
        interpretation:
          score >= 3
            ? "Skor HAS-BLED ≥ 3 BUKAN kontraindikasi mutlak antikoagulan, melainkan peringatan untuk memodifikasi faktor risiko (kontrol tekanan darah, hentikan OAINS tidak perlu) dan memperketat pemantauan."
            : "Risiko perdarahan mayor relatif rendah–sedang. Tetap pantau faktor risiko yang dapat dimodifikasi secara berkala.",
        secondaryMetrics: [
          { label: "Insidens Perdarahan Mayor / Tahun", value: riskStr },
          { label: "Tindakan Utama", value: score >= 3 ? "Pemantauan Ketat & Koreksi Faktor Risiko" : "Pemantauan Standar" },
        ],
        formulaDisplay: `HAS-BLED = H + A(1–2) + S + B + L + E + D(1–2) = ${score} poin`,
        reference: "Adaptasi Medscape Medical Calculators · Pisters R et al. (Chest 2010)",
      };
    },
  },
  {
    id: "qtc-corrected",
    title: "Interval QTc Terkoreksi (Bazett, Fridericia, Framingham, Hodges)",
    englishTitle: "Corrected QT Interval (QTc) Calculator",
    specialty: "cardiology",
    shortDesc: "Menghitung interval QTc dari EKG menggunakan 4 rumus standar untuk evaluasi risiko Torsades de Pointes.",
    keywords: ["qtc", "ekg", "ecg", "bazett", "fridericia", "aritmia", "torsades", "kardiologi"],
    fields: [
      { key: "qt", label: "Interval QT Terukur", type: "number", unit: "ms", min: 200, max: 800, step: 1, defaultValue: 400 },
      { key: "hr", label: "Denyut Jantung (HR)", type: "number", unit: "x/menit", min: 30, max: 220, step: 1, defaultValue: 75 },
      {
        key: "sex",
        label: "Jenis Kelamin",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "Laki-laki (Normal ≤ 450 ms)", value: 0 },
          { label: "Perempuan (Normal ≤ 460 ms)", value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const qt = Math.max(100, num(v, "qt", 400));
      const hr = Math.max(20, num(v, "hr", 75));
      const rr = 60 / hr;
      const bazett = qt / Math.sqrt(rr);
      const fridericia = qt / Math.cbrt(rr);
      const framingham = qt + 154 * (1 - rr);
      const hodges = qt + 1.75 * (hr - 60);
      const isFemale = num(v, "sex") === 1;
      const upperNormal = isFemale ? 460 : 450;
      const mainVal = hr < 60 || hr > 100 ? fridericia : bazett;
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Interval QTc Normal";
      let interpretation = "Interval QTc berada dalam batas normal. Risiko aritmia akibat pemanjangan QT rendah.";
      if (mainVal >= 500) {
        severity = "critical";
        categoryLabel = "Pemanjangan QTc Kritis (≥ 500 ms)";
        interpretation = "Risiko sangat tinggi terjadinya Torsades de Pointes! Evaluasi segera obat pemanjang QT (makrolida, fluorokuinolon, antipsikotik, ondansetron) dan koreksi K⁺ serta Mg²⁺.";
      } else if (mainVal > upperNormal) {
        severity = "high";
        categoryLabel = `QTc Memanjang (> ${upperNormal} ms)`;
        interpretation = "Terdapat pemanjangan QTc. Hindari penambahan obat yang memperpanjang interval QT dan pantau elektrolit serum.";
      }
      return {
        primaryValue: `${Math.round(bazett)}`,
        primaryUnit: "ms (Bazett)",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          { label: "QTc Fridericia (Akurat HR ekstrem)", value: `${Math.round(fridericia)} ms` },
          { label: "QTc Framingham", value: `${Math.round(framingham)} ms` },
          { label: "QTc Hodges", value: `${Math.round(hodges)} ms` },
          { label: "Interval RR", value: `${f(rr, 3)} detik` },
        ],
        formulaDisplay: `Bazett = ${qt} / √(${f(rr, 2)}) = ${Math.round(bazett)} ms | Fridericia = ${qt} / ∛(${f(rr, 2)}) = ${Math.round(fridericia)} ms`,
        reference: "Adaptasi Medscape Medical Calculators · Bazett, Fridericia, Framingham & Hodges",
      };
    },
  },
  {
    id: "heart-score",
    title: "Skor HEART (Nyeri Dada Akut / Risiko MACE)",
    englishTitle: "HEART Score for Major Cardiac Events",
    specialty: "cardiology",
    shortDesc: "Stratifikasi risiko kejadian kardiovaskular mayor (MACE) 6 minggu pada pasien nyeri dada di IGD.",
    keywords: ["heart", "nyeri dada", "chest pain", "acs", "ska", "mace", "troponin", "kardiologi"],
    fields: [
      {
        key: "h",
        label: "Anamnesis (History)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Sedikit mencurigakan (0 poin)", value: 0 },
          { label: "Cukup mencurigakan (+1 poin)", value: 1 },
          { label: "Sangat mencurigakan khas SKA (+2 poin)", value: 2 },
        ],
      },
      {
        key: "e",
        label: "Elektrokardiogram (ECG)",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "Normal (0 poin)", value: 0 },
          { label: "Gangguan repolarisasi non-spesifik (+1 poin)", value: 1 },
          { label: "Deviasi segmen ST signifikan (+2 poin)", value: 2 },
        ],
      },
      {
        key: "a",
        label: "Usia (Age)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "< 45 tahun (0 poin)", value: 0 },
          { label: "45–64 tahun (+1 poin)", value: 1 },
          { label: "≥ 65 tahun (+2 poin)", value: 2 },
        ],
      },
      {
        key: "r",
        label: "Faktor Risiko Kardiovaskular (Risk Factors)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Tidak ada faktor risiko diketahui (0 poin)", value: 0 },
          { label: "1–2 faktor risiko (+1 poin)", value: 1 },
          { label: "≥ 3 faktor risiko atau riwayat aterosklerosis (+2 poin)", value: 2 },
        ],
      },
      {
        key: "t",
        label: "Troponin Awal (Troponin)",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "≤ batas normal atas (0 poin)", value: 0 },
          { label: "1–3× batas normal atas (+1 poin)", value: 1 },
          { label: "> 3× batas normal atas (+2 poin)", value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = num(v, "h") + num(v, "e") + num(v, "a") + num(v, "r") + num(v, "t");
      const severity: CalcComputeResult["severity"] = score >= 7 ? "critical" : score >= 4 ? "moderate" : "low";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–10)",
        severity,
        categoryLabel:
          score >= 7
            ? "Risiko Tinggi MACE (50–65%)"
            : score >= 4
            ? "Risiko Menengah MACE (12–16,6%)"
            : "Risiko Rendah MACE (0,9–1,7%)",
        interpretation:
          score >= 7
            ? "Kandidat kuat strategi invasif dini / rawat intensif kardiologi dan tatalaksana Sindrom Koroner Akut."
            : score >= 4
            ? "Observasi rawat inap, pemeriksaan troponin serial, dan uji non-invasif/stratifikasi lanjut."
            : "Pertimbangkan pemulangan dini dengan tindak lanjut rawat jalan bila EKG & troponin serial meyakinkan.",
        secondaryMetrics: [
          { label: "Estimasi MACE 6 Minggu", value: score >= 7 ? "50–65%" : score >= 4 ? "12–16,6%" : "0,9–1,7%" },
        ],
        formulaDisplay: `HEART = H(${num(v, "h")}) + E(${num(v, "e")}) + A(${num(v, "a")}) + R(${num(v, "r")}) + T(${num(v, "t")}) = ${score}`,
        reference: "Adaptasi Medscape Medical Calculators · Six AJ et al. (Neth Heart J 2008)",
      };
    },
  },

  // ==========================================================================
  // 2. NEFROLOGI & ELEKTROLIT
  // ==========================================================================
  {
    id: "fena-feurea",
    title: "FENa & FEUrea (Diferensiasi AKI Prerenal vs Intrinsik)",
    englishTitle: "Fractional Excretion of Sodium (FENa) & Urea (FEUrea)",
    specialty: "nephrology",
    shortDesc: "Membedakan gangguan ginjal akut (AKI) prerenal vs nekrosis tubular akut (ATN), termasuk pada pengguna diuretik.",
    keywords: ["fena", "feurea", "aki", "ginjal", "prerenal", "atn", "natrium", "nefrologi"],
    fields: [
      { key: "uNa", label: "Natrium Urin (UNa)", type: "number", unit: "mEq/L", min: 0, max: 300, step: 1, defaultValue: 18 },
      { key: "sNa", label: "Natrium Serum (PNa)", type: "number", unit: "mEq/L", min: 100, max: 180, step: 1, defaultValue: 138 },
      { key: "uCr", label: "Kreatinin Urin (UCr)", type: "number", unit: "mg/dL", min: 1, max: 500, step: 1, defaultValue: 120 },
      { key: "sCr", label: "Kreatinin Serum (PCr)", type: "number", unit: "mg/dL", min: 0.1, max: 25, step: 0.1, defaultValue: 2.1 },
      { key: "uUrea", label: "Urea / BUN Urin (Opsional FEUrea)", type: "number", unit: "mg/dL", min: 0, max: 2000, step: 1, defaultValue: 420 },
      { key: "sUrea", label: "BUN Serum (Opsional FEUrea)", type: "number", unit: "mg/dL", min: 1, max: 300, step: 1, defaultValue: 38 },
    ],
    compute: (v) => {
      const uNa = num(v, "uNa", 18);
      const sNa = Math.max(1, num(v, "sNa", 138));
      const uCr = Math.max(0.1, num(v, "uCr", 120));
      const sCr = Math.max(0.1, num(v, "sCr", 2.1));
      const uUrea = num(v, "uUrea", 420);
      const sUrea = Math.max(1, num(v, "sUrea", 38));

      const fena = ((uNa * sCr) / (sNa * uCr)) * 100;
      const feurea = uUrea > 0 ? ((uUrea * sCr) / (sUrea * uCr)) * 100 : null;
      let severity: CalcComputeResult["severity"] = "moderate";
      let categoryLabel = "Zona Antara (1–2%)";
      let interpretation = "Hasil berada di zona transisi. Korelasikan dengan sedimen urin, status volume, dan nilai FEUrea.";
      if (fena < 1) {
        severity = "low";
        categoryLabel = "Mengarah ke AKI Prerenal (FENa < 1%)";
        interpretation = "Reabsorpsi natrium tubulus masih intak (hipoperfusi ginjal/dehidrasi). Catatan: penggunaan diuretik dapat meningkatkan FENa palsu—gunakan FEUrea (< 35% menunjukkan prerenal).";
      } else if (fena > 2) {
        severity = "high";
        categoryLabel = "Mengarah ke AKI Intrinsik / ATN (FENa > 2%)";
        interpretation = "Menunjukkan gangguan reabsorpsi natrium oleh tubulus ginjal (mis. Nekrosis Tubular Akut / ATN atau nefritis interstisial).";
      }
      return {
        primaryValue: `${f(fena, 2)}%`,
        primaryUnit: "FENa",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          {
            label: "FEUrea (Akurat pada Diuretik)",
            value: feurea !== null ? `${f(feurea, 1)}%` : "—",
            note: feurea !== null ? (feurea <= 35 ? "Prerenal (≤ 35%)" : feurea > 50 ? "Intrinsik/ATN (> 50%)" : "Indeterminate") : undefined,
          },
          { label: "Rasio UCr / PCr", value: f(uCr / sCr, 1) },
        ],
        formulaDisplay: `FENa = ((${uNa} × ${f(sCr, 1)}) / (${sNa} × ${uCr})) × 100% = ${f(fena, 2)}%`,
        reference: "Adaptasi Medscape Medical Calculators · Espinel CH (JAMA 1976) & Carvounis CP (Kidney Int 2002)",
      };
    },
  },
  {
    id: "anion-gap",
    title: "Anion Gap Serum, Koreksi Albumin & Delta Ratio",
    englishTitle: "Serum Anion Gap & Delta Gap Calculator",
    specialty: "nephrology",
    shortDesc: "Evaluasi asidosis metabolik dengan koreksi hipoalbuminemia (Figge) serta deteksi gangguan asam-basa campuran.",
    keywords: ["anion gap", "asidosis", "metabolik", "delta ratio", "albumin", "kad", "elektrolit"],
    fields: [
      { key: "na", label: "Natrium (Na⁺)", type: "number", unit: "mEq/L", min: 100, max: 180, step: 1, defaultValue: 138 },
      { key: "cl", label: "Klorida (Cl⁻)", type: "number", unit: "mEq/L", min: 60, max: 140, step: 1, defaultValue: 100 },
      { key: "hco3", label: "Bikarbonat (HCO₃⁻)", type: "number", unit: "mEq/L", min: 2, max: 50, step: 0.5, defaultValue: 14 },
      { key: "alb", label: "Albumin Serum", type: "number", unit: "g/dL", min: 0.5, max: 6, step: 0.1, defaultValue: 3.2 },
    ],
    compute: (v) => {
      const na = num(v, "na", 138);
      const cl = num(v, "cl", 100);
      const hco3 = num(v, "hco3", 14);
      const alb = num(v, "alb", 3.2);
      const ag = na - (cl + hco3);
      const agCorr = ag + 2.5 * (4.0 - alb);
      const deltaAg = agCorr - 12;
      const deltaHco3 = 24 - hco3;
      const deltaRatio = deltaHco3 !== 0 ? deltaAg / deltaHco3 : null;

      let deltaNote = "Tidak dapat dihitung (ΔHCO₃ = 0)";
      if (deltaRatio !== null && agCorr > 12) {
        if (deltaRatio < 0.4) deltaNote = "Asidosis metabolik hiperkloremik murni";
        else if (deltaRatio < 1.0) deltaNote = "Campuran HAGMA + NAGMA (asidosis hiperkloremik)";
        else if (deltaRatio <= 2.0) deltaNote = "HAGMA murni (mis. KAD / asidosis laktat)";
        else deltaNote = "HAGMA + Alkalosis metabolik penyerta / kompensasi kronis";
      }

      const severity: CalcComputeResult["severity"] = agCorr > 20 ? "critical" : agCorr > 12 ? "high" : "normal";
      return {
        primaryValue: `${f(agCorr, 1)}`,
        primaryUnit: "mEq/L (Terkoreksi Albumin)",
        severity,
        categoryLabel: agCorr > 12 ? "High Anion Gap Metabolic Acidosis (HAGMA)" : "Anion Gap Normal (8–12 mEq/L)",
        interpretation:
          agCorr > 12
            ? `Anion gap terkoreksi meningkat (${f(agCorr, 1)} mEq/L). Evaluasi etiologi GOLDMARK (Glikol, Oksoprolin, L-laktat, D-laktat, Metanol, Aspirin, Gagal Ginjal, Ketoasidosis).`
            : "Anion gap dalam batas normal. Bila disertai penurunan HCO₃⁻, evaluasi asidosis metabolik non-anion gap (diare, RTA).",
        secondaryMetrics: [
          { label: "Anion Gap Tidak Terkoreksi", value: `${f(ag, 1)} mEq/L` },
          { label: "Delta Ratio (ΔAG / ΔHCO₃⁻)", value: deltaRatio !== null ? f(deltaRatio, 2) : "—", note: deltaNote },
        ],
        formulaDisplay: `AG = ${na} − (${cl} + ${hco3}) = ${f(ag, 1)} | AG Terkoreksi = ${f(ag, 1)} + 2,5 × (4,0 − ${f(alb, 1)}) = ${f(agCorr, 1)} mEq/L`,
        reference: "Adaptasi Medscape Medical Calculators · Figge J et al. (Crit Care Med 1998)",
      };
    },
  },
  {
    id: "corrected-calcium",
    title: "Kalsium Terkoreksi Albumin",
    englishTitle: "Calcium Correction for Hypoalbuminemia",
    specialty: "nephrology",
    shortDesc: "Mengoreksi kadar kalsium serum total terhadap kadar albumin serum rendah atau tinggi.",
    keywords: ["kalsium", "calcium", "albumin", "hipokalsemia", "hiperkalsemia", "elektrolit"],
    fields: [
      { key: "ca", label: "Kalsium Total Terukur", type: "number", unit: "mg/dL", min: 3, max: 20, step: 0.1, defaultValue: 7.8 },
      { key: "alb", label: "Albumin Serum", type: "number", unit: "g/dL", min: 0.5, max: 6.5, step: 0.1, defaultValue: 2.5 },
    ],
    compute: (v) => {
      const ca = num(v, "ca", 7.8);
      const alb = num(v, "alb", 2.5);
      const corrCa = ca + 0.8 * (4.0 - alb);
      const mmol = corrCa * 0.25;
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Normokalsemia (8,5–10,5 mg/dL)";
      if (corrCa < 8.5) {
        severity = corrCa < 7.5 ? "critical" : "moderate";
        categoryLabel = "Hipokalsemia (< 8,5 mg/dL)";
      } else if (corrCa > 10.5) {
        severity = corrCa >= 14 ? "critical" : "high";
        categoryLabel = "Hiperkalsemia (> 10,5 mg/dL)";
      }
      return {
        primaryValue: f(corrCa, 2),
        primaryUnit: "mg/dL",
        severity,
        categoryLabel,
        interpretation:
          "Kalsium terkoreksi membantu menyingkirkan pseudohipokalsemia akibat hipoalbuminemia. Pada pasien kritis atau gangguan asam-basa berat, tetap periksa Kalsium Ionisasi (iCa²⁺) langsung.",
        secondaryMetrics: [
          { label: "Konversi Satuan SI", value: `${f(mmol, 2)} mmol/L` },
          { label: "Selisih Koreksi", value: `${corrCa - ca >= 0 ? "+" : ""}${f(corrCa - ca, 2)} mg/dL` },
        ],
        formulaDisplay: `Ca Terkoreksi = ${f(ca, 1)} + 0,8 × (4,0 − ${f(alb, 1)}) = ${f(corrCa, 2)} mg/dL`,
        reference: "Adaptasi Medscape Medical Calculators · Payne RB et al. (BMJ 1973)",
      };
    },
  },
  {
    id: "corrected-sodium",
    title: "Natrium Terkoreksi Hiperglikemia (Katz & Hillier)",
    englishTitle: "Sodium Correction for Hyperglycemia",
    specialty: "nephrology",
    shortDesc: "Menghitung kadar natrium serum sebenarnya pada kondisi hiperglikemia berat (KAD / HHS).",
    keywords: ["natrium", "sodium", "hiperglikemia", "kad", "dka", "hhs", "katz", "elektrolit"],
    fields: [
      { key: "na", label: "Natrium Serum Terukur", type: "number", unit: "mEq/L", min: 100, max: 180, step: 1, defaultValue: 129 },
      { key: "glu", label: "Glukosa Darah", type: "number", unit: "mg/dL", min: 50, max: 1500, step: 5, defaultValue: 520 },
    ],
    compute: (v) => {
      const na = num(v, "na", 129);
      const glu = num(v, "glu", 520);
      const katz = na + 0.016 * Math.max(0, glu - 100);
      const hillier = na + 0.024 * Math.max(0, glu - 100);
      const mainVal = glu > 400 ? hillier : katz;
      const severity: CalcComputeResult["severity"] =
        mainVal < 135 || mainVal > 145 ? (mainVal < 125 || mainVal > 155 ? "critical" : "moderate") : "normal";
      return {
        primaryValue: f(katz, 1),
        primaryUnit: "mEq/L (Katz 1,6)",
        severity,
        categoryLabel:
          mainVal < 135 ? "Hiponatremia Sejati" : mainVal > 145 ? "Hipernatremia Tersembunyi" : "Normonatremia (135–145 mEq/L)",
        interpretation:
          glu > 400
            ? "Pada glukosa > 400 mg/dL, faktor koreksi Hillier (2,4 mEq/L per kenaikan 100 mg/dL glukosa) lebih akurat merefleksikan natrium sejati."
            : "Gunakan natrium terkoreksi untuk memilih jenis cairan rumatan/resusitasi (NaCl 0,9% vs NaCl 0,45%) selama koreksi KAD/HHS.",
        secondaryMetrics: [
          { label: "Rumus Hillier (Faktor 2,4 · Glukosa > 400)", value: `${f(hillier, 1)} mEq/L` },
          { label: "Kenaikan Glukosa di atas 100", value: `+${Math.max(0, glu - 100)} mg/dL` },
        ],
        formulaDisplay: `Katz = ${na} + 0,016 × (${glu} − 100) = ${f(katz, 1)} mEq/L | Hillier = ${f(hillier, 1)} mEq/L`,
        reference: "Adaptasi Medscape Medical Calculators · Katz MA (NEJM 1973) & Hillier TA (Am J Med 1999)",
      };
    },
  },
  {
    id: "serum-osmolality",
    title: "Osmolalitas Serum & Osmolar Gap",
    englishTitle: "Serum Osmolality & Osmolar Gap",
    specialty: "nephrology",
    shortDesc: "Menghitung osmolalitas serum terhitung & selisih osmolal untuk skrining intoksikasi alkohol toksik.",
    keywords: ["osmolalitas", "osmolality", "osmolar gap", "metanol", "etilen glikol", "toksikologi"],
    fields: [
      { key: "na", label: "Natrium (Na⁺)", type: "number", unit: "mEq/L", min: 100, max: 180, step: 1, defaultValue: 140 },
      { key: "glu", label: "Glukosa", type: "number", unit: "mg/dL", min: 20, max: 1500, step: 1, defaultValue: 108 },
      { key: "bun", label: "BUN (Urea Nitrogen)", type: "number", unit: "mg/dL", min: 1, max: 250, step: 1, defaultValue: 14 },
      { key: "measOsm", label: "Osmolalitas Terukur Lab (Opsional)", type: "number", unit: "mOsm/kg", min: 0, max: 500, step: 1, defaultValue: 295 },
    ],
    compute: (v) => {
      const na = num(v, "na", 140);
      const glu = num(v, "glu", 108);
      const bun = num(v, "bun", 14);
      const meas = num(v, "measOsm", 0);
      const calcOsm = 2 * na + glu / 18 + bun / 2.8;
      const gap = meas > 0 ? meas - calcOsm : null;
      const severity: CalcComputeResult["severity"] =
        gap !== null && gap > 10 ? "critical" : calcOsm < 275 || calcOsm > 295 ? "moderate" : "normal";
      return {
        primaryValue: f(calcOsm, 1),
        primaryUnit: "mOsm/kg",
        severity,
        categoryLabel:
          gap !== null && gap > 10
            ? `Osmolar Gap Meningkat (+${f(gap, 1)} mOsm/kg)`
            : calcOsm >= 275 && calcOsm <= 295
            ? "Osmolalitas Serum Normal (275–295 mOsm/kg)"
            : calcOsm > 295
            ? "Hiperosmolalitas (> 295 mOsm/kg)"
            : "Hipoosmolalitas (< 275 mOsm/kg)",
        interpretation:
          gap !== null && gap > 10
            ? "Osmolar gap > 10 mOsm/kg mencurigai adanya zat osmotik tak terukur (etanol, metanol, etilen glikol, isopropil alkohol, atau manitol)."
            : "Osmolalitas terhitung berguna dalam mengevaluasi hiponatremia, hiperosmolalitas HHS, dan status hidrasi.",
        secondaryMetrics: [
          { label: "Osmolalitas Efektif (Tonisitas)", value: `${f(2 * na + glu / 18, 1)} mOsm/kg` },
          { label: "Osmolar Gap", value: gap !== null ? `${f(gap, 1)} mOsm/kg` : "Isi Osmolalitas Terukur" },
        ],
        formulaDisplay: `Osm = 2(${na}) + (${glu} / 18) + (${bun} / 2,8) = ${f(calcOsm, 1)} mOsm/kg`,
        reference: "Adaptasi Medscape Medical Calculators · Smithline & Gardner",
      };
    },
  },
  {
    id: "free-water-deficit",
    title: "Defisit Air Bebas pada Hipernatremia",
    englishTitle: "Free Water Deficit in Hypernatremia",
    specialty: "nephrology",
    shortDesc: "Menghitung volume cairan bebas air yang dibutuhkan untuk mengoreksi hipernatremia secara aman.",
    keywords: ["defisit air", "free water deficit", "hipernatremia", "cairan", "natrium", "nefrologi"],
    fields: [
      { key: "wt", label: "Berat Badan", type: "number", unit: "kg", min: 5, max: 250, step: 0.5, defaultValue: 65 },
      { key: "na", label: "Natrium Serum Saat Ini", type: "number", unit: "mEq/L", min: 141, max: 200, step: 1, defaultValue: 156 },
      { key: "targetNa", label: "Target Natrium", type: "number", unit: "mEq/L", min: 135, max: 150, step: 1, defaultValue: 140 },
      {
        key: "tbwFactor",
        label: "Faktor Total Body Water (TBW)",
        type: "select",
        defaultValue: 0.6,
        options: [
          { label: "Laki-laki Dewasa / Anak (0,60)", value: 0.6 },
          { label: "Perempuan Dewasa / Laki-laki Lansia (0,50)", value: 0.5 },
          { label: "Perempuan Lansia (0,45)", value: 0.45 },
        ],
      },
    ],
    compute: (v) => {
      const wt = Math.max(1, num(v, "wt", 65));
      const na = num(v, "na", 156);
      const target = Math.max(130, num(v, "targetNa", 140));
      const factor = num(v, "tbwFactor", 0.6);
      const tbw = wt * factor;
      const deficitL = Math.max(0, tbw * (na / target - 1));
      const rate48h = (deficitL * 1000) / 48;
      return {
        primaryValue: f(deficitL, 2),
        primaryUnit: "Liter",
        severity: na >= 160 ? "critical" : na >= 150 ? "high" : "moderate",
        categoryLabel: `Estimasi Defisit Cairan Bebas (${Math.round(deficitL * 1000)} mL)`,
        interpretation:
          "Koreksi hipernatremia kronis TIDAK boleh menurunkan Na⁺ lebih cepat dari 8–10 mEq/L per 24 jam (maks 0,5 mEq/L/jam) guna mencegah edema serebri. Tambahkan kehilangan cairan insensible (~30–50 mL/jam).",
        secondaryMetrics: [
          { label: "Total Body Water (TBW)", value: `${f(tbw, 1)} L` },
          { label: "Laju Penggantian 48 Jam (D5W)", value: `${Math.round(rate48h)} mL/jam` },
        ],
        formulaDisplay: `Defisit = ${f(tbw, 1)} × ((${na} / ${target}) − 1) = ${f(deficitL, 2)} Liter`,
        reference: "Adaptasi Medscape Medical Calculators · Adrogué HJ & Madias NE (NEJM 2000)",
      };
    },
  },

  // ==========================================================================
  // 3. IGD & PERAWATAN KRITIS
  // ==========================================================================
  {
    id: "gcs-score",
    title: "Glasgow Coma Scale (GCS)",
    englishTitle: "Glasgow Coma Scale / Score",
    specialty: "critical_care",
    shortDesc: "Penilaian tingkat kesadaran standar E-V-M dan klasifikasi derajat cedera kepala di IGD/ICU.",
    keywords: ["gcs", "kesadaran", "koma", "trauma", "cedera kepala", "igd", "icu"],
    fields: [
      {
        key: "e",
        label: "Respons Membuka Mata (Eye — E)",
        type: "select",
        defaultValue: 4,
        options: [
          { label: "4 — Spontan", value: 4 },
          { label: "3 — Terhadap panggilan suara", value: 3 },
          { label: "2 — Terhadap rangsang nyeri", value: 2 },
          { label: "1 — Tidak ada respons", value: 1 },
        ],
      },
      {
        key: "v",
        label: "Respons Verbal (Verbal — V)",
        type: "select",
        defaultValue: 5,
        options: [
          { label: "5 — Orientasi baik", value: 5 },
          { label: "4 — Bingung / disorientasi", value: 4 },
          { label: "3 — Kata-kata tidak tepat", value: 3 },
          { label: "2 — Suara mengerang tidak jelas", value: 2 },
          { label: "1 — Tidak ada suara", value: 1 },
        ],
      },
      {
        key: "m",
        label: "Respons Motorik Terbaik (Motor — M)",
        type: "select",
        defaultValue: 6,
        options: [
          { label: "6 — Mengikuti perintah", value: 6 },
          { label: "5 — Melokalisasi nyeri", value: 5 },
          { label: "4 — Menarik diri dari nyeri (fleksi normal)", value: 4 },
          { label: "3 — Fleksi abnormal (dekortikasi)", value: 3 },
          { label: "2 — Ekstensi abnormal (deserebrasi)", value: 2 },
          { label: "1 — Tidak ada respons motorik", value: 1 },
        ],
      },
    ],
    compute: (v) => {
      const e = num(v, "e", 4);
      const vr = num(v, "v", 5);
      const m = num(v, "m", 6);
      const total = e + vr + m;
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Kesadaran Penuh / Cedera Kepala Ringan (13–15)";
      let interpretation = "Observasi neurologis berkala sesuai protokol trauma/klinis.";
      if (total <= 8) {
        severity = "critical";
        categoryLabel = "Koma / Cedera Kepala Berat (GCS ≤ 8)";
        interpretation = "Indikasi kuat proteksi jalan napas (intubasi endotrakeal) — 'GCS ≤ 8, intubate' — serta penanganan intensif ICU & bedah saraf.";
      } else if (total <= 12) {
        severity = "high";
        categoryLabel = "Penurunan Kesadaran / Cedera Kepala Sedang (GCS 9–12)";
        interpretation = "Memerlukan pemantauan ketat jalan napas, CT Scan kepala segera bila trauma, dan evaluasi ulang GCS tiap 15–30 menit.";
      }
      return {
        primaryValue: `${total}`,
        primaryUnit: `dari 15 (E${e} V${vr} M${m})`,
        severity,
        categoryLabel,
        interpretation,
        formulaDisplay: `GCS = E(${e}) + V(${vr}) + M(${m}) = ${total}`,
        reference: "Adaptasi Medscape Medical Calculators · Teasdale G & Jennett B (Lancet 1974)",
      };
    },
  },
  {
    id: "parkland-burn",
    title: "Formula Parkland (Resusitasi Cairan Luka Bakar)",
    englishTitle: "Parkland Formula for Burns",
    specialty: "critical_care",
    shortDesc: "Menghitung kebutuhan cairan kristaloid (Ringer Laktat) 24 jam pertama pada luka bakar derajat II–III.",
    keywords: ["parkland", "luka bakar", "burn", "tbsa", "resusitasi", "cairan", "igd"],
    fields: [
      { key: "wt", label: "Berat Badan Pasien", type: "number", unit: "kg", min: 3, max: 250, step: 0.5, defaultValue: 60 },
      { key: "tbsa", label: "Luas Luka Bakar (% TBSA — Derajat II & III)", type: "number", unit: "%", min: 1, max: 100, step: 1, defaultValue: 30 },
      { key: "hrsElapsed", label: "Waktu Berlalu Sejak Kejadian", type: "number", unit: "jam", min: 0, max: 7.5, step: 0.5, defaultValue: 1 },
    ],
    compute: (v) => {
      const wt = Math.max(1, num(v, "wt", 60));
      const tbsa = Math.min(100, Math.max(1, num(v, "tbsa", 30)));
      const elapsed = Math.min(7.5, Math.max(0, num(v, "hrsElapsed", 1)));
      const total24 = 4 * wt * tbsa;
      const first8 = total24 / 2;
      const next16 = total24 / 2;
      const remainFirst8Hrs = Math.max(0.5, 8 - elapsed);
      const rateFirst8 = first8 / remainFirst8Hrs;
      const rateNext16 = next16 / 16;
      return {
        primaryValue: `${Math.round(total24).toLocaleString("id-ID")}`,
        primaryUnit: "mL RL / 24 jam",
        severity: tbsa >= 20 ? "high" : "moderate",
        categoryLabel: tbsa >= 20 ? "Luka Bakar Mayor — Resusitasi Intensif" : "Resusitasi Cairan Standar",
        interpretation:
          "Berikan 50% volume dalam 8 jam pertama SEJAK WAKTU KEJADIAN luka bakar, dan 50% sisanya dalam 16 jam berikutnya. Titrasi laju cairan untuk target produksi urin dewasa 0,5 mL/kg/jam (anak 1 mL/kg/jam).",
        secondaryMetrics: [
          { label: `8 Jam Pertama (sisa ${f(remainFirst8Hrs, 1)} jam)`, value: `${Math.round(first8).toLocaleString("id-ID")} mL (${Math.round(rateFirst8)} mL/jam)` },
          { label: "16 Jam Berikutnya", value: `${Math.round(next16).toLocaleString("id-ID")} mL (${Math.round(rateNext16)} mL/jam)` },
          { label: "Target Produksi Urin Dewasa", value: `${Math.round(wt * 0.5)}–${Math.round(wt * 1)} mL/jam` },
        ],
        formulaDisplay: `Total 24 jam = 4 mL × ${wt} kg × ${tbsa}% TBSA = ${Math.round(total24).toLocaleString("id-ID")} mL`,
        reference: "Adaptasi Medscape Medical Calculators · Baxter CR & Shires T (Parkland Formula)",
      };
    },
  },
  {
    id: "winters-formula",
    title: "Rumus Winter (Kompensasi Asidosis Metabolik)",
    englishTitle: "Winter's Formula for Metabolic Acidosis Compensation",
    specialty: "critical_care",
    shortDesc: "Memprediksi PaCO₂ terkompensasi pada asidosis metabolik untuk mendeteksi gangguan respiratorik penyerta.",
    keywords: ["winter", "agda", "agd", "paco2", "asidosis", "asam basa", "icu"],
    fields: [
      { key: "hco3", label: "Bikarbonat (HCO₃⁻)", type: "number", unit: "mEq/L", min: 2, max: 30, step: 0.5, defaultValue: 12 },
      { key: "paco2", label: "PaCO₂ Terukur dari AGD", type: "number", unit: "mmHg", min: 10, max: 100, step: 0.5, defaultValue: 26 },
    ],
    compute: (v) => {
      const hco3 = num(v, "hco3", 12);
      const meas = num(v, "paco2", 26);
      const expected = 1.5 * hco3 + 8;
      const low = expected - 2;
      const high = expected + 2;
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Kompensasi Respiratorik Adekuat";
      let interpretation = "PaCO₂ terukur berada dalam rentang kompensasi yang diharapkan — tidak terdapat gangguan asam-basa respiratorik primer penyerta.";
      if (meas > high) {
        severity = "high";
        categoryLabel = "Asidosis Respiratorik Penyerta (Retensi CO₂)";
        interpretation = "PaCO₂ lebih tinggi dari yang diharapkan. Pasien mengalami kegagalan kompensasi / hipoventilasi — waspadai kelelahan otot napas!";
      } else if (meas < low) {
        severity = "moderate";
        categoryLabel = "Alkalosis Respiratorik Penyerta (Hiperventilasi)";
        interpretation = "PaCO₂ lebih rendah dari yang diharapkan. Pertimbangkan sepsis dini, nyeri hebat, ansietas, atau salisilat.";
      }
      return {
        primaryValue: `${f(low, 1)}–${f(high, 1)}`,
        primaryUnit: "mmHg (Rentang PaCO₂)",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          { label: "PaCO₂ Tengah Prediksi", value: `${f(expected, 1)} mmHg` },
          { label: "PaCO₂ Terukur Pasien", value: `${f(meas, 1)} mmHg` },
        ],
        formulaDisplay: `PaCO₂ Prediksi = (1,5 × ${f(hco3, 1)}) + 8 ± 2 = ${f(expected, 1)} ± 2 mmHg`,
        reference: "Adaptasi Medscape Medical Calculators · Albert MS, Dell RB, Winters RW (Ann Intern Med 1967)",
      };
    },
  },
  {
    id: "news2-score",
    title: "Skor NEWS2 (Early Warning Score Klinis)",
    englishTitle: "National Early Warning Score 2 (NEWS2)",
    specialty: "critical_care",
    shortDesc: "Sistem peringatan dini standar untuk mendeteksi perburukan klinis akut pada pasien rawat inap & IGD.",
    keywords: ["news2", "ews", "early warning", "sepsis", "tanda vital", "igd", "icu"],
    fields: [
      { key: "rr", label: "Laju Napas (RR)", type: "number", unit: "x/menit", min: 4, max: 60, step: 1, defaultValue: 20 },
      { key: "spo2", label: "Saturasi Oksigen (SpO₂)", type: "number", unit: "%", min: 50, max: 100, step: 1, defaultValue: 96 },
      { key: "o2", label: "Menggunakan Oksigen Tambahan", type: "checkbox", defaultValue: false, badgeText: "+2" },
      { key: "sbp", label: "Tekanan Darah Sistolik (TDS)", type: "number", unit: "mmHg", min: 40, max: 260, step: 1, defaultValue: 118 },
      { key: "hr", label: "Denyut Nadi (HR)", type: "number", unit: "x/menit", min: 20, max: 220, step: 1, defaultValue: 88 },
      { key: "temp", label: "Suhu Tubuh", type: "number", unit: "°C", min: 32, max: 42, step: 0.1, defaultValue: 37.2 },
      {
        key: "acvpu",
        label: "Kesadaran (ACVPU)",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "Alert / Sadar Penuh (0 poin)", value: 0 },
          { label: "Confusion / Voice / Pain / Unresponsive (+3 poin)", value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const rr = num(v, "rr", 20);
      const spo2 = num(v, "spo2", 96);
      const o2 = bool(v, "o2") ? 2 : 0;
      const sbp = num(v, "sbp", 118);
      const hr = num(v, "hr", 88);
      const temp = num(v, "temp", 37.2);
      const acvpu = num(v, "acvpu", 0);

      const sRR = rr <= 8 || rr >= 25 ? 3 : rr >= 21 ? 2 : rr <= 11 ? 1 : 0;
      const sSpo2 = spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0;
      const sSbp = sbp <= 90 || sbp >= 220 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : 0;
      const sHr = hr <= 40 || hr >= 131 ? 3 : hr >= 111 ? 2 : hr <= 50 || hr >= 91 ? 1 : 0;
      const sTemp = temp <= 35.0 ? 3 : temp >= 39.1 ? 2 : temp <= 36.0 || temp >= 38.1 ? 1 : 0;

      const score = sRR + sSpo2 + o2 + sSbp + sHr + sTemp + acvpu;
      const hasRedFlag = [sRR, sSpo2, sSbp, sHr, sTemp, acvpu].some((x) => x === 3);
      let severity: CalcComputeResult["severity"] = "low";
      let categoryLabel = "Risiko Rendah (0–4)";
      let interpretation = "Pemantauan tanda vital rutin tiap 4–6 jam (atau 12 jam bila skor 0).";
      if (score >= 7) {
        severity = "critical";
        categoryLabel = "Risiko Klinis Tinggi (NEWS2 ≥ 7)";
        interpretation = "Respons emergensi segera oleh tim dokter jaga / tim reaksi cepat (Code Blue / ICU). Pemantauan tanda vital kontinu.";
      } else if (score >= 5 || hasRedFlag) {
        severity = "high";
        categoryLabel = hasRedFlag && score < 5 ? "Risiko Rendah–Sedang (Ada Parameter Skor 3)" : "Risiko Klinis Sedang (NEWS2 5–6)";
        interpretation = "Evaluasi segera oleh dokter ruangan dalam < 30 menit, skrining sepsis, dan tingkatkan pemantauan minimal tiap 1 jam.";
      }
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–20)",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          { label: "Rincian Skor", value: `RR:${sRR} · SpO₂:${sSpo2} · O₂:${o2} · TDS:${sSbp} · HR:${sHr} · T:${sTemp} · Kesadaran:${acvpu}` },
        ],
        formulaDisplay: `NEWS2 = ${sRR} + ${sSpo2} + ${o2} + ${sSbp} + ${sHr} + ${sTemp} + ${acvpu} = ${score}`,
        reference: "Adaptasi Medscape Medical Calculators · Royal College of Physicians (NEWS2 2017)",
      };
    },
  },

  // ==========================================================================
  // 4. GASTROENTEROLOGI & HEPATOLOGI
  // ==========================================================================
  {
    id: "meld-na",
    title: "Skor MELD & MELD-Na (Penyakit Hati Kronis)",
    englishTitle: "MELD & MELD-Na Score for Liver Disease",
    specialty: "hepatology",
    shortDesc: "Mengestimasi mortalitas 90 hari dan prioritas transplantasi hati pada pasien sirosis stadium lanjut.",
    keywords: ["meld", "meld-na", "sirosis", "hati", "liver", "hepatologi", "bilirubin", "inr"],
    fields: [
      { key: "bili", label: "Bilirubin Total", type: "number", unit: "mg/dL", min: 0.1, max: 60, step: 0.1, defaultValue: 2.4 },
      { key: "inr", label: "INR", type: "number", unit: "", min: 0.5, max: 15, step: 0.1, defaultValue: 1.5 },
      { key: "cr", label: "Kreatinin Serum", type: "number", unit: "mg/dL", min: 0.1, max: 15, step: 0.1, defaultValue: 1.3 },
      { key: "na", label: "Natrium Serum (Na⁺)", type: "number", unit: "mEq/L", min: 110, max: 160, step: 1, defaultValue: 132 },
      { key: "dialysis", label: "Hemodialisis ≥ 2× dalam 7 hari terakhir", type: "checkbox", defaultValue: false },
    ],
    compute: (v) => {
      const bili = Math.max(1, num(v, "bili", 2.4));
      const inr = Math.max(1, num(v, "inr", 1.5));
      const crRaw = bool(v, "dialysis") ? 4.0 : num(v, "cr", 1.3);
      const cr = Math.min(4.0, Math.max(1, crRaw));
      const na = Math.min(137, Math.max(125, num(v, "na", 132)));

      const meldRaw = 9.57 * Math.log(cr) + 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 6.43;
      const meld = Math.min(40, Math.max(6, Math.round(meldRaw)));
      let meldNa = meld;
      if (meld > 11) {
        meldNa = Math.min(40, Math.max(6, Math.round(meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na))));
      }
      let mort = "1,9%";
      let severity: CalcComputeResult["severity"] = "low";
      if (meldNa >= 40) { mort = "71,3%"; severity = "critical"; }
      else if (meldNa >= 30) { mort = "52,6%"; severity = "critical"; }
      else if (meldNa >= 20) { mort = "19,6%"; severity = "high"; }
      else if (meldNa >= 10) { mort = "6,0%"; severity = "moderate"; }
      return {
        primaryValue: `${meldNa}`,
        primaryUnit: "MELD-Na (6–40)",
        severity,
        categoryLabel: `Estimasi Mortalitas 90 Hari: ${mort}`,
        interpretation:
          meldNa >= 15
            ? "Skor MELD-Na ≥ 15 merupakan indikasi rujukan evaluasi transplantasi hati dan pemantauan ketat komplikasi sirosis."
            : "Skor MELD-Na < 15 menunjukkan prognosis jangka pendek lebih baik; fokus pada pengendalian etiologi sirosis dan pencegahan dekompensasi.",
        secondaryMetrics: [
          { label: "Skor MELD Klasik", value: `${meld}` },
          { label: "Mortalitas 3 Bulan", value: mort },
        ],
        formulaDisplay: `MELD = 9,57·ln(${f(cr, 1)}) + 3,78·ln(${f(bili, 1)}) + 11,2·ln(${f(inr, 1)}) + 6,43 = ${meld} → MELD-Na = ${meldNa}`,
        reference: "Adaptasi Medscape Medical Calculators · UNOS / OPTN Policy (Kamath PS et al.)",
      };
    },
  },
  {
    id: "child-pugh",
    title: "Skor Child-Pugh (Klasifikasi Sirosis Hati)",
    englishTitle: "Child-Pugh Score for Cirrhosis Mortality",
    specialty: "hepatology",
    shortDesc: "Klasifikasi tingkat keparahan sirosis (Kelas A, B, C) serta estimasi kesintasan 1 dan 2 tahun.",
    keywords: ["child-pugh", "sirosis", "asites", "ensefalopati", "hepatologi", "liver"],
    fields: [
      {
        key: "bili",
        label: "Bilirubin Total",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "< 2,0 mg/dL (+1 poin)", value: 1 },
          { label: "2,0–3,0 mg/dL (+2 poin)", value: 2 },
          { label: "> 3,0 mg/dL (+3 poin)", value: 3 },
        ],
      },
      {
        key: "alb",
        label: "Albumin Serum",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "> 3,5 g/dL (+1 poin)", value: 1 },
          { label: "2,8–3,5 g/dL (+2 poin)", value: 2 },
          { label: "< 2,8 g/dL (+3 poin)", value: 3 },
        ],
      },
      {
        key: "inr",
        label: "INR",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "< 1,7 (+1 poin)", value: 1 },
          { label: "1,7–2,2 (+2 poin)", value: 2 },
          { label: "> 2,2 (+3 poin)", value: 3 },
        ],
      },
      {
        key: "ascites",
        label: "Asites",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Tidak ada (+1 poin)", value: 1 },
          { label: "Ringan / terkontrol diuretik (+2 poin)", value: 2 },
          { label: "Sedang–berat / refrakter (+3 poin)", value: 3 },
        ],
      },
      {
        key: "enceph",
        label: "Ensefalopati Hepatikum",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Tidak ada (+1 poin)", value: 1 },
          { label: "Derajat 1–2 (+2 poin)", value: 2 },
          { label: "Derajat 3–4 (+3 poin)", value: 3 },
        ],
      },
    ],
    compute: (v) => {
      const score = num(v, "bili", 1) + num(v, "alb", 1) + num(v, "inr", 1) + num(v, "ascites", 1) + num(v, "enceph", 1);
      const cls = score <= 6 ? "A" : score <= 9 ? "B" : "C";
      const surv1 = cls === "A" ? "100%" : cls === "B" ? "80%" : "45%";
      const surv2 = cls === "A" ? "85%" : cls === "B" ? "60%" : "35%";
      const severity: CalcComputeResult["severity"] = cls === "C" ? "critical" : cls === "B" ? "high" : "low";
      return {
        primaryValue: `Kelas ${cls} (${score})`,
        primaryUnit: "poin (5–15)",
        severity,
        categoryLabel:
          cls === "A"
            ? "Sirosis Terkompensasi (Child-Pugh A)"
            : cls === "B"
            ? "Gangguan Fungsional Bermakna (Child-Pugh B)"
            : "Sirosis Dekompensasi Berat (Child-Pugh C)",
        interpretation:
          cls === "C"
            ? "Prognosis berat dengan risiko mortalitas perioperatif sangat tinggi (~82%). Evaluasi penyesuaian dosis obat hepatik secara ketat."
            : cls === "B"
            ? "Risiko komplikasi dan mortalitas operasi meningkat (~30%). Perlu penyesuaian dosis berbagai obat yang dimetabolisme di hati."
            : "Fungsi sintesis hati relatif terjaga baik (terkompensasi).",
        secondaryMetrics: [
          { label: "Kesintasan 1 Tahun", value: surv1 },
          { label: "Kesintasan 2 Tahun", value: surv2 },
        ],
        formulaDisplay: `Skor Total = ${score} poin → Kelas ${cls} (A: 5–6 · B: 7–9 · C: 10–15)`,
        reference: "Adaptasi Medscape Medical Calculators · Pugh RNH et al. (Br J Surg 1973)",
      };
    },
  },
  {
    id: "fib4-apri",
    title: "Indeks FIB-4 & APRI (Skrining Fibrosis Hati)",
    englishTitle: "Fibrosis-4 (FIB-4) & APRI Index",
    specialty: "hepatology",
    shortDesc: "Estimasi non-invasif derajat fibrosis hati pada MASLD/NAFLD, Hepatitis B, dan Hepatitis C.",
    keywords: ["fib4", "apri", "fibrosis", "hati", "sgot", "sgpt", "trombosit", "hepatologi"],
    fields: [
      { key: "age", label: "Usia", type: "number", unit: "tahun", min: 18, max: 110, step: 1, defaultValue: 52 },
      { key: "ast", label: "AST (SGOT)", type: "number", unit: "U/L", min: 5, max: 2000, step: 1, defaultValue: 58 },
      { key: "alt", label: "ALT (SGPT)", type: "number", unit: "U/L", min: 5, max: 2000, step: 1, defaultValue: 46 },
      { key: "plt", label: "Trombosit", type: "number", unit: "×10⁹/L (ribu/µL)", min: 10, max: 1000, step: 1, defaultValue: 165 },
      { key: "astUln", label: "Batas Normal Atas AST (ULN)", type: "number", unit: "U/L", min: 20, max: 60, step: 1, defaultValue: 40 },
    ],
    compute: (v) => {
      const age = num(v, "age", 52);
      const ast = num(v, "ast", 58);
      const alt = Math.max(1, num(v, "alt", 46));
      const plt = Math.max(1, num(v, "plt", 165));
      const uln = Math.max(1, num(v, "astUln", 40));

      const fib4 = (age * ast) / (plt * Math.sqrt(alt));
      const apri = ((ast / uln) / plt) * 100;
      const severity: CalcComputeResult["severity"] = fib4 >= 2.67 ? "high" : fib4 >= 1.3 ? "moderate" : "low";
      return {
        primaryValue: f(fib4, 2),
        primaryUnit: "FIB-4",
        severity,
        categoryLabel:
          fib4 >= 2.67
            ? "Risiko Tinggi Fibrosis Lanjut (F3–F4)"
            : fib4 >= 1.3
            ? "Risiko Indeterminate (1,30–2,66)"
            : "Risiko Rendah Fibrosis Lanjut (< 1,30)",
        interpretation:
          fib4 >= 2.67
            ? "Probabilitas tinggi fibrosis lanjut/sirosis. Rujuk ke spesialis hepatologi / pemeriksaan elastografi (FibroScan)."
            : fib4 >= 1.3
            ? "Memerlukan pemeriksaan stratifikasi sekunder seperti elastografi transien (FibroScan) atau tes ELF."
            : "Nilai prediktif negatif tinggi untuk menyingkirkan fibrosis lanjut (pada usia ≥ 65 thn ambang batas rendah menjadi < 2,0).",
        secondaryMetrics: [
          { label: "Skor APRI", value: f(apri, 2), note: apri >= 1.0 ? "Curiga sirosis (≥ 1,0)" : apri < 0.5 ? "Risiko rendah (< 0,5)" : "Indeterminate" },
          { label: "Rasio AST / ALT (De Ritis)", value: f(ast / alt, 2) },
        ],
        formulaDisplay: `FIB-4 = (${age} × ${ast}) / (${plt} × √${alt}) = ${f(fib4, 2)} | APRI = ${f(apri, 2)}`,
        reference: "Adaptasi Medscape Medical Calculators · Sterling RK et al. (Hepatology 2006) & AASLD",
      };
    },
  },
  {
    id: "maddrey-df",
    title: "Fungsi Diskriminan Maddrey (Hepatitis Alkoholik)",
    englishTitle: "Maddrey's Discriminant Function for Alcoholic Hepatitis",
    specialty: "hepatology",
    shortDesc: "Menentukan derajat keparahan hepatitis alkoholik akut dan indikasi terapi kortikosteroid (prednisolon).",
    keywords: ["maddrey", "hepatitis", "alkohol", "prednisolon", "pt", "bilirubin", "hepatologi"],
    fields: [
      { key: "pt", label: "PT Pasien (Prothrombin Time)", type: "number", unit: "detik", min: 8, max: 80, step: 0.1, defaultValue: 18.5 },
      { key: "ptCtrl", label: "PT Kontrol Laboratorium", type: "number", unit: "detik", min: 8, max: 20, step: 0.1, defaultValue: 12.0 },
      { key: "bili", label: "Bilirubin Total", type: "number", unit: "mg/dL", min: 0.1, max: 60, step: 0.1, defaultValue: 8.2 },
    ],
    compute: (v) => {
      const pt = num(v, "pt", 18.5);
      const ctrl = num(v, "ptCtrl", 12.0);
      const bili = num(v, "bili", 8.2);
      const df = 4.6 * (pt - ctrl) + bili;
      const severe = df >= 32;
      return {
        primaryValue: f(df, 1),
        primaryUnit: "Maddrey DF",
        severity: severe ? "critical" : "moderate",
        categoryLabel: severe ? "Hepatitis Alkoholik Berat (DF ≥ 32)" : "Hepatitis Alkoholik Ringan–Sedang (DF < 32)",
        interpretation: severe
          ? "Risiko mortalitas 30 hari tinggi (30–50%). Pertimbangkan terapi kortikosteroid (prednisolon 40 mg/hari selama 28 hari) bila tidak ada kontraindikasi infeksi/perdarahan GI, lalu evaluasi skor Lille hari ke-7."
          : "Prognosis jangka pendek lebih baik; utamakan abstinensi alkohol total dan dukungan nutrisi intensif.",
        formulaDisplay: `DF = 4,6 × (${f(pt, 1)} − ${f(ctrl, 1)}) + ${f(bili, 1)} = ${f(df, 1)}`,
        reference: "Adaptasi Medscape Medical Calculators · Maddrey WC et al. (Gastroenterology 1978)",
      };
    },
  },

  // ==========================================================================
  // 5. PULMONOLOGI & VASKULAR
  // ==========================================================================
  {
    id: "aa-gradient",
    title: "Gradien A-a Oksigen (Alveolar–Arterial)",
    englishTitle: "Alveolar-Arterial (A-a) Oxygen Gradient",
    specialty: "pulmonology",
    shortDesc: "Membedakan penyebab hipoksemia (hipoventilasi murni vs V/Q mismatch, pirau, atau gangguan difusi).",
    keywords: ["a-a", "gradien", "hipoksemia", "agd", "oksigen", "pulmonologi", "paru"],
    fields: [
      { key: "age", label: "Usia Pasien", type: "number", unit: "tahun", min: 1, max: 110, step: 1, defaultValue: 48 },
      { key: "fio2", label: "Fraksi Oksigen Inspirasi (FiO₂)", type: "number", unit: "%", min: 21, max: 100, step: 1, defaultValue: 21 },
      { key: "pao2", label: "PaO₂ (dari AGD)", type: "number", unit: "mmHg", min: 20, max: 600, step: 1, defaultValue: 74 },
      { key: "paco2", label: "PaCO₂ (dari AGD)", type: "number", unit: "mmHg", min: 10, max: 120, step: 1, defaultValue: 40 },
      { key: "patm", label: "Tekanan Barometrik (Permukaan Laut = 760)", type: "number", unit: "mmHg", min: 500, max: 800, step: 1, defaultValue: 760 },
    ],
    compute: (v) => {
      const age = num(v, "age", 48);
      const fio2 = num(v, "fio2", 21) / 100;
      const pao2 = num(v, "pao2", 74);
      const paco2 = num(v, "paco2", 40);
      const patm = num(v, "patm", 760);
      const pAO2 = fio2 * (patm - 47) - paco2 / 0.8;
      const grad = pAO2 - pao2;
      const expectedNormal = age / 4 + 4;
      const elevated = grad > expectedNormal;
      return {
        primaryValue: f(grad, 1),
        primaryUnit: "mmHg",
        severity: elevated ? (grad > expectedNormal + 15 ? "high" : "moderate") : "normal",
        categoryLabel: elevated
          ? `Gradien A-a Meningkat (Normal Usia ≤ ${f(expectedNormal, 1)} mmHg)`
          : `Gradien A-a Normal (≤ ${f(expectedNormal, 1)} mmHg)`,
        interpretation: elevated
          ? "Gradien A-a melebar menandakan kelainan pertukaran gas intrinsik paru: V/Q mismatch (emboli paru, pneumonia, PPOK, asma), pirau kanan-ke-kiri, atau gangguan difusi (edema paru/ILD)."
          : "Bila terjadi hipoksemia dengan gradien A-a normal, penyebabnya adalah hipoventilasi alveolar (depresi SSP, kelemahan neuromuskular) atau rendahnya FiO₂ lingkungan.",
        secondaryMetrics: [
          { label: "PAO₂ (Alveolar)", value: `${f(pAO2, 1)} mmHg` },
          { label: "Batas Normal Sesuai Usia", value: `≤ ${f(expectedNormal, 1)} mmHg` },
          { label: "Rasio PaO₂ / FiO₂ (P/F Ratio)", value: `${Math.round(pao2 / fio2)} mmHg` },
        ],
        formulaDisplay: `A-a = [${f(fio2, 2)}×(${patm}−47) − (${paco2}/0,8)] − ${pao2} = ${f(grad, 1)} mmHg`,
        reference: "Adaptasi Medscape Medical Calculators · Alveolar Gas Equation",
      };
    },
  },
  {
    id: "wells-pe",
    title: "Kriteria Wells — Emboli Paru (PE)",
    englishTitle: "Wells' Criteria for Pulmonary Embolism",
    specialty: "pulmonology",
    shortDesc: "Menilai probabilitas klinis emboli paru untuk memandu pemeriksaan D-Dimer vs CT Angiografi Paru.",
    keywords: ["wells", "pe", "emboli paru", "ddimer", "ctpa", "pulmonologi", "sesak"],
    fields: [
      { key: "dvt", label: "Tanda & gejala klinis DVT (bengkak tungkai, nyeri vena dalam)", type: "checkbox", defaultValue: false, badgeText: "+3" },
      { key: "alt", label: "PE adalah diagnosis paling mungkin (atau setara)", type: "checkbox", defaultValue: true, badgeText: "+3" },
      { key: "hr", label: "Denyut Jantung > 100 x/menit", type: "checkbox", defaultValue: true, badgeText: "+1,5" },
      { key: "immob", label: "Imobilisasi ≥ 3 hari atau operasi dalam 4 minggu terakhir", type: "checkbox", defaultValue: false, badgeText: "+1,5" },
      { key: "prev", label: "Riwayat DVT atau PE sebelumnya", type: "checkbox", defaultValue: false, badgeText: "+1,5" },
      { key: "hemop", label: "Hemoptisis (Batuk darah)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "cancer", label: "Keganasan aktif (terapi dalam 6 bulan terakhir / paliatif)", type: "checkbox", defaultValue: false, badgeText: "+1" },
    ],
    compute: (v) => {
      const score =
        (bool(v, "dvt") ? 3 : 0) +
        (bool(v, "alt") ? 3 : 0) +
        (bool(v, "hr") ? 1.5 : 0) +
        (bool(v, "immob") ? 1.5 : 0) +
        (bool(v, "prev") ? 1.5 : 0) +
        (bool(v, "hemop") ? 1 : 0) +
        (bool(v, "cancer") ? 1 : 0);
      const likely = score > 4;
      const severity: CalcComputeResult["severity"] = score > 6 ? "critical" : likely ? "high" : "low";
      return {
        primaryValue: f(score, 1),
        primaryUnit: "poin (maks 12,5)",
        severity,
        categoryLabel: likely ? "PE Likely / Probabilitas Tinggi (> 4 poin)" : "PE Unlikely / Probabilitas Rendah (≤ 4 poin)",
        interpretation: likely
          ? "Langsung pertimbangkan CT Pulmonary Angiography (CTPA) tanpa menunggu D-Dimer, serta antikoagulasi empiris bila tidak ada kontraindikasi."
          : "Periksa D-Dimer sensitivitas tinggi (atau skor PERC bila risiko sangat rendah < 2). D-Dimer negatif menyingkirkan PE secara aman.",
        secondaryMetrics: [
          { label: "Stratifikasi 3-Tingkat", value: score > 6 ? "Tinggi (>6)" : score >= 2 ? "Sedang (2–6)" : "Rendah (<2)" },
        ],
        formulaDisplay: `Skor Wells PE = ${f(score, 1)} poin (Ambang dua-tingkat: > 4 = PE Likely)`,
        reference: "Adaptasi Medscape Medical Calculators · Wells PS et al. (Thromb Haemost 2000)",
      };
    },
  },
  {
    id: "wells-dvt",
    title: "Kriteria Wells — Trombosis Vena Dalam (DVT)",
    englishTitle: "Wells' Criteria for Deep Vein Thrombosis (DVT)",
    specialty: "pulmonology",
    shortDesc: "Stratifikasi probabilitas klinis DVT ekstremitas bawah untuk alur USG Doppler kompresi vs D-Dimer.",
    keywords: ["wells", "dvt", "trombosis", "vena", "tungkai", "bengkak", "vaskular"],
    fields: [
      { key: "c1", label: "Kanker aktif (terapi dalam 6 bulan / paliatif)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c2", label: "Paralisis, paresis, atau imobilisasi gips tungkai bawah", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c3", label: "Tirah baring > 3 hari atau operasi besar dalam 12 minggu", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c4", label: "Nyeri tekan terlokalisasi sepanjang distribusi vena dalam", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "c5", label: "Pembengkakan seluruh tungkai", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c6", label: "Lingkar betis > 3 cm lebih besar dari sisi asimtomatik", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "c7", label: "Edema pitting lebih nyata pada tungkai yang sakit", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c8", label: "Vena superfisial kolateral (non-varises)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "c9", label: "Riwayat DVT terdokumentasi sebelumnya", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "alt", label: "Diagnosis alternatif minimal sama mungkinnya dengan DVT", type: "checkbox", defaultValue: false, badgeText: "−2" },
    ],
    compute: (v) => {
      let score = 0;
      for (let i = 1; i <= 9; i++) {
        if (bool(v, `c${i}`)) score += 1;
      }
      if (bool(v, "alt")) score -= 2;
      const likely = score >= 2;
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (−2 s.d. 9)",
        severity: score >= 3 ? "high" : likely ? "moderate" : "low",
        categoryLabel: likely ? "DVT Likely (≥ 2 poin)" : "DVT Unlikely (< 2 poin)",
        interpretation: likely
          ? "Lakukan USG Doppler Vena Kompresi segera. Jika hasil USG negatif tetapi D-Dimer positif, ulangi USG dalam 1 minggu."
          : "Lakukan pemeriksaan D-Dimer. Bila D-Dimer negatif, DVT dapat disingkirkan dengan aman.",
        formulaDisplay: `Skor Wells DVT = ${score} poin (Ambang DVT Likely ≥ 2)`,
        reference: "Adaptasi Medscape Medical Calculators · Wells PS et al. (NEJM 2003)",
      };
    },
  },
  {
    id: "lights-criteria",
    title: "Kriteria Light (Efusi Pleura: Transudat vs Eksudat)",
    englishTitle: "Light's Criteria for Pleural Effusion",
    specialty: "pulmonology",
    shortDesc: "Membedakan cairan efusi pleura eksudat dan transudat berdasarkan protein & LDH cairan pleura serta serum.",
    keywords: ["light", "efusi pleura", "eksudat", "transudat", "ldh", "protein", "pulmonologi"],
    fields: [
      { key: "pProt", label: "Protein Cairan Pleura", type: "number", unit: "g/dL", min: 0, max: 15, step: 0.1, defaultValue: 3.8 },
      { key: "sProt", label: "Protein Serum", type: "number", unit: "g/dL", min: 1, max: 15, step: 0.1, defaultValue: 6.5 },
      { key: "pLdh", label: "LDH Cairan Pleura", type: "number", unit: "U/L", min: 0, max: 5000, step: 5, defaultValue: 240 },
      { key: "sLdh", label: "LDH Serum", type: "number", unit: "U/L", min: 10, max: 5000, step: 5, defaultValue: 220 },
      { key: "sLdhUln", label: "Batas Normal Atas LDH Serum (ULN)", type: "number", unit: "U/L", min: 100, max: 600, step: 5, defaultValue: 250 },
    ],
    compute: (v) => {
      const pProt = num(v, "pProt", 3.8);
      const sProt = Math.max(0.1, num(v, "sProt", 6.5));
      const pLdh = num(v, "pLdh", 240);
      const sLdh = Math.max(1, num(v, "sLdh", 220));
      const uln = Math.max(1, num(v, "sLdhUln", 250));

      const protRatio = pProt / sProt;
      const ldhRatio = pLdh / sLdh;
      const ldhTwoThirds = (2 / 3) * uln;
      const c1 = protRatio > 0.5;
      const c2 = ldhRatio > 0.6;
      const c3 = pLdh > ldhTwoThirds;
      const metCount = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
      const isExudate = metCount >= 1;
      return {
        primaryValue: isExudate ? "Eksudat" : "Transudat",
        primaryUnit: `(${metCount} dari 3 kriteria terpenuhi)`,
        severity: isExudate ? "high" : "low",
        categoryLabel: isExudate ? "Cairan Pleura Eksudat" : "Cairan Pleura Transudat",
        interpretation: isExudate
          ? "Memenuhi ≥ 1 Kriteria Light → Eksudat. Pertimbangkan infeksi (TB paru, pneumonia/empiema), keganasan, emboli paru, atau penyakit autoimun."
          : "Tidak memenuhi satupun Kriteria Light → Transudat. Umumnya disebabkan gagal jantung kongestif, sirosis hati, atau sindrom nefrotik.",
        secondaryMetrics: [
          { label: "Rasio Protein Pleura/Serum (> 0,5)", value: `${f(protRatio, 2)} (${c1 ? "Positif" : "Negatif"})` },
          { label: "Rasio LDH Pleura/Serum (> 0,6)", value: `${f(ldhRatio, 2)} (${c2 ? "Positif" : "Negatif"})` },
          { label: `LDH Pleura > 2/3 ULN (> ${Math.round(ldhTwoThirds)})`, value: `${pLdh} U/L (${c3 ? "Positif" : "Negatif"})` },
        ],
        formulaDisplay: `Prot Ratio = ${f(protRatio, 2)} | LDH Ratio = ${f(ldhRatio, 2)} | 2/3 ULN = ${Math.round(ldhTwoThirds)} U/L`,
        reference: "Adaptasi Medscape Medical Calculators · Light RW et al. (Ann Intern Med 1972)",
      };
    },
  },

  // ==========================================================================
  // 6. NEUROLOGI
  // ==========================================================================
  {
    id: "abcd2-tia",
    title: "Skor ABCD² (Risiko Stroke Setelah TIA)",
    englishTitle: "ABCD2 Score for TIA Stroke Risk",
    specialty: "neurology",
    shortDesc: "Mengestimasi risiko stroke iskemik dalam 2, 7, dan 90 hari setelah serangan iskemik transien (TIA).",
    keywords: ["abcd2", "tia", "stroke", "neurologi", "kelemahan", "afasia"],
    fields: [
      { key: "age", label: "Usia ≥ 60 tahun (A)", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "bp", label: "Tekanan Darah ≥ 140/90 mmHg saat evaluasi awal (B)", type: "checkbox", defaultValue: true, badgeText: "+1" },
      {
        key: "clin",
        label: "Gambaran Klinis TIA (C)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "Gejala lain (0 poin)", value: 0 },
          { label: "Gangguan bicara tanpa kelemahan (+1 poin)", value: 1 },
          { label: "Kelemahan unilateral (+2 poin)", value: 2 },
        ],
      },
      {
        key: "dur",
        label: "Durasi Gejala (D₁)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "< 10 menit (0 poin)", value: 0 },
          { label: "10–59 menit (+1 poin)", value: 1 },
          { label: "≥ 60 menit (+2 poin)", value: 2 },
        ],
      },
      { key: "dm", label: "Diabetes Melitus (D₂)", type: "checkbox", defaultValue: false, badgeText: "+1" },
    ],
    compute: (v) => {
      const score = (bool(v, "age") ? 1 : 0) + (bool(v, "bp") ? 1 : 0) + num(v, "clin") + num(v, "dur") + (bool(v, "dm") ? 1 : 0);
      const r2 = score >= 6 ? "8,1%" : score >= 4 ? "4,1%" : "1,0%";
      const r7 = score >= 6 ? "11,7%" : score >= 4 ? "5,9%" : "1,2%";
      const r90 = score >= 6 ? "17,8%" : score >= 4 ? "9,8%" : "3,1%";
      const severity: CalcComputeResult["severity"] = score >= 6 ? "critical" : score >= 4 ? "high" : "low";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–7)",
        severity,
        categoryLabel: score >= 6 ? "Risiko Tinggi Stroke Pasca-TIA (6–7)" : score >= 4 ? "Risiko Sedang (4–5)" : "Risiko Rendah (0–3)",
        interpretation:
          score >= 4
            ? "Observasi rawat inap / evaluasi neurovaskular segera (MRI/CT otak, Doppler karotis, EKG) dan terapi antiplatelet pencegahan sekunder."
            : "Evaluasi neurovaskular cepat dalam 24–48 jam serta optimalisasi faktor risiko vaskular.",
        secondaryMetrics: [
          { label: "Risiko Stroke 2 Hari", value: r2 },
          { label: "Risiko Stroke 7 Hari", value: r7 },
          { label: "Risiko Stroke 90 Hari", value: r90 },
        ],
        formulaDisplay: `ABCD² = A + B + C + D₁ + D₂ = ${score} poin`,
        reference: "Adaptasi Medscape Medical Calculators · Johnston SC et al. (Lancet 2007)",
      };
    },
  },
  {
    id: "ich-score",
    title: "Skor ICH (Prognosis Perdarahan Intraserebral)",
    englishTitle: "Intracerebral Hemorrhage (ICH) Score",
    specialty: "neurology",
    shortDesc: "Memprediksi mortalitas 30 hari pada stroke perdarahan intraserebral spontan berdasarkan GCS & CT kepala.",
    keywords: ["ich", "stroke hemoragik", "perdarahan otak", "gcs", "neurologi", "ct scan"],
    fields: [
      {
        key: "gcs",
        label: "Glasgow Coma Scale (GCS)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "GCS 13–15 (0 poin)", value: 0 },
          { label: "GCS 5–12 (+1 poin)", value: 1 },
          { label: "GCS 3–4 (+2 poin)", value: 2 },
        ],
      },
      { key: "vol", label: "Volume Hematoma ICH ≥ 30 mL (rumus ABC/2)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "ivh", label: "Perdarahan Intraventrikular (IVH)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "infra", label: "Lokasi Infratentorial (Serebelum / Batang Otak)", type: "checkbox", defaultValue: false, badgeText: "+1" },
      { key: "age80", label: "Usia ≥ 80 tahun", type: "checkbox", defaultValue: false, badgeText: "+1" },
    ],
    compute: (v) => {
      const score = num(v, "gcs") + (bool(v, "vol") ? 1 : 0) + (bool(v, "ivh") ? 1 : 0) + (bool(v, "infra") ? 1 : 0) + (bool(v, "age80") ? 1 : 0);
      const mortMap = ["0%", "13%", "26%", "72%", "97%", "100%", "100%"];
      const mort = mortMap[Math.min(score, 6)];
      const severity: CalcComputeResult["severity"] = score >= 3 ? "critical" : score >= 2 ? "high" : score === 1 ? "moderate" : "low";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–6)",
        severity,
        categoryLabel: `Estimasi Mortalitas 30 Hari: ${mort}`,
        interpretation:
          "Skor ICH digunakan sebagai alat komunikasi klinis standar tingkat keparahan stroke hemoragik—jangan jadikan satu-satunya alasan penghentian perawatan agresif dini.",
        formulaDisplay: `Skor ICH = ${score} poin → Mortalitas 30 hari: ${mort}`,
        reference: "Adaptasi Medscape Medical Calculators · Hemphill JC et al. (Stroke 2001)",
      };
    },
  },

  // ==========================================================================
  // 7. HEMATOLOGI & ONKOLOGI
  // ==========================================================================
  {
    id: "anc-neutrophil",
    title: "Absolute Neutrophil Count (ANC)",
    englishTitle: "Absolute Neutrophil Count (ANC) Calculator",
    specialty: "hematology",
    shortDesc: "Menghitung jumlah neutrofil absolut dan mengklasifikasikan derajat neutropenia pada kemoterapi/infeksi.",
    keywords: ["anc", "neutrofil", "neutropenia", "kemoterapi", "leukosit", "hematologi", "onkologi"],
    fields: [
      { key: "wbc", label: "Total Leukosit (WBC)", type: "number", unit: "×10³/µL (ribu/µL)", min: 0.1, max: 100, step: 0.1, defaultValue: 2.8 },
      { key: "segs", label: "Neutrofil Segmen (%)", type: "number", unit: "%", min: 0, max: 100, step: 1, defaultValue: 38 },
      { key: "bands", label: "Neutrofil Batang / Bands (%)", type: "number", unit: "%", min: 0, max: 100, step: 1, defaultValue: 4 },
    ],
    compute: (v) => {
      const wbc = num(v, "wbc", 2.8);
      const segs = num(v, "segs", 38);
      const bands = num(v, "bands", 4);
      const anc = wbc * 1000 * ((segs + bands) / 100);
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Normal (ANC ≥ 1.500 sel/µL)";
      let interpretation = "Jumlah neutrofil berada dalam batas normal.";
      if (anc < 500) {
        severity = "critical";
        categoryLabel = "Neutropenia Berat (< 500 sel/µL)";
        interpretation = "Risiko infeksi berat sangat tinggi! Bila disertai demam (≥ 38,3°C atau ≥ 38°C selama 1 jam), tangani segera sebagai Febrile Neutropenia dengan antibiotik empiris spektrum luas.";
      } else if (anc < 1000) {
        severity = "high";
        categoryLabel = "Neutropenia Sedang (500–999 sel/µL)";
        interpretation = "Risiko infeksi meningkat. Evaluasi penundaan siklus kemoterapi dan pertimbangkan profilaksis/G-CSF sesuai protokol onkologi.";
      } else if (anc < 1500) {
        severity = "moderate";
        categoryLabel = "Neutropenia Ringan (1.000–1.499 sel/µL)";
        interpretation = "Risiko infeksi minimal; lanjutkan pemantauan darah tepi berkala.";
      }
      return {
        primaryValue: `${Math.round(anc).toLocaleString("id-ID")}`,
        primaryUnit: "sel/µL",
        severity,
        categoryLabel,
        interpretation,
        secondaryMetrics: [
          { label: "Total Persentase Neutrofil", value: `${segs + bands}%` },
          { label: "ANC dalam ×10⁹/L", value: `${f(anc / 1000, 2)} ×10⁹/L` },
        ],
        formulaDisplay: `ANC = ${f(wbc, 1)} × 1.000 × ((${segs}% + ${bands}%) / 100) = ${Math.round(anc).toLocaleString("id-ID")} sel/µL`,
        reference: "Adaptasi Medscape Medical Calculators · IDSA Neutropenia Guidelines",
      };
    },
  },
  {
    id: "reticulocyte-rpi",
    title: "Indeks Retikulosit Terkoreksi & RPI",
    englishTitle: "Corrected Reticulocyte Count & Reticulocyte Production Index (RPI)",
    specialty: "hematology",
    shortDesc: "Menilai apakah respons sumsum tulang adekuat (hemolisis/perdarahan) atau hipoproliferatif pada anemia.",
    keywords: ["retikulosit", "rpi", "anemia", "sumsum tulang", "hemolisis", "hematologi"],
    fields: [
      { key: "retic", label: "Hitung Retikulosit Terukur", type: "number", unit: "%", min: 0.1, max: 40, step: 0.1, defaultValue: 3.5 },
      { key: "hct", label: "Hematokrit Pasien (Hct)", type: "number", unit: "%", min: 8, max: 60, step: 0.5, defaultValue: 25 },
      { key: "normalHct", label: "Hematokrit Normal Acuan", type: "number", unit: "%", min: 35, max: 50, step: 1, defaultValue: 45 },
    ],
    compute: (v) => {
      const retic = num(v, "retic", 3.5);
      const hct = num(v, "hct", 25);
      const normHct = Math.max(1, num(v, "normalHct", 45));
      const corrected = retic * (hct / normHct);
      const matFactor = hct >= 36 ? 1.0 : hct >= 26 ? 1.5 : hct >= 16 ? 2.0 : 2.5;
      const rpi = corrected / matFactor;
      const adequate = rpi >= 2.0;
      return {
        primaryValue: f(rpi, 2),
        primaryUnit: "RPI",
        severity: adequate ? "low" : "moderate",
        categoryLabel: adequate ? "Respons Sumsum Tulang Adekuat (RPI ≥ 2,0)" : "Anemia Hipoproliferatif (RPI < 2,0)",
        interpretation: adequate
          ? "Produksi eritrosit meningkat secara adekuat — mengarah pada anemia hemolitik atau kehilangan darah akut."
          : "Respons sumsum tulang tidak adekuat — evaluasi defisiensi besi, B12, folat, anemia penyakit kronis, atau kelainan sumsum tulang.",
        secondaryMetrics: [
          { label: "Retikulosit Terkoreksi", value: `${f(corrected, 2)}%` },
          { label: "Faktor Maturasi (sesuai Hct)", value: `${f(matFactor, 1)} hari` },
        ],
        formulaDisplay: `Terkoreksi = ${f(retic, 1)} × (${hct}/${normHct}) = ${f(corrected, 2)}% | RPI = ${f(corrected, 2)} / ${f(matFactor, 1)} = ${f(rpi, 2)}`,
        reference: "Adaptasi Medscape Medical Calculators · Hillman RS (Hematology)",
      };
    },
  },
  {
    id: "4ts-hit",
    title: "Skor 4Ts (Probabilitas HIT / Trombositopenia Akibat Heparin)",
    englishTitle: "4Ts Score for Heparin-Induced Thrombocytopenia (HIT)",
    specialty: "hematology",
    shortDesc: "Menilai probabilitas pre-tes Heparin-Induced Thrombocytopenia sebelum pemeriksaan antibodi PF4.",
    keywords: ["4ts", "hit", "heparin", "trombositopenia", "hematologi", "trombosis"],
    fields: [
      {
        key: "t1",
        label: "Thrombocytopenia (Penurunan Trombosit)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "Penurunan < 30% atau nadir < 10.000 (0 poin)", value: 0 },
          { label: "Penurunan 30–50% atau nadir 10–19 ribu (+1 poin)", value: 1 },
          { label: "Penurunan > 50% & nadir ≥ 20.000 (+2 poin)", value: 2 },
        ],
      },
      {
        key: "t2",
        label: "Timing (Waktu Penurunan Trombosit)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "≤ 4 hari tanpa riwayat heparin 100 hari terakhir (0 poin)", value: 0 },
          { label: "> 10 hari atau ≤ 1 hari (paparan 30–100 hari lalu) (+1 poin)", value: 1 },
          { label: "Hari ke 5–10 atau ≤ 1 hari (paparan ≤ 30 hari lalu) (+2 poin)", value: 2 },
        ],
      },
      {
        key: "t3",
        label: "Thrombosis / Sekuele Lain",
        type: "select",
        defaultValue: 0,
        options: [
          { label: "Tidak ada (0 poin)", value: 0 },
          { label: "Trombosis progresif/rekuren atau lesi kulit eritema (+1 poin)", value: 1 },
          { label: "Trombosis baru terkonfirmasi atau nekrosis kulit (+2 poin)", value: 2 },
        ],
      },
      {
        key: "t4",
        label: "oTher Causes (Penyebab Lain Trombositopenia)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Ada penyebab lain yang jelas (0 poin)", value: 0 },
          { label: "Mungkin ada penyebab lain (+1 poin)", value: 1 },
          { label: "Tidak ada penyebab lain yang jelas (+2 poin)", value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = num(v, "t1") + num(v, "t2") + num(v, "t3") + num(v, "t4");
      const severity: CalcComputeResult["severity"] = score >= 6 ? "critical" : score >= 4 ? "high" : "low";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–8)",
        severity,
        categoryLabel: score >= 6 ? "Probabilitas Tinggi HIT (6–8)" : score >= 4 ? "Probabilitas Sedang HIT (4–5)" : "Probabilitas Rendah HIT (0–3)",
        interpretation:
          score >= 4
            ? "Hentikan segera seluruh paparan heparin (termasuk flush kateter), mulai antikoagulan non-heparin alternatif (mis. fondaparinux/argatroban), dan periksa tes antibodi anti-PF4."
            : "Nilai prediktif negatif sangat tinggi (> 99%). HIT sangat tidak mungkin; evaluasi penyebab lain trombositopenia.",
        formulaDisplay: `Skor 4Ts = ${num(v, "t1")} + ${num(v, "t2")} + ${num(v, "t3")} + ${num(v, "t4")} = ${score} poin`,
        reference: "Adaptasi Medscape Medical Calculators · Lo GK et al. (J Thromb Haemost 2006) & ASH Guidelines",
      };
    },
  },

  // ==========================================================================
  // 8. ENDOKRINOLOGI & METABOLISME
  // ==========================================================================
  {
    id: "hba1c-eag",
    title: "Konversi HbA1c ↔ eAG (Estimasi Glukosa Rata-Rata)",
    englishTitle: "HbA1c to Estimated Average Glucose (eAG)",
    specialty: "endocrinology",
    shortDesc: "Mengonversi nilai HbA1c (%) ke estimasi kadar glukosa darah rata-rata harian dalam mg/dL dan mmol/L.",
    keywords: ["hba1c", "eag", "diabetes", "glukosa", "gula darah", "endokrinologi"],
    fields: [
      { key: "a1c", label: "Kadar HbA1c", type: "number", unit: "%", min: 4.0, max: 18.0, step: 0.1, defaultValue: 7.2 },
    ],
    compute: (v) => {
      const a1c = num(v, "a1c", 7.2);
      const eagMg = 28.7 * a1c - 46.7;
      const eagMmol = eagMg / 18.01559;
      const ifcc = (a1c - 2.152) / 0.09148;
      let severity: CalcComputeResult["severity"] = "normal";
      let categoryLabel = "Normal (< 5,7%)";
      if (a1c >= 9.0) { severity = "critical"; categoryLabel = "Diabetes Tidak Terkontrol Berat (≥ 9,0%)"; }
      else if (a1c >= 6.5) { severity = "high"; categoryLabel = "Rentang Diabetes (≥ 6,5%)"; }
      else if (a1c >= 5.7) { severity = "moderate"; categoryLabel = "Prediabetes (5,7–6,4%)"; }
      return {
        primaryValue: `${Math.round(eagMg)}`,
        primaryUnit: "mg/dL (eAG)",
        severity,
        categoryLabel,
        interpretation:
          "Target HbA1c umum bagi sebagian besar pasien dewasa dengan diabetes (PERKENI/ADA) adalah < 7,0% (eAG < 154 mg/dL), disesuaikan secara individual menurut usia dan risiko hipoglikemia.",
        secondaryMetrics: [
          { label: "eAG (Satuan SI)", value: `${f(eagMmol, 1)} mmol/L` },
          { label: "HbA1c IFCC", value: `${Math.round(ifcc)} mmol/mol` },
        ],
        formulaDisplay: `eAG (mg/dL) = (28,7 × ${f(a1c, 1)}) − 46,7 = ${Math.round(eagMg)} mg/dL`,
        reference: "Adaptasi Medscape Medical Calculators · Nathan DM et al. (ADAG Study · Diabetes Care 2008)",
      };
    },
  },
  {
    id: "homa-ir",
    title: "Indeks HOMA-IR (Resistensi Insulin)",
    englishTitle: "HOMA-IR (Homeostatic Model Assessment for Insulin Resistance)",
    specialty: "endocrinology",
    shortDesc: "Mengukur derajat resistensi insulin berdasarkan kadar glukosa puasa dan insulin puasa.",
    keywords: ["homa-ir", "insulin", "resistensi", "diabetes", "pcos", "metabolik", "endokrinologi"],
    fields: [
      { key: "glu", label: "Glukosa Darah Puasa", type: "number", unit: "mg/dL", min: 40, max: 400, step: 1, defaultValue: 102 },
      { key: "ins", label: "Insulin Puasa", type: "number", unit: "µU/mL", min: 0.5, max: 200, step: 0.5, defaultValue: 12.5 },
    ],
    compute: (v) => {
      const glu = num(v, "glu", 102);
      const ins = num(v, "ins", 12.5);
      const homa = (glu * ins) / 405;
      const severity: CalcComputeResult["severity"] = homa >= 2.9 ? "high" : homa >= 2.0 ? "moderate" : "normal";
      return {
        primaryValue: f(homa, 2),
        primaryUnit: "HOMA-IR",
        severity,
        categoryLabel:
          homa >= 2.9 ? "Resistensi Insulin Bermakna (≥ 2,9)" : homa >= 2.0 ? "Resistensi Insulin Dini (2,0–2,8)" : "Sensitivitas Insulin Optimal (< 2,0)",
        interpretation:
          homa >= 2.0
            ? "Menunjukkan penurunan sensitivitas insulin. Fokus pada modifikasi gaya hidup, penurunan berat badan 5–10%, aktivitas fisik aerobik/resistensi, dan evaluasi sindrom metabolik."
            : "Sensitivitas insulin berada dalam rentang normal/optimal.",
        formulaDisplay: `HOMA-IR = (${glu} × ${f(ins, 1)}) / 405 = ${f(homa, 2)}`,
        reference: "Adaptasi Medscape Medical Calculators · Matthews DR et al. (Diabetologia 1985)",
      };
    },
  },
  {
    id: "ldl-friedewald",
    title: "Kalkulator Kolesterol LDL (Friedewald & Sampson-NIH)",
    englishTitle: "LDL Cholesterol Calculator (Friedewald & Sampson)",
    specialty: "endocrinology",
    shortDesc: "Menghitung kadar kolesterol LDL, Non-HDL, dan rasio lipid dari profil kolesterol total, HDL, dan trigliserida.",
    keywords: ["ldl", "kolesterol", "lipid", "friedewald", "sampson", "trigliserida", "endokrinologi"],
    fields: [
      { key: "tc", label: "Kolesterol Total", type: "number", unit: "mg/dL", min: 50, max: 600, step: 1, defaultValue: 220 },
      { key: "hdl", label: "Kolesterol HDL", type: "number", unit: "mg/dL", min: 10, max: 150, step: 1, defaultValue: 48 },
      { key: "tg", label: "Trigliserida (TG)", type: "number", unit: "mg/dL", min: 20, max: 1200, step: 1, defaultValue: 165 },
    ],
    compute: (v) => {
      const tc = num(v, "tc", 220);
      const hdl = num(v, "hdl", 48);
      const tg = num(v, "tg", 165);
      const nonHdl = tc - hdl;
      const friedewald = tg < 400 ? tc - hdl - tg / 5 : null;
      // Sampson-NIH Equation (2020) accurate up to TG 800 mg/dL
      const sampson = tc / 0.948 - hdl / 0.971 - (tg / 8.56 + (tg * nonHdl) / 2140 - (tg * tg) / 16100) - 9.44;
      const refLdl = friedewald ?? sampson;
      const severity: CalcComputeResult["severity"] = refLdl >= 190 ? "critical" : refLdl >= 160 ? "high" : refLdl >= 130 ? "moderate" : "normal";
      return {
        primaryValue: `${Math.round(refLdl)}`,
        primaryUnit: friedewald !== null ? "mg/dL (Friedewald)" : "mg/dL (Sampson-NIH)",
        severity,
        categoryLabel:
          refLdl >= 190 ? "LDL Sangat Tinggi (≥ 190)" : refLdl >= 160 ? "LDL Tinggi (160–189)" : refLdl >= 130 ? "LDL Batas Tinggi (130–159)" : refLdl >= 100 ? "Mendekati Optimal (100–129)" : "Optimal (< 100 mg/dL)",
        interpretation:
          tg >= 400
            ? "Trigliserida ≥ 400 mg/dL membuat rumus Friedewald tidak akurat; hasil menampilkan persamaan Sampson-NIH (2020) atau disarankan pemeriksaan LDL direk."
            : "Gunakan bersama skor risiko kardiovaskular (ASCVD/PREVENT) untuk menentukan target penurunan LDL dan intensitas terapi statin.",
        secondaryMetrics: [
          { label: "LDL Sampson-NIH (2020)", value: `${Math.round(sampson)} mg/dL` },
          { label: "Non-HDL Cholesterol", value: `${Math.round(nonHdl)} mg/dL` },
          { label: "Rasio TC / HDL", value: f(tc / Math.max(1, hdl), 2) },
        ],
        formulaDisplay: friedewald !== null ? `LDL Friedewald = ${tc} − ${hdl} − (${tg} / 5) = ${Math.round(friedewald)} mg/dL` : `LDL Sampson-NIH = ${Math.round(sampson)} mg/dL`,
        reference: "Adaptasi Medscape Medical Calculators · Friedewald (1972) & Sampson-NIH (JAMA Cardiol 2020)",
      };
    },
  },

  // ==========================================================================
  // 9. OBSTETRI & GINEKOLOGI
  // ==========================================================================
  {
    id: "bishop-score",
    title: "Skor Bishop (Kesiapan Serviks Induksi Persalinan)",
    englishTitle: "Bishop Score for Vaginal Delivery & Induction of Labor",
    specialty: "obgyn",
    shortDesc: "Menilai kematangan serviks sebelum induksi persalinan untuk memprediksi keberhasilan persalinan pervaginam.",
    keywords: ["bishop", "serviks", "induksi", "persalinan", "obstetri", "obgyn", "kebidanan"],
    fields: [
      {
        key: "dil",
        label: "Pembukaan Serviks (Dilatasi)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Tertutup (0 poin)", value: 0 },
          { label: "1–2 cm (+1 poin)", value: 1 },
          { label: "3–4 cm (+2 poin)", value: 2 },
          { label: "≥ 5 cm (+3 poin)", value: 3 },
        ],
      },
      {
        key: "eff",
        label: "Pendataran Serviks (Effacement)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "0–30% (0 poin)", value: 0 },
          { label: "40–50% (+1 poin)", value: 1 },
          { label: "60–70% (+2 poin)", value: 2 },
          { label: "≥ 80% (+3 poin)", value: 3 },
        ],
      },
      {
        key: "sta",
        label: "Penurunan Kepala (Station)",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "−3 (0 poin)", value: 0 },
          { label: "−2 (+1 poin)", value: 1 },
          { label: "−1 atau 0 (+2 poin)", value: 2 },
          { label: "+1 atau +2 (+3 poin)", value: 3 },
        ],
      },
      {
        key: "cons",
        label: "Konsistensi Serviks",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Kaku / Keras (0 poin)", value: 0 },
          { label: "Sedang (+1 poin)", value: 1 },
          { label: "Lunak (+2 poin)", value: 2 },
        ],
      },
      {
        key: "pos",
        label: "Posisi Serviks",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Posterior (0 poin)", value: 0 },
          { label: "Tengah / Mid (+1 poin)", value: 1 },
          { label: "Anterior (+2 poin)", value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = num(v, "dil") + num(v, "eff") + num(v, "sta") + num(v, "cons") + num(v, "pos");
      const severity: CalcComputeResult["severity"] = score >= 8 ? "low" : score >= 6 ? "moderate" : "high";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–13)",
        severity,
        categoryLabel:
          score >= 8 ? "Serviks Matang / Sangat Mendukung Induksi (≥ 8)" : score >= 6 ? "Serviks Cukup Matang (6–7)" : "Serviks Belum Matang (< 6)",
        interpretation:
          score >= 8
            ? "Probabilitas keberhasilan induksi persalinan pervaginam tinggi (setara persalinan spontan). Dapat langsung diberikan oksitosin / amniotomi sesuai indikasi."
            : score < 6
            ? "Serviks belum matang; disarankan pematangan serviks (cervical ripening) terlebih dahulu menggunakan prostaglandin (misoprostol/dinoproston) atau kateter balon Foley."
            : "Pertimbangkan kondisi klinis ibu-janin antara pematangan serviks singkat atau induksi langsung.",
        formulaDisplay: `Skor Bishop = Dilatasi(${num(v, "dil")}) + Effacement(${num(v, "eff")}) + Station(${num(v, "sta")}) + Konsistensi(${num(v, "cons")}) + Posisi(${num(v, "pos")}) = ${score}`,
        reference: "Adaptasi Medscape Medical Calculators · Bishop EH (Obstet Gynecol 1964) & ACOG",
      };
    },
  },
  {
    id: "apgar-score",
    title: "Skor APGAR Bayi Baru Lahir",
    englishTitle: "APGAR Score for Newborn Assessment",
    specialty: "obgyn",
    shortDesc: "Penilaian cepat status adaptasi kardiopulmoner dan neurologis neonatus pada menit ke-1 dan menit ke-5.",
    keywords: ["apgar", "bayi", "neonatus", "asfiksia", "resusitasi", "obgyn", "pediatri"],
    fields: [
      {
        key: "a",
        label: "Appearance (Warna Kulit)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "0 — Biru/pucat seluruh tubuh", value: 0 },
          { label: "1 — Tubuh merah muda, ekstremitas biru (akrosianosis)", value: 1 },
          { label: "2 — Merah muda seluruh tubuh", value: 2 },
        ],
      },
      {
        key: "p",
        label: "Pulse (Denyut Jantung)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "0 — Tidak teraba / tidak ada", value: 0 },
          { label: "1 — < 100 x/menit", value: 1 },
          { label: "2 — ≥ 100 x/menit", value: 2 },
        ],
      },
      {
        key: "g",
        label: "Grimace (Refleks / Rangsangan)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "0 — Tidak ada respons", value: 0 },
          { label: "1 — Meringis / gerakan lemah", value: 1 },
          { label: "2 — Menangis kuat / batuk / bersin", value: 2 },
        ],
      },
      {
        key: "ac",
        label: "Activity (Tonus Otot)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "0 — Lemas / flaksid", value: 0 },
          { label: "1 — Sedikit fleksi ekstremitas", value: 1 },
          { label: "2 — Gerakan aktif, fleksi baik", value: 2 },
        ],
      },
      {
        key: "r",
        label: "Respiration (Usaha Napas)",
        type: "select",
        defaultValue: 2,
        options: [
          { label: "0 — Tidak bernapas (apnea)", value: 0 },
          { label: "1 — Napas lambat, tidak teratur, tangis lemah", value: 1 },
          { label: "2 — Napas teratur, menangis kuat", value: 2 },
        ],
      },
    ],
    compute: (v) => {
      const score = num(v, "a") + num(v, "p") + num(v, "g") + num(v, "ac") + num(v, "r");
      const severity: CalcComputeResult["severity"] = score <= 3 ? "critical" : score <= 6 ? "high" : "normal";
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (0–10)",
        severity,
        categoryLabel:
          score >= 7 ? "Adaptasi Neonatal Baik (7–10)" : score >= 4 ? "Depresi Sedang / Asfiksia Sedang (4–6)" : "Depresi Berat / Asfiksia Berat (0–3)",
        interpretation:
          score >= 7
            ? "Bayi bugar. Lakukan perawatan neonatal esensial rutin (hangatkan, IMD, profilaksis vitamin K & salep mata)."
            : score >= 4
            ? "Lakukan langkah awal resusitasi neonatus (hangatkan, posisikan, bersihkan jalan napas, stimulasi, ventilasi tekanan positif bila perlu) dan nilai ulang menit ke-5."
            : "Resusitasi neonatus aktif segera (VTP, evaluasi kompresi dada & epinefrin sesuai algoritma NRP/IDAI) serta pemantauan NICU.",
        formulaDisplay: `APGAR = A(${num(v, "a")}) + P(${num(v, "p")}) + G(${num(v, "g")}) + A(${num(v, "ac")}) + R(${num(v, "r")}) = ${score}`,
        reference: "Adaptasi Medscape Medical Calculators · Apgar V (Anesth Analg 1953) & AAP/IDAI",
      };
    },
  },

  // ==========================================================================
  // 10. PEDIATRI
  // ==========================================================================
  {
    id: "holliday-segar",
    title: "Cairan Rumatan Anak (Holliday-Segar / Aturan 4-2-1)",
    englishTitle: "Pediatric Maintenance Fluid Calculator (Holliday-Segar)",
    specialty: "pediatrics",
    shortDesc: "Menghitung kebutuhan cairan infus rumatan harian (mL/24 jam) dan laju per jam (mL/jam) pada anak.",
    keywords: ["holliday", "segar", "4-2-1", "cairan anak", "infus", "pediatri", "rumatan"],
    fields: [
      { key: "wt", label: "Berat Badan Anak", type: "number", unit: "kg", min: 1, max: 120, step: 0.5, defaultValue: 18 },
    ],
    compute: (v) => {
      const wt = Math.max(0.5, num(v, "wt", 18));
      let daily = 0;
      let hourly = 0;
      if (wt <= 10) {
        daily = wt * 100;
        hourly = wt * 4;
      } else if (wt <= 20) {
        daily = 1000 + (wt - 10) * 50;
        hourly = 40 + (wt - 10) * 2;
      } else {
        daily = 1500 + (wt - 20) * 20;
        hourly = 60 + (wt - 20) * 1;
      }
      const macroGtt = (hourly * 20) / 60;
      const microGtt = hourly;
      return {
        primaryValue: `${Math.round(daily).toLocaleString("id-ID")}`,
        primaryUnit: "mL / 24 jam",
        severity: "normal",
        categoryLabel: `Laju Infus Rumatan: ${f(hourly, 1)} mL/jam`,
        interpretation:
          "Pedoman AAP merekomendasikan cairan isotonik dengan dekstrosa & kalium sesuai indikasi klinis (mis. D5 0,9% NaCl) untuk mencegah hiponatremia iatrogenik pada anak rawat inap.",
        secondaryMetrics: [
          { label: "Laju Per Jam (Aturan 4-2-1)", value: `${f(hourly, 1)} mL/jam` },
          { label: "Tetesan Makro (20 tts/mL)", value: `${Math.round(macroGtt)} tetes/menit` },
          { label: "Tetesan Mikro (60 tts/mL)", value: `${Math.round(microGtt)} tetes/menit` },
        ],
        formulaDisplay:
          wt <= 10
            ? `100 mL × ${wt} kg = ${Math.round(daily)} mL/hari (4 mL/kg/jam)`
            : wt <= 20
            ? `1.000 + 50 × (${wt} − 10) = ${Math.round(daily)} mL/hari`
            : `1.500 + 20 × (${wt} − 20) = ${Math.round(daily)} mL/hari`,
        reference: "Adaptasi Medscape Medical Calculators · Holliday MA & Segar WE (Pediatrics 1957)",
      };
    },
  },
  {
    id: "centor-mcisaac",
    title: "Skor Centor / McIsaac (Faringitis Streptokokus)",
    englishTitle: "Modified Centor (McIsaac) Score for Strep Pharyngitis",
    specialty: "pediatrics",
    shortDesc: "Menilai probabilitas faringitis bakteri Group A Streptococcus (GAS) untuk memandu penggunaan antibiotik rasional.",
    keywords: ["centor", "mcisaac", "faringitis", "strep", "radang tenggorokan", "antibiotik", "pediatri"],
    fields: [
      {
        key: "age",
        label: "Kelompok Usia",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "3–14 tahun (+1 poin)", value: 1 },
          { label: "15–44 tahun (0 poin)", value: 0 },
          { label: "≥ 45 tahun (−1 poin)", value: -1 },
        ],
      },
      { key: "exudate", label: "Eksudat atau pembengkakan tonsil", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "nodes", label: "Limfadenopati servikal anterior nyeri tekan", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "fever", label: "Riwayat demam > 38,0°C", type: "checkbox", defaultValue: true, badgeText: "+1" },
      { key: "noCough", label: "TIDAK ada batuk", type: "checkbox", defaultValue: false, badgeText: "+1" },
    ],
    compute: (v) => {
      const score =
        num(v, "age", 1) +
        (bool(v, "exudate") ? 1 : 0) +
        (bool(v, "nodes") ? 1 : 0) +
        (bool(v, "fever") ? 1 : 0) +
        (bool(v, "noCough") ? 1 : 0);
      let prob = "1–2,5%";
      let severity: CalcComputeResult["severity"] = "low";
      let rec = "Tidak diperlukan antibiotik maupun tes swab cepat; sebagian besar penyebabnya virus.";
      if (score >= 4) {
        prob = "51–53%";
        severity = "high";
        rec = "Pertimbangkan tes RADT/kultur tenggorok atau terapi antibiotik empiris (Amoksisilin / Penisilin V) sesuai kondisi klinis.";
      } else if (score >= 2) {
        prob = score === 3 ? "28–35%" : "11–17%";
        severity = "moderate";
        rec = "Disarankan uji diagnostik cepat (RADT) atau kultur; berikan antibiotik hanya bila hasil positif.";
      }
      return {
        primaryValue: `${score}`,
        primaryUnit: "poin (−1 s.d. 5)",
        severity,
        categoryLabel: `Probabilitas Faringitis GAS: ${prob}`,
        interpretation: rec,
        formulaDisplay: `Skor McIsaac = Usia(${num(v, "age")}) + Kriteria Klinis = ${score} poin`,
        reference: "Adaptasi Medscape Medical Calculators · McIsaac WJ et al. (CMAJ 1998) & IDSA",
      };
    },
  },
  {
    id: "apls-pediatric-weight",
    title: "Estimasi Berat Badan Anak Gawat Darurat (Rumus APLS)",
    englishTitle: "Pediatric Emergency Weight Estimation (APLS / Luscombe)",
    specialty: "pediatrics",
    shortDesc: "Estimasi cepat berat badan anak usia 1–12 tahun saat tidak memungkinkan menimbang dalam situasi gawat darurat.",
    keywords: ["berat badan anak", "apls", "luscombe", "resusitasi anak", "pediatri", "igd"],
    fields: [
      { key: "ageY", label: "Usia Anak (Tahun)", type: "number", unit: "tahun", min: 1, max: 12, step: 0.5, defaultValue: 5 },
    ],
    compute: (v) => {
      const age = Math.min(12, Math.max(1, num(v, "ageY", 5)));
      const apls = age <= 5 ? 2 * age + 8 : 3 * age + 7;
      const luscombe = 3 * age + 7;
      const ettUncuffed = age / 4 + 4;
      const ettCuffed = age / 4 + 3.5;
      return {
        primaryValue: f(apls, 1),
        primaryUnit: "kg (APLS Revisi)",
        severity: "normal",
        categoryLabel: `Estimasi BB Anak Usia ${f(age, 1)} Tahun`,
        interpretation:
          "Gunakan hanya sebagai estimasi darurat bila timbangan/pita Broselow tidak tersedia. Konfirmasi berat badan aktual segera setelah pasien stabil.",
        secondaryMetrics: [
          { label: "Rumus Luscombe (3×Usia + 7)", value: `${f(luscombe, 1)} kg` },
          { label: "Ukuran ETT Cuffed (ID)", value: `${f(ettCuffed, 1)} mm` },
          { label: "Ukuran ETT Uncuffed (ID)", value: `${f(ettUncuffed, 1)} mm` },
        ],
        formulaDisplay: age <= 5 ? `APLS (1–5 thn) = (2 × ${f(age, 1)}) + 8 = ${f(apls, 1)} kg` : `APLS (6–12 thn) = (3 × ${f(age, 1)}) + 7 = ${f(apls, 1)} kg`,
        reference: "Adaptasi Medscape Medical Calculators · Advanced Paediatric Life Support (APLS)",
      };
    },
  },

  // ==========================================================================
  // 11. FARMAKOLOGI KLINIS & KONVERSI LAB
  // ==========================================================================
  {
    id: "steroid-conversion",
    title: "Konversi Dosis Ekuivalen Kortikosteroid",
    englishTitle: "Corticosteroid Dose Equivalency Converter",
    specialty: "pharmacology",
    shortDesc: "Mengonversi dosis antiinflamasi antar kortikosteroid sistemik (Prednison, Metilprednisolon, Deksametason, Hidrokortison, Betametason).",
    keywords: ["steroid", "kortikosteroid", "prednison", "metilprednisolon", "deksametason", "hidrokortison", "farmakologi"],
    fields: [
      {
        key: "fromDrug",
        label: "Kortikosteroid Asal",
        type: "select",
        defaultValue: 4,
        options: [
          { label: "Metilprednisolon (ekuivalen 4 mg)", value: 4 },
          { label: "Prednison / Prednisolon (ekuivalen 5 mg)", value: 5 },
          { label: "Deksametason (ekuivalen 0,75 mg)", value: 0.75 },
          { label: "Hidrokortison (ekuivalen 20 mg)", value: 20 },
          { label: "Betametason (ekuivalen 0,6 mg)", value: 0.6 },
          { label: "Triamsinolon (ekuivalen 4.01 mg)", value: 4.01 },
        ],
      },
      { key: "dose", label: "Dosis Obat Asal", type: "number", unit: "mg", min: 0.1, max: 2000, step: 0.5, defaultValue: 16 },
    ],
    compute: (v) => {
      const fromEq = num(v, "fromDrug", 4);
      const eqClean = fromEq === 4.01 ? 4 : fromEq;
      const dose = num(v, "dose", 16);
      const predEq = (dose / eqClean) * 5;
      const methyl = (predEq / 5) * 4;
      const dexa = (predEq / 5) * 0.75;
      const hydro = (predEq / 5) * 20;
      const beta = (predEq / 5) * 0.6;
      return {
        primaryValue: f(predEq, 1),
        primaryUnit: "mg Prednison / Prednisolon",
        severity: predEq >= 40 ? "high" : predEq >= 20 ? "moderate" : "normal",
        categoryLabel: "Kesetaraan Potensi Antiinflamasi Glukokortikoid",
        interpretation:
          "Konversi ini didasarkan pada potensi antiinflamasi glukokortikoid dan TIDAK memperhitungkan perbedaan aktivitas mineralokortikoid (retensi Na⁺/air tinggi pada Hidrokortison, minimal pada Deksametason) maupun waktu paruh biologis.",
        secondaryMetrics: [
          { label: "Metilprednisolon / Triamsinolon", value: `${f(methyl, 1)} mg`, note: "Kerja sedang (12–36 jam)" },
          { label: "Deksametason", value: `${f(dexa, 2)} mg`, note: "Kerja panjang (36–72 jam)" },
          { label: "Hidrokortison", value: `${f(hydro, 1)} mg`, note: "Kerja pendek (8–12 jam)" },
          { label: "Betametason", value: `${f(beta, 2)} mg`, note: "Kerja panjang (36–72 jam)" },
        ],
        formulaDisplay: `Dosis Prednison = (${f(dose, 1)} / ${f(eqClean, 2)}) × 5 mg = ${f(predEq, 1)} mg`,
        reference: "Adaptasi Medscape Medical Calculators · Goodman & Gilman's / Lexicomp Steroid Equivalency",
      };
    },
  },
  {
    id: "lab-unit-converter",
    title: "Konverter Satuan Laboratorium (Konvensional ↔ SI)",
    englishTitle: "Medical Laboratory Unit Converter (Conventional to SI)",
    specialty: "pharmacology",
    shortDesc: "Konversi cepat satuan laboratorium klinik umum: Glukosa, Kreatinin, Kolesterol, Trigliserida, Bilirubin, Kalsium, dan Suhu.",
    keywords: ["konversi", "satuan", "si", "mmol", "mg/dl", "suhu", "celsius", "fahrenheit", "lab"],
    fields: [
      {
        key: "analyte",
        label: "Parameter Laboratorium",
        type: "select",
        defaultValue: 1,
        options: [
          { label: "Glukosa (mg/dL → mmol/L)", value: 1 },
          { label: "Kreatinin (mg/dL → µmol/L)", value: 2 },
          { label: "Kolesterol Total / LDL / HDL (mg/dL → mmol/L)", value: 3 },
          { label: "Trigliserida (mg/dL → mmol/L)", value: 4 },
          { label: "Bilirubin Total (mg/dL → µmol/L)", value: 5 },
          { label: "Kalsium (mg/dL → mmol/L)", value: 6 },
          { label: "Suhu Tubuh (°C → °F)", value: 7 },
        ],
      },
      { key: "val", label: "Nilai Input", type: "number", unit: "", min: -50, max: 5000, step: 0.1, defaultValue: 126 },
    ],
    compute: (v) => {
      const analyte = num(v, "analyte", 1);
      const val = num(v, "val", 126);
      let out = 0;
      let unitIn = "mg/dL";
      let unitOut = "mmol/L";
      let factorText = "";
      switch (analyte) {
        case 1:
          out = val * 0.0555;
          unitOut = "mmol/L";
          factorText = "× 0,0555 (÷ 18,016)";
          break;
        case 2:
          out = val * 88.4;
          unitOut = "µmol/L";
          factorText = "× 88,4";
          break;
        case 3:
          out = val * 0.02586;
          unitOut = "mmol/L";
          factorText = "× 0,02586";
          break;
        case 4:
          out = val * 0.01129;
          unitOut = "mmol/L";
          factorText = "× 0,01129";
          break;
        case 5:
          out = val * 17.1;
          unitOut = "µmol/L";
          factorText = "× 17,1";
          break;
        case 6:
          out = val * 0.25;
          unitOut = "mmol/L";
          factorText = "× 0,25";
          break;
        case 7:
          out = val * (9 / 5) + 32;
          unitIn = "°C";
          unitOut = "°F";
          factorText = "(°C × 9/5) + 32";
          break;
      }
      return {
        primaryValue: f(out, 2),
        primaryUnit: unitOut,
        severity: "normal",
        categoryLabel: `Konversi ${unitIn} → ${unitOut}`,
        interpretation: "Hasil konversi otomatis mengikuti faktor konversi standar internasional (SI / AMA Manual of Style).",
        formulaDisplay: `${f(val, 2)} ${unitIn} (${factorText}) = ${f(out, 2)} ${unitOut}`,
        reference: "Adaptasi Medscape Medical Calculators · AMA Manual of Style SI Conversion Table",
      };
    },
  },
];
