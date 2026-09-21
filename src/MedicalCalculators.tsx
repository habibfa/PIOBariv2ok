import React, { useState } from "react";
import { 
  Calculator, 
  Activity, 
  Heart, 
  Brain, 
  Baby, 
  Weight, 
  Pill, 
  Droplet, 
  Microscope,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Droplets,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { CHEMO_REGIMENS_DATA, ChemoRegimen, ChemoDrugComponent } from "./data/chemoRegimensData";

type CalculatorType = "bmi" | "crcl" | "bsa" | "gcs" | "apgar" | "cha2ds2vasc" | "pediatric" | "chemo" | "egfr" | "lab";

export function MedicalCalculators() {
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);

  const ReferenceFooter = ({ references }: { references: string[] }) => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <h4 className="text-xs font-bold text-slate-500 mb-2">Referensi & Pustaka:</h4>
      <ul className="text-[10px] text-slate-400 list-disc pl-4 space-y-1">
        {references.map((ref, idx) => (
          <li key={idx}>{ref}</li>
        ))}
      </ul>
    </div>
  );


  // States for eGFR
  const [egfrAge, setEgfrAge] = useState("");
  const [egfrCr, setEgfrCr] = useState("");
  const [egfrGender, setEgfrGender] = useState<"male" | "female">("male");
  const [egfrRace, setEgfrRace] = useState<"black" | "other">("other");

  // States for Lab
  const [labParam, setLabParam] = useState("Na");
  const [labValue, setLabValue] = useState("");

  // States for Chemotherapy
  const [chemoRegimen, setChemoRegimen] = useState<string>("abvd");
  const [chemoGender, setChemoGender] = useState<"female" | "male">("female");
  const [chemoAge, setChemoAge] = useState("40");
  const [chemoWeight, setChemoWeight] = useState("50");
  const [chemoHeight, setChemoHeight] = useState("150");
  const [chemoCr, setChemoCr] = useState("0.9");
  const [chemoAUC, setChemoAUC] = useState("5");
  const [chemoBeva, setChemoBeva] = useState("7.5");
  const [chemoDosePercent, setChemoDosePercent] = useState<number>(100);
  const [chemoCategoryFilter, setChemoCategoryFilter] = useState<string>("all");
  const [chemoHasCalculated, setChemoHasCalculated] = useState(false);
  const [chemoActiveTab, setChemoActiveTab] = useState<"drugs" | "sequence" | "premed" | "vital">("drugs");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // States for Pediatric Dose
  const [pedAdultDose, setPedAdultDose] = useState("");
  const [pedAgeMonths, setPedAgeMonths] = useState("");
  const [pedWeight, setPedWeight] = useState("");

  // States for BMI/IBW
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiGender, setBmiGender] = useState<"male" | "female">("male");

  // States for CrCl
  const [crclAge, setCrclAge] = useState("");
  const [crclWeight, setCrclWeight] = useState("");
  const [crclCr, setCrclCr] = useState("");
  const [crclGender, setCrclGender] = useState<"male" | "female">("male");

  // States for BSA
  const [bsaWeight, setBsaWeight] = useState("");
  const [bsaHeight, setBsaHeight] = useState("");

  // States for GCS
  const [gcsEye, setGcsEye] = useState<number>(4);
  const [gcsVerbal, setGcsVerbal] = useState<number>(5);
  const [gcsMotor, setGcsMotor] = useState<number>(6);

  // States for APGAR
  const [apgarColor, setApgarColor] = useState<number>(2);
  const [apgarHeart, setApgarHeart] = useState<number>(2);
  const [apgarReflex, setApgarReflex] = useState<number>(2);
  const [apgarMuscle, setApgarMuscle] = useState<number>(2);
  const [apgarRespiration, setApgarRespiration] = useState<number>(2);

  // States for CHA2DS2-VASc
  const [chaAge, setChaAge] = useState<"under65" | "65to74" | "75over">("under65");
  const [chaGender, setChaGender] = useState<"male" | "female">("male");
  const [chaCHF, setChaCHF] = useState(false);
  const [chaHTN, setChaHTN] = useState(false);
  const [chaStroke, setChaStroke] = useState(false);
  const [chaVascular, setChaVascular] = useState(false);
  const [chaDiabetes, setChaDiabetes] = useState(false);

  const renderCalculatorList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button onClick={() => setActiveCalc("apgar")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
          <Baby className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">APGAR Score</h3>
          <p className="text-slate-500 text-sm mt-1">Penilaian Kondisi Bayi Baru Lahir</p>
        </div>
      </button>

      <button onClick={() => setActiveCalc("bmi")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <Weight className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">BMI & IBW</h3>
          <p className="text-slate-500 text-sm mt-1">Indeks Massa Tubuh & Berat Badan Ideal</p>
        </div>
      </button>
      
      <button onClick={() => setActiveCalc("bsa")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Body Surface Area</h3>
          <p className="text-slate-500 text-sm mt-1">Luas Permukaan Tubuh (Mosteller)</p>
        </div>
      </button>

      <button onClick={() => setActiveCalc("cha2ds2vasc")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">CHA₂DS₂-VASc</h3>
          <p className="text-slate-500 text-sm mt-1">Risiko Stroke pada Fibrilasi Atrium</p>
        </div>
      </button>

      <button onClick={() => setActiveCalc("crcl")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Creatinine Clearance</h3>
          <p className="text-slate-500 text-sm mt-1">Klirens Kreatinin (Cockcroft-Gault)</p>
        </div>
      </button>

      <button onClick={() => setActiveCalc("gcs")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">GCS Score</h3>
          <p className="text-slate-500 text-sm mt-1">Glasgow Coma Scale</p>
        </div>
      </button>
      <button onClick={() => setActiveCalc("chemo")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-800 text-lg">Kalkulator Kemoterapi</h3>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-teal-100 text-teal-800 rounded uppercase">9 Regimen Kanker</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Dosis Individual LPT/AUC, Urutan Infus & Protokol Kanker</p>
        </div>
      </button>
      <button onClick={() => setActiveCalc("pediatric")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
          <Pill className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Konversi Dosis Anak</h3>
          <p className="text-slate-500 text-sm mt-1">Young, Dilling, Fried, Clark</p>
        </div>
      </button>
      <button onClick={() => setActiveCalc("egfr")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
          <Droplet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">eGFR (CKD-EPI)</h3>
          <p className="text-slate-500 text-sm mt-1">Fungsi Ginjal CKD-EPI 2021</p>
        </div>
      </button>
      <button onClick={() => setActiveCalc("lab")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
          <Microscope className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Interpretasi Lab</h3>
          <p className="text-slate-500 text-sm mt-1">Elektrolit & Fungsi Organ</p>
        </div>
      </button>
    </div>
  );

  const renderEgfrCalculator = () => {
    let egfr = 0;
    const a = parseFloat(egfrAge);
    const cr = parseFloat(egfrCr);
    
    if (a > 0 && cr > 0) {
      const k = egfrGender === "female" ? 0.7 : 0.9;
      const alpha = egfrGender === "female" ? -0.241 : -0.302;
      const alpha2 = -1.200;
      const p1 = Math.min(cr / k, 1);
      const p2 = Math.max(cr / k, 1);
      
      egfr = 142 * Math.pow(p1, alpha) * Math.pow(p2, alpha2) * Math.pow(0.9938, a) * (egfrGender === "female" ? 1.012 : 1);
    }
    
    let stage = "";
    if (egfr > 0) {
      if (egfr >= 90) stage = "G1 (Normal atau Tinggi)";
      else if (egfr >= 60) stage = "G2 (Menurun Ringan)";
      else if (egfr >= 45) stage = "G3a (Menurun Ringan-Sedang)";
      else if (egfr >= 30) stage = "G3b (Menurun Sedang-Berat)";
      else if (egfr >= 15) stage = "G4 (Menurun Berat)";
      else stage = "G5 (Gagal Ginjal)";
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">eGFR (CKD-EPI 2021)</h2>
          <p className="text-slate-500 text-sm mt-1">Estimasi Laju Filtrasi Glomerulus untuk menilai fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Usia (Tahun)</label>
            <input type="number" value={egfrAge} onChange={e => setEgfrAge(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="misal: 45" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Serum Kreatinin (mg/dL)</label>
            <input type="number" step="0.1" value={egfrCr} onChange={e => setEgfrCr(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="misal: 1.2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Jenis Kelamin</label>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setEgfrGender("male")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${egfrGender === 'male' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}>Laki-laki</button>
              <button onClick={() => setEgfrGender("female")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${egfrGender === 'female' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}>Perempuan</button>
            </div>
          </div>
        </div>

        {egfr > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mt-6">
            <h3 className="text-sm font-bold text-rose-800 uppercase mb-2">Hasil Estimasi</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-rose-600">{egfr.toFixed(1)}</span>
              <span className="text-rose-700 font-bold mb-1">mL/min/1.73m²</span>
            </div>
            <div className="bg-white/60 px-3 py-2 rounded-lg border border-rose-100 inline-block">
              <span className="text-sm font-bold text-rose-900">Stadium CKD: {stage}</span>
            </div>
          </div>
        )}
      
        <ReferenceFooter references={["Inker LA, Schmid CH, Tighiouart H, et al. Estimating glomerular filtration rate from serum creatinine and cystatin C. N Engl J Med. 2012;367(1):20-29. (CKD-EPI 2021 update)"]} />
      </div>
    );
  };

  const renderLabCalculator = () => {
    const labParams = [
      // Elektrolit
      { id: "Na", category: "Elektrolit", label: "Natrium (Na)", unit: "mEq/L", min: 135, max: 145, lowMsg: "Hiponatremia", highMsg: "Hipernatremia", example: "140" },
      { id: "K", category: "Elektrolit", label: "Kalium (K)", unit: "mEq/L", min: 3.5, max: 5.0, lowMsg: "Hipokalemia", highMsg: "Hiperkalemia", example: "4.2" },
      { id: "Cl", category: "Elektrolit", label: "Klorida (Cl)", unit: "mEq/L", min: 98, max: 106, lowMsg: "Hipokloremia", highMsg: "Hiperkloremia", example: "102" },
      { id: "Ca", category: "Elektrolit", label: "Kalsium (Ca) Total", unit: "mg/dL", min: 8.5, max: 10.5, lowMsg: "Hipokalsemia", highMsg: "Hiperkalsemia", example: "9.5" },
      { id: "Mg", category: "Elektrolit", label: "Magnesium (Mg)", unit: "mg/dL", min: 1.7, max: 2.2, lowMsg: "Hipomagnesemia", highMsg: "Hipermagnesemia", example: "2.0" },
      
      // Fungsi Hati
      { id: "AST", category: "Fungsi Hati", label: "AST (SGOT)", unit: "U/L", min: 8, max: 48, lowMsg: "Rendah", highMsg: "Peningkatan (Hepatik/Otot)", example: "25" },
      { id: "ALT", category: "Fungsi Hati", label: "ALT (SGPT)", unit: "U/L", min: 7, max: 55, lowMsg: "Rendah", highMsg: "Peningkatan (Hepatik)", example: "30" },
      { id: "Albumin", category: "Fungsi Hati", label: "Albumin", unit: "g/dL", min: 3.4, max: 5.4, lowMsg: "Hipoalbuminemia", highMsg: "Hiperalbuminemia/Dehidrasi", example: "4.0" },
      
      // Fungsi Ginjal
            // Darah Lengkap (CBC)
      { id: "Hb", category: "Darah Lengkap", label: "Hemoglobin (Hb)", unit: "g/dL", min: 12.0, max: 16.0, lowMsg: "Anemia", highMsg: "Polisitemia", example: "13.5" },
      { id: "Ht", category: "Darah Lengkap", label: "Hematokrit (Ht)", unit: "%", min: 36, max: 50, lowMsg: "Rendah (Anemia/Perdarahan)", highMsg: "Tinggi (Dehidrasi/Polisitemia)", example: "42" },
      { id: "WBC", category: "Darah Lengkap", label: "Leukosit (WBC)", unit: "10^3/µL", min: 4.5, max: 11.0, lowMsg: "Leukopenia (Infeksi virus/Supresi sumsum)", highMsg: "Leukositosis (Infeksi/Inflamasi)", example: "7.5" },
      { id: "PLT", category: "Darah Lengkap", label: "Trombosit (PLT)", unit: "10^3/µL", min: 150, max: 450, lowMsg: "Trombositopenia", highMsg: "Trombositosis", example: "250" },
      
      // Profil Lipid
      { id: "Chol", category: "Profil Lipid", label: "Kolesterol Total", unit: "mg/dL", min: 0, max: 200, lowMsg: "Normal", highMsg: "Hiperkolesterolemia", example: "180" },
      { id: "HDL", category: "Profil Lipid", label: "Kolesterol HDL", unit: "mg/dL", min: 40, max: 100, lowMsg: "Rendah (Risiko Kardiovaskular)", highMsg: "Normal/Baik", example: "55" },
      { id: "LDL", category: "Profil Lipid", label: "Kolesterol LDL", unit: "mg/dL", min: 0, max: 130, lowMsg: "Optimal", highMsg: "Tinggi (Risiko Kardiovaskular)", example: "110" },
      { id: "TG", category: "Profil Lipid", label: "Trigliserida", unit: "mg/dL", min: 0, max: 150, lowMsg: "Normal", highMsg: "Hipertrigliseridemia", example: "120" },
      
      // Gula Darah
      { id: "GDP", category: "Gula Darah", label: "Gula Darah Puasa (GDP)", unit: "mg/dL", min: 70, max: 99, lowMsg: "Hipoglikemia", highMsg: "Prediabetes / Diabetes", example: "90" },
      { id: "GDS", category: "Gula Darah", label: "Gula Darah Sewaktu (GDS)", unit: "mg/dL", min: 70, max: 140, lowMsg: "Hipoglikemia", highMsg: "Curiga Diabetes / Hiperglikemia", example: "115" },
      { id: "HbA1c", category: "Gula Darah", label: "HbA1c", unit: "%", min: 4.0, max: 5.6, lowMsg: "Normal", highMsg: "Prediabetes / Diabetes", example: "5.2" },
      
      { id: "Cr", category: "Fungsi Ginjal", label: "Serum Creatinine", unit: "mg/dL", min: 0.6, max: 1.2, lowMsg: "Rendah", highMsg: "Tinggi (Gangguan Ginjal)", example: "0.9" },
      { id: "BUN", category: "Fungsi Ginjal", label: "BUN (Blood Urea Nitrogen)", unit: "mg/dL", min: 7, max: 20, lowMsg: "Rendah", highMsg: "Tinggi (Uremia/Dehidrasi)", example: "15" }
    ];

    const currentParam = labParams.find(p => p.id === labParam) || labParams[0];
    let interpretation = null;
    const val = parseFloat(labValue);

    if (!isNaN(val)) {
      let status: "Low" | "Normal" | "High" = "Normal";
      let message = "Normal";
      if (val < currentParam.min) { status = "Low"; message = currentParam.lowMsg; }
      else if (val > currentParam.max) { status = "High"; message = currentParam.highMsg; }
      interpretation = { value: val, status, message };
    }
    
    // Group parameters by category
    const groupedParams = labParams.reduce((acc, param) => {
      if (!acc[param.category]) {
        acc[param.category] = [];
      }
      acc[param.category].push(param);
      return acc;
    }, {} as Record<string, typeof labParams>);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-indigo-600" />
            Interpretasi Laboratorium
          </h2>
          <p className="text-slate-500 text-sm mt-1">Evaluasi cepat nilai darah lengkap, elektrolit, profil lipid, gula darah, fungsi hati, dan fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Parameter Lab</label>
              <select 
                value={labParam} 
                onChange={e => { setLabParam(e.target.value); setLabValue(""); }}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700 shadow-xs"
              >
                {Object.entries(groupedParams).map(([category, params]) => (
                  <optgroup key={category} label={category}>
                    {params.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nilai ({currentParam.unit})</label>
              <input 
                type="number" 
                step="0.1" 
                value={labValue} 
                onChange={e => setLabValue(e.target.value)} 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-xs" 
                placeholder={`Contoh: ${currentParam.example}`} 
              />
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col justify-center min-h-[160px]">
            <h3 className="text-sm font-bold text-indigo-800 text-center mb-4">Hasil Interpretasi</h3>
            
            {interpretation ? (
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                interpretation.status === 'Normal' ? 'bg-emerald-50 border-emerald-200' :
                interpretation.status === 'Low' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="mb-2">
                  <span className={`text-3xl font-black ${
                    interpretation.status === 'Normal' ? 'text-emerald-700' :
                    interpretation.status === 'Low' ? 'text-amber-700' : 'text-rose-700'
                  }`}>{interpretation.value}</span>
                  <span className="text-sm font-semibold ml-1 text-slate-600">{currentParam.unit}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-md text-sm font-bold inline-block ${
                  interpretation.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                  interpretation.status === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {interpretation.message}
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  Nilai Rujukan: {currentParam.min} - {currentParam.max} {currentParam.unit}
                </div>
              </div>
            ) : (
              <div className="border border-indigo-100 border-dashed rounded-xl p-4 bg-white/60">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Masukkan nilai hasil laboratorium untuk melihat interpretasi klinis sesuai nilai rujukan standar.
                </p>
              </div>
            )}
          </div>
        </div>

        <ReferenceFooter references={["Kementerian Kesehatan RI / Panduan Praktik Klinis / Referensi Nilai Laboratorium Standar Nasional.", "Fauci AS, et al. Harrison's Principles of Internal Medicine. 20th ed. McGraw-Hill Education; 2018.", "Kratz A, Ferraro M, Sluss PM, Lewandrowski KB. Case records of the Massachusetts General Hospital. Normal reference laboratory values. N Engl J Med. 2004;351(15):1548-1563."]} />
      </div>
    );
  };

  const renderBMICalculator = () => {
    let bmi = 0;
    let ibw = 0;
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight);
    
    if (w > 0 && h > 0) {
      bmi = w / Math.pow(h / 100, 2);
      if (bmiGender === "male") {
        ibw = 50 + 0.91 * (h - 152.4);
      } else {
        ibw = 45.5 + 0.91 * (h - 152.4);
      }
    }

    let category = "";
    if (bmi > 0) {
      if (bmi < 18.5) category = "Kurus (Underweight)";
      else if (bmi < 25) category = "Normal";
      else if (bmi < 30) category = "Berat Badan Lebih (Overweight)";
      else category = "Obesitas";
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">BMI & Ideal Body Weight (IBW)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select value={bmiGender} onChange={(e) => setBmiGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
            <input type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 170" />
          </div>

          {bmi > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Perhitungan:</p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-700 font-semibold">BMI:</span>
                <span className="text-2xl font-black text-emerald-700">{bmi.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg/m²</span></span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-4 text-right">{category}</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">Berat Badan Ideal (IBW):</span>
                <span className="text-xl font-bold text-slate-800">{ibw.toFixed(1)} <span className="text-sm text-slate-500 font-normal">kg</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["World Health Organization (WHO). Obesity: preventing and managing the global epidemic. Report of a WHO consultation. World Health Organ Tech Rep Ser. 2000;894:i-xii, 1-253.", "Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655. (IBW formula)"]} />
      </div>
    );
  };

  const renderCrClCalculator = () => {
    let crcl = 0;
    const a = parseFloat(crclAge);
    const w = parseFloat(crclWeight);
    const c = parseFloat(crclCr);
    
    if (a > 0 && w > 0 && c > 0) {
      crcl = ((140 - a) * w) / (72 * c);
      if (crclGender === "female") crcl *= 0.85;
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Creatinine Clearance (Cockcroft-Gault)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select value={crclGender} onChange={(e) => setCrclGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Usia (Tahun)</label>
            <input type="number" value={crclAge} onChange={(e) => setCrclAge(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 60" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={crclWeight} onChange={(e) => setCrclWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kreatinin Serum (mg/dL)</label>
            <input type="number" value={crclCr} onChange={(e) => setCrclCr(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 1.2" />
          </div>

          {crcl > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Estimasi LFG (eGFR):</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">CrCl:</span>
                <span className="text-2xl font-black text-amber-600">{crcl.toFixed(1)} <span className="text-sm text-slate-500 font-normal">mL/min</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41."]} />
      </div>
    );
  };

  const renderBSACalculator = () => {
    let bsa = 0;
    const w = parseFloat(bsaWeight);
    const h = parseFloat(bsaHeight);
    
    if (w > 0 && h > 0) {
      bsa = Math.sqrt((w * h) / 3600);
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Body Surface Area (Mosteller)</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
            <input type="number" value={bsaHeight} onChange={(e) => setBsaHeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 170" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
            <input type="number" value={bsaWeight} onChange={(e) => setBsaWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 70" />
          </div>

          {bsa > 0 && (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Hasil Luas Permukaan Tubuh:</p>
              <div className="flex justify-between items-end">
                <span className="text-slate-700 font-semibold">BSA:</span>
                <span className="text-2xl font-black text-emerald-600">{bsa.toFixed(2)} <span className="text-sm text-slate-500 font-normal">m²</span></span>
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098."]} />
      </div>
    );
  };

  const renderGCSCalculator = () => {
    const total = gcsEye + gcsVerbal + gcsMotor;
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Glasgow Coma Scale (GCS)</h3>
        <div className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Mata (Eye - E)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsEye(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Spontan buka mata</button>
              <button onClick={() => setGcsEye(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Buka mata terhadap suara/perintah</button>
              <button onClick={() => setGcsEye(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Buka mata terhadap rangsang nyeri</button>
              <button onClick={() => setGcsEye(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsEye === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Verbal (Verbal - V)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsVerbal(5)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 5 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>5 - Orientasi baik (waktu, tempat, orang)</button>
              <button onClick={() => setGcsVerbal(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Bingung, bicara mengacau (confused)</button>
              <button onClick={() => setGcsVerbal(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Kata-kata tidak bermakna (inappropriate)</button>
              <button onClick={() => setGcsVerbal(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Suara mengerang (incomprehensible)</button>
              <button onClick={() => setGcsVerbal(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsVerbal === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Respon Motorik (Motor - M)</label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button onClick={() => setGcsMotor(6)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 6 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>6 - Mengikuti perintah</button>
              <button onClick={() => setGcsMotor(5)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 5 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>5 - Melokalisir nyeri</button>
              <button onClick={() => setGcsMotor(4)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 4 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4 - Menghindari nyeri (withdrawal)</button>
              <button onClick={() => setGcsMotor(3)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 3 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>3 - Fleksi abnormal (dekortikasi)</button>
              <button onClick={() => setGcsMotor(2)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>2 - Ekstensi abnormal (deserebrasi)</button>
              <button onClick={() => setGcsMotor(1)} className={`p-3 text-left border rounded-lg transition-colors ${gcsMotor === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>1 - Tidak ada respon</button>
            </div>
          </div>
          
          <div className="mt-6 bg-slate-900 text-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-slate-300 mb-1">Skor GCS Total:</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-teal-400">{total}</span>
              <span className="text-sm font-medium px-3 py-1 bg-white/20 rounded-full">E{gcsEye} V{gcsVerbal} M{gcsMotor}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {total >= 13 ? "Cedera Otak Ringan" : total >= 9 ? "Cedera Otak Sedang" : "Cedera Otak Berat (Koma, pertimbangkan intubasi)"}
            </p>
          </div>
        </div>
      
        <ReferenceFooter references={["Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84."]} />
      </div>
    );
  };

  const renderApgarCalculator = () => {
    const total = apgarColor + apgarHeart + apgarReflex + apgarMuscle + apgarRespiration;
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">APGAR Score</h3>
        <div className="space-y-6 max-w-xl">
          {[
            { label: "Warna Kulit (Appearance)", state: apgarColor, set: setApgarColor, options: ["Pucat/Biru seluruh tubuh (0)", "Tubuh merah, ekstremitas biru (1)", "Seluruh tubuh kemerahan (2)"] },
            { label: "Denyut Jantung (Pulse)", state: apgarHeart, set: setApgarHeart, options: ["Tidak ada (0)", "< 100 x/menit (1)", "> 100 x/menit (2)"] },
            { label: "Refleks (Grimace)", state: apgarReflex, set: setApgarReflex, options: ["Tidak ada respon (0)", "Meringis saat distimulasi (1)", "Menangis kuat/batuk (2)"] },
            { label: "Tonus Otot (Activity)", state: apgarMuscle, set: setApgarMuscle, options: ["Lemah/Lumpuh (0)", "Sedikit fleksi ekstremitas (1)", "Gerak aktif (2)"] },
            { label: "Pernapasan (Respiration)", state: apgarRespiration, set: setApgarRespiration, options: ["Tidak bernapas (0)", "Lambat, tidak teratur, merintih (1)", "Menangis kuat (2)"] },
          ].map((item, i) => (
            <div key={i}>
              <label className="block text-sm font-bold text-slate-800 mb-2">{item.label}</label>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {item.options.map((opt, val) => (
                  <button key={val} onClick={() => item.set(val)} className={`p-3 text-left border rounded-lg transition-colors ${item.state === val ? "bg-pink-50 border-pink-500 text-pink-700 font-semibold" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <p className="text-sm text-slate-500 mb-1">Skor Total:</p>
             <div className="flex items-center gap-4 mb-2">
               <span className="text-4xl font-black text-pink-600">{total}</span>
             </div>
             <p className="text-sm font-semibold text-slate-700">
               {total >= 7 ? "Normal / Bugar" : total >= 4 ? "Asfiksia Sedang (Butuh resusitasi sedang)" : "Asfiksia Berat (Butuh resusitasi segera)"}
             </p>
          </div>
        </div>
      
        <ReferenceFooter references={["Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.", "American Academy of Pediatrics, Committee on Fetus and Newborn; American College of Obstetricians and Gynecologists and Committee on Obstetric Practice. The Apgar Score. Pediatrics. 2015;136(4):819-822."]} />
      </div>
    );
  };

  const renderCha2ds2vasc = () => {
    let score = 0;
    if (chaAge === "65to74") score += 1;
    if (chaAge === "75over") score += 2;
    if (chaGender === "female") score += 1;
    if (chaCHF) score += 1;
    if (chaHTN) score += 1;
    if (chaStroke) score += 2;
    if (chaVascular) score += 1;
    if (chaDiabetes) score += 1;

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">CHA₂DS₂-VASc Score</h3>
        <p className="text-sm text-slate-500 mb-6">Risiko Stroke pada pasien Fibrilasi Atrium (Non-valvular)</p>
        <div className="space-y-4 max-w-md">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Usia</label>
             <select value={chaAge} onChange={(e) => setChaAge(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
               <option value="under65">&lt; 65 tahun (0 poin)</option>
               <option value="65to74">65 - 74 tahun (1 poin)</option>
               <option value="75over">≥ 75 tahun (2 poin)</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin</label>
             <select value={chaGender} onChange={(e) => setChaGender(e.target.value as any)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
               <option value="male">Laki-laki (0 poin)</option>
               <option value="female">Perempuan (1 poin)</option>
             </select>
           </div>
           
           <div className="space-y-3 pt-4 border-t border-slate-100">
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaCHF} onChange={(e) => setChaCHF(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Congestive Heart Failure (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaHTN} onChange={(e) => setChaHTN(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Hipertensi (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaDiabetes} onChange={(e) => setChaDiabetes(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Diabetes Mellitus (+1)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaStroke} onChange={(e) => setChaStroke(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Riwayat Stroke / TIA / Tromboemboli (+2)</span>
             </label>
             <label className="flex items-center gap-3">
               <input type="checkbox" checked={chaVascular} onChange={(e) => setChaVascular(e.target.checked)} className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
               <span className="text-sm font-medium text-slate-700">Penyakit Vaskular (MI, PAD, plak aorta) (+1)</span>
             </label>
           </div>

           <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <div className="flex justify-between items-end mb-2">
                <span className="text-slate-700 font-semibold">Skor CHA₂DS₂-VASc:</span>
                <span className="text-3xl font-black text-rose-600">{score}</span>
             </div>
             <p className="text-sm text-slate-600 mt-2 font-medium">
               Rekomendasi Antikoagulan: 
               {score === 0 && chaGender === "male" ? " Risiko rendah, tidak perlu antikoagulan oral." : 
                (score === 1 && chaGender === "male") || (score === 2 && chaGender === "female") ? " Pertimbangkan antikoagulan oral atau tanpa terapi." :
                " Direkomendasikan terapi antikoagulan oral (OAC)."}
             </p>
           </div>
        </div>
      
        <ReferenceFooter references={["Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137(2):263-272."]} />
      </div>
    );
  };

  const renderPediatricDoseCalculator = () => {
    let young = 0;
    let dilling = 0;
    let fried = 0;
    let clark = 0;

    const adultDose = parseFloat(pedAdultDose);
    const ageMonths = parseFloat(pedAgeMonths);
    const weight = parseFloat(pedWeight);

    if (adultDose > 0) {
      if (ageMonths > 0) {
        const ageYears = ageMonths / 12;
        young = (ageYears / (ageYears + 12)) * adultDose;
        dilling = (ageYears / 20) * adultDose;
        fried = (ageMonths / 150) * adultDose;
      }
      if (weight > 0) {
        clark = (weight / 70) * adultDose;
      }
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Konversi Dosis Anak dari Dosis Dewasa</h3>
        <p className="text-sm text-slate-500 mb-6">Perkiraan dosis anak berdasarkan berbagai rumus empiris klasik. Rumus ini hanya digunakan jika informasi dosis anak spesifik tidak tersedia.</p>
        <div className="space-y-4 max-w-md">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Dosis Dewasa</label>
             <input type="number" value={pedAdultDose} onChange={(e) => setPedAdultDose(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 500 (mg)" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Usia (Bulan)</label>
             <input type="number" value={pedAgeMonths} onChange={(e) => setPedAgeMonths(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 24 (2 tahun)" />
           </div>
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Berat Badan (kg)</label>
             <input type="number" value={pedWeight} onChange={(e) => setPedWeight(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Misal: 12" />
           </div>

           {(young > 0 || clark > 0) && (
             <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <p className="text-sm text-slate-500 font-semibold mb-2">Hasil Estimasi Dosis Anak:</p>
                
                {clark > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-slate-700 font-semibold">Rumus Clark</span>
                      <span className="text-xs text-slate-500">(Berdasarkan Berat Badan)</span>
                    </div>
                    <span className="text-xl font-black text-purple-600">{clark.toFixed(2)}</span>
                  </div>
                )}
                
                {young > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-slate-700 font-semibold">Rumus Young</span>
                      <span className="text-xs text-slate-500">(Usia 1-12 Tahun)</span>
                    </div>
                    <span className="text-xl font-black text-purple-600">{young.toFixed(2)}</span>
                  </div>
                )}

                {dilling > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <span className="block text-slate-700 font-semibold">Rumus Dilling</span>
                      <span className="text-xs text-slate-500">(Berdasarkan Usia)</span>
                    </div>
                    <span className="text-xl font-black text-purple-600">{dilling.toFixed(2)}</span>
                  </div>
                )}

                {fried > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-slate-700 font-semibold">Rumus Fried</span>
                      <span className="text-xs text-slate-500">(Bayi &lt; 2 Tahun)</span>
                    </div>
                    <span className="text-xl font-black text-purple-600">{fried.toFixed(2)}</span>
                  </div>
                )}
             </div>
           )}
        </div>
      
        <ReferenceFooter references={["Taketomo CK, Hodding JH, Kraus DM. Pediatric & Neonatal Dosage Handbook. 26th ed. Lexicomp; 2019-2020.", "Kliegman RM, St. Geme JW, Blum NJ, Shah SS, Tasker RC, Wilson KM. Nelson Textbook of Pediatrics. 21st ed. Elsevier; 2020."]} />
      </div>
    );
  };

  const renderChemoCalculator = () => {
    let bmi = 0;
    let bsa = 0;
    let bsaDuBois = 0;
    let gfrNormal = 0;
    let gfrObese = 0;
    let ibw = 0;
    let abw = 0;

    const age = parseFloat(chemoAge) || 0;
    const weight = parseFloat(chemoWeight) || 0;
    const height = parseFloat(chemoHeight) || 0;
    const cr = parseFloat(chemoCr) || 0;
    const auc = parseFloat(chemoAUC) || 5;
    const beva = parseFloat(chemoBeva) || 7.5;

    // Resolve active regimen
    const currentRegimenId = 
      chemoRegimen === "ginekologi" ? "tc_gyn" :
      chemoRegimen === "payudara" ? "ac_act" :
      chemoRegimen === "serviks" ? "cisplatin_cervix" :
      chemoRegimen;

    const selectedRegimen = CHEMO_REGIMENS_DATA.find(r => r.id === currentRegimenId) || CHEMO_REGIMENS_DATA[0];

    // Check if regimen has Carboplatin or Bevacizumab
    const hasCarboplatin = selectedRegimen.components.some(c => c.doseUnit === "AUC" || c.drugId.toLowerCase().includes("carboplatin"));
    const hasBevacizumab = selectedRegimen.components.some(c => c.drugId.toLowerCase().includes("bevacizumab"));

    if (age > 0 && weight > 0 && height > 0 && cr > 0) {
      // IMT (BMI)
      bmi = weight / Math.pow(height / 100, 2);
      
      // LPT Mosteller: sqrt((W * H) / 3600)
      bsa = Math.sqrt((weight * height) / 3600);

      // LPT Du Bois: 0.007184 * W^0.425 * H^0.725
      bsaDuBois = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

      // Devine IBW
      const genderFactor = chemoGender === "female" ? 0.85 : 1.0;
      ibw = (chemoGender === "female" ? 45.5 : 50.0) + 2.3 * (height / 2.54 - 60);
      
      // Adjusted Body Weight for Obese (if actual weight > 120% IBW)
      abw = ibw > 0 ? ibw + 0.4 * (Math.max(weight, ibw) - ibw) : weight;

      // Cockcroft-Gault GFR Normal
      gfrNormal = ((140 - age) * weight) / (72 * cr) * genderFactor;

      // Cockcroft-Gault GFR Obese/Adjusted
      gfrObese = ((140 - age) * abw) / (72 * cr) * genderFactor;
    }

    // Effective GFR capped at 125 mL/min for Calvert formula
    const effectiveCrCl = Math.min(gfrNormal > 0 ? gfrNormal : 0, 125);

    // Calculated doses for each drug component in current regimen
    const calculatedComponents = selectedRegimen.components.map(comp => {
      let calculatedDose = 0;
      let standardDose = 0;
      let unit = "mg";
      let calculationFormulaStr = "";
      let ceilingWarning = "";

      if (comp.doseUnit === "mg/m2") {
        standardDose = bsa * comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `${bsa.toFixed(2)} m² × ${comp.defaultDoseValue} mg/m²`;

        // Clinical caps check
        if (comp.drugId === "Vinblastin" && calculatedDose > 10) {
          ceilingWarning = "Plafon Maksimal: 10 mg/dosis per pemberian (Kurangi ke 10 mg)";
        }
        if (comp.drugId === "Vincristin" && calculatedDose > 2.0) {
          ceilingWarning = "Plafon Maksimal: 2.0 mg/dosis untuk cegah paralisis/neurotoksisitas fatal!";
        }
        if (selectedRegimen.id === "cisplatin_cervix" && calculatedDose > 70) {
          ceilingWarning = "Plafon Maksimal: 70 mg/minggu pada CCRT Serviks";
        }
      } else if (comp.doseUnit === "unit/m2") {
        standardDose = bsa * comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "unit";
        calculationFormulaStr = `${bsa.toFixed(2)} m² × ${comp.defaultDoseValue} unit/m²`;
      } else if (comp.doseUnit === "mg/kg") {
        const factor = comp.drugId.toLowerCase().includes("bevacizumab") ? beva : comp.defaultDoseValue;
        standardDose = weight * factor;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `${weight} kg × ${factor} mg/kgBB`;
      } else if (comp.doseUnit === "AUC") {
        // Formula Calvert: Dose = AUC * (CrCl + 25)
        standardDose = auc * (effectiveCrCl + 25);
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `AUC ${auc} × (${effectiveCrCl.toFixed(1)} mL/min [Cap 125] + 25)`;
      } else if (comp.doseUnit === "mg_flat") {
        standardDose = comp.defaultDoseValue;
        calculatedDose = standardDose * (chemoDosePercent / 100);
        unit = "mg";
        calculationFormulaStr = `Dosis flat ${comp.defaultDoseValue} mg`;
      }

      return {
        ...comp,
        standardDose,
        calculatedDose,
        unit,
        calculationFormulaStr,
        ceilingWarning
      };
    });

    const handleReset = () => {
      setChemoAge("");
      setChemoWeight("");
      setChemoHeight("");
      setChemoCr("");
      setChemoAUC("5");
      setChemoBeva("7.5");
      setChemoDosePercent(100);
      setChemoHasCalculated(false);
    };

    const handlePresetPatient = () => {
      setChemoGender("female");
      setChemoAge("45");
      setChemoWeight("52");
      setChemoHeight("155");
      setChemoCr("0.85");
      setChemoAUC("5");
      setChemoBeva("7.5");
      setChemoDosePercent(100);
      setChemoHasCalculated(true);
    };

    const handleCopyClinicalSummary = () => {
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const lines = [
        `=== RESUMEN KALKULASI DOSIS KEMOTERAPI RSUD PALEMBANG BARI ===`,
        `Tanggal: ${dateStr}`,
        `Protokol: ${selectedRegimen.acronym} - ${selectedRegimen.fullName}`,
        `Indikasi: ${selectedRegimen.cancerTypeDetail}`,
        `Tujuan Terapi: ${selectedRegimen.primaryGoalHighlight}`,
        `--------------------------------------------------`,
        `DATA ANTROPOMETRI & FUNGSI GINJAL PASIEN:`,
        `- Gender: ${chemoGender === "female" ? "Perempuan" : "Laki-laki"}, Usia: ${chemoAge} tahun`,
        `- BB: ${chemoWeight} kg | TB: ${chemoHeight} cm`,
        `- IMT (BMI): ${bmi.toFixed(2)} kg/m²`,
        `- LPT (Mosteller): ${bsa.toFixed(2)} m² | Du Bois: ${bsaDuBois.toFixed(2)} m²`,
        `- Serum Kreatinin: ${chemoCr} mg/dL`,
        `- CrCl (Cockcroft-Gault): ${gfrNormal.toFixed(2)} mL/min (Capped Calvert: ${effectiveCrCl.toFixed(2)} mL/min)`,
        `- Penyesuaian Dosis (Dose Modification): ${chemoDosePercent}%`,
        `--------------------------------------------------`,
        `DOSIS OBAT TERHITUNG:`,
        ...calculatedComponents.map(c => 
          `• [Urutan #${c.sequenceOrder}] ${c.drugName}: ${Math.round(c.calculatedDose)} ${c.unit} (${c.calculationFormulaStr}) | Pelarut: ${c.diluentStandard} | Rute: ${c.adminRoute}${c.ceilingWarning ? ` [PERINGATAN: ${c.ceilingWarning}]` : ''}`
        ),
        `--------------------------------------------------`,
        `URUTAN PEMBILASAN & FLUSH:`,
        `Wajib pembilasan dengan NaCl 0.9% minimal 20-50 mL di antara setiap obat sitostatika untuk mencegah presipitasi/inkompatibilitas.`,
        `Referensi: ${selectedRegimen.references}`
      ];

      navigator.clipboard.writeText(lines.join("\n"));
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    };

    // Filtered regimens for dropdown selection
    const filteredRegimensList = CHEMO_REGIMENS_DATA.filter(r => {
      if (chemoCategoryFilter === "all") return true;
      return r.cancerCategory === chemoCategoryFilter;
    });

    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs w-full">
        {/* Header Kalkulator Kemoterapi */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 text-white border-b border-teal-800/40 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-teal-500/20 border border-teal-400/30 text-teal-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Kalkulator Dosis Onkologi & Protokol Kanker
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  9 Regimen Standar RSUD BARI
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-400" />
                Kalkulator Kemoterapi Dewasa
              </h3>
              <p className="text-xs md:text-sm text-teal-100/80 max-w-2xl">
                Kalkulasi dosis individual berdasarkan Luas Permukaan Tubuh (Mosteller & Du Bois), formula Calvert (AUC Carboplatin), Klirens Kreatinin Cockcroft-Gault, dan panduan sekuens pemberian.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePresetPatient}
                className="px-3 py-1.5 bg-teal-800/60 hover:bg-teal-700/60 border border-teal-600/40 text-teal-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Isi otomatis data contoh pasien (Wanita 45 th, 52 kg, 155 cm)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preset Contoh
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/40 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* SECTION 1: Pemilihan Regimen Kemoterapi */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Pilih Regimen Kemoterapi
              </label>

              {/* Category Quick Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                {[
                  { id: "all", label: "Semua Kanker" },
                  { id: "limfoma", label: "Limfoma" },
                  { id: "kolorektal", label: "Kolorektal" },
                  { id: "payudara", label: "Payudara" },
                  { id: "ginekologi", label: "Ginekologi" },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setChemoCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      chemoCategoryFilter === cat.id
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Regimen */}
            <div className="relative">
              <select
                value={currentRegimenId}
                onChange={(e) => {
                  setChemoRegimen(e.target.value);
                  setChemoHasCalculated(true);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-xs cursor-pointer"
              >
                {filteredRegimensList.map(reg => (
                  <option key={reg.id} value={reg.id}>
                    [{reg.cancerCategoryLabel.toUpperCase()}] {reg.acronym} — {reg.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Regimen Info Chipset */}
            <div className="bg-white border border-teal-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                  {selectedRegimen.acronym}
                </span>
                <span className="text-slate-600 font-medium">
                  {selectedRegimen.cancerTypeDetail}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  {selectedRegimen.primaryGoalHighlight.split('(')[0].trim()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {selectedRegimen.cycleProtocol}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Input Parameter Pasien */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-teal-600" />
                Data Antropometri & Parameter Klinis Pasien
              </h4>
              <span className="text-[11px] text-slate-400">Parameter Cockcroft-Gault & Mosteller</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Gender */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChemoGender("female")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chemoGender === "female" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Wanita (0.85)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemoGender("male")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      chemoGender === "male" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pria (1.0)
                  </button>
                </div>
              </div>

              {/* Usia */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Usia (tahun)</label>
                <input
                  type="number"
                  value={chemoAge}
                  onChange={(e) => setChemoAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 45"
                />
              </div>

              {/* Berat Badan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  value={chemoWeight}
                  onChange={(e) => setChemoWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 50"
                />
              </div>

              {/* Tinggi Badan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  value={chemoHeight}
                  onChange={(e) => setChemoHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 150"
                />
              </div>

              {/* Serum Kreatinin */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Serum Kreatinin (mg/dL)</label>
                <input
                  type="number"
                  step="0.05"
                  value={chemoCr}
                  onChange={(e) => setChemoCr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm font-bold text-slate-800 transition-all"
                  placeholder="Mis: 0.9"
                />
              </div>
            </div>

            {/* Parameter Khusus Regimen (Carboplatin AUC / Bevacizumab / Reduksi Dosis) */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
              {hasCarboplatin && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-900">Target AUC Carboplatin</label>
                    <span className="text-[10px] text-amber-700 font-semibold">Rumus Calvert</span>
                  </div>
                  <select
                    value={chemoAUC}
                    onChange={(e) => setChemoAUC(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="4">Target AUC 4 (Lanjut Usia / Mielosupresi)</option>
                    <option value="5">Target AUC 5 (Standar Kombinasi)</option>
                    <option value="6">Target AUC 6 (Monoterapi / Dosis Maksimal)</option>
                    <option value="7">Target AUC 7</option>
                  </select>
                  <p className="text-[10px] text-amber-700 mt-1">
                    *GFR dibatasi (capped) maksimal 125 mL/min per rekomendasi ASCO/FDA.
                  </p>
                </div>
              )}

              {hasBevacizumab && (
                <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-indigo-900">Dosis Bevacizumab</label>
                    <span className="text-[10px] text-indigo-700 font-semibold">Anti-VEGF</span>
                  </div>
                  <select
                    value={chemoBeva}
                    onChange={(e) => setChemoBeva(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="7.5">7,5 mg/kgBB (Siklus 3 Mingguan - ICON7)</option>
                    <option value="15">15 mg/kgBB (Siklus 3 Mingguan - GOG-0218)</option>
                    <option value="0">0 mg/kgBB (Tanpa Bevacizumab / TC Murni)</option>
                  </select>
                  <p className="text-[10px] text-indigo-700 mt-1">
                    *Wajib pelarut NaCl 0.9%; dilarang glukosa/dextrose!
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Modifikasi / Reduksi Dosis</label>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                    chemoDosePercent < 100 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {chemoDosePercent}% Dosis
                  </span>
                </div>
                <select
                  value={chemoDosePercent}
                  onChange={(e) => setChemoDosePercent(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value={100}>100% (Dosis Penuh / Siklus Pertama)</option>
                  <option value={85}>85% (Reduksi Ringan - Toksisitas Grade 2)</option>
                  <option value={80}>80% (Reduksi Standar Toksisitas Hematologi)</option>
                  <option value={75}>75% (Reduksi Sedang - Gangguan Fungsi Organ)</option>
                  <option value={65}>65% (Reduksi Berat - Neuropati / Mielosupresi Lanjut)</option>
                  <option value={50}>50% (Dosis Minimal Toleransi)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  *Untuk penyesuaian pada trombositopenia, neutropenia, atau kelainan organ.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChemoHasCalculated(true)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                Hitung Dosis Regimen ({selectedRegimen.acronym})
              </button>
            </div>
          </div>

          {/* SECTION 3: HASIL PERHITUNGAN */}
          {chemoHasCalculated && bmi > 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Patient Parameter Cards */}
              <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50 border border-teal-200/80 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/60 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      Hasil Parameter Klinis & Antropometri Pasien
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyClinicalSummary}
                      className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-teal-300 text-teal-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-teal-600" />
                          <span>Salin Catatan Klinis / CPPT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* BSA Mosteller */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LPT / BSA (Mosteller)</p>
                    <p className="text-2xl font-black text-teal-800 mt-1">
                      {bsa.toFixed(2)} <span className="text-xs font-bold text-slate-500">m²</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Du Bois: {bsaDuBois.toFixed(2)} m²
                    </p>
                  </div>

                  {/* IMT / BMI */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Indeks Massa Tubuh (IMT)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {bmi.toFixed(2)} <span className="text-xs font-bold text-slate-500">kg/m²</span>
                    </p>
                    <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
                      {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Gizi Normal" : bmi < 30 ? "Overweight" : "Obesitas"} (IBW: {ibw > 0 ? ibw.toFixed(1) : "-"} kg)
                    </p>
                  </div>

                  {/* CrCl Cockcroft-Gault */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CrCl (Cockcroft-Gault)</p>
                    <p className="text-2xl font-black text-teal-700 mt-1">
                      {gfrNormal.toFixed(1)} <span className="text-xs font-bold text-slate-500">mL/min</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Faktor Gender: {chemoGender === "female" ? "0.85 (Wanita)" : "1.0 (Pria)"}
                    </p>
                  </div>

                  {/* CrCl Capped Calvert */}
                  <div className="bg-white/90 p-3.5 rounded-xl border border-teal-100 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CrCl Calvert (Capped 125)</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {effectiveCrCl.toFixed(1)} <span className="text-xs font-bold text-slate-500">mL/min</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {gfrNormal > 125 ? "⚠️ Nilai dibatasi plafon 125" : "Nilai aktual digunakan"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: "drugs", label: "Dosis Obat Terhitung", icon: Pill },
                  { id: "sequence", label: "Urutan Pemberian & Flush", icon: Clock },
                  { id: "premed", label: "Premedikasi & Antiemetik", icon: ShieldCheck },
                  { id: "vital", label: "Hidrasi & Toksisitas Organ", icon: AlertTriangle }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChemoActiveTab(tab.id as any)}
                      className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        chemoActiveTab === tab.id
                          ? "border-teal-600 text-teal-800 bg-teal-50/40 rounded-t-lg"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: DAFTAR DOSIS OBAT TERHITUNG */}
              {chemoActiveTab === "drugs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Komponen Regimen ({calculatedComponents.length} Obat Sitostatika/Biologis):</span>
                    {chemoDosePercent < 100 && (
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        *Dosis telah diturunkan menjadi {chemoDosePercent}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculatedComponents.map((comp) => (
                      <div
                        key={comp.drugId}
                        className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between"
                      >
                        {/* Drug Header & Sequence Badge */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                #{comp.sequenceOrder}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-base leading-tight">
                                  {comp.drugName}
                                </h5>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {comp.role}
                                </p>
                              </div>
                            </div>

                            {/* Extravasation status */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                              comp.vesicantStatus.includes("Vesikan")
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : comp.vesicantStatus.includes("Iritan")
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {comp.vesicantStatus.includes("Vesikan") ? "Vesikant" : comp.vesicantStatus.includes("Iritan") ? "Iritan" : "Non-Vesikant"}
                            </span>
                          </div>

                          {/* Calculated Doses Display */}
                          <div className="bg-teal-50/60 border border-teal-100/80 rounded-xl p-3.5 my-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-semibold text-slate-600">Dosis Terhitung Pasien:</span>
                              <div className="text-right">
                                <span className="text-2xl font-black text-teal-900">
                                  {Math.round(comp.calculatedDose)}
                                </span>
                                <span className="text-sm font-bold text-teal-700 ml-1">
                                  {comp.unit}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>Formula Acuan: {comp.dosageFormula}</span>
                              <span className="font-medium text-teal-800">({comp.calculationFormulaStr})</span>
                            </p>

                            {chemoDosePercent < 100 && (
                              <p className="text-[10px] text-amber-800 mt-1 pt-1 border-t border-teal-200/50">
                                Dosis Standar: {Math.round(comp.standardDose)} {comp.unit} ➔ Reduksi {chemoDosePercent}%: <strong>{Math.round(comp.calculatedDose)} {comp.unit}</strong>
                              </p>
                            )}

                            {comp.ceilingWarning && (
                              <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                                <span>{comp.ceilingWarning}</span>
                              </div>
                            )}
                          </div>

                          {/* Administration & Diluent Specs */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-700 min-w-[70px]">Rute & Laju:</span>
                              <span className="text-slate-600">{comp.adminRoute}</span>
                            </div>

                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-700 min-w-[70px]">Pelarut:</span>
                              <span className="text-teal-800 font-medium">{comp.diluentStandard}</span>
                            </div>

                            {comp.diluentForbidden && (
                              <div className="flex items-start gap-1.5 text-rose-700 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200/60">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                                <span>{comp.diluentForbidden}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Special Precaution Note */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                          <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title={comp.specialPrecautions}>
                            <strong className="text-slate-700">Perhatian:</strong> {comp.specialPrecautions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: URUTAN PEMBERIAN & FLUSH */}
              {chemoActiveTab === "sequence" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-teal-800">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-base">Panduan Sekuens Infus & Pembilasan Vena (Flush Protocol)</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pemberian sitostatika wajib mengikuti urutan farmakokinetik dan stabilitas pelarut. Pembilasan (flushing) dengan cairan yang kompatibel wajib dilakukan sebelum beralih ke botol obat berikutnya.
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* Step 0: Pre-Hydration & Premed */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        0
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-800">Pre-Hidrasi & Pemberian Premedikasi</p>
                        <p className="text-slate-600">
                          Pasang akses intravena yang paten (verifikasi blood return bebas hambatan). Berikan hidrasi awal dan obat premedikasi (antiemetik, steroid, antihistamin) minimal 30 - 60 menit sebelum sitostatika pertama.
                        </p>
                      </div>
                    </div>

                    {/* Sequential drugs */}
                    {calculatedComponents.map((comp, idx) => (
                      <React.Fragment key={comp.drugId}>
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50/40 border border-teal-200/80">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {comp.sequenceOrder}
                          </div>
                          <div className="text-xs space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-extrabold text-slate-900 text-sm">
                                {comp.drugName} (Dosis Pasien: {Math.round(comp.calculatedDose)} {comp.unit})
                              </p>
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                {comp.adminRoute.split('(')[0]}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium">
                              <strong>Instruksi:</strong> {comp.sequenceNote}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Pelarut: {comp.diluentStandard} | Ekstravasasi: {comp.vesicantStatus}
                            </p>
                          </div>
                        </div>

                        {/* Flush between drugs */}
                        {idx < calculatedComponents.length - 1 && (
                          <div className="flex items-center gap-2 pl-3.5 py-1 text-[11px] font-bold text-teal-700">
                            <Droplets className="w-4 h-4 text-teal-500" />
                            <span>Bilas Jalur Infus (Flush) dengan minimal 20 - 50 mL NaCl 0.9% sebelum obat berikutnya</span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Final Step */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-emerald-900">Post-Hidrasi & Bilas Akhir Saline</p>
                        <p className="text-emerald-800">
                          Bilas tuntas seluruh selang infus dengan minimal 50 - 100 mL NaCl 0.9% untuk memastikan tidak ada sisa sitostatika tertinggal di lumen kateter vena. Observasi tanda vital dan respon ekstravasasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PREMEDIKASI & ANTIEMETIK */}
              {chemoActiveTab === "premed" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-base">Protokol Premedikasi & Profilaksis Emetik</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Protokol baku untuk mencegah mual-muntah akibat kemoterapi (CINV) serta reaksi hipersensitivitas/anafilaksis.
                  </p>

                  <div className="space-y-3 pt-1">
                    {selectedRegimen.premedicationProtocol.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 text-xs space-y-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="text-indigo-950 font-medium leading-relaxed">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRegimen.clinicalPearls && selectedRegimen.clinicalPearls.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Clinical Pearls & Kiat Praktis Onkologi:
                      </h5>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {selectedRegimen.clinicalPearls.map((pearl, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{pearl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HIDRASI & TOKSISITAS ORGAN */}
              {chemoActiveTab === "vital" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-rose-900 mb-1">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <h4 className="font-bold text-base">Toksisitas Organ Kritis & Strategi Pencegahan</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Monitoring organ vital sebelum dan selama pemberian regimen kemoterapi ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRegimen.organToxicities.map((tox, idx) => (
                      <div key={idx} className="bg-rose-50/40 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900">{tox.organ}</span>
                          <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                            {tox.responsibleDrug}
                          </span>
                        </div>
                        <p className="text-slate-700">
                          <strong>Manifestasi:</strong> {tox.manifestation}
                        </p>
                        <p className="text-teal-900 font-medium bg-white/80 p-2 rounded-lg border border-rose-100">
                          <strong>Pencegahan:</strong> {tox.preventionStrategy}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-teal-600" />
                      Protokol Hidrasi & Proteksi Organ:
                    </h5>
                    <div className="space-y-2">
                      {selectedRegimen.hydrationAndProtection.map((hyd, hIdx) => (
                        <div key={hIdx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                          <span className="text-teal-600 font-bold">✓</span>
                          <span>{hyd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
        <ReferenceFooter references={[
          `NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®) - Regimen: ${selectedRegimen.fullName}.`,
          "Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal clearance. J Clin Oncol. 1989;7(11):1748-1756.",
          "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.",
          "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.",
          "Du Bois D, Du Bois EF. A formula to estimate the approximate surface area if height and weight be known. Arch Intern Med. 1916;17(6):863-871.",
          "ASCO / ONS Chemotherapy Administration Safety Standards."
        ]} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <Calculator className="w-6 h-6 text-emerald-600" />
              Kalkulator Medis
            </h2>
            <p className="text-slate-500 text-sm">
              Kumpulan alat ukur klinis, skor, dan persamaan medis berbasis bukti seperti pada panduan klinis global.
            </p>
          </div>
          {activeCalc && (
            <button 
              onClick={() => setActiveCalc(null)}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg"
            >
              Kembali ke Daftar
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {!activeCalc ? (
            renderCalculatorList()
          ) : (
            <div>
              {activeCalc === "bmi" && renderBMICalculator()}
              {activeCalc === "crcl" && renderCrClCalculator()}
              {activeCalc === "bsa" && renderBSACalculator()}
              {activeCalc === "gcs" && renderGCSCalculator()}
              {activeCalc === "apgar" && renderApgarCalculator()}
              {activeCalc === "cha2ds2vasc" && renderCha2ds2vasc()}
              {activeCalc === "pediatric" && renderPediatricDoseCalculator()}
              {activeCalc === "chemo" && renderChemoCalculator()}
              {activeCalc === "egfr" && renderEgfrCalculator()}
              {activeCalc === "lab" && renderLabCalculator()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
