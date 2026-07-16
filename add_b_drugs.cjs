const fs = require('fs');
const file = 'src/presets.ts';
let content = fs.readFileSync(file, 'utf8');

const newDrugs = [
  {
    id: "bactesyn_powder",
    name: "Bactesyn (Sulbactam/Ampicillin)",
    indication: "Infeksi bakteri (saluran napas, kulit, saluran kemih)",
    calcMethod: "flat",
    defaultDoseValue: 1500,
    doseUnit: "mg",
    frequency: "q8h",
    notes: "Sediaan: Powder for Injection (Serbuk Injeksi)."
  },
  {
    id: "bamgetol",
    name: "Bamgetol (Carbamazepine)",
    indication: "Epilepsi, neuralgia trigeminal",
    calcMethod: "flat",
    defaultDoseValue: 200,
    doseUnit: "mg",
    frequency: "q12h",
    notes: "Sediaan: Tablet."
  },
  {
    id: "baquinor_forte",
    name: "Baquinor Forte (Ciprofloxacin)",
    indication: "Infeksi bakteri gram negatif, infeksi saluran kemih",
    calcMethod: "flat",
    defaultDoseValue: 500,
    doseUnit: "mg",
    frequency: "q12h",
    notes: "Sediaan: 500 mg Tablet Film Coated."
  },
  {
    id: "becom_c",
    name: "Becom-C",
    indication: "Suplemen Vitamin B kompleks dan Vitamin C",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Tablet Film Coated (mengandung Vitamin B kompleks dan Vitamin C 500 mg)."
  },
  {
    id: "becom_zet",
    name: "Becom-Zet",
    indication: "Suplemen multivitamin dan zinc",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Tablet (750 mg Vit C, 400 mcg Asam Folat, Zinc). Termasuk stok program HIBAH."
  },
  {
    id: "bedak_salisil",
    name: "Bedak Salisil (Asam Salisilat)",
    indication: "Gatal-gatal karena biang keringat atau iritasi kulit ringan",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Powder 2% (50 gram). Hanya untuk pemakaian luar/topikal."
  },
  {
    id: "bedaquiline",
    name: "Bedaquiline",
    indication: "Tuberkulosis Resisten Obat (TB RO)",
    calcMethod: "flat",
    defaultDoseValue: 400,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: 20 mg dan 100 mg Tablet (Stok program HIBAH TB RO). Dosis dewasa biasanya 400 mg sekali sehari selama 2 minggu, dilanjutkan 200 mg 3x seminggu."
  },
  {
    id: "benzatin_benzil_penicillin",
    name: "Benzatin Benzil Penicillin",
    indication: "Sifilis, demam reumatik, infeksi streptokokus",
    calcMethod: "flat",
    defaultDoseValue: 1200000,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Powder for Injection 1.200.000 IU. Diberikan secara injeksi intramuskular dalam."
  },
  {
    id: "beraprost_sodium",
    name: "Beraprost Sodium",
    indication: "Hipertensi pulmonal, perbaikan ulkus dan iskemia pada penyakit arteri perifer",
    calcMethod: "flat",
    defaultDoseValue: 20,
    doseUnit: "mcg",
    frequency: "q8h",
    notes: "Sediaan: 20 mcg Tablet Coated (perbaikan master data dari 20 MG menjadi 20 MCG)."
  },
  {
    id: "berotec_inhaler",
    name: "Berotec (Fenoterol)",
    indication: "Pereda bronkospasme akut pada asma",
    calcMethod: "flat",
    defaultDoseValue: 100,
    doseUnit: "mcg",
    frequency: "once",
    notes: "Sediaan: Aerosol Metered Inhaler (100 mcg/semprot, 200 semprot). Dosis untuk serangan akut biasanya 1-2 semprotan."
  },
  {
    id: "betadine",
    name: "Betadine (Povidone-Iodine)",
    indication: "Antiseptik untuk luka, operasi, atau kebersihan mulut",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Solution 10% (30 mL, 1 L), Gargle/Obat Kumur 1% (100 mL, 190 mL), dan Salep. Penggunaan disesuaikan dengan jenis sediaan (topikal atau kumur)."
  },
  {
    id: "betahistin",
    name: "Betahistin",
    indication: "Penyakit Meniere, vertigo",
    calcMethod: "flat",
    defaultDoseValue: 24,
    doseUnit: "mg",
    frequency: "q12h",
    notes: "Sediaan: 6 mg dan 24 mg Tablet."
  },
  {
    id: "betametason",
    name: "Betametason",
    indication: "Dermatitis, inflamasi kulit, alergi (topikal)",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Krim 0.1% dan 0.05% (5 gram). Oleskan tipis pada area yang sakit."
  },
  {
    id: "beta_one",
    name: "Beta-One (Bisoprolol)",
    indication: "Hipertensi, angina, gagal jantung",
    calcMethod: "flat",
    defaultDoseValue: 2.5,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: 2.5 mg Tablet."
  },
  {
    id: "betaserc",
    name: "Betaserc (Betahistin)",
    indication: "Penyakit Meniere, vertigo perifer",
    calcMethod: "flat",
    defaultDoseValue: 24,
    doseUnit: "mg",
    frequency: "q12h",
    notes: "Sediaan: 24 mg Tablet."
  },
  {
    id: "bfluid",
    name: "Bfluid",
    indication: "Terapi nutrisi parenteral (asam amino, elektrolit, vitamin)",
    calcMethod: "flat",
    defaultDoseValue: 500,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Infus 500 mL. Kecepatan infus disesuaikan dengan kebutuhan cairan dan toleransi pasien."
  },
  {
    id: "bio_atp",
    name: "Bio ATP",
    indication: "Keletihan otot, asthenia, suplemen energi",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Tablet (mengandung ATP, Vitamin B). Termasuk stok program HIBAH."
  },
  {
    id: "bioquinone",
    name: "Bioquinone",
    indication: "Suplemen Koenzim Q10",
    calcMethod: "flat",
    defaultDoseValue: 100,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: Kapsul Soft Gelatin (100 mg / 100 IU)."
  },
  {
    id: "biothicol",
    name: "Biothicol (Thiamphenicol)",
    indication: "Infeksi salmonella, tifus, infeksi saluran napas",
    calcMethod: "mg_per_kg",
    defaultDoseValue: 50,
    doseUnit: "mg",
    frequency: "q6h",
    liquidConcentrationValue: 125,
    liquidConcentrationVolume: 5,
    notes: "Sediaan: Kapsul 500 mg, Sirup 125 mg/5 mL (60 mL), Sirup Forte 250 mg/5 mL (60 mL). Dosis anak lazim 50 mg/kgBB/hari dibagi dalam 3-4 dosis."
  },
  {
    id: "bisakodil",
    name: "Bisakodil",
    indication: "Konstipasi, persiapan pembersihan usus sebelum prosedur",
    calcMethod: "flat",
    defaultDoseValue: 5,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: 5 mg Tablet, 5 mg dan 10 mg Suppositoria (Bisacodyl)."
  },
  {
    id: "bisoprolol",
    name: "Bisoprolol",
    indication: "Hipertensi, gagal jantung kronik, angina pectoris",
    calcMethod: "flat",
    defaultDoseValue: 5,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: 2.5 mg dan 5 mg Tablet."
  },
  {
    id: "blephasep",
    name: "Blephasep",
    indication: "Blefaritis, inflamasi dan infeksi pada kelopak mata",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q12h",
    notes: "Sediaan: Gel mata 40 gram. Oleskan tipis pada kelopak mata."
  },
  {
    id: "borax_glycerin",
    name: "Borax Glycerin (GOM)",
    indication: "Sariawan, antiseptik rongga mulut",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "once",
    notes: "Sediaan: Solution 10% (GOM). Dioleskan pada area sariawan secukupnya."
  },
  {
    id: "borraginol_n",
    name: "Borraginol-N",
    indication: "Wasir/hemoroid internal dan eksternal tanpa peradangan berat",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q12h",
    notes: "Sediaan: Suppositoria. Masukkan ke dalam dubur."
  },
  {
    id: "borraginol_s",
    name: "Borraginol-S",
    indication: "Wasir disertai nyeri, pendarahan, dan peradangan (mengandung steroid)",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q12h",
    notes: "Sediaan: Suppositoria. Mengandung tambahan anti-inflamasi/steroid."
  },
  {
    id: "bralifex",
    name: "Bralifex (Tobramycin)",
    indication: "Infeksi bakteri pada mata",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q6h",
    notes: "Sediaan: Tetes Mata (Eye Drop) 3 mg/mL (5 mL). Teteskan pada mata yang terinfeksi."
  },
  {
    id: "braxidin",
    name: "Braxidin",
    indication: "Gangguan psikosomatik, ansietas penyerta gangguan GI",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q8h",
    notes: "Sediaan: Tablet (Chlordiazepoxide 5 mg + Clidinium 2.5 mg)."
  },
  {
    id: "bronsolvan",
    name: "Bronsolvan (Theophylline)",
    indication: "Asma bronkial, bronkospasme pada PPOK",
    calcMethod: "flat",
    defaultDoseValue: 150,
    doseUnit: "mg",
    frequency: "q8h",
    notes: "Sediaan: 150 mg Tablet."
  },
  {
    id: "bucain",
    name: "Bucain (Bupivacaine)",
    indication: "Anestesi lokal/regional, blok saraf",
    calcMethod: "flat",
    defaultDoseValue: 5,
    doseUnit: "mg",
    frequency: "once",
    notes: "Sediaan: Injeksi 0.5% (5 mg/mL)."
  },
  {
    id: "budesonide",
    name: "Budesonide",
    indication: "Asma persisten, croup, antiinflamasi saluran napas",
    calcMethod: "flat",
    defaultDoseValue: 0.5,
    doseUnit: "mg",
    frequency: "q12h",
    notes: "Sediaan: Solution for Inhalation (Nebulizer) 0.25 mg/mL dan 0.5 mg/mL (2 mL). Digunakan melalui mesin nebulizer."
  },
  {
    id: "bufacetin",
    name: "Bufacetin (Chloramphenicol)",
    indication: "Infeksi kulit bakteri topikal",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q8h",
    notes: "Sediaan: Salep (Ointment) 2% (15 gram)."
  },
  {
    id: "bufect",
    name: "Bufect (Ibuprofen)",
    indication: "Nyeri ringan-sedang, demam",
    calcMethod: "mg_per_kg",
    defaultDoseValue: 10,
    doseUnit: "mg",
    frequency: "q8h",
    liquidConcentrationValue: 100,
    liquidConcentrationVolume: 5,
    notes: "Sediaan: Sirup 100 mg/5 mL (60 mL). Dosis lazim anak: 5-10 mg/kgBB per kali pemberian."
  },
  {
    id: "burnazin",
    name: "Burnazin (Silver Sulfadiazine)",
    indication: "Pencegahan dan pengobatan infeksi pada luka bakar",
    calcMethod: "flat",
    defaultDoseValue: 1,
    doseUnit: "units",
    frequency: "q12h",
    notes: "Sediaan: Krim 1% (35 gram). Oleskan pada area luka bakar."
  },
  {
    id: "buscopan",
    name: "Buscopan (Hyoscine Butylbromide)",
    indication: "Spasme saluran cerna, kolik empedu/ginjal",
    calcMethod: "flat",
    defaultDoseValue: 10,
    doseUnit: "mg",
    frequency: "q8h",
    notes: "Sediaan: 10 mg Tablet."
  }
];

const newDrugsString = newDrugs.map(d => JSON.stringify(d, null, 4)).join(',\n') + '\n];\n\nexport const DRUG_PRESETS';

content = content.replace(/\n\];\n\nexport const DRUG_PRESETS/, ',\n' + newDrugsString);

// Fix object stringification to match TS formatting (remove quotes around keys)
content = content.replace(/"([a-zA-Z0-9_]+)":/g, '$1:');

fs.writeFileSync(file, content);
console.log("Successfully added new B drugs");
