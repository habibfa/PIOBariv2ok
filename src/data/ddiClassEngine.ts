import type { DrugInteraction } from "../interactions";

type PharmTag =
  | "STRONG_CYP3A4_INHIBITOR"
  | "MODERATE_CYP3A4_INHIBITOR"
  | "STRONG_CYP3A4_INDUCER"
  | "CYP3A4_SENSITIVE_SUBSTRATE"
  | "CYP2C19_INHIBITOR"
  | "CYP2C19_PRODRUG"
  | "CYP2D6_INHIBITOR"
  | "CYP2D6_PRODRUG"
  | "CYP2C9_INHIBITOR"
  | "CYP2C9_SUBSTRATE"
  | "QT_PROLONGING"
  | "SEROTONERGIC"
  | "ANTICOAGULANT"
  | "ANTIPLATELET"
  | "NSAID"
  | "SYSTEMIC_CORTICOSTEROID"
  | "ACEI"
  | "ARB"
  | "ARNI"
  | "K_ELEVATING"
  | "LOOP_THIAZIDE_DIURETIC"
  | "BETA_BLOCKER_NONSELECTIVE"
  | "BETA_BLOCKER_SELECTIVE"
  | "BETA2_AGONIST"
  | "NON_DHP_CCB"
  | "OPIOID"
  | "BENZO_SEDATIVE"
  | "GABAPENTINOID"
  | "NEPHROTOXIC"
  | "POLYVALENT_CATION"
  | "FLUOROQUINOLONE"
  | "TETRACYCLINE"
  | "NITRATE"
  | "PDE5_INHIBITOR"
  | "HYPOGLYCEMIC_AGENT"
  | "STATIN_CYP3A4"
  | "ANTICHOLINERGIC"
  | "CHOLINESTERASE_INHIBITOR"
  | "CARBAPENEM"
  | "VALPROATE"
  | "PPI"
  | "METHOTREXATE"
  | "HEPATOTOXIC"
  | "NMBA"
  | "AMINOGLYCOSIDE"
  | "DOPAMINE_ANTAGONIST"
  | "LEVODOPA_AGONIST"
  | "LITHIUM"
  | "ALPHA_BLOCKER"
  | "CALCINEURIN_INHIBITOR"
  | "XANTHINE_OXIDASE_INHIBITOR"
  | "THIOPURINE";

const SUBSTANCE_TAGS: Record<string, PharmTag[]> = {
  // Strong/Moderate CYP3A4 inhibitors
  ketoconazole: ["STRONG_CYP3A4_INHIBITOR", "QT_PROLONGING", "HEPATOTOXIC"],
  itraconazole: ["STRONG_CYP3A4_INHIBITOR", "QT_PROLONGING"],
  voriconazole: ["STRONG_CYP3A4_INHIBITOR", "CYP2C19_INHIBITOR", "CYP2C9_INHIBITOR", "QT_PROLONGING"],
  clarithromycin: ["STRONG_CYP3A4_INHIBITOR", "QT_PROLONGING"],
  lopinavir_ritonavir: ["STRONG_CYP3A4_INHIBITOR"],
  erythromycin: ["MODERATE_CYP3A4_INHIBITOR", "QT_PROLONGING"],
  fluconazole: ["MODERATE_CYP3A4_INHIBITOR", "CYP2C9_INHIBITOR", "CYP2C19_INHIBITOR", "QT_PROLONGING"],
  diltiazem: ["MODERATE_CYP3A4_INHIBITOR", "NON_DHP_CCB"],
  verapamil: ["MODERATE_CYP3A4_INHIBITOR", "NON_DHP_CCB"],
  amiodarone: ["MODERATE_CYP3A4_INHIBITOR", "CYP2C9_INHIBITOR", "QT_PROLONGING"],
  ciprofloxacin: ["FLUOROQUINOLONE", "QT_PROLONGING"],

  // Strong CYP3A4 / Enzyme Inducers
  rifampicin: ["STRONG_CYP3A4_INDUCER", "HEPATOTOXIC"],
  carbamazepine: ["STRONG_CYP3A4_INDUCER"],
  phenytoin: ["STRONG_CYP3A4_INDUCER", "CYP2C9_SUBSTRATE"],
  phenobarbital: ["STRONG_CYP3A4_INDUCER", "BENZO_SEDATIVE"],
  efavirenz: ["STRONG_CYP3A4_INDUCER"],

  // CYP3A4 sensitive substrates
  simvastatin: ["STATIN_CYP3A4", "CYP3A4_SENSITIVE_SUBSTRATE"],
  atorvastatin: ["STATIN_CYP3A4", "CYP3A4_SENSITIVE_SUBSTRATE"],
  midazolam: ["BENZO_SEDATIVE", "CYP3A4_SENSITIVE_SUBSTRATE"],
  alprazolam: ["BENZO_SEDATIVE", "CYP3A4_SENSITIVE_SUBSTRATE"],
  colchicine: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  ergotamine: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  bedaquiline: ["CYP3A4_SENSITIVE_SUBSTRATE", "QT_PROLONGING"],
  cyclosporine: ["CALCINEURIN_INHIBITOR", "CYP3A4_SENSITIVE_SUBSTRATE", "NEPHROTOXIC"],
  tacrolimus: ["CALCINEURIN_INHIBITOR", "CYP3A4_SENSITIVE_SUBSTRATE", "NEPHROTOXIC", "QT_PROLONGING"],
  rivaroxaban: ["ANTICOAGULANT", "CYP3A4_SENSITIVE_SUBSTRATE"],
  apixaban: ["ANTICOAGULANT", "CYP3A4_SENSITIVE_SUBSTRATE"],
  quetiapine: ["CYP3A4_SENSITIVE_SUBSTRATE", "QT_PROLONGING"],
  sildenafil: ["PDE5_INHIBITOR", "CYP3A4_SENSITIVE_SUBSTRATE"],
  tadalafil: ["PDE5_INHIBITOR", "CYP3A4_SENSITIVE_SUBSTRATE"],
  domperidone: ["CYP3A4_SENSITIVE_SUBSTRATE", "QT_PROLONGING", "DOPAMINE_ANTAGONIST"],
  imatinib: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  erlotinib: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  osimertinib: ["CYP3A4_SENSITIVE_SUBSTRATE", "QT_PROLONGING"],
  gefitinib: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  amlodipine: ["CYP3A4_SENSITIVE_SUBSTRATE"],
  nifedipine: ["CYP3A4_SENSITIVE_SUBSTRATE"],

  // Anticoagulants & Antiplatelets
  warfarin: ["ANTICOAGULANT", "CYP2C9_SUBSTRATE"],
  dabigatran: ["ANTICOAGULANT"],
  heparin: ["ANTICOAGULANT"],
  enoxaparin: ["ANTICOAGULANT"],
  fondaparinux: ["ANTICOAGULANT"],
  aspirin: ["ANTIPLATELET", "NSAID"],
  clopidogrel: ["ANTIPLATELET", "CYP2C19_PRODRUG"],
  ticagrelor: ["ANTIPLATELET", "CYP3A4_SENSITIVE_SUBSTRATE"],
  prasugrel: ["ANTIPLATELET"],
  cilostazol: ["ANTIPLATELET"],

  // NSAIDs & Steroids
  ibuprofen: ["NSAID", "NEPHROTOXIC"],
  diclofenac: ["NSAID", "NEPHROTOXIC"],
  mefenamic_acid: ["NSAID", "NEPHROTOXIC"],
  ketorolac: ["NSAID", "NEPHROTOXIC"],
  meloxicam: ["NSAID", "NEPHROTOXIC"],
  piroxicam: ["NSAID", "NEPHROTOXIC"],
  naproxen: ["NSAID", "NEPHROTOXIC"],
  ketoprofen: ["NSAID", "NEPHROTOXIC"],
  dexketoprofen: ["NSAID", "NEPHROTOXIC"],
  indomethacin: ["NSAID", "NEPHROTOXIC"],
  celecoxib: ["NSAID", "NEPHROTOXIC", "CYP2C9_SUBSTRATE"],
  etoricoxib: ["NSAID", "NEPHROTOXIC"],
  dexamethasone: ["SYSTEMIC_CORTICOSTEROID"],
  methylprednisolone: ["SYSTEMIC_CORTICOSTEROID"],
  prednisone: ["SYSTEMIC_CORTICOSTEROID"],
  hydrocortisone: ["SYSTEMIC_CORTICOSTEROID"],
  triamcinolone: ["SYSTEMIC_CORTICOSTEROID"],
  betamethasone: ["SYSTEMIC_CORTICOSTEROID"],

  // Cardiovascular RAAS, Diuretics, Beta-blockers, Nitrates, Alpha-blockers
  captopril: ["ACEI", "K_ELEVATING"],
  enalapril: ["ACEI", "K_ELEVATING"],
  ramipril: ["ACEI", "K_ELEVATING"],
  lisinopril: ["ACEI", "K_ELEVATING"],
  perindopril: ["ACEI", "K_ELEVATING"],
  candesartan: ["ARB", "K_ELEVATING"],
  valsartan: ["ARB", "K_ELEVATING"],
  losartan: ["ARB", "K_ELEVATING", "CYP2C9_SUBSTRATE"],
  telmisartan: ["ARB", "K_ELEVATING"],
  irbesartan: ["ARB", "K_ELEVATING"],
  olmesartan: ["ARB", "K_ELEVATING"],
  sacubitril_valsartan: ["ARNI", "ARB", "K_ELEVATING"],
  spironolactone: ["K_ELEVATING"],
  potassium_chloride: ["K_ELEVATING"],
  cotrimoxazole: ["K_ELEVATING", "CYP2C9_INHIBITOR"],
  furosemide: ["LOOP_THIAZIDE_DIURETIC"],
  hydrochlorothiazide: ["LOOP_THIAZIDE_DIURETIC"],
  indapamide: ["LOOP_THIAZIDE_DIURETIC"],
  propranolol: ["BETA_BLOCKER_NONSELECTIVE"],
  carvedilol: ["BETA_BLOCKER_NONSELECTIVE"],
  timolol: ["BETA_BLOCKER_NONSELECTIVE"],
  bisoprolol: ["BETA_BLOCKER_SELECTIVE"],
  metoprolol: ["BETA_BLOCKER_SELECTIVE"],
  atenolol: ["BETA_BLOCKER_SELECTIVE"],
  nebivolol: ["BETA_BLOCKER_SELECTIVE"],
  salbutamol: ["BETA2_AGONIST"],
  salmeterol: ["BETA2_AGONIST"],
  formoterol: ["BETA2_AGONIST"],
  fenoterol: ["BETA2_AGONIST"],
  isosorbide_dinitrate: ["NITRATE"],
  nitroglycerin: ["NITRATE"],
  tamsulosin: ["ALPHA_BLOCKER"],
  terazosin: ["ALPHA_BLOCKER"],

  // Antibiotics & Antivirals
  levofloxacin: ["FLUOROQUINOLONE", "QT_PROLONGING"],
  moxifloxacin: ["FLUOROQUINOLONE", "QT_PROLONGING"],
  ofloxacin: ["FLUOROQUINOLONE", "QT_PROLONGING"],
  azithromycin: ["QT_PROLONGING"],
  tetracycline: ["TETRACYCLINE"],
  doxycycline: ["TETRACYCLINE"],
  demeclocycline: ["TETRACYCLINE"],
  meropenem: ["CARBAPENEM"],
  imipenem: ["CARBAPENEM"],
  ertapenem: ["CARBAPENEM"],
  gentamicin: ["AMINOGLYCOSIDE", "NEPHROTOXIC"],
  amikacin: ["AMINOGLYCOSIDE", "NEPHROTOXIC"],
  tobramycin: ["AMINOGLYCOSIDE", "NEPHROTOXIC"],
  vancomycin: ["NEPHROTOXIC"],
  amphotericin_b: ["NEPHROTOXIC"],
  tenofovir: ["NEPHROTOXIC"],
  acyclovir: ["NEPHROTOXIC"],
  cisplatin: ["NEPHROTOXIC"],
  linezolid: ["SEROTONERGIC"],
  isoniazid: ["HEPATOTOXIC"],
  pyrazinamide: ["HEPATOTOXIC"],
  paracetamol: ["HEPATOTOXIC"],
  metronidazole: ["CYP2C9_INHIBITOR"],
  chloroquine: ["QT_PROLONGING"],
  quinine: ["QT_PROLONGING"],

  // CNS, Psychotropics, Opioids, Antiepileptics
  fluoxetine: ["SEROTONERGIC", "CYP2D6_INHIBITOR", "CYP2C19_INHIBITOR"],
  sertraline: ["SEROTONERGIC"],
  escitalopram: ["SEROTONERGIC", "QT_PROLONGING"],
  citalopram: ["SEROTONERGIC", "QT_PROLONGING"],
  paroxetine: ["SEROTONERGIC", "CYP2D6_INHIBITOR"],
  fluvoxamine: ["SEROTONERGIC", "CYP2C19_INHIBITOR"],
  venlafaxine: ["SEROTONERGIC"],
  duloxetine: ["SEROTONERGIC", "CYP2D6_INHIBITOR"],
  amitriptyline: ["SEROTONERGIC", "ANTICHOLINERGIC", "QT_PROLONGING"],
  mirtazapine: ["SEROTONERGIC"],
  bupropion: ["CYP2D6_INHIBITOR"],
  lithium: ["LITHIUM", "SEROTONERGIC"],
  haloperidol: ["QT_PROLONGING", "DOPAMINE_ANTAGONIST"],
  chlorpromazine: ["QT_PROLONGING", "ANTICHOLINERGIC", "DOPAMINE_ANTAGONIST"],
  risperidone: ["QT_PROLONGING", "DOPAMINE_ANTAGONIST"],
  olanzapine: ["ANTICHOLINERGIC", "DOPAMINE_ANTAGONIST"],
  clozapine: ["QT_PROLONGING", "ANTICHOLINERGIC"],
  trifluoperazine: ["DOPAMINE_ANTAGONIST"],
  ondansetron: ["QT_PROLONGING", "SEROTONERGIC"],
  metoclopramide: ["DOPAMINE_ANTAGONIST", "SEROTONERGIC"],
  levodopa: ["LEVODOPA_AGONIST"],
  pramipexole: ["LEVODOPA_AGONIST"],
  ropinirole: ["LEVODOPA_AGONIST"],
  tramadol: ["OPIOID", "SEROTONERGIC", "CYP2D6_PRODRUG"],
  morphine: ["OPIOID"],
  fentanyl: ["OPIOID", "SEROTONERGIC", "CYP3A4_SENSITIVE_SUBSTRATE"],
  codeine: ["OPIOID", "CYP2D6_PRODRUG"],
  oxycodone: ["OPIOID", "CYP3A4_SENSITIVE_SUBSTRATE"],
  pethidine: ["OPIOID", "SEROTONERGIC"],
  diazepam: ["BENZO_SEDATIVE"],
  lorazepam: ["BENZO_SEDATIVE"],
  clonazepam: ["BENZO_SEDATIVE"],
  chlordiazepoxide: ["BENZO_SEDATIVE"],
  zolpidem: ["BENZO_SEDATIVE"],
  gabapentin: ["GABAPENTINOID"],
  pregabalin: ["GABAPENTINOID"],
  dextromethorphan: ["SEROTONERGIC"],
  sumatriptan: ["SEROTONERGIC"],
  valproate: ["VALPROATE", "HEPATOTOXIC"],
  atropine: ["ANTICHOLINERGIC"],
  hyoscine: ["ANTICHOLINERGIC"],
  trihexyphenidyl: ["ANTICHOLINERGIC"],
  diphenhydramine: ["ANTICHOLINERGIC"],
  chlorpheniramine: ["ANTICHOLINERGIC"],
  donepezil: ["CHOLINESTERASE_INHIBITOR", "QT_PROLONGING"],

  // GI, Endocrine, Oncology, DGIdb, Polyvalent Cations, NMBA
  omeprazole: ["PPI", "CYP2C19_INHIBITOR"],
  esomeprazole: ["PPI", "CYP2C19_INHIBITOR"],
  lansoprazole: ["PPI"],
  pantoprazole: ["PPI"],
  rabeprazole: ["PPI"],
  calcium: ["POLYVALENT_CATION"],
  iron: ["POLYVALENT_CATION"],
  zinc: ["POLYVALENT_CATION"],
  antacid: ["POLYVALENT_CATION"],
  sucralfate: ["POLYVALENT_CATION"],
  insulin: ["HYPOGLYCEMIC_AGENT"],
  glimepiride: ["HYPOGLYCEMIC_AGENT", "CYP2C9_SUBSTRATE"],
  gliclazide: ["HYPOGLYCEMIC_AGENT", "CYP2C9_SUBSTRATE"],
  glibenclamide: ["HYPOGLYCEMIC_AGENT", "CYP2C9_SUBSTRATE"],
  methotrexate: ["METHOTREXATE", "HEPATOTOXIC"],
  tamoxifen: ["CYP2D6_PRODRUG"],
  allopurinol: ["XANTHINE_OXIDASE_INHIBITOR"],
  febuxostat: ["XANTHINE_OXIDASE_INHIBITOR"],
  azathioprine: ["THIOPURINE"],
  mercaptopurine: ["THIOPURINE"],
  rocuronium: ["NMBA"],
  atracurium: ["NMBA"],
};

interface ClassRule {
  id: string;
  tagA: PharmTag;
  tagB: PharmTag;
  allowSameTag?: boolean;
  severity: "CRITICAL" | "WARNING" | "INFO";
  mechanism: (nameA: string, nameB: string) => string;
  recommendation: (nameA: string, nameB: string) => string;
  evidence: string;
}

const CLASS_INTERACTION_RULES: ClassRule[] = [
  {
    id: "rule_arni_acei",
    tagA: "ARNI",
    tagB: "ACEI",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi penghambat neprilisin/ARB (${a}) dengan ACE inhibitor (${b}) menghambat degradasi bradikinin secara ganda sehingga sangat meningkatkan risiko angioedema saluran napas yang mengancam jiwa, hipotensi berat, dan gagal ginjal akut.`,
    recommendation: () =>
      "KONTRAINDIKASI MUTLAK. Wajib menerapkan periode washout minimal 36 jam saat beralih dari ACE inhibitor ke Sakubitril/Valsartan (atau sebaliknya).",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape (Contraindicated) • MIMS Indonesia (Uperio) • FDA Boxed Warning.",
  },
  {
    id: "rule_nitrate_pde5",
    tagA: "NITRATE",
    tagB: "PDE5_INHIBITOR",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Nitrat (${a}) meningkatkan produksi oksida nitrat (NO)/cGMP sedangkan inhibitor PDE-5 (${b}) menghambat pemecahan cGMP. Sinergisme vasodilatasi ini memicu penurunan tekanan darah sistemik drastis (hipotensi berat/syok), iskemia miokard, hingga henti jantung.`,
    recommendation: () =>
      "KONTRAINDIKASI MUTLAK. Jangan pernah memberikan nitrat dalam 24 jam setelah Sildenafil atau 48 jam setelah Tadalafil.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape (Contraindicated) • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_carbapenem_valproate",
    tagA: "CARBAPENEM",
    tagB: "VALPROATE",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Antibiotik karbapenem (${a}) menghambat enzim acylpeptide hydrolase di hati sehingga memblokir hidrolisis valproat-glukuronida kembali menjadi asam valproat (${b}) dan meningkatkan klirens renalnya. Kadar serum valproat anjlok 60–90% dalam 24–48 jam, memicu kejang berulang hingga status epileptikus.`,
    recommendation: () =>
      "HINDARI KOMBINASI INI. Ganti antibiotik ke golongan non-karbapenem bila sensitif, atau tambahkan antikonvulsan alternatif (mis. Levetiracetam/Fenitoin) karena menaikkan dosis valproat umumnya TIDAK mampu mengatasi penurunan kadarnya.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape (Avoid/Use Alternative) • MIMS Indonesia • Zenodo DDI Corpus.",
  },
  {
    id: "rule_xo_thiopurine",
    tagA: "XANTHINE_OXIDASE_INHIBITOR",
    tagB: "THIOPURINE",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Inhibitor xantin oksidase (${a}) memblokir jalur metabolisme inaktivasi utama dari tiopurin (${b}) yang bergantung pada enzim XDH/XO (DGIdb), sehingga metabolit sitotoksik 6-TGN terakumulasi 3–4 kali lipat dan memicu pansitopenia/mielosupresi berat yang berpotensi fatal.`,
    recommendation: () =>
      "KONTRAINDIKASI (terutama Febuxostat + Azatioprin/6-MP). Jika Allopurinol wajib bersama Azatioprin/6-MP, turunkan dosis tiopurin sebesar 67–75% (menjadi 25–33% dosis normal) dan pantau darah lengkap (CBC) setiap minggu.",
    evidence: "DGIdb (XDH/TPMT Drug-Gene Pathway) • DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_cyp3a4_strong_inhib_sub",
    tagA: "STRONG_CYP3A4_INHIBITOR",
    tagB: "CYP3A4_SENSITIVE_SUBSTRATE",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Inhibitor kuat enzim sitokrom P450 CYP3A4/P-gp (${a}) menghambat metabolisme lintas pertama dan klirens sistemik dari substrat sensitif CYP3A4 (${b}). Akibatnya paparan plasma (AUC) ${b} meningkat tajam dan memicu toksisitas berat (miopati/rabdomiolisis, perdarahan, sedasi dalam, atau aritmia QT).`,
    recommendation: () =>
      "Hindari kombinasi bersamaan. Pilih agen alternatif yang tidak dimetabolisme melalui CYP3A4 (misalnya Pravastatin/Rosuvastatin untuk statin, Azitromisin untuk makrolida, atau Lorazepam untuk sedatif). Bila terpaksa digunakan, turunkan dosis substrat dan pantau toksisitas secara ketat.",
    evidence: "DDInter 2.0 (CYP3A4 Major) • Drugs.com • Medscape • MIMS Indonesia • Zenodo DDI Corpus.",
  },
  {
    id: "rule_cyp3a4_inducer_sub",
    tagA: "STRONG_CYP3A4_INDUCER",
    tagB: "CYP3A4_SENSITIVE_SUBSTRATE",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Induktor kuat CYP3A4/P-gp (${a}) mempercepat metabolisme hati dan usus terhadap substrat CYP3A4 (${b}), menurunkan kadar plasma ${b} secara drastis (hingga 50–95%) dan berisiko tinggi menyebabkan kegagalan terapi klinis.`,
    recommendation: () =>
      "Pantau respons terapi secara ketat; pertimbangkan peningkatan dosis substrat atau beralih ke obat alternatif yang tidak dimetabolisme oleh CYP3A4. Ingat untuk menurunkan kembali dosis setelah induktor dihentikan (efek induksi bertahan 1–2 minggu).",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_opioid_benzo",
    tagA: "OPIOID",
    tagB: "BENZO_SEDATIVE",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Penggunaan bersamaan analgesik opioid (${a}) dan depresan SSP benzodiazepin/sedatif (${b}) menghasilkan efek sinergis depresi pusat pernapasan di batang otak, memicu sedasi ekstrem, hipoventilasi, koma, hingga kematian (FDA Boxed Warning).`,
    recommendation: () =>
      "Hindari kombinasi kecuali tidak ada alternatif adekuat. Gunakan dosis efektif terendah dan durasi tersingkat, pantau saturasi oksigen (SpO2) serta laju napas, dan siapkan antidotum Nalokson bila dirawat inap.",
    evidence: "FDA Boxed Warning • DDInter 2.0 • Drugs.com (Major) • Medscape • WebMD.",
  },
  {
    id: "rule_opioid_gabapentinoid",
    tagA: "OPIOID",
    tagB: "GABAPENTINOID",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kombinasi opioid (${a}) dengan gabapentinoid (${b}) meningkatkan risiko depresi sistem saraf pusat, pusing berat, somnolen, dan depresi napas terutama pada pasien lansia atau penderita PPOK/gangguan ginjal.`,
    recommendation: () =>
      "Mulai gabapentinoid dari dosis rendah, pantau tanda sedasi berlebihan dan fungsi pernapasan, serta edukasi pasien menghindari aktivitas berkendara.",
    evidence: "FDA Drug Safety Communication (2019) • DDInter 2.0 • Drugs.com • Medscape • WebMD.",
  },
  {
    id: "rule_serotonin_syndrome",
    tagA: "SEROTONERGIC",
    tagB: "SEROTONERGIC",
    allowSameTag: true,
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi dua agen serotonergik (${a} + ${b}) meningkatkan aktivitas serotonin sinaptik secara berlebihan di sistem saraf pusat, berisiko memicu Sindrom Serotonin (agitasi, hipertermia, diaforesis, takikardia, klonus, hiperrefleksia, dan instabilitas otonom).`,
    recommendation: () =>
      "Hindari kombinasi terutama yang melibatkan Linezolid atau dosis tinggi SSRI/SNRI + Opioid serotonergik. Jika mutlak diperlukan, gunakan dosis serendah mungkin dan pantau ketat gejala sindrom serotonin (kriteria Hunter) terutama 24–72 jam pertama.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_qt_prolongation",
    tagA: "QT_PROLONGING",
    tagB: "QT_PROLONGING",
    allowSameTag: true,
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi dua obat pemanjang interval QT (${a} + ${b}) menghambat kanal kalium hERG kardiak secara aditif, memperpanjang repolarisasi ventrikel (QTc > 500 ms) dan meningkatkan risiko aritmia ventrikel fatal Torsades de Pointes (TdP).`,
    recommendation: () =>
      "Hindari kombinasi bila memungkinkan, terutama pada pasien dengan hipokalemia, hipomagnesemia, bradikardia, gagal jantung, atau sindrom QT panjang. Bila tidak terhindarkan, lakukan pemantauan EKG (interval QTc) dan koreksi elektrolit (K+ > 4.0 mEq/L, Mg2+ > 2.0 mg/dL).",
    evidence: "CredibleMeds QT List • DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_anticoag_nsaid",
    tagA: "ANTICOAGULANT",
    tagB: "NSAID",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `OAINS (${b}) merusak mukosa saluran cerna melalui inhibisi COX-1 dan mengganggu agregasi trombosit, sementara antikoagulan (${a}) menghambat kaskade pembekuan darah. Kombinasi ini meningkatkan risiko perdarahan gastrointestinal mayor dan perdarahan intrakranial 3–6 kali lipat.`,
    recommendation: () =>
      "Hindari penggunaan OAINS sistemik pada pasien antikoagulan. Gunakan Parasetamol dosis moderat atau analgesik topikal. Bila OAINS mutlak diperlukan jangka pendek, wajib tambahkan gastroprotektor PPI (mis. Pantoprazol/Lansoprazol) dan pantau tanda perdarahan/Hb.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_anticoag_anticoag",
    tagA: "ANTICOAGULANT",
    tagB: "ANTICOAGULANT",
    allowSameTag: true,
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Duplikasi terapi antikoagulan (${a} + ${b}) menghasilkan efek antikoagulasi aditif/sinergis yang sangat meningkatkan risiko perdarahan masif gastrointestinal, retroperitoneal, dan intrakranial.`,
    recommendation: () =>
      "Hindari pemberian ganda kecuali pada protokol bridging terkontrol (mis. bridging Heparin/LMWH saat inisiasi Warfarin hingga INR mencapai target terapeutik 2.0–3.0). Pantau ketat aPTT, INR, Hb, dan tanda perdarahan aktif.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape (Contraindicated/Serious) • MIMS Indonesia.",
  },
  {
    id: "rule_anticoag_antiplatelet",
    tagA: "ANTICOAGULANT",
    tagB: "ANTIPLATELET",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kombinasi antikoagulan (${a}) dan antiplatelet (${b}) menghambat hemostasis primer (trombosit) dan sekunder (fibrin) secara bersamaan, sehingga melipatgandakan risiko perdarahan mayor termasuk perdarahan saluran cerna.`,
    recommendation: () =>
      "Hanya gunakan bersama jika ada indikasi kardiologi spesifik (mis. fibrilasi atrium + sindrom koroner akut/pemasangan stent). Tambahkan profilaksis PPI (Pantoprazol/Lansoprazol), gunakan durasi seminimal mungkin sesuai pedoman ESC/AHA, dan pantau Hb/INR.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • ESC/AHA Guidelines.",
  },
  {
    id: "rule_dual_raas",
    tagA: "ACEI",
    tagB: "ARB",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Blokade ganda sistem Renin-Angiotensin-Aldosteron (RAAS) dengan menggabungkan ACE inhibitor (${a}) dan ARB (${b}) tidak memberikan manfaat kardiovaskular tambahan, melainkan secara bermakna meningkatkan risiko hipotensi simtomatik, hiperkalemia berat, dan gagal ginjal akut (studi ONTARGET/VA NEPHRON-D).`,
    recommendation: () =>
      "TIDAK DIREKOMENDASIKAN / KONTRAINDIKASI KLINIS (terutama pada diabetes atau PGK). Pilih salah satu saja (ACEi ATAU ARB) dan optimalkan dosis atau kombinasikan dengan golongan lain seperti CCB atau diuretik.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • ONTARGET Trial (NEJM).",
  },
  {
    id: "rule_k_elevating",
    tagA: "K_ELEVATING",
    tagB: "K_ELEVATING",
    allowSameTag: true,
    severity: "WARNING",
    mechanism: (a, b) =>
      `Penggunaan bersamaan dua agen yang menurunkan ekskresi atau menambah beban kalium (${a} + ${b}) meningkatkan risiko hiperkalemia (>5.5 mEq/L) yang dapat memicu kelemahan otot hingga aritmia jantung fatal, terutama pada pasien gagal ginjal (eGFR < 45) atau lansia.`,
    recommendation: () =>
      "Pantau kadar kalium serum dan kreatinin dalam 3–7 hari setelah memulai kombinasi dan secara berkala. Hindari suplemen kalium tambahan atau garam diet KCl kecuali terdapat hipokalemia terdokumentasi.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_raas_nsaid",
    tagA: "ACEI",
    tagB: "NSAID",
    severity: "WARNING",
    mechanism: (a, b) =>
      `OAINS (${b}) menghambat sintesis prostaglandin vasodilator arteriol aferen ginjal, sedangkan ACEi (${a}) mendilatasi arteriol eferen. Kombinasi ini menurunkan tekanan filtrasi glomerulus (risiko gagal ginjal akut / AKI), menurunkan efek antihipertensi, serta memicu hiperkalemia.`,
    recommendation: () =>
      "Hindari penggunaan OAINS rutin pada pasien terapi ACEi/ARB, terutama bila juga mengonsumsi diuretik (risiko 'Triple Whammy'). Pantau tekanan darah, kreatinin serum, dan kalium; pertimbangkan Parasetamol.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_arb_nsaid",
    tagA: "ARB",
    tagB: "NSAID",
    severity: "WARNING",
    mechanism: (a, b) =>
      `OAINS (${b}) menurunkan prostaglandin ginjal yang menyebabkan vasokonstriksi arteriol aferen, sementara ARB (${a}) menurunkan tonus arteriol eferen. Interaksi ini melemahkan kontrol tekanan darah dan meningkatkan risiko cedera ginjal akut (AKI) serta hiperkalemia.`,
    recommendation: () =>
      "Batasi penggunaan OAINS, jaga hidrasi adekuat, dan pantau serum kreatinin/eGFR serta tekanan darah. Gunakan analgesik non-OAINS bila memungkinkan.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_steroid_nsaid",
    tagA: "SYSTEMIC_CORTICOSTEROID",
    tagB: "NSAID",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi kortikosteroid sistemik (${a}) dan OAINS (${b}) merusak mekanisme pertahanan mukosa lambung secara sinergis, meningkatkan risiko tukak lambung, perforasi, dan perdarahan saluran cerna atas hingga 4–15 kali lipat.`,
    recommendation: () =>
      "Hindari penggunaan bersamaan bila memungkinkan. Jika terapi ganda mutlak diperlukan, wajib berikan profilaksis Proton Pump Inhibitor (PPI) dan edukasi pasien mewaspadai nyeri ulu hati atau BAB hitam (melena).",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_cyp2c19_clopidogrel",
    tagA: "CYP2C19_INHIBITOR",
    tagB: "CYP2C19_PRODRUG",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `${b} adalah prodrug yang memerlukan aktivasi enzimatik melalui CYP2C19 (jalur farmakogenomik DGIdb) menjadi metabolit tiol aktif. Inhibitor CYP2C19 (${a}) menghambat konversi ini hingga 45%, menurunkan inhibisi agregasi trombosit dan meningkatkan risiko trombosis stent/infark miokard berulang.`,
    recommendation: () =>
      "Hindari kombinasi ini. Jika pasien membutuhkan PPI bersama Klopidogrel, ganti ke Pantoprazol atau Rabeprazol yang memiliki inhibisi minimal terhadap CYP2C19.",
    evidence: "DGIdb (CYP2C19) • FDA Warning • DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_cyp2d6_prodrug",
    tagA: "CYP2D6_INHIBITOR",
    tagB: "CYP2D6_PRODRUG",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Inhibitor CYP2D6 (${a}) menghambat bioaktivasi prodrug yang bergantung pada gen CYP2D6 (${b}: mis. Tamoksifen → endoksifen, Kodein → morfin, Tramadol → O-desmetiltramadol), mengakibatkan penurunan tajam efikasi klinis (kegagalan proteksi kanker payudara atau hilangnya efek analgesik).`,
    recommendation: () =>
      "Ganti inhibitor CYP2D6 poten dengan alternatif yang tidak menghambat CYP2D6 (misalnya Venlafaksin/Citalopram/Escitalopram pada pengguna Tamoksifen) atau pilih analgesik non-prodrug CYP2D6.",
    evidence: "DGIdb (CYP2D6 Phenoconversion) • CPIC Guidelines • DDInter 2.0 • Drugs.com • Medscape.",
  },
  {
    id: "rule_cyp2c9_inhib_sub",
    tagA: "CYP2C9_INHIBITOR",
    tagB: "CYP2C9_SUBSTRATE",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Inhibitor enzim CYP2C9 (${a}) menghambat metabolisme hepatik substrat CYP2C9 (${b}), meningkatkan kadar plasma obat dan risiko efek toksik spesifik (lonjakan INR/perdarahan pada Warfarin, hipoglikemia berat pada Sulfonilurea, atau toksisitas neurologis pada Fenitoin).`,
    recommendation: () =>
      "Pantau parameter klinis dan laboratorium secara ketat (INR untuk Warfarin, gula darah untuk Sulfonilurea, kadar obat/nistagmus untuk Fenitoin) dan siapkan penurunan dosis substrat sebesar 25–50%.",
    evidence: "DGIdb (CYP2C9) • DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_bb_nondhp_ccb",
    tagA: "BETA_BLOCKER_SELECTIVE",
    tagB: "NON_DHP_CCB",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi penyekat beta (${a}) dan penghambat kanal kalsium non-dihidropiridin (${b}) memberikan efek kronotropik negatif, dromotropik negatif, dan inotropik negatif secara aditif pada nodus SA/AV jantung, memicu bradikardia berat, blok AV derajat tinggi, hingga gagal jantung akut.`,
    recommendation: () =>
      "Hindari kombinasi terutama pada pasien dengan gangguan konduksi jantung atau fraksi ejeksi rendah (HFrEF). Bila dibutuhkan untuk kontrol laju AF, gunakan di bawah pemantauan EKG dan denyut jantung ketat, atau ganti CCB ke golongan dihidropiridin (Amlodipin).",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_bb_nonselective_nondhp_ccb",
    tagA: "BETA_BLOCKER_NONSELECTIVE",
    tagB: "NON_DHP_CCB",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Penyekat beta non-selektif (${a}) bersama CCB non-dihidropiridin (${b}) menekan konduksi nodus AV dan kontraktilitas miokard secara sinergis, berisiko tinggi menimbulkan bradikardia simtomatik, blok jantung total, dan hipotensi berat.`,
    recommendation: () =>
      "Kontraindikasi relatif hingga mutlak (khususnya pemberian IV). Pantau EKG, denyut nadi, dan tekanan darah secara ketat atau alihkan ke CCB dihidropiridin (Amlodipin).",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_bb_nonselective_beta2",
    tagA: "BETA_BLOCKER_NONSELECTIVE",
    tagB: "BETA2_AGONIST",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Beta-blocker non-selektif (${a}) memblokir reseptor beta-2 bronkus secara kompetitif dan meniadakan efek bronkodilatasi dari agonis beta-2 (${b}), berisiko memicu bronkospasme akut yang berat pada pasien asma/PPOK.`,
    recommendation: () =>
      "Hindari penggunaan beta-blocker non-selektif pada pasien yang menggunakan bronkodilator agonis beta-2. Jika beta-blocker sangat dibutuhkan, pertimbangkan agen kardioselektif beta-1 dosis rendah (Bisoprolol/Metoprolol) dengan pemantauan respirasi.",
    evidence: "GINA Guidelines • DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_cation_fq",
    tagA: "POLYVALENT_CATION",
    tagB: "FLUOROQUINOLONE",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kation polivalen bermuatan ganda/tiga (Ca2+, Mg2+, Al3+, Fe2+, Zn2+) dalam ${a} membentuk kompleks kelat tidak larut dengan antibiotik fluorokuinolon (${b}) di lumen saluran cerna, menurunkan absorpsi antibiotik hingga 50–90% dan memicu kegagalan terapi infeksi.`,
    recommendation: () =>
      "Pisahkan jadwal minum obat: berikan fluorokuinolon minimal 2 jam SEBELUM atau 4–6 jam SETELAH konsumsi sediaan kalsium, zat besi, zink, antasida, atau sukralfat.",
    evidence: "DDInter 2.0 • Drugs.com (Major/Moderate) • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_cation_tetra",
    tagA: "POLYVALENT_CATION",
    tagB: "TETRACYCLINE",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kation polivalen dari ${a} mengkelat antibiotik tetrasiklin (${b}) di saluran pencernaan menjadi garam kompleks yang tidak dapat diserap mukosa usus, menurunkan kadar terapeutik antibiotik secara bermakna.`,
    recommendation: () =>
      "Beri jeda waktu pemberian minimal 2–3 jam antara antibiotik golongan tetrasiklin dengan antasida, suplemen kalsium, zat besi, zink, atau sukralfat.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_fq_steroid",
    tagA: "FLUOROQUINOLONE",
    tagB: "SYSTEMIC_CORTICOSTEROID",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Kombinasi antibiotik fluorokuinolon (${a}) dengan kortikosteroid sistemik (${b}) meningkatkan degradasi kolagen matriks ekstraseluler tendon (terutama tendon Achilles), melipatgandakan risiko tendinitis dan ruptur tendon akut khususnya pada pasien usia > 60 tahun atau penerima transplantasi.`,
    recommendation: () =>
      "Hindari kombinasi bila tersedia antibiotik alternatif yang sensitif. Bila terpaksa digunakan, edukasi pasien segera menghentikan fluorokuinolon dan melapor bila timbul nyeri, bengkak, atau radang pada tumit/tendon.",
    evidence: "FDA Boxed Warning • DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_nephrotoxic_pair",
    tagA: "NEPHROTOXIC",
    tagB: "NEPHROTOXIC",
    allowSameTag: true,
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kombinasi dua agen yang bersifat nefrotoksik (${a} + ${b}) menimbulkan efek toksik aditif pada tubulus proksimal dan perfusi korteks ginjal, meningkatkan kejadian cedera ginjal akut (Acute Kidney Injury / AKI).`,
    recommendation: () =>
      "Evaluasi perlunya terapi kombinasi; pastikan status hidrasi pasien adekuat, sesuaikan dosis berdasarkan eGFR/CrCl, dan pantau kreatinin serum, BUN, serta produksi urin (urine output) secara berkala.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • Zenodo DDI Corpus.",
  },
  {
    id: "rule_mtx_nsaid",
    tagA: "METHOTREXATE",
    tagB: "NSAID",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `OAINS (${b}) menurunkan aliran darah ginjal dan bersaing pada transporter sekresi tubulus renal OAT1/OAT3 sehingga menghambat eliminasi Metotreksat (${a}). Akumulasi Metotreksat memicu toksisitas berat berupa pansitopenia, mukositis, hepatotoksisitas, dan gagal ginjal.`,
    recommendation: () =>
      "KONTRAINDIKASI pada Metotreksat dosis tinggi (onkologi). Pada dosis rendah reumatologi, hindari OAINS bila memungkinkan atau pantau ketat darah lengkap (CBC), fungsi hati (SGOT/SGPT), dan serum kreatinin.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • Zenodo DDI Corpus.",
  },
  {
    id: "rule_mtx_ppi",
    tagA: "METHOTREXATE",
    tagB: "PPI",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Proton Pump Inhibitor (${b}) menghambat transporter efflux ginjal BCRP (ABCG2) dan H+/K+-ATPase renal, memperlambat ekskresi Metotreksat (${a}) dan metabolit aktif 7-hidroksimetotreksat sehingga meningkatkan risiko toksisitas hematologi dan mukositis.`,
    recommendation: () =>
      "Hentikan sementara PPI saat pemberian Metotreksat dosis tinggi dan ganti sementara dengan H2-blocker (Famotidin). Pada dosis rendah, pantau ketat toksisitas Metotreksat.",
    evidence: "DGIdb (ABCG2/BCRP) • FDA Label Update • DDInter 2.0 • Drugs.com • Medscape.",
  },
  {
    id: "rule_aminoglycoside_nmba",
    tagA: "AMINOGLYCOSIDE",
    tagB: "NMBA",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Antibiotik aminoglikosida (${a}) menghambat pelepasan asetilkolin presinaptik di sambungan neuromuskular, sehingga memperkuat dan memperpanjang blokade neuromuskular dari ${b} dengan risiko paralisis otot napas dan apnea berkepanjangan pascaoperasi.`,
    recommendation: () =>
      "Pantau blokade neuromuskular secara ketat (Train-of-Four / TOF) dan siapkan dukungan ventilasi mekanik serta agen reversal (Sugammadex/Neostigmin). Pertimbangkan penyesuaian dosis pelumpuh otot.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_dopamine_antagonist_levodopa",
    tagA: "DOPAMINE_ANTAGONIST",
    tagB: "LEVODOPA_AGONIST",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `Antagonis reseptor dopamin D2 sentral (${a}) secara langsung menentang kerja terapi dopaminergik Parkinson (${b}), memperburuk gejala ekstrapiramidal (rigiditas, bradikinesia, tremor) dan menurunkan efektivitas terapi antiparkinson.`,
    recommendation: () =>
      "Hindari kombinasi ini. Jika pasien Parkinson memerlukan antiemetik, gunakan Domperidon (tidak menembus sawar darah otak secara bermakna) atau Ondansetron; jika memerlukan antipsikotik, pertimbangkan Quetiapin atau Klozapin dosis rendah.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_lithium_nsaid",
    tagA: "LITHIUM",
    tagB: "NSAID",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `OAINS (${b}) menghambat prostaglandin renal sehingga menurunkan klirens ginjal Litium (${a}) sebesar 15–60%, menyebabkan akumulasi kadar Litium serum ke rentang toksik (>1.5 mEq/L: tremor kasar, ataksia, konfusi, kejang, nefrotoksisitas).`,
    recommendation: () =>
      "Hindari penggunaan OAINS bersama Litium; gunakan Parasetamol sebagai analgesik. Jika OAINS tidak terhindarkan, pantau kadar Litium serum dalam 3–5 hari dan sesuaikan dosis Litium.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_lithium_raas",
    tagA: "LITHIUM",
    tagB: "ACEI",
    severity: "CRITICAL",
    mechanism: (a, b) =>
      `ACE inhibitor (${b}) menurunkan filtrasi glomerulus dan meningkatkan reabsorpsi natrium serta Litium di tubulus proksimal ginjal, berisiko meningkatkan kadar serum Litium (${a}) hingga memicu toksisitas Litium berat.`,
    recommendation: () =>
      "Pantau kadar Litium serum secara ketat (setiap minggu pada bulan pertama), evaluasi tanda toksisitas (tremor, diare, ataksia, bingung), dan pertimbangkan antihipertensi golongan CCB.",
    evidence: "DDInter 2.0 • Drugs.com (Major) • Medscape • WebMD.",
  },
  {
    id: "rule_anticholinergic_chei",
    tagA: "ANTICHOLINERGIC",
    tagB: "CHOLINESTERASE_INHIBITOR",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Efek antikolinergik (${a}) secara farmakodinamik melawan mekanisme kerja penghambat kolinesterase (${b}) yang meningkatkan asetilkolin di otak, sehingga meniadakan manfaat terapi demensia/Alzheimer dan memicu delirium atau kebingungan akut.`,
    recommendation: () =>
      "Hindari obat dengan beban antikolinergik tinggi pada pasien yang menerima penghambat kolinesterase. Ganti dengan alternatif non-antikolinergik (mis. Cetirizin/Loratadin sebagai pengganti CTM/Difenhidramin).",
    evidence: "AGS Beers Criteria • DDInter 2.0 • Drugs.com • Medscape • WebMD.",
  },
  {
    id: "rule_hypoglycemic_steroid",
    tagA: "HYPOGLYCEMIC_AGENT",
    tagB: "SYSTEMIC_CORTICOSTEROID",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kortikosteroid sistemik (${b}) meningkatkan glukoneogenesis hati dan resistensi insulin perifer, sehingga melawan efek penurun gula darah dari ${a} dan memicu hiperglikemia postprandial berat.`,
    recommendation: () =>
      "Tingkatkan frekuensi pemantauan gula darah (terutama siang dan sore hari). Dosis obat antidiabetes/insulin sering perlu disesuaikan naik selama terapi steroid dan diturunkan kembali saat steroid dihentikan (tapering).",
    evidence: "ADA Standards of Care • DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia.",
  },
  {
    id: "rule_hypoglycemic_bb_nonselective",
    tagA: "HYPOGLYCEMIC_AGENT",
    tagB: "BETA_BLOCKER_NONSELECTIVE",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Beta-blocker non-selektif (${b}) menutupi gejala peringatan hipoglikemia (takikardia, palpitasi, tremor) akibat ${a} serta menghambat glikogenolisis hepatik yang memperlambat pemulihan kadar gula darah.`,
    recommendation: () =>
      "Edukasi pasien bahwa keringat dingin tetap muncul sebagai tanda hipoglikemia; lakukan cek gula darah kapiler (SMBG) lebih rutin atau pertimbangkan beta-blocker kardioselektif.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_pde5_alpha_blocker",
    tagA: "PDE5_INHIBITOR",
    tagB: "ALPHA_BLOCKER",
    severity: "WARNING",
    mechanism: (a, b) =>
      `Kombinasi inhibitor PDE-5 (${a}) dan penghambat reseptor alfa-1 (${b}) menimbulkan efek vasodilatasi aditif yang meningkatkan risiko hipotensi ortostatik simtomatik, pusing hebat, dan sinkop (pingsan).`,
    recommendation: () =>
      "Pastikan pasien sudah stabil pada terapi alpha-blocker sebelum memulai PDE-5 inhibitor dari dosis terendah, serta pisahkan waktu konsumsi beberapa jam.",
    evidence: "DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia • WebMD.",
  },
  {
    id: "rule_hepatotoxic_pair",
    tagA: "HEPATOTOXIC",
    tagB: "HEPATOTOXIC",
    allowSameTag: true,
    severity: "WARNING",
    mechanism: (a, b) =>
      `Penggunaan bersamaan dua obat dengan potensi hepatotoksik (${a} + ${b}) meningkatkan stres oksidatif hepatoseluler dan risiko cedera hati imbas obat (Drug-Induced Liver Injury / DILI).`,
    recommendation: () =>
      "Pantau fungsi hati baseline dan berkala (SGOT/AST, SGPT/ALT, bilirubin total). Edukasi pasien segera melapor jika muncul ikterus (mata/kulit kuning), urin gelap, mual berat, atau nyeri perut kanan atas.",
    evidence: "LiverTox NIH • DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia.",
  },
];

/**
 * Evaluates pharmacological class, CYP/P-gp, and DGIdb drug-gene interaction rules
 * between two canonical substances whenever no explicit pair exists in the curated database.
 */
export function evaluateClassBasedInteractions(
  canonicalA: string,
  nameA: string,
  canonicalB: string,
  nameB: string
): DrugInteraction[] {
  if (!canonicalA || !canonicalB || canonicalA === canonicalB) {
    return [];
  }

  const tagsA = SUBSTANCE_TAGS[canonicalA] || [];
  const tagsB = SUBSTANCE_TAGS[canonicalB] || [];
  if (tagsA.length === 0 || tagsB.length === 0) {
    return [];
  }

  const results: DrugInteraction[] = [];
  const matchedRuleIds = new Set<string>();

  for (const rule of CLASS_INTERACTION_RULES) {
    if (matchedRuleIds.has(rule.id)) continue;

    // Avoid firing benign NSAID+NSAID via unrelated rules, or duplicate same-tag unless allowed
    if (rule.tagA === rule.tagB && !rule.allowSameTag) continue;

    const forwardMatch = tagsA.includes(rule.tagA) && tagsB.includes(rule.tagB);
    const reverseMatch = tagsA.includes(rule.tagB) && tagsB.includes(rule.tagA);

    if (forwardMatch || reverseMatch) {
      // Skip paracetamol + paracetamol or minor NSAID + NSAID nephrotoxic spam if aspirin low dose + ibuprofen already covered explicitly
      if (rule.id === "rule_nephrotoxic_pair" && tagsA.includes("NSAID") && tagsB.includes("NSAID")) {
        // Handle NSAID+NSAID via explicit or skip redundant nephrotoxic duplicate
        continue;
      }

      matchedRuleIds.add(rule.id);
      const firstDrug = forwardMatch ? nameA : nameB;
      const secondDrug = forwardMatch ? nameB : nameA;
      const sortedPair = [canonicalA, canonicalB].sort().join("__");

      results.push({
        id: `engine_${rule.id}_${sortedPair}`,
        drugAId: canonicalA,
        drugBId: canonicalB,
        drugAName: firstDrug,
        drugBName: secondDrug,
        severity: rule.severity,
        mechanism: rule.mechanism(firstDrug, secondDrug),
        recommendation: rule.recommendation(firstDrug, secondDrug),
        evidence: `${rule.evidence} [Mesin Deteksi Jalur Farmakologi & CYP/DGIdb]`,
      });
    }
  }

  // Sort CRITICAL first, then WARNING, then INFO
  const rank = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  results.sort((a, b) => rank[a.severity] - rank[b.severity]);

  // Return top 2 most clinically significant distinct mechanisms to keep UI crisp
  return results.slice(0, 2);
}

/**
 * Detects multi-drug (3+ drug) high-risk syndromes in a patient's medication basket,
 * such as the classic "Triple Whammy" (ACEi/ARB + Diuretic + NSAID) or High QT Burden (>= 3 QT drugs).
 */
export interface PolypharmacySyndromeAlert {
  id: string;
  title: string;
  severity: "CRITICAL" | "WARNING";
  involvedDrugs: string[];
  mechanism: string;
  recommendation: string;
  evidence: string;
}

export function detectPolypharmacySyndromes(
  items: Array<{ canonical: string; name: string }>
): PolypharmacySyndromeAlert[] {
  const alerts: PolypharmacySyndromeAlert[] = [];
  if (items.length < 3) return alerts;

  const raasDrugs = items.filter(i => {
    const t = SUBSTANCE_TAGS[i.canonical] || [];
    return t.includes("ACEI") || t.includes("ARB") || t.includes("ARNI");
  });
  const diuretics = items.filter(i => (SUBSTANCE_TAGS[i.canonical] || []).includes("LOOP_THIAZIDE_DIURETIC"));
  const nsaids = items.filter(i => {
    const t = SUBSTANCE_TAGS[i.canonical] || [];
    return t.includes("NSAID") && i.canonical !== "aspirin";
  });

  if (raasDrugs.length > 0 && diuretics.length > 0 && nsaids.length > 0) {
    alerts.push({
      id: "syndrome_triple_whammy",
      title: "Sindrom 'Triple Whammy' Ginjal (ACEi/ARB + Diuretik + OAINS)",
      severity: "CRITICAL",
      involvedDrugs: [raasDrugs[0].name, diuretics[0].name, nsaids[0].name],
      mechanism:
        "Kombinasi tiga golongan (ACEi/ARB yang mendilatasi arteriol eferen + Diuretik yang menurunkan volume intravaskular + OAINS yang menyempitkan arteriol aferen) menurunkan tekanan filtrasi glomerulus secara drastis dan meningkatkan risiko Acute Kidney Injury (AKI) hingga >30% dalam 30 hari pertama terapi.",
      recommendation:
        "HINDARI KOMBINASI TIGA OBAT INI. Hentikan OAINS dan ganti dengan Parasetamol atau analgesik non-nefrotoksik. Pantau serum kreatinin, eGFR, kalium, dan status hidrasi pasien segera.",
      evidence: "Lapi F, et al. BMJ. 2013;346:e8525 • DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia.",
    });
  }

  const qtDrugs = items.filter(i => (SUBSTANCE_TAGS[i.canonical] || []).includes("QT_PROLONGING"));
  if (qtDrugs.length >= 3) {
    alerts.push({
      id: "syndrome_high_qt_burden",
      title: `Beban Pemanjangan QT Kumulatif Tinggi (${qtDrugs.length} Obat Pemanjang QT)`,
      severity: "CRITICAL",
      involvedDrugs: qtDrugs.map(d => d.name),
      mechanism:
        "Terdapat 3 atau lebih obat yang memanjang interval QTc secara bersamaan dalam keranjang terapi. Efek kumulatif blokade kanal kalium hERG sangat meningkatkan risiko aritmia ventrikel Torsades de Pointes dan henti jantung mendadak.",
      recommendation:
        "Lakukan audit ulang regimen segera untuk mengganti minimal 1–2 agen dengan alternatif non-QT. Lakukan EKG 12-sadapan (hitung QTc) dan periksa kadar K+ serta Mg2+ serum.",
      evidence: "CredibleMeds • DDInter 2.0 • Drugs.com • Medscape • MIMS Indonesia.",
    });
  }

  const cnsDepressants = items.filter(i => {
    const t = SUBSTANCE_TAGS[i.canonical] || [];
    return t.includes("OPIOID") || t.includes("BENZO_SEDATIVE") || t.includes("GABAPENTINOID");
  });
  if (cnsDepressants.length >= 3) {
    alerts.push({
      id: "syndrome_triple_cns",
      title: `Beban Depresi SSP & Pernapasan Ganda (${cnsDepressants.length} Agen Depresan SSP)`,
      severity: "CRITICAL",
      involvedDrugs: cnsDepressants.map(d => d.name),
      mechanism:
        "Kombinasi ≥3 depresan sistem saraf pusat (Opioid + Benzodiazepin/Sedatif + Gabapentinoid) menimbulkan risiko sangat tinggi jatuh/fraktur pada lansia, delirium, depresi napas berat, dan overdosis fatal.",
      recommendation:
        "Lakukan deprescribing bertahap terhadap agen yang tidak esensial sesuai AGS Beers Criteria dan pantau tingkat kesadaran serta laju pernapasan pasien.",
      evidence: "AGS Beers Criteria (2023) • FDA Warning • Drugs.com • Medscape • WebMD.",
    });
  }

  return alerts;
}
