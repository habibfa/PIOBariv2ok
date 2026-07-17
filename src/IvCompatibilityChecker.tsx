import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Save, X, Download } from 'lucide-react';
import { Droplets, Info, Search, AlertTriangle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

type CompatibilityStatus = "C" | "I" | "U"; // Compatible, Incompatible, Uncertain/Variable

interface IvDrug {
  id: string;
  name: string;
  category: string;
  bud?: string;
  storageTemp?: string;
  reference?: string;
}

interface CompatibilityRecord {
  drug1: string;
  drug2: string;
  status: CompatibilityStatus;
  notes?: string;
}

// Sample mock data for IV drugs
const INITIAL_IV_DRUGS: IvDrug[] = [
  { id: "acyclovir", name: "Acyclovir", category: "Antiviral", bud: "12 jam suhu ruang setelah rekonstitusi", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "albumin", name: "Albumin", category: "Blood Product", bud: "4 jam setelah dibuka", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "amikacin", name: "Amikacin", category: "Antibiotic", bud: "24 jam suhu ruang, 2 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "amiodarone", name: "Amiodarone", category: "Anti-arrhythmic", bud: "24 jam suhu ruang (dalam D5W)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "amoxicillin", name: "Amoxicillin/Clavulanate", category: "Antibiotic", bud: "Gunakan dalam 20 menit setelah rekonstitusi", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "amphotericin_b", name: "Amphotericin B", category: "Antifungal", bud: "24 jam suhu ruang (lindung dari cahaya)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ampicillin", name: "Ampicillin", category: "Antibiotic", bud: "1 jam suhu ruang setelah rekonstitusi", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ampicillin_sulbactam", name: "Ampicillin sulbactam", category: "Antibiotic", bud: "8 jam suhu ruang, 48 jam di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "amsacrine", name: "Amsacrine (Amsidine)", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "bevacizumab", name: "Bevacizumab", category: "Antineoplastic", bud: "24 jam di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "bleomycin", name: "Bleomycin Sulfat", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "calcium_gluconate", name: "Calcium Gluconate", category: "Electrolyte", bud: "Segera gunakan setelah dibuka (Single dose)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "carboplastin", name: "Carboplastin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "carmustine", name: "Carmustine (BCNU)", category: "Antineoplastic", bud: "24 jam di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "cefepime", name: "Cefepime", category: "Antibiotic", bud: "24 jam suhu ruang, 7 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "cefotaxime", name: "Cefotaxime", category: "Antibiotic", bud: "24 jam suhu ruang, 5 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ceftazidime", name: "Ceftazidime", category: "Antibiotic", bud: "12 jam suhu ruang, 3 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ceftriaxone", name: "Ceftriaxone", category: "Antibiotic", bud: "2 hari suhu ruang, 10 hari di kulkas (2-8°C)", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "chloramphenicol", name: "Chloramphenicol", category: "Antibiotic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ciprofloxacin", name: "Ciprofloxacine", category: "Antibiotic", bud: "14 hari suhu ruang atau kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "cisplatin", name: "Cisplatin", category: "Antineoplastic", bud: "24 jam suhu ruang (jangan di kulkas)", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "clindamycin", name: "Clindamycin", category: "Antibiotic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "cyclophosphamide", name: "Cyclophosphamid", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "cystarabin", name: "Cystarabin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dacarbazine", name: "Dacarbazine", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dactinomycin", name: "Dactinomycin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "daunorubicin", name: "Daunorubicin", category: "Antineoplastic", bud: "24 jam suhu ruang (lindung dari cahaya)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dexamethasone", name: "Dexamethason", category: "Corticosteroid", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dextrose5", name: "Dextrose 5% (D5W)", category: "IV Fluid", bud: "24 jam setelah ditusuk/dibuka", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "diazepam", name: "Diazepam", category: "Benzodiazepine", bud: "Segera gunakan, jangan disimpan", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "digoxin", name: "Digoxin", category: "Cardiac Glycoside", bud: "48 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dobutamine", name: "Dobutamine", category: "Inotrope", bud: "24 jam suhu ruang, 48 jam di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "dopamine", name: "Dopamine", category: "Inotrope", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "doxetaxel", name: "Doxetaxel", category: "Antineoplastic", bud: "4 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "doxorubicin", name: "Doxorubicin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "epinephrine", name: "Epinephrine", category: "Vasopressor", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "epirubicin", name: "Epirubicin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "er_asparaginiase", name: "Er-Asparaginiase", category: "Antineoplastic", bud: "8 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "etoposide", name: "Etoposide", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "fentanyl", name: "Fentanyl Citrate", category: "Analgesic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "floxuridine", name: "Floxuridine", category: "Antineoplastic", bud: "14 hari di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "fluconazole", name: "Fluconazole", category: "Antifungal", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "fludarabine", name: "Fludarabine", category: "Antineoplastic", bud: "8 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "fluorourasil", name: "Fluorourasil", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "folinic_acid", name: "Folinic Acid", category: "Antineoplastic Adjunct", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "furosemide", name: "Furosemide", category: "Diuretic", bud: "24 jam suhu ruang (lindung dari cahaya)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ganciclovir", name: "Ganciclovir", category: "Antiviral", bud: "12 jam suhu ruang (jangan di kulkas)", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "gemcitabine", name: "Gemcitabine", category: "Antineoplastic", bud: "24 jam suhu ruang (jangan di kulkas)", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "gentamicin", name: "Gentamicin", category: "Antibiotic", bud: "24 jam suhu ruang setelah dilarutkan", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "heparin", name: "Heparin", category: "Anticoagulant", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "idarubicin", name: "Idarubicin", category: "Antineoplastic", bud: "72 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "imipenem", name: "Imipenem-Cilastasin", category: "Antibiotic", bud: "4 jam suhu ruang, 24 jam di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "insulin_regular", name: "Insulin Regular", category: "Hormone", bud: "28 hari suhu ruang setelah dibuka", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "iphosfamida", name: "Iphosfamida", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "irinotecan", name: "Irinotecan", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ketorolac", name: "Ketorolac", category: "NSAID", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "lasparaginase", name: "Lasparaginase (LEUNASE)", category: "Antineoplastic", bud: "8 jam di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "levofloxacin", name: "Levofloxacin", category: "Antibiotic", bud: "72 jam suhu ruang, 14 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "lorazepam", name: "Lorazepam", category: "Benzodiazepine", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "magnesium_sulfate", name: "Magnesium Sulfate", category: "Electrolyte", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "mannitol", name: "Mannitol", category: "Diuretic", bud: "Gunakan segera, periksa kristal", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "melphalan", name: "Melphalan", category: "Antineoplastic", bud: "1.5 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "meropenem", name: "Meropenem", category: "Antibiotic", bud: "2 jam suhu ruang, 12 jam di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "mesna", name: "Mesna (Uromitexan)", category: "Antineoplastic Adjunct", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "metrotrexate", name: "Metrotrexate", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "metronidazole", name: "Metronidazole", category: "Antibiotic", bud: "24 jam suhu ruang (jangan di kulkas)", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "midazolam", name: "Midazolam", category: "Benzodiazepine", bud: "24 jam suhu ruang atau 3 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "milrinone", name: "Milrinone", category: "Inotrope", bud: "72 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "mitomycin_c", name: "Mitomycin-C", category: "Antineoplastic", bud: "12 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "morphine", name: "Morphine", category: "Analgesic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "nitroglycerin", name: "Nitroglycerin", category: "Vasodilator", bud: "48 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "norepinephrine", name: "Norepinephrine", category: "Vasopressor", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "normal_saline", name: "Normal Saline (NS 0.9%)", category: "IV Fluid", bud: "24 jam setelah ditusuk/dibuka", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ondansetron", name: "Ondansentron", category: "Antiemetic", bud: "48 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "oxaliplatin", name: "Oxaliplatin", category: "Antineoplastic", bud: "24 jam di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "paclitaxel", name: "Paclitaxel", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "pantoprazole", name: "Pantoprazole", category: "PPI", bud: "12 jam suhu ruang setelah rekonstitusi", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "penicillin_g", name: "Penicillin G", category: "Antibiotic", bud: "24 jam suhu ruang, 7 hari di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "phenytoin", name: "Phenytoin", category: "Anticonvulsant", bud: "Segera gunakan (hanya dengan NS, jangan di kulkas)", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "piperacillin", name: "Piperacillin-Tazobactam", category: "Antibiotic", bud: "24 jam suhu ruang, 48 jam di kulkas", storageTemp: "Suhu Ruang atau Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "potassium_chloride", name: "Potassium Chloride", category: "Electrolyte", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "propofol", name: "Propofol", category: "Sedative", bud: "12 jam setelah vial ditusuk (berisiko kontaminasi mikroba)", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "propranolol", name: "Propanolol", category: "Beta Blocker", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ranitidine", name: "Ranitidin", category: "H2 Blocker", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "rituximab", name: "Rituximab", category: "Antineoplastic", bud: "24 jam di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "ringers_lactate", name: "Ringer's Lactate (RL)", category: "IV Fluid", bud: "24 jam setelah ditusuk/dibuka", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "sodium_bicarbonate", name: "Sodium Bicarbonate", category: "Electrolyte", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "sodium_valproate", name: "Sodium Valproate", category: "Anticonvulsant", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "topotecan", name: "Topotecan", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "transtuzumab", name: "Transtuzumab", category: "Antineoplastic", bud: "28 hari di kulkas", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "vancomycin", name: "Vancomycin", category: "Antibiotic", bud: "14 hari di kulkas (2-8°C) setelah rekonstitusi", storageTemp: "Kulkas (2-8°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "vinblastin", name: "Vinblastin", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
  { id: "vincristine", name: "Vincristine", category: "Antineoplastic", bud: "24 jam suhu ruang", storageTemp: "Suhu Ruang (20-25°C)", reference: "Trissel\'s Handbook on Injectable Drugs (ASHP)" },
];

// Matrix of compatibilities. We only need to specify combinations.
const INITIAL_MATRIX: CompatibilityRecord[] = [
  { drug1: "amiodarone", drug2: "dextrose5", status: "C" },
  { drug1: "amiodarone", drug2: "normal_saline", status: "I", notes: "Amiodarone is generally preferred in D5W. May precipitate in NS." },
  { drug1: "amiodarone", drug2: "heparin", status: "I" },
  { drug1: "ceftriaxone", drug2: "calcium_gluconate", status: "I", notes: "Fatal precipitates can form. NEVER administer together." },
  { drug1: "ceftriaxone", drug2: "ringers_lactate", status: "I", notes: "RL contains calcium. Do not mix." },
  { drug1: "ceftriaxone", drug2: "normal_saline", status: "C" },
  { drug1: "ceftriaxone", drug2: "dextrose5", status: "C" },
  { drug1: "diazepam", drug2: "dextrose5", status: "I", notes: "Forms precipitate. Do not mix with any IV fluids, inject slowly directly." },
  { drug1: "diazepam", drug2: "normal_saline", status: "I", notes: "Forms precipitate." },
  { drug1: "diazepam", drug2: "ringers_lactate", status: "I", notes: "Forms precipitate." },
  { drug1: "phenytoin", drug2: "dextrose5", status: "I", notes: "Rapid crystallization. Mix ONLY with NS." },
  { drug1: "phenytoin", drug2: "normal_saline", status: "C" },
  { drug1: "furosemide", drug2: "dobutamine", status: "I", notes: "Incompatible at Y-site." },
  { drug1: "furosemide", drug2: "milrinone", status: "I", notes: "Precipitates immediately." },
  { drug1: "furosemide", drug2: "amiodarone", status: "I" },
  { drug1: "pantoprazole", drug2: "midazolam", status: "I" },
  { drug1: "propofol", drug2: "dextrose5", status: "C" },
  { drug1: "insulin_regular", drug2: "normal_saline", status: "C" },
  { drug1: "dopamine", drug2: "furosemide", status: "U", notes: "Variable compatibility depending on concentration." },
  { drug1: "vancomycin", drug2: "heparin", status: "I" },
  { drug1: "heparin", drug2: "dobutamine", status: "C" },
  { drug1: "norepinephrine", drug2: "dextrose5", status: "C", notes: "Preferred diluent." },
  { drug1: "norepinephrine", drug2: "normal_saline", status: "C" },
  { drug1: "calcium_gluconate", drug2: "magnesium_sulfate", status: "C", notes: "Generally compatible at Y-site." },
];

// Helper to check compatibility

interface IvCompatibilityCheckerProps {
  isAdmin?: boolean;
}

export const IvCompatibilityChecker: React.FC<IvCompatibilityCheckerProps> = ({ isAdmin = false }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState("");

  const [activeTab, setActiveTab] = useState<"drugs" | "matrix">("drugs");

  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ivDrugsState, setIvDrugsState] = useState<IvDrug[]>(() => {
    const saved = localStorage.getItem("ivDrugsData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_IV_DRUGS;
      }
    }
    return INITIAL_IV_DRUGS;
  });

  const [matrixState, setMatrixState] = useState<CompatibilityRecord[]>(() => {
    const saved = localStorage.getItem("ivMatrixData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MATRIX;
      }
    }
    return INITIAL_MATRIX;
  });

  useEffect(() => {
    localStorage.setItem("ivDrugsData", JSON.stringify(ivDrugsState));
    localStorage.setItem("ivMatrixData", JSON.stringify(matrixState));
  }, [ivDrugsState, matrixState]);

  const checkCompatibility = (id1: string, id2: string): CompatibilityRecord => {
    const record = matrixState.find(
      r => (r.drug1 === id1 && r.drug2 === id2) || (r.drug1 === id2 && r.drug2 === id1)
    );
    return record || { drug1: id1, drug2: id2, status: "U" };
  };

  const handleUpdateData = async () => {
    if (!csvFile) {
      setCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }
    const fileExt = csvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          validateAndSetData(results.data);
        },
        error: (error) => {
          setCsvError("Gagal membaca file CSV: " + error.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const data = await csvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetData(parsed);
      } catch (err) {
        setCsvError("Gagal membaca file Excel: " + err.message);
      }
    } else {
      setCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetData = (parsed: any[]) => {
    if (activeTab === "drugs") {
      if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
        setIvDrugsState(prev => {
          const newData = parsed;
          const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
          const combined = [...prevFiltered, ...newData];
          return combined.sort((a, b) => a.name.localeCompare(b.name));
        });
        setIsUpdateModalOpen(false);
        setCsvError("");
        setCsvFile(null);
      } else {
        setCsvError("Format file Obat tidak valid. Pastikan ada kolom id dan name.");
      }
    } else {
      if (parsed.length > 0 && parsed[0].drug1 !== undefined && parsed[0].drug2 !== undefined && parsed[0].status !== undefined) {
        setMatrixState(prev => {
          const newData = parsed;
          // For matrix, we replace matching pairs or add new ones
          const newMap = new Map(newData.map(item => [`${item.drug1}-${item.drug2}`, item]));
          const prevFiltered = prev.filter(p => !newMap.has(`${p.drug1}-${p.drug2}`) && !newMap.has(`${p.drug2}-${p.drug1}`));
          return [...prevFiltered, ...newData];
        });
        setIsUpdateModalOpen(false);
        setCsvError("");
        setCsvFile(null);
      } else {
        setCsvError("Format file Matriks tidak valid. Pastikan ada kolom drug1, drug2, status.");
      }
    }
  };

  const handleDownloadTemplate = () => {
    let dataToExport = activeTab === "drugs" ? INITIAL_IV_DRUGS : INITIAL_MATRIX;
    let sheetName = activeTab === "drugs" ? "Template_Obat_IV" : "Template_Matriks_IV";
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };


  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return ivDrugsState;
    const lowerQ = searchQuery.toLowerCase();
    return ivDrugsState.filter(d => 
      d.name.toLowerCase().includes(lowerQ) || 
      d.category.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery]);

  const toggleDrug = (id: string) => {
    if (selectedDrugs.includes(id)) {
      setSelectedDrugs(prev => prev.filter(d => d !== id));
    } else {
      if (selectedDrugs.length < 5) {
        setSelectedDrugs(prev => [...prev, id]);
      } else {
        alert("Maksimal 5 obat/cairan yang dapat dipilih untuk perbandingan.");
      }
    }
  };

  const getStatusBadge = (status: CompatibilityStatus) => {
    switch(status) {
      case "C": return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Compatible</span>;
      case "I": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3" /> Incompatible</span>;
      case "U": return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Uncertain / Check</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* LEFT COLUMN: Drug Selection */}
      <section className="lg:col-span-4 space-y-6">
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Administrasi Data IV</h2>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              Update Data Kompatibilitas
            </button>
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Droplets className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Obat & Cairan IV</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari obat atau cairan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="h-[calc(100vh-320px)] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredDrugs.map(drug => {
              const isSelected = selectedDrugs.includes(drug.id);
              return (
                <button
                  key={drug.id}
                  onClick={() => toggleDrug(drug.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected 
                    ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h3 className={`text-sm font-bold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                      {drug.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{drug.category}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : "bg-white border-slate-300 group-hover:border-emerald-400"
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Compatibility Matrix & Details */}
      <section className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-4 flex items-center gap-3 text-white">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Hasil Kompatibilitas IV (Y-Site)</h2>
              <p className="text-xs text-emerald-200">Pilih minimal 2 obat/cairan untuk melihat hasil</p>
            </div>
          </div>

          <div className="p-6">
            {selectedDrugs.length < 2 ? (
              <div className="text-center py-16 px-4">
                <Droplets className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-slate-500 font-medium text-sm">Belum ada cukup data</h3>
                <p className="text-slate-400 text-xs mt-1">Pilih minimal dua obat atau cairan dari daftar di sebelah kiri untuk melihat matriks kompatibilitas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Cross-Compatibility Matrix */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 border-r border-slate-200 w-48">Obat / Cairan</th>
                        {selectedDrugs.map(id => (
                          <th key={`col-${id}`} className="px-4 py-3 text-center min-w-[120px]">
                            {ivDrugsState.find(d => d.id === id)?.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedDrugs.map(rowId => {
                        const rowDrug = ivDrugsState.find(d => d.id === rowId)!;
                        return (
                          <tr key={`row-${rowId}`} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-700 border-r border-slate-200">
                              {rowDrug.name}
                            </td>
                            {selectedDrugs.map(colId => {
                              const comp = checkCompatibility(rowId, colId);
                              return (
                                <td key={`cell-${rowId}-${colId}`} className="px-4 py-3 text-center align-middle">
                                  {rowId === colId ? (
                                    <span className="text-slate-300 text-lg">-</span>
                                  ) : (
                                    <div className="flex justify-center">
                                      {getStatusBadge(comp.status)}
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Compatibility Details List */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-500" />
                    Catatan Interaksi Spesifik
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const notes: React.ReactNode[] = [];
                      const processedPairs = new Set<string>();

                      for (let i = 0; i < selectedDrugs.length; i++) {
                        for (let j = i + 1; j < selectedDrugs.length; j++) {
                          const id1 = selectedDrugs[i];
                          const id2 = selectedDrugs[j];
                          
                          // create a unique key for the pair
                          const pairKey = [id1, id2].sort().join("-");
                          if (processedPairs.has(pairKey)) continue;
                          processedPairs.add(pairKey);

                          const comp = checkCompatibility(id1, id2);
                          const d1 = ivDrugsState.find(d => d.id === id1)!;
                          const d2 = ivDrugsState.find(d => d.id === id2)!;

                          if (comp.status === "I" || comp.notes) {
                            notes.push(
                              <div key={pairKey} className={`p-4 rounded-xl border ${comp.status === 'I' ? 'bg-red-50 border-red-100' : comp.status === 'C' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    {getStatusBadge(comp.status)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-800">
                                      {d1.name} + {d2.name}
                                    </h4>
                                    {comp.notes && (
                                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        {comp.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                      }

                      if (notes.length === 0) {
                        return (
                          <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            Tidak ada catatan spesifik atau peringatan inkompatibilitas untuk kombinasi yang dipilih. Namun, selalu lakukan inspeksi visual untuk partikel atau perubahan warna sebelum pemberian.
                          </div>
                        );
                      }
                      
                      return notes;
                    })()}
                  </div>
                </div>

                {/* Beyond Use Date (BUD) Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Beyond Use Date (Waktu Kedaluwarsa Setelah Dibuka/Diramu)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDrugs.map(id => {
                      const drug = ivDrugsState.find(d => d.id === id)!;
                      return (
                        <div key={`bud-${id}`} className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                          <h4 className="text-sm font-bold text-slate-800 mb-1">{drug.name}</h4>
                          <p className="text-[11px] text-slate-500 mb-1.5"><span className="font-semibold text-slate-600">Suhu Penyimpanan:</span> {drug.storageTemp || "Suhu Ruang (20-25°C)"}</p>
                          <p className="text-xs text-slate-600 font-medium mb-1">BUD: <span className="text-emerald-700">{drug.bud || 'Tidak ada data'}</span></p>
                          <p className="text-[10px] text-slate-400 italic">Ref: {drug.reference || "Trissel's Handbook on Injectable Drugs"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3 text-emerald-800">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 shrink-0 text-emerald-600" />
                    <div className="text-xs space-y-1.5">
                      <p><strong>Disclaimer:</strong> Data kompatibilitas ini adalah panduan umum Y-site administration. Faktor seperti konsentrasi obat, pH pelarut, suhu, dan waktu kontak dapat memengaruhi hasil di lapangan.</p>
                      <p>Jika ragu, selalu gunakan jalur IV terpisah atau bilas (flush) jalur dengan saline secara memadai di antara pemberian obat.</p>
                      <p><strong>Sumber:</strong> Pedoman Pencampuran Obat Suntik dan Penanganan Sediaan Sitostatika, Depkes RI 2009.</p>
                    </div>
                  </div>
                  <a 
                    href="/pedoman_pencampuran.pdf" 
                    download="Pedoman_Pencampuran_Obat_Suntik_2009.pdf"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors self-start mt-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Sumber Pedoman (PDF)
                  </a>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Kompatibilitas IV</h3>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("drugs")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === "drugs" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Data Obat IV
                </button>
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === "matrix" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Matriks Kompatibilitas
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <p className="text-sm text-slate-600">
                  {activeTab === "drugs" 
                    ? "Unggah data Obat IV dalam format CSV/Excel (.xlsx). Kolom wajib: id, name. Opsional: category, bud, storageTemp, reference."
                    : "Unggah data Matriks Kompatibilitas dalam format CSV/Excel (.xlsx). Kolom wajib: drug1, drug2, status (C/I/U). Opsional: notes."}
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template {activeTab === "drugs" ? "Obat" : "Matriks"} Excel
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCsvFile(file);
                      setCsvError("");
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {csvError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {csvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateData}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
