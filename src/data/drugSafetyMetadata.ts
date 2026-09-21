import { DrugBreastfeedingSafety, DrugPregnancySafety, DrugPreset } from "../types";

export interface DrugSafetyReview {
  contraindication: string;
  pregnancySafety: DrugPregnancySafety;
  breastfeedingSafety: DrugBreastfeedingSafety;
}

/**
 * Clinical evaluation of drug safety during pregnancy and lactation.
 * Based on FDA Pregnancy Categories (A, B, C, D, X), LactMed (NLM), 
 * Briggs Drugs in Pregnancy and Lactation, and Indonesian BPOM guidelines.
 */
export const getDrugSafetyReview = (
  preset: DrugPreset,
  genericName: string,
  brandName: string,
  categoryLabel?: string
): DrugSafetyReview => {
  const matchKey = `${preset.id} ${preset.name} ${genericName} ${brandName}`.toLowerCase();

  // ==========================================
  // 1. KATEGORI X: KONTRAINDIKASI MUTLAK SAAT HAMIL
  // ==========================================

  // Warfarin & Antikoagulan Terkait
  if (matchKey.includes("warfarin") || matchKey.includes("dikumarol")) {
    return {
      contraindication: "Perdarahan aktif; diatesis hemoragik; kehamilan trimester 1 (organogenesis) & trimester 3 (peripartum); hipertensi berat tak terkontrol.",
      pregnancySafety: {
        category: "X",
        status: "Kontraindikasi",
        detail: "Category X (Kontraindikasi Mutlak). Sangat teratogenik. Menembus plasenta dan menyebabkan Fetal Warfarin Syndrome (hipoplasia tulang hidung, chondrodysplasia punctata, atrofi saraf optik, mikrosefali, retardasi mental) serta risiko perdarahan janin intrakranial fatal.",
        trimesterAdvice: "Segera beralih ke Heparin atau LMWH (Enoxaparin) saat merencanakan atau terkonfirmasi kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Warfarin terikat kuat pada albumin plasma ibu (99%) sehingga transfer ke dalam ASI hampir tidak ada. Profil koagulasi (INR) bayi tidak terpengaruh.",
        infantRisk: "Risiko bayi negligible; aman menyusui."
      }
    };
  }

  // Statin (Simvastatin, Atorvastatin, Rosuvastatin, Pravastatin, Fluvastatin, Crestor, Lipitor)
  if (matchKey.includes("statin") || matchKey.includes("crestor") || matchKey.includes("lipitor")) {
    return {
      contraindication: "Penyakit hati aktif; peningkatan transaminase persisten; kehamilan; masa menyusui.",
      pregnancySafety: {
        category: "X",
        status: "Kontraindikasi",
        detail: "Category X (Kontraindikasi Mutlak). Kolesterol dan jalur biosintesis asam mevalonat sangat esensial untuk pembentukan membran sel dan organogenesis janin. Penghentian sementara statin selama kehamilan tidak membahayakan kardiovaskular ibu secara akut.",
        trimesterAdvice: "Hentikan statin minimal 1 bulan sebelum merencanakan kehamilan atau segera setelah tes kehamilan positif."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi. Terdapat potensi gangguan metabolisme lipid esensial pada neonatus dan bayi yang disusui karena statin diekskresikan ke dalam ASI.",
        infantRisk: "Risiko gangguan perkembangan sel saraf dan mielinisasi otak bayi."
      }
    };
  }

  // Methotrexate (Rheu-Trex, Trex)
  if (matchKey.includes("methotrexate") || matchKey.includes("rheu_trex") || matchKey.includes("rheutrex")) {
    return {
      contraindication: "Kehamilan; menyusui; depresi sumsum tulang; insufisiensi ginjal/hepar berat; alkoholisme.",
      pregnancySafety: {
        category: "X",
        status: "Kontraindikasi",
        detail: "Category X (Kontraindikasi Mutlak). Antagonis asam folat kuat dengan efek sitotoksik dan abortifasien. Menyebabkan kematian janin/abortus spontan, kelainan kraniofasial parah (craniosynostosis), mikrosefali, retardasi mental berat, dan anomali skeletal.",
        trimesterAdvice: "Kontrasepsi efektif wajib digunakan hingga minimal 6 bulan setelah dosis terakhir bagi wanita, dan 3 bulan bagi pria."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi Mutlak. Diekskresikan ke dalam ASI dan berakumulasi di jaringan neonatus, berisiko menyebabkan supresi sumsum tulang berat (leukopenia, trombositopenia) dan toksisitas organ.",
        infantRisk: "Mielosupresi dan imunosupresi berat pada bayi."
      }
    };
  }

  // Misoprostol (Cytotec, Gastrul)
  if (matchKey.includes("misoprostol") || matchKey.includes("cytotec") || matchKey.includes("gastrul")) {
    return {
      contraindication: "Kehamilan (bila untuk indikasi lambung); riwayat hipersensitivitas prostaglandin.",
      pregnancySafety: {
        category: "X",
        status: "Kontraindikasi",
        detail: "Category X (Kontraindikasi Mutlak bila untuk tukak lambung). Analog PGE1 yang memicu kontraksi miometrium uterus masif, menyebabkan keguguran/abortus, perdarahan hebat, serta kelainan kongenital Moebius sequence (kelumpuhan saraf kranial) dan defek ekstremitas.",
        trimesterAdvice: "Kontraindikasi mutlak selama masa kehamilan untuk terapi gastroenterologi."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Metabolit asam misoprostol diekskresikan dalam jumlah kecil ke dalam ASI; dapat menyebabkan diare sementara dan kram perut pada bayi.",
        infantRisk: "Amati apakah bayi mengalami diare encer atau dehidrasi."
      }
    };
  }

  // Retinoid Dosis Tinggi / Vitamin A Megadosis (>10.000 IU/hari)
  if (matchKey.includes("isotretinoin") || matchKey.includes("acitretin") || (matchKey.includes("retinol") && !matchKey.includes("fisiologis"))) {
    return {
      contraindication: "Kehamilan atau rencana kehamilan; gangguan fungsi hati berat.",
      pregnancySafety: {
        category: "X",
        status: "Kontraindikasi",
        detail: "Category X (Kontraindikasi Mutlak). Sangat teratogenik; memicu Sindrom Asam Retinoat Janin (malformasi kraniofasial, agenesis mikrotia daun telinga, defek kardiovaskular konotrunkalis, dan hidrosefalus).",
        trimesterAdvice: "Hindari kehamilan sebelum, selama, dan pasca terapi sesuai waktu paruh retinoid."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi. Diekskresikan dalam ASI dan berisiko memicu toksisitas vitamin A serta hipervitaminosis pada bayi.",
        infantRisk: "Peningkatan tekanan intrakranial dan gangguan osifikasi tulang bayi."
      }
    };
  }

  // ==========================================
  // 2. KATEGORI D: BUKTI POSITIF RISIKO PADA JANIN (KONTRAINDIKASI RELATIF / PERHATIAN KETAT)
  // ==========================================

  // Golongan ACE-Inhibitor, ARB, & ARNI (Kaptopril, Enalapril, Ramipril, Lisinopril, Valsartan, Candesartan, Losartan, Telmisartan, Irbesartan, Uperio)
  if (
    matchKey.includes("captopril") ||
    matchKey.includes("kaptopril") ||
    matchKey.includes("enalapril") ||
    matchKey.includes("ramipril") ||
    matchKey.includes("lisinopril") ||
    matchKey.includes("valsartan") ||
    matchKey.includes("candesartan") ||
    matchKey.includes("losartan") ||
    matchKey.includes("telmisartan") ||
    matchKey.includes("irbesartan") ||
    matchKey.includes("uperio")
  ) {
    return {
      contraindication: "Kehamilan (trimester 2 & 3); riwayat angioedema herediter/akibat ACEI; stenosis arteri renalis bilateral; penggunaan bersama Aliskiren.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi Mutlak Trimester 2 & 3). Menghambat sistem renin-angiotensin janin; menyebabkan iskemia renal janin, anuria neonatus, oligohidramnion berat, hipoplasia paru janin, displasia tulang tengkorak (calvarial hypoplasia), kontraktur sendi, dan kematian janin intrauterin.",
        trimesterAdvice: "Segera beralih ke antihipertensi lini pertama kehamilan: Metildopa, Nifedipin, atau Labetalol."
      },
      breastfeedingSafety: {
        status: matchKey.includes("captopril") || matchKey.includes("kaptopril") || matchKey.includes("enalapril") ? "Aman" : "Kontraindikasi",
        detail: matchKey.includes("captopril") || matchKey.includes("kaptopril") || matchKey.includes("enalapril")
          ? "Aman. Captopril dan Enalapril memiliki ekskresi ke dalam ASI yang sangat minimal (<0.1% dosis maternal). Dianggap aman untuk bayi cukup bulan."
          : "Kontraindikasi / Hindari. Data transfer ke ASI untuk golongan ARB dan ARNI masih sangat terbatas dengan risiko hipotensi neonatal.",
        infantRisk: "Pantau tekanan darah dan kecukupan hidrasi bayi."
      }
    };
  }

  // Obat Kemoterapi / Sitotoksik Kanker (Doksorubisin, Karboplatin, Sisplatin, Siklofosfamid, Paklitaksel, Tiopol)
  if (
    matchKey.includes("doxorubicin") ||
    matchKey.includes("doksorubisin") ||
    matchKey.includes("carboplatin") ||
    matchKey.includes("karboplatin") ||
    matchKey.includes("cisplatin") ||
    matchKey.includes("cyclophosphamide") ||
    matchKey.includes("fluorouracil") ||
    matchKey.includes("paclitaxel") ||
    matchKey.includes("onc") ||
    matchKey.includes("tiopol")
  ) {
    return {
      contraindication: "Mielosupresi berat; infeksi aktif fulminan; kehamilan (terutama trimester 1); menyusui.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi Mutlak). Zat sitotoksik merusak sintesis DNA/RNA seluler yang sedang aktif berproliferasi, menyebabkan kematian embrio, abortus, malformasi multipel organ, dan toksisitas hematologi janin.",
        trimesterAdvice: "Jika kemoterapi mutlak diperlukan untuk keselamatan ibu, diskusikan terminasi atau penundaan hingga trimester 2-3 dengan pengawasan ketat."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi Mutlak. Agen antineoplastik diekskresikan ke dalam ASI, menyebabkan supresi sumsum tulang berat (pansitopenia) dan penekanan imun berbahaya pada bayi. Ibu harus menghentikan pemberian ASI.",
        infantRisk: "Leukopenia berat, anemia, dan risiko karsinogenik pada bayi."
      }
    };
  }

  // Asam Valproat / Natrium Valproat (Depakene, Valproic Acid)
  if (matchKey.includes("valproat") || matchKey.includes("valproate") || matchKey.includes("valproic") || matchKey.includes("depakene")) {
    return {
      contraindication: "Penyakit hati aktif; gangguan siklus urea; kehamilan untuk migrain; kehamilan untuk epilepsi kecuali tidak ada terapi pengganti.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi / Teratogenik Kuat). Meningkatkan risiko cacat bumbung saraf (spina bifida 1-2%), malformasi kardiovaskular, kelainan kraniofasial, hipospadia, serta penurunan skor IQ dan risiko spektrum autisme (ASD) pasca lahir.",
        trimesterAdvice: "Bila tidak ada antikonvulsan alternatif lain, wajib diberikan suplementasi Asam Folat dosis tinggi (4-5 mg/hari) sebelum konsepsi."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman (dengan pemantauan). Kadar dalam ASI rendah (1-10% dari kadar serum ibu); pantau tanda memar, petekie, dan fungsi hepar pada bayi.",
        infantRisk: "Risiko sedasi ringan; monitor ikterus dan faal hati bayi."
      }
    };
  }

  // Fenitoin (Dilantin, Kutoin)
  if (matchKey.includes("phenytoin") || matchKey.includes("fenitoin") || matchKey.includes("dilantin") || matchKey.includes("kutoin")) {
    return {
      contraindication: "Hipersensitivitas hidantoin; sinus bradikardia; blok sinoatrial; blok AV derajat 2-3; sindrom Adams-Stokes.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi Relatif). Menyebabkan Sindrom Hidantoin Janin (Fetal Hydantoin Syndrome: defek kraniofasial, bibir/langit sumbing, hipoplasia kuku dan falang distal, mikrosefali, retardasi motorik). Berisiko defisiensi faktor pembekuan darah neonatus.",
        trimesterAdvice: "Rekomendasikan pemberian Vitamin K1 profilaksis 10 mg/hari oral pada ibu selama 4 minggu terakhir kehamilan, dan 1 mg IM pada neonatus saat lahir."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Diekskresikan ke dalam ASI dalam kadar moderat. Amati apakah bayi tampak mengantuk, lesu, atau mengalami kesulitan mengisap.",
        infantRisk: "Sedasi neonatal dan penurunan refleks mengisap."
      }
    };
  }

  // Fenobarbital (Luminal, Sibital)
  if (matchKey.includes("phenobarbital") || matchKey.includes("fenobarbital") || matchKey.includes("luminal") || matchKey.includes("sibital")) {
    return {
      contraindication: "Porfiria akut intermiten; depresi pernapasan berat; insufisiensi hati parah.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D. Terbukti meningkatkan risiko anomali kongenital mayor (jantung, orofasial), sedasi neonatus, dan defisiensi vitamin K dependen yang memicu penyakit perdarahan neonatus (Hemorrhagic Disease of the Newborn / HDN).",
        trimesterAdvice: "Berikan vitamin K1 maternal sebelum persalinan dan vitamin K1 1 mg IM pada neonatus segera setelah lahir."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Eliminasi obat pada neonatus sangat lambat sehingga dapat terjadi akumulasi, sedasi berat, hipotonia, dan kesulitan menyusu.",
        infantRisk: "Sedasi mendalam dan pertumbuhan berat badan lambat."
      }
    };
  }

  // Karbamazepin (Tegretol, Bamgetol)
  if (matchKey.includes("carbamazepine") || matchKey.includes("karbamazepin") || matchKey.includes("tegretol") || matchKey.includes("bamgetol")) {
    return {
      contraindication: "Riwayat depresi sumsum tulang; blok AV; porfiria akut; penggunaan bersama MAOI.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D. Peningkatan risiko defek tabung saraf (spina bifida ~1%), defek kardiovaskular, dan hipoplasia kuku janin. Diperlukan pemantauan kadar obat serum ibu.",
        trimesterAdvice: "Berikan asam folat dosis tinggi (4-5 mg/hari) dan lakukan skrining USG anatomi janin pada usia 18-20 minggu."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman (dengan pemantauan). Diekskresikan dalam konsentrasi rendah ke ASI. Umumnya ditoleransi baik oleh bayi.",
        infantRisk: "Pantau tanda ikterus, ruam kulit, dan kelesuan pada bayi."
      }
    };
  }

  // Benzodiazepin (Diazepam / Valisanbe, Stesolid, Alprazolam, Lorazepam, Midazolam, Klonazepam)
  if (
    matchKey.includes("valisanbe") ||
    matchKey.includes("diazepam") ||
    matchKey.includes("stesolid") ||
    matchKey.includes("alprazolam") ||
    matchKey.includes("lorazepam") ||
    matchKey.includes("midazolam") ||
    matchKey.includes("clonazepam")
  ) {
    return {
      contraindication: "Miastenia gravis; insufisiensi pernapasan berat; sindrom apnea tidur; glaukoma sudut tertutup akut; koma.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D. Menembus plasenta. Penggunaan pada trimester 1 dikaitkan dengan risiko celah bibir/langit; penggunaan peripartum memicu 'Floppy Infant Syndrome' (hipotermia, hipotonia, depresi pernapasan neonatus) serta sindrom putus obat neonatal.",
        trimesterAdvice: "Hindari penggunaan rutin. Bila mendesak untuk status epileptikus, gunakan dosis minimal dan siapkan resusitasi neonatus."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian / Hindari dosis berulang. Metabolit aktif dapat terakumulasi pada neonatus karena klirens hepar yang lambat, memicu sedasi berlebih dan letargi.",
        infantRisk: "Depresi SSP bayi, kelesuan minum, dan gagal tumbuh bila dipakai berulang."
      }
    };
  }

  // Aminoglikosida Sistemik (Gentamisin, Amikasin, Tobramisin, Kanamisin, Streptomisin, Sagestam)
  if (
    matchKey.includes("gentamicin") ||
    matchKey.includes("gentamisin") ||
    matchKey.includes("neomycin") ||
    matchKey.includes("amikacin") ||
    matchKey.includes("amikasin") ||
    matchKey.includes("streptomycin") ||
    matchKey.includes("tobramycin") ||
    matchKey.includes("sagestam")
  ) {
    return {
      contraindication: "Hipersensitivitas aminoglikosida; miastenia gravis; gangguan fungsi ginjal berat tanpa pemantauan kadar obat (TDM).",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi). Menembus sawar plasenta dan terkonsentrasi pada cairan labirin telinga dalam janin, menyebabkan kerusakan saraf pendengaran ireversibel (ototoksisitas kranialis N.VIII janin / tuli sensorineural kongenital) serta nefrotoksisitas janin.",
        trimesterAdvice: "Hanya boleh diberikan bila ada infeksi bakteri gram-negatif berat yang mengancam jiwa tanpa pilihan antibiotik lain."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Ekskresi dalam ASI sangat kecil dan absorpsi oral melalui mukosa saluran pencernaan bayi yang intak hampir nol (<1%). Tidak menyebabkan efek sistemik pada bayi.",
        infantRisk: "Hanya pantau kemungkinan perubahan flora usus (diare ringan)."
      }
    };
  }

  // Tetrasiklin & Doksisiklin (Tetracycline, Doxycycline, Minocycline)
  if (
    matchKey.includes("tetracycline") ||
    matchKey.includes("tetrasiklin") ||
    matchKey.includes("doxycycline") ||
    matchKey.includes("doksisiklin") ||
    matchKey.includes("minocycline")
  ) {
    return {
      contraindication: "Anak usia <8 tahun; kehamilan trimester 2 & 3; masa menyusui; gangguan ginjal/hati berat.",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category D (Kontraindikasi Trimester 2 & 3). Mengikat kalsium janin pada masa kalsifikasi gigi dan tulang; memicu diskolorisasi gigi permanen (kuning-abu-abu kecokelatan), hipoplasia enamel gigi, dan perlambatan pertumbuhan osteogenesis tulang janin.",
        trimesterAdvice: "Gunakan antibiotik alternatif yang aman untuk kehamilan seperti Penisilin, Sefalosporin, atau Azitromisin."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi / Hindari penggunaan jangka panjang (>3 minggu) untuk mencegah diskolorisasi enamel gigi dan gangguan flora usus bayi.",
        infantRisk: "Risiko noda permanen pada bakal gigi susu bayi dan kandidiasis oral."
      }
    };
  }

  // Antitiroid (Thiamazole / Metimazol / Thyrozol, Propiltiourasil / PTU)
  if (
    matchKey.includes("thiamazole") ||
    matchKey.includes("metimazol") ||
    matchKey.includes("thyrozol") ||
    matchKey.includes("propylthiourasil") ||
    matchKey.includes("propiltiourasil") ||
    matchKey.includes("ptu")
  ) {
    return {
      contraindication: "Agranulositosis sebelumnya; hepatitis toksik; hipersensitivitas.",
      pregnancySafety: {
        category: "D",
        status: "Perlu Perhatian",
        detail: "Category D (Gunakan dosis efektif terendah). Menembus plasenta. Thiamazole pada trimester 1 dikaitkan dengan aplasia cutis kongenital dan atresia koana; oleh karena itu PTU lebih disukai pada trimester pertama, lalu beralih ke Thiamazole pada trimester 2 dan 3 untuk menghindari hepatotoksisitas berat maternal akibat PTU.",
        trimesterAdvice: "Targetkan kadar FT4 ibu pada batas normal-tinggi untuk mencegah hipotiroidisme dan goiter pada janin."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman pada dosis terbagi terendah (PTU ≤300 mg/hari atau Thiamazole ≤20 mg/hari). Pantau kadar TSH dan tumbuh kembang bayi secara periodik.",
        infantRisk: "Risiko gangguan fungsi tiroid bayi sangat rendah pada dosis terapeutik wajar."
      }
    };
  }

  // ==========================================
  // 3. NSAID (Anti-inflamasi Non-Steroid): RISIKO DINAMIS TRIMESTER 3
  // ==========================================
  if (
    matchKey.includes("ibuprofen") ||
    matchKey.includes("mefenamic") ||
    matchKey.includes("mefenamat") ||
    matchKey.includes("diclofenac") ||
    matchKey.includes("diklofenak") ||
    matchKey.includes("ketorolac") ||
    matchKey.includes("meloxicam") ||
    matchKey.includes("piroxicam") ||
    matchKey.includes("naproxen") ||
    matchKey.includes("indomethacin") ||
    matchKey.includes("voltadex") ||
    matchKey.includes("pronalges") ||
    matchKey.includes("protofen") ||
    matchKey.includes("suprafenid") ||
    (matchKey.includes("aspirin") && !matchKey.includes("aspilets"))
  ) {
    return {
      contraindication: "Ulkus peptikum aktif; perdarahan gastrointestinal; riwayat asma akibat NSAID; gagal ginjal/jantung berat; kehamilan trimester 3 (kontraindikasi mutlak).",
      pregnancySafety: {
        category: "D",
        status: "Kontraindikasi",
        detail: "Category C (Trimester 1-2) / Category D (Kontraindikasi Trimester 3 / usia gestasi ≥20-30 minggu). Penghambatan sintesis prostaglandin menyebabkan konstriksi/penutupan prematur duktus arteriosus janin, hipertensi pulmonal persisten neonatus (PPHN), disfungsi ginjal janin yang memicu oligohidramnion berat, serta menghambat kontraksi persalinan dan meningkatkan perdarahan postpartum.",
        trimesterAdvice: "Hindari sepenuhnya sejak usia gestasi 20 minggu ke atas. Pilih Paracetamol sebagai alternatif analgetik paling aman."
      },
      breastfeedingSafety: {
        status: matchKey.includes("ibuprofen") ? "Aman" : matchKey.includes("mefenamic") || matchKey.includes("diclofenac") ? "Aman" : "Perlu Perhatian",
        detail: matchKey.includes("ibuprofen")
          ? "Sangat Aman. Ibuprofen adalah obat golongan NSAID pilihan nomor satu untuk ibu menyusui karena ekskresinya ke ASI sangat rendah (<0.6% dosis ibu) dan tidak terdeteksi pada serum bayi."
          : "Aman / Perlu Perhatian. Ekskresi dalam ASI rendah untuk terapi jangka pendek. Hindari penggunaan obat jangka panjang atau dosis tinggi (seperti Ketorolak/Piroksikam) saat menyusui.",
        infantRisk: "Risiko efek samping gastrointestinal atau trombosit bila menggunakan dosis tinggi."
      }
    };
  }

  // Aspirin Dosis Rendah (Thrombo Aspilets 80-100 mg untuk Preeklamsia)
  if (matchKey.includes("aspilets") || (matchKey.includes("aspirin") && matchKey.includes("rendah"))) {
    return {
      contraindication: "Hipersensitivitas salisilat; perdarahan aktif; hemofilia; trombositopenia berat.",
      pregnancySafety: {
        category: "C",
        status: "Aman",
        detail: "Category C (Aman & Sangat Direkomendasikan Obstetri). Dosis rendah 80-150 mg/hari merupakan terapi baku emas profilaksis preeklamsia pada ibu hamil risiko tinggi, dimulai sejak usia 12-16 minggu hingga aterm tanpa memicu efek samping NSAID dosis penuh.",
        trimesterAdvice: "Dianjurkan diminum malam hari sebelum tidur atas rekomendasi dokter spesialis kandungan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman pada dosis rendah antiplatelet (80-100 mg/hari). Kadar salisilat dalam ASI sangat kecil pada dosis ini.",
        infantRisk: "Hindari aspirin dosis analgesik tinggi (>1000 mg) karena risiko sindrom Reye."
      }
    };
  }

  // ==========================================
  // 4. KLORAMFENIKOL & TIAMFENIKOL
  // ==========================================
  if (
    matchKey.includes("chloramphenicol") ||
    matchKey.includes("kloramfenikol") ||
    matchKey.includes("thiamphenicol") ||
    matchKey.includes("tiamfenikol")
  ) {
    return {
      contraindication: "Depresi sumsum tulang; anemia aplastik; porfiria; kehamilan aterm / persalinan; masa menyusui.",
      pregnancySafety: {
        category: "C",
        status: "Kontraindikasi",
        detail: "Category C (Kontraindikasi Menjelang Persalinan / Trimester 3). Defisiensi enzim glukuronil transferase pada hepar janin dan neonatus menyebabkan akumulasi toksik obat bebas yang memicu Gray Baby Syndrome (sianosis, hipotermia, flaksiditas, kolaps kardiovaskular abu-abu fatal).",
        trimesterAdvice: "Hindari pemberian terutama pada trimester ketiga kehamilan dan saat menjelang partus."
      },
      breastfeedingSafety: {
        status: "Kontraindikasi",
        detail: "Kontraindikasi. Diekskresikan ke dalam ASI; berisiko memicu supresi sumsum tulang idiosinkratik (anemia aplastik berat) dan Gray Baby Syndrome pada bayi.",
        infantRisk: "Depresi hematopoietik dan sindrom bayi abu-abu."
      }
    };
  }

  // ==========================================
  // 5. FLUOROQUINOLONE (Siprofloksasin, Levofloksasin, Baquinor)
  // ==========================================
  if (
    matchKey.includes("cipro") ||
    matchKey.includes("levofloxacin") ||
    matchKey.includes("moxifloxacin") ||
    matchKey.includes("ofloxacin") ||
    matchKey.includes("baquinor") ||
    matchKey.includes("optiflox")
  ) {
    return {
      contraindication: "Hipersensitivitas kuinolon; riwayat tendinitis/ruptur tendon akibat kuinolon; miastenia gravis; anak/remaja.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Perlu Perhatian / Hindari Lini Pertama). Studi hewan menunjukkan artropati dan kerusakan tulang rawan sendi imatur yang menahan beban. Gunakan hanya bila tidak ada alternatif antibiotik lain yang efektif (misalnya infeksi bakteri gram negatif multiresisten).",
        trimesterAdvice: "Pertimbangkan alternatif antibiotik lini pertama: Sefalosporin atau Penisilin spektrum luas."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Diekskresikan ke dalam ASI. Meskipun risiko artropati pada bayi manusia belum terbukti definitif, amati kemungkinan timbulnya diare, sariawan mulut (kandidiasis), atau gangguan flora usus bayi.",
        infantRisk: "Perubahan flora normal saluran cerna bayi dan diare."
      }
    };
  }

  // ==========================================
  // 6. KORTIKOSTEROID
  // ==========================================

  // Budesonide (Inhalasi: Pulmicort, Symbicort, Sonide, Obucort)
  if (matchKey.includes("budesonide") || matchKey.includes("pulmicort") || matchKey.includes("symbicort") || matchKey.includes("sonide") || matchKey.includes("obucort")) {
    return {
      contraindication: "Status asmatikus akut yang membutuhkan bronkodilator kerja cepat primer; infeksi tuberkulosis paru tak diobati.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman untuk Inhalasi). Merupakan kortikosteroid inhalasi pilihan utama (lini pertama) pada kehamilan menurut konsensus internasional GINA; bioavailabilitas sistemik sangat rendah dan studi prospektif membuktikan tidak meningkatkan risiko cacat janin.",
        trimesterAdvice: "Pertahankan kontrol asma ibu dengan baik karena hipoksia maternal lebih berbahaya bagi janin dibandingkan obat inhalasi."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Ekskresi obat ke dalam ASI sangat minimal dan tidak memiliki efek sistemik pada bayi yang menyusui.",
        infantRisk: "Risiko bayi hampir nol."
      }
    };
  }

  // Kortikosteroid Sistemik (Deksametason, Metilprednisolon, Prednison, Kortidex)
  if (
    matchKey.includes("dexamethasone") ||
    matchKey.includes("deksametason") ||
    matchKey.includes("methylprednisolone") ||
    matchKey.includes("metilprednisolon") ||
    matchKey.includes("prednisone") ||
    matchKey.includes("prednison") ||
    matchKey.includes("cortidex")
  ) {
    return {
      contraindication: "Infeksi jamur sistemik aktif; infeksi virus/bakteri akut tidak terkontrol; pemberian vaksin virus hidup.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Perlu Perhatian). Prednison lebih disukai untuk terapi penyakit ibu karena 90% diinaktivasi oleh enzim 11-beta-HSD2 plasenta. Deksametason/Betametason sengaja dipilih obstetrikus bila tujuannya adalah pematangan paru janin pada ancaman persalinan prematur.",
        trimesterAdvice: "Hindari dosis tinggi berkepanjangan pada trimester 1 untuk meminimalkan risiko celah langit-langit dan insufisiensi adrenal janin."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Prednison dan Metilprednisolon masuk ke ASI dalam jumlah sangat kecil. Bila menggunakan dosis tinggi (>20 mg prednison), tunda menyusui 3-4 jam setelah konsumsi obat untuk menghindari kadar puncak dalam ASI.",
        infantRisk: "Tidak ada risiko signifikan pada terapi singkat."
      }
    };
  }

  // Kortikosteroid Topikal (Cinolon, Hydrocortisone Krim)
  if (matchKey.includes("cinolon") || matchKey.includes("hydrocortisone") || matchKey.includes("hidrokortison") || matchKey.includes("desoximetasone")) {
    return {
      contraindication: "Tuberkulosis kulit; infeksi jamur, virus (herpes, cacar air) pada area yang tidak diobati; dermatitis perioral.",
      pregnancySafety: {
        category: "C",
        status: "Aman",
        detail: "Category C (Aman pada area terbatas & durasi singkat). Penyerapan sistemik dari kulit utuh sangat minimal bila digunakan pada area kecil tanpa pembalut oklusif.",
        trimesterAdvice: "Gunakan lapisan tipis pada lesi yang terinfeksi dan hindari penggunaan luas dalam jangka waktu lama."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Tidak diserap sistemik dalam jumlah bermakna. Jangan mengoleskan sediaan krim/salep pada area puting susu atau payudara sebelum menyusui untuk mencegah tertelan oleh bayi.",
        infantRisk: "Hindari kontak langsung mulut bayi dengan krim."
      }
    };
  }

  // ==========================================
  // 7. ANTIDIABETIK
  // ==========================================

  // Insulin Eksogen (Sansulin, Ryzodeg, Lantus, Humalog, Actrapid, Novorapid)
  if (matchKey.includes("insulin") || matchKey.includes("sansulin") || matchKey.includes("ryzodeg") || matchKey.includes("lantus") || matchKey.includes("novorapid")) {
    return {
      contraindication: "Kondisi hipoglikemia aktif; hipersensitivitas terhadap insulin atau komponen pembawa.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Baku Emas / Paling Aman). Molekul peptida besar insulin tidak dapat menembus sawar plasenta. Merupakan baku emas (gold standard) penanganan diabetes melitus gestasional dan pregestasional untuk mencapai target gula darah ketat tanpa risiko buruk pada janin.",
        trimesterAdvice: "Lakukan titrasi dosis rutin bersama dokter endokrin/obgyn seiring bertambahnya usia kehamilan dan perubahan resistensi insulin plasenta."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Insulin adalah protein alami yang diekskresikan minimal ke dalam ASI dan segera terurai oleh enzim pencernaan lambung bayi jika tertelan.",
        infantRisk: "Aman sepenuhnya untuk bayi menyusui."
      }
    };
  }

  // Metformin
  if (matchKey.includes("metformin")) {
    return {
      contraindication: "Asidosis metabolik akut/kronis; gagal ginjal berat (eGFR <30 mL/min); hipoksia jaringan; gagal jantung dekompensasi.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Aman & Sering Digunakan). Walaupun menembus plasenta, studi klinis luas membuktikan tidak ada peningkatan risiko malformasi mayor janin. Banyak digunakan pada PCOS dan diabetes gestasional.",
        trimesterAdvice: "Bisa dilanjutkan atau dialihkan ke Insulin sesuai target glikemik yang ditentukan dokter."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam kadar sangat rendah ke dalam ASI (kurang dari 0.5% dari dosis maternal terbobot).",
        infantRisk: "Tidak ada efek samping buruk yang terdokumentasi pada bayi menyusui."
      }
    };
  }

  // Sulfonilurea (Glibenklamid, Gliklazid, Glimepirid)
  if (matchKey.includes("glibenclamide") || matchKey.includes("gliklazid") || matchKey.includes("glimepiride")) {
    return {
      contraindication: "Diabetes melitus tipe 1; ketoasidosis diabetikum; gangguan ginjal atau hati berat; kehamilan.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Hindari / Perlu Perhatian Tinggi). Menembus plasenta dan merangsang sel beta pankreas janin sehingga berisiko hipoglikemia neonatal berkepanjangan dan makrosomia. Disarankan beralih ke terapi Insulin.",
        trimesterAdvice: "Segera konsultasikan untuk beralih ke Insulin eksogen saat merencanakan atau mengetahui kehamilan."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Terdapat risiko teoretis hipoglikemia pada bayi jika obat masuk ke dalam ASI.",
        infantRisk: "Pantau tanda hipoglikemia pada bayi (letargi, pucat, keringat dingin)."
      }
    };
  }

  // ==========================================
  // 8. KARDIOVASKULAR: BETA-BLOCKER, CCB, DIURETIK
  // ==========================================

  // Beta-Blocker (Bisoprolol / Concor, Propranolol, Labetalol)
  if (matchKey.includes("bisoprolol") || matchKey.includes("concor") || matchKey.includes("propranolol") || matchKey.includes("atenolol")) {
    return {
      contraindication: "Asma berat; bradikardia sinus (<50 bpm); blok AV derajat 2 atau 3; syok kardiogenik; gagal jantung akut dekompensasi.",
      pregnancySafety: {
        category: matchKey.includes("atenolol") ? "D" : "C",
        status: "Perlu Perhatian",
        detail: "Category C (Perlu Perhatian; Atenolol Kategori D). Beta-blocker dapat menurunkan perfusi darah plasenta, meningkatkan risiko hambatan pertumbuhan janin intrauterin (IUGR), berat badan lahir rendah, bradikardia neonatal, dan hipoglikemia.",
        trimesterAdvice: "Labetalol adalah beta-blocker pilihan lini pertama kehamilan. Bila menggunakan Bisoprolol, pantau denyut jantung janin dan pertumbuhan via USG."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman (dengan pemantauan). Bisoprolol dan Propranolol diekskresikan dalam kadar rendah ke dalam ASI.",
        infantRisk: "Pantau denyut jantung bayi dan tanda kelesuan."
      }
    };
  }

  // Kalsium Channel Blocker (Nifedipin, Amlodipin, Diltiazem)
  if (matchKey.includes("nifedipine") || matchKey.includes("nifedipin") || matchKey.includes("amlodipine") || matchKey.includes("amlodipin") || matchKey.includes("diltiazem")) {
    return {
      contraindication: "Hipotensi berat; syok kardiogenik; stenosis aorta berat; gagal jantung lanjut.",
      pregnancySafety: {
        category: "C",
        status: "Aman",
        detail: "Category C (Nifedipin Paling Aman / Lini Pertama). Nifedipin merupakan obat pilihan utama lini pertama terapi preeklamsia/hipertensi kehamilan dan tokolitik penunda kontraksi persalinan prematur dengan profil keamanan maternal-fetal yang sangat baik.",
        trimesterAdvice: "Nifedipin lepas lambat sangat direkomendasikan dokter kandungan untuk mengontrol hipertensi gestasional."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Nifedipin diekskresikan dalam konsentrasi sangat rendah ke dalam ASI dan kompatibel dengan pemberian ASI eksklusif.",
        infantRisk: "Risiko efek kardiologis pada bayi sangat rendah."
      }
    };
  }

  // Diuretik (Furosemid, Spironolakton, HCT)
  if (matchKey.includes("furosemide") || matchKey.includes("spironolactone") || matchKey.includes("hct") || matchKey.includes("hydrochlorothiazide")) {
    return {
      contraindication: "Anuria; gagal ginjal akut; hipovolemia berat/dehidrasi; hipokalemia parah; ensefalopati hepatikum.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Perlu Perhatian). Furosemid menembus plasenta dan memicu diuresis janin; pengurangan volume intravaskular ibu dapat mengorbankan perfusi plasenta. Spironolakton memiliki efek anti-androgenik pada janin laki-laki.",
        trimesterAdvice: "Hindari penggunaan rutin diuretik untuk edema fisiologis kehamilan; hanya digunakan pada gagal jantung kongestif atau edema paru ibu."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Diuretik poten dosis tinggi dapat menekan dan menurunkan volume produksi ASI (laktasi).",
        infantRisk: "Penurunan produksi ASI ibu; gunakan dosis efektif terendah."
      }
    };
  }

  // ==========================================
  // 9. ANALGETIK & ANTIPIRETIK: PARACETAMOL (BAKU EMAS PALING AMAN)
  // ==========================================
  if (matchKey.includes("paracetamol") || matchKey.includes("acetaminophen") || matchKey.includes("sanmol") || matchKey.includes("pamol")) {
    return {
      contraindication: "Gangguan fungsi hati berat; gagal hati aktif; hipersensitivitas paracetamol.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman / Pilihan Utama). Merupakan obat analgetik dan antipiretik lini pertama pilihan nomor satu di seluruh trimester kehamilan (Trimester 1, 2, dan 3). Profil keamanannya paling mapan dan tidak teratogenik.",
        trimesterAdvice: "Gunakan dosis efektif terkecil dan durasi sesingkat mungkin sesuai kebutuhan demam atau nyeri."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Ekskresi dalam ASI sangat kecil (<0.1-1% dosis maternal) dan telah terbukti aman digunakan selama masa laktasi tanpa efek samping bermakna bagi bayi.",
        infantRisk: "Aman sepenuhnya untuk bayi menyusui."
      }
    };
  }

  // ==========================================
  // 10. ANTIBIOTIK AMAN: PENISILIN, SEFALOSPORIN, MAKROLIDA
  // ==========================================

  // Penisilin (Amoksisilin, Ampisilin, Viccillin)
  if (matchKey.includes("amoxicillin") || matchKey.includes("ampicillin") || matchKey.includes("viccillin") || matchKey.includes("amove")) {
    return {
      contraindication: "Riwayat reaksi alergi tipe cepat berat (anafilaksis, angioedema) terhadap Penisilin atau antibiotik beta-laktam.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman). Merupakan antibiotik lini pertama pilihan utama untuk berbagai infeksi bakteri (saluran napas, THT, infeksi gigi, kemih) selama kehamilan. Tidak menimbulkan risiko malformasi janin.",
        trimesterAdvice: "Dapat digunakan dengan aman pada semua trimester kehamilan sesuai anjuran dokter."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam jumlah minimal ke dalam ASI. Secara umum sangat aman dan kompatibel dengan pemberian ASI.",
        infantRisk: "Hanya pantau kemungkinan diare ringan atau kandidiasis oral pada bayi."
      }
    };
  }

  // Sefalosporin (Sefadroksil, Sefiksim, Seftriakson, Sefazolin, Sefotaksim)
  if (matchKey.includes("cefixime") || matchKey.includes("cefadroxil") || matchKey.includes("ceftriaxone") || matchKey.includes("cefaclor") || matchKey.includes("cefazolin")) {
    return {
      contraindication: "Hipersensitivitas terhadap antibiotik golongan Sefalosporin atau riwayat syok anafilaksis silang terhadap Penisilin.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman). Terbukti aman dan tidak menunjukkan efek buruk pada embrio atau janin pada studi terkontrol luas. Merupakan lini utama infeksi bakteri saat hamil.",
        trimesterAdvice: "Pilihan aman untuk infeksi saluran kemih dan infeksi sistemik pada kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Konsentrasi obat dalam ASI sangat rendah dan aman digunakan oleh ibu yang sedang menyusui.",
        infantRisk: "Pantau perubahan frekuensi buang air besar bayi."
      }
    };
  }

  // Makrolida (Azitromisin, Eritromisin, Spiramycin)
  if (matchKey.includes("azithromycin") || matchKey.includes("erythromycin") || matchKey.includes("spiramycin") || matchKey.includes("clarithromycin")) {
    return {
      contraindication: "Riwayat kolestasis hepar akibat makrolida; gangguan fungsi hati berat; perpanjangan interval QT jantung.",
      pregnancySafety: {
        category: matchKey.includes("clarithromycin") ? "C" : "B",
        status: "Aman",
        detail: "Category B (Aman; Spiramycin obat pilihan toksoplasmosis kongenital; Azitromisin aman). Makrolida digunakan secara luas bila ada alergi terhadap penisilin.",
        trimesterAdvice: "Azitromisin dan Spiramycin terbukti aman pada semua trimester kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Ekskresi dalam ASI rendah. Kompatibel dengan pemberian ASI eksklusif.",
        infantRisk: "Pantau kemungkinan diare sementara pada bayi."
      }
    };
  }

  // Vankomisin (Injeksi)
  if (matchKey.includes("vancomycin") || matchKey.includes("vankomisin")) {
    return {
      contraindication: "Hipersensitivitas terhadap vankomisin; gangguan ginjal berat tanpa kontrol kadar darah (TDM).",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Lini Utama untuk MRSA Berat pada Kehamilan). Menembus plasenta dalam kadar rendah; gunakan bila ada indikasi infeksi bakteri gram positif berat/resisten dengan pemantauan ketat fungsi ginjal dan kadar palung (trough level) serum.",
        trimesterAdvice: "Pantau fungsi ginjal ibu dan lakukan Therapeutic Drug Monitoring (TDM)."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam ASI dalam jumlah kecil dan tidak diserap secara oral oleh saluran cerna bayi dengan mukosa utuh.",
        infantRisk: "Risiko absorpsi sistemik bayi sangat rendah."
      }
    };
  }

  // Heparin & Enoxaparin (LMWH)
  if (matchKey.includes("heparin") || matchKey.includes("enoxaparin") || matchKey.includes("thrombophob")) {
    return {
      contraindication: "Trombositopenia akibat heparin (HIT); perdarahan aktif mayor; gangguan koagulasi parah.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B / C (Sangat Aman / Antikoagulan Pilihan Kehamilan). Heparin dan LMWH memiliki bobot molekul besar yang tidak dapat menembus sawar plasenta, sehingga tidak menyebabkan teratogenesis atau perdarahan janin.",
        trimesterAdvice: "Merupakan terapi baku emas antikoagulan selama kehamilan untuk DVT, emboli paru, atau katup jantung mekanik."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Karena molekulnya besar, heparin tidak diekskresikan ke dalam ASI dan tidak dapat diserap melalui pencernaan bayi.",
        infantRisk: "Aman sepenuhnya untuk bayi menyusui."
      }
    };
  }

  // ==========================================
  // 11. ANTIJAMUR
  // ==========================================

  // Nystatin (Oral / Suspensi / Drops)
  if (matchKey.includes("nystatin") || matchKey.includes("nistatin") || matchKey.includes("candid")) {
    return {
      contraindication: "Riwayat hipersensitivitas nystatin.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A / B (Sangat Aman). Nystatin tidak diserap secara sistemik oleh saluran pencernaan atau membran mukosa utuh, sehingga tidak menimbulkan paparan pada janin.",
        trimesterAdvice: "Obat pilihan nomor satu untuk kandidiasis oral (oral thrush) pada ibu hamil dan bayi."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Tidak diserap ke dalam ASI. Dapat digunakan langsung untuk mengobati infeksi jamur pada puting ibu maupun mulut bayi secara simultan.",
        infantRisk: "Sangat aman tanpa risiko sistemik."
      }
    };
  }

  // Antijamur Azol (Klotrimazol, Mikonazol, Flukonazol)
  if (matchKey.includes("clotrimazole") || matchKey.includes("miconazole") || matchKey.includes("fluconazole") || matchKey.includes("ketoconazole")) {
    const isSystemicFluconazoleHigh = matchKey.includes("fluconazole") && matchKey.includes("tinggi");
    return {
      contraindication: "Penyakit hati aktif; penggunaan bersama obat yang memperpanjang interval QT; hipersensitivitas azol.",
      pregnancySafety: {
        category: isSystemicFluconazoleHigh ? "D" : "C",
        status: isSystemicFluconazoleHigh ? "Kontraindikasi" : "Aman",
        detail: isSystemicFluconazoleHigh
          ? "Category D (Kontraindikasi pada Dosis Tinggi Sistemik >400 mg/hari). Terapi flukonazol sistemik dosis tinggi jangka panjang dikaitkan dengan anomali kraniofasial dan skeletal janin."
          : "Category B / C (Aman untuk Sediaan Topikal/Vaginal & Flukonazol Dosis Tunggal 150 mg). Klotrimazol dan Mikonazol topikal adalah pilihan lini pertama untuk kandidiasis vulvovagina saat hamil.",
        trimesterAdvice: "Utamakan sediaan topikal/supositoria vagina lokal (Klotrimazol/Mikonazol) selama masa kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Klotrimazol dan Mikonazol topikal tidak masuk ke ASI. Flukonazol dosis tunggal diekskresikan minimal dan aman untuk ibu menyusui.",
        infantRisk: "Aman untuk bayi bila sediaan topikal tidak dioleskan pada puting."
      }
    };
  }

  // ==========================================
  // 12. GASTROINTESTINAL & ANTIEMETIK
  // ==========================================

  // Piridoksin (Vitamin B6)
  if (matchKey.includes("pyridoxine") || matchKey.includes("vitamin_b6") || matchKey.includes("b6")) {
    return {
      contraindication: "Hipersensitivitas piridoksin.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman & Baku Emas). Merupakan terapi lini pertama yang direkomendasikan ACOG untuk mengatasi mual dan muntah kehamilan (morning sickness / hiperemesis).",
        trimesterAdvice: "Dapat dikonsumsi 10-25 mg setiap 8 jam sesuai anjuran dokter kandungan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Merupakan mikronutrien esensial alami dalam ASI. Dosis fisiologis aman dan mendukung nutrisi bayi.",
        infantRisk: "Sangat aman."
      }
    };
  }

  // Ondansetron
  if (matchKey.includes("ondansetron")) {
    return {
      contraindication: "Sindrom perpanjangan QT bawaan; penggunaan bersama Apomorfin.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Aman untuk Hiperemesis Gravidarum Refrakter). Banyak digunakan sebagai antiemetik lini kedua/ketiga pada kehamilan ketika terapi vitamin B6 atau antihistamin tidak memadai.",
        trimesterAdvice: "Sangat efektif meredakan dehidrasi akibat muntah berat kehamilan di bawah pengawasan medis."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam konsentrasi rendah ke dalam ASI; tidak dilaporkan adanya efek samping serius pada bayi.",
        infantRisk: "Aman dengan pemantauan normal."
      }
    };
  }

  // Metoklopramid
  if (matchKey.includes("metoclopramide")) {
    return {
      contraindication: "Obstruksi, perforasi, atau perdarahan gastrointestinal; feokromositoma; epilepsi; riwayat diskinesia tardif.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Aman). Tidak ada bukti peningkatan risiko malformasi janin pada studi kohort luas. Obat pilihan kedua untuk mual muntah kehamilan.",
        trimesterAdvice: "Batasi penggunaan maksimal 5-7 hari berturut-turut untuk mencegah efek ekstrapiramidal pada ibu."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Diekskresikan ke dalam ASI. Kadang dipakai sebagai galaktagog jangka pendek (merangsang prolaktin), namun hindari pemakaian jangka panjang.",
        infantRisk: "Pantau bayi dari risiko sedasi atau kegelisahan."
      }
    };
  }

  // Domperidon
  if (matchKey.includes("domperidone") || matchKey.includes("domperidon")) {
    return {
      contraindication: "Prolaktinoma hipofisis; obstruksi mekanik saluran cerna; gangguan fungsi hati sedang-berat; perpanjangan interval QTc.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Perlu Perhatian). Data studi pada manusia masih terbatas. Gunakan hanya jika potensi manfaat klinis pada ibu membenarkan potensi risiko janin.",
        trimesterAdvice: "Lebih disukai Piridoksin (B6), Metoklopramid, atau Ondansetron untuk mual kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Ekskresi obat ke dalam ASI sangat minimal (<0.1% dosis maternal). Sering digunakan atas indikasi klinis sebagai pemicu prolaktin (laktagog) di bawah dokter spesialis.",
        infantRisk: "Risiko bayi negligible pada dosis terukur."
      }
    };
  }

  // Sukralfat & Antasida
  if (matchKey.includes("sucralfate") || matchKey.includes("sukralfat") || matchKey.includes("antacid") || matchKey.includes("antasida")) {
    return {
      contraindication: "Gagal ginjal kronis berat (risiko akumulasi aluminium); hipersensitivitas.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman). Bekerja lokal melapisi mukosa lambung dan tidak diserap ke dalam peredaran darah sistemik (<1%), sehingga tidak mencapai janin.",
        trimesterAdvice: "Lini pertama yang sangat aman untuk keluhan dispepsia, refluks asam lambung, dan heartburn saat hamil."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Karena tidak diserap secara sistemik oleh ibu, obat ini tidak diekskresikan ke dalam ASI.",
        infantRisk: "Aman sepenuhnya untuk bayi menyusui."
      }
    };
  }

  // PPI (Omeprazole, Lansoprazole, Pantoprazole)
  if (matchKey.includes("omeprazole") || matchKey.includes("lansoprazole") || matchKey.includes("pantoprazole")) {
    return {
      contraindication: "Hipersensitivitas terhadap obat golongan PPI; penggunaan bersama Rilpivirin.",
      pregnancySafety: {
        category: matchKey.includes("omeprazole") ? "C" : "B",
        status: "Aman",
        detail: "Category B / C (Aman). Penelitian epidemiologi berskala besar membuktikan bahwa inhibitor pompa proton tidak meningkatkan risiko cacat lahir janin.",
        trimesterAdvice: "Pilihan aman bila antasida atau antagonis H2 tidak memadai meredakan GERD gestasional."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam jumlah sangat kecil ke dalam ASI dan dihancurkan oleh asam lambung bayi.",
        infantRisk: "Tidak ada risiko terdokumentasi pada bayi menyusui."
      }
    };
  }

  // ==========================================
  // 13. SUPLEMEN MIKRONUTRIEN & VITAMIN (KATEGORI A: SANGAT AMAN & ESENSIAL)
  // ==========================================

  // Asam Folat (Starfolat, Profolat, Folic Acid)
  if (matchKey.includes("folic") || matchKey.includes("folat") || matchKey.includes("starfolat") || matchKey.includes("profolat")) {
    return {
      contraindication: "Anemia pernisiosa tidak terdiagnosis tanpa terapi vitamin B12.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman & Wajib Esensial). Merupakan nutrisi paling penting sebelum dan selama awal kehamilan untuk mencegah cacat tabung saraf janin (Neural Tube Defects seperti Spina Bifida dan Anensefali).",
        trimesterAdvice: "Dosis harian 400-800 mcg/hari direkomendasikan untuk semua wanita hamil (hingga 4-5 mg/hari pada ibu dengan riwayat janin spina bifida atau konsumsi antikonvulsan)."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Asam folat secara aktif ditransfer ke dalam ASI untuk memenuhi kebutuhan pertumbuhan pesat sel darah dan otak bayi.",
        infantRisk: "Esensial dan sangat menguntungkan bagi bayi."
      }
    };
  }

  // Zat Besi / Tablet Tambah Darah (Ferrous, Besi, Maltofer)
  if (matchKey.includes("ferrous") || matchKey.includes("iron") || matchKey.includes("besi") || matchKey.includes("maltofer")) {
    return {
      contraindication: "Hemokromatosis; hemosiderosis; anemia hemolitik.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman & Wajib Esensial). Mencegah anemia defisiensi besi maternal, risiko kelahiran prematur, dan berat bayi lahir rendah (BBLR).",
        trimesterAdvice: "Konsumsi minimal 60 mg besi elemental setiap hari selama kehamilan disertai vitamin C untuk absorpsi optimal."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Membantu memulihkan simpanan zat besi ibu pasca persalinan tanpa efek merugikan pada bayi.",
        infantRisk: "Sangat aman untuk bayi."
      }
    };
  }

  // Kalsium & Vitamin D3 (Oscal, Osteocal, Prove D3)
  if (matchKey.includes("calcium") || matchKey.includes("kalsium") || matchKey.includes("oscal") || matchKey.includes("osteocal") || matchKey.includes("vitamin_d")) {
    return {
      contraindication: "Hiperkalsemia; hiperkalsiuria berat; batu ginjal kalsium.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman & Esensial). Esensial untuk mineralisasi tulang dan gigi janin, serta terbukti menurunkan risiko preeklamsia dan hipertensi kehamilan.",
        trimesterAdvice: "Suplementasi kalsium 1000-1500 mg/hari direkomendasikan terutama bagi ibu dengan asupan kalsium diet rendah."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Mendukung kadar kalsium dalam ASI dan menjaga kepadatan tulang ibu menyusui.",
        infantRisk: "Sangat aman dan esensial bagi bayi."
      }
    };
  }

  // Zinc (Zinkid)
  if (matchKey.includes("zinc") || matchKey.includes("zinkid")) {
    return {
      contraindication: "Hipersensitivitas terhadap senyawa seng.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman pada Dosis AKG). Mineral esensial untuk pembelahan sel janin, sintesis DNA, serta imunitas maternal-fetal.",
        trimesterAdvice: "Aman dikonsumsi dalam batas dosis harian yang dianjurkan (11-15 mg/hari)."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Seng merupakan komponen esensial alami dalam ASI yang vital untuk kekebalan dan pencernaan bayi.",
        infantRisk: "Sangat aman bagi neonatus dan bayi."
      }
    };
  }

  // Multivitamin B Kompleks & Vitamin C (Becom-C, Becom-Zet, San-B-Plex)
  if (matchKey.includes("becom") || matchKey.includes("vitamin_c") || matchKey.includes("san_b_plex") || matchKey.includes("multivitamin")) {
    return {
      contraindication: "Hipersensitivitas terhadap komponen multivitamin.",
      pregnancySafety: {
        category: "A",
        status: "Aman",
        detail: "Category A (Sangat Aman dalam Batas AKG). Vitamin larut air esensial untuk metabolisme energi, pembentukan eritrosit, dan pembentukan kolagen janin.",
        trimesterAdvice: "Aman dan bermanfaat bagi kebugaran ibu dan tumbuh kembang janin."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Sangat Aman. Memperkaya nutrisi alami dalam ASI untuk kebutuhan bayi.",
        infantRisk: "Sangat aman."
      }
    };
  }

  // ==========================================
  // 14. ANTIHISTAMIN & OBAT PERNAPASAN / BATUK
  // ==========================================

  // Cetirizine & Loratadine
  if (matchKey.includes("cetirizine") || matchKey.includes("loratadine")) {
    return {
      contraindication: "Gangguan fungsi ginjal stadium akhir (CrCl <10 mL/min); hipersensitivitas.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Sangat Aman). Merupakan antihistamin generasi kedua pilihan utama selama kehamilan karena minim efek sedasi dan tidak teratogenik pada studi kohort besar.",
        trimesterAdvice: "Pilihan utama untuk rhinitis alergi, pruritus gestasional, atau urtikaria saat hamil."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam konsentrasi sangat rendah ke dalam ASI. Tidak menimbulkan rasa kantuk berlebih pada bayi pada dosis terapi lazim.",
        infantRisk: "Aman; pantau jika bayi tampak sedikit mengantuk."
      }
    };
  }

  // Salbutamol Inhalasi (Ventolin)
  if (matchKey.includes("salbutamol") || matchKey.includes("ventolin")) {
    return {
      contraindication: "Ancaman abortus pada trimester 1 atau 2; hipersensitivitas salbutamol.",
      pregnancySafety: {
        category: "C",
        status: "Aman",
        detail: "Category C (Aman untuk Inhalasi / Bronkodilator Pilihan Utama Asma Akut). Absorpsi sistemik via inhaler sangat rendah. Kontrol asma akut sangat vital untuk mencegah hipoksia janin.",
        trimesterAdvice: "Obat pelega asma lini pertama pilihan dokter spesialis paru dan obgyn saat kehamilan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Kadar dalam ASI sangat rendah setelah inhalasi dan tidak memengaruhi bayi menyusui.",
        infantRisk: "Aman tanpa efek kardiovaskular pada bayi."
      }
    };
  }

  // Dekongestan Oral (Pseudoefedrin, Fenilefrin, Rhinos, Tremenza)
  if (matchKey.includes("pseudoephedrine") || matchKey.includes("pseudoefedrin") || matchKey.includes("phenylephrine") || matchKey.includes("rhinos") || matchKey.includes("tremenza")) {
    return {
      contraindication: "Hipertensi berat; penyakit jantung koroner; glaukoma sudut tertutup; hipertiroidisme; kehamilan trimester 1.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C (Hindari Trimester 1). Efek vasokonstriksi sistemik berisiko mengganggu perfusi arteriol uteroplasenta dan dikaitkan dengan peningkatan risiko gastroschisis bila digunakan pada trimester pertama.",
        trimesterAdvice: "Gunakan semprot hidung salin fisiologis steril (NaCl 0.9%) sebagai alternatif aman untuk hidung tersumbat."
      },
      breastfeedingSafety: {
        status: "Perlu Perhatian",
        detail: "Perlu Perhatian. Pseudoefedrin diekskresikan ke dalam ASI dan dapat menyebabkan penurunan produksi volume ASI (hingga 24%) serta iritabilitas pada bayi.",
        infantRisk: "Penurunan suplai ASI dan kegelisahan pada bayi."
      }
    };
  }

  // Mukolitik & Ekspektoran (Ambroxol, Asetilsistein, Erdosteine, Bromheksin, Vectrine)
  if (
    matchKey.includes("ambroxol") ||
    matchKey.includes("acetylcysteine") ||
    matchKey.includes("asetilsistein") ||
    matchKey.includes("erdosteine") ||
    matchKey.includes("vectrine") ||
    matchKey.includes("bromhexine")
  ) {
    return {
      contraindication: "Ulkus lambung aktif; hipersensitivitas terhadap mukolitik.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B (Aman digunakan jika perlu). Studi praklinis tidak menunjukkan bukti toksisitas embrio-janin. Ambroxol bahkan memiliki efek stimulasi surfaktan paru.",
        trimesterAdvice: "Hindari penggunaan pada trimester pertama kecuali atas rekomendasi dokter."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Ekskresi ke ASI sangat minimal. Cukupi asupan cairan hangat untuk membantu pengenceran dahak secara alami.",
        infantRisk: "Aman untuk bayi menyusui."
      }
    };
  }

  // ==========================================
  // 15. DEFAULT BERDASARKAN KATEGORI FUNGSIONAL OBAT
  // ==========================================
  if (categoryLabel === "Antibiotik & Anti-infeksi") {
    return {
      contraindication: "Riwayat hipersensitivitas parah terhadap komponen obat atau kelas antibiotik sejenis.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B. Penelitian klinis tidak menunjukkan bukti risiko membahayakan kehamilan. Gunakan sesuai indikasi klinis infeksi bakteri yang tepat di bawah pengawasan medis.",
        trimesterAdvice: "Dapat digunakan sesuai indikasi klinis dokter."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Diekskresikan dalam jumlah minimal ke dalam ASI. Pantau bayi terhadap kemungkinan timbulnya diare ringan atau kandidiasis oral.",
        infantRisk: "Perubahan ringan flora usus bayi."
      }
    };
  }

  if (categoryLabel === "Pernapasan & Alergi") {
    return {
      contraindication: "Hipersensitivitas terhadap komponen sediaan atau zat aktif.",
      pregnancySafety: {
        category: "B",
        status: "Aman",
        detail: "Category B / C. Sediaan lokal (inhalasi atau semprot) lebih disukai karena absorpsi sistemik minimal. Antihistamin generasi ke-2 terbukti aman.",
        trimesterAdvice: "Konsultasikan dokter spesialis bila gejala alergi mengganggu tidur atau oksigenasi."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Kadar dalam ASI sangat rendah untuk sediaan hirup atau dosis lazim antihistamin non-sedatif.",
        infantRisk: "Aman dengan pemantauan normal."
      }
    };
  }

  if (categoryLabel === "Kortikosteroid & Hormon") {
    return {
      contraindication: "Infeksi jamur sistemik aktif; infeksi bakteri atau virus tak terkontrol; hipersensitivitas.",
      pregnancySafety: {
        category: "C",
        status: "Perlu Perhatian",
        detail: "Category C. Kortikosteroid sistemik digunakan atas indikasi medis spesifik dengan dosis efektif terkecil dan durasi sesingkat mungkin.",
        trimesterAdvice: "Gunakan sediaan topikal atau inhalasi jika memungkinkan."
      },
      breastfeedingSafety: {
        status: "Aman",
        detail: "Aman. Ekskresi dalam ASI rendah pada dosis fisiologis/terapeutik standar.",
        infantRisk: "Aman dengan pemantauan."
      }
    };
  }

  // Fallback Umum Standar
  return {
    contraindication: "Hipersensitivitas terhadap komponen obat atau golongan kimia zat aktif ini.",
    pregnancySafety: {
      category: "C",
      status: "Perlu Perhatian",
      detail: "Category C. Data klinis terkontrol pada manusia terbatas. Hanya boleh digunakan apabila potensi manfaat terapeutik pada ibu hamil membenarkan potensi risiko terhadap janin.",
      trimesterAdvice: "Konsultasikan terlebih dahulu dengan dokter spesialis kebidanan dan kandungan (Sp.OG)."
    },
    breastfeedingSafety: {
      status: "Perlu Perhatian",
      detail: "Perlu Perhatian. Dapat diekskresikan ke dalam ASI dalam kadar rendah. Pantau bayi terhadap potensi efek samping dan gunakan di bawah pengawasan medis.",
      infantRisk: "Konsultasikan dokter sebelum pemberian ASI."
    }
  };
};
