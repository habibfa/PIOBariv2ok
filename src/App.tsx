import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, Save } from "lucide-react";
import { CalculatorInputs, CalculationResult, DrugPreset, AlertLevel } from "./types";
import { DRUG_PRESETS as INITIAL_DRUG_PRESETS } from "./presets";
import { INTERACTION_DATABASE as INITIAL_INTERACTION_DATABASE, checkFoodInteractions, FoodInteraction, DrugInteraction } from "./interactions";
import { calculateDosage, calculateMostellerBsa, calculateCockcroftGault } from "./mathUtils";
import ClinicalAlerts from "./components/ClinicalAlerts";
import PharmacistConsultation from "./PharmacistConsultation";
import FornasDrugs from "./FornasDrugs";
import ClinicalSOAP from "./ClinicalSOAP";
import { generateMedicalReportPDF } from "./pdfUtils";
import CountUp from "./components/CountUp";
import {
  Calculator,
  Activity,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  Settings,
  RefreshCw,
  Droplets,
  Clock,
  ShieldAlert,
  ChevronRight,
  FileText,
  Search,
  MapPin,
  Scale,
  Calendar,
  AlertCircle,
  Download,
  GitCompare,
  BookOpen,
  Plus,
  Trash2,
  ShieldCheck,
  Utensils,
  Coffee,
  Baby,
  Heart,
  Play,
  Video,
  Eye,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Volume2,
  Image,
  Stethoscope,
  Pill
} from "lucide-react";

// @ts-ignore
import suppositoriaImg from "./assets/images/suppositoria_guide_1782741722992.jpg";
// @ts-ignore
import inhalerImg from "./assets/images/inhaler_guide_1782741740111.jpg";
// @ts-ignore
import tetesMataImg from "./assets/images/tetes_mata_guide_1782741754486.jpg";
// @ts-ignore
import tetesTelingaImg from "./assets/images/tetes_telinga_guide_1782741766653.jpg";
// @ts-ignore
import semprotHidungImg from "./assets/images/semprot_hidung_guide_1782741778450.jpg";
// @ts-ignore
import insulinImg from "./assets/images/pena_insulin_guide_1782741791385.jpg";
import { MapFacilities } from "./MapFacilities";

import { IvCompatibilityChecker } from "./IvCompatibilityChecker";
import { DiseasesConditions } from "./DiseasesConditions";
import { MedicalCalculators } from "./MedicalCalculators";

// Helper function to extract Generic and Brand names
const getGenericAndBrand = (name: string) => {
  const cleanName = name.replace(/\s*-\s*.*$/, ""); // removes trailing "- Anak", "- Varisela", etc.
  const parenMatch = cleanName.match(/\(([^)]+)\)/);
  let brand = cleanName;
  let generic = cleanName;
  if (parenMatch) {
    generic = parenMatch[1];
    brand = cleanName.replace(/\s*\([^)]+\)/, "").trim();
  } else {
    brand = cleanName.trim();
    generic = cleanName.trim();
  }
  return { brand, generic };
};

// Helper to categorize each drug
const getDrugCategory = (id: string, name: string): { label: string; color: string; bg: string; border: string } => {
  const lowercaseId = id.toLowerCase();
  const lowercaseName = name.toLowerCase();

  if (
    lowercaseId.includes("amoxicillin") ||
    lowercaseId.includes("cefixime") ||
    lowercaseId.includes("gentamicin") ||
    lowercaseId.includes("erythromycin") ||
    lowercaseId.includes("ceftriaxone") ||
    lowercaseId.includes("cefadroxil") ||
    lowercaseId.includes("cotrimoxazole") ||
    lowercaseId.includes("azithromycin") ||
    lowercaseId.includes("metronidazole") ||
    lowercaseId.includes("chloramphenicol") ||
    lowercaseId.includes("clindamycin") ||
    lowercaseId.includes("nystatin") ||
    lowercaseId.includes("fluconazole") ||
    lowercaseId.includes("clarithromycin") ||
    lowercaseId.includes("cefaclor") ||
    lowercaseId.includes("spiramycin") ||
    lowercaseId.includes("colistin") ||
    lowercaseId.includes("amove") ||
    lowercaseId.includes("griseofulvin") ||
    lowercaseId.includes("isoniazid") ||
    lowercaseId.includes("josamycin") ||
    lowercaseId.includes("ketoconazole") ||
    lowercaseId.includes("levofloxacin") ||
    lowercaseId.includes("neomycin") ||
    lowercaseId.includes("rifampicin") ||
    lowercaseId.includes("tetracycline") ||
    lowercaseId.includes("vancomycin") ||
    lowercaseId.includes("zidovudine") ||
    lowercaseName.includes("antibiotik") ||
    lowercaseName.includes("antivirus") ||
    lowercaseName.includes("antifungal")
  ) {
    return { label: "Antibiotik & Anti-infeksi", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
  }

  if (
    lowercaseId.includes("paracetamol") ||
    lowercaseId.includes("ibuprofen") ||
    lowercaseId.includes("mefenamic") ||
    lowercaseId.includes("diclofenac") ||
    lowercaseId.includes("meloxicam") ||
    lowercaseId.includes("ketorolac") ||
    lowercaseId.includes("tramadol") ||
    lowercaseId.includes("naproxen") ||
    lowercaseId.includes("fentanyl") ||
    lowercaseId.includes("indomethacin") ||
    lowercaseId.includes("aspirin") ||
    lowercaseId.includes("morphine") ||
    lowercaseName.includes("nyeri") ||
    lowercaseName.includes("demam")
  ) {
    return { label: "Analgetik & Antipiretik", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" };
  }

  if (
    lowercaseId.includes("propranolol") ||
    lowercaseId.includes("spironolactone") ||
    lowercaseId.includes("bisoprolol") ||
    lowercaseId.includes("digoxin") ||
    lowercaseId.includes("enalapril") ||
    lowercaseId.includes("furosemide") ||
    lowercaseId.includes("heparin") ||
    lowercaseId.includes("clopidogrel") ||
    lowercaseId.includes("nifedipine") ||
    lowercaseId.includes("warfarin") ||
    lowercaseId.includes("amlodipine") ||
    lowercaseId.includes("candesartan") ||
    lowercaseId.includes("captopril")
  ) {
    return { label: "Kardiovaskular & Diuretik", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
  }

  if (
    lowercaseId.includes("salbutamol") ||
    lowercaseId.includes("ambroxol") ||
    lowercaseId.includes("glyceryl") ||
    lowercaseId.includes("pseudoephedrine") ||
    lowercaseId.includes("theophylline") ||
    lowercaseId.includes("acetylcysteine") ||
    lowercaseId.includes("aminophylline") ||
    lowercaseId.includes("ipratropium") ||
    lowercaseId.includes("dextromethorphan") ||
    lowercaseId.includes("diphenhydramine") ||
    lowercaseId.includes("bromhexine") ||
    lowercaseId.includes("budesonide") ||
    lowercaseId.includes("xylometazoline") ||
    lowercaseName.includes("asma") ||
    lowercaseName.includes("batuk")
  ) {
    return { label: "Pernapasan & Alergi", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-100" };
  }

  if (
    lowercaseId.includes("metoclopramide") ||
    lowercaseId.includes("ranitidine") ||
    lowercaseId.includes("domperidone") ||
    lowercaseId.includes("zinc") ||
    lowercaseId.includes("lactulose") ||
    lowercaseId.includes("omeprazole") ||
    lowercaseId.includes("ondansetron") ||
    lowercaseId.includes("sucralfate") ||
    lowercaseId.includes("loperamide") ||
    lowercaseId.includes("hyoscine") ||
    lowercaseId.includes("ursodeoxycholic") ||
    lowercaseId.includes("lansoprazole")
  ) {
    return { label: "Gastrointestinal", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" };
  }

  if (
    lowercaseId.includes("prednisone") ||
    lowercaseId.includes("dexamethasone") ||
    lowercaseId.includes("methylprednisolone") ||
    lowercaseId.includes("oxytocin") ||
    lowercaseId.includes("insulin")
  ) {
    return { label: "Hormon & Kortikosteroid", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" };
  }

  if (lowercaseId.includes("onc") || lowercaseId.includes("doxorubicin") || lowercaseId.includes("carboplatin")) {
    return { label: "Onkologi", color: "text-fuchsia-700", bg: "bg-fuchsia-50", border: "border-fuchsia-100" };
  }

  return { label: "Lain-lain & Suplemen", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100" };
};

// Helper to determine the drug formulation/route based on preset details
const getDrugFormulation = (preset: DrugPreset) => {
  const notesLower = (preset.notes || "").toLowerCase();
  const nameLower = preset.name.toLowerCase();
  const idLower = preset.id.toLowerCase();
  const combined = `${nameLower} ${notesLower} ${idLower}`;

  if (combined.includes("injeksi") || combined.includes("infus") || combined.includes("iv ") || combined.includes("im ")) {
    return { label: "Parenteral (Injeksi)", icon: "💉", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" };
  }
  if (combined.includes("sirup") || combined.includes("suspensi") || combined.includes("drops") || preset.liquidConcentrationValue) {
    return { label: "Cairan Oral", icon: "💧", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-100" };
  }
  if (combined.includes("suppositoria") || combined.includes("supositoria")) {
    return { label: "Suppositoria", icon: "💊", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" };
  }
  if (combined.includes("salep") || combined.includes("krim") || combined.includes("gel") || combined.includes("topikal") || combined.includes("powder")) {
    return { label: "Topikal", icon: "🧴", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" };
  }
  if (combined.includes("spray") || combined.includes("inhaler") || combined.includes("nebulizer")) {
    return { label: "Inhalasi", icon: "🌬️", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100" };
  }
  
  // Default to solid oral
  return { label: "Oral Padat (Tablet/Kapsul)", icon: "💊", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
};

// Helper to provide clinical drug metadata
const getDrugMetadata = (preset: DrugPreset) => {
  const { brand, generic } = getGenericAndBrand(preset.name);
  
  const cleanBrand = brand;
  const cleanGeneric = generic;
  
  let composition = "";
  if (preset.liquidConcentrationValue && preset.liquidConcentrationVolume) {
    composition = `Tiap ${preset.liquidConcentrationVolume} mL sirup/suspensi mengandung ${cleanGeneric} ${preset.liquidConcentrationValue} ${preset.doseUnit}`;
  } else {
    let dose = preset.defaultDoseValue;
    if (preset.id.includes("adult")) {
      composition = `Mengandung zat aktif ${cleanGeneric} sediaan tablet/kapsul standar (Acuannya: ${dose} ${preset.doseUnit})`;
    } else if (preset.id.includes("inf") || preset.id.includes("inj") || preset.id.includes("nebulizer") || preset.id.includes("neb")) {
      composition = `Tiap sediaan mengandung ${cleanGeneric} ${dose} ${preset.doseUnit} untuk rute parenteral/inhalasi`;
    } else {
      composition = `Mengandung zat aktif ${cleanGeneric} ${dose} ${preset.doseUnit}`;
    }
  }

  const doseMin = `${preset.defaultDoseValue} ${preset.doseUnit}${preset.calcMethod === "mg_per_kg" ? "/kg" : preset.calcMethod === "mg_per_m2" ? "/m²" : ""} per dosis (frekuensi: ${preset.frequency === "once" ? "1x sehari" : preset.frequency === "q12h" ? "tiap 12 jam (2x sehari)" : preset.frequency === "q8h" ? "tiap 8 jam (3x sehari)" : preset.frequency === "q6h" ? "tiap 6 jam (4x sehari)" : "sesuai petunjuk"})`;
  
  let doseMax = "";
  if (preset.dailyDoseLimitMax) {
    doseMax = `${preset.dailyDoseLimitMax} ${preset.doseUnit} per hari (Maksimal)`;
  } else if (preset.singleDoseLimitMax) {
    doseMax = `${preset.singleDoseLimitMax} ${preset.doseUnit} per dosis tunggal`;
  } else {
    doseMax = "Menyesuaikan toleransi klinis pasien dan anjuran dokter";
  }

  const indication = preset.indication;

  let contraindication = "Hipersensitivitas terhadap komponen obat atau golongan kimia obat ini.";
  let pregnancySafety: { category: "A" | "B" | "C" | "D" | "X"; status: "Aman" | "Perlu Perhatian" | "Kontraindikasi"; detail: string } = {
    category: "C",
    status: "Perlu Perhatian",
    detail: "Category C. Belum ada studi terkontrol yang memadai pada manusia. Hanya boleh digunakan apabila potensi manfaat terapeutik pada ibu hamil membenarkan potensi risiko terhadap janin."
  };
  let breastfeedingSafety: { status: "Aman" | "Perlu Perhatian" | "Kontraindikasi"; detail: string } = {
    status: "Perlu Perhatian",
    detail: "Perlu Perhatian. Dapat diekskresikan ke dalam ASI dalam kadar rendah. Pantau bayi terhadap potensi efek samping (perubahan pola makan, kantuk berlebih) dan gunakan di bawah pengawasan medis."
  };

  const id = preset.id.toLowerCase();
  
  if (id.includes("paracetamol") || id.includes("acetaminophen")) {
    contraindication = "Gangguan fungsi hati yang parah, gagal hati akut aktif, atau riwayat hipersensitivitas parah.";
    pregnancySafety = {
      category: "B",
      status: "Aman",
      detail: "Category B (Aman). Merupakan obat pilihan pertama analgetik dan antipiretik pada seluruh trimester kehamilan. Profil keamanannya sangat mapan, namun tetap dianjurkan menggunakan dosis efektif terkecil dan jangka waktu sesingkat mungkin."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Sangat Aman. Diekskresikan ke dalam ASI dalam jumlah yang sangat kecil dan aman untuk bayi menyusui. Tidak memerlukan penghentian pemberian ASI."
    };
  } else if (id.includes("ibuprofen")) {
    contraindication = "Riwayat tukak peptikum aktif atau perdarahan lambung; gangguan ginjal berat; asma bronkial akibat aspirin; kehamilan trimester ketiga (kontraindikasi penuh).";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C (Trimester 1 & 2) / Category D (Trimester 3). Hindari penggunaan pada trimester ketiga kehamilan karena dapat menyebabkan penutupan dini duktus arteriosus janin, disfungsi ginjal janin (oligohidramnion), serta memperpanjang masa persalinan."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Sangat Aman. Ekskresi ke dalam ASI sangat kecil dan tidak terdeteksi pada serum bayi. Merupakan pilihan obat golongan NSAID paling aman untuk ibu menyusui."
    };
  } else if (id.includes("amoxicillin") || id.includes("amove")) {
    contraindication = "Riwayat reaksi alergi tipe cepat yang parah (seperti anafilaksis, angioedema) terhadap Amoksisilin, Penisilin, atau antibiotik golongan Beta-Laktam lainnya.";
    pregnancySafety = {
      category: "B",
      status: "Aman",
      detail: "Category B (Aman). Sangat sering digunakan dan dianggap aman untuk mengobati infeksi bakteri yang sensitif selama masa kehamilan."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Diekskresikan dalam jumlah minimal ke dalam ASI. Secara umum sangat aman, namun tetap pantau bayi dari kemungkinan timbulnya diare ringan, sariawan, atau ruam popok."
    };
  } else if (id.includes("cefixime") || id.includes("cefadroxil") || id.includes("ceftriaxone") || id.includes("cefaclor")) {
    contraindication = "Hipersensitivitas terhadap antibiotik golongan Sefalosporin atau riwayat reaksi anafilaksis silang terhadap Penisilin.";
    pregnancySafety = {
      category: "B",
      status: "Aman",
      detail: "Category B (Aman). Dianggap aman dan tidak menunjukkan efek buruk pada perkembangan janin pada studi terkontrol."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Konsentrasi obat dalam ASI sangat rendah dan aman digunakan oleh ibu yang menyusui. Amati adanya perubahan kebiasaan pencernaan bayi."
    };
  } else if (id.includes("gentamicin") || id.includes("neomycin")) {
    contraindication = "Riwayat reaksi alergi aminoglikosida; gangguan pendengaran; gangguan ginjal berat tanpa kontrol kadar darah (TDM).";
    pregnancySafety = {
      category: "D",
      status: "Kontraindikasi",
      detail: "Category D (Kontraindikasi). Dapat menembus sawar plasenta dan menyebabkan kerusakan saraf pendengaran janin (ototoksisitas kongenital ireversibel). Hanya boleh digunakan pada infeksi bakteri sangat parah yang mengancam jiwa ibu."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Obat ini diekskresikan ke dalam ASI dalam kadar yang sangat rendah. Karena tidak diserap dengan baik melalui sistem pencernaan bayi, risiko efek sistemik pada bayi diabaikan."
    };
  } else if (id.includes("tetracycline")) {
    contraindication = "Anak usia di bawah 8 tahun; kehamilan; menyusui; gangguan fungsi ginjal berat.";
    pregnancySafety = {
      category: "D",
      status: "Kontraindikasi",
      detail: "Category D (Kontraindikasi). Penggunaan pada trimester kedua dan ketiga dapat memicu perubahan warna gigi janin secara permanen (kuning-cokelat), menyebabkan hipoplasia email, serta menghambat pertumbuhan tulang panjang janin."
    };
    breastfeedingSafety = {
      status: "Kontraindikasi",
      detail: "Kontraindikasi. Diekskresikan ke dalam ASI. Dapat memicu pewarnaan gigi bayi yang disusui dan berpotensi memengaruhi osteogenesis bayi. Sebaiknya hindari penggunaan obat ini saat menyusui."
    };
  } else if (id.includes("metoclopramide")) {
    contraindication = "Kondisi perdarahan, obstruksi mekanis, atau perforasi lambung/usus; epilepsi; riwayat gangguan ekstrapiramidal atau diskinesia tardif akibat obat.";
    pregnancySafety = {
      category: "B",
      status: "Aman",
      detail: "Category B (Aman). Tidak ada bukti risiko pada janin manusia. Merupakan terapi pilihan kedua yang aman untuk mual muntah kehamilan parah (hiperemesis gravidarum) setelah lini pertama gagal."
    };
    breastfeedingSafety = {
      status: "Perlu Perhatian",
      detail: "Perlu Perhatian. Diekskresikan ke dalam ASI. Penggunaan jangka pendek aman, namun hindari penggunaan jangka panjang karena risiko efek samping neurologis (reaksi ekstrapiramidal) pada bayi."
    };
  } else if (id.includes("domperidone")) {
    contraindication = "Prolaktinoma hipofisis; obstruksi atau perdarahan saluran cerna; gangguan fungsi hati sedang-berat; perpanjangan interval QT jantung.";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Studi pada manusia sangat terbatas. Hanya boleh diberikan jika potensi manfaat klinis pada ibu membenarkan risiko teoretis terhadap janin."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Relatif Aman. Jumlah obat yang diekskresikan ke dalam ASI sangat kecil. Kadang digunakan sebagai perangsang produksi ASI (laktagog) dalam dosis rendah dan durasi pendek di bawah pengawasan medis."
    };
  } else if (id.includes("spironolactone")) {
    contraindication = "Kondisi anuria; gagal ginjal akut; gangguan ginjal berat; hiperkalemia; penyakit Addison.";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Memiliki aktivitas anti-androgenik sehingga berpotensi memengaruhi diferensiasi seksual janin laki-laki (risiko feminisasi). Hindari penggunaan kecuali pada kondisi sangat mendesak."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Metabolit aktifnya diekskresikan dalam konsentrasi yang sangat kecil ke dalam ASI dan dianggap tidak berbahaya bagi kesehatan bayi."
    };
  } else if (id.includes("propranolol") || id.includes("bisoprolol")) {
    contraindication = "Asma bronkial berat atau riwayat PPOK berat; bradikardia sinus (<50 bpm); blok AV derajat dua atau tiga; syok kardiogenik; gagal jantung akut.";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Dapat memicu penurunan aliran darah plasenta, meningkatkan risiko berat lahir rendah, hambatan pertumbuhan intrauterin, hipoglikemia, dan bradikardia pada neonatus. Disarankan untuk memantau tumbuh kembang janin secara ketat."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Diekskresikan dalam kadar sangat rendah ke dalam ASI. Dianggap aman untuk ibu menyusui, namun tetap amati denyut jantung bayi."
    };
  } else if (id.includes("warfarin")) {
    contraindication = "Perdarahan aktif; diatesis hemoragik; hipertensi berat tidak terkontrol; kehamilan (terutama trimester pertama dan ketiga).";
    pregnancySafety = {
      category: "X",
      status: "Kontraindikasi",
      detail: "Category X (Kontraindikasi Mutlak). Sangat teratogenik. Menyebabkan Sindrom Warfarin Janin (hipoplasia hidung, kelainan skeletal, atrofi optik, mikrosefali, keterlambatan tumbuh kembang) serta risiko perdarahan janin yang mengancam nyawa."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Warfarin tidak diekskresikan ke dalam ASI dalam jumlah klinis yang signifikan. Hasil koagulasi (waktu protrombin) pada bayi menyusui tetap normal. Dianggap aman."
    };
  } else if (id.includes("heparin")) {
    contraindication = "Trombositopenia akibat heparin (HIT); perdarahan aktif tidak terkontrol; gangguan pembekuan darah parah.";
    pregnancySafety = {
      category: "C",
      status: "Aman",
      detail: "Category C (Aman). Heparin memiliki bobot molekul besar sehingga tidak menembus plasenta. Tidak memicu perdarahan janin atau malformasi. Merupakan antikoagulan pilihan utama selama kehamilan."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Sangat Aman. Karena molekulnya yang sangat besar, heparin tidak diekskresikan ke dalam ASI dan tidak dapat diserap secara oral oleh bayi."
    };
  } else if (id.includes("omeprazole") || id.includes("lansoprazole")) {
    contraindication = "Riwayat hipersensitivitas terhadap PPI; penggunaan bersama obat antivirus rilpivirin.";
    pregnancySafety = {
      category: "C", // Omeprazole is C, Lansoprazole is B
      status: "Aman",
      detail: "Category C / B. Data epidemiologi luas membuktikan keamanan obat ini dan tidak menunjukkan peningkatan risiko malformasi janin. Boleh digunakan jika perubahan gaya hidup gagal meredakan gejala refluks asam."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Relatif Aman. Diekskresikan dalam jumlah yang sangat kecil ke dalam ASI dan segera didegradasi oleh asam lambung bayi, sehingga tidak memengaruhi bayi."
    };
  } else if (id.includes("furosemide")) {
    contraindication = "Kondisi anuria; gagal ginjal akibat nefrotoksik; koma hepatikum sirosis hati; hipokalemia atau hiponatremia berat; deplesi cairan tubuh yang parah.";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Dapat menembus plasenta dan memicu diuresis pada janin. Berisiko menurunkan volume darah ibu hamil sehingga mengganggu perfusi plasenta. Pantau kecukupan cairan ibu dan pertumbuhan janin."
    };
    breastfeedingSafety = {
      status: "Perlu Perhatian",
      detail: "Perlu Perhatian. Diekskresikan ke dalam ASI. Dapat menurunkan produksi ASI (laktasi tertekan). Gunakan dengan dosis efektif terkecil dan pantau kecukupan suplai ASI."
    };
  } else if (id.includes("prednisone") || id.includes("dexamethasone") || id.includes("methylprednisolone")) {
    contraindication = "Infeksi jamur sistemik aktif; infeksi sistemik berat yang tidak diobati; pemberian vaksin hidup.";
    pregnancySafety = {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Prednison lebih disukai karena dimetabolisme secara intensif oleh plasenta sehingga paparan janin sangat minim. Kortikosteroid dosis tinggi dapat memicu bibir sumbing ringan bila digunakan pada trimester pertama."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Diekskresikan dalam jumlah sangat minimal. Untuk dosis tinggi (>20 mg prednison sehari), disarankan untuk menunda menyusui selama 3-4 jam setelah minum obat guna meminimalkan paparan bayi."
    };
  } else if (id.includes("simvastatin") || id.includes("atorvastatin")) {
    contraindication = "Penyakit hati aktif; peningkatan enzim transaminase yang tidak dapat dijelaskan; kehamilan; menyusui.";
    pregnancySafety = {
      category: "X",
      status: "Kontraindikasi",
      detail: "Category X (Kontraindikasi Mutlak). Kolesterol dan produk turunannya sangat penting untuk perkembangan organ dan dinding sel janin. Penghentian statin selama kehamilan tidak membahayakan kesehatan jantung ibu secara akut."
    };
    breastfeedingSafety = {
      status: "Kontraindikasi",
      detail: "Kontraindikasi. Terdapat risiko teoretis gangguan metabolisme lipid pada bayi yang disusui karena statin dapat diekskresikan ke dalam ASI. Jangan menyusui saat terapi statin."
    };
  } else if (id.includes("digoxin")) {
    contraindication = "Aritmia fibrilasi ventrikel; takikardia ventrikel; blok AV derajat dua atau tiga tanpa pacu jantung.";
    pregnancySafety = {
      category: "C",
      status: "Aman",
      detail: "Category C (Aman). Telah digunakan secara luas untuk aritmia ibu maupun takiaritmia janin (via transfer transplasenta). Memerlukan pemantauan berkala kadar obat dalam darah ibu hamil."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Diekskresikan ke dalam ASI dalam konsentrasi yang sangat rendah dan tidak menimbulkan risiko klinis pada bayi."
    };
  } else if (id.includes("salbutamol")) {
    contraindication = "Hipersensitivitas terhadap agonis beta-2 adrenergik; komplikasi persalinan prematur (untuk sediaan sistemik).";
    pregnancySafety = {
      category: "C",
      status: "Aman",
      detail: "Category C (Aman untuk rute Inhalasi). Rute inhalasi memiliki paparan sistemik yang diabaikan. Penggunaan sediaan oral/injeksi dosis tinggi harus diawasi karena efek relaksasi otot rahim (tokolitik) dan takikardia."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Penggunaan salbutamol via inhalasi menghasilkan kadar dalam ASI yang tidak signifikan secara klinis. Aman bagi bayi menyusui."
    };
  } else if (id.includes("acyclovir")) {
    contraindication = "Riwayat hipersensitivitas terhadap asiklovir atau valasiklovir.";
    pregnancySafety = {
      category: "B",
      status: "Aman",
      detail: "Category B (Aman). Studi klinis luas membuktikan keamanan asiklovir pada ibu hamil untuk penanganan herpes simpleks dan cacar air tanpa risiko kelainan bawaan."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Aman. Diekskresikan ke dalam ASI, namun jumlah yang diterima bayi sangat kecil (hanya 1-2% dari dosis terapeutik bayi). Sangat aman digunakan."
    };
  } else if (id.includes("valproate") || id.includes("valproic")) {
    contraindication = "Penyakit hati aktif atau gangguan hati berat; gangguan siklus urea; kehamilan untuk profilaksis migren (kontraindikasi penuh).";
    pregnancySafety = {
      category: "D",
      status: "Kontraindikasi",
      detail: "Category D (Kontraindikasi). Sangat teratogenik. Berisiko tinggi menyebabkan cacat lahir mayor seperti defek tabung saraf (spina bifida), malformasi jantung, kraniofasial, serta gangguan kognitif pasca lahir. Hindari penggunaan kecuali tidak ada alternatif terapi epilepsi lain."
    };
    breastfeedingSafety = {
      status: "Aman",
      detail: "Relatif Aman. Diekskresikan dalam jumlah yang sangat kecil ke dalam ASI (sekitar 1-10% dari kadar serum ibu). Dianggap aman digunakan dengan pemantauan ketat terhadap timbulnya memar atau gangguan hati bayi."
    };
  } else if (id.includes("doxorubicin") || id.includes("carboplatin") || id.includes("onc")) {
    contraindication = "Mielosupresi berat; gangguan ginjal atau pendengaran berat; gagal jantung berat (untuk doksorubisin); kehamilan; menyusui.";
    pregnancySafety = {
      category: "D",
      status: "Kontraindikasi",
      detail: "Category D (Kontraindikasi Mutlak). Merupakan zat sitotoksik kemoterapi yang merusak pembelahan sel dan sangat toksik terhadap perkembangan embrio/janin. Menyebabkan keguguran, malformasi multipel, dan toksisitas organ janin."
    };
    breastfeedingSafety = {
      status: "Kontraindikasi",
      detail: "Kontraindikasi Mutlak. Agen sitotoksik dapat diekskresikan ke dalam ASI, menyebabkan penekanan sumsum tulang (mielosupresi) yang parah, penekanan imun, dan risiko karsinogenik pada bayi. Ibu menyusui harus menghentikan pemberian ASI sepenuhnya."
    };
  } else {
    const cat = getDrugCategory(preset.id, preset.name);
    if (cat.label === "Antibiotik & Anti-infeksi") {
      contraindication = "Riwayat hipersensitivitas parah terhadap komponen obat atau golongan antibiotik sejenis.";
      pregnancySafety = {
        category: "B",
        status: "Aman",
        detail: "Category B. Penelitian klinis tidak menunjukkan adanya bukti risiko merugikan pada kehamilan manusia. Gunakan sesuai indikasi klinis infeksi bakteri/virus yang jelas di bawah pengawasan medis."
      };
      breastfeedingSafety = {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam jumlah sangat minimal ke dalam ASI. Pantau bayi terhadap kemungkinan timbulnya diare ringan atau sariawan."
      };
    } else if (cat.label === "Pernapasan & Alergi") {
      contraindication = "Hipersensitivitas terhadap komponen sediaan atau zat aktif.";
      pregnancySafety = {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C. Sediaan lokal (seperti inhaler atau semprot hidung) lebih disukai karena absorpsi sistemik sangat minimal. Gunakan antihistamin non-sedatif oral dengan hati-hati hanya jika sangat diperlukan."
      };
      breastfeedingSafety = {
        status: "Aman",
        detail: "Aman. Kadar dalam ASI sangat rendah, terutama untuk sediaan hirup atau dosis lazim antihistamin non-sedatif (seperti Cetirizine atau Loratadine). Amati jika bayi tampak lesu atau mengantuk."
      };
    } else if (cat.label === "Kortikosteroid & Hormon") {
      contraindication = "Infeksi jamur sistemik aktif; infeksi bakteri atau virus tidak terkontrol; hipersensitivitas.";
      pregnancySafety = {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C. Penggunaan kortikosteroid sistemik jangka panjang dikaitkan dengan risiko ringan insufisiensi adrenal janin dan bibir sumbing bila digunakan pada trimester pertama. Gunakan dosis efektif terkecil."
      };
      breastfeedingSafety = {
        status: "Aman",
        detail: "Aman. Prednison dan metilprednisolon diekskresikan dalam jumlah sangat minimal. Disarankan menunda menyusui 3-4 jam setelah konsumsi dosis tinggi."
      };
    } else if (cat.label === "Analgetik & Antipiretik") {
      contraindication = "Hipersensitivitas terhadap zat aktif; gangguan organ hati/ginjal berat harus sangat hati-hati.";
      pregnancySafety = {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C. Hindari penggunaan obat anti-inflamasi (NSAID) pada trimester ketiga kehamilan karena risiko penutupan prematur duktus arteriosus janin dan disfungsi ginjal janin."
      };
      breastfeedingSafety = {
        status: "Aman",
        detail: "Aman. Obat analgetik umum seperti Paracetamol atau Ibuprofen sangat aman digunakan selama masa menyusui dengan paparan minimal pada bayi."
      };
    }
  }

  let drugClass: "Obat Keras" | "Obat Bebas Terbatas" | "Obat Bebas" | "Jamu" | "Herbal" = "Obat Keras";
  if (id.includes("paracetamol") || id.includes("acetaminophen") || id.includes("antacid") || id.includes("zinc") || id.includes("sucralfate")) {
    drugClass = "Obat Bebas";
  } else if (id.includes("ibuprofen") || id.includes("ambroxol") || id.includes("bromhexine") || id.includes("dextromethorphan") || id.includes("pseudoephedrine")) {
    drugClass = "Obat Bebas Terbatas";
  }

  let mechanism = "Mekanisme kerja spesifik bergantung pada kelas farmakologis obat ini. Bekerja pada reseptor atau enzim target untuk menghasilkan efek terapeutik.";
  let categoryInfo = getDrugCategory(preset.id, preset.name).label;
  let precautions = "Hati-hati penggunaan pada pasien dengan riwayat alergi, gangguan fungsi ginjal atau hati, dan lansia. Konsultasikan dengan dokter jika gejala menetap.";
  let dosageRule = `Dosis lazim: ${doseMin}. Dosis maksimal: ${doseMax}. Gunakan sesuai indikasi: ${preset.indication}. ${preset.notes || ""}`;
  let usageGuide = "Gunakan sesuai petunjuk dokter atau aturan pakai pada kemasan. Jangan menggandakan dosis jika terlewat.";
  let sideEffects = "Efek samping umum mungkin meliputi gangguan gastrointestinal ringan, mual, atau alergi (ruam). Hentikan penggunaan jika terjadi reaksi alergi berat.";
  let references = "Informasi disadur dari panduan klinis umum, FI (Farmakope Indonesia), MIMS, Medscape, Trissel's Handbook on Injectable Drugs (ASHP), dan leaflet resmi obat.";

  const categoryLabel = categoryInfo.toLowerCase();
  
  if (categoryLabel.includes("antibiotik") || categoryLabel.includes("anti-infeksi")) {
    mechanism = "Bekerja dengan menghambat sintesis dinding sel bakteri, menghambat sintesis protein, atau replikasi DNA bakteri sehingga menyebabkan kematian bakteri (bakterisidal) atau menghambat pertumbuhannya (bakteriostatik).";
    precautions = "Gunakan sampai habis sesuai resep dokter untuk mencegah resistensi antibiotik. Hati-hati pada pasien dengan riwayat alergi penisilin/sefalosporin atau antibiotik lainnya.";
    usageGuide = "Sebaiknya diminum bersama makanan untuk mengurangi iritasi lambung (misal: Amoksisilin) atau sesuai anjuran spesifik pada waktu perut kosong. Habiskan seluruh dosis yang diresepkan meskipun gejala sudah hilang.";
    sideEffects = "Diare, mual, muntah, ruam kulit alergi, atau risiko superinfeksi jamur (candidiasis) jika digunakan dalam jangka panjang.";
    references = "PIONAS (Pusat Informasi Obat Nasional), Panduan Praktik Klinis (PPK) Penatalaksanaan Infeksi, Pedoman Penggunaan Antibiotik (Kemenkes RI), Trissel's Handbook on Injectable Drugs (ASHP).";
  } else if (categoryLabel.includes("analgetik")) {
    mechanism = "Bekerja menghambat enzim siklooksigenase (COX) di sistem saraf pusat atau perifer, yang bertugas memproduksi prostaglandin (senyawa pemicu nyeri dan demam).";
    precautions = "Hati-hati pada pasien dengan gangguan hati akut (untuk Paracetamol), atau riwayat tukak lambung dan gangguan ginjal (untuk Ibuprofen / NSAID lainnya).";
    usageGuide = "NSAID/Ibuprofen harus diminum setelah makan atau bersama makanan untuk mencegah iritasi lambung. Paracetamol dapat diminum sebelum atau sesudah makan.";
    sideEffects = "Risiko hepatotoksisitas pada overdosis (Paracetamol). Dispepsia, nyeri ulu hati, mual, dan risiko perdarahan lambung (AINS/Ibuprofen).";
  } else if (categoryLabel.includes("hormon") || categoryLabel.includes("kortikosteroid")) {
    mechanism = "Berikatan dengan reseptor glukokortikoid intraseluler, menekan respons peradangan (inflamasi) dan menekan sistem kekebalan tubuh yang berlebihan.";
    precautions = "Hindari penghentian mendadak (harus tapering off) pada penggunaan jangka panjang. Awasi tanda-tanda infeksi sekunder karena efek imunosupresif.";
    usageGuide = "Sebaiknya diminum pada pagi hari sesudah makan untuk mengikuti irama sirkadian alami tubuh (sekresi kortisol) dan mencegah iritasi lambung.";
    sideEffects = "Peningkatan nafsu makan, retensi cairan/wajah moon-face, gangguan tidur, imunosupresi, peningkatan gula darah, dan sindrom Cushing pada penggunaan lama.";
  } else if (categoryLabel.includes("pernapasan") || categoryLabel.includes("alergi")) {
    mechanism = "Bekerja dengan memblokir reseptor histamin (antihistamin), merelaksasi otot polos saluran napas (bronkodilator), atau mengencerkan dahak (mukolitik/ekspektoran).";
    precautions = "Beberapa obat (seperti CTM, Cetirizine) dapat menyebabkan kantuk. Hindari mengemudi atau mengoperasikan mesin berat setelah mengonsumsinya. Hati-hati pada pasien hipertensi (untuk dekongestan).";
    usageGuide = "Dapat diminum bersama atau tanpa makanan. Untuk inhaler/nebulizer, ikuti teknik penggunaan alat yang benar (lihat tab Panduan Pemakaian Alat).";
    sideEffects = "Kantuk (mengantuk), mulut kering, jantung berdebar (palpitasi akibat bronkodilator), pusing, dan gangguan pencernaan ringan.";
  } else if (categoryLabel.includes("gastrointestinal")) {
    mechanism = "Bekerja dengan menetralkan asam lambung (antasida), menghambat sekresi asam lambung (PPI/H2-blocker), atau memblokir reseptor mual-muntah di otak (antiemetik).";
    precautions = "Perhatikan interaksi obat, karena perubahan keasaman lambung dapat mengganggu penyerapan obat lain (misalnya antibiotik tertentu atau zat besi).";
    usageGuide = "Antasida dan PPI (seperti Omeprazole) sebaiknya diminum 30-60 menit sebelum makan. Pelapis lambung (Sukralfat) harus diminum dalam keadaan perut kosong.";
    sideEffects = "Konstipasi (sembelit), diare, perut kembung, sakit kepala, atau kelelahan ringan.";
  }

  let bud = "Tablet / Kapsul: Sesuai tanggal kedaluwarsa pada kemasan jika disimpan dengan baik.";
  if (preset.id.includes("syr") || preset.id.includes("susp") || preset.id.includes("drop") || preset.id.includes("ped")) {
    if (preset.id.includes("amoxicillin") || preset.id.includes("cefixime") || preset.id.includes("antibiotic") || preset.id.includes("cef")) {
      bud = "Sirup Kering (Antibiotik): 7 Hari pada suhu ruang, atau maksimal 14 hari bila disimpan di kulkas (2-8°C).";
    } else {
      bud = "Sirup / Drops Non-Antibiotik: 14 hari - 1 bulan setelah segel dibuka. Jangan gunakan jika terjadi perubahan warna atau mengkristal.";
    }
  } else if (preset.id.includes("inj") || preset.id.includes("iv")) {
    bud = "Injeksi/Vial Multidosis: 28 hari setelah ditusuk pertama kali (kecuali dinyatakan lain). Ampul Single-dose: Segera buang setelah dibuka, tidak boleh disimpan.";
  } else if (preset.id.includes("neb") || preset.id.includes("inhaler")) {
    bud = "Nebules / Inhaler: Segera gunakan setelah dibuka dari kemasan foil. Obat tetes inhaler multidose maksimal 30 hari.";
  }

  return {
    brandName: cleanBrand,
    genericName: cleanGeneric,
    composition,
    doseMin,
    doseMax,
    indication,
    contraindication,
    pregnancySafety,
    breastfeedingSafety,
    drugClass,
    mechanism,
    categoryInfo,
    precautions,
    dosageRule,
    usageGuide,
    sideEffects,
    references,
    bud
  };
};

export default function App() {
  const [isUpdateDrugModalOpen, setIsUpdateDrugModalOpen] = useState(false);
  const [drugCsvFile, setDrugCsvFile] = useState<File | null>(null);
  const [drugCsvError, setDrugCsvError] = useState("");

  const handleUpdateDrugData = async () => {
    if (!drugCsvFile) {
      setDrugCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }

    const fileExt = drugCsvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      Papa.parse(drugCsvFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          validateAndSetDrugData(results.data as any[]);
        },
        error: (error) => {
          setDrugCsvError("Gagal membaca file CSV: " + error.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const data = await drugCsvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetDrugData(parsed as any[]);
      } catch (err) {
        setDrugCsvError("Gagal membaca file Excel: " + (err as Error).message);
      }
    } else {
      setDrugCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetDrugData = (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      setDrugPresets(prev => {
        const newData = parsed as DrugPreset[];
        const prevFiltered = prev.filter(p => !newData.some(n => String(n.id) === String(p.id)));
        const combined = [...prevFiltered, ...newData];
        return combined.sort((a, b) => a.name.localeCompare(b.name, "id"));
      });
      setIsUpdateDrugModalOpen(false);
      setDrugCsvError("");
      setDrugCsvFile(null);
    } else {
      setDrugCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat (id, name, dll).");
    }
  };

  const handleDownloadDrugTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(INITIAL_DRUG_PRESETS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Informasi_Obat");
    XLSX.writeFile(wb, "Template_Informasi_Obat.xlsx");
  };

    const [interactionDatabase, setInteractionDatabase] = useState<DrugInteraction[]>(() => {
    const saved = localStorage.getItem("interactionDatabase");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_INTERACTION_DATABASE;
      }
    }
    return INITIAL_INTERACTION_DATABASE;
  });

  useEffect(() => {
    localStorage.setItem("interactionDatabase", JSON.stringify(interactionDatabase));
  }, [interactionDatabase]);

  const [isUpdateDdiModalOpen, setIsUpdateDdiModalOpen] = useState(false);
  const [ddiCsvFile, setDdiCsvFile] = useState<File | null>(null);
  const [ddiCsvError, setDdiCsvError] = useState("");

  const handleUpdateDdiData = async () => {
    if (!ddiCsvFile) {
      setDdiCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }
    const fileExt = ddiCsvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      Papa.parse(ddiCsvFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          validateAndSetDdiData(results.data as any[]);
        },
        error: (error) => {
          setDdiCsvError("Gagal membaca file CSV: " + error.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const data = await ddiCsvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetDdiData(parsed as any[]);
      } catch (err) {
        setDdiCsvError("Gagal membaca file Excel: " + (err as Error).message);
      }
    } else {
      setDdiCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetDdiData = (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].drugAId !== undefined && parsed[0].drugBId !== undefined) {
      setInteractionDatabase(prev => {
        const newData = parsed as DrugInteraction[];
        const newMap = new Map(newData.map(item => [`${item.drugAId}-${item.drugBId}`, item]));
        const prevFiltered = prev.filter(p => !newMap.has(`${p.drugAId}-${p.drugBId}`) && !newMap.has(`${p.drugBId}-${p.drugAId}`));
        return [...prevFiltered, ...newData];
      });
      setIsUpdateDdiModalOpen(false);
      setDdiCsvError("");
      setDdiCsvFile(null);
    } else {
      setDdiCsvError("Format file tidak valid. Pastikan ada kolom drugAId dan drugBId.");
    }
  };

  const handleDownloadDdiTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(INITIAL_INTERACTION_DATABASE);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Skrining_Interaksi");
    XLSX.writeFile(wb, "Template_Skrining_Interaksi.xlsx");
  };

  const checkInteractions = (presetAId: string, presetBId: string): DrugInteraction[] => {
    if (!presetAId || !presetBId || presetAId === "custom" || presetBId === "custom") {
      return [];
    }
    return interactionDatabase.filter(interaction => {
      const matchDirect = interaction.drugAId === presetAId && interaction.drugBId === presetBId;
      const matchReverse = interaction.drugAId === presetBId && interaction.drugBId === presetAId;
      return matchDirect || matchReverse;
    });
  };

  const [drugPresets, setDrugPresets] = useState(() => {
    const saved = localStorage.getItem("drugPresets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DRUG_PRESETS;
      }
    }
    return INITIAL_DRUG_PRESETS;
  });

  useEffect(() => {
    localStorage.setItem("drugPresets", JSON.stringify(drugPresets));
  }, [drugPresets]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === "habibfa07") {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("Password salah!");
    }
  };

  // Preset Selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>("paracetamol_ped");
  const [selectedPreset, setSelectedPreset] = useState<DrugPreset | undefined>(
    drugPresets.find((p) => p.id === "paracetamol_ped")
  );

  // Patient Sex (for CrCl estimation)
  const [isFemale, setIsFemale] = useState<boolean>(false);

  // Tab Selection
  const [activeTab, setActiveTab] = useState<"single" | "ddi" | "desc" | "video" | "ai" | "map" | "iv" | "diseases" | "medcalc" | "pharmacist" | "fornas" | "soap">("desc");

  // Video Tab States
  const [activeVideoId, setActiveVideoId] = useState<string>("suppositoria");
  const [activeVideoStep, setActiveVideoStep] = useState<number>(0);
  const [videoPracticeChecked, setVideoPracticeChecked] = useState<Record<string, boolean>>({});

  // Drug Description States
  const [descSearchQuery, setDescSearchQuery] = useState<string>("");
  const [descSelectedCategory, setDescSelectedCategory] = useState<string>("all");
  const [descSelectedAlphabet, setDescSelectedAlphabet] = useState<string>("all");
  const [descExpandedId, setDescExpandedId] = useState<string | null>(null);

  // Multi-drug DDI Screening States
  const [ddiSelectedIds, setDdiSelectedIds] = useState<string[]>([
    "propranolol_ped",
    "salbutamol_syr",
    "spironolactone_ped",
    "potassium_chloride_inf"
  ]);
  const [ddiSearchQuery, setDdiSearchQuery] = useState<string>("");
  const [ddiSubTab, setDdiSubTab] = useState<"drug" | "food">("drug");

  // Comparison States
  const [comparePresetAId, setComparePresetAId] = useState<string>("paracetamol_ped");
  const [comparePresetBId, setComparePresetBId] = useState<string>("amoxicillin_ped_high");

  // Custom input overwrites for Regimen A and B
  const [compareDoseA, setCompareDoseA] = useState<number | "">(15);
  const [compareMethodA, setCompareMethodA] = useState<"mg_per_kg" | "mg_per_m2" | "flat">("mg_per_kg");
  const [compareUnitA, setCompareUnitA] = useState<"mg" | "mcg" | "g" | "units">("mg");
  const [compareFreqA, setCompareFreqA] = useState<string>("q6h");
  const [compareConcValA, setCompareConcValA] = useState<number | "">(120);
  const [compareConcVolA, setCompareConcVolA] = useState<number | "">(5);

  const [compareDoseB, setCompareDoseB] = useState<number | "">(45);
  const [compareMethodB, setCompareMethodB] = useState<"mg_per_kg" | "mg_per_m2" | "flat">("mg_per_kg");
  const [compareUnitB, setCompareUnitB] = useState<"mg" | "mcg" | "g" | "units">("mg");
  const [compareFreqB, setCompareFreqB] = useState<string>("q12h");
  const [compareConcValB, setCompareConcValB] = useState<number | "">(400);
  const [compareConcVolB, setCompareConcVolB] = useState<number | "">(5);

  // Sync comparison regimen A when its preset changes
  useEffect(() => {
    const prA = drugPresets.find((p) => p.id === comparePresetAId);
    if (prA) {
      setCompareDoseA(prA.defaultDoseValue);
      setCompareMethodA(prA.calcMethod);
      setCompareUnitA(prA.doseUnit);
      setCompareFreqA(prA.frequency);
      setCompareConcValA(prA.liquidConcentrationValue || "");
      setCompareConcVolA(prA.liquidConcentrationVolume || "");
    } else {
      setCompareDoseA("");
      setCompareMethodA("flat");
      setCompareUnitA("mg");
      setCompareFreqA("once");
      setCompareConcValA("");
      setCompareConcVolA("");
    }
  }, [comparePresetAId]);

  // Sync comparison regimen B when its preset changes
  useEffect(() => {
    const prB = drugPresets.find((p) => p.id === comparePresetBId);
    if (prB) {
      setCompareDoseB(prB.defaultDoseValue);
      setCompareMethodB(prB.calcMethod);
      setCompareUnitB(prB.doseUnit);
      setCompareFreqB(prB.frequency);
      setCompareConcValB(prB.liquidConcentrationValue || "");
      setCompareConcVolB(prB.liquidConcentrationVolume || "");
    } else {
      setCompareDoseB("");
      setCompareMethodB("flat");
      setCompareUnitB("mg");
      setCompareFreqB("once");
      setCompareConcValB("");
      setCompareConcVolB("");
    }
  }, [comparePresetBId]);

  // Search/Filter for Presets
  const [searchTerm, setSearchTerm] = useState("");

  // Input states
  const [inputs, setInputs] = useState<CalculatorInputs>({
    ageYears: 6,
    ageMonths: 0,
    weightKg: 20,
    heightCm: 115,
    bsaManual: 0.8,
    useBsaManual: false,
    serumCreatinine: 0.5,
    targetDoseValue: 15,
    doseUnit: "mg",
    calcMethod: "mg_per_kg",
    frequency: "q6h",
    liquidConcentrationValue: 120,
    liquidConcentrationVolume: 5,
  });

  // Calculation output state
  const [calculated, setCalculated] = useState<CalculationResult>({
    singleDose: 0,
    dailyDose: 0,
    doseFormula: "",
    renalAdjustmentApplied: false,
    alerts: [],
  });

  // AI clinical consultant states
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiReport, setAiReport] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  // Populate inputs when preset changes
  useEffect(() => {
    if (selectedPreset) {
      setInputs((prev) => ({
        ...prev,
        targetDoseValue: selectedPreset.defaultDoseValue,
        doseUnit: selectedPreset.doseUnit,
        calcMethod: selectedPreset.calcMethod,
        frequency: selectedPreset.frequency,
        liquidConcentrationValue: selectedPreset.liquidConcentrationValue || "",
        liquidConcentrationVolume: selectedPreset.liquidConcentrationVolume || "",
      }));
    } else {
      // Clear or set to custom default
      setInputs((prev) => ({
        ...prev,
        targetDoseValue: "",
        liquidConcentrationValue: "",
        liquidConcentrationVolume: "",
      }));
    }
  }, [selectedPreset]);

  // Trigger calculation when inputs or preset changes
  useEffect(() => {
    const res = calculateDosage(inputs, selectedPreset, isFemale);
    setCalculated(res);
  }, [inputs, selectedPreset, isFemale]);

  // Handler for custom inputs
  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Select preset and set up default question for AI
  const handleSelectPreset = (preset: DrugPreset | undefined) => {
    setSelectedPreset(preset);
    setSelectedPresetId(preset ? preset.id : "custom");
    setAiReport("");
    setAiError("");
    if (preset) {
      setAiQuestion(`Apakah dosis ini sesuai dengan protokol standar untuk ${preset.name} dengan mempertimbangkan kriteria fisik pasien ini?`);
    } else {
      setAiQuestion("Tolong analisis regimen dosis kustom ini untuk batas keamanan maksimum dan potensi toksisitas.");
    }
  };

  // Run AI deep-reasoning consultation
  const runAiConsultation = async () => {
    setIsAiLoading(true);
    setAiError("");
    setAiReport("");

    try {
      const response = await fetch("/api/calculate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs,
          calculated,
          preset: selectedPreset,
          question: aiQuestion || "Analisis pengaturan perhitungan dosis ini untuk akurasi dan keamanan klinis.",
        }),
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch (parseError) {
          throw new Error("Gagal terhubung ke server AI (Penyebab: Server mengembalikan format yang tidak dikenali).");
        }
        throw new Error(errData.error || "Gagal menghasilkan penilaian.");
      }

      const data = await response.json();
      setAiReport(data.text);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Terjadi kesalahan tidak terduga saat berkomunikasi dengan model penalaran medis.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Download report as PDF
  const handleDownloadPDF = () => {
    generateMedicalReportPDF({
      inputs,
      calculated,
      calculatedBsa,
      calculatedCrCl,
      selectedPreset,
      aiReport,
      isFemale,
    });
  };

  // Pre-load a typical pediatric patient scenario
  const loadScenario = (type: "pediatric" | "oncology" | "renal" | "geriatric") => {
    setAiReport("");
    setAiError("");
    if (type === "pediatric") {
      setIsFemale(true);
      setInputs({
        ageYears: 5,
        ageMonths: 4,
        weightKg: 18,
        heightCm: 108,
        bsaManual: 0.73,
        useBsaManual: false,
        serumCreatinine: 0.4,
        targetDoseValue: 15,
        doseUnit: "mg",
        calcMethod: "mg_per_kg",
        frequency: "q6h",
        liquidConcentrationValue: 120,
        liquidConcentrationVolume: 5,
      });
      const pr = drugPresets.find((p) => p.id === "paracetamol_ped");
      setSelectedPreset(pr);
      setSelectedPresetId("paracetamol_ped");
    } else if (type === "oncology") {
      setIsFemale(false);
      setInputs({
        ageYears: 42,
        ageMonths: 0,
        weightKg: 78,
        heightCm: 178,
        bsaManual: 1.96,
        useBsaManual: false,
        serumCreatinine: 0.9,
        targetDoseValue: 60,
        doseUnit: "mg",
        calcMethod: "mg_per_m2",
        frequency: "once",
        liquidConcentrationValue: "",
        liquidConcentrationVolume: "",
      });
      const pr = drugPresets.find((p) => p.id === "doxorubicin_onc");
      setSelectedPreset(pr);
      setSelectedPresetId("doxorubicin_onc");
    } else if (type === "renal") {
      setIsFemale(true);
      setInputs({
        ageYears: 74,
        ageMonths: 0,
        weightKg: 62,
        heightCm: 160,
        bsaManual: 1.63,
        useBsaManual: false,
        serumCreatinine: 1.8, // High creatinine -> low clearance
        targetDoseValue: 2.5,
        doseUnit: "mg",
        calcMethod: "mg_per_kg",
        frequency: "q12h",
        liquidConcentrationValue: "",
        liquidConcentrationVolume: "",
      });
      const pr = drugPresets.find((p) => p.id === "gentamicin_renal");
      setSelectedPreset(pr);
      setSelectedPresetId("gentamicin_renal");
    } else if (type === "geriatric") {
      setIsFemale(false);
      setInputs({
        ageYears: 82,
        ageMonths: 0,
        weightKg: 54,
        heightCm: 165,
        bsaManual: 1.57,
        useBsaManual: false,
        serumCreatinine: 1.4,
        targetDoseValue: 500,
        doseUnit: "mg",
        calcMethod: "flat",
        frequency: "q8h",
        liquidConcentrationValue: "",
        liquidConcentrationVolume: "",
      });
      setSelectedPreset(undefined);
      setSelectedPresetId("custom");
    }
  };

  // Calculate quick metrics for sidebar
  const calculatedBsa = calculateMostellerBsa(
    typeof inputs.weightKg === "number" ? inputs.weightKg : 0,
    typeof inputs.heightCm === "number" ? inputs.heightCm : 0
  );

  const calculatedCrCl = calculateCockcroftGault(
    typeof inputs.ageYears === "number" ? inputs.ageYears : 0,
    typeof inputs.weightKg === "number" ? inputs.weightKg : 0,
    typeof inputs.serumCreatinine === "number" ? inputs.serumCreatinine : 0,
    isFemale
  );

  const filteredPresets = drugPresets.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.indication.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Comparison Data Calculations
  const presetA = drugPresets.find((p) => p.id === comparePresetAId);
  const inputsA: CalculatorInputs = {
    ageYears: inputs.ageYears,
    ageMonths: inputs.ageMonths,
    weightKg: inputs.weightKg,
    heightCm: inputs.heightCm,
    bsaManual: inputs.bsaManual,
    useBsaManual: inputs.useBsaManual,
    serumCreatinine: inputs.serumCreatinine,
    targetDoseValue: compareDoseA,
    doseUnit: (compareUnitA || "mg") as any,
    calcMethod: (compareMethodA || "flat") as any,
    frequency: compareFreqA || "once",
    liquidConcentrationValue: compareConcValA,
    liquidConcentrationVolume: compareConcVolA,
  };
  const calculatedA = calculateDosage(inputsA, presetA, isFemale);

  const presetB = drugPresets.find((p) => p.id === comparePresetBId);
  const inputsB: CalculatorInputs = {
    ageYears: inputs.ageYears,
    ageMonths: inputs.ageMonths,
    weightKg: inputs.weightKg,
    heightCm: inputs.heightCm,
    bsaManual: inputs.bsaManual,
    useBsaManual: inputs.useBsaManual,
    serumCreatinine: inputs.serumCreatinine,
    targetDoseValue: compareDoseB,
    doseUnit: (compareUnitB || "mg") as any,
    calcMethod: (compareMethodB || "flat") as any,
    frequency: compareFreqB || "once",
    liquidConcentrationValue: compareConcValB,
    liquidConcentrationVolume: compareConcVolB,
  };
  const calculatedB = calculateDosage(inputsB, presetB, isFemale);
  const interactions = checkInteractions(comparePresetAId, comparePresetBId);

  const handleDownloadPDFA = () => {
    generateMedicalReportPDF({
      inputs: inputsA,
      calculated: calculatedA,
      calculatedBsa,
      calculatedCrCl,
      selectedPreset: presetA,
      aiReport: "",
      isFemale,
    });
  };

  const handleDownloadPDFB = () => {
    generateMedicalReportPDF({
      inputs: inputsB,
      calculated: calculatedB,
      calculatedBsa,
      calculatedCrCl,
      selectedPreset: presetB,
      aiReport: "",
      isFemale,
    });
  };

  const patientPhysiologyCard = (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800">1. Fisiologi Pasien</h2>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setIsFemale(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all \${
              !isFemale ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Laki-laki
          </button>
          <button
            type="button"
            onClick={() => setIsFemale(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all \${
              isFemale ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Perempuan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Weight */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-slate-400" /> Berat Badan Pasien
            </label>
            {inputs.weightKg && (
              <span className="text-[10px] text-slate-400">{(inputs.weightKg * 2.2046).toFixed(1)} lbs</span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={inputs.weightKg}
              onChange={(e) => handleInputChange("weightKg", e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-4 pr-12 text-base font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              placeholder="misal: 72.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">kg</span>
          </div>
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Usia Pasien
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                value={inputs.ageYears}
                onChange={(e) => handleInputChange("ageYears", e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-3 pr-8 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Tahun"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">thn</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={inputs.ageMonths}
                onChange={(e) => handleInputChange("ageMonths", e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-3 pr-8 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="Bulan"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">bln</span>
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tinggi Badan (cm)</label>
            {inputs.heightCm && (
              <span className="text-[10px] text-slate-400">
                {Math.floor(inputs.heightCm / 30.48)}&#39; {Math.round((inputs.heightCm % 30.48) / 2.54)}&quot;
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={inputs.heightCm}
              onChange={(e) => handleInputChange("heightCm", e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-4 pr-12 text-base font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              placeholder="misal: 175"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">cm</span>
          </div>
        </div>

        {/* Serum Creatinine for Cockcroft-Gault */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Kreatinin Serum (SCr)</label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={inputs.serumCreatinine}
              onChange={(e) => handleInputChange("serumCreatinine", e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-4 pr-16 text-base font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              placeholder="Opsional (untuk GFR/CrCl)"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">mg/dL</span>
          </div>
        </div>

        {/* Body Surface Area (BSA) Block */}
        <div className="col-span-1 sm:col-span-2 pt-2">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">Luas Permukaan Tubuh (BSA)</span>
              <span className="text-[10px] text-slate-400">
                {inputs.useBsaManual ? "Dilewati secara manual" : "Dihitung menggunakan Rumus Mosteller"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-black text-slate-800 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                  {inputs.useBsaManual
                    ? (inputs.bsaManual || 0).toFixed(2)
                    : calculatedBsa.toFixed(2)}{" "}
                  m²
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange("useBsaManual", !inputs.useBsaManual)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition-colors \${
                  inputs.useBsaManual
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-white hover:bg-slate-50 text-slate-500 border-slate-300"
                }`}
              >
                {inputs.useBsaManual ? "Edit Manual Aktif" : "Ubah Manual"}
              </button>
            </div>
          </div>

          {inputs.useBsaManual && (
            <div className="mt-3 space-y-1">
              <label className="block text-[10px] font-bold text-amber-800 uppercase">Atur BSA Manual (m²)</label>
              <input
                type="number"
                step="any"
                value={inputs.bsaManual}
                onChange={(e) => handleInputChange("bsaManual", e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full bg-amber-50/50 border border-amber-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-amber-500 outline-none"
                placeholder="misal: 1.85"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-emerald-100 overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col shrink-0 overflow-y-auto hidden lg:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-rsud-green">
              PIOBARI <span className="text-rsud-red">v2</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Pusat Informasi Obat
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              RSUD Palembang BARI
            </span>
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("desc")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "desc"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Informasi Obat
          </button>

          <button
            onClick={() => setActiveTab("pharmacist")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "pharmacist"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            Konsultasi Apoteker
          </button>

          <button
            onClick={() => setActiveTab("fornas")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "fornas"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Daftar Obat Fornas
          </button>

          <button
            onClick={() => setActiveTab("medcalc")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "medcalc"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            Kalkulator Medis
          </button>

          <button
            onClick={() => setActiveTab("iv")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "iv"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Droplets className="w-4 h-4 shrink-0" />
            Kompatibilitas IV
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "ai"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            Konsultasi AI
          </button>
          <button
            onClick={() => setActiveTab("soap")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "soap"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            Clinical SOAP
          </button>

          <button
            onClick={() => {
              setActiveTab("video");
              setActiveVideoStep(0);
            }}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "video"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Image className="w-4 h-4 shrink-0" />
            Panduan Alat
          </button>

          <button
            onClick={() => setActiveTab("diseases")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "diseases"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            Penyakit & Kondisi
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "map"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            Peta Faskes
          </button>

          <button
            onClick={() => setActiveTab("ddi")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "ddi"
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab !== 'ddi' ? 'animate-pulse text-amber-500' : ''}`} />
            Skrining Interaksi
          </button>
        </div>
        
        <div className="p-4 border-t border-slate-200 shrink-0 mt-auto flex flex-col gap-3">
          {isAdmin ? (
            <button
              onClick={() => setIsAdmin(false)}
              className="w-full text-center px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-colors border border-rose-200 uppercase tracking-wider"
            >
              Logout Admin
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full text-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-300 uppercase tracking-wider"
            >
              Login Admin
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">
              Basis Data Aktif
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header (Desktop and Mobile) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-xs shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-rsud-green">
                PIOBARI <span className="text-rsud-red">v2</span>
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col">
             <span className="text-sm font-bold text-slate-800">
                {activeTab === "ddi" ? "Skrining Multi-Obat Aktif" : 
                 activeTab === "desc" ? "Informasi & Keamanan Obat" : 
                 activeTab === "diseases" ? "Penyakit & Kondisi" : 
                 activeTab === "medcalc" ? "Kalkulator Medis" : 
                 activeTab === "video" ? "Panduan Alat & Cara Pakai" : 
                 activeTab === "ai" ? "Konsultasi AI Berpikir Mendalam" :
                 activeTab === "soap" ? "Clinical SOAP" : 
                 activeTab === "map" ? "Peta Sebaran Fasilitas Kesehatan" : 
                 activeTab === "iv" ? "Kompatibilitas Obat Intravena" : 
                 activeTab === "pharmacist" ? "Konsultasi Apoteker" : 
                 activeTab === "fornas" ? "Daftar Obat Fornas Kemenkes" : 
                 "Menu Kalkulator"}
             </span>
             <span className="text-[10px] text-slate-500">
                RSUD Palembang BARI
             </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => {
                setSelectedPreset(undefined);
                setSelectedPresetId("custom");
                setInputs({
                  ageYears: "",
                  ageMonths: "",
                  weightKg: "",
                  heightCm: "",
                  bsaManual: "",
                  useBsaManual: false,
                  serumCreatinine: "",
                  targetDoseValue: "",
                  doseUnit: "mg",
                  calcMethod: "flat",
                  frequency: "once",
                  liquidConcentrationValue: "",
                  liquidConcentrationVolume: "",
                });
                setAiReport("");
                setAiError("");
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Atur Ulang Kustom</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation (Horizontal scrollable tabs) */}
        <div className="lg:hidden bg-white border-b border-slate-200 shrink-0">
          <div className="flex overflow-x-auto p-2 gap-2 custom-scrollbar">
            <button
              onClick={() => setActiveTab("desc")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "desc"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Informasi Obat
            </button>
            <button
              onClick={() => setActiveTab("pharmacist")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "pharmacist"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Konsultasi Apoteker
            </button>
            <button
              onClick={() => setActiveTab("fornas")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "fornas"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Obat Fornas
            </button>
            <button
              onClick={() => setActiveTab("medcalc")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "medcalc"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Kalkulator Medis
            </button>
            <button
              onClick={() => setActiveTab("iv")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "iv"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Kompatibilitas IV
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "ai"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Konsultasi AI
            </button>
            <button
              onClick={() => setActiveTab("soap")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "soap"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Clinical SOAP
            </button>
            <button
              onClick={() => {
                setActiveTab("video");
                setActiveVideoStep(0);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "video"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              Panduan Alat
            </button>
            <button
              onClick={() => setActiveTab("diseases")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "diseases"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Penyakit & Kondisi
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "map"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Peta Faskes
            </button>
            <button
              onClick={() => setActiveTab("ddi")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "ddi"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-100"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Skrining Interaksi
            </button>
          </div>
        </div>

        {/* Main Content scrollable area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {activeTab === "single" ? (
          <>
            {/* LEFT COLUMN: Menu Presets */}
            <section className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-[calc(100vh-160px)] sticky top-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3 shrink-0">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Search className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Menu Obat</h2>
                </div>

                <div className="relative mb-3 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari preset..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
                  {/* Custom Item */}
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(undefined)}
                    className={`p-2.5 text-left rounded-xl border transition-all flex flex-col shrink-0 ${
                      selectedPresetId === "custom"
                        ? "bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">Templat Dosis Kustom</span>
                    <span className="text-[10px] text-slate-500 truncate">Masukkan parameter dari awal</span>
                  </button>

                  {filteredPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 text-left rounded-xl border transition-all flex flex-col justify-between shrink-0 ${
                        selectedPresetId === p.id
                          ? "bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 whitespace-normal">{p.indication}</span>
                      </div>
                      {p.requiresRenalAdjustment && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 py-0.2 rounded mt-1.5 self-start uppercase tracking-wider">
                          Pengawasan Ginjal
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* MIDDLE COLUMN: Input Biometrics & Dosing Config */}
            <section className="lg:col-span-5 space-y-6">
              
              {patientPhysiologyCard}

          {/* Dosing target selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">2. Pengaturan Protokol & Dosis</h2>
            </div>

            {/* Config inputs for dose ratios, units, concentrations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Formula Method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">Rumus Perhitungan</label>
                <select
                  value={inputs.calcMethod}
                  onChange={(e) => handleInputChange("calcMethod", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="mg_per_kg">Berdasarkan Berat Badan (misal: mg/kg)</option>
                  <option value="mg_per_m2">Berdasarkan BSA Pasien (misal: mg/m²)</option>
                  <option value="flat">Dosis Tetap (Nilai Langsung)</option>
                </select>
              </div>

              {/* Target Ratio Dose */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">Rasio / Nilai Target</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={inputs.targetDoseValue}
                    onChange={(e) => handleInputChange("targetDoseValue", e.target.value === "" ? "" : parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 pl-3 pr-16 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="misal: 15"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold font-mono">
                    {inputs.calcMethod === "mg_per_kg" ? `${inputs.doseUnit}/kg` : inputs.calcMethod === "mg_per_m2" ? `${inputs.doseUnit}/m²` : inputs.doseUnit}
                  </span>
                </div>
              </div>

              {/* Dose Unit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">Unit Dosis</label>
                <select
                  value={inputs.doseUnit}
                  onChange={(e) => handleInputChange("doseUnit", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="mg">mg (Miligram)</option>
                  <option value="mcg">mcg (Mikrogram)</option>
                  <option value="g">g (Gram)</option>
                  <option value="units">Unit</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">Interval Frekuensi</label>
                <select
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange("frequency", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="once">Sekali (Dosis Tunggal)</option>
                  <option value="q12h">q12h / BID (Dua kali sehari)</option>
                  <option value="q8h">q8h / TID (Tiga kali sehari)</option>
                  <option value="q6h">q6h / QID (Empat kali sehari)</option>
                  <option value="q4h">q4h (Enam kali sehari)</option>
                </select>
              </div>

              {/* Liquid formulation inputs */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">Nilai Konsentrasi Cairan</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={inputs.liquidConcentrationValue}
                      onChange={(e) => handleInputChange("liquidConcentrationValue", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="misal: 120"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">mg</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight">per Volume Cairan</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={inputs.liquidConcentrationVolume}
                      onChange={(e) => handleInputChange("liquidConcentrationVolume", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-1.5 px-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="misal: 5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">mL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display preset clinical notes */}
            {selectedPreset && (
              <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-slate-700">
                    <p className="font-bold">Batasan & Panduan Preset:</p>
                    <p className="leading-relaxed opacity-90">{selectedPreset.notes}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedPreset.singleDoseLimitMax && (
                        <span className="bg-slate-200/70 text-slate-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Dosis Tunggal Maks: {selectedPreset.singleDoseLimitMax} {selectedPreset.doseUnit}
                        </span>
                      )}
                      {selectedPreset.dailyDoseLimitMax && (
                        <span className="bg-slate-200/70 text-slate-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Dosis Harian Maks: {selectedPreset.dailyDoseLimitMax} {selectedPreset.doseUnit}
                        </span>
                      )}
                      {selectedPreset.pediatricCeilingDose && (
                        <span className="bg-rose-100 text-rose-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Batas Maks Anak: {selectedPreset.pediatricCeilingDose} {selectedPreset.doseUnit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Results, Active Guards & High-Thinking AI Consultation */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Quick Clinical GFR Info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-900/30">
            <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-3 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight">Kalkulasi Faal Ginjal</h3>
            </div>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                <span className="text-xs text-emerald-200 font-semibold">Estimasi CrCl / GFR:</span>
                <span className="text-sm font-black font-mono text-emerald-300">
                  <CountUp value={calculatedCrCl} decimals={1} /> mL/min
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                <span className="text-xs text-emerald-200 font-semibold">Estimasi BSA Tubuh:</span>
                <span className="text-sm font-black font-mono text-emerald-300">
                  <CountUp value={inputs.useBsaManual ? (inputs.bsaManual || 0) : calculatedBsa} decimals={2} /> m²
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed italic">
                *Nilai faal ginjal pasien ini akan otomatis disinkronisasikan ke kalkulator dosis untuk mendeteksi penyesuaian dosis ginjal.
              </p>
            </div>
          </div>

          {/* Active Calculation Output Display */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-850 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs tracking-wide uppercase font-mono">Hasil Perhitungan</span>
              </div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest font-mono">
                {selectedPreset ? "Ref: Preset protokol" : "Ref: Desain kustom"}
              </span>
            </div>

            <div className="p-6 flex flex-col items-center justify-center text-center bg-radial from-slate-50 to-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Dosis Tunggal</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
                  {calculated.singleDose > 0 ? (
                    <CountUp value={calculated.singleDose} decimals={2} />
                  ) : (
                    "0.00"
                  )}
                </span>
                <span className="text-xl font-bold text-slate-500 uppercase">{inputs.doseUnit}</span>
              </div>
              
              {/* Formula string */}
              <div className="mt-3 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg max-w-full truncate font-mono">
                {calculated.doseFormula.split("\n")[0]}
              </div>

              {/* Renal adjustments indicator */}
              {calculated.renalAdjustmentApplied && (
                <div className="mt-2.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  Penyesuaian Ginjal: -{calculated.renalDoseReductionPercent}% diterapkan
                </div>
              )}
            </div>

            {/* Bottom stats of calculation block */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 grid grid-cols-2 gap-4 divide-x divide-slate-200 text-sm">
              <div className="pl-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kumulatif 24 Jam</span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  {calculated.dailyDose > 0 ? (
                    <CountUp value={calculated.dailyDose} decimals={2} />
                  ) : (
                    "0.00"
                  )}{" "}
                  {inputs.doseUnit}
                </span>
              </div>
              <div className="pl-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Est. Bersihan Ginjal (CrCl)</span>
                {calculatedCrCl > 0 ? (
                  <span className={`text-base font-bold font-mono ${
                    calculatedCrCl < 30 ? "text-rose-600" : calculatedCrCl < 60 ? "text-amber-600" : "text-emerald-700"
                  }`}>
                    <CountUp value={calculatedCrCl} decimals={1} /> <span className="text-xs font-sans font-medium text-slate-500">mL/min</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 italic font-sans">Butuh SCr/Usia</span>
                )}
              </div>
            </div>

            {/* Liquid Volume block if applicable */}
            {calculated.liquidVolumeMl && calculated.liquidVolumeMl > 0 ? (
              <div className="bg-emerald-50/50 p-4 border-t border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Volume Pemberian</span>
                    <span className="text-xs text-emerald-700 font-mono">{calculated.liquidVolumeFormula}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-900 font-mono">
                    <CountUp value={calculated.liquidVolumeMl} decimals={2} /> mL
                  </span>
                </div>
              </div>
            ) : null}

            {/* Download PDF Action Block */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rekam Medis Pasien</span>
                <span className="text-xs text-slate-500">Unduh dokumen PDF klinis lengkap untuk lampiran medis</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-300" />
                <span>Unduh Laporan PDF</span>
              </button>
            </div>
          </div>

          {/* Active Safety Guards / Clinical Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <ClinicalAlerts alerts={calculated.alerts} />
          </div>

        </section>
      </>
    ) : activeTab === "ai" ? (
      <>
        {/* AI CONSULTATION MODE */}
        <section className="lg:col-span-12 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* AI Clinical Pharmacology Assessment Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col border-l-4 border-l-emerald-600">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-600 rounded">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-xs tracking-wide uppercase font-mono flex items-center gap-1.5">
                  Konsultasi AI Berpikir Mendalam
                </span>
              </div>
              <span className="text-[9px] bg-emerald-900/80 text-emerald-200 font-bold px-1.5 py-0.5 rounded font-mono">
                GEMINI-3.1-PRO AKTIF
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Consultation Context Inputs */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-sans">Fokus Konsultasi / Masalah Pasien Spesifik</label>
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="misal: Nilai batas hati untuk anak berusia 5 tahun yang mengalami demam ringan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none h-24 font-sans"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={runAiConsultation}
                disabled={isAiLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-xs active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analisis klinis mendalam sedang berlangsung (menggunakan penalaran tingkat tinggi)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Jalankan Penilaian Farmakologi Klinis</span>
                  </>
                )}
              </button>

              {/* Error Block */}
              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-950 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-sans">{aiError}</p>
                </div>
              )}

              {/* Report Output Box */}
              {aiReport ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Laporan Kritik Farmakologi</span>
                    <button
                      onClick={() => { setAiReport(""); }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold font-sans"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50/50 text-xs leading-relaxed max-h-[500px] overflow-y-auto space-y-3 prose prose-slate">
                    <div className="whitespace-pre-wrap font-sans text-slate-800 text-xs">
                      {aiReport}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </>
    ) : activeTab === "ddi" ? (
      <>
        {/* DDI MULTI-DRUG SCREENING TAB */}
        {/* LEFT COLUMN: Drug Selection / Basket */}
        <section className="lg:col-span-4 space-y-6">
          {isAdmin && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-800 mb-2">Administrasi Data Interaksi</h2>
              <button
                onClick={() => setIsUpdateDdiModalOpen(true)}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Update Data Skrining
              </button>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Keranjang Terapi ({ddiSelectedIds.length} Obat)</h2>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cari & Tambah Obat</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama obat (cth: Propranolol, Warfarin)..."
                  value={ddiSearchQuery}
                  onChange={(e) => setDdiSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Filtered Drug Selection List */}
            {ddiSearchQuery.trim() !== "" && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 max-h-[180px] overflow-y-auto space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-100 mb-1.5 px-1.5 flex justify-between">
                  <span>Hasil Pencarian</span>
                  <button onClick={() => setDdiSearchQuery("")} className="text-emerald-500 hover:underline hover:text-emerald-600 font-sans tracking-normal normal-case font-medium">Selesai</button>
                </div>
                {drugPresets.filter(p =>
                  p.name.toLowerCase().includes(ddiSearchQuery.toLowerCase()) ||
                  p.indication.toLowerCase().includes(ddiSearchQuery.toLowerCase())
                ).slice(0, 8).map(preset => {
                  const isAlreadyAdded = ddiSelectedIds.includes(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-150 group"
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{preset.name.split(" - ")[0]}</p>
                        <p className="text-[9px] text-slate-400 truncate">{preset.indication}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAlreadyAdded) {
                            setDdiSelectedIds([...ddiSelectedIds, preset.id]);
                          } else {
                            setDdiSelectedIds(ddiSelectedIds.filter(id => id !== preset.id));
                          }
                          setDdiSearchQuery("");
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 shrink-0 ${
                          isAlreadyAdded
                            ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Trash2 className="w-3 h-3" /> Hapus
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" /> Tambah
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
                {drugPresets.filter(p =>
                  p.name.toLowerCase().includes(ddiSearchQuery.toLowerCase()) ||
                  p.indication.toLowerCase().includes(ddiSearchQuery.toLowerCase())
                ).length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-2">Obat tidak ditemukan.</p>
                )}
              </div>
            )}

            {/* Quick Add Suggestions when no query */}
            {ddiSearchQuery.trim() === "" && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rekomendasi Cepat (Klik untuk Tambah)</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "propranolol_ped", name: "Propranolol" },
                    { id: "salbutamol_syr", name: "Salbutamol" },
                    { id: "spironolactone_ped", name: "Spironolakton" },
                    { id: "potassium_chloride_inf", name: "KCl Infus" },
                    { id: "warfarin_adult", name: "Warfarin" },
                    { id: "ibuprofen_ped", name: "Ibuprofen" },
                    { id: "clopidogrel_adult", name: "Klopidogrel" },
                    { id: "omeprazole_adult", name: "Omeprazol" },
                    { id: "gentamicin_renal", name: "Gentamisin" },
                    { id: "vancomycin_inf", name: "Vankomisin" },
                    { id: "amlodipine_adult", name: "Amlodipin" },
                    { id: "candesartan_adult", name: "Kandesartan" },
                    { id: "atorvastatin_adult", name: "Atorvastatin" },
                    { id: "captopril_adult", name: "Kaptopril" }
                  ].map(quickDrug => {
                    const isAdded = ddiSelectedIds.includes(quickDrug.id);
                    return (
                      <button
                        key={quickDrug.id}
                        onClick={() => {
                          if (isAdded) {
                            setDdiSelectedIds(ddiSelectedIds.filter(id => id !== quickDrug.id));
                          } else {
                            setDdiSelectedIds([...ddiSelectedIds, quickDrug.id]);
                          }
                        }}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                          isAdded
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-100"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {quickDrug.name} {isAdded && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Active Basket List */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daftar Obat Terpilih ({ddiSelectedIds.length})</span>
                {ddiSelectedIds.length > 0 && (
                  <button
                    onClick={() => setDdiSelectedIds([])}
                    className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Bersihkan
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {ddiSelectedIds.map((id, index) => {
                  const preset = drugPresets.find(p => p.id === id);
                  if (!preset) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition-all group"
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4.5 h-4.5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600 shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">{preset.name.split(" - ")[0]}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 pl-6 truncate">{preset.indication}</p>
                      </div>
                      <button
                        onClick={() => setDdiSelectedIds(ddiSelectedIds.filter(x => x !== id))}
                        className="p-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {ddiSelectedIds.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 space-y-1.5">
                    <Info className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-500">Keranjang Kosong</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-[180px] mx-auto">Tambahkan obat-obatan dari atas untuk memulai skrining interaksi otomatis.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Interaction Log, Banners & Interactive Matrix */}
        <section className="lg:col-span-8 space-y-6">
          {ddiSelectedIds.length < 2 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-3xs">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">Skrining Interaksi Membutuhkan ≥ 2 Obat</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                  Tambahkan beberapa obat dari database di kolom sebelah kiri. Sistem akan secara otomatis menghitung semua kombinasi pasangan obat dan melakukan skrining real-time terhadap potensi interaksi klinis yang membahayakan pasien.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                <button
                  onClick={() => setDdiSelectedIds(["propranolol_ped", "salbutamol_syr", "spironolactone_ped"])}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10.5px] font-bold rounded-lg border border-emerald-100 transition-colors"
                >
                  Gunakan Contoh Kombinasi Kritis
                </button>
                <button
                  onClick={() => setDdiSelectedIds(["warfarin_adult", "ibuprofen_ped", "clopidogrel_adult", "omeprazole_adult"])}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold rounded-lg border border-slate-200 transition-colors"
                >
                  Gunakan Contoh Kardiovaskular & NSAID
                </button>
                <button
                  onClick={() => setDdiSelectedIds(["amlodipine_adult", "simvastatin_adult", "ibuprofen_ped", "propranolol_ped"])}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10.5px] font-bold rounded-lg border border-purple-100 transition-colors"
                >
                  Gunakan Contoh Interaksi Amlodipin
                </button>
                <button
                  onClick={() => setDdiSelectedIds(["candesartan_adult", "spironolactone_ped", "potassium_chloride_inf", "ibuprofen_ped"])}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10.5px] font-bold rounded-lg border border-emerald-100 transition-colors"
                >
                  Gunakan Contoh Kandesartan (Hiperkalemia)
                </button>
              </div>
            </div>
          ) : (() => {
            // Compute all unique interactions and pairs
            const detectedInteractions: any[] = [];
            const checkedPairs: { idA: string; idB: string; nameA: string; nameB: string; status: "CRITICAL" | "WARNING" | "INFO" | "SAFE"; detail?: any }[] = [];

            for (let i = 0; i < ddiSelectedIds.length; i++) {
              for (let j = i + 1; j < ddiSelectedIds.length; j++) {
                const idA = ddiSelectedIds[i];
                const idB = ddiSelectedIds[j];
                const pA = drugPresets.find(p => p.id === idA);
                const pB = drugPresets.find(p => p.id === idB);
                if (!pA || !pB) continue;

                const pairInteractions = checkInteractions(idA, idB);
                if (pairInteractions.length > 0) {
                  pairInteractions.forEach(item => {
                    detectedInteractions.push(item);
                  });
                  checkedPairs.push({
                    idA,
                    idB,
                    nameA: pA.name.split(" - ")[0],
                    nameB: pB.name.split(" - ")[0],
                    status: pairInteractions[0].severity,
                    detail: pairInteractions[0]
                  });
                } else {
                  checkedPairs.push({
                    idA,
                    idB,
                    nameA: pA.name.split(" - ")[0],
                    nameB: pB.name.split(" - ")[0],
                    status: "SAFE"
                  });
                }
              }
            }

            const criticalCount = detectedInteractions.filter(x => x.severity === "CRITICAL").length;
            const warningCount = detectedInteractions.filter(x => x.severity === "WARNING").length;

            const detectedFoodInteractions = checkFoodInteractions(ddiSelectedIds);
            const criticalFoodCount = detectedFoodInteractions.filter(x => x.severity === "CRITICAL").length;
            const warningFoodCount = detectedFoodInteractions.filter(x => x.severity === "WARNING").length;

            const renderFoodInteractions = () => {
              return (
                <>
                  {/* 1. FOOD INTERACTION STATUS HERO BANNER */}
                  {detectedFoodInteractions.length === 0 ? (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-3xs animate-fadeIn">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                          Rejimen Aman Terhadap Makanan
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Aman Makanan</span>
                        </h4>
                        <p className="text-xs text-emerald-850 leading-relaxed font-sans">
                          Tidak ditemukan interaksi bermakna secara klinis antara obat-obatan pilihan Anda dengan jenis makanan, susu, kafein, atau alkohol dalam database kami.
                        </p>
                        <p className="text-[10px] text-slate-400 italic pt-1 leading-normal font-sans">
                          *Disclaimer: Pasien disarankan tetap mengikuti anjuran umum tentang waktu minum obat (seperti sebelum atau setelah makan).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`border rounded-2xl p-5 flex items-start gap-4 shadow-3xs animate-fadeIn ${
                      criticalFoodCount > 0 ? "bg-rose-50 border-rose-200/60" : "bg-amber-50 border-amber-200/60"
                    }`}>
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        criticalFoodCount > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        <AlertTriangle className={`w-6 h-6 ${criticalFoodCount > 0 ? "animate-bounce" : ""}`} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className={`text-sm font-bold flex items-center flex-wrap gap-2 ${
                          criticalFoodCount > 0 ? "text-rose-950" : "text-amber-950"
                        }`}>
                          Perhatian! Terdeteksi Potensi Interaksi Obat dengan Makanan/Zat Gizi
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            criticalFoodCount > 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                          }`}>
                            {criticalFoodCount > 0 ? "KRITIS" : "PERINGATAN"}
                          </span>
                        </h4>
                        <p className={`text-xs leading-relaxed font-sans ${
                          criticalFoodCount > 0 ? "text-rose-850 font-medium" : "text-amber-850 font-medium"
                        }`}>
                          Ditemukan <strong className="font-extrabold">{detectedFoodInteractions.length} potensi interaksi dengan makanan/zat gizi</strong> untuk obat yang Anda pilih ({criticalFoodCount} Kritis, {warningFoodCount} Moderat). Tinjau detail konseling gizi dan obat di bawah ini.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. FOOD INTERACTION DETAIL LOG */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-slate-500" />
                        Detail Interaksi Obat & Makanan Terdeteksi ({detectedFoodInteractions.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 italic font-sans font-medium">Berdasarkan Kepustakaan Gizi & Biofarmasetika Klinis</span>
                    </div>

                    {detectedFoodInteractions.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-150 p-6 space-y-2">
                        <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Rejimen Aman dari Interaksi Makanan</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                          Obat-obat dalam keranjang tidak memiliki catatan interaksi kritis dengan susu, alkohol, kafein, jus grapefruit, atau makanan kaya Vitamin K/Kalium dalam sistem kami.
                        </p>
                      </div>
                    ) : (
                      detectedFoodInteractions.map((foodInt, index) => (
                        <div
                          key={foodInt.id + "_" + index}
                          className={`border rounded-xl overflow-hidden shadow-3xs transition-all ${
                            foodInt.severity === "CRITICAL"
                              ? "border-rose-200 bg-rose-50/10"
                              : foodInt.severity === "WARNING"
                              ? "border-amber-200 bg-amber-50/10"
                              : "border-emerald-200 bg-emerald-50/10"
                          }`}
                        >
                          {/* Header */}
                          <div
                            className={`px-4 py-3 flex items-center justify-between border-b ${
                              foodInt.severity === "CRITICAL"
                                ? "bg-rose-50 border-rose-100 text-rose-950"
                                : foodInt.severity === "WARNING"
                                ? "bg-amber-50 border-amber-100 text-amber-950"
                                : "bg-emerald-50 border-emerald-100 text-emerald-950"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {foodInt.severity === "CRITICAL" ? (
                                <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                              ) : foodInt.severity === "WARNING" ? (
                                <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                              ) : (
                                <Info className="w-4.5 h-4.5 text-emerald-600" />
                              )}
                              <span className="font-bold text-xs uppercase tracking-wider font-mono text-[10px]">
                                {foodInt.severity === "CRITICAL" ? "KONTRAINDIKASI MAKANAN / KRITIS" : foodInt.severity === "WARNING" ? "PERINGATAN KONSUMSI / MODERAT" : "INFORMASI PENYERAPAN / RINGAN"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                              foodInt.severity === "CRITICAL"
                                ? "bg-rose-600 border-rose-700 text-white"
                                : foodInt.severity === "WARNING"
                                ? "bg-amber-600 border-amber-700 text-white"
                                : "bg-emerald-600 border-emerald-700 text-white"
                            }`}>
                              {foodInt.severity}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-3.5 text-xs leading-normal">
                            {/* Drug and Food Involved */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Korelasi:</span>
                              <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10.5px] border border-emerald-100">Obat: {foodInt.drugName}</span>
                                <span className="text-slate-400 font-normal">↔</span>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10.5px] border border-amber-100">Makanan/Zat: {foodInt.foodName}</span>
                              </div>
                            </div>

                            {/* Mechanism */}
                            <div className="space-y-1">
                              <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Mekanisme Reaksi & Biofarmasetika:</h5>
                              <p className="text-slate-700 leading-relaxed font-sans text-xs">{foodInt.mechanism}</p>
                            </div>

                            {/* Recommendation */}
                            <div className="space-y-1 bg-slate-50 border border-slate-200/50 p-3 rounded-lg">
                              <h5 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Panduan & Petunjuk Konsumsi Aman:
                              </h5>
                              <p className="text-slate-700 font-semibold leading-relaxed font-sans text-[11px]">{foodInt.recommendation}</p>
                            </div>

                            {/* Evidence */}
                            {foodInt.evidence && (
                              <div className="space-y-1 bg-emerald-50/40 border border-emerald-100/60 p-3 rounded-lg">
                                <h5 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-tight flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sumber Kepustakaan / Referensi:
                                </h5>
                                <p className="text-slate-600 font-sans text-[11px] leading-relaxed italic">{foodInt.evidence}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            };

            return (
              <div className="space-y-6">
                {/* SUB-TABS SELECTOR */}
                <div className="flex border border-slate-200 bg-white rounded-xl overflow-hidden shadow-3xs p-1 gap-1">
                  <button
                    onClick={() => setDdiSubTab("drug")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      ddiSubTab === "drug"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Interaksi Antar-Obat</span>
                    {detectedInteractions.length > 0 ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold leading-none ${
                        ddiSubTab === "drug" 
                          ? "bg-rose-500 text-white" 
                          : (criticalCount > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")
                      }`}>
                        {detectedInteractions.length}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 leading-none">
                        0
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setDdiSubTab("food")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      ddiSubTab === "food"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Interaksi Obat & Makanan</span>
                    {detectedFoodInteractions.length > 0 ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold leading-none ${
                        ddiSubTab === "food"
                          ? "bg-rose-500 text-white"
                          : (criticalFoodCount > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")
                      }`}>
                        {detectedFoodInteractions.length}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 leading-none">
                        0
                      </span>
                    )}
                  </button>
                </div>

                {ddiSubTab === "food" ? renderFoodInteractions() : (
                  <>
                    {/* 1. SECURITY STATUS HERO BANNER */}
                    {detectedInteractions.length === 0 ? (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-3xs">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                        Rejimen Terapi Aman (Tidak Ada Interaksi Terdaftar)
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Lolos Audit</span>
                      </h4>
                      <p className="text-xs text-emerald-850 leading-relaxed font-sans">
                        Tidak ditemukan interaksi kontraindikasi mayor, kritis, atau bermakna secara klinis di antara <strong className="text-emerald-950 font-bold">{ddiSelectedIds.length} obat</strong> terpilih dalam database klinis kami.
                      </p>
                      <p className="text-[10px] text-slate-400 italic pt-1 leading-normal font-sans">
                        *Disclaimer: Sistem menyaring kecocokan farmakologis berbasis pustaka jurnal kedokteran terverifikasi. Keputusan klinis akhir tetap berada di bawah wewenang dokter/apoteker penanggung jawab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`border rounded-2xl p-5 flex items-start gap-4 shadow-3xs ${
                    criticalCount > 0 ? "bg-rose-50 border-rose-200/60" : "bg-amber-50 border-amber-200/60"
                  }`}>
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      criticalCount > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${criticalCount > 0 ? "animate-bounce" : ""}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className={`text-sm font-bold flex items-center flex-wrap gap-2 ${
                        criticalCount > 0 ? "text-rose-950" : "text-amber-950"
                      }`}>
                        Perhatian Keamanan! Terdeteksi Potensi Interaksi Obat
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          criticalCount > 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                        }`}>
                          {criticalCount > 0 ? "KRITIS" : "PERINGATAN KLINIS"}
                        </span>
                      </h4>
                      <p className={`text-xs leading-relaxed font-sans ${
                        criticalCount > 0 ? "text-rose-850 font-medium" : "text-amber-850 font-medium"
                      }`}>
                        Ditemukan <strong className="font-extrabold">{detectedInteractions.length} potensi interaksi</strong> di antara <strong className="font-extrabold">{ddiSelectedIds.length} obat</strong> yang Anda pilih ({criticalCount} Kritis, {warningCount} Moderat). Silakan tinjau matriks pemetaan dan rincian referensi klinis di bawah ini.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. CLINICAL INTERACTION MATRIX (Visual Grid) */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-slate-800 text-emerald-400 rounded-md">
                        <GitCompare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">Matriks Hubungan Interaksi (DDI Matrix Mapping)</h3>
                        <p className="text-[10px] text-slate-400 font-sans tracking-normal font-medium">Pemetaan hubungan silang antar obat secara visual</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-900 font-bold">
                      {ddiSelectedIds.length} x {ddiSelectedIds.length} Grid
                    </span>
                  </div>

                  <div className="p-5 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full border-collapse border border-slate-100 rounded-lg overflow-hidden text-center text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150">
                            <th className="p-3 text-left font-bold text-slate-500 w-[180px] border-r border-slate-100">Daftar Obat</th>
                            {ddiSelectedIds.map((id, index) => {
                              const p = drugPresets.find(x => x.id === id);
                              return (
                                <th key={id} className="p-3 font-extrabold text-slate-700 border-r border-slate-100 max-w-[120px] truncate" title={p?.name}>
                                  [{index + 1}] {p?.name.split(" - ")[0]}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {ddiSelectedIds.map((idRow, rowIndex) => {
                            const pRow = drugPresets.find(x => x.id === idRow);
                            return (
                              <tr key={idRow} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                                <td className="p-3 text-left font-bold text-slate-800 bg-slate-50/50 border-r border-slate-150">
                                  <span className="inline-block w-4.5 h-4.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-mono font-bold text-center leading-4.5 mr-1.5">
                                    {rowIndex + 1}
                                  </span>
                                  {pRow?.name.split(" - ")[0]}
                                </td>
                                {ddiSelectedIds.map((idCol, colIndex) => {
                                  if (rowIndex === colIndex) {
                                    return (
                                      <td key={idCol} className="p-3 bg-slate-100/60 text-slate-400 font-mono text-[10px] font-bold border-r border-slate-100">
                                        SELF
                                      </td>
                                    );
                                  }

                                  const ints = checkInteractions(idRow, idCol);
                                  const hasInt = ints.length > 0;
                                  const severity = hasInt ? ints[0].severity : "SAFE";

                                  return (
                                    <td
                                      key={idCol}
                                      className={`p-3 border-r border-slate-100 font-sans font-bold transition-all ${
                                        severity === "CRITICAL"
                                          ? "bg-rose-500 text-white shadow-inner"
                                          : severity === "WARNING"
                                          ? "bg-amber-400 text-slate-900 shadow-inner"
                                          : severity === "INFO"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-emerald-50 text-emerald-800"
                                      }`}
                                    >
                                      {severity === "CRITICAL" ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                                          <span className="text-[9px] uppercase tracking-tighter">KRITIS</span>
                                        </div>
                                      ) : severity === "WARNING" ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <AlertCircle className="w-4 h-4 text-slate-900 shrink-0" />
                                          <span className="text-[9px] uppercase tracking-tighter">MODERAT</span>
                                        </div>
                                      ) : severity === "INFO" ? (
                                        <div className="flex flex-col items-center gap-0.5 text-emerald-700">
                                          <Info className="w-4 h-4 shrink-0" />
                                          <span className="text-[9px] uppercase tracking-tighter">INFO</span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center gap-0.5 text-emerald-600">
                                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                                          <span className="text-[9px] uppercase tracking-tighter font-semibold">AMAN</span>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 3. LOG OF DETECTED CLINICAL INTERACTIONS */}
                {detectedInteractions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-500" />
                        Detail Interaksi Klinis Terdeteksi ({detectedInteractions.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 italic font-sans font-medium">Berdasarkan Kepustakaan Jurnal FDA & GINA</span>
                    </div>

                    {detectedInteractions.map((interaction, index) => (
                      <div
                        key={interaction.id + "_" + index}
                        className={`border rounded-xl overflow-hidden shadow-3xs transition-all ${
                          interaction.severity === "CRITICAL"
                            ? "border-rose-200 bg-rose-50/10"
                            : "border-amber-200 bg-amber-50/10"
                        }`}
                      >
                        {/* Header */}
                        <div
                          className={`px-4 py-3 flex items-center justify-between border-b ${
                            interaction.severity === "CRITICAL"
                              ? "bg-rose-50 border-rose-100 text-rose-950"
                              : "bg-amber-50 border-amber-100 text-amber-950"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {interaction.severity === "CRITICAL" ? (
                              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                            ) : (
                              <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                            )}
                            <span className="font-bold text-xs uppercase tracking-wider font-mono">
                              {interaction.severity === "CRITICAL" ? "KRITIS / BAHAYA TINGGI" : "PERINGATAN KLINIS / MODERAT"}
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                            interaction.severity === "CRITICAL"
                              ? "bg-rose-600 border-rose-700 text-white"
                              : "bg-amber-600 border-amber-700 text-white"
                          }`}>
                            {interaction.severity}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3.5 text-xs leading-normal">
                          {/* Drugs Involved */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kombinasi Obat:</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10.5px] border border-emerald-100">{interaction.drugAName}</span>
                              <span className="text-slate-400 font-normal">+</span>
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10.5px] border border-rose-100">{interaction.drugBName}</span>
                            </div>
                          </div>

                          {/* Pharmacology Mechanism */}
                          <div className="space-y-1">
                            <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Mekanisme Farmakologi:</h5>
                            <p className="text-slate-700 leading-relaxed font-sans text-xs">{interaction.mechanism}</p>
                          </div>

                          {/* Recommendation */}
                          <div className="space-y-1 bg-slate-50 border border-slate-200/50 p-3 rounded-lg">
                            <h5 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Panduan & Rekomendasi Medis:
                            </h5>
                            <p className="text-slate-700 font-semibold leading-relaxed font-sans text-[11px]">{interaction.recommendation}</p>
                          </div>

                          {/* Evidence Based */}
                          {interaction.evidence && (
                            <div className="space-y-1 bg-emerald-50/40 border border-emerald-100/60 p-3 rounded-lg">
                              <h5 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-tight flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Evidence-Based / Referensi Jurnal:
                              </h5>
                              <p className="text-slate-600 font-sans text-[11px] leading-relaxed italic">{interaction.evidence}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>
            );
          })()}
        </section>
      </>
    ) : activeTab === "map" ? (
      <>
        {/* MAP FACILITIES TAB */}
        <section className="lg:col-span-12 w-full">
          <MapFacilities isAdmin={isAdmin} />
        </section>
      </>
    ) : activeTab === "iv" ? (
      <>
        {/* IV COMPATIBILITY TAB */}
        <section className="lg:col-span-12 w-full">
          <IvCompatibilityChecker isAdmin={isAdmin} />
        </section>
      </>
    ) : activeTab === "diseases" ? (
      <>
        {/* DISEASES & CONDITIONS TAB */}
        <section className="lg:col-span-12 w-full">
          <DiseasesConditions />
        </section>
      </>
    ) : activeTab === "medcalc" ? (
      <>
        {/* MEDICAL CALCULATORS TAB */}
        <section className="lg:col-span-12 w-full">
          <MedicalCalculators />
        </section>
      </>
    ) : activeTab === "pharmacist" ? (
      <>
        {/* PHARMACIST CONSULTATION TAB */}
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
          <PharmacistConsultation isAdmin={isAdmin} />
        </section>
      </>
    ) : activeTab === "fornas" ? (
      <>
        {/* FORNAS TAB */}
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <FornasDrugs isAdmin={isAdmin} />
        </section>
      </>
    ) : activeTab === "soap" ? (
      <>
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white p-6">
          <ClinicalSOAP />
        </section>
      </>
    ) : activeTab === "desc" ? (
      <>
        {/* DRUG DESCRIPTION TAB */}
        {/* Left Column: Filter and Category selector */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Filter & Kategori</h3>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cari Obat / Indikasi</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama atau indikasi..."
                  value={descSearchQuery}
                  onChange={(e) => setDescSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Category Buttons */}
            {isAdmin && (
              <div className="mb-4">
                <button
                  onClick={() => setIsUpdateDrugModalOpen(true)}
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Update Informasi Obat
                </button>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Terapi</label>
              <div className="space-y-1">
                {[
                  { id: "all", label: "Semua Kategori" },
                  { id: "antibiotik", label: "Antibiotik & Anti-infeksi" },
                  { id: "analgetik", label: "Analgetik & Antipiretik" },
                  { id: "kardio", label: "Kardiovaskular & Diuretik" },
                  { id: "pernapasan", label: "Pernapasan & Alergi" },
                  { id: "gastro", label: "Gastrointestinal" },
                  { id: "hormon", label: "Hormon & Kortikosteroid" },
                  { id: "onkologi", label: "Onkologi" },
                  { id: "lainnya", label: "Lain-lain & Suplemen" }
                ].map((cat) => {
                  const count = cat.id === "all" 
                    ? drugPresets.length 
                    : drugPresets.filter(p => {
                        const info = getDrugCategory(p.id, p.name);
                        const label = info.label.toLowerCase();
                        if (cat.id === "antibiotik") return label.includes("antibiotik") || label.includes("anti-infeksi");
                        if (cat.id === "analgetik") return label.includes("analgetik");
                        if (cat.id === "kardio") return label.includes("kardiovaskular");
                        if (cat.id === "pernapasan") return label.includes("pernapasan");
                        if (cat.id === "gastro") return label.includes("gastrointestinal");
                        if (cat.id === "hormon") return label.includes("hormon");
                        if (cat.id === "onkologi") return label.includes("onkologi");
                        return label.includes("lain-lain") || label.includes("suplemen");
                      }).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setDescSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        descSelectedCategory === cat.id
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        descSelectedCategory === cat.id ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Berdasarkan Alfabet</label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setDescSelectedAlphabet("all")}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    descSelectedAlphabet === "all" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Semua
                </button>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                  const hasDrugs = drugPresets.some(p => p.name.charAt(0).toUpperCase() === letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => hasDrugs && setDescSelectedAlphabet(letter)}
                      disabled={!hasDrugs}
                      className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${
                        descSelectedAlphabet === letter
                          ? "bg-emerald-600 text-white shadow-xs"
                          : hasDrugs
                          ? "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                          : "bg-transparent text-slate-300 cursor-not-allowed border border-slate-100/50"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick info panel */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-teal-900/30">
            <div className="flex items-center gap-2 border-b border-teal-900/40 pb-3 mb-3">
              <Info className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight text-white">Panduan Informasi</h3>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed mb-3 font-sans">
              Informasi obat disadur dari Kepustakaan Medis Terkemuka, Farmakope Indonesia, FDA, dan Buku Saku Pediatrik.
            </p>
            <div className="border border-teal-900/55 rounded-lg p-2.5 bg-white/5 space-y-2">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase tracking-wide">Kategori Keamanan FDA:</span>
              <div className="grid grid-cols-5 gap-1 text-[11px] font-mono text-center font-bold">
                <span className="bg-emerald-600/35 border border-emerald-500/30 rounded text-emerald-300">A</span>
                <span className="bg-emerald-500/25 border border-emerald-400/20 rounded text-emerald-200">B</span>
                <span className="bg-amber-500/25 border border-amber-400/20 rounded text-amber-200">C</span>
                <span className="bg-rose-500/25 border border-rose-400/20 rounded text-rose-200">D</span>
                <span className="bg-rose-600/35 border border-rose-500/30 rounded text-rose-300">X</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: List of Drugs */}
        <section className="lg:col-span-9 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Direktori & Deskripsi Obat</h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Tinjau deskripsi, komposisi, indikasi, kontraindikasi, serta keamanan bagi ibu hamil & menyusui.</p>
            </div>
            <span className="text-xs font-bold font-sans bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
              Menampilkan {
                drugPresets.filter(p => {
                  // Search filter
                  const matchesSearch = p.name.toLowerCase().includes(descSearchQuery.toLowerCase()) || 
                    p.indication.toLowerCase().includes(descSearchQuery.toLowerCase());
                  
                  if (!matchesSearch) return false;

                  // Category filter
                  if (descSelectedCategory !== "all") {
                    const info = getDrugCategory(p.id, p.name);
                    const label = info.label.toLowerCase();
                    if (descSelectedCategory === "antibiotik" && !(label.includes("antibiotik") || label.includes("anti-infeksi"))) return false;
                    if (descSelectedCategory === "analgetik" && !label.includes("analgetik")) return false;
                    if (descSelectedCategory === "kardio" && !label.includes("kardiovaskular")) return false;
                    if (descSelectedCategory === "pernapasan" && !label.includes("pernapasan")) return false;
                    if (descSelectedCategory === "gastro" && !label.includes("gastrointestinal")) return false;
                    if (descSelectedCategory === "hormon" && !label.includes("hormon")) return false;
                    if (descSelectedCategory === "onkologi" && !label.includes("onkologi")) return false;
                    if (descSelectedCategory === "lainnya" && !(label.includes("lain-lain") || label.includes("suplemen"))) return false;
                  }

                  // Alphabet filter
                  if (descSelectedAlphabet !== "all") {
                    if (p.name.charAt(0).toUpperCase() !== descSelectedAlphabet) return false;
                  }
                  
                  return true;
                }).length
              } dari {drugPresets.length} Obat
            </span>
          </div>

          <div className="space-y-6">
            {(() => {
              const filteredList = drugPresets.filter(p => {
                // Search filter
                const matchesSearch = p.name.toLowerCase().includes(descSearchQuery.toLowerCase()) || 
                  p.indication.toLowerCase().includes(descSearchQuery.toLowerCase());
                
                if (!matchesSearch) return false;

                // Category filter
                if (descSelectedCategory !== "all") {
                  const info = getDrugCategory(p.id, p.name);
                  const label = info.label.toLowerCase();
                  if (descSelectedCategory === "antibiotik" && !(label.includes("antibiotik") || label.includes("anti-infeksi"))) return false;
                  if (descSelectedCategory === "analgetik" && !label.includes("analgetik")) return false;
                  if (descSelectedCategory === "kardio" && !label.includes("kardiovaskular")) return false;
                  if (descSelectedCategory === "pernapasan" && !label.includes("pernapasan")) return false;
                  if (descSelectedCategory === "gastro" && !label.includes("gastrointestinal")) return false;
                  if (descSelectedCategory === "hormon" && !label.includes("hormon")) return false;
                  if (descSelectedCategory === "onkologi" && !label.includes("onkologi")) return false;
                  if (descSelectedCategory === "lainnya" && !(label.includes("lain-lain") || label.includes("suplemen"))) return false;
                }

                // Alphabet filter
                if (descSelectedAlphabet !== "all") {
                  if (p.name.charAt(0).toUpperCase() !== descSelectedAlphabet) return false;
                }
                
                return true;
              }).sort((a, b) => a.name.localeCompare(b.name));

              const groupedByAlphabet = filteredList.reduce((acc, preset) => {
                const firstLetter = preset.name.charAt(0).toUpperCase();
                if (!acc[firstLetter]) acc[firstLetter] = [];
                acc[firstLetter].push(preset);
                return acc;
              }, {} as Record<string, typeof drugPresets>);

              return Object.keys(groupedByAlphabet).sort().map(letter => (
                <div key={letter} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2 mt-4 first:mt-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {letter}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Obat {letter}</h3>
                  </div>
                  <div className="space-y-4">
                    {groupedByAlphabet[letter].map((preset) => {
                      const categoryInfo = getDrugCategory(preset.id, preset.name);
                      const formInfo = getDrugFormulation(preset);
                      const metadata = getDrugMetadata(preset);
                      const isExpanded = descExpandedId === preset.id;

                      return (
                <div
                  key={"desc_" + preset.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all duration-200"
                >
                  {/* Card Header (Visible initially) */}
                  <div
                    onClick={() => setDescExpandedId(isExpanded ? null : preset.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.bg} ${categoryInfo.color} ${categoryInfo.border}`}>
                          {categoryInfo.label}
                        </span>

                        {/* Drug Classification Logo */}
                        {metadata.drugClass && (
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                            {metadata.drugClass === "Obat Keras" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center ring-1 ring-black">
                                <span className="text-[8px] font-black text-white leading-none mt-0.5">K</span>
                              </div>
                            )}
                            {metadata.drugClass === "Obat Bebas Terbatas" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-black flex items-center justify-center"></div>
                            )}
                            {metadata.drugClass === "Obat Bebas" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-black flex items-center justify-center"></div>
                            )}
                            <span className="text-[10px] font-bold text-slate-700">{metadata.drugClass}</span>
                          </div>
                        )}

                        {/* Generic & Brand Indicator */}
                        {metadata.genericName.toLowerCase() === metadata.brandName.toLowerCase() ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700 flex items-center gap-1 shadow-2xs">
                            <span className="text-[8px] bg-white text-slate-800 rounded-sm px-1 py-0.5 leading-none font-black uppercase">G</span>
                            Generik
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shadow-2xs">
                            <span className="text-[8px] bg-amber-700 text-amber-50 rounded-sm px-1 py-0.5 leading-none font-black uppercase">B</span>
                            Obat Bermerek / Paten
                          </span>
                        )}

                        {/* Formulation Indicator */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${formInfo.bg} ${formInfo.color} ${formInfo.border}`}>
                          <span>{formInfo.icon}</span>
                          {formInfo.label}
                        </span>
                        
                        {/* Pregnancy Category Indicator */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          metadata.pregnancySafety.status === "Aman"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : metadata.pregnancySafety.status === "Kontraindikasi"
                            ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}>
                          <Baby className="w-3 h-3 shrink-0" />
                          Hamil: {metadata.pregnancySafety.category} ({metadata.pregnancySafety.status})
                        </span>

                        {/* Breastfeeding indicator */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          metadata.breastfeedingSafety.status === "Aman"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : metadata.breastfeedingSafety.status === "Kontraindikasi"
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          Menyusui: {metadata.breastfeedingSafety.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {metadata.brandName}
                        {metadata.genericName !== metadata.brandName && (
                          <span className="text-xs text-slate-500 font-medium font-sans">({metadata.genericName})</span>
                        )}
                      </h3>

                      <p className="text-xs text-slate-600 font-sans leading-relaxed flex items-center gap-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-tight shrink-0 text-[10px]">Indikasi:</span>
                        <span>{preset.indication}</span>
                      </p>
                    </div>

                    <button
                      className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <ChevronRight className={`w-4.5 h-4.5 transition-transform ${isExpanded ? "rotate-90 text-emerald-600" : ""}`} />
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 p-5 space-y-5 animate-slideDown text-xs">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Section: Kategori Obat & Cara Kerja */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Kategori & Cara Kerja Obat
                          </h4>
                          <div className="space-y-2.5">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Kategori Terapi:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-semibold">{metadata.categoryInfo}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Mekanisme Kerja (Farmakodinamik):</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">{metadata.mechanism}</p>
                            </div>
                          </div>
                        </div>

                        {/* Section: Dosis & Aturan Pakai */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            Dosis & Aturan Pakai
                          </h4>
                          <div className="space-y-2.5">
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                              {metadata.dosageRule}
                            </p>
                            <div className="space-y-0.5 mt-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Cara Penggunaan yang Benar:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium flex gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{metadata.usageGuide}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Section: Peringatan & Efek Samping */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Peringatan & Efek Samping
                          </h4>
                          <div className="space-y-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-tight block flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Peringatan / Perhatian:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">{metadata.precautions}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Kontraindikasi Mutlak:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">{metadata.contraindication}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block flex items-center gap-1"><Activity className="w-3 h-3" /> Efek Samping Umum:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">{metadata.sideEffects}</p>
                            </div>
                          </div>
                        </div>

                        {/* Section: Beyond Use Date */}
                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            Stabilitas & Beyond Use Date (Setelah Kemasan Dibuka)
                          </h4>
                          <div className="space-y-2.5">
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                              {metadata.bud}
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Section 3: Keamanan Hamil & Menyusui */}
                      <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                          <Baby className="w-4 h-4 text-emerald-600" />
                          Keamanan Ibu Hamil & Menyusui (Clinical Review)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* Keamanan Hamil */}
                          <div className={`p-4 rounded-xl border ${
                            metadata.pregnancySafety.status === "Aman"
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-950"
                              : metadata.pregnancySafety.status === "Kontraindikasi"
                              ? "bg-rose-50/40 border-rose-150 text-rose-950"
                              : "bg-amber-50/40 border-amber-150 text-amber-950"
                          } space-y-2`}>
                            <h5 className="font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-black border ${
                                metadata.pregnancySafety.status === "Aman"
                                  ? "bg-emerald-600 border-emerald-700 text-white"
                                  : metadata.pregnancySafety.status === "Kontraindikasi"
                                  ? "bg-rose-600 border-rose-700 text-white animate-pulse"
                                  : "bg-amber-600 border-amber-700 text-white"
                              }`}>
                                Kategori {metadata.pregnancySafety.category}
                              </span>
                              <span>Pemberian Saat Kehamilan</span>
                            </h5>
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                              {metadata.pregnancySafety.detail}
                            </p>
                          </div>

                          {/* Keamanan Menyusui */}
                          <div className={`p-4 rounded-xl border ${
                            metadata.breastfeedingSafety.status === "Aman"
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-950"
                              : metadata.breastfeedingSafety.status === "Kontraindikasi"
                              ? "bg-rose-50/40 border-rose-150 text-rose-950"
                              : "bg-amber-50/40 border-amber-150 text-amber-950"
                          } space-y-2`}>
                            <h5 className="font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-black border ${
                                metadata.breastfeedingSafety.status === "Aman"
                                  ? "bg-emerald-600 border-emerald-700 text-white"
                                  : metadata.breastfeedingSafety.status === "Kontraindikasi"
                                  ? "bg-rose-600 border-rose-700 text-white"
                                  : "bg-amber-600 border-amber-700 text-white"
                              }`}>
                                {metadata.breastfeedingSafety.status.toUpperCase()}
                              </span>
                              <span>Pemberian Saat Menyusui</span>
                            </h5>
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                              {metadata.breastfeedingSafety.detail}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Card Actions: Quick Calculate */}
                      <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 italic font-sans font-medium">Klik tombol di sebelah kanan untuk langsung melakukan kalkulasi dosis aman bagi pasien</span>
                        
                        <button
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            
                            // Get the true preset reference
                            const realPreset = drugPresets.find(x => x.id === preset.id);
                            if (realPreset) {
                              setSelectedPreset(realPreset);
                              
                              setInputs(prev => ({
                                ...prev,
                                calcMethod: realPreset.calcMethod,
                                targetDoseValue: realPreset.defaultDoseValue,
                                doseUnit: realPreset.doseUnit,
                                frequency: realPreset.frequency,
                                liquidConcentrationValue: realPreset.liquidConcentrationValue || "",
                                liquidConcentrationVolume: realPreset.liquidConcentrationVolume || ""
                              }));
                            }
                            
                            // Go back to the single calculator tab
                            setActiveTab("single");
                            
                            // Scroll up smoothly to calculations
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 self-end text-xs"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Mulai Hitung Dosis</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>
      </>
    ) : (
      <>
        {/* VIDEO PENGGUNAAN OBAT KHUSUS TAB */}
        {(() => {
          const SPECIAL_ADMINS = [
            {
              id: "suppositoria",
              title: "Penggunaan Suppositoria",
              device: "Suppositoria Rektal",
              subtitle: "Pemberian obat padat berbentuk torpedo melalui dubur untuk penyerapan cepat (misal: antipiretik atau laksatif).",
              imageUrl: suppositoriaImg,
              storage: "Wajib disimpan di Lemari Es (suhu 2°C - 8°C). Jangan dibekukan. Jika terlalu lunak sebelum dipakai, rendam sebentar dalam wadah tertutup berisi air dingin atau simpan di kulkas beberapa menit.",
              steps: [
                {
                  title: "Higienisasi Tangan",
                  desc: "Cuci tangan Anda secara menyeluruh menggunakan sabun antiseptik dan air mengalir sebelum memegang obat."
                },
                {
                  title: "Persiapan Sediaan",
                  desc: "Buka kemasan foil suppositoria secara perlahan. Jika ujung obat terasa kesat, basahi ujungnya dengan sedikit air bersih atau pelumas berbasis air (water-soluble lubricant) untuk mempermudah pemasukan."
                },
                {
                  title: "Atur Posisi Tubuh",
                  desc: "Berbaringlah miring ke salah satu sisi (Posisi Sims). Luruskan kaki bagian bawah, dan tekuk lutut kaki bagian atas ke arah dada untuk membuka area rektum."
                },
                {
                  title: "Penyisipan Obat",
                  desc: "Masukkan suppositoria ke dalam lubang dubur dengan bagian ujung lancip terlebih dahulu. Dorong perlahan menggunakan jari telunjuk sedalam sekitar 1 ruas jari pada anak-anak atau sekitar 2-3 cm pada orang dewasa."
                },
                {
                  title: "Pertahankan Posisi",
                  desc: "Rapatkan kedua paha dan tetaplah berbaring miring selama minimal 5-10 menit. Langkah ini krusial agar suppositoria meleleh sepenuhnya oleh suhu tubuh dan tidak terdorong keluar kembali."
                },
                {
                  title: "Dekontaminasi Akhir",
                  desc: "Cuci tangan Anda kembali dengan sabun dan air mengalir setelah seluruh prosedur selesai untuk menjaga higienitas."
                }
              ],
              dos: [
                "Simpan suppositoria di dalam lemari es (bukan freezer) agar bentuknya tetap padat dan mudah disisipkan.",
                "Jika dosis yang diinstruksikan dokter hanya setengah, potong suppositoria secara vertikal (membujur) menggunakan silet steril agar pembagian zat aktif merata.",
                "Gunakan sarung tangan sekali pakai (apabila ada) untuk kenyamanan dan kebersihan ekstra."
              ],
              donts: [
                "Jangan memotong suppositoria secara horizontal (melintang), karena distribusi bahan obat aktif di dalam basis supositoria tidak merata.",
                "Hindari mengejan atau buang air besar (defekasi) setidaknya selama 1 jam pertama setelah pemasukan obat agar penyerapan zat aktif maksimal."
              ],
              counseling: [
                "Bila obat keluar kembali dalam kondisi belum meleleh penuh, masukkan kembali menggunakan jari telunjuk yang bersih sedalam mungkin melampaui sfingter ani.",
                "Untuk anak yang rewel, dekap paha anak dalam posisi merapat selama beberapa menit setelah suppositoria dimasukkan."
              ]
            },
            {
              id: "inhaler",
              title: "Penggunaan Inhaler (MDI)",
              device: "Metered Dose Inhaler",
              subtitle: "Pemberian obat bronkodilator atau kortikosteroid langsung ke paru-paru menggunakan inhaler semprot takaran terbatas.",
              imageUrl: inhalerImg,
              storage: "Simpan pada suhu ruangan kering (15°C - 25°C). Hindarkan dari paparan sinar matahari langsung, suhu panas ekstrem, atau pembekuan. Pastikan penutup mulut selalu terpasang saat tidak digunakan.",
              steps: [
                {
                  title: "Pemeriksaan Alat",
                  desc: "Lepaskan penutup corong inhaler. Periksa corong mulut bagian dalam dan luar untuk memastikan tidak ada debu, kotoran, atau benda asing yang menyumbat."
                },
                {
                  title: "Homogenisasi Obat",
                  desc: "Pegang inhaler secara tegak dan kocok dengan kuat sebanyak 5-10 kali agar suspensi obat di dalam kanister tercampur dengan sempurna."
                },
                {
                  title: "Ekspirasi Maksimal",
                  desc: "Hembuskan napas sedalam-dalamnya melalui mulut secara perlahan, menjauhi corong inhaler, untuk mengosongkan udara dari paru-paru Anda."
                },
                {
                  title: "Inhalasi Sinkron",
                  desc: "Posisikan corong di antara gigi tanpa digigit, lalu rapatkan bibir di sekelilingnya. Mulailah menghirup napas perlahan lewat mulut, lalu tekan bagian atas kanister inhaler (satu semprotan) secara bersamaan sembari melanjutkan hirupan napas dalam-dalam."
                },
                {
                  title: "Retensi Napas",
                  desc: "Lepaskan inhaler dari mulut Anda. Pejamkan mata dan tahan napas selama 10 detik (atau senyaman yang Anda bisa) agar partikel obat dapat mengendap sempurna di dalam alveoli paru."
                },
                {
                  title: "Bilas Mulut (Gargle)",
                  desc: "Keluarkan napas secara perlahan. Jika Anda menggunakan inhaler golongan kortikosteroid, segeralah berkumur dengan air hangat dan buang airnya (jangan ditelan) untuk mencegah timbulnya sariawan (oral thrush) atau suara serak."
                }
              ],
              dos: [
                "Selalu gunakan alat bantu Spacer (tabung antara) terutama untuk anak-anak atau lansia untuk mengatasi masalah koordinasi hisapan.",
                "Pastikan untuk selalu menutup kembali corong inhaler segera setelah selesai digunakan agar tetap steril."
              ],
              donts: [
                "Jangan menekan tombol inhaler sebelum Anda mulai menghirup napas; hisapan dan semprotan harus dilakukan secara sinkron.",
                "Jangan menghirup napas terlalu cepat atau terburu-buru. Lakukan tarikan napas secara perlahan namun dalam."
              ],
              counseling: [
                "Jika dokter meresepkan lebih dari 1 semprotan (puff), berikan jeda waktu minimal 30 detik sampai 1 menit sebelum mengulangi langkah pengocokan dan semprotan berikutnya.",
                "Bersihkan corong plastik inhaler minimal seminggu sekali dengan air hangat mengalir lalu keringkan secara alami (jangan dilap tisu)."
              ]
            },
            {
              id: "tetes_mata",
              title: "Penggunaan Tetes Mata",
              device: "Obat Tetes Mata Steril",
              subtitle: "Pemberian sediaan cair steril langsung pada kantung mata untuk mengatasi infeksi, glaukoma, maupun mata kering.",
              imageUrl: tetesMataImg,
              storage: "Simpan pada suhu ruangan sejuk (15°C - 25°C). Hindari pembekuan. CATATAN PENTING: Obat tetes mata botol multi-dosis hanya boleh digunakan maksimal 30 hari setelah segel pertama kali dibuka, meskipun tanggal kedaluwarsa di kemasan masih lama.",
              steps: [
                {
                  title: "Aseptis Diri",
                  desc: "Cuci tangan Anda dengan sabun antiseptik sampai bersih dan keringkan. Pastikan ujung penetes mata tidak menyentuh permukaan apapun agar tetap steril."
                },
                {
                  title: "Pembentukan Kantung",
                  desc: "Dongakkan kepala Anda ke belakang. Tarik kelopak mata bawah Anda secara perlahan menggunakan jari telunjuk yang bersih sehingga membentuk kantung konjungtiva kecil."
                },
                {
                  title: "Penetesan Presisi",
                  desc: "Dekatkan botol penetes ke arah mata (jarak ±2 cm, jangan sampai ujung penetes menyentuh bola mata atau bulu mata). Tekan botol dengan lembut agar satu tetes obat jatuh tepat di dalam kantung tersebut."
                },
                {
                  title: "Pejaman Lembut",
                  desc: "Lepaskan tarikan jari pada kelopak mata bawah. Tutup mata Anda perlahan-lahan selama minimal 2-3 menit. Hindari mengedipkan mata berulang kali atau memejamkan mata terlalu kencang."
                },
                {
                  title: "Oklusi Lakrimalis",
                  desc: "Sembari mata terpejam, tekan sudut dalam mata Anda (dekat hidung) menggunakan ujung jari bersih selama 1-2 menit. Ini mencegah obat mengalir keluar melalui saluran air mata (duktus nasolakrimalis) ke tenggorokan sehingga menghindari efek samping sistemik."
                },
                {
                  title: "Finishing & Higienitas",
                  desc: "Lap sisa cairan yang mengalir ke pipi menggunakan tisu bersih. Tutup kembali botol tetes mata dengan rapat tanpa menyentuh atau mengelap ujung penetesnya."
                }
              ],
              dos: [
                "Lepaskan lensa kontak sebelum meneteskan obat, dan pasang kembali minimal 15 menit setelah penetesan.",
                "Gunakan obat tetes mata terlebih dahulu sebelum salep mata jika Anda diresepkan kedua jenis sediaan tersebut."
              ],
              donts: [
                "Jangan membiarkan ujung penetes menyentuh jari, kelopak mata, atau bola mata Anda untuk mencegah penularan kuman atau kerusakan sterilitas sediaan.",
                "Jangan menggosok atau mengucek mata Anda setelah penetesan obat."
              ],
              counseling: [
                "Jika Anda menggunakan lebih dari satu jenis obat tetes mata pada mata yang sama, berikan jeda waktu minimal 5-10 menit antarpemberian agar obat pertama tidak terbilas oleh obat kedua.",
                "Awal penetesan mungkin memicu pandangan buram sesaat. Hindari berkendara sampai penglihatan Anda kembali jernih sepenuhnya."
              ]
            },
            {
              id: "tetes_telinga",
              title: "Penggunaan Tetes Telinga",
              device: "Obat Tetes Telinga Steril",
              subtitle: "Pemberian obat tetes steril untuk mengatasi infeksi saluran telinga luar (otitis eksterna) atau melunakkan serumen.",
              imageUrl: tetesTelingaImg,
              storage: "Simpan pada suhu ruangan kering dan sejuk (15°C - 25°C). Tutup rapat botol setelah digunakan. Jauhkan dari jangkauan anak-anak.",
              steps: [
                {
                  title: "Penyesuaian Suhu",
                  desc: "Cuci tangan Anda. Genggam botol tetes telinga di telapak tangan selama 1-2 menit. Menghangatkan botol setara suhu tubuh sangat penting untuk mencegah efek pusing berputar (vertigo) akibat stimulasi termal cairan dingin di telinga dalam."
                },
                {
                  title: "Atur Posisi Kepala",
                  desc: "Miringkan kepala Anda ke samping atau berbaringlah dengan posisi telinga yang sakit menghadap ke atas."
                },
                {
                  title: "Pelebaran Liang Telinga",
                  desc: "Luruskan saluran telinga Anda: Untuk DEWASA, tarik daun telinga dengan lembut ke arah atas dan belakang. Untuk ANAK (< 3 tahun), tarik daun telinga ke arah bawah dan belakang."
                },
                {
                  title: "Aplikasi Tetesan",
                  desc: "Teteskan sejumlah obat sesuai dosis anjuran ke dalam liang telinga. Jaga agar ujung botol penetes tidak menyentuh daun telinga atau bagian dalam telinga Anda."
                },
                {
                  title: "Difusi & Absorpsi",
                  desc: "Tetap miringkan kepala atau berbaring miring selama 3-5 menit agar cairan obat mengalir sempurna ke bagian dalam saluran telinga."
                },
                {
                  title: "Pijatan Tragus",
                  desc: "Tekan dan pijat secara lembut bagian tragus (tonjolan tulang rawan kecil di depan lubang telinga) beberapa kali untuk mendorong gelembung udara keluar dan membantu obat menyebar merata."
                }
              ],
              dos: [
                "Pastikan telinga bersih dari cairan berlebih dengan menyekanya lembut menggunakan tisu sebelum penetesan.",
                "Mintalah bantuan orang lain jika kesulitan meneteskan secara mandiri agar dosis yang masuk akurat."
              ],
              donts: [
                "Jangan meneteskan obat jika dicurigai atau diketahui gendang telinga Anda robek/perforasi, kecuali diresepkan khusus oleh dokter spesialis THT.",
                "Jangan menyumbat saluran telinga terlalu dalam dengan kapas biasa setelah penetesan karena kapas dapat menyerap obat kembali."
              ],
              counseling: [
                "Cairan obat yang terasa dingin di dalam telinga dapat memicu refleks batuk atau pusing sesaat. Hal ini normal, namun dapat diminimalisir dengan menghangatkan botol di tangan terlebih dahulu.",
                "Jika setelah beberapa hari telinga terasa gatal menyengat atau nyeri bertambah parah, segera hentikan pemakaian dan konsultasikan ke dokter."
              ]
            },
            {
              id: "semprot_hidung",
              title: "Penggunaan Semprot Hidung",
              device: "Nasal Spray Aerosol",
              subtitle: "Aplikasi obat semprot hidung (nasal spray) untuk meredakan inflamasi mukosa, kongesti, atau rinitis alergi.",
              imageUrl: semprotHidungImg,
              storage: "Simpan pada suhu ruangan kering (15°C - 30°C). Jangan dibekukan. Bersihkan ujung aplikator semprot dengan tisu bersih setelah digunakan dan selalu pasang penutup plastik pelindung.",
              steps: [
                {
                  title: "Pembersihan Rongga",
                  desc: "Hembuskan napas secara perlahan melalui hidung untuk membersihkan rongga hidung dari ingus atau sumbatan sebelum menyemprotkan obat."
                },
                {
                  title: "Uji Semprotan (Priming)",
                  desc: "Cuci tangan Anda, kocok botol semprot hidung dengan baik. Jika baru pertama kali digunakan atau sudah lama tidak dipakai, semprotkan obat ke udara beberapa kali sampai keluar kabut halus yang merata."
                },
                {
                  title: "Posisi Kepala Menunduk",
                  desc: "Tundukkan kepala Anda sedikit ke depan (pandangan mengarah ke arah ujung kaki Anda, bukan mendongak)."
                },
                {
                  title: "Injeksi Mengarah Luar",
                  desc: "Masukkan ujung aplikator semprot ke dalam salah satu lubang hidung. Arahkan ujung aplikator ke sudut luar mata (ke arah luar/lateral, bukan ke arah septum/sekat tengah hidung) untuk mencegah iritasi septum."
                },
                {
                  title: "Semprot & Hisap Halus",
                  desc: "Tutup lubang hidung yang lain menggunakan jari tangan Anda yang bebas. Tekan pompa aplikator dengan gerakan cepat dan kuat, sembari menghirup napas perlahan dan lembut melalui lubang hidung tersebut."
                },
                {
                  title: "Ekspirasi Oral",
                  desc: "Keluarkan ujung semprotan dari hidung Anda dan hembuskan napas secara perlahan melalui mulut. Hindari membuang ingus (bersin) atau mendongakkan kepala ke belakang setidaknya selama 10-15 menit agar obat tidak tertelan."
                }
              ],
              dos: [
                "Gunakan ibu jari di bagian bawah botol dan jari telunjuk serta jari tengah di bagian bahu botol semprot untuk memompa dengan stabil.",
                "Bersihkan ujung semprotan hidung dengan air hangat minimal seminggu sekali agar tidak tersumbat obat kering."
              ],
              donts: [
                "Jangan mengarahkan semprotan langsung ke septum (sekat tengah hidung) karena dapat memicu iritasi kronis, luka, hingga mimisan.",
                "Jangan mendongakkan kepala ke belakang saat atau segera setelah menyemprot, karena obat akan mengalir ke tenggorokan dan tertelan, mengurangi efektivitas lokalnya."
              ],
              counseling: [
                "Jika Anda merasakan rasa pahit di tenggorokan setelah pemakaian, minumlah segelas air putih untuk menghilangkannya.",
                "Jangan pernah meminjamkan semprot hidung Anda kepada orang lain karena kontaminasi silang bakteri/virus sangat mudah terjadi melalui mukosa hidung."
              ]
            },
            {
              id: "pena_insulin",
              title: "Penggunaan Pena Insulin",
              device: "Insulin Pen Device",
              subtitle: "Penyuntikan insulin subkutan (bawah kulit) secara mandiri untuk mengontrol kadar glukosa darah pada penderita diabetes melitus.",
              imageUrl: insulinImg,
              storage: "Pena insulin yang BELUM dibuka harus disimpan di lemari es (suhu 2°C - 8°C), jangan dibekukan. Pena insulin yang SEDANG aktif digunakan disimpan di suhu ruangan sejuk (15°C - 30°C) dan dapat bertahan hingga 28-30 hari. JANGAN memasukkan kembali pena yang sedang aktif digunakan ke dalam kulkas karena suhu dingin dapat membuat injeksi terasa perih.",
              steps: [
                {
                  title: "Sterilisasi Area",
                  desc: "Cuci tangan Anda. Tentukan area suntikan (perut berjarak minimal 5 cm dari pusar, paha bagian depan, lengan atas bagian luar, atau pantat). Bersihkan area tersebut menggunakan alcohol swab dan biarkan mengering alami."
                },
                {
                  title: "Pemasangan Jarum",
                  desc: "Ambil pena insulin, buka penutup pelindungnya. Ambil jarum suntik steril yang baru, kelupas segel kertasnya, lalu pasang jarum pada ujung pena dengan memutarnya searah jarum jam hingga kencang."
                },
                {
                  title: "Pembuangan Udara (Priming)",
                  desc: "Lakukan priming (air-shot) 2 unit: Putar tombol dosis ke angka 2 unit. Ketuk-ketuk badan pena dengan jari agar gelembung udara naik ke atas. Arahkan jarum tegak lurus ke atas, lalu tekan tombol dosis hingga habis. Pastikan setetes insulin keluar di ujung jarum dan penunjuk dosis kembali ke angka 0."
                },
                {
                  title: "Pengaturan Dosis",
                  desc: "Putar tombol dosis di ujung pena insulin sesuai dengan unit dosis yang telah ditentukan oleh dokter Anda. Pastikan angka pada jendela dosis menunjukkan unit yang benar."
                },
                {
                  title: "Penyuntikan Subkutan",
                  desc: "Cubit lipatan kulit di area suntikan jika tubuh Anda kurus, masukkan jarum secara tegak lurus (90 derajat) ke dalam kulit dengan mantap. Tekan tombol dosis sepenuhnya ke bawah hingga penunjuk kembali ke angka 0."
                },
                {
                  title: "Retensi Jarum & Pelepasan",
                  desc: "Tahan jarum tetap berada di bawah kulit selama minimal 10 detik agar seluruh dosis insulin masuk sempurna. Tarik jarum dari kulit, lalu segera lepaskan jarum dari pena insulin menggunakan penutup luarnya untuk dibuang ke wadah khusus benda tajam (sharp container). Pasang kembali penutup pena."
                }
              ],
              dos: [
                "Lakukan rotasi lokasi penyuntikan (misal geser 2 cm dari bekas suntikan sebelumnya) untuk mencegah penumpukan lemak/kerusakan jaringan bawah kulit (lipodistrofi).",
                "Gunakan jarum suntik steril yang baru setiap kali melakukan penyuntikan insulin."
              ],
              donts: [
                "Jangan menyimpan pena insulin dengan jarum masih terpasang karena dapat memicu masuknya gelembung udara atau kebocoran insulin.",
                "Jangan menggosok atau memijat area bekas suntikan, karena pijatan dapat mempercepat penyerapan insulin secara tidak terduga dan memicu serangan hipoglikemia."
              ],
              counseling: [
                "Kenali gejala hipoglikemia (lemas, gemetar, keringat dingin, lapar berlebih, jantung berdebar). Selalu siapkan tablet glukosa, permen, atau jus buah manis sebagai penanganan cepat.",
                "Periksa kejernihan insulin Anda. Insulin jenis 'Rapid-acting' atau 'Long-acting' analog biasanya jernih, sedangkan insulin jenis 'NPH' atau 'Premixed' biasanya keruh dan memerlukan pengocokan memutar di antara telapak tangan sebanyak 10 kali sebelum digunakan."
              ]
            }
          ];

          const currentItem = SPECIAL_ADMINS.find(x => x.id === activeVideoId) || SPECIAL_ADMINS[0];
          const totalSteps = currentItem.steps.length;
          const currentStepData = currentItem.steps[activeVideoStep];

          // Calculate checked count
          const checkedCount = currentItem.steps.filter((_, idx) => videoPracticeChecked[`${currentItem.id}_${idx}`]).length;
          const isAllChecked = checkedCount === totalSteps;
          const progressPercentage = Math.round((checkedCount / totalSteps) * 100);

          return (
            <>
              {/* Left Column: Selector */}
              <section className="lg:col-span-3 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Jenis Obat Khusus</h3>
                  </div>

                  {/* Menu Buttons for 6 items */}
                  <div className="space-y-1">
                    {SPECIAL_ADMINS.map((item) => {
                      const isSelected = activeVideoId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveVideoId(item.id);
                            setActiveVideoStep(0);
                          }}
                          className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all border ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-150 shadow-3xs"
                              : "text-slate-600 hover:bg-slate-50 border-transparent"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {item.id === "suppositoria" && <Activity className="w-4 h-4" />}
                            {item.id === "inhaler" && <Volume2 className="w-4 h-4" />}
                            {item.id === "tetes_mata" && <Eye className="w-4 h-4" />}
                            {item.id === "tetes_telinga" && <Info className="w-4 h-4" />}
                            {item.id === "semprot_hidung" && <Droplets className="w-4 h-4" />}
                            {item.id === "pena_insulin" && <Heart className="w-4 h-4" />}
                          </div>
                          <span className="truncate font-sans font-bold">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick info card */}
                <div className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-2xl p-5 shadow-sm border border-slate-900">
                  <div className="flex items-center gap-2 border-b border-emerald-800/50 pb-3 mb-3">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">Standar Klinik Aseptis</h3>
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-sans font-medium">
                    Sebelum mempraktikkan teknik pemberian obat khusus ini, selalu pastikan Anda mencuci tangan menggunakan sabun antiseptik selama minimal 20 detik atau menggunakan hand sanitizer berbasis alkohol. Jaga agar ujung aplikator tidak terkontaminasi oleh kuman luar.
                  </p>
                </div>
              </section>

              {/* Right Content Column */}
              <section className="lg:col-span-9 space-y-6">
                <div className="space-y-6">
                  
                  {/* Header Information card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 border border-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
                        Sediaan Alat Khusus: {currentItem.device}
                      </span>
                      <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Instruksi Terverifikasi Klinis (Kemenkes & FDA)
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950 tracking-tight">{currentItem.title}</h2>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">{currentItem.subtitle}</p>
                  </div>

                  {/* Main Content Layout Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* Instructional Device Image (Left/Top side of layout) */}
                    <div className="xl:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                        <Image className="w-4 h-4 text-emerald-600" />
                        Ilustrasi Alat & Sediaan
                      </h3>
                      
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative group cursor-zoom-in">
                        <img
                          src={currentItem.imageUrl}
                          alt={currentItem.title}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-bold font-sans">Sediaan: {currentItem.device}</span>
                        </div>
                      </div>



                      <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3.5 text-[11px] leading-relaxed text-emerald-800">
                        <span className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wide block mb-1">Panduan Penggunaan Alat:</span>
                        <p className="font-sans font-medium text-emerald-900/80 leading-normal">
                          Visualisasi di atas memperlihatkan instrumen medis <strong>{currentItem.device}</strong> yang dirancang higienis dan presisi sesuai standar kefarmasian klinis.
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] leading-relaxed text-slate-600">
                        <span className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wide block mb-1">Kondisi Penyimpanan:</span>
                        <p className="font-sans font-medium text-slate-700 leading-normal">{currentItem.storage}</p>
                      </div>
                    </div>

                    {/* Interactive Steps Simulator (Right/Bottom side of layout) */}
                    <div className="xl:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-5">
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Simulator Langkah & Progres
                          </h3>
                          <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                            Langkah {activeVideoStep + 1} dari {totalSteps}
                          </span>
                        </div>

                        {/* Interactive step visual container */}
                        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 border border-emerald-100/60 rounded-xl p-5 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
                          
                          {/* Step number watermark */}
                          <div className="absolute right-3 -bottom-8 text-8xl font-black text-slate-200/55 font-mono select-none pointer-events-none">
                            {activeVideoStep + 1}
                          </div>

                          <div className="space-y-2 relative z-10">
                            <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Instruksi Aktif
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                              {currentStepData.title}
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                              {currentStepData.desc}
                            </p>
                          </div>
                        </div>

                        {/* Stepper Controls */}
                        <div className="flex items-center justify-between gap-3">
                          <button
                            disabled={activeVideoStep === 0}
                            onClick={() => setActiveVideoStep(prev => prev - 1)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-slate-200 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Sebelumnya</span>
                          </button>

                          <button
                            disabled={activeVideoStep === totalSteps - 1}
                            onClick={() => setActiveVideoStep(prev => prev + 1)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-slate-200 cursor-pointer"
                          >
                            <span>Selanjutnya</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Timeline dot progress bar */}
                        <div className="flex items-center justify-center gap-1.5 pt-2">
                          {currentItem.steps.map((_, idx) => (
                            <button
                              key={"dot_" + idx}
                              onClick={() => setActiveVideoStep(idx)}
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === activeVideoStep 
                                  ? "w-6 bg-emerald-600" 
                                  : videoPracticeChecked[`${currentItem.id}_${idx}`]
                                  ? "w-2 bg-emerald-500"
                                  : "w-2 bg-slate-200 hover:bg-slate-300"
                              }`}
                            ></button>
                          ))}
                        </div>

                      </div>

                      {/* Interactive practice checklists */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Praktek Mandiri:</span>
                          <span className="text-[10px] font-mono font-bold text-slate-700">
                            {checkedCount}/{totalSteps} Langkah Centang ({progressPercentage}%)
                          </span>
                        </div>
                        
                        {/* Mini progress meter */}
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progressPercentage}%` }}
                            className={`h-full transition-all duration-500 ${
                              isAllChecked ? "bg-emerald-500" : "bg-emerald-600"
                            }`}
                          ></div>
                        </div>

                        {/* Quick check active step check box */}
                        <label className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-all">
                          <input
                            type="checkbox"
                            checked={!!videoPracticeChecked[`${currentItem.id}_${activeVideoStep}`]}
                            onChange={(e) => {
                              setVideoPracticeChecked(prev => ({
                                ...prev,
                                [`${currentItem.id}_${activeVideoStep}`]: e.target.checked
                              }));
                            }}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <div className="text-[11px] font-sans leading-tight">
                            <span className="font-bold text-slate-800 block">Saya sudah mempraktikkan Langkah {activeVideoStep + 1}</span>
                            <span className="text-slate-500">Tandai langkah ini sebagai selesai dalam simulasi latihan Anda.</span>
                          </div>
                        </label>

                        {isAllChecked && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2.5 rounded-lg font-medium leading-relaxed flex items-start gap-2 animate-bounce">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold block">✓ Latihan Selesai!</strong>
                              Anda telah meninjau dan mencentang semua langkah penggunaan {currentItem.device} dengan benar. Simpan panduan ini untuk konsultasi berikutnya.
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* DOs & DONTs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* DOs CARD */}
                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100/60 pb-3">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Anjuran / Boleh Dilakukan (DOs)
                      </h3>
                      <ul className="space-y-3 text-xs leading-relaxed font-medium text-emerald-950 font-sans">
                        {currentItem.dos.map((doItem, idx) => (
                          <li key={"do_" + idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 shrink-0 mt-1 font-bold">✓</span>
                            <span>{doItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* DONTs CARD */}
                    <div className="bg-rose-50/20 border border-rose-100 rounded-2xl p-5 shadow-3xs space-y-4">
                      <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100/60 pb-3">
                        <X className="w-4 h-4 text-rose-600" />
                        Pantangan / Hindari (DONTs)
                      </h3>
                      <ul className="space-y-3 text-xs leading-relaxed font-medium text-rose-950 font-sans">
                        {currentItem.donts.map((dontItem, idx) => (
                          <li key={"dont_" + idx} className="flex items-start gap-2">
                            <span className="text-rose-600 shrink-0 mt-1 font-bold">✗</span>
                            <span>{dontItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Clinical Counseling Pearls */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Mutiara Klinis & Panduan Konseling Pasien (Counseling Pearls)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700 leading-relaxed font-sans">
                      {currentItem.counseling.map((counselItem, idx) => (
                        <div key={"counsel_" + idx} className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                          <span className="text-amber-500 font-extrabold shrink-0">💡</span>
                          <p className="font-medium">{counselItem}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            </>
          );
        })()}
      </>
    )}
          </div>
        </main>

        {/* 3. Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 text-[9px] text-slate-400 uppercase tracking-widest shrink-0 font-bold gap-1 py-2 sm:py-0">
          <div>Rahasia: Platform Verifikasi Pendukung Keputusan Klinis</div>
          <div className="flex gap-4 sm:gap-6 items-center">
            <span>ID Sesi: 4891-AAX-90</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 font-sans normal-case">Pernyataan Penyangkalan: Selalu verifikasi dengan Apoteker Resmi</span>
          </div>
        </footer>
      </div>

      {isUpdateDrugModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Informasi Obat</h3>
              <button 
                onClick={() => setIsUpdateDrugModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 mb-4">
                <p className="text-sm text-slate-600">
                  Unggah data Informasi Obat dalam format CSV atau Excel (.xlsx). Pastikan file memiliki baris pertama sebagai header yang sesuai dengan format data.
                </p>
                <button
                  onClick={handleDownloadDrugTemplate}
                  className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template Excel
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDrugCsvFile(file);
                      setDrugCsvError("");
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {drugCsvError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {drugCsvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsUpdateDrugModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateDrugData}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpdateDdiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Skrining Interaksi</h3>
              <button 
                onClick={() => setIsUpdateDdiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 mb-4">
                <p className="text-sm text-slate-600">
                  Unggah data Skrining Interaksi dalam format CSV atau Excel (.xlsx). Pastikan file memiliki baris pertama sebagai header yang tepat (id, drugAId, drugBId, dll).
                </p>
                <button
                  onClick={handleDownloadDdiTemplate}
                  className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template Excel
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDdiCsvFile(file);
                      setDdiCsvError("");
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {ddiCsvError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {ddiCsvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsUpdateDdiModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateDdiData}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Login Admin</h3>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Masukkan password admin"
                  />
                  {loginError && <p className="text-xs text-rose-500 mt-1 font-medium">{loginError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
