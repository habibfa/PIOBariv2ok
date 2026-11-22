import { DrugPreset } from "../types";

export type SearchScope = "all" | "indication" | "category";

export interface DrugSearchMatchResult {
  isMatch: boolean;
  matchedFields: {
    name: boolean;
    indication: boolean;
    category: boolean;
  };
}

// Canonical Indonesian Brand & Generic Aliases Dictionary
const BRAND_GENERIC_MAP: Record<string, string[]> = {
  paracetamol: ["sanmol", "panadol", "tempra", "biogesic", "pamol", "dumin", "fasidol", "sumagesic", "ottopan", "naprex", "tamol", "asetaminofen", "acetaminophen"],
  amoxicillin: ["amoxsan", "kalmoxillin", "ospamox", "amoxil", "hiconcil", "broadamox", "amoksisilin"],
  amoksisilin: ["amoxsan", "kalmoxillin", "ospamox", "amoxil", "hiconcil", "broadamox", "amoxicillin"],
  cefixime: ["cefspan", "ceptik", "spancef", "starcef", "cefila", "lanfix", "sefiksim"],
  bisoprolol: ["concor", "lodoz", "maintate", "bisovell", "b-beta"],
  furosemide: ["lasix", "farsix", "uresix", "gitas", "furosemid"],
  furosemid: ["lasix", "farsix", "uresix", "gitas", "furosemide"],
  salbutamol: ["ventolin", "astharol", "salbuven", "velutine", "glisend"],
  atorvastatin: ["lipitor", "truvaz", "atoris", "cholastin"],
  rosuvastatin: ["crestor", "rovator", "roswin"],
  clopidogrel: ["plavix", "clopisan", "platogrix", "therodel"],
  metformin: ["glucophage", "forbetes", "neodipar", "gludepatic"],
  glimepiride: ["amaryl", "glimetic", "metrix"],
  gliclazide: ["diamicron", "glikamel"],
  telmisartan: ["micardis", "telsat"],
  candesartan: ["blopress", "canderin", "candipres"],
  diltiazem: ["herbesser", "farmabes", "cordizem"],
  nifedipine: ["adalat", "nifedin", "cordalat", "nifedipin"],
  amlodipine: ["norvask", "tensivask", "divask", "amlodipin"],
  amlodipin: ["norvask", "tensivask", "divask", "amlodipine"],
  captopril: ["capoten", "farmoten", "otoryl", "kaptopril"],
  esomeprazole: ["nexium", "esomax", "esomet"],
  omeprazole: ["pumpitor", "ozid", "lokev", "omevell", "socid", "prilosec", "omeprazol"],
  omeprazol: ["pumpitor", "ozid", "lokev", "omevell", "socid", "prilosec", "omeprazole"],
  lansoprazole: ["prosogan", "inazol", "lapraz", "gastrolan", "lansoprazol"],
  pantoprazole: ["pantozol", "panloc", "peptazol", "pantoprazol"],
  sucralfate: ["inpepsa", "episan", "neogastrol", "ulin", "sukralfat"],
  sukralfat: ["inpepsa", "episan", "neogastrol", "ulin", "sucralfate"],
  hyoscine: ["buscopan", "spasmolit", "hiosin"],
  hiosin: ["buscopan", "spasmolit", "hyoscine"],
  diazepam: ["stesolid", "valisanbe", "valium"],
  alprazolam: ["xanax", "alganax", "calmlet", "frixitas"],
  lorazepam: ["merlopam", "ativan", "renaquil"],
  clobazam: ["frisium", "asabium"],
  fluoxetine: ["kalxetin", "prozac", "deprezac", "fluoksetin"],
  sertraline: ["zoloft", "fridep", "zerlin", "sertralin"],
  quetiapine: ["seroquel", "seroquel xr", "ketiapin"],
  risperidone: ["risperdal", "neripros", "persidal", "risperidon"],
  aripiprazole: ["abilify", "aripiprazol"],
  valproic: ["depakote", "depakene", "valproid", "epival", "asam valproat", "divalproex"],
  phenytoin: ["ikaphen", "kutoin", "dilantin", "curelep", "fenitoin"],
  fenitoin: ["ikaphen", "kutoin", "dilantin", "curelep", "phenytoin"],
  carbamazepine: ["tegretol", "bamgetol", "karbamazepin"],
  karbamazepin: ["tegretol", "bamgetol", "carbamazepine"],
  levetiracetam: ["keppra", "epiram"],
  gabapentin: ["neurontin", "gabexal", "sipentin"],
  pregabalin: ["lyrica", "provelyn", "leptica"],
  allopurinol: ["zyloric", "puricemia", "isoric", "sinoric", "alopurinol"],
  colchicine: ["recolfar", "kolkisin"],
  kolkisin: ["recolfar", "colchicine"],
  diclofenac: ["cataflam", "voltaren", "diflam", "kaltrofen", "diklofenak"],
  diklofenak: ["cataflam", "voltaren", "diflam", "kaltrofen", "diclofenac"],
  mefenamic: ["ponstan", "mefinal", "ponstelax", "licostan", "asam mefenamat"],
  ketorolac: ["toradol", "laturol", "remopain", "ketorolak"],
  dexketoprofen: ["ketesse", "tofedex", "deksketoprofen"],
  tramadol: ["tramal", "centrasic", "dolgesik"],
  morphine: ["mst continus", "morfin"],
  morfin: ["mst continus", "morphine"],
  fentanyl: ["durogesic", "fentanil"],
  ceftriaxone: ["rocephin", "broadced", "cefaxon", "starxo", "terfacef", "ceftriakson"],
  ceftriakson: ["rocephin", "broadced", "cefaxon", "starxo", "terfacef", "ceftriaxone"],
  cefotaxime: ["claforan", "kalfoxim", "cefotaxim", "taxegram", "sefotaksim"],
  meropenem: ["meronem", "ronem", "tripenem"],
  levofloxacin: ["cravit", "levocin", "mosardal", "difloxin", "levofloksasin"],
  ciprofloxacin: ["baquinor", "ciproxin", "bernoflox", "ciphron", "siprofloksasin"],
  azithromycin: ["zithromax", "zicho", "binozyt", "zycin", "azitromisin"],
  azitromisin: ["zithromax", "zicho", "binozyt", "zycin", "azithromycin"],
  ketoconazole: ["nizoral", "formyco", "mycoral", "ketokonazol"],
  ketokonazol: ["nizoral", "formyco", "mycoral", "ketoconazole"],
  fluconazole: ["diflucan", "zemyc", "cryptal", "flukonazol"],
  flukonazol: ["diflucan", "zemyc", "cryptal", "fluconazole"],
  acyclovir: ["zovirax", "clinovir", "poviral", "acifar", "asiklovir"],
  asiklovir: ["zovirax", "clinovir", "poviral", "acifar", "acyclovir"],
  cetirizine: ["ryvel", "ozen", "tiriz", "cerini", "incidal", "setirizin"],
  setirizin: ["ryvel", "ozen", "tiriz", "cerini", "incidal", "cetirizine"],
  domperidone: ["vometa", "motilium", "domperidon", "costil"],
  ondansetron: ["narfoz", "cedantron", "invomit", "vometron"],
  methylprednisolone: ["medixon", "lexidron", "prednox", "advantan", "urbason", "metilprednisolon"],
  metilprednisolon: ["medixon", "lexidron", "prednox", "advantan", "urbason", "methylprednisolone"],
  dexamethasone: ["cortidex", "kalmethasone", "lanadexon", "oradexon", "deksametason"],
  deksametason: ["cortidex", "kalmethasone", "lanadexon", "oradexon", "dexamethasone"],
  erdosteine: ["vectrine", "edotin", "erdobat"],
  ampicillin: ["viccillin", "penbritin", "ampisilin"],
  ampisilin: ["viccillin", "penbritin", "ampicillin"],
  zinc: ["zinkid", "darya-zinc", "interzinc"],
  zink: ["zinkid", "darya-zinc", "interzinc"]
};

const BRAND_GENERIC_ENTRIES = Object.entries(BRAND_GENERIC_MAP);
const ALIAS_CACHE = new Map<string, string>();

interface NormalizedSearchCacheEntry {
  nameText: string;
  indicationText: string;
  notesText: string;
}

const PRESET_SEARCH_CACHE = new WeakMap<DrugPreset, NormalizedSearchCacheEntry>();

// Helper to retrieve brand and generic alias tokens for a drug (memoized)
function getDrugAliases(name: string, id: string): string {
  const cacheKey = `${name}\u0000${id}`;
  const cached = ALIAS_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const combined = `${name} ${id}`.toLowerCase();
  const aliases: string[] = [];

  for (let i = 0; i < BRAND_GENERIC_ENTRIES.length; i++) {
    const [key, values] = BRAND_GENERIC_ENTRIES[i];
    if (combined.includes(key)) {
      aliases.push(...values);
    } else {
      for (let j = 0; j < values.length; j++) {
        if (combined.includes(values[j])) {
          aliases.push(key);
          aliases.push(...values);
          break;
        }
      }
    }
  }
  const joined = aliases.join(" ");
  ALIAS_CACHE.set(cacheKey, joined);
  return joined;
}

function getNormalizedPresetFields(preset: DrugPreset): NormalizedSearchCacheEntry {
  const cached = PRESET_SEARCH_CACHE.get(preset);
  if (cached) return cached;

  const aliasesText = getDrugAliases(preset.name, preset.id);
  const entry: NormalizedSearchCacheEntry = {
    nameText: `${preset.name} ${preset.id} ${aliasesText}`.toLowerCase(),
    indicationText: (preset.indication || "").toLowerCase(),
    notesText: (preset.notes || "").toLowerCase(),
  };
  PRESET_SEARCH_CACHE.set(preset, entry);
  return entry;
}

const EMPTY_MATCH_RESULT: DrugSearchMatchResult = {
  isMatch: true,
  matchedFields: { name: false, indication: false, category: false },
};

/**
 * Evaluates whether a drug preset satisfies search query tokens.
 * Uses cached normalized text and alias lookup for instant keystroke filtering.
 */
export function matchDrugSimultaneous(
  preset: DrugPreset,
  categoryLabel: string,
  query: string,
  searchScope: SearchScope = "all"
): DrugSearchMatchResult {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return EMPTY_MATCH_RESULT;
  }

  const { nameText, indicationText, notesText } = getNormalizedPresetFields(preset);
  const catText = (categoryLabel || "").toLowerCase();

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  let isMatch = false;

  if (searchScope === "indication") {
    isMatch = tokens.every((t) => indicationText.includes(t));
  } else if (searchScope === "category") {
    isMatch = tokens.every((t) => catText.includes(t));
  } else {
    isMatch = tokens.every(
      (t) =>
        nameText.includes(t) ||
        indicationText.includes(t) ||
        catText.includes(t) ||
        notesText.includes(t)
    );
  }

  if (!isMatch) {
    return {
      isMatch: false,
      matchedFields: { name: false, indication: false, category: false },
    };
  }

  const matchedName = tokens.some((t) => nameText.includes(t) || notesText.includes(t));
  const matchedIndication = tokens.some((t) => indicationText.includes(t));
  const matchedCategory = tokens.some((t) => catText.includes(t));

  return {
    isMatch: true,
    matchedFields: {
      name: matchedName,
      indication: matchedIndication,
      category: matchedCategory,
    },
  };
}
