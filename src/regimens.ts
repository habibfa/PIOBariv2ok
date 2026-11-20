import {
  CHEMO_REGIMENS_DATA,
  type ChemoRegimen,
  type ChemoDrugComponent,
  type ChemoCancerCategory,
} from "./data/chemoRegimensData";
import { CHEMO_CATEGORY_LABELS } from "./data/chemoDrugLibrary";

export type RegimenDoseUnit = ChemoDrugComponent["doseUnit"];
export type RegimenCancerCategory = ChemoCancerCategory;
export type BsaFormulaType = "mosteller" | "dubois";

export interface RegimenDrugItem {
  drugId: string;
  drugName: string;
  genericAlias?: string;
  role: string;
  dosageFormula: string;
  doseValue: number;
  doseUnit: RegimenDoseUnit;
  adminRoute: string;
  diluentStandard: string;
  diluentForbidden?: string;
  sequenceOrder: number;
  sequenceNote: string;
  vesicantStatus: ChemoDrugComponent["vesicantStatus"];
  specialPrecautions: string;
  maxSingleDoseCapMg?: number;
  maxCapNote?: string;
}

export interface ChemotherapyRegimen {
  id: string;
  name: string;
  fullName: string;
  category: RegimenCancerCategory;
  categoryLabel: string;
  indication: string;
  primaryGoal: string;
  overview: string;
  cycleProtocol: string;
  cycleLengthDays: number;
  totalRecommendedCycles: string;
  drugs: RegimenDrugItem[];
  premedicationProtocol: string[];
  hydrationAndProtection: string[];
  vitalMonitoring: string[];
  clinicalPearls: string[];
  references: string;
  hasCarboplatin: boolean;
  hasVincristine: boolean;
}

export interface RegimenPatientInput {
  gender: "male" | "female";
  ageYears: number;
  weightKg: number;
  heightCm: number;
  serumCreatinineMgDl: number;
  targetAUC: number;
  bsaFormula: BsaFormulaType;
  bsaInputMode?: "auto" | "manual";
  manualBsaM2?: number;
  doseReductionPercent: number; // 50 - 100
  capGfrAt125: boolean; // FDA / GOG Calvert GFR cap at 125 mL/min
  capVincristineAt2mg: boolean; // NCCN / ASCO standard Vincristine 2 mg single-dose cap
  customComponentDoses?: Record<string, number>;
}

export interface CalculatedRegimenDrug {
  drug: RegimenDrugItem;
  appliedDoseValue: number;
  standardDose: number;
  cappedStandardDose: number;
  finalDose: number;
  displayUnit: "mg" | "mcg" | "unit";
  formulaBreakdown: string;
  wasCapped: boolean;
  capReason?: string;
}

export interface RegimenCalculationResult {
  regimen: ChemotherapyRegimen;
  bsaMosteller: number;
  bsaDuBois: number;
  activeBsa: number;
  bmi: number;
  ibwKg: number;
  crClRaw: number;
  crClForCalvert: number;
  gfrWasCapped: boolean;
  drugs: CalculatedRegimenDrug[];
}

export interface RegimenCategoryOption {
  id: "all" | RegimenCancerCategory;
  label: string;
  count: number;
}

function detectSingleDoseCap(comp: ChemoDrugComponent): { cap?: number; note?: string } {
  const nameNorm = `${comp.drugId} ${comp.drugName} ${comp.genericAlias || ""}`.toLowerCase();
  if (nameNorm.includes("vincristin") || nameNorm.includes("vinkristin") || nameNorm.includes("oncovin")) {
    return {
      cap: 2,
      note: "Batas maksimum dosis tunggal Vinkristin 2 mg (pencegahan neurotoksisitas perifer/otonom berat sesuai NCCN/ASCO).",
    };
  }
  return {};
}

function mapToChemotherapyRegimen(r: ChemoRegimen): ChemotherapyRegimen {
  const drugs: RegimenDrugItem[] = r.components.map((c) => {
    const capInfo = detectSingleDoseCap(c);
    return {
      drugId: c.drugId,
      drugName: c.drugName,
      genericAlias: c.genericAlias,
      role: c.role,
      dosageFormula: c.dosageFormula,
      doseValue: c.defaultDoseValue,
      doseUnit: c.doseUnit,
      adminRoute: c.adminRoute,
      diluentStandard: c.diluentStandard,
      diluentForbidden: c.diluentForbidden,
      sequenceOrder: c.sequenceOrder,
      sequenceNote: c.sequenceNote,
      vesicantStatus: c.vesicantStatus,
      specialPrecautions: c.specialPrecautions,
      maxSingleDoseCapMg: capInfo.cap,
      maxCapNote: capInfo.note,
    };
  });

  const hasCarboplatin = drugs.some(
    (d) =>
      d.doseUnit === "AUC" ||
      d.drugId.toLowerCase().includes("carboplatin") ||
      d.drugName.toLowerCase().includes("carboplatin") ||
      d.drugName.toLowerCase().includes("karboplatin")
  );
  const hasVincristine = drugs.some((d) => typeof d.maxSingleDoseCapMg === "number");

  return {
    id: r.id,
    name: r.acronym,
    fullName: r.fullName,
    category: r.cancerCategory,
    categoryLabel: r.cancerCategoryLabel || CHEMO_CATEGORY_LABELS[r.cancerCategory] || r.cancerCategory,
    indication: r.cancerTypeDetail,
    primaryGoal: r.primaryGoalHighlight,
    overview: r.overview,
    cycleProtocol: r.cycleProtocol,
    cycleLengthDays: r.cycleLengthDays,
    totalRecommendedCycles: r.totalRecommendedCycles,
    drugs,
    premedicationProtocol: r.premedicationProtocol,
    hydrationAndProtection: r.hydrationAndProtection,
    vitalMonitoring: r.vitalMonitoring,
    clinicalPearls: r.clinicalPearls,
    references: r.references,
    hasCarboplatin,
    hasVincristine,
  };
}

const SUPPLEMENTAL_REGIMENS: ChemotherapyRegimen[] = [
  {
    id: "reg_r_cvp",
    name: "R-CVP / R-COP",
    fullName: "Rituximab, Cyclophosphamide, Vincristine, Prednisone",
    category: "limfoma",
    categoryLabel: "Limfoma",
    indication: "Limfoma non-Hodgkin sel B indolen (Limfoma Folikular, MZL) atau pasien dengan kontraindikasi antrasiklin",
    primaryGoal: "Kuratif / Kontrol Penyakit Jangka Panjang (Tanpa Kardiotoksisitas Antrasiklin)",
    overview: "Regimen kemoimunoterapi tanpa doksorubisin yang efektif untuk limfoma sel B indolen maupun pasien geriatri/komorbid kardiovaskular.",
    cycleProtocol: "Siklus setiap 21 hari (Rituximab, Siklofosfamid, Vinkristin Hari 1; Prednison Hari 1–5).",
    cycleLengthDays: 21,
    totalRecommendedCycles: "6 – 8 siklus",
    drugs: [
      {
        drugId: "Rituximab",
        drugName: "Rituximab",
        role: "Antibodi Monoklonal Anti-CD20",
        dosageFormula: "375 mg/m² IV Hari 1",
        doseValue: 375,
        doseUnit: "mg/m2",
        adminRoute: "IV infus bertahap (titrasi kecepatan sesuai toleransi reaksi infus)",
        diluentStandard: "NaCl 0.9% atau D5% (konsentrasi 1–4 mg/mL)",
        sequenceOrder: 1,
        sequenceNote: "Berikan pertama setelah premedikasi antihistamin & parasetamol.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Skrining HBsAg & Anti-HBc wajib sebelum siklus 1 (risiko reaktivasi Hepatitis B). Pantau reaksi infus.",
      },
      {
        drugId: "Cyclophosphamide",
        drugName: "Siklofosfamid (Cyclophosphamide)",
        role: "Agen Pengalkilasi Nitrogen Mustard",
        dosageFormula: "750 mg/m² IV Hari 1",
        doseValue: 750,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 30–60 menit",
        diluentStandard: "NaCl 0.9% 250 mL",
        sequenceOrder: 2,
        sequenceNote: "Pastikan hidrasi adekuat untuk mencegah sistitis hemoragik.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Anjurkan asupan cairan oral 2–3 L/hari dan berkemih sering selama 24 jam.",
      },
      {
        drugId: "Vincristine",
        drugName: "Vinkristin (Oncovin)",
        role: "Alkaloid Vinka (Inhibitor Mikrotubulus)",
        dosageFormula: "1.4 mg/m² IV Hari 1 (Maksimal 2 mg)",
        doseValue: 1.4,
        doseUnit: "mg/m2",
        adminRoute: "IV infus mini 5–10 menit (HANYA IV — FATAL BILA INTRATEKAL)",
        diluentStandard: "NaCl 0.9% 50 mL minibag",
        sequenceOrder: 3,
        sequenceNote: "Selalu dikemas dalam minibag 50 mL, bukan spuit.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Batas dosis tunggal maks 2 mg. Pantau neuropati perifer & konstipasi/ileus.",
        maxSingleDoseCapMg: 2,
        maxCapNote: "Batas maksimum dosis tunggal Vinkristin 2 mg (pencegahan neurotoksisitas perifer/otonom berat sesuai NCCN/ASCO).",
      },
      {
        drugId: "Prednisone",
        drugName: "Prednison",
        role: "Kortikosteroid Limfolitik",
        dosageFormula: "40 mg/m² PO Hari 1–5 (atau 100 mg flat PO)",
        doseValue: 40,
        doseUnit: "mg/m2",
        adminRoute: "Oral pagi hari setelah makan (Hari 1–5)",
        diluentStandard: "Sediaan tablet oral",
        sequenceOrder: 4,
        sequenceNote: "Konsumsi pagi hari untuk meminimalkan insomnia.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau glukosa darah dan berikan gastroprotektor (PPI/H2RA) bila berisiko ulkus.",
      },
    ],
    premedicationProtocol: [
      "Parasetamol 500–1000 mg PO + Difenhidramin 25–50 mg IV/PO 30–60 menit sebelum Rituximab",
      "Ondansetron 8 mg IV + Deksametason (atau Prednison Hari 1) sebelum Siklofosfamid",
    ],
    hydrationAndProtection: [
      "Hidrasi NaCl 0.9% 500–1000 mL pre/post Siklofosfamid + asupan minum 2–3 L/hari",
      "Profilaksis sindrom lisis tumor (Allopurinol) pada beban tumor tinggi",
    ],
    vitalMonitoring: [
      "Tanda vital tiap 15–30 menit selama infus Rituximab",
      "Darah lengkap (ANC, trombosit), fungsi hati, fungsi ginjal & status Hepatitis B sebelum siklus",
    ],
    clinicalPearls: [
      "Pilihan utama pengganti R-CHOP pada pasien limfoma dengan penurunan LVEF (<50%) atau riwayat gagal jantung.",
    ],
    references: "NCCN Guidelines: B-Cell Lymphomas (R-CVP Regimen); Marcus R, et al. Blood. 2005.",
    hasCarboplatin: false,
    hasVincristine: true,
  },
  {
    id: "reg_r_mpv",
    name: "R-MPV",
    fullName: "Rituximab, High-Dose Methotrexate, Procarbazine, Vincristine",
    category: "limfoma",
    categoryLabel: "Limfoma",
    indication: "Limfoma Sistem Saraf Pusat Primer (Primary CNS Lymphoma / PCNSL)",
    primaryGoal: "Kuratif / Induksi Remisi SSP",
    overview: "Regimen induksi standar berbasis Metotreksat dosis tinggi penembus sawar darah otak untuk Limfoma SSP Primer.",
    cycleProtocol: "Siklus setiap 14 hari (Prokarbazin hanya diberikan pada siklus ganjil Hari 1–7).",
    cycleLengthDays: 14,
    totalRecommendedCycles: "5 – 7 siklus induksi diikuti konsolidasi",
    drugs: [
      {
        drugId: "Rituximab",
        drugName: "Rituximab",
        role: "Antibodi Monoklonal Anti-CD20",
        dosageFormula: "500 mg/m² IV Hari 1",
        doseValue: 500,
        doseUnit: "mg/m2",
        adminRoute: "IV infus bertahap Hari 1",
        diluentStandard: "NaCl 0.9% (1–4 mg/mL)",
        sequenceOrder: 1,
        sequenceNote: "Diberikan sebelum Metotreksat dosis tinggi.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Skrining HBV wajib; pantau reaksi infus.",
      },
      {
        drugId: "Methotrexate",
        drugName: "Metotreksat Dosis Tinggi (HD-MTX)",
        role: "Antimetabolit Antifolates Penembus BBB",
        dosageFormula: "3500 mg/m² IV Hari 2",
        doseValue: 3500,
        doseUnit: "mg/m2",
        adminRoute: "IV infus tepat 2 jam dengan hidrasi alkalinisasi urin ketat",
        diluentStandard: "D5% atau NaCl 0.9% 500–1000 mL",
        sequenceOrder: 2,
        sequenceNote: "Wajib mulai Leucovorin rescue 24 jam pasca mulai infus MTX hingga kadar MTX < 0.05–0.1 µmol/L.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "WAJIB pH urin ≥ 7.0 (Natrium Bikarbonat), hentikan PPI/OAINS/Kotrimoksazol, pantau kadar MTX & kreatinin harian.",
      },
      {
        drugId: "Vincristine",
        drugName: "Vinkristin (Oncovin)",
        role: "Alkaloid Vinka",
        dosageFormula: "1.4 mg/m² IV Hari 2 (Maks 2 mg)",
        doseValue: 1.4,
        doseUnit: "mg/m2",
        adminRoute: "IV minibag 5–10 menit (HANYA IV)",
        diluentStandard: "NaCl 0.9% 50 mL",
        sequenceOrder: 3,
        sequenceNote: "Batas dosis tunggal maksimal 2 mg.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Pantau neuropati perifer & konstipasi.",
        maxSingleDoseCapMg: 2,
        maxCapNote: "Batas maksimum dosis tunggal Vinkristin 2 mg.",
      },
      {
        drugId: "Procarbazine",
        drugName: "Prokarbazin",
        role: "Agen Pengalkilasi Penembus BBB",
        dosageFormula: "100 mg/m²/hari PO Hari 1–7 (Siklus Ganjil)",
        doseValue: 100,
        doseUnit: "mg/m2",
        adminRoute: "Oral harian Hari 1–7 pada siklus ganjil (1, 3, 5, 7)",
        diluentStandard: "Kapsul oral",
        sequenceOrder: 4,
        sequenceNote: "Bersifat MAOI lemah — hindari makanan tinggi tiramin dan alkohol.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Hindari SSRI/simpatomimetik dan makanan fermentasi/tiramin tinggi.",
      },
    ],
    premedicationProtocol: [
      "Premedikasi Rituximab (Parasetamol + Difenhidramin)",
      "Antiemetik Ondansetron + Deksametason sebelum HD-MTX",
      "Leucovorin (Asam Folinat) 25 mg IV/PO tiap 6 jam mulai jam ke-24 pasca HD-MTX",
    ],
    hydrationAndProtection: [
      "Alkalinisasi urin dengan NaHCO3 hingga pH urin ≥ 7.0 dan output urin ≥ 100 mL/jam sebelum, selama, dan sesudah HD-MTX",
      "Dukungan G-CSF (Filgrastim) setelah siklus selesai",
    ],
    vitalMonitoring: [
      "Kadar serum Metotreksat (24, 48, 72 jam), kreatinin harian, pH urin tiap berkemih, SGOT/SGPT & CBC",
    ],
    clinicalPearls: [
      "Wajib menghentikan sementara obat PPI (Omeprazol/Lansoprazol) dan OAINS selama HD-MTX untuk mencegah retensi MTX fatal.",
    ],
    references: "NCCN CNS Cancers Guidelines (R-MPV); Shah GD, et al. J Clin Oncol. 2007.",
    hasCarboplatin: false,
    hasVincristine: true,
  },
  {
    id: "reg_tpf",
    name: "TPF / DCF",
    fullName: "Docetaxel (Taxotere), Cisplatin (Platinol), 5-Fluorouracil",
    category: "lainnya",
    categoryLabel: "Kepala-Leher & Lambung",
    indication: "Karsinoma Sel Skuamosa Kepala & Leher (SCCHN) stadium lanjut lokal (induksi) dan Kanker Lambung metastatik",
    primaryGoal: "Neoadjuvan / Induksi (Organ Preservation) & Paliatif",
    overview: "Regimen triplet poten berbasis Taksan + Platinum + Fluoropirimidin untuk induksi tumor kepala-leher lanjut lokal sebelum kemoradiasi definitif.",
    cycleProtocol: "Siklus setiap 21 hari (Dosetaksel & Sisplatin Hari 1; 5-FU infus kontinu Hari 1–4 atau 1–5).",
    cycleLengthDays: 21,
    totalRecommendedCycles: "3 siklus induksi (SCCHN) atau hingga 6 siklus",
    drugs: [
      {
        drugId: "Docetaxel",
        drugName: "Dosetaksel (Taxotere)",
        role: "Taksan (Stabilisasi Mikrotubulus)",
        dosageFormula: "75 mg/m² IV Hari 1",
        doseValue: 75,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 1 jam",
        diluentStandard: "NaCl 0.9% atau D5% 250 mL (non-PVC)",
        sequenceOrder: 1,
        sequenceNote: "Berikan sebelum Sisplatin untuk mengurangi neutropenia berat.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Wajib premedikasi Deksametason oral 3 hari dimulai 1 hari sebelum infus untuk mencegah retensi cairan & hipersensitivitas.",
      },
      {
        drugId: "Cisplatin",
        drugName: "Sisplatin (Cisplatin)",
        role: "Agen Alkilasi Berbasis Platinum",
        dosageFormula: "75 mg/m² IV Hari 1",
        doseValue: 75,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 1–2 jam disertai hidrasi agresif & suplementasi Mg/K",
        diluentStandard: "NaCl 0.9% 500 mL",
        diluentForbidden: "Jangan gunakan jarum/set infus mengandung aluminium!",
        sequenceOrder: 2,
        sequenceNote: "Wajib hidrasi NaCl 0.9% ≥ 2–3 L & jaga diuresis ≥ 100 mL/jam.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Nefrotoksik, ototoksik, sangat emetogenik (HEC). Cek CrCl ≥ 60 mL/menit sebelum pemberian.",
      },
      {
        drugId: "Fluorouracil",
        drugName: "5-Fluorourasil (5-FU)",
        role: "Antimetabolit Pirimidin",
        dosageFormula: "750 mg/m²/hari IV Infus Kontinu Hari 1–5",
        doseValue: 750,
        doseUnit: "mg/m2",
        adminRoute: "IV infus kontinu 24 jam × 5 hari (Hari 1–5) via akses vena sentral/PICC",
        diluentStandard: "NaCl 0.9% atau D5% 500–1000 mL",
        sequenceOrder: 3,
        sequenceNote: "Hitung dosis harian; total 5 hari = 5 × dosis harian.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Waspadai mukositis oral berat, diare, kardiotoksisitas (vasospasme koroner), dan defisiensi DPD.",
      },
    ],
    premedicationProtocol: [
      "Deksametason 8 mg PO 2×1 selama 3 hari dimulai H-1 sebelum Dosetaksel",
      "Antiemetik HEC: NK1-RA (Aprepitant/Fosaprepitant) + 5-HT3 RA (Ondansetron/Palonosetron) + Deksametason",
      "Profilaksis antibiotik fluorokuinolon & G-CSF (Filgrastim/Pegfilgrastim) sangat dianjurkan",
    ],
    hydrationAndProtection: [
      "Hidrasi IV NaCl 0.9% 1–2 L pre-Sisplatin dan 1 L post-Sisplatin ditambah KCl + MgSO4",
    ],
    vitalMonitoring: [
      "CBC dengan hitung neutrofil (ANC), serum kreatinin/CrCl, elektrolit (K+, Mg2+), audiometri & mukositis oral",
    ],
    clinicalPearls: [
      "Risiko neutropenia febril sangat tinggi (>20%): profilaksis G-CSF primer direkomendasikan pada setiap siklus.",
    ],
    references: "NCCN Head and Neck Cancers Guidelines (TAX 323 / TAX 324); Posner MR, et al. N Engl J Med. 2007.",
    hasCarboplatin: false,
    hasVincristine: false,
  },
  {
    id: "reg_vbmcp",
    name: "VBMCP (M2 Protocol)",
    fullName: "Vincristine, Carmustine (BCNU), Melphalan, Cyclophosphamide, Prednisone",
    category: "mieloma",
    categoryLabel: "Mieloma Multipel",
    indication: "Mieloma Multipel (protokol kombinasi alkilator historis / alternatif sumber daya terbatas)",
    primaryGoal: "Sitoredusi / Kontrol Mieloma",
    overview: "Regimen kombinasi lima obat klasik (Protokol M2) untuk mieloma multipel dengan kombinasi tiga agen alkilasi, vinkristin, dan prednison.",
    cycleProtocol: "Siklus setiap 35 hari (5 minggu).",
    cycleLengthDays: 35,
    totalRecommendedCycles: "6 – 12 siklus sesuai respons paraprotein",
    drugs: [
      {
        drugId: "Vincristine",
        drugName: "Vinkristin",
        role: "Alkaloid Vinka",
        dosageFormula: "1.2 mg/m² IV Hari 1 (Maks 2 mg)",
        doseValue: 1.2,
        doseUnit: "mg/m2",
        adminRoute: "IV minibag 5–10 menit Hari 1 (HANYA IV)",
        diluentStandard: "NaCl 0.9% 50 mL",
        sequenceOrder: 1,
        sequenceNote: "Batas dosis tunggal maks 2 mg.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Pantau neuropati perifer & konstipasi.",
        maxSingleDoseCapMg: 2,
        maxCapNote: "Batas maksimum dosis tunggal Vinkristin 2 mg.",
      },
      {
        drugId: "Carmustine",
        drugName: "Karmustin (BCNU)",
        role: "Agen Alkilasi Nitrosourea",
        dosageFormula: "20 mg/m² IV Hari 1",
        doseValue: 20,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 1–2 jam",
        diluentStandard: "D5% 250 mL (botol kaca/non-PVC)",
        sequenceOrder: 2,
        sequenceNote: "Nadir mielosupresi tertunda (4–6 minggu).",
        vesicantStatus: "Iritan",
        specialPrecautions: "Risiko mielosupresi tertunda dan fibrosis paru kumulatif.",
      },
      {
        drugId: "Cyclophosphamide",
        drugName: "Siklofosfamid",
        role: "Agen Pengalkilasi",
        dosageFormula: "400 mg/m² IV Hari 1",
        doseValue: 400,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 30 menit Hari 1",
        diluentStandard: "NaCl 0.9% 250 mL",
        sequenceOrder: 3,
        sequenceNote: "Hidrasi oral adekuat.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Pantau hitung darah lengkap dan urin.",
      },
      {
        drugId: "Melphalan",
        drugName: "Melfalan",
        role: "Agen Pengalkilasi Oral",
        dosageFormula: "8 mg/m²/hari PO Hari 1–4",
        doseValue: 8,
        doseUnit: "mg/m2",
        adminRoute: "Oral saat perut kosong Hari 1–4",
        diluentStandard: "Tablet oral",
        sequenceOrder: 4,
        sequenceNote: "Absorpsi menurun bila bersama makanan.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Sesuaikan dosis pada insufisiensi ginjal; mielosupresi tertunda.",
      },
      {
        drugId: "Prednisone",
        drugName: "Prednison",
        role: "Kortikosteroid",
        dosageFormula: "40 mg/m²/hari PO Hari 1–7",
        doseValue: 40,
        doseUnit: "mg/m2",
        adminRoute: "Oral pagi hari setelah makan Hari 1–7",
        diluentStandard: "Tablet oral",
        sequenceOrder: 5,
        sequenceNote: "Tapering pada siklus pertama sesuai toleransi.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau gula darah & gastroprotektor.",
      },
    ],
    premedicationProtocol: ["Ondansetron 8 mg IV + Deksametason 8 mg IV sebelum infus Hari 1"],
    hydrationAndProtection: ["Hidrasi adekuat ≥ 2 L/hari; profilaksis PJP/HSV sesuai risiko"],
    vitalMonitoring: ["CBC nadir minggu ke-4, kreatinin, kalsium, dan elektroforesis protein serum (SPEP)"],
    clinicalPearls: ["Gunakan dengan hati-hati bila pasien direncanakan transplantasi sel punca autolog (Melfalan dapat mengganggu panen sel punca)."],
    references: "Oken MM, et al. Cancer. 1997; ECOG VBMCP Trial.",
    hasCarboplatin: false,
    hasVincristine: true,
  },
  {
    id: "reg_veip",
    name: "VeIP",
    fullName: "Vinblastine, Ifosfamide, Cisplatin (Platinol)",
    category: "urogenital",
    categoryLabel: "Urogenital & Testis",
    indication: "Tumor Sel Germinal Testis (Testicular Germ Cell Tumor) kambuhan / lini kedua",
    primaryGoal: "Kuratif Lini Kedua (Salvage Therapy)",
    overview: "Regimen salvage standar untuk kanker testis/tumor sel germinal yang relaps setelah terapi lini pertama BEP/EP.",
    cycleProtocol: "Siklus setiap 21 hari (Vinblastin Hari 1–2; Ifosfamid + Mesna + Sisplatin Hari 1–5).",
    cycleLengthDays: 21,
    totalRecommendedCycles: "4 siklus",
    drugs: [
      {
        drugId: "Vinblastine",
        drugName: "Vinblastin",
        role: "Alkaloid Vinka",
        dosageFormula: "0.11 mg/kg IV Hari 1 dan Hari 2",
        doseValue: 0.11,
        doseUnit: "mg/kg",
        adminRoute: "IV bolus/minibag 5–10 menit Hari 1 & 2 (HANYA IV — FATAL INTRATEKAL)",
        diluentStandard: "NaCl 0.9% 50 mL",
        sequenceOrder: 1,
        sequenceNote: "Dihitung berdasarkan berat badan (mg/kg).",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Sangat mielosupresif dan vesikan berat; pastikan kepatenan jalur IV.",
      },
      {
        drugId: "Ifosfamide",
        drugName: "Ifosfamid (+ Mesna Uroproteksi)",
        role: "Agen Pengalkilasi Oksazafosforin",
        dosageFormula: "1200 mg/m²/hari IV Hari 1–5",
        doseValue: 1200,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 1–2 jam Hari 1–5 WAJIB bersama Mesna",
        diluentStandard: "NaCl 0.9% 500 mL",
        sequenceOrder: 2,
        sequenceNote: "WAJIB berikan Mesna (total 60–100% dosis Ifosfamid) pada jam 0, 4, dan 8 untuk cegah sistitis hemoragik.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau hematuria mikroskopis & ensefalopati ifosfamid (bingung, somnolen — antidotum Metilen Biru).",
      },
      {
        drugId: "Cisplatin",
        drugName: "Sisplatin (Cisplatin)",
        role: "Agen Alkilasi Platinum",
        dosageFormula: "20 mg/m²/hari IV Hari 1–5",
        doseValue: 20,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 1 jam Hari 1–5 dengan hidrasi agresif",
        diluentStandard: "NaCl 0.9% 250–500 mL",
        diluentForbidden: "Hindari kontak dengan aluminium!",
        sequenceOrder: 3,
        sequenceNote: "Berikan setelah hidrasi NaCl 0.9% dan suplementasi Mg/K.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Nefrotoksik & ototoksik; pantau CrCl dan elektrolit harian.",
      },
    ],
    premedicationProtocol: [
      "Antiemetik HEC (NK1-RA + 5-HT3 RA + Deksametason) setiap hari Hari 1–5",
      "Profilaksis G-CSF (Filgrastim/Pegfilgrastim) wajib mulai 24 jam pasca siklus",
    ],
    hydrationAndProtection: [
      "Mesna uroproteksi wajib (20% dosis Ifosfamid IV jam 0, 4, dan 8 setiap hari Hari 1–5)",
      "Hidrasi NaCl 0.9% 2–3 L/hari dengan target urin ≥ 100 mL/jam",
    ],
    vitalMonitoring: [
      "Urinalisis harian (eritrosit urin), status neurologis (ensefalopati), CBC, kreatinin, Mg2+/K+, penanda tumor (AFP, beta-hCG, LDH)",
    ],
    clinicalPearls: [
      "Jangan pernah memberikan Ifosfamid tanpa protokol Mesna karena risiko sistitis hemoragik berat.",
    ],
    references: "NCCN Testicular Cancer Guidelines (VeIP); Loehrer PJ, et al. J Clin Oncol. 1998.",
    hasCarboplatin: false,
    hasVincristine: false,
  },
  {
    id: "reg_vmp",
    name: "VMP (MPV)",
    fullName: "Bortezomib (Velcade), Melphalan, Prednisone",
    category: "mieloma",
    categoryLabel: "Mieloma Multipel",
    indication: "Mieloma Multipel baru terdiagnosis (pasien tidak memenuhi syarat transplantasi sel punca autolog)",
    primaryGoal: "Induksi & Kontrol Penyakit Lini Pertama (Transplant-Ineligible)",
    overview: "Regimen standar berbasis inhibitor proteasom Bortezomib bersama Melfalan dan Prednison (VISTA Protocol) untuk pasien mieloma multipel lansia/non-transplant.",
    cycleProtocol: "Siklus 42 hari (6 minggu) pada siklus 1–4 atau siklus 35 hari modifikasi mingguan (Bortezomib SC Hari 1, 8, 15, 22).",
    cycleLengthDays: 35,
    totalRecommendedCycles: "9 siklus",
    drugs: [
      {
        drugId: "Bortezomib",
        drugName: "Bortezomib (Velcade)",
        role: "Inhibitor Proteasom 26S",
        dosageFormula: "1.3 mg/m² SC Hari 1, 8, 15, 22",
        doseValue: 1.3,
        doseUnit: "mg/m2",
        adminRoute: "Injeksi Subkutan (SC) — menurunkan risiko neuropati perifer vs IV",
        diluentStandard: "NaCl 0.9% (konsentrasi 2.5 mg/mL untuk SC)",
        sequenceOrder: 1,
        sequenceNote: "HANYA IV atau SC — FATAL BILA INTRATEKAL.",
        vesicantStatus: "Iritan",
        specialPrecautions: "WAJIB profilaksis antivirus Asiklovir/Valasiklovir (mencegah reaktivasi Herpes Zoster). Pantau neuropati perifer & trombositopenia.",
      },
      {
        drugId: "Melphalan",
        drugName: "Melfalan",
        role: "Agen Pengalkilasi Oral",
        dosageFormula: "9 mg/m²/hari PO Hari 1–4",
        doseValue: 9,
        doseUnit: "mg/m2",
        adminRoute: "Oral perut kosong Hari 1–4 setiap siklus",
        diluentStandard: "Tablet oral",
        sequenceOrder: 2,
        sequenceNote: "Turunkan dosis 25–50% bila CrCl < 50 mL/menit.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau hitung neutrofil & trombosit.",
      },
      {
        drugId: "Prednisone",
        drugName: "Prednison",
        role: "Kortikosteroid",
        dosageFormula: "60 mg/m²/hari PO Hari 1–4",
        doseValue: 60,
        doseUnit: "mg/m2",
        adminRoute: "Oral pagi hari setelah makan Hari 1–4",
        diluentStandard: "Tablet oral",
        sequenceOrder: 3,
        sequenceNote: "Berikan gastroprotektor dan pantau gula darah.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Risiko hiperglikemia dan infeksi oportunistik.",
      },
    ],
    premedicationProtocol: [
      "Asiklovir 400 mg PO 2×1 (atau Valasiklovir 500 mg 1×1) WAJIB selama terapi Bortezomib",
      "Gastroprotektor PPI pada hari konsumsi Prednison",
    ],
    hydrationAndProtection: [
      "Hidrasi oral adekuat untuk proteksi ginjal mieloma; pertimbangkan bisfosfonat (Asam Zoledronat) untuk proteksi tulang",
    ],
    vitalMonitoring: [
      "Evaluasi gejala neuropati perifer setiap kunjungan, CBC (trombosit), kreatinin, kalsium & protein M",
    ],
    clinicalPearls: [
      "Pemberian Bortezomib secara subkutan (SC) mingguan secara drastis menekan neuropati perifer derajat 3–4 dibanding jadwal 2x/minggu IV.",
    ],
    references: "NCCN Multiple Myeloma Guidelines (VMP / VISTA Trial); San Miguel JF, et al. N Engl J Med. 2008.",
    hasCarboplatin: false,
    hasVincristine: false,
  },
  {
    id: "reg_xeliri",
    name: "XELIRI / CAPIRI",
    fullName: "Capecitabine (Xeloda), Irinotecan",
    category: "kolorektal",
    categoryLabel: "Kolorektal & GI",
    indication: "Kanker Kolorektal Metastatik (mCRC) — alternatif oral dari FOLFIRI",
    primaryGoal: "Paliatif / Kontrol Penyakit Metastatik",
    overview: "Kombinasi Kapesitabin oral dan Irinotekan IV untuk kanker usus besar metastatik yang mengurangi kebutuhan infus 5-FU kontinu 46 jam.",
    cycleProtocol: "Siklus setiap 21 hari (Irinotekan IV Hari 1; Kapesitabin PO 2× sehari Hari 1–14, istirahat 7 hari).",
    cycleLengthDays: 21,
    totalRecommendedCycles: "Hingga progresi atau toksisitas tidak tertoleransi (evaluasi tiap 3–4 siklus)",
    drugs: [
      {
        drugId: "Irinotecan",
        drugName: "Irinotekan (Camptosar)",
        role: "Inhibitor Topoisomerase I",
        dosageFormula: "200 mg/m² IV Hari 1 (modified XELIRI)",
        doseValue: 200,
        doseUnit: "mg/m2",
        adminRoute: "IV infus 90 menit Hari 1",
        diluentStandard: "D5% atau NaCl 0.9% 250–500 mL",
        sequenceOrder: 1,
        sequenceNote: "Siapkan Atropin 0.25–0.5 mg IV/SC bila muncul sindrom kolinergik akut.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Risiko diare lambat berat (siapkan Loperamid agresif) & neutropenia (polimorfisme UGT1A1*28).",
      },
      {
        drugId: "Capecitabine",
        drugName: "Kapesitabin (Xeloda)",
        role: "Prodrug Oral 5-Fluorourasil",
        dosageFormula: "800 mg/m² PO 2× sehari (Total 1600 mg/m²/hari) Hari 1–14",
        doseValue: 800,
        doseUnit: "mg/m2",
        adminRoute: "Oral 2× sehari (dalam 30 menit setelah makan pagi & malam) selama 14 hari (dosis terhitung = per sekali minum)",
        diluentStandard: "Tablet oral 500 mg / 150 mg",
        sequenceOrder: 2,
        sequenceNote: "Dosis yang ditampilkan adalah per kali pemberian (diminum 2× sehari).",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Sesuaikan dosis bila CrCl 30–50 mL/menit (kontraindikasi bila CrCl < 30). Pantau Hand-Foot Syndrome, diare, dan INR jika bersama Warfarin.",
      },
    ],
    premedicationProtocol: [
      "Ondansetron 8 mg IV + Deksametason 8–12 mg IV 30 menit sebelum Irinotekan",
      "Atropin Sulfat 0.25–0.5 mg IV/SC siap sedia (atau profilaksis bila riwayat sindrom kolinergik)",
    ],
    hydrationAndProtection: [
      "Edukasi protokol Loperamid darurat (4 mg dosis awal, lalu 2 mg tiap 2 jam bila diare lambat) + hidrasi oralit",
    ],
    vitalMonitoring: [
      "CBC, fungsi hati (bilirubin total), fungsi ginjal (CrCl wajib ≥ 30 mL/menit), frekuensi diare & telapak tangan/kaki",
    ],
    clinicalPearls: [
      "Protokol modified XELIRI (Irinotekan 200 mg/m² + Kapesitabin 800 mg/m² 2×1) memiliki tolerabilitas GI jauh lebih baik dibanding dosis lama (250/1000) sesuai uji AXEPT.",
    ],
    references: "NCCN Colon Cancer Guidelines; Xu RH, et al. Lancet Oncol. 2018 (AXEPT Trial).",
    hasCarboplatin: false,
    hasVincristine: false,
  },
];

/**
 * Complete Chemotherapy Regimen Catalog (125 Oncology Protocols)
 * Covers all standard hematology & solid-tumor regimens including:
 * 7+3 (DA/DAC/IA/IAC), ABVD, AC, BACOD, BEACOPP, BEP, CA, CAF, CAPOX/XELOX, CAV, CBV,
 * CHOEP, CEPP, ChlVPP/EVA, CHOP, R-CHOP, ClaPD, CMF, CMV, COP/CVP, COPP, CT/TC, CTD,
 * CVAD/Hyper-CVAD, CVE, CYBORD, DAT, DCEP, DHAP, R-DHAP, DICE, DT-PACE, EC, ECF (MAGIC),
 * EOX, EP, EPOCH, R-EPOCH, ESHAP, R-ESHAP, FAM, FAMTX, FCM, R-FCM, FCR, FM, R-FM, FEC,
 * FEC-T, FL (Mayo), FLAG, FLAG-Ida, FLAG-Mito, FLAMSA, FLAMSA-Bu, FLAMSA-Mel, FLOT,
 * FOLFIRI, FOLFIRINOX, FOLFOX, GC, GDP, GemOx, GVD, R-GemOx, ICE, R-ICE, IFL, IVA,
 * MAP/MAPIE, m-BACOD, MACOP-B, MAID, MINE, R-MINE, MMM, MOPP, MVAC, MVP, NP, PACE, PCV,
 * PEB, PEI, Platina+Taksana, POMP, ProMACE-MOPP, ProMACE-CytaBOM, RdC, R-Benda, R-CVP,
 * R-MPV, RVD, Stanford V, TAC, TAD, TCH, TCHP, Thal/Dex, TIP, TPF, EE-4A, DD-4A, VABCD,
 * VAC, VAD, VAMP, VBMCP, VeIP, Regimen I, VAPEC-B, VDC-IE, VD-PACE, VIFUP, VIP, VMP,
 * VTD-PACE, V-DCEP, and XELIRI.
 */
export const CHEMOTHERAPY_REGIMENS: ChemotherapyRegimen[] = [
  ...CHEMO_REGIMENS_DATA.map(mapToChemotherapyRegimen),
  ...SUPPLEMENTAL_REGIMENS,
];

export const REGIMEN_CATEGORIES: RegimenCategoryOption[] = [
  { id: "all", label: "Semua Regimen", count: CHEMOTHERAPY_REGIMENS.length },
  ...(Object.keys(CHEMO_CATEGORY_LABELS) as RegimenCancerCategory[])
    .map((catId) => ({
      id: catId,
      label: catId === "lainnya" ? "Kepala-Leher & Lainnya" : CHEMO_CATEGORY_LABELS[catId],
      count: CHEMOTHERAPY_REGIMENS.filter((r) => r.category === catId).length,
    }))
    .filter((cat) => cat.count > 0),
];

export function calculateMostellerBSA(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  return Math.sqrt((weightKg * heightCm) / 3600);
}

export function calculateDuBoisBSA(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  return 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
}

export function calculateCockcroftGaultCrCl(
  ageYears: number,
  weightKg: number,
  serumCreatinineMgDl: number,
  gender: "male" | "female"
): number {
  if (ageYears <= 0 || weightKg <= 0 || serumCreatinineMgDl <= 0) return 0;
  const genderFactor = gender === "female" ? 0.85 : 1.0;
  return (((140 - ageYears) * weightKg) / (72 * serumCreatinineMgDl)) * genderFactor;
}

export function calculateIdealBodyWeight(heightCm: number, gender: "male" | "female"): number {
  if (heightCm <= 0) return 0;
  const heightInches = heightCm / 2.54;
  const base = gender === "female" ? 45.5 : 50.0;
  return Math.max(0, base + 2.3 * (heightInches - 60));
}

export function calculateCalvertCarboplatinDose(
  targetAUC: number,
  crCl: number,
  capGfrAt125: boolean = true
): { doseMg: number; effectiveGfr: number; wasCapped: boolean } {
  if (targetAUC <= 0 || crCl <= 0) {
    return { doseMg: 0, effectiveGfr: 0, wasCapped: false };
  }
  const wasCapped = capGfrAt125 && crCl > 125;
  const effectiveGfr = wasCapped ? 125 : crCl;
  return {
    doseMg: targetAUC * (effectiveGfr + 25),
    effectiveGfr,
    wasCapped,
  };
}

/**
 * Calculates individualized chemotherapy dosages for every drug component of a given regimen
 * based on patient BSA (auto-calculated or manual), weight, renal clearance, capping rules,
 * optional per-component dose overrides, and dose reduction %.
 */
export function calculateRegimenDosages(
  regimen: ChemotherapyRegimen,
  input: RegimenPatientInput
): RegimenCalculationResult {
  const bsaMosteller = calculateMostellerBSA(input.weightKg, input.heightCm);
  const bsaDuBois = calculateDuBoisBSA(input.weightKg, input.heightCm);
  const isManualBsa = input.bsaInputMode === "manual" && (input.manualBsaM2 || 0) > 0;
  const activeBsa = isManualBsa
    ? input.manualBsaM2 || 0
    : input.bsaFormula === "dubois"
    ? bsaDuBois
    : bsaMosteller;

  const bmi =
    input.weightKg > 0 && input.heightCm > 0
      ? input.weightKg / Math.pow(input.heightCm / 100, 2)
      : 0;
  const ibwKg = calculateIdealBodyWeight(input.heightCm, input.gender);
  const crClRaw = calculateCockcroftGaultCrCl(
    input.ageYears,
    input.weightKg,
    input.serumCreatinineMgDl,
    input.gender
  );

  const gfrWasCapped = input.capGfrAt125 && crClRaw > 125;
  const crClForCalvert = gfrWasCapped ? 125 : crClRaw;
  const reductionFactor = Math.max(0.1, Math.min(1, input.doseReductionPercent / 100));
  const bsaLabel = isManualBsa
    ? "LPT Manual"
    : input.bsaFormula === "dubois"
    ? "Du Bois"
    : "Mosteller";

  const drugs: CalculatedRegimenDrug[] = regimen.drugs.map((drug) => {
    const customKey = `${drug.drugId}_${drug.sequenceOrder}`;
    const overrideVal = input.customComponentDoses?.[customKey];
    const appliedDoseValue =
      typeof overrideVal === "number" && !Number.isNaN(overrideVal) && overrideVal > 0
        ? overrideVal
        : drug.doseValue;

    let standardDose = 0;
    let cappedStandardDose = 0;
    let displayUnit: "mg" | "mcg" | "unit" = "mg";
    let formulaBreakdown = "";
    let wasCapped = false;
    let capReason: string | undefined;

    if (drug.doseUnit === "mg/m2") {
      standardDose = activeBsa * appliedDoseValue;
      displayUnit = "mg";
      formulaBreakdown = `${activeBsa.toFixed(2)} m² (${bsaLabel}) × ${appliedDoseValue} mg/m²`;

      if (
        input.capVincristineAt2mg &&
        typeof drug.maxSingleDoseCapMg === "number" &&
        standardDose > drug.maxSingleDoseCapMg
      ) {
        cappedStandardDose = drug.maxSingleDoseCapMg;
        wasCapped = true;
        capReason = drug.maxCapNote || `Dosis tunggal dibatasi maksimal ${drug.maxSingleDoseCapMg} mg`;
      } else {
        cappedStandardDose = standardDose;
      }
    } else if (drug.doseUnit === "unit/m2") {
      standardDose = activeBsa * appliedDoseValue;
      cappedStandardDose = standardDose;
      displayUnit = "unit";
      formulaBreakdown = `${activeBsa.toFixed(2)} m² (${bsaLabel}) × ${appliedDoseValue} unit/m²`;
    } else if (drug.doseUnit === "mg/kg") {
      standardDose = input.weightKg * appliedDoseValue;
      cappedStandardDose = standardDose;
      displayUnit = "mg";
      formulaBreakdown = `${input.weightKg} kg × ${appliedDoseValue} mg/kg`;
    } else if (drug.doseUnit === "mcg/kg") {
      standardDose = input.weightKg * appliedDoseValue;
      cappedStandardDose = standardDose;
      displayUnit = "mcg";
      formulaBreakdown = `${input.weightKg} kg × ${appliedDoseValue} mcg/kg`;
    } else if (drug.doseUnit === "AUC") {
      const targetAuc =
        typeof overrideVal === "number" && overrideVal > 0
          ? overrideVal
          : input.targetAUC > 0
          ? input.targetAUC
          : appliedDoseValue;
      const calvert = calculateCalvertCarboplatinDose(targetAuc, crClRaw, input.capGfrAt125);
      standardDose = calvert.doseMg;
      cappedStandardDose = calvert.doseMg;
      displayUnit = "mg";
      formulaBreakdown = `AUC ${targetAuc} × (GFR ${calvert.effectiveGfr.toFixed(1)} + 25)`;
      if (calvert.wasCapped) {
        wasCapped = true;
        capReason = "GFR Calvert dibatasi maksimal 125 mL/menit (rekomendasi FDA/GOG untuk mencegah overdosis Carboplatin).";
      }
    } else if (drug.doseUnit === "unit_flat") {
      standardDose = appliedDoseValue;
      cappedStandardDose = standardDose;
      displayUnit = "unit";
      formulaBreakdown = `Dosis tetap (flat dose): ${appliedDoseValue} unit`;
    } else {
      // mg_flat
      standardDose = appliedDoseValue;
      cappedStandardDose = standardDose;
      displayUnit = "mg";
      formulaBreakdown = `Dosis tetap (flat dose): ${appliedDoseValue} mg`;
    }

    const finalDose = cappedStandardDose * reductionFactor;

    return {
      drug,
      appliedDoseValue,
      standardDose,
      cappedStandardDose,
      finalDose,
      displayUnit,
      formulaBreakdown,
      wasCapped,
      capReason,
    };
  });

  return {
    regimen,
    bsaMosteller,
    bsaDuBois,
    activeBsa,
    bmi,
    ibwKg,
    crClRaw,
    crClForCalvert,
    gfrWasCapped,
    drugs,
  };
}

export function formatRegimenOrderSummary(
  result: RegimenCalculationResult,
  input: RegimenPatientInput
): string {
  const bsaLabel =
    input.bsaInputMode === "manual" && (input.manualBsaM2 || 0) > 0
      ? "LPT Manual"
      : input.bsaFormula === "dubois"
      ? "Du Bois"
      : "Mosteller";
  const heightInfo =
    input.heightCm > 0
      ? `TB: ${input.heightCm} cm | IMT: ${result.bmi.toFixed(1)} kg/m²`
      : `TB: — (Input LPT Manual)`;

  const lines = [
    `=== KALKULASI DOSIS REGIMEN KEMOTERAPI: ${result.regimen.name} ===`,
    `Nama Lengkap: ${result.regimen.fullName}`,
    `Indikasi: ${result.regimen.indication}`,
    `Protokol Siklus: ${result.regimen.cycleProtocol}`,
    ``,
    `DATA PASIEN:`,
    `- Jenis Kelamin: ${input.gender === "female" ? "Perempuan" : "Laki-laki"} | Usia: ${input.ageYears} tahun`,
    `- BB: ${input.weightKg} kg | ${heightInfo}`,
    `- LPT/BSA (${bsaLabel}): ${result.activeBsa.toFixed(2)} m²`,
    `- Kreatinin Serum: ${input.serumCreatinineMgDl} mg/dL | CrCl (Cockcroft-Gault): ${result.crClRaw.toFixed(1)} mL/menit`,
    `- Penyesuaian Dosis (Dose Intensity): ${input.doseReductionPercent}%`,
    ``,
    `RINCIAN DOSIS OBAT INDIVIDUAL:`,
    ...result.drugs.map((item, idx) => {
      const doseFormatted =
        item.finalDose < 10 ? item.finalDose.toFixed(2) : Math.round(item.finalDose).toString();
      const capTag = item.wasCapped ? " [CAPPED]" : "";
      return `${idx + 1}. ${item.drug.drugName}: ${doseFormatted} ${item.displayUnit}${capTag} (${item.drug.dosageFormula} | ${item.formulaBreakdown}) — ${item.drug.adminRoute} | Pelarut: ${item.drug.diluentStandard}`;
    }),
    ``,
    `Referensi: ${result.regimen.references}`,
  ];
  return lines.join("\n");
}
