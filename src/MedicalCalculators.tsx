import React, { useState } from "react";
import { 
  Calculator, 
  Activity, 
  Heart, 
  Brain, 
  Baby, 
  Weight, 
  Pill, 
  Droplet, 
  Microscope,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Droplets,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  X,
  Gauge,
  Stethoscope,
  Wind,
  Flame,
  Calendar,
  TrendingUp,
  Syringe,
  FlaskConical,
  ClipboardList,
  LineChart,
  ArrowLeft,
  ChevronRight,
  Ruler,
  ClipboardCheck
} from "lucide-react";
import { CHEMO_REGIMENS_DATA, ChemoRegimen, ChemoDrugComponent } from "./data/chemoRegimensData";
import {
  CHEMOTHERAPY_REGIMENS,
  REGIMEN_CATEGORIES,
  calculateRegimenDosages,
  formatRegimenOrderSummary,
  type BsaFormulaType,
  type RegimenCancerCategory,
} from "./regimens";
import {
  MapCalculator,
  PreventAscvdCalculator,
  QsofaCurb65Calculator,
  Spo2Fio2Calculator,
} from "./components/calculators/RenalCardioInfectionCalcs";
import {
  CalorieBmrTdeeCalculator,
  HplCalculator,
  WhoZScoreCalculator,
} from "./components/calculators/NutritionPregnancyCalcs";
import {
  FertilityCalculator,
  PhysicalGrowthAnthropometryCalculator,
  DevelopmentalScreeningCalculator,
} from "./components/calculators/FertilityGrowthDevCalcs";
import {
  IvInfusionCalculator,
  UnitDilutionCalculator,
  CompoundingPrescriptionCalculator,
  PharmacokineticsCalculator,
  InfusionDripRateCalculator,
  SyringePumpCalculator,
  FluidElectrolyteCalculator,
} from "./components/calculators/ClinicalDosingCalcs";

type CalculatorType =
  | "egfr"
  | "crcl"
  | "map"
  | "cha2ds2vasc"
  | "ascvd"
  | "qsofa_curb65"
  | "gcs"
  | "sf_ratio"
  | "bmi"
  | "bmr_tdee"
  | "bsa"
  | "hpl"
  | "fertility"
  | "apgar"
  | "zscore_who"
  | "physical_growth"
  | "dev_screening"
  | "chemo"
  | "regimen"
  | "pediatric"
  | "iv_infusion"
  | "unit_dilution"
  | "compounding"
  | "pharmacokinetics"
  | "drip_rate"
  | "syringe_pump"
  | "fluid_electrolyte"
  | "lab";

type CalculatorGroupId =
  | "all"
  | "ginjal_cairan"
  | "jantung_infeksi"
  | "neuro_paru_igd"
  | "nutrisi_kehamilan"
  | "kemoterapi"
  | "klinis_dosis";

interface CalculatorCatalogItem {
  id: CalculatorType;
  title: string;
  description: string;
  meta?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}

interface CalculatorGroupConfig {
  id: Exclude<CalculatorGroupId, "all">;
  index: string;
  title: string;
  subtitle: string;
  items: CalculatorCatalogItem[];
}

export function MedicalCalculators() {
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CalculatorGroupId>("all");
  const [catalogSearch, setCatalogSearch] = useState("");

  const ReferenceFooter = ({ references }: { references: string[] }) => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <h4 className="text-xs font-bold text-slate-500 mb-2">Referensi & Pustaka:</h4>
      <ul className="text-[10px] text-slate-400 list-disc pl-4 space-y-1">
        {references.map((ref, idx) => (
          <li key={idx}>{ref}</li>
        ))}
      </ul>
    </div>
  );


  // States for eGFR
  const [egfrAge, setEgfrAge] = useState("");
  const [egfrCr, setEgfrCr] = useState("");
  const [egfrGender, setEgfrGender] = useState<"male" | "female">("male");
  const [egfrRace, setEgfrRace] = useState<"black" | "other">("other");

  // States for Lab
  const [labParam, setLabParam] = useState("Na");
  const [labValue, setLabValue] = useState("");

  // States for Chemotherapy
  const [chemoRegimen, setChemoRegimen] = useState<string>("abvd");
  const [chemoGender, setChemoGender] = useState<"female" | "male">("female");
  const [chemoAge, setChemoAge] = useState("40");
  const [chemoWeight, setChemoWeight] = useState("50");
  const [chemoHeight, setChemoHeight] = useState("150");
  const [chemoCr, setChemoCr] = useState("0.9");
  const [chemoAUC, setChemoAUC] = useState("5");
  const [chemoBeva, setChemoBeva] = useState("7.5");
  const [chemoDosePercent, setChemoDosePercent] = useState<number>(100);
  const [chemoCategoryFilter, setChemoCategoryFilter] = useState<string>("all");
  const [chemoSearchQuery, setChemoSearchQuery] = useState<string>("");
  const [chemoHasCalculated, setChemoHasCalculated] = useState(false);
  const [chemoActiveTab, setChemoActiveTab] = useState<"drugs" | "sequence" | "premed" | "vital">("drugs");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // States for Regimen Kemoterapi Calculator (src/regimens.ts)
  const [regimenSelectedId, setRegimenSelectedId] = useState<string>(CHEMOTHERAPY_REGIMENS[0]?.id || "abvd");
  const [regimenCategory, setRegimenCategory] = useState<"all" | RegimenCancerCategory>("all");
  const [regimenSearch, setRegimenSearch] = useState<string>("");
  const [regimenGender, setRegimenGender] = useState<"female" | "male">("female");
  const [regimenAge, setRegimenAge] = useState<string>("50");
  const [regimenWeight, setRegimenWeight] = useState<string>("58");
  const [regimenHeight, setRegimenHeight] = useState<string>("158");
  const [regimenCr, setRegimenCr] = useState<string>("0.9");
  const [regimenAuc, setRegimenAuc] = useState<string>("5");
  const [regimenBsaMode, setRegimenBsaMode] = useState<"auto" | "manual">("auto");
  const [regimenManualBsa, setRegimenManualBsa] = useState<string>("1.60");
  const [regimenBsaFormula, setRegimenBsaFormula] = useState<BsaFormulaType>("mosteller");
  const [regimenDosePercent, setRegimenDosePercent] = useState<number>(100);
  const [regimenCapGfr, setRegimenCapGfr] = useState<boolean>(true);
  const [regimenCapVincristine, setRegimenCapVincristine] = useState<boolean>(true);
  const [regimenCustomDoses, setRegimenCustomDoses] = useState<Record<string, number>>({});
  const [regimenCopied, setRegimenCopied] = useState<boolean>(false);

  // States for Pediatric Dose
  const [pedTab, setPedTab] = useState<"weight_bsa" | "empirical">("weight_bsa");
  const [pedDoseMethod, setPedDoseMethod] = useState<"mg_kg" | "mg_m2">("mg_kg");
  const [pedTargetDose, setPedTargetDose] = useState("15");
  const [pedWeightDirect, setPedWeightDirect] = useState("14");
  const [pedHeightDirect, setPedHeightDirect] = useState("95");
  const [pedFreqPerDay, setPedFreqPerDay] = useState("3");
  const [pedSyrupStrength, setPedSyrupStrength] = useState("120");
  const [pedSyrupVol, setPedSyrupVol] = useState("5");
  const [pedAdultDose, setPedAdultDose] = useState("");
  const [pedAgeMonths, setPedAgeMonths] = useState("");
  const [pedWeight, setPedWeight] = useState("");

  // States for BMI/IBW
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiGender, setBmiGender] = useState<"male" | "female">("male");

  // States for CrCl
  const [crclAge, setCrclAge] = useState("");
  const [crclWeight, setCrclWeight] = useState("");
  const [crclCr, setCrclCr] = useState("");
  const [crclGender, setCrclGender] = useState<"male" | "female">("male");

  // States for BSA
  const [bsaWeight, setBsaWeight] = useState("");
  const [bsaHeight, setBsaHeight] = useState("");

  // States for GCS
  const [gcsEye, setGcsEye] = useState<number>(4);
  const [gcsVerbal, setGcsVerbal] = useState<number>(5);
  const [gcsMotor, setGcsMotor] = useState<number>(6);

  // States for APGAR
  const [apgarColor, setApgarColor] = useState<number>(2);
  const [apgarHeart, setApgarHeart] = useState<number>(2);
  const [apgarReflex, setApgarReflex] = useState<number>(2);
  const [apgarMuscle, setApgarMuscle] = useState<number>(2);
  const [apgarRespiration, setApgarRespiration] = useState<number>(2);

  // States for CHA2DS2-VASc
  const [chaAge, setChaAge] = useState<"under65" | "65to74" | "75over">("under65");
  const [chaGender, setChaGender] = useState<"male" | "female">("male");
  const [chaCHF, setChaCHF] = useState(false);
  const [chaHTN, setChaHTN] = useState(false);
  const [chaStroke, setChaStroke] = useState(false);
  const [chaVascular, setChaVascular] = useState(false);
  const [chaDiabetes, setChaDiabetes] = useState(false);

  const calculatorGroups: CalculatorGroupConfig[] = [
    {
      id: "ginjal_cairan",
      index: "01",
      title: "Ginjal & Cairan",
      subtitle: "Evaluasi laju filtrasi glomerulus, penyesuaian dosis obat renal, dan pemantauan perfusi organ.",
      items: [
        {
          id: "egfr",
          title: "eGFR (CKD-EPI)",
          description: "Memperkirakan laju filtrasi glomerulus untuk menilai fungsi ginjal dan stadium penyakit ginjal kronis.",
          meta: "CKD-EPI 2021 · Stadium G1–G5",
          icon: Droplet,
          accentClass: "bg-sky-50 text-sky-700",
        },
        {
          id: "crcl",
          title: "Klirens Kreatinin (Cockcroft-Gault)",
          description: "Membantu menyesuaikan dosis obat yang diekskresikan lewat ginjal berdasarkan usia, BB, dan kreatinin.",
          meta: "Penyesuaian Dosis Renal",
          icon: Activity,
          accentClass: "bg-amber-50 text-amber-700",
        },
        {
          id: "map",
          title: "MAP (Mean Arterial Pressure)",
          description: "Mengukur tekanan arteri rata-rata untuk memantau kecukupan perfusi organ vital dan target resusitasi.",
          meta: "SBP / DBP · Pulse Pressure",
          icon: Gauge,
          accentClass: "bg-teal-50 text-teal-700",
        },
      ],
    },
    {
      id: "jantung_infeksi",
      index: "02",
      title: "Jantung, Pembuluh Darah & Infeksi",
      subtitle: "Stratifikasi risiko stroke, penyakit kardiovaskular jangka panjang, sepsis, dan keparahan pneumonia.",
      items: [
        {
          id: "cha2ds2vasc",
          title: "CHA₂DS₂-VASc",
          description: "Menilai risiko stroke pada pasien fibrilasi atrium non-valvular untuk panduan terapi antikoagulan.",
          meta: "Fibrilasi Atrium · Skor 0–9",
          icon: Heart,
          accentClass: "bg-rose-50 text-rose-700",
        },
        {
          id: "ascvd",
          title: "PREVENT / ASCVD Risk",
          description: "Memperkirakan risiko penyakit kardiovaskular jangka panjang berdasarkan usia, tekanan darah, kolesterol, eGFR, dan faktor metabolik.",
          meta: "Risiko 10 Tahun · AHA/ACC",
          icon: Stethoscope,
          accentClass: "bg-rose-50 text-rose-700",
        },
        {
          id: "qsofa_curb65",
          title: "qSOFA / CURB-65",
          description: "Membantu menilai tingkat keparahan infeksi/sepsis akut maupun pneumonia komunitas (CAP).",
          meta: "Sepsis-3 · Stratifikasi CAP",
          icon: ShieldAlert,
          accentClass: "bg-amber-50 text-amber-700",
        },
      ],
    },
    {
      id: "neuro_paru_igd",
      index: "03",
      title: "Neurologi, Paru & Gawat Darurat",
      subtitle: "Penilaian cepat tingkat kesadaran dan evaluasi oksigenasi paru pada gangguan napas akut.",
      items: [
        {
          id: "gcs",
          title: "Glasgow Coma Scale (GCS)",
          description: "Menilai tingkat kesadaran pasien melalui respons mata (E), verbal (V), dan motorik (M).",
          meta: "Skor 3–15 · Cedera Otak",
          icon: Brain,
          accentClass: "bg-teal-50 text-teal-700",
        },
        {
          id: "sf_ratio",
          title: "Rasio SpO₂/FiO₂",
          description: "Mengevaluasi fungsi oksigenasi paru secara non-invasif, estimasi P/F ARDS, dan indeks ROX pada gangguan napas akut.",
          meta: "Oksigenasi · ARDS · ROX",
          icon: Wind,
          accentClass: "bg-sky-50 text-sky-700",
        },
      ],
    },
    {
      id: "nutrisi_kehamilan",
      index: "04",
      title: "Nutrisi, Metabolisme & Kehamilan",
      subtitle: "Antropometri dewasa & balita, kebutuhan energi klinis, obstetri, serta penilaian neonatus.",
      items: [
        {
          id: "bmi",
          title: "IMT (BMI) & Berat Badan Ideal",
          description: "Mengukur status gizi (IMT) dan batas berat badan ideal (IBW Devine).",
          meta: "WHO · Devine IBW",
          icon: Weight,
          accentClass: "bg-emerald-50 text-emerald-700",
        },
        {
          id: "bmr_tdee",
          title: "Kalkulator Kebutuhan Kalori (BMR & TDEE)",
          description: "Menggunakan rumus Harris-Benedict atau Mifflin-St Jeor yang disesuaikan dengan aktivitas dan faktor stres penyakit pasien.",
          meta: "Mifflin-St Jeor · Harris-Benedict",
          icon: Flame,
          accentClass: "bg-amber-50 text-amber-700",
        },
        {
          id: "bsa",
          title: "Body Surface Area",
          description: "Menghitung luas permukaan tubuh (Mosteller) untuk penentuan dosis obat kritis dan kemoterapi.",
          meta: "Rumus Mosteller (m²)",
          icon: Calculator,
          accentClass: "bg-emerald-50 text-emerald-700",
        },
        {
          id: "hpl",
          title: "HPL (Hari Perkiraan Lahir)",
          description: "Menghitung perkiraan tanggal persalinan dan usia kehamilan berdasarkan Hari Pertama Haid Terakhir (HPHT).",
          meta: "Rumus Naegele · Siklus Haid",
          icon: Calendar,
          accentClass: "bg-pink-50 text-pink-700",
        },
        {
          id: "fertility",
          title: "Kalkulator Masa Subur Wanita",
          description: "Memperkirakan jendela masa subur (fertile window), puncak ovulasi, fase siklus, dan proyeksi 3 siklus untuk siklus teratur maupun tidak teratur (Ogino-Knaus).",
          meta: "Ovulasi · Ogino-Knaus · 3 Siklus",
          icon: Heart,
          accentClass: "bg-rose-50 text-rose-700",
        },
        {
          id: "apgar",
          title: "APGAR Score",
          description: "Penilaian klinis cepat kondisi bayi baru lahir berdasarkan 5 parameter vital.",
          meta: "Neonatus · Skor 0–10",
          icon: Baby,
          accentClass: "bg-pink-50 text-pink-700",
        },
        {
          id: "zscore_who",
          title: "Kalkulator Kurva Pertumbuhan (Z-Score WHO/CDC)",
          description: "Menentukan status gizi balita 0–60 bulan (BB/U, PB/TB-U, BB/TB) untuk mendeteksi stunting, wasting, atau obesitas.",
          meta: "WHO 2006 · Permenkes RI",
          icon: TrendingUp,
          accentClass: "bg-emerald-50 text-emerald-700",
        },
        {
          id: "physical_growth",
          title: "Kalkulator Pertumbuhan Fisik (Antropometri/Gizi)",
          description: "Evaluasi antropometri & gizi lengkap: IMT/U, Lingkar Kepala/U, LILA (MUAC/KEK), Potensi Tinggi Genetik (MPH), anak/remaja 5–18 th, serta WHR/WHtR dewasa.",
          meta: "LK · LILA/KEK · MPH · WHO 2007",
          icon: Ruler,
          accentClass: "bg-teal-50 text-teal-700",
        },
        {
          id: "dev_screening",
          title: "Alat Skrining Perkembangan (Motorik, Bahasa, Sosial)",
          description: "Skrining tumbuh kembang anak 3–60 bulan (Motorik Kasar, Motorik Halus, Bicara & Bahasa, Sosialisasi) beserta skor KPSP, tanda bahaya, dan saran stimulasi.",
          meta: "KPSP / SDIDTK · 4 Domain",
          icon: ClipboardCheck,
          accentClass: "bg-indigo-50 text-indigo-700",
        },
      ],
    },
    {
      id: "kemoterapi",
      index: "05",
      title: "Kemoterapi",
      subtitle: "Perhitungan dosis individual onkologi berbasis LPT/BSA dan Calvert AUC serta protokol regimen kanker.",
      items: [
        {
          id: "chemo",
          title: "Kalkulator Kemoterapi",
          description: "Dosis individual berbasis LPT/AUC, penyesuaian obesitas, urutan infus, dan protokol premedikasi.",
          meta: `${CHEMO_REGIMENS_DATA.length} Regimen Kanker`,
          icon: Activity,
          accentClass: "bg-teal-50 text-teal-700",
        },
        {
          id: "regimen",
          title: "Regimen Kemoterapi",
          description: "Hitung dosis spesifik protokol kemoterapi (7+3, ABVD, R-CHOP, FOLFIRINOX, BEP, CAPOX, dan lainnya).",
          meta: `${CHEMOTHERAPY_REGIMENS.length} Protokol Onkologi`,
          icon: Layers,
          accentClass: "bg-indigo-50 text-indigo-700",
        },
      ],
    },
    {
      id: "klinis_dosis",
      index: "06",
      title: "Kalkulator Klinis & Dosis Obat",
      subtitle: "Perhitungan dosis pediatrik, terapi intravena, pengenceran, peracikan resep, farmakokinetika, pompa titrasi, dan cairan elektrolit.",
      items: [
        {
          id: "pediatric",
          title: "Konversi Dosis Anak",
          description: "Menghitung takaran obat anak berdasarkan berat badan (mg/kgBB), luas permukaan tubuh (mg/m²), volume sirup, serta rumus klasik.",
          meta: "mg/kgBB · BSA · Clark/Young",
          icon: Pill,
          accentClass: "bg-purple-50 text-purple-700",
        },
        {
          id: "iv_infusion",
          title: "Kalkulator Infus & IV (Intravena)",
          description: "Menghitung kecepatan pompa infus (mL/jam), konsentrasi akhir campuran IV (mg/mL), dan laju pemberian obat intravena.",
          meta: "mL/jam · mg/mL · mg/jam",
          icon: Droplets,
          accentClass: "bg-sky-50 text-sky-700",
        },
        {
          id: "unit_dilution",
          title: "Konversi Satuan & Pengenceran",
          description: "Mengubah satuan massa/volume, persentase kadar (% b/v ↔ mg/mL), pengenceran C₁V₁=C₂V₂, dan aligasi larutan.",
          meta: "Satuan · C₁V₁=C₂V₂ · Aligasi",
          icon: FlaskConical,
          accentClass: "bg-teal-50 text-teal-700",
        },
        {
          id: "compounding",
          title: "Kalkulator Resep & Sediaan Racikan",
          description: "Menghitung jumlah tablet/bahan racikan puyer atau kapsul (d.t.d/non-d.t.d), pengisi SL, serta cek Dosis Maksimal (DM).",
          meta: "Racikan · Verifikasi % DM",
          icon: ClipboardList,
          accentClass: "bg-indigo-50 text-indigo-700",
        },
        {
          id: "pharmacokinetics",
          title: "Farmakokinetika",
          description: "Menghitung waktu paruh (t½), konstanta eliminasi (ke), kadar plasma C(t), klirens (Cl), Vd, Loading & Maintenance Dose.",
          meta: "Logaritma & Eksponen · TDM",
          icon: LineChart,
          accentClass: "bg-sky-50 text-sky-700",
        },
        {
          id: "drip_rate",
          title: "Kalkulator Tetesan Infus",
          description: "Menghitung kecepatan tetesan per menit (TPM) untuk makro drip (15/20), mikro drip (60), dan set transfusi darah.",
          meta: "Makro · Mikro · TPM",
          icon: Clock,
          accentClass: "bg-emerald-50 text-emerald-700",
        },
        {
          id: "syringe_pump",
          title: "Kalkulator Syringe Pump / Infusion Pump",
          description: "Mengonversi dosis obat titrasi (dopamin, norepinefrin, nitrogliserin, insulin, heparin) ke mililiter/jam dengan tabel titrasi.",
          meta: "mcg/kgBB/mnt → mL/jam",
          icon: Syringe,
          accentClass: "bg-rose-50 text-rose-700",
        },
        {
          id: "fluid_electrolyte",
          title: "Kalkulator Kebutuhan Cairan & Elektrolit",
          description: "Rumus Holliday-Segar (anak), Baxter/Parkland (luka bakar), serta koreksi hiponatremia (Adrogué-Madias) & hipokalemia.",
          meta: "Holliday-Segar · Parkland · Na/K",
          icon: Droplet,
          accentClass: "bg-amber-50 text-amber-700",
        },
        {
          id: "lab",
          title: "Interpretasi Nilai Laboratorium",
          description: "Evaluasi cepat nilai rujukan darah lengkap, elektrolit, profil lipid, gula darah, fungsi hati, dan fungsi ginjal.",
          meta: "Nilai Rujukan Klinis",
          icon: Microscope,
          accentClass: "bg-slate-100 text-slate-700",
        },
      ],
    },
  ];

  const activeGroupOfCalc = activeCalc
    ? calculatorGroups.find((g) => g.items.some((item) => item.id === activeCalc))
    : null;

  const renderCalculatorList = () => {
    const query = catalogSearch.trim().toLowerCase();
    const visibleGroups = calculatorGroups
      .filter((g) => selectedGroup === "all" || g.id === selectedGroup)
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            !query ||
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.meta && item.meta.toLowerCase().includes(query)) ||
            g.title.toLowerCase().includes(query)
        ),
      }))
      .filter((g) => g.items.length > 0);

    const totalShown = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);

    return (
      <div className="space-y-8">
        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Cari kalkulator (mis. eGFR, Syringe Pump, Parkland, Z-Score)..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
              {catalogSearch && (
                <button
                  type="button"
                  onClick={() => setCatalogSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
              Menampilkan {totalShown} kalkulator · 6 kelompok klinis
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedGroup === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              Semua Kategori
            </button>
            {calculatorGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedGroup === group.id
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Calculator Sections */}
        {visibleGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">Kalkulator tidak ditemukan</p>
            <p className="text-xs text-slate-500">
              Coba kata kunci lain atau klik Reset untuk melihat seluruh 6 kelompok kalkulator medis.
            </p>
            <button
              type="button"
              onClick={() => {
                setCatalogSearch("");
                setSelectedGroup("all");
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Tampilkan Semua Kalkulator
            </button>
          </div>
        ) : (
          <div className="space-y-9">
            {visibleGroups.map((group) => (
              <section key={group.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2.5 border-b border-slate-200">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                      <span className="font-mono text-teal-700 mr-2">{group.index}.</span>
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                    {group.items.length} kalkulator
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveCalc(item.id)}
                        className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 transition-colors text-left flex flex-col justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.accentClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5 mt-1 shrink-0" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-[15px] leading-snug group-hover:text-teal-800 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {item.meta && (
                          <div className="pt-2.5 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                            {item.meta}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEgfrCalculator = () => {
    let egfr = 0;
    const a = parseFloat(egfrAge);
    const cr = parseFloat(egfrCr);
    
    if (a > 0 && cr > 0) {
      const k = egfrGender === "female" ? 0.7 : 0.9;
      const alpha = egfrGender === "female" ? -0.241 : -0.302;
      const alpha2 = -1.200;
      const p1 = Math.min(cr / k, 1);
      const p2 = Math.max(cr / k, 1);
      
      egfr = 142 * Math.pow(p1, alpha) * Math.pow(p2, alpha2) * Math.pow(0.9938, a) * (egfrGender === "female" ? 1.012 : 1);
    }
    
    let stage = "";
    if (egfr > 0) {
      if (egfr >= 90) stage = "G1 (Normal atau Tinggi)";
      else if (egfr >= 60) stage = "G2 (Menurun Ringan)";
      else if (egfr >= 45) stage = "G3a (Menurun Ringan-Sedang)";
      else if (egfr >= 30) stage = "G3b (Menurun Sedang-Berat)";
      else if (egfr >= 15) stage = "G4 (Menurun Berat)";
      else stage = "G5 (Gagal Ginjal)";
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">eGFR (CKD-EPI 2021)</h2>
          <p className="text-slate-500 text-sm mt-1">Estimasi Laju Filtrasi Glomerulus untuk menilai fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Usia (Tahun)</label>
            <input type="number" value={egfrAge} onChange={e => setEgfrAge(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="misal: 45" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Serum Kreatinin (mg/dL)</label>
            <input type="number" step="0.1" value={egfrCr} onChange={e => setEgfrCr(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="misal: 1.2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Jenis Kelamin</label>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setEgfrGender("male")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${egfrGender === 'male' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}>Laki-laki</button>
              <button onClick={() => setEgfrGender("female")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${egfrGender === 'female' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}>Perempuan</button>
            </div>
          </div>
        </div>

        {egfr > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mt-6">
            <h3 className="text-sm font-bold text-rose-800 uppercase mb-2">Hasil Estimasi</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-rose-600">{egfr.toFixed(1)}</span>
              <span className="text-rose-700 font-bold mb-1">mL/min/1.73m²</span>
            </div>
            <div className="bg-white/60 px-3 py-2 rounded-lg border border-rose-100 inline-block">
              <span className="text-sm font-bold text-rose-900">Stadium CKD: {stage}</span>
            </div>
          </div>
        )}
      
        <ReferenceFooter references={["Inker LA, Schmid CH, Tighiouart H, et al. Estimating glomerular filtration rate from serum creatinine and cystatin C. N Engl J Med. 2012;367(1):20-29. (CKD-EPI 2021 update)"]} />
      </div>
    );
  };

  const renderLabCalculator = () => {
    const labParams = [
      // Elektrolit
      { id: "Na", category: "Elektrolit", label: "Natrium (Na)", unit: "mEq/L", min: 135, max: 145, lowMsg: "Hiponatremia", highMsg: "Hipernatremia", example: "140" },
      { id: "K", category: "Elektrolit", label: "Kalium (K)", unit: "mEq/L", min: 3.5, max: 5.0, lowMsg: "Hipokalemia", highMsg: "Hiperkalemia", example: "4.2" },
      { id: "Cl", category: "Elektrolit", label: "Klorida (Cl)", unit: "mEq/L", min: 98, max: 106, lowMsg: "Hipokloremia", highMsg: "Hiperkloremia", example: "102" },
      { id: "Ca", category: "Elektrolit", label: "Kalsium (Ca) Total", unit: "mg/dL", min: 8.5, max: 10.5, lowMsg: "Hipokalsemia", highMsg: "Hiperkalsemia", example: "9.5" },
      { id: "Mg", category: "Elektrolit", label: "Magnesium (Mg)", unit: "mg/dL", min: 1.7, max: 2.2, lowMsg: "Hipomagnesemia", highMsg: "Hipermagnesemia", example: "2.0" },
      
      // Fungsi Hati
      { id: "AST", category: "Fungsi Hati", label: "AST (SGOT)", unit: "U/L", min: 8, max: 48, lowMsg: "Rendah", highMsg: "Peningkatan (Hepatik/Otot)", example: "25" },
      { id: "ALT", category: "Fungsi Hati", label: "ALT (SGPT)", unit: "U/L", min: 7, max: 55, lowMsg: "Rendah", highMsg: "Peningkatan (Hepatik)", example: "30" },
      { id: "Albumin", category: "Fungsi Hati", label: "Albumin", unit: "g/dL", min: 3.4, max: 5.4, lowMsg: "Hipoalbuminemia", highMsg: "Hiperalbuminemia/Dehidrasi", example: "4.0" },
      
      // Fungsi Ginjal
            // Darah Lengkap (CBC)
      { id: "Hb", category: "Darah Lengkap", label: "Hemoglobin (Hb)", unit: "g/dL", min: 12.0, max: 16.0, lowMsg: "Anemia", highMsg: "Polisitemia", example: "13.5" },
      { id: "Ht", category: "Darah Lengkap", label: "Hematokrit (Ht)", unit: "%", min: 36, max: 50, lowMsg: "Rendah (Anemia/Perdarahan)", highMsg: "Tinggi (Dehidrasi/Polisitemia)", example: "42" },
      { id: "WBC", category: "Darah Lengkap", label: "Leukosit (WBC)", unit: "10^3/µL", min: 4.5, max: 11.0, lowMsg: "Leukopenia (Infeksi virus/Supresi sumsum)", highMsg: "Leukositosis (Infeksi/Inflamasi)", example: "7.5" },
      { id: "PLT", category: "Darah Lengkap", label: "Trombosit (PLT)", unit: "10^3/µL", min: 150, max: 450, lowMsg: "Trombositopenia", highMsg: "Trombositosis", example: "250" },
      
      // Profil Lipid
      { id: "Chol", category: "Profil Lipid", label: "Kolesterol Total", unit: "mg/dL", min: 0, max: 200, lowMsg: "Normal", highMsg: "Hiperkolesterolemia", example: "180" },
      { id: "HDL", category: "Profil Lipid", label: "Kolesterol HDL", unit: "mg/dL", min: 40, max: 100, lowMsg: "Rendah (Risiko Kardiovaskular)", highMsg: "Normal/Baik", example: "55" },
      { id: "LDL", category: "Profil Lipid", label: "Kolesterol LDL", unit: "mg/dL", min: 0, max: 130, lowMsg: "Optimal", highMsg: "Tinggi (Risiko Kardiovaskular)", example: "110" },
      { id: "TG", category: "Profil Lipid", label: "Trigliserida", unit: "mg/dL", min: 0, max: 150, lowMsg: "Normal", highMsg: "Hipertrigliseridemia", example: "120" },
      
      // Gula Darah
      { id: "GDP", category: "Gula Darah", label: "Gula Darah Puasa (GDP)", unit: "mg/dL", min: 70, max: 99, lowMsg: "Hipoglikemia", highMsg: "Prediabetes / Diabetes", example: "90" },
      { id: "GDS", category: "Gula Darah", label: "Gula Darah Sewaktu (GDS)", unit: "mg/dL", min: 70, max: 140, lowMsg: "Hipoglikemia", highMsg: "Curiga Diabetes / Hiperglikemia", example: "115" },
      { id: "HbA1c", category: "Gula Darah", label: "HbA1c", unit: "%", min: 4.0, max: 5.6, lowMsg: "Normal", highMsg: "Prediabetes / Diabetes", example: "5.2" },
      
      { id: "Cr", category: "Fungsi Ginjal", label: "Serum Creatinine", unit: "mg/dL", min: 0.6, max: 1.2, lowMsg: "Rendah", highMsg: "Tinggi (Gangguan Ginjal)", example: "0.9" },
      { id: "BUN", category: "Fungsi Ginjal", label: "BUN (Blood Urea Nitrogen)", unit: "mg/dL", min: 7, max: 20, lowMsg: "Rendah", highMsg: "Tinggi (Uremia/Dehidrasi)", example: "15" }
    ];

    const currentParam = labParams.find(p => p.id === labParam) || labParams[0];
    let interpretation = null;
    const val = parseFloat(labValue);

    if (!isNaN(val)) {
      let status: "Low" | "Normal" | "High" = "Normal";
      let message = "Normal";
      if (val < currentParam.min) { status = "Low"; message = currentParam.lowMsg; }
      else if (val > currentParam.max) { status = "High"; message = currentParam.highMsg; }
      interpretation = { value: val, status, message };
    }
    
    // Group parameters by category
    const groupedParams = labParams.reduce((acc, param) => {
      if (!acc[param.category]) {
        acc[param.category] = [];
      }
      acc[param.category].push(param);
      return acc;
    }, {} as Record<string, typeof labParams>);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-indigo-600" />
            Interpretasi Laboratorium
          </h2>
          <p className="text-slate-500 text-sm mt-1">Evaluasi cepat nilai darah lengkap, elektrolit, profil lipid, gula darah, fungsi hati, dan fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Parameter Lab</label>
              <select 
                value={labParam} 
                onChange={e => { setLabParam(e.target.value); setLabValue(""); }}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700 shadow-xs"
              >
                {Object.entries(groupedParams).map(([category, params]) => (
                  <optgroup key={category} label={category}>
                    {params.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nilai ({currentParam.unit})</label>
              <input 
                type="number" 
                step="0.1" 
                value={labValue} 
                onChange={e => setLabValue(e.target.value)} 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-xs" 
                placeholder={`Contoh: ${currentParam.example}`} 
              />
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col justify-center min-h-[160px]">
            <h3 className="text-sm font-bold text-indigo-800 text-center mb-4">Hasil Interpretasi</h3>
            
            {interpretation ? (
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                interpretation.status === 'Normal' ? 'bg-emerald-50 border-emerald-200' :
                interpretation.status === 'Low' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="mb-2">
                  <span className={`text-3xl font-black ${
                    interpretation.status === 'Normal' ? 'text-emerald-700' :
                    interpretation.status === 'Low' ? 'text-amber-700' : 'text-rose-700'
                  }`}>{interpretation.value}</span>
                  <span className="text-sm font-semibold ml-1 text-slate-600">{currentParam.unit}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-md text-sm font-bold inline-block ${
                  interpretation.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                  interpretation.status === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {interpretation.message}
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  Nilai Rujukan: {currentParam.min} - {currentParam.max} {currentParam.unit}
                </div>
              </div>
            ) : (
              <div className="border border-indigo-100 border-dashed rounded-xl p-4 bg-white/60">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Masukkan nilai hasil laboratorium untuk melihat interpretasi klinis sesuai nilai rujukan standar.
                </p>
              </div>
            )}
          </div>
        </div>

        <ReferenceFooter references={["Kementerian Kesehatan RI / Panduan Praktik Klinis / Referensi Nilai Laboratorium Standar Nasional.", "Fauci AS, et al. Harrison's Principles of Internal Medicine. 20th ed. McGraw-Hill Education; 2018.", "Kratz A, Ferraro M, Sluss PM, Lewandrowski KB. Case records of the Massachusetts General Hospital. Normal reference laboratory values. N Engl J Med. 2004;351(15):1548-1563."]} />
      </div>
    );
  };

  const renderBMICalculator = () => {
    let bmi = 0;
    let ibw = 0;
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight);
    
    if (w > 0 && h > 0) {
      bmi = w / Math.pow(h / 100, 2);
      if (bmiGender === "male") {
        ibw = 50 + 0.91 * (h - 152.4);
      } else {
        ibw = 45.5 + 0.91 * (h - 152.4);
      }
    }

    let category = "";
    if (bmi > 0) {
      if (bmi < 18.5) category = "Kurus (Underweight)";
      else if (bmi < 25) category = "Normal";
      else if (bmi < 30) category = "Berat Badan Lebih (Overweight)";
      else category = "Obesitas";
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">BMI & Ideal Body Weight (IBW)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select value={bmiGender} onChange={(e) => setBmiGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
            <input type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 170" />
          </div>

          {bmi > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Perhitungan:</p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-700 font-semibold">BMI:</span>
                <span className="text-2xl font-black text-emerald-700">{bmi.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg/m²</span></span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-4 text-right">{category}</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">Berat Badan Ideal (IBW):</span>
                <span className="text-xl font-bold text-slate-800">{ibw.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["World Health Organization (WHO). Obesity: preventing and managing the global epidemic. Report of a WHO consultation. World Health Organ Tech Rep Ser. 2000;894:i-xii, 1-253.", "Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655. (IBW formula)"]} />
      </div>
    );
  };

  const renderCrClCalculator = () => {
    let crcl = 0;
    const a = parseFloat(crclAge);
    const w = parseFloat(crclWeight);
    const c = parseFloat(crclCr);
    
    if (a > 0 && w > 0 && c > 0) {
      crcl = ((140 - a) * w) / (72 * c);
      if (crclGender === "female") crcl *= 0.85;
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Creatinine Clearance (Cockcroft-Gault)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select value={crclGender} onChange={(e) => setCrclGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Usia (Tahun)</label>
            <input type="number" value={crclAge} onChange={(e) => setCrclAge(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 60" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={crclWeight} onChange={(e) => setCrclWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kreatinin Serum (mg/dL)</label>
            <input type="number" value={crclCr} onChange={(e) => setCrclCr(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 1.2" />
          </div>

          {crcl > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Estimasi LFG (eGFR):</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">CrCl:</span>
                <span className="text-2xl font-black text-amber-600">{crcl.toFixed(1)} <span className="text-sm text-slate-500 font-normal">mL/min</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41."]} />
      </div>
    );
  };

  const renderBSACalculator = () => {
    let bsa = 0;
    const w = parseFloat(bsaWeight);
    const h = parseFloat(bsaHeight);
    
    if (w > 0 && h > 0) {
      bsa = Math.sqrt((w * h) / 3600);
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Body Surface Area (Mosteller)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
            <input type="number" value={bsaHeight} onChange={(e) => setBsaHeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 170" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={bsaWeight} onChange={(e) => setBsaWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>

          {bsa > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Luas Permukaan Tubuh:</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">BSA:</span>
                <span className="text-2xl font-black text-emerald-600">{bsa.toFixed(2)} <span className="text-sm text-slate-500 font-normal">m²</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098."]} />
      </div>
    );
  };

  const renderGCSCalculator = () => {
    const total = gcsEye + gcsVerbal + gcsMotor;
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Glasgow Coma Scale (GCS)</h3>
        <div className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Mata (Eye - E)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsEye(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Spontan buka mata</button>
              <button onClick={() => setGcsEye(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Buka mata terhadap suara/perintah</button>
              <button onClick={() => setGcsEye(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Buka mata terhadap rangsang nyeri</button>
              <button onClick={() => setGcsEye(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Verbal (Verbal - V)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsVerbal(5)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 5 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>5 - Orientasi baik (waktu, tempat, orang)</button>
              <button onClick={() => setGcsVerbal(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Bingung, bicara mengacau (confused)</button>
              <button onClick={() => setGcsVerbal(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Kata-kata tidak bermakna (inappropriate)</button>
              <button onClick={() => setGcsVerbal(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Suara mengerang (incomprehensible)</button>
              <button onClick={() => setGcsVerbal(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Motorik (Motor - M)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsMotor(6)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 6 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>6 - Mengikuti perintah</button>
              <button onClick={() => setGcsMotor(5)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 5 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>5 - Melokalisir nyeri</button>
              <button onClick={() => setGcsMotor(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Menghindari nyeri (withdrawal)</button>
              <button onClick={() => setGcsMotor(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Fleksi abnormal (dekortikasi)</button>
              <button onClick={() => setGcsMotor(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Ekstensi abnormal (deserebrasi)</button>
              <button onClick={() => setGcsMotor(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          
          <div className="mt-6 bg-slate-900 text-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-slate-300 mb-1">Skor GCS Total:</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-teal-400">{total}</span>
              <span className="text-sm font-medium px-3 py-1 bg-white/20 rounded-full">E{gcsEye} V{gcsVerbal} M{gcsMotor}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {total >= 13 ? "Cedera Otak Ringan" : total >= 9 ? "Cedera Otak Sedang" : "Cedera Otak Berat (Koma, pertimbangkan intubasi)"}
            </p>
          </div>
        </div>
      
        <ReferenceFooter references={["Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84."]} />
      </div>
    );
  };

  const renderApgarCalculator = () => {
    const total = apgarColor + apgarHeart + apgarReflex + apgarMuscle + apgarRespiration;
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">APGAR Score</h3>
        <div className="space-y-6 max-w-xl">
          {[
            { label: "Warna Kulit (Appearance)", state: apgarColor, set: setApgarColor, options: ["Pucat/Biru seluruh tubuh (0)", "Tubuh merah, ekstremitas biru (1)", "Seluruh tubuh kemerahan (2)"] },
            { label: "Denyut Jantung (Pulse)", state: apgarHeart, set: setApgarHeart, options: ["Tidak ada (0)", "< 100 x/menit (1)", "> 100 x/menit (2)"] },
            { label: "Refleks (Grimace)", state: apgarReflex, set: setApgarReflex, options: ["Tidak ada respon (0)", "Meringis saat distimulasi (1)", "Menangis kuat/batuk (2)"] },
            { label: "Tonus Otot (Activity)", state: apgarMuscle, set: setApgarMuscle, options: ["Lemah/Lumpuh (0)", "Sedikit fleksi ekstremitas (1)", "Gerak aktif (2)"] },
            { label: "Pernapasan (Respiration)", state: apgarRespiration, set: setApgarRespiration, options: ["Tidak bernapas (0)", "Lambat, tidak teratur, merintih (1)", "Menangis kuat (2)"] },
          ].map((item, i) => (
            <div key={i}>
              <label className="block text-sm font-bold text-slate-800 mb-2">{item.label}</label>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {item.options.map((opt, val) => (
                  <button key={val} onClick={() => item.set(val)} className={`p-3 text-left border rounded-lg transition-colors ${item.state === val ? "bg-pink-50 border-pink-500 text-pink-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <p className="text-sm text-slate-500 mb-1">Skor Total:</p>
             <div className="flex items-center gap-4 mb-2">
               <span className="text-4xl font-black text-pink-600">{total}</span>
             </div>
             <p className="text-sm font-semibold text-slate-700">
               {total >= 7 ? "Normal / Bugar" : total >= 4 ? "Asfiksia Sedang (Butuh resusitasi sedang)" : "Asfiksia Berat (Butuh resusitasi segera)"}
             </p>
          </div>
        </div>
      
        <ReferenceFooter references={["Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.", "American Academy of Pediatrics, Committee on Fetus and Newborn; American College of Obstetricians and Gynecologists and Committee on Obstetric Practice. The Apgar Score. Pediatrics. 2015;136(4):819-822."]} />
      </div>
    );
  };

  const renderCha2ds2vasc = () => {
    let score = 0;
    if (chaAge === "65to74") score += 1;
    if (chaAge === "75over") score += 2;
    if (chaGender === "female") score += 1;
    if (chaCHF) score += 1;
    if (chaHTN) score += 1;
    if (chaStroke) score += 2;
    if (chaVascular) score += 1;
    if (chaDiabetes) score += 1;

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">CHA₂DS₂-VASc Score</h3>
        <p className="text-sm text-slate-500 mb-6">Risiko Stroke pada pasien Fibrilasi Atrium (Non-valvular)</p>
        <div className="space-y-4 max-w-md">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Usia</label>
             <select value={chaAge} onChange={(e) => setChaAge(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
               <option value="under65">&lt; 65 tahun (0 poin)</option>
               <option value="65to74">65 - 74 tahun (1 poin)</option>
               <option value="75over">≥ 75 tahun (2 poin)</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
             <select value={chaGender} onChange={(e) => setChaGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
               <option value="male">Laki-laki (0 poin)</option>
               <option value="female">Perempuan (1 poin)</option>
             </select>
           </div>
           
           <div className="space-y-3 pt-4 border-t border-slate-100">
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaCHF} onChange={(e) => setChaCHF(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Congestive Heart Failure (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaHTN} onChange={(e) => setChaHTN(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Hipertensi (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaDiabetes} onChange={(e) => setChaDiabetes(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Diabetes Mellitus (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaStroke} onChange={(e) => setChaStroke(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Riwayat Stroke / TIA / Tromboemboli (+2)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaVascular} onChange={(e) => setChaVascular(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Penyakit Vaskular (MI, PAD, plak aorta) (+1)</span>
             </label>
           </div>

           <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <div className="flex justify-between items-end mb-2">
                <span className="text-slate-700 font-semibold">Skor CHA₂DS₂-VASc:</span>
                <span className="text-3xl font-black text-rose-600">{score}</span>
             </div>
             <p className="text-sm text-slate-600 mt-2 font-medium">
               Rekomendasi Antikoagulan: 
               {score === 0 && chaGender === "male" ? " Risiko rendah, tidak perlu antikoagulan oral." : 
                (score === 1 && chaGender === "male") || (score === 2 && chaGender === "female") ? " Pertimbangkan antikoagulan oral atau tanpa terapi." :
                " Direkomendasikan terapi antikoagulan oral (OAC)."}
             </p>
           </div>
        </div>
      
        <ReferenceFooter references={["Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137(2):263-272."]} />
      </div>
    );
  };

  const renderPediatricDoseCalculator = () => {
    // Mode 1: Direct Weight / BSA + Syrup volume
    const tDose = parseFloat(pedTargetDose) || 0;
    const wDir = parseFloat(pedWeightDirect) || 0;
    const hDir = parseFloat(pedHeightDirect) || 0;
    const freq = Math.max(1, parseFloat(pedFreqPerDay) || 1);
    const syrStr = parseFloat(pedSyrupStrength) || 0;
    const syrVol = parseFloat(pedSyrupVol) || 0;

    const bsaChild = wDir > 0 && hDir > 0 ? Math.sqrt((wDir * hDir) / 3600) : 0;
    const singleDoseMg =
      pedDoseMethod === "mg_kg"
        ? tDose > 0 && wDir > 0
          ? tDose * wDir
          : 0
        : tDose > 0 && bsaChild > 0
        ? tDose * bsaChild
        : 0;
    const dailyDoseMg = singleDoseMg * freq;
    const syrupMlPerDose = singleDoseMg > 0 && syrStr > 0 && syrVol > 0 ? (singleDoseMg / syrStr) * syrVol : 0;

    // Mode 2: Classical Empirical formulas
    let young = 0;
    let dilling = 0;
    let fried = 0;
    let clark = 0;

    const adultDose = parseFloat(pedAdultDose);
    const ageMonths = parseFloat(pedAgeMonths);
    const weight = parseFloat(pedWeight);

    if (adultDose > 0) {
      if (ageMonths > 0) {
        const ageYears = ageMonths / 12;
        young = (ageYears / (ageYears + 12)) * adultDose;
        dilling = (ageYears / 20) * adultDose;
        fried = (ageMonths / 150) * adultDose;
      }
      if (weight > 0) {
        clark = (weight / 70) * adultDose;
      }
    }

    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <div className="text-xs font-medium text-teal-700 mb-1">Kalkulator Klinis &amp; Dosis Obat</div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Konversi &amp; Perhitungan Dosis Anak</h3>
          <p className="text-sm text-slate-600 mt-1">
            Menghitung takaran obat pediatrik berdasarkan berat badan (mg/kgBB), luas permukaan tubuh (mg/m²), konversi volume sediaan cair (mL), atau konversi empiris dari dosis dewasa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setPedTab("weight_bsa")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              pedTab === "weight_bsa" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Berdasarkan BB / BSA &amp; Sediaan Sirup
          </button>
          <button
            type="button"
            onClick={() => setPedTab("empirical")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              pedTab === "empirical" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Konversi Dosis Dewasa (Clark / Young / Dilling / Fried)
          </button>
        </div>

        {pedTab === "weight_bsa" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Basis Perhitungan</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPedDoseMethod("mg_kg")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg ${
                      pedDoseMethod === "mg_kg" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Berat Badan (mg/kgBB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPedDoseMethod("mg_m2")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg ${
                      pedDoseMethod === "mg_m2" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Luas Permukaan Tubuh (mg/m²)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Dosis Anjuran ({pedDoseMethod === "mg_kg" ? "mg/kgBB/kali" : "mg/m²/kali"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pedTargetDose}
                    onChange={(e) => setPedTargetDose(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Frekuensi / Hari (×)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={pedFreqPerDay}
                    onChange={(e) => setPedFreqPerDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan Anak (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pedWeightDirect}
                    onChange={(e) => setPedWeightDirect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tinggi Badan (cm){pedDoseMethod === "mg_m2" ? " — Wajib" : " — Opsional"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pedHeightDirect}
                    onChange={(e) => setPedHeightDirect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">Konversi Sediaan Sirup / Suspensi</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Kekuatan Sediaan (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={pedSyrupStrength}
                      onChange={(e) => setPedSyrupStrength(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                      placeholder="mis. 120"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Per Volume (mL)</label>
                    <input
                      type="number"
                      step="any"
                      value={pedSyrupVol}
                      onChange={(e) => setPedSyrupVol(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                      placeholder="mis. 5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              {singleDoseMg > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="text-xs font-medium text-slate-600 mb-1">Dosis Tunggal (1× Pakai)</div>
                      <div className="text-3xl font-bold font-mono tabular-nums text-emerald-800">
                        {singleDoseMg.toFixed(1)} <span className="text-xs font-normal text-slate-500">mg</span>
                      </div>
                      <div className="text-xs text-emerald-700 mt-1">
                        Total harian ({freq}×/hr): {dailyDoseMg.toFixed(1)} mg/hari
                      </div>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                      <div className="text-xs font-medium text-slate-600 mb-1">Volume Takaran Sirup</div>
                      <div className="text-3xl font-bold font-mono tabular-nums text-sky-800">
                        {syrupMlPerDose > 0 ? syrupMlPerDose.toFixed(2) : "—"} <span className="text-xs font-normal text-slate-500">mL</span>
                      </div>
                      <div className="text-xs text-sky-700 mt-1">
                        {syrupMlPerDose > 0 ? `≈ ${(syrupMlPerDose / 5).toFixed(2)} sendok takar (5 mL)` : "Isi konsentrasi sediaan"}
                      </div>
                    </div>
                  </div>
                  {bsaChild > 0 && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 font-mono">
                      BSA Anak (Mosteller): <strong className="text-slate-900">{bsaChild.toFixed(2)} m²</strong> · Sediaan: {syrStr} mg / {syrVol} mL
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
                  Masukkan dosis anjuran dan berat badan (serta tinggi badan bila menggunakan basis mg/m²) untuk melihat hasil perhitungan.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dosis Dewasa (mg)</label>
              <input type="number" value={pedAdultDose} onChange={(e) => setPedAdultDose(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Misal: 500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Usia Anak (Bulan)</label>
              <input type="number" value={pedAgeMonths} onChange={(e) => setPedAgeMonths(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Misal: 24 (2 tahun)" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Berat Badan Anak (kg)</label>
              <input type="number" value={pedWeight} onChange={(e) => setPedWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Misal: 12" />
            </div>

            {(young > 0 || clark > 0) && (
              <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs text-slate-500 font-semibold">Hasil Estimasi Rumus Klasik:</p>
                {clark > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-sm text-slate-800 font-semibold">Rumus Clark</span>
                      <span className="text-xs text-slate-500">Berdasarkan Berat Badan (BB / 70 × Dosis Dewasa)</span>
                    </div>
                    <span className="text-xl font-bold font-mono tabular-nums text-purple-700">{clark.toFixed(2)}</span>
                  </div>
                )}
                {young > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-sm text-slate-800 font-semibold">Rumus Young</span>
                      <span className="text-xs text-slate-500">Usia 1–12 Tahun</span>
                    </div>
                    <span className="text-xl font-bold font-mono tabular-nums text-purple-700">{young.toFixed(2)}</span>
                  </div>
                )}
                {dilling > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-sm text-slate-800 font-semibold">Rumus Dilling</span>
                      <span className="text-xs text-slate-500">Usia ≥ 8 Tahun</span>
                    </div>
                    <span className="text-xl font-bold font-mono tabular-nums text-purple-700">{dilling.toFixed(2)}</span>
                  </div>
                )}
                {fried > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-sm text-slate-800 font-semibold">Rumus Fried</span>
                      <span className="text-xs text-slate-500">Bayi &lt; 2 Tahun (Usia bulan / 150)</span>
                    </div>
                    <span className="text-xl font-bold font-mono tabular-nums text-purple-700">{fried.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <ReferenceFooter references={["Taketomo CK, Hodding JH, Kraus DM. Pediatric & Neonatal Dosage Handbook. 26th ed. Lexicomp; 2019-2020.", "Kliegman RM, St. Geme JW, Blum NJ, Shah SS, Tasker RC, Wilson KM. Nelson Textbook of Pediatrics. 21st ed. Elsevier; 2020."]} />
      </div>
    );
  };

  const renderChemoCalculator = () => {
    let bmi = 0;
    let bsa = 0;
    let bsaDuBois = 0;
    let gfrNormal = 0;
    let gfrObese = 0;
    let ibw = 0;
    let abw = 0;

    const age = parseFloat(chemoAge) || 0;
    const weight = parseFloat(chemoWeight) || 0;
    const height = parseFloat(chemoHeight) || 0;
    const cr = parseFloat(chemoCr) || 0;
    const auc = parseFloat(chemoAUC) || 5;
    const beva = parseFloat(chemoBeva) || 7.5;

    // Resolve active regimen
    const currentRegimenId = 
      chemoRegimen === "ginekologi" ? "tc_gyn" :
      chemoRegimen === "payudara" ? "ac_act" :
      chemoRegimen === "serviks" ? "cisplatin_cervix" :
      chemoRegimen;

    const selectedRegimen = CHEMO_REGIMENS_DATA.find(r => r.id === currentRegimenId) || CHEMO_REGIMENS_DATA[0];

    // Check if regimen has Carboplatin or Bevacizumab
    const hasCarboplatin = selectedRegimen.components.some(c => c.doseUnit === "AUC" || c.drugId.toLowerCase().includes("carboplatin"));
    const hasBevacizumab = selectedRegimen.components.some(c => c.drugId.toLowerCase().includes("bevacizumab"));

    if (age > 0 && weight > 0 && height > 0 && cr > 0) {
      // IMT (BMI)
      bmi = weight / Math.pow(height / 100, 2);
      
      // LPT Mosteller: sqrt((W * H) / 3600)
      bsa = Math.sqrt((weight * height) / 3600);

      // LPT Du Bois: 0.007184 * W^0.425 * H^0.725
      bsaDuBois = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

      // Devine IBW
      const genderFactor = chemoGender === "female" ? 0.85 : 1.0;
      ibw = (chemoGender === "female" ? 45.5 : 50.0) + 2.3 * (height / 2.54 - 60);
      
      // Adjusted Body Weight for Obese (if actual weight > 120% IBW)
      abw = ibw > 0 ? ibw + 0.4 * (Math.max(weight, ibw) - ibw) : weight;

      // Cockcroft-Gault GFR Normal
      gfrNormal = ((140 - age) * weight) / (72 * cr) * genderFactor;

      // Cockcroft-Gault GFR Obese/Adjusted
      gfrObese = ((140 - age) * abw) / (72 * cr) * genderFactor;
    }

    // Effective GFR capped at 125 mL/min for Calvert formula
    const effectiveCrCl = Math.min(gfrNormal > 0 ? gfrNormal : 0, 125);

    // Calculated doses for each drug component in current regimen
    const calculatedComponents = selectedRegimen.components.map(comp => {
      let calculatedDose = 0;
      let standardDose = 0;
      let unit = "mg";
      let calculationFormulaStr = "";
      let ceilingWarning = "";

      if (comp.doseUnit === "mg/m2") {
        standardDose = bsa * comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `${bsa.toFixed(2)} m² × ${comp.defaultDoseValue} mg/m²`;

        // Clinical caps check
        if (comp.drugId.toLowerCase().includes("vinblastin") && calculatedDose > 10) {
          ceilingWarning = "Plafon Maksimal: 10 mg/dosis per pemberian (Kurangi ke 10 mg)";
        }
        if (comp.drugId.toLowerCase().includes("vincristin") && calculatedDose > 2.0) {
          ceilingWarning = "Plafon Maksimal: 2.0 mg/dosis untuk cegah paralisis/neurotoksisitas fatal!";
        }
        if (selectedRegimen.id === "cisplatin_cervix" && calculatedDose > 70) {
          ceilingWarning = "Plafon Maksimal: 70 mg/minggu pada CCRT Serviks";
        }
      } else if (comp.doseUnit === "unit/m2") {
        standardDose = bsa * comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "unit";
        calculationFormulaStr = `${bsa.toFixed(2)} m² × ${comp.defaultDoseValue} unit/m²`;
      } else if (comp.doseUnit === "unit_flat") {
        standardDose = comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "unit";
        calculationFormulaStr = `Dosis flat ${comp.defaultDoseValue} unit`;
      } else if (comp.doseUnit === "mg/kg") {
        const factor = comp.drugId.toLowerCase().includes("bevacizumab") ? beva : comp.defaultDoseValue;
        standardDose = weight * factor;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `${weight} kg × ${factor} mg/kgBB`;
      } else if (comp.doseUnit === "mcg/kg") {
        standardDose = weight * comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mcg";
        calculationFormulaStr = `${weight} kg × ${comp.defaultDoseValue} mcg/kgBB`;
      } else if (comp.doseUnit === "AUC") {
        // Formula Calvert: Dose = AUC * (CrCl + 25)
        standardDose = auc * (effectiveCrCl + 25);
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `AUC ${auc} × (${effectiveCrCl.toFixed(1)} mL/min [Cap 125] + 25)`;
      } else if (comp.doseUnit === "mg_flat") {
        standardDose = comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `Dosis flat ${comp.defaultDoseValue} mg`;
      }

      return {
        ...comp,
        standardDose,
        calculatedDose,
        unit,
        calculationFormulaStr,
        ceilingWarning
      };
    });

    const handleReset = () => {
      setChemoAge("");
      setChemoWeight("");
      setChemoHeight("");
      setChemoCr("");
      setChemoAUC("5");
      setChemoBeva("7.5");
      setChemoDosePercent(100);
      setChemoHasCalculated(false);
    };

    const handlePresetPatient = () => {
      setChemoGender("female");
      setChemoAge("45");
      setChemoWeight("52");
      setChemoHeight("155");
      setChemoCr("0.85");
      setChemoAUC("5");
      setChemoBeva("7.5");
      setChemoDosePercent(100);
      setChemoHasCalculated(true);
    };

    const handleCopyClinicalSummary = () => {
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const lines = [
        `=== RESUMEN KALKULASI DOSIS KEMOTERAPI RSUD PALEMBANG BARI ===`,
        `Tanggal: ${dateStr}`,
        `Protokol: ${selectedRegimen.acronym} - ${selectedRegimen.fullName}`,
        `Indikasi: ${selectedRegimen.cancerTypeDetail}`,
        `Tujuan Terapi: ${selectedRegimen.primaryGoalHighlight}`,
        `--------------------------------------------------`,
        `DATA ANTROPOMETRI & FUNGSI GINJAL PASIEN:`,
        `- Gender: ${chemoGender === "female" ? "Perempuan" : "Laki-laki"}, Usia: ${chemoAge} tahun`,
        `- BB: ${chemoWeight} kg | TB: ${chemoHeight} cm`,
        `- IMT (BMI): ${bmi.toFixed(2)} kg/m²`,
        `- LPT (Mosteller): ${bsa.toFixed(2)} m² | Du Bois: ${bsaDuBois.toFixed(2)} m²`,
        `- Serum Kreatinin: ${chemoCr} mg/dL`,
        `- CrCl (Cockcroft-Gault): ${gfrNormal.toFixed(2)} mL/min (Capped Calvert: ${effectiveCrCl.toFixed(2)} mL/min)`,
        `- Penyesuaian Dosis (Dose Modification): ${chemoDosePercent}%`,
        `--------------------------------------------------`,
        `DOSIS OBAT TERHITUNG:`,
        ...calculatedComponents.map(c => 
          `• [Urutan #${c.sequenceOrder}] ${c.drugName}: ${Math.round(c.calculatedDose)} ${c.unit} (${c.calculationFormulaStr}) | Pelarut: ${c.diluentStandard} | Rute: ${c.adminRoute}${c.ceilingWarning ? ` [PERINGATAN: ${c.ceilingWarning}]` : ''}`
        ),
        `--------------------------------------------------`,
        `URUTAN PEMBILASAN & FLUSH:`,
        `Wajib pembilasan dengan NaCl 0.9% minimal 20-50 mL di antara setiap obat sitostatika untuk mencegah presipitasi/inkompatibilitas.`,
        `Referensi: ${selectedRegimen.references}`
      ];

      navigator.clipboard.writeText(lines.join("\n"));
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    };

    // Filtered regimens for dropdown selection (by category + search query)
    const filteredRegimensList = CHEMO_REGIMENS_DATA.filter(r => {
      if (chemoCategoryFilter !== "all" && r.cancerCategory !== chemoCategoryFilter) {
        return false;
      }
      if (chemoSearchQuery.trim()) {
        const q = chemoSearchQuery.trim().toLowerCase();
        return (
          r.acronym.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.cancerTypeDetail.toLowerCase().includes(q) ||
          r.cancerCategoryLabel.toLowerCase().includes(q) ||
          r.components.some(
            c =>
              c.drugName.toLowerCase().includes(q) ||
              (c.genericAlias && c.genericAlias.toLowerCase().includes(q))
          )
        );
      }
      return true;
    });

    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs w-full">
        {/* Header Kalkulator Kemoterapi */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 text-white border-b border-teal-800/40 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-teal-500/20 border border-teal-400/30 text-teal-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Kalkulator Dosis Onkologi & Protokol Kanker
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {CHEMO_REGIMENS_DATA.length} Regimen Kemoterapi Klinis
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-400" />
                Kalkulator Kemoterapi Dewasa
              </h3>
              <p className="text-xs md:text-sm text-teal-100/80 max-w-2xl">
                Kalkulasi dosis individual berdasarkan Luas Permukaan Tubuh (Mosteller & Du Bois), formula Calvert (AUC Carboplatin), Klirens Kreatinin Cockcroft-Gault, dan panduan sekuens pemberian.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePresetPatient}
                className="px-3 py-1.5 bg-teal-800/60 hover:bg-teal-700/60 border border-teal-600/40 text-teal-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Isi otomatis data contoh pasien (Wanita 45 th, 52 kg, 155 cm)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preset Contoh
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/40 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* SECTION 1: Pemilihan Regimen Kemoterapi */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Pilih Regimen Kemoterapi ({filteredRegimensList.length} / {CHEMO_REGIMENS_DATA.length})
              </label>

              {/* Category Quick Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px] flex-wrap">
                {[
                  { id: "all", label: "Semua" },
                  { id: "limfoma", label: "Limfoma" },
                  { id: "leukemia", label: "Leukemia & MDS" },
                  { id: "mieloma", label: "Mieloma" },
                  { id: "payudara", label: "Payudara" },
                  { id: "kolorektal", label: "GI & Kolorektal" },
                  { id: "paru", label: "Paru" },
                  { id: "urogenital", label: "Testis & Urologi" },
                  { id: "ginekologi", label: "Ginekologi" },
                  { id: "sarkoma_pediatri", label: "Sarkoma, Otak & Pediatri" },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setChemoCategoryFilter(cat.id);
                      const firstMatch = CHEMO_REGIMENS_DATA.find(r =>
                        cat.id === "all" ? true : r.cancerCategory === cat.id
                      );
                      if (firstMatch && cat.id !== "all") {
                        setChemoRegimen(firstMatch.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      chemoCategoryFilter === cat.id
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Search Bar for 100+ Regimens */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={chemoSearchQuery}
                onChange={(e) => {
                  const nextQuery = e.target.value;
                  setChemoSearchQuery(nextQuery);
                  if (nextQuery.trim()) {
                    const q = nextQuery.trim().toLowerCase();
                    const firstHit = CHEMO_REGIMENS_DATA.find(
                      r =>
                        (chemoCategoryFilter === "all" || r.cancerCategory === chemoCategoryFilter) &&
                        (r.acronym.toLowerCase().includes(q) ||
                          r.fullName.toLowerCase().includes(q) ||
                          r.cancerTypeDetail.toLowerCase().includes(q) ||
                          r.components.some(
                            c =>
                              c.drugName.toLowerCase().includes(q) ||
                              (c.genericAlias && c.genericAlias.toLowerCase().includes(q))
                          ))
                    );
                    if (firstHit) setChemoRegimen(firstHit.id);
                  }
                }}
                placeholder="Cari cepat regimen (7+3, ABVD, BEP, CAPOX, FLOT, FOLFIRINOX, R-Benda, CYBORD, VTD-PACE...), kanker, atau nama obat..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
              {chemoSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChemoSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Regimen */}
            <div className="relative">
              <select
                value={
                  filteredRegimensList.some(r => r.id === currentRegimenId)
                    ? currentRegimenId
                    : filteredRegimensList[0]?.id || currentRegimenId
                }
                onChange={(e) => {
                  setChemoRegimen(e.target.value);
                  setChemoHasCalculated(true);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-xs cursor-pointer"
              >
                {filteredRegimensList.length === 0 ? (
                  <option value={currentRegimenId}>
                    Tidak ada regimen cocok dengan kata kunci &quot;{chemoSearchQuery}&quot;
                  </option>
                ) : (
                  filteredRegimensList.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      [{reg.cancerCategoryLabel.toUpperCase()}] {reg.acronym} — {reg.fullName}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Regimen Info Chipset */}
            <div className="bg-white border border-teal-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                  {selectedRegimen.acronym}
                </span>
                <span className="text-slate-600 font-medium">
                  {selectedRegimen.cancerTypeDetail}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  {selectedRegimen.primaryGoalHighlight.split('(')[0].trim()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {selectedRegimen.cycleProtocol}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Input Parameter Pasien */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-teal-600" />
                Data Antropometri & Parameter Klinis Pasien
              </h4>
              <span className="text-[11px] text-slate-400">Parameter Cockcroft-Gault & Mosteller</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Gender */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChemoGender("female")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chemoGender === "female" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Wanita (0.85)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemoGender("male")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chemoGender === "male" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pria (1.0)
                  </button>
                </div>
              </div>

              {/* Usia */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Usia (tahun)</label>
                <input
                  type="number"
                  value={chemoAge}
                  onChange={(e) => setChemoAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 45"
                />
              </div>

              {/* Berat Badan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  value={chemoWeight}
                  onChange={(e) => setChemoWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 50"
                />
              </div>

              {/* Tinggi Badan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  value={chemoHeight}
                  onChange={(e) => setChemoHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 150"
                />
              </div>

              {/* Serum Kreatinin */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Serum Kreatinin (mg/dL)</label>
                <input
                  type="number"
                  step="0.05"
                  value={chemoCr}
                  onChange={(e) => setChemoCr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 0.9"
                />
              </div>
            </div>

            {/* Parameter Khusus Regimen (Carboplatin AUC / Bevacizumab / Reduksi Dosis) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
              {hasCarboplatin && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-900">Target AUC Carboplatin</label>
                    <span className="text-[10px] text-amber-700 font-semibold">Rumus Calvert</span>
                  </div>
                  <select
                    value={chemoAUC}
                    onChange={(e) => setChemoAUC(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="4">Target AUC 4 (Lanjut Usia / Mielosupresi)</option>
                    <option value="5">Target AUC 5 (Standar Kombinasi)</option>
                    <option value="6">Target AUC 6 (Monoterapi / Dosis Maksimal)</option>
                    <option value="7">Target AUC 7</option>
                  </select>
                  <p className="text-[10px] text-amber-700 mt-1">
                    *GFR dibatasi (capped) maksimal 125 mL/min per rekomendasi ASCO/FDA.
                  </p>
                </div>
              )}

              {hasBevacizumab && (
                <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-indigo-900">Dosis Bevacizumab</label>
                    <span className="text-[10px] text-indigo-700 font-semibold">Anti-VEGF</span>
                  </div>
                  <select
                    value={chemoBeva}
                    onChange={(e) => setChemoBeva(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="7.5">7,5 mg/kgBB (Siklus 3 Mingguan - ICON7)</option>
                    <option value="15">15 mg/kgBB (Siklus 3 Mingguan - GOG-0218)</option>
                    <option value="0">0 mg/kgBB (Tanpa Bevacizumab / TC Murni)</option>
                  </select>
                  <p className="text-[10px] text-indigo-700 mt-1">
                    *Wajib pelarut NaCl 0.9%; dilarang glukosa/dextrose!
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Modifikasi / Reduksi Dosis</label>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                    chemoDosePercent < 100 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {chemoDosePercent}% Dosis
                  </span>
                </div>
                <select
                  value={chemoDosePercent}
                  onChange={(e) => setChemoDosePercent(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value={100}>100% (Dosis Penuh / Siklus Pertama)</option>
                  <option value={85}>85% (Reduksi Ringan - Toksisitas Grade 2)</option>
                  <option value={80}>80% (Reduksi Standar Toksisitas Hematologi)</option>
                  <option value={75}>75% (Reduksi Sedang - Gangguan Fungsi Organ)</option>
                  <option value={65}>65% (Reduksi Berat - Neuropati / Mielosupresi Lanjut)</option>
                  <option value={50}>50% (Dosis Minimal Toleransi)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  *Untuk penyesuaian pada trombositopenia, neutropenia, atau kelainan organ.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChemoHasCalculated(true)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                Hitung Dosis Regimen ({selectedRegimen.acronym})
              </button>
            </div>
          </div>

          {/* SECTION 3: HASIL PERHITUNGAN */}
          {chemoHasCalculated && bmi > 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Patient Parameter Cards */}
              <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50 border border-teal-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/60 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      Hasil Parameter Klinis & Antropometri Pasien
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyClinicalSummary}
                      className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-teal-300 text-teal-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-teal-600" />
                          <span>Salin Catatan Klinis / CPPT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* BSA Mosteller */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LPT / BSA (Mosteller)</p>
                    <p className="text-2xl font-black text-teal-800 mt-1">
                      {bsa.toFixed(2)} <span className="text-xs font-bold text-slate-500">m²</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Du Bois: {bsaDuBois.toFixed(2)} m²
                    </p>
                  </div>

                  {/* IMT / BMI */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Indeks Massa Tubuh (IMT)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {bmi.toFixed(2)} <span className="text-xs font-bold text-slate-500">kg/m²</span>
                    </p>
                    <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                      {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Gizi Normal" : bmi < 30 ? "Overweight" : "Obesitas"} (IBW: {ibw > 0 ? ibw.toFixed(1) : "-"} kg)
                    </p>
                  </div>

                  {/* CrCl Cockcroft-Gault */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CrCl (Cockcroft-Gault)</p>
                    <p className="text-2xl font-black text-teal-700 mt-1">
                      {gfrNormal.toFixed(1)} <span className="text-xs font-bold text-slate-500">mL/min</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Faktor Gender: {chemoGender === "female" ? "0.85 (Wanita)" : "1.0 (Pria)"}
                    </p>
                  </div>

                  {/* CrCl Capped Calvert */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CrCl Calvert (Capped 125)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {effectiveCrCl.toFixed(1)} <span className="text-xs font-bold text-slate-500">mL/min</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {gfrNormal > 125 ? "⚠️ Nilai dibatasi plafon 125" : "Nilai aktual digunakan"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: "drugs", label: "Dosis Obat Terhitung", icon: Pill },
                  { id: "sequence", label: "Urutan Pemberian & Flush", icon: Clock },
                  { id: "premed", label: "Premedikasi & Antiemetik", icon: ShieldCheck },
                  { id: "vital", label: "Hidrasi & Toksisitas Organ", icon: AlertTriangle }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChemoActiveTab(tab.id as any)}
                      className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        chemoActiveTab === tab.id
                          ? "border-teal-600 text-teal-800 bg-teal-50/40 rounded-t-lg"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: DAFTAR DOSIS OBAT TERHITUNG */}
              {chemoActiveTab === "drugs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Komponen Regimen ({calculatedComponents.length} Obat Sitostatika/Biologis):</span>
                    {chemoDosePercent < 100 && (
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        *Dosis telah diturunkan menjadi {chemoDosePercent}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculatedComponents.map((comp) => (
                      <div
                        key={comp.drugId}
                        className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between"
                      >
                        {/* Drug Header & Sequence Badge */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                #{comp.sequenceOrder}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-base leading-tight">
                                  {comp.drugName}
                                </h5>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {comp.role}
                                </p>
                              </div>
                            </div>

                            {/* Extravasation status */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                              comp.vesicantStatus.includes("Vesikan")
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : comp.vesicantStatus.includes("Iritan")
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {comp.vesicantStatus.includes("Vesikan") ? "Vesikant" : comp.vesicantStatus.includes("Iritan") ? "Iritan" : "Non-Vesikant"}
                            </span>
                          </div>

                          {/* Calculated Doses Display */}
                          <div className="bg-teal-50/60 border border-teal-100/80 rounded-xl p-3.5 my-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-semibold text-slate-600">Dosis Terhitung Pasien:</span>
                              <div className="text-right">
                                <span className="text-2xl font-black text-teal-900">
                                  {Math.round(comp.calculatedDose)}
                                </span>
                                <span className="text-sm font-bold text-teal-700 ml-1">
                                  {comp.unit}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>Formula Acuan: {comp.dosageFormula}</span>
                              <span className="font-medium text-teal-800">({comp.calculationFormulaStr})</span>
                            </p>

                            {chemoDosePercent < 100 && (
                              <p className="text-[10px] text-amber-800 mt-1 pt-1 border-t border-teal-200/50">
                                Dosis Standar: {Math.round(comp.standardDose)} {comp.unit} ➔ Reduksi {chemoDosePercent}%: <strong>{Math.round(comp.calculatedDose)} {comp.unit}</strong>
                              </p>
                            )}

                            {comp.ceilingWarning && (
                              <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>{comp.ceilingWarning}</span>
                              </div>
                            )}
                          </div>

                          {/* Administration & Diluent Specs */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-700 min-w-[70px]">Rute & Laju:</span>
                              <span className="text-slate-600">{comp.adminRoute}</span>
                            </div>

                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-700 min-w-[70px]">Pelarut:</span>
                              <span className="text-teal-800 font-medium">{comp.diluentStandard}</span>
                            </div>

                            {comp.diluentForbidden && (
                              <div className="flex items-start gap-1.5 text-rose-700 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200/60">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                                <span>{comp.diluentForbidden}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Special Precaution Note */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                          <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title={comp.specialPrecautions}>
                            <strong className="text-slate-700">Perhatian:</strong> {comp.specialPrecautions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: URUTAN PEMBERIAN & FLUSH */}
              {chemoActiveTab === "sequence" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-base">Panduan Sekuens Infus & Pembilasan Vena (Flush Protocol)</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pemberian sitostatika wajib mengikuti urutan farmakokinetik dan stabilitas pelarut. Pembilasan (flushing) dengan cairan yang kompatibel wajib dilakukan sebelum beralih ke botol obat berikutnya.
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* Step 0: Pre-Hydration & Premed */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        0
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-800">Pre-Hidrasi & Pemberian Premedikasi</p>
                        <p className="text-slate-600">
                          Pasang akses intravena yang paten (verifikasi blood return bebas hambatan). Berikan hidrasi awal dan obat premedikasi (antiemetik, steroid, antihistamin) minimal 30 - 60 menit sebelum sitostatika pertama.
                        </p>
                      </div>
                    </div>

                    {/* Sequential drugs */}
                    {calculatedComponents.map((comp, idx) => (
                      <React.Fragment key={comp.drugId}>
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50/40 border border-teal-200/80">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {comp.sequenceOrder}
                          </div>
                          <div className="text-xs space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-extrabold text-slate-900 text-sm">
                                {comp.drugName} (Dosis Pasien: {Math.round(comp.calculatedDose)} {comp.unit})
                              </p>
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                {comp.adminRoute.split('(')[0]}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium">
                              <strong>Instruksi:</strong> {comp.sequenceNote}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Pelarut: {comp.diluentStandard} | Ekstravasasi: {comp.vesicantStatus}
                            </p>
                          </div>
                        </div>

                        {/* Flush between drugs */}
                        {idx < calculatedComponents.length - 1 && (
                          <div className="flex items-center gap-2 pl-3.5 py-1 text-[11px] font-bold text-teal-700">
                            <Droplets className="w-4 h-4 text-teal-500" />
                            <span>Bilas Jalur Infus (Flush) dengan minimal 20 - 50 mL NaCl 0.9% sebelum obat berikutnya</span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Final Step */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-emerald-900">Post-Hidrasi & Bilas Akhir Saline</p>
                        <p className="text-emerald-800">
                          Bilas tuntas seluruh selang infus dengan minimal 50 - 100 mL NaCl 0.9% untuk memastikan tidak ada sisa sitostatika tertinggal di lumen kateter vena. Observasi tanda vital dan respon ekstravasasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PREMEDIKASI & ANTIEMETIK */}
              {chemoActiveTab === "premed" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-base">Protokol Premedikasi & Profilaksis Emetik</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Protokol baku untuk mencegah mual-muntah akibat kemoterapi (CINV) serta reaksi hipersensitivitas/anafilaksis.
                  </p>

                  <div className="space-y-3 pt-1">
                    {selectedRegimen.premedicationProtocol.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 text-xs space-y-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="text-indigo-950 font-medium leading-relaxed">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRegimen.clinicalPearls && selectedRegimen.clinicalPearls.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Clinical Pearls & Kiat Praktis Onkologi:
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {selectedRegimen.clinicalPearls.map((pearl, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{pearl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HIDRASI & TOKSISITAS ORGAN */}
              {chemoActiveTab === "vital" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-rose-900 mb-1">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <h4 className="font-bold text-base">Toksisitas Organ Kritis & Strategi Pencegahan</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Monitoring organ vital sebelum dan selama pemberian regimen kemoterapi ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRegimen.organToxicities.map((tox, idx) => (
                      <div key={idx} className="bg-rose-50/40 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900">{tox.organ}</span>
                          <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                            {tox.responsibleDrug}
                          </span>
                        </div>
                        <p className="text-slate-700">
                          <strong>Manifestasi:</strong> {tox.manifestation}
                        </p>
                        <p className="text-teal-900 font-medium bg-white/80 p-2 rounded-lg border border-rose-100">
                          <strong>Pencegahan:</strong> {tox.preventionStrategy}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-teal-600" />
                      Protokol Hidrasi & Proteksi Organ:
                    </h5>
                    <div className="space-y-2">
                      {selectedRegimen.hydrationAndProtection.map((hyd, hIdx) => (
                        <div key={hIdx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                          <span className="text-teal-600 font-bold">✓</span>
                          <span>{hyd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
        <ReferenceFooter references={[
          `NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®) - Regimen: ${selectedRegimen.fullName}.`,
          "Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal clearance. J Clin Oncol. 1989;7(11):1748-1756.",
          "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.",
          "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.",
          "Du Bois D, Du Bois EF. A formula to estimate the approximate surface area if height and weight be known. Arch Intern Med. 1916;17(6):863-871.",
          "ASCO / ONS Chemotherapy Administration Safety Standards."
        ]} />
      </div>
    );
  };

  const renderRegimenKemoterapiCalculator = () => {
    const filteredRegimens = CHEMOTHERAPY_REGIMENS.filter((r) => {
      if (regimenCategory !== "all" && r.category !== regimenCategory) return false;
      if (regimenSearch.trim()) {
        const q = regimenSearch.trim().toLowerCase();
        const inName = r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q);
        const inInd = r.indication.toLowerCase().includes(q) || r.categoryLabel.toLowerCase().includes(q);
        const inDrugs = r.drugs.some(
          (d) =>
            d.drugName.toLowerCase().includes(q) ||
            (d.genericAlias || "").toLowerCase().includes(q) ||
            d.drugId.toLowerCase().includes(q)
        );
        return inName || inInd || inDrugs;
      }
      return true;
    });

    const activeRegimen =
      CHEMOTHERAPY_REGIMENS.find((r) => r.id === regimenSelectedId) ||
      filteredRegimens[0] ||
      CHEMOTHERAPY_REGIMENS[0];

    const patientInput = {
      gender: regimenGender,
      ageYears: parseFloat(regimenAge) || 0,
      weightKg: parseFloat(regimenWeight) || 0,
      heightCm: parseFloat(regimenHeight) || 0,
      serumCreatinineMgDl: parseFloat(regimenCr) || 0,
      targetAUC: parseFloat(regimenAuc) || 5,
      bsaInputMode: regimenBsaMode,
      manualBsaM2: parseFloat(regimenManualBsa) || 0,
      bsaFormula: regimenBsaFormula,
      doseReductionPercent: regimenDosePercent,
      capGfrAt125: regimenCapGfr,
      capVincristineAt2mg: regimenCapVincristine,
      customComponentDoses: regimenCustomDoses,
    };

    const calcResult = calculateRegimenDosages(activeRegimen, patientInput);
    const hasValidPatientData =
      regimenBsaMode === "manual"
        ? patientInput.manualBsaM2 > 0 || patientInput.weightKg > 0
        : patientInput.weightKg > 0 && patientInput.heightCm > 0;
    const sortedDrugs = [...calcResult.drugs].sort(
      (a, b) => a.drug.sequenceOrder - b.drug.sequenceOrder
    );
    const hasCustomOverrides = Object.keys(regimenCustomDoses).length > 0;

    const selectRegimenById = (id: string) => {
      setRegimenSelectedId(id);
      setRegimenCustomDoses({});
    };

    const handleCopyRegimenSummary = () => {
      const text = formatRegimenOrderSummary(calcResult, patientInput);
      navigator.clipboard.writeText(text).then(() => {
        setRegimenCopied(true);
        setTimeout(() => setRegimenCopied(false), 2500);
      });
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Kalkulator Regimen Kemoterapi</h2>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Hitung dosis obat sitotoksik individual secara presisi berdasarkan <strong className="text-white">{CHEMOTHERAPY_REGIMENS.length} protokol regimen kemoterapi</strong> (LPT Mosteller/Du Bois, Calvert AUC dengan pembatasan GFR 125 mL/menit, batas dosis tunggal Vinkristin 2 mg, serta reduksi dosis).
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyRegimenSummary}
              disabled={!hasValidPatientData}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
            >
              {regimenCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{regimenCopied ? "Tersalin ke Clipboard" : "Salin Order Dosis"}</span>
            </button>
          </div>
        </div>

        {/* Step 1: Select Regimen */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
              Pilih Regimen Kemoterapi
            </h3>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Menampilkan {filteredRegimens.length} dari {CHEMOTHERAPY_REGIMENS.length} regimen
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {REGIMEN_CATEGORIES.map((cat) => {
              const isActive = regimenCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setRegimenCategory(cat.id);
                    const nextList = CHEMOTHERAPY_REGIMENS.filter(
                      (r) => cat.id === "all" || r.category === cat.id
                    );
                    if (nextList.length > 0 && !nextList.some((r) => r.id === regimenSelectedId)) {
                      selectRegimenById(nextList[0].id);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>

          {/* Search & Dropdown Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={regimenSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegimenSearch(val);
                  if (val.trim()) {
                    const q = val.trim().toLowerCase();
                    const firstMatch = CHEMOTHERAPY_REGIMENS.find(
                      (r) =>
                        (regimenCategory === "all" || r.category === regimenCategory) &&
                        (r.name.toLowerCase().includes(q) ||
                          r.fullName.toLowerCase().includes(q) ||
                          r.indication.toLowerCase().includes(q) ||
                          r.drugs.some((d) => d.drugName.toLowerCase().includes(q)))
                    );
                    if (firstMatch) selectRegimenById(firstMatch.id);
                  }
                }}
                placeholder="Cari regimen (7+3, ABVD, R-CHOP, CAPOX, BEP, FLOT, CYBORD, obat, kanker)..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {regimenSearch && (
                <button
                  type="button"
                  onClick={() => setRegimenSearch("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={activeRegimen.id}
              onChange={(e) => selectRegimenById(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {filteredRegimens.length === 0 ? (
                <option value={activeRegimen.id}>Tidak ada regimen cocok</option>
              ) : (
                filteredRegimens.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.indication}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Active Regimen Overview Box */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-indigo-700 text-white text-xs font-black rounded-lg">
                  {activeRegimen.name}
                </span>
                <span className="text-xs font-bold text-indigo-950">{activeRegimen.fullName}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-indigo-700 rounded-md border border-indigo-200">
                {activeRegimen.categoryLabel}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Indikasi:</strong> {activeRegimen.indication}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span><strong>Siklus:</strong> {activeRegimen.cycleProtocol}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span><strong>Durasi:</strong> {activeRegimen.totalRecommendedCycles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Patient Anthropometrics & Dosing Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
              Data Antropometri & Parameter Klinis Pasien
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegimenBsaMode("auto")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    regimenBsaMode === "auto"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Hitung LPT (BB & TB)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (calcResult.activeBsa > 0) {
                      setRegimenManualBsa(calcResult.activeBsa.toFixed(2));
                    }
                    setRegimenBsaMode("manual");
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    regimenBsaMode === "manual"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Input LPT (BSA) Langsung
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRegimenAge("50");
                  setRegimenWeight("58");
                  setRegimenHeight("158");
                  setRegimenManualBsa("1.60");
                  setRegimenBsaMode("auto");
                  setRegimenCr("0.9");
                  setRegimenAuc("5");
                  setRegimenDosePercent(100);
                  setRegimenBsaFormula("mosteller");
                  setRegimenCapGfr(true);
                  setRegimenCapVincristine(true);
                  setRegimenCustomDoses({});
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Default
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Jenis Kelamin</label>
              <div className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegimenGender("female")}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    regimenGender === "female" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Wanita
                </button>
                <button
                  type="button"
                  onClick={() => setRegimenGender("male")}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    regimenGender === "male" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Pria
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Usia (tahun)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={regimenAge}
                onChange={(e) => setRegimenAge(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Berat Badan (kg)</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={regimenWeight}
                onChange={(e) => setRegimenWeight(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {regimenBsaMode === "manual" ? (
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 mb-1">LPT / BSA Langsung (m²)</label>
                <input
                  type="number"
                  min="0.2"
                  max="3.5"
                  step="0.01"
                  value={regimenManualBsa}
                  onChange={(e) => setRegimenManualBsa(e.target.value)}
                  className="w-full px-3 py-1.5 border border-indigo-400 bg-indigo-50/50 rounded-lg text-sm font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  min="30"
                  step="0.5"
                  value={regimenHeight}
                  onChange={(e) => setRegimenHeight(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Kreatinin (mg/dL)</label>
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={regimenCr}
                onChange={(e) => setRegimenCr(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            {regimenBsaMode === "manual" ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Tinggi Badan (opsional)</label>
                <input
                  type="number"
                  min="30"
                  step="0.5"
                  value={regimenHeight}
                  onChange={(e) => setRegimenHeight(e.target.value)}
                  placeholder="cm"
                  className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Formula LPT/BSA</label>
                <select
                  value={regimenBsaFormula}
                  onChange={(e) => setRegimenBsaFormula(e.target.value as BsaFormulaType)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white"
                >
                  <option value="mosteller">Mosteller</option>
                  <option value="dubois">Du Bois</option>
                </select>
              </div>
            )}
          </div>

          {/* Conditional AUC + Dose Intensity + Safety Caps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600">Intensitas / Reduksi Dosis</label>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    regimenDosePercent < 100
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {regimenDosePercent}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={regimenDosePercent}
                onChange={(e) => setRegimenDosePercent(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>50%</span>
                <span>75%</span>
                <span>80%</span>
                <span>100% (Standar)</span>
              </div>
            </div>

            {activeRegimen.hasCarboplatin ? (
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 mb-1">
                  Target AUC Carboplatin (Calvert)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={regimenAuc}
                  onChange={(e) => setRegimenAuc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-indigo-300 bg-indigo-50/40 rounded-lg text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-1">Rumus Calvert: AUC × (GFR + 25)</p>
              </div>
            ) : (
              <div className="flex flex-col justify-center bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mode Perhitungan</span>
                <span className="text-xs font-bold text-slate-700 mt-0.5">
                  LPT ({regimenBsaMode === "manual" ? "Input Manual" : regimenBsaFormula === "dubois" ? "Du Bois" : "Mosteller"}) / BB (kg) / Flat Dose
                </span>
              </div>
            )}

            <div className="space-y-2 bg-slate-50 border border-slate-200/70 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pengaman Dosis Klinis (ASCO/FDA)
              </span>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regimenCapGfr}
                  onChange={(e) => setRegimenCapGfr(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Batasi GFR Calvert ≤ 125 mL/menit</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regimenCapVincristine}
                  onChange={(e) => setRegimenCapVincristine(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Batasi Dosis Tunggal Vinkristin ≤ 2 mg</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 3: Calculated Anthropometrics & Drug Dosages */}
        {!hasValidPatientData ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center text-xs font-semibold text-amber-800">
            {regimenBsaMode === "manual"
              ? "Masukkan nilai LPT / BSA (m²) atau Berat Badan (kg) pasien yang valid untuk melihat kalkulasi dosis individual."
              : "Masukkan Berat Badan (kg) dan Tinggi Badan (cm) pasien yang valid untuk melihat kalkulasi dosis individual."}
          </div>
        ) : (
          <>
            {/* Anthropometric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  LPT / BSA ({regimenBsaMode === "manual" ? "Input Manual" : regimenBsaFormula === "dubois" ? "Du Bois" : "Mosteller"})
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {calcResult.activeBsa.toFixed(2)} <span className="text-xs font-sans text-slate-500 font-semibold">m²</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {regimenBsaMode === "manual"
                    ? `BB Aktual: ${patientInput.weightKg} kg`
                    : regimenBsaFormula === "dubois"
                    ? `Mosteller: ${calcResult.bsaMosteller.toFixed(2)} m²`
                    : `Du Bois: ${calcResult.bsaDuBois.toFixed(2)} m²`}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Klirens Kreatinin (CrCl)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {calcResult.crClRaw.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-semibold">mL/mnt</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {calcResult.gfrWasCapped ? "Calvert capped: 125 mL/mnt" : "Cockcroft-Gault"}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  IMT / BMI
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {calcResult.bmi > 0 ? calcResult.bmi.toFixed(1) : "—"} <span className="text-xs font-sans text-slate-500 font-semibold">{calcResult.bmi > 0 ? "kg/m²" : ""}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {calcResult.bmi <= 0
                    ? "Isi TB untuk hitung IMT"
                    : calcResult.bmi < 18.5
                    ? "Underweight"
                    : calcResult.bmi < 25
                    ? "Normal"
                    : calcResult.bmi < 30
                    ? "Overweight"
                    : "Obesitas (ASCO: tetap gunakan BB aktual)"}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Berat Badan Ideal (IBW)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {calcResult.ibwKg > 0 ? calcResult.ibwKg.toFixed(1) : "—"} <span className="text-xs font-sans text-slate-500 font-semibold">{calcResult.ibwKg > 0 ? "kg" : ""}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Komponen Regimen: {sortedDrugs.length} obat
                </span>
              </div>
            </div>

            {/* Individualized Drug Dosages List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold">
                    Rincian Dosis Individual — Regimen {activeRegimen.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Diurutkan sesuai urutan pemberian infus (administration sequence)
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {hasCustomOverrides && (
                    <button
                      type="button"
                      onClick={() => setRegimenCustomDoses({})}
                      className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Reset Dosis Kustom
                    </button>
                  )}
                  {regimenDosePercent < 100 && (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold">
                      Reduksi Dosis Aktif: {regimenDosePercent}%
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {sortedDrugs.map((item) => {
                  const drugKey = `${item.drug.drugId}_${item.drug.sequenceOrder}`;
                  const isCustomDose = regimenCustomDoses[drugKey] !== undefined;
                  const doseUnitLabel =
                    item.drug.doseUnit === "mg/m2"
                      ? "mg/m²"
                      : item.drug.doseUnit === "unit/m2"
                      ? "unit/m²"
                      : item.drug.doseUnit === "mg/kg"
                      ? "mg/kg"
                      : item.drug.doseUnit === "mcg/kg"
                      ? "mcg/kg"
                      : item.drug.doseUnit === "AUC"
                      ? "AUC"
                      : item.drug.doseUnit === "unit_flat"
                      ? "unit"
                      : "mg";
                  const formattedFinal =
                    item.finalDose < 10
                      ? item.finalDose.toFixed(2)
                      : Math.round(item.finalDose).toLocaleString("id-ID");
                  const formattedStd =
                    item.standardDose < 10
                      ? item.standardDose.toFixed(2)
                      : Math.round(item.standardDose).toLocaleString("id-ID");

                  return (
                    <div key={drugKey} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-md">
                              Urutan #{item.drug.sequenceOrder}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900">{item.drug.drugName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.drug.vesicantStatus.includes("Vesikant") && !item.drug.vesicantStatus.includes("Non")
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : item.drug.vesicantStatus === "Iritan"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {item.drug.vesicantStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{item.drug.role}</p>

                          {/* Inline Protocol Dose Adjuster */}
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-[11px] font-semibold text-slate-500">Dosis Protokol:</span>
                            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                              <input
                                type="number"
                                min="0.01"
                                step={item.drug.doseValue < 10 ? "0.1" : "1"}
                                value={isCustomDose ? regimenCustomDoses[drugKey] : item.appliedDoseValue}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  if (!Number.isNaN(v) && v > 0) {
                                    setRegimenCustomDoses((prev) => ({ ...prev, [drugKey]: v }));
                                  }
                                }}
                                aria-label={`Sesuaikan dosis ${item.drug.drugName}`}
                                className="w-16 text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-hidden"
                              />
                              <span className="text-[10px] font-bold text-slate-500">{doseUnitLabel}</span>
                            </div>
                            {isCustomDose && (
                              <button
                                type="button"
                                onClick={() =>
                                  setRegimenCustomDoses((prev) => {
                                    const next = { ...prev };
                                    delete next[drugKey];
                                    return next;
                                  })
                                }
                                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                              >
                                Reset ({item.drug.doseValue} {doseUnitLabel})
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="sm:text-right bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 shrink-0">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                            Dosis Individual Pasien
                          </span>
                          <div className="text-2xl font-black text-indigo-950 font-mono">
                            {formattedFinal} <span className="text-xs font-sans font-bold text-indigo-700">{item.displayUnit}</span>
                          </div>
                          <div className="text-[10px] text-indigo-700 font-medium">
                            {isCustomDose ? "Dosis kustom" : item.drug.dosageFormula} ({item.formulaBreakdown})
                          </div>
                          {regimenDosePercent < 100 && (
                            <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                              Standar 100%: {formattedStd} {item.displayUnit} → {regimenDosePercent}%
                            </div>
                          )}
                        </div>
                      </div>

                      {item.wasCapped && item.capReason && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Pembatasan Dosis Diterapkan (Capped):</strong> Dosis hitung awal {formattedStd} {item.displayUnit}. {item.capReason}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Rute & Jadwal</span>
                          <p className="text-slate-700 font-semibold mt-0.5">{item.drug.adminRoute}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Pelarut Standar</span>
                          <p className="text-slate-700 font-semibold mt-0.5">{item.drug.diluentStandard}</p>
                          {item.drug.diluentForbidden && (
                            <p className="text-rose-600 font-bold mt-1">{item.drug.diluentForbidden}</p>
                          )}
                        </div>
                        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Kewaspadaan Klinis</span>
                          <p className="text-slate-700 mt-0.5 leading-relaxed">{item.drug.specialPrecautions}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premedication, Hydration & Vital Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-3xs">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Premedikasi
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 leading-relaxed">
                  {activeRegimen.premedicationProtocol.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-3xs">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-600" /> Hidrasi & Proteksi Organ
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 leading-relaxed">
                  {activeRegimen.hydrationAndProtection.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-3xs">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Monitoring Vital & Lab
                </h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 leading-relaxed">
                  {activeRegimen.vitalMonitoring.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        <ReferenceFooter
          references={[
            `${activeRegimen.references}`,
            "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.",
            "Calvert AH, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal clearance. J Clin Oncol. 1989;7(11):1748-1756.",
            "ASCO Guideline: Appropriate Systemic Therapy Dosing for Obese Adult Patients With Cancer (Griggs JJ, et al. J Clin Oncol. 2021).",
            "NCCN Clinical Practice Guidelines in Oncology & FDA Carboplatin GFR Capping Communication.",
          ]}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Calculator className="w-6 h-6 text-teal-600 shrink-0" />
              <span>Kalkulator Medis</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {activeGroupOfCalc
                ? `Kelompok ${activeGroupOfCalc.index} · ${activeGroupOfCalc.title}`
                : "Kumpulan kalkulator klinis, skor medis, farmakokinetika, infus, dan dosis obat berbasis bukti."}
            </p>
          </div>
          {activeCalc && (
            <button
              type="button"
              onClick={() => setActiveCalc(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Daftar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {!activeCalc ? (
            renderCalculatorList()
          ) : (
            <div>
              {/* 01. Ginjal & Cairan */}
              {activeCalc === "egfr" && renderEgfrCalculator()}
              {activeCalc === "crcl" && renderCrClCalculator()}
              {activeCalc === "map" && <MapCalculator />}

              {/* 02. Jantung, Pembuluh Darah & Infeksi */}
              {activeCalc === "cha2ds2vasc" && renderCha2ds2vasc()}
              {activeCalc === "ascvd" && <PreventAscvdCalculator />}
              {activeCalc === "qsofa_curb65" && <QsofaCurb65Calculator />}

              {/* 03. Neurologi, Paru & Gawat Darurat */}
              {activeCalc === "gcs" && renderGCSCalculator()}
              {activeCalc === "sf_ratio" && <Spo2Fio2Calculator />}

              {/* 04. Nutrisi, Metabolisme & Kehamilan */}
              {activeCalc === "bmi" && renderBMICalculator()}
              {activeCalc === "bmr_tdee" && <CalorieBmrTdeeCalculator />}
              {activeCalc === "bsa" && renderBSACalculator()}
              {activeCalc === "hpl" && <HplCalculator />}
              {activeCalc === "fertility" && <FertilityCalculator />}
              {activeCalc === "apgar" && renderApgarCalculator()}
              {activeCalc === "zscore_who" && <WhoZScoreCalculator />}
              {activeCalc === "physical_growth" && <PhysicalGrowthAnthropometryCalculator />}
              {activeCalc === "dev_screening" && <DevelopmentalScreeningCalculator />}

              {/* 05. Kemoterapi */}
              {activeCalc === "chemo" && renderChemoCalculator()}
              {activeCalc === "regimen" && renderRegimenKemoterapiCalculator()}

              {/* 06. Kalkulator Klinis & Dosis Obat */}
              {activeCalc === "pediatric" && renderPediatricDoseCalculator()}
              {activeCalc === "iv_infusion" && <IvInfusionCalculator />}
              {activeCalc === "unit_dilution" && <UnitDilutionCalculator />}
              {activeCalc === "compounding" && <CompoundingPrescriptionCalculator />}
              {activeCalc === "pharmacokinetics" && <PharmacokineticsCalculator />}
              {activeCalc === "drip_rate" && <InfusionDripRateCalculator />}
              {activeCalc === "syringe_pump" && <SyringePumpCalculator />}
              {activeCalc === "fluid_electrolyte" && <FluidElectrolyteCalculator />}
              {activeCalc === "lab" && renderLabCalculator()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
