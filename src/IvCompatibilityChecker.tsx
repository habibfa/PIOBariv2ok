import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Save, X, Download, Trash2 } from 'lucide-react';
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
  {
    "id": "Acyclovir",
    "name": "Acyclovir",
    "category": "Obat Intravena",
    "bud": "12 jam suhu ruang setelah rekonstitusi",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Albumin",
    "name": "Albumin",
    "category": "Obat Intravena",
    "bud": "4 jam setelah dibuka",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Alkohol absolut",
    "name": "Alkohol absolut",
    "category": "Cairan Pelarut"
  },
  {
    "id": "Amikacin",
    "name": "Amikacin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang, 2 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Aminophylline",
    "name": "Aminophylline",
    "category": "Obat Intravena"
  },
  {
    "id": "Amiodarone",
    "name": "Amiodarone",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang (dalam Dextrose 5%)",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Amoxicillin/Clavulanate",
    "name": "Amoxicillin/Clavulanate",
    "category": "Obat Intravena",
    "bud": "Gunakan dalam 20 menit setelah rekonstitusi",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Amphotericin B",
    "name": "Amphotericin B",
    "category": "Obat Intravena",
    "bud": "24 jam dalam Water for Injection ; 6 jam dalam Dextrose 5%",
    "storageTemp": "Harus disimpan dalam suhu pendingin antara 2-8°C.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ampicillin",
    "name": "Ampicillin",
    "category": "Obat Intravena",
    "bud": "8 jam dalam NS (NaCl 0,9%) dalam suhu ruang 25 derajat C, 2\nhari dalam suhu 4 derajat C ; <1 jam dalam Dextrose",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ampicillin sulbactam",
    "name": "Ampicillin sulbactam",
    "category": "Obat Intravena",
    "bud": "8 jam suhu ruang, 48 jam di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Amsacrine (Amsidine)",
    "name": "Amsacrine (Amsidine)",
    "category": "Obat Intravena",
    "bud": "48 jam",
    "storageTemp": "Suhu Ruang (20-25°C), Terlindung cahaya langsung,",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Asetilsistein",
    "name": "Asetilsistein",
    "category": "Obat Intravena",
    "bud": "24 Jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Azitromisin",
    "name": "Azitromisin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang <30 derajat C; 7 hari dalam suhu 5 derajat C.",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Bevacizumab",
    "name": "Bevacizumab",
    "category": "Obat Intravena",
    "bud": "8 jam pada suhu 2-8°C",
    "storageTemp": "Kulkas (2-8°C); JANGAN di KOCOK; Terhindar dari cahaya langsung.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Bleomycin Sulfat",
    "name": "Bleomycin Sulfat",
    "category": "Obat Intravena",
    "bud": "96 jam dalam suhu ruang; 28 jam dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Calcium Gluconate",
    "name": "Calcium Gluconate",
    "category": "Obat Intravena",
    "bud": "24 jam, Segera gunakan setelah dibuka (Single dose)",
    "storageTemp": "JANGAN disimpan di KULKAS; Disimpan dalam suhu ruang",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Carboplastin",
    "name": "Carboplastin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Carmustine (BCNU)",
    "name": "Carmustine (BCNU)",
    "category": "Obat Intravena",
    "bud": "8 jam dalam suhu ruang; 24 jam dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C) dalam botol non PVC",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cefazolin",
    "name": "Cefazolin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang; 10 hari dalam kulkas (4 derajat C)",
    "storageTemp": "Terlindung dari cahaya langsung; terlindung dari suhu >40oC.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cefepime",
    "name": "Cefepime",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang, 7 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cefotaxime",
    "name": "Cefotaxime",
    "category": "Obat Intravena",
    "bud": "12-24 jam suhu ruang, 7-10 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cefpirom",
    "name": "Cefpirom",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang (25-30 derajat C)",
    "storageTemp": "Suhu Ruang",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ceftazidime",
    "name": "Ceftazidime",
    "category": "Obat Intravena",
    "bud": "12 jam suhu ruang, 3 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ceftizoksim",
    "name": "Ceftizoksim",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang; 96 jam dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ceftriaxone",
    "name": "Ceftriaxone",
    "category": "Obat Intravena",
    "bud": "2 hari suhu ruang, 10 hari di kulkas (2-8°C)",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cefuroksim",
    "name": "Cefuroksim",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang; 48 jam dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Chloramphenicol",
    "name": "Chloramphenicol",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ciprofloxacine",
    "name": "Ciprofloxacine",
    "category": "Obat Intravena",
    "bud": "14 hari suhu ruang atau kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cisplatin",
    "name": "Cisplatin",
    "category": "Obat Intravena",
    "bud": "72 jam pada suhu 4-25°C.",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Clindamycin",
    "name": "Clindamycin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cyclophosphamid",
    "name": "Cyclophosphamid",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang; 6 hari dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Cystarabin",
    "name": "Cystarabin",
    "category": "Obat Intravena",
    "bud": "48 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Dacarbazine",
    "name": "Dacarbazine",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang; 96 jam dalam kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Dactinomycin",
    "name": "Dactinomycin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya; Pelarut TIDAK mengandung Bahan tambahan lain.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Daunorubicin",
    "name": "Daunorubicin",
    "category": "Obat Intravena",
    "bud": "4 jam suhu ruang (15-25°C)",
    "storageTemp": "Suhu Ruang (20-25°C); terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Dexamethason",
    "name": "Dexamethason",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Diazepam",
    "name": "Diazepam",
    "category": "Obat Intravena",
    "bud": "Segera gunakan, jangan disimpan",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Digoxin",
    "name": "Digoxin",
    "category": "Obat Intravena",
    "bud": "48 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Dobutamine",
    "name": "Dobutamine",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang, 48 jam di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Dopamine",
    "name": "Dopamine",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Doxetaxel",
    "name": "Doxetaxel",
    "category": "Obat Intravena",
    "bud": "8 jam suhu ruang (2-25°C) atau dalam suhu dingin",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya; jangan di kocok",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Doxorubicin",
    "name": "Doxorubicin",
    "category": "Obat Intravena",
    "bud": "48 jam dalam suhu 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Epinephrine",
    "name": "Epinephrine",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Epirubicin",
    "name": "Epirubicin",
    "category": "Obat Intravena",
    "bud": "24 jam dalam suhu 2-8°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Er-Asparaginiase",
    "name": "Er-Asparaginiase",
    "category": "Obat Intravena",
    "bud": "8 jam suhu ruang (2-25°C) atau dalam suhu dingin",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C); terlindung cahaya; jangan di kocok",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Etoposide",
    "name": "Etoposide",
    "category": "Obat Intravena",
    "bud": "Suhu ruang 0,2mg/ml: 96 jam; 0,4mg/ml: 24 jam",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Fentanyl Citrate",
    "name": "Fentanyl Citrate",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Floxuridine",
    "name": "Floxuridine",
    "category": "Obat Intravena",
    "bud": "24 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Fluconazole",
    "name": "Fluconazole",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Fludarabine",
    "name": "Fludarabine",
    "category": "Obat Intravena",
    "bud": "48 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang 25°C; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Fluorourasil",
    "name": "Fluorourasil",
    "category": "Obat Intravena",
    "bud": "72 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang 25°C; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Folinic Acid",
    "name": "Folinic Acid",
    "category": "Obat Intravena",
    "bud": "24 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang 25°C; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Fosfomisin",
    "name": "Fosfomisin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Furosemide",
    "name": "Furosemide",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang (lindung dari cahaya)",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ganciclovir",
    "name": "Ganciclovir",
    "category": "Obat Intravena",
    "bud": "24 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang 25°C; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Gemcitabine",
    "name": "Gemcitabine",
    "category": "Obat Intravena",
    "bud": "24 jam dalam suhu kamar 25°C terlindung dari cahaya langsung",
    "storageTemp": "Suhu Ruang 25°C; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Gentamycin",
    "name": "Gentamycin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang setelah dilarutkan",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Heparin",
    "name": "Heparin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Idarubicin",
    "name": "Idarubicin",
    "category": "Obat Intravena",
    "bud": "72 jam suhu ruang; 7 hari pada kulkas",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Imipenem-Cilastatin",
    "name": "Imipenem-Cilastatin",
    "category": "Obat Intravena",
    "bud": "4 jam suhu ruang, 24 jam di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C) bukan freezer",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Insulin Regular",
    "name": "Insulin Regular",
    "category": "Obat Intravena",
    "bud": "28 hari suhu ruang setelah dibuka",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Iphosfamida",
    "name": "Iphosfamida",
    "category": "Obat Intravena",
    "bud": "7 hari suhu ruang; 21 hari pada kulkas",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Irinotecan",
    "name": "Irinotecan",
    "category": "Obat Intravena",
    "bud": "12 jam suhu ruang; 24 hari pada kulkas",
    "storageTemp": "Suhu Ruang (2-25°C) atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ketorolac",
    "name": "Ketorolac",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "L- Lactic Acid",
    "name": "L- Lactic Acid",
    "category": "Cairan Pelarut"
  },
  {
    "id": "Larutan Dextrosa 10%",
    "name": "Larutan Dextrosa 10%",
    "category": "Cairan Pelarut"
  },
  {
    "id": "Larutan Dextrosa 5%",
    "name": "Larutan Dextrosa 5%",
    "category": "Cairan Pelarut",
    "bud": "24 jam setelah ditusuk/dibuka",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Lasparaginase (LEUNASE)",
    "name": "Lasparaginase (LEUNASE)",
    "category": "Obat Intravena",
    "bud": "8 jam di kulkas (2-8°C)",
    "storageTemp": "Kulkas (2-8°C); terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Levofloxacin",
    "name": "Levofloxacin",
    "category": "Obat Intravena",
    "bud": "72 jam suhu ruang, 14 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C) Hindari cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Lorazepam",
    "name": "Lorazepam",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Mannitol",
    "name": "Mannitol",
    "category": "Obat Intravena",
    "bud": "Gunakan segera, periksa kristal",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Melphalan",
    "name": "Melphalan",
    "category": "Obat Intravena",
    "bud": "< 60 menit pada suhu ruang",
    "storageTemp": "suhu 2-8°C, Terlindung Dari Cahaya Langsung-Bungkus dengan ALUMUNIUM FOIL karena larutan tidak stabil.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Meropenem",
    "name": "Meropenem",
    "category": "Obat Intravena",
    "bud": "WFI: 2 jam dalam suhu ruang; 12 jam dalam kulkas;\nNaCl 0,9%: 2 jam dalam suhu ruang, 18 jam dalam kulkas\nDextrose 5% : 1 jam dalam suhu ruang, 8 jam dalam kulkas",
    "storageTemp": "Kulkas (2-8°C) bukan freezer",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Mesna (Uromitexan)",
    "name": "Mesna (Uromitexan)",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang; Terhindar dari cahaya langsung.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Metronidazole",
    "name": "Metronidazole",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang (jangan di kulkas)",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Metrotrexate",
    "name": "Metrotrexate",
    "category": "Obat Intravena",
    "bud": "4-8 jam suhu ruang; 24 jam dalam kulkas; terlindung cahaya",
    "storageTemp": "suhu 2-8°C, Terlindung Dari Cahaya Langsung-Bungkus dengan ALUMUNIUM FOIL karena larutan tidak stabil.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "MgSO4",
    "name": "MgSO4",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Midazolam",
    "name": "Midazolam",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang atau 3 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Milrinone",
    "name": "Milrinone",
    "category": "Obat Intravena",
    "bud": "72 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Mitomycin-C",
    "name": "Mitomycin-C",
    "category": "Obat Intravena",
    "bud": "Suhu ruang; Nacl 0,9% -12jam, Larutan Dextrose 5- 3jam, Water for Injection-7 hari; pada kulkas: water for injection-14 hari.",
    "storageTemp": "Suhu Ruang dan kulkas (2-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Morphine Sulphate",
    "name": "Morphine Sulphate",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "NaCl 0.9%",
    "name": "NaCl 0.9%",
    "category": "Cairan Pelarut",
    "bud": "24 jam setelah ditusuk/dibuka",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Nitroglycerin",
    "name": "Nitroglycerin",
    "category": "Obat Intravena",
    "bud": "48 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Norepinephrine",
    "name": "Norepinephrine",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ondansentron",
    "name": "Ondansentron",
    "category": "Obat Intravena",
    "bud": "48 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Oxaliplatin",
    "name": "Oxaliplatin",
    "category": "Obat Intravena",
    "bud": "24 jam di kulkas",
    "storageTemp": "Kulkas (2-8°C); hidarkan dari cahaya langsung; Pelarut tidak mengandung NaCl.",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Paclitaxel",
    "name": "Paclitaxel",
    "category": "Obat Intravena",
    "bud": "27 jam suhu ruang",
    "storageTemp": "Suhu Ruang, simpan dengan botol kaca/botol khusus; terlindung cahaya",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Pantoprazole",
    "name": "Pantoprazole",
    "category": "Obat Intravena",
    "bud": "12 jam suhu ruang setelah rekonstitusi",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Pelarut Original",
    "name": "Pelarut Original",
    "category": "Cairan Pelarut"
  },
  {
    "id": "Penicillin G",
    "name": "Penicillin G",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang, 7 hari di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Phenytoin",
    "name": "Phenytoin",
    "category": "Obat Intravena",
    "bud": "Segera gunakan (hanya dengan NS, jangan di kulkas)",
    "storageTemp": "Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Piperacillin-Tazobactam",
    "name": "Piperacillin-Tazobactam",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang, 48 jam di kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Potassium Chloride",
    "name": "Potassium Chloride",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Propofol",
    "name": "Propofol",
    "category": "Obat Intravena",
    "bud": "12 jam setelah vial ditusuk (berisiko kontaminasi mikroba)",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Propranolol",
    "name": "Propranolol",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ranitidin",
    "name": "Ranitidin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Ringer Laktat",
    "name": "Ringer Laktat",
    "category": "Cairan Pelarut",
    "bud": "24 jam setelah ditusuk/dibuka",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Rituximab",
    "name": "Rituximab",
    "category": "Obat Intravena",
    "bud": "12 jam suhu ruang; 24 hari pada kulkas",
    "storageTemp": "Suhu Ruang atau Kulkas (2-25°C); terlindung cahaya; jangan di kocok",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Sodium Bikarbonat",
    "name": "Sodium Bikarbonat",
    "category": "Cairan Pelarut",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Sodium Valproat",
    "name": "Sodium Valproat",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Teicoplanin",
    "name": "Teicoplanin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Tobramisin",
    "name": "Tobramisin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang (20-25°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Topotecan",
    "name": "Topotecan",
    "category": "Obat Intravena",
    "bud": "7 hari pada suhu 2-8°C; 24 jam pada suhu ruang (25°C)",
    "storageTemp": "Suhu Ruang atau Kulkas (2-25°C); terlindung cahaya; jangan di kocok",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Transtuzumab",
    "name": "Transtuzumab",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "dalam suhu ruang atau kulkas; jangan di kocok",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Vancomycin",
    "name": "Vancomycin",
    "category": "Obat Intravena",
    "bud": "14 hari di kulkas (2-8°C) setelah rekonstitusi",
    "storageTemp": "Kulkas (2-8°C)",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Vinblastin",
    "name": "Vinblastin",
    "category": "Obat Intravena",
    "bud": "24 jam suhu ruang",
    "storageTemp": "Suhu Ruang atau dalam suhu dingin; terlindung cahaya langsung",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Vincristine",
    "name": "Vincristine",
    "category": "Obat Intravena",
    "bud": "2 hari suhu ruang; 7 hari pada kulkas",
    "storageTemp": "Suhu Ruang atau dalam suhu dingin",
    "reference": "Trissel's Handbook on Injectable Drugs (ASHP)"
  },
  {
    "id": "Water for Injection",
    "name": "Water for Injection",
    "category": "Cairan Pelarut"
  }
];

// Matrix of compatibilities. We only need to specify combinations.
const INITIAL_MATRIX: CompatibilityRecord[] = [
  {
    "drug1": "Acyclovir",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "larutan dextrose > 10% dapat menjadikan kuning larutan (tidak mempengaruhi potensi obat)"
  },
  {
    "drug1": "Acyclovir",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Acyclovir",
    "drug2": "Albumin",
    "status": "I",
    "notes": "Tidak kompatibel dengan produk darah, larutan yang mengandung protein"
  },
  {
    "drug1": "Amikacin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Amikacin",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Amikacin",
    "drug2": "Heparin",
    "status": "I"
  },
  {
    "drug1": "Aminophylline",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Aminophylline",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Amphotericin B",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Amphotericin B",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Amphotericin B",
    "drug2": "NaCl 0.9%",
    "status": "I",
    "notes": "jangan dicampur dengan obat lain"
  },
  {
    "drug1": "Ampicillin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ampicillin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "dekstrosa tidak dalam konsentrasi tinggi"
  },
  {
    "drug1": "Ampicillin sulbactam",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ampicillin sulbactam",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ampicillin sulbactam",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Amsacrine (Amsidine)",
    "drug2": "L- Lactic Acid",
    "status": "C"
  },
  {
    "drug1": "Asetilsistein",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Azitromisin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Azitromisin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Azitromisin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Bevacizumab",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Bevacizumab",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Bleomycin Sulfat",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Bleomycin Sulfat",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Calcium Gluconate",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Calcium Gluconate",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Calcium Gluconate",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Carboplastin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Carboplastin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Carboplastin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Carmustine (BCNU)",
    "drug2": "Alkohol absolut",
    "status": "C"
  },
  {
    "drug1": "Carmustine (BCNU)",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Cefazolin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Cefazolin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Cefepime",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Cefepime",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Cefepime",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Cefotaxime",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Cefotaxime",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Cefotaxime",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Cefpirom",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Cefpirom",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Cefpirom",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ceftazidime",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ceftazidime",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ceftazidime",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Ceftizoksim",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ceftizoksim",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ceftriaxone",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ceftriaxone",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ceftriaxone",
    "drug2": "Ringer Laktat",
    "status": "I",
    "notes": "Kandungan kalsium dalam RL bereaksi dengan ceftriaxone membentuk presipitat (endapan) kalsium-ceftriaxone yang tidak larut."
  },
  {
    "drug1": "Cefuroksim",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Cefuroksim",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Chloramphenicol",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Chloramphenicol",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Chloramphenicol",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Ciprofloxacine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ciprofloxacine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ciprofloxacine",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Cisplatin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Clindamycin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Clindamycin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Clindamycin",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Cyclophosphamid",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Cyclophosphamid",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Cystarabin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dacarbazine",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Dacarbazine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dacarbazine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Dactinomycin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dactinomycin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Daunorubicin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Daunorubicin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Daunorubicin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Dexamethason",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dexamethason",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Dexamethason",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Diazepam",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Tidak direkomendasi untuk dilarutkan tapi NaCl 0.9% dapat digunakan untuk penggunaan darurat"
  },
  {
    "drug1": "Digoxin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "mungkin terjadi endapan"
  },
  {
    "drug1": "Digoxin",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "mungkin terjadi endapan"
  },
  {
    "drug1": "Dobutamine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dobutamine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Dobutamine",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Dobutamine",
    "drug2": "Heparin",
    "status": "I"
  },
  {
    "drug1": "Dopamine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Dopamine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Dopamine",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Dopamine",
    "drug2": "Heparin",
    "status": "C",
    "notes": "Gunakan N5 (D5 1/4 NS) bila ada heparin"
  },
  {
    "drug1": "Doxetaxel",
    "drug2": "Pelarut Original",
    "status": "C"
  },
  {
    "drug1": "Doxorubicin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Doxorubicin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Epinephrine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Epinephrine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Epinephrine",
    "drug2": "Ringer Laktat",
    "status": "I"
  },
  {
    "drug1": "Epinephrine",
    "drug2": "Sodium Bikarbonat",
    "status": "I"
  },
  {
    "drug1": "Epirubicin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Epirubicin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Epirubicin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Er-Asparaginiase",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Er-Asparaginiase",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Etoposide",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Etoposide",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fentanyl Citrate",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Fentanyl Citrate",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fentanyl Citrate",
    "drug2": "Ringer Laktat",
    "status": "I"
  },
  {
    "drug1": "Floxuridine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Floxuridine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fluconazole",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fluconazole",
    "drug2": "Larutan Dextrosa 10%",
    "status": "C"
  },
  {
    "drug1": "Fluconazole",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Fluconazole",
    "drug2": "NaCl 0.9%",
    "status": "I"
  },
  {
    "drug1": "Fludarabine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Fludarabine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fluorourasil",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Fluorourasil",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Folinic Acid",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Folinic Acid",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Fosfomisin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Fosfomisin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Fosfomisin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Furosemide",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Jangan dicampur dengan larutan asam"
  },
  {
    "drug1": "Furosemide",
    "drug2": "Ringer Laktat",
    "status": "C",
    "notes": "Jangan dicampur dengan larutan asam"
  },
  {
    "drug1": "Ganciclovir",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ganciclovir",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ganciclovir",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Ganciclovir",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ganciclovir",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Gemcitabine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Gemcitabine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Gentamycin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Gentamycin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Heparin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Heparin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Idarubicin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Idarubicin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Imipenem-Cilastatin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Imipenem-Cilastatin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "digunakan pada kondisi khusus"
  },
  {
    "drug1": "Iphosfamida",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Iphosfamida",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Iphosfamida",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Irinotecan",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Irinotecan",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ketorolac",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ketorolac",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ketorolac",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Lasparaginase (LEUNASE)",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Lasparaginase (LEUNASE)",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Lasparaginase (LEUNASE)",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Levofloxacin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Levofloxacin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Levofloxacin",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Lorazepam",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Lorazepam",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "kurang stabil"
  },
  {
    "drug1": "Mannitol",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "Biasanya tidak dilarutkan"
  },
  {
    "drug1": "Mannitol",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Biasanya tidak dilarutkan"
  },
  {
    "drug1": "Melphalan",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Meropenem",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Lebih disukai"
  },
  {
    "drug1": "Meropenem",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "kurang stabil"
  },
  {
    "drug1": "Meropenem",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Meropenem",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Mesna (Uromitexan)",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Mesna (Uromitexan)",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Metronidazole",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "Tidak perlu dilarutkan. Jangan dicampur dengan obat lain"
  },
  {
    "drug1": "Metronidazole",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Tidak perlu dilarutkan. Jangan dicampur dengan obat lain"
  },
  {
    "drug1": "Metrotrexate",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Metrotrexate",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Metrotrexate",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "MgSO4",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "MgSO4",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Midazolam",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Midazolam",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Midazolam",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Mitomycin-C",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Mitomycin-C",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Mitomycin-C",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Morphine Sulphate",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "bila diinfus bersama dgn heparin gunakan hanya NaCl 0.9%"
  },
  {
    "drug1": "Morphine Sulphate",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "bila diinfus bersama dgn heparin gunakan hanya NaCl 0.9%"
  },
  {
    "drug1": "Ondansentron",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C",
    "notes": "Tidak tercampur dengan obat dan larutan bersifat basa"
  },
  {
    "drug1": "Ondansentron",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Oxaliplatin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Oxaliplatin",
    "drug2": "NaCl 0.9%",
    "status": "I"
  },
  {
    "drug1": "Paclitaxel",
    "drug2": "Pelarut Original",
    "status": "C"
  },
  {
    "drug1": "Penicillin G",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Penicillin G",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Phenytoin",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Jangan dicampur dengan obat lain"
  },
  {
    "drug1": "Piperacillin-Tazobactam",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Piperacillin-Tazobactam",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Piperacillin-Tazobactam",
    "drug2": "Ringer Laktat",
    "status": "I"
  },
  {
    "drug1": "Propranolol",
    "drug2": "NaCl 0.9%",
    "status": "C",
    "notes": "Tidak direkomendasi untuk dilarutkan tapi NaCl 0.9% dapat digunakan"
  },
  {
    "drug1": "Ranitidin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Ranitidin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Ranitidin",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Rituximab",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Rituximab",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Sodium Bikarbonat",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Sodium Bikarbonat",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Sodium Valproat",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Sodium Valproat",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Sodium Valproat",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Teicoplanin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Tobramisin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Tobramisin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Topotecan",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Topotecan",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Transtuzumab",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Transtuzumab",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Vancomycin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Vancomycin",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  },
  {
    "drug1": "Vancomycin",
    "drug2": "Ringer Laktat",
    "status": "C"
  },
  {
    "drug1": "Vancomycin",
    "drug2": "Heparin",
    "status": "I"
  },
  {
    "drug1": "Vinblastin",
    "drug2": "Water for Injection",
    "status": "C"
  },
  {
    "drug1": "Vinblastin",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Vincristine",
    "drug2": "NaCl 0.9%",
    "status": "C"
  },
  {
    "drug1": "Vincristine",
    "drug2": "Larutan Dextrosa 5%",
    "status": "C"
  }
];

// Helper to check compatibility

interface IvCompatibilityCheckerProps {
  isAdmin?: boolean;
}

export const IvCompatibilityChecker: React.FC<IvCompatibilityCheckerProps> = ({ isAdmin = false }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState("");

  const [activeTab, setActiveTab] = useState<"drugs" | "matrix">("drugs");

  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
      const [ivDrugsState, setIvDrugsState] = useState<IvDrug[]>(() => {
    const saved = localStorage.getItem("ivDrugsData_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          // Merge missing fields from INITIAL_IV_DRUGS to existing
          const merged = parsed.map((p: IvDrug) => {
             const init = INITIAL_IV_DRUGS.find(i => i.id === p.id);
             if (init) {
                return { ...init, ...p, bud: init.bud || p.bud, storageTemp: init.storageTemp || p.storageTemp, reference: init.reference || p.reference };
             }
             return p;
          });
          // Add new from init
          INITIAL_IV_DRUGS.forEach(i => {
             if (!merged.find((m: IvDrug) => m.id === i.id)) {
                merged.push(i);
             }
          });
          return merged;
        }
      } catch (e) {
        return INITIAL_IV_DRUGS;
      }
    }
    return INITIAL_IV_DRUGS;
  });

  const [matrixState, setMatrixState] = useState<CompatibilityRecord[]>(() => {
    const saved = localStorage.getItem("ivMatrixData_v2") || localStorage.getItem("ivMatrixData");
    if (saved) {
      try {
        const parsed: CompatibilityRecord[] = JSON.parse(saved);
        if (parsed.length > 0) {
          // Reconcile with INITIAL_MATRIX to apply updates (e.g. Ceftriaxone + Ringer Laktat -> I)
          return parsed.map(item => {
            const match = INITIAL_MATRIX.find(
              m => (m.drug1.toLowerCase() === item.drug1.toLowerCase() && m.drug2.toLowerCase() === item.drug2.toLowerCase()) ||
                   (m.drug1.toLowerCase() === item.drug2.toLowerCase() && m.drug2.toLowerCase() === item.drug1.toLowerCase())
            );
            if (match) {
              return { ...item, status: match.status, notes: match.notes };
            }
            return item;
          });
        }
      } catch (e) {
        return INITIAL_MATRIX;
      }
    }
    return INITIAL_MATRIX;
  });

  useEffect(() => {
    localStorage.setItem("ivDrugsData_v2", JSON.stringify(ivDrugsState));
    localStorage.setItem("ivMatrixData_v2", JSON.stringify(matrixState));
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
    let dataToExport = activeTab === "drugs" ? [{ id: "contoh_id", name: "Contoh Nama", category: "Contoh Kategori", bud: "Contoh BUD", storageTemp: "Contoh Suhu", reference: "Contoh Ref" }] : [{ drug1: "contoh_id_1", drug2: "contoh_id_2", status: "C", notes: "Contoh Notes" }];
    let sheetName = activeTab === "drugs" ? "Template_Obat_IV" : "Template_Matriks_IV";
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };


  const handleClearData = () => {
    setIvDrugsState([]);
    setMatrixState([]);
    localStorage.removeItem("ivDrugsData_v2");
    localStorage.removeItem("ivMatrixData");
    setSelectedDrugs([]);
    setIsConfirmClearOpen(false);
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
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Update Data Kompatibilitas
              </button>
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua Data
              </button>
            </div>
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
                        const rowDrug = ivDrugsState.find(d => d.id === rowId) || { id: rowId, name: "Unknown", category: "" };
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
                          const d1 = ivDrugsState.find(d => d.id === id1) || { id: id1, name: "Unknown", category: "" };
                          const d2 = ivDrugsState.find(d => d.id === id2) || { id: id2, name: "Unknown", category: "" };

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
                      const drug = ivDrugsState.find(d => d.id === id) || { id, name: "Unknown", category: "", bud: "", storageTemp: "", reference: "" };
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

      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Hapus Semua Data</h3>
              <button 
                onClick={() => setIsConfirmClearOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus semua data Obat & Matriks?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
