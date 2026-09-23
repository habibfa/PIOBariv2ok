// Drug Safety Alerts System: High Alert Medications & LASA (Look-Alike Sound-Alike)
// Berdasarkan Standar Pelayanan Kefarmasian Kemenkes RI, KARS SNARS, dan ISMP (Institute for Safe Medication Practices).

import type { FornasDrug } from './fornasData';

export interface HighAlertDetails {
  isHighAlert: true;
  category: 
    | 'ELEKTROLIT_PEKAT'
    | 'NARKOTIKA_OPIOID'
    | 'SITOSTATIKA'
    | 'INSULIN'
    | 'ANTIKOAGULAN'
    | 'INOTROPIK_VASOPRESOR'
    | 'PELEMAS_OTOT'
    | 'SEDATIF_ANESTESI';
  categoryLabel: string;
  badgeText: string;
  reason: string;
  handlingGuideline: string;
}

export interface LasaDetails {
  isLasa: true;
  pairedWith: string[];
  tallMan: string;
  type: 'Look-Alike' | 'Sound-Alike' | 'Look-Alike & Sound-Alike';
  preventionTip: string;
}

export interface DrugSafetyAlert {
  highAlert: HighAlertDetails | null;
  lasa: LasaDetails | null;
}

// 1. High Alert Definitions & Matchers
const HIGH_ALERT_RULES: Array<{
  category: HighAlertDetails['category'];
  categoryLabel: string;
  badgeText: string;
  reason: string;
  handlingGuideline: string;
  match: (name: string, kelas: string, subKelas: string, sediaan: string, restriksi: string) => boolean;
}> = [
  {
    category: 'ELEKTROLIT_PEKAT',
    categoryLabel: 'Elektrolit Konsentrat Tinggi',
    badgeText: 'High Alert: Elektrolit Pekat',
    reason: 'Konsentrasi tinggi berisiko aritmia fatal, henti jantung, atau edema paru bila terjadi kekeliruan dosis/kecepatan infus.',
    handlingGuideline: 'Wajib pengenceran sebelum diberikan. Tidak boleh disimpan di ruang rawat inap umum (hanya ICU/IGD/OK dengan akses terkunci). Beri stiker merah HIGH ALERT.',
    match: (name, _k, _s, sediaan, restriksi) => {
      const n = name.toLowerCase();
      const s = sediaan.toLowerCase();
      const r = restriksi.toLowerCase();
      if (r.includes("high alert")) return true;
      if (n.includes("kalium klorida") || n.includes("kcl")) return true;
      if (n.includes("natrium bikarbonat") || n.includes("meylon")) return true;
      if (n.includes("magnesium sulfat") && (s.includes("20%") || s.includes("40%"))) return true;
      if (n.includes("natrium klorida") && (s.includes("3%") || s.includes("hipertonik"))) return true;
      if (n.includes("kalsium glukonat") || n.includes("kalsium klorida")) return true;
      return false;
    }
  },
  {
    category: 'NARKOTIKA_OPIOID',
    categoryLabel: 'Narkotika & Opioid Kuat',
    badgeText: 'High Alert: Narkotika',
    reason: 'Risiko tinggi depresi pernapasan fatal, sedasi berat, ketergantungan, dan henti napas.',
    handlingGuideline: 'Penyimpanan dalam lemari ganda terkunci khusus narkotika. Wajib double-check independen dan pencatatan kartu stok serta berita acara penggunaan.',
    match: (name, kelas, subKelas) => {
      const n = name.toLowerCase();
      const sk = subKelas.toLowerCase();
      const k = kelas.toLowerCase();
      if (sk.includes("analgesik narkotik") || sk.includes("narkotik") || k.includes("narkotik")) return true;
      const narcotics = [
        "fentanil", "morfin", "petidin", "hidromorfon", "oksikodon", 
        "remifentanil", "sufentanil", "buprenorfin", "metadon"
      ];
      return narcotics.some(item => n.includes(item));
    }
  },
  {
    category: 'SITOSTATIKA',
    categoryLabel: 'Sitostatika / Antineoplastik',
    badgeText: 'High Alert: Sitostatika',
    reason: 'Obat kemoterapi dengan indeks terapi sempit, mutagenik, teratogenik, dan risiko toksisitas organ multipel serta ekstravasasi parah.',
    handlingGuideline: 'Rekonstitusi wajib di BSC (Biological Safety Cabinet) oleh tenaga terlatih dengan APD kemoterapi lengkap. Wajib verifikasi protokol BSA/protokol kemo.',
    match: (name, kelas, subKelas) => {
      const n = name.toLowerCase();
      const k = kelas.toLowerCase();
      const sk = subKelas.toLowerCase();
      if (name.includes("[Ca]") || kelas.includes("ANTINEOPLASTIK") || subKelas.includes("ANTINEOPLASTIK") || k.includes("sitostatika") || sk.includes("sitostatika")) {
        return true;
      }
      const chemoDrugs = [
        "metotreksat", "sisplatin", "karboplatin", "siklofosfamid", "doksorubisin",
        "fluorourasil", "paklitaksel", "dosetaksel", "vinkristin", "vinblastin",
        "gemsitabin", "etoposide", "etoposid", "bleomisin", "kapezitabin",
        "imatinib", "trastuzumab", "rituksimab", "oksaliplatin", "irinotekan"
      ];
      return chemoDrugs.some(c => n.includes(c));
    }
  },
  {
    category: 'INSULIN',
    categoryLabel: 'Insulin & Analog Insulin',
    badgeText: 'High Alert: Insulin',
    reason: 'Risiko hipoglikemia akut, kejang, koma hipoglikemik, hingga kematian jika dosis tidak tepat atau jenis keliru tertukar.',
    handlingGuideline: 'Wajib double-check nama insulin (rapid, basal, premix), satuan Unit (IU), dan cek GDS berkala. Simpan di kulkas suhu 2-8°C dengan penandaan jelas.',
    match: (name, kelas, subKelas) => {
      const n = name.toLowerCase();
      const sk = subKelas.toLowerCase();
      return n.includes("insulin") || sk.includes("insulin") || n.includes("glargin") || n.includes("detemir") || n.includes("degludec") || n.includes("aspart") || n.includes("lispro");
    }
  },
  {
    category: 'ANTIKOAGULAN',
    categoryLabel: 'Antikoagulan & Trombolitik',
    badgeText: 'High Alert: Antikoagulan',
    reason: 'Risiko perdarahan mayor masif (intrakranial, GI bleeding) bila overdosis, atau tromboemboli fatal bila underdosis.',
    handlingGuideline: 'Wajib verifikasi nilai lab koagulasi (INR, aPTT, D-Dimer, Hb). Beri stiker High Alert dan lakukan double-check saat penyiapan dan serah terima.',
    match: (name, kelas, subKelas) => {
      const n = name.toLowerCase();
      const sk = subKelas.toLowerCase();
      const k = kelas.toLowerCase();
      if (sk.includes("antikoagulan") || sk.includes("trombolitik") || k.includes("koagulasi")) {
        // Exclude simple antiplatelets like aspirin/clopidogrel unless specific anticoagulants
        if (n.includes("asetosal") || n.includes("klopidogrel") || n.includes("tikagrelor")) {
          return false;
        }
        return true;
      }
      const anticoags = [
        "heparin", "enoksaparin", "nadroparin", "fondaparinuks", "warfarin",
        "dabigatran", "rivaroksaban", "apiksaban", "streptokinase", "alteplase", "urokinase"
      ];
      return anticoags.some(a => n.includes(a));
    }
  },
  {
    category: 'INOTROPIK_VASOPRESOR',
    categoryLabel: 'Agonis Adrenergik / Vasopresor',
    badgeText: 'High Alert: Inotropik / Vasopresor',
    reason: 'Fluktuasi hemodinamik kritis, aritmia maligna, hipertensi krisis, atau iskemia jaringan perifer akibat kesalahan titrasi infus.',
    handlingGuideline: 'Diberikan via syringe pump / infusion pump terkalibrasi dengan pemantauan ketat tekanan darah, laju jantung, dan EKG berkelanjutan.',
    match: (name, _k, _s, sediaan) => {
      const n = name.toLowerCase();
      const s = sediaan.toLowerCase();
      // Injectable adrenergic agonists / inotropes
      const isInjectable = s.includes("inj") || s.includes("infus") || s.includes("amp") || s.includes("vial") || s.includes("i.v.");
      if (n.includes("dopamin") || n.includes("dobutamin") || n.includes("norepinefrin") || n.includes("noradrenalin")) {
        return true;
      }
      if ((n.includes("epinefrin") || n.includes("adrenalin") || n.includes("efedrin")) && isInjectable) {
        return true;
      }
      return false;
    }
  },
  {
    category: 'PELEMAS_OTOT',
    categoryLabel: 'Penyekat Neuromuskular',
    badgeText: 'High Alert: Pelemas Otot',
    reason: 'Paralisis otot pernapasan total. Pasien akan mengalami asfiksia fatal jika diberikan tanpa intubasi endotrakeal dan ventilasi mekanik.',
    handlingGuideline: 'Hanya boleh diberikan oleh dokter anestesi atau tenaga terlatih dengan fasilitas jalan napas definitif (intubasi/ventilator) siap pakai.',
    match: (name, kelas, subKelas) => {
      const n = name.toLowerCase();
      const k = kelas.toLowerCase();
      const sk = subKelas.toLowerCase();
      if (k.includes("pelemas otot") || sk.includes("pelemas otot") || sk.includes("neuromuskular")) {
        return true;
      }
      const nmbds = ["atrakurium", "rokuronium", "vekuronium", "suksinilkolin", "cisatrakurium", "pankuronium"];
      return nmbds.some(item => n.includes(item));
    }
  },
  {
    category: 'SEDATIF_ANESTESI',
    categoryLabel: 'Anestesi & Sedatif IV Kuat',
    badgeText: 'High Alert: Anestesi IV',
    reason: 'Hilangnya refleks proteksi jalan napas, depresi sirkulasi, hipotensi mendadak, dan hipoventilasi berat.',
    handlingGuideline: 'Hanya digunakan di ruang operasi, ICU, atau tindakan dengan pemantauan airway, breathing, circulation (ABC) ketat.',
    match: (name, _k, _s, sediaan) => {
      const n = name.toLowerCase();
      const s = sediaan.toLowerCase();
      const isInjectable = s.includes("inj") || s.includes("i.v.") || s.includes("infus");
      if (n.includes("propofol") || n.includes("ketamin") || n.includes("tiopental") || n.includes("etomidat")) {
        return true;
      }
      if (n.includes("midazolam") && isInjectable) {
        return true;
      }
      return false;
    }
  }
];

// 2. LASA / NORUM (Look-Alike Sound-Alike) Knowledge Base
// Berdasarkan pedoman Kemenkes RI, KARS, dan ISMP Tall-Man Lettering List
interface LasaDatabaseItem {
  pattern: RegExp;
  tallMan: string;
  pairedWith: string[];
  type: 'Look-Alike' | 'Sound-Alike' | 'Look-Alike & Sound-Alike';
  preventionTip?: string;
}

const LASA_DATABASE: LasaDatabaseItem[] = [
  {
    pattern: /asam\s+mefenamat/i,
    tallMan: 'asam MEFENAMAT',
    pairedWith: ['Asam Traneksamat'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'MEFENAMAT adalah analgetik-NSAID, sedangkan TRANEKSAMAT adalah antifibrinolitik/hemostatik. Berbahaya bila tertukar pada kasus perdarahan aktif!'
  },
  {
    pattern: /asam\s+traneksamat/i,
    tallMan: 'asam TRANEKSAMAT',
    pairedWith: ['Asam Mefenamat'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'TRANEKSAMAT adalah antifibrinolitik (penghenti perdarahan). Jangan tertukar dengan asam MEFENAMAT (analgetik).'
  },
  {
    pattern: /dopamin/i,
    tallMan: 'DOPAmine',
    pairedWith: ['Dobutamin'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'DOPAmine memiliki efek vasokonstriktor perifer pada dosis tinggi; DOBUTamine dominan inotropik. Simpan di wadah terpisah berstiker LASA.'
  },
  {
    pattern: /dobutamin/i,
    tallMan: 'DOBUTamine',
    pairedWith: ['Dopamin'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'DOBUTamine dominan inotropik beta-1. Jangan tertukar dengan DOPAmine.'
  },
  {
    pattern: /epinefrin|adrenalin/i,
    tallMan: 'EPIneprine',
    pairedWith: ['Efedrin'],
    type: 'Sound-Alike',
    preventionTip: 'EPIneprine memiliki potensi vasopresor & inotropik jauh lebih kuat daripada EPHEDrine. Kesalahan dosis dapat memicu takiaritmia fatal.'
  },
  {
    pattern: /efedrin/i,
    tallMan: 'EPHEDrine',
    pairedWith: ['Epinefrin (Adrenalin)'],
    type: 'Sound-Alike',
    preventionTip: 'Potensi kerja berbeda dengan EPIneprine. Wajib double-check ampul sebelum injeksi.'
  },
  {
    pattern: /cefotaxim|sefotaksim/i,
    tallMan: 'CEFOtaxime',
    pairedWith: ['Ceftriaxone (Seftriakson)', 'Ceftazidime (Seftazidim)'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'Sefalosporin generasi ke-3 dengan spektrum mikroba dan klirens eliminasi berbeda. Periksa diagnosis klinis spesifik.'
  },
  {
    pattern: /ceftriaxon|seftriakson/i,
    tallMan: 'CEFTriaxone',
    pairedWith: ['Cefotaxime (Sefotaksim)', 'Ceftazidime (Seftazidim)'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'CEFTriaxone inkompatibel fatal dengan larutan Kalsium (Ringer Laktat) pada neonatus! Pastikan tidak tertukar dengan CEFOtaxime.'
  },
  {
    pattern: /ceftazidim|seftazidim/i,
    tallMan: 'CEFTAzidime',
    pairedWith: ['Ceftriaxone (Seftriakson)', 'Cefotaxime (Sefotaksim)'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'CEFTAzidime aktif terhadap Pseudomonas aeruginosa. Pastikan indikasi isolat kuman sesuai hasil kultur.'
  },
  {
    pattern: /cefixim|sefiksim/i,
    tallMan: 'ceFIXime',
    pairedWith: ['Cefadroxil (Sefadroksil)'],
    type: 'Sound-Alike',
    preventionTip: 'ceFIXime (Gen-3 oral) vs ceFADROXil (Gen-1 oral). Spektrum bakteri berbeda signifikan.'
  },
  {
    pattern: /cefadroxil|sefadroksil/i,
    tallMan: 'ceFADROXil',
    pairedWith: ['Cefixime (Sefiksim)'],
    type: 'Sound-Alike',
    preventionTip: 'ceFADROXil adalah sefalosporin generasi 1; jangan tertukar dengan generasi 3 ceFIXime.'
  },
  {
    pattern: /ciprofloxacin|siprofloksasin/i,
    tallMan: 'CIPROfloxacin',
    pairedWith: ['Levofloxacin (Levofloksasin)'],
    type: 'Sound-Alike',
    preventionTip: 'Frekuensi dosis berbeda: CIPROfloxacin (tiap 12 jam) vs LEVOfloxacin (tiap 24 jam).'
  },
  {
    pattern: /levofloxacin|levofloksasin/i,
    tallMan: 'LEVOfloxacin',
    pairedWith: ['Ciprofloxacin (Siprofloksasin)'],
    type: 'Sound-Alike',
    preventionTip: 'LEVOfloxacin dosis lazim 1x sehari (500-750 mg). Jangan tertukar dengan CIPROfloxacin.'
  },
  {
    pattern: /glimepirid/i,
    tallMan: 'GLIMEPiride',
    pairedWith: ['Glibenklamid', 'Glipizid'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'Sulfonilurea dengan durasi kerja dan risiko hipoglikemia berbeda. Glibenklamid berisiko hipoglikemia berkepanjangan pada lansia.'
  },
  {
    pattern: /glibenklamid/i,
    tallMan: 'GLIBENclamide',
    pairedWith: ['Glimepirid', 'Gliklazid'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'Waktu paruh metabolit aktif panjang. Hindari tertukar dengan GLIMEPiride.'
  },
  {
    pattern: /metformin/i,
    tallMan: 'METFORMIN',
    pairedWith: ['Metronidazol'],
    type: 'Sound-Alike',
    preventionTip: 'METFORMIN adalah antidiabetik oral (biguanid), sedangkan METRONIDazole adalah antibiotik antiprotozoa. Simpan pada rak alfabet terpisah!'
  },
  {
    pattern: /metronidazol/i,
    tallMan: 'METRONIDazole',
    pairedWith: ['Metformin'],
    type: 'Sound-Alike',
    preventionTip: 'METRONIDazole adalah antimikroba/antiprotozoa. Jangan tertukar dengan antidiabetes METFORMIN.'
  },
  {
    pattern: /amlodipin/i,
    tallMan: 'amLODIPine',
    pairedWith: ['Alopurinol', 'Amitriptilin'],
    type: 'Sound-Alike',
    preventionTip: 'amLODIPine adalah antihipertensi antagonis kalsium; jangan tertukar dengan alopurinol (asam urat).'
  },
  {
    pattern: /alopurinol/i,
    tallMan: 'aloPURINOL',
    pairedWith: ['Amlodipin'],
    type: 'Sound-Alike',
    preventionTip: 'aloPURINOL adalah penurun asam urat. Jangan tertukar dengan amLODIPine.'
  },
  {
    pattern: /kaptopril|captopril/i,
    tallMan: 'CAPTOpril',
    pairedWith: ['Karvedilol'],
    type: 'Sound-Alike',
    preventionTip: 'CAPTOpril (ACEI) vs CARVEDILOL (Beta blocker + Alfa-1 blocker). Dosis dan frekuensi konsumsi berbeda.'
  },
  {
    pattern: /karvedilol|carvedilol/i,
    tallMan: 'CARVEDILOL',
    pairedWith: ['Kaptopril'],
    type: 'Sound-Alike',
    preventionTip: 'CARVEDILOL adalah beta blocker non-selektif dengan vasodilatasi. Jangan tertukar dengan CAPTOpril.'
  },
  {
    pattern: /ketorolak/i,
    tallMan: 'KETOROLac',
    pairedWith: ['Ketoprofen'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'KETOROLac dibatasi maksimal 5 hari penggunaan karena risiko nefrotoksisitas & perdarahan lambung tinggi.'
  },
  {
    pattern: /ketoprofen/i,
    tallMan: 'KETOPROFEN',
    pairedWith: ['Ketorolak'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'KETOPROFEN analgetik NSAID lazim. Perhatikan perbedaan potensi dengan KETOROLac.'
  },
  {
    pattern: /ranitidin/i,
    tallMan: 'RANI-tidine',
    pairedWith: ['Famotidin', 'Simetidin'],
    type: 'Sound-Alike',
    preventionTip: 'Antagonis H2 reseptor. Perhatikan kesesuaian kekuatan sediaan saat menyiapkan obat.'
  },
  {
    pattern: /famotidin/i,
    tallMan: 'FAMO-tidine',
    pairedWith: ['Ranitidin'],
    type: 'Sound-Alike',
    preventionTip: 'Kekuatan sediaan FAMO-tidine lazim 20 mg/40 mg (berbeda dengan RANI-tidine 150 mg).'
  },
  {
    pattern: /vinkristin/i,
    tallMan: 'vinCRIStine',
    pairedWith: ['Vinblastin'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'FATAL JIKA DIBERIKAN INTRATEKAL! Dosis vinCRIStine lazim dalam mikrogram (maks 2 mg/dosis), sedangkan vinBLAStine dalam miligram (dosis jauh lebih besar).'
  },
  {
    pattern: /vinblastin/i,
    tallMan: 'vinBLAStine',
    pairedWith: ['Vinkristin'],
    type: 'Look-Alike & Sound-Alike',
    preventionTip: 'Dosis vinBLAStine jauh lebih besar dari vinCRIStine. Jika vinCRIStine salah diberi dengan dosis vinBLAStine akan berakibat fatal neurotoksisitas!'
  },
  {
    pattern: /pirasetam|piracetam/i,
    tallMan: 'PIRA-cetam',
    pairedWith: ['Piroksikam'],
    type: 'Sound-Alike',
    preventionTip: 'PIRA-cetam (neurotropik) vs PIROX-icam (NSAID radang sendi). Indikasi klinis sangat berbeda.'
  },
  {
    pattern: /piroksikam|piroxicam/i,
    tallMan: 'PIROX-icam',
    pairedWith: ['Pirasetam'],
    type: 'Sound-Alike',
    preventionTip: 'PIROX-icam adalah antiinflamasi non-steroid berwaktu paruh panjang. Jangan tertukar dengan PIRA-cetam.'
  },
  {
    pattern: /furosemid/i,
    tallMan: 'FUROSEMIDE',
    pairedWith: ['Torsemid', 'Spironolakton'],
    type: 'Sound-Alike',
    preventionTip: 'Diuretik loop kuat. Perhatikan kecepatan pemberian injeksi IV untuk mencegah ototoksisitas.'
  },
  {
    pattern: /bisoprolol/i,
    tallMan: 'BISO-prolol',
    pairedWith: ['Propranolol'],
    type: 'Sound-Alike',
    preventionTip: 'BISO-prolol (kardioselektif beta-1, 1x sehari) vs PROPRA-nolol (non-selektif, 2-3x sehari). Jangan berikan propranolol pada pasien asma!'
  },
  {
    pattern: /propranolol/i,
    tallMan: 'PROPRA-nolol',
    pairedWith: ['Bisoprolol'],
    type: 'Sound-Alike',
    preventionTip: 'PROPRA-nolol non-selektif (kontraindikasi asma berat/PPOK). Jangan tertukar dengan BISO-prolol.'
  },
  {
    pattern: /simvastatin/i,
    tallMan: 'SIMVA-statin',
    pairedWith: ['Atorvastatin'],
    type: 'Sound-Alike',
    preventionTip: 'SIMVA-statin diminum malam hari (waktu paruh pendek); ATORVA-statin dapat diminum kapan saja (waktu paruh panjang).'
  },
  {
    pattern: /atorvastatin/i,
    tallMan: 'ATORVA-statin',
    pairedWith: ['Simvastatin'],
    type: 'Sound-Alike',
    preventionTip: 'Potensi penurun LDL ATORVA-statin lebih kuat per miligram dibanding SIMVA-statin.'
  },
  {
    pattern: /diazepam/i,
    tallMan: 'diaZEPAM',
    pairedWith: ['lorAZEPAM', 'clonaZEPAM'],
    type: 'Sound-Alike',
    preventionTip: 'Golongan benzodiazepin dengan durasi dan onset kerja berbeda. Wajib resep otentik & pemantauan sedasi.'
  },
  {
    pattern: /lorazepam/i,
    tallMan: 'lorAZEPAM',
    pairedWith: ['diaZEPAM', 'clonaZEPAM'],
    type: 'Sound-Alike',
    preventionTip: 'lorAZEPAM tidak mengalami metabolisme fase 1 oksidasi hepatik, lebih aman untuk gangguan hati dibanding diaZEPAM.'
  },
  {
    pattern: /gentamisin/i,
    tallMan: 'GENTA-micin',
    pairedWith: ['Amikasin', 'Kanamisin'],
    type: 'Sound-Alike',
    preventionTip: 'Aminoglikosida nefrotoksik & ototoksik. Periksa klirens kreatinin dan periksa dosis miligram spesifik.'
  },
  {
    pattern: /salbutamol/i,
    tallMan: 'SALBUT-amol',
    pairedWith: ['Salmeterol'],
    type: 'Sound-Alike',
    preventionTip: 'SALBUT-amol (SABA kerja cepat untuk serangan akut) vs SALMET-erol (LABA kerja lambat untuk pemeliharaan). Jangan berikan salmeterol untuk serangan asma akut!'
  }
];

/**
 * Mendapatkan status peringatan keselamatan (High Alert dan/atau LASA) untuk obat tertentu
 */
export function getDrugSafetyAlert(drug: FornasDrug | { namaObat: string; kelasTerapi?: string; subKelasTerapi?: string; bentukSediaan?: string; restriksi?: string }): DrugSafetyAlert {
  const name = drug.namaObat || '';
  const kelas = drug.kelasTerapi || '';
  const subKelas = drug.subKelasTerapi || '';
  const sediaan = drug.bentukSediaan || '';
  const restriksi = drug.restriksi || '';

  // 1. Detect High Alert
  let highAlert: HighAlertDetails | null = null;
  for (const rule of HIGH_ALERT_RULES) {
    if (rule.match(name, kelas, subKelas, sediaan, restriksi)) {
      highAlert = {
        isHighAlert: true,
        category: rule.category,
        categoryLabel: rule.categoryLabel,
        badgeText: rule.badgeText,
        reason: rule.reason,
        handlingGuideline: rule.handlingGuideline
      };
      break;
    }
  }

  // 2. Detect LASA / NORUM
  let lasa: LasaDetails | null = null;
  for (const item of LASA_DATABASE) {
    if (item.pattern.test(name)) {
      lasa = {
        isLasa: true,
        pairedWith: item.pairedWith,
        tallMan: item.tallMan,
        type: item.type,
        preventionTip: item.preventionTip || 'Gunakan Tall-Man Lettering dan verifikasi resep sebelum diserahkan.'
      };
      break;
    }
  }

  return { highAlert, lasa };
}
