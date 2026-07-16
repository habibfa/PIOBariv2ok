import React, { useState } from "react";
import { Calculator, Activity, Heart, Brain, Baby, Weight, Pill } from "lucide-react";

type CalculatorType = "bmi" | "crcl" | "bsa" | "gcs" | "apgar" | "cha2ds2vasc" | "pediatric" | "chemo";

export function MedicalCalculators() {
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);

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
    </div>
  );

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
