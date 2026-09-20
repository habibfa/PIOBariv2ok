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

/**
 * Evaluates whether a drug preset satisfies search query tokens.
 * In "all" mode, search works simultaneously across:
 * 1. Drug Name (generic & brand)
 * 2. Indication
 * 3. Therapeutic Category
 *
 * Example: "antibiotik saluran kemih" -> "antibiotik" matched in Category, "saluran kemih" matched in Indication.
 * Both tokens are satisfied simultaneously!
 */
export function matchDrugSimultaneous(
  preset: DrugPreset,
  categoryLabel: string,
  query: string,
  searchScope: SearchScope = "all"
): DrugSearchMatchResult {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return {
      isMatch: true,
      matchedFields: { name: false, indication: false, category: false }
    };
  }

  const nameText = `${preset.name} ${preset.id}`.toLowerCase();
  const indicationText = (preset.indication || "").toLowerCase();
  const catText = (categoryLabel || "").toLowerCase();
  const notesText = (preset.notes || "").toLowerCase();

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  const matchedName = tokens.some(t => nameText.includes(t) || notesText.includes(t));
  const matchedIndication = tokens.some(t => indicationText.includes(t));
  const matchedCategory = tokens.some(t => catText.includes(t));

  let isMatch = false;

  if (searchScope === "indication") {
    // Every token must be found in the indication field
    isMatch = tokens.every(t => indicationText.includes(t));
  } else if (searchScope === "category") {
    // Every token must be found in the therapeutic category field
    isMatch = tokens.every(t => catText.includes(t));
  } else {
    // SIMULTANEOUS / ALL FIELDS:
    // Every token typed by the user must be satisfied by either the name, indication, or category
    isMatch = tokens.every(
      t =>
        nameText.includes(t) ||
        indicationText.includes(t) ||
        catText.includes(t) ||
        notesText.includes(t)
    );
  }

  return {
    isMatch,
    matchedFields: {
      name: matchedName,
      indication: matchedIndication,
      category: matchedCategory
    }
  };
}
