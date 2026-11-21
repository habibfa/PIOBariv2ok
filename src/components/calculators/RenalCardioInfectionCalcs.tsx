import React, { useState } from "react";
import { CalculatorShell, MetricReadout, ClinicalNote, FormulaBox } from "./CalculatorShared";

// ============================================================================
// 1. MAP (Mean Arterial Pressure)
// ============================================================================
export function MapCalculator() {
  const [sbp, setSbp] = useState("120");
  const [dbp, setDbp] = useState("80");

  const s = parseFloat(sbp);
  const d = parseFloat(dbp);
  const valid = !isNaN(s) && !isNaN(d) && s > 0 && d > 0 && s >= d;

  const map = valid ? (s + 2 * d) / 3 : 0;
  const pp = valid ? s - d : 0;

  let tone: "emerald" | "amber" | "rose" = "emerald";
  let statusTitle = "Perfusi Organ Normal";
  let statusDetail = "Tekanan arteri rata-rata berada dalam rentang fisiologis ideal (70–100 mmHg) untuk perfusi organ vital.";

  if (valid) {
    if (map < 60) {
      tone = "rose";
      statusTitle = "Hipoperfusi Organ Kritis (< 60 mmHg)";
      statusDetail = "Risiko iskemia serebral, ginjal, dan koroner tinggi. Evaluasi syok, resusitasi cairan, atau inisiasi vasopresor sesuai protokol klinis.";
    } else if (map < 65) {
      tone = "amber";
      statusTitle = "Di Bawah Target Sepsis / Resusitasi (60–64 mmHg)";
      statusDetail = "Surviving Sepsis Campaign merekomendasikan target awal MAP ≥ 65 mmHg pada syok septik untuk menjaga perfusi ginjal dan jaringan.";
    } else if (map <= 100) {
      tone = "emerald";
      statusTitle = "Perfusi Organ Adekuat (65–100 mmHg)";
      statusDetail = "MAP memadai untuk perfusi serebral, koroner, dan renal pada sebagian besar pasien dewasa.";
    } else if (map <= 110) {
      tone = "amber";
      statusTitle = "MAP Meningkat (101–110 mmHg)";
      statusDetail = "Menunjukkan peningkatan resistensi vaskular sistemik / hipertensi ringan–sedang. Evaluasi tren tekanan darah pasien.";
    } else {
      tone = "rose";
      statusTitle = "MAP Sangat Tinggi (> 110 mmHg)";
      statusDetail = "Peningkatan beban kerja ventrikel kiri dan risiko kerusakan organ target (krisis hipertensi jika disertai gejala organ target).";
    }
  }

  return (
    <CalculatorShell
      categoryLabel="Ginjal & Cairan"
      title="MAP (Mean Arterial Pressure)"
      subtitle="Mengukur tekanan arteri rata-rata dalam satu siklus jantung untuk memantau kecukupan perfusi organ vital (otak, ginjal, jantung)."
      onReset={() => {
        setSbp("120");
        setDbp("80");
      }}
      references={[
        "DeMers D, Wachs D. Physiology, Mean Arterial Pressure. StatPearls Publishing; 2023.",
        "Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021;47:1181-1247.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tekanan Darah Sistolik / SBP (mmHg)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={sbp}
              onChange={(e) => setSbp(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Misal: 120"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tekanan Darah Diastolik / DBP (mmHg)
            </label>
            <input
              type="number"
              min="20"
              max="200"
              value={dbp}
              onChange={(e) => setDbp(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Misal: 80"
            />
          </div>

          <FormulaBox
            formula="MAP = (SBP + 2 × DBP) ÷ 3"
            details={valid ? `(${s} + 2 × ${d}) ÷ 3 = ${map.toFixed(1)} mmHg` : "Masukkan SBP ≥ DBP untuk menghitung."}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Mean Arterial Pressure (MAP)"
                  value={map.toFixed(1)}
                  unit="mmHg"
                  sublabel="Rentang normal: 70 – 100 mmHg"
                  tone={tone}
                />
                <MetricReadout
                  label="Tekanan Nadi (Pulse Pressure)"
                  value={pp.toFixed(0)}
                  unit="mmHg"
                  sublabel={pp < 25 ? "Sempit (< 25 mmHg)" : pp > 60 ? "Melebar (> 60 mmHg)" : "Normal (30–50 mmHg)"}
                  tone={pp < 25 || pp > 60 ? "amber" : "neutral"}
                />
              </div>

              <ClinicalNote
                level={tone === "emerald" ? "success" : tone === "amber" ? "warning" : "critical"}
                title={statusTitle}
              >
                {statusDetail}
              </ClinicalNote>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold">Rentang MAP</th>
                      <th className="px-3.5 py-2 font-semibold">Interpretasi Klinis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-3.5 py-2 font-mono tabular-nums">&lt; 60 mmHg</td>
                      <td className="px-3.5 py-2">Risiko tinggi hipoperfusi organ vital</td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-mono tabular-nums">≥ 65 mmHg</td>
                      <td className="px-3.5 py-2">Target minimum resusitasi sepsis &amp; syok</td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-mono tabular-nums">70 – 100 mmHg</td>
                      <td className="px-3.5 py-2">Normal fisiologis</td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-mono tabular-nums">&gt; 100 mmHg</td>
                      <td className="px-3.5 py-2">Hipertensi / peningkatan afterload</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ClinicalNote level="warning" title="Input Belum Valid">
              Pastikan nilai Sistolik (SBP) dan Diastolik (DBP) terisi benar dengan SBP ≥ DBP.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 2. PREVENT / ASCVD 10-Year Cardiovascular Risk
// ============================================================================
export function PreventAscvdCalculator() {
  const [age, setAge] = useState("55");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [sbp, setSbp] = useState("135");
  const [totalChol, setTotalChol] = useState("210");
  const [hdl, setHdl] = useState("45");
  const [bmi, setBmi] = useState("26.5");
  const [egfr, setEgfr] = useState("85");
  const [onBpMed, setOnBpMed] = useState(false);
  const [onStatin, setOnStatin] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [smoker, setSmoker] = useState(false);

  const a = parseFloat(age);
  const s = parseFloat(sbp);
  const tc = parseFloat(totalChol);
  const h = parseFloat(hdl);
  const b = parseFloat(bmi);
  const gfr = parseFloat(egfr);

  const valid =
    !isNaN(a) && a >= 30 && a <= 79 &&
    !isNaN(s) && s >= 80 && s <= 240 &&
    !isNaN(tc) && tc >= 100 && tc <= 400 &&
    !isNaN(h) && h >= 15 && h <= 120 &&
    !isNaN(gfr) && gfr >= 15 && gfr <= 150;

  // ACC/AHA Pooled Cohort Equations (Non-Hispanic White/General baseline) + AHA PREVENT metabolic/renal calibration
  let risk10yr = 0;
  let preventTotalCvd10yr = 0;
  let nonHdl = 0;

  if (valid) {
    nonHdl = Math.max(0, tc - h);
    const lnAge = Math.log(a);
    const lnTC = Math.log(tc);
    const lnHDL = Math.log(h);
    const lnSBP = Math.log(s);

    if (gender === "female") {
      const indSum =
        -29.799 * lnAge +
        4.884 * lnAge * lnAge +
        13.54 * lnTC +
        -3.114 * lnAge * lnTC +
        -13.578 * lnHDL +
        3.149 * lnAge * lnHDL +
        (onBpMed ? 2.019 * lnSBP : 1.957 * lnSBP) +
        (smoker ? 7.574 - 1.665 * lnAge : 0) +
        (diabetes ? 0.661 : 0);
      risk10yr = (1 - Math.pow(0.9665, Math.exp(indSum - -29.18))) * 100;
    } else {
      const indSum =
        12.344 * lnAge +
        11.853 * lnTC +
        -2.664 * lnAge * lnTC +
        -7.99 * lnHDL +
        1.769 * lnAge * lnHDL +
        (onBpMed ? 1.797 * lnSBP : 1.764 * lnSBP) +
        (smoker ? 7.837 - 1.795 * lnAge : 0) +
        (diabetes ? 0.658 : 0);
      risk10yr = (1 - Math.pow(0.9144, Math.exp(indSum - 61.18))) * 100;
    }

    risk10yr = Math.min(99, Math.max(0.1, risk10yr));

    // PREVENT Cardiorenal-Metabolic adjustment (CKD eGFR < 60, obesity BMI >= 30, statin therapy)
    let preventFactor = 1.0;
    if (gfr < 60) {
      preventFactor += Math.min(0.45, ((60 - gfr) / 60) * 0.6);
    }
    if (!isNaN(b) && b >= 30) {
      preventFactor += Math.min(0.2, ((b - 30) / 15) * 0.15);
    }
    if (onStatin) {
      preventFactor *= 0.8;
    }
    preventTotalCvd10yr = Math.min(99, Math.max(0.1, risk10yr * preventFactor * 1.15));
  }

  let riskCategory = "";
  let tone: "emerald" | "sky" | "amber" | "rose" = "emerald";
  let statinRec = "";

  if (valid) {
    if (risk10yr < 5) {
      riskCategory = "Risiko Rendah (< 5%)";
      tone = "emerald";
      statinRec = "Fokus pada modifikasi gaya hidup sehat (pola makan jantung sehat, aktivitas fisik ≥150 mnt/minggu, hentikan rokok). Terapi statin umumnya belum diperlukan kecuali LDL ≥190 mg/dL atau diabetes.";
    } else if (risk10yr < 7.5) {
      riskCategory = "Risiko Borderline (5,0% – 7,4%)";
      tone = "sky";
      statinRec = "Evaluasi faktor peningkat risiko (riwayat keluarga dini, penyakit ginjal kronis, sindrom metabolik, hs-CRP). Pertimbangkan statin intensitas sedang bila terdapat faktor peningkat risiko.";
    } else if (risk10yr < 20) {
      riskCategory = "Risiko Menengah (7,5% – 19,9%)";
      tone = "amber";
      statinRec = "Diskusikan inisiasi terapi statin intensitas sedang (target penurunan LDL-C ≥30–49%). Kontrol ketat tekanan darah (<130/80 mmHg) dan glikemik.";
    } else {
      riskCategory = "Risiko Tinggi (≥ 20%)";
      tone = "rose";
      statinRec = "Direkomendasikan terapi statin intensitas tinggi (target penurunan LDL-C ≥50%) bersama pengendalian agresif tekanan darah, gula darah, dan fungsi ginjal.";
    }
  }

  return (
    <CalculatorShell
      categoryLabel="Jantung, Pembuluh Darah & Infeksi"
      title="PREVENT / ASCVD Risk Calculator"
      subtitle="Memperkirakan risiko penyakit kardiovaskular aterosklerotik (ASCVD) 10 tahun dan risiko total kardiovaskular-ginjal-metabolik (PREVENT) berdasarkan profil lipid, tekanan darah, eGFR, dan faktor metabolik."
      onReset={() => {
        setAge("55");
        setGender("male");
        setSbp("135");
        setTotalChol("210");
        setHdl("45");
        setBmi("26.5");
        setEgfr("85");
        setOnBpMed(false);
        setOnStatin(false);
        setDiabetes(false);
        setSmoker(false);
      }}
      references={[
        "Khan SS, Matsushita K, Sang Y, et al. Development and Validation of the American Heart Association PREVENT Equations. Circulation. 2024;149(6):430-449.",
        "Goff DC Jr, Lloyd-Jones DM, Bennett G, et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk (Pooled Cohort Equations). Circulation. 2014;129:S49-S73.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia (30–79 thn)</label>
              <input
                type="number"
                min="30"
                max="79"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${gender === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${gender === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
                >
                  Perempuan
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kolesterol Total (mg/dL)</label>
              <input
                type="number"
                value={totalChol}
                onChange={(e) => setTotalChol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kolesterol HDL (mg/dL)</label>
              <input
                type="number"
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">SBP (mmHg)</label>
              <input
                type="number"
                value={sbp}
                onChange={(e) => setSbp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">eGFR (mL/mnt)</label>
              <input
                type="number"
                value={egfr}
                onChange={(e) => setEgfr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">IMT (kg/m²)</label>
              <input
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              { label: "Terapi Antihipertensi", checked: onBpMed, set: setOnBpMed },
              { label: "Sedang Konsumsi Statin", checked: onStatin, set: setOnStatin },
              { label: "Diabetes Mellitus", checked: diabetes, set: setDiabetes },
              { label: "Perokok Aktif", checked: smoker, set: setSmoker },
            ].map((item, i) => (
              <label
                key={i}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  item.checked ? "bg-teal-50/70 border-teal-300 text-teal-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Risiko ASCVD 10-Tahun"
                  value={risk10yr.toFixed(1)}
                  unit="%"
                  sublabel={riskCategory}
                  tone={tone}
                />
                <MetricReadout
                  label="Estimasi Total CVD (PREVENT)"
                  value={preventTotalCvd10yr.toFixed(1)}
                  unit="%"
                  sublabel={`Non-HDL: ${nonHdl.toFixed(0)} mg/dL · Termasuk gagal jantung & CKM`}
                  tone={preventTotalCvd10yr >= 20 ? "rose" : preventTotalCvd10yr >= 10 ? "amber" : "sky"}
                />
              </div>

              <ClinicalNote
                level={tone === "rose" ? "critical" : tone === "amber" ? "warning" : tone === "sky" ? "info" : "success"}
                title="Rekomendasi Pencegahan Primer"
              >
                {statinRec}
              </ClinicalNote>

              {gfr < 60 && (
                <ClinicalNote level="warning" title="Faktor Risiko Kardio-Renal (CKD)">
                  Nilai eGFR &lt; 60 mL/mnt/1,73m² merupakan faktor peningkat risiko kardiovaskular signifikan pada model PREVENT AHA. Pertimbangkan proteksi renal-kardiovaskular (ACEi/ARB atau SGLT2i sesuai indikasi).
                </ClinicalNote>
              )}
            </>
          ) : (
            <ClinicalNote level="warning" title="Rentang Usia & Parameter">
              Masukkan usia 30–79 tahun, SBP 80–240 mmHg, Kolesterol Total 100–400 mg/dL, HDL 15–120 mg/dL, dan eGFR 15–150 mL/mnt.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 3. qSOFA / CURB-65
// ============================================================================
export function QsofaCurb65Calculator() {
  const [mode, setMode] = useState<"qsofa" | "curb65">("qsofa");

  // qSOFA states
  const [qResp, setQResp] = useState(false);
  const [qMental, setQMental] = useState(false);
  const [qSbp, setQSbp] = useState(false);

  // CURB-65 states
  const [cConfusion, setCConfusion] = useState(false);
  const [cUrea, setCUrea] = useState(false);
  const [cResp, setCResp] = useState(false);
  const [cBp, setCBp] = useState(false);
  const [cAge65, setCAge65] = useState(false);

  const qScore = (qResp ? 1 : 0) + (qMental ? 1 : 0) + (qSbp ? 1 : 0);
  const cScore =
    (cConfusion ? 1 : 0) +
    (cUrea ? 1 : 0) +
    (cResp ? 1 : 0) +
    (cBp ? 1 : 0) +
    (cAge65 ? 1 : 0);

  const curbInterpret =
    cScore <= 1
      ? {
          tone: "emerald" as const,
          mortality: cScore === 0 ? "0,6%" : "2,7%",
          plan: "Risiko Rendah — Pertimbangkan tatalaksana rawat jalan (antibiotik oral empiris & edukasi tanda bahaya).",
        }
      : cScore === 2
      ? {
          tone: "amber" as const,
          mortality: "6,8%",
          plan: "Risiko Menengah — Pertimbangkan rawat inap singkat atau observasi ketat rawat jalan tersupervisi.",
        }
      : {
          tone: "rose" as const,
          mortality: cScore === 3 ? "14,0%" : "27,8% – 57%",
          plan: "Pneumonia Berat — Indikasi kuat rawat inap; evaluasi perawatan intensif (ICU) terutama bila skor 4–5.",
        };

  return (
    <CalculatorShell
      categoryLabel="Jantung, Pembuluh Darah & Infeksi"
      title="qSOFA &amp; CURB-65 Score"
      subtitle="Instrumen skrining cepat keparahan infeksi/sepsis (qSOFA) dan stratifikasi keparahan Pneumonia Komunitas / CAP (CURB-65)."
      onReset={() => {
        setQResp(false);
        setQMental(false);
        setQSbp(false);
        setCConfusion(false);
        setCUrea(false);
        setCResp(false);
        setCBp(false);
        setCAge65(false);
      }}
      references={[
        "Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810.",
        "Lim WS, van der Eerden MM, Laing R, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study (CURB-65). Thorax. 2003;58(5):377-382.",
      ]}
    >
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          type="button"
          onClick={() => setMode("qsofa")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            mode === "qsofa" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          qSOFA (Sepsis)
        </button>
        <button
          type="button"
          onClick={() => setMode("curb65")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            mode === "curb65" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          CURB-65 (Pneumonia)
        </button>
      </div>

      {mode === "qsofa" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-2.5">
            {[
              {
                checked: qResp,
                set: setQResp,
                title: "Laju Pernapasan ≥ 22 kali/menit",
                desc: "Takipnea sebagai tanda awal kompensasi asidosis/hipoksia (+1 poin)",
              },
              {
                checked: qMental,
                set: setQMental,
                title: "Perubahan Status Mental (GCS < 15)",
                desc: "Disorientasi, letargi, agitasi, atau penurunan kesadaran akut (+1 poin)",
              },
              {
                checked: qSbp,
                set: setQSbp,
                title: "Tekanan Darah Sistolik ≤ 100 mmHg",
                desc: "Hipotensi yang mengindikasikan gangguan perfusi sistemik (+1 poin)",
              },
            ].map((item, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  item.checked
                    ? "bg-rose-50/70 border-rose-300"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <MetricReadout
              label="Skor qSOFA Total"
              value={`${qScore} / 3`}
              sublabel={qScore >= 2 ? "Positif (≥ 2): Risiko Tinggi Luaran Buruk" : "Negatif (< 2): Risiko Lebih Rendah"}
              tone={qScore >= 2 ? "rose" : qScore === 1 ? "amber" : "emerald"}
            />
            <ClinicalNote
              level={qScore >= 2 ? "critical" : qScore === 1 ? "warning" : "success"}
              title={qScore >= 2 ? "Waspada Sepsis — Eskalasi Evaluasi Segera" : "Observasi & Evaluasi Klinis"}
            >
              {qScore >= 2
                ? "Skor qSOFA ≥ 2 berkaitan dengan peningkatan risiko mortalitas rawat inap dan perawatan ICU. Lakukan penilaian skor SOFA lengkap, pemeriksaan laktat serum, kultur darah, serta protokol antibiotik & resusitasi cairan dini."
                : "Skor qSOFA < 2 tidak menyingkirkan sepsis jika kecurigaan klinis infeksi tetap tinggi. Pantau tanda vital berkala dan nilai parameter organ lain."}
            </ClinicalNote>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-2.5">
            {[
              {
                checked: cConfusion,
                set: setCConfusion,
                code: "C",
                title: "Confusion (Kebingungan Baru)",
                desc: "Disorientasi orang, tempat, atau waktu (skor AMTS ≤ 8) (+1)",
              },
              {
                checked: cUrea,
                set: setCUrea,
                code: "U",
                title: "Urea / BUN Meningkat",
                desc: "BUN > 19 mg/dL atau Urea > 7 mmol/L (> 42 mg/dL) (+1)",
              },
              {
                checked: cResp,
                set: setCResp,
                code: "R",
                title: "Respiratory Rate ≥ 30 kali/menit",
                desc: "Distres napas bermakna (+1)",
              },
              {
                checked: cBp,
                set: setCBp,
                code: "B",
                title: "Blood Pressure Rendah",
                desc: "Sistolik < 90 mmHg ATAU Diastolik ≤ 60 mmHg (+1)",
              },
              {
                checked: cAge65,
                set: setCAge65,
                code: "65",
                title: "Usia ≥ 65 Tahun",
                desc: "Faktor risiko usia lanjut (+1)",
              },
            ].map((item, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  item.checked
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-slate-50 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    <span className="font-mono text-teal-700 mr-1.5">{item.code}</span>
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <MetricReadout
              label="Skor CURB-65 Total"
              value={`${cScore} / 5`}
              sublabel={`Estimasi mortalitas 30-hari: ${curbInterpret.mortality}`}
              tone={curbInterpret.tone}
            />
            <ClinicalNote
              level={curbInterpret.tone === "rose" ? "critical" : curbInterpret.tone === "amber" ? "warning" : "success"}
              title="Rekomendasi Penempatan & Tatalaksana"
            >
              {curbInterpret.plan}
            </ClinicalNote>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// ============================================================================
// 4. Rasio SpO2 / FiO2 (dan ROX Index)
// ============================================================================
export function Spo2Fio2Calculator() {
  const [spo2, setSpo2] = useState("94");
  const [fio2Percent, setFio2Percent] = useState("40");
  const [rr, setRr] = useState("24");

  const s = parseFloat(spo2);
  const fPct = parseFloat(fio2Percent);
  const resp = parseFloat(rr);

  const valid = !isNaN(s) && s >= 50 && s <= 100 && !isNaN(fPct) && fPct >= 21 && fPct <= 100;
  const fio2Frac = valid ? fPct / 100 : 0;
  const sfRatio = valid ? s / fio2Frac : 0;
  // Rice et al. (2007) correlation: S/F = 64 + 0.84 * (P/F) => est P/F = (S/F - 64) / 0.84
  const estPf = valid ? Math.max(0, (sfRatio - 64) / 0.84) : 0;
  const roxIndex = valid && !isNaN(resp) && resp > 0 ? sfRatio / resp : 0;

  let tone: "emerald" | "amber" | "rose" = "emerald";
  let statusTitle = "Oksigenasi Baik (S/F > 315)";
  let statusDesc = "Pertukaran gas paru berada di atas ambang kriteria ARDS (setara PaO₂/FiO₂ > 300 mmHg).";

  if (valid) {
    if (sfRatio < 148) {
      tone = "rose";
      statusTitle = "Hipoksemia Berat / Kriteria ARDS Berat (S/F < 148)";
      statusDesc = "Setara PaO₂/FiO₂ < 100 mmHg. Evaluasi eskalasi dukungan ventilasi, strategi lung-protective ventilation, dan analisis gas darah (AGD).";
    } else if (sfRatio < 235) {
      tone = "rose";
      statusTitle = "Hipoksemia Sedang / Kriteria ARDS Sedang (S/F 148–235)";
      statusDesc = "Setara PaO₂/FiO₂ 100–200 mmHg. Memerlukan pemantauan ketat oksigenasi, pertimbangkan HFNC/NIV atau evaluasi ICU.";
    } else if (sfRatio <= 315) {
      tone = "amber";
      statusTitle = "Hipoksemia Ringan / Kriteria ARDS Ringan (S/F 235–315)";
      statusDesc = "Setara PaO₂/FiO₂ 200–300 mmHg. Pantau klinis pernapasan dan kebutuhan suplementasi O₂.";
    }
  }

  const presets = [
    { label: "Udara Ruang", val: "21" },
    { label: "Nasal Kanul 2 L", val: "28" },
    { label: "Nasal Kanul 4 L", val: "36" },
    { label: "Simple Mask 6 L", val: "45" },
    { label: "NRM 10–15 L", val: "85" },
    { label: "FiO₂ 100%", val: "100" },
  ];

  return (
    <CalculatorShell
      categoryLabel="Neurologi, Paru & Gawat Darurat"
      title="Rasio SpO₂ / FiO₂ &amp; Indeks ROX"
      subtitle="Mengevaluasi fungsi oksigenasi paru secara non-invasif menggunakan oksimetri nadi, terutama pada gagal napas akut, ARDS (Definisi Global 2023), dan pemantauan terapi HFNC."
      onReset={() => {
        setSpo2("94");
        setFio2Percent("40");
        setRr("24");
      }}
      references={[
        "Matthay MA, Arabi Y, Arroliga AC, et al. A New Global Definition of Acute Respiratory Distress Syndrome. Am J Respir Crit Care Med. 2024;209(1):37-47.",
        "Rice TW, Wheeler AP, Bernard GR, et al. Comparison of the SpO2/FIO2 ratio and the PaO2/FIO2 ratio in patients with acute lung injury or ARDS. Chest. 2007;132(2):410-417.",
        "Roca O, Caralt B, Messika J, et al. An Index Combining Respiratory Rate and Oxygenation to Predict Outcome of Nasal High-Flow Therapy (ROX Index). Am J Respir Crit Care Med. 2019;199(11):1368-1376.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Saturasi Oksigen Perifer — SpO₂ (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fraksi Oksigen Inspirasi — FiO₂ (%)
            </label>
            <input
              type="number"
              min="21"
              max="100"
              value={fio2Percent}
              onChange={(e) => setFio2Percent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFio2Percent(p.val)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                    fio2Percent === p.val
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p.label} ({p.val}%)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Laju Napas / RR (opsional, untuk Indeks ROX)
            </label>
            <input
              type="number"
              min="6"
              max="60"
              value={rr}
              onChange={(e) => setRr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="kali/menit"
            />
          </div>

          <FormulaBox
            formula="S/F Ratio = SpO₂ (%) ÷ (FiO₂ (%) / 100)"
            details={valid ? `${s} ÷ ${fio2Frac.toFixed(2)} = ${sfRatio.toFixed(1)}` : undefined}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricReadout
                  label="Rasio SpO₂ / FiO₂"
                  value={sfRatio.toFixed(1)}
                  sublabel={`FiO₂ fraksi: ${fio2Frac.toFixed(2)}`}
                  tone={tone}
                />
                <MetricReadout
                  label="Estimasi PaO₂/FiO₂"
                  value={estPf.toFixed(0)}
                  unit="mmHg"
                  sublabel="Korelasi Rice et al."
                  tone="neutral"
                />
                <MetricReadout
                  label="Indeks ROX (HFNC)"
                  value={roxIndex > 0 ? roxIndex.toFixed(2) : "—"}
                  sublabel={
                    roxIndex <= 0
                      ? "Isi RR untuk hitung ROX"
                      : roxIndex >= 4.88
                      ? "Risiko intubasi rendah (≥ 4,88)"
                      : roxIndex >= 3.85
                      ? "Zona observasi ketat"
                      : "Risiko gagal HFNC tinggi (< 3,85)"
                  }
                  tone={roxIndex <= 0 ? "neutral" : roxIndex >= 4.88 ? "emerald" : roxIndex >= 3.85 ? "amber" : "rose"}
                />
              </div>

              <ClinicalNote
                level={tone === "emerald" ? "success" : tone === "amber" ? "warning" : "critical"}
                title={statusTitle}
              >
                {statusDesc}
              </ClinicalNote>

              {s > 97 && (
                <ClinicalNote level="warning" title="Batasan Kurva Disosiasi Oksihemoglobin (SpO₂ > 97%)">
                  Definisi Global ARDS 2023 mensyaratkan SpO₂ ≤ 97% saat menggunakan rasio SpO₂/FiO₂, karena di atas 97% kurva disosiasi oksihemoglobin mendatar sehingga nilai PaO₂ tidak lagi dapat diperkirakan secara akurat.
                </ClinicalNote>
              )}
            </>
          ) : (
            <ClinicalNote level="warning" title="Input Belum Valid">
              Masukkan SpO₂ antara 50–100% dan FiO₂ antara 21–100%.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}
