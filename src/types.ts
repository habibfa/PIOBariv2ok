/**
 * Clinical Calculator and Dosage Types
 */

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export interface ValidationAlert {
  id: string;
  field: "age" | "weight" | "height" | "bsa" | "dose" | "creatinine" | "general";
  level: AlertLevel;
  message: string;
  details?: string;
}

export interface CalculatorInputs {
  ageYears: number | "";
  ageMonths: number | "";
  weightKg: number | "";
  heightCm: number | "";
  bsaManual: number | "";
  useBsaManual: boolean;
  serumCreatinine: number | "";
  targetDoseValue: number | "";
  doseUnit: "mg" | "mcg" | "g" | "units";
  calcMethod: "mg_per_kg" | "mg_per_m2" | "flat";
  frequency: string; // "once", "q12h" (BID), "q8h" (TID), "q6h" (QID), "q4h"
  liquidConcentrationValue?: number | ""; // e.g. 120
  liquidConcentrationVolume?: number | ""; // e.g. 5 (means 120mg / 5ml)
}

export interface DrugPreset {
  id: string;
  name: string;
  indication: string;
  calcMethod: "mg_per_kg" | "mg_per_m2" | "flat";
  defaultDoseValue: number;
  doseUnit: "mg" | "mcg" | "g" | "units";
  frequency: string;
  liquidConcentrationValue?: number;
  liquidConcentrationVolume?: number;
  singleDoseLimitMax?: number;
  dailyDoseLimitMax?: number;
  pediatricCeilingDose?: number; // Maximum dose for children
  ageRangeMinYears?: number;
  weightMinKg?: number;
  weightMaxKg?: number;
  requiresRenalAdjustment?: boolean;
  notes?: string;
}

export interface CalculationResult {
  singleDose: number;
  dailyDose: number;
  doseFormula: string;
  liquidVolumeMl?: number;
  liquidVolumeFormula?: string;
  renalAdjustmentApplied: boolean;
  renalDoseReductionPercent?: number;
  alerts: ValidationAlert[];
}

export interface DrugPregnancySafety {
  category: "A" | "B" | "C" | "D" | "X";
  status: "Aman" | "Perlu Perhatian" | "Kontraindikasi";
  detail: string;
  trimesterAdvice?: string;
}

export interface DrugBreastfeedingSafety {
  status: "Aman" | "Perlu Perhatian" | "Kontraindikasi";
  detail: string;
  infantRisk?: string;
}

export interface DrugClinicalMetadata {
  brandName: string;
  genericName: string;
  isBrand: boolean;
  composition: string;
  doseMin: string;
  doseMax: string;
  indication: string;
  contraindication: string;
  pregnancySafety: DrugPregnancySafety;
  breastfeedingSafety: DrugBreastfeedingSafety;
  drugClass: "Obat Keras" | "Obat Bebas Terbatas" | "Obat Bebas";
  mechanism: string;
  categoryInfo: { label: string; color: string; bg: string; border: string };
  precautions: string;
  dosageRule: string;
  usageGuide: string;
  sideEffects: string;
  references: string;
  bud: string;
}
