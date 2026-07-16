import { CalculatorInputs, CalculationResult, ValidationAlert, AlertLevel, DrugPreset } from "./types";

/**
 * Calculates Body Surface Area (BSA) using the Mosteller formula
 * BSA = sqrt( (Height(cm) * Weight(kg)) / 3600 )
 */
export function calculateMostellerBsa(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  return Math.sqrt((heightCm * weightKg) / 3600);
}

/**
 * Estimates Creatinine Clearance (CrCl) using Cockcroft-Gault equation
 * For females: CrCl = 0.85 * ((140 - Age) * Weight) / (72 * SCr)
 * For males: CrCl = ((140 - Age) * Weight) / (72 * SCr)
 */
export function calculateCockcroftGault(
  ageYears: number,
  weightKg: number,
  serumCreatinine: number,
  isFemale: boolean = false
): number {
  if (ageYears <= 0 || weightKg <= 0 || serumCreatinine <= 0) return 0;
  let crCl = ((140 - ageYears) * weightKg) / (72 * serumCreatinine);
  if (isFemale) {
    crCl *= 0.85;
  }
  return crCl;
}

/**
 * Validates inputs and performs dosage calculation
 */
export function calculateDosage(
  inputs: CalculatorInputs,
  selectedPreset?: DrugPreset,
  isFemale: boolean = false
): CalculationResult {
  const alerts: ValidationAlert[] = [];
  const {
    ageYears,
    ageMonths,
    weightKg,
    heightCm,
    bsaManual,
    useBsaManual,
    serumCreatinine,
    targetDoseValue,
    doseUnit,
    calcMethod,
    frequency,
    liquidConcentrationValue,
    liquidConcentrationVolume,
  } = inputs;

  // Convert inputs to numbers
  const numAgeYears = typeof ageYears === "number" ? ageYears : 0;
  const numAgeMonths = typeof ageMonths === "number" ? ageMonths : 0;
  const numWeight = typeof weightKg === "number" ? weightKg : 0;
  const numHeight = typeof heightCm === "number" ? heightCm : 0;
  const numTargetDose = typeof targetDoseValue === "number" ? targetDoseValue : 0;
  const numSerumCreatinine = typeof serumCreatinine === "number" ? serumCreatinine : 0;

  // 1. INPUT LEVEL VALIDATIONS
  
  // Weight Validations
  if (weightKg !== "") {
    if (numWeight <= 0 || numWeight > 500) {
      alerts.push({
        id: "weight_error",
        field: "weight",
        level: AlertLevel.CRITICAL,
        message: "Berat Badan Tidak Valid",
        details: "Berat badan harus antara 0,1 kg dan 500 kg untuk menghitung dosis yang masuk akal secara klinis.",
      });
    } else if (numWeight < 3.0) {
      alerts.push({
        id: "weight_neonatal_warning",
        field: "weight",
        level: AlertLevel.WARNING,
        message: "Berat Badan Lahir Rendah / Rentang Neonatal",
        details: "Berat badan pasien berada dalam rentang neonatal/sangat rendah (< 3,0 kg). Periksa kembali izin penggunaan obat, kematangan fungsi ginjal, dan pedoman khusus.",
      });
    } else if (numWeight > 140) {
      alerts.push({
        id: "weight_obesity_warning",
        field: "weight",
        level: AlertLevel.WARNING,
        message: "Berat Badan Ekstrem / Peringatan Obesitas",
        details: "Berat badan pasien melebihi 140 kg. Pertimbangkan apakah akan memberikan dosis berdasarkan Berat Badan Aktual (ABW), Berat Badan Ideal (IBW), atau Berat Badan yang Disesuaikan untuk menghindari toksisitas.",
      });
    }
  } else {
    // If weight is missing and calculation method requires it
    if (calcMethod === "mg_per_kg") {
      alerts.push({
        id: "weight_missing",
        field: "weight",
        level: AlertLevel.CRITICAL,
        message: "Berat Badan Diperlukan",
        details: "Berat badan pasien diperlukan untuk penghitungan per kilogram.",
      });
    }
  }

  // Age Validations
  if (ageYears !== "" || ageMonths !== "") {
    const totalAgeYears = numAgeYears + numAgeMonths / 12;
    if (totalAgeYears < 0 || totalAgeYears > 125) {
      alerts.push({
        id: "age_error",
        field: "age",
        level: AlertLevel.CRITICAL,
        message: "Rentang Usia Tidak Valid",
        details: "Usia harus antara 0 dan 125 tahun.",
      });
    } else if (totalAgeYears < 0.08) { // ~4 weeks
      alerts.push({
        id: "age_neonatal",
        field: "age",
        level: AlertLevel.INFO,
        message: "Kelompok Pasien Neonatus",
        details: "Pasien berusia kurang dari 1 bulan. Jalur eliminasi obat dan kematangan enzim hati/ginjal sangat terbatas. Pastikan berat badan dan usia pasca lahir dihitung dengan sempurna.",
      });
    } else if (totalAgeYears < 12) {
      alerts.push({
        id: "age_pediatric",
        field: "age",
        level: AlertLevel.INFO,
        message: "Kelompok Pasien Anak-Anak",
        details: "Pasien adalah anak-anak (< 12 tahun). Pastikan batas keamanan pediatrik terpenuhi dan batas maksimum anak diterapkan.",
      });
    } else if (totalAgeYears > 75) {
      alerts.push({
        id: "age_geriatric",
        field: "age",
        level: AlertLevel.WARNING,
        message: "Kelompok Pasien Geriatri",
        details: "Pasien sudah lanjut usia (> 75 tahun). Pertimbangkan penurunan metabolisme hati akibat usia, bersihan GFR, dan potensi interaksi obat polifarmasi.",
      });
    }
  }

  // Height and BSA Validations
  let bsa = 0;
  if (useBsaManual) {
    bsa = typeof bsaManual === "number" ? bsaManual : 0;
    if (bsaManual !== "") {
      if (bsa < 0.1 || bsa > 3.5) {
        alerts.push({
          id: "bsa_manual_range",
          field: "bsa",
          level: AlertLevel.CRITICAL,
          message: "BSA Manual Tidak Masuk Akal",
          details: "Luas Permukaan Tubuh (BSA) yang dimasukkan ekstrem (< 0,1 atau > 3,5 m²).",
        });
      }
    } else if (calcMethod === "mg_per_m2") {
      alerts.push({
        id: "bsa_missing",
        field: "bsa",
        level: AlertLevel.CRITICAL,
        message: "BSA Diperlukan",
        details: "Luas Permukaan Tubuh (BSA) diperlukan untuk penghitungan per m².",
      });
    }
  } else {
    // Calculated BSA
    if (numWeight > 0 && numHeight > 0) {
      bsa = calculateMostellerBsa(numWeight, numHeight);
      if (bsa < 0.2 || bsa > 3.5) {
        alerts.push({
          id: "bsa_calc_extreme",
          field: "bsa",
          level: AlertLevel.WARNING,
          message: "Perhitungan BSA Ekstrem",
          details: `Perhitungan BSA Mosteller (${bsa.toFixed(2)} m²) berada di luar rentang normal (0,5 hingga 2,5 m²).`,
        });
      }
    } else {
      if (calcMethod === "mg_per_m2") {
        alerts.push({
          id: "bsa_inputs_missing",
          field: "bsa",
          level: AlertLevel.CRITICAL,
          message: "Berat dan Tinggi Diperlukan",
          details: "Berat dan Tinggi diperlukan untuk menghitung BSA (rumus Mosteller) untuk penghitungan per m².",
        });
      }
    }
  }

  // 2. RENAL ADJUSTMENT CALCULATIONS
  let crCl = 0;
  let renalAdjustmentApplied = false;
  let renalDoseReductionPercent = 0;

  if (numSerumCreatinine > 0 && numAgeYears > 0 && numWeight > 0) {
    crCl = calculateCockcroftGault(numAgeYears, numWeight, numSerumCreatinine, isFemale);
    
    if (numSerumCreatinine < 0.2 || numSerumCreatinine > 10) {
      alerts.push({
        id: "creatinine_implausible",
        field: "creatinine",
        level: AlertLevel.WARNING,
        message: "Kreatinin Serum Ekstrem",
        details: "Nilai Kreatinin Serum sangat tinggi atau rendah (< 0,2 atau > 10,0 mg/dL). Periksa kembali unit laboratorium.",
      });
    }

    if (crCl < 15) {
      alerts.push({
        id: "renal_severe",
        field: "creatinine",
        level: AlertLevel.CRITICAL,
        message: `Gangguan Ginjal Berat (CrCl: ${crCl.toFixed(1)} ml/min)`,
        details: "Pasien mengalami gagal ginjal berat. Risiko akumulasi toksik yang tinggi. Diperlukan penyesuaian dosis ekstrem, konsultasi nefrologi, atau agen alternatif.",
      });
      if (selectedPreset?.requiresRenalAdjustment) {
        renalAdjustmentApplied = true;
        renalDoseReductionPercent = 75; // 75% reduction
      }
    } else if (crCl < 30) {
      alerts.push({
        id: "renal_mod_severe",
        field: "creatinine",
        level: AlertLevel.CRITICAL,
        message: `Gangguan Ginjal Sedang hingga Berat (CrCl: ${crCl.toFixed(1)} ml/min)`,
        details: "Laju Filtrasi Glomerulus berkurang drastis. Pastikan dosis obat yang dieliminasi lewat ginjal disesuaikan dengan benar.",
      });
      if (selectedPreset?.requiresRenalAdjustment) {
        renalAdjustmentApplied = true;
        renalDoseReductionPercent = 50; // 50% reduction
      }
    } else if (crCl < 60) {
      alerts.push({
        id: "renal_mild",
        field: "creatinine",
        level: AlertLevel.WARNING,
        message: `Gangguan Ginjal Ringan (CrCl: ${crCl.toFixed(1)} ml/min)`,
        details: "CrCl antara 30 dan 60 ml/min. Dosis standar obat yang sangat nefrotoksik mungkin memerlukan pengurangan dosis atau perpanjangan interval dosis.",
      });
      if (selectedPreset?.requiresRenalAdjustment) {
        renalAdjustmentApplied = true;
        renalDoseReductionPercent = 25; // 25% reduction
      }
    } else {
      alerts.push({
        id: "renal_normal",
        field: "creatinine",
        level: AlertLevel.INFO,
        message: `Fungsi Ginjal Normal (CrCl: ${crCl.toFixed(1)} ml/min)`,
        details: "Bersihan Cockcroft-Gault menunjukkan eliminasi yang memadai untuk dosis dewasa standar.",
      });
    }
  } else if (selectedPreset?.requiresRenalAdjustment && numSerumCreatinine === 0) {
    alerts.push({
      id: "renal_inputs_missing",
      field: "creatinine",
      level: AlertLevel.WARNING,
      message: "Data Fungsi Ginjal Disarankan",
      details: "Obat ini bersifat nefrotoksik atau dieliminasi lewat ginjal. Memasukkan Kreatinin Serum, Usia, dan Berat Badan sangat disarankan untuk menilai GFR.",
    });
  }

  // 3. DOSAGE CALCULATION ENGINE
  let rawSingleDose = 0;
  let doseFormula = "";

  if (calcMethod === "mg_per_kg") {
    rawSingleDose = numTargetDose * numWeight;
    doseFormula = `${numTargetDose} ${doseUnit}/kg × ${numWeight} kg = ${rawSingleDose.toFixed(2)} ${doseUnit}`;
  } else if (calcMethod === "mg_per_m2") {
    rawSingleDose = numTargetDose * bsa;
    doseFormula = `${numTargetDose} ${doseUnit}/m² × ${bsa.toFixed(2)} m² = ${rawSingleDose.toFixed(2)} ${doseUnit}`;
  } else {
    // flat
    rawSingleDose = numTargetDose;
    doseFormula = `Dosis tetap = ${numTargetDose} ${doseUnit}`;
  }

  // Apply renal adjustments if active
  let finalSingleDose = rawSingleDose;
  if (renalAdjustmentApplied) {
    const factor = (100 - renalDoseReductionPercent) / 100;
    finalSingleDose = rawSingleDose * factor;
    doseFormula += `\n[Penyesuaian ginjal: pengurangan ${renalDoseReductionPercent}% diterapkan (× ${factor}) = ${finalSingleDose.toFixed(2)} ${doseUnit}]`;
  }

  // 4. CAPS, CEILINGS, AND POST-CALC VALIDATIONS
  const totalAgeYears = numAgeYears + numAgeMonths / 12;

  // Maximum single dose check
  if (selectedPreset?.singleDoseLimitMax) {
    const limit = selectedPreset.singleDoseLimitMax;
    if (finalSingleDose > limit) {
      alerts.push({
        id: "dose_single_exceed",
        field: "dose",
        level: AlertLevel.CRITICAL,
        message: "Dosis Tunggal Maksimum Terlampaui",
        details: `Dosis terhitung (${finalSingleDose.toFixed(1)} ${doseUnit}) melebihi batas dosis klinis absolut sebesar ${limit} ${doseUnit}. Dosis harus dibatasi pada ${limit} ${doseUnit}.`,
      });
    }
  }

  // Pediatric Ceiling Dose check
  if (totalAgeYears < 18 && selectedPreset?.pediatricCeilingDose) {
    const pLimit = selectedPreset.pediatricCeilingDose;
    if (finalSingleDose > pLimit) {
      alerts.push({
        id: "dose_pediatric_ceiling_exceed",
        field: "dose",
        level: AlertLevel.CRITICAL,
        message: "Batas Dosis Anak Terlampaui",
        details: `Dosis anak terhitung (${finalSingleDose.toFixed(1)} ${doseUnit}) melebihi batas dosis anak sebesar ${pLimit} ${doseUnit}. Batasi dosis pada ${pLimit} ${doseUnit} (setara dewasa).`,
      });
    }
  }

  // Frequency and Daily Dose calculation
  let timesPerDay = 1;
  if (frequency === "q12h") timesPerDay = 2;
  else if (frequency === "q8h") timesPerDay = 3;
  else if (frequency === "q6h") timesPerDay = 4;
  else if (frequency === "q4h") timesPerDay = 6;
  else if (frequency === "once") timesPerDay = 1;

  const finalDailyDose = finalSingleDose * timesPerDay;

  // Daily dose limits check
  if (selectedPreset?.dailyDoseLimitMax) {
    const dailyLimit = selectedPreset.dailyDoseLimitMax;
    if (finalDailyDose > dailyLimit) {
      alerts.push({
        id: "dose_daily_exceed",
        field: "dose",
        level: AlertLevel.CRITICAL,
        message: "Dosis Harian Maksimum Terlampaui",
        details: `Dosis kumulatif 24 jam terhitung (${finalDailyDose.toFixed(1)} ${doseUnit}) melebihi batas aman yang direkomendasikan sebesar ${dailyLimit} ${doseUnit}/hari. Sesuaikan dosis tunggal atau interval pemberian.`,
      });
    }
  }

  // 5. LIQUID VOLUME CALCULATION
  let liquidVolumeMl: number | undefined;
  let liquidVolumeFormula: string | undefined;

  const numLiquidConcValue = typeof liquidConcentrationValue === "number" ? liquidConcentrationValue : 0;
  const numLiquidConcVolume = typeof liquidConcentrationVolume === "number" ? liquidConcentrationVolume : 0;

  if (numLiquidConcValue > 0 && numLiquidConcVolume > 0 && finalSingleDose > 0) {
    liquidVolumeMl = (finalSingleDose * numLiquidConcVolume) / numLiquidConcValue;
    liquidVolumeFormula = `(${finalSingleDose.toFixed(1)} ${doseUnit} ÷ ${numLiquidConcValue} ${doseUnit}) × ${numLiquidConcVolume} mL = ${liquidVolumeMl.toFixed(2)} mL per dosis`;
    
    if (liquidVolumeMl > 50) {
      alerts.push({
        id: "liquid_volume_warning",
        field: "dose",
        level: AlertLevel.WARNING,
        message: "Volume Cairan Oral Besar",
        details: `Volume dosis cairan oral tunggal terhitung adalah ${liquidVolumeMl.toFixed(1)} mL. Memberikan volume ini sebagai dosis oral tunggal mungkin tidak praktis atau tidak aman. Verifikasi konsentrasi dan rute formulasi.`,
      });
    }
  }

  return {
    singleDose: finalSingleDose,
    dailyDose: finalDailyDose,
    doseFormula,
    liquidVolumeMl,
    liquidVolumeFormula,
    renalAdjustmentApplied,
    renalDoseReductionPercent: renalAdjustmentApplied ? renalDoseReductionPercent : undefined,
    alerts,
  };
}
