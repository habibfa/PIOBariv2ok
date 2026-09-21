import { DrugInteraction, FoodInteraction } from "./interactions";

/**
 * Extended Drug Interactions curated for the core medications in "Informasi Obat"
 * (RSUD Palembang BARI Drug Formulary & Presets Catalog).
 * 
 * Sources & References:
 * - U.S. FDA Drug Safety Communications & Official Package Inserts
 * - Stockley's Drug Interactions (12th Edition)
 * - American Journal of Health-System Pharmacy (AJHP) & PubMed Medline
 */
export const EXTENDED_INTERACTIONS_FOR_PRESETS: DrugInteraction[] = [
  // 1. METFORMIN + FUROSEMIDE
  {
    id: "metformin_furosemide",
    drugAId: "metformin_adult",
    drugBId: "furosemide_ped",
    drugAName: "Metformin",
    drugBName: "Furosemid",
    severity: "WARNING",
    mechanism: "Furosemid meningkatkan konsentrasi puncak plasma (Cmax) metformin sebesar ~22% dan AUC sebesar ~15% tanpa perubahan klirens ginjal yang signifikan pada orang sehat. Selain itu, furosemid dapat memicu dehidrasi, hipovolemia, dan penurunan laju filtrasi glomerulus temporer yang memperlambat eliminasi metformin dan berpotensi meningkatkan risiko akumulasi serta asidosis laktat (lactic acidosis).",
    recommendation: "Pantau fungsi ginjal (eGFR, serum kreatinin) dan status hidrasi pasien secara berkala. Edukasi pasien mengenai tanda-tanda asidosis laktat (mialgia berat, sesak napas cepat/hiperventilasi, kram perut, somnolen). Pertimbangkan penyesuaian dosis metformin terutama pada pasien geriatri.",
    evidence: "FDA Prescribing Information for Glucophage (Metformin HCl); Stockley's Drug Interactions (12th Ed); PMID: 11180036."
  },

  // 2. METFORMIN + GLIMEPIRIDE
  {
    id: "metformin_glimepiride",
    drugAId: "metformin_adult",
    drugBId: "auto_glimepiride",
    drugAName: "Metformin",
    drugBName: "Glimepiride",
    severity: "WARNING",
    mechanism: "Kombinasi insulin-sensitizer (Metformin) dengan sekretagok insulin sulfonilurea (Glimepiride) memiliki efek sinergis kuat dalam menurunkan glukosa darah. Meskipun merupakan kombinasi terapi lini kedua yang lazim pada DM Tipe 2, kombinasi ini meningkatkan risiko hipoglikemia simtomatik maupun berat secara bermakna jika asupan kalori tertunda atau aktivitas fisik meningkat.",
    recommendation: "Berikan edukasi komprehensif mengenai gejala hipoglikemia (tremor, keringat dingin, lapar, takikardia, disorientasi) dan tata laksana darurat 'Rule of 15' (konsumsi 15-20 gram glukosa murni cepat serap). Titrasi dosis glimepiride secara konservatif.",
    evidence: "ADA Standards of Care in Diabetes (2024); UKPDS Group. Intensive blood-glucose control with sulphonylureas. Lancet. 1998;352(9131):837-853."
  },

  // 3. GLIMEPIRIDE + FLUCONAZOLE
  {
    id: "glimepiride_fluconazole",
    drugAId: "auto_glimepiride",
    drugBId: "fluconazole_ped",
    drugAName: "Glimepiride",
    drugBName: "Flukonazol",
    severity: "CRITICAL",
    mechanism: "Glimepiride dimetabolisme primer di hati oleh isoenzim sitokrom P450 CYP2C9. Flukonazol merupakan inhibitor poten CYP2C9. Pemberian bersamaan menghambat bersihan metabolik glimepiride secara drastis, meningkatkan kadar plasma dan waktu paruh glimepiride hingga 2-3 kali lipat, memicu hipoglikemia berat refrakter yang berkepanjangan hingga koma hipoglikemik fatal.",
    recommendation: "KONTRAINDIKASI KOMBINASI / SANGAT DIHINDARI. Jika terapi antijamur flukonazol mutlak diperlukan, turunkan dosis glimepiride minimal 50% atau hentikan sementara glimepiride dan beralih ke insulin basal bolus dengan pemantauan glukosa darah intensif setiap 4-6 jam.",
    evidence: "Niemi M, et al. Effects of fluconazole on the pharmacokinetics and pharmacodynamics of glimepiride. Clin Pharmacol Ther. 2001;69(4):194-200. PMID: 11309549. FDA Diflucan Labeling."
  },

  // 4. GLIMEPIRIDE + BISOPROLOL
  {
    id: "glimepiride_bisoprolol",
    drugAId: "auto_glimepiride",
    drugBId: "bisoprolol_adult",
    drugAName: "Glimepiride",
    drugBName: "Bisoprolol",
    severity: "WARNING",
    mechanism: "Penyekat reseptor beta-adrenergik (Bisoprolol) dapat menutupi (masking) tanda-tanda peringatan simpatoadrenal esensial dari hipoglikemia, terutama takikardia, palpitasi, dan tremor. Pasien diabetes mungkin hanya mengalami diaphoresis (keringat dingin) atau langsung mengalami neuroglikopenia berat (penurunan kesadaran, kejang). Penyekat beta juga memperlambat pemulihan glukosa melalui penghambatan glikogenolisis.",
    recommendation: "Edukasi pasien diabetes bahwa takikardia tidak dapat dijadikan patokan terjadinya hipoglikemia saat mengonsumsi beta-blocker. Lakukan pemantauan gula darah mandiri (SMBG) secara teratur dan siapkan tablet dekstrosa.",
    evidence: "Mills GA, Horn JR. Beta-blockers and hypoglycemia. Drug Intell Clin Pharm. 1985;19(4):246-251. PMID: 2859132."
  },

  // 5. GLIMEPIRIDE + CIPROFLOXACIN
  {
    id: "glimepiride_ciprofloxacin",
    drugAId: "auto_glimepiride",
    drugBId: "ciprofloxacin_ped",
    drugAName: "Glimepiride",
    drugBName: "Siprofloksasin",
    severity: "WARNING",
    mechanism: "Antibiotik fluoroquinolone (Siprofloksasin) memiliki efek intrinsik dalam menstimulasi penutupan kanal K-ATP pada sel beta pankreas serta menghambat eliminasi CYP. Bila dikombinasikan dengan glimepiride, terjadi stimulasi sekresi insulin aditif yang dapat memicu hipoglikemia berat mendadak, terutama pada pasien lanjut usia atau insufisiensi ginjal.",
    recommendation: "Lakukan pemantauan glukosa darah ketat selama terapi Ciprofloxacin pada pasien pengguna sulfonilurea. Pertimbangkan antibiotik alternatif non-kuinolon bila risiko hipoglikemia pasien tinggi.",
    evidence: "U.S. FDA Drug Safety Communication: FDA strengthens warnings about serious safety issues for fluoroquinolone antibiotics, including severe hypoglycemia. (2018)."
  },

  // 6. CEFTRIAXONE + CALCIUM
  {
    id: "ceftriaxone_calcium",
    drugAId: "ceftriaxone_ped",
    drugBId: "calcium_gluconate_inf",
    drugAName: "Seftriakson",
    drugBName: "Kalsium Glukonat / Larutan Kalsium",
    severity: "CRITICAL",
    mechanism: "Kalsium dan Seftriakson membentuk ikatan garam kalsium-seftriakson kristalin yang tidak larut (insoluble precipitate). Pada neonatus dan bayi, endapan kristal mikrovaskular ini telah memicu kematian mendadak akibat embolisasi kristal di kapiler paru serta nekrosis ginjal akut.",
    recommendation: "KONTRAINDIKASI MUTLAK pada neonatus (usia ≤ 28 hari) meskipun menggunakan jalur infus terpisah. Pada pasien > 28 hari: dilarang mencampur seftriakson dan cairan mengandung kalsium (misal Ringer Laktat, infus kalsium) dalam wadah atau jalur infus yang sama; lakukan flushing selang infus tuntas dengan NaCl 0.9% sebelum dan sesudah pemberian.",
    evidence: "FDA Drug Safety Alert: Information for Healthcare Professionals: Ceftriaxone and Calcium-containing Solutions (2009); Bradley JS, et al. Pediatrics. 2009;123(4):e609-e613. PMID: 19336350."
  },

  // 7. CEFTRIAXONE + WARFARIN
  {
    id: "ceftriaxone_warfarin",
    drugAId: "ceftriaxone_ped",
    drugBId: "warfarin_adult",
    drugAName: "Seftriakson",
    drugBName: "Warfarin",
    severity: "WARNING",
    mechanism: "Seftriakson diekskresikan dalam jumlah besar melalui empedu ke dalam saluran cerna, membasmi flora bakteri komensal usus yang memproduksi vitamin K. Hal ini menyebabkan defisiensi vitamin K fungsional, memperkuat efek antikoagulasi Warfarin, memicu lonjakan nilai INR (International Normalized Ratio) dan risiko perdarahan masif.",
    recommendation: "Pantau nilai INR secara ketat dalam 3-5 hari pertama setelah memulai terapi Seftriakson pada pasien dalam terapi Warfarin. Bersiap menurunkan dosis warfarin sebesar 20-40% dan edukasi pasien tanda perdarahan (hematuria, memar luas, gusi berdarah).",
    evidence: "Glasheen JJ, et al. Ceftriaxone-induced potentiation of warfarin anticoagulation. Ann Pharmacother. 2005;39(3):570-573. PMID: 15687431."
  },

  // 8. DEXAMETHASONE + IBUPROFEN
  {
    id: "dexamethasone_ibuprofen",
    drugAId: "dexamethasone_ped",
    drugBId: "ibuprofen_ped",
    drugAName: "Deksametason",
    drugBName: "Ibuprofen",
    severity: "CRITICAL",
    mechanism: "Penggunaan bersama kortikosteroid sistemik (Deksametason) dan OAINS (Ibuprofen) memberikan efek destruktif ganda pada mukosa saluran cerna: Deksametason menghambat proliferasi epitel mukosa lambung dan sintesis prostaglandin, sementara Ibuprofen menghambat COX-1 yang menurunkan sekresi mukus bikarbonat protektif lambung. Sinergisme ini melipatgandakan risiko ulserasi peptikum, perforasi gaster, dan perdarahan saluran cerna hingga 4-15 kali lipat.",
    recommendation: "Hindari kombinasi ini jika tidak ada indikasi spesifik yang mendesak. Jika wajib diberikan bersamaan, berikan profilaksis gastroprotektor (PPI seperti Omeprazole atau Lansoprazole) dan gunakan durasi sesingkat mungkin. Pantau feses melena dan kadar Hb.",
    evidence: "Piper JM, et al. Corticosteroid use and peptic ulcer disease: role of nonsteroidal anti-inflammatory drugs. Ann Intern Med. 1991;114(9):735-740. PMID: 2012355."
  },

  // 9. METHYLPREDNISOLONE + KETOROLAC
  {
    id: "methylprednisolone_ketorolac",
    drugAId: "methylprednisolone_ped",
    drugBId: "ketorolac_adult",
    drugAName: "Metilprednisolon",
    drugBName: "Ketorolak",
    severity: "CRITICAL",
    mechanism: "Ketorolac memiliki potensi penghambatan COX-1 paling poten di antara OAINS klinis dengan tingkat toksisitas gastrointestinal tertinggi. Pemberian bersamaan dengan kortikosteroid parenteral (Metilprednisolon) sangat memicu erosi lambung hemoragik akut, perforasi gaster, dan penurunan laju filtrasi glomerulus ginjal.",
    recommendation: "KONTRAINDIKASI RELATIF. Label resmi Ketorolac secara tegas melarang pemberian bersamaan dengan OAINS lain atau kortikosteroid sistemik. Ganti analgesik dengan Parasetamol IV atau opioid murni jika pasien memerlukan kontrol nyeri kuat selama terapi steroid.",
    evidence: "U.S. FDA Toradol (Ketorolac Tromethamine) Prescribing Information; Strom BL, et al. Parenteral ketorolac and risk of serious upper gastrointestinal tract bleeding and perforation. JAMA. 1996;275(5):376-382."
  },

  // 10. DEXAMETHASONE + METFORMIN
  {
    id: "dexamethasone_metformin",
    drugAId: "dexamethasone_ped",
    drugBId: "metformin_adult",
    drugAName: "Deksametason",
    drugBName: "Metformin",
    severity: "WARNING",
    mechanism: "Deksametason menginduksi resistensi insulin perifer, merangsang glukoneogenesis hati, dan menurunkan penyerapan glukosa oleh sel otot dan adiposa. Hal ini secara langsung mengantagonisasi efek terapeutik Metformin, memicu hiperglikemia refrakter (steroid-induced hyperglycemia) dan hilangnya kendali glikemik.",
    recommendation: "Lakukan pemantauan gula darah berkala lebih intensif saat memulai atau mengubah dosis deksametason. Pasien seringkali memerlukan kenaikan dosis antidiabetes oral atau penambahan insulin reguler/bolus sementara.",
    evidence: "Kwon S, et al. Glucocorticoid-induced diabetes mellitus: a review of the literature. Diabetes Res Clin Pract. 2013;101(1):1-8. PMID: 23664060."
  },

  // 11. DEXAMETHASONE + PHENYTOIN
  {
    id: "dexamethasone_phenytoin",
    drugAId: "dexamethasone_ped",
    drugBId: "auto_natrium_phenytoin",
    drugAName: "Deksametason",
    drugBName: "Fenitoin",
    severity: "WARNING",
    mechanism: "Fenitoin merupakan penginduksi poten isoenzim sitokrom P450 CYP3A4 di hati. Deksametason dimetabolisme secara primer oleh CYP3A4. Induksi ini meningkatkan klirens metabolik deksametason hingga 2-3 kali lipat, menurunkan konsentrasi plasma dan efikasi deksametason hingga separuhnya (menyebabkan kegagalan terapi steroid, misal pada edema serebral).",
    recommendation: "Dosis deksametason mungkin perlu ditingkatkan hingga 2 kali lipat saat diberikan bersama Fenitoin untuk mencapai efikasi klinis yang setara. Saat Fenitoin dihentikan, dosis steroid harus segera disesuaikan turun kembali untuk mencegah sindrom Cushing eksogen.",
    evidence: "Chalk JB, et al. Phenytoin impairs the bioavailability of dexamethasone in neurological patients. J Neurol Neurosurg Psychiatry. 1984;47(10):1087-1090. PMID: 6502181."
  },

  // 12. MORPHINE + DIAZEPAM
  {
    id: "morphine_diazepam",
    drugAId: "morphine_adult",
    drugBId: "valisanbe",
    drugAName: "Morfin",
    drugBName: "Diazepam",
    severity: "CRITICAL",
    mechanism: "Opioid (Morfin) dan Benzodiazepin (Diazepam) bekerja pada reseptor berbeda di SSP (reseptor mu-opioid dan reseptor GABA-A), menghasilkan penekanan sinergis mendalam pada pusat pernapasan di medula oblongata. Kombinasi ini melipatgandakan risiko depresi pernapasan berat, hipoventilasi, sedasi mendalam, koma, anoksia otak, dan kematian.",
    recommendation: "FDA BLACK BOX WARNING: Hindari peresepan bersamaan kecuali tidak ada alternatif lain (misalnya prosedur sedasi anestesi dengan jalan napas teramankan). Batasi dosis dan durasi seminimal mungkin. Pastikan pemantauan saturasi oksigen (SpO2) kontinu dan siapkan Nalokson IV serta Flumazenil IV segera.",
    evidence: "FDA Drug Safety Communication: FDA warns about serious risks and death when combining opioid pain or cough medicines with benzodiazepines (2016); CDC Guideline for Prescribing Opioids (2016). PMID: 26977696."
  },

  // 13. FENTANYL + MIDAZOLAM
  {
    id: "fentanyl_midazolam",
    drugAId: "fentanyl_inf",
    drugBId: "auto_midazolam",
    drugAName: "Fentanil",
    drugBName: "Midazolam",
    severity: "CRITICAL",
    mechanism: "Kombinasi opioid poten (Fentanil) dan benzodiazepin kerja cepat (Midazolam) menghasilkan depresi pernapasan supra-aditif, hilangnya refleks jalan napas secara mendadak, hipotensi sistemik, bradikardia, dan henti napas akut (apnea).",
    recommendation: "Hanya diberikan di bawah pengawasan dokter spesialis anestesi atau intensivis di ruang operasi/ICU dengan kesiapan intubasi endotrakeal, ventilasi mekanik, dan monitor hemodinamik kontinu. Titrasi dosis secara fraksional bertahap.",
    evidence: "Kissin I, et al. Midazolam-morphine and midazolam-fentanyl interaction on respiratory depression in animals and humans. Anesth Analg. 1990;71(3):236-241. PMID: 2393166."
  },

  // 14. TRAMADOL + ONDANSETRON
  {
    id: "tramadol_ondansetron",
    drugAId: "tramadol_adult",
    drugBId: "ondansetron_ped",
    drugAName: "Tramadol",
    drugBName: "Ondansetron",
    severity: "WARNING",
    mechanism: "Khasiat antinyeri Tramadol bergantung sebagian pada stimulasi jalur transmisi serotonin spinal selain agonisme reseptor opioid. Ondansetron memblokade reseptor serotonin 5-HT3 secara kompetitif, melemahkan efek analgesik tramadol sehingga membutuhkan dosis opioid yang lebih tinggi. Selain itu, kedua agen meningkatkan beban serotonergik yang pada pasien rentan dapat memicu sindrom serotonin.",
    recommendation: "Sadari bahwa Ondansetron dapat mengurangi khasiat analgesik Tramadol pascaoperasi. Jika kontrol nyeri tidak adekuat, pertimbangkan antiemetik alternatif (seperti Metoklopramid atau Deksametason dosis rendah). Pantau gejala toksisitas serotonin.",
    evidence: "Arcioni R, et al. Ondansetron inhibits the analgesic effects of tramadol: a possible 5-HT3 spinal receptor involvement. Anesth Analg. 2002;94(6):1553-1557. PMID: 12032025."
  },

  // 15. TRAMADOL + CARBAMAZEPINE
  {
    id: "tramadol_carbamazepine",
    drugAId: "tramadol_adult",
    drugBId: "bamgetol",
    drugAName: "Tramadol",
    drugBName: "Karbamazepin",
    severity: "WARNING",
    mechanism: "Karbamazepin menginduksi enzim CYP3A4 hati secara kuat, meningkatkan pembersihan metabolik tramadol dan memangkas kadar plasma tramadol hingga 50%, sehingga menghilangkan khasiat pereda nyeri. Di saat yang sama, Tramadol menurunkan ambang kejang (seizure threshold), memperburuk risiko bangkitan epilepsi.",
    recommendation: "Kombinasi sebaiknya dihindari. Menaikkan dosis tramadol tidak disarankan karena meningkatkan risiko neurotoksisitas dan kejang. Pilih analgesik alternatif seperti Parasetamol atau opioid murni.",
    evidence: "U.S. FDA Ultram (Tramadol) Prescribing Information; Stockley's Drug Interactions (12th Ed)."
  },

  // 16. PHENYTOIN + VALPROATE
  {
    id: "phenytoin_valproate",
    drugAId: "auto_natrium_phenytoin",
    drugBId: "valproate_syr",
    drugAName: "Fenitoin",
    drugBName: "Asam Valproat",
    severity: "WARNING",
    mechanism: "Interaksi farmakokinetik dua arah: Asam Valproat menggeser Fenitoin dari ikatan protein albumin plasma, melipatgandakan fraksi fenitoin bebas (unbound active). Di saat yang sama, Valproat menghambat metabolisme hepatik fenitoin (CYP2C9). Kadar fenitoin total di laboratorium dapat tampak normal, namun pasien mengalami intoksikasi fenitoin berat (ataksia serebelar, nistagmus, diplopia, letargi). Sebaliknya, fenitoin menginduksi klirens valproat.",
    recommendation: "Periksa kadar Fenitoin BEBAS (free phenytoin) di samping fenitoin total, serta pantau kadar valproat. Waspadai tanda toksisitas neurologis fenitoin. Lakukan penyesuaian dosis berdasarkan kadar bebas dan kondisi klinis.",
    evidence: "Perucca E, et al. Interaction between phenytoin and valproic acid: plasma protein binding and metabolic clearance. Clin Pharmacol Ther. 1980;28(6):779-789. PMID: 6777085."
  },

  // 17. PHENYTOIN + WARFARIN
  {
    id: "phenytoin_warfarin",
    drugAId: "auto_natrium_phenytoin",
    drugBId: "warfarin_adult",
    drugAName: "Fenitoin",
    drugBName: "Warfarin",
    severity: "WARNING",
    mechanism: "Fenitoin dan Warfarin berkompetisi pada ikatan protein plasma dan dimetabolisme oleh enzim CYP2C9. Pada awal terapi, pergeseran ikatan protein dapat menaikkan fraksi bebas warfarin dan melesatkan nilai INR (risiko perdarahan). Dalam terapi kronis, fenitoin menginduksi enzim metabolisme yang mempercepat ekskresi warfarin dan menurunkan INR (risiko trombosis). Sebaliknya, warfarin dapat menaikkan kadar fenitoin serum.",
    recommendation: "Lakukan pemantauan serial nilai INR dan kadar fenitoin serum setiap beberapa hari saat memulai, menaikkan, atau menghentikan salah satu obat. Waspadai tanda perdarahan abnormal dan ataksia.",
    evidence: "Levine M, et al. Phenytoin-warfarin interaction: a review of the mechanism and clinical management. DICP. 1987;21(7-8):597-600. PMID: 3304838."
  },

  // 18. CARBAMAZEPINE + ERYTHROMYCIN
  {
    id: "carbamazepine_erythromycin",
    drugAId: "bamgetol",
    drugBId: "erythromycin_ped",
    drugAName: "Karbamazepin",
    drugBName: "Eritromisin",
    severity: "CRITICAL",
    mechanism: "Eritromisin merupakan penghambat poten isoenzim CYP3A4 di hati dan mukosa usus. Karbamazepin dieliminasi primer oleh CYP3A4. Pemberian bersamaan menghambat bersihan karbamazepin, memicu kenaikan kadar serum karbamazepin hingga 100-250% dalam 24-48 jam pertama, menimbulkan intoksikasi karbamazepin akut berat: pusing berputar, ataksia hebat, diplopia, kantuk berlebih, halusinasi, dan koma.",
    recommendation: "KONTRAINDIKASI MUTLAK / SANGAT DIHINDARI. Gunakan antibiotik makrolida yang tidak menghambat CYP3A4 secara signifikan (seperti Azitromisin) atau antibiotik golongan lain. Jika terpaksa diberikan bersamaan, kurangi dosis karbamazepin sebesar 50% dan pantau kadar darah harian.",
    evidence: "Wong YY, et al. Effect of erythromycin on carbamazepine kinetics. Clin Pharmacol Ther. 1983;33(4):460-464. PMID: 6831821. FDA Tegretol Prescribing Information."
  },

  // 19. COLCHICINE + CLARITHROMYCIN
  {
    id: "colchicine_clarithromycin",
    drugAId: "auto_colchicine",
    drugBId: "clarithromycin_adult",
    drugAName: "Kolkisin",
    drugBName: "Klaritromisin",
    severity: "CRITICAL",
    mechanism: "Kolkisin dieliminasi melalui metabolisme CYP3A4 dan pompa efluks P-glikoprotein (P-gp). Klaritromisin adalah inhibitor ganda sangat poten terhadap CYP3A4 dan P-gp. Pemberian bersamaan memicu akumulasi kolkisin secara masif hingga tingkat toksik mematikan: supresi sumsum tulang berat (pansitopenia, agranulositosis), rhabdomyolisis, kegagalan multi-organ, dan kolaps kardiovaskular fatal.",
    recommendation: "KONTRAINDIKASI MUTLAK pada pasien dengan gangguan fungsi ginjal atau hati yang mengonsumsi kolkisin. Pada pasien dengan fungsi organ normal, kombinasi ini harus dihindari; pilih antibiotik alternatif non-inhibitor CYP3A4/P-gp atau tunda terapi kolkisin selama terapi infeksi.",
    evidence: "FDA Drug Safety Communication: FDA updates warnings on fatal interactions between colchicine and strong CYP3A4 inhibitors (2009); Hung IF, et al. Clin Infect Dis. 2005;41(2):266-267. PMID: 15986326."
  },

  // 20. COLCHICINE + SIMVASTATIN
  {
    id: "colchicine_simvastatin",
    drugAId: "auto_colchicine",
    drugBId: "simvastatin_adult",
    drugAName: "Kolkisin",
    drugBName: "Simvastatin",
    severity: "CRITICAL",
    mechanism: "Kolkisin dan Simvastatin keduanya memiliki toksisitas inheren terhadap membran sel otot lurik dan mitokondria, serta merupakan substrat enzim CYP3A4 dan P-gp. Penggunaan bersamaan meningkatkan toksisitas otot secara aditif, memicu miopati akut berat, lonjakan enzim kreatin kinase (CK) puluhan ribu U/L, dan rhabdomyolisis masif dengan gagal ginjal anurik akut.",
    recommendation: "Hindari kombinasi ini jika memungkinkan. Jika pasien gout dengan dislipidemia harus mengonsumsi keduanya, pertimbangkan alih terapi statin ke Pravastatin dosis konservatif. Edukasi pasien untuk segera melapor bila mengalami nyeri otot difus, kelemahan tungkai, atau urine kecokelatan gelap.",
    evidence: "Baker SK, et al. Colchicine-induced myopathy in a patient taking simvastatin: an under-recognized drug interaction. Muscle Nerve. 2004;30(6):799-802. PMID: 15468335."
  },

  // 21. THEOPHYLLINE + CIPROFLOXACIN
  {
    id: "theophylline_ciprofloxacin",
    drugAId: "aminophylline_ped",
    drugBId: "ciprofloxacin_ped",
    drugAName: "Teofilin / Aminofilin",
    drugBName: "Siprofloksasin",
    severity: "CRITICAL",
    mechanism: "Siprofloksasin merupakan inhibitor poten isoenzim sitokrom P450 1A2 (CYP1A2). Teofilin (dan garamnya Aminofilin) dieliminasi hingga 90% melalui metabolisme CYP1A2. Siprofloksasin memangkas bersihan teofilin sebesar 30-70%, memicu lonjakan cepat kadar teofilin serum ke rentang toksik (>20-30 mcg/mL). Hal ini memicu intoksikasi teofilin akut mematikan: takikardia supraventrikular berat, aritmia ventrikel ganas, kejang status epileptikus refrakter, henti jantung, dan kematian.",
    recommendation: "HINDARI PENGGUNAAN BERSAMAAN. Jika Ciprofloxacin mutlak diperlukan, turunkan dosis Teofilin/Aminofilin sebesar 50-70% sejak awal pemberian antibiotik dan pantau kadar teofilin serum serial setiap 24-48 jam. Hentikan segera jika timbul mual hebat, palpitasi, tremor, atau agitasi.",
    evidence: "Nix DE, et al. Inhibition of theophylline clearance by coadministered ciprofloxacin. J Clin Pharmacol. 1992;32(10):915-920. PMID: 1430440. FDA Cipro Prescribing Information."
  },

  // 22. THEOPHYLLINE + PROPRANOLOL
  {
    id: "theophylline_propranolol",
    drugAId: "aminophylline_ped",
    drugBId: "propranolol_ped",
    drugAName: "Teofilin / Aminofilin",
    drugBName: "Propranolol",
    severity: "CRITICAL",
    mechanism: "Antagonisme farmakodinamik dan farmakokinetik ganda: Propranolol adalah penyekat beta non-selektif yang memblokade reseptor beta-2 bronkus, secara langsung meniadakan efek bronkodilatasi teofilin dan memicu bronkospasme akut berbahaya pada pasien asma atau PPOK. Selain itu, Propranolol menghambat metabolisme hepatik teofilin sehingga menurunkan klirens teofilin sekitar 30-50% dan menaikkan risiko intoksikasi teofilin.",
    recommendation: "KONTRAINDIKASI MUTLAK pada pasien asma atau penyakit bronkial reaktif. Gunakan obat kardiovaskular alternatif non-beta-blocker (seperti CCB) atau beta-blocker kardioselektif sangat tinggi dengan pengawasan ketat.",
    evidence: "Conrad KA, Nyman DW. Effects of metoprolol and propranolol on theophylline elimination. Clin Pharmacol Ther. 1980;28(4):463-467. PMID: 7418318."
  },

  // 23. ISONIAZID + PARACETAMOL
  {
    id: "isoniazid_paracetamol",
    drugAId: "isoniazid_ped",
    drugBId: "paracetamol_ped",
    drugAName: "Isoniazid (INH)",
    drugBName: "Parasetamol",
    severity: "WARNING",
    mechanism: "Isoniazid menginduksi aktivitas enzim sitokrom CYP2E1 di hati. Enzim CYP2E1 bertanggung jawab mengoksidasi Parasetamol menjadi metabolit hepatotoksik reaktif N-acetyl-p-benzoquinone imine (NAPQI). Pada pasien pengguna INH, pembentukan NAPQI meningkat tajam, menghabiskan cadangan glutation hati dan memicu nekrosis hepatoseluler sentrilobular akut bahkan pada dosis terapeutik lazim parasetamol (2-4 g/hari).",
    recommendation: "Batasi penggunaan Parasetamol pada pasien yang sedang menjalani pengobatan tuberkulosis dengan Isoniazid. Jangan melebihi dosis 2 gram parasetamol per hari dan hindari penggunaan rutin jangka panjang. Pantau enzim transaminase hati (SGOT/SGPT).",
    evidence: "Murphy R, et al. Severe acetaminophen-induced hepatotoxicity in patients receiving isoniazid for latent or active tuberculosis. Ann Pharmacother. 1990;24(12):1174-1178. PMID: 2275217."
  },

  // 24. ISONIAZID + PHENYTOIN
  {
    id: "isoniazid_phenytoin",
    drugAId: "isoniazid_ped",
    drugBId: "auto_natrium_phenytoin",
    drugAName: "Isoniazid (INH)",
    drugBName: "Fenitoin",
    severity: "WARNING",
    mechanism: "Isoniazid merupakan inhibitor poten enzim sitokrom P450 CYP2C9 dan CYP2C19 yang memetabolisme Fenitoin. Pemberian INH bersama Fenitoin menurunkan pembersihan fenitoin secara dramatis, melipatgandakan kadar fenitoin serum dalam hitungan hari, memicu intoksikasi fenitoin simtomatik berat (ataksia, nistagmus horizontal, disartria, kantuk berat, ensefalopati), terutama pada pasien dengan fenotipe slow-acetylator.",
    recommendation: "Pantau kadar fenitoin serum sebelum dan 1-2 minggu setelah memulai terapi Isoniazid. Siapkan penurunan dosis fenitoin sebesar 25-50% sesuai kadar serum dan respons klinis. Edukasi pasien mengenai gejala gangguan keseimbangan jalan.",
    evidence: "Miller RR, et al. Clinical importance of the interaction of phenytoin and isoniazid. Chest. 1979;75(3):356-358. PMID: 421544."
  },

  // 25. FLUCONAZOLE + SIMVASTATIN
  {
    id: "fluconazole_simvastatin",
    drugAId: "fluconazole_ped",
    drugBId: "simvastatin_adult",
    drugAName: "Flukonazol",
    drugBName: "Simvastatin",
    severity: "CRITICAL",
    mechanism: "Simvastatin merupakan substrat yang sangat bergantung pada metabolisme CYP3A4 hepar. Flukonazol (terutama dosis ≥ 200 mg/hari) merupakan inhibitor poten CYP3A4 dan CYP2C9. Flukonazol meningkatkan kadar plasma simvastatin dan asam simvastatin hingga 4-10 kali lipat, memicu miopati berat, nekrosis otot lurik, rhabdomyolisis masif, dan gagal ginjal anurik akibat mioglobinuria.",
    recommendation: "HINDARI PEMBERIAN BERSAMAAN. Hentikan sementara terapi Simvastatin selama rangkaian pengobatan Flukonazol oral atau IV. Jika statin mutlak diperlukan, alihkan ke Pravastatin dosis konservatif dengan pemantauan enzim kreatin kinase (CK) dan fungsi ginjal.",
    evidence: "Kantola T, et al. Effect of fluconazole and itraconazole on the pharmacokinetics of simvastatin and its active metabolite. Clin Pharmacol Ther. 1998;64(2):177-185. PMID: 9728898."
  },

  // 26. FLUCONAZOLE + WARFARIN
  {
    id: "fluconazole_warfarin",
    drugAId: "fluconazole_ped",
    drugBId: "warfarin_adult",
    drugAName: "Flukonazol",
    drugBName: "Warfarin",
    severity: "CRITICAL",
    mechanism: "S-enansiomer dari Warfarin (yang memiliki potensi antikoagulan 3-5 kali lebih kuat dari R-enansiomer) dimetabolisme secara eksklusif oleh CYP2C9 di hepar. Flukonazol adalah penghambat kuat CYP2C9. Pemberian bersamaan menghambat pembersihan S-warfarin, memperpanjang waktu paruh eliminasi warfarin, memicu lonjakan ekstrim nilai INR (bisa mencapai > 10) dan risiko perdarahan internal mayor fatal.",
    recommendation: "Jika kombinasi tidak dapat dihindari, kurangi dosis Warfarin sebesar 30-50% saat memulai Flukonazol. Periksa nilai INR setiap 2-3 hari hingga stabil. Edukasi pasien mengenai tanda perdarahan (hematuria, hematemesis, melena, memar spontan).",
    evidence: "Black DJ, et al. Mechanism of the interaction between fluconazole and warfarin. Clin Pharmacol Ther. 1996;60(4):412-420. PMID: 8878564."
  },

  // 27. DONEPEZIL + BISOPROLOL
  {
    id: "donepezil_bisoprolol",
    drugAId: "aricept_evess_10",
    drugBId: "bisoprolol_adult",
    drugAName: "Donepezil",
    drugBName: "Bisoprolol",
    severity: "WARNING",
    mechanism: "Donepezil merupakan inhibitor asetilkolinesterase (AChEI) yang meningkatkan tonus kolinergik parasimpatis pada nodus SA dan nodus AV jantung. Bisoprolol menurunkan stimulasi adrenergik simpatis kardiak. Kombinasi ini menghasilkan efek bradikardia sinergis yang kuat, berisiko memicu bradikardia berat (<40 bpm), henti sinus (sinus arrest), blok atrioventrikular derajat lanjut, sinkop, dan cedera akibat jatuh pada pasien geriatri.",
    recommendation: "Lakukan pemeriksaan EKG awal dan pantau denyut nadi serta tekanan darah secara teratur. Edukasi keluarga/pendamping pasien mengenai risiko pusing melayang mendadak atau pingsan (sinkop).",
    evidence: "Hernandez RK, et al. Donepezil and risk of bradycardia and syncope in dementia patients: real-world observational study. J Am Geriatr Soc. 2009;57(10):1797-1803. PMID: 19694868."
  },

  // 28. DONEPEZIL + IBUPROFEN
  {
    id: "donepezil_ibuprofen",
    drugAId: "aricept_evess_10",
    drugBId: "ibuprofen_ped",
    drugAName: "Donepezil",
    drugBName: "Ibuprofen",
    severity: "WARNING",
    mechanism: "Efek kolinergik Donepezil merangsang peningkatan sekresi asam lambung (HCl) dan motilitas pencernaan. Sementara itu, OAINS seperti Ibuprofen menghambat sintesis prostaglandin protektif mukosa lambung. Kombinasi ini meningkatkan kerentanan dinding lambung terhadap erosi, ulkus peptikum, dan perdarahan saluran cerna bagian atas pada pasien lansia.",
    recommendation: "Pantau tanda-tanda perdarahan saluran cerna aktif maupun terselubung (feses hitam melena, penurunan hemoglobin, nyeri epigastrium). Pertimbangkan gastroprotektor (PPI) jika OAINS mutlak diperlukan, atau gunakan Parasetamol sebagai analgesik lini pertama.",
    evidence: "U.S. FDA Aricept (Donepezil Hydrochloride) Prescribing Information; Stockley's Drug Interactions."
  },

  // 29. ALLOPURINOL + CAPTOPRIL
  {
    id: "allopurinol_captopril",
    drugAId: "auto_allopurinol",
    drugBId: "captopril_adult",
    drugAName: "Allopurinol",
    drugBName: "Kaptopril",
    severity: "WARNING",
    mechanism: "Pemberian bersamaan Allopurinol dengan ACE inhibitor (Kaptopril atau Enalapril) dikaitkan dengan peningkatan risiko reaksi hipersensitivitas imunologis berat, termasuk sindrom Stevens-Johnson (SJS), nekrolisis epidermal toksik (TEN), sindrom DRESS, dan angioedema, terutama pada pasien dengan penurunan fungsi ginjal.",
    recommendation: "Gunakan kombinasi ini dengan kehati-hatian tinggi, terutama pada pasien gagal ginjal kronis. Edukasi pasien untuk segera menghentikan kedua obat dan mencari pertolongan medis jika muncul ruam kulit, gatal, demam, pembengkakan wajah/bibir, atau lepuh mukosa.",
    evidence: "Pennell DJ, et al. Fatal Stevens-Johnson syndrome in a patient on allopurinol and captopril. Lancet. 1984;1(8374):463. PMID: 6142207; Samanta A, Burden AC. Lancet. 1984;1(8378):679."
  },

  // 30. AMLODIPINE + SIMVASTATIN
  {
    id: "amlodipine_simvastatin",
    drugAId: "amlodipine_adult",
    drugBId: "simvastatin_adult",
    drugAName: "Amlodipin",
    drugBName: "Simvastatin",
    severity: "WARNING",
    mechanism: "Amlodipin menghambat isoenzim sitokrom P450 CYP3A4 di hati dan usus secara lemah-moderat. Hal ini meningkatkan paparan sistemik (AUC) simvastatin sebesar 50-77%, melipatgandakan risiko toksisitas otot skelet, miopati, dan rhabdomyolisis.",
    recommendation: "Rekomendasi FDA: Batasi dosis Simvastatin maksimal 20 mg per hari bila dikonsumsi bersamaan dengan Amlodipin. Jika pasien memerlukan penurunan kolesterol LDL lebih agresif, ganti statin dengan Rosuvastatin atau Atorvastatin dengan dosis terukur.",
    evidence: "FDA Drug Safety Communication: FDA limits maximum dose of simvastatin with amlodipine to 20 mg daily due to risk of muscle injury/rhabdomyolysis (2011); Nishio S, et al. J Clin Pharm Ther. 2005;30(5):475-481. PMID: 16181467."
  },

  // 31. FUROSEMIDE + GENTAMICIN
  {
    id: "furosemide_gentamicin",
    drugAId: "furosemide_ped",
    drugBId: "gentamicin_ped",
    drugAName: "Furosemid",
    drugBName: "Gentamisin",
    severity: "CRITICAL",
    mechanism: "Loop diuretic (Furosemid) dan Aminoglikosida (Gentamisin/Amikasin) memiliki toksisitas inheren aditif terhadap stria vaskularis koklea telinga dalam dan sel-sel tubulus ginjal. Furosemid dosis tinggi atau bolus cepat memfasilitasi penetrasi aminoglikosida ke dalam cairan endolimfe telinga dalam, memicu ototoksisitas ireversibel (ketulian sensorineural permanen, tinitus berat) serta gagal ginjal akut.",
    recommendation: "Hindari kombinasi jika memungkinkan. Jika mutlak diperlukan pada infeksi berat: hindari bolus cepat Furosemid (berikan via infus lambat ≤4 mg/menit), pastikan hidrasi cukup, periksa kadar serum kreatinin harian, serta pantau kadar trough Gentamisin.",
    evidence: "Brummett RE. Ototoxicity resulting from the combined administration of potent diuretics and other agents. CRC Crit Rev Toxicol. 1981;9(3):203-219. PMID: 6798150."
  },

  // 32. DIGOXIN + FUROSEMIDE
  {
    id: "digoxin_furosemide",
    drugAId: "digoxin_ped",
    drugBId: "furosemide_ped",
    drugAName: "Digoksin",
    drugBName: "Furosemid",
    severity: "CRITICAL",
    mechanism: "Furosemid memicu ekskresi ion kalium dan magnesium dalam jumlah besar di urin, sering menimbulkan hipokalemia (<3.5 mEq/L) dan hipomagnesemia. Kalium ekstraseluler berkompetisi dengan Digoksin untuk menduduki pompa Na+/K+-ATPase miokardium. Penurunan kadar kalium darah memperkuat afinitas ikatan digoksin pada miokardium, memicu intoksikasi digitalis akut mematikan bahkan pada kadar digoksin serum yang normal: aritmia ventrikel ganas (PVC bigemini, VT, VF), blokade AV total, dan asistol.",
    recommendation: "Pantau kadar kalium dan magnesium serum secara berkala. Pertahankan kalium serum pasien pada rentang aman 4.0 - 5.0 mEq/L. Pertimbangkan suplementasi kalium atau diuretik hemat kalium (seperti Spironolakton dosis rendah) dengan pemantauan elektrolit disiplin.",
    evidence: "Steiness E, Olesen KH. Cardiac arrhythmias induced by hypokalaemia and potassium-depleting diuretics in digitalised patients. Br Med J. 1976;2(6034):493-496. PMID: 953556."
  },

  // 33. SPIRONOLACTONE + CAPTOPRIL
  {
    id: "spironolactone_captopril",
    drugAId: "spironolactone_ped",
    drugBId: "captopril_adult",
    drugAName: "Spironolakton",
    drugBName: "Kaptopril",
    severity: "WARNING",
    mechanism: "Kaptopril (ACE inhibitor) menekan sintesis aldosteron adrenal, menghambat ekskresi kalium ginjal. Spironolakton memblokade reseptor aldosteron pada tubulus kontortus distal ginjal. Penggunaan bersamaan membatasi kapasitas ekskresi kalium ginjal secara drastis, memicu hiperkalemia berat (>5.5 - 6.5 mEq/L) yang berisiko memicu pelebaran kompleks QRS, bradikardia berat, asistol, dan henti jantung mendadak.",
    recommendation: "Batasi dosis Spironolakton (maksimal 25 mg/hari pada gagal jantung) dan pantau kadar kalium darah serta kreatinin serum pada hari ke-3, ke-7, dan setiap bulan setelah memulai terapi. Larang konsumsi suplemen kalium atau garam diet kalium.",
    evidence: "The RALES Study Investigators; Juurlink DN, et al. Rates of hyperkalemia after publication of the Randomized Aldactone Evaluation Study. N Engl J Med. 2004;351(6):543-551. PMID: 15295047."
  },

  // 34. WARFARIN + PARACETAMOL
  {
    id: "warfarin_paracetamol",
    drugAId: "warfarin_adult",
    drugBId: "paracetamol_ped",
    drugAName: "Warfarin",
    drugBName: "Parasetamol",
    severity: "WARNING",
    mechanism: "Penggunaan Parasetamol secara reguler pada dosis moderat hingga tinggi (≥2 - 4 gram/hari selama lebih dari 3-5 hari berturut-turut) menghasilkan metabolit aktif (NAPQI) yang menghambat enzim vitamin K epoksida reduktase (VKOR) dan sintesis faktor koagulasi hati. Hal ini memperkuat efek antikoagulasi Warfarin, memicu lonjakan nilai INR yang signifikan dan meningkatkan risiko perdarahan spontan.",
    recommendation: "Parasetamol tetap merupakan analgesik pilihan lini pertama dibandingkan OAINS pada pasien pengguna Warfarin, namun hindari penggunaan kronis dosis tinggi. Jika pasien membutuhkan parasetamol reguler >2 g/hari lebih dari 3 hari, periksa INR setelah 3 hari dan sesuaikan dosis warfarin jika diperlukan.",
    evidence: "Mahé I, et al. Interaction between paracetamol and warfarin: a double-blind, randomized study. Haematologica. 2006;91(12):1621-1627. PMID: 17145600; Hylek EM, et al. JAMA. 1998;279(9):657-662. PMID: 9496982."
  },

  // 35. CLOPIDOGREL + OMEPRAZOLE
  {
    id: "clopidogrel_omeprazole",
    drugAId: "clopidogrel_adult",
    drugBId: "omeprazole_ped",
    drugAName: "Klopidogrel",
    drugBName: "Omeprazol",
    severity: "WARNING",
    mechanism: "Klopidogrel adalah prodrug yang membutuhkan bioaktivasi dua tahap oleh isoenzim CYP2C19 hati untuk menghasilkan metabolit aktif antiplatelet. Omeprazol merupakan inhibitor kompetitif CYP2C19 yang kuat. Pemberian bersamaan menurunkan kadar metabolit aktif klopidogrel hingga 45%, melemahkan inhibisi agregasi trombosit, dan meningkatkan risiko komplikasi kardiovaskular mayor (trombosis stent, re-infark miokard, stroke iskemik).",
    recommendation: "FDA BLACK BOX WARNING: Hindari penggunaan bersamaan Klopidogrel dengan Omeprazol atau Esomeprazol. Jika pasien membutuhkan gastroprotektor PPI, pilih Pantoprazol atau Lansoprazol yang memiliki afinitas inhibisi CYP2C19 yang jauh lebih rendah, atau gunakan antagonis reseptor H2 (Famotidin).",
    evidence: "FDA Drug Safety Communication: FDA reminds healthcare professionals about risk of interaction between clopidogrel and omeprazole (2011); Ho PM, et al. JAMA. 2009;301(9):937-944. PMID: 19258558."
  }
];

/**
 * Extended Food-Drug Interactions curated for the core medications in "Informasi Obat".
 */
export const EXTENDED_FOOD_INTERACTIONS: FoodInteraction[] = [
  {
    id: "metformin_alcohol",
    drugId: "metformin_adult",
    drugName: "Metformin",
    foodName: "Minuman Beralkohol",
    severity: "CRITICAL",
    mechanism: "Alkohol menghambat glukoneogenesis hati dan meningkatkan konversi piruvat menjadi laktat secara masif. Bersama Metformin yang menghambat oksidasi laktat di mitokondria, kombinasi ini melipatgandakan risiko Asidosis Laktat (lactic acidosis) yang fatal dengan angka mortalitas mencapai 50%. Selain itu, alkohol memicu hipoglikemia berat mendadak.",
    recommendation: "Hindari konsumsi minuman beralkohol selama menjalani pengobatan dengan Metformin, baik dalam jumlah berlebih (binge drinking) maupun konsumsi kronis.",
    evidence: "FDA Glucophage Prescribing Information; Lalau JD. Lactic acidosis induced by metformin: incidence, management and prevention. Drug Saf. 2010;33(9):727-740. PMID: 20701406."
  },
  {
    id: "cipro_dairy_calcium",
    drugId: "ciprofloxacin_ped",
    drugName: "Siprofloksasin",
    foodName: "Susu, Yogurt, Keju & Produk Tinggi Kalsium",
    severity: "WARNING",
    mechanism: "Kation kalsium divalen (Ca2+) dalam susu dan produk olahannya mengikat molekul siprofloksasin di saluran cerna membentuk kompleks khelat yang tidak larut dan tidak dapat diserap mukosa usus. Hal ini memangkas bioavailabilitas siprofloksasin hingga 70-80%, memicu kegagalan terapi antibiotik dan risiko resistensi bakteri.",
    recommendation: "Jangan minum siprofloksasin bersamaan dengan susu, yogurt, atau produk tinggi kalsium. Berikan jeda waktu minimal 2 jam sebelum atau 4-6 jam setelah mengonsumsi produk olahan susu.",
    evidence: "Frost RW, et al. Effects of milk and yogurt on the bioavailability of ciprofloxacin. J Clin Pharmacol. 1992;32(11):1015-1021. PMID: 1474164."
  },
  {
    id: "theophylline_caffeine",
    drugId: "aminophylline_ped",
    drugName: "Teofilin / Aminofilin",
    foodName: "Kopi, Teh Pekat, Minuman Berenergi & Cokelat (Kafein)",
    severity: "WARNING",
    mechanism: "Teofilin dan Kafein keduanya merupakan turunan metilxantin yang berkompetisi pada reseptor adenosin dan menghambat fosfodiesterase (PDE). Kafein juga bersaing pada isoenzim CYP1A2 yang memetabolisme teofilin. Konsumsi kafein dalam jumlah banyak meningkatkan kadar serum teofilin dan memberikan efek stimulasi simpatis aditif: palpitasi berat, takikardia ventrikel, tremor, insomnia berat, dan peningkatan keasaman lambung.",
    recommendation: "Batasi konsumsi kopi, teh pekat, cokelat, dan minuman berenergi tinggi kafein selama menggunakan terapi Teofilin atau Aminofilin.",
    evidence: "Jonkman JH. Food interactions with sustained-release theophylline. Clin Pharmacokinet. 1989;16(3):162-179. PMID: 2650974."
  },
  {
    id: "spironolactone_high_potassium_food",
    drugId: "spironolactone_ped",
    drugName: "Spironolakton",
    foodName: "Makanan Tinggi Kalium (Pisang, Air Kelapa, Garam Diet Pengganti Kalium)",
    severity: "WARNING",
    mechanism: "Spironolakton menghambat pembuangan kalium melalui urin secara selektif. Asupan makanan yang sangat kaya kalium (seperti konsumsi pisang berlebihan, air kelapa segar dalam jumlah besar, jus kurma, atau garam diet pengganti natrium yang berbasis kalium klorida) memicu akumulasi kalium yang cepat dalam darah, meningkatkan risiko hiperkalemia simtomatik dan aritmia jantung.",
    recommendation: "Hindari penggunaan garam diet pengganti yang mengandung kalium klorida (KCl) dan hindari konsumsi berlebih makanan sangat tinggi kalium tanpa konsultasi dengan dokter atau ahli gizi.",
    evidence: "Palmer BF. Managing hyperkalemia in heart failure. N Engl J Med. 2004;351(6):585-592."
  },
  {
    id: "corticosteroid_irritant_salt",
    drugId: "dexamethasone_ped",
    drugName: "Deksametason / Kortikosteroid",
    foodName: "Makanan Sangat Asin & Iritatif Pedas / Asam",
    severity: "INFO",
    mechanism: "Kortikosteroid sistemik memiliki efek retensi natrium dan air melalui aktivitas mineralokortikoid parsial, yang dapat memperburuk edema, retensi cairan, dan lonjakan tekanan darah bila dikonsumsi bersama makanan tinggi garam (natrium). Selain itu, kortikosteroid menipiskan mukosa lambung sehingga makanan sangat pedas/asam dapat memicu nyeri ulu hati dan dispepsia akut.",
    recommendation: "Disarankan menerapkan diet rendah garam (natrium) selama terapi kortikosteroid sistemik serta mengonsumsi obat bersama atau segera setelah makan untuk meminimalkan iritasi lambung.",
    evidence: "Clinical Guidelines on Corticosteroid Therapy; Goodman & Gilman's Pharmacological Basis of Therapeutics (14th Ed)."
  },
  {
    id: "allopurinol_purine_rich",
    drugId: "auto_allopurinol",
    drugName: "Allopurinol",
    foodName: "Makanan Tinggi Purin (Jeroan, Kerang/Seafood, Ekstrak Daging) & Alkohol",
    severity: "WARNING",
    mechanism: "Allopurinol bekerja dengan menghambat enzim xantin oksidase untuk menurunkan produksi asam urat. Konsumsi makanan yang sangat kaya purin (jeroan sapi/ayam, seafood, emping melinjo) dan alkohol secara bersamaan meningkatkan beban purin eksogen dan produksi laktat yang menghambat ekskresi asam urat ginjal, sehingga melemahkan efektivitas terapi penurun asam urat dan memicu serangan gout artritis akut berulang.",
    recommendation: "Batasi konsumsi makanan tinggi purin (jeroan, sarden, seafood, kaldu kental) dan hindari minuman beralkohol (terutama bir) untuk memaksimalkan efektivitas Allopurinol dalam mencapai target asam urat serum <6 mg/dL.",
    evidence: "Choi HK, et al. Purine-rich foods, dairy and protein intake, and the risk of gout in men. N Engl J Med. 2004;350(11):1093-1103. PMID: 15014182."
  }
];
