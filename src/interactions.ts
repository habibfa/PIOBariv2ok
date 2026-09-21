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

import { EXTENDED_INTERACTIONS_FOR_PRESETS, EXTENDED_FOOD_INTERACTIONS } from "./interactions_presets_extended";

const BASE_INTERACTION_DATABASE: DrugInteraction[] = [
  {
      "id": "amox_doxy",
      "drugAId": "amoxicillin_ped",
      "drugBId": "auto_doxycycline",
      "drugAName": "Amoxicillin",
      "drugBName": "doxycycline",
      "severity": "WARNING",
      "mechanism": "Sebaiknya dihindari: Tetrasiklin dapat mengurangi efek penisilin dengan cara menghambat sintesis protein seluler, yang merupakan proses yang diperlukan agar penisilin dapat menghambat sintesis dinding sel. Efek antagonisme lebih mungkin terjadi jika salah satu atau kedua obat tersebut diberikan dalam dosis rendah. Hal ini dapat menyebabkan kegagalan terapi.",
      "recommendation": "Kombinasi ini sebaiknya dihindari jika memungkinkan.",
      "evidence": "1. Gunnison JB, Coleman VR, Jawetz E (1950) \"Interference of aureomycin and of terramycin with action of penicillin in vitro.\" Proc Soc Exp Biol Med, 75, p. 549-52\n2. Lepper MH, Dowling HF (1951) \"Treatment of pneumococcic meningitis with penicillin compared with penicillin plus aureomycin.\" Arch Intern Med, 88, p. 489-94\n3. Jawetz E (1975) \"Synergism and antagonism among antimicrobial drugs: a personal perspective.\" West J Med, 123, p. 87-91\n4. Olsson RA, Kirby JC, Romansky MJ (1961) \"Pneumococcal meningitis in the adult.\" Ann Intern Med, 55, p. 545-9\n5. (2001) \"Product Information. Declomycin (demeclocycline).\" Lederle Laboratories\n6. (2018) \"Product Information. Seysara (sarecycline).\" Allergan Inc"
  },
  {
      "id": "amox_allopurinol",
      "drugAId": "amoxicillin_ped",
      "drugBId": "auto_allopurinol",
      "drugAName": "Amoxicillin",
      "drugBName": "Allopurinol",
      "severity": "WARNING",
      "mechanism": "Pemberian allopurinol secara bersamaan dengan ampicillin atau amoxicillin dapat meningkatkan risiko timbulnya ruam kulit dan hipersensitivitas. Mekanisme interaksi ini belum diketahui, dan tidak jelas apakah kondisi hiperurisemia atau paparan langsung terhadap allopurinol yang menjadi penyebabnya. Dalam sebuah studi retrospektif, 15 dari 67 pasien (22%) yang mengonsumsi ampicillin bersama allopurinol mengalami ruam kulit, dibandingkan dengan 94 dari 1.257 pasien (7,5%) yang mengonsumsi ampicillin tanpa allopurinol. Studi lanjutan oleh kelompok peneliti yang sama melibatkan 252 pasien yang mengonsumsi ampicillin bersama allopurinol dan 4.434 pasien yang mengonsumsi ampicillin saja. Angka kejadian ruam adalah 13,9% pada kelompok allopurinol dan 5,7% pada kelompok yang hanya mengonsumsi ampicillin. Hasil serupa dilaporkan untuk amoxicillin. Secara khusus, 8 dari 36 pasien (22%) yang mendapat terapi bersamaan dengan allopurinol mengalami ruam, dibandingkan dengan 52 dari 887 pasien (5,9%) yang menggunakan amoxicillin tanpa allopurinol.",
      "recommendation": "Pemantauan lebih ketat terhadap timbulnya ruam kulit disarankan jika ampisilin atau amoksisilin digunakan bersamaan dengan alopurinol. Beberapa pihak menyarankan penggunaan alternatif selain ampisilin atau amoksisilin pada pasien yang menerima alopurinol, jika memungkinkan. Pasien harus diimbau untuk segera melaporkan setiap tanda hipersensitivitas kulit, termasuk ruam, pruritus, demam, atau menggigil.",
      "evidence": "1. Singer JZ, Wallace SL (1986) \"The allopurinol hypersensitivity syndrome.\" Arthritis Rheum, 29, p. 82-7\n2. Boston Collaborative Drug Surveillance Program (1972) \"Excess of ampicillin rashes associated with allopurinol or hyperuricemia.\" N Engl J Med, 286, p. 505-7\n3. (2022) \"Product Information. Zyloprim (allopurinol).\" Glaxo Wellcome\n4. Jick H, Porter JB (1981) \"Potentiation of ampicillin skin reactions by allopurinol or hyperuricemia.\" J Clin Pharmacol, 21, p. 456-8\n5. (2024) \"Product Information. Allopurinol (Sandoz) (allopurinol).\" Sandoz Pty Ltd\n6. (2021) \"Product Information. Zyloric (allopurinol).\" Aspen Pharma Trading Ltd\n7. (2021) \"Product Information. Zyloprim (allopurinol).\" AA Pharma Inc, 248178\n8. (2024) \"Product Information. Allopurinol (allopurinol).\" Actavis U.S. (Purepac Pharmaceutical Company)"
  },
  {
      "id": "amox_amikacin",
      "drugAId": "amoxicillin_ped",
      "drugBId": "auto_amikacin",
      "drugAName": "Amoxicillin",
      "drugBName": "Amikacin",
      "severity": "WARNING",
      "mechanism": "Pemberian bersama antibiotik golongan beta-laktam (misalnya, penisilin) ??dengan aminoglikosida dapat menyebabkan inaktivasi timbal balik, terutama saat diberikan secara bersamaan melalui jalur intravena (IV). Mekanisme yang diduga mendasari inaktivasi ini melibatkan pembukaan cincin beta-laktam, yang memungkinkan beta-laktam dan gugus amino dari aminoglikosida membentuk senyawa amida yang secara biologis tidak aktif. Data *in vitro* dan data *in vivo* yang terbatas menunjukkan bahwa inaktivasi dapat terjadi jika obat diberikan melalui jalur yang sama, baik secara bersamaan maupun dalam selang waktu yang singkat. Sebagai contoh, ketika tobramisin (diberikan secara IV selama 3 5 menit) segera diikuti oleh tikarsilin (infus IV selama 20 30 menit) pada pasien fibrosis kistik yang sehat dengan fungsi ginjal normal (n=18), konsentrasi tobramisin dalam serum menurun sebesar 11%. Namun, para penulis menyimpulkan bahwa hal ini memiliki signifikansi klinis yang kecil. Secara *in vivo*, inaktivasi aminoglikosida terbukti memiliki signifikansi klinis hanya pada pasien dengan gangguan ginjal berat, karena mereka mempertahankan kadar beta-laktam yang lebih tinggi dalam jangka waktu yang lebih lama. Bukti pendukung lainnya sebagian besar terbatas pada studi kompatibilitas *in vitro* dan pemberian bersama secara IV; data mengenai penggunaan melalui jalur yang sama (misalnya, oral) selain intravena belum tersedia. Risiko ini juga bervariasi tergantung pada agen spesifik yang digunakan dan/atau interval waktu antar-pemberian. Inaktivasi ini diperkirakan lebih berdampak pada aminoglikosida dibandingkan beta-laktam dan tidak teramati memiliki signifikansi klinis pada pasien dengan fungsi ginjal normal, atau ketika agen diberikan melalui jalur yang berbeda (misalnya, IV, oral, inhalasi). Akan tetapi, data yang ada saling bertentangan, terbatas pada studi berskala kecil, dan belum tersedia untuk semua kombinasi aminoglikosida dan beta-laktam.",
      "recommendation": "Jika pemberian bersamaan aminoglikosida dan antibiotik beta-laktam secara intravena diperlukan, disarankan untuk memberikan kedua obat tersebut secara terpisah, terutama pada pasien dengan gangguan fungsi ginjal. Meskipun belum ada konsensus mengenai jeda waktu yang tepat, beberapa produsen merekomendasikan pemberian obat-obat tersebut dengan selang waktu beberapa jam. Selain itu, jika obat-obat tersebut diberikan dalam waktu yang terlalu berdekatan, hasil pengukuran kadar aminoglikosida bisa menjadi tidak akurat karena inaktivasi oleh beta-laktam dapat terjadi pada spesimen yang diambil untuk pemeriksaan. Fungsi ginjal dan kadar aminoglikosida juga harus dipantau secara lebih ketat, khususnya pada pasien lanjut usia atau pasien yang telah memiliki gangguan fungsi ginjal sebelumnya. Walaupun penyesuaian interval dosis mungkin tidak diperlukan jika beta-laktam dan aminoglikosida diberikan melalui jalur pemberian yang berbeda, pemantauan yang lebih ketat tetap perlu dipertimbangkan mengingat adanya potensi absorpsi sistemik. Panduan lebih lanjut dapat merujuk pada informasi produk masing-masing untuk aminoglikosida dan beta-laktam tersebut.",
      "evidence": "1. (2024) \"Product Information. Amikacin Sulfate (amikacin).\" Hikma USA (formerly West-Ward Pharmaceutical Corporation)\n2. (2023) \"Product Information. Amikacin (SXP) (amikacin).\" Southern Cross Pharma Pty Ltd\n3. (2025) \"Product Information. Tobramycin (tobramycin).\" Northstar Rx LLC\n4. (2023) \"Product Information. Gentamicin Sulfate, Injectable (gentamicin).\" Fresenius Kabi USA, LLC, v2\n5. roberts gw, Nation RL, Jarvinen AO, Martin AJ (2025) An in vivo assessment of the tobramycin/ticarcillin interaction in cystic fibrosis patients. https://pmc.ncbi.nlm.nih.gov/articles/PMC1364694/#:~:text=Abstract,exclude%20concurrent%20use%20of%20ticarcillin\n6. Wallace SM, chan ly (2025) In vitro interaction of aminoglycosides with beta-lactam penicillins https://pmc.ncbi.nlm.nih.gov/articles/instance/180231/pdf/aac00174-0122.pdf\n7. Farchione LA (2025) Inactivation of Aminoglycosides by Penicillin https://academic.oup.com/jac/article-abstract/8/suppl_A/27/670965"
  },
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
    id: "warfarin_ciprofloxacin",
    drugAId: "warfarin_adult",
    drugBId: "ciprofloxacin",
    drugAName: "Warfarin",
    drugBName: "Ciprofloxacin",
    severity: "CRITICAL",
    mechanism: "Ciprofloxacin (antibiotik golongan fluoroquinolone) meningkatkan efek antikoagulan warfarin melalui dua mekanisme utama:\n\n1. Inhibisi Enzim: Ciprofloxacin menghambat enzim sitokrom P450 (terutama CYP1A2 dan CYP3A4), sehingga memperlambat metabolisme dan eliminasi warfarin dari dalam tubuh.\n2. Gangguan Flora Usus: Ciprofloxacin mengeliminasi bakteri usus yang memproduksi Vitamin K, sehingga menurunkan sintesis faktor pembekuan darah yang bergantung pada Vitamin K.\n\nEfek Klinis: Peningkatan nilai International Normalized Ratio (INR) secara signifikan, yang meningkatkan risiko perdarahan hebat (seperti perdarahan gastrointestinal atau intrakranial).",
    recommendation: "1. Pemantauan INR: Lakukan pemeriksaan INR dalam 2–3 hari setelah memulai terapi ciprofloxacin, dan pantau secara berkala selama serta setelah terapi antibiotik selesai.\n2. Penyesuaian Dosis: Bersiaplah untuk menurunkan dosis warfarin (umumnya sebesar 10% hingga 20%) berdasarkan hasil pemantauan INR.\n3. Edukasi Pasien: Edukasi pasien untuk segera mencari bantuan medis jika mengalami tanda-tanda perdarahan (misalnya: mimisan, gusi berdarah, memar tanpa sebab, urin berwarna merah/gelap, atau feses berwarna hitam).\n4. Alternatif Terapi: Jika memungkinkan, pertimbangkan penggunaan antibiotik alternatif yang tidak berinteraksi dengan warfarin.",
    evidence: "FDA Prescribing Information for Cipro (ciprofloxacin) & Coumadin (warfarin); Stockley's Drug Interactions (12th Edition): 'Ciprofloxacin increases hypoprothrombinemic effect of warfarin via CYP450 inhibition and gut flora suppression.' Ellis RJ, et al. Interaction of warfarin and ciprofloxacin. Clin Pharm. 1993;12(10):764-768. PMID: 8258288."
  },
  {
    id: "warfarin_paracetamol",
    drugAId: "warfarin_adult",
    drugBId: "paracetamol_ped",
    drugAName: "Warfarin",
    drugBName: "Parasetamol",
    severity: "WARNING",
    mechanism: "Penggunaan Parasetamol dosis reguler/tinggi (>1.5 - 2 gram/hari selama >3 hari berturut-turut) dapat menghambat metabolisme Warfarin serta mengganggu karboksilasi faktor pembekuan darah vitamin K-dependen oleh metabolit NAPQI, sehingga meningkatkan nilai INR dan risiko perdarahan.",
    recommendation: "Pasien dengan terapi Warfarin stabil yang memerlukan antipiretik/analgesik dapat menggunakan Parasetamol dosis rendah (<1.5 g/hari) untuk jangka pendek. Jika diperlukan penggunaan jangka panjang, jadwalkan pemantauan INR lebih ketat.",
    evidence: "Lopes RD, et al. Association between acetaminophen and warfarin: a systematic review. Thromb Haemost. 2011;105(4):618-629. Mahé I, et al. Interaction between paracetamol and warfarin in patients: a double-blind, randomized, placebo-controlled trial. Haematologica. 2006;91(12):1621-1627."
  },
  {
    id: "ciprofloxacin_sucralfate",
    drugAId: "ciprofloxacin",
    drugBId: "sucralfate_syr",
    drugAName: "Ciprofloxacin",
    drugBName: "Sukralfat",
    severity: "CRITICAL",
    mechanism: "Aluminium hidroksida yang terkandung dalam Sukralfat membentuk kompleks kelat insoluble (kelasi kation polivalen) dengan fluorokuinolon (Ciprofloxacin) di saluran cerna. Hal ini menurunkan bioavailabilitas dan absorpsi Ciprofloxacin oral secara drastis hingga >85%, berisiko tinggi kegagalan terapi infeksi bakteri.",
    recommendation: "Hindari pemberian bersamaan secara simultan. Berikan Ciprofloxacin minimal 2 jam sebelum atau 6 jam setelah konsumsi Sukralfat, atau pertimbangkan antibiotik parenteral / alternatif antasida pelindung mukosa.",
    evidence: "Garrelts JC, et al. Sucralfate significantly reduces ciprofloxacin bioavailability. Antimicrob Agents Chemother. 1990;34(5):931-933. FDA Cipro label: 'Concurrent administration of ciprofloxacin with sucralfate causes marked reduction in oral bioavailability.'"
  },
  {
    id: "methotrexate_ibuprofen",
    drugAId: "auto_rheu_trex",
    drugBId: "ibuprofen_ped",
    drugAName: "Metotreksat (Rheu-Trex)",
    drugBName: "Ibuprofen",
    severity: "CRITICAL",
    mechanism: "NSAID (Ibuprofen) menghambat sintesis prostaglandin renal sehingga menurunkan aliran darah ginjal, serta bersaing pada sekresi tubulus ginjal untuk ekskresi Metotreksat. Hal ini meningkatkan kadar serum dan akumulasi toksik Metotreksat, memicu supresi sumsum tulang berat (pansitopenia) dan toksisitas gastrointestinal fatal.",
    recommendation: "Kombinasi dengan Metotreksat dosis sedang-tinggi dikontraindikasikan. Pada Metotreksat dosis rendah untuk reumatoid artritis, gunakan dengan kehati-hatian ekstrem dan pemantauan hitung darah lengkap (CBC) serta fungsi ginjal secara berkala.",
    evidence: "U.S. FDA Boxed Warning for Methotrexate: 'NSAIDs should not be administered prior to or concomitantly with high doses of methotrexate. Concomitant administration of some NSAIDs with methotrexate resulted in severe bone marrow suppression and gastrointestinal toxicity.'"
  },
  {
    id: "digoxin_amiodarone",
    drugAId: "digoxin",
    drugBId: "auto_tiaryt",
    drugAName: "Digoksin",
    drugBName: "Amiodaron (Tiaryt)",
    severity: "CRITICAL",
    mechanism: "Amiodaron menghambat transporter membran P-glikoprotein (P-gp) di tubulus ginjal dan saluran cerna yang bertanggung jawab untuk eliminasi Digoksin. Akibatnya, kadar plasma serum Digoksin meningkat rata-rata 70% hingga 100%, secara masif meningkatkan risiko toksisitas fatal digoksin (aritmia ventrikel lethal, blok AV total, bradikardia berat).",
    recommendation: "Ketika memulai terapi Amiodaron pada pasien yang telah mengonsumsi Digoksin, dosis harian Digoksin HARUS segera diturunkan sebesar 30% hingga 50%. Lakukan pemantauan ketat kadar digoksin serum (target rentang terapeutik 0.5-0.9 ng/mL) dan rekaman EKG.",
    evidence: "Moysey JO, et al. Amiodarone-digoxin interaction. Br Med J (Clin Res Ed). 1981;282(6273):1360. Marcus FI. Pharmacokinetic interactions between digoxin and other drugs. J Am Coll Cardiol. 1985;5(5 Suppl A):102A-104A."
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
    drugAId: "digoxin",
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
    drugBId: "bisoprolol",
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
  },
  {
    id: "amox_betiatide",
    drugAId: "amoxicillin_ped",
    drugBId: "betiatide",
    drugAName: "Amoxicillin",
    drugBName: "Betiatide",
    severity: "WARNING",
    mechanism: "Pemberian bersamaan radiofarmaka *technetium* (Tc99m) *mertiatide* dengan obat lain yang juga dieliminasi melalui sekresi tubulus aktif dapat menyebabkan peningkatan konsentrasi plasma salah satu atau kedua obat tersebut. Mekanisme pastinya belum sepenuhnya diketahui, namun kemungkinan melibatkan kompetisi dalam pengikatan pada *organic anion transporter 1* (OAT1) di tubulus proksimal ginjal, yang berperan dalam memindahkan obat tertentu dari darah ke dalam urine. Risiko dan signifikansi interaksi ini dapat bervariasi. Beberapa sumber menyatakan bahwa risiko ini diperkirakan terjadi pada penggunaan diuretik seperti hidroklorotiazid, namun hanya bersifat teoretis pada obat lain (misalnya, obat antiinflamasi nonsteroid/OAINS). Ekskresi Tc99m *mertiatide* yang tertunda dapat memengaruhi efikasi prosedur diagnostik. Akan tetapi, data klinis mengenai hal ini masih terbatas. Sebuah studi *crossover* yang melibatkan 12 sukarelawan pria sehat (usia 22-25 tahun) meninjau perbedaan hasil pemindaian menggunakan injeksi Tc99m *mertiatide* saja dibandingkan dengan hasil yang diperoleh saat subjek menerima substrat OAT1 selektif (natrium *p-aminohippurate* [PAH] 10% yang diberikan melalui infus intravena dengan kecepatan 120 mg/menit, mulai 10 menit sebelum hingga selama pemindaian) atau inhibitor OAT1 yang poten (probenesid 750 mg, 1 jam sebelum pemindaian). PAH tampak memberikan dampak yang lebih besar dibandingkan probenesid, yaitu memperpanjang waktu paruh klirens plasma Tc99m *mertiatide* pada fase lanjut (30-60 menit setelah injeksi radiofarmaka) dari sekitar 27,7 menit menjadi 54,9 menit. Meskipun demikian, dalam situasi tertentu, pemberian OAINS atau obat lain yang memengaruhi sekresi Tc99m *mertiatide* mungkin diindikasikan secara klinis. Sebagai contoh, terdapat beberapa protokol yang menggunakan aspirin untuk meningkatkan kualitas renografi Tc99m *mertiatide* dalam pemeriksaan atau diagnosis stenosis arteri renalis.",
    recommendation: "Diperlukan kehati-hatian saat memberikan technetium (Tc99m) mertiatide secara bersamaan dengan obat-obatan yang disekresikan di tubulus proksimal, karena adanya potensi pengaruh terhadap efikasi prosedur diagnostik. Selain itu, mengingat Tc99m mertiatide dapat memperlambat ekskresi obat lain yang dieliminasi melalui jalur ini, pemantauan terhadap kemungkinan timbulnya efek farmakologis berlebihan dari kedua obat tersebut perlu dipertimbangkan. Pedoman klinis terkini dan/atau informasi pada label produk dari produsen sebaiknya dirujuk untuk memperoleh informasi serta panduan yang lebih spesifik. Kondisi dehidrasi dan asidosis juga dapat memengaruhi fungsi ginjal dan memperpanjang waktu eliminasi obat oleh ginjal. Silakan merujuk pada label produk atau protokol setempat untuk panduan mengenai hidrasi pasien sebelum menjalani pemeriksaan dengan Tc99m mertiatide.",
    evidence: "(2019) \"Product Information. IELMAG3 (mertiatide).\" Xiel Ltd\nTakahara N, Saga T, Inubushi M, et al. (2013) \"Drugs interacting with OAT-1 affect uptake of Tc-99m-mercaptoacetyl-triglycine (MAG3) in the human kidney: Therapeutic drug interaction in Tc-99m-MAG3 diagnosis of renal function and possible application of Tc-99m-MAG3 for drug development\" Nucl Med Biol, 40, p. 643-50\nvan de Ven PJ, de Klerk JM, Mertens IJ, et al. (2000) \"Aspirin renography and captopril renography in the diagnosis of renal artery stenosis.\" J Nucl Med, 41, p. 1337-42\nMustafa S, Elgazzar AH (2013) \"Effect of the NSAID diclofenac on 99mTc-MAG3 and 99mTc-DTPA renography.\" J Nucl Med, 54, p. 801-6\nMandikova J, Volkova M, Pavek P, et al. (2023) Entecavir interacts with influx transporters hOAT1, hCNT2, hCNT3, but not with hOCT2: the potential for renal transporter-mediated cytotoxicity and drug-drug interactions. https://www.frontiersin.org/articles/10.3389/fphar.2015.00304/full"
  },
  {
    id: "amox_balsalazide",
    drugAId: "amoxicillin_ped",
    drugBId: "balsalazide",
    drugAName: "Amoxicillin",
    drugBName: "Balsalazide ",
    severity: "WARNING",
    mechanism: "Efektivitas balsalazide dapat berkurang jika diberikan bersamaan dengan antibiotik tertentu. Di saluran pencernaan bagian bawah, balsalazide mengalami proses azoreduksi oleh bakteri yang menghasilkan mesalamine, yaitu zat aktif yang memberikan efek terapeutik. Meskipun belum ada penelitian yang dilakukan, terdapat teori bahwa antibiotik oral dapat mengganggu proses reduksi menjadi mesalamine tersebut.",
    recommendation: "Jika pasien harus menerima antibiotik oral, perlu dipertimbangkan penggunaan 5-aminosalisilat lain seperti mesalamin.",
    evidence: "(2020) \"Product Information. Colazide (balsalazide).\" Fresenius Kabi Australia Pty Limited"
  },
  {
    id: "amox_cemi",
    drugAId: "amoxicillin_ped",
    drugBId: "cemiplimab",
    drugAName: "Amoxicillin",
    drugBName: "Cemiplimab",
    severity: "WARNING",
    mechanism: "Penggunaan antibiotik sistemik selama atau di dekat masa terapi dengan penghambat pos pemeriksaan imun (*immune checkpoint inhibitors* atau ICI) seperti antibodi monoklonal anti-CTLA-4 (*cytotoxic T-lymphocyte-associated protein-4*) dan/atau penghambat PD-1 (*programmed cell death-1*)/PD-L1 (*programmed death ligand-1*) dapat menyebabkan penurunan efikasi klinis ICI tersebut. Mekanisme pasti interaksi ini belum sepenuhnya dipahami, namun kemungkinan berkaitan dengan perubahan mikrobiota usus akibat antibiotik sistemik, yang berpotensi menyebabkan disregulasi imun dan penurunan respons terhadap ICI. Sebuah meta-analisis terhadap 6 studi yang melibatkan penggunaan nivolumab untuk pengobatan kanker paru bukan sel kecil (*non-small cell lung cancer* atau NSCLC) stadium lanjut atau metastatik menemukan bahwa median *progression-free survival* (PFS) dan *overall survival* (OS) masing-masing berkurang sebesar 1,6 bulan dan 8,8 bulan pada pasien yang terpapar antibiotik sistemik sebelum, selama, atau setelah terapi nivolumab. Demikian pula, sebuah tinjauan retrospektif di satu pusat layanan kesehatan terhadap pasien (n=291) dengan kanker stadium lanjut (melanoma, NSCLC, atau karsinoma sel ginjal) yang diobati dengan ICI juga menunjukkan hasil klinis yang lebih buruk terkait dengan penggunaan antibiotik sistemik. Studi ini membagi pasien ke dalam 3 kelompok: tanpa antibiotik, satu rangkaian antibiotik, atau rangkaian antibiotik kumulatif (yaitu pemberian antibiotik secara bersamaan atau berturut-turut selama >7 hari) dalam kurun waktu 2 minggu sebelum dan 6 minggu setelah pengobatan ICI. Median PFS (masing-masing 6,3 bulan vs. 3,7 bulan vs. 2,8 bulan) dan median OS (masing-masing 21,7 bulan vs. 17,7 bulan vs. 6,3 bulan) menurun seiring dengan meningkatnya penggunaan antibiotik, meskipun hanya perbedaan antara kelompok tanpa penggunaan antibiotik dan kelompok dengan rangkaian antibiotik kumulatif yang dinilai signifikan secara klinis. Selain itu, analisis retrospektif lain terhadap pasien (n=635) dengan kanker stadium lanjut yang diobati dengan ICI menemukan bahwa penggunaan antibiotik dikaitkan dengan median OS yang jauh lebih singkat (8 bulan vs. 23 bulan), median PFS yang lebih singkat (4 bulan vs. 7 bulan), serta penurunan respons tumor (57% vs. 71%) dibandingkan dengan pasien yang tidak menerima antibiotik. Sebaliknya, sebuah studi retrospektif terhadap pasien (n=302) dengan NSCLC stadium IV yang menjalani terapi kombinasi kemo-imunoterapi lini pertama (yaitu ICI dan kemoterapi sitotoksik) menunjukkan hasil yang serupa dalam hal OS, PFS, dan tingkat respons objektif antara pasien yang menerima antibiotik dan yang tidak menerimanya selama 30 hari sebelum dimulainya terapi ICI. Pemberian antibiotik sistemik secara bersamaan pada populasi pasien ini juga tidak dikaitkan dengan perubahan pada OS maupun PFS.",
    recommendation: "Sampai tersedia informasi lebih lanjut, disarankan untuk berhati-hati dan melakukan pemantauan klinis terhadap kemungkinan penurunan efikasi *immune checkpoint inhibitor* (ICI) jika antibiotik sistemik diindikasikan sebelum, bersamaan dengan, atau setelah pemberian ICI. Penggunaan antibiotik harus dibatasi pada indikasi dan durasi yang tepat secara klinis. Dokter disarankan untuk merujuk pada literatur yang relevan, pedoman pengobatan tingkat lokal maupun nasional, serta informasi produk (label kemasan) untuk panduan lebih lanjut.",
    evidence: "Kostine M, Mauric E, Tison A, et al. (2021) \"Baseline co-medications may alter the anti-tumoural effect of checkpoint inhibitors as well as the risk of immune-related adverse events.\" Eur J Cancer, 157, p. 474-84\nHuo GW, Zuo R, Song Y, et al. (2021) \"Effect of antibiotic use on the efficacy of nivolumab in the treatment of advanced/metastatic non-small cell lung cancer: a meta-analysis.\" Open Med (Wars), 16, p. 728-36\nTinsley N, Zhou C, Tan G, et al. (2020) \"Cumulative antibiotic use significantly decreases efficacy of checkpoint inhibitors in patients with advanced cancer.\" Oncologist, 25, p. 55-63\nCortellini A, Ricciuti B, Facchinetti F, et al. (2021) \"Antibiotic-exposed patients with non-small-cell lung cancer preserve efficacy outcomes following first-line chemo-immunotherapy.\" Ann Oncol, 32, p. 1391-9\nHakozaki T, richard c, Elkrief A, et al. (2020) \"The gut microbiome associates with immune checkpoint inhibition outcomes in patients with advanced non-small cell lung cancer.\" Cancer Immunol Res, 8, p. 1243-50\nWu HJ, Wu E (2012) \"The role of gut microbiota in immune homeostasis and autoimmunity.\" Gut Microbes, 3, p. 4-14"
  },
  {
    id: "amox_chloramphenicol",
    drugAId: "amoxicillin_ped",
    drugBId: "chloramphenicol",
    drugAName: "Amoxicillin",
    drugBName: "Chloramphenicol",
    severity: "WARNING",
    mechanism: "Kloramfenikol dapat menghambat efek bakterisidal penisilin. Kloramfenikol bekerja dengan cara menghambat sintesis protein seluler dan dapat mengubah bakteri yang sedang tumbuh aktif menjadi bakteri dalam fase statis. Karena penisilin bekerja dengan menghambat sintesis dinding sel, efektivitasnya dapat berkurang. Selain itu, toksisitas neurologis dapat meningkat. Data yang ada menunjukkan hasil yang saling bertentangan, dan tidak ada laporan mengenai efek antagonisme maupun sinergisme.",
    recommendation: "Sampai tersedia informasi lebih lanjut, kombinasi ini sebaiknya hanya digunakan untuk kondisi yang telah terbukti efektif dan dihindari dalam situasi yang memerlukan aktivitas bakterisidal, seperti pada meningitis bakterialis atau endokarditis akibat *Staphylococcus*. Jika penggunaan kombinasi ini diperlukan, beberapa ahli menyarankan pemberian penisilin beberapa jam sebelum kloramfenikol. Pasien harus dipantau secara ketat untuk mendeteksi adanya perubahan pada efikasi antimikroba.",
    evidence: "Shalit I, Marks MI (1984) \"Chloramphenicol in the 1980s.\" Drugs, 28, p. 281-91\nWallace JF, Smith RH, Garcia M, Petersdorf RG (1967) \"Studies on the pathogenesis of meningitis. VI: antagonism between penicillin and chloramphenicol in experimental pneumococcal meningitis.\" J Lab Clin Med, 70, p. 408-18\nGarrod L (1972) \"Causes of failure in antibiotic treatment.\" Br Med J, 4, p. 441\nJawetz E (1968) \"The use of combinations of antimicrobial drugs.\" Annu Rev Pharmacol, 8, p. 151\n(2008) \"Product Information. Amoxicillin (amoxicillin).\" Ranbaxy Pharmaceuticals\n(2023) \"Product Information. Ampicillin (AG) (ampicillin).\" Alphapharm Pty Ltd"
  },
  {
    id: "amox_kolera",
    drugAId: "amoxicillin_ped",
    drugBId: "cholera",
    drugAName: "Amoxicillin",
    drugBName: "Vaksin Kolera",
    severity: "CRITICAL",
    mechanism: "Penggunaan vaksin kolera hidup yang dilemahkan bersamaan dengan antibiotik sistemik dapat menyebabkan penurunan respons imun terhadap vaksin tersebut. Beberapa jenis antibiotik dapat bekerja melawan galur vaksin *Vibrio cholerae*, sehingga menghambat perkembangbiakan bakteri hingga tingkat yang memadai untuk memicu respons imun yang bersifat protektif.",
    recommendation: "Disarankan untuk menghindari penggunaan antibiotik sistemik selama 10 hari setelah vaksinasi dengan vaksin kolera hidup yang dilemahkan. Selain itu, vaksinasi dengan vaksin kolera hidup yang dilemahkan sebaiknya dihindari dalam kurun waktu 14 hari setelah penggunaan antibiotik sistemik.",
    evidence: "(2025) \"Product Information. Vaxchora (cholera vaccine, live).\" Bavarian Nordic, Inc.\n(2024) \"Product Information. Vaxchora (cholera vaccine, live).\" Accuristix\n(2025) \"Product Information. Vaxchora (cholera vaccine, live).\" Bavarian Nordic UK Ltd\n(2025) \"Product Information. VAXCHORA (vacuna frente al c lera, viva).\" BAVARIAN NORDIC A/S\n(2023) \"Product Information. Vaxchora (cholera vaccine, live).\" Biocelect Pty Ltd"
  },
  {
    id: "amox_clarithromycin",
    drugAId: "amoxicillin_ped",
    drugBId: "clarithromycin_ped",
    drugAName: "Amoxicillin",
    drugBName: "Klaritromisin",
    severity: "INFO",
    mechanism: "Meskipun beberapa data *in vitro* menunjukkan adanya sinergisme antara antibiotik makrolida dan penisilin, data *in vitro* lainnya menunjukkan adanya antagonisme. Ketika obat-obat ini diberikan secara bersamaan, efikasi terapeutik keduanya tidak dapat diprediksi.",
    recommendation: "Data tersedia untuk eritromisin, meskipun secara teoretis interaksi ini dapat terjadi dengan makrolida apa pun. Selain pemantauan efektivitas terapi antibiotik, tampaknya tidak diperlukan tindakan pencegahan khusus.",
    evidence: "Strom J (1961) \"Penicillin and erythromycin singly and in combination in scarlatina therapy and the interference between them.\" Antibiot Chemother, 11, p. 694-7\nCohn JR, Jungkind DL, Baker JS (1980) \"In vitro antagonism by erythromycin of the bactericidal action of antimicrobial agents against common respiratory pathogens.\" Antimicrob Agents Chemother, 18, p. 872-6\nPenn RL, Ward TT, Steigbigel RT (1982) \"Effects of erythromycin in combination with penicillin, ampicillin, or gentamicin on the growth of listeria monocytogenes.\" Antimicrob Agents Chemother, 22, p. 289-94"
  },
  {
    id: "amox_conjestro",
    drugAId: "amoxicillin_ped",
    drugBId: "conjugated_estrogens",
    drugAName: "Amoxicillin",
    drugBName: "Conjugated estrogens",
    severity: "WARNING",
    mechanism: "Efektivitas obat-obatan yang mengandung estrogen dapat terganggu oleh penggunaan bersamaan dengan agen antimikroba. Selama proses metabolisme, komponen estrogen mengalami konjugasi, yang menghasilkan sulfasi atau glukuronidasi pada steroid estrogenik asalnya. Senyawa konjugat ini mencapai usus melalui saluran empedu; di sana, enzim hidrolitik dari bakteri usus memecahnya kembali menjadi hormon estrogenik aktif dalam bentuk bebas. Hormon aktif tersebut kemudian tersedia untuk menjalani siklus enterohepatik, yang membantu mempertahankan kadar estrogen. Perlu dicatat bahwa komponen progestin dalam produk hormonal kombinasi tidak mengalami proses ini. Terdapat dugaan bahwa antibiotik spektrum luas dapat mengurangi efektivitas kontrasepsi yang mengandung estrogen karena antibiotik tersebut dapat mengurangi jumlah bakteri usus dan dengan demikian mengganggu siklus enterohepatik estrogen. Sebagian besar penelitian mengenai kemungkinan interaksi ini dilakukan menggunakan kontrasepsi oral, namun tampaknya semua jenis estrogen mengalami resirkulasi enterohepatik; oleh karena itu, secara teoretis interaksi ini mungkin terjadi pada obat-obatan mengandung estrogen yang digunakan untuk tujuan lain. Akan tetapi, risikonya tampak kecil, dan data pendukung utamanya terbatas pada bukti anekdotal dari laporan kasus serta temuan dari studi yang tidak terkontrol atau memiliki kontrol yang kurang memadai. Selain itu, *Centers for Disease Control and Prevention* (CDC) tidak menganggap sebagian besar antibiotik spektrum luas secara signifikan mengganggu efektivitas kontrasepsi hormonal kombinasi. Sebagian besar antimikroba kecuali obat-obatan penginduksi enzim seperti rifamisin dan mungkin griseofulvin tidak terbukti meningkatkan klirens estrogen kontrasepsi oral secara signifikan. Ada kemungkinan bahwa sebagian kecil wanita lebih sensitif terhadap efek antimikroba pada disposisi estrogen secara *in vivo*, namun faktor risiko atau predisposisi genetik terkait hal ini belum teridentifikasi.",
    recommendation: "Jika penggunaan kontrasepsi oral yang mengandung estrogen bersamaan dengan terapi antibiotik diperlukan, beberapa produsen menyarankan penggunaan metode kontrasepsi cadangan selama jangka waktu tertentu. Jika estrogen digunakan untuk tujuan selain kontrasepsi, terdapat kemungkinan teoretis terjadinya penurunan kadar estrogen sistemik selama pengobatan antibiotik. Pasien perlu diberi saran untuk melaporkan setiap perubahan efikasi produk hormonal tersebut kepada tenaga kesehatan mereka. Selain itu, beberapa penyakit dan antibiotik tertentu dapat menyebabkan mual, muntah, dan/atau diare. Jika muntah terjadi dalam beberapa jam setelah meminum pil kontrasepsi oral, petunjuk pada label produk harus diperiksa untuk mengetahui tindakan yang perlu diambil jika terjadi kondisi pil yang terlewat. Beberapa pihak merekomendasikan penggunaan metode kontrasepsi cadangan jika seseorang mengalami muntah atau diare yang berkepanjangan. Panduan yang lebih spesifik dapat diperoleh dengan memeriksa label masing-masing produk baik produk yang mengandung estrogen (khususnya kontrasepsi oral) maupun antibiotik yang digunakan.",
    evidence: "Friedman CI, Huneke AL, Kim MH, Powell J (1980) \"The effect of ampicillin on oral contraceptive effectiveness.\" Obstet Gynecol, 55, p. 33-7\nBack DJ, Breckenridge AM, MacIver M, et al. (1982) \"The effects of ampicillin on oral contraceptive steroids in women.\" Br J Clin Pharmacol, 14, p. 43-8\nNeely JL, Abate M, Swinker M, D'Angio R (1991) \"The effect of doxycycline on serum levels of ethinyl estradiol, norethindrone, and endogenous progesterone.\" Obstet Gynecol, 77, p. 416-20\nJoshi JV, Joshi UM, Sankholi GM, et al. (1980) \"A study of interaction of low-dose combination oral contraceptive with ampicillin and metronidazole.\" Contraception, 22, p. 643-52\nBaciewicz AM (1985) \"Oral contraceptive drug interactions.\" Ther Drug Monit, 7, p. 26-35\nBint AJ, Burtt I (1980) \"Adverse antibiotic drug interactions.\" Drugs, 20, p. 57-68\nDossetor J (1975) \"Drug interactions with oral contraceptives.\" Br Med J, 4, p. 467-8\nDeSano EA, Hurley SC (1982) \"Possible interactions of antihistamines and antibiotics with oral contraceptive effectiveness.\" Fertil Steril, 37, p. 853-4\nSzoka PR, Edgren RA (1988) \"Drug interactions with oral contraceptives: compilation and analysis of an adverse experience report database.\" Fertil Steril, 49(5 Suppl), s31-8\nBarnett ML (1985) \"Inhibition of oral contraceptive effectiveness by concurrent antibiotic administration.\" J Periodontol, 56, p. 18-20\n(2001) \"Product Information. Declomycin (demeclocycline).\" Lederle Laboratories\nLondon BM, Lookingbill DP (1994) \"Frequency of pregnancy in acne patients taking oral antibiotics and oral contraceptives.\" Arch Dermatol, 130, p. 392-3\nBacon JF, Shenfield GM (1980) \"Pregnancy attributable to interaction between tetracycline and oral contraceptives.\" Br Med J, 280, p. 293\nFazio A (1991) \"Oral contraceptive drug interactions: important considerations.\" South Med J, 84, p. 997-1002\nBack DJ, Orme ML (1990) \"Pharmacokinetic drug interactions with oral contraceptives.\" Clin Pharmacokinet, 18, p. 472-84\nBack DJ, Tjia J, Martin C, Millar E, Mant T, Morrison P, Orme M (1991) \"The lack of interaction between temafloxacin and combined oral contraceptive steroids.\" Contraception, 43, p. 317-23\nOrme ML, Back DJ (1986) \"Interactions between oral contraceptive steroids and broad-spectrum antibiotics.\" Clin Exp Dermatol, 11, p. 327-31\nWermeling DP, Chandler MH, Sides GD, Collins D, Muse KN (1995) \"Dirithromycin increases ethinyl estradiol clearance without allowing ovulation.\" Obstet Gynecol, 86, p. 78-84\nSilber TJ (1983) \"Apparent oral contraceptive failure associated with antibiotic administration.\" J Adolesc Health Care, 4, p. 287-9\nBollen M (1995) \"Use of antibiotics when taking the oral contraceptive pill.\" Aust Fam Physician, 24, p. 928-9\nKleier DJ, Tucker JE (1987) \"Oral contraceptive failure secondary to dentally prescribed drugs: fact or fiction?\" J Colo Dent Assoc, 66, p. 5-6\nBack DJ, Breckenridge AM, Crawford FE, MacIver M, Orne ML, Rowe PH (1981) \"Interindividual variation and drug interactions with hormonal steroid contraceptives.\" Drugs, 21, p. 46-61\nHelms SE, Bredle DL, Zajic J, Jarjoura D, Brodell RT, Krishnarao I (1997) \"Oral contraceptive failure rates and oral antibiotics.\" J Am Acad Dermatol, 36, p. 705-10\nWeisberg E (1999) \"Interactions between oral contraceptives and antifungals antibacterials - Is contraceptive failure the result?.\" Clin Pharmacokinet, 36, p. 309-13\nBurroughs KE, Chambliss ML (2000) \"Antibiotics and oral contraceptive failure.\" Arch Fam, 9, p. 81-2\nWeaver K, Glasier A (1999) \"Interaction between broad-spectrum antibiotics and the combined oral contraceptive pill: a literature review.\" Contraception, 59, p. 71-8\nKing VJ (1997) \"OC failure rates and oral antibiotics.\" J Fam Pract, 45, p. 104-5\nZachariassen RD (1994) \"Loss of oral contraceptive efficacy by concurrent antibiotic administration.\" Women Health, 22, p. 17-26\nDickinson BD, Altman RD, Nielsen NH, Sterling ML (2001) \"Drug interactions between oral contraceptives and antibiotics.\" Obstet Gynecol, 98(5 Pt 1), p. 853-60\nArcher JS, Archer DF (2002) \"Oral contraceptive efficacy and antibiotic interaction: A myth debunked.\" J Am Acad Dermatol, 46, p. 917-23\nOrme M, Back DJ (1991) \"Oral contraceptive steroids--pharmacological issues of interest to the prescribing physician.\" Adv Contracept, 7, p. 325-31\nDeRossi SS, Hersh EV (2002) \"Antibiotics and oral contraceptives.\" Dent Clin North Am, 46, p. 653-64\n(2005) \"FFPRHC Guidance (April 2005). Drug interactions with hormonal contraception.\" J Fam Plann Reprod Health Care, 31, p. 139-51\nBauer KL, Wolf D, Patel M, Vinson DC (2005) \"Clinical inquiries. Do antibiotics interfere with the efficacy of oral contraceptives?\" J Fam Pract, 54, p. 1079-80\nBack DJ, Grimmer SF, Orme ML, Proudlove D, Mann RD, Breckenridge AM (1988) \"Evaluation of Committee on Safety of Medicines yellow card reports on oral contraceptive-drug interactions with anticonvulsants and antibiotics.\" Br J Clin Pharmacol, 25, p. 527-32\n(2018) \"Product Information. Arikayce (amikacin liposome).\" Insmed Incorporated\n(2021) \"Product Information. Nextstellis (drospirenone-estetrol).\" Mayne Pharma\n(2022) \"Product Information. Nextstellis (drospirenone-estetrol).\" Mayne Pharma International Pty Ltd, v 2.0\nCurtis KM, Tepper NK, Jatlaoui TC, et al. (2023) U.S. medical eligibility criteria (US MEC) for contraceptive use. https://www.cdc.gov/reproductivehealth/contraception/mmwr/mec/index.html\nFaculty of Sexual & Reproductive Healthcare (2023) FSRH CEU response to study: analysis of reports of unintended pregnancies associated with the combined use of non-enzyme inducing antibiotics and hormonal contraceptives - february 2021 https://www.fsrh.org/standards-and-guidance/documents/fsrh-ceu-respo\nFaculty of Sexual & Reproductive Healthcare (2023) FSRH CEU guidance: drug interactions with hormonal contraception (may 2022) https://www.fsrh.org/standards-and-guidance/documents/ceu-clinical-guidance-drug-interactions-with-hormonal/\nSimmons KB, Haddad LB, Nanda K, Curtis KM (2018) \"Drug interactions between non-rifamycin antibiotics and hormonal contraception: a systemic review.\" Am J Obstet Gynecol, 218, 88-97.e14\nZhanel GG, Siemens S, Slayter K, Mandell L (1999) \"Antibiotic and oral contraceptive drug interactions: is there a need for concern?\" Can J Infect Dis, 10, p. 429-33\nBlack A, Francoeur D, Rowe T, et al. (2023) SOGC clinical practice guidelines canadian contraception consensus https://www.jogc.com/article/S1701-2163(16)30260-2/pdf\nAllen K (2012) \"Contraception - common issues and practical suggestions.\" Aust Fam Physician, 41, p. 770-2"
  },
  {
    id: "amox_cosibelimab",
    drugAId: "amoxicillin_ped",
    drugBId: "cosibelimab",
    drugAName: "Amoxicillin",
    drugBName: "Cosibelimab",
    severity: "WARNING",
    mechanism: "Penggunaan antibiotik sistemik selama atau di dekat masa terapi dengan penghambat pos pemeriksaan imun (*immune checkpoint inhibitors* atau ICI) seperti antibodi monoklonal anti-CTLA-4 (*cytotoxic T-lymphocyte-associated protein-4*) dan/atau penghambat PD-1 (*programmed cell death-1*)/PD-L1 (*programmed death ligand-1*) dapat menyebabkan penurunan efikasi klinis ICI tersebut. Mekanisme pasti interaksi ini belum sepenuhnya dipahami, namun kemungkinan berkaitan dengan perubahan mikrobiota usus akibat antibiotik sistemik, yang berpotensi menyebabkan disregulasi imun dan penurunan respons terhadap ICI. Sebuah meta-analisis terhadap 6 studi yang melibatkan penggunaan nivolumab untuk pengobatan kanker paru bukan sel kecil (*non-small cell lung cancer* atau NSCLC) stadium lanjut atau metastatik menemukan bahwa median *progression-free survival* (PFS) dan *overall survival* (OS) masing-masing berkurang sebesar 1,6 bulan dan 8,8 bulan pada pasien yang terpapar antibiotik sistemik sebelum, selama, atau setelah terapi nivolumab. Demikian pula, sebuah tinjauan retrospektif di satu pusat layanan kesehatan terhadap pasien (n=291) dengan kanker stadium lanjut (melanoma, NSCLC, atau karsinoma sel ginjal) yang diobati dengan ICI juga menunjukkan hasil klinis yang lebih buruk terkait dengan penggunaan antibiotik sistemik. Studi ini membagi pasien ke dalam 3 kelompok: tanpa antibiotik, satu rangkaian antibiotik, atau rangkaian antibiotik kumulatif (yaitu pemberian antibiotik secara bersamaan atau berturut-turut selama >7 hari) dalam kurun waktu 2 minggu sebelum dan 6 minggu setelah pengobatan ICI. Median PFS (masing-masing 6,3 bulan vs. 3,7 bulan vs. 2,8 bulan) dan median OS (masing-masing 21,7 bulan vs. 17,7 bulan vs. 6,3 bulan) menurun seiring dengan meningkatnya penggunaan antibiotik, meskipun hanya perbedaan antara kelompok tanpa penggunaan antibiotik dan kelompok dengan rangkaian antibiotik kumulatif yang dinilai signifikan secara klinis. Selain itu, analisis retrospektif lain terhadap pasien (n=635) dengan kanker stadium lanjut yang diobati dengan ICI menemukan bahwa penggunaan antibiotik dikaitkan dengan median OS yang jauh lebih singkat (8 bulan vs. 23 bulan), median PFS yang lebih singkat (4 bulan vs. 7 bulan), serta penurunan respons tumor (57% vs. 71%) dibandingkan dengan pasien yang tidak menerima antibiotik. Sebaliknya, sebuah studi retrospektif terhadap pasien (n=302) dengan NSCLC stadium IV yang menjalani terapi kombinasi kemo-imunoterapi lini pertama (yaitu ICI dan kemoterapi sitotoksik) menunjukkan hasil yang serupa dalam hal OS, PFS, dan tingkat respons objektif antara pasien yang menerima antibiotik dan yang tidak menerimanya selama 30 hari sebelum dimulainya terapi ICI. Pemberian antibiotik sistemik secara bersamaan pada populasi pasien ini juga tidak dikaitkan dengan perubahan pada OS maupun PFS.",
    recommendation: "Sampai tersedia informasi lebih lanjut, disarankan untuk berhati-hati dan melakukan pemantauan klinis terhadap kemungkinan berkurangnya efikasi penghambat *immune checkpoint* (ICI) jika antibiotik sistemik diindikasikan sebelum, bersamaan dengan, atau setelah pemberian ICI. Penggunaan antibiotik harus dibatasi pada indikasi dan durasi yang tepat secara klinis. Dokter disarankan untuk merujuk pada literatur yang relevan, pedoman pengobatan tingkat lokal maupun nasional, serta informasi produk (label kemasan) untuk panduan lebih lanjut.",
    evidence: "Kostine M, Mauric E, Tison A, et al. (2021) \"Baseline co-medications may alter the anti-tumoural effect of checkpoint inhibitors as well as the risk of immune-related adverse events.\" Eur J Cancer, 157, p. 474-84\nHuo GW, Zuo R, Song Y, et al. (2021) \"Effect of antibiotic use on the efficacy of nivolumab in the treatment of advanced/metastatic non-small cell lung cancer: a meta-analysis.\" Open Med (Wars), 16, p. 728-36\nTinsley N, Zhou C, Tan G, et al. (2020) \"Cumulative antibiotic use significantly decreases efficacy of checkpoint inhibitors in patients with advanced cancer.\" Oncologist, 25, p. 55-63\nCortellini A, Ricciuti B, Facchinetti F, et al. (2021) \"Antibiotic-exposed patients with non-small-cell lung cancer preserve efficacy outcomes following first-line chemo-immunotherapy.\" Ann Oncol, 32, p. 1391-9\nHakozaki T, richard c, Elkrief A, et al. (2020) \"The gut microbiome associates with immune checkpoint inhibition outcomes in patients with advanced non-small cell lung cancer.\" Cancer Immunol Res, 8, p. 1243-50\nWu HJ, Wu E (2012) \"The role of gut microbiota in immune homeostasis and autoimmunity.\" Gut Microbes, 3, p. 4-14"
  },
  {
    id: "amox_demeclocycline",
    drugAId: "amoxicillin_ped",
    drugBId: "demeclocycline",
    drugAName: "Amoxicillin",
    drugBName: "Demeclocycline",
    severity: "WARNING",
    mechanism: "Sebaiknya dihindari: Tetrasiklin dapat mengurangi efek penisilin dengan cara menghambat sintesis protein seluler, yang merupakan proses yang diperlukan agar penisilin dapat menghambat sintesis dinding sel. Efek antagonisme lebih mungkin terjadi jika salah satu atau kedua obat tersebut diberikan dalam dosis rendah. Hal ini dapat menyebabkan kegagalan terapi.",
    recommendation: "Kombinasi ini sebaiknya dihindari jika memungkinkan.",
    evidence: "1. Gunnison JB, Coleman VR, Jawetz E (1950) \"Interference of aureomycin and of terramycin with action of penicillin in vitro.\" Proc Soc Exp Biol Med, 75, p. 549-52\n2. Lepper MH, Dowling HF (1951) \"Treatment of pneumococcic meningitis with penicillin compared with penicillin plus aureomycin.\" Arch Intern Med, 88, p. 489-94\n3. Jawetz E (1975) \"Synergism and antagonism among antimicrobial drugs: a personal perspective.\" West J Med, 123, p. 87-91\n4. Olsson RA, Kirby JC, Romansky MJ (1961) \"Pneumococcal meningitis in the adult.\" Ann Intern Med, 55, p. 545-9\n5. (2001) \"Product Information. Declomycin (demeclocycline).\" Lederle Laboratories\n6. (2018) \"Product Information. Seysara (sarecycline).\" Allergan Inc"
  },
  {
    id: "amox_dikumarol",
    drugAId: "amoxicillin_ped",
    drugBId: "dikumarol",
    drugAName: "Amoxicillin",
    drugBName: "Dikumarol",
    severity: "WARNING",
    mechanism: "Penisilin terkadang dapat meningkatkan risiko perdarahan pada pasien yang menjalani terapi antikoagulan oral. Mekanisme interaksi yang pasti belum diketahui, namun kemungkinan melibatkan penghambatan agregasi trombosit oleh penisilin. Dalam sebuah penelitian, gangguan agregasi trombosit terjadi secara konsisten pada pasien yang menerima penisilin G 24 juta unit/hari, ampisilin 300 mg/kg/hari, dan metisilin 300 mg/kg/hari. Penisilin lain seperti nafsilin, piperasilin, dan tikarsilin juga diketahui memengaruhi fungsi trombosit; selain itu, benzilpenisilin dan karbenisilin dilaporkan dapat memperpanjang waktu perdarahan dan menyebabkan perdarahan bahkan tanpa penggunaan antikoagulan. Terdapat laporan kasus mengenai peningkatan waktu protrombin dan INR, serta memar dan perdarahan spontan pada pasien yang menggunakan antikoagulan setelah dimulainya atau selesainya terapi penisilin. Meskipun sebagian besar kasus melibatkan dosis intravena yang tinggi dari beberapa jenis penisilin (misalnya, karbenisilin, penisilin G, tikarsilin), interaksi ini juga dilaporkan terjadi pada penggunaan dosis oral biasa dari amoksisilin dan amoksisilin-klavulanat. Bahkan, sebuah studi kasus-kontrol menemukan bahwa amoksisilin-klavulanat merupakan salah satu dari hanya dua obat yang secara signifikan meningkatkan risiko antikoagulasi berlebih pada pasien rawat jalan yang sebelumnya stabil dengan terapi fenprokumon atau asenokumarol. Dalam studi tersebut, 300 pasien rawat jalan di sebuah klinik antikoagulan di Belanda yang memiliki nilai INR lebih besar atau sama dengan 6,0 (nilai median 6,8) dibandingkan dengan 302 kontrol yang dipilih secara acak dan disesuaikan karakteristiknya, yang memiliki nilai INR dalam rentang target (nilai median 3,2); perubahan penggunaan 87 obat atau golongan obat yang berpotensi berinteraksi selama empat minggu sebelum hari indeks diidentifikasi dan dianalisis. Pemberian amoksisilin-klavulanat meningkatkan risiko antikoagulasi berlebih bahkan setelah penyesuaian terhadap faktor perancu potensial, terutama pada pasien yang diobati dengan asenokumarol. Sebuah studi lanjutan yang berfokus pada penggunaan antibiotik pada pasien rawat jalan yang menjalani terapi fenprokumon atau asenokumarol di klinik antikoagulan lain di Belanda juga mengidentifikasi penggunaan amoksisilin sebagai faktor risiko antikoagulasi berlebih, dengan peningkatan risiko relatif paling tinggi terjadi empat hari atau lebih setelah dimulainya penggunaan antibiotik tersebut.",
    recommendation: "Diperlukan kehati-hatian jika penisilin diresepkan selama terapi antikoagulan oral, terutama pada pasien lanjut usia serta pasien dengan uremia atau gangguan fungsi hati. Nilai INR harus dipantau secara berkala dan dosis antikoagulan disesuaikan sebagaimana mestinya, khususnya setelah memulai atau menghentikan terapi penisilin pada pasien yang kondisi antikoagulannya sudah stabil. Pasien harus diimbau untuk segera melaporkan tanda-tanda perdarahan kepada dokter, termasuk nyeri, pembengkakan, sakit kepala, pusing, kelemahan, perdarahan berkepanjangan akibat luka, peningkatan volume darah haid, perdarahan vagina, mimisan, gusi berdarah saat menyikat gigi, perdarahan atau memar yang tidak wajar, urine berwarna merah atau cokelat, serta tinja berwarna merah atau hitam.",
    evidence: "Ku LL, Ward CO, Durgin SJ (1970) \"A clinical study of drug interaction and anticoagulant therapy.\" Drug Intell Clin Pharm, 4, p. 300-6\nAndrassy K, Ritz E, Weisschedel E (1975) \"Bleeding after carbenicillin administration.\" N Engl J Med, 292, p. 109\nAlexander DP, Russo ME, Fohrman DE, Rothstein G (1983) \"Nafcillin-induced platelet dysfunction and bleeding.\" Antimicrob Agents Chemother, 23, p. 59-62\nBrown CH 3d, Bradshaw MJ, Natelson EA, Alfrey CP Jr, Williams TW Jr (1976) \"Defective platelet function following the administration of penicillin compounds.\" Blood, 47, p. 949-56\nBrown CH 3d, Natelson EA, Bradshaw W, Williams TW Jr, Alfrey CP Jr (1974) \"The hemostatic defect produced by carbenicillin.\" N Engl J Med, 291, p. 265-70\nBrown CH 3d, Natelson EA, Bradshaw MW, Alfrey CP Jr, Williams TW Jr (1975) \"Study of the effects of ticarcillin on blood coagulation and platelet function.\" Antimicrob Agents Chemother, 7, p. 652-7\nAndrassy K, Ritz E, Hasper B, Scherz M, Walter E, Storch H (1976) \"Penicillin-induced coagulation disorder.\" Lancet, 2, p. 1039-41\nGentry LO, Jemsek JG, Natelson EA (1981) \"Effects of sodium piperacillin on platelet function in normal volunteers.\" Antimicrob Agents Chemother, 19, p. 532-3\nWood GD (1993) \"Antibiotic prescribing and warfarin enhancement.\" Br Dent J, 175, p. 241\nBandrowsky T, Vorono AA, Borris TJ, Marcantoni HW (1996) \"Amoxicillin-related postextraction bleeding in an anticoagulated patient with tranexamic acid rinses.\" Oral Surg Oral Med Oral Pathol, 82, p. 610-2\nPenning-van Beest FJ, van Meegen E, Rosendaal FR, Stricker BH (2001) \"Drug interactions as a cause of overanticoagulation on phenprocoumon or acenocoumarol predominantly concern antibacterial drugs.\" Clin Pharmacol Ther, 69, p. 451-7\nVisser LE, Penning-Van Bees FJ, Harrie Kasbergen AA, et al. (2002) \"Overanticoagulation associated with combined use of antibacterial drugs and acenocoumarol or phenprocoumon anticoagulants.\" Thromb Haemost, 88, p. 705-10\nDavydov L, Yermolnik M, Cuni LJ (2003) \"Warfarin and amoxicillin/clavulanate drug interaction.\" Ann Pharmacother, 37, p. 367-370\nRice PJ, Perry RJ, Afzal Z, Stockley IH (2003) \"Antibacterial prescribing and warfarin: a review.\" Br Dent J, 194, p. 411-5\nPenning-van Beest F, Erkens J, Petersen KU, Koelz HR, Herings R (2005) \"Main comedications associated with major bleeding during anticoagulant therapy with coumarins.\" Eur J Clin Pharmacol, 61, p. 439-44\nKelly M, Moran J, Byrne S (2005) \"Formation of rectus sheath hematoma with antibiotic use and warfarin therapy: a case report.\" Am J Geriatr Pharmacother, 3, p. 266-9\nLarsen TR, Gelaye A, Durando C (2014) \"Acute warfarin toxicity: an unanticipated consequence of amoxicillin/clavulanate administration.\" Am J Case Rep, 15, p. 45-8"
  },
  {
    id: "amox_diethylstilbestrol",
    drugAId: "amoxicillin_ped",
    drugBId: "diethylstilbestrol",
    drugAName: "Amoxicillin",
    drugBName: "Diethylstilbestrol",
    severity: "WARNING",
    mechanism: "Efektivitas obat-obatan yang mengandung estrogen dapat terganggu oleh penggunaan bersamaan dengan agen antimikroba. Selama proses metabolisme, komponen estrogen mengalami konjugasi, yang menghasilkan sulfasi atau glukuronidasi pada steroid estrogenik asalnya. Senyawa konjugat ini mencapai usus melalui saluran empedu; di sana, enzim hidrolitik dari bakteri usus memecahnya kembali menjadi hormon estrogenik aktif dalam bentuk bebas. Hormon aktif tersebut kemudian tersedia untuk menjalani siklus enterohepatik, yang membantu mempertahankan kadar estrogen. Perlu dicatat bahwa komponen progestin dalam produk hormonal kombinasi tidak mengalami proses ini. Terdapat dugaan bahwa antibiotik spektrum luas dapat mengurangi efektivitas kontrasepsi yang mengandung estrogen karena antibiotik tersebut dapat mengurangi jumlah bakteri usus dan dengan demikian mengganggu siklus enterohepatik estrogen. Sebagian besar penelitian mengenai kemungkinan interaksi ini dilakukan menggunakan kontrasepsi oral, namun tampaknya semua jenis estrogen mengalami resirkulasi enterohepatik; oleh karena itu, secara teoretis interaksi ini mungkin terjadi pada obat-obatan mengandung estrogen yang digunakan untuk tujuan lain. Akan tetapi, risikonya tampak kecil, dan data pendukung utamanya terbatas pada bukti anekdotal dari laporan kasus serta temuan dari studi yang tidak terkontrol atau memiliki kontrol yang kurang memadai. Selain itu, *Centers for Disease Control and Prevention* (CDC) tidak menganggap sebagian besar antibiotik spektrum luas secara signifikan mengganggu efektivitas kontrasepsi hormonal kombinasi. Sebagian besar antimikroba kecuali obat-obatan penginduksi enzim seperti rifamisin dan mungkin griseofulvin tidak terbukti meningkatkan klirens estrogen kontrasepsi oral secara signifikan. Ada kemungkinan bahwa sebagian kecil wanita lebih sensitif terhadap efek antimikroba pada disposisi estrogen secara *in vivo*, namun faktor risiko atau predisposisi genetik terkait hal ini belum teridentifikasi.",
    recommendation: "Jika penggunaan kontrasepsi oral yang mengandung estrogen bersamaan dengan terapi antibiotik diperlukan, beberapa produsen menyarankan penggunaan metode kontrasepsi cadangan selama jangka waktu tertentu. Jika estrogen digunakan untuk tujuan selain kontrasepsi, terdapat kemungkinan teoretis terjadinya penurunan kadar estrogen sistemik selama pengobatan antibiotik. Pasien perlu diberi saran untuk melaporkan setiap perubahan efikasi produk hormonal tersebut kepada tenaga kesehatan mereka. Selain itu, beberapa penyakit dan antibiotik tertentu dapat menyebabkan mual, muntah, dan/atau diare. Jika muntah terjadi dalam beberapa jam setelah meminum pil kontrasepsi oral, petunjuk pada label produk harus diperiksa untuk mengetahui tindakan yang perlu diambil jika terjadi kondisi pil yang terlewat. Beberapa pihak merekomendasikan penggunaan metode kontrasepsi cadangan jika seseorang mengalami muntah atau diare yang berkepanjangan. Panduan yang lebih spesifik dapat diperoleh dengan memeriksa label masing-masing produk baik produk yang mengandung estrogen (khususnya kontrasepsi oral) maupun antibiotik yang digunakan.",
    evidence: "Friedman CI, Huneke AL, Kim MH, Powell J (1980) \"The effect of ampicillin on oral contraceptive effectiveness.\" Obstet Gynecol, 55, p. 33-7\nBack DJ, Breckenridge AM, MacIver M, et al. (1982) \"The effects of ampicillin on oral contraceptive steroids in women.\" Br J Clin Pharmacol, 14, p. 43-8\nNeely JL, Abate M, Swinker M, D'Angio R (1991) \"The effect of doxycycline on serum levels of ethinyl estradiol, norethindrone, and endogenous progesterone.\" Obstet Gynecol, 77, p. 416-20\nJoshi JV, Joshi UM, Sankholi GM, et al. (1980) \"A study of interaction of low-dose combination oral contraceptive with ampicillin and metronidazole.\" Contraception, 22, p. 643-52\nBaciewicz AM (1985) \"Oral contraceptive drug interactions.\" Ther Drug Monit, 7, p. 26-35\nBint AJ, Burtt I (1980) \"Adverse antibiotic drug interactions.\" Drugs, 20, p. 57-68\nDossetor J (1975) \"Drug interactions with oral contraceptives.\" Br Med J, 4, p. 467-8\nDeSano EA, Hurley SC (1982) \"Possible interactions of antihistamines and antibiotics with oral contraceptive effectiveness.\" Fertil Steril, 37, p. 853-4\nSzoka PR, Edgren RA (1988) \"Drug interactions with oral contraceptives: compilation and analysis of an adverse experience report database.\" Fertil Steril, 49(5 Suppl), s31-8\nBarnett ML (1985) \"Inhibition of oral contraceptive effectiveness by concurrent antibiotic administration.\" J Periodontol, 56, p. 18-20\n(2001) \"Product Information. Declomycin (demeclocycline).\" Lederle Laboratories\nLondon BM, Lookingbill DP (1994) \"Frequency of pregnancy in acne patients taking oral antibiotics and oral contraceptives.\" Arch Dermatol, 130, p. 392-3\nBacon JF, Shenfield GM (1980) \"Pregnancy attributable to interaction between tetracycline and oral contraceptives.\" Br Med J, 280, p. 293\nFazio A (1991) \"Oral contraceptive drug interactions: important considerations.\" South Med J, 84, p. 997-1002\nBack DJ, Orme ML (1990) \"Pharmacokinetic drug interactions with oral contraceptives.\" Clin Pharmacokinet, 18, p. 472-84\nBack DJ, Tjia J, Martin C, Millar E, Mant T, Morrison P, Orme M (1991) \"The lack of interaction between temafloxacin and combined oral contraceptive steroids.\" Contraception, 43, p. 317-23\nOrme ML, Back DJ (1986) \"Interactions between oral contraceptive steroids and broad-spectrum antibiotics.\" Clin Exp Dermatol, 11, p. 327-31\nWermeling DP, Chandler MH, Sides GD, Collins D, Muse KN (1995) \"Dirithromycin increases ethinyl estradiol clearance without allowing ovulation.\" Obstet Gynecol, 86, p. 78-84\nSilber TJ (1983) \"Apparent oral contraceptive failure associated with antibiotic administration.\" J Adolesc Health Care, 4, p. 287-9\nBollen M (1995) \"Use of antibiotics when taking the oral contraceptive pill.\" Aust Fam Physician, 24, p. 928-9\nKleier DJ, Tucker JE (1987) \"Oral contraceptive failure secondary to dentally prescribed drugs: fact or fiction?\" J Colo Dent Assoc, 66, p. 5-6\nBack DJ, Breckenridge AM, Crawford FE, MacIver M, Orne ML, Rowe PH (1981) \"Interindividual variation and drug interactions with hormonal steroid contraceptives.\" Drugs, 21, p. 46-61\nHelms SE, Bredle DL, Zajic J, Jarjoura D, Brodell RT, Krishnarao I (1997) \"Oral contraceptive failure rates and oral antibiotics.\" J Am Acad Dermatol, 36, p. 705-10\nWeisberg E (1999) \"Interactions between oral contraceptives and antifungals antibacterials - Is contraceptive failure the result?.\" Clin Pharmacokinet, 36, p. 309-13\nBurroughs KE, Chambliss ML (2000) \"Antibiotics and oral contraceptive failure.\" Arch Fam, 9, p. 81-2\nWeaver K, Glasier A (1999) \"Interaction between broad-spectrum antibiotics and the combined oral contraceptive pill: a literature review.\" Contraception, 59, p. 71-8\nKing VJ (1997) \"OC failure rates and oral antibiotics.\" J Fam Pract, 45, p. 104-5\nZachariassen RD (1994) \"Loss of oral contraceptive efficacy by concurrent antibiotic administration.\" Women Health, 22, p. 17-26\nDickinson BD, Altman RD, Nielsen NH, Sterling ML (2001) \"Drug interactions between oral contraceptives and antibiotics.\" Obstet Gynecol, 98(5 Pt 1), p. 853-60\nArcher JS, Archer DF (2002) \"Oral contraceptive efficacy and antibiotic interaction: A myth debunked.\" J Am Acad Dermatol, 46, p. 917-23\nOrme M, Back DJ (1991) \"Oral contraceptive steroids--pharmacological issues of interest to the prescribing physician.\" Adv Contracept, 7, p. 325-31\nDeRossi SS, Hersh EV (2002) \"Antibiotics and oral contraceptives.\" Dent Clin North Am, 46, p. 653-64\n(2005) \"FFPRHC Guidance (April 2005). Drug interactions with hormonal contraception.\" J Fam Plann Reprod Health Care, 31, p. 139-51\nBauer KL, Wolf D, Patel M, Vinson DC (2005) \"Clinical inquiries. Do antibiotics interfere with the efficacy of oral contraceptives?\" J Fam Pract, 54, p. 1079-80\nBack DJ, Grimmer SF, Orme ML, Proudlove D, Mann RD, Breckenridge AM (1988) \"Evaluation of Committee on Safety of Medicines yellow card reports on oral contraceptive-drug interactions with anticonvulsants and antibiotics.\" Br J Clin Pharmacol, 25, p. 527-32\n(2018) \"Product Information. Arikayce (amikacin liposome).\" Insmed Incorporated\n(2021) \"Product Information. Nextstellis (drospirenone-estetrol).\" Mayne Pharma\n(2022) \"Product Information. Nextstellis (drospirenone-estetrol).\" Mayne Pharma International Pty Ltd, v 2.0\nCurtis KM, Tepper NK, Jatlaoui TC, et al. (2023) U.S. medical eligibility criteria (US MEC) for contraceptive use. https://www.cdc.gov/reproductivehealth/contraception/mmwr/mec/index.html\nFaculty of Sexual & Reproductive Healthcare (2023) FSRH CEU response to study: analysis of reports of unintended pregnancies associated with the combined use of non-enzyme inducing antibiotics and hormonal contraceptives - february 2021 https://www.fsrh.org/standards-and-guidance/documents/fsrh-ceu-respo\nFaculty of Sexual & Reproductive Healthcare (2023) FSRH CEU guidance: drug interactions with hormonal contraception (may 2022) https://www.fsrh.org/standards-and-guidance/documents/ceu-clinical-guidance-drug-interactions-with-hormonal/\nSimmons KB, Haddad LB, Nanda K, Curtis KM (2018) \"Drug interactions between non-rifamycin antibiotics and hormonal contraception: a systemic review.\" Am J Obstet Gynecol, 218, 88-97.e14\nZhanel GG, Siemens S, Slayter K, Mandell L (1999) \"Antibiotic and oral contraceptive drug interactions: is there a need for concern?\" Can J Infect Dis, 10, p. 429-33\nBlack A, Francoeur D, Rowe T, et al. (2023) SOGC clinical practice guidelines canadian contraception consensus https://www.jogc.com/article/S1701-2163(16)30260-2/pdf\nAllen K (2012) \"Contraception - common issues and practical suggestions.\" Aust Fam Physician, 41, p. 770-2"
  },
  {
    id: "amox_dirithromycin",
    drugAId: "amoxicillin_ped",
    drugBId: "dirithromycin",
    drugAName: "Amoxicillin",
    drugBName: "Dirithromycin",
    severity: "INFO",
    mechanism: "Meskipun beberapa data *in vitro* menunjukkan adanya sinergisme antara antibiotik makrolida dan penisilin, data *in vitro* lainnya menunjukkan adanya antagonisme. Ketika obat-obat ini diberikan secara bersamaan, efikasi terapeutik keduanya tidak dapat diprediksi.",
    recommendation: "Data tersedia untuk eritromisin, meskipun secara teoretis interaksi ini dapat terjadi dengan makrolida apa pun. Selain pemantauan efektivitas terapi antibiotik, tampaknya tidak diperlukan tindakan pencegahan khusus.",
    evidence: "Strom J (1961) \"Penicillin and erythromycin singly and in combination in scarlatina therapy and the interference between them.\" Antibiot Chemother, 11, p. 694-7\nCohn JR, Jungkind DL, Baker JS (1980) \"In vitro antagonism by erythromycin of the bactericidal action of antimicrobial agents against common respiratory pathogens.\" Antimicrob Agents Chemother, 18, p. 872-6\nPenn RL, Ward TT, Steigbigel RT (1982) \"Effects of erythromycin in combination with penicillin, ampicillin, or gentamicin on the growth of listeria monocytogenes.\" Antimicrob Agents Chemother, 22, p. 289-94"
  },
  {
    id: "amox_dostarlimab",
    drugAId: "amoxicillin_ped",
    drugBId: "dostarlimab",
    drugAName: "Amoxicillin",
    drugBName: "Dostarlimab",
    severity: "WARNING",
    mechanism: "Penggunaan antibiotik sistemik selama atau di dekat masa terapi dengan penghambat pos pemeriksaan imun (*immune checkpoint inhibitors* atau ICI) seperti antibodi monoklonal anti-CTLA-4 (*cytotoxic T-lymphocyte-associated protein-4*) dan/atau penghambat PD-1 (*programmed cell death-1*)/PD-L1 (*programmed death ligand-1*) dapat menyebabkan penurunan efikasi klinis ICI tersebut. Mekanisme pasti interaksi ini belum sepenuhnya dipahami, namun kemungkinan berkaitan dengan perubahan mikrobiota usus akibat antibiotik sistemik, yang berpotensi menyebabkan disregulasi imun dan penurunan respons terhadap ICI. Sebuah meta-analisis terhadap 6 studi yang melibatkan penggunaan nivolumab untuk pengobatan kanker paru bukan sel kecil (*non-small cell lung cancer* atau NSCLC) stadium lanjut atau metastatik menemukan bahwa median *progression-free survival* (PFS) dan *overall survival* (OS) masing-masing berkurang sebesar 1,6 bulan dan 8,8 bulan pada pasien yang terpapar antibiotik sistemik sebelum, selama, atau setelah terapi nivolumab. Demikian pula, sebuah tinjauan retrospektif di satu pusat layanan kesehatan terhadap pasien (n=291) dengan kanker stadium lanjut (melanoma, NSCLC, atau karsinoma sel ginjal) yang diobati dengan ICI juga menunjukkan hasil klinis yang lebih buruk terkait dengan penggunaan antibiotik sistemik. Studi ini membagi pasien ke dalam 3 kelompok: tanpa antibiotik, satu rangkaian antibiotik, atau rangkaian antibiotik kumulatif (yaitu pemberian antibiotik secara bersamaan atau berturut-turut selama >7 hari) dalam kurun waktu 2 minggu sebelum dan 6 minggu setelah pengobatan ICI. Median PFS (masing-masing 6,3 bulan vs. 3,7 bulan vs. 2,8 bulan) dan median OS (masing-masing 21,7 bulan vs. 17,7 bulan vs. 6,3 bulan) menurun seiring dengan meningkatnya penggunaan antibiotik, meskipun hanya perbedaan antara kelompok tanpa penggunaan antibiotik dan kelompok dengan rangkaian antibiotik kumulatif yang dinilai signifikan secara klinis. Selain itu, analisis retrospektif lain terhadap pasien (n=635) dengan kanker stadium lanjut yang diobati dengan ICI menemukan bahwa penggunaan antibiotik dikaitkan dengan median OS yang jauh lebih singkat (8 bulan vs. 23 bulan), median PFS yang lebih singkat (4 bulan vs. 7 bulan), serta penurunan respons tumor (57% vs. 71%) dibandingkan dengan pasien yang tidak menerima antibiotik. Sebaliknya, sebuah studi retrospektif terhadap pasien (n=302) dengan NSCLC stadium IV yang menjalani terapi kombinasi kemo-imunoterapi lini pertama (yaitu ICI dan kemoterapi sitotoksik) menunjukkan hasil yang serupa dalam hal OS, PFS, dan tingkat respons objektif antara pasien yang menerima antibiotik dan yang tidak menerimanya selama 30 hari sebelum dimulainya terapi ICI. Pemberian antibiotik sistemik secara bersamaan pada populasi pasien ini juga tidak dikaitkan dengan perubahan pada OS maupun PFS.",
    recommendation: "Sampai tersedia informasi lebih lanjut, disarankan untuk berhati-hati dan melakukan pemantauan klinis terhadap kemungkinan berkurangnya efikasi penghambat *immune checkpoint* (ICI) jika antibiotik sistemik diindikasikan sebelum, bersamaan dengan, atau setelah pemberian ICI. Penggunaan antibiotik harus dibatasi pada indikasi dan durasi yang tepat secara klinis. Dokter disarankan untuk merujuk pada literatur yang relevan, pedoman pengobatan tingkat lokal maupun nasional, serta informasi produk (label kemasan) untuk panduan lebih lanjut.",
    evidence: "Kostine M, Mauric E, Tison A, et al. (2021) \"Baseline co-medications may alter the anti-tumoural effect of checkpoint inhibitors as well as the risk of immune-related adverse events.\" Eur J Cancer, 157, p. 474-84\nHuo GW, Zuo R, Song Y, et al. (2021) \"Effect of antibiotic use on the efficacy of nivolumab in the treatment of advanced/metastatic non-small cell lung cancer: a meta-analysis.\" Open Med (Wars), 16, p. 728-36\nTinsley N, Zhou C, Tan G, et al. (2020) \"Cumulative antibiotic use significantly decreases efficacy of checkpoint inhibitors in patients with advanced cancer.\" Oncologist, 25, p. 55-63\nCortellini A, Ricciuti B, Facchinetti F, et al. (2021) \"Antibiotic-exposed patients with non-small-cell lung cancer preserve efficacy outcomes following first-line chemo-immunotherapy.\" Ann Oncol, 32, p. 1391-9\nHakozaki T, richard c, Elkrief A, et al. (2020) \"The gut microbiome associates with immune checkpoint inhibition outcomes in patients with advanced non-small cell lung cancer.\" Cancer Immunol Res, 8, p. 1243-50\nWu HJ, Wu E (2012) \"The role of gut microbiota in immune homeostasis and autoimmunity.\" Gut Microbes, 3, p. 4-14"
  },
];

export const INTERACTION_DATABASE: DrugInteraction[] = [
  ...BASE_INTERACTION_DATABASE,
  ...EXTENDED_INTERACTIONS_FOR_PRESETS,
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

const BASE_FOOD_INTERACTION_DATABASE: FoodInteraction[] = [
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

export const FOOD_INTERACTION_DATABASE: FoodInteraction[] = [
  ...BASE_FOOD_INTERACTION_DATABASE,
  ...EXTENDED_FOOD_INTERACTIONS,
];

/**
 * Maps a drug ID and name to a canonical active substance key.
 * This guarantees consistent drug-drug interaction matching across generic,
 * brand names (e.g. Baquinor, Concor, Sanmol, Tiaryt), formulations, and age-specific presets.
 */
export function getCanonicalSubstance(id: string, name: string): string {
  const norm = `${id} ${name}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("amox") || norm.includes("amok")) return "amoxicillin";
  if (norm.includes("cipro") || norm.includes("sipro") || norm.includes("baquinor")) return "ciprofloxacin";
  if (norm.includes("warfarin") || norm.includes("simarc")) return "warfarin";
  if (norm.includes("spirono") || norm.includes("spironolakton") || norm.includes("aldactone") || norm.includes("carpiaton") || norm.includes("letonal")) return "spironolactone";
  if (norm.includes("enalapril") || norm.includes("tenivast")) return "enalapril";
  if (norm.includes("captopril") || norm.includes("kaptopril") || norm.includes("otoryl")) return "captopril";
  if (norm.includes("candesartan") || norm.includes("kandesartan") || norm.includes("canderin") || norm.includes("blopress")) return "candesartan";
  if (norm.includes("aspirin") || norm.includes("aspilets") || norm.includes("asetilsalisilat") || norm.includes("thromboaspilets") || norm.includes("miniaspi") || norm.includes("farmasal") || norm.includes("aspi")) return "aspirin";
  if (norm.includes("ibuprofen") || norm.includes("proris") || norm.includes("bufect") || norm.includes("farsifen")) return "ibuprofen";
  if (norm.includes("mefenamat") || norm.includes("mefenamic") || norm.includes("ponstan") || norm.includes("asammefenamat")) return "mefenamic_acid";
  if (norm.includes("diklofenak") || norm.includes("diclofenac") || norm.includes("voltaren") || norm.includes("voltadex") || norm.includes("cataflam") || norm.includes("flamar")) return "diclofenac";
  if (norm.includes("ketorolac") || norm.includes("ketorolak") || norm.includes("toradol") || norm.includes("remopain") || norm.includes("laturol") || norm.includes("torasic") || norm.includes("scelto")) return "ketorolac";
  if (norm.includes("rifampi") || norm.includes("rifampisin") || norm.includes("rifampicin") || norm.includes("rifanh") || norm.includes("rifastar") || norm.includes("rimactazid") || norm.includes("rimstar")) return "rifampicin";
  if (norm.includes("clopidogrel") || norm.includes("klopidogrel") || norm.includes("plavix") || norm.includes("clopisan") || norm.includes("placta") || norm.includes("vaclo")) return "clopidogrel";
  if (norm.includes("omeprazol") || norm.includes("omeprazole") || norm.includes("ozid") || norm.includes("lokev") || norm.includes("pramezol") || norm.includes("omerazole")) return "omeprazole";
  if (norm.includes("lansoprazol") || norm.includes("lansoprazole") || norm.includes("prospans") || norm.includes("lapraz") || norm.includes("inazol") || norm.includes("laz") || norm.includes("gastrolan")) return "lansoprazole";
  if (norm.includes("simvastatin") || norm.includes("simva") || norm.includes("zocor") || norm.includes("selvim") || norm.includes("cholestat") || norm.includes("valesco")) return "simvastatin";
  if (norm.includes("atorvastatin") || norm.includes("lipitor") || norm.includes("truvaz") || norm.includes("atorva") || norm.includes("stator")) return "atorvastatin";
  if (norm.includes("ketoconazole") || norm.includes("ketokonazol") || norm.includes("zoloral") || norm.includes("mycoral") || norm.includes("formyco")) return "ketoconazole";
  if (norm.includes("erythromycin") || norm.includes("eritromisin") || norm.includes("erysanbe") || norm.includes("erythrocin")) return "erythromycin";
  if (norm.includes("clarithromycin") || norm.includes("klaritromisin") || norm.includes("bicrolin") || norm.includes("abboticin") || norm.includes("clapharma")) return "clarithromycin";
  if (norm.includes("digoxin") || norm.includes("digoksin") || norm.includes("fargoxin")) return "digoxin";
  if (norm.includes("furosemid") || norm.includes("furosemide") || norm.includes("lasix") || norm.includes("farsix") || norm.includes("edemin") || norm.includes("impugan")) return "furosemide";
  if (norm.includes("propranolol") || norm.includes("farmadral")) return "propranolol";
  if (norm.includes("bisoprolol") || norm.includes("concor") || norm.includes("b-beta") || norm.includes("bbeta") || norm.includes("maintate") || norm.includes("lodoz")) return "bisoprolol";
  if (norm.includes("salbutamol") || norm.includes("ventolin") || norm.includes("salbulin") || norm.includes("suprasma") || norm.includes("astika") || norm.includes("velutine")) return "salbutamol";
  if (norm.includes("insulin") || norm.includes("sansulin") || norm.includes("ryzodeg") || norm.includes("novorapid") || norm.includes("lantus") || norm.includes("levemir") || norm.includes("apidra") || norm.includes("humalog")) return "insulin";
  if (norm.includes("gentamicin") || norm.includes("gentamisin") || norm.includes("sagestam") || norm.includes("garamycin") || norm.includes("ottogenta")) return "gentamicin";
  if (norm.includes("vancomycin") || norm.includes("vankomisin") || norm.includes("vancep")) return "vancomycin";
  if (norm.includes("haloperidol") || norm.includes("haldol") || norm.includes("serenace") || norm.includes("govotil") || norm.includes("haldoldecanoat")) return "haloperidol";
  if (norm.includes("levofloxacin") || norm.includes("levofloksasin") || norm.includes("cravit") || norm.includes("levocin") || norm.includes("mosardal")) return "levofloxacin";
  if (norm.includes("tramadol") || norm.includes("centrasic") || norm.includes("tramal") || norm.includes("tradosik") || norm.includes("kamadol")) return "tramadol";
  if (norm.includes("quetiapin") || norm.includes("quetiapine") || norm.includes("seroquel")) return "quetiapine";
  if (norm.includes("amlodipin") || norm.includes("amlodipine") || norm.includes("norvask") || norm.includes("amdocal") || norm.includes("tensivask") || norm.includes("intervask")) return "amlodipine";
  if (norm.includes("potassiumchloride") || norm.includes("kcl") || norm.includes("kaliumklorida") || norm.includes("ksr")) return "potassium_chloride";
  if (norm.includes("allopurinol") || norm.includes("alopurinol") || norm.includes("zyloric") || norm.includes("sinoric") || norm.includes("isoric") || norm.includes("puricemia")) return "allopurinol";
  if (norm.includes("doxycycline") || norm.includes("doksisiklin") || norm.includes("dohixat") || norm.includes("doxicor")) return "doxycycline";
  if (norm.includes("amikacin") || norm.includes("amikasin") || norm.includes("amikin") || norm.includes("alostil")) return "amikacin";
  if (norm.includes("chloramphenicol") || norm.includes("kloramfenikol") || norm.includes("bufacetin") || norm.includes("colsancetine") || norm.includes("colme")) return "chloramphenicol";
  if (norm.includes("kolera") || norm.includes("cholera") || norm.includes("vaxchora")) return "cholera";
  if (norm.includes("paracetamol") || norm.includes("asetaminofen") || norm.includes("sanmol") || norm.includes("panadol") || norm.includes("pamol") || norm.includes("dumin") || norm.includes("tempra") || norm.includes("paratusin") || norm.includes("sumagesic") || norm.includes("ottopan") || norm.includes("farmadol")) return "paracetamol";
  if (norm.includes("sucralfate") || norm.includes("sukralfat") || norm.includes("neopepsan") || norm.includes("episan") || norm.includes("ulcron") || norm.includes("propepsa") || norm.includes("inpepsa")) return "sucralfate";
  if (norm.includes("methotrexate") || norm.includes("metotreksat") || norm.includes("rheutrex")) return "methotrexate";
  if (norm.includes("amiodarone") || norm.includes("amiodaron") || norm.includes("tiaryt") || norm.includes("cordarone")) return "amiodarone";

  // Additional major classes for Presets & Drug Information
  if (norm.includes("metformin") || norm.includes("glumin") || norm.includes("neodipar") || norm.includes("forbetes") || norm.includes("glucophage")) return "metformin";
  if (norm.includes("glimepirid") || norm.includes("glimepiride") || norm.includes("amaryl") || norm.includes("glimpid") || norm.includes("actaryl") || norm.includes("diversa")) return "glimepiride";
  if (norm.includes("ceftriaxon") || norm.includes("seftriakson") || norm.includes("rocephin") || norm.includes("broadced") || norm.includes("ceftrimax") || norm.includes("terbac")) return "ceftriaxone";
  if (norm.includes("cefixim") || norm.includes("sefiksim") || norm.includes("cepspan") || norm.includes("spancef") || norm.includes("fixep") || norm.includes("anfix")) return "cefixime";
  if (norm.includes("dexamethason") || norm.includes("deksametason") || norm.includes("cortidex") || norm.includes("kalmethasone") || norm.includes("oradexon") || norm.includes("lanadexon") || norm.includes("indexon")) return "dexamethasone";
  if (norm.includes("prednison") || norm.includes("prednisone")) return "prednisone";
  if (norm.includes("methylprednisolon") || norm.includes("metilprednisolon") || norm.includes("medixon") || norm.includes("sanexon") || norm.includes("urbason") || norm.includes("solumedrol") || norm.includes("prednox") || norm.includes("torasid")) return "methylprednisolone";
  if (norm.includes("morfin") || norm.includes("morphin") || norm.includes("mst") || norm.includes("morphine")) return "morphine";
  if (norm.includes("fentanil") || norm.includes("fentanyl") || norm.includes("durogesic")) return "fentanyl";
  if (norm.includes("diazepam") || norm.includes("valisanbe") || norm.includes("stesolid") || norm.includes("valium") || norm.includes("trankinon")) return "diazepam";
  if (norm.includes("midazolam") || norm.includes("miloz") || norm.includes("sedacum") || norm.includes("fortanest") || norm.includes("dormicum")) return "midazolam";
  if (norm.includes("phenytoin") || norm.includes("fenitoin") || norm.includes("kutoin") || norm.includes("dilantin") || norm.includes("zentropil") || norm.includes("decantoin")) return "phenytoin";
  if (norm.includes("carbamazepin") || norm.includes("karbamazepin") || norm.includes("bamgetol") || norm.includes("tegretol")) return "carbamazepine";
  if (norm.includes("valproat") || norm.includes("valproic") || norm.includes("depakene") || norm.includes("depakote") || norm.includes("divalproex") || norm.includes("ivalep") || norm.includes("falpro")) return "valproate";
  if (norm.includes("colchicin") || norm.includes("kolkisin") || norm.includes("recolfar") || norm.includes("lanturol")) return "colchicine";
  if (norm.includes("theophyllin") || norm.includes("teofilin") || norm.includes("bronsolvan") || norm.includes("euphyllin") || norm.includes("retaphyl")) return "theophylline";
  if (norm.includes("aminophyllin") || norm.includes("aminofilin") || norm.includes("phylex")) return "aminophylline";
  if (norm.includes("isoniazid") || norm.includes("inh") || norm.includes("inoxin") || norm.includes("tibigon")) return "isoniazid";
  if (norm.includes("fluconazol") || norm.includes("flukonazol") || norm.includes("diflucan") || norm.includes("flucoral") || norm.includes("candizol") || norm.includes("zemyc")) return "fluconazole";
  if (norm.includes("donepezil") || norm.includes("aricept") || norm.includes("alzeil") || norm.includes("donecept")) return "donepezil";
  if (norm.includes("ondansetron") || norm.includes("narfoz") || norm.includes("cedantron") || norm.includes("invomit") || norm.includes("zofran") || norm.includes("vometron") || norm.includes("dantrox")) return "ondansetron";
  if (norm.includes("calcium") || norm.includes("kalsium") || norm.includes("calc") || norm.includes("cagluconat") || norm.includes("calcii")) return "calcium";

  return id.toLowerCase();
}

/**
 * Retrieves all registered drug interactions that involve a given drug preset.
 */
export function getInteractionsForDrug(id: string, name: string, db: DrugInteraction[] = INTERACTION_DATABASE): DrugInteraction[] {
  const targetSubstance = getCanonicalSubstance(id, name);
  const targetId = id.toLowerCase();
  const targetNorm = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  return db.filter(item => {
    if (item.drugAId === id || item.drugBId === id) return true;
    const subA = getCanonicalSubstance(item.drugAId, item.drugAName);
    const subB = getCanonicalSubstance(item.drugBId, item.drugBName);
    if (subA === targetSubstance || subB === targetSubstance) return true;

    const normA = item.drugAName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normB = item.drugBName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (targetNorm && targetNorm.length >= 4 && (targetNorm.includes(normA) || normA.includes(targetNorm) || targetNorm.includes(normB) || normB.includes(targetNorm))) {
      return true;
    }

    return false;
  });
}

/**
 * Retrieves all registered food interactions that involve a given drug preset.
 */
export function getFoodInteractionsForDrug(id: string, name: string, db: FoodInteraction[] = FOOD_INTERACTION_DATABASE): FoodInteraction[] {
  const targetSubstance = getCanonicalSubstance(id, name);
  const targetId = id.toLowerCase();

  return db.filter(item => {
    if (item.drugId === id) return true;
    const sub = getCanonicalSubstance(item.drugId, item.drugName);
    if (sub === targetSubstance) return true;
    const baseA = targetId.split("_")[0];
    const baseB = item.drugId.split("_")[0];
    return baseA === baseB;
  });
}

/**
 * Checks for food-drug interactions for a list of drug IDs.
 * Returns an array of food-drug interactions.
 */
export function checkFoodInteractions(drugIds: string[]): FoodInteraction[] {
  if (!drugIds || drugIds.length === 0) {
    return [];
  }

  return FOOD_INTERACTION_DATABASE.filter(interaction => {
    return drugIds.some(id => {
      if (id === interaction.drugId) return true;
      const baseA = id.split("_")[0];
      const baseB = interaction.drugId.split("_")[0];
      return baseA === baseB;
    });
  });
}

