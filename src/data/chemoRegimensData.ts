export type ChemoTherapyGoal = "neoadjuvant" | "adjuvant" | "curative" | "palliative";

export interface ChemoGoalDefinition {
  id: ChemoTherapyGoal;
  title: string;
  shortDesc: string;
  fullDesc: string;
  badgeColor: string;
  bgLight: string;
  borderLight: string;
  iconName: string;
}

export const CHEMO_GOALS_DATA: Record<ChemoTherapyGoal, ChemoGoalDefinition> = {
  neoadjuvant: {
    id: "neoadjuvant",
    title: "Neoadjuvan",
    shortDesc: "Diberikan sebelum operasi atau radiasi untuk mengecilkan ukuran tumor besar.",
    fullDesc: "Kemoterapi neoadjuvan diberikan sebelum tindakan pembedahan definitif atau radioterapi. Tujuannya adalah mengecilkan volume tumor primer (downstaging), mempermudah reseksi pembedahan, mengurangi risiko amputasi/mastektomi radikal, serta menilai sensitivitas sel kanker terhadap regimen obat secara in vivo (mengejar Pathological Complete Response / pCR).",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    bgLight: "bg-indigo-50/70",
    borderLight: "border-indigo-200",
    iconName: "Scissors"
  },
  adjuvant: {
    id: "adjuvant",
    title: "Adjuvan",
    shortDesc: "Diberikan setelah operasi untuk membunuh sisa sel kanker dan mencegah kekambuhan.",
    fullDesc: "Kemoterapi adjuvan diberikan pasca operasi pengangkatan tumor primer secara komplit. Tujuannya adalah mengeliminasi sisa-sisa sel kanker mikroskopis (mikrometastasis subklinis) yang berpotensi menyebar melalui sirkulasi darah atau limfatik, sehingga meminimalkan risiko kekambuhan (relapse) dan meningkatkan kesintasan hidup jangka panjang.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    bgLight: "bg-emerald-50/70",
    borderLight: "border-emerald-200",
    iconName: "ShieldCheck"
  },
  curative: {
    id: "curative",
    title: "Kuratif / Primer",
    shortDesc: "Terapi utama untuk jenis kanker tertentu seperti kanker darah (leukemia) atau limfoma.",
    fullDesc: "Kemoterapi kuratif/primer berperan sebagai modalitas terapi utama yang ditujukan untuk mengeradikasi seluruh sel kanker hingga tuntas dan mencapai remisi komplit yang berkelanjutan (kesembuhan definitif). Sangat efektif pada neoplasma yang memiliki tingkat kemosensitivitas tinggi, seperti limfoma Hodgkin, limfoma non-Hodgkin (DLBCL), leukemia akut, dan tumor sel germinal testis.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    bgLight: "bg-purple-50/70",
    borderLight: "border-purple-200",
    iconName: "Sparkles"
  },
  palliative: {
    id: "palliative",
    title: "Paliatif",
    shortDesc: "Diberikan pada stadium lanjut untuk mengendalikan gejala dan memperlambat perkembangan penyakit.",
    fullDesc: "Kemoterapi paliatif ditujukan bagi pasien dengan kanker stadium lanjut lokal yang tidak dapat dioperasi atau telah bermetastasis jauh (Stadium IV). Fokus utama terapi bukan untuk eradikasi total, melainkan untuk memperlambat laju progresivitas penyakit (meningkatkan Progression-Free Survival), mengontrol komplikasi dan nyeri, serta mempertahankan kualitas hidup (Quality of Life) pasien seoptimal mungkin.",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    bgLight: "bg-amber-50/70",
    borderLight: "border-amber-200",
    iconName: "HeartPulse"
  }
};

export interface ChemoDrugComponent {
  drugId: string; // matches id in IvCompatibilityChecker
  drugName: string;
  genericAlias?: string;
  role: string;
  dosageFormula: string; // e.g. "25 mg/m² IV"
  defaultDoseValue: number; // e.g. 25
  doseUnit: "mg/m2" | "mg/kg" | "AUC" | "mg_flat" | "unit/m2";
  adminRoute: string; // e.g. "IV Bolus lambat 5-10 menit", "IV Infus 2 jam"
  diluentStandard: string; // e.g. "NaCl 0.9% 100 mL"
  diluentForbidden?: string; // e.g. "Dilarang menggunakan Dextrose!", "Dilarang menggunakan NaCl!"
  sequenceOrder: number; // Sequence order (1, 2, 3...)
  sequenceNote: string;
  vesicantStatus: "Vesikant (Nekrosis Jaringan)" | "Iritan" | "Non-Vesikant";
  specialPrecautions: string;
}

export interface ChemoRegimen {
  id: string;
  acronym: string;
  fullName: string;
  cancerCategory: "limfoma" | "kolorektal" | "payudara" | "ginekologi" | "lainnya";
  cancerCategoryLabel: string;
  cancerTypeDetail: string;
  applicableGoals: ChemoTherapyGoal[];
  primaryGoalHighlight: string;
  overview: string;
  cycleProtocol: string;
  cycleLengthDays: number;
  totalRecommendedCycles: string;
  components: ChemoDrugComponent[];
  premedicationProtocol: string[];
  hydrationAndProtection: string[];
  vitalMonitoring: string[];
  organToxicities: {
    organ: string;
    responsibleDrug: string;
    manifestation: string;
    preventionStrategy: string;
  }[];
  clinicalPearls: string[];
  references: string;
}

export const CHEMO_REGIMENS_DATA: ChemoRegimen[] = [
  {
    id: "abvd",
    acronym: "ABVD",
    fullName: "Adriamycin (Doxorubicin), Bleomycin, Vinblastine, Dacarbazine",
    cancerCategory: "limfoma",
    cancerCategoryLabel: "Limfoma",
    cancerTypeDetail: "Limfoma Hodgkin (Hodgkin Lymphoma - Stadium Dini & Lanjut)",
    applicableGoals: ["curative", "adjuvant", "palliative"],
    primaryGoalHighlight: "Kuratif / Primer (Regimen lini pertama standar dunia untuk limfoma Hodgkin)",
    overview: "Regimen ABVD adalah baku emas terapi kuratif lini pertama untuk Limfoma Hodgkin klasik. Protokol ini dirancang untuk menggantikan regimen MOPP yang lebih mutagenik, dengan tingkat kesembuhan (cure rate) jangka panjang melebihi 80-90% pada stadium awal.",
    cycleProtocol: "Diberikan pada Hari ke-1 dan Hari ke-15 dalam siklus 28 hari.",
    cycleLengthDays: 28,
    totalRecommendedCycles: "2 - 4 siklus (stadium dini dengan/tanpa radiasi) atau 6 - 8 siklus (stadium lanjut)",
    components: [
      {
        drugId: "Doxorubicin",
        drugName: "Adriamycin (Doxorubicin HCl)",
        genericAlias: "Doxorubicin",
        role: "Antibiotik Antraksiklin / Inhibitor Topoisomerase II",
        dosageFormula: "25 mg/m² IV",
        defaultDoseValue: 25,
        doseUnit: "mg/m2",
        adminRoute: "IV push pelan (3-5 menit) atau infus mini 15 menit via jalur bebas hambatan",
        diluentStandard: "NaCl 0.9% 50-100 mL",
        sequenceOrder: 1,
        sequenceNote: "Berikan pertama setelah hidrasi pembuka. Wajib cek 'blood return' sebelum dan selama injeksi.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Bila terjadi ekstravasasi, kompres DINGIN kering, segera siapkan antidot Dexrazoxane atau Dimethylsulfoxide (DMSO). Batas dosis kumulatif seumur hidup: 450-500 mg/m² (kardiotoksisitas ireversibel)."
      },
      {
        drugId: "Bleomycin Sulfat",
        drugName: "Bleomycin Sulfat",
        genericAlias: "Bleomycin",
        role: "Antibiotik Glikopeptida Antitumor (Pemutus Rantai DNA)",
        dosageFormula: "10 unit/m² (atau 10 mg/m²) IV",
        defaultDoseValue: 10,
        doseUnit: "unit/m2",
        adminRoute: "IV push perlahan minimal 10 menit atau infus dalam 50-100 mL",
        diluentStandard: "NaCl 0.9% 50-100 mL atau Dextrose 5%",
        sequenceOrder: 2,
        sequenceNote: "Bilas jalur infus dengan saline 20-30 mL sebelum memulai Bleomycin.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Dapat menyebabkan pneumonitis interstisial dan fibrosis paru ireversibel (risiko meningkat tajam jika kumulatif >400 unit atau FiO2 tinggi). Wajib pantau tes fungsi paru (DLCO) dan hentikan jika timbul batuk kering/dispnea."
      },
      {
        drugId: "Vinblastin",
        drugName: "Vinblastine Sulfat",
        genericAlias: "Vinblastin",
        role: "Alkaloid Vinca / Inhibitor Polimerisasi Mikrotubulus",
        dosageFormula: "6 mg/m² IV (maksimal plafon 10 mg per pemberian)",
        defaultDoseValue: 6,
        doseUnit: "mg/m2",
        adminRoute: "IV push perlahan 1 menit ke dalam jalur infus yang sedang mengalir lancar",
        diluentStandard: "NaCl 0.9% spuit atau minibag 25-50 mL",
        sequenceOrder: 3,
        sequenceNote: "Bilas jalur infus dengan saline sebelum dan sesudah obat.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "PERINGATAN KEMATIAN: HANYA UNTUK INTRAVENA! FATAL JIKA DIBERIKAN SECARA INTRATEKAL. Bila ekstravasasi: kompres HANGAT kering dan suntikkan Hialuronidase lokal."
      },
      {
        drugId: "Dacarbazine",
        drugName: "Dacarbazine (DTIC)",
        genericAlias: "Dacarbazine",
        role: "Alkylating Agent (Triazene)",
        dosageFormula: "375 mg/m² IV",
        defaultDoseValue: 375,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 30 - 60 menit",
        diluentStandard: "NaCl 0.9% 250-500 mL atau Dextrose 5%",
        sequenceOrder: 4,
        sequenceNote: "Berikan terakhir dalam sesi. Infus dapat menimbulkan sensasi panas/nyeri sepanjang vena; perlambat laju infus bila timbul rasa perih.",
        vesicantStatus: "Iritan",
        specialPrecautions: "FOTOSENSITIF TINGGI: Larutan harus terlindung dari paparan cahaya langsung (gunakan kantong infus amber atau bungkus kertas/aluminium foil)."
      }
    ],
    premedicationProtocol: [
      "Antiemetik Golongan 5-HT3: Ondansetron 8 mg IV atau Granisetron 1 mg IV (diberikan 30 menit sebelum kemoterapi).",
      "Kortikosteroid: Dexamethasone 8-12 mg IV (efek sinergis antiemetik Dacarbazine & Doxorubicin).",
      "Antihistamin / Antipiretik: Paracetamol 500-1000 mg oral + Diphenhydramine 25-50 mg IV bila pasien berisiko reaksi alergi/demam akibat Bleomycin."
    ],
    hydrationAndProtection: [
      "Hidrasi cairan intravena: NaCl 0.9% 500 mL sebelum dan sesudah kemoterapi.",
      "Pembilasan berkala (Flush): Minimal 20-30 mL NaCl 0.9% di antara tiap obat sitostatika untuk mencegah kontak langsung antar obat."
    ],
    vitalMonitoring: [
      "Hitung Darah Lengkap (CBC & ANC): Evaluasi neutrofil absolut (ANC minimal ≥1000/mcL dan trombosit ≥100.000/mcL sebelum siklus berikutnya).",
      "Fungsi Paru: Auskultasi toraks sebelum tiap siklus; waspadai ronkhi basah halus basal atau batuk iritatif (tanda awal toksisitas paru Bleomycin).",
      "Fungsi Jantung: Ekokardiografi berkala untuk memantau Fraksi Ejeksi Ventrikel Kiri (LVEF)."
    ],
    organToxicities: [
      {
        organ: "Paru-paru (Pulmonary Fibrosis)",
        responsibleDrug: "Bleomycin",
        manifestation: "Batuk non-produktif progresif, sesak napas saat aktivitas, penurunan kapasitas difusi karbon monoksida (DLCO).",
        preventionStrategy: "Membatasi dosis kumulatif <400 unit, tes fungsi paru awal dan serial, hindari konsentrasi oksigen fraksi tinggi (FiO2 >30%) jika pasien menjalani anestesi/operasi umum."
      },
      {
        organ: "Jantung (Kardiomiopati Dilatasi)",
        responsibleDrug: "Doxorubicin",
        manifestation: "Gagal jantung kongestif refrakter, penurunan LVEF >10% dari nilai dasar.",
        preventionStrategy: "Batasi dosis kumulatif seumur hidup <450-500 mg/m², pemeriksaan ekokardiografi berkala, pertimbangkan Dexrazoxane pada dosis tinggi."
      },
      {
        organ: "Saraf Perifer (Neuropati Perifer)",
        responsibleDrug: "Vinblastine",
        manifestation: "Kebas, parestesia ujung jari tangan/kaki, konstipasi parah / ileus paralitik (neurotoksisitas otonom).",
        preventionStrategy: "Edukasi laksatif profilaksis, evaluasi refleks tendon dalam, reduksi dosis bila timbul neuropati grade 2+."
      }
    ],
    clinicalPearls: [
      "Urin pasien dapat berwarna kemerahan selama 1-2 hari setelah Doxorubicin; beri tahu pasien bahwa ini adalah ekskresi normal obat, bukan perdarahan hematuria.",
      "Bleomycin dapat memicu reaksi pireksia mendadak dan menggigil 2-6 jam pasca infus; premedikasi paracetamol sangat dianjurkan."
    ],
    references: "NCCN Clinical Practice Guidelines in Oncology: Hodgkin Lymphoma; BC Cancer Agency Protocol LOHDABVD; ASHP Injectable Drugs Guide."
  },
  {
    id: "r_chop",
    acronym: "R-CHOP",
    fullName: "Rituximab, Cyclophosphamide, Hydroxydaunorubicin (Doxorubicin), Oncovin (Vincristine), Prednisone",
    cancerCategory: "limfoma",
    cancerCategoryLabel: "Limfoma",
    cancerTypeDetail: "Limfoma Non-Hodgkin Sel B (Diffuse Large B-Cell Lymphoma / DLBCL, Follicular Lymphoma)",
    applicableGoals: ["curative", "adjuvant", "palliative"],
    primaryGoalHighlight: "Kuratif / Primer (Standar terapi kuratif lini pertama DLBCL CD20+)",
    overview: "Regimen R-CHOP merupakan kombinasi imunokemoterapi terpenting di dunia onkologi hematologi, menambahkan antibodi monoklonal anti-CD20 (Rituximab) ke dalam tulang punggung kemoterapi CHOP. Kombinasi ini meningkatkan kesintasan hidup menyeluruh (Overall Survival) hingga 70-80% pada DLBCL.",
    cycleProtocol: "Diulang setiap 21 hari (R-CHOP-21) atau setiap 14 hari dengan dukungan G-CSF (R-CHOP-14).",
    cycleLengthDays: 21,
    totalRecommendedCycles: "6 - 8 siklus tergantung stadium dan skor IPI (International Prognostic Index)",
    components: [
      {
        drugId: "Rituximab",
        drugName: "Rituximab (MabThera)",
        genericAlias: "Rituximab",
        role: "Antibodi Monoklonal Anti-CD20 (Imunoterapi)",
        dosageFormula: "375 mg/m² IV",
        defaultDoseValue: 375,
        doseUnit: "mg/m2",
        adminRoute: "IV infus bertahap: mulai 50 mg/jam, naikkan 50 mg/jam setiap 30 menit hingga maksimal 400 mg/jam bila dapat ditoleransi",
        diluentStandard: "NaCl 0.9% 500 mL (atau Dextrose 5%)",
        sequenceOrder: 1,
        sequenceNote: "Wajib diberikan pertama kali pada Hari ke-1. Premedikasi lengkap 30 menit sebelumnya adalah syarat mutlak.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Risiko sindrom pelepasan sitokin / reaksi anafilaktoid tinggi pada infus pertama. Hentikan segera jika timbul bronkospasme, hipotensi mendadak, atau angioedema."
      },
      {
        drugId: "Cyclophosphamid",
        drugName: "Cyclophosphamide (Endoxan)",
        genericAlias: "Cyclophosphamid",
        role: "Alkylating Agent (Oxazaphosphorine)",
        dosageFormula: "750 mg/m² IV",
        defaultDoseValue: 750,
        doseUnit: "mg/m2",
        adminRoute: "IV infus dalam 250-500 mL selama 30 - 60 menit",
        diluentStandard: "NaCl 0.9% 250-500 mL atau Dextrose 5%",
        sequenceOrder: 2,
        sequenceNote: "Berikan setelah infus Rituximab selesai dan dibilas.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Metabolit akrolein diekskresikan melalui urin dan mengiritasi mukosa buli-buli (sistitis hemoragik). Anjurkan pasien minum air 2-3 liter/hari atau berikan hidrasi IV yang memadai."
      },
      {
        drugId: "Doxorubicin",
        drugName: "Hydroxydaunorubicin (Doxorubicin HCl)",
        genericAlias: "Doxorubicin",
        role: "Antraksiklin / Interkalator DNA",
        dosageFormula: "50 mg/m² IV",
        defaultDoseValue: 50,
        doseUnit: "mg/m2",
        adminRoute: "IV push lambat 3-5 menit melalui saluran infus intravena yang mengalir deras",
        diluentStandard: "NaCl 0.9% 50-100 mL",
        sequenceOrder: 3,
        sequenceNote: "Verifikasi kepatenan akses vena. JANGAN campur dengan Heparin (terjadi presipitasi).",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Batas kumulatif seumur hidup 450-500 mg/m². Pada pasien lansia dengan penyakit kardiovaskular, pertimbangkan formulasi Liposomal Doxorubicin atau regimen tanpa antraksiklin (R-CEOP)."
      },
      {
        drugId: "Vincristine",
        drugName: "Oncovin (Vincristine Sulfat)",
        genericAlias: "Vincristine",
        role: "Alkaloid Vinca / Antimitotik Fase M",
        dosageFormula: "1.4 mg/m² IV (Wajib capping / batas maksimal 2.0 mg per dosis tunggal)",
        defaultDoseValue: 1.4,
        doseUnit: "mg/m2",
        adminRoute: "IV push perlahan minimal 1 menit atau infus mini 25-50 mL dalam 5-10 menit",
        diluentStandard: "NaCl 0.9% 25-50 mL minibag",
        sequenceOrder: 4,
        sequenceNote: "Labeli kantong secara mencolok: 'WARNING: FOR INTRAVENOUS USE ONLY - FATAL IF GIVEN BY OTHER ROUTES'.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Dosis TIDAK BOLEH melebihi 2 mg untuk menghindari neurotoksisitas motorik-sensorik permanen dan ileus paralitik berat."
      },
      {
        drugId: "Prednisone_Oral",
        drugName: "Prednisone (Kortikosteroid Oral)",
        genericAlias: "Prednisone",
        role: "Glukokortikoid (Anti-inflamasi, Limfolitik & Antiemetik)",
        dosageFormula: "100 mg Oral per hari",
        defaultDoseValue: 100,
        doseUnit: "mg_flat",
        adminRoute: "Oral (diminum sesudah makan pagi) selama 5 hari berturut-turut (Hari ke-1 s/d Hari ke-5)",
        diluentStandard: "Bentuk Tablet Oral (Jika pasien tidak bisa oral: Methylprednisolone 80 mg IV)",
        sequenceOrder: 5,
        sequenceNote: "Diberikan bersamaan pada hari ke-1 dan dilanjutkan hari ke-2 hingga ke-5 di rumah.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau kadar glukosa darah pada pasien diabetes melitus, waspadai insomnia, dispepsia peptikum, dan perubahan mood sementara."
      }
    ],
    premedicationProtocol: [
      "Premedikasi Wajib Rituximab (30 menit sebelum infus): Paracetamol 650-1000 mg PO + Diphenhydramine 50 mg IV/PO + Dexamethasone 10-20 mg IV (atau Prednisone hari 1).",
      "Antiemetik: Ondansetron 8 mg IV atau Palonosetron 0.25 mg IV + Dexamethasone."
    ],
    hydrationAndProtection: [
      "Hidrasi intravena: NaCl 0.9% 1000 mL untuk memicu diuresis dan mencegah nefropati asam urat.",
      "Profilaksis Tumor Lysis Syndrome (TLS): Allopurinol 300 mg/hari oral (atau Rasburicase jika asam urat sangat tinggi) terutama pada massa tumor bulky.",
      "G-CSF (Filgrastim 300 mcg SC): Diberikan mulai hari ke-6 hingga ke-10 untuk mencegah sepsis neutropenia pasca kemo."
    ],
    vitalMonitoring: [
      "Tekanan Darah, Nadi, Laju Napas, Suhu: Setiap 15 menit selama 1 jam pertama infus Rituximab.",
      "Skrining Hepatitis B (HBsAg & Anti-HBc): Wajib dicek sebelum memulai Rituximab; jika positif, berikan profilaksis Tenofovir/Entecavir untuk mencegah reaktivasi hepatitis fulminan.",
      "Ekokardiografi: Fraksi ejeksi ventrikel kiri (LVEF) sebelum siklus 1 dan setelah siklus 4."
    ],
    organToxicities: [
      {
        organ: "Sistem Imun / Saluran Napas",
        responsibleDrug: "Rituximab",
        manifestation: "Infusion-Related Reactions (demam, menggigil, hipotensi, bronkospasme, urtikaria), reaktivasi infeksi oportunistik.",
        preventionStrategy: "Titrasi laju infus pelan pada infus awal, premedikasi tripel, skrining serologi hepatitis B sebelum terapi."
      },
      {
        organ: "Saluran Kemih (Kandung Kemih)",
        responsibleDrug: "Cyclophosphamide",
        manifestation: "Sistitis hemoragik (disuria, hematuria makroskopis akibat iritasi metabolit akrolein).",
        preventionStrategy: "Hidrasi cairan oral/IV berlimpah minimal 2 liter per hari, berkemih sering tiap 2 jam, pertimbangkan Mesna bila dosis tinggi."
      },
      {
        organ: "Sistem Saraf Otonom & Perifer",
        responsibleDrug: "Vincristine",
        manifestation: "Neuropati sensorik jari, hilangnya refleks tendon Achilles, obstipasi berat / impaksi feses.",
        preventionStrategy: "Batas ketat dosis maksimal 2 mg, peresepan laksatif pelunak tinja sejak hari pertama."
      }
    ],
    clinicalPearls: [
      "Vincristine tidak boleh disiapkan dalam spuit tanpa pengaman karena risiko tertukar dengan rute intratekal yang berakibat fatal.",
      "Reaksi infus Rituximab paling sering terjadi pada siklus ke-1; pada siklus ke-2 dan seterusnya infus biasanya dapat dipercepat."
    ],
    references: "NCCN Guidelines B-Cell Lymphomas; Coiffier B et al. NEJM (GELA Study); ASHP Injectable Safety Guide."
  },
  {
    id: "folfox",
    acronym: "FOLFOX",
    fullName: "Folinic Acid (Leucovorin), Fluorouracil (5-FU), Oxaliplatin (mFOLFOX6)",
    cancerCategory: "kolorektal",
    cancerCategoryLabel: "Kanker Kolorektal / Usus",
    cancerTypeDetail: "Kanker Kolorektal (Karsinoma Kolon Stadium III Adjuvan, Stadium II Risiko Tinggi, atau Stadium IV Metastatik)",
    applicableGoals: ["adjuvant", "neoadjuvant", "curative", "palliative"],
    primaryGoalHighlight: "Adjuvan & Neoadjuvan (Standar terapi pasca operasi kanker usus besar & rektum)",
    overview: "Regimen mFOLFOX6 adalah protokol kemoterapi tulang punggung berbasis platinum dan fluoropirimidin untuk kanker kolorektal. Sebagai terapi adjuvan, FOLFOX terbukti menurunkan risiko kekambuhan dan meningkatkan Overall Survival hingga 20-30% dibanding 5-FU tunggal.",
    cycleProtocol: "Diulang setiap 14 hari (2 minggu) selama total 12 siklus (durasi 6 bulan).",
    cycleLengthDays: 14,
    totalRecommendedCycles: "12 siklus (atau 6 siklus / 3 bulan untuk tumor risiko rendah T1-3N1 berdasarkan studi IDEA)",
    components: [
      {
        drugId: "Oxaliplatin",
        drugName: "Oxaliplatin (Eloxatin)",
        genericAlias: "Oxaliplatin",
        role: "Derivat Organoplatinum / Inhibitor Replikasi DNA",
        dosageFormula: "85 mg/m² IV",
        defaultDoseValue: 85,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 2 jam (dapat simultan via Y-site dengan Leucovorin)",
        diluentStandard: "Larutan Dextrosa 5% (D5W) 250 - 500 mL",
        diluentForbidden: "DILARANG KERAS menggunakan NaCl 0.9% atau pelarut mengandung ion Klorida!",
        sequenceOrder: 1,
        sequenceNote: "Diberikan bersamaan atau mendahului infus 5-FU. Jalur infus WAJIB dibilas dengan D5W sebelum dan sesudah Oxaliplatin.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Ion klorida menyebabkan presipitasi dan degradasi cepat Oxaliplatin. Efek samping khas: NEUROPATI AKUT TERPACU DINGIN (hindari minum es, makanan dingin, atau menyentuh benda logam dingin selama 3-5 hari pasca infus)."
      },
      {
        drugId: "Folinic Acid",
        drugName: "Leucovorin (Kalsium Folinat / Asam Folinat)",
        genericAlias: "Leucovorin",
        role: "Biomodulator Fluoropirimidin (Stabilisator Kompleks Enzim)",
        dosageFormula: "400 mg/m² IV (atau 200 mg/m² bentuk d,l)",
        defaultDoseValue: 400,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 2 jam dalam D5W secara simultan via Y-site bersama Oxaliplatin",
        diluentStandard: "Larutan Dextrosa 5% (D5W) 250 mL",
        sequenceOrder: 2,
        sequenceNote: "Leucovorin mengikat kuat timidilat sintase dan memperpanjang hambatan oleh fluorouracil.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Bila terjadi kelangkaan Leucovorin, Levoleucovorin dapat dipakai dengan separuh dosis (200 mg/m²)."
      },
      {
        drugId: "Fluorourasil",
        drugName: "Fluorouracil Bolus (5-FU Bolus)",
        genericAlias: "Fluorouracil",
        role: "Antimetabolit Analog Pirimidin (Inhibitor Timidilat Sintase)",
        dosageFormula: "400 mg/m² IV",
        defaultDoseValue: 400,
        doseUnit: "mg/m2",
        adminRoute: "IV push lambat 5-10 menit segera setelah infus Oxaliplatin/Leucovorin selesai",
        diluentStandard: "Langsung tanpa pengenceran atau dilarutkan dalam 50 mL NaCl 0.9%",
        sequenceOrder: 3,
        sequenceNote: "Bilas jalur infus dengan saline sebelum menyambungkan pompa infus kontinu.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Pasien dengan defisiensi enzim DPD (Dihydropyrimidine Dehydrogenase) berisiko mengalami toksisitas mematikan akibat penumpukan 5-FU."
      },
      {
        drugId: "Fluorourasil",
        drugName: "Fluorouracil Infus Kontinu (5-FU Continuous Infusion)",
        genericAlias: "Fluorouracil",
        role: "Antimetabolit Analog Pirimidin",
        dosageFormula: "2400 mg/m² IV Infus Kontinu",
        defaultDoseValue: 2400,
        doseUnit: "mg/m2",
        adminRoute: "IV infus kontinu tanpa henti selama 46 - 48 jam menggunakan elastomeric pump / infus portabel",
        diluentStandard: "NaCl 0.9% secukupnya sesuai volume reservoir elastomeric pump",
        sequenceOrder: 4,
        sequenceNote: "Dimulai setelah bolus selesai; pasien dapat pulang dengan pompa kemoterapi rawat jalan.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Awasi mukositis oral, diare berat, dan sindrom tangan-kaki (Hand-Foot Syndrome/Palmar-Plantar Erythrodysesthesia)."
      }
    ],
    premedicationProtocol: [
      "Antiemetik Emetogenik Sedang: Ondansetron 8-16 mg IV atau Granisetron 1-2 mg IV.",
      "Kortikosteroid: Dexamethasone 10-12 mg IV (Hari 1), dilanjutkan oral 4-8 mg pada Hari 2-3.",
      "Profilaksis Neuropati: Edukasi pasien mengenakan sarung tangan, syal, dan kaus kaki saat cuaca dingin."
    ],
    hydrationAndProtection: [
      "Infus bilas Dextrose 5% 100 mL sebelum dan sesudah Oxaliplatin untuk memastikan tidak ada residu ion klorida.",
      "Bilas jalur port-a-cath dengan heparin lock setelah pompa 46 jam dilepas di hari ke-3."
    ],
    vitalMonitoring: [
      "Pemeriksaan Darah Lengkap: Pantau leukopenia, trombositopenia (Oxaliplatin dapat menekan trombosit).",
      "Tes Fungsi Hati (Bilirubin, SGOT/SGPT) & Ginjal (Ureum, Kreatinin).",
      "Skrining Defisiensi DPD (Dihydropyrimidine Dehydrogenase) bila memungkinkan."
    ],
    organToxicities: [
      {
        organ: "Sistem Saraf Sensorik (Neuropati Perifer)",
        responsibleDrug: "Oxaliplatin",
        manifestation: "Disestesia/parestesia faringolaringeal yang dipicu dingin (sensasi tercekik atau sulit menelan), kebas distal kronik kumulatif.",
        preventionStrategy: "Hindari paparan dingin, perpanjang waktu infus Oxaliplatin menjadi 6 jam jika terjadi spasme tenggorokan akut, reduksi dosis 20% jika neuropati persisten."
      },
      {
        organ: "Saluran Cerna & Mukosa",
        responsibleDrug: "Fluorouracil (5-FU)",
        manifestation: "Stomatitis / ulkus oral yang nyeri, diare profus berair, deskuamasi telapak tangan dan kaki (Hand-Foot Syndrome).",
        preventionStrategy: "Krioterapi oral (mengisap serpihan es batu selama bolus 5-FU), rehidrasi agresif dan Loperamide untuk diare."
      },
      {
        organ: "Jantung (Vasospasme Koroner)",
        responsibleDrug: "Fluorouracil (5-FU)",
        manifestation: "Nyeri dada mirip angina pectoris, iskemia miokard, aritmia ventrikel.",
        preventionStrategy: "Hentikan segera infus 5-FU jika timbul angina, berikan nitrat/calcium channel blocker, hindari pemberian ulang 5-FU."
      }
    ],
    clinicalPearls: [
      "Pasien harus diinstruksikan untuk tidak minum air dingin atau membuka kulkas tanpa sarung tangan selama 3-5 hari pertama pasca Oxaliplatin.",
      "Krioterapi oral (mengisap serpihan es selama 10-15 menit saat injeksi bolus 5-FU) terbukti secara signifikan menurunkan keparahan stomatitis oral."
    ],
    references: "NCCN Guidelines Colon & Rectal Cancer; MOSAIC Trial (Andre T et al. NEJM); IDEA Collaboration."
  },
  {
    id: "folfiri",
    acronym: "FOLFIRI",
    fullName: "Folinic Acid (Leucovorin), Fluorouracil (5-FU), Irinotecan (Camptosar)",
    cancerCategory: "kolorektal",
    cancerCategoryLabel: "Kanker Kolorektal / Usus",
    cancerTypeDetail: "Kanker Kolorektal Lanjut / Metastatik (Lini Pertama atau Lini Kedua dengan/tanpa Target Therapy)",
    applicableGoals: ["palliative", "neoadjuvant"],
    primaryGoalHighlight: "Paliatif & Neoadjuvan (Lini pertama/kedua metastasis kanker usus besar)",
    overview: "Regimen FOLFIRI menggabungkan Irinotecan (inhibitor topoisomerase I) dengan modulasi 5-FU/Leucovorin. Protokol ini sering dipasangkan dengan terapi target seperti Cetuximab/Panitumumab (pada status RAS wild-type) atau Bevacizumab (anti-VEGF).",
    cycleProtocol: "Diulang setiap 14 hari (2 minggu).",
    cycleLengthDays: 14,
    totalRecommendedCycles: "Sesuai respons klinis dan toleransi pasien (hingga progresi penyakit atau toksisitas berat)",
    components: [
      {
        drugId: "Irinotecan",
        drugName: "Irinotecan HCl (Camptosar / CPT-11)",
        genericAlias: "Irinotecan",
        role: "Inhibitor Enzim Topoisomerase I",
        dosageFormula: "180 mg/m² IV",
        defaultDoseValue: 180,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 90 menit",
        diluentStandard: "Larutan Dextrosa 5% (D5W) atau NaCl 0.9% 250 - 500 mL",
        sequenceOrder: 1,
        sequenceNote: "Diberikan pertama kali dalam sesi. Dextrose 5% lebih disukai karena stabilitas pH sedikit asam.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Risiko sindrom kolinergik akut (keringat dingin, salivasi, kram perut, diare dini dalam 24 jam pertama) -> tangani dengan Atropin 0.25-0.5 mg SC/IV. Risiko diare lambat (>24 jam) -> tangani dengan Loperamide dosis tinggi."
      },
      {
        drugId: "Folinic Acid",
        drugName: "Leucovorin (Kalsium Folinat)",
        genericAlias: "Leucovorin",
        role: "Biomodulator Fluorouracil",
        dosageFormula: "400 mg/m² IV",
        defaultDoseValue: 400,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 2 jam (dapat simultan dengan Irinotecan via Y-site)",
        diluentStandard: "Larutan Dextrosa 5% atau NaCl 0.9% 250 mL",
        sequenceOrder: 2,
        sequenceNote: "Diberikan bersama atau segera setelah Irinotecan.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Bilas jalur infus sebelum bolus 5-FU."
      },
      {
        drugId: "Fluorourasil",
        drugName: "Fluorouracil Bolus (5-FU Bolus)",
        genericAlias: "Fluorouracil",
        role: "Antimetabolit Analog Pirimidin",
        dosageFormula: "400 mg/m² IV",
        defaultDoseValue: 400,
        doseUnit: "mg/m2",
        adminRoute: "IV push pelan 5-10 menit",
        diluentStandard: "NaCl 0.9% 50 mL atau langsung",
        sequenceOrder: 3,
        sequenceNote: "Bilas jalur intravena dengan saline steril.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Dapat dihilangkan pada pasien usia lanjut atau rentan toksisitas mielosupresif."
      },
      {
        drugId: "Fluorourasil",
        drugName: "Fluorouracil Infus Kontinu (5-FU Continuous Infusion)",
        genericAlias: "Fluorouracil",
        role: "Antimetabolit Analog Pirimidin",
        dosageFormula: "2400 mg/m² IV Infus Kontinu",
        defaultDoseValue: 2400,
        doseUnit: "mg/m2",
        adminRoute: "IV infus kontinu 46 - 48 jam dengan pompa portabel",
        diluentStandard: "NaCl 0.9% via elastomeric pump",
        sequenceOrder: 4,
        sequenceNote: "Infus kontinu mandiri di rumah selama 2 hari.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Waspadai dehidrasi akibat diare lambat Irinotecan yang diperparah oleh 5-FU."
      }
    ],
    premedicationProtocol: [
      "Profilaksis Kolinergik Akut: Atropin Sulfat 0.25 - 0.5 mg SC atau IV pelan (diberikan sebelum atau segera saat timbul kram/salivasi/diare dini).",
      "Antiemetik: Ondansetron 8 mg IV + Dexamethasone 10-12 mg IV."
    ],
    hydrationAndProtection: [
      "Hidrasi cairan NaCl 0.9% 500 mL sebelum dan sesudah kemoterapi.",
      "Protokol 'Loperamide Dosis Tinggi' wajib disiapkan di rumah: minum 4 mg saat tinja cair pertama, lalu 2 mg setiap 2 jam sampai bebas diare selama 12 jam (maksimal 16 mg/hari)."
    ],
    vitalMonitoring: [
      "Hitung Darah Lengkap (CBC): Monitor neutropenia berat (nadir hari ke 10-14).",
      "Status Polimorfisme Gen UGT1A1: Pasien dengan alel UGT1A1*28 homozigot berisiko tinggi mengalami toksisitas diare dan neutropenia berat."
    ],
    organToxicities: [
      {
        organ: "Saluran Cerna Bawah (Diare)",
        responsibleDrug: "Irinotecan",
        manifestation: "Diare akut dini (kolinergik, <24 jam) dan Diare lambat parah sekretorik (>24 jam) yang dapat memicu dehidrasi dan syok hipovolemik.",
        preventionStrategy: "Atropin untuk diare dini; Loperamide dosis tinggi segera untuk diare lambat; antibiotik profilaksis Ciprofloxacin bila diare disertai demam neutropenia."
      },
      {
        organ: "Sumsum Tulang (Mielosupresi)",
        responsibleDrug: "Irinotecan + 5-FU",
        manifestation: "Neutropenia derajat 3-4, infeksi oportunistik sekunder.",
        preventionStrategy: "Pertimbangkan G-CSF sekunder, evaluasi genetik UGT1A1 jika neutropenia berulang."
      }
    ],
    clinicalPearls: [
      "Ingat kaidah klinis: 'I run to the can' untuk Irinotecan (menandakan risiko diare tinggi). Pasien harus dibekali Loperamide sebelum pulang ke rumah.",
      "Jika diare lambat tidak membaik dalam 48 jam dengan Loperamide, pasien harus segera dirawat inap untuk rehidrasi IV dan terapi Octreotide SC."
    ],
    references: "NCCN Guidelines Colon/Rectal Cancer; Tournigand C et al. J Clin Oncol; Douillard JY et al. Lancet."
  },
  {
    id: "tchp",
    acronym: "TCHP",
    fullName: "Docetaxel (Taxotere), Carboplatin, Trastuzumab (Herceptin), Pertuzumab (Perjeta)",
    cancerCategory: "payudara",
    cancerCategoryLabel: "Kanker Payudara",
    cancerTypeDetail: "Kanker Payudara HER2-Positif (Stadium II - III Neoadjuvan/Adjuvan atau Kanker Payudara Inflamatorik)",
    applicableGoals: ["neoadjuvant", "adjuvant"],
    primaryGoalHighlight: "Neoadjuvan Pilihan Utama (Mengecilkan massa payudara dan mengejar pCR tinggi pada HER2+)",
    overview: "Regimen TCHP adalah regimen non-antraksiklin baku emas untuk kanker payudara HER2-positif stadium lokal lanjut. Regimen ini memberikan blokade ganda HER2 (dual HER2-inhibition) dengan menggabungkan Pertuzumab dan Trastuzumab bersama Docetaxel dan Carboplatin. Menghasilkan angka Pathological Complete Response (pCR) mendekati 60-70% tanpa risiko kardiotoksisitas berat antraksiklin.",
    cycleProtocol: "Diulang setiap 21 hari (setiap 3 minggu) selama 6 siklus.",
    cycleLengthDays: 21,
    totalRecommendedCycles: "6 siklus neoadjuvan (diikuti kelanjutan Trastuzumab + Pertuzumab rumatan pasca operasi hingga genap 1 tahun)",
    components: [
      {
        drugId: "Pertuzumab",
        drugName: "Pertuzumab (Perjeta)",
        genericAlias: "Pertuzumab",
        role: "Antibodi Monoklonal Penghambat Dimerisasi HER2/HER3",
        dosageFormula: "Dosis Awal (Loading): 840 mg IV; Dosis Rumatan: 420 mg IV",
        defaultDoseValue: 840,
        doseUnit: "mg_flat",
        adminRoute: "IV infus 60 menit (loading) dilanjutkan 30-60 menit (rumatan)",
        diluentStandard: "NaCl 0.9% 250 mL",
        diluentForbidden: "Dilarang menggunakan larutan Dextrose (memicu instabilitas konformasi protein)!",
        sequenceOrder: 1,
        sequenceNote: "Diberikan pertama kali dalam urutan, mendahului Trastuzumab.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "JANGAN dikocok (dapat memicu agregasi busa protein). Observasi pasien minimal 60 menit setelah infus loading pertama."
      },
      {
        drugId: "Trastuzumab",
        drugName: "Trastuzumab (Herceptin)",
        genericAlias: "Trastuzumab",
        role: "Antibodi Monoklonal Penarget Domain Ekstraseluler HER2",
        dosageFormula: "Dosis Awal (Loading): 8 mg/kg IV; Dosis Rumatan: 6 mg/kg IV",
        defaultDoseValue: 8,
        doseUnit: "mg/kg",
        adminRoute: "IV infus 90 menit (loading) dilanjutkan 30 menit (rumatan jika ditoleransi baik)",
        diluentStandard: "NaCl 0.9% 250 mL",
        diluentForbidden: "Dilarang dilarutkan dalam larutan glukosa / Dekstrosa 5%!",
        sequenceOrder: 2,
        sequenceNote: "Bilas jalur infus dengan NaCl 0.9% sebelum dan sesudah obat.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Pantau fungsi ejeksi jantung (LVEF) sebelum terapi dan setiap 3 bulan; hentikan jika terjadi penurunan LVEF signifikan."
      },
      {
        drugId: "Docetaxel",
        drugName: "Docetaxel (Taxotere)",
        genericAlias: "Docetaxel",
        role: "Golongan Taxane / Penstabil Mikrotubulus",
        dosageFormula: "75 mg/m² IV",
        defaultDoseValue: 75,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 60 menit",
        diluentStandard: "NaCl 0.9% atau Dextrose 5% 250 mL",
        sequenceOrder: 3,
        sequenceNote: "Gunakan set infus bebas DEHP / non-PVC dengan filter in-line 0.22 mikron.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Wajib premedikasi Dexamethasone oral selama 3 hari (mulai 1 hari sebelum kemo) untuk mencegah retensi cairan berat (edema anasarka/efusi pleura) dan reaksi anafilaktoid."
      },
      {
        drugId: "Carboplatin",
        drugName: "Carboplatin (Paraplatin)",
        genericAlias: "Carboplatin",
        role: "Alkylating-Like Platinum Agent",
        dosageFormula: "AUC 6 (Dihitung dengan rumus Calvert: Dosis = AUC × [GFR + 25])",
        defaultDoseValue: 6,
        doseUnit: "AUC",
        adminRoute: "IV infus selama 30 - 60 menit",
        diluentStandard: "Larutan Dextrosa 5% atau NaCl 0.9% 250 - 500 mL",
        sequenceOrder: 4,
        sequenceNote: "Diberikan terakhir dalam sesi kemoterapi.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Batas klirens kreatinin maksimum yang dimasukkan dalam rumus Calvert adalah 125 mL/menit (dosis maksimal AUC 6 biasanya dibatasi 900 mg)."
      }
    ],
    premedicationProtocol: [
      "Kortikosteroid Wajib Docetaxel: Dexamethasone 8 mg oral dua kali sehari selama 3 hari berturut-turut (mulai 24 jam sebelum kemoterapi).",
      "Antiemetik Profilaksis: Palonosetron 0.25 mg IV atau Ondansetron 8-16 mg IV + Dexamethasone IV Hari 1.",
      "Antihistamin: Diphenhydramine 50 mg IV + Ranitidine 50 mg IV sebelum antibodi monoklonal."
    ],
    hydrationAndProtection: [
      "Hidrasi cairan standar: NaCl 0.9% 500 mL sebelum dan sesudah Carboplatin.",
      "Dukungan Faktor Pertumbuhan Hematopoietik Wajib: Pegfilgrastim 6 mg SC (dosis tunggal 24 jam pasca kemo) atau Filgrastim 300 mcg SC selama 5-7 hari karena risiko neutropenia febril tinggi pada regimen TCHP."
    ],
    vitalMonitoring: [
      "Fraksi Ejeksi Ventrikel Kiri (LVEF): Wajib diukur via Ekokardiografi sebelum siklus 1 dan setiap 3 bulan selama terapi ganda anti-HER2.",
      "Darah Lengkap & ANC: Evaluasi ketat pada hari ke-14 dan sebelum siklus berikutnya.",
      "Elektrolit serum (Kalium, Magnesium) dan fungsi ginjal."
    ],
    organToxicities: [
      {
        organ: "Jantung (Kardiotoksisitas Asimtomatik / Disfungsi Sistolik)",
        responsibleDrug: "Trastuzumab + Pertuzumab",
        manifestation: "Penurunan LVEF tanpa gejala atau timbul sesak napas saat aktivitas fisik.",
        preventionStrategy: "Monitoring serial ekokardiografi; sifat kardiotoksisitas antibodi monoklonal umumnya reversibel setelah penghentian sementara."
      },
      {
        organ: "Vaskular / Jaringan Lunak (Retensi Cairan Berat)",
        responsibleDrug: "Docetaxel",
        manifestation: "Edema perifer bilateral, asites, efusi pleura atau efusi perikardial.",
        preventionStrategy: "Kepatuhan ketat konsumsi premedikasi Dexamethasone oral 3 hari (1 hari sebelum, saat kemo, dan 1 hari sesudah)."
      },
      {
        organ: "Sumsum Tulang (Trombositopenia & Neutropenia)",
        responsibleDrug: "Carboplatin + Docetaxel",
        manifestation: "Nadir darah hari ke-10 hingga 14; risiko tinggi demam neutropenia.",
        preventionStrategy: "Profilaksis primer G-CSF (Pegfilgrastim) pada setiap siklus kemoterapi."
      }
    ],
    clinicalPearls: [
      "TCHP menghindari pemakaian Doxorubicin (Antraksiklin), sehingga mengurangi risiko kerusakan miosit jantung jangka panjang secara dramatis.",
      "Untuk menghitung dosis Carboplatin AUC 6, gunakan kalkulator CrCl Cockcroft-Gault yang tersedia di aplikasi ini."
    ],
    references: "NCCN Guidelines Breast Cancer; NeoSphere Trial (Gianni L et al. Lancet Oncol); TRYPHAENA Study; BC Cancer Protocol."
  },
  {
    id: "fac",
    acronym: "FAC",
    fullName: "Fluorouracil (5-FU), Adriamycin (Doxorubicin), Cyclophosphamide",
    cancerCategory: "payudara",
    cancerCategoryLabel: "Kanker Payudara",
    cancerTypeDetail: "Kanker Payudara (Karsinoma Duktal Invasif Stadium Dini & Lanjut Lokal)",
    applicableGoals: ["adjuvant", "neoadjuvant", "palliative"],
    primaryGoalHighlight: "Adjuvan & Neoadjuvan (Regimen antraksiklin klasik kanker payudara)",
    overview: "Regimen FAC adalah salah satu kombinasi sitostatika antraksiklin klasik paling sering digunakan di rumah sakit di seluruh dunia untuk kanker payudara operabel dan pasca mastektomi. Regimen ini efektif membasmi mikrometastasis sel tumor payudara yang agresif.",
    cycleProtocol: "Diulang setiap 21 hari (setiap 3 minggu) selama 6 siklus.",
    cycleLengthDays: 21,
    totalRecommendedCycles: "6 siklus terencana",
    components: [
      {
        drugId: "Fluorourasil",
        drugName: "Fluorouracil (5-FU)",
        genericAlias: "Fluorouracil",
        role: "Analog Antimetabolit Pirimidin",
        dosageFormula: "500 mg/m² IV",
        defaultDoseValue: 500,
        doseUnit: "mg/m2",
        adminRoute: "IV push lambat 5-10 menit atau infus mini 100 mL",
        diluentStandard: "NaCl 0.9% 50-100 mL",
        sequenceOrder: 1,
        sequenceNote: "Diberikan pertama kali dalam rangkaian infus.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Dapat menimbulkan fotosensitivitas dan hiperpigmentasi pada jalur vena yang diinfus."
      },
      {
        drugId: "Doxorubicin",
        drugName: "Adriamycin (Doxorubicin HCl)",
        genericAlias: "Doxorubicin",
        role: "Antibiotik Antraksiklin",
        dosageFormula: "50 mg/m² IV",
        defaultDoseValue: 50,
        doseUnit: "mg/m2",
        adminRoute: "IV push lambat 3-5 menit melalui saline yang mengalir lancar",
        diluentStandard: "NaCl 0.9% 50-100 mL",
        sequenceOrder: 2,
        sequenceNote: "Bilas jalur infus secara adekuat sebelum menyuntikkan Doxorubicin.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Batas kumulatif maksimal seumur hidup: 450 mg/m². Urin pasien akan berwarna merah (merah muda sampai jingga) selama 24-48 jam pasca infus."
      },
      {
        drugId: "Cyclophosphamid",
        drugName: "Cyclophosphamide (Endoxan)",
        genericAlias: "Cyclophosphamid",
        role: "Alkylating Agent (Mustard Nitrogen)",
        dosageFormula: "500 mg/m² IV",
        defaultDoseValue: 500,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 30 - 60 menit",
        diluentStandard: "NaCl 0.9% 250 mL atau Dextrose 5%",
        sequenceOrder: 3,
        sequenceNote: "Diberikan terakhir dalam sesi kemoterapi.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Memicu sistitis hemoragik akibat akumulasi metabolit akrolein; anjurkan minum air melimpah 2-3 liter/hari."
      }
    ],
    premedicationProtocol: [
      "Antiemetik Potensi Tinggi: Ondansetron 8-16 mg IV atau Granisetron 1-2 mg IV + Dexamethasone 12 mg IV (Hari 1).",
      "Kombinasi Antagonis Reseptor NK1 (Aprepitant 125 mg PO Hari 1, lalu 80 mg PO Hari 2-3) sangat direkomendasikan pada regimen berbasis Doxorubicin/Cyclophosphamide.",
      "Antiemetik Lanjutan: Dexamethasone 4-8 mg PO dua kali sehari Hari 2-3."
    ],
    hydrationAndProtection: [
      "Hidrasi cairan intravena: NaCl 0.9% 1000 mL sebelum dan sesudah kemoterapi untuk mencegah iritasi kandung kemih.",
      "Edukasi hidrasi oral: Pasien wajib minum air putih minimal 2-3 liter per hari dan berkemih secara teratur."
    ],
    vitalMonitoring: [
      "Ekokardiografi: Pantau LVEF sebelum siklus 1 dan setelah siklus ke-3.",
      "Hitung Darah Lengkap (CBC & ANC): Cek nadir leukosit/neutrofil pada hari ke-10 hingga 14.",
      "Urinalisis: Deteksi dini hematuria mikroskopis."
    ],
    organToxicities: [
      {
        organ: "Jantung (Kardiotoksisitas Antraksiklin)",
        responsibleDrug: "Doxorubicin",
        manifestation: "Gagal jantung kongestif akut atau kronis akibat kerusakan miokardium.",
        preventionStrategy: "Pemeriksaan fraksi ejeksi ventrikel kiri (LVEF), batasan kumulatif dosis total <450 mg/m²."
      },
      {
        organ: "Kandung Kemih (Sistitis Hemoragik)",
        responsibleDrug: "Cyclophosphamide",
        manifestation: "Nyeri suprapubik, disuria hebat, perdarahan saat berkemih.",
        preventionStrategy: "Hidrasi cairan oral/IV agresif, kosongkan kandung kemih setiap 2-3 jam, jangan tahan kencing."
      },
      {
        organ: "Kulit & Rambut (Alopesia Total)",
        responsibleDrug: "Doxorubicin + Cyclophosphamide",
        manifestation: "Kerontokan rambut kepala dan bulu tubuh menyeluruh (biasanya dimulai 2-3 minggu pasca siklus 1).",
        preventionStrategy: "Konseling psikologis pra-terapi; penggunaan topi pendingin kulit kepala (scalp cooling) dapat mengurangi keparahan alopesia."
      }
    ],
    clinicalPearls: [
      "Kombinasi Doxorubicin dan Cyclophosphamide tergolong 'Highly Emetogenic Chemotherapy' (HEC) dengan risiko mual-muntah >90% tanpa premedikasi.",
      "Regimen antiemetik tripel (Aprepitant + 5-HT3 Antagonist + Dexamethasone) terbukti paling efektif mengontrol mual akut dan tertunda."
    ],
    references: "NCCN Breast Cancer Guidelines; Buzdar AU et al. Cancer; Fisher B et al. J Clin Oncol."
  },
  {
    id: "ac_act",
    acronym: "AC / AC-T",
    fullName: "Adriamycin (Doxorubicin) + Cyclophosphamide, dilanjutkan Taxane (Paclitaxel / Docetaxel)",
    cancerCategory: "payudara",
    cancerCategoryLabel: "Kanker Payudara",
    cancerTypeDetail: "Kanker Payudara (HER2-Negatif, Triple Negative Breast Cancer / TNBC, atau Stadium Dini Kelenjar Getah Bening Positif)",
    applicableGoals: ["neoadjuvant", "adjuvant", "curative"],
    primaryGoalHighlight: "Neoadjuvan & Adjuvan (Standar terapi paling banyak dipakai di dunia untuk kanker payudara invasif)",
    overview: "Regimen AC diikuti Taxane (AC-T) adalah standar emas terapi sistemik kuratif untuk kanker payudara operable berisiko tinggi. Terdiri dari 4 siklus AC (Doxorubicin 60 mg/m² + Cyclophosphamide 600 mg/m²) setiap 3 minggu (atau dose-dense setiap 2 minggu dengan G-CSF), dilanjutkan oleh kemoterapi golongan Taxane (Paclitaxel mingguan selama 12 minggu atau Docetaxel setiap 3 minggu selama 4 siklus).",
    cycleProtocol: "Fase 1: AC setiap 21 hari x 4 siklus (atau dose-dense q14 hari). Fase 2: Taxane mingguan x 12 minggu atau q21 hari x 4 siklus.",
    cycleLengthDays: 21,
    totalRecommendedCycles: "Total 4 siklus AC + 4 siklus Taxane (durasi terapi sekitar 5 - 6 bulan)",
    components: [
      {
        drugId: "Doxorubicin",
        drugName: "Adriamycin (Doxorubicin HCl)",
        genericAlias: "Doxorubicin",
        role: "Antibiotik Antraksiklin / Interkalator DNA",
        dosageFormula: "60 mg/m² IV",
        defaultDoseValue: 60,
        doseUnit: "mg/m2",
        adminRoute: "IV push lambat 3-5 menit melalui infus saline yang mengalir bebas",
        diluentStandard: "NaCl 0.9% 50-100 mL",
        sequenceOrder: 1,
        sequenceNote: "Berikan pertama kali. Cek kepatenan vena dan aspirasi darah setiap 1-2 mL injeksi.",
        vesicantStatus: "Vesikant (Nekrosis Jaringan)",
        specialPrecautions: "Batas kumulatif maksimal seumur hidup: 450 mg/m² (4 siklus AC = 240 mg/m², masih aman dalam batas ambang)."
      },
      {
        drugId: "Cyclophosphamid",
        drugName: "Cyclophosphamide (Endoxan)",
        genericAlias: "Cyclophosphamid",
        role: "Alkylating Agent (Mustard Nitrogen)",
        dosageFormula: "600 mg/m² IV",
        defaultDoseValue: 600,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 30 - 60 menit",
        diluentStandard: "NaCl 0.9% 250 mL atau Dextrose 5%",
        sequenceOrder: 2,
        sequenceNote: "Bilas jalur infus dengan minimal 100 mL NaCl 0.9% setelah selesai.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Wajib hidrasi oral melimpah 2-3 liter per hari untuk mencegah sistitis hemoragik akibat metabolit akrolein."
      },
      {
        drugId: "Paclitaxel",
        drugName: "Paclitaxel (Taxol) - Fase Taxane Lanjutan",
        genericAlias: "Paclitaxel",
        role: "Golongan Taxane (Fase Sekuensial Kedua)",
        dosageFormula: "80 mg/m² IV Mingguan (x 12 minggu) ATAU 175 mg/m² IV q3w (x 4 siklus)",
        defaultDoseValue: 80,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 1 jam (mingguan) atau 3 jam (q3w) menggunakan set non-PVC & in-line filter 0.22 mikron",
        diluentStandard: "NaCl 0.9% atau Dextrose 5% 250 - 500 mL",
        sequenceOrder: 3,
        sequenceNote: "Diberikan setelah 4 siklus AC selesai tuntas. Wajib premedikasi antihistamin + steroid.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Pelarut Cremophor EL dapat memicu reaksi anafilaktoid berat pada 10 menit pertama. Hentikan infus jika timbul bronkospasme atau hipotensi."
      }
    ],
    premedicationProtocol: [
      "Fase AC (Highly Emetogenic): Tripel antiemetik: Aprepitant 125 mg PO + Ondansetron 8-16 mg IV + Dexamethasone 12 mg IV pada Hari ke-1; dilanjutkan Aprepitant 80 mg PO pada Hari ke-2 dan 3.",
      "Fase Taxane (Premedikasi Hipersensitivitas): Dexamethasone 20 mg PO 12 jam dan 6 jam sebelum infus (atau 10-20 mg IV 30 menit sebelum) + Diphenhydramine 50 mg IV + Ranitidine 50 mg IV."
    ],
    hydrationAndProtection: [
      "Hidrasi intravena: NaCl 0.9% 500-1000 mL sebelum dan sesudah infus fase AC.",
      "G-CSF (Filgrastim 300 mcg SC): Wajib diberikan pada protokol 'Dose-Dense' (AC setiap 2 minggu) mulai hari ke-3 hingga ke-7 untuk mencegah neutropenia febril."
    ],
    vitalMonitoring: [
      "Fraksi Ejeksi Jantung (LVEF): Pemeriksaan dasar sebelum siklus 1 dan setelah siklus 4 AC.",
      "Darah Lengkap & ANC: Evaluasi neutropenia sebelum tiap siklus.",
      "Neuropati Sensorik: Skrining parestesia jari tangan/kaki saat memasuki fase Taxane."
    ],
    organToxicities: [
      {
        organ: "Jantung (Kardiotoksisitas Doxorubicin)",
        responsibleDrug: "Doxorubicin",
        manifestation: "Kardiomiopati dilatasi, aritmia, penurunan fraksi ejeksi jantung.",
        preventionStrategy: "Monitoring LVEF berkala, batasi dosis kumulatif <450 mg/m²."
      },
      {
        organ: "Sistem Saraf Tepi (Neuropati Sensorik Perifer)",
        responsibleDrug: "Paclitaxel / Docetaxel",
        manifestation: "Rasa kesemutan, kebas seperti memakai kaos kaki/sarung tangan (glove-and-stocking), nyeri neuropatik.",
        preventionStrategy: "Cryotherapy (penggunaan sarung tangan/kaus kaki dingin selama infus taxane), reduksi dosis 20% bila timbul grade 2+."
      },
      {
        organ: "Mukosa Saluran Cerna & Buli-buli",
        responsibleDrug: "Cyclophosphamide",
        manifestation: "Stomatitis, mual parah, disuria, sistitis hemoragik.",
        preventionStrategy: "Hidrasi cairan 2-3 liter per hari, premedikasi antiemetik agresif."
      }
    ],
    clinicalPearls: [
      "Jadwal 'Dose-Dense AC-T' (diberikan setiap 2 minggu dengan bantuan suntikan faktor pertumbuhan G-CSF) terbukti memberikan angka kesembuhan lebih tinggi dibanding jadwal standar 3 mingguan pada wanita premenopause dengan kanker payudara agresif.",
      "Cryotherapy (pendinginan tangan dan kaki dengan kantong es selama infus Paclitaxel) terbukti efektif menurunkan keparahan neuropati perifer sensorik."
    ],
    references: "NCCN Guidelines Breast Cancer; Citron ML et al. J Clin Oncol (CALGB 9741); Sparano JA et al. NEJM."
  },
  {
    id: "tc_gyn",
    acronym: "TC +/- Beva",
    fullName: "Paclitaxel, Carboplatin (+/- Bevacizumab)",
    cancerCategory: "ginekologi",
    cancerCategoryLabel: "Ginekologi & Ovarium",
    cancerTypeDetail: "Kanker Ovarium Epitelial, Tuba Fallopi, & Peritoneal Primer (Stadium IC - IV)",
    applicableGoals: ["adjuvant", "neoadjuvant", "curative", "palliative"],
    primaryGoalHighlight: "Adjuvan / Kuratif Standar Lini Pertama (Standard of Care Global)",
    overview: "Kombinasi Paclitaxel dan Carboplatin (TC) adalah standar lini pertama dunia untuk kanker ovarium epitelial pasca debulking bedah (adjuvan) atau sebelum operasi interval (neoadjuvant). Penambahan Bevacizumab diindikasikan pada stadium lanjut (Stadium IIIB-IV) atau sub-optimal debulking.",
    cycleProtocol: "Diberikan setiap 21 hari (siklus 3 mingguan) sebanyak 6 siklus.",
    cycleLengthDays: 21,
    totalRecommendedCycles: "6 siklus standar (lanjutan Bevacizumab rumatan hingga total 15-22 siklus bila digunakan)",
    components: [
      {
        drugId: "Paclitaxel",
        drugName: "Paclitaxel (Taxol)",
        genericAlias: "Paclitaxel",
        role: "Antimikrotubulus / Taxane",
        dosageFormula: "175 mg/m² IV",
        defaultDoseValue: 175,
        doseUnit: "mg/m2",
        adminRoute: "IV infus kontinu 3 jam via kantong & set non-PVC dengan filter 0.22 mikron",
        diluentStandard: "NaCl 0.9% atau Dextrose 5% 500 mL (Wadah Bebas DEHP / Kaca / Poliolefin)",
        sequenceOrder: 1,
        sequenceNote: "WAJIB diberikan SEBELUM Carboplatin. Pemberian terbalik memicu penurunan klirens paclitaxel hingga 33% dan mielosupresi fatal.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Wajib premedikasi tripel (Dexamethasone + Diphenhydramine + Ranitidine) untuk mencegah anafilaksis akibat pelarut Cremophor EL. Pantau ketat 15 menit pertama."
      },
      {
        drugId: "Carboplatin",
        drugName: "Carboplatin (Paraplatin)",
        genericAlias: "Carboplatin",
        role: "Garam Platinum Alkilasi DNA",
        dosageFormula: "Target AUC 5 - 6 (Formula Calvert: Dosis = AUC × [CrCl + 25])",
        defaultDoseValue: 5,
        doseUnit: "AUC",
        adminRoute: "IV infus 30 - 60 menit",
        diluentStandard: "Dextrose 5% atau NaCl 0.9% 250 - 500 mL",
        sequenceOrder: 2,
        sequenceNote: "Diberikan setelah infus Paclitaxel selesai tuntas dan jalur dibilas saline.",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Kalkulasi dosis wajib menggunakan rumus Calvert dengan pembatasan nilai CrCl maksimal 125 mL/menit untuk mencegah overdosis toksik pada ginjal hiperfiltrasi."
      },
      {
        drugId: "Bevacizumab",
        drugName: "Bevacizumab (Avastin) - Opsional",
        genericAlias: "Bevacizumab",
        role: "Antibodi Monoklonal Anti-VEGF (Anti-Angiogenesis)",
        dosageFormula: "7.5 atau 15 mg/kgBB IV",
        defaultDoseValue: 7.5,
        doseUnit: "mg/kg",
        adminRoute: "IV infus (infus pertama 90 menit; bila ditoleransi baik dapat dipersingkat menjadi 60 menit lalu 30 menit)",
        diluentStandard: "NaCl 0.9% 100 mL",
        diluentForbidden: "Dilarang keras melarutkan dalam cairan glukosa/Dextrose (memicu instabilitas antibodi)!",
        sequenceOrder: 3,
        sequenceNote: "Diberikan pada siklus ke-2 ke atas (tunda minimal 28 hari pasca operasi bedah mayor untuk mencegah gangguan penyembuhan luka).",
        vesicantStatus: "Non-Vesikant",
        specialPrecautions: "Risiko hipertensi berat, proteinuria nefrotik, dan perforasi saluran cerna. Periksa tekanan darah dan urinalisis protein sebelum tiap infus."
      }
    ],
    premedicationProtocol: [
      "Tripel Premedikasi Wajib Paclitaxel: Dexamethasone 20 mg PO (12 & 6 jam sebelum infus) ATAU 20 mg IV 30 menit sebelum infus + Diphenhydramine 50 mg IV + Ranitidine 50 mg IV (atau Famotidine 20 mg IV).",
      "Antiemetik: Ondansetron 8-16 mg IV + Dexamethasone 10 mg IV 30 menit sebelum Carboplatin."
    ],
    hydrationAndProtection: [
      "Hidrasi moderat: NaCl 0.9% 500 mL sebelum infus Paclitaxel dan bilas 50 mL di antara Paclitaxel dan Carboplatin.",
      "Filter membran 0.22 mikron dan infus set bebas DEHP/PVC wajib digunakan untuk infus Paclitaxel."
    ],
    vitalMonitoring: [
      "Tekanan Darah & Nadi: Setiap 15 menit pada 1 jam pertama infus Paclitaxel untuk deteksi cepat reaksi anafilaksis/bronkospasme.",
      "Darah Lengkap & Trombosit: Titik nadir mielosupresi Carboplatin terjadi pada Hari ke-14 hingga ke-21.",
      "Urinalisis: Proteinuria (dipstick) bila pasien mendapat Bevacizumab."
    ],
    organToxicities: [
      {
        organ: "Sumsum Tulang (Trombositopenia & Neutropenia)",
        responsibleDrug: "Carboplatin",
        manifestation: "Penurunan trombosit darah berat (<50.000/mcL), petekie, perdarahan gusi.",
        preventionStrategy: "Penyesuaian dosis Calvert akurat sesuai CrCl Cockcroft-Gault aktual, tunda siklus bila ANC <1500 atau Plt <100.000."
      },
      {
        organ: "Sistem Saraf Sensorik (Neuropati Perifer)",
        responsibleDrug: "Paclitaxel",
        manifestation: "Parestesia, rasa baal dan kesemutan di ujung jari tangan dan kaki.",
        preventionStrategy: "Cryotherapy (sarung tangan pendingin saat infus), reduksi dosis ke 135 mg/m² bila neuropati mengganggu aktivitas harian."
      },
      {
        organ: "Vaskular (Hipertensi & Tromboemboli)",
        responsibleDrug: "Bevacizumab",
        manifestation: "Krisis hipertensi, perdarahan mukokutan, trombosis vena dalam (DVT).",
        preventionStrategy: "Terapi antihipertensi oral profilaksis, hentikan bila terjadi proteinuria grade 3 (>3.5 g/24 jam) atau krisis hipertensi."
      }
    ],
    clinicalPearls: [
      "Jangan pernah menukar urutan: Paclitaxel HARUS selalu selesai diinfus terlebih dahulu sebelum Carboplatin diberikan.",
      "Jika CrCl pasien dihitung >125 mL/min, tetap gunakan batas atas GFR = 125 mL/min dalam rumus Calvert untuk menghindari toksisitas trombositopenia berat yang mengancam nyawa."
    ],
    references: "McGuire WP et al. N Engl J Med 1996 (GOG 111); Ozols RF et al. J Clin Oncol 2003 (GOG 158); NCCN Guidelines Ovarian Cancer."
  },
  {
    id: "cisplatin_cervix",
    acronym: "Cisplatin Kemoradiasi",
    fullName: "Cisplatin Mingguan Terkontrol (Concurrent Chemoradiotherapy / CCRT)",
    cancerCategory: "ginekologi",
    cancerCategoryLabel: "Ginekologi & Serviks",
    cancerTypeDetail: "Kanker Serviks Uteri Stadium IB2 - IVA (Kemoradiasi Konkomitan Definitif)",
    applicableGoals: ["curative", "adjuvant"],
    primaryGoalHighlight: "Kuratif / Radiosensitizer Definitif Kanker Leher Rahim",
    overview: "Pemberian Cisplatin dosis mingguan sebagai radiosensitizer bersamaan dengan radioterapi eksterna (EBRT) dan brakiterapi adalah protokol kuratif standar lini pertama yang telah terbukti meningkatkan tingkat kesembuhan lokal dan kesintasan hidup secara signifikan pada kanker serviks lokal lanjut.",
    cycleProtocol: "Diberikan seminggu sekali (Hari ke-1 setiap minggu) selama 5 - 6 minggu berbarengan dengan jadwal radioterapi.",
    cycleLengthDays: 7,
    totalRecommendedCycles: "5 - 6 siklus mingguan konkomitan dengan radiasi",
    components: [
      {
        drugId: "Cisplatin",
        drugName: "Cisplatin (CDDP)",
        genericAlias: "Cisplatin",
        role: "Garam Platinum Alkilasi DNA / Radiosensitizer",
        dosageFormula: "40 mg/m² (atau 50 mg/m²) IV mingguan (Maksimum 70 mg per minggu)",
        defaultDoseValue: 40,
        doseUnit: "mg/m2",
        adminRoute: "IV infus selama 60 - 120 menit dengan hidrasi agresif pra dan pasca infus",
        diluentStandard: "NaCl 0.9% 500 mL (WAJIB mengandung klorida; dilarang air murni/dextrose)",
        sequenceOrder: 1,
        sequenceNote: "Diberikan 1-2 jam sebelum sesi radiasi harian pada hari kemoterapi untuk memaksimalkan efek sensitisasi sel tumor terhadap radiasi.",
        vesicantStatus: "Iritan",
        specialPrecautions: "Nefrototoksik & Ototoksik poten. Wajib hidrasi cairan salin minimal 1 liter sebelum obat dan 1 liter setelah obat + Mannitol/Furosemide bila perlu untuk menjaga diuresis >100 mL/jam."
      }
    ],
    premedicationProtocol: [
      "Antiemetik Poten: Ondansetron 8 mg IV + Dexamethasone 8-12 mg IV diberikan 30-45 menit sebelum infus Cisplatin.",
      "Antiemetik Pasca-Infus (Mual Lambat): Metoclopramide 10 mg oral 3x sehari atau Dexamethasone oral selama 2 hari setelah infus."
    ],
    hydrationAndProtection: [
      "Pre-hidrasi Wajib: NaCl 0.9% 1000 mL + KCl 20 mEq + MgSO4 1-2 gram IV diinfus dalam 2-3 jam sebelum Cisplatin.",
      "Post-hidrasi Wajib: NaCl 0.9% 1000 mL diinfus dalam 2-3 jam setelah Cisplatin.",
      "Evaluasi output urin: Pastikan produksi urin minimal ≥100 mL/jam selama dan setelah infus."
    ],
    vitalMonitoring: [
      "Serum Kreatinin & CrCl: Wajib diperiksa setiap minggu sebelum infus; bila CrCl <50 mL/menit tunda kemoterapi.",
      "Elektrolit Serum: Natrium, Kalium, dan Magnesium (Cisplatin memicu wasting magnesium tubulus ginjal).",
      "Pemeriksaan Pendengaran: Skrining tinnitus atau penurunan pendengaran frekuensi tinggi (ototoksisitas)."
    ],
    organToxicities: [
      {
        organ: "Ginjal (Nekrosis Tubulus Ginjal Akut)",
        responsibleDrug: "Cisplatin",
        manifestation: "Peningkatan serum kreatinin mendadak, oliguria, penurunan CrCl.",
        preventionStrategy: "Protokol hidrasi salin agresif (2 liter) dan suplementasi magnesium/kalium rutin pada cairan infus."
      },
      {
        organ: "Telinga Dalam (Ototoksisitas Koklea)",
        responsibleDrug: "Cisplatin",
        manifestation: "Tinnitus bernada tinggi, penurunan persepsi pendengaran nada tinggi bilateral ireversibel.",
        preventionStrategy: "Evaluasi keluhan telinga berdenging sebelum tiap siklus mingguan, pertimbangkan konversi ke Carboplatin jika ototoksisitas berat."
      }
    ],
    clinicalPearls: [
      "Selalu pastikan pasien terhidrasi dengan baik dan tidak dalam kondisi dehidrasi sebelum Cisplatin dialirkan.",
      "Dosis mingguan biasanya dibatasi maksimal 70 mg/dosis untuk mencegah toksisitas ginjal tanpa mengurangi efikasi radiosensitasi."
    ],
    references: "Rose PG et al. N Engl J Med 1999 (GOG 120); Keys HM et al. N Engl J Med 1999; NCCN Clinical Practice Guidelines in Oncology: Cervical Cancer."
  }
];
