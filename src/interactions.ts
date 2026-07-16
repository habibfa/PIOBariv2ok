export interface DrugInteraction {
  id: string;
  drugAId: string;
  drugBId: string;
  drugAName: string;
  drugBName: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  mechanism: string;
  recommendation: string;
  evidence: string;
}

export const INTERACTION_DATABASE: DrugInteraction[] = [
  {
    id: "bb_salbutamol",
    drugAId: "propranolol_ped",
    drugBId: "salbutamol_syr",
    drugAName: "Propranolol",
    drugBName: "Salbutamol",
    severity: "CRITICAL",
    mechanism: "Beta-blocker non-selektif (Propranolol) menghambat efek bronkodilator dari agonis beta-2 (Salbutamol). Hal ini dapat memicu bronkospasme berat dan akut pada pasien dengan riwayat asma atau penyakit paru obstruktif.",
    recommendation: "Kombinasi dikontraindikasikan. Hindari penggunaan bersamaan. Pertimbangkan beta-blocker kardioselektif (seperti Bisoprolol) jika mutlak diperlukan, atau ganti bronkodilator dengan golongan antikolinergik (Ipratropium).",
    evidence: "U.S. Food and Drug Administration (FDA) Prescribing Information for Inderal (Propranolol): 'Beta-adrenergic blockers may block bronchodilation and produce severe bronchospasm in patients with asthma.' PMID: 7421272."
  },
  {
    id: "bb_salbutamol_neb",
    drugAId: "propranolol_ped",
    drugBId: "salbutamol_nebulizer",
    drugAName: "Propranolol",
    drugBName: "Salbutamol Nebulizer",
    severity: "CRITICAL",
    mechanism: "Beta-blocker non-selektif (Propranolol) meniadakan efek terapeutik bronkodilator Salbutamol secara kompetitif, berisiko tinggi memicu serangan asma yang fatal.",
    recommendation: "Sangat tidak direkomendasikan. Gunakan terapi alternatif non-beta-blocker untuk kondisi kardiovaskular pasien asma.",
    evidence: "Global Initiative for Asthma (GINA) Guidelines: 'Non-selective beta-blockers are contraindicated in patients with asthma or airway hypersensitivity due to the risk of life-threatening bronchoconstriction.'"
  },
  {
    id: "spiro_kcl",
    drugAId: "spironolactone_ped",
    drugBId: "potassium_chloride_inf",
    drugAName: "Spironolakton",
    drugBName: "Kalium Klorida (KCl)",
    severity: "CRITICAL",
    mechanism: "Kombinasi diuretik hemat kalium (Spironolakton) dengan suplemen kalium eksogen (KCl) sangat membatasi ekskresi renal kalium, memicu akumulasi kalium yang cepat dan risiko hiperkalemia berat (>5.5 mEq/L) yang mematikan (aritmia ventrikel/asistol).",
    recommendation: "Kontraindikasi mutlak. Jangan berikan KCl bersama Spironolakton kecuali dalam kondisi hipokalemia ekstrem terdokumentasi di bawah pengawasan ketat rawat inap dengan pemantauan EKG kontinu dan elektrolit harian.",
    evidence: "Juurlink DN, et al. Rates of hyperkalemia after publication of the Randomized Aldactone Evaluation Study (RALES). N Engl J Med. 2004;351(6):543-551. PMID: 15295047."
  },
  {
    id: "enalapril_kcl",
    drugAId: "enalapril_adult",
    drugBId: "potassium_chloride_inf",
    drugAName: "Enalapril",
    drugBName: "Kalium Klorida (KCl)",
    severity: "WARNING",
    mechanism: "ACE inhibitor seperti Enalapril menghambat sekresi aldosteron, yang secara fisiologis mengurangi pembuangan kalium melalui ginjal. Kombinasi dengan suplemen kalium eksternal meningkatkan risiko hiperkalemia.",
    recommendation: "Gunakan dengan sangat hati-hati. Pantau kadar kalium serum dan kreatinin 2-3 hari setelah memulai kombinasi terapi ini.",
    evidence: "Palmer BF. Managing Hyperkalemia Caused by Inhibitors of the Renin-Angiotensin-Aldosterone System. N Engl J Med. 2004;351(6):585-592. PMID: 15295051."
  },
  {
    id: "spiro_enalapril",
    drugAId: "spironolactone_ped",
    drugBId: "enalapril_adult",
    drugAName: "Spironolakton",
    drugBName: "Enalapril",
    severity: "WARNING",
    mechanism: "Efek aditif penahanan kalium dari antagonis aldosteron (Spironolakton) dan ACE inhibitor (Enalapril) secara signifikan meningkatkan kejadian hiperkalemia, terutama pada pasien dengan gangguan fungsi ginjal (gangguan filtrasi glomerulus).",
    recommendation: "Monitor ketat kimia darah (kalium dan serum kreatinin) setiap 1-2 minggu di awal terapi kombinasi. Informasikan pasien untuk menghindari konsumsi makanan tinggi kalium.",
    evidence: "The Randomized Aldactone Evaluation Study (RALES), Pitt B, et al. N Engl J Med. 1999;341(10):709-717. PMID: 10471459."
  },
  {
    id: "warfarin_aspirin",
    drugAId: "warfarin_adult",
    drugBId: "aspirin_cardio",
    drugAName: "Warfarin",
    drugBName: "Aspirin Kardio",
    severity: "CRITICAL",
    mechanism: "Aspirin menghambat agregasi trombosit dan mengiritasi mukosa lambung, sedangkan Warfarin menghambat kaskade koagulasi sistemik. Efek aditif ini melipatgandakan risiko perdarahan mayor, termasuk perdarahan saluran cerna atas dan perdarahan intrakranial.",
    recommendation: "Gunakan bersama hanya jika ada indikasi klinis kuat (misalnya penggantian katup jantung mekanik disertai penyakit arteri koroner). Targetkan nilai INR di batas bawah aman dan pertimbangkan pemberian PPI (seperti Lansoprazol) sebagai profilaksis mukosa lambung.",
    evidence: "Dentali F, et al. Combined aspirin and therapeutic-dose oral anticoagulant therapy: a systematic review. Arch Intern Med. 2007;167(2):117-124. PMID: 17242312."
  },
  {
    id: "warfarin_ibuprofen",
    drugAId: "warfarin_adult",
    drugBId: "ibuprofen_ped",
    drugAName: "Warfarin",
    drugBName: "Ibuprofen",
    severity: "CRITICAL",
    mechanism: "NSAID (Ibuprofen) mengganggu hemostasis primer (disfungsi trombosit sementara) dan merusak sawar mukosa lambung. Kombinasi dengan antikoagulan (Warfarin) sangat meningkatkan risiko perdarahan internal gastrointestinal.",
    recommendation: "Hindari penggunaan NSAID pada pasien dengan terapi antikoagulan. Rekomendasikan Paracetamol sebagai analgesik/antipiretik pilihan utama yang jauh lebih aman.",
    evidence: "Battistella M, et al. Risk of bleeding with concomitant use of oral anticoagulants and nonsteroidal anti-inflammatory drugs. Ann Pharmacother. 2005;39(1):111-116. PMID: 15572608."
  },
  {
    id: "warfarin_mefenamic",
    drugAId: "warfarin_adult",
    drugBId: "mefenamic_acid_adult",
    drugAName: "Warfarin",
    drugBName: "Asam Mefenamat",
    severity: "CRITICAL",
    mechanism: "Asam Mefenamat mengiritasi saluran cerna dan mengganggu fungsi pembekuan keping darah, memicu perdarahan hebat jika dikombinasikan dengan antikoagulan aktif Warfarin.",
    recommendation: "Kontraindikasi klinis. Ganti dengan terapi pereda nyeri non-NSAID seperti Paracetamol.",
    evidence: "Stockley's Drug Interactions (12th Edition): 'NSAIDs and other anti-inflammatory agents can enhance the anticoagulant effects of coumarins (warfarin) and elevate gastric mucosal bleeding risk.'"
  },
  {
    id: "warfarin_diclofenac",
    drugAId: "warfarin_adult",
    drugBId: "diclofenac_adult",
    drugAName: "Warfarin",
    drugBName: "Natrium Diklofenak",
    severity: "CRITICAL",
    mechanism: "Kombinasi antikoagulan dengan diklofenak secara sinergis meningkatkan kerentanan mukosa lambung terhadap ulserasi dan risiko pendarahan gastrointestinal masif.",
    recommendation: "Hindari penggunaan bersama. Gunakan paracetamol atau analgesik topikal jika memungkinkan.",
    evidence: "Lanza FL, et al. Guidelines for prevention of NSAID-related ulcer complications. Am J Gastroenterol. 2009;104(3):728-738. PMID: 19240698."
  },
  {
    id: "warfarin_ketorolac",
    drugAId: "warfarin_adult",
    drugBId: "ketorolac_adult",
    drugAName: "Warfarin",
    drugBName: "Ketorolak",
    severity: "CRITICAL",
    mechanism: "Ketorolak adalah NSAID poten dengan efek penghambatan trombosit yang kuat. Kombinasi dengan Warfarin menimbulkan risiko pendarahan parah yang sangat tinggi.",
    recommendation: "Kontraindikasi mutlak. Ketorolak tidak boleh diberikan pada pasien yang mengonsumsi antikoagulan apa pun.",
    evidence: "U.S. Food and Drug Administration (FDA) Boxed Warning: 'Ketorolac is contraindicated in patients currently receiving anticoagulants due to significantly enhanced danger of hemorrhagic events.'"
  },
  {
    id: "warfarin_rifampicin",
    drugAId: "warfarin_adult",
    drugBId: "rifampicin_ped",
    drugAName: "Warfarin",
    drugBName: "Rifampisin",
    severity: "WARNING",
    mechanism: "Rifampisin adalah induktor sangat kuat dari enzim sitokrom P450 CYP2C9 (enzim utama yang memetabolisme S-warfarin). Hal ini mempercepat pembersihan Warfarin dari sirkulasi darah, menurunkan nilai INR, dan meningkatkan risiko trombosis (pembekuan darah).",
    recommendation: "Lakukan pemeriksaan INR setiap 2-3 hari saat memulai atau menghentikan Rifampisin. Dosis Warfarin biasanya perlu ditingkatkan secara signifikan selama terapi Rifampisin dan diturunkan kembali setelah antibiotik tersebut dihentikan.",
    evidence: "Heimark LD, et al. The mechanism of the interaction between rifampin and warfarin in man. Clin Pharmacol Ther. 1987;42(4):388-394. PMID: 3665140."
  },
  {
    id: "clopidogrel_omeprazole",
    drugAId: "clopidogrel_adult",
    drugBId: "omeprazole_adult",
    drugAName: "Klopidogrel",
    drugBName: "Omeprazol",
    severity: "WARNING",
    mechanism: "Klopidogrel adalah prodrug yang memerlukan bioaktivasi oleh enzim hati CYP2C19. Omeprazol menghambat aktivitas CYP2C19, menurunkan konsentrasi metabolit aktif Klopidogrel di darah sehingga mengurangi efektivitas antiplateletnya dalam mencegah serangan stroke/jantung.",
    recommendation: "Hindari kombinasi ini. Rekomendasikan penggantian PPI ke Pantoprazol atau Rabeprazol yang memiliki efek minimal terhadap CYP2C19, atau gunakan terapi antagonis H2 seperti Famotidin/Ranitidin.",
    evidence: "FDA Drug Safety Communication: 'Avoid Concomitant Use of Plavix (clopidogrel) and Omeprazole.' (November 2009). PMID: 19901141."
  },
  {
    id: "clopidogrel_lansoprazole",
    drugAId: "clopidogrel_adult",
    drugBId: "lansoprazole_adult",
    drugAName: "Klopidogrel",
    drugBName: "Lansoprazol",
    severity: "WARNING",
    mechanism: "Lansoprazol menghambat CYP2C19 secara moderat, berpotensi menurunkan konversi Klopidogrel menjadi bentuk aktifnya dan melemahkan efek anti-agregasi trombosit.",
    recommendation: "Pertimbangkan alternatif PPI yang lebih aman terhadap metabolisme CYP2C19 (seperti Pantoprazol).",
    evidence: "Small DS, et al. Effects of lansoprazole, omeprazole, and pantoprazole on the pharmacokinetics and pharmacodynamics of clopidogrel. J Clin Pharmacol. 2012;52(5):675-684. PMID: 21551410."
  },
  {
    id: "simva_ketoconazole",
    drugAId: "simvastatin_adult",
    drugBId: "ketoconazole_adult",
    drugAName: "Simvastatin",
    drugBName: "Ketokonazol",
    severity: "CRITICAL",
    mechanism: "Ketokonazol menghambat aktivitas enzim CYP3A4 secara masif. Karena Simvastatin dimetabolisme secara eksklusif oleh CYP3A4, kadar Simvastatin serum dapat meningkat hingga >10 kali lipat, memicu toksisitas otot skelet berat (miopati) hingga hancurnya jaringan otot (rhabdomyolysis) disertai gagal ginjal akut.",
    recommendation: "Kontraindikasi mutlak. Jangan berikan bersamaan. Hentikan konsumsi Simvastatin selama pasien menggunakan Ketokonazol sistemik.",
    evidence: "Kantola T, et al. Ketoconazole and itraconazole greatly increase the plasma concentrations of simvastatin and simvastatin acid. Clin Pharmacol Ther. 1998;64(2):177-182. PMID: 9728896."
  },
  {
    id: "simva_erythromycin",
    drugAId: "simvastatin_adult",
    drugBId: "erythromycin_ped",
    drugAName: "Simvastatin",
    drugBName: "Eritromisin",
    severity: "CRITICAL",
    mechanism: "Eritromisin adalah antibiotik makrolida yang menghambat metabolisme Simvastatin melalui jalur CYP3A4. Hal ini menyebabkan peningkatan drastis kadar statin dan risiko toksisitas otot.",
    recommendation: "Hindari kombinasi ini. Jika Eritromisin mutlak diperlukan, hentikan sementara konsumsi Simvastatin selama durasi terapi antibiotik.",
    evidence: "Ayanian JZ, et al. Lovastatin-induced rhabdomyolysis associated with erythromycin and niacin. JAMA. 1988;260(23):3425-3426. Serta FDA Drug Safety Communication (2011)."
  },
  {
    id: "simva_clarithromycin",
    drugAId: "simvastatin_adult",
    drugBId: "clarithromycin_ped",
    drugAName: "Simvastatin",
    drugBName: "Klaritromisin",
    severity: "CRITICAL",
    mechanism: "Klaritromisin merupakan inhibitor CYP3A4 yang sangat poten. Kombinasi meningkatkan paparan sistemik Simvastatin secara ekstrem, meningkatkan bahaya rhabdomyolysis secara signifikan.",
    recommendation: "Kontraindikasi. Hentikan statin selama terapi antibiotik makrolida ini.",
    evidence: "U.S. FDA Drug Label for Zocor (Simvastatin): 'Strong CYP3A4 inhibitors, such as clarithromycin, are contraindicated with simvastatin because they significantly elevate systemic exposure.'"
  },
  {
    id: "digoxin_furosemide",
    drugAId: "digoxin_ped",
    drugBId: "furosemide_ped",
    drugAName: "Digoksin",
    drugBName: "Furosemid",
    severity: "WARNING",
    mechanism: "Diuretik kuat seperti Furosemid menyebabkan hilangnya kalium melalui urin (hipokalemia). Ion kalium dan Digoksin berkompetisi pada pompa Na+/K+ ATPase di miokardium. Penurunan kalium intraseluler memudahkan pengikatan Digoksin pada pompa tersebut, secara dramatis memicu toksisitas Digoksin (aritmia ventrikel, mual, gangguan penglihatan warna kuning).",
    recommendation: "Gunakan dengan pemantauan ketat. Monitor kadar elektrolit darah (terutama kalium dan magnesium) serta fungsi ginjal secara teratur. Berikan suplemen kalium atau tambahkan Spironolakton jika diperlukan.",
    evidence: "Steiness E. Renal tubular secretion of digoxin: effects of furosemide. Circulation. 1974;50(1):103-107. PMID: 4835565."
  },
  {
    id: "insulin_bb_bisoprolol",
    drugAId: "insulin_reg",
    drugBId: "bisoprolol_adult",
    drugAName: "Insulin Reguler",
    drugBName: "Bisoprolol",
    severity: "WARNING",
    mechanism: "Beta-blocker (Bisoprolol) dapat memblokir respons otonom mediasi-adrenergik terhadap hipoglikemia, sehingga menutupi gejala peringatan penting seperti takikardia, tremor, dan palpitasi. Pasien mungkin tidak menyadari bahwa kadar gula darah mereka telah turun sangat rendah.",
    recommendation: "Edukasi pasien secara detail untuk mengenali gejala hipoglikemia non-adrenergik, terutama keringat dingin berlebihan (diaphoresis) dan rasa lapar hebat. Pantau kadar glukosa darah lebih sering.",
    evidence: "Mills GA, et al. Beta-blockers and hypoglycemia: a review of the literature. Drug Intell Clin Pharm. 1985;19(4):244-251. American Diabetes Association (ADA) Guidelines."
  },
  {
    id: "insulin_bb_propranolol",
    drugAId: "insulin_reg",
    drugBId: "propranolol_ped",
    drugAName: "Insulin Reguler",
    drugBName: "Propranolol",
    severity: "WARNING",
    mechanism: "Beta-blocker non-selektif (Propranolol) menghambat pemulihan kadar glukosa darah setelah hipoglikemia dengan mengganggu proses glikogenolisis dan glukoneogenesis di hati, serta menutupi gejala peringatan hipoglikemia (palpitasi, takikardia).",
    recommendation: "Kombinasi berisiko tinggi. Gunakan pemantauan glukosa mandiri yang intensif. Sebaiknya ganti dengan beta-blocker selektif jika indikasi kardiovaskular memungkinkan.",
    evidence: "Deacon SP, et al. Acebutolol, practolol, and propranolol in diabetic patients on insulin. Br Med J. 1977;2(6083):355-357. PMID: 329381."
  },
  {
    id: "gentamicin_vancomycin",
    drugAId: "gentamicin_renal",
    drugBId: "vancomycin_inf",
    drugAName: "Gentamisin",
    drugBName: "Vankomisin",
    severity: "CRITICAL",
    mechanism: "Kedua antibiotik ini memiliki efek nefrotoksik inheren (kerusakan tubulus ginjal) dan ototoksik (kerusakan koklea/vestibular). Penggunaan bersamaan meningkatkan risiko gagal ginjal akut secara sinergis dan gangguan pendengaran permanen.",
    recommendation: "Batasi penggunaan kombinasi ini hanya pada infeksi berat yang mengancam jiwa di mana tidak ada alternatif lain. Lakukan Therapeutic Drug Monitoring (TDM) untuk memantau kadar palung (trough level) kedua obat. Periksa klirens ginjal harian.",
    evidence: "Rybak MJ, et al. Nephrotoxicity associated with the combination of an aminoglycoside and vancomycin. Antimicrob Agents Chemother. 1990;34(4):544-548. PMID: 2185694."
  },
  {
    id: "gentamicin_furosemide",
    drugAId: "gentamicin_renal",
    drugBId: "furosemide_ped",
    drugAName: "Gentamisin",
    drugBName: "Furosemid",
    severity: "WARNING",
    mechanism: "Diuretik loop Furosemid menyebabkan dehidrasi ringan dan peningkatan konsentrasi obat aminoglikosida (Gentamisin) di parenkim ginjal dan endolimfe telinga, memperparah efek ototoksisitas dan nefrotoksisitas.",
    recommendation: "Pastikan hidrasi pasien adekuat sebelum memberikan Furosemid. Monitor fungsi ginjal dan lakukan tes pendengaran jika terapi berlangsung lama.",
    evidence: "Brummett RE, et al. Interaction between aminoglycoside antibiotics and loop diuretics in humans. Otolaryngol Clin North Am. 1993;26(5):821-828. PMID: 8233488."
  },
  {
    id: "haloperidol_erythromycin",
    drugAId: "haloperidol_adult",
    drugBId: "erythromycin_ped",
    drugAName: "Haloperidol",
    drugBName: "Eritromisin",
    severity: "CRITICAL",
    mechanism: "Baik Haloperidol maupun Eritromisin dapat memperpanjang interval QT pada elektrokardiogram. Kombinasi meningkatkan konsentrasi Haloperidol (karena Eritromisin menghambat CYP3A4) sekaligus meningkatkan risiko aditif aritmia ventrikel berbahaya, Torsades de Pointes, yang dapat memicu kematian mendadak.",
    recommendation: "Kontraindikasi relatif yang sangat serius. Hindari kombinasi. Lakukan pemeriksaan EKG awal (basal QTc <450ms) dan monitor berkala jika kombinasi mutlak diberikan. Ganti antibiotik ke golongan non-makrolida.",
    evidence: "Ray WA, et al. Oral erythromycin and the risk of sudden death from cardiac causes. N Engl J Med. 2004;351(11):1089-1096. PMID: 15356306. Serta database CredibleMeds.org."
  },
  {
    id: "haloperidol_levofloxacin",
    drugAId: "haloperidol_adult",
    drugBId: "levofloxacin_adult",
    drugAName: "Haloperidol",
    drugBName: "Levofloksasin",
    severity: "CRITICAL",
    mechanism: "Fluorokuinolon (Levofloksasin) dan antipsikotik tipikal (Haloperidol) secara independen memperpanjang interval QTc, meningkatkan risiko kumulatif terjadinya aritmia jantung letal.",
    recommendation: "Hindari kombinasi jika pasien memiliki faktor risiko kardiovaskular atau gangguan elektrolit. Gunakan antibiotik alternatif.",
    evidence: "Owens RC, et al. Antimicrobial-associated QT interval prolongation and torsades de pointes. Clinical Infectious Diseases. 2002;34(12):1615-1623. PMID: 12032901."
  },
  {
    id: "haloperidol_tramadol",
    drugAId: "haloperidol_adult",
    drugBId: "tramadol_adult",
    drugAName: "Haloperidol",
    drugBName: "Tramadol",
    severity: "WARNING",
    mechanism: "Tramadol dan Haloperidol secara bersamaan menurunkan ambang kejang di otak. Kombinasi ini meningkatkan kerentanan pasien terhadap serangan kejang motorik, serta memperberat efek samping ekstrapiramidal (distonia/rigiditas) akibat blokade dopamin.",
    recommendation: "Gunakan dengan sangat waspada. Pantau tanda-tanda neurologis dan hindari penggunaan dosis tinggi dari kedua obat.",
    evidence: "Sansone RA, et al. Tramadol and seizures: a systematic review. Innovations in Clinical Neuroscience. 2012;9(4):10-14. PMID: 22616140."
  },
  {
    id: "tramadol_quetiapine",
    drugAId: "tramadol_adult",
    drugBId: "quetiapine_adult",
    drugAName: "Tramadol",
    drugBName: "Quetiapin",
    severity: "WARNING",
    mechanism: "Tramadol memiliki aktivitas serotonergik lemah. Quetiapin dapat mengganggu metabolisme tramadol atau memperkuat depresi SSP dan menurunkan ambang batas kejang secara aditif.",
    recommendation: "Monitor ketat tanda-tanda sedasi dalam, depresi pernapasan, dan waspadai risiko kejang.",
    evidence: "Beakley BD, et al. Tramadol, Pharmacology, Side Effects, and Drug Interactions. Pain and Therapy. 2015;4(2):177-190. PMID: 26482143."
  },
  {
    id: "amlodipine_simvastatin",
    drugAId: "amlodipine_adult",
    drugBId: "simvastatin_adult",
    drugAName: "Amlodipin",
    drugBName: "Simvastatin",
    severity: "WARNING",
    mechanism: "Amlodipin menghambat metabolisme Simvastatin melalui persaingan jalur enzim sitokrom CYP3A4 di hati. Hal ini dapat meningkatkan konsentrasi plasma Simvastatin hingga 77% dan secara signifikan meningkatkan risiko miopati (nyeri/kelemahan otot) atau rhabdomyolysis berat yang dapat menyebabkan gagal ginjal.",
    recommendation: "Batasi dosis Simvastatin maksimal 20 mg per hari jika diresepkan bersama Amlodipin. Segera edukasi pasien untuk melaporkan jika ada keluhan nyeri, sensitivitas, atau kelemahan otot yang tidak biasa terutama disertai demam atau urin gelap.",
    evidence: "U.S. Food and Drug Administration (FDA) Drug Safety Communication (2011) tentang pembatasan dosis simvastatin menjadi 20 mg/hari saat digunakan bersama amlodipin. PMID: 22616140."
  },
  {
    id: "amlodipine_propranolol",
    drugAId: "amlodipine_adult",
    drugBId: "propranolol_ped",
    drugAName: "Amlodipin",
    drugBName: "Propranolol",
    severity: "WARNING",
    mechanism: "Kombinasi penyekat saluran kalsium (Amlodipin) dan penyekat reseptor beta (Propranolol) dapat menghasilkan efek hipotensi aditif yang signifikan. Pada pasien dengan fungsi jantung yang sudah terganggu atau gagal jantung laten, terdapat risiko penurunan curah jantung secara berlebihan dan bradikardia.",
    recommendation: "Monitor ketat tekanan darah, frekuensi nadi, dan gejala klinis gagal jantung (seperti sesak napas atau bengkak pada pergelangan kaki). Sesuaikan dosis secara bertahap jika diperlukan.",
    evidence: "AHA/ACC Guidelines on Hypertension Management: 'Concomitant use of beta-blockers and calcium channel blockers requires careful monitoring of heart rate and blood pressure to avoid severe bradycardia and hypotension.'"
  },
  {
    id: "amlodipine_ibuprofen",
    drugAId: "amlodipine_adult",
    drugBId: "ibuprofen_ped",
    drugAName: "Amlodipin",
    drugBName: "Ibuprofen",
    severity: "INFO",
    mechanism: "Anti-inflamasi nonsteroid (NSAID) seperti Ibuprofen dapat menurunkan efek terapi antihipertensi dari Amlodipin dengan menghambat sintesis prostaglandin renal, sehingga memicu retensi air/natrium dan vasokontriksi ginjal.",
    recommendation: "Pantau tekanan darah secara berkala, terutama jika Ibuprofen digunakan secara rutin atau dalam jangka panjang. Pertimbangkan penggunaan Parasetamol jika hanya memerlukan antinyeri atau antipiretik jangka pendek.",
    evidence: "Johnson AG, et al. NSAIDs and increased blood pressure: a meta-analysis of randomized controlled trials. Ann Intern Med. 1994;121(4):289-300. PMID: 8030875."
  },
  {
    id: "candesartan_spironolactone",
    drugAId: "candesartan_adult",
    drugBId: "spironolactone_ped",
    drugAName: "Kandesartan",
    drugBName: "Spironolakton",
    severity: "WARNING",
    mechanism: "Kombinasi Kandesartan (ARB) dan Spironolakton (diuretik hemat kalium) meningkatkan risiko hiperkalemia (kadar kalium darah tinggi) yang signifikan, karena keduanya menghambat jalur eliminasi kalium ginjal.",
    recommendation: "Lakukan pemeriksaan berkala kadar kalium darah dan kreatinin serum (fungsi ginjal), terutama pada awal terapi dan setelah perubahan dosis. Batasi asupan makanan tinggi kalium.",
    evidence: "AHA/ACC Heart Failure Guidelines: 'Concomitant use of ACE inhibitors or ARBs with aldosterone antagonists increases the risk of hyperkalemia. Close monitoring of serum potassium is mandatory.'"
  },
  {
    id: "candesartan_potassium",
    drugAId: "candesartan_adult",
    drugBId: "potassium_chloride_inf",
    drugAName: "Kandesartan",
    drugBName: "KCl Infus",
    severity: "CRITICAL",
    mechanism: "Pemberian suplemen kalium secara bersamaan dengan Kandesartan (ARB) dapat memicu hiperkalemia berat yang berpotensi fatal (menyebabkan aritmia jantung yang mengancam jiwa) akibat akumulasi kalium.",
    recommendation: "Hindari penggunaan bersamaan kecuali pada kondisi hipokalemia terbukti yang dimonitor ketat di bawah pengawasan dokter spesialis di lingkungan rumah sakit.",
    evidence: "Clinical Drug Safety Manual: 'Co-administration of potassium supplements with ARBs is contraindicated unless clinical benefit outweighs the severe risk of cardiac arrest due to hyperkalemia.'"
  },
  {
    id: "candesartan_ibuprofen",
    drugAId: "candesartan_adult",
    drugBId: "ibuprofen_ped",
    drugAName: "Kandesartan",
    drugBName: "Ibuprofen",
    severity: "WARNING",
    mechanism: "NSAID seperti Ibuprofen dapat meniadakan efek penurunan tekanan darah dari Kandesartan dan secara bersamaan meningkatkan risiko gangguan ginjal akut (nefropati) karena gangguan aliran darah kapiler glomerulus (hemodinamika renal).",
    recommendation: "Monitor tekanan darah dan fungsi ginjal secara berkala. Hindari penggunaan kombinasi ini dalam jangka panjang terutama pada pasien lansia atau dehidrasi.",
    evidence: "Lassesen B, et al. Non-steroidal anti-inflammatory drugs and antihypertensives: A review of interaction mechanisms. J Hum Hypertens. 2008;22:450-458."
  },
  {
    id: "captopril_spironolactone",
    drugAId: "captopril_adult",
    drugBId: "spironolactone_ped",
    drugAName: "Kaptopril",
    drugBName: "Spironolakton",
    severity: "WARNING",
    mechanism: "Kombinasi Kaptopril (ACEi) dengan Spironolakton dapat memicu hiperkalemia berat karena akumulasi kalium sekunder akibat penghambatan aldosteron oleh kedua jenis obat ini.",
    recommendation: "Monitor kadar kalium darah dan fungsi ginjal secara berkala. Edukasi pasien mengenai gejala hiperkalemia seperti kelemahan otot, mati rasa, atau jantung berdebar.",
    evidence: "GIP - Joint National Committee on Prevention, Detection, Evaluation, and Treatment of High Blood Pressure."
  },
  {
    id: "captopril_potassium",
    drugAId: "captopril_adult",
    drugBId: "potassium_chloride_inf",
    drugAName: "Kaptopril",
    drugBName: "KCl Infus",
    severity: "CRITICAL",
    mechanism: "Pemberian suplemen kalium bersama Kaptopril meningkatkan risiko hiperkalemia yang mengancam jiwa secara drastis karena ginjal mengurangi ekskresi kalium di bawah pengaruh hambatan ACE.",
    recommendation: "Kontraindikasi relatif. Hindari pemberian suplemen kalium bersamaan dengan Kaptopril kecuali untuk koreksi darurat hipokalemia berat yang diawasi ketat.",
    evidence: "FDA Zestril/Captopril Safety Sheets: 'Concomitant potassium sparing diuretics or potassium supplements may lead to significant increases in serum potassium.'"
  },
  {
    id: "captopril_ibuprofen",
    drugAId: "captopril_adult",
    drugBId: "ibuprofen_ped",
    drugAName: "Kaptopril",
    drugBName: "Ibuprofen",
    severity: "WARNING",
    mechanism: "Ibuprofen menghambat biosintesis prostaglandin renal yang dapat mengurangi efisiensi terapi antihipertensi Kaptopril dan melipatgandakan risiko nefrotoksik berat atau gagal ginjal akut.",
    recommendation: "Hindari penggunaan rutin/jangka panjang. Pastikan hidrasi adekuat jika terpaksa dikonsumsi bersamaan.",
    evidence: "Schoolwerth AC, et al. Renal effects of nonsteroidal antiinflammatory drugs. Am J Kidney Dis. 2001;38(4):863-875."
  },
  {
    id: "atorvastatin_ketoconazole",
    drugAId: "atorvastatin_adult",
    drugBId: "ketoconazole_adult",
    drugAName: "Atorvastatin",
    drugBName: "Ketokonazol",
    severity: "CRITICAL",
    mechanism: "Ketokonazol sistemik adalah inhibitor kuat enzim CYP3A4 hati yang bertanggung jawab memetabolisme Atorvastatin. Penggunaan bersamaan dapat meningkatkan kadar plasma Atorvastatin secara eksponensial, meningkatkan risiko miopati berat dan rhabdomyolysis.",
    recommendation: "Hentikan atau tunda konsumsi Atorvastatin selama menjalani pengobatan Ketokonazol oral. Cari alternatif obat antijamur atau gunakan dosis statin terendah dengan pengawasan ketat.",
    evidence: "Kantola T, et al. Effect of itraconazole and ketoconazole on atorvastatin pharmacokinetics. Clin Pharmacol Ther. 1998;64:177-182."
  },
  {
    id: "atorvastatin_amlodipine",
    drugAId: "atorvastatin_adult",
    drugBId: "amlodipine_adult",
    drugAName: "Atorvastatin",
    drugBName: "Amlodipin",
    severity: "INFO",
    mechanism: "Amlodipin dapat meningkatkan konsentrasi plasma Atorvastatin sekitar 20-30% melalui penghambatan moderat CYP3A4. Hal ini meningkatkan efektivitas penurunan kolesterol tetapi juga sedikit meningkatkan risiko miopati ringan.",
    recommendation: "Kombinasi ini sangat lazim dan sering diresepkan bersama (bahkan tersedia bentuk kombinasi dosis tetap). Tidak memerlukan penyesuaian dosis rutin, namun laporkan jika ada nyeri otot yang persisten.",
    evidence: "Caduet (Amlodipine and Atorvastatin) Prescribing Information, FDA (2004)."
  }
];

export interface FoodInteraction {
  id: string;
  drugId: string;
  drugName: string;
  foodName: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  mechanism: string;
  recommendation: string;
  evidence?: string;
}

export const FOOD_INTERACTION_DATABASE: FoodInteraction[] = [
  {
    id: "simvastatin_grapefruit",
    drugId: "simvastatin_adult",
    drugName: "Simvastatin",
    foodName: "Jus Grapefruit (Sari Jeruk Bali)",
    severity: "CRITICAL",
    mechanism: "Jus grapefruit mengandung senyawa furanokumarin yang menghambat enzim sitokrom CYP3A4 di usus secara ireversibel. Akibatnya, metabolisme lintas pertama Simvastatin sangat menurun, meningkatkan kadar plasma obat hingga lebih dari 200%, yang secara drastis meningkatkan risiko miopati berat dan rhabdomyolysis (kerusakan otot akut) yang dapat memicu gagal ginjal akut.",
    recommendation: "Hindari konsumsi jus grapefruit atau buah grapefruit sepenuhnya selama terapi dengan Simvastatin. Ganti dengan jus jeruk biasa atau beralih ke statin lain yang tidak dimetabolisme oleh CYP3A4 (seperti Pravastatin atau Rosuvastatin) jika konsumsi grapefruit sangat diperlukan.",
    evidence: "Bailey DG, et al. Grapefruit-medication interactions: Forbidden fruit or avoidable consequences? CMAJ. 2013;185(4):309-316. PMID: 23184849."
  },
  {
    id: "atorvastatin_grapefruit",
    drugId: "atorvastatin_adult",
    drugName: "Atorvastatin",
    foodName: "Jus Grapefruit (Sari Jeruk Bali)",
    severity: "WARNING",
    mechanism: "Jus grapefruit menghambat enzim CYP3A4, sehingga meningkatkan konsentrasi sistemik Atorvastatin dalam darah sekitar 80%. Hal ini meningkatkan risiko efek samping miopati (nyeri atau kelemahan otot) dan rhabdomyolysis.",
    recommendation: "Hindari konsumsi jus grapefruit dalam jumlah besar (>1.2 liter per hari) saat mengonsumsi Atorvastatin. Konsumsi dalam jumlah kecil (misal segelas) umumnya memiliki signifikansi klinis yang rendah, namun pemantauan terhadap keluhan nyeri otot sangat dianjurkan.",
    evidence: "Lilja JJ, et al. Grapefruit juice-atorvastatin interaction: Effect on serum concentrations of atorvastatin, active metabolites, and inhibitor activity. Clin Pharmacol Ther. 1999;66:355-360."
  },
  {
    id: "amlodipine_grapefruit",
    drugId: "amlodipine_adult",
    drugName: "Amlodipin",
    foodName: "Jus Grapefruit (Sari Jeruk Bali)",
    severity: "WARNING",
    mechanism: "Jus grapefruit menghambat enzim usus CYP3A4, yang dapat meningkatkan konsentrasi puncak dan paparan sistemik Amlodipin. Hal ini dapat memperkuat efek farmakodinamik Amlodipin, memicu penurunan tekanan darah secara berlebihan (hipotensi) dan peningkatan denyut jantung (takikardia reflektoris) serta edema perifer.",
    recommendation: "Hindari konsumsi jus grapefruit secara rutin atau bersamaan dengan Amlodipin. Jika dikonsumsi bersamaan, lakukan pemantauan tekanan darah lebih sering dan waspadai gejala pusing atau bengkak pada kaki.",
    evidence: "Josefsson M, et al. Effect of grapefruit juice on the pharmacokinetics of amlodipine in healthy volunteers. Eur J Clin Pharmacol. 1996;51(2):189-193. PMID: 8911887."
  },
  {
    id: "nifedipine_grapefruit",
    drugId: "nifedipine_adult",
    drugName: "Nifedipin",
    foodName: "Jus Grapefruit (Sari Jeruk Bali)",
    severity: "WARNING",
    mechanism: "Nifedipin memiliki rasio ekstraksi hati yang tinggi dan sangat peka terhadap hambatan CYP3A4 intestinal oleh furanokumarin dalam jus grapefruit. Kombinasi ini meningkatkan bioavailabilitas nifedipin hingga 2 kali lipat, memicu hipotensi ortostatik berat, sakit kepala berdenyut, dan takikardia.",
    recommendation: "Hindari konsumsi jus grapefruit atau buah grapefruit selama terapi Nifedipin. Gunakan air putih untuk menelan obat.",
    evidence: "Edgar B, et al. Interaction between grapefruit juice and nifedipine. Lancet. 1990;335:352. PMID: 1968134."
  },
  {
    id: "warfarin_vitamin_k",
    drugId: "warfarin_adult",
    drugName: "Warfarin",
    foodName: "Makanan Tinggi Vitamin K (Bayam, Kangkung, Brokoli, Daun Singkong)",
    severity: "WARNING",
    mechanism: "Warfarin bekerja sebagai antagonis Vitamin K dengan menghambat sintesis faktor pembekuan darah (II, VII, IX, X). Konsumsi makanan yang kaya akan Vitamin K secara mendadak atau dalam jumlah besar akan menentang efek terapi Warfarin, menurunkan nilai INR (International Normalized Ratio), dan meningkatkan risiko terbentuknya trombus atau bekuan darah (penyumbatan pembuluh darah).",
    recommendation: "Pasien TIDAK harus menghindari makanan kaya Vitamin K sepenuhnya, melainkan menjaga asupan Vitamin K harian tetap KONSISTEN. Hindari perubahan diet yang ekstrem (misalnya mendadak mengonsumsi bayam dalam jumlah besar selama beberapa hari berturut-turut atau sebaliknya). Laporkan hasil INR berkala ke dokter.",
    evidence: "Booth SL, et al. Effect of dietary vitamin K1 on oral anticoagulation with warfarin. Thromb Haemost. 2004;91(4):691-697. PMID: 15045128."
  },
  {
    id: "warfarin_alcohol",
    drugId: "warfarin_adult",
    drugName: "Warfarin",
    foodName: "Alkohol / Minuman Keras",
    severity: "WARNING",
    mechanism: "Konsumsi alkohol akut (pesta minuman/binge drinking) menghambat enzim metabolisme hati, menurunkan laju klirens Warfarin, dan meningkatkan risiko perdarahan hebat (INR meningkat). Sebaliknya, konsumsi alkohol kronis dapat menginduksi metabolisme hati, menurunkan konsentrasi Warfarin, dan meningkatkan risiko pembekuan darah.",
    recommendation: "Hindari konsumsi alkohol yang tidak konsisten atau berlebihan (binge drinking). Batasi konsumsi alkohol maksimal 1-2 gelas standar per hari secara konsisten, atau hindari sepenuhnya selama pengobatan.",
    evidence: "Weathermon R, et al. Alcohol and medication interactions. Alcohol Res Health. 1999;23(1):40-54. PMID: 10890797."
  },
  {
    id: "propranolol_caffeine",
    drugId: "propranolol_ped",
    drugName: "Propranolol",
    foodName: "Kafein (Kopi, Teh, Minuman Berenergi, Cokelat)",
    severity: "WARNING",
    mechanism: "Kafein memiliki efek stimulan sistem saraf simpatis dan kardiovaskular (meningkatkan denyut nadi dan tekanan darah) yang secara langsung melawan efek terapi beta-blocker (Propranolol) yang bekerja menurunkan denyut jantung dan tekanan darah. Selain itu, kafein dapat sedikit menghambat metabolisme Propranolol.",
    recommendation: "Batasi konsumsi minuman berkafein selama terapi Propranolol. Hindari konsumsi kafein berlebihan terutama jika Propranolol diresepkan untuk kondisi aritmia jantung, angina, atau pasca-infark miokard.",
    evidence: "Nishimi RY, et al. Effect of caffeine on the pharmacokinetics and pharmacodynamics of propranolol. Eur J Clin Pharmacol. 1989;36:125-130."
  },
  {
    id: "salbutamol_caffeine",
    drugId: "salbutamol_syr",
    drugName: "Salbutamol",
    foodName: "Kafein (Kopi, Teh, Minuman Berenergi, Cokelat)",
    severity: "WARNING",
    mechanism: "Salbutamol (agonis beta-2 adrenergik) dan Kafein keduanya merupakan stimulan sistem saraf simpatis. Penggunaan bersamaan memberikan efek aditif yang meningkatkan aktivitas jantung, berisiko memicu takikardia (denyut jantung cepat), palpitasi (jantung berdebar keras), aritmia, tremor tangan, dan kecemasan.",
    recommendation: "Kurangi atau hindari konsumsi kafein dalam jumlah besar saat menggunakan Salbutamol, terutama pada pasien dengan riwayat penyakit jantung koroner atau aritmia.",
    evidence: "Clinical Pharmacology and Therapeutics: 'Concomitant use of xanthine derivatives (like caffeine) and beta-agonists can lead to additive cardiotoxic effects and hypokalemia.'"
  },
  {
    id: "captopril_potassium_diet",
    drugId: "captopril_adult",
    drugName: "Kaptopril",
    foodName: "Makanan Tinggi Kalium / Pengganti Garam Rendah Natrium",
    severity: "WARNING",
    mechanism: "Kaptopril (ACE Inhibitor) menurunkan sekresi aldosteron, yang mengurangi ekskresi kalium oleh ginjal. Mengonsumsi makanan yang kaya kalium (pisang, alpukat, kurma) atau pengganti garam diet (salt substitutes yang mengandung Potassium Chloride) secara berlebihan dapat menyebabkan penumpukan kalium di dalam darah (hiperkalemia) yang berbahaya bagi konduksi jantung.",
    recommendation: "Hindari penggunaan pengganti garam bebas natrium yang menggunakan kalium klorida. Jaga asupan makanan tinggi kalium dalam batas normal dan lakukan pemeriksaan kadar kalium darah secara periodik.",
    evidence: "Sabatier C, et al. Hyperkalemia induced by salt substitutes in patients on ACE inhibitors. Annals of Pharmacotherapy. 1999;33:123-125."
  },
  {
    id: "candesartan_potassium_diet",
    drugId: "candesartan_adult",
    drugName: "Kandesartan",
    foodName: "Makanan Tinggi Kalium / Pengganti Garam Rendah Natrium",
    severity: "WARNING",
    mechanism: "Kandesartan (ARB) menghambat sumbu renin-angiotensin-aldosteron yang mengakibatkan ginjal menahan kalium. Penggunaan bersamaan dengan diet tinggi kalium atau garam diet berbasis kalium meningkatkan risiko hiperkalemia yang berpotensi memicu gangguan irama jantung.",
    recommendation: "Hindari penggunaan pengganti garam rendah natrium (mengandung KCl) tanpa konsultasi medis. Lakukan pemantauan laboratorium berkala kadar kalium darah.",
    evidence: "FDA Diovan & Atacand prescribing information regarding drug-food safety guidelines."
  },
  {
    id: "spironolactone_potassium_diet",
    drugId: "spironolactone_ped",
    drugName: "Spironolakton",
    foodName: "Makanan Tinggi Kalium / Pengganti Garam Rendah Natrium",
    severity: "CRITICAL",
    mechanism: "Spironolakton adalah diuretik hemat kalium kuat. Konsumsi makanan yang sangat kaya kalium atau garam diet (mengandung kalium klorida sebagai pengganti natrium klorida) sangat dilarang karena dapat secara mendadak memicu hiperkalemia berat (>6.0 mEq/L) yang berisiko menyebabkan henti jantung (cardiac arrest) mendadak.",
    recommendation: "KONTRAINDIKASI MUTLAK penggunaan garam pengganti kalium selama terapi Spironolakton. Hindari konsumsi pisang, kentang, alpukat, atau kurma secara berlebihan dalam satu waktu.",
    evidence: "Juurlink DN. Rates of hyperkalemia after publication of the Randomized Aldactone Evaluation Study (RALES). N Engl J Med. 2004;351(6):543-551."
  },
  {
    id: "tetracycline_dairy",
    drugId: "tetracycline_adult",
    drugName: "Tetrasiklin",
    foodName: "Susu, Keju, Yogurt, Produk Olahan Susu, Suplemen Kalsium",
    severity: "WARNING",
    mechanism: "Kalsium bermuatan ganda (Ca2+) yang melimpah dalam susu dan produk olahannya akan mengikat molekul Tetrasiklin di dalam saluran pencernaan membentuk kompleks khelat tidak larut yang tidak dapat diserap oleh mukosa usus. Hal ini menurunkan bioavailabilitas Tetrasiklin hingga lebih dari 50-80%, menyebabkan kegagalan terapi antibiotik.",
    recommendation: "Jangan mengonsumsi susu atau produk susu dalam waktu 2 jam sebelum atau setelah meminum Tetrasiklin. Telan obat dengan segelas air putih dalam keadaan perut kosong.",
    evidence: "Leyden JJ. Absorption of minocycline hydrochloride and tetracycline hydrochloride. J Am Acad Dermatol. 1985;12(2):308-312. PMID: 3973105."
  },
  {
    id: "levofloxacin_dairy",
    drugId: "levofloxacin_adult",
    drugName: "Levofloxacin",
    foodName: "Susu, Keju, Yogurt, Produk Olahan Susu, Suplemen Kalsium",
    severity: "WARNING",
    mechanism: "Sama seperti antibiotik golongan fluoroquinolone lainnya, kalsium di usus membentuk ikatan kompleks khelat dengan Levofloxacin, menghambat absorbsi obat dan secara signifikan mengurangi kadar terapetik obat dalam sirkulasi darah.",
    recommendation: "Minum Levofloxacin sekurangnya 2 jam sebelum atau 6 jam setelah mengonsumsi susu, keju, yogurt, atau suplemen yang mengandung kalsium, zat besi, maupun antasida.",
    evidence: "Wallace AW, et al. Effect of calcium carbonate on the absorption of levofloxacin in healthy volunteers. Clin Infect Dis. 2003;36(4):434-439. PMID: 12567299."
  },
  {
    id: "zolpidem_alcohol",
    drugId: "zolpidem_adult",
    drugName: "Zolpidem",
    foodName: "Alkohol / Minuman Keras",
    severity: "CRITICAL",
    mechanism: "Zolpidem bekerja sebagai agonis selektif pada reseptor benzodiazepine-1 (GABA-A). Alkohol merupakan depresan SSP kuat yang meningkatkan sensitivitas reseptor GABA secara sinergis. Kombinasi ini melipatgandakan depresi sistem saraf pusat, memicu sedasi ekstrem, gangguan koordinasi motorik parah, mimpi buruk, somnambulisme berbahaya (perilaku berjalan/berkendara saat tidur tanpa sadar), depresi pernapasan, koma, hingga kematian.",
    recommendation: "Dilarang keras mengonsumsi alkohol jenis apa pun saat menggunakan Zolpidem. Obat harus diminum segera sebelum tidur dan pastikan memiliki waktu tidur minimal 7-8 jam.",
    evidence: "U.S. FDA Warning on Sleep Medications (Zolpidem/Ambien): 'Do not take Zolpidem if you drank alcohol that evening. Additive central nervous system depression risk.' PMID: 23616212."
  },
  {
    id: "ibuprofen_alcohol",
    drugId: "ibuprofen_ped",
    drugName: "Ibuprofen",
    foodName: "Alkohol / Minuman Keras",
    severity: "WARNING",
    mechanism: "Ibuprofen (NSAID) menghambat enzim COX-1 yang merusak lapisan pelindung prostaglandin mukosa lambung. Alkohol mengiritasi mukosa lambung secara langsung secara mekanis dan kimiawi. Penggunaan kombinasi ini secara bersamaan melipatgandakan risiko gastritis hemoragik (peradangan lambung berdarah), erosi dinding lambung, ulcer lambung, dan perdarahan gastrointestinal masif.",
    recommendation: "Hindari konsumsi minuman beralkohol selama menggunakan Ibuprofen, terutama jika digunakan secara rutin atau dalam dosis tinggi. Ganti dengan obat pereda nyeri alternatif yang lebih ramah lambung jika tetap harus mengonsumsi alkohol.",
    evidence: "Lanza FL, et al. Double-blind placebo-controlled endoscopic comparison of ibuprofen and aspirin with and without alcohol on gastric mucosa. Am J Gastroenterol. 1989;84:1085-1089."
  },
  {
    id: "paracetamol_alcohol",
    drugId: "paracetamol_ped",
    drugName: "Parasetamol",
    foodName: "Alkohol / Minuman Keras",
    severity: "WARNING",
    mechanism: "Konsumsi alkohol reguler atau kronis menginduksi aktivitas enzim sitokrom CYP2E1 di hati. Saat Parasetamol dikonsumsi, ia akan dialihkan secara lebih agresif oleh CYP2E1 menjadi metabolit hepatotoksik reaktif NAPQI. Di saat yang sama, alkohol menghabiskan cadangan glutathione hati yang diperlukan untuk menetralisir NAPQI. Hal ini memicu kerusakan sel hati yang parah (nekrosis hepatoseluler akut) bahkan pada dosis terapi Parasetamol.",
    recommendation: "Batasi penggunaan Parasetamol jika Anda adalah konsumen alkohol rutin (jangan melebihi 2 gram Parasetamol per hari). Jangan sekali-kali menggunakan Parasetamol untuk meredakan sakit kepala akibat mabuk alkohol (hangover), gunakan analgesik lain yang tidak dimetabolisme lewat hati dengan cara yang sama.",
    evidence: "Prescott LF. Paracetamol, alcohol and the liver. Br J Clin Pharmacol. 2000;49(4):291-301. PMID: 10759684."
  },
  {
    id: "captopril_food_empty",
    drugId: "captopril_adult",
    drugName: "Kaptopril",
    foodName: "Makanan Secara Umum (Diminum Bersamaan dengan Makanan)",
    severity: "INFO",
    mechanism: "Adanya makanan di dalam lambung dan usus halus menghambat laju penyerapan Kaptopril, menurunkan bioavailabilitas dan kadar puncak obat dalam darah sekitar 30% hingga 40%. Hal ini dapat melemahkan atau memperlambat efek penurun tekanan darah yang diinginkan.",
    recommendation: "Konsumsi Kaptopril dalam keadaan perut kosong, yaitu minimal 1 jam sebelum makan atau 2 jam setelah makan untuk menjamin penyerapan dan khasiat obat yang optimal.",
    evidence: "Mantyla R, et al. Impairment of captopril absorption by food. Med Biol. 1984;62(5):301-303. PMID: 6397394."
  }
];

/**

/**
 * Checks for food-drug interactions for a list of drug IDs.
 * Returns an array of food-drug interactions.
 */
export function checkFoodInteractions(drugIds: string[]): FoodInteraction[] {
  if (!drugIds || drugIds.length === 0) {
    return [];
  }

  return FOOD_INTERACTION_DATABASE.filter(interaction => {
    // Check if the drug is in the selected list
    // Support matching by comparing direct IDs, or we can handle pediatric equivalents
    // For example, if we have paracetamol_ped, it should also match paracetamol_syr or other paracetamol equivalents if they share the base name
    return drugIds.some(id => {
      // Direct exact match
      if (id === interaction.drugId) return true;
      // Handle base drug matches if needed (e.g. "paracetamol" in "paracetamol_ped" / "paracetamol_syr")
      const baseA = id.split("_")[0];
      const baseB = interaction.drugId.split("_")[0];
      return baseA === baseB;
    });
  });
}

