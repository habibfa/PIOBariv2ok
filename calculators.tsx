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
      </div>
    );
  };

  const renderLabCalculator = () => {
    let interpretations: { label: string; value: number; unit: string; min: number; max: number; status: "Low" | "Normal" | "High"; message: string }[] = [];
    
    const checkVal = (valStr: string, name: string, unit: string, min: number, max: number, lowMsg: string, highMsg: string) => {
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        let status: "Low" | "Normal" | "High" = "Normal";
        let message = "Normal";
        if (val < min) { status = "Low"; message = lowMsg; }
        else if (val > max) { status = "High"; message = highMsg; }
        interpretations.push({ label: name, value: val, unit, min, max, status, message });
      }
    };

    checkVal(labNa, "Natrium (Na)", "mEq/L", 135, 145, "Hiponatremia", "Hipernatremia");
    checkVal(labK, "Kalium (K)", "mEq/L", 3.5, 5.0, "Hipokalemia", "Hiperkalemia");
    checkVal(labCl, "Klorida (Cl)", "mEq/L", 98, 106, "Hipokloremia", "Hiperkloremia");
    checkVal(labCa, "Kalsium (Ca)", "mg/dL", 8.5, 10.5, "Hipokalsemia", "Hiperkalsemia");
    checkVal(labBUN, "BUN", "mg/dL", 7, 20, "Rendah", "Tinggi (Uremia/Dehidrasi)");
    checkVal(labCr, "Kreatinin", "mg/dL", 0.6, 1.2, "Rendah", "Tinggi (Gangguan Ginjal)");

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Interpretasi Lab Dasar</h2>
          <p className="text-slate-500 text-sm mt-1">Evaluasi cepat nilai elektrolit dan fungsi ginjal.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Na (135-145)</label>
            <input type="number" step="0.1" value={labNa} onChange={e => setLabNa(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mEq/L" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">K (3.5-5.0)</label>
            <input type="number" step="0.1" value={labK} onChange={e => setLabK(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mEq/L" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Cl (98-106)</label>
            <input type="number" step="0.1" value={labCl} onChange={e => setLabCl(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mEq/L" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Ca (8.5-10.5)</label>
            <input type="number" step="0.1" value={labCa} onChange={e => setLabCa(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mg/dL" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">BUN (7-20)</label>
            <input type="number" step="0.1" value={labBUN} onChange={e => setLabBUN(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mg/dL" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Kreatinin (0.6-1.2)</label>
            <input type="number" step="0.1" value={labCr} onChange={e => setLabCr(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="mg/dL" />
          </div>
        </div>

        {interpretations.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Hasil Interpretasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interpretations.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
                  item.status === 'Normal' ? 'bg-emerald-50 border-emerald-200' :
                  item.status === 'Low' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 mb-0.5">{item.label}</span>
                    <span className={`text-lg font-black ${
                      item.status === 'Normal' ? 'text-emerald-700' :
                      item.status === 'Low' ? 'text-amber-700' : 'text-rose-700'
                    }`}>{item.value} <span className="text-xs font-semibold">{item.unit}</span></span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    item.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
