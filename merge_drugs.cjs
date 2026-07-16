const fs = require('fs');
const file = 'src/presets.ts';
let content = fs.readFileSync(file, 'utf8');

// We will find the array of 22 items and replace it with 19 items.
const replaceBlock = `  },
  {
    id: "aricept_evess_10",
    name: "Aricept Evess (Donepezil)",
    indication: "Demensia pada penyakit Alzheimer ringan, sedang, hingga berat",
    calcMethod: "flat",
    defaultDoseValue: 10,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 10,
    dailyDoseLimitMax: 10,
    notes: "Sediaan: 10 mg Tablet ODT. Dosis awal biasanya 5 mg/hari, dapat ditingkatkan menjadi 10 mg/hari setelah 4-6 minggu. Tablet Orally Disintegrating (ODT) harus diletakkan di lidah dan dibiarkan larut, kemudian ditelan dengan atau tanpa air."
  },
  {
    id: "arixtra_2_5",
    name: "Arixtra (Fondaparinux)",
    indication: "Profilaksis Tromboemboli Vena (VTE) dan pengobatan trombosis vena superfisial akut",
    calcMethod: "flat",
    defaultDoseValue: 2.5,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 2.5,
    dailyDoseLimitMax: 2.5,
    requiresRenalAdjustment: true,
    notes: "Sediaan: Injeksi 2.5 mg/0.5 mL. Diberikan secara injeksi subkutan. Kontraindikasi pada gangguan ginjal berat (CrCl < 20-30 mL/min tergantung indikasi)."
  },
  {
    id: "asam_askorbat_50",
    name: "Asam Askorbat (Vitamin C)",
    indication: "Pencegahan dan pengobatan defisiensi Vitamin C, suplemen antioksidan",
    calcMethod: "flat",
    defaultDoseValue: 50,
    doseUnit: "mg",
    frequency: "once",
    dailyDoseLimitMax: 1000,
    notes: "Sediaan: 50 mg Tablet. Dosis untuk anak-anak atau dewasa bervariasi tergantung kebutuhan suplementasi harian. Dosis tinggi dapat memicu batu ginjal kalsium oksalat."
  },
  {
    id: "asam_folat",
    name: "Asam Folat",
    indication: "Pencegahan defek tabung saraf, pengobatan anemia megaloblastik",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 5,
    dailyDoseLimitMax: 15,
    notes: "Sediaan: 0.4 mg dan 1 mg Tablet. Dosis 0.4 mg umumnya untuk ibu hamil risiko rendah. Dosis 1-5 mg untuk kondisi defisiensi berat atau risiko tinggi."
  },
  {
    id: "asam_salisilat_powder",
    name: "Asam Salisilat",
    indication: "Bahan peracikan untuk keratolitik topikal (kutil, kapalan, psoriasis)",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "g",
    frequency: "once",
    notes: "Sediaan: Powder. Penggunaan hanya untuk rute topikal/luar. Konsentrasi disesuaikan dengan indikasi (biasanya 2-10% untuk acne/keratosis, hingga 40% untuk kutil)."
  },
  {
    id: "asam_traneksamat",
    name: "Asam Traneksamat",
    indication: "Perdarahan abnormal, menoragia, fibrinolisis lokal atau sistemik",
    calcMethod: "flat",
    defaultDoseValue: 500,
    doseUnit: "mg",
    frequency: "q8h",
    singleDoseLimitMax: 1500,
    dailyDoseLimitMax: 4000,
    requiresRenalAdjustment: true,
    notes: "Sediaan: 500 mg Tablet, Injeksi 500 mg/5 mL. Dosis oral umumnya 1000-1500 mg per dosis. Dosis injeksi IV lambat 10-15 mg/kgBB. Kurangi dosis pada gangguan ginjal."
  },
  {
    id: "ascardia_80",
    name: "Ascardia (Asetilsalisilat)",
    indication: "Antiplatelet, profilaksis infark miokard dan stroke iskemik",
    calcMethod: "flat",
    defaultDoseValue: 80,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 320,
    dailyDoseLimitMax: 320,
    notes: "Sediaan: 80 mg Tablet. Tablet enteric coated (selaput enterik) tidak boleh dihancurkan atau dikunyah, harus ditelan utuh agar larut di usus."
  },
  {
    id: "asering_500",
    name: "Asering",
    indication: "Terapi cairan intravena, pengganti elektrolit, dehidrasi isotonik",
    calcMethod: "flat",
    defaultDoseValue: 500,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Infus 500 mL. Kecepatan dan volume tetesan disesuaikan dengan kondisi hemodinamik dan defisit cairan pasien."
  },
  {
    id: "aspar_k_300",
    name: "Aspar-K (Kalium Aspartat)",
    indication: "Suplemen kalium untuk hipokalemia",
    calcMethod: "flat",
    defaultDoseValue: 300,
    doseUnit: "mg",
    frequency: "q8h",
    notes: "Sediaan: 300 mg Tablet. Pantau kadar kalium serum pasien, terutama pada pasien dengan gangguan ginjal untuk menghindari hiperkalemia."
  },
  {
    id: "aspilets_80",
    name: "Aspilets (Asetilsalisilat)",
    indication: "Antiplatelet, pencegahan agregasi trombosit, nyeri ringan pada anak (dengan pengawasan)",
    calcMethod: "flat",
    defaultDoseValue: 80,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 160,
    notes: "Sediaan: 80 mg Tablet Kunyah. Hati-hati penggunaan aspirin pada anak-anak penderita demam virus karena risiko Sindrom Reye."
  },
  {
    id: "astrazeneca_covid_vac",
    name: "AstraZeneca COVID-19 Vaccine",
    indication: "Imunisasi aktif untuk mencegah penyakit COVID-19",
    calcMethod: "flat",
    defaultDoseValue: 0.5,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Injeksi. Satu vial multi-dosis berisi 10 dosis. Setiap dosis adalah 0.5 mL diberikan secara intramuskular."
  },
  {
    id: "atapulgit_600",
    name: "Atapulgit",
    indication: "Pengobatan simtomatik diare non-spesifik",
    calcMethod: "flat",
    defaultDoseValue: 1200,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 1200,
    dailyDoseLimitMax: 8400,
    notes: "Sediaan: 600 mg Tablet. Dosis awal 1200 mg (2 tablet) setelah buang air besar pertama, dilanjutkan 600 mg (1 tablet) tiap selesai buang air besar. Maksimal 14 tablet per hari (dewasa)."
  },
  {
    id: "atorvastatin_10",
    name: "Atorvastatin",
    indication: "Hiperkolesterolemia primer, pencegahan penyakit kardiovaskular",
    calcMethod: "flat",
    defaultDoseValue: 10,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 80,
    dailyDoseLimitMax: 80,
    notes: "Sediaan: 10 mg Tablet. Dapat diminum kapan saja (pagi atau malam). Kontraindikasi mutlak pada ibu hamil dan menyusui."
  },
  {
    id: "atracurium_25",
    name: "Atracurium Besylate",
    indication: "Pelemas otot rangka (muscle relaxant) selama operasi atau ventilasi mekanik",
    calcMethod: "mg_per_kg",
    defaultDoseValue: 0.5,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 50,
    notes: "Sediaan: Injeksi 25 mg/2.5 mL. Dosis intubasi awal: 0.3 - 0.6 mg/kg secara IV. Pemeliharaan 0.1 - 0.2 mg/kg. Metabolisme melalui degradasi Hofmann (independen dari ginjal/hati)."
  },
  {
    id: "atropin_sulfat_0_25",
    name: "Atropin Sulfat",
    indication: "Premedikasi anestesi, bradikardia simtomatik, keracunan organofosfat",
    calcMethod: "flat",
    defaultDoseValue: 0.5,
    doseUnit: "mg",
    frequency: "once",
    singleDoseLimitMax: 3,
    dailyDoseLimitMax: 3,
    notes: "Sediaan: Injeksi 0.25 mg/mL. Dosis bradikardia dewasa: 0.5 mg tiap 3-5 menit (maks 3 mg total). Dosis keracunan organofosfat bisa sangat tinggi (2-4 mg berulang)."
  },
  {
    id: "avamys_nasal",
    name: "Avamys (Fluticasone Furoate)",
    indication: "Rinitis alergi musiman atau tahunan",
    calcMethod: "flat",
    defaultDoseValue: 55,
    doseUnit: "mcg",
    frequency: "once",
    singleDoseLimitMax: 110,
    dailyDoseLimitMax: 110,
    notes: "Sediaan: Nasal Spray. Dosis awal dewasa dan anak >12th: 2 semprotan per lubang hidung sekali sehari (total 110 mcg/hari). Anak 2-11th: 1 semprotan per lubang hidung sekali sehari (55 mcg/hari)."
  },
  {
    id: "avigan_200",
    name: "Avigan (Favipiravir)",
    indication: "Infeksi virus influenza tipe baru atau re-emerging",
    calcMethod: "flat",
    defaultDoseValue: 1600,
    doseUnit: "mg",
    frequency: "q12h",
    singleDoseLimitMax: 1600,
    dailyDoseLimitMax: 3200,
    notes: "Sediaan: 200 mg Tablet. Dosis muatan (Hari 1): 1600 mg dua kali sehari. Dosis pemeliharaan (Hari 2-5): 600 mg dua kali sehari. Kontraindikasi ketat untuk wanita hamil (teratogenik kuat)."
  },
  {
    id: "azithromycin",
    name: "Azithromycin",
    indication: "Infeksi saluran pernapasan, otitis media, infeksi kulit, PMS (Klamidia)",
    calcMethod: "mg_per_kg",
    defaultDoseValue: 10,
    doseUnit: "mg",
    frequency: "once",
    liquidConcentrationValue: 200,
    liquidConcentrationVolume: 5,
    singleDoseLimitMax: 1000,
    dailyDoseLimitMax: 1000,
    pediatricCeilingDose: 500,
    notes: "Sediaan: 500 mg Tablet, Sirup 200 mg/5 mL, Injeksi 0.5 g. Dosis lazim dewasa: 500 mg hari-1, dilanjut 250 mg hari 2-5. Dosis anak: 10 mg/kgBB hari-1, dilanjut 5 mg/kgBB hari 2-5. Diminum 1 jam sebelum atau 2 jam sesudah makan."
  }
];`;

const index = content.indexOf('  },\n  {\n    id: "aricept_evess_10",');
if (index !== -1) {
  content = content.substring(0, index) + replaceBlock + '\n\nexport const DRUG_PRESETS' + content.split('export const DRUG_PRESETS')[1];
  fs.writeFileSync(file, content);
  console.log("Success");
} else {
  console.log("Could not find start index");
}
