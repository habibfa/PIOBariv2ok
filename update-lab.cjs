const fs = require('fs');
let code = fs.readFileSync('src/MedicalCalculators.tsx', 'utf8');

// Replace lab states
code = code.replace(
  /const \[labNa, setLabNa\] = useState\(""\);\s*const \[labK, setLabK\] = useState\(""\);\s*const \[labCl, setLabCl\] = useState\(""\);\s*const \[labCa, setLabCa\] = useState\(""\);\s*const \[labBUN, setLabBUN\] = useState\(""\);\s*const \[labCr, setLabCr\] = useState\(""\);/,
  `const [labParam, setLabParam] = useState("Na");\n  const [labValue, setLabValue] = useState("");`
);

// Replace renderLabCalculator
const newLabCalculator = `  const renderLabCalculator = () => {
    const labParams = [
      { id: "Na", label: "Natrium (Na)", unit: "mEq/L", min: 135, max: 145, lowMsg: "Hiponatremia", highMsg: "Hipernatremia", example: "140" },
      { id: "K", label: "Kalium (K)", unit: "mEq/L", min: 3.5, max: 5.0, lowMsg: "Hipokalemia", highMsg: "Hiperkalemia", example: "4.2" },
      { id: "Cl", label: "Klorida (Cl)", unit: "mEq/L", min: 98, max: 106, lowMsg: "Hipokloremia", highMsg: "Hiperkloremia", example: "102" },
      { id: "Ca", label: "Kalsium (Ca)", unit: "mg/dL", min: 8.5, max: 10.5, lowMsg: "Hipokalsemia", highMsg: "Hiperkalsemia", example: "9.5" },
      { id: "BUN", label: "BUN", unit: "mg/dL", min: 7, max: 20, lowMsg: "Rendah", highMsg: "Tinggi (Uremia/Dehidrasi)", example: "15" },
      { id: "Cr", label: "Kreatinin", unit: "mg/dL", min: 0.6, max: 1.2, lowMsg: "Rendah", highMsg: "Tinggi (Gangguan Ginjal)", example: "0.9" }
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

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-indigo-600" />
            Interpretasi Laboratorium
          </h2>
          <p className="text-slate-500 text-sm mt-1">Evaluasi cepat nilai elektrolit dan fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Parameter Lab</label>
              <select 
                value={labParam} 
                onChange={e => { setLabParam(e.target.value); setLabValue(""); }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
              >
                {labParams.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                placeholder={\`Contoh: \${currentParam.example}\`} 
              />
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col justify-center min-h-[160px]">
            <h3 className="text-sm font-bold text-indigo-800 text-center mb-4">Hasil Interpretasi</h3>
            
            {interpretation ? (
              <div className={\`p-4 rounded-xl border flex flex-col items-center justify-center text-center \${
                interpretation.status === 'Normal' ? 'bg-emerald-50 border-emerald-200' :
                interpretation.status === 'Low' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
              }\`}>
                <div className="mb-2">
                  <span className={\`text-3xl font-black \${
                    interpretation.status === 'Normal' ? 'text-emerald-700' :
                    interpretation.status === 'Low' ? 'text-amber-700' : 'text-rose-700'
                  }\`}>{interpretation.value}</span>
                  <span className="text-sm font-semibold ml-1 text-slate-600">{currentParam.unit}</span>
                </div>
                <div className={\`px-3 py-1.5 rounded-md text-sm font-bold inline-block \${
                  interpretation.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                  interpretation.status === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }\`}>
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
  };`;

const startIdx = code.indexOf("  const renderLabCalculator = () => {");
const endIdx = code.indexOf("  const renderBMICalculator = () => {");

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newLabCalculator + "\n\n" + code.substring(endIdx);
  fs.writeFileSync('src/MedicalCalculators.tsx', code);
  console.log("Successfully updated lab calculator.");
} else {
  console.error("Could not find boundaries for renderLabCalculator.");
}
