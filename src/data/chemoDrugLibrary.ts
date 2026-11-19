import type { ChemoDrugComponent, ChemoRegimen, ChemoTherapyGoal } from "./chemoRegimensData";

export type ChemoCancerCategory =
  | "limfoma"
  | "leukemia"
  | "mieloma"
  | "payudara"
  | "kolorektal"
  | "paru"
  | "urogenital"
  | "ginekologi"
  | "sarkoma_pediatri"
  | "lainnya";

export const CHEMO_CATEGORY_LABELS: Record<ChemoCancerCategory, string> = {
  limfoma: "Limfoma (HL & NHL)",
  leukemia: "Leukemia & MDS",
  mieloma: "Mieloma & Amiloidosis",
  payudara: "Kanker Payudara",
  kolorektal: "Saluran Cerna & Kolorektal",
  paru: "Kanker Paru & Toraks",
  urogenital: "Testis & Urologi",
  ginekologi: "Ginekologi & Ovarium",
  sarkoma_pediatri: "Sarkoma, Otak & Pediatri",
  lainnya: "Onkologi Lainnya",
};

interface DrugProfile {
  drugId: string;
  drugName: string;
  genericAlias: string;
  role: string;
  defaultRoute: string;
  diluentStandard: string;
  diluentForbidden?: string;
  vesicantStatus: "Vesikant (Nekrosis Jaringan)" | "Iritan" | "Non-Vesikant";
  specialPrecautions: string;
  toxicity: {
    organ: string;
    manifestation: string;
    preventionStrategy: string;
  };
}

export const ONCOLOGY_DRUG_CATALOG: Record<string, DrugProfile> = {
  cytarabine: {
    drugId: "Cytarabine",
    drugName: "Cytarabine (Ara-C / Sitarabin)",
    genericAlias: "Sitarabin",
    role: "Antimetabolit Analog Pirimidin",
    defaultRoute: "IV infus kontinu 24 jam atau infus 1-3 jam sesuai protokol",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Dosis tinggi berisiko toksisitas serebelar (ataksia, nistagmus) dan konjungtivitis kimia; wajib tetes mata kortikosteroid pada Ara-C dosis tinggi dan evaluasi fungsi ginjal.",
    toxicity: {
      organ: "Sumsum Tulang & Serebelum",
      manifestation: "Pansitopenia berat berkepanjangan, ataksia serebelar (dosis tinggi), konjungtivitis.",
      preventionStrategy: "Pemeriksaan neurologis harian, tetes mata steroid profilaksis pada dosis tinggi, dukungan transfusi.",
    },
  },
  daunorubicin: {
    drugId: "Daunorubicin",
    drugName: "Daunorubicin HCl",
    genericAlias: "Daunorubisin",
    role: "Antibiotik Antrasiklin / Inhibitor Topoisomerase II",
    defaultRoute: "IV infus 15-30 menit melalui jalur vena sentral/bebas hambatan",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Batas kumulatif seumur hidup 450-550 mg/m². Pantau LVEF dan risiko ekstravasasi berat (kompres dingin + Dexrazoxane bila ekstravasasi). Urin berwarna kemerahan 1-2 hari.",
    toxicity: {
      organ: "Jantung (Kardiotoksisitas)",
      manifestation: "Penurunan LVEF, kardiomiopati dilatasi, gagal jantung kongestif.",
      preventionStrategy: "Ekokardiografi dasar & berkala, jaga dosis kumulatif <450-550 mg/m².",
    },
  },
  idarubicin: {
    drugId: "Idarubicin",
    drugName: "Idarubicin HCl",
    genericAlias: "Idarubisin",
    role: "Antibiotik Antrasiklin Lipofilik",
    defaultRoute: "IV infus lambat 10-15 menit via jalur saline mengalir lancar",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Batas kumulatif seumur hidup ±150 mg/m². Risiko mielosupresi dalam dan ekstravasasi nekrotik; hindari pencampuran dengan Heparin (presipitasi).",
    toxicity: {
      organ: "Jantung & Sumsum Tulang",
      manifestation: "Kardiomiopati antrasiklin, aplasia sumsum tulang dan mukositis oral.",
      preventionStrategy: "Evaluasi LVEF sebelum terapi, pembatasan kumulatif <150 mg/m², profilaksis infeksi neutropenia.",
    },
  },
  doxorubicin: {
    drugId: "Doxorubicin",
    drugName: "Doxorubicin HCl (Adriamycin)",
    genericAlias: "Doksorubisin",
    role: "Antibiotik Antrasiklin / Interkalator DNA",
    defaultRoute: "IV push pelan 3-5 menit atau infus 15-30 menit via akses paten",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Batas dosis kumulatif seumur hidup 450-500 mg/m². Jangan campur dengan Heparin/5-FU. Bila ekstravasasi: kompres dingin kering & pertimbangkan Dexrazoxane.",
    toxicity: {
      organ: "Jantung (Kardiomiopati)",
      manifestation: "Penurunan fraksi ejeksi (LVEF), aritmia, gagal jantung kongestif.",
      preventionStrategy: "Pantau ekokardiografi berkala, patuhi batas kumulatif <450 mg/m².",
    },
  },
  pld: {
    drugId: "Doxorubicin Liposomal",
    drugName: "Pegylated Liposomal Doxorubicin (PLD)",
    genericAlias: "Doksorubisin Liposomal Pegilasi",
    role: "Antrasiklin Formulasi Liposomal Pegilasi",
    defaultRoute: "IV infus lambat (mulai 1 mg/menit lalu tingkatkan bila bebas reaksi infus)",
    diluentStandard: "Dextrose 5% (D5W) 250 mL",
    diluentForbidden: "DILARANG menggunakan NaCl 0.9% atau filter in-line!",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Risiko reaksi infus akut (flushing, dispnea, nyeri punggung) dan Hand-Foot Syndrome (PPE). Gunakan D5W murni tanpa filter in-line.",
    toxicity: {
      organ: "Kulit (Hand-Foot Syndrome)",
      manifestation: "Eritema palmar-plantar, pengelupasan nyeri telapak tangan/kaki, reaksi infus.",
      preventionStrategy: "Infus lambat, edukasi hindari gesekan/panas pada ekstremitas, emolien topikal.",
    },
  },
  epirubicin: {
    drugId: "Epirubicin",
    drugName: "Epirubicin HCl",
    genericAlias: "Epirubisin",
    role: "Antibiotik Antrasiklin (Epimer Doksorubisin)",
    defaultRoute: "IV push pelan 3-5 menit atau infus 15-20 menit via aliran saline lancar",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Batas dosis kumulatif seumur hidup 900 mg/m². Pantau fungsi jantung (LVEF) dan ekstravasasi; urin dapat kemerahan 1-2 hari.",
    toxicity: {
      organ: "Jantung (Kardiotoksisitas)",
      manifestation: "Penurunan LVEF, gagal jantung kongestif, mielosupresi.",
      preventionStrategy: "Monitoring LVEF berkala, batasi dosis kumulatif total <900 mg/m².",
    },
  },
  mitoxantrone: {
    drugId: "Mitoxantrone",
    drugName: "Mitoxantrone (Novantrone)",
    genericAlias: "Mitoksantron",
    role: "Antrasenedion / Inhibitor Topoisomerase II",
    defaultRoute: "IV infus 15-30 menit dalam 50-100 mL pelarut",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50-100 mL",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Batas kumulatif seumur hidup 140 mg/m². Dapat mewarnai urin dan sklera biru-kehijauan sementara selama 24-48 jam.",
    toxicity: {
      organ: "Jantung & Sumsum Tulang",
      manifestation: "Kardiotoksisitas kumulatif, neutropenia berat, perubahan warna urin biru-hijau.",
      preventionStrategy: "Ekokardiografi berkala, batasi dosis kumulatif <140 mg/m².",
    },
  },
  bleomycin: {
    drugId: "Bleomycin Sulfat",
    drugName: "Bleomycin Sulfat",
    genericAlias: "Bleomisin",
    role: "Antibiotik Glikopeptida Pemutus Rantai DNA",
    defaultRoute: "IV push perlahan ≥10 menit atau infus 15-30 menit",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Batas kumulatif seumur hidup 400 unit! Risiko fibrosis paru ireversibel meningkat tajam pada lansia, gangguan ginjal, dan paparan oksigen fraksi tinggi (FiO2 >30%).",
    toxicity: {
      organ: "Paru-paru (Fibrosis Paru)",
      manifestation: "Batuk kering progresif, sesak napas, ronkhi basal, penurunan DLCO.",
      preventionStrategy: "Batasi kumulatif <400 unit, tes fungsi paru berkala, hindari FiO2 tinggi saat anestesi.",
    },
  },
  cyclophosphamide: {
    drugId: "Cyclophosphamid",
    drugName: "Cyclophosphamide (Endoxan)",
    genericAlias: "Siklofosfamid",
    role: "Alkylating Agent (Oxazaphosphorine)",
    defaultRoute: "IV infus 30-60 menit (atau oral pada protokol tertentu)",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Metabolit akrolein memicu sistitis hemoragik; wajib hidrasi 2-3 L/hari dan berkemih sering. Pada dosis tinggi (>1000 mg/m²) tambahkan uroprotektor Mesna.",
    toxicity: {
      organ: "Kandung Kemih (Sistitis Hemoragik)",
      manifestation: "Disuria, hematuria mikro/makroskopis, SIADH pada dosis tinggi.",
      preventionStrategy: "Hidrasi cairan agresif, kosongkan kandung kemih tiap 2-3 jam, Mesna pada dosis tinggi.",
    },
  },
  ifosfamide: {
    drugId: "Ifosfamide",
    drugName: "Ifosfamide (Ifex)",
    genericAlias: "Ifosfamid",
    role: "Alkylating Agent (Oxazaphosphorine)",
    defaultRoute: "IV infus 1-2 jam (atau infus kontinu 24 jam) WAJIB bersama Mesna",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "WAJIB diberikan bersama Mesna (uroprotektor) dan hidrasi agresif untuk mencegah sistitis hemoragik berat. Pantau ensefalopati ifosfamid (bingung, somnolen, halusinasi -> antidot Methylene Blue).",
    toxicity: {
      organ: "Kandung Kemih & SSP",
      manifestation: "Sistitis hemoragik berat, ensefalopati akut (klorasetaldehid), tubulopati ginjal.",
      preventionStrategy: "Mesna wajib sebelum & sesudah ifosfamid, hidrasi 2-3 L/hari, pantau status mental harian.",
    },
  },
  mesna: {
    drugId: "Mesna",
    drugName: "Mesna (Uromitexan)",
    genericAlias: "Mesna",
    role: "Uroprotektor Pengikat Akrolein",
    defaultRoute: "IV bolus/infus (20% dosis ifosfamid pada jam 0, 4, 8) atau infus kontinu setara 100% dosis ifosfamid",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50-100 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Harus selalu diberikan sebelum dan setelah Ifosfamide/Siklofosfamid dosis tinggi untuk menetralisir akrolein di urin. Dapat memberi hasil positif palsu keton urin.",
    toxicity: {
      organ: "Saluran Cerna / Kulit",
      manifestation: "Rasa tidak enak di mulut, mual ringan, reaksi hipersensitivitas jarang.",
      preventionStrategy: "Pastikan kepatuhan jadwal dosis jam ke-0, 4, dan 8 (atau infus kontinu 24 jam).",
    },
  },
  vincristine: {
    drugId: "Vincristine",
    drugName: "Vincristine Sulfat (Oncovin)",
    genericAlias: "Vinkristin",
    role: "Alkaloid Vinca / Inhibitor Mikrotubulus",
    defaultRoute: "IV infus minibag 25-50 mL selama 5-10 menit (HANYA INTRAVENA!)",
    diluentStandard: "NaCl 0.9% 25-50 mL minibag (hindari spuit kecil)",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "FATAL JIKA INTRATEKAL! Wajib plafon dosis maksimal 2.0 mg per pemberian dewasa. Bila ekstravasasi: kompres HANGAT kering + Hialuronidase.",
    toxicity: {
      organ: "Sistem Saraf Perifer & Otonom",
      manifestation: "Parestesia jari, hilangnya refleks tendon, konstipasi berat / ileus paralitik.",
      preventionStrategy: "Capping dosis ketat maks 2 mg, profilaksis laksatif rutin sejak hari ke-1.",
    },
  },
  vinblastine: {
    drugId: "Vinblastin",
    drugName: "Vinblastine Sulfat",
    genericAlias: "Vinblastin",
    role: "Alkaloid Vinca / Antimitotik",
    defaultRoute: "IV minibag 25-50 mL selama 5-10 menit (HANYA INTRAVENA!)",
    diluentStandard: "NaCl 0.9% 25-50 mL minibag",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "FATAL JIKA INTRATEKAL! Plafon umum 10 mg/dosis. Bila ekstravasasi: kompres HANGAT kering + Hialuronidase. Pantau neutropenia dan konstipasi.",
    toxicity: {
      organ: "Sumsum Tulang & Saraf",
      manifestation: "Neutropenia berat, konstipasi, neuropati perifer.",
      preventionStrategy: "Cek darah lengkap sebelum siklus, edukasi laksatif profilaksis.",
    },
  },
  vinorelbine: {
    drugId: "Vinorelbine",
    drugName: "Vinorelbine Tartrat (Navelbine)",
    genericAlias: "Vinorelbin",
    role: "Alkaloid Vinca Semisintetik",
    defaultRoute: "IV infus singkat 6-10 menit via aliran saline lancar, segera bilas 75-125 mL NaCl 0.9%",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "HANYA UNTUK INTRAVENA (fatal bila intratekal). Infus singkat 6-10 menit menurunkan risiko flebitis vena; wajib bilas saline ≥100 mL sesudahnya.",
    toxicity: {
      organ: "Sumsum Tulang & Vena Perifer",
      manifestation: "Neutropenia grade 3-4, flebitis lokal, konstipasi/neuropati ringan.",
      preventionStrategy: "Infus singkat + flush salin berlimpah, pantau ANC sebelum setiap pemberian.",
    },
  },
  vindesine: {
    drugId: "Vindesine",
    drugName: "Vindesine Sulfat",
    genericAlias: "Vindesin",
    role: "Alkaloid Vinca Semisintetik",
    defaultRoute: "IV infus minibag 25-50 mL selama 5-10 menit (HANYA INTRAVENA!)",
    diluentStandard: "NaCl 0.9% 25-50 mL minibag",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "FATAL JIKA INTRATEKAL! Pantau neuropati perifer, konstipasi, dan mielosupresi. Bila ekstravasasi: kompres hangat kering + Hialuronidase.",
    toxicity: {
      organ: "Saraf Perifer & Sumsum Tulang",
      manifestation: "Parestesia, penurunan refleks tendon, leukopenia.",
      preventionStrategy: "Evaluasi neurologis pra-siklus, profilaksis laksatif, cek CBC rutin.",
    },
  },
  dacarbazine: {
    drugId: "Dacarbazine",
    drugName: "Dacarbazine (DTIC)",
    genericAlias: "Dakarbazin",
    role: "Alkylating Agent (Triazene)",
    defaultRoute: "IV infus 30-60 menit terlindung dari cahaya",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Fotosensitif tinggi (lindungi kantong & selang dari cahaya). Bersifat emetogenik tinggi (HEC) dan dapat menyebabkan nyeri/panas di sepanjang vena.",
    toxicity: {
      organ: "Saluran Cerna & Hati",
      manifestation: "Mual muntah berat (HEC), sindrom mirip flu, hepatotoksisitas/mielosupresi.",
      preventionStrategy: "Antiemetik tripel (NK1 + 5-HT3 + Deksametason), perlambat infus bila nyeri vena.",
    },
  },
  etoposide: {
    drugId: "Etoposide",
    drugName: "Etoposide (VP-16)",
    genericAlias: "Etoposida",
    role: "Inhibitor Enzim Topoisomerase II (Epipodofilotoksin)",
    defaultRoute: "IV infus lambat minimal 30-60 menit (konsentrasi akhir ≤0.4 mg/mL)",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL (konsentrasi ≤0.4 mg/mL)",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Infus terlalu cepat (<30 menit) memicu hipotensi berat dan bronkospasme! Konsentrasi >0.4 mg/mL mudah mengkristal/presipitasi di kantong infus.",
    toxicity: {
      organ: "Sumsum Tulang & Kardiovaskular",
      manifestation: "Neutropenia berat, alopesia, hipotensi akut saat infus cepat.",
      preventionStrategy: "Infus minimal 45-60 menit, jaga konsentrasi ≤0.4 mg/mL, monitor TD saat infus.",
    },
  },
  cisplatin: {
    drugId: "Cisplatin",
    drugName: "Cisplatin (Platina / CDDP)",
    genericAlias: "Sisplatin",
    role: "Agen Platinum Alkilasi DNA",
    defaultRoute: "IV infus 60-120 menit disertai pre- & post-hidrasi salin agresif",
    diluentStandard: "NaCl 0.9% 250-500 mL (WAJIB mengandung klorida)",
    diluentForbidden: "DILARANG melarutkan dalam Dextrose 5% murni tanpa NaCl atau menggunakan jarum aluminium!",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Nefrotoksik, ototoksik, dan sangat emetogenik (HEC). Wajib hidrasi NaCl 0.9% 1-2 L + suplementasi MgSO4/KCl; tunda jika CrCl <50-60 mL/min.",
    toxicity: {
      organ: "Ginjal & Koklea (Telinga Dalam)",
      manifestation: "Nekrosis tubulus ginjal akut, hipomagnesemia, tinnitus/tuli frekuensi tinggi.",
      preventionStrategy: "Pre/post-hidrasi salin + MgSO4/KCl, pantau output urin ≥100 mL/jam, cek CrCl tiap siklus.",
    },
  },
  carboplatin: {
    drugId: "Carboplatin",
    drugName: "Carboplatin (Paraplatin)",
    genericAlias: "Karboplatin",
    role: "Agen Platinum Generasi Kedua",
    defaultRoute: "IV infus 30-60 menit",
    diluentStandard: "Dextrose 5% atau NaCl 0.9% 250-500 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Gunakan Formula Calvert: Dosis = AUC × (GFR + 25) dengan plafon GFR maksimal 125 mL/min. Waspadai reaksi hipersensitivitas pada siklus ≥6.",
    toxicity: {
      organ: "Sumsum Tulang (Trombositopenia)",
      manifestation: "Trombositopenia & neutropenia (nadir hari 14-21), reaksi alergi platinum.",
      preventionStrategy: "Hitung GFR akurat (cap 125 mL/min), cek darah lengkap rutin sebelum tiap siklus.",
    },
  },
  oxaliplatin: {
    drugId: "Oxaliplatin",
    drugName: "Oxaliplatin (Eloxatin)",
    genericAlias: "Oksaliplatin",
    role: "Derivat Organoplatinum Generasi Ketiga",
    defaultRoute: "IV infus 2 jam dalam D5W (dapat 4-6 jam bila disestesia laring)",
    diluentStandard: "Dextrose 5% (D5W) 250-500 mL",
    diluentForbidden: "DILARANG KERAS menggunakan NaCl 0.9% atau larutan mengandung klorida!",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Bilas jalur dengan D5W sebelum & sesudah infus. Memicu neuropati akut terpacu dingin (disestesia faringolaringeal) — hindari makanan/minuman dingin 3-5 hari.",
    toxicity: {
      organ: "Saraf Perifer (Neuropati Dingin)",
      manifestation: "Spasme tenggorokan saat minum dingin, kebas ujung jari progresif kumulatif.",
      preventionStrategy: "Hindari paparan dingin, perpanjang durasi infus bila akut, reduksi dosis bila grade 2+.",
    },
  },
  fluorouracil: {
    drugId: "Fluorourasil",
    drugName: "Fluorouracil (5-FU)",
    genericAlias: "Fluorourasil",
    role: "Antimetabolit Analog Pirimidin",
    defaultRoute: "IV bolus lambat 5-10 menit atau infus kontinu 24-48 jam via pompa",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50-500 mL",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Waspadai defisiensi enzim DPD (toksisitas fatal), mukositis, diare, Hand-Foot Syndrome, dan vasospasme koroner (hentikan segera jika timbul nyeri dada angina).",
    toxicity: {
      organ: "Saluran Cerna, Kulit & Jantung",
      manifestation: "Mukositis oral, diare, Hand-Foot Syndrome, vasospasme koroner.",
      preventionStrategy: "Krioterapi oral saat bolus, pantau nyeri dada/EKG, reduksi dosis bila mukositis grade 3.",
    },
  },
  capecitabine: {
    drugId: "Capecitabine_Oral",
    drugName: "Capecitabine (Xeloda)",
    genericAlias: "Kapesitabin",
    role: "Prodrug Oral Fluorourasil (Antimetabolit)",
    defaultRoute: "Oral 2x sehari dalam 30 menit sesudah makan (Hari ke-1 s/d 14)",
    diluentStandard: "Sediaan Tablet Oral 500 mg (telan utuh dengan air)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Kontraindikasi pada CrCl <30 mL/min; reduksi dosis 25% bila CrCl 30-50 mL/min. Interaksi mayor dengan Warfarin (peningkatan INR drastis).",
    toxicity: {
      organ: "Kulit (Hand-Foot Syndrome) & GI",
      manifestation: "Eritema/nyeri telapak tangan-kaki, diare, hiperbilirubinemia.",
      preventionStrategy: "Pelembab urea topikal, penyesuaian dosis ginjal, pantau ketat INR bila bersama warfarin.",
    },
  },
  leucovorin: {
    drugId: "Folinic Acid",
    drugName: "Leucovorin (Asam Folinat / Kalsium Folinat)",
    genericAlias: "Leukovorin",
    role: "Biomodulator 5-FU / Antidot Rescue Metotreksat",
    defaultRoute: "IV infus 15 menit - 2 jam (atau oral untuk rescue MTX)",
    diluentStandard: "Dextrose 5% atau NaCl 0.9% 100-250 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pada kombinasi 5-FU, Leucovorin meningkatkan efikasi sekaligus toksisitas GI 5-FU. Pada Metotreksat dosis tinggi, kepatuhan jadwal rescue tepat waktu bersifat krusial.",
    toxicity: {
      organ: "Saluran Cerna (Potensiasi 5-FU)",
      manifestation: "Memperkuat risiko stomatitis dan diare akibat 5-FU.",
      preventionStrategy: "Verifikasi dosis tepat (Levoleucovorin = separuh dosis d,l-Leucovorin).",
    },
  },
  irinotecan: {
    drugId: "Irinotecan",
    drugName: "Irinotecan HCl (Camptosar)",
    genericAlias: "Irinotekan",
    role: "Inhibitor Topoisomerase I",
    defaultRoute: "IV infus selama 90 menit",
    diluentStandard: "Dextrose 5% (pilihan utama) atau NaCl 0.9% 250-500 mL",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Sindrom kolinergik akut (<24 jam -> Atropin 0.25-0.5 mg SC/IV) dan diare lambat berat (>24 jam -> protokol Loperamide dosis tinggi). Waspadai polimorfisme UGT1A1*28.",
    toxicity: {
      organ: "Saluran Cerna Bawah & Sumsum Tulang",
      manifestation: "Diare dini kolinergik, diare lambat dehidrasi berat, neutropenia.",
      preventionStrategy: "Siapkan Atropin di unit kemo dan bekali pasien Loperamide dosis tinggi di rumah.",
    },
  },
  docetaxel: {
    drugId: "Docetaxel",
    drugName: "Docetaxel (Taxotere)",
    genericAlias: "Dosetaksel",
    role: "Golongan Taxane / Penstabil Mikrotubulus",
    defaultRoute: "IV infus 60 menit dengan set non-PVC & filter in-line 0.22 mikron",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250 mL (wadah bebas DEHP)",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Wajib premedikasi Deksametason 8 mg PO 2x/hari selama 3 hari (mulai H-1) untuk mencegah retensi cairan berat dan anafilaksis. Pantau fungsi hati (bilirubin/SGOT/SGPT).",
    toxicity: {
      organ: "Vaskular (Retensi Cairan) & Sumsum Tulang",
      manifestation: "Edema perifer, efusi pleura, neutropenia febril, neuropati perifer.",
      preventionStrategy: "Kepatuhan Deksametason 3 hari, pertimbangkan G-CSF profilaksis, evaluasi bilirubin.",
    },
  },
  paclitaxel: {
    drugId: "Paclitaxel",
    drugName: "Paclitaxel (Taxol)",
    genericAlias: "Paklitaksel",
    role: "Golongan Taxane / Penstabil Mikrotubulus",
    defaultRoute: "IV infus 1-3 jam dengan wadah non-PVC & filter in-line 0.22 mikron",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL (bebas DEHP)",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "WAJIB premedikasi tripel (Deksametason + Difenhidramin + Antagonis H2) karena pelarut Cremophor EL berisiko anafilaksis berat. Berikan SEBELUM platinum.",
    toxicity: {
      organ: "Imun (Anafilaksis) & Saraf Perifer",
      manifestation: "Bronkospasme/hipotensi 10 menit pertama, neuropati sensorik distal, alopesia.",
      preventionStrategy: "Premedikasi lengkap, observasi ketat 15 menit awal, sarung tangan pendingin (cryotherapy).",
    },
  },
  methotrexate: {
    drugId: "Methotrexate",
    drugName: "Methotrexate (MTX)",
    genericAlias: "Metotreksat",
    role: "Antimetabolit Antagonis Asam Folat (Inhibitor DHFR)",
    defaultRoute: "IV bolus/infus atau oral sesuai protokol (dosis tinggi wajib alkalinisasi & Leucovorin rescue)",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50-500 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Hindari NSAID, PPI, penisilin, dan sulfonamid saat MTX dosis menengah-tinggi (menghambat klirens ginjal). Pada efusi pleura/asites (third-space), klirens MTX melambat drastis!",
    toxicity: {
      organ: "Ginjal, Mukosa & Sumsum Tulang",
      manifestation: "Nefrotoksisitas kristal MTX, mukositis berat, pansitopenia, hepatotoksisitas.",
      preventionStrategy: "Hidrasi + alkalinisasi urin (pH >7) & Leucovorin rescue pada HD-MTX; cek CrCl & efusi.",
    },
  },
  rituximab: {
    drugId: "Rituximab",
    drugName: "Rituximab (MabThera)",
    genericAlias: "Rituksimab",
    role: "Antibodi Monoklonal Anti-CD20",
    defaultRoute: "IV infus titrasi bertahap (mulai 50 mg/jam, naikkan tiap 30 menit maks 400 mg/jam)",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 250-500 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Wajib skrining Hepatitis B (HBsAg & Anti-HBc) sebelum siklus 1 (risiko reaktivasi hepatitis fulminan). Premedikasi Parasetamol + Antihistamin + Steroid wajib 30 menit sebelumnya.",
    toxicity: {
      organ: "Sistem Imun & Hati (HBV)",
      manifestation: "Reaksi infus sitokin akut, bronkospasme, reaktivasi virus Hepatitis B.",
      preventionStrategy: "Premedikasi tripel, titrasi laju infus perlahan, antiviral profilaksis bila HBV positif.",
    },
  },
  trastuzumab: {
    drugId: "Trastuzumab",
    drugName: "Trastuzumab (Herceptin)",
    genericAlias: "Trastuzumab",
    role: "Antibodi Monoklonal Anti-HER2",
    defaultRoute: "IV infus 90 menit (dosis muatan) lalu 30 menit (rumatan)",
    diluentStandard: "NaCl 0.9% 250 mL",
    diluentForbidden: "DILARANG dilarutkan dalam Dextrose 5% (agregasi protein)!",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pantau LVEF setiap 3 bulan; hindari pemberian bersamaan langsung dengan antrasiklin karena risiko kardiotoksisitas sinergis.",
    toxicity: {
      organ: "Jantung (Disfungsi Sistolik)",
      manifestation: "Penurunan LVEF asimtomatik atau gagal jantung (umumnya reversibel).",
      preventionStrategy: "Ekokardiografi dasar dan tiap 3 bulan, tunda terapi bila LVEF turun signifikan.",
    },
  },
  bendamustine: {
    drugId: "Bendamustine",
    drugName: "Bendamustine HCl",
    genericAlias: "Bendamustin",
    role: "Alkylating Agent Bifungsional (Purin + Nitrogen Mustard)",
    defaultRoute: "IV infus 30-60 menit",
    diluentStandard: "NaCl 0.9% 500 mL (stabil maksimal 3 jam pada suhu ruang setelah dilusi)",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Risiko limfopenia T-CD4 berkepanjangan dan infeksi oportunistik (pertimbangkan profilaksis PJP/Kotrimoksazol & Asiklovir). Berikan segera setelah pengenceran.",
    toxicity: {
      organ: "Sumsum Tulang & Imunitas Seluler",
      manifestation: "Neutropenia, limfopenia berkepanjangan, ruam kulit, reaksi infus.",
      preventionStrategy: "Profilaksis infeksi oportunistik bila CD4 rendah, premedikasi antiemetik & antihistamin.",
    },
  },
  fludarabine: {
    drugId: "Fludarabine",
    drugName: "Fludarabine Fosfat",
    genericAlias: "Fludarabin",
    role: "Antimetabolit Analog Purin",
    defaultRoute: "IV infus 30 menit",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 100 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Wajib produk darah teriradiasi (irradiated blood products) seumur hidup untuk mencegah TA-GVHD fatal! Sesuaikan dosis bila CrCl <70 mL/min; profilaksis PJP & HSV wajib.",
    toxicity: {
      organ: "Imunitas Seluler & Hematologi",
      manifestation: "Limfopenia berat, anemia hemolitik autoimun, infeksi oportunistik (PJP/CMV).",
      preventionStrategy: "Produk darah iradiasi wajib, profilaksis Kotrimoksazol + Asiklovir, penyesuaian dosis ginjal.",
    },
  },
  gemcitabine: {
    drugId: "Gemcitabine",
    drugName: "Gemcitabine HCl (Gemzar)",
    genericAlias: "Gemsitabin",
    role: "Antimetabolit Analog Nukleosida",
    defaultRoute: "IV infus tepat 30 menit (jangan diperpanjang >60 menit kecuali protokol FDR)",
    diluentStandard: "NaCl 0.9% 250 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Memperpanjang durasi infus >30 menit secara tak terencana meningkatkan mielosupresi secara drastis. Waspadai sindrom mirip flu dan mikroangiopati trombotik (HUS).",
    toxicity: {
      organ: "Sumsum Tulang & Paru",
      manifestation: "Trombositopenia, neutropenia, sindrom mirip flu, pneumonitis jarang.",
      preventionStrategy: "Jaga waktu infus tepat 30 menit, cek CBC sebelum Hari ke-1 dan Hari ke-8.",
    },
  },
  bortezomib: {
    drugId: "Bortezomib",
    drugName: "Bortezomib (Velcade)",
    genericAlias: "Bortezomib",
    role: "Inhibitor Proteasom 26S",
    defaultRoute: "Injeksi Subkutan (SC) lebih disukai dibanding IV bolus (risiko neuropati jauh lebih rendah)",
    diluentStandard: "Rekonstitusi NaCl 0.9% (konsentrasi 2.5 mg/mL untuk SC atau 1 mg/mL untuk IV)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "FATAL JIKA INTRATEKAL! WAJIB profilaksis antivirus (Asiklovir/Valasiklovir) untuk mencegah reaktivasi Herpes Zoster. Hindari vitamin C & teh hijau dosis tinggi pada hari injeksi.",
    toxicity: {
      organ: "Saraf Perifer & Imunitas Viral",
      manifestation: "Neuropati perifer nyeri, reaktivasi Herpes Zoster, trombositopenia siklik.",
      preventionStrategy: "Pilih rute Subkutan (SC) mingguan, wajib profilaksis Asiklovir 400 mg 2x/hari.",
    },
  },
  lenalidomide: {
    drugId: "Lenalidomide_Oral",
    drugName: "Lenalidomide (Revlimid)",
    genericAlias: "Lenalidomida",
    role: "Agen Imunomodulator (IMiD)",
    defaultRoute: "Oral 1x sehari (umumnya Hari 1-14 atau 1-21 setiap siklus 28 hari)",
    diluentStandard: "Sediaan Kapsul Oral (telan utuh, jangan dibuka/dihancurkan)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "TERATOGENIK BERAT (kontrasepsi ketat). Risiko tromboemboli vena (DVT/PE) tinggi saat dikombinasi steroid -> WAJIB tromboprofilaksis (Aspirin/LMWH/DOAC). Sesuaikan dosis bila CrCl <60 mL/min.",
    toxicity: {
      organ: "Vaskular (Tromboemboli) & Sumsum Tulang",
      manifestation: "DVT, emboli paru, neutropenia, ruam kulit.",
      preventionStrategy: "Tromboprofilaksis wajib, sesuaikan dosis ginjal, pemantauan kehamilan ketat.",
    },
  },
  pomalidomide: {
    drugId: "Pomalidomide_Oral",
    drugName: "Pomalidomide (Pomalyst)",
    genericAlias: "Pomalidomida",
    role: "Agen Imunomodulator Generasi Ketiga (IMiD)",
    defaultRoute: "Oral 1x sehari pada Hari 1-21 setiap siklus 28 hari",
    diluentStandard: "Sediaan Kapsul Oral (telan utuh dengan air)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Teratogenik berat dan trombogenik (wajib tromboprofilaksis Aspirin/antikoagulan). Hindari penghambat kuat CYP1A2 (Ciprofloxacin, Fluvoxamine).",
    toxicity: {
      organ: "Vaskular & Sumsum Tulang",
      manifestation: "Tromboemboli vena (DVT/PE), neutropenia, kelelahan.",
      preventionStrategy: "Tromboprofilaksis rutin, cek darah lengkap berkala.",
    },
  },
  thalidomide: {
    drugId: "Thalidomide_Oral",
    drugName: "Thalidomide",
    genericAlias: "Talidomida",
    role: "Agen Imunomodulator & Anti-Angiogenesis (IMiD)",
    defaultRoute: "Oral 1x sehari malam hari sebelum tidur (mengurangi rasa kantuk)",
    diluentStandard: "Sediaan Kapsul Oral (telan utuh)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "TERATOGENIK EKSTREM! Wajib tromboprofilaksis (Aspirin/LMWH) bila dikombinasi deksametason/kemoterapi. Pantau neuropati perifer, somnolen, bradikardia, dan konstipasi.",
    toxicity: {
      organ: "Vaskular & Saraf Perifer",
      manifestation: "Tromboemboli vena (DVT/PE), sedasi, konstipasi berat, neuropati perifer.",
      preventionStrategy: "Minum malam hari, tromboprofilaksis wajib, edukasi laksatif & kontrasepsi ketat.",
    },
  },
  clarithromycin: {
    drugId: "Clarithromycin_Oral",
    drugName: "Clarithromycin (Biaxin)",
    genericAlias: "Klaritromisin",
    role: "Makrolida Imunomodulator / Potensiator Steroid & IMiD",
    defaultRoute: "Oral 2x sehari (500 mg tiap 12 jam) sepanjang siklus",
    diluentStandard: "Sediaan Tablet Oral 500 mg",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Inhibitor kuat CYP3A4 dan memperpanjang interval QT! Tinjau seluruh obat rutin pasien (statin, CCB, antiaritmia, warfarin) untuk mencegah interaksi mayor.",
    toxicity: {
      organ: "Jantung (QTc) & Saluran Cerna",
      manifestation: "Perpanjangan interval QT, rasa logam di mulut, dispepsia, interaksi CYP3A4.",
      preventionStrategy: "Skrining interaksi obat CYP3A4, evaluasi EKG bila ada faktor risiko aritmia.",
    },
  },
  procarbazine: {
    drugId: "Procarbazine_Oral",
    drugName: "Procarbazine HCl",
    genericAlias: "Prokarbazin",
    role: "Alkylating Agent Oral (Derivat Metilhidrazin)",
    defaultRoute: "Oral dosis terbagi bersama makan selama hari protokol",
    diluentStandard: "Sediaan Kapsul Oral 50 mg",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Memiliki aktivitas MAOI lemah! HINDARI makanan tinggi tiramin (keju tua, tape, daging asap, alkohol — risiko krisis hipertensi & reaksi mirip disulfiram) serta obat SSRI/simpatomimetik.",
    toxicity: {
      organ: "Kardiovaskular (MAOI) & Sumsum Tulang",
      manifestation: "Krisis hipertensi bila konsumsi tiramin, pansitopenia, infertilitas/leukemia sekunder.",
      preventionStrategy: "Edukasi diet bebas tiramin & alkohol, hindari SSRI/dekongestan, cek CBC berkala.",
    },
  },
  prednisone: {
    drugId: "Prednisone_Oral",
    drugName: "Prednisone",
    genericAlias: "Prednison",
    role: "Glukokortikoid Oral (Limfolitik & Anti-inflamasi)",
    defaultRoute: "Oral pagi hari sesudah makan sesuai hari siklus",
    diluentStandard: "Sediaan Tablet Oral (alternatif IV: Metilprednisolon ekuivalen)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pantau glukosa darah (hiperglikemia steroid), tekanan darah, gastritis/ulkus peptikum (pertimbangkan PPI), dan risiko infeksi oportunistik.",
    toxicity: {
      organ: "Metabolik & Mukosa Lambung",
      manifestation: "Hiperglikemia, insomnia, iritasi lambung, retensi natrium.",
      preventionStrategy: "Minum pagi sesudah makan, pertimbangkan gastroprotektor PPI, monitor GDS pada DM.",
    },
  },
  dexamethasone: {
    drugId: "Dexamethasone",
    drugName: "Dexamethasone",
    genericAlias: "Deksametason",
    role: "Kortikosteroid Poten (Limfolitik, Mielomolitik & Antiemetik)",
    defaultRoute: "Oral atau IV infus singkat 15 menit sesuai protokol",
    diluentStandard: "Tablet Oral atau NaCl 0.9% 50 mL (untuk IV)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pantau gula darah, insomnia, ulkus lambung (berikan PPI), serta risiko infeksi jamur/PJP pada penggunaan dosis tinggi berulang.",
    toxicity: {
      organ: "Metabolik & Lambung",
      manifestation: "Hiperglikemia, gastritis, imunosupresi, perubahan mood/insomnia.",
      preventionStrategy: "Berikan pagi hari, gastroproteksi PPI, pantau GDS berkala.",
    },
  },
  methylprednisolone: {
    drugId: "Methylprednisolone",
    drugName: "Methylprednisolone Natrium Suksinat",
    genericAlias: "Metilprednisolon",
    role: "Kortikosteroid Intravena Dosis Tinggi",
    defaultRoute: "IV infus 15-30 menit",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50-100 mL",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Dosis tinggi (250-500 mg IV) berisiko hiperglikemia akut, bradikardia bila infus terlalu cepat, dan perdarahan saluran cerna.",
    toxicity: {
      organ: "Metabolik & Saluran Cerna",
      manifestation: "Hiperglikemia akut, gastritis/ulkus, ketidakseimbangan elektrolit.",
      preventionStrategy: "Infus ≥15-30 menit, berikan gastroprotektor PPI, pantau gula darah harian.",
    },
  },
  chlorambucil: {
    drugId: "Chlorambucil_Oral",
    drugName: "Chlorambucil (Leukeran)",
    genericAlias: "Klorambusil",
    role: "Alkylating Agent Oral (Nitrogen Mustard)",
    defaultRoute: "Oral 1x sehari (simpan tablet di lemari pendingin 2-8°C)",
    diluentStandard: "Sediaan Tablet Oral 2 mg",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pantau supresi sumsum tulang kumulatif (limfopenia, neutropenia, trombositopenia) dan risiko kejang jarang pada anak.",
    toxicity: {
      organ: "Sumsum Tulang",
      manifestation: "Mielosupresi progresif, gangguan kesuburan.",
      preventionStrategy: "Cek hitung darah lengkap setiap 1-2 minggu selama terapi.",
    },
  },
  carmustine: {
    drugId: "Carmustine",
    drugName: "Carmustine (BCNU)",
    genericAlias: "Karmustin",
    role: "Alkylating Agent Golongan Nitrosourea",
    defaultRoute: "IV infus lambat ≥2 jam (wadah kaca/non-PVC)",
    diluentStandard: "Dextrose 5% 500 mL dalam botol kaca/poliolefin (NON-PVC)",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Melarutkan plastik PVC dan mengandung pelarut etanol (sensasi terbakar vena & flushing bila terlalu cepat). Risiko fibrosis paru kumulatif (>1400 mg/m²) & mielosupresi lambat (nadir 4-6 minggu).",
    toxicity: {
      organ: "Paru & Sumsum Tulang (Nadir Lambat)",
      manifestation: "Mielosupresi tertunda (4-6 minggu), pneumonitis/fibrosis paru, flebitis.",
      preventionStrategy: "Infus lambat ≥2 jam dengan wadah non-PVC, pantau fungsi paru & CBC berkala.",
    },
  },
  lomustine: {
    drugId: "Lomustine_Oral",
    drugName: "Lomustine (CCNU / CeeNU)",
    genericAlias: "Lomustin",
    role: "Alkylating Agent Nitrosourea Oral (Menembus Sawar Darah Otak)",
    defaultRoute: "Oral dosis tunggal pada Hari ke-1 tiap siklus 6 minggu (saat perut kosong malam hari)",
    diluentStandard: "Sediaan Kapsul Oral (telan sekaligus sebagai dosis tunggal siklus!)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "PERINGATAN FATAL OVERDOSIS: Lomustine hanya diminum SATU KALI setiap 6 minggu — BUKAN setiap hari! Berikan resep persis untuk 1 dosis saja. Nadir darah lambat (4-6 minggu).",
    toxicity: {
      organ: "Sumsum Tulang (Mielosupresi Lambat) & Paru",
      manifestation: "Trombositopenia/leukopenia tertunda 4-6 minggu, fibrosis paru kumulatif.",
      preventionStrategy: "Serahkan kapsul tepat untuk 1 dosis per 6 minggu, pantau CBC mingguan selama 6 minggu.",
    },
  },
  mechlorethamine: {
    drugId: "Mechlorethamine",
    drugName: "Mechlorethamine (Mustargen / Nitrogen Mustard)",
    genericAlias: "Mekloretamin",
    role: "Alkylating Agent Nitrogen Mustard Klasik",
    defaultRoute: "IV push segera (dalam 15 menit setelah rekonstitusi) via jalur saline deras",
    diluentStandard: "Rekonstitusi WFI/NaCl 0.9% 10 mL (sangat tidak stabil, segera injeksikan!)",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Vesikan sangat kuat dan sangat emetogenik (HEC). Bila ekstravasasi: segera infiltrasi antidot Natrium Tiosulfat 1/6 M + kompres dingin!",
    toxicity: {
      organ: "Jaringan Lokal, GI & Sumsum Tulang",
      manifestation: "Nekrosis berat bila ekstravasasi, mual-muntah hebat, mielosupresi.",
      preventionStrategy: "Siapkan antidot Natrium Tiosulfat, antiemetik tripel (NK1+5HT3+Dex), akses vena paten.",
    },
  },
  mitomycin: {
    drugId: "Mitomycin",
    drugName: "Mitomycin C",
    genericAlias: "Mitomisin",
    role: "Antibiotik Antitumor Alkilasi",
    defaultRoute: "IV bolus lambat atau infus singkat 15-30 menit via akses paten",
    diluentStandard: "NaCl 0.9% 50-100 mL",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Vesikan kuat (nekrosis tertunda bisa muncul berminggu-minggu pasca ekstravasasi!). Risiko sindrom uremik hemolitik (HUS) dan mielosupresi kumulatif.",
    toxicity: {
      organ: "Sumsum Tulang & Ginjal (HUS)",
      manifestation: "Mielosupresi kumulatif berkepanjangan, anemia hemolitik mikroangiopati (HUS).",
      preventionStrategy: "Cek fungsi ginjal, LDH, haptoglobin, trombosit berkala; jaga akses vena paten.",
    },
  },
  thioguanine: {
    drugId: "Thioguanine_Oral",
    drugName: "Thioguanine (6-TG)",
    genericAlias: "Tioguanina",
    role: "Antimetabolit Analog Purin Oral",
    defaultRoute: "Oral 2x sehari sesuai protokol induksi/konsolidasi",
    diluentStandard: "Sediaan Tablet Oral 40 mg",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Waspadai defisiensi enzim TPMT/NUDT15 (risiko mielosupresi fatal) dan penyakit veno-oklusif hati (SOS/VOD) pada pemakaian berkepanjangan.",
    toxicity: {
      organ: "Sumsum Tulang & Hati",
      manifestation: "Pansitopenia berat, hepatotoksisitas / sinusoidal obstruction syndrome.",
      preventionStrategy: "Pantau SGOT/SGPT, bilirubin, dan CBC berkala; evaluasi status TPMT bila tersedia.",
    },
  },
  mercaptopurine: {
    drugId: "Mercaptopurine_Oral",
    drugName: "6-Mercaptopurine (Purinethol / 6-MP)",
    genericAlias: "6-Merkaptopurin",
    role: "Antimetabolit Analog Purin Oral",
    defaultRoute: "Oral 1x sehari malam hari (hindari konsumsi bersamaan produk susu)",
    diluentStandard: "Sediaan Tablet Oral 50 mg",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "INTERAKSI MAYOR dengan Allopurinol: bila diberikan bersama Allopurinol, dosis 6-MP WAJIB diturunkan hingga 75% (berikan hanya 25-33% dosis)! Evaluasi TPMT/NUDT15.",
    toxicity: {
      organ: "Sumsum Tulang & Hati",
      manifestation: "Mielosupresi berat, kolestasis/hepatotoksisitas.",
      preventionStrategy: "Cek interaksi Allopurinol/Febuxostat, pantau CBC & fungsi hati rutin.",
    },
  },
  actinomycin: {
    drugId: "Dactinomycin",
    drugName: "Dactinomycin (Actinomycin D / Cosmegen)",
    genericAlias: "Aktinomisin D",
    role: "Antibiotik Antitumor Interkalator DNA",
    defaultRoute: "IV push pelan atau infus mini 10-15 menit via akses vena paten",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% 50 mL (hindari filter selulosa ester)",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Vesikan sangat korosif! Risiko radiation recall dermatitis dan penyakit veno-oklusif hati (SOS/VOD) terutama pada anak dengan Tumor Wilms.",
    toxicity: {
      organ: "Hati (SOS/VOD) & Jaringan Lokal",
      manifestation: "Hepatomegali nyeri, asites, peningkatan bilirubin, mukositis berat, ekstravasasi nekrotik.",
      preventionStrategy: "Akses vena sentral/paten, pantau berat badan harian & bilirubin/trombosit.",
    },
  },
  amsacrine: {
    drugId: "Amsacrine",
    drugName: "Amsacrine (m-AMSA)",
    genericAlias: "Amsakrin",
    role: "Interkalator DNA / Inhibitor Topoisomerase II",
    defaultRoute: "IV infus 60-90 menit dalam D5W (botol kaca/non-PVC)",
    diluentStandard: "Dextrose 5% (D5W) 500 mL",
    diluentForbidden: "DILARANG menggunakan NaCl 0.9% atau larutan klorida (presipitasi instan)!",
    vesicantStatus: "Vesikant (Nekrosis Jaringan)",
    specialPrecautions:
      "Koreksi hipokalemia (K+ >4.0 mEq/L) WAJIB sebelum infus untuk mencegah aritmia ventrikel/TdP fatal! Urin berwarna jingga sementara.",
    toxicity: {
      organ: "Jantung (Aritmia) & Sumsum Tulang",
      manifestation: "Perpanjangan QT, aritmia ventrikel (terutama bila hipokalemia), aplasia sumsum tulang.",
      preventionStrategy: "Koreksi kalium & magnesium sebelum infus, monitor EKG selama infus, pelarut D5W murni.",
    },
  },
  busulfan: {
    drugId: "Busulfan",
    drugName: "Busulfan IV",
    genericAlias: "Busulfan",
    role: "Alkylating Agent (Alkil Sulfonat) — Conditioning Transplantasi",
    defaultRoute: "IV infus 2-3 jam melalui kateter vena sentral",
    diluentStandard: "NaCl 0.9% atau Dextrose 5% (volume 10x volume obat, konsentrasi ~0.5 mg/mL)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "WAJIB profilaksis antikejang (Levetiracetam/Phenytoin/Clonazepam) sebelum dosis pertama hingga 24 jam pasca dosis terakhir! Risiko tinggi SOS/VOD hati.",
    toxicity: {
      organ: "SSP (Kejang) & Hati (SOS/VOD)",
      manifestation: "Kejang tonik-klonik umum, sinusoidal obstruction syndrome (VOD), fibrosis paru.",
      preventionStrategy: "Profilaksis antikejang wajib, pantau berat badan/bilirubin harian, pertimbangkan Ursodeoxycholic acid.",
    },
  },
  melphalan: {
    drugId: "Melphalan",
    drugName: "Melphalan IV (Alkeran)",
    genericAlias: "Melfalan",
    role: "Alkylating Agent (Nitrogen Mustard) — Conditioning",
    defaultRoute: "IV infus 15-30 menit (WAJIB selesai dalam 60 menit sejak rekonstitusi!)",
    diluentStandard: "NaCl 0.9% (konsentrasi ≤0.45 mg/mL; cepat terhidrolisis!)",
    diluentForbidden: "DILARANG menggunakan Dextrose 5% atau menunda infus >60 menit!",
    vesicantStatus: "Iritan",
    specialPrecautions:
      "Stabilitas sangat pendek (<60 menit dari rekonstitusi sampai selesai infus). Berikan krioterapi oral (mengisap es batu) sebelum, selama, dan 30 menit pasca infus untuk mencegah mukositis berat.",
    toxicity: {
      organ: "Mukosa Oral & Sumsum Tulang",
      manifestation: "Mukositis grade 3-4, diare, aplasia sumsum tulang dalam.",
      preventionStrategy: "Krioterapi oral wajib selama infus, selesaikan infus <60 menit, sesuaikan dosis ginjal.",
    },
  },
  filgrastim: {
    drugId: "Filgrastim",
    drugName: "Filgrastim (G-CSF)",
    genericAlias: "G-CSF",
    role: "Faktor Pertumbuhan Granulosit (Granulocyte Colony-Stimulating Factor)",
    defaultRoute: "Injeksi Subkutan (SC) 1x sehari mulai 24 jam sebelum/sesudah protokol sesuai regimen",
    diluentStandard: "Sediaan Prefilled Syringe SC siap pakai (simpan 2-8°C, jangan dikocok)",
    vesicantStatus: "Non-Vesikant",
    specialPrecautions:
      "Pantau nyeri tulang (berikan parasetamol/loratadin bila perlu), leukositosis berlebih, dan splenomegali. Jangan dikocok keras.",
    toxicity: {
      organ: "Muskuloskeletal & Limpa",
      manifestation: "Nyeri tulang/punggung bawah, leukositosis sementara, splenomegali jarang.",
      preventionStrategy: "Analgesik ringan/Loratadin untuk nyeri tulang, pantau hitung leukosit/ANC rutin.",
    },
  },
};

export interface CompactComponentSpec {
  key: keyof typeof ONCOLOGY_DRUG_CATALOG;
  dosageFormula: string;
  defaultDoseValue: number;
  doseUnit: ChemoDrugComponent["doseUnit"];
  routeOverride?: string;
  noteOverride?: string;
}

export interface CompactRegimenSpec {
  id: string;
  acronym: string;
  fullName: string;
  cancerCategory: ChemoCancerCategory;
  cancerTypeDetail: string;
  applicableGoals: ChemoTherapyGoal[];
  primaryGoalHighlight: string;
  overview: string;
  cycleProtocol: string;
  cycleLengthDays: number;
  totalRecommendedCycles: string;
  components: CompactComponentSpec[];
  extraPremed?: string[];
  extraHydration?: string[];
  clinicalPearls: string[];
  references?: string;
}

export function buildChemoRegimen(spec: CompactRegimenSpec): ChemoRegimen {
  const components: ChemoDrugComponent[] = spec.components.map((item, index) => {
    const prof = ONCOLOGY_DRUG_CATALOG[item.key];
    return {
      drugId: prof.drugId,
      drugName: prof.drugName,
      genericAlias: prof.genericAlias,
      role: prof.role,
      dosageFormula: item.dosageFormula,
      defaultDoseValue: item.defaultDoseValue,
      doseUnit: item.doseUnit,
      adminRoute: item.routeOverride || prof.defaultRoute,
      diluentStandard: prof.diluentStandard,
      ...(prof.diluentForbidden ? { diluentForbidden: prof.diluentForbidden } : {}),
      sequenceOrder: index + 1,
      sequenceNote:
        item.noteOverride ||
        `Urutan #${index + 1}. Bilas jalur infus dengan pelarut kompatibel (20-50 mL) sebelum dan sesudah obat ini.`,
      vesicantStatus: prof.vesicantStatus,
      specialPrecautions: prof.specialPrecautions,
    };
  });

  const keys = new Set(spec.components.map((c) => c.key));

  // Synthesize authentic premedication protocol based on actual agents in regimen
  const premedicationProtocol: string[] = [];
  if (keys.has("rituximab")) {
    premedicationProtocol.push(
      "Premedikasi Wajib Rituximab (30 menit sebelum infus): Paracetamol 500-1000 mg PO + Diphenhydramine 50 mg IV + Dexamethasone 10-20 mg IV."
    );
  }
  if (keys.has("paclitaxel")) {
    premedicationProtocol.push(
      "Premedikasi Hipersensitivitas Paclitaxel: Dexamethasone 20 mg IV/PO + Diphenhydramine 50 mg IV + Famotidine 20 mg / Ranitidine 50 mg IV."
    );
  }
  if (keys.has("docetaxel")) {
    premedicationProtocol.push(
      "Kortikosteroid Wajib Docetaxel: Dexamethasone 8 mg oral 2x/hari selama 3 hari (mulai H-1) untuk mencegah retensi cairan dan reaksi anafilaktoid."
    );
  }
  if (
    keys.has("cisplatin") ||
    keys.has("dacarbazine") ||
    keys.has("mechlorethamine") ||
    (keys.has("doxorubicin") && keys.has("cyclophosphamide")) ||
    (keys.has("epirubicin") && keys.has("cyclophosphamide"))
  ) {
    premedicationProtocol.push(
      "Antiemetik Potensi Tinggi (HEC): Antagonis 5-HT3 (Ondansetron 8-16 mg IV / Palonosetron 0.25 mg IV) + Dexamethasone 12 mg IV + Antagonis NK1 (Aprepitant/Fosaprepitant)."
    );
  } else {
    premedicationProtocol.push(
      "Antiemetik Profilaksis: Ondansetron 8 mg IV/PO atau Granisetron 1 mg IV ± Dexamethasone 8-12 mg IV 30 menit sebelum kemoterapi."
    );
  }
  if (keys.has("bortezomib") || keys.has("fludarabine")) {
    premedicationProtocol.push(
      "Profilaksis Infeksi Wajib: Asiklovir 400 mg PO 2x/hari (cegah reaktivasi Herpes Zoster/HSV); tambahkan Kotrimoksazol bila berbasis Fludarabine/Bendamustine."
    );
  }
  if (keys.has("irinotecan")) {
    premedicationProtocol.push(
      "Profilaksis Kolinergik Akut Irinotecan: Atropin Sulfat 0.25-0.5 mg SC/IV bila timbul kram perut, salivasi, atau diare dini <24 jam."
    );
  }
  if (keys.has("busulfan")) {
    premedicationProtocol.push(
      "Profilaksis Antikejang Wajib Busulfan: Levetiracetam 500 mg IV/PO 2x/hari mulai sebelum dosis pertama hingga 24 jam pasca dosis terakhir."
    );
  }
  if (spec.extraPremed) {
    premedicationProtocol.push(...spec.extraPremed);
  }

  // Synthesize hydration & protection protocol
  const hydrationAndProtection: string[] = [];
  if (keys.has("cisplatin")) {
    hydrationAndProtection.push(
      "Hidrasi Salin Agresif Cisplatin: Pre-hidrasi NaCl 0.9% 1000 mL + KCl 20 mEq + MgSO4 1-2 g IV, dilanjutkan post-hidrasi NaCl 0.9% 1000 mL; jaga diuresis ≥100 mL/jam."
    );
  }
  if (keys.has("ifosfamide")) {
    hydrationAndProtection.push(
      "Uroproteksi Wajib Ifosfamide: Mesna sesuai protokol (jam 0, 4, 8 atau kontinu 24 jam) + hidrasi IV/oral 2-3 L/hari + urinalisis harian (deteksi hematuria)."
    );
  }
  if (keys.has("cyclophosphamide")) {
    hydrationAndProtection.push(
      "Proteksi Kandung Kemih Cyclophosphamide: Hidrasi cairan 2-3 liter/hari dan instruksikan pasien berkemih setiap 2-3 jam untuk mencegah sistitis hemoragik."
    );
  }
  if (keys.has("oxaliplatin") || keys.has("amsacrine")) {
    hydrationAndProtection.push(
      "Pembilasan Khusus D5W: WAJIB bilas jalur infus dengan Dextrose 5% sebelum dan sesudah obat inkompatibel klorida (Oxaliplatin/Amsacrine)."
    );
  } else {
    hydrationAndProtection.push(
      "Pembilasan Standar (Flush): Bilas jalur infus dengan 20-50 mL NaCl 0.9% di antara setiap komponen sitostatika."
    );
  }
  if (keys.has("lenalidomide") || keys.has("thalidomide") || keys.has("pomalidomide")) {
    hydrationAndProtection.push(
      "Tromboprofilaksis Wajib IMiD: Aspirin 80-100 mg/hari (risiko rendah) atau LMWH/DOAC (risiko tinggi DVT/PE)."
    );
  }
  if (spec.extraHydration) {
    hydrationAndProtection.push(...spec.extraHydration);
  }

  // Synthesize vital monitoring
  const vitalMonitoring: string[] = [
    "Hitung Darah Lengkap (CBC, ANC, Trombosit) sebelum setiap siklus untuk deteksi mielosupresi/neutropenia.",
    "Fungsi Ginjal (Ureum, Kreatinin, CrCl) dan Fungsi Hati (SGOT, SGPT, Bilirubin total).",
  ];
  if (keys.has("doxorubicin") || keys.has("daunorubicin") || keys.has("idarubicin") || keys.has("epirubicin") || keys.has("mitoxantrone") || keys.has("trastuzumab")) {
    vitalMonitoring.push("Ekokardiografi (LVEF): Evaluasi fungsi pompa jantung awal dan berkala untuk pemantauan kardiotoksisitas.");
  }
  if (keys.has("bleomycin") || keys.has("carmustine") || keys.has("busulfan")) {
    vitalMonitoring.push("Fungsi Paru (DLCO/Spirometri & Auskultasi): Skrining dini pneumonitis interstisial / fibrosis paru.");
  }
  if (keys.has("rituximab")) {
    vitalMonitoring.push("Skrining Hepatitis B (HBsAg & Anti-HBc) wajib sebelum memulai terapi anti-CD20.");
  }

  // Build unique organ toxicities from up to 3 key drugs
  const organToxicities: ChemoRegimen["organToxicities"] = [];
  const seenOrgans = new Set<string>();
  for (const c of spec.components) {
    const prof = ONCOLOGY_DRUG_CATALOG[c.key];
    if (!seenOrgans.has(prof.toxicity.organ) && organToxicities.length < 3) {
      seenOrgans.add(prof.toxicity.organ);
      organToxicities.push({
        organ: prof.toxicity.organ,
        responsibleDrug: prof.genericAlias,
        manifestation: prof.toxicity.manifestation,
        preventionStrategy: prof.toxicity.preventionStrategy,
      });
    }
  }

  return {
    id: spec.id,
    acronym: spec.acronym,
    fullName: spec.fullName,
    cancerCategory: spec.cancerCategory,
    cancerCategoryLabel: CHEMO_CATEGORY_LABELS[spec.cancerCategory],
    cancerTypeDetail: spec.cancerTypeDetail,
    applicableGoals: spec.applicableGoals,
    primaryGoalHighlight: spec.primaryGoalHighlight,
    overview: spec.overview,
    cycleProtocol: spec.cycleProtocol,
    cycleLengthDays: spec.cycleLengthDays,
    totalRecommendedCycles: spec.totalRecommendedCycles,
    components,
    premedicationProtocol,
    hydrationAndProtection,
    vitalMonitoring,
    organToxicities,
    clinicalPearls: spec.clinicalPearls,
    references:
      spec.references ||
      "NCCN Clinical Practice Guidelines in Oncology; BC Cancer Agency Chemotherapy Protocols; ESMO Clinical Practice Guidelines; ASHP Injectable Drugs Guide.",
  };
}
