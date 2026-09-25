import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { Upload, Save, Menu } from "lucide-react";
import { CalculatorInputs, CalculationResult, DrugPreset, AlertLevel } from "./types";
import { getDrugSafetyReview } from "./data/drugSafetyMetadata";
import { DRUG_PRESETS as INITIAL_DRUG_PRESETS } from "./presets";
import { INTERACTION_DATABASE as INITIAL_INTERACTION_DATABASE, checkFoodInteractions, FoodInteraction, DrugInteraction, getCanonicalSubstance, getInteractionsForDrug, getFoodInteractionsForDrug } from "./interactions";
import { calculateDosage, calculateMostellerBsa, calculateCockcroftGault } from "./mathUtils";
import ClinicalAlerts from "./components/ClinicalAlerts";
import { generateMedicalReportPDF } from "./pdfUtils";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import MedicalDashboardHero from "./components/MedicalDashboardHero";
import CountUp from "./components/CountUp";

// Lazy-loaded tab components for fast initial load and smooth tab transitions
const PharmacistConsultation = lazy(() => import("./PharmacistConsultation"));
const FornasDrugs = lazy(() => import("./FornasDrugs"));
const ClinicalSOAP = lazy(() => import("./ClinicalSOAP"));
const MapFacilities = lazy(() => import("./MapFacilities").then(m => ({ default: m.MapFacilities })));
const IvCompatibilityChecker = lazy(() => import("./IvCompatibilityChecker").then(m => ({ default: m.IvCompatibilityChecker })));
const DiseasesConditions = lazy(() => import("./DiseasesConditions").then(m => ({ default: m.DiseasesConditions })));
const MedicalCalculators = lazy(() => import("./MedicalCalculators").then(m => ({ default: m.MedicalCalculators })));
const GlassSettingsModal = lazy(() => import("./components/GlassSettingsModal"));
const AdminWebAnalytics = lazy(() => import("./components/AdminWebAnalytics"));
import { trackCustomEvent, trackPageView, sendHeartbeat } from "./services/analyticsService";

const TabLoadingFallback = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
    <span className="text-xs font-semibold text-slate-500">Memuat modul klinis...</span>
  </div>
);
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
  Sliders,
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
  Pill,
  Tag,
  Copy,
  CheckCheck,
  Zap,
  Vibrate,
  BellRing,
  BarChart3,
  Lock
} from "lucide-react";
import HighlightText from "./components/HighlightText";
import { matchDrugSimultaneous, SearchScope } from "./utils/searchUtils";

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

// Helper function to extract Generic and Brand names
const getGenericAndBrand = (name: string, presetId?: string) => {
  const cleanName = name.replace(/\s+-\s+.*$/, ""); // removes trailing " - Anak", " - Dewasa", etc. (only when surrounded by whitespace)
  const parenMatch = cleanName.match(/\(([^)]+)\)/);
  let brand = cleanName;
  let generic = cleanName;
  if (parenMatch) {
    generic = parenMatch[1].trim();
    brand = cleanName.replace(/\s*\([^)]+\)/, "").trim();
  } else {
    brand = cleanName.trim();
    generic = cleanName.trim();
  }

  const idLower = (presetId || "").toLowerCase();
  const brandLower = brand.toLowerCase();

  // Canonical Brand to Generic associations for known clinical drugs
  if (idLower === "cinolon" || brandLower.startsWith("cinolon")) {
    brand = "Cinolon (Cinolon / Cinolon-N)";
    generic = "Fluocinolone Acetonide & Neomycin Sulfate";
  } else if (idLower === "concor" || brandLower.startsWith("concor")) {
    brand = "Concor";
    generic = "Bisoprolol Fumarat";
  } else if (idLower === "cortidex" || brandLower.startsWith("cortidex")) {
    brand = "Cortidex";
    generic = "Dexamethasone";
  } else if (idLower === "vectrine" || brandLower.startsWith("vectrine")) {
    brand = "Vectrine";
    generic = "Erdosteine";
  } else if (idLower === "viccillin" || brandLower.startsWith("viccillin")) {
    brand = "Viccillin";
    generic = "Ampisilin / Sulbaktam";
  } else if (idLower === "zinkid" || brandLower.startsWith("zinkid")) {
    brand = "Zinkid";
    generic = "Zinc Sulfat";
  } else if (idLower === "thrombophob" || brandLower.startsWith("thrombophob")) {
    brand = "Thrombophob";
    generic = "Heparin Sodium & Benzil Nikotinat";
  } else if (idLower === "uperio" || brandLower.startsWith("uperio")) {
    brand = "Uperio";
    generic = "Sakubitril / Valsartan";
  } else if (idLower === "valisanbe" || brandLower.startsWith("valisanbe")) {
    brand = "Valisanbe";
    generic = "Diazepam";
  } else if (idLower === "becom" || brandLower.startsWith("becom")) {
    brand = "Becom (Becom-C / Becom-Zet)";
    generic = "Vitamin B Kompleks + Vitamin C";
  } else if (idLower === "digoxin" || brandLower.startsWith("digoksin") || brandLower.startsWith("digoxin")) {
    brand = "Digoksin";
    generic = "Digoxin";
  } else if (idLower === "chloramphenicol" || brandLower.startsWith("kloramfenikol") || brandLower.startsWith("chloramphenicol")) {
    brand = "Kloramfenikol";
    generic = "Chloramphenicol";
  } else if (idLower === "dobutamin" || brandLower.startsWith("dobutamin") || brandLower.startsWith("dobutamine")) {
    brand = "Dobutamin";
    generic = "Dobutamine";
  } else if (idLower === "domperidone_ped" || brandLower.startsWith("domperidon") || brandLower.startsWith("domperidone")) {
    brand = "Domperidon";
    generic = "Domperidone";
  } else if (idLower === "doxorubicin_onc" || brandLower.startsWith("doksorubisin") || brandLower.startsWith("doxorubicin")) {
    brand = "Doksorubisin";
    generic = "Doxorubicin";
  } else if (idLower === "carboplatin" || brandLower.startsWith("karboplatin") || brandLower.startsWith("carboplatin")) {
    brand = "Karboplatin";
    generic = "Carboplatin";
  } else if (idLower === "triamcinolone" || brandLower.startsWith("triamcinolone") || brandLower.startsWith("triamsinolon")) {
    brand = "Triamcinolone";
    generic = "Triamsinolon Asetonid";
  }

  return { brand, generic };
};

// Helper to determine whether a drug is a Proprietary Brand (Obat Bermerek / Paten) or Generic (Generik)
const isBrandDrug = (preset: DrugPreset, brandName: string, genericName: string): boolean => {
  const brandLower = brandName.toLowerCase();
  const genericLower = genericName.toLowerCase();
  const idLower = preset.id.toLowerCase();
  const nameLower = preset.name.toLowerCase();

  // Known proprietary trade brands
  const knownBrandKeywords = [
    "concor", "cortidex", "cinolon", "vectrine", "viccillin", "zinkid", 
    "valisanbe", "uperio", "thrombophob", "becom", "sanmol", "pamol", 
    "panadol", "tempra", "biogesic", "dumin", "proris", "amoxsan", "baquinor", 
    "ciproxin", "bufacetin", "colme", "kemicetine", "lanoxin", "fargoxin", 
    "herbesser", "farmabes", "dobutrex", "cardiotone", "motilium", "vometa", 
    "vomisert", "inpepsa", "neciblok", "stesolid", "valdimex", "ventolin", 
    "astharol", "pulmicort", "obucort", "symbicort", "seretide", "lasix", 
    "farsix", "norvask", "divask", "lipitor", "crestor", "plavix", "bioplacenton", 
    "burnazin", "tremenza", "rhinos", "lapifed", "ryvel", "tiriz", "cerini"
  ];

  if (knownBrandKeywords.some(b => idLower.includes(b) || brandLower.includes(b) || nameLower.includes(b))) {
    return true;
  }

  // Pure generic pairs (translations of the same generic INN substance)
  const isGenericTranslation =
    brandLower === genericLower ||
    (brandLower.includes("digoksin") && genericLower.includes("digoxin")) ||
    (brandLower.includes("domperidon") && genericLower.includes("domperidone")) ||
    (brandLower.includes("kloramfenikol") && genericLower.includes("chloramphenicol")) ||
    (brandLower.includes("chloramphenicol") && genericLower.includes("kloramfenikol")) ||
    (brandLower.includes("doksorubisin") && genericLower.includes("doxorubicin")) ||
    (brandLower.includes("karboplatin") && genericLower.includes("carboplatin")) ||
    (brandLower.includes("triamcinolone") && genericLower.includes("triamsinolon")) ||
    (brandLower.includes("dobutamin") && genericLower.includes("dobutamine")) ||
    (brandLower.includes("amoksisilin") && genericLower.includes("amoxicillin")) ||
    (brandLower.includes("azitromisin") && genericLower.includes("azithromycin")) ||
    (brandLower.includes("sefiksim") && genericLower.includes("cefixime")) ||
    (brandLower.includes("setirizin") && genericLower.includes("cetirizine")) ||
    (brandLower.includes("siprofloksasin") && genericLower.includes("ciprofloxacin"));

  if (isGenericTranslation) {
    return false;
  }

  if (brandLower !== genericLower && !idLower.startsWith("auto_")) {
    return true;
  }

  return false;
};

// Canonical key helper to identify duplicate drugs and variants
const getDrugCanonicalMergeKey = (p: { id: string; name: string }): string => {
  let clean = p.name.replace(/\s*-\s*.*$/, "").trim();
  const parenMatch = clean.match(/^(.*?)\s*\((.*?)\)$/);
  let base = parenMatch ? parenMatch[2].trim() : clean;
  let norm = base.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (norm.startsWith("esomeprazol")) return "esomeprazole";
  if (norm.startsWith("pseudoefedrin") || norm.startsWith("pseudoephedrine")) return "pseudoephedrine";
  if (norm.startsWith("dextromethorphan")) return "dextromethorphan";

  if (norm === "asetaminofen" || norm.includes("paracetamol")) return "paracetamol";
  if (norm.includes("ibuprofen")) return "ibuprofen";
  if (norm.includes("dexamethasone") || norm.includes("deksametason")) return "dexamethasone";
  if (norm === "gg" || norm.includes("guaifenesin") || norm.includes("gliserilguaiakolat")) return "guaifenesin";
  if (norm.includes("candesartan") || norm.includes("kandesartan")) return "candesartan";
  if (norm.includes("captopril") || norm.includes("kaptopril")) return "captopril";
  if (norm.includes("cefadroxil") || norm.includes("sefadroksil")) return "cefadroxil";
  if (norm.includes("ceftriaxone") || norm.includes("seftriakson")) return "ceftriaxone";
  if (norm.includes("clarithromycin") || norm.includes("klaritromisin")) return "clarithromycin";
  if (norm.includes("clindamycin") || norm.includes("klindamisin")) return "clindamycin";
  if (norm.includes("clopidogrel") || norm.includes("klopidogrel")) return "clopidogrel";
  if (norm.includes("cotrimoxazole") || norm.includes("kotrimoksazol")) return "cotrimoxazole";
  if (norm.includes("diphenhydramine") || norm.includes("difenhidramin")) return "diphenhydramine";
  if (norm.includes("erythromycin") || norm.includes("eritromisin")) return "erythromycin";
  if (norm.includes("fluconazole") || norm.includes("flukonazol")) return "fluconazole";
  if (norm.includes("furosemid") || norm.includes("furosemide")) return "furosemide";
  if (norm.includes("gliclazide") || norm.includes("gliklazid")) return "gliclazide";
  if (norm.includes("griseofulvin")) return "griseofulvin";
  if (norm.includes("haloperidol")) return "haloperidol";
  if (norm.includes("ketoconazol") || norm.includes("ketokonazol")) return "ketoconazole";
  if (norm.includes("lansoprazol") || norm.includes("lansoprazole")) return "lansoprazole";
  if (norm.includes("loperamid") || norm.includes("loperamide")) return "loperamide";
  if (norm.includes("loratadin") || norm.includes("loratadine")) return "loratadine";
  if (norm.includes("meloksikam") || norm.includes("meloxicam")) return "meloxicam";
  if (norm.includes("metformin")) return "metformin";
  if (norm.includes("metilprednisolon") || norm.includes("methylprednisolone")) return "methylprednisolone";
  if (norm.includes("metronidazol") || norm.includes("metronidazole")) return "metronidazole";
  if (norm.includes("morfin") || norm.includes("morphine")) return "morphine";
  if (norm.includes("diklofenak") || norm.includes("diclofenac")) return "diclofenac";
  if (norm.includes("nifedipin") || norm.includes("nifedipine")) return "nifedipine";
  if (norm.includes("omeprazol") || norm.includes("omeprazole")) return "omeprazole";
  if (norm.includes("ondansetron")) return "ondansetron";
  if (norm.includes("oseltamivir")) return "oseltamivir";
  if (norm.includes("oksitosin") || norm.includes("oxytocin")) return "oxytocin";
  if (norm.includes("pirantel") || norm.includes("pyrantel")) return "pyrantel";
  if (norm.includes("prednison") || norm.includes("prednisone")) return "prednisone";
  if (norm.includes("propranolol")) return "propranolol";
  if (norm.includes("ranitidin") || norm.includes("ranitidine")) return "ranitidine";
  if (norm.includes("rifampisin") || norm.includes("rifampicin")) return "rifampicin";
  if (norm.includes("salbutamol")) return "salbutamol";
  if (norm.includes("simvastatin")) return "simvastatin";
  if (norm.includes("spiramisin") || norm.includes("spiramycin")) return "spiramycin";
  if (norm.includes("spironolakton") || norm.includes("spironolactone")) return "spironolactone";
  if (norm.includes("warfarin")) return "warfarin";
  if (norm.includes("atorvastatin")) return "atorvastatin";
  if (norm.includes("ctm") || norm.includes("klorfeniramin")) return "chlorpheniramine";
  if (norm.includes("isoniazid") || norm === "inh") return "isoniazid";
  if (norm.includes("nasetilsistein") || norm === "nace") return "acetylcysteine";
  if (norm.includes("thiamphenicol") || norm.includes("tiamfenikol") || norm.includes("biothicol")) return "thiamphenicol";
  if (norm.includes("carbamazepine") || norm.includes("karbamazepin") || norm.includes("bamgetol")) return "carbamazepine";
  if (norm.includes("favipiravir") || norm.includes("avigan")) return "favipiravir";
  if (norm.includes("doxorubicin") || norm.includes("doksorubisin")) return "doxorubicin";
  if (norm.includes("azithromycin") || norm.includes("azitromisin")) return "azithromycin";
  if (norm.includes("bisoprolol") || norm.includes("concor")) return "bisoprolol";
  if (norm.includes("budesonid") || norm.includes("budesonide")) return "budesonide";
  if (norm.includes("tramadol")) return "tramadol";
  if (norm.includes("vancomycin") || norm.includes("vankomisin")) return "vancomycin";
  if (norm.includes("thiamazole") || norm.includes("tiamazol") || norm.includes("metimazol")) return "thiamazole";
  if (norm.includes("thrombophob")) return "thrombophob";
  if (norm.includes("triamcinolone") || norm.includes("triamsinolon")) return "triamcinolone";
  if (norm.includes("uperio")) return "uperio";
  if (norm.includes("valisanbe") || (norm.includes("diazepam") && p.id.includes("valisanbe"))) return "diazepam";
  if (norm.includes("vectrine") || norm.includes("erdosteine")) return "erdosteine";
  if (norm.includes("viccillin")) return "viccillin";
  if (norm.includes("zinkid") || (norm.includes("zinc") && p.id.includes("zinkid"))) return "zinc";
  if (norm.includes("cefixime") || norm.includes("sefiksim")) return "cefixime";
  if (norm.includes("cetirizine") || norm.includes("setirizin")) return "cetirizine";
  if (norm.includes("chloramphenicol") || norm.includes("kloramfenikol") || norm.includes("bufacetin")) return "chloramphenicol";
  if (norm.includes("cinolon")) return "cinolon";
  if (norm.includes("ciprofloxacin") || norm.includes("siprofloksasin") || norm.includes("baquinor")) return "ciprofloxacin";
  if (norm.includes("cortidex")) return "dexamethasone";
  if (norm.includes("digoxin") || norm.includes("digoksin")) return "digoxin";
  if (norm.includes("diltiazem")) return "diltiazem";
  if (norm.includes("dobutamin") || norm.includes("dobutamine")) return "dobutamine";
  if (norm.includes("domperidon") || norm.includes("domperidone")) return "domperidone";

  if (norm.length > 2) return "name_" + norm;
  return p.id;
};

// Helper to sanitize and deduplicate drug presets list by merging data for duplicate drug entries
const sanitizeDrugPresets = (list: DrugPreset[]): DrugPreset[] => {
  const sourceList = Array.isArray(list) && list.length > 0 ? list : INITIAL_DRUG_PRESETS;

  // Group by canonical merge key
  const groups = new Map<string, DrugPreset[]>();
  for (const item of sourceList) {
    if (!item || !item.id || !item.name) continue;
    const key = getDrugCanonicalMergeKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  // Also ensure all canonical INITIAL_DRUG_PRESETS are represented
  for (const initItem of INITIAL_DRUG_PRESETS) {
    const key = getDrugCanonicalMergeKey(initItem);
    if (!groups.has(key)) {
      groups.set(key, [{ ...initItem }]);
    }
  }

  const result: DrugPreset[] = [];
  const processedKeys = new Set<string>();

  for (const [key, items] of groups.entries()) {
    if (processedKeys.has(key)) continue;
    processedKeys.add(key);

    if (items.length === 1) {
      result.push({ ...items[0] });
      continue;
    }

    // Pick primary item (favor non-auto ID or item with detailed dosing parameters)
    const primary = items.find(x => !x.id.startsWith("auto_")) || items[0];

    // Combine notes (formulations, strengths, sediaan) without duplicates
    const rawNotes = items
      .map(x => x.notes?.trim())
      .filter((n): n is string => Boolean(n && n.length > 0));
    const uniqueNotes: string[] = [];
    for (const note of rawNotes) {
      if (!uniqueNotes.some(existing => existing.toLowerCase().includes(note.toLowerCase()) || note.toLowerCase().includes(existing.toLowerCase()))) {
        uniqueNotes.push(note);
      }
    }
    const mergedNotes = uniqueNotes.join(" | ") || primary.notes;

    // Combine indications cleanly
    const rawIndications = items
      .map(x => x.indication?.trim())
      .filter((ind): ind is string => Boolean(ind && ind !== "-" && ind.length > 0));
    const uniqueIndications: string[] = [];
    for (const ind of rawIndications) {
      if (!uniqueIndications.some(existing => existing.toLowerCase().includes(ind.toLowerCase()))) {
        uniqueIndications.push(ind);
      }
    }
    const mergedIndication = uniqueIndications.join("; ") || primary.indication;

    // Combine adjustments
    const requiresRenalAdjustment = items.some(x => x.requiresRenalAdjustment);

    // Standardized merged drug name
    let mergedName = primary.name;
    if (key === "paracetamol" && !mergedName.includes("Dewasa")) {
      mergedName = "Paracetamol (Asetaminofen) - Anak & Dewasa";
    } else if (key === "ibuprofen" && !mergedName.includes("Dewasa")) {
      mergedName = "Ibuprofen - Anak & Dewasa";
    } else if (key === "omeprazole" && !mergedName.includes("Anak")) {
      mergedName = "Omeprazol (Omeprazole) - PPI Dewasa & Anak";
    }

    result.push({
      ...primary,
      name: mergedName,
      indication: mergedIndication,
      notes: mergedNotes,
      requiresRenalAdjustment,
    });
  }

  return result;
};

// Helper to categorize each drug into accurate clinical therapeutic categories
export const getDrugCategory = (id: string, name: string, indication?: string, notes?: string): { label: string; color: string; bg: string; border: string } => {
  let combined = `${id} ${name} ${indication || ""} ${notes || ""}`.toLowerCase();
  
  if (!indication && !notes) {
    const found = INITIAL_DRUG_PRESETS.find(p => p.id === id || p.name === name);
    if (found) {
      combined = `${id} ${name} ${found.indication || ""} ${found.notes || ""}`.toLowerCase();
    }
  }

  const has = (...terms: string[]) => terms.some(t => combined.includes(t.toLowerCase()));

  // 0. Prioritas Utama: Antihipertensi & Penyekat Saluran Kalsium (CCB)
  // Menjamin 100% Amlodipin dan CCB lainnya selalu masuk Kardiovaskular & Diuretik (bukan Nutrisi/Mineral meskipun memiliki mekanisme antagonis kalsium)
  if (
    has("amlodipin", "amlodipine", "norvask", "tensivask", "divask", "nifedipin", "nifedipine", "diltiazem", "nicardipine", "verapamil")
  ) {
    return { label: "Kardiovaskular & Diuretik", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
  }

  // 1. Diagnostik & Khusus
  if (
    has("iopamiro", "omnipaque", "hexiol", "media kontras", "bahan kontras", "betiatide", "jelly usg", "usg jelly", "lubrikan transduser", "sirplus", "ventisorb", "absorben karbon", "pelarut atau pemanis")
  ) {
    return { label: "Diagnostik & Khusus", color: "text-stone-700", bg: "bg-stone-50", border: "border-stone-200" };
  }

  // 2. Onkologi & Imunosupresan
  if (
    has(
      "doxorubicin", "doksorubisin", "carboplatin", "cisplatin", "paclitaxel", "tamoxifen",
      "methotrexate", "fluorouracil", "cyclophosphamide", "vincristine", "vinblastine",
      "bleomycin", "gemcitabine", "capecitabine", "rituximab", "trastuzumab", "imatinib",
      "erlotinib", "cosibelimab", "dostarlimab", "durvalumab", "cemiplimab", "imuran",
      "azathioprine", "azatioprin", "myfortic", "mycophenolate", "mikofenolat", "sandimmun",
      "cyclosporine", "siklosporin", "tocilizumab", "sitostatika", "antineoplastik",
      "kemoterapi", "kanker", "leukemia", "penolakan transplantasi", "penolakan organ", "badai sitokin"
    ) || (has("onc") && !has("noncort"))
  ) {
    return { label: "Onkologi & Imunosupresan", color: "text-fuchsia-700", bg: "bg-fuchsia-50", border: "border-fuchsia-100" };
  }

  // 3. Vaksin & Imunologi
  if (
    has(
      "vaksin", "vaccine", "imunisasi", "tetagam", "verorab", "rabies", "tetanus toxoid",
      "diphteria antitoxin", "diphteri tetanus", "pentabio", "bcg", "campak", "polio",
      "rotarix", "rotavirus", "covovax", "sinovac", "pfizer", "pneumococcal", "pcv",
      "serum anti", "biosave", "immunoglobulin", "imunoglobulin", "cholera"
    )
  ) {
    return { label: "Vaksin & Imunologi", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-100" };
  }

  // 4. Anestesi & Pelemas Otot
  if (
    has(
      "anestesi", "anesthesia", "lidocaine", "lidokain", "bupivacaine", "bupivakain",
      "propofol", "ketamine", "ketamin", "rocuronium", "atracurium", "vecuronium",
      "isoflurane", "sevoflurane", "halothane", "terrell", "tiopol", "thiopental",
      "xylocaine", "xylestesin", "pecuron", "notrixum", "tramus", "ecron", "dexmeto",
      "dexmedetomidine", "icunes", "kabimidine", "relaksasi otot rangka", "intubasi",
      "pelemas otot", "sedasi pasien di icu", "induksi anestesi"
    )
  ) {
    return { label: "Anestesi & Pelemas Otot", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100" };
  }

  // 5. Mata & THT
  if (
    has(
      "glaukoma", "intraokular", "tetes mata", "eye drop", "timolol", "travatan",
      "cendolyteers", "cendo", "latanoprost", "tetes telinga", "ear drop", "otopain",
      "tarivid otic", "vasola", "flamar opht", "blephasep", "blefaritis", "genisone",
      "salep mata", "phenol glycerol", "kotoran telinga", "radang mata", "katarak"
    )
  ) {
    return { label: "Mata & THT", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" };
  }

  // 6. Cairan Intravena & Elektrolit
  if (
    has(
      "ringer laktat", "ringer fundin", "rl ", "rl_", "tutofusin", "tutosol", "ka-en", "kaen",
      "asering", "wida", "water for", "pelarut sediaan", "air steril untuk injeksi",
      "nacl", "natrium klorida", "potassium chloride", "kalium klorida", "ksr",
      "kalium aspartat", "kcl", "dextrose", "glukosa 5%", "glukosa 10%", "glukosa 40%",
      "meylon", "natrium bikarbonat", "bikarbonat", "voluven", "volulyte", "manitol",
      "mannitol", "martos 10", "gelafusal", "fimahes", "calcii gluconas", "kalsium glukonat",
      "rumatan cairan", "rehidrasi", "hipovolemia", "asidosis metabolik",
      "cairan dan nutrisi parenteral", "suplai karbohidrat dan cairan", "keseimbangan elektrolit"
    )
  ) {
    return { label: "Cairan Intravena & Elektrolit", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100" };
  }

  // 7. Dermatologi & Topikal
  if (
    has(
      "bioplacenton", "burnazin", "silver sulfadiazine", "scabimite", "permethrin",
      "urea krim", "keratolitik", "thrombogel", "trichloroacetic", "viorex", "antiseptik kulit",
      "desinfeksi kulit", "luka bakar", "kaviodin", "povidon iodin", "softa man", "lanolin",
      "kloderma", "lexacorton", "mofacort", "motaderm", "soft u derm", "pirotop", "ketomed scalp",
      "liquor carbonatis", "bedak salisil", "salisil", "biang keringat", "carmed", "fusycom",
      "gentamycin 5 gm", "desoximetasone", "chkm", "borax glycerin", "gom", "kenalog in orabase",
      "degirol", "sariawan", "mukosa mulut", "saluran akar gigi", "psoriasis", "dermatitis seboroik",
      "puting susu pecah", "kulit kering bersisik", "kutil", "kondiloma", "memar", "phlebitis", "hematoma"
    ) || (has("krim", "salep", "gel ") && !has("oral", "mata", "telinga", "injeksi"))
  ) {
    return { label: "Dermatologi & Topikal", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" };
  }

  // 8. Kardiovaskular & Diuretik (Evaluasi utama sebelum Nutrisi/Suplemen)
  if (
    has(
      "propranolol", "spironolactone", "bisoprolol", "concor", "digoxin", "digoksin",
      "diltiazem", "dobutamin", "dobutamine", "enalapril", "furosemide", "heparin",
      "clopidogrel", "nifedipine", "nifedipin", "warfarin", "amlodipine", "amlodipin", "candesartan", "captopril",
      "uperio", "sacubitril", "valsartan", "losartan", "irbesartan", "telmisartan",
      "thrombophob", "nicardipine", "verapamil", "ramipril", "lisinopril", "atenolol",
      "carvedilol", "hct", "hydrochlorothiazide", "dopamine", "dopamin", "cetadop",
      "epinephrine", "epinefrin", "norepinephrine", "norepinefrin", "norephinephrine",
      "enoxaparin", "fondaparinux", "xarelto", "rivaroxaban", "ticagrelor", "aspilets",
      "thrombo aspilets", "cholestat", "simvastatin", "atorvastatin", "rosuvastatin",
      "fenofibrate", "gemfibrozil", "tiaryt", "amiodarone", "trovilon", "tranexamic",
      "traneksamat", "cilostazol", "pletaal", "inviclot", "lovenox", "dikumarol",
      "hemapo", "renogen", "hipertensi", "angina", "aritmia", "jantung", "antiplatelet",
      "antikoagulan", "tromboemboli", "perdarahan", "klaudikasio intermiten",
      "anemia akibat gagal ginjal", "syok kardiogenik", "calcium channel blocker", "saluran kalsium"
    )
  ) {
    return { label: "Kardiovaskular & Diuretik", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
  }

  // 9. Antibiotik & Anti-infeksi
  if (
    has(
      "amoxicillin", "amoksisilin", "cefixime", "sefiksim", "gentamicin", "erythromycin",
      "ceftriaxone", "seftriakson", "cefadroxil", "cotrimoxazole", "azithromycin",
      "metronidazole", "chloramphenicol", "clindamycin", "nystatin", "fluconazole",
      "clarithromycin", "cefaclor", "spiramycin", "colistin", "amove", "griseofulvin",
      "isoniazid", "josamycin", "ketoconazole", "levofloxacin", "neomycin", "rifampicin",
      "tetracycline", "vancomycin", "viccillin", "ampicillin", "cipro", "baquinor",
      "zidovudine", "antibiotik", "antivirus", "antifungal", "antijamur", "antibakteri",
      "terpacef", "vancep", "zidifec", "zistic", "zovirax", "acyclovir", "asiklovir",
      "valacyclovir", "oseltamivir", "favipiravir", "itraconazole", "amphotericin",
      "albendazole", "mebendazole", "pyrantel", "pyrazinamide", "ethambutol", "streptomycin",
      "claneksi", "erysanbe", "ofloxacin", "tenofovir", "vagizol", "zoloral", "demeclocycline",
      "dirithromycin", "biothicol", "thiamphenicol", "remdesivir", "desrem", "remeva",
      "remidia", "movfor", "molnupiravir", "covid", "chloroquin", "klorokuin", "primaquine",
      "primakuin", "dhp", "frimal", "riboquin", "sulfadoxin", "pirimetamin", "malaria",
      "infeksi bakteri", "infeksi jamur", "infeksi virus", "tbc", "tuberkulosis"
    )
  ) {
    return { label: "Antibiotik & Anti-infeksi", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
  }

  // 10. Sistem Saraf & Psikiatri
  if (
    has(
      "valisanbe", "diazepam", "clobazam", "lorazepam", "alprazolam", "braxidin",
      "chlordiazepoxide", "phenobarbital", "fenobarbital", "phenytoin", "fenitoin",
      "carbamazepine", "karbamazepin", "gabapentin", "pregabalin", "valproic", "valproat",
      "zypraz", "zolpidem", "trihexyphenidyl", "trifluoperazina", "haloperidol",
      "chlorpromazine", "risperidone", "olanzapine", "quetiapine", "aripiprazole",
      "clozapine", "fluoxetine", "sertraline", "amitriptyline", "levodopa", "parkinson",
      "epilepsi", "kejang", "sedatif", "hipnotik", "ansiolitik", "cemas", "kecemasan",
      "skizofrenia", "antipsikotik", "antidepresan", "depresi", "insomnia", "coffeinum",
      "kofein", "caffeine", "ergotamin", "ericaf", "migrain", "vertigo", "meniere",
      "vertikaf", "betahistine", "citicoline", "incetyl", "piracetam", "prohiper",
      "methylphenidate", "adhd", "narkolepsi", "aricept", "donepezil", "demensia",
      "alzheimer", "mestinon", "neostigmine", "miastenia gravis", "yohimbin"
    )
  ) {
    return { label: "Sistem Saraf & Psikiatri", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100" };
  }

  // 11. Analgetik & Antipiretik
  if (
    has(
      "paracetamol", "acetaminophen", "ibuprofen", "mefenamic", "mefenamat", "diclofenac",
      "diklofenak", "meloxicam", "ketorolac", "ketorolak", "tramadol", "naproxen",
      "fentanyl", "fentanil", "indomethacin", "aspirin", "asetosal", "morphine", "morfin",
      "pethidine", "petidin", "kodein", "codeine", "noncort", "nyeri", "demam", "analgetik",
      "antipiretik", "nsaid", "antiinflamasi", "anti-inflamasi", "voltadex", "trolac",
      "ketoprofen", "piroxicam", "celecoxib", "etoricoxib", "allopurinol", "kolkisin",
      "colchicine", "febuxostat", "asam urat", "gout", "artritis"
    )
  ) {
    return { label: "Analgetik & Antipiretik", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" };
  }

  // 12. Pernapasan & Alergi
  if (
    has(
      "salbutamol", "ambroxol", "glyceryl", "pseudoephedrine", "theophylline", "teofilin",
      "acetylcysteine", "asetilsistein", "aminophylline", "aminofilin", "ipratropium",
      "dextromethorphan", "diphenhydramine", "difenhidramin", "bromhexine", "budesonide",
      "xylometazoline", "vectrine", "erdosteine", "cetirizine", "asma", "batuk",
      "theobron", "tremenza", "tuzalos", "ventolin", "resfar", "rhinos neo", "epexol",
      "mucohexin", "survanta", "neokaf", "apnea", "tiotropium", "fluticasone", "loratadine",
      "ctm", "chlorpheniramine", "fexofenadine", "bronkospasme", "ppok", "pilek", "flu",
      "rhinitis", "alergi", "sesak", "dahak", "mukolitik", "dekongestan"
    )
  ) {
    return { label: "Pernapasan & Alergi", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-100" };
  }

  // 13. Gastrointestinal
  if (
    has(
      "metoclopramide", "ranitidine", "domperidone", "domperidon", "zinc", "zinkid",
      "lactulose", "laktulosa", "lactulax", "omeprazole", "ondansetron", "sucralfate",
      "sukralfat", "loperamide", "hyoscine", "hiosin", "ursodeoxycholic", "urdafalk",
      "lansoprazole", "pantoprazole", "esomeprazole", "rabeprazole", "cimetidine",
      "famotidine", "ulsidex", "vometa", "vosedon", "vesperum", "bisacodyl", "dulcolax",
      "oralit", "salofalk", "mesalazine", "balsalazide", "borraginol", "antihemoroid",
      "wasir", "hemoroid", "hepabal", "lambung", "maag", "tukak", "gerd", "mual",
      "muntah", "antiemetik", "diare", "laksatif", "konstipasi", "pencahar", "dispepsia",
      "kembung", "spasme", "antasida", "antacid", "fungsi hati", "kolitis ulseratif"
    )
  ) {
    return { label: "Gastrointestinal", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" };
  }

  // 14. Hormon & Kortikosteroid
  if (
    has(
      "prednisone", "prednison", "dexamethasone", "deksametason", "methylprednisolone",
      "metilprednisolon", "oxytocin", "oksitosin", "induxin", "insulin", "thiamazole",
      "tiamazol", "thyrozol", "triamcinolone", "triamsinolon", "cinolon", "cortidex",
      "fartison", "trilac", "hydrocortisone", "hidrokortison", "fludrokortison",
      "metformin", "glimepiride", "glibenclamide", "gliclazide", "acarbose", "pioglitazone",
      "levothyroxine", "propiltiourasil", "ptu", "karbimazol", "progesteron", "utrogestan",
      "luteron", "hystolan", "estrogen", "testosteron", "dienogest", "linestrenol",
      "medroksi", "noretisteron", "levonorgestrel", "desogestrel", "clomifene", "infertilitas",
      "ovulasi", "diethylstilbestrol", "somanovell", "somatropin", "growth hormone",
      "kortikosteroid", "steroid", "hormon", "diabetes", "gula darah", "tiroid", "kontrasepsi",
      "haid", "persalinan prematur", "insufisiensi adrenal"
    )
  ) {
    return { label: "Hormon & Kortikosteroid", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" };
  }

  // 15. Urologi & Saluran Kemih
  if (
    has(
      "harnal", "tamsulosin", "terazosin", "bph", "hiperplasia prostat", "prostat",
      "urinter", "pipemidic", "asam pipemidat", "antiseptik urin", "alkalinisasi urin"
    ) && !has("kontras")
  ) {
    return { label: "Urologi & Saluran Kemih", color: "text-teal-800", bg: "bg-teal-50", border: "border-teal-200" };
  }

  // 16. Nutrisi, Vitamin & Mineral (Suplemen)
  const isCcbOrCardiac = has("saluran kalsium", "calcium channel", "hipertensi", "angina", "aritmia");
  if (
    has(
      "vitamin", "vit ", "vit_", "vitcee", "vitacimin", "vitacee", "suplemen", "multivitamin",
      "calcitriol", "asam folat", "folic acid", "tiamin", "thiamine", "piridoksin",
      "pyridoxine", "kobalamin", "cyanocobalamin", "mecobalamin", "megabal", "rincobal",
      "neurobion", "sangobion", "vipalbumin", "zamel", "becom", "curcuma", "curvit",
      "oscal", "osfit", "osteosan", "stimuno", "tablet tambah darah", "lactamor",
      "nutriflam", "zat besi", "ferrous", "maltofer", "iron", "albumin", "retinol",
      "defisiensi vitamin", "asam amino", "nutrisi parenteral", "daya tahan tubuh",
      "sistem imun", "antioksidan", "tumbuh kembang", "kesehatan tulang", "neuropati perifer"
    ) || (!isCcbOrCardiac && has("kalsium", "calcium"))
  ) {
    return { label: "Nutrisi, Vitamin & Mineral", color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-200" };
  }

  return { label: "Lain-lain & Khusus", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100" };
};

export const THERAPEUTIC_CATEGORIES = [
  { id: "all", label: "Semua Kategori" },
  { id: "antibiotik", label: "Antibiotik & Anti-infeksi" },
  { id: "analgetik", label: "Analgetik & Antipiretik" },
  { id: "kardio", label: "Kardiovaskular & Diuretik" },
  { id: "saraf", label: "Sistem Saraf & Psikiatri" },
  { id: "pernapasan", label: "Pernapasan & Alergi" },
  { id: "gastro", label: "Gastrointestinal" },
  { id: "hormon", label: "Hormon & Kortikosteroid" },
  { id: "nutrisi", label: "Nutrisi, Vitamin & Mineral" },
  { id: "cairan", label: "Cairan Intravena & Elektrolit" },
  { id: "anestesi", label: "Anestesi & Pelemas Otot" },
  { id: "mata_tht", label: "Mata & THT" },
  { id: "dermatologi", label: "Dermatologi & Topikal" },
  { id: "onkologi", label: "Onkologi & Imunosupresan" },
  { id: "vaksin", label: "Vaksin & Imunologi" },
  { id: "urologi", label: "Urologi & Saluran Kemih" },
  { id: "khusus", label: "Diagnostik & Khusus" },
];

export const isCategoryMatched = (catId: string, categoryLabel: string): boolean => {
  if (catId === "all") return true;
  if (catId === "antibiotik") return categoryLabel === "Antibiotik & Anti-infeksi";
  if (catId === "analgetik") return categoryLabel === "Analgetik & Antipiretik";
  if (catId === "kardio") return categoryLabel === "Kardiovaskular & Diuretik";
  if (catId === "saraf") return categoryLabel === "Sistem Saraf & Psikiatri";
  if (catId === "pernapasan") return categoryLabel === "Pernapasan & Alergi";
  if (catId === "gastro") return categoryLabel === "Gastrointestinal";
  if (catId === "hormon") return categoryLabel === "Hormon & Kortikosteroid";
  if (catId === "nutrisi") return categoryLabel === "Nutrisi, Vitamin & Mineral";
  if (catId === "cairan") return categoryLabel === "Cairan Intravena & Elektrolit";
  if (catId === "anestesi") return categoryLabel === "Anestesi & Pelemas Otot";
  if (catId === "mata_tht") return categoryLabel === "Mata & THT";
  if (catId === "dermatologi") return categoryLabel === "Dermatologi & Topikal";
  if (catId === "onkologi") return categoryLabel === "Onkologi & Imunosupresan";
  if (catId === "vaksin") return categoryLabel === "Vaksin & Imunologi";
  if (catId === "urologi") return categoryLabel === "Urologi & Saluran Kemih";
  if (catId === "khusus" || catId === "lainnya") return categoryLabel === "Diagnostik & Khusus" || categoryLabel === "Lain-lain & Khusus";
  return true;
};

// Helper to determine the drug formulation/route based on preset details
const getDrugFormulation = (preset: DrugPreset) => {
  const notesLower = (preset.notes || "").toLowerCase();
  const nameLower = preset.name.toLowerCase();
  const idLower = preset.id.toLowerCase();
  const combined = `${nameLower} ${notesLower} ${idLower}`;

  // 1. Check for Topical (Krim / Salep / Gel)
  const isTopical = 
    idLower.includes("cinolon") ||
    nameLower.includes("cinolon") ||
    idLower.includes("thrombophob") ||
    nameLower.includes("thrombophob") ||
    idLower.includes("bioplacenton") ||
    idLower.includes("burnazin") ||
    combined.includes("krim") ||
    combined.includes("cream") ||
    combined.includes("salep") ||
    combined.includes("ointment") ||
    combined.includes("gel") ||
    combined.includes("topikal") ||
    combined.includes("lotion");

  // 2. Check for Inhalation
  const isInhalation =
    idLower.includes("budesonide") ||
    idLower.includes("budesonid") ||
    combined.includes("inhaler") ||
    combined.includes("inhalasi") ||
    combined.includes("nebulizer") ||
    combined.includes("respules") ||
    combined.includes("spray") ||
    combined.includes("semprot hidung");

  // 3. Check for Suppository / Rectal
  const isSuppository =
    combined.includes("suppositoria") ||
    combined.includes("supositoria") ||
    combined.includes("enema") ||
    combined.includes("rektal");

  // 4. Check for Parenteral / Injection using word boundaries
  const hasInjection =
    combined.includes("injeksi") ||
    combined.includes("injection") ||
    combined.includes("infus") ||
    combined.includes("infusion") ||
    combined.includes("ampul") ||
    combined.includes("vial") ||
    /\b(iv|im|sc|intravena|intramuskular|subkutan)\b/i.test(combined);

  // 5. Check for Solid Oral (Tablet, Kapsul, Kaplet)
  const hasSolidOral =
    combined.includes("tablet") ||
    combined.includes("kapsul") ||
    combined.includes("kaplet") ||
    combined.includes("caplet") ||
    combined.includes("capsule") ||
    combined.includes("dispersible") ||
    idLower.includes("concor") ||
    idLower.includes("cilostazol") ||
    idLower.includes("becom") ||
    idLower.includes("uperio") ||
    idLower.includes("thiamazole");

  // 6. Check for Liquid Oral (Sirup, Suspensi, Drops)
  const hasLiquidOral =
    combined.includes("sirup") ||
    combined.includes("suspensi") ||
    combined.includes("drops") ||
    combined.includes("eliksir") ||
    combined.includes("cairan oral") ||
    (preset.liquidConcentrationValue != null && preset.liquidConcentrationVolume != null);

  // Resolution order:
  // If explicitly topical and not oral/injeksi:
  if (isTopical && !hasSolidOral && !hasInjection) {
    return { label: "Krim / Salep", icon: "🧴", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  }

  // Inhalation
  if (isInhalation && !hasSolidOral) {
    return { label: "Inhalasi", icon: "🌬️", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
  }

  // Suppository
  if (isSuppository && !hasSolidOral) {
    return { label: "Suppositoria", icon: "💊", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" };
  }

  // Multi-Sediaan (Oral & Injeksi)
  if (hasInjection && (hasSolidOral || hasLiquidOral)) {
    return { label: "Multi-Sediaan (Oral & Injeksi)", icon: "💉", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" };
  }

  // Solely Injection
  if (hasInjection && !hasSolidOral && !hasLiquidOral) {
    return { label: "Injeksi", icon: "💉", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  }

  // Oral (Tablet & Sirup)
  if (hasSolidOral && hasLiquidOral) {
    return { label: "Oral (Tablet & Sirup)", icon: "💊", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" };
  }

  // Solely Liquid Oral
  if (hasLiquidOral && !hasSolidOral) {
    return { label: "Sirup / Suspensi", icon: "💧", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200" };
  }

  // If topical with other attributes
  if (isTopical) {
    return { label: "Krim / Salep", icon: "🧴", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  }

  // Default: Tablet
  return { label: "Tablet", icon: "💊", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
};

// Helper to provide clinical drug metadata
const getDrugMetadata = (preset: DrugPreset) => {
  const { brand, generic } = getGenericAndBrand(preset.name, preset.id);
  
  const cleanBrand = brand;
  const cleanGeneric = generic;
  const isBrand = isBrandDrug(preset, cleanBrand, cleanGeneric);
  
  let composition = "";
  const genericLower = cleanGeneric.toLowerCase();
  const idLowerPreset = preset.id.toLowerCase();

  if (idLowerPreset.includes("paracetamol") || genericLower.includes("paracetamol") || idLowerPreset.includes("asetaminofen")) {
    composition = `Tiap 0.6 mL drop mengandung Paracetamol 60 mg; tiap 1 mL drop mengandung 100 mg; sirup 120 mg/5 mL; sirup forte 250 mg/5 mL; tablet/kaplet 500 mg & 650 mg; infus IV 10 mg/mL (1000 mg/100 mL); suppositoria rektal 125 mg & 250 mg`;
  } else if (idLowerPreset.includes("ibuprofen") || genericLower.includes("ibuprofen")) {
    composition = `Tiap 5 mL sirup suspensi mengandung Ibuprofen 100 mg; sirup forte 200 mg/5 mL; tablet salut selaput 200 mg & 400 mg`;
  } else if (idLowerPreset.includes("captopril") || genericLower.includes("captopril") || genericLower.includes("kaptopril")) {
    composition = `Tiap tablet mengandung Kaptopril 12.5 mg, 25 mg, atau 50 mg`;
  } else if (idLowerPreset.includes("candesartan") || genericLower.includes("candesartan") || genericLower.includes("kandesartan")) {
    composition = `Tiap tablet mengandung Kandesartan Sileksetil 8 mg atau 16 mg`;
  } else if (idLowerPreset.includes("omeprazol") || genericLower.includes("omeprazol")) {
    composition = `Tiap kapsul lepas tunda mengandung Omeprazole 20 mg; vial serbuk steril injeksi/infus IV 40 mg`;
  } else if (idLowerPreset.includes("lansoprazol") || genericLower.includes("lansoprazol")) {
    composition = `Tiap kapsul lepas tunda mengandung Lansoprazole 30 mg; vial serbuk injeksi IV 30 mg`;
  } else if (idLowerPreset.includes("simvastatin") || genericLower.includes("simvastatin")) {
    composition = `Tiap tablet salut selaput mengandung Simvastatin 10 mg atau 20 mg`;
  } else if (idLowerPreset.includes("atorvastatin") || genericLower.includes("atorvastatin")) {
    composition = `Tiap tablet salut selaput mengandung Atorvastatin Kalsium Trihidrat 10 mg, 20 mg, atau 40 mg`;
  } else if (idLowerPreset.includes("metformin") || genericLower.includes("metformin")) {
    composition = `Tiap tablet mengandung Metformin HCl 500 mg atau 850 mg; tablet lepas lambat (XR) 500 mg & 750 mg`;
  } else if (idLowerPreset.includes("furosemid") || genericLower.includes("furosemid")) {
    composition = `Tiap tablet mengandung Furosemid 40 mg; tiap ampul injeksi IV/IM 20 mg/2 mL (10 mg/mL)`;
  } else if (idLowerPreset.includes("salbutamol") || genericLower.includes("salbutamol")) {
    composition = `Tiap ampul cairan inhalasi (Respules) mengandung Salbutamol 2.5 mg dalam 2.5 mL untuk nebulizer; sirup 2 mg/5 mL; tablet 2 mg & 4 mg; MDI inhaler 100 mcg/semprot`;
  } else if (idLowerPreset.includes("ondansetron") || genericLower.includes("ondansetron")) {
    composition = `Tiap tablet salut selaput mengandung Ondansetron HCl 4 mg atau 8 mg; sirup 4 mg/5 mL; ampul injeksi 4 mg/2 mL dan 8 mg/4 mL`;
  } else if (idLowerPreset.includes("ceftriaxon") || genericLower.includes("ceftriaxon") || genericLower.includes("seftriakson")) {
    composition = `Tiap vial serbuk steril mengandung Seftriakson Sodium setara Seftriakson 1 g untuk injeksi/infus IV atau IM`;
  } else if (idLowerPreset.includes("cefadroxil") || genericLower.includes("cefadroxil") || genericLower.includes("sefadroksil")) {
    composition = `Tiap kapsul mengandung Sefadroksil Monohidrat 500 mg; sirup kering 125 mg/5 mL & 250 mg/5 mL (botol 60 mL)`;
  } else if (idLowerPreset.includes("metronidazol") || genericLower.includes("metronidazol")) {
    composition = `Tiap tablet mengandung Metronidazole 250 mg atau 500 mg; sirup suspensi 125 mg/5 mL; botol infus IV 500 mg/100 mL`;
  } else if (preset.id.includes("azithromycin")) {
    composition = `Tiap tablet mengandung ${cleanGeneric} 250 mg / 500 mg; sirup kering (suspensi) 200 mg/5 mL; vial serbuk injeksi/infus 500 mg`;
  } else if (preset.id.includes("becom")) {
    composition = `Kaplet Becom-C (Vitamin B Kompleks + Vitamin C 500 mg) & Becom-Zet (Vitamin B Kompleks, Vitamin C 750 mg, Vitamin E 30 IU, Asam Folat 400 mcg, Zinc 22.5 mg)`;
  } else if (preset.id.includes("bisoprolol")) {
    composition = `Tiap tablet salut selaput mengandung Bisoprolol Fumarat 2.5 mg, 5 mg, atau 10 mg`;
  } else if (preset.id.includes("budesonid") || preset.id.includes("budesonide")) {
    composition = `Tiap ampul Respules (2 mL) mengandung Budesonide cairan inhalasi suspensi 0.25 mg/mL (0.5 mg/ampul) atau 0.5 mg/mL (1 mg/ampul) untuk nebulizer`;
  } else if (preset.id.includes("tramadol")) {
    composition = `Tiap kapsul/tablet mengandung Tramadol HCl 50 mg; tiap ampul injeksi (2 mL) mengandung Tramadol HCl 100 mg (50 mg/mL)`;
  } else if (preset.id.includes("vancomycin")) {
    composition = `Tiap vial mengandung Vankomisin Hidroklorida serbuk steril 500 mg atau 1 g untuk larutan infus intravena`;
  } else if (preset.id.includes("thiamazole")) {
    composition = `Tiap tablet salut selaput mengandung Thiamazole (Metimazol) 5 mg atau 10 mg`;
  } else if (preset.id.includes("thrombophob")) {
    composition = `Gel: Heparin Sodium 20.000 IU per 100 g (tube 10 g & 20 g); Ointment: Heparin Sodium 5.000 IU + Benzil Nikotinat 250 mg (tube 20 g)`;
  } else if (preset.id.includes("triamcinolone")) {
    composition = `Tiap tablet oral mengandung Triamcinolone 4 mg; tiap vial (5 mL) mengandung suspensi injeksi Triamcinolone Acetonide 10 mg/mL (50 mg/vial) atau 40 mg/mL`;
  } else if (preset.id.includes("uperio")) {
    composition = `Tiap tablet salut selaput mengandung kombinasi Sakubitril / Valsartan: 50 mg (24.3/25.7 mg), 100 mg (48.6/51.4 mg), atau 200 mg (97.2/102.8 mg)`;
  } else if (preset.id.includes("valisanbe")) {
    composition = `Tiap tablet mengandung Diazepam 2 mg atau 5 mg; tiap ampul injeksi (2 mL) mengandung Diazepam 10 mg (5 mg/mL)`;
  } else if (preset.id.includes("vectrine")) {
    composition = `Tiap kapsul mengandung Erdosteine 300 mg; tiap 5 mL sirup kering (suspensi setelah rekonstitusi) mengandung Erdosteine 175 mg (botol 60 mL)`;
  } else if (preset.id.includes("viccillin")) {
    composition = `Viccillin Vial: Ampisilin murni 1 g; Viccillin-SX Vial: Ampisilin 1 g + Sulbaktam 0.5 g (total 1.5 g) serbuk injeksi IV/IM`;
  } else if (preset.id.includes("zinkid")) {
    composition = `Tiap tablet dispersibel mengandung Zinc Sulfat setara Seng elemental 20 mg; tiap 5 mL sirup mengandung Zinc Sulfat setara Seng elemental 10 mg (botol 100 mL)`;
  } else if (preset.id.includes("cefixime")) {
    composition = `Tiap kapsul/tablet mengandung Cefixime Trihydrate 100 mg atau 200 mg; tiap 5 mL sirup kering (suspensi setelah rekonstitusi) mengandung Cefixime 100 mg (botol 30 mL)`;
  } else if (preset.id.includes("cetirizine")) {
    composition = `Tiap tablet salut selaput mengandung Cetirizine 10 mg; tiap 5 mL sirup mengandung Cetirizine 5 mg (botol 60 mL); tiap mL drops mengandung Cetirizine 10 mg`;
  } else if (preset.id.includes("chloramphenicol") || preset.id.includes("kloramfenikol")) {
    composition = `Tiap kapsul mengandung Kloramfenikol 250 mg atau 500 mg; tiap 5 mL suspensi oral mengandung Kloramfenikol Palmitat setara 125 mg Kloramfenikol (botol 60 mL); vial serbuk injeksi IV 1 g`;
  } else if (preset.id.includes("cinolon")) {
    composition = `Cinolon Krim: Fluocinolone Acetonide 0.025% (tube 10 g); Cinolon-N Krim: Fluocinolone Acetonide 0.025% + Neomycin Sulfate 0.5% (tube 5 g & 10 g)`;
  } else if (preset.id.includes("ciprofloxacin") || preset.id.includes("cipro")) {
    composition = `Tiap tablet salut selaput mengandung Ciprofloxacin HCl 250 mg atau 500 mg; tiap 100 mL infus IV mengandung Ciprofloxacin 200 mg (2 mg/mL)`;
  } else if (preset.id.includes("concor")) {
    composition = `Tiap tablet salut selaput mengandung Bisoprolol Fumarat 1.25 mg, 2.5 mg, 5 mg, atau 10 mg`;
  } else if (preset.id.includes("cortidex")) {
    composition = `Tiap tablet mengandung Dexamethasone mikronisasi 0.5 mg; tiap ampul injeksi (1 mL) mengandung Dexamethasone Sodium Phosphate 5 mg (5 mg/mL)`;
  } else if (preset.id.includes("digoxin") || preset.id.includes("digoksin")) {
    composition = `Tiap tablet mengandung Digoxin 0.25 mg; tiap mL sirup/eliksir mengandung Digoxin 0.05 mg (botol 60 mL); tiap ampul injeksi (2 mL) mengandung Digoxin 0.5 mg (0.25 mg/mL)`;
  } else if (preset.id.includes("diltiazem")) {
    composition = `Tiap tablet mengandung Diltiazem HCl 30 mg; kapsul lepas lambat (SR) 100 mg & 200 mg; vial serbuk injeksi/infus 10 mg & 50 mg`;
  } else if (preset.id.includes("dobutamin") || preset.id.includes("dobutamine")) {
    composition = `Tiap ampul/vial konsentrat steril untuk infus mengandung Dobutamine HCl setara Dobutamine 250 mg dalam 5 mL (50 mg/mL)`;
  } else if (preset.id.includes("domperidon") || preset.id.includes("domperidone")) {
    composition = `Tiap tablet mengandung Domperidone 10 mg; tiap 5 mL suspensi oral mengandung Domperidone 5 mg (botol 60 mL); tiap mL drops oral mengandung 5 mg (botol 10 mL)`;
  } else if (preset.liquidConcentrationValue && preset.liquidConcentrationVolume) {
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

  const categoryInfoObj = getDrugCategory(preset.id, preset.name);
  const safetyReview = getDrugSafetyReview(preset, cleanGeneric, cleanBrand, categoryInfoObj.label);
  const contraindication = safetyReview.contraindication;
  const pregnancySafety = safetyReview.pregnancySafety;
  const breastfeedingSafety = safetyReview.breastfeedingSafety;

  let drugClass: "Obat Keras" | "Obat Bebas Terbatas" | "Obat Bebas" = "Obat Keras";
  const idLower = preset.id.toLowerCase();
  const nameLower = preset.name.toLowerCase();

  // 1. Obat Bebas (Lingkaran Hijau):
  if (
    idLower.includes("paracetamol") ||
    nameLower.includes("paracetamol") ||
    idLower.includes("acetaminophen") ||
    nameLower.includes("acetaminophen") ||
    idLower.includes("antacid") ||
    nameLower.includes("antasida") ||
    idLower.includes("oralit") ||
    nameLower.includes("oralit") ||
    idLower.includes("zinc") ||
    nameLower.includes("zinc") ||
    idLower.includes("zinkid") ||
    nameLower.includes("zinkid") ||
    idLower.includes("becom") ||
    nameLower.includes("becom") ||
    idLower.includes("vitamin") ||
    nameLower.includes("vitamin")
  ) {
    drugClass = "Obat Bebas";
  }
  // 2. Obat Bebas Terbatas (Lingkaran Biru):
  else if (
    idLower.includes("ibuprofen") ||
    nameLower.includes("ibuprofen") ||
    idLower.includes("ambroxol") ||
    nameLower.includes("ambroxol") ||
    idLower.includes("bromhexine") ||
    nameLower.includes("bromhexine") ||
    idLower.includes("dextromethorphan") ||
    nameLower.includes("dextromethorphan") ||
    idLower.includes("pseudoephedrine") ||
    nameLower.includes("pseudoephedrine") ||
    idLower.includes("thrombophob") ||
    nameLower.includes("thrombophob") ||
    idLower.includes("tremenza") ||
    nameLower.includes("tremenza") ||
    idLower.includes("ctm") ||
    nameLower.includes("chlorpheniramine")
  ) {
    drugClass = "Obat Bebas Terbatas";
  }
  // 3. Obat Keras (Lingkaran Merah dengan huruf K):
  else {
    drugClass = "Obat Keras";
  }

  let mechanism = "Mekanisme kerja spesifik bergantung pada kelas farmakologis obat ini. Bekerja pada reseptor atau enzim target untuk menghasilkan efek terapeutik.";
  let categoryInfo = getDrugCategory(preset.id, preset.name).label;
  let precautions = "Hati-hati penggunaan pada pasien dengan riwayat alergi, gangguan fungsi ginjal atau hati, dan lansia. Konsultasikan dengan dokter jika gejala menetap.";
  let dosageRule = `Dosis lazim: ${doseMin}. Dosis maksimal: ${doseMax}. Gunakan sesuai indikasi: ${preset.indication}. ${preset.notes || ""}`;
  let usageGuide = "Gunakan sesuai petunjuk dokter atau aturan pakai pada kemasan. Jangan menggandakan dosis jika terlewat.";
  let sideEffects = "Efek samping umum mungkin meliputi gangguan gastrointestinal ringan, mual, atau alergi (ruam). Hentikan penggunaan jika terjadi reaksi alergi berat.";
  let references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM - NIH), Farmakope Indonesia VI, PIONAS BPOM RI, dan Trissel's Handbook on Injectable Drugs (ASHP).";

  const categoryLabel = categoryInfo.toLowerCase();
  
  if (categoryLabel.includes("antibiotik") || categoryLabel.includes("anti-infeksi")) {
    mechanism = "Bekerja dengan menghambat sintesis dinding sel bakteri, menghambat sintesis protein, atau replikasi DNA bakteri sehingga menyebabkan kematian bakteri (bakterisidal) atau menghambat pertumbuhannya (bakteriostatik).";
    precautions = "Gunakan sampai habis sesuai resep dokter untuk mencegah resistensi antibiotik. Hati-hati pada pasien dengan riwayat alergi penisilin/sefalosporin atau antibiotik lainnya.";
    usageGuide = "Sebaiknya diminum bersama makanan untuk mengurangi iritasi lambung (misal: Amoksisilin) atau sesuai anjuran spesifik pada waktu perut kosong. Habiskan seluruh dosis yang diresepkan meskipun gejala sudah hilang.";
    sideEffects = "Diare, mual, muntah, ruam kulit alergi, atau risiko superinfeksi jamur (candidiasis) jika digunakan dalam jangka panjang.";
    references = "PIONAS BPOM RI, FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), PPK Penatalaksanaan Infeksi, Trissel's Handbook on Injectable Drugs.";
  } else if (categoryLabel.includes("analgetik")) {
    mechanism = "Bekerja menghambat enzim siklooksigenase (COX) di sistem saraf pusat atau perifer, yang bertugas memproduksi prostaglandin (senyawa pemicu nyeri dan demam).";
    precautions = "Hati-hati pada pasien dengan gangguan hati akut (untuk Paracetamol), atau riwayat tukak lambung dan gangguan ginjal (untuk Ibuprofen / NSAID lainnya).";
    usageGuide = "NSAID/Ibuprofen harus diminum setelah makan atau bersama makanan untuk mencegah iritasi lambung. Paracetamol dapat diminum sebelum atau sesudah makan.";
    sideEffects = "Risiko hepatotoksisitas pada overdosis (Paracetamol). Dispepsia, nyeri ulu hati, mual, dan risiko perdarahan lambung (AINS/Ibuprofen).";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), PIONAS BPOM RI, dan Farmakope Indonesia VI.";
  } else if (categoryLabel.includes("hormon") || categoryLabel.includes("kortikosteroid")) {
    mechanism = "Berikatan dengan reseptor glukokortikoid intraseluler, menekan respons peradangan (inflamasi) dan menekan sistem kekebalan tubuh yang berlebihan.";
    precautions = "Hindari penghentian mendadak (harus tapering off) pada penggunaan jangka panjang. Awasi tanda-tanda infeksi sekunder karena efek imunosupresif.";
    usageGuide = "Sebaiknya diminum pada pagi hari sesudah makan untuk mengikuti irama sirkadian alami tubuh (sekresi kortisol) dan mencegah iritasi lambung.";
    sideEffects = "Peningkatan nafsu makan, retensi cairan/wajah moon-face, gangguan tidur, imunosupresi, peningkatan gula darah, dan sindrom Cushing pada penggunaan lama.";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), dan PIONAS BPOM RI.";
  } else if (categoryLabel.includes("pernapasan") || categoryLabel.includes("alergi")) {
    mechanism = "Bekerja dengan memblokir reseptor histamin (antihistamin), merelaksasi otot polos saluran napas (bronkodilator), atau mengencerkan dahak (mukolitik/ekspektoran).";
    precautions = "Beberapa obat (seperti CTM, Cetirizine) dapat menyebabkan kantuk. Hindari mengemudi atau mengoperasikan mesin berat setelah mengonsumsinya. Hati-hati pada pasien hipertensi (untuk dekongestan).";
    usageGuide = "Dapat diminum bersama atau tanpa makanan. Untuk inhaler/nebulizer, ikuti teknik penggunaan alat yang benar (lihat tab Panduan Pemakaian Alat).";
    sideEffects = "Kantuk (mengantuk), mulut kering, jantung berdebar (palpitasi akibat bronkodilator), pusing, dan gangguan pencernaan ringan.";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), GINA Guidelines, dan PIONAS BPOM RI.";
  } else if (categoryLabel.includes("gastrointestinal")) {
    mechanism = "Bekerja dengan menetralkan asam lambung (antasida), menghambat sekresi asam lambung (PPI/H2-blocker), atau memblokir reseptor mual-muntah di otak (antiemetik).";
    precautions = "Perhatikan interaksi obat, karena perubahan keasaman lambung dapat mengganggu penyerapan obat lain (misalnya antibiotik tertentu atau zat besi).";
    usageGuide = "Antasida dan PPI (seperti Omeprazole) sebaiknya diminum 30-60 menit sebelum makan. Pelapis lambung (Sukralfat) harus diminum dalam keadaan perut kosong.";
    sideEffects = "Konstipasi (sembelit), diare, perut kembung, sakit kepala, atau kelelahan ringan.";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), dan PIONAS BPOM RI.";
  } else if (categoryLabel.includes("kardiovaskular") || categoryLabel.includes("diuretik")) {
    mechanism = "Bekerja menurunkan resistensi vaskular sistemik, mengontrol frekuensi denyut jantung (beta-bloker / antagonis kalsium), modulasi sistem renin-angiotensin-aldosteron (ACE-i/ARB), atau memicu ekskresi natrium dan air (diuretik).";
    precautions = "Pantau tekanan darah, laju nadi secara rutin, dan fungsi ginjal/elektrolit berkala. Hindari penghentian mendadak tanpa konsultasi dokter karena risiko hipertensi berulang (rebound).";
    usageGuide = "Diminum teratur pada jam yang sama setiap hari (biasanya pagi hari). Jangan menggandakan dosis jika terlupa.";
    sideEffects = "Pusing/hipotensi ortostatik saat bangkit mendadak, rasa lelah, denyut jantung melambat (bradikardia), atau pembengkakan pergelangan kaki (edema perifer).";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), AHA/ACC Guidelines, ESC Practice Guidelines, PERKI, dan PIONAS.";
  } else if (categoryLabel.includes("onkologi")) {
    mechanism = "Bekerja menginterkalasi pasangan basa DNA, menghambat enzim topoisomerase II, dan membentuk radikal bebas intraseluler yang menyebabkan pemutusan untai ganda DNA serta induksi apoptosis sel tumor yang aktif membelah.";
    precautions = "Wajib pemantauan hitung darah lengkap (CBC dengan hitung jenis & ANC), fungsi hepar (LFT), serta evaluasi fungsi ventrikel kiri (LVEF melalui ekokardiografi) sebelum dan berkala selama terapi. Perhatikan ketat batas akumulatif seumur hidup (maksimal 450-550 mg/m²). Obat merupakan vesikan poten, waspadai risiko ekstravasasi.";
    usageGuide = "Diberikan melalui infus intravena lambat menggunakan akses vena sentral (PICC/CVC) atau infus perifer paten oleh tenaga medis terlatih dengan APD sitotoksik lengkap. Beritahu pasien bahwa urin dapat berwarna kemerahan selama 24-48 jam pertama pasca pemberian (merupakan warna eliminasi obat normal, bukan hematuria).";
    sideEffects = "Mielosupresi berat (neutropenia, trombositopenia, anemia), alopesia total (reversibel), mual muntah (emetogenik sedang-tinggi), mukositis oral/stomatitis, kardiotoksisitas (aritmia hingga kardiomiopati kongestif), dan perubahan warna urin merah.";
    references = "FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed (NLM), NCCN Clinical Practice Guidelines in Oncology, dan PIONAS BPOM RI.";
  }

  let bud = "Tablet / Kapsul: Sesuai tanggal kedaluwarsa pada kemasan jika disimpan dengan baik.";
  if (idLowerPreset.includes("onc") || idLowerPreset.includes("doxorubicin") || idLowerPreset.includes("doksorubisin")) {
    bud = "Injeksi Sitotoksik / Konsentrat Rekonstitusi: Setelah dilarutkan dalam NaCl 0.9% atau Dextrose 5%, stabil selama 24-48 jam pada suhu kulkas (2-8°C) terlindung dari cahaya, atau sesuai protokol rekonstitusi aseptis sitotoksik RS.";
  } else if (preset.id.includes("syr") || preset.id.includes("susp") || preset.id.includes("drop") || preset.id.includes("ped")) {
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
    isBrand,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpdateDrugModalOpen, setIsUpdateDrugModalOpen] = useState(false);
  const [isGlassSettingsOpen, setIsGlassSettingsOpen] = useState(false);
  const [glassOpacity, setGlassOpacity] = useState<number>(() => {
    const saved = localStorage.getItem("piobari_glass_opacity");
    return saved ? parseFloat(saved) : 0.82;
  });
  const [glassBlur, setGlassBlur] = useState<number>(() => {
    const saved = localStorage.getItem("piobari_glass_blur");
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    localStorage.setItem("piobari_glass_opacity", glassOpacity.toString());
    localStorage.setItem("piobari_glass_blur", glassBlur.toString());
    document.documentElement.style.setProperty("--glass-opacity", glassOpacity.toString());
    document.documentElement.style.setProperty("--glass-blur", `${glassBlur}px`);
  }, [glassOpacity, glassBlur]);

  const [drugCsvFile, setDrugCsvFile] = useState<File | null>(null);
  const [drugCsvError, setDrugCsvError] = useState("");

  const handleUpdateDrugData = async () => {
    if (!drugCsvFile) {
      setDrugCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }

    const fileExt = drugCsvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      try {
        const Papa = (await import("papaparse")).default;
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
      } catch (err: any) {
        setDrugCsvError("Gagal memuat modul CSV: " + err.message);
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = await import("xlsx");
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
        return sanitizeDrugPresets(combined).sort((a, b) => a.name.localeCompare(b.name, "id"));
      });
      setIsUpdateDrugModalOpen(false);
      setDrugCsvError("");
      setDrugCsvFile(null);
    } else {
      setDrugCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat (id, name, dll).");
    }
  };

  const handleDownloadDrugTemplate = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(INITIAL_DRUG_PRESETS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Informasi_Obat");
    XLSX.writeFile(wb, "Template_Informasi_Obat.xlsx");
  };

    const [interactionDatabase, setInteractionDatabase] = useState<DrugInteraction[]>(() => {
    localStorage.removeItem("interactionDatabase_v4");
    localStorage.removeItem("interactionDatabase_v5");
    localStorage.removeItem("interactionDatabase_v6");
    const saved = localStorage.getItem("interactionDatabase_v7");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DrugInteraction[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(item => item.id));
          const missing = INITIAL_INTERACTION_DATABASE.filter(item => !existingIds.has(item.id));
          const updated = parsed.map(item => {
            const fresh = INITIAL_INTERACTION_DATABASE.find(f => f.id === item.id);
            return fresh || item;
          });
          const merged = [...updated, ...missing];
          localStorage.setItem("interactionDatabase_v7", JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        return INITIAL_INTERACTION_DATABASE;
      }
    }
    localStorage.setItem("interactionDatabase_v7", JSON.stringify(INITIAL_INTERACTION_DATABASE));
    return INITIAL_INTERACTION_DATABASE;
  });

  useEffect(() => {
    localStorage.setItem("interactionDatabase_v7", JSON.stringify(interactionDatabase));
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
      try {
        const Papa = (await import("papaparse")).default;
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
      } catch (err: any) {
        setDdiCsvError("Gagal memuat parser CSV: " + err.message);
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = await import("xlsx");
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

  const handleDownloadDdiTemplate = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(INITIAL_INTERACTION_DATABASE);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Skrining_Interaksi");
    XLSX.writeFile(wb, "Template_Skrining_Interaksi.xlsx");
  };

  const checkInteractions = (presetAId: string, presetBId: string): DrugInteraction[] => {
    if (!presetAId || !presetBId || presetAId === "custom" || presetBId === "custom") {
      return [];
    }

    // 1. Direct exact ID match (bidirectional)
    const directMatches = interactionDatabase.filter(interaction => {
      const matchDirect = interaction.drugAId === presetAId && interaction.drugBId === presetBId;
      const matchReverse = interaction.drugAId === presetBId && interaction.drugBId === presetAId;
      return matchDirect || matchReverse;
    });

    if (directMatches.length > 0) {
      const unique: DrugInteraction[] = [];
      const seen = new Set<string>();
      for (const item of directMatches) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    }

    // 2. Canonical substance matching across brand names, adult/ped presets & formulation variations
    const pA = drugPresets.find(p => p.id === presetAId) || INITIAL_DRUG_PRESETS.find(p => p.id === presetAId);
    const pB = drugPresets.find(p => p.id === presetBId) || INITIAL_DRUG_PRESETS.find(p => p.id === presetBId);
    const nameA = pA ? pA.name : presetAId;
    const nameB = pB ? pB.name : presetBId;

    const subA = getCanonicalSubstance(presetAId, nameA);
    const subB = getCanonicalSubstance(presetBId, nameB);

    const substanceMatches = interactionDatabase.filter(interaction => {
      const itSubA = getCanonicalSubstance(interaction.drugAId, interaction.drugAName);
      const itSubB = getCanonicalSubstance(interaction.drugBId, interaction.drugBName);
      return (subA === itSubA && subB === itSubB) || (subA === itSubB && subB === itSubA);
    });

    if (substanceMatches.length > 0) {
      const unique: DrugInteraction[] = [];
      const seen = new Set<string>();
      for (const item of substanceMatches) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    }

    // 3. Fallback: fuzzy substring matching
    const normA = nameA.toLowerCase();
    const normB = nameB.toLowerCase();
    const fallback = interactionDatabase.filter(interaction => {
      const iA = interaction.drugAName.toLowerCase();
      const iB = interaction.drugBName.toLowerCase();
      return (
        (normA.includes(iA) || iA.includes(normA)) && (normB.includes(iB) || iB.includes(normB))
      ) || (
        (normA.includes(iB) || iB.includes(normA)) && (normB.includes(iA) || iA.includes(normB))
      );
    });

    if (fallback.length > 0) {
      return [fallback[0]];
    }

    return [];
  };

  const [drugPresets, setDrugPresets] = useState<DrugPreset[]>(() => {
    // 1. Try modern v5
    const savedV5 = localStorage.getItem("drugPresets_v5");
    if (savedV5) {
      try {
        const parsed = JSON.parse(savedV5);
        const cleaned = sanitizeDrugPresets(parsed);
        localStorage.setItem("drugPresets_v5", JSON.stringify(cleaned));
        return cleaned;
      } catch (e) {
        // fallback
      }
    }

    // 2. Try legacy v4, sanitize and migrate to v5
    const savedV4 = localStorage.getItem("drugPresets_v4");
    if (savedV4) {
      try {
        const parsed = JSON.parse(savedV4);
        const cleaned = sanitizeDrugPresets(parsed);
        localStorage.setItem("drugPresets_v5", JSON.stringify(cleaned));
        localStorage.removeItem("drugPresets_v4");
        return cleaned;
      } catch (e) {
        // fallback
      }
    }

    const defaultCleaned = sanitizeDrugPresets(INITIAL_DRUG_PRESETS);
    localStorage.setItem("drugPresets_v5", JSON.stringify(defaultCleaned));
    return defaultCleaned;
  });

  useEffect(() => {
    localStorage.setItem("drugPresets_v5", JSON.stringify(drugPresets));
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
      setActiveTab("analytics");
      trackCustomEvent("admin_login", {
        category: "conversion",
        label: "Admin RSUD Palembang BARI berhasil masuk ke sistem",
        metadata: { role: "Administrator PIOBARI" }
      });
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
  const [activeTab, setActiveTab] = useState<"single" | "ddi" | "desc" | "video" | "map" | "iv" | "diseases" | "medcalc" | "pharmacist" | "fornas" | "soap" | "analytics">("desc");

  // Video Tab States
  const [activeVideoId, setActiveVideoId] = useState<string>("suppositoria");
  const [activeVideoStep, setActiveVideoStep] = useState<number>(0);
  const [videoPracticeChecked, setVideoPracticeChecked] = useState<Record<string, boolean>>({});

  // Drug Description States
  const [descSearchQuery, setDescSearchQuery] = useState<string>("");
  const [descSearchScope, setDescSearchScope] = useState<SearchScope>("all");
  const [descSelectedCategory, setDescSelectedCategory] = useState<string>("all");
  const [descSelectedAlphabet, setDescSelectedAlphabet] = useState<string>("all");
  const [descExpandedId, setDescExpandedId] = useState<string | null>(null);
  const [descOnlyWithInteractions, setDescOnlyWithInteractions] = useState<boolean>(false);
  const [descPage, setDescPage] = useState<number>(1);
  const [descPageSize, setDescPageSize] = useState<number>(30);

  useEffect(() => {
    setDescPage(1);
  }, [descSearchQuery, descSearchScope, descSelectedCategory, descSelectedAlphabet, descOnlyWithInteractions]);

  // Telemetry: Auto-track page navigation & real pageview
  useEffect(() => {
    trackPageView(activeTab, `/${activeTab}`, `Navigasi ke modul ${activeTab.toUpperCase()}`);
    trackCustomEvent("page_view", {
      category: "navigation",
      label: `Navigasi ke modul ${activeTab.toUpperCase()}`,
      metadata: { tab: activeTab }
    });
    // Send immediate heartbeat on tab change
    sendHeartbeat(activeTab);
  }, [activeTab]);

  // Periodic heartbeat every 25 seconds for real-time active user telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      sendHeartbeat(activeTab);
    }, 25000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Telemetry: Track drug formularium search (debounced)
  useEffect(() => {
    if (!descSearchQuery.trim() || descSearchQuery.trim().length < 3) return;
    const timer = setTimeout(() => {
      trackCustomEvent("drug_lookup", {
        category: "clinical",
        label: `Pencarian Formularium: "${descSearchQuery.trim()}"`,
        metadata: { query: descSearchQuery.trim(), scope: descSearchScope, category: descSelectedCategory }
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [descSearchQuery, descSearchScope, descSelectedCategory]);

  // Multi-drug DDI Screening States
  const [ddiSelectedIds, setDdiSelectedIds] = useState<string[]>([
    "propranolol_ped",
    "salbutamol_syr",
    "spironolactone_ped",
    "potassium_chloride_inf"
  ]);
  const [ddiSearchQuery, setDdiSearchQuery] = useState<string>("");
  const [ddiSubTab, setDdiSubTab] = useState<"drug" | "all_catalog" | "food">("drug");
  const [allDdiSearch, setAllDdiSearch] = useState<string>("");
  const [allDdiSeverityFilter, setAllDdiSeverityFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const [allDdiTherapeuticFilter, setAllDdiTherapeuticFilter] = useState<string>("ALL");
  const [ddiCopiedInteractionId, setDdiCopiedInteractionId] = useState<string | null>(null);

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

  // Select preset
  const handleSelectPreset = (preset: DrugPreset | undefined) => {
    setSelectedPreset(preset);
    setSelectedPresetId(preset ? preset.id : "custom");
  };

  // Download report as PDF
  const handleDownloadPDF = () => {
    trackCustomEvent("pdf_export", {
      category: "conversion",
      label: `Export PDF Lembar Dosis (${selectedPreset?.name || "Kustom"})`,
      metadata: {
        drug: selectedPreset?.name || "Kustom",
        indication: selectedPreset?.indication || "Umum",
        weightKg: inputs.weightKg
      }
    });
    generateMedicalReportPDF({
      inputs,
      calculated,
      calculatedBsa,
      calculatedCrCl,
      selectedPreset,
      aiReport: "",
      isFemale,
    });
  };

  // Pre-load a typical pediatric patient scenario
  const loadScenario = (type: "pediatric" | "oncology" | "renal" | "geriatric") => {
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

  const filteredPresets = useMemo(() => {
    return drugPresets.filter((p) => {
      const cat = getDrugCategory(p.id, p.name);
      return matchDrugSimultaneous(p, cat.label, searchTerm, "all").isMatch;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [drugPresets, searchTerm]);

  const sanitizedDrugPresets = useMemo(() => sanitizeDrugPresets(drugPresets), [drugPresets]);

  const descFilteredList = useMemo(() => {
    return sanitizedDrugPresets.filter(p => {
      if (descOnlyWithInteractions) {
        const ddi = getInteractionsForDrug(p.id, p.name, interactionDatabase);
        const food = getFoodInteractionsForDrug(p.id, p.name);
        if (ddi.length === 0 && food.length === 0) return false;
      }
      const info = getDrugCategory(p.id, p.name);
      const matchResult = matchDrugSimultaneous(p, info.label, descSearchQuery, descSearchScope);
      if (!matchResult.isMatch) return false;

      // Category filter
      if (descSelectedCategory !== "all") {
        if (!isCategoryMatched(descSelectedCategory, info.label)) return false;
      }

      // Alphabet filter
      if (descSelectedAlphabet !== "all") {
        if (p.name.charAt(0).toUpperCase() !== descSelectedAlphabet) return false;
      }
      
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [sanitizedDrugPresets, descOnlyWithInteractions, descSearchQuery, descSearchScope, descSelectedCategory, descSelectedAlphabet, interactionDatabase]);

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
                    ? "bg-orange-100 border-orange-300 text-orange-800"
                    : "bg-white hover:bg-slate-50 text-slate-500 border-slate-300"
                }`}
              >
                {inputs.useBsaManual ? "Edit Manual Aktif" : "Ubah Manual"}
              </button>
            </div>
          </div>

          {inputs.useBsaManual && (
            <div className="mt-3 space-y-1">
              <label className="block text-[10px] font-bold text-orange-800 uppercase">Atur BSA Manual (m²)</label>
              <input
                type="number"
                step="any"
                value={inputs.bsaManual}
                onChange={(e) => handleInputChange("bsaManual", e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full bg-orange-50/50 border border-orange-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-amber-500 outline-none"
                placeholder="misal: 1.85"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen medical-ambient-bg flex font-sans text-slate-900 selection:bg-teal-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* SIDEBAR (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-sidebar shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex-col shrink-0 overflow-y-auto transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100/80 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-teal-700">
                PIOBARI <span className="text-rose-600">v2</span>
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200/60">
                Klinis
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Pusat Informasi Obat
            </span>
            <span className="text-[10px] text-teal-600 font-semibold tracking-wider truncate">
              RSUD Palembang BARI
            </span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Direktori & Skrining</span>
          </div>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("desc"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-between group ${
              activeTab === "desc"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === "desc" ? "text-white" : "text-teal-600"}`} />
              <span>Informasi Obat</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === "desc" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              930+
            </span>
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("ddi"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-between group ${
              activeTab === "ddi"
                ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-rose-700 hover:shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === "ddi" ? "text-white" : "text-rose-600 animate-pulse"}`} />
              <span>Skrining Interaksi</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === "ddi" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600 border border-rose-200/60"
            }`}>
              Siaga
            </span>
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("fornas"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-between group ${
              activeTab === "fornas"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === "fornas" ? "text-white" : "text-emerald-600"}`} />
              <span>Daftar Obat Fornas</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === "fornas" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
            }`}>
              2025
            </span>
          </button>

          <div className="px-3 pt-4 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kalkulator & Klinis</span>
          </div>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("medcalc"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "medcalc"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <Calculator className={`w-4 h-4 shrink-0 ${activeTab === "medcalc" ? "text-white" : "text-sky-600"}`} />
            Kalkulator Medis
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("iv"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "iv"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <Droplets className={`w-4 h-4 shrink-0 ${activeTab === "iv" ? "text-white" : "text-cyan-600"}`} />
            Kompatibilitas IV
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("soap"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "soap"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${activeTab === "soap" ? "text-white" : "text-indigo-600"}`} />
            Clinical SOAP
          </button>

          <div className="px-3 pt-4 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Layanan & Edukasi</span>
          </div>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("pharmacist"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "pharmacist"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <User className={`w-4 h-4 shrink-0 ${activeTab === "pharmacist" ? "text-white" : "text-teal-600"}`} />
            Konsultasi Apoteker
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false); setActiveTab("video");
              setActiveVideoStep(0);
            }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "video"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <Image className={`w-4 h-4 shrink-0 ${activeTab === "video" ? "text-white" : "text-amber-600"}`} />
            Panduan Alat
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("diseases"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "diseases"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <Stethoscope className={`w-4 h-4 shrink-0 ${activeTab === "diseases" ? "text-white" : "text-teal-600"}`} />
            Penyakit & Kondisi
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(false); setActiveTab("map"); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 ${
              activeTab === "map"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-slate-600 hover:bg-white/90 hover:text-teal-700 hover:shadow-2xs"
            }`}
          >
            <MapPin className={`w-4 h-4 shrink-0 ${activeTab === "map" ? "text-white" : "text-emerald-600"}`} />
            Peta Faskes
          </button>

          {/* Admin Web Analytics Menu Item */}
          {isAdmin ? (
            <div className="pt-2">
              <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">Manajemen & Data</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setActiveTab("analytics"); }}
                className={`w-full text-left px-4 py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-between group ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-md shadow-teal-900/25 border border-teal-700/40"
                    : "bg-teal-50/90 hover:bg-teal-100 text-teal-950 border border-teal-200/80 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === "analytics" ? "text-teal-300 animate-pulse" : "text-teal-700"}`} />
                  <span className="tracking-tight">Web Analytics</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "analytics" ? "bg-teal-500 text-slate-950 shadow-2xs" : "bg-teal-600 text-white"
                }`}>
                  Live
                </span>
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold rounded-2xl text-slate-500 hover:text-teal-800 hover:bg-slate-100/80 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-teal-600" />
                  <span>Web Analytics</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  Admin
                </span>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100/80 shrink-0 mt-auto flex flex-col gap-2.5 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setIsGlassSettingsOpen(true)}
            className="w-full text-center px-4 py-2.5 bg-white/80 hover:bg-white text-teal-700 text-[11px] font-bold rounded-xl transition-all border border-teal-200/80 uppercase tracking-wider shadow-2xs flex items-center justify-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atur Transparansi ({Math.round(glassOpacity * 100)}%)</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => setIsAdmin(false)}
              className="w-full text-center px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-xl transition-colors border border-rose-200 uppercase tracking-wider"
            >
              Logout Admin
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full text-center px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl transition-colors border border-slate-200 uppercase tracking-wider shadow-2xs"
            >
              Login Admin
            </button>
          )}
          <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider truncate">
              Basis Data Farmasi Aktif
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header (Desktop and Mobile) */}
        <header className="h-18 glass-header flex items-center justify-between px-4 sm:px-6 shadow-2xs shrink-0">
          <div className="flex items-center gap-2.5 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 -ml-2 text-slate-600 hover:text-teal-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
              title="Buka Menu Modul Lengkap"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-teal-700">
                PIOBARI <span className="text-rose-600">v2</span>
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200/60 truncate max-w-[125px]">
                {activeTab === "iv" ? "Kompatibilitas IV" : 
                 activeTab === "desc" ? "Informasi Obat" : 
                 activeTab === "ddi" ? "Skrining DDI" : 
                 activeTab === "fornas" ? "Fornas 2025" : 
                 activeTab === "medcalc" ? "Kalkulator Medis" : 
                 activeTab === "soap" ? "Clinical SOAP" : 
                 activeTab === "pharmacist" ? "Apoteker Siaga" : 
                 activeTab === "video" ? "Panduan Alat" : 
                 activeTab === "diseases" ? "Penyakit" : 
                 activeTab === "map" ? "Peta Faskes" : "Klinis"}
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800 tracking-tight">
                {activeTab === "ddi" ? "Skrining Multi-Obat Aktif" : 
                 activeTab === "desc" ? "Informasi & Keamanan Obat" : 
                 activeTab === "diseases" ? "Penyakit & Kondisi" : 
                 activeTab === "medcalc" ? "Kalkulator Medis" : 
                 activeTab === "video" ? "Panduan Alat & Cara Pakai" : 
                 activeTab === "soap" ? "Clinical SOAP" : 
                 activeTab === "map" ? "Peta Sebaran Fasilitas Kesehatan" : 
                 activeTab === "iv" ? "Kompatibilitas Obat Intravena" : 
                 activeTab === "pharmacist" ? "Konsultasi Apoteker Siaga" : 
                 activeTab === "fornas" ? "Daftar Obat Fornas Kemenkes" : 
                 activeTab === "analytics" ? "Web Analytics & Real-Time Insights" :
                 "Menu Kalkulator"}
              </span>
              <span className="text-[11px] text-teal-700 font-medium">
                RSUD Palembang BARI • Layanan Informasi Obat Terpercaya
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeTab === "analytics"
                    ? "bg-teal-800 text-white border-teal-900 shadow-sm"
                    : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Web Analytics</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-teal-800">Sistem Online</span>
            </div>

            {/* Glassmorphism Transparency Control Trigger */}
            <button
              id="btn-open-glass-settings"
              type="button"
              onClick={() => setIsGlassSettingsOpen(true)}
              className="px-3.5 py-2 glass-card hover:bg-white text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200/80 shadow-2xs active:scale-95 group"
              title="Atur Transparansi Kaca (Glassmorphism)"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-600 group-hover:rotate-45 transition-transform shrink-0" />
              <span className="hidden sm:inline">Transparansi ({Math.round(glassOpacity * 100)}%)</span>
            </button>

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
              }}
              className="px-3.5 py-2 glass-card hover:bg-white text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200/80 shadow-2xs active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
          </div>
        </header>

        {/* Main Content scrollable area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-36 sm:pb-40 lg:pb-8 overflow-y-auto custom-scrollbar">
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
                    placeholder="Cari nama, indikasi, terapi..."
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
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

                  {filteredPresets.map((p) => {
                    const cat = getDrugCategory(p.id, p.name);
                    return (
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
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              <HighlightText text={p.name} query={searchTerm} />
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${cat.bg} ${cat.color} ${cat.border}`}>
                              <HighlightText text={cat.label.split(" ")[0]} query={searchTerm} />
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 line-clamp-2 whitespace-normal leading-relaxed">
                            <HighlightText text={p.indication} query={searchTerm} />
                          </span>
                        </div>
                        {p.requiresRenalAdjustment && (
                          <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1 py-0.2 rounded mt-1.5 self-start uppercase tracking-wider">
                            Pengawasan Ginjal
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {filteredPresets.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400 space-y-2">
                      <p>Tidak ada preset yang cocok.</p>
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="text-emerald-600 hover:underline font-bold text-[11px]"
                      >
                        Reset pencarian
                      </button>
                    </div>
                  )}
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
                <div className="mt-2.5 px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-orange-600" />
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
                    calculatedCrCl < 30 ? "text-rose-600" : calculatedCrCl < 60 ? "text-orange-600" : "text-emerald-700"
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
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 max-h-[220px] overflow-y-auto space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-100 mb-1.5 px-1.5 flex justify-between">
                  <span>Hasil Pencarian (Nama, Indikasi, Terapi)</span>
                  <button onClick={() => setDdiSearchQuery("")} className="text-emerald-500 hover:underline hover:text-emerald-600 font-sans tracking-normal normal-case font-medium">Selesai</button>
                </div>
                {drugPresets.filter(p => {
                  const cat = getDrugCategory(p.id, p.name);
                  return matchDrugSimultaneous(p, cat.label, ddiSearchQuery, "all").isMatch;
                }).slice(0, 10).map(preset => {
                  const isAlreadyAdded = ddiSelectedIds.includes(preset.id);
                  const cat = getDrugCategory(preset.id, preset.name);
                  return (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-150 group"
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            <HighlightText text={preset.name.split(" - ")[0]} query={ddiSearchQuery} />
                          </p>
                          <span className={`text-[8px] font-bold px-1 rounded-sm border ${cat.bg} ${cat.color} ${cat.border} shrink-0`}>
                            <HighlightText text={cat.label.split(" ")[0]} query={ddiSearchQuery} />
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 truncate">
                          <HighlightText text={preset.indication} query={ddiSearchQuery} />
                        </p>
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
                {drugPresets.filter(p => {
                  const cat = getDrugCategory(p.id, p.name);
                  return matchDrugSimultaneous(p, cat.label, ddiSearchQuery, "all").isMatch;
                }).length === 0 && (
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
                    { id: "ciprofloxacin", name: "Ciprofloxacin" },
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
                  const preset = drugPresets.find(p => p.id === id) || INITIAL_DRUG_PRESETS.find(p => p.id === id) || {
                    id,
                    name: id === "ciprofloxacin_adult" ? "Ciprofloxacin HCl" : id.replace(/_/g, " "),
                    indication: "Obat aktif dalam keranjang terapi"
                  };
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
                        <p className="text-[9px] text-slate-400 pl-6 truncate">{preset.indication || "Sediaan obat terpilih"}</p>
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
                  onClick={() => setDdiSelectedIds(["warfarin_adult", "ciprofloxacin_adult"])}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-bold rounded-lg border border-rose-200 transition-colors"
                >
                  Uji Warfarin + Ciprofloxacin (Mayor)
                </button>
                <button
                  onClick={() => setDdiSelectedIds(["propranolol_ped", "salbutamol_syr", "spironolactone_ped"])}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10.5px] font-bold rounded-lg border border-emerald-100 transition-colors"
                >
                  Gunakan Contoh Kombinasi Major
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
                const pA = drugPresets.find(p => p.id === idA) || INITIAL_DRUG_PRESETS.find(p => p.id === idA);
                const pB = drugPresets.find(p => p.id === idB) || INITIAL_DRUG_PRESETS.find(p => p.id === idB);
                const nameA = pA ? pA.name.split(" - ")[0] : (idA === "ciprofloxacin_adult" ? "Ciprofloxacin" : idA);
                const nameB = pB ? pB.name.split(" - ")[0] : (idB === "ciprofloxacin_adult" ? "Ciprofloxacin" : idB);

                const pairInteractions = checkInteractions(idA, idB);
                if (pairInteractions.length > 0) {
                  pairInteractions.forEach(item => {
                    detectedInteractions.push(item);
                  });
                  checkedPairs.push({
                    idA,
                    idB,
                    nameA,
                    nameB,
                    status: pairInteractions[0].severity,
                    detail: pairInteractions[0]
                  });
                } else {
                  checkedPairs.push({
                    idA,
                    idB,
                    nameA,
                    nameB,
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
                      criticalFoodCount > 0 ? "bg-rose-50 border-rose-200/60" : "bg-orange-50 border-orange-200/60"
                    }`}>
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        criticalFoodCount > 0 ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        <AlertTriangle className={`w-6 h-6 ${criticalFoodCount > 0 ? "animate-bounce" : ""}`} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className={`text-sm font-bold flex items-center flex-wrap gap-2 ${
                          criticalFoodCount > 0 ? "text-rose-950" : "text-orange-950"
                        }`}>
                          Perhatian! Terdeteksi Potensi Interaksi Obat dengan Makanan/Zat Gizi
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            criticalFoodCount > 0 ? "bg-rose-600 text-white" : "bg-orange-600 text-white"
                          }`}>
                            {criticalFoodCount > 0 ? "MAJOR" : "PERINGATAN"}
                          </span>
                        </h4>
                        <p className={`text-xs leading-relaxed font-sans ${
                          criticalFoodCount > 0 ? "text-rose-850 font-medium" : "text-orange-850 font-medium"
                        }`}>
                          Ditemukan <strong className="font-extrabold">{detectedFoodInteractions.length} potensi interaksi dengan makanan/zat gizi</strong> untuk obat yang Anda pilih ({criticalFoodCount} Major, {warningFoodCount} Moderat). Tinjau detail konseling gizi dan obat di bawah ini.
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
                          Obat-obat dalam keranjang tidak memiliki catatan interaksi major dengan susu, alkohol, kafein, jus grapefruit, atau makanan kaya Vitamin K/Kalium dalam sistem kami.
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
                              ? "border-orange-200 bg-orange-50/10"
                              : "border-emerald-200 bg-emerald-50/10"
                          }`}
                        >
                          {/* Header */}
                          <div
                            className={`px-4 py-3 flex items-center justify-between border-b ${
                              foodInt.severity === "CRITICAL"
                                ? "bg-rose-50 border-rose-100 text-rose-950"
                                : foodInt.severity === "WARNING"
                                ? "bg-orange-50 border-orange-100 text-orange-950"
                                : "bg-emerald-50 border-emerald-100 text-emerald-950"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {foodInt.severity === "CRITICAL" ? (
                                <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                              ) : foodInt.severity === "WARNING" ? (
                                <AlertTriangle className="w-4.5 h-4.5 text-orange-600" />
                              ) : (
                                <Info className="w-4.5 h-4.5 text-emerald-600" />
                              )}
                              <span className="font-bold text-xs uppercase tracking-wider font-mono text-[10px]">
                                {foodInt.severity === "CRITICAL" ? "KONTRAINDIKASI MAKANAN / MAJOR" : foodInt.severity === "WARNING" ? "PERINGATAN KONSUMSI / MODERAT" : "INFORMASI PENYERAPAN / RINGAN"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                              foodInt.severity === "CRITICAL"
                                ? "bg-rose-600 border-rose-700 text-white"
                                : foodInt.severity === "WARNING"
                                ? "bg-orange-600 border-orange-700 text-white"
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
                                <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md text-[10.5px] border border-orange-100">Makanan/Zat: {foodInt.foodName}</span>
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

            const renderAllInteractionsCatalog = () => {
              const totalCatalog = interactionDatabase.length;
              const criticalCatalog = interactionDatabase.filter(i => i.severity === "CRITICAL").length;
              const warningCatalog = interactionDatabase.filter(i => i.severity === "WARNING").length;
              const infoCatalog = interactionDatabase.filter(i => i.severity === "INFO").length;

              const filteredCatalog = interactionDatabase.filter(item => {
                // Severity filter
                if (allDdiSeverityFilter !== "ALL" && item.severity !== allDdiSeverityFilter) {
                  return false;
                }
                // Therapeutic category filter
                if (allDdiTherapeuticFilter !== "ALL") {
                  const combined = `${item.drugAName} ${item.drugBName} ${item.mechanism} ${item.id}`.toLowerCase();
                  if (allDdiTherapeuticFilter === "antikoagulan" && !combined.includes("warfarin") && !combined.includes("aspirin") && !combined.includes("clopidogrel")) {
                    return false;
                  }
                  if (allDdiTherapeuticFilter === "antibiotik" && !combined.includes("cipro") && !combined.includes("klari") && !combined.includes("amox") && !combined.includes("vanko") && !combined.includes("genta") && !combined.includes("doxy") && !combined.includes("kolera") && !combined.includes("chloramphenicol") && !combined.includes("amikacin")) {
                    return false;
                  }
                  if (allDdiTherapeuticFilter === "kardiovaskular" && !combined.includes("digoksin") && !combined.includes("digoxin") && !combined.includes("furosemid") && !combined.includes("propranolol") && !combined.includes("bisoprolol") && !combined.includes("captopril") && !combined.includes("enalapril") && !combined.includes("spironolakton") && !combined.includes("amiodaron") && !combined.includes("tiaryt") && !combined.includes("kalium") && !combined.includes("kcl")) {
                    return false;
                  }
                  if (allDdiTherapeuticFilter === "statin" && !combined.includes("statin")) {
                    return false;
                  }
                  if (allDdiTherapeuticFilter === "nsaid" && !combined.includes("ibuprofen") && !combined.includes("mefenamat") && !combined.includes("diklofenak") && !combined.includes("ketorolac") && !combined.includes("aspirin")) {
                    return false;
                  }
                  if (allDdiTherapeuticFilter === "imunosupresan" && !combined.includes("metotreksat") && !combined.includes("methotrexate") && !combined.includes("rheu") && !combined.includes("cemiplimab") && !combined.includes("cosibelimab") && !combined.includes("dostarlimab")) {
                    return false;
                  }
                }
                // Search query
                if (allDdiSearch.trim() !== "") {
                  const q = allDdiSearch.toLowerCase().trim();
                  const inA = item.drugAName.toLowerCase().includes(q);
                  const inB = item.drugBName.toLowerCase().includes(q);
                  const inMech = item.mechanism.toLowerCase().includes(q);
                  const inRec = item.recommendation.toLowerCase().includes(q);
                  const inEv = item.evidence ? item.evidence.toLowerCase().includes(q) : false;
                  return inA || inB || inMech || inRec || inEv;
                }
                return true;
              });

              const handleQuickLoadCriticalPairs = () => {
                const highRiskIds = [
                  "warfarin_adult",
                  "ciprofloxacin",
                  "digoxin",
                  "auto_tiaryt",
                  "furosemide_ped",
                  "ibuprofen_ped",
                  "auto_rheu_trex",
                  "simvastatin_adult",
                  "clarithromycin_ped"
                ];
                setDdiSelectedIds(highRiskIds);
                setDdiSubTab("drug");
              };

              const handleCopyInteraction = (item: DrugInteraction) => {
                const text = `[INTERAKSI OBAT: ${item.drugAName} + ${item.drugBName}]\nTingkat Keparahan: ${item.severity}\n\nMekanisme:\n${item.mechanism}\n\nRekomendasi Klinis:\n${item.recommendation}\n\nBukti Kepustakaan:\n${item.evidence || "-"}`;
                navigator.clipboard.writeText(text).then(() => {
                  setDdiCopiedInteractionId(item.id);
                  setTimeout(() => setDdiCopiedInteractionId(null), 2500);
                });
              };

              return (
                <div className="space-y-6">
                  {/* Top Stats & Quick Summary Banner */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-bold">Katalog Lengkap Seluruh Interaksi Antar-Obat</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-sans">
                          Database memuat <strong className="text-white font-semibold">{totalCatalog} pasangan interaksi terdaftar</strong> dengan telaah farmakologi lengkap, rekomendasi tata laksana klinis, dan bukti kepustakaan FDA / PubMed.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleQuickLoadCriticalPairs}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Uji Pasangan Kritis Sekaligus</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Terdaftar</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-white font-mono">{totalCatalog}</span>
                          <span className="text-[10px] text-slate-400">pasangan</span>
                        </div>
                      </div>
                      <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Kontraindikasi / Major</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-rose-400 font-mono">{criticalCatalog}</span>
                          <span className="text-[10px] text-rose-300">kritis</span>
                        </div>
                      </div>
                      <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Peringatan / Moderat</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-amber-400 font-mono">{warningCatalog}</span>
                          <span className="text-[10px] text-amber-300">waspada</span>
                        </div>
                      </div>
                      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Informasi / Minor</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-blue-400 font-mono">{infoCatalog}</span>
                          <span className="text-[10px] text-blue-300">edukatif</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search, Severity & Category Filter Toolbar */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder="Cari nama obat (cth: Warfarin, Ciprofloxacin, Digoksin, Statin), mekanisme, atau referensi..."
                          value={allDdiSearch}
                          onChange={(e) => setAllDdiSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                        {allDdiSearch && (
                          <button
                            onClick={() => setAllDdiSearch("")}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Severity Filters */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tingkat Keparahan:</span>
                      {[
                        { key: "ALL", label: "Semua", count: totalCatalog, color: "bg-slate-900 text-white" },
                        { key: "CRITICAL", label: "Major / Kritis", count: criticalCatalog, color: "bg-rose-600 text-white" },
                        { key: "WARNING", label: "Peringatan / Moderat", count: warningCatalog, color: "bg-amber-600 text-white" },
                        { key: "INFO", label: "Informasi / Minor", count: infoCatalog, color: "bg-blue-600 text-white" },
                      ].map(sev => {
                        const isActive = allDdiSeverityFilter === sev.key;
                        return (
                          <button
                            key={sev.key}
                            onClick={() => setAllDdiSeverityFilter(sev.key as any)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                              isActive
                                ? sev.color + " shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <span>{sev.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-white/25 text-white" : "bg-white text-slate-700"}`}>
                              {sev.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Therapeutic Categories */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Golongan Farmakologi:</span>
                      {[
                        { key: "ALL", label: "Semua Terapi" },
                        { key: "antikoagulan", label: "Antikoagulan & Antiplatelet" },
                        { key: "antibiotik", label: "Antibiotik & Vaksin" },
                        { key: "kardiovaskular", label: "Kardiovaskular & Elektrolit" },
                        { key: "statin", label: "Statin / Kolesterol" },
                        { key: "nsaid", label: "NSAID & Analgesik" },
                        { key: "imunosupresan", label: "Metotreksat & Imunologi" },
                      ].map(cat => {
                        const isActive = allDdiTherapeuticFilter === cat.key;
                        return (
                          <button
                            key={cat.key}
                            onClick={() => setAllDdiTherapeuticFilter(cat.key)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                              isActive
                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Results Count & Notification */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700">
                      Menampilkan <span className="text-emerald-700 font-extrabold">{filteredCatalog.length}</span> dari {totalCatalog} pasangan interaksi
                    </span>
                    {(allDdiSearch || allDdiSeverityFilter !== "ALL" || allDdiTherapeuticFilter !== "ALL") && (
                      <button
                        onClick={() => {
                          setAllDdiSearch("");
                          setAllDdiSeverityFilter("ALL");
                          setAllDdiTherapeuticFilter("ALL");
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Semua Filter
                      </button>
                    )}
                  </div>

                  {/* List of Interaction Cards */}
                  {filteredCatalog.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Tidak ada interaksi yang sesuai dengan filter pencarian</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Coba gunakan kata kunci nama obat lain atau reset filter keparahan / terapi untuk melihat seluruh pasangan interaksi.
                      </p>
                      <button
                        onClick={() => {
                          setAllDdiSearch("");
                          setAllDdiSeverityFilter("ALL");
                          setAllDdiTherapeuticFilter("ALL");
                        }}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                      >
                        Tampilkan Semua {totalCatalog} Interaksi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCatalog.map((interaction, idx) => {
                        const inBasketA = ddiSelectedIds.includes(interaction.drugAId);
                        const inBasketB = ddiSelectedIds.includes(interaction.drugBId);
                        const bothInBasket = inBasketA && inBasketB;

                        const handleLoadPairToBasket = () => {
                          const updated = Array.from(new Set([...ddiSelectedIds, interaction.drugAId, interaction.drugBId]));
                          setDdiSelectedIds(updated);
                          setDdiSubTab("drug");
                        };

                        return (
                          <div
                            key={interaction.id + "_" + idx}
                            className={`bg-white border rounded-2xl overflow-hidden shadow-3xs transition-all hover:shadow-md ${
                              interaction.severity === "CRITICAL"
                                ? "border-rose-200"
                                : interaction.severity === "WARNING"
                                ? "border-amber-200"
                                : "border-slate-200"
                            }`}
                          >
                            {/* Card Header */}
                            <div
                              className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                                interaction.severity === "CRITICAL"
                                  ? "bg-rose-50/80 border-rose-100 text-rose-950"
                                  : interaction.severity === "WARNING"
                                  ? "bg-amber-50/80 border-amber-100 text-amber-950"
                                  : "bg-slate-50 border-slate-200/80 text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-wrap">
                                {interaction.severity === "CRITICAL" ? (
                                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                                ) : interaction.severity === "WARNING" ? (
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                ) : (
                                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                )}
                                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                                  interaction.severity === "CRITICAL"
                                    ? "bg-rose-600 text-white"
                                    : interaction.severity === "WARNING"
                                    ? "bg-amber-600 text-white"
                                    : "bg-blue-600 text-white"
                                }`}>
                                  {interaction.severity === "CRITICAL"
                                    ? "KONTRAINDIKASI / MAJOR"
                                    : interaction.severity === "WARNING"
                                    ? "PERINGATAN KLINIS / MODERAT"
                                    : "INFORMASI / MINOR"}
                                </span>
                                {bothInBasket && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Ada di Keranjang Anda
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleCopyInteraction(interaction)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 rounded-lg transition-all flex items-center gap-1"
                                  title="Salin Rincian Interaksi"
                                >
                                  {ddiCopiedInteractionId === interaction.id ? (
                                    <>
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700 font-bold">Tersalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={handleLoadPairToBasket}
                                  className="px-3 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                >
                                  <GitCompare className="w-3.5 h-3.5" />
                                  <span>Uji di Keranjang</span>
                                </button>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4 text-xs">
                              {/* Drug Pair Title */}
                              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasangan Interaksi:</span>
                                <div className="flex items-center gap-2 flex-wrap font-bold text-sm">
                                  <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-xl border border-slate-200">
                                    {interaction.drugAName}
                                  </span>
                                  <span className="text-slate-400 font-bold px-1">+</span>
                                  <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-xl border border-slate-200">
                                    {interaction.drugBName}
                                  </span>
                                </div>
                              </div>

                              {/* Mechanism */}
                              <div className="space-y-1.5">
                                <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-slate-500" /> Mekanisme Farmakologi:
                                </h5>
                                <div className="bg-slate-50/70 border border-slate-200/70 p-3.5 rounded-xl text-slate-700 leading-relaxed font-sans whitespace-pre-line text-xs">
                                  {interaction.mechanism}
                                </div>
                              </div>

                              {/* Recommendation */}
                              <div className="space-y-1.5">
                                <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Rekomendasi & Intervensi Klinis:
                                </h5>
                                <div className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl text-slate-800 leading-relaxed font-sans font-medium whitespace-pre-line text-xs">
                                  {interaction.recommendation}
                                </div>
                              </div>

                              {/* Evidence / Citations */}
                              {interaction.evidence && (
                                <div className="space-y-1.5">
                                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Bukti Literatur & Kepustakaan:
                                  </h5>
                                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-600 font-sans text-[11px] leading-relaxed italic whitespace-pre-line">
                                    {interaction.evidence}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                    <span>Skrining Keranjang Pasien</span>
                    {detectedInteractions.length > 0 ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold leading-none ${
                        ddiSubTab === "drug" 
                          ? "bg-rose-500 text-white" 
                          : (criticalCount > 0 ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700")
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
                    onClick={() => setDdiSubTab("all_catalog")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      ddiSubTab === "all_catalog"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Cek Semua Interaksi Antar-Obat</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${
                      ddiSubTab === "all_catalog"
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {interactionDatabase.length}
                    </span>
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
                          : (criticalFoodCount > 0 ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700")
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

                {ddiSubTab === "food" ? renderFoodInteractions() : ddiSubTab === "all_catalog" ? renderAllInteractionsCatalog() : (
                  <>
                    {/* Quick Link to Catalog Banner */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Mencari atau ingin mengecek seluruh <strong className="font-bold text-slate-900">{interactionDatabase.length} potensi interaksi antar-obat</strong> yang ada di database?</span>
                      </div>
                      <button
                        onClick={() => setDdiSubTab("all_catalog")}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 self-start sm:self-auto"
                      >
                        <span>Buka Katalog ({interactionDatabase.length} Pasangan)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

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
                        Tidak ditemukan interaksi kontraindikasi mayor, atau bermakna secara klinis di antara <strong className="text-emerald-950 font-bold">{ddiSelectedIds.length} obat</strong> terpilih dalam database klinis kami.
                      </p>
                      <p className="text-[10px] text-slate-400 italic pt-1 leading-normal font-sans">
                        *Disclaimer: Sistem menyaring kecocokan farmakologis berbasis pustaka jurnal kedokteran terverifikasi. Keputusan klinis akhir tetap berada di bawah wewenang dokter/apoteker penanggung jawab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`border rounded-2xl p-5 flex items-start gap-4 shadow-3xs ${
                    criticalCount > 0 ? "bg-rose-50 border-rose-200/60" : "bg-orange-50 border-orange-200/60"
                  }`}>
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      criticalCount > 0 ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${criticalCount > 0 ? "animate-bounce" : ""}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className={`text-sm font-bold flex items-center flex-wrap gap-2 ${
                        criticalCount > 0 ? "text-rose-950" : "text-orange-950"
                      }`}>
                        Perhatian Keamanan! Terdeteksi Potensi Interaksi Obat
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          criticalCount > 0 ? "bg-rose-600 text-white" : "bg-orange-600 text-white"
                        }`}>
                          {criticalCount > 0 ? "MAJOR" : "PERINGATAN KLINIS"}
                        </span>
                      </h4>
                      <p className={`text-xs leading-relaxed font-sans ${
                        criticalCount > 0 ? "text-rose-850 font-medium" : "text-orange-850 font-medium"
                      }`}>
                        Ditemukan <strong className="font-extrabold">{detectedInteractions.length} potensi interaksi</strong> di antara <strong className="font-extrabold">{ddiSelectedIds.length} obat</strong> yang Anda pilih ({criticalCount} Major, {warningCount} Moderat). Silakan tinjau matriks pemetaan dan rincian referensi klinis di bawah ini.
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
                              const p = drugPresets.find(x => x.id === id) || INITIAL_DRUG_PRESETS.find(x => x.id === id);
                              const drugLabel = p ? p.name.split(" - ")[0] : (id === "ciprofloxacin_adult" ? "Ciprofloxacin" : id);
                              return (
                                <th key={id} className="p-3 font-extrabold text-slate-700 border-r border-slate-100 max-w-[120px] truncate" title={drugLabel}>
                                  [{index + 1}] {drugLabel}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {ddiSelectedIds.map((idRow, rowIndex) => {
                            const pRow = drugPresets.find(x => x.id === idRow) || INITIAL_DRUG_PRESETS.find(x => x.id === idRow);
                            const rowLabel = pRow ? pRow.name.split(" - ")[0] : (idRow === "ciprofloxacin_adult" ? "Ciprofloxacin" : idRow);
                            return (
                              <tr key={idRow} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                                <td className="p-3 text-left font-bold text-slate-800 bg-slate-50/50 border-r border-slate-150">
                                  <span className="inline-block w-4.5 h-4.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-mono font-bold text-center leading-4.5 mr-1.5">
                                    {rowIndex + 1}
                                  </span>
                                  {rowLabel}
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
                                          ? "bg-orange-500 text-white shadow-inner"
                                          : severity === "INFO"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-emerald-50 text-emerald-800"
                                      }`}
                                    >
                                      {severity === "CRITICAL" ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                                          <span className="text-[9px] uppercase tracking-tighter">MAJOR</span>
                                        </div>
                                      ) : severity === "WARNING" ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
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
                            : "border-orange-200 bg-orange-50/10"
                        }`}
                      >
                        {/* Header */}
                        <div
                          className={`px-4 py-3 flex items-center justify-between border-b ${
                            interaction.severity === "CRITICAL"
                              ? "bg-rose-50 border-rose-100 text-rose-950"
                              : "bg-orange-50 border-orange-100 text-orange-950"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {interaction.severity === "CRITICAL" ? (
                              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                            ) : (
                              <AlertTriangle className="w-4.5 h-4.5 text-orange-600" />
                            )}
                            <span className="font-bold text-xs uppercase tracking-wider font-mono">
                              {interaction.severity === "CRITICAL" ? "MAJOR / BAHAYA TINGGI" : "PERINGATAN KLINIS / MODERAT"}
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                            interaction.severity === "CRITICAL"
                              ? "bg-rose-600 border-rose-700 text-white"
                              : "bg-orange-600 border-orange-700 text-white"
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
          <Suspense fallback={<TabLoadingFallback />}>
            <MapFacilities isAdmin={isAdmin} />
          </Suspense>
        </section>
      </>
    ) : activeTab === "iv" ? (
      <>
        {/* IV COMPATIBILITY TAB */}
        <section className="lg:col-span-12 w-full">
          <Suspense fallback={<TabLoadingFallback />}>
            <IvCompatibilityChecker isAdmin={isAdmin} />
          </Suspense>
        </section>
      </>
    ) : activeTab === "diseases" ? (
      <>
        {/* DISEASES & CONDITIONS TAB */}
        <section className="lg:col-span-12 w-full">
          <Suspense fallback={<TabLoadingFallback />}>
            <DiseasesConditions />
          </Suspense>
        </section>
      </>
    ) : activeTab === "medcalc" ? (
      <>
        {/* MEDICAL CALCULATORS TAB */}
        <section className="lg:col-span-12 w-full">
          <Suspense fallback={<TabLoadingFallback />}>
            <MedicalCalculators />
          </Suspense>
        </section>
      </>
    ) : activeTab === "pharmacist" ? (
      <>
        {/* PHARMACIST CONSULTATION TAB */}
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
          <Suspense fallback={<TabLoadingFallback />}>
            <PharmacistConsultation isAdmin={isAdmin} />
          </Suspense>
        </section>
      </>
    ) : activeTab === "fornas" ? (
      <>
        {/* FORNAS TAB */}
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <Suspense fallback={<TabLoadingFallback />}>
            <FornasDrugs isAdmin={isAdmin} />
          </Suspense>
        </section>
      </>
    ) : activeTab === "soap" ? (
      <>
        <section className="lg:col-span-12 w-full min-h-[calc(100vh-12rem)] flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white p-6">
          <Suspense fallback={<TabLoadingFallback />}>
            <ClinicalSOAP />
          </Suspense>
        </section>
      </>
    ) : activeTab === "analytics" ? (
      <>
        {/* WEB ANALYTICS ADMIN TAB */}
        <section className="lg:col-span-12 w-full">
          {isAdmin ? (
            <Suspense fallback={<TabLoadingFallback />}>
              <AdminWebAnalytics />
            </Suspense>
          ) : (
            <div className="glass-card max-w-md mx-auto my-12 p-8 rounded-3xl text-center space-y-4 border border-slate-200/80 shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800">Akses Web Analytics Terbatas</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Menu Web Analytics & Telemetri Real-Time hanya dapat diakses oleh Administrator Sistem RSUD Palembang BARI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Login Sebagai Admin
              </button>
            </div>
          )}
        </section>
      </>
    ) : activeTab === "desc" ? (
      <>
        {/* 3D HEALTHCARE MEDICAL HERO DASHBOARD OVERVIEW */}
        <div className="lg:col-span-12 w-full">
          <MedicalDashboardHero 
            onNavigateTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
            searchQuery={descSearchQuery}
            onSearchChange={setDescSearchQuery}
            totalDrugsCount={drugPresets.length}
          />
        </div>

        {/* DRUG DESCRIPTION TAB */}
        {/* Left Column: Filter and Category selector */}
        <section className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100/80 pb-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Filter & Kategori</h3>
            </div>

            {/* Search Input with Simultaneous Indication & Category Support */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Search className="w-3 h-3 text-emerald-600" />
                  Pencarian Simultan
                </label>
                {descSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDescSearchQuery("")}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Scope Selector Pills */}
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDescSearchScope("all")}
                  className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                    descSearchScope === "all"
                      ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Cari simultan di nama obat, indikasi, dan kategori terapi"
                >
                  <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                  Simultan
                </button>
                <button
                  type="button"
                  onClick={() => setDescSearchScope("indication")}
                  className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                    descSearchScope === "indication"
                      ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Fokus pencarian hanya pada indikasi penyakit"
                >
                  <Activity className="w-2.5 h-2.5 text-teal-500" />
                  Indikasi
                </button>
                <button
                  type="button"
                  onClick={() => setDescSearchScope("category")}
                  className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                    descSearchScope === "category"
                      ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Fokus pencarian hanya pada kategori terapi"
                >
                  <Tag className="w-2.5 h-2.5 text-cyan-500" />
                  Kategori
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={
                    descSearchScope === "indication"
                      ? "Cari indikasi (cth: ISK, demam, asma)..."
                      : descSearchScope === "category"
                      ? "Cari kategori (cth: antibiotik, analgetik)..."
                      : "Cari nama, indikasi, atau kategori terapi..."
                  }
                  value={descSearchQuery}
                  onChange={(e) => setDescSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                {descSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDescSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Chips for Simultaneous & Keyword Search */}
              <div className="space-y-1 pt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contoh Pencarian Simultan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "Antibiotik ISK", query: "antibiotik saluran kemih" },
                    { label: "Analgetik Demam", query: "analgetik demam" },
                    { label: "Kardiovaskular Hipertensi", query: "kardiovaskular hipertensi" },
                    { label: "Alergi / Rinitis", query: "alergi rinitis" },
                    { label: "Asma / Batuk", query: "pernapasan batuk" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setDescSearchScope("all");
                        setDescSearchQuery(chip.query);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-2 py-0.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors font-medium text-left"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
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
            {/* Quick Filter: Interaksi Obat Terdaftar */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Filter Khusus Interaksi
              </label>
              <button
                type="button"
                onClick={() => setDescOnlyWithInteractions(!descOnlyWithInteractions)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  descOnlyWithInteractions
                    ? "bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200"
                    : "bg-slate-50 hover:bg-amber-50/70 border-slate-200 text-slate-700 hover:text-amber-900"
                }`}
                title="Tampilkan hanya obat yang memiliki peringatan interaksi obat atau pantangan makanan terdaftar"
              >
                <div className="flex items-center gap-2">
                  <Zap className={`w-3.5 h-3.5 ${descOnlyWithInteractions ? "text-amber-600 fill-amber-500" : "text-amber-500"}`} />
                  <span>Obat Berinteraksi</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  descOnlyWithInteractions ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-600"
                }`}>
                  {drugPresets.filter(p => {
                    const ddi = getInteractionsForDrug(p.id, p.name, interactionDatabase);
                    const food = getFoodInteractionsForDrug(p.id, p.name);
                    return ddi.length > 0 || food.length > 0;
                  }).length}
                </span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Terapi</label>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {THERAPEUTIC_CATEGORIES.map((cat) => {
                  const count = cat.id === "all" 
                    ? drugPresets.length 
                    : drugPresets.filter(p => {
                        const info = getDrugCategory(p.id, p.name);
                        return isCategoryMatched(cat.id, info.label);
                      }).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setDescSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        descSelectedCategory === cat.id
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-1 text-left">{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
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

          {/* Quick info panel with authoritative clinical sources */}
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/40 space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-800/50 pb-3">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">Panduan Informasi & Rujukan Ilmiah</h3>
                <p className="text-[10px] text-emerald-300/80 font-sans">Basis Data & Standar Keamanan Klinis</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase tracking-wider">Sumber & Pustaka Rujukan Utama:</span>
              <ul className="space-y-2 text-xs text-emerald-100 font-sans">
                <li className="flex items-start gap-2 bg-white/5 border border-emerald-800/40 rounded-lg p-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-[11px] block">FDA Pregnancy Categories</span>
                    <span className="text-[10px] text-emerald-200/90 leading-tight block">Klasifikasi resmi US FDA untuk stratifikasi potensi risiko teratogenik obat pada janin (Kategori A, B, C, D, X).</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white/5 border border-emerald-800/40 rounded-lg p-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-[11px] block">Briggs Drugs in Pregnancy and Lactation</span>
                    <span className="text-[10px] text-emerald-200/90 leading-tight block">Pustaka rujukan baku emas (*gold-standard reference*) karya Gerald G. Briggs dkk. untuk evaluasi risiko janin & transplasenta.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white/5 border border-emerald-800/40 rounded-lg p-2">
                  <Baby className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white text-[11px] block">LactMed (NLM - NIH)</span>
                    <span className="text-[10px] text-emerald-200/90 leading-tight block">Basis data resmi *National Library of Medicine* AS mengenai kadar ekskresi obat ke dalam ASI dan keamanan pada bayi menyusui.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border border-emerald-800/60 rounded-xl p-3 bg-white/5 space-y-2.5">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase tracking-wide">Kategori Keamanan Kehamilan (FDA):</span>
              <div className="grid grid-cols-5 gap-1.5 text-[11px] font-mono text-center font-bold">
                <div className="bg-emerald-600/35 border border-emerald-500/40 rounded-lg py-1 px-0.5 text-emerald-300 flex flex-col items-center">
                  <span>A</span>
                  <span className="text-[8px] font-sans font-normal text-emerald-200">Aman</span>
                </div>
                <div className="bg-emerald-500/25 border border-emerald-400/30 rounded-lg py-1 px-0.5 text-emerald-200 flex flex-col items-center">
                  <span>B</span>
                  <span className="text-[8px] font-sans font-normal text-emerald-200">Relatif Aman</span>
                </div>
                <div className="bg-amber-500/25 border border-amber-400/30 rounded-lg py-1 px-0.5 text-amber-200 flex flex-col items-center">
                  <span>C</span>
                  <span className="text-[8px] font-sans font-normal text-amber-200">Waspada</span>
                </div>
                <div className="bg-rose-500/25 border border-rose-400/30 rounded-lg py-1 px-0.5 text-rose-200 flex flex-col items-center">
                  <span>D</span>
                  <span className="text-[8px] font-sans font-normal text-rose-200">Ada Risiko</span>
                </div>
                <div className="bg-rose-600/35 border border-rose-500/40 rounded-lg py-1 px-0.5 text-rose-300 flex flex-col items-center">
                  <span>X</span>
                  <span className="text-[8px] font-sans font-normal text-rose-300">Bahaya</span>
                </div>
              </div>
            </div>

            <div className="border border-emerald-800/60 rounded-xl p-3 bg-white/5 space-y-2">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase tracking-wide">Indikator Laktasi (LactMed):</span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-medium font-sans">
                <span className="bg-emerald-900/50 border border-emerald-500/30 rounded-md py-1 text-emerald-200">Kompatibel / Aman</span>
                <span className="bg-amber-900/50 border border-amber-500/30 rounded-md py-1 text-amber-200">Pantau Bayi</span>
                <span className="bg-rose-900/50 border border-rose-500/30 rounded-md py-1 text-rose-200">Kontraindikasi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: List of Drugs */}
        <section className="lg:col-span-9 space-y-4">
          <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Direktori & Deskripsi Obat</h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Tinjau deskripsi, komposisi, indikasi, kontraindikasi, serta keamanan bagi ibu hamil & menyusui.</p>
              {descSearchQuery.trim() && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Hasil pencarian kata kunci:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                    <Search className="w-3 h-3 text-amber-700" />
                    "{descSearchQuery}"
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    Mode: {descSearchScope === "indication" ? "Fokus Indikasi" : descSearchScope === "category" ? "Fokus Kategori Terapi" : "Simultan (Nama, Indikasi, Kategori)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDescSearchQuery("");
                      setDescOnlyWithInteractions(false);
                    }}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline ml-1"
                  >
                    Hapus Filter
                  </button>
                </div>
              )}
              {descOnlyWithInteractions && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hanya Menampilkan Obat dengan Interaksi Terdaftar</span>
                  <button
                    type="button"
                    onClick={() => setDescOnlyWithInteractions(false)}
                    className="text-rose-600 hover:text-rose-800 font-bold ml-1 hover:underline text-[10px] flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Tutup
                  </button>
                </div>
              )}
            </div>
              <span className="text-xs font-bold font-sans bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-100/80">
                Menampilkan {descFilteredList.length} dari {sanitizedDrugPresets.length} Obat
              </span>
            </div>

            <div className="space-y-6">
              {(() => {
                if (descFilteredList.length === 0) {
                  return (
                    <div className="glass-card p-10 text-center rounded-3xl space-y-4 border border-dashed border-slate-300">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                        <Search className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-800">Obat Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Tidak ada obat yang cocok dengan kata kunci <span className="font-bold text-slate-700">"{descSearchQuery}"</span> pada mode{" "}
                          <span className="font-bold text-slate-700">
                            {descSearchScope === "indication" ? "Indikasi" : descSearchScope === "category" ? "Kategori Terapi" : "Simultan (Semua)"}
                          </span>.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDescSearchQuery("");
                            setDescSearchScope("all");
                            setDescSelectedCategory("all");
                            setDescSelectedAlphabet("all");
                            setDescOnlyWithInteractions(false);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset Pencarian & Filter
                        </button>
                      </div>
                    </div>
                  );
                }

                const totalDescPages = Math.max(1, Math.ceil(descFilteredList.length / descPageSize));
                const safePage = Math.min(Math.max(1, descPage), totalDescPages);
                const startIndex = (safePage - 1) * descPageSize;
                const endIndex = Math.min(descFilteredList.length, startIndex + descPageSize);
                const paginatedList = descPageSize >= 9999 ? descFilteredList : descFilteredList.slice(startIndex, endIndex);

                const groupedByAlphabet = paginatedList.reduce((acc, preset) => {
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
                      const matchResult = matchDrugSimultaneous(preset, categoryInfo.label, descSearchQuery, descSearchScope);

                      return (
                <div
                  key={"desc_" + preset.id}
                  className={`glass-card glass-card-hover rounded-3xl overflow-hidden transition-all duration-300 ${
                    descSearchQuery.trim() && matchResult.isMatch
                      ? "ring-1 ring-amber-300/90 border-amber-200/90 shadow-xs"
                      : "hover:border-teal-200/80"
                  }`}
                >
                  {/* Card Header (Visible initially) */}
                  <div
                    onClick={() => setDescExpandedId(isExpanded ? null : preset.id)}
                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.bg} ${categoryInfo.color} ${categoryInfo.border}`}>
                          <HighlightText text={categoryInfo.label} query={descSearchQuery} />
                        </span>

                        {/* Match Indicators when Query Active */}
                        {descSearchQuery.trim() && matchResult.matchedFields.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                            <Tag className="w-2.5 h-2.5 text-emerald-600" />
                            Cocok Kategori
                          </span>
                        )}
                        {descSearchQuery.trim() && matchResult.matchedFields.indication && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            Cocok Indikasi
                          </span>
                        )}

                        {/* Drug Classification Logo */}
                        {metadata.drugClass && (
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                            {metadata.drugClass === "Obat Keras" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center ring-1 ring-black shrink-0">
                                <span className="text-[8px] font-black text-white leading-none mt-0.5">K</span>
                              </div>
                            )}
                            {metadata.drugClass === "Obat Bebas Terbatas" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-1 ring-black flex items-center justify-center shrink-0"></div>
                            )}
                            {metadata.drugClass === "Obat Bebas" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-black flex items-center justify-center shrink-0"></div>
                            )}
                            <span className="text-[10px] font-bold text-slate-700">{metadata.drugClass}</span>
                          </div>
                        )}

                        {/* Generic & Brand Indicator */}
                        {!metadata.isBrand ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700 flex items-center gap-1 shadow-2xs">
                            <span className="text-[8px] bg-white text-slate-800 rounded-sm px-1 py-0.5 leading-none font-black uppercase">G</span>
                            Generik
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 shadow-2xs">
                            <span className="text-[8px] bg-orange-700 text-orange-50 rounded-sm px-1 py-0.5 leading-none font-black uppercase">B</span>
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
                            : "bg-orange-50 border-orange-200 text-orange-700"
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
                            : "bg-orange-50 border-orange-100 text-orange-700"
                        }`}>
                          Menyusui: {metadata.breastfeedingSafety.status}
                        </span>

                        {/* Drug Interaction Status Badge */}
                        {(() => {
                          const directInteractions = getInteractionsForDrug(preset.id, preset.name, interactionDatabase);
                          const foodInteractions = getFoodInteractionsForDrug(preset.id, preset.name);
                          const totalDdi = directInteractions.length;
                          const totalFood = foodInteractions.length;
                          const criticalCount = directInteractions.filter(i => i.severity === "CRITICAL").length + foodInteractions.filter(i => i.severity === "CRITICAL").length;

                          if (totalDdi === 0 && totalFood === 0) {
                            return null;
                          }

                          return (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${
                              criticalCount > 0
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                            }`} title={`${totalDdi} interaksi obat & ${totalFood} pantangan makanan terdaftar`}>
                              <Zap className="w-3 h-3 shrink-0 text-amber-600" />
                              {totalDdi} Interaksi Obat {criticalCount > 0 && `(${criticalCount} Kritis)`}
                            </span>
                          );
                        })()}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <HighlightText text={metadata.brandName} query={descSearchQuery} />
                        {metadata.genericName !== metadata.brandName && (
                          <span className="text-xs text-slate-500 font-medium font-sans">
                            (<HighlightText text={metadata.genericName} query={descSearchQuery} />)
                          </span>
                        )}
                      </h3>

                      <p className="text-xs text-slate-600 font-sans leading-relaxed flex items-center gap-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-tight shrink-0 text-[10px]">Indikasi:</span>
                        <span>
                          <HighlightText text={preset.indication} query={descSearchQuery} />
                        </span>
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
                            Kategori, Golongan & Cara Kerja Obat
                          </h4>
                          <div className="space-y-2.5">
                            {/* Summary Metadata Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Golongan Regulasi:</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {metadata.drugClass === "Obat Keras" && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center ring-1 ring-black shrink-0">
                                      <span className="text-[8px] font-black text-white leading-none mt-0.5">K</span>
                                    </div>
                                  )}
                                  {metadata.drugClass === "Obat Bebas Terbatas" && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-1 ring-black flex items-center justify-center shrink-0"></div>
                                  )}
                                  {metadata.drugClass === "Obat Bebas" && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-black flex items-center justify-center shrink-0"></div>
                                  )}
                                  <span className="text-xs font-bold text-slate-800">{metadata.drugClass}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Klasifikasi Penamaan:</span>
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-0.5 ${metadata.isBrand ? "text-orange-700" : "text-slate-800"}`}>
                                  {metadata.isBrand ? "🏷️ Obat Bermerek / Paten" : "🔬 Obat Generik (INN)"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Bentuk Sediaan:</span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 mt-0.5">
                                  <span>{formInfo.icon}</span> {formInfo.label}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Kategori Terapi:</span>
                              <p className="text-slate-700 font-sans text-xs leading-relaxed font-semibold">
                                <HighlightText text={metadata.categoryInfo} query={descSearchQuery} />
                              </p>
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
                              <HighlightText text={metadata.dosageRule} query={descSearchQuery} />
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
                              : "bg-orange-50/40 border-orange-150 text-orange-950"
                          } space-y-2`}>
                            <h5 className="font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-black border ${
                                metadata.pregnancySafety.status === "Aman"
                                  ? "bg-emerald-600 border-emerald-700 text-white"
                                  : metadata.pregnancySafety.status === "Kontraindikasi"
                                  ? "bg-rose-600 border-rose-700 text-white animate-pulse"
                                  : "bg-orange-600 border-orange-700 text-white"
                              }`}>
                                Kategori {metadata.pregnancySafety.category}
                              </span>
                              <span>Pemberian Saat Kehamilan</span>
                            </h5>
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                              {metadata.pregnancySafety.detail}
                            </p>
                            {metadata.pregnancySafety.trimesterAdvice && (
                              <div className="mt-2 text-[11px] bg-white/85 p-2.5 rounded-lg border border-slate-200/80 text-slate-800 flex items-start gap-1.5">
                                <span className="font-bold shrink-0 text-indigo-700">💡 Panduan Trimester / Klinis:</span>
                                <span>{metadata.pregnancySafety.trimesterAdvice}</span>
                              </div>
                            )}
                          </div>

                          {/* Keamanan Menyusui */}
                          <div className={`p-4 rounded-xl border ${
                            metadata.breastfeedingSafety.status === "Aman"
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-950"
                              : metadata.breastfeedingSafety.status === "Kontraindikasi"
                              ? "bg-rose-50/40 border-rose-150 text-rose-950"
                              : "bg-orange-50/40 border-orange-150 text-orange-950"
                          } space-y-2`}>
                            <h5 className="font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-black border ${
                                metadata.breastfeedingSafety.status === "Aman"
                                  ? "bg-emerald-600 border-emerald-700 text-white"
                                  : metadata.breastfeedingSafety.status === "Kontraindikasi"
                                  ? "bg-rose-600 border-rose-700 text-white"
                                  : "bg-orange-600 border-orange-700 text-white"
                              }`}>
                                {metadata.breastfeedingSafety.status.toUpperCase()}
                              </span>
                              <span>Pemberian Saat Menyusui</span>
                            </h5>
                            <p className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                              {metadata.breastfeedingSafety.detail}
                            </p>
                            {metadata.breastfeedingSafety.infantRisk && (
                              <div className="mt-2 text-[11px] bg-white/85 p-2.5 rounded-lg border border-slate-200/80 text-slate-800 flex items-start gap-1.5">
                                <span className="font-bold shrink-0 text-teal-700">👶 Observasi Bayi:</span>
                                <span>{metadata.breastfeedingSafety.infantRisk}</span>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Clinical Reference Citation Bar */}
                        <div className="text-[10px] text-slate-500 bg-slate-50/80 border border-slate-200/80 rounded-lg p-2.5 flex items-start gap-2 font-sans">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="leading-relaxed">
                            <span className="font-bold text-slate-700">Pustaka & Standar Rujukan Keamanan: </span>
                            <span>{metadata.references}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section: Interaksi Obat (DDI) & Interaksi Makanan */}
                      {(() => {
                        const drugInteractions = getInteractionsForDrug(preset.id, preset.name, interactionDatabase);
                        const foodInteractions = getFoodInteractionsForDrug(preset.id, preset.name);
                        const hasInteractions = drugInteractions.length > 0 || foodInteractions.length > 0;
                        const criticalDdi = drugInteractions.filter(i => i.severity === "CRITICAL");
                        const warningDdi = drugInteractions.filter(i => i.severity === "WARNING");

                        return (
                          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-3xs">
                            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Peringatan Interaksi Obat (DDI) & Pantangan Makanan
                              </h4>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!ddiSelectedIds.includes(preset.id)) {
                                    setDdiSelectedIds([...ddiSelectedIds, preset.id]);
                                  }
                                  setActiveTab("ddi");
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                title="Buka menu skrining interaksi lengkap dengan obat ini langsung ditambahkan ke keranjang"
                              >
                                <Search className="w-3.5 h-3.5 text-amber-600" />
                                <span>Skrining Pasien dengan Obat Ini</span>
                              </button>
                            </div>

                            {!hasInteractions ? (
                              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-900 text-xs flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                  <p className="font-bold text-emerald-950">Tidak Ditemukan Interaksi Kritis Terdaftar</p>
                                  <p className="text-[11px] text-emerald-800 font-sans mt-0.5 leading-relaxed">
                                    Belum ada catatan interaksi mayor atau kontraindikasi mutlak dalam database klinis RSUD Palembang BARI untuk obat ini. Tetap pantau kondisi klinis dan organ eliminasi pasien.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {/* Summary Badge Count */}
                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                  <span className="text-slate-500 font-medium font-sans">Terdeteksi:</span>
                                  {criticalDdi.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-black flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> {criticalDdi.length} Kontraindikasi Kritis
                                    </span>
                                  )}
                                  {warningDdi.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> {warningDdi.length} Peringatan / Pemantauan
                                    </span>
                                  )}
                                  {foodInteractions.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 font-bold flex items-center gap-1">
                                      🥗 {foodInteractions.length} Pantangan Makanan / Minuman
                                    </span>
                                  )}
                                </div>

                                {/* List of Drug Interactions */}
                                {drugInteractions.length > 0 && (
                                  <div className="space-y-2.5 mt-2">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      <Pill className="w-3 h-3 text-slate-400" />
                                      Daftar Interaksi Antar-Obat ({drugInteractions.length})
                                    </h5>
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {drugInteractions.map((interaction) => {
                                        const otherDrugName = interaction.drugAName.toLowerCase().includes(preset.name.toLowerCase().slice(0, 4))
                                          ? interaction.drugBName
                                          : interaction.drugAName;
                                        const isCritical = interaction.severity === "CRITICAL";

                                        return (
                                          <div
                                            key={interaction.id}
                                            className={`p-3.5 rounded-xl border ${
                                              isCritical
                                                ? "bg-rose-50/40 border-rose-200"
                                                : "bg-amber-50/30 border-amber-200/80"
                                            } space-y-2`}
                                          >
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                              <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                                                  isCritical
                                                    ? "bg-rose-600 text-white"
                                                    : "bg-amber-500 text-white"
                                                }`}>
                                                  {isCritical ? "KONTRAINDIKASI / KRITIS" : "PERINGATAN MODERAT"}
                                                </span>
                                                <span className="font-bold text-slate-900 text-xs">
                                                  Interaksi dengan: <span className="underline decoration-amber-400 font-extrabold text-slate-950">{otherDrugName}</span>
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const pairIds = [preset.id];
                                                  const targetPreset = drugPresets.find(p => 
                                                    p.id === interaction.drugAId || p.id === interaction.drugBId ||
                                                    p.name.toLowerCase().includes(otherDrugName.toLowerCase())
                                                  );
                                                  if (targetPreset && !pairIds.includes(targetPreset.id)) {
                                                    pairIds.push(targetPreset.id);
                                                  }
                                                  setDdiSelectedIds(Array.from(new Set([...ddiSelectedIds, ...pairIds])));
                                                  setActiveTab("ddi");
                                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer bg-white/80 px-2 py-0.5 rounded-md border border-teal-200"
                                              >
                                                <span>Uji Pasangan Ini di Skrining</span> &rarr;
                                              </button>
                                            </div>

                                            <div className="text-[11.5px] text-slate-700 font-sans leading-relaxed space-y-1.5">
                                              <p>
                                                <strong className="text-slate-900 font-semibold">Mekanisme Klinis: </strong>
                                                {interaction.mechanism}
                                              </p>
                                              <div className="p-2 bg-white/95 rounded-lg border border-slate-200/80 text-slate-800">
                                                <strong className="text-emerald-800 font-semibold">Rekomendasi Farmasis: </strong>
                                                {interaction.recommendation}
                                              </div>
                                              {interaction.evidence && (
                                                <p className="text-[10px] text-slate-500 italic mt-0.5">
                                                  <strong>Bukti Ilmiah / Referensi: </strong> {interaction.evidence}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* List of Food Interactions */}
                                {foodInteractions.length > 0 && (
                                  <div className="space-y-2 mt-3 pt-2 border-t border-slate-100">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                      🥗 Pantangan Makanan & Minuman Terkait ({foodInteractions.length})
                                    </h5>
                                    <div className="grid grid-cols-1 gap-2">
                                      {foodInteractions.map((fItem) => (
                                        <div
                                          key={fItem.id}
                                          className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-1"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-orange-950 text-xs flex items-center gap-1.5">
                                              <span>⚠️</span> {fItem.foodName}
                                            </span>
                                            <span className={`px-2 py-0.2 text-[9px] font-black uppercase rounded ${
                                              fItem.severity === "CRITICAL" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                                            }`}>
                                              {fItem.severity === "CRITICAL" ? "HINDARI MUTLAK" : "PERINGATAN"}
                                            </span>
                                          </div>
                                          <p className="text-[11.5px] text-slate-700 font-sans leading-relaxed">
                                            <strong className="text-slate-900 font-semibold">Mekanisme: </strong>{fItem.mechanism}
                                          </p>
                                          <div className="p-1.5 bg-white/90 rounded-md text-[11px] text-orange-950 font-medium border border-orange-100">
                                            <strong className="text-orange-900">Saran Konsumsi: </strong>{fItem.recommendation}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Card Actions: Quick Calculate */}
                      <div className="flex items-center justify-between flex-wrap gap-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 italic font-sans font-medium">Klik tombol untuk langsung melakukan kalkulasi dosis atau uji skrining interaksi</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!ddiSelectedIds.includes(preset.id)) {
                                setDdiSelectedIds([...ddiSelectedIds, preset.id]);
                              }
                              setActiveTab("ddi");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            title="Tambahkan obat ini ke keranjang skrining interaksi"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            Skrining Interaksi
                          </button>
                          <button
                            type="button"
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
                              setIsMobileMenuOpen(false); setActiveTab("single");
                              
                              // Scroll up smoothly to calculations
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 self-end text-xs cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Mulai Hitung Dosis</span>
                          </button>
                        </div>
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

          {/* Pagination Controls */}
          {descFilteredList.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-md">
              <div className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-800">{Math.min((Math.max(1, descPage) - 1) * descPageSize + 1, descFilteredList.length)}</span> - <span className="font-bold text-slate-800">{Math.min(descFilteredList.length, Math.max(1, descPage) * descPageSize)}</span> dari <span className="font-bold text-teal-700">{descFilteredList.length}</span> obat
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDescPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    disabled={descPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Halaman Sebelumnya"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Page Jump Numbers */}
                  {(() => {
                    const totalDescPages = Math.max(1, Math.ceil(descFilteredList.length / descPageSize));
                    const safePage = Math.min(Math.max(1, descPage), totalDescPages);
                    return Array.from({ length: totalDescPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalDescPages || Math.abs(p - safePage) <= 1)
                      .map((p, idx, arr) => {
                        const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsisBefore && <span className="px-1 text-slate-400 text-xs">...</span>}
                            <button
                              type="button"
                              onClick={() => {
                                setDescPage(p);
                                window.scrollTo({ top: 350, behavior: "smooth" });
                              }}
                              className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg transition-all ${
                                safePage === p
                                  ? "bg-teal-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      });
                  })()}

                  <button
                    type="button"
                    onClick={() => {
                      const totalDescPages = Math.max(1, Math.ceil(descFilteredList.length / descPageSize));
                      setDescPage(prev => Math.min(totalDescPages, prev + 1));
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    disabled={descPage >= Math.max(1, Math.ceil(descFilteredList.length / descPageSize))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Halaman Selanjutnya"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Page Size Selector */}
                <select
                  value={descPageSize}
                  onChange={(e) => {
                    setDescPageSize(Number(e.target.value));
                    setDescPage(1);
                  }}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value={30}>30 / hal</option>
                  <option value={60}>60 / hal</option>
                  <option value={100}>100 / hal</option>
                  <option value={99999}>Semua</option>
                </select>
              </div>
            </div>
          )}
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
                      <span className="text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
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
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      Mutiara Klinis & Panduan Konseling Pasien (Counseling Pearls)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700 leading-relaxed font-sans">
                      {currentItem.counseling.map((counselItem, idx) => (
                        <div key={"counsel_" + idx} className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                          <span className="text-orange-500 font-extrabold shrink-0">💡</span>
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
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const defaultList = sanitizeDrugPresets(INITIAL_DRUG_PRESETS);
                  setDrugPresets(defaultList);
                  localStorage.setItem("drugPresets_v5", JSON.stringify(defaultList));
                  localStorage.removeItem("drugPresets_v4");
                  setIsUpdateDrugModalOpen(false);
                }}
                className="px-3.5 py-2 font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors text-xs"
              >
                Reset Database Default
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUpdateDrugModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
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
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setInteractionDatabase(INITIAL_INTERACTION_DATABASE);
                  localStorage.setItem("interactionDatabase_v7", JSON.stringify(INITIAL_INTERACTION_DATABASE));
                  localStorage.removeItem("interactionDatabase_v4");
                  localStorage.removeItem("interactionDatabase_v5");
                  localStorage.removeItem("interactionDatabase_v6");
                  setIsUpdateDdiModalOpen(false);
                }}
                className="px-3.5 py-2 font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors text-xs"
              >
                Reset Database Default
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUpdateDdiModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateDdiData}
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
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

      {/* 3D Glassmorphism Floating Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-3 left-4 right-4 glass-card rounded-3xl shadow-[0_12px_36px_rgba(15,23,42,0.12)] flex items-center justify-around py-1.5 px-3 z-40">
        <button 
          onClick={() => { setIsMobileMenuOpen(false); setActiveTab("desc"); }} 
          className={`flex flex-col items-center justify-center w-14 h-11 gap-1 transition-all cursor-pointer ${
            activeTab === "desc" ? "text-teal-700 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
          title="Informasi Obat"
        >
          <BookOpen className={`w-5 h-5 ${activeTab === "desc" ? "text-teal-700" : ""}`} />
          <span className="text-[9px] font-bold tracking-tight">Obat</span>
        </button>

        <button 
          onClick={() => { setIsMobileMenuOpen(false); setActiveTab("ddi"); }} 
          className={`flex flex-col items-center justify-center w-14 h-11 gap-1 transition-all cursor-pointer ${
            activeTab === "ddi" ? "text-rose-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
          title="Skrining Interaksi"
        >
          <ShieldAlert className={`w-5 h-5 ${activeTab === "ddi" ? "text-rose-600 animate-pulse" : ""}`} />
          <span className="text-[9px] font-bold tracking-tight">Skrining</span>
        </button>

        {/* Elevated Center 3D Action Pill: Kompatibilitas IV */}
        <button
          onClick={() => { setIsMobileMenuOpen(false); setActiveTab("iv"); }}
          className={`-translate-y-4 w-12 h-12 rounded-full text-white shadow-[0_8px_20px_rgba(13,148,136,0.45)] border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all group cursor-pointer ${
            activeTab === "iv"
              ? "bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-500 ring-2 ring-teal-400 ring-offset-2"
              : "bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-400"
          }`}
          title="Kompatibilitas Obat IV"
        >
          <Droplets className={`w-5 h-5 group-hover:rotate-12 transition-transform ${activeTab === "iv" ? "animate-bounce" : ""}`} />
        </button>

        <button 
          onClick={() => { setIsMobileMenuOpen(false); setActiveTab("medcalc"); }} 
          className={`flex flex-col items-center justify-center w-14 h-11 gap-1 transition-all cursor-pointer ${
            activeTab === "medcalc" ? "text-sky-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
          title="Kalkulator Medis"
        >
          <Calculator className={`w-5 h-5 ${activeTab === "medcalc" ? "text-sky-600" : ""}`} />
          <span className="text-[9px] font-bold tracking-tight">Kalkulator</span>
        </button>

        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className={`flex flex-col items-center justify-center w-14 h-11 gap-1 transition-all cursor-pointer ${
            !["desc", "ddi", "iv", "medcalc"].includes(activeTab) ? "text-teal-700 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
          title="Menu Semua Fitur"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight">Menu</span>
        </button>
      </div>
      <FloatingAIAssistant />
      
      {/* Glassmorphism Transparency & Blur Settings Modal */}
      {isGlassSettingsOpen && (
        <Suspense fallback={null}>
          <GlassSettingsModal
            isOpen={isGlassSettingsOpen}
            onClose={() => setIsGlassSettingsOpen(false)}
            opacity={glassOpacity}
            onOpacityChange={setGlassOpacity}
            blur={glassBlur}
            onBlurChange={setGlassBlur}
          />
        </Suspense>
      )}
</div>
  );
}
