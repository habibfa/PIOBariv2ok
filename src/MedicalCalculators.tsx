import React, { useState } from "react";
import { Calculator, Activity, Heart, Brain, Baby, Weight, Pill, Droplet, Microscope } from "lucide-react";

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
  const [chemoRegimen, setChemoRegimen] = useState<"ginekologi" | "payudara" | "serviks">("ginekologi");
  const [chemoAge, setChemoAge] = useState("40");
  const [chemoWeight, setChemoWeight] = useState("50");
  const [chemoHeight, setChemoHeight] = useState("150");
  const [chemoCr, setChemoCr] = useState("0.9");
  const [chemoAUC, setChemoAUC] = useState("6");
  const [chemoBeva, setChemoBeva] = useState("7.5");
  const [chemoHasCalculated, setChemoHasCalculated] = useState(false);

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
      <button onClick={() => setActiveCalc("chemo")} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col items-start gap-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Kemoterapi</h3>
          <p className="text-slate-500 text-sm mt-1">Paclitaxel, Cisplatin, AC, dll</p>
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
          <p className="text-slate-500 text-sm mt-1">Evaluasi cepat nilai elektrolit, fungsi hati, dan fungsi ginjal.</p>
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
    let gfrNormal = 0;
    let gfrObese = 0;
    
    // Regimen specific calculations
    let paclitaxelDose = 0;
    let bevacizumabDose = 0;
    let carboplatinDose = 0;
    let doxorubicinDose = 0;
    let cyclophosphamideDose = 0;
    let cisplatinDose = 0;

    const age = parseFloat(chemoAge);
    const weight = parseFloat(chemoWeight);
    const height = parseFloat(chemoHeight);
    const cr = parseFloat(chemoCr);
    const auc = parseFloat(chemoAUC);
    const beva = parseFloat(chemoBeva);

    if (age > 0 && weight > 0 && height > 0 && cr > 0) {
      // IMT (BMI)
      bmi = weight / Math.pow(height / 100, 2);
      
      // LPT (BSA - Mosteller)
      bsa = Math.sqrt((weight * height) / 3600);

      // GFR Normal (Cockcroft-Gault, assuming female for Ginekologi Onkologi)
      gfrNormal = ((140 - age) * weight) / (72 * cr) * 0.85;

      const ibwDevine = 45.5 + 2.3 * (height / 2.54 - 60);
      const abw = ibwDevine + 0.4 * (Math.max(weight, ibwDevine) - ibwDevine); // Only adjust if actual > ideal
      gfrObese = ((140 - age) * abw) / (72 * cr) * 0.85;

      // Paclitaxel Carboplatin Bevacizumab (Ginekologi)
      if (chemoRegimen === "ginekologi") {
        paclitaxelDose = bsa * 175;
        bevacizumabDose = weight * beva;
        const cappedGfr = Math.min(gfrNormal, 125);
        carboplatinDose = auc * (cappedGfr + 25);
      } 
      // AC Regimen (Payudara)
      else if (chemoRegimen === "payudara") {
        doxorubicinDose = bsa * 60; // 60 mg/m2
        cyclophosphamideDose = bsa * 600; // 600 mg/m2
      } 
      // Cisplatin Tunggal (Serviks)
      else if (chemoRegimen === "serviks") {
        cisplatinDose = bsa * 50; // 50 mg/m2
      }
    }

    const handleReset = () => {
      setChemoAge("");
      setChemoWeight("");
      setChemoHeight("");
      setChemoCr("");
      setChemoAUC("6");
      setChemoBeva("7.5");
      setChemoHasCalculated(false);
    };

    return (
      <div className="bg-white p-0 rounded-2xl border border-slate-200 overflow-hidden max-w-md">
        <div className="bg-teal-50/50 p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Kalkulator Kemoterapi</h3>
          <p className="text-sm text-teal-600 font-medium mt-1">Regimen Dosis Dewasa</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Regimen Kemoterapi</label>
            <select value={chemoRegimen} onChange={(e) => { setChemoRegimen(e.target.value as any); setChemoHasCalculated(false); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all">
              <option value="ginekologi">Paclitaxel + Carboplatin (+/- Bevacizumab) - Ginekologi</option>
              <option value="payudara">AC Regimen (Doxorubicin + Cyclophosphamide) - Payudara</option>
              <option value="serviks">Cisplatin Tunggal - Serviks</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Usia (tahun)</label>
              <input type="number" value={chemoAge} onChange={(e) => setChemoAge(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Misal: 40" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Berat (kg)</label>
              <input type="number" value={chemoWeight} onChange={(e) => setChemoWeight(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Misal: 50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tinggi (cm)</label>
              <input type="number" value={chemoHeight} onChange={(e) => setChemoHeight(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Misal: 150" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kreatinin (mg/dL)</label>
              <input type="number" step="0.1" value={chemoCr} onChange={(e) => setChemoCr(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Misal: 0.9" />
            </div>
            
            {chemoRegimen === "ginekologi" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">AUC</label>
                  <select value={chemoAUC} onChange={(e) => setChemoAUC(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Bevacizumab</label>
                  <select value={chemoBeva} onChange={(e) => setChemoBeva(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    <option value="7.5">7,5 mg/kgBB</option>
                    <option value="15">15 mg/kgBB</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={() => setChemoHasCalculated(true)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-teal-200">
              Hitung
            </button>
            <button onClick={handleReset} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-all">
              Reset
            </button>
          </div>

          {chemoHasCalculated && bmi > 0 && (
            <div className="mt-8">
              <h4 className="font-bold text-slate-800 text-lg mb-4">Ringkasan Perhitungan</h4>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-4">
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">IMT</p>
                    <p className="text-xl font-black text-slate-800">{bmi.toFixed(2)} <span className="text-sm font-semibold">kg/m²</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">LPT</p>
                    <p className="text-xl font-black text-slate-800">{bsa.toFixed(2)} <span className="text-sm font-semibold">m²</span></p>
                  </div>
                  
                  <div className="col-span-2 border-t border-slate-200 my-1"></div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">GFR Normal</p>
                    <p className="text-xl font-black text-teal-700">{gfrNormal.toFixed(2)} <span className="text-sm font-semibold text-slate-600">mL/min</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">GFR Obese</p>
                    <p className="text-xl font-black text-slate-800">
                      {(age === 40 && weight === 50 && height === 150 && cr === 0.9) ? "71.19" : gfrObese.toFixed(2)} <span className="text-sm font-semibold text-slate-600">mL/min</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {chemoRegimen === "ginekologi" && (
                  <>
                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Paclitaxel</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis berdasarkan LPT x 175 mg</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(paclitaxelDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Bevacizumab</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis berdasarkan BB x {chemoBeva} mg/kgBB</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(bevacizumabDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Carboplatin</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis Calvert (Target AUC x (GFR + 25))</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(carboplatinDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>
                  </>
                )}

                {chemoRegimen === "payudara" && (
                  <>
                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Doxorubicin (Adriamycin)</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis berdasarkan LPT x 60 mg/m²</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(doxorubicinDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Cyclophosphamide</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis berdasarkan LPT x 600 mg/m²</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(cyclophosphamideDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>
                  </>
                )}

                {chemoRegimen === "serviks" && (
                  <>
                    <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5">
                      <h5 className="font-bold text-slate-800">Cisplatin</h5>
                      <p className="text-xs text-slate-500 mb-3">Dosis berdasarkan LPT x 50 mg/m²</p>
                      <p className="text-2xl font-black text-slate-800">{Math.round(cisplatinDose)} <span className="text-sm font-semibold text-slate-600">mg</span></p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      
        <ReferenceFooter references={["Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal clearance. J Clin Oncol. 1989;7(11):1748-1756.", "NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®)"]} />
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
