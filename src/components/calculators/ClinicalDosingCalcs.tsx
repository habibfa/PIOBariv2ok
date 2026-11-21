import React, { useState } from "react";
import { CalculatorShell, MetricReadout, ClinicalNote, FormulaBox } from "./CalculatorShared";

// ============================================================================
// 1. Kalkulator Infus & IV (Intravena)
// ============================================================================
export function IvInfusionCalculator() {
  const [totalVolumeMl, setTotalVolumeMl] = useState("500");
  const [durationHours, setDurationHours] = useState("8");
  const [drugMassMg, setDrugMassMg] = useState("1000");

  const vol = parseFloat(totalVolumeMl);
  const hrs = parseFloat(durationHours);
  const mass = parseFloat(drugMassMg);

  const valid = !isNaN(vol) && vol > 0 && !isNaN(hrs) && hrs > 0;
  const rateMlPerHr = valid ? vol / hrs : 0;
  const rateMlPerMin = valid ? rateMlPerHr / 60 : 0;
  const hasDrug = valid && !isNaN(mass) && mass > 0;
  const concMgPerMl = hasDrug ? mass / vol : 0;
  const dosePerHr = hasDrug ? mass / hrs : 0;
  const dosePerMin = hasDrug ? dosePerHr / 60 : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Kalkulator Infus &amp; IV (Intravena)"
      subtitle="Menghitung kecepatan pompa infus (mL/jam), konsentrasi akhir obat dalam larutan pelarut IV (mg/mL), serta laju pemberian obat intravena per jam dan per menit."
      onReset={() => {
        setTotalVolumeMl("500");
        setDurationHours("8");
        setDrugMassMg("1000");
      }}
      references={[
        "Ansel HC, Stockton SJ. Pharmaceutical Calculations. 15th ed. Wolters Kluwer; 2017.",
        "Trissel LA. Handbook on Injectable Drugs. ASHP.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Volume Larutan IV (mL)</label>
            <input
              type="number"
              value={totalVolumeMl}
              onChange={(e) => setTotalVolumeMl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="flex gap-1.5 mt-2">
              {["50", "100", "250", "500", "1000"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTotalVolumeMl(v)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md border ${
                    totalVolumeMl === v ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {v} mL
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durasi Pemberian Infus (Jam)</label>
            <input
              type="number"
              step="0.25"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah Obat dalam Pelarut (mg) — Opsional</label>
            <input
              type="number"
              step="0.1"
              value={drugMassMg}
              onChange={(e) => setDrugMassMg(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Kosongkan jika cairan polos"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Kecepatan Infus (Pompa IV)"
                  value={rateMlPerHr.toFixed(1)}
                  unit="mL/jam"
                  sublabel={`Setara ${rateMlPerMin.toFixed(2)} mL/menit · ${Math.round(rateMlPerHr * 24).toLocaleString("id-ID")} mL/24 jam`}
                  tone="emerald"
                />
                <MetricReadout
                  label="Konsentrasi Akhir Larutan"
                  value={hasDrug ? concMgPerMl.toFixed(2) : "—"}
                  unit={hasDrug ? "mg/mL" : undefined}
                  sublabel={hasDrug ? `Setara ${(concMgPerMl * 1000).toFixed(0)} mcg/mL` : "Masukkan massa obat (mg)"}
                  tone="sky"
                />
              </div>

              {hasDrug && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label="Laju Pemberian Obat per Jam"
                    value={dosePerHr.toFixed(2)}
                    unit="mg/jam"
                    tone="neutral"
                  />
                  <MetricReadout
                    label="Laju Pemberian Obat per Menit"
                    value={dosePerMin.toFixed(2)}
                    unit="mg/menit"
                    sublabel={`${(dosePerMin * 1000).toFixed(1)} mcg/menit`}
                    tone="neutral"
                  />
                </div>
              )}

              <FormulaBox
                formula="Laju (mL/jam) = Total Volume (mL) ÷ Durasi (jam)"
                details={`${vol} mL ÷ ${hrs} jam = ${rateMlPerHr.toFixed(2)} mL/jam${hasDrug ? ` · Konsentrasi = ${mass} mg ÷ ${vol} mL = ${concMgPerMl.toFixed(3)} mg/mL` : ""}`}
              />
            </>
          ) : (
            <ClinicalNote level="warning" title="Input Belum Lengkap">
              Masukkan volume larutan (mL) dan durasi infus (jam) lebih dari 0.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 2. Konversi Satuan & Pengenceran (C1V1 = C2V2 & Aligasi)
// ============================================================================
export function UnitDilutionCalculator() {
  const [tab, setTab] = useState<"unit" | "dilution" | "alligation">("unit");

  // Unit conversion
  const [massVal, setMassVal] = useState("1");
  const [massUnit, setMassUnit] = useState<"g" | "mg" | "mcg" | "kg">("g");
  const [pctVal, setPctVal] = useState("2");

  // C1V1 = C2V2
  const [c1, setC1] = useState("40"); // % or mg/mL
  const [c2, setC2] = useState("10");
  const [v2, setV2] = useState("500");
  const [concUnit, setConcUnit] = useState<"%" | "mg/mL">("%");

  // Alligation (mixing high % + low % to get target %)
  const [highC, setHighC] = useState("40");
  const [lowC, setLowC] = useState("5");
  const [targetC, setTargetC] = useState("15");
  const [totalVol, setTotalVol] = useState("500");

  // Mass math
  const mv = parseFloat(massVal) || 0;
  const inMg =
    massUnit === "kg" ? mv * 1_000_000 : massUnit === "g" ? mv * 1000 : massUnit === "mg" ? mv : mv / 1000;
  const pct = parseFloat(pctVal) || 0;
  const pctToMgMl = pct * 10; // 1% = 10 mg/mL
  const pctToRatio = pct > 0 ? Math.round(100 / pct) : 0;

  // Dilution math
  const nC1 = parseFloat(c1);
  const nC2 = parseFloat(c2);
  const nV2 = parseFloat(v2);
  const dilValid = !isNaN(nC1) && !isNaN(nC2) && !isNaN(nV2) && nC1 > 0 && nC2 > 0 && nV2 > 0 && nC2 <= nC1;
  const v1 = dilValid ? (nC2 * nV2) / nC1 : 0;
  const diluentVol = dilValid ? nV2 - v1 : 0;

  // Alligation math
  const nHigh = parseFloat(highC);
  const nLow = parseFloat(lowC);
  const nTarg = parseFloat(targetC);
  const nTot = parseFloat(totalVol);
  const alliValid =
    !isNaN(nHigh) && !isNaN(nLow) && !isNaN(nTarg) && !isNaN(nTot) && nHigh > nTarg && nTarg > nLow && nTot > 0;
  const partsHigh = alliValid ? nTarg - nLow : 0;
  const partsLow = alliValid ? nHigh - nTarg : 0;
  const totalParts = partsHigh + partsLow;
  const volHigh = alliValid ? (partsHigh / totalParts) * nTot : 0;
  const volLow = alliValid ? (partsLow / totalParts) * nTot : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Konversi Satuan &amp; Pengenceran Larutan"
      subtitle="Mengonversi satuan massa farmasi (kg, g, mg, mcg), persentase kadar (% b/v ↔ mg/mL ↔ rasio 1:X), pengenceran stok (C₁·V₁ = C₂·V₂), serta pencampuran aligasi dua konsentrasi."
      onReset={() => {
        setMassVal("1");
        setMassUnit("g");
        setPctVal("2");
        setC1("40");
        setC2("10");
        setV2("500");
        setHighC("40");
        setLowC("5");
        setTargetC("15");
        setTotalVol("500");
      }}
      references={[
        "Ansel HC, Stockton SJ. Pharmaceutical Calculations. 15th ed. Wolters Kluwer; 2017.",
        "Farmakope Indonesia Edisi VI. Kementerian Kesehatan Republik Indonesia; 2020.",
      ]}
    >
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {[
          { id: "unit", label: "Konversi Satuan & %" },
          { id: "dilution", label: "Pengenceran (C₁V₁=C₂V₂)" },
          { id: "alligation", label: "Aligasi Dua Larutan" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === t.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "unit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Konversi Massa Obat</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                value={massVal}
                onChange={(e) => setMassVal(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value as any)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="mg">Miligram (mg)</option>
                <option value="mcg">Mikrogram (mcg / µg)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Gram (g)</div>
                <div className="font-mono font-bold text-base text-slate-900 tabular-nums">{(inMg / 1000).toLocaleString("id-ID", { maximumFractionDigits: 6 })}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Miligram (mg)</div>
                <div className="font-mono font-bold text-base text-teal-700 tabular-nums">{inMg.toLocaleString("id-ID", { maximumFractionDigits: 4 })}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Mikrogram (mcg / µg)</div>
                <div className="font-mono font-bold text-base text-slate-900 tabular-nums">{(inMg * 1000).toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Nanogram (ng)</div>
                <div className="font-mono font-bold text-base text-slate-900 tabular-nums">{(inMg * 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Konversi Persentase Kadar (% b/v)</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Konsentrasi (% b/v) — misal Lidokain 2%, Dekstrosa 10%, Epinefrin 0,1%</label>
              <input
                type="number"
                step="any"
                value={pctVal}
                onChange={(e) => setPctVal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricReadout label="Setara mg/mL" value={pctToMgMl.toFixed(2)} unit="mg/mL" sublabel={`${(pctToMgMl * 1000).toFixed(0)} mcg/mL`} tone="emerald" />
              <MetricReadout label="Rasio Kekuatan" value={pctToRatio > 0 ? `1 : ${pctToRatio.toLocaleString("id-ID")}` : "—"} sublabel={`${pct} g dalam 100 mL`} tone="sky" />
            </div>
          </div>
        </div>
      )}

      {tab === "dilution" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Satuan Konsentrasi</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setConcUnit("%")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${concUnit === "%" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Persen (%)</button>
                <button type="button" onClick={() => setConcUnit("mg/mL")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${concUnit === "mg/mL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>mg/mL</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konsentrasi Stok Awal — C₁ ({concUnit})</label>
              <input type="number" step="any" value={c1} onChange={(e) => setC1(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konsentrasi Target — C₂ ({concUnit})</label>
              <input type="number" step="any" value={c2} onChange={(e) => setC2(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Akhir Diinginkan — V₂ (mL)</label>
              <input type="number" step="any" value={v2} onChange={(e) => setV2(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {dilValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout label={`Volume Stok C₁ (${nC1} ${concUnit})`} value={v1.toFixed(2)} unit="mL" sublabel="Volume larutan pekat yang diambil" tone="emerald" />
                  <MetricReadout label="Volume Pelarut (WFI / NS)" value={diluentVol.toFixed(2)} unit="mL" sublabel={`Tambahkan ad ${nV2} mL`} tone="sky" />
                </div>
                <FormulaBox
                  formula="V₁ = (C₂ × V₂) ÷ C₁"
                  details={`(${nC2} × ${nV2}) ÷ ${nC1} = ${v1.toFixed(2)} mL stok + ${diluentVol.toFixed(2)} mL pelarut → ${nV2} mL kadar ${nC2} ${concUnit}`}
                />
              </>
            ) : (
              <ClinicalNote level="warning" title="Cek Nilai Konsentrasi">
                Pastikan konsentrasi target C₂ tidak melebihi konsentrasi stok awal C₁ (C₂ ≤ C₁). Untuk mencampur dua konsentrasi aktif, gunakan tab Aligasi.
              </ClinicalNote>
            )}
          </div>
        </div>
      )}

      {tab === "alligation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konsentrasi Tinggi — Misal D40% (%)</label>
              <input type="number" step="any" value={highC} onChange={(e) => setHighC(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konsentrasi Rendah — Misal D5% (%)</label>
              <input type="number" step="any" value={lowC} onChange={(e) => setLowC(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konsentrasi Target — Misal D15% (%)</label>
              <input type="number" step="any" value={targetC} onChange={(e) => setTargetC(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Akhir Total (mL)</label>
              <input type="number" step="any" value={totalVol} onChange={(e) => setTotalVol(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {alliValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label={`Larutan Pekat (${nHigh}%)`}
                    value={volHigh.toFixed(1)}
                    unit="mL"
                    sublabel={`${partsHigh.toFixed(1)} bagian dari ${totalParts.toFixed(1)} bagian`}
                    tone="emerald"
                  />
                  <MetricReadout
                    label={`Larutan Encer (${nLow}%)`}
                    value={volLow.toFixed(1)}
                    unit="mL"
                    sublabel={`${partsLow.toFixed(1)} bagian dari ${totalParts.toFixed(1)} bagian`}
                    tone="sky"
                  />
                </div>
                <FormulaBox
                  formula="Bagian Pekat = (Target − Rendah) · Bagian Encer = (Tinggi − Target)"
                  details={`Total ${volHigh.toFixed(1)} mL (${nHigh}%) + ${volLow.toFixed(1)} mL (${nLow}%) = ${nTot} mL larutan ${nTarg}%`}
                />
              </>
            ) : (
              <ClinicalNote level="warning" title="Syarat Metode Aligasi">
                Konsentrasi target harus berada di antara konsentrasi rendah dan konsentrasi tinggi (Rendah &lt; Target &lt; Tinggi).
              </ClinicalNote>
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// ============================================================================
// 3. Kalkulator Resep & Sediaan Racikan (+ Pengecekan Dosis Maksimal)
// ============================================================================
export function CompoundingPrescriptionCalculator() {
  const [tab, setTab] = useState<"racikan" | "dm">("racikan");

  // Racikan states
  const [signaMode, setSignaMode] = useState<"dtd" | "nondtd">("dtd");
  const [numPackets, setNumPackets] = useState("15");
  const [prescribedDoseMg, setPrescribedDoseMg] = useState("125");
  const [tabletStrengthMg, setTabletStrengthMg] = useState("500");
  const [targetWeightPerPacketMg, setTargetWeightPerPacketMg] = useState("300");

  // DM states
  const [dmPatientAge, setDmPatientAge] = useState("8");
  const [dmDoseOnce, setDmDoseOnce] = useState("250");
  const [dmFreqPerDay, setDmFreqPerDay] = useState("3");
  const [dmAdultOnce, setDmAdultOnce] = useState("500");
  const [dmAdultDay, setDmAdultDay] = useState("2000");

  // Racikan math
  const nPkt = parseFloat(numPackets) || 0;
  const doseInput = parseFloat(prescribedDoseMg) || 0;
  const tabStr = parseFloat(tabletStrengthMg) || 0;
  const targetPktWt = parseFloat(targetWeightPerPacketMg) || 0;

  const racValid = nPkt > 0 && doseInput > 0 && tabStr > 0;
  const totalDrugMg = racValid ? (signaMode === "dtd" ? doseInput * nPkt : doseInput) : 0;
  const dosePerPacketMg = racValid ? (signaMode === "dtd" ? doseInput : doseInput / nPkt) : 0;
  const tabletsNeeded = racValid ? totalDrugMg / tabStr : 0;
  const totalBulkNeededMg = racValid && targetPktWt > 0 ? targetPktWt * nPkt : 0;
  const fillerSlMg = Math.max(0, totalBulkNeededMg - totalDrugMg);

  // DM math
  const ageY = parseFloat(dmPatientAge) || 0;
  const dOnce = parseFloat(dmDoseOnce) || 0;
  const freq = parseFloat(dmFreqPerDay) || 0;
  const adultOnce = parseFloat(dmAdultOnce) || 0;
  const adultDay = parseFloat(dmAdultDay) || 0;

  const ageFactor =
    ageY >= 20 ? 1 : ageY > 8 ? ageY / 20 : ageY > 0 ? ageY / (ageY + 12) : 0;
  const dmFormulaUsed =
    ageY >= 20 ? "DM Dewasa (100%)" : ageY > 8 ? "Rumus Dilling (n / 20)" : "Rumus Young (n / (n + 12))";

  const dmChildOnce = adultOnce * ageFactor;
  const dmChildDay = adultDay * ageFactor;
  const dDay = dOnce * freq;
  const pctOnce = dmChildOnce > 0 ? (dOnce / dmChildOnce) * 100 : 0;
  const pctDay = dmChildDay > 0 ? (dDay / dmChildDay) * 100 : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Kalkulator Resep &amp; Sediaan Racikan"
      subtitle="Menghitung kebutuhan tablet/bahan aktif untuk sediaan puyer atau kapsul racikan (da tales doses / non-d.t.d), estimasi pengisi SL, serta verifikasi persentase Dosis Maksimal (DM) resep."
      onReset={() => {
        setSignaMode("dtd");
        setNumPackets("15");
        setPrescribedDoseMg("125");
        setTabletStrengthMg("500");
        setTargetWeightPerPacketMg("300");
        setDmPatientAge("8");
        setDmDoseOnce("250");
        setDmFreqPerDay("3");
        setDmAdultOnce("500");
        setDmAdultDay("2000");
      }}
      references={[
        "Farmakope Indonesia Edisi III & VI — Daftar Dosis Maksimal (DM) & Penyiapan Sediaan Racikan.",
        "Syamsuni HA. Ilmu Resep. EGC; 2006.",
      ]}
    >
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          type="button"
          onClick={() => setTab("racikan")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            tab === "racikan" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Kebutuhan Bahan Racikan
        </button>
        <button
          type="button"
          onClick={() => setTab("dm")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            tab === "dm" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Cek Dosis Maksimal (DM)
        </button>
      </div>

      {tab === "racikan" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Penulisan Resep</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSignaMode("dtd")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg ${
                    signaMode === "dtd" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Pakai d.t.d (Per Bungkus)
                </button>
                <button
                  type="button"
                  onClick={() => setSignaMode("nondtd")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg ${
                    signaMode === "nondtd" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Tanpa d.t.d (Total Resep)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah Bungkus / Kapsul</label>
                <input type="number" value={numPackets} onChange={(e) => setNumPackets(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {signaMode === "dtd" ? "Dosis per Bungkus (mg)" : "Total Dosis di Resep (mg)"}
                </label>
                <input type="number" step="any" value={prescribedDoseMg} onChange={(e) => setPrescribedDoseMg(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kekuatan Tablet Tersedia (mg)</label>
                <input type="number" step="any" value={tabletStrengthMg} onChange={(e) => setTabletStrengthMg(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Bobot/Bungkus (mg)</label>
                <input type="number" step="any" value={targetWeightPerPacketMg} onChange={(e) => setTargetWeightPerPacketMg(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {racValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label="Jumlah Tablet Diambil"
                    value={tabletsNeeded.toFixed(2)}
                    unit="tablet"
                    sublabel={`Total zat aktif: ${totalDrugMg.toFixed(1)} mg (${dosePerPacketMg.toFixed(1)} mg/bungkus)`}
                    tone="emerald"
                  />
                  <MetricReadout
                    label="Tambahan Pengisi (SL / Laktosa)"
                    value={fillerSlMg.toFixed(0)}
                    unit="mg"
                    sublabel={`Total serbuk: ${totalBulkNeededMg.toFixed(0)} mg (${targetPktWt} mg × ${nPkt} bks)`}
                    tone="sky"
                  />
                </div>
                <FormulaBox
                  formula={signaMode === "dtd" ? "Total Bahan = Dosis/bungkus × Jumlah Bungkus" : "Dosis/bungkus = Total Bahan ÷ Jumlah Bungkus"}
                  details={`Jumlah Tablet = ${totalDrugMg.toFixed(1)} mg ÷ ${tabStr} mg/tab = ${tabletsNeeded.toFixed(2)} tablet`}
                />
                {!Number.isInteger(tabletsNeeded) && (
                  <ClinicalNote level="info" title="Catatan Pengambilan Tablet Pecahan">
                    Hasil perhitungan bukan bilangan bulat ({tabletsNeeded.toFixed(2)} tablet). Pastikan pembulatan atau pengenceran bertingkat (<em>trituration</em>) mengikuti SOP peracikan instalasi farmasi agar keseragaman kandungan terjaga.
                  </ClinicalNote>
                )}
              </>
            ) : (
              <ClinicalNote level="warning" title="Lengkapi Parameter Resep">
                Masukkan jumlah bungkus, dosis zat aktif, dan kekuatan sediaan tablet yang tersedia.
              </ClinicalNote>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia Pasien (Tahun)</label>
              <input type="number" step="0.5" value={dmPatientAge} onChange={(e) => setDmPatientAge(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              <p className="text-[11px] text-slate-500 mt-1">Metode otomatis: {dmFormulaUsed}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dosis Resep 1× Pakai (mg)</label>
                <input type="number" step="any" value={dmDoseOnce} onChange={(e) => setDmDoseOnce(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Frekuensi / Hari (×)</label>
                <input type="number" value={dmFreqPerDay} onChange={(e) => setDmFreqPerDay(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">DM Dewasa 1× Pakai (mg)</label>
                <input type="number" step="any" value={dmAdultOnce} onChange={(e) => setDmAdultOnce(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">DM Dewasa 1 Hari (mg)</label>
                <input type="number" step="any" value={dmAdultDay} onChange={(e) => setDmAdultDay(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricReadout
                label="% DM Sekali Pakai"
                value={dmChildOnce > 0 ? `${pctOnce.toFixed(1)}%` : "—"}
                sublabel={`Resep ${dOnce} mg vs Batas DM ${dmChildOnce.toFixed(1)} mg`}
                tone={pctOnce > 100 ? "rose" : pctOnce >= 80 ? "amber" : "emerald"}
              />
              <MetricReadout
                label="% DM Sehari (24 Jam)"
                value={dmChildDay > 0 ? `${pctDay.toFixed(1)}%` : "—"}
                sublabel={`Resep ${dDay} mg/hr vs Batas DM ${dmChildDay.toFixed(1)} mg/hr`}
                tone={pctDay > 100 ? "rose" : pctDay >= 80 ? "amber" : "emerald"}
              />
            </div>

            <ClinicalNote
              level={pctOnce > 100 || pctDay > 100 ? "critical" : pctOnce >= 80 || pctDay >= 80 ? "warning" : "success"}
              title={
                pctOnce > 100 || pctDay > 100
                  ? "OVERDOSIS — Dosis Maksimal Terlampaui (> 100%)"
                  : pctOnce >= 80 || pctDay >= 80
                  ? "Perhatian — Dosis Mendekati Batas Maksimal (80–100%)"
                  : "Dosis Dalam Batas Aman (< 80% DM)"
              }
            >
              {pctOnce > 100 || pctDay > 100
                ? "Dosis resep melampaui 100% Dosis Maksimal. Apoteker wajib menghubungi dokter penulis resep untuk konfirmasi atau penyesuaian dosis sebelum penyiapan."
                : pctOnce >= 80 || pctDay >= 80
                ? "Dosis berada di rentang 80–100% DM. Pastikan penimbangan dilakukan secara teliti per satuan bungkus (bukan dibagi rata secara visual)."
                : "Dosis sekali pakai dan dosis harian berada dalam batas aman terhadap Dosis Maksimal yang dimasukkan."}
            </ClinicalNote>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// ============================================================================
// 4. Farmakokinetika Klinis (Logaritma & Eksponen — 1-Kompartemen)
// ============================================================================
export function PharmacokineticsCalculator() {
  const [mode, setMode] = useState<"elimination" | "dosing">("elimination");

  // Elimination (C1, C2, dt, predict t)
  const [c1, setC1] = useState("24");
  const [c2, setC2] = useState("12");
  const [dt, setDt] = useState("6");
  const [predictT, setPredictT] = useState("12");

  // Clearance / Vd / LD / MD
  const [vdL, setVdL] = useState("45");
  const [keInput, setKeInput] = useState("0.1155");
  const [cTarget, setCTarget] = useState("15");
  const [tauHours, setTauHours] = useState("12");
  const [bioavail, setBioavail] = useState("1.0");

  // Elimination calculations
  const nC1 = parseFloat(c1);
  const nC2 = parseFloat(c2);
  const nDt = parseFloat(dt);
  const nPredT = parseFloat(predictT);
  const elimValid = !isNaN(nC1) && !isNaN(nC2) && !isNaN(nDt) && nC1 > nC2 && nC2 > 0 && nDt > 0;

  const ke = elimValid ? Math.log(nC1 / nC2) / nDt : 0;
  const halfLife = elimValid && ke > 0 ? Math.LN2 / ke : 0;
  const steadyStateLow = halfLife * 4;
  const steadyStateHigh = halfLife * 5;
  const predictedC = elimValid && !isNaN(nPredT) && nPredT >= 0 ? nC1 * Math.exp(-ke * nPredT) : 0;

  // Dosing calculations
  const vd = parseFloat(vdL);
  const k = parseFloat(keInput);
  const css = parseFloat(cTarget);
  const tau = parseFloat(tauHours);
  const f = parseFloat(bioavail);
  const dosValid = !isNaN(vd) && vd > 0 && !isNaN(k) && k > 0 && !isNaN(css) && css > 0 && !isNaN(tau) && tau > 0 && !isNaN(f) && f > 0 && f <= 1;

  const clearanceLPerHr = dosValid ? k * vd : 0;
  const tHalfDosing = dosValid ? Math.LN2 / k : 0;
  const loadingDoseMg = dosValid ? (css * vd) / f : 0; // css in mg/L * L = mg
  const maintenanceDoseMg = dosValid ? (css * clearanceLPerHr * tau) / f : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Farmakokinetika Klinis (Orde Pertama)"
      subtitle="Menghitung konstanta eliminasi (ke), waktu paruh (t½), prediksi kadar obat plasma C(t) menggunakan fungsi logaritma natural & eksponen, serta klirens (Cl), Loading Dose (LD), dan Maintenance Dose (MD)."
      onReset={() => {
        setC1("24");
        setC2("12");
        setDt("6");
        setPredictT("12");
        setVdL("45");
        setKeInput("0.1155");
        setCTarget("15");
        setTauHours("12");
        setBioavail("1.0");
      }}
      references={[
        "Winter ME. Basic Clinical Pharmacokinetics. 5th ed. Lippincott Williams & Wilkins; 2010.",
        "Shargel L, Yu ABC. Applied Biopharmaceutics & Pharmacokinetics. 7th ed. McGraw-Hill; 2016.",
      ]}
    >
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          type="button"
          onClick={() => setMode("elimination")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mode === "elimination" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Waktu Paruh (t½) &amp; Kadar C(t)
        </button>
        <button
          type="button"
          onClick={() => setMode("dosing")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mode === "dosing" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
          }`}
        >
          Klirens, Vd, Loading &amp; Maintenance Dose
        </button>
      </div>

      {mode === "elimination" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kadar Awal — C₁ (mg/L)</label>
                <input type="number" step="any" value={c1} onChange={(e) => setC1(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kadar Akhir — C₂ (mg/L)</label>
                <input type="number" step="any" value={c2} onChange={(e) => setC2(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selang Waktu — Δt (jam)</label>
                <input type="number" step="any" value={dt} onChange={(e) => setDt(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prediksi pada t (jam dr C₁)</label>
                <input type="number" step="any" value={predictT} onChange={(e) => setPredictT(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            <FormulaBox
              formula="ke = ln(C₁ / C₂) ÷ Δt  ·  t½ = ln(2) ÷ ke  ·  C(t) = C₁ · e^(−ke·t)"
              details={elimValid ? `ke = ln(${nC1}/${nC2}) ÷ ${nDt} = ${ke.toFixed(4)} jam⁻¹` : undefined}
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {elimValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MetricReadout label="Konstanta Eliminasi (ke)" value={ke.toFixed(4)} unit="jam⁻¹" tone="neutral" />
                  <MetricReadout label="Waktu Paruh (t½)" value={halfLife.toFixed(2)} unit="jam" sublabel={`Steady-state (4–5×t½): ${steadyStateLow.toFixed(1)}–${steadyStateHigh.toFixed(1)} jam`} tone="emerald" />
                  <MetricReadout label={`Prediksi Kadar C(${nPredT}j)`} value={predictedC.toFixed(2)} unit="mg/L" sublabel={`${((predictedC / nC1) * 100).toFixed(1)}% dari C₁`} tone="sky" />
                </div>
                <ClinicalNote level="info" title="Aplikasi Therapeutic Drug Monitoring (TDM)">
                  Cocok untuk analisis kadar puncak &amp; palung (<em>peak &amp; trough</em>) obat indeks terapi sempit seperti Vankomisin, Gentamisin, Amikasin, atau Teofilin pada model satu kompartemen.
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Input Kadar Tidak Valid">
                Pastikan kadar awal C₁ lebih besar dari kadar kedua C₂ (C₁ &gt; C₂ &gt; 0) dan selang waktu Δt &gt; 0.
              </ClinicalNote>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Distribusi — Vd (L)</label>
                <input type="number" step="any" value={vdL} onChange={(e) => setVdL(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konstanta Eliminasi — ke (jam⁻¹)</label>
                <input type="number" step="0.001" value={keInput} onChange={(e) => setKeInput(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Css (mg/L)</label>
                <input type="number" step="any" value={cTarget} onChange={(e) => setCTarget(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interval τ (jam)</label>
                <input type="number" step="any" value={tauHours} onChange={(e) => setTauHours(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bioavailabilitas (F)</label>
                <input type="number" step="0.05" min="0.05" max="1" value={bioavail} onChange={(e) => setBioavail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <FormulaBox
              formula="Cl = ke × Vd  ·  LD = (Css × Vd) ÷ F  ·  MD = (Css × Cl × τ) ÷ F"
              details="Gunakan F = 1,0 untuk pemberian intravena (IV)."
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {dosValid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout label="Klirens Total (Cl)" value={clearanceLPerHr.toFixed(2)} unit="L/jam" sublabel={`Setara ${((clearanceLPerHr * 1000) / 60).toFixed(1)} mL/menit · t½ = ${tHalfDosing.toFixed(1)} jam`} tone="neutral" />
                <MetricReadout label="Loading Dose (LD)" value={loadingDoseMg.toFixed(1)} unit="mg" sublabel="Dosis muatan awal untuk mencapai Css segera" tone="sky" />
                <MetricReadout label={`Maintenance Dose (tiap ${tau} jam)`} value={maintenanceDoseMg.toFixed(1)} unit="mg" sublabel={`Total harian: ${((maintenanceDoseMg * 24) / tau).toFixed(1)} mg/hari`} tone="emerald" />
              </div>
            ) : (
              <ClinicalNote level="warning" title="Input Tidak Valid">
                Pastikan Vd, ke, Css, interval τ &gt; 0 dan Bioavailabilitas F berada di antara 0,05–1,0.
              </ClinicalNote>
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// ============================================================================
// 5. Kalkulator Tetesan Infus (Makro & Mikro Drip — TPM)
// ============================================================================
export function InfusionDripRateCalculator() {
  const [volumeMl, setVolumeMl] = useState("500");
  const [durationHours, setDurationHours] = useState("8");
  const [dropFactor, setDropFactor] = useState<"20" | "15" | "60" | "10">("20");

  const vol = parseFloat(volumeMl);
  const hrs = parseFloat(durationHours);
  const df = parseFloat(dropFactor);
  const valid = !isNaN(vol) && vol > 0 && !isNaN(hrs) && hrs > 0;

  const tpm = valid ? (vol * df) / (hrs * 60) : 0;
  const mlPerHr = valid ? vol / hrs : 0;
  const secPerDrop = tpm > 0 ? 60 / tpm : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Kalkulator Tetesan Infus (TPM)"
      subtitle="Menghitung kecepatan tetesan infus per menit (gtt/menit atau TPM) untuk set infus Makro Drip (20 atau 15 tpm/mL), Mikro Drip anak (60 tpm/mL), maupun Transfusi Darah (10–15 tpm/mL)."
      onReset={() => {
        setVolumeMl("500");
        setDurationHours("8");
        setDropFactor("20");
      }}
      references={[
        "Perry AG, Potter PA, Ostendorf WR. Clinical Nursing Skills and Techniques. 10th ed. Elsevier; 2022.",
        "Standar Prosedur Operasional (SPO) Terapi Cairan Intravena Rumah Sakit.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Set Infus (Faktor Tetes)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "20", title: "Makro 20", sub: "Otsuka / Standar Dewasa" },
                { val: "15", title: "Makro 15", sub: "Terumo / Standar Dewasa" },
                { val: "60", title: "Mikro 60", sub: "Pediatrik / Buret" },
                { val: "10", title: "Transfusi 10", sub: "Blood Set" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDropFactor(opt.val as any)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    dropFactor === opt.val
                      ? "bg-teal-50 border-teal-400 text-teal-900"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.title} tpm/mL</div>
                  <div className="text-[11px] text-slate-500">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Cairan (mL)</label>
              <input type="number" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Waktu Pemberian (Jam)</label>
              <input type="number" step="0.5" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <FormulaBox
            formula="TPM = (Volume (mL) × Faktor Tetes) ÷ (Jam × 60)"
            details={valid ? `(${vol} × ${df}) ÷ (${hrs} × 60) = ${tpm.toFixed(1)} tpm` : undefined}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Kecepatan Tetesan (Dibulatkan)"
                  value={Math.round(tpm).toString()}
                  unit="TPM (gtt/menit)"
                  sublabel={`Tepat: ${tpm.toFixed(1)} tpm · 1 tetes setiap ${secPerDrop.toFixed(1)} detik`}
                  tone="emerald"
                />
                <MetricReadout
                  label="Kecepatan Volumetrik"
                  value={mlPerHr.toFixed(1)}
                  unit="mL/jam"
                  sublabel={`Setara ${((vol / hrs) * 24).toFixed(0)} mL per 24 jam (${(((vol / hrs) * 24) / 500).toFixed(1)} kolf 500 mL)`}
                  tone="sky"
                />
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold">Kolf 500 mL Habis Dalam</th>
                      <th className="px-3.5 py-2 font-semibold font-mono">Makro 20</th>
                      <th className="px-3.5 py-2 font-semibold font-mono">Makro 15</th>
                      <th className="px-3.5 py-2 font-semibold font-mono">Mikro 60</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                    {[4, 6, 8, 12, 24].map((h) => (
                      <tr key={h}>
                        <td className="px-3.5 py-2 font-sans font-medium text-slate-800">{h} jam ({(500 / h).toFixed(0)} mL/jam)</td>
                        <td className="px-3.5 py-2">{Math.round((500 * 20) / (h * 60))} tpm</td>
                        <td className="px-3.5 py-2">{Math.round((500 * 15) / (h * 60))} tpm</td>
                        <td className="px-3.5 py-2">{Math.round((500 * 60) / (h * 60))} tpm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ClinicalNote level="warning" title="Input Belum Valid">
              Masukkan volume cairan (mL) dan durasi (jam) yang lebih besar dari 0.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 6. Kalkulator Syringe Pump / Infusion Pump (Obat Titrasi ICU)
// ============================================================================
type SyringeUnit = "mcg_kg_min" | "mcg_min" | "mg_hr" | "unit_hr";

interface SyringeDrugPreset {
  id: string;
  name: string;
  unit: SyringeUnit;
  drugAmount: string; // mg or Unit
  amountLabel: "mg" | "Unit";
  syringeMl: string;
  defaultDose: string;
  rangeNote: string;
}

const SYRINGE_PRESETS: SyringeDrugPreset[] = [
  { id: "norepi", name: "Norepinefrin (Vascon)", unit: "mcg_kg_min", drugAmount: "4", amountLabel: "mg", syringeMl: "50", defaultDose: "0.1", rangeNote: "Rentang lazim: 0,02 – 1,0 mcg/kgBB/menit (sentral)" },
  { id: "dopamin", name: "Dopamin", unit: "mcg_kg_min", drugAmount: "200", amountLabel: "mg", syringeMl: "50", defaultDose: "5", rangeNote: "Renal/inotropik: 2–10 · Vasopresor: 10–20 mcg/kgBB/menit" },
  { id: "dobutamin", name: "Dobutamin", unit: "mcg_kg_min", drugAmount: "250", amountLabel: "mg", syringeMl: "50", defaultDose: "5", rangeNote: "Rentang lazim: 2,5 – 20 mcg/kgBB/menit" },
  { id: "epi", name: "Epinefrin", unit: "mcg_kg_min", drugAmount: "4", amountLabel: "mg", syringeMl: "50", defaultDose: "0.05", rangeNote: "Rentang lazim: 0,01 – 0,5 mcg/kgBB/menit" },
  { id: "ntg", name: "Nitrogliserin (NTG)", unit: "mcg_min", drugAmount: "10", amountLabel: "mg", syringeMl: "50", defaultDose: "20", rangeNote: "Rentang lazim: 5 – 200 mcg/menit" },
  { id: "nicardipine", name: "Nikardipin", unit: "mg_hr", drugAmount: "10", amountLabel: "mg", syringeMl: "50", defaultDose: "5", rangeNote: "Krisis hipertensi: mulai 5 mg/jam, titrasi maks 15 mg/jam" },
  { id: "insulin", name: "Insulin Regular IV", unit: "unit_hr", drugAmount: "50", amountLabel: "Unit", syringeMl: "50", defaultDose: "5", rangeNote: "KAD/HHS: 0,1 Unit/kgBB/jam (1 Unit/mL → mL/jam = Unit/jam)" },
  { id: "heparin", name: "Heparin (UFH)", unit: "unit_hr", drugAmount: "25000", amountLabel: "Unit", syringeMl: "50", defaultDose: "1000", rangeNote: "Titrasi berdasarkan hasil aPTT berkala" },
];

export function SyringePumpCalculator() {
  const [presetId, setPresetId] = useState("norepi");
  const [unit, setUnit] = useState<SyringeUnit>("mcg_kg_min");
  const [drugAmount, setDrugAmount] = useState("4");
  const [syringeVol, setSyringeVol] = useState("50");
  const [weightKg, setWeightKg] = useState("60");
  const [targetDose, setTargetDose] = useState("0.1");

  const activePreset = SYRINGE_PRESETS.find((p) => p.id === presetId) || SYRINGE_PRESETS[0];
  const isUnitDrug = unit === "unit_hr";

  const applyPreset = (p: SyringeDrugPreset) => {
    setPresetId(p.id);
    setUnit(p.unit);
    setDrugAmount(p.drugAmount);
    setSyringeVol(p.syringeMl);
    setTargetDose(p.defaultDose);
  };

  const amt = parseFloat(drugAmount);
  const vol = parseFloat(syringeVol);
  const wt = parseFloat(weightKg);
  const dose = parseFloat(targetDose);

  const valid =
    !isNaN(amt) && amt > 0 &&
    !isNaN(vol) && vol > 0 &&
    !isNaN(dose) && dose > 0 &&
    (unit !== "mcg_kg_min" || (!isNaN(wt) && wt > 0));

  let concPerMl = 0; // mcg/mL or mg/mL or Unit/mL
  let rateMlPerHr = 0;
  let concDisplayUnit = "mcg/mL";

  if (valid) {
    if (unit === "mcg_kg_min") {
      concPerMl = (amt * 1000) / vol; // mcg/mL
      concDisplayUnit = "mcg/mL";
      rateMlPerHr = (dose * wt * 60) / concPerMl;
    } else if (unit === "mcg_min") {
      concPerMl = (amt * 1000) / vol; // mcg/mL
      concDisplayUnit = "mcg/mL";
      rateMlPerHr = (dose * 60) / concPerMl;
    } else if (unit === "mg_hr") {
      concPerMl = amt / vol; // mg/mL
      concDisplayUnit = "mg/mL";
      rateMlPerHr = dose / concPerMl;
    } else {
      concPerMl = amt / vol; // Unit/mL
      concDisplayUnit = "Unit/mL";
      rateMlPerHr = dose / concPerMl;
    }
  }

  const hoursUntilEmpty = valid && rateMlPerHr > 0 ? vol / rateMlPerHr : 0;

  const doseUnitLabel: Record<SyringeUnit, string> = {
    mcg_kg_min: "mcg/kgBB/menit",
    mcg_min: "mcg/menit",
    mg_hr: "mg/jam",
    unit_hr: "Unit/jam",
  };

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Kalkulator Syringe Pump / Infusion Pump"
      subtitle="Mengonversi dosis obat titrasi kritis (vasopresor, inotropik, vasodilator, insulin, heparin) ke kecepatan pompa (mL/jam) lengkap dengan konsentrasi spuit dan tabel titrasi cepat."
      onReset={() => applyPreset(SYRINGE_PRESETS[0])}
      references={[
        "ISMP Guidelines for Safe Medication Use in ICU & Standard Concentration Infusions.",
        "Lexicomp / Micromedex Critical Care Intravenous Infusion Compatibility & Dosing Guidelines.",
      ]}
    >
      <div className="mb-5">
        <div className="text-xs font-semibold text-slate-600 mb-2">Preset Obat Titrasi ICU / HCU</div>
        <div className="flex flex-wrap gap-1.5">
          {SYRINGE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                presetId === p.id
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Satuan Dosis Titrasi</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as SyringeUnit)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="mcg_kg_min">mcg / kgBB / menit (Vasopresor &amp; Inotropik)</option>
              <option value="mcg_min">mcg / menit (Nitrogliserin, dll.)</option>
              <option value="mg_hr">mg / jam (Nikardipin, Furosemid, dll.)</option>
              <option value="unit_hr">Unit / jam (Insulin, Heparin)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Obat ({isUnitDrug ? "Unit" : "mg"})
              </label>
              <input type="number" step="any" value={drugAmount} onChange={(e) => setDrugAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Pengencer (mL)</label>
              <input type="number" step="any" value={syringeVol} onChange={(e) => setSyringeVol(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {unit === "mcg_kg_min" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
                <input type="number" step="0.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            )}
            <div className={unit === "mcg_kg_min" ? "" : "col-span-2"}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dosis Target ({doseUnitLabel[unit]})
              </label>
              <input type="number" step="any" value={targetDose} onChange={(e) => setTargetDose(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <ClinicalNote level="info" title={`Panduan Klinis ${activePreset.name}`}>
            {activePreset.rangeNote}. Verifikasi ulang konsentrasi spuit (<em>double-check</em> independen oleh 2 tenaga kesehatan untuk obat High-Alert).
          </ClinicalNote>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Kecepatan Syringe Pump"
                  value={rateMlPerHr.toFixed(2)}
                  unit="mL/jam"
                  sublabel={`1 spuit (${vol} mL) habis dalam ${hoursUntilEmpty.toFixed(1)} jam`}
                  tone="emerald"
                />
                <MetricReadout
                  label="Konsentrasi dalam Spuit"
                  value={concPerMl.toFixed(1)}
                  unit={concDisplayUnit}
                  sublabel={`${amt} ${isUnitDrug ? "Unit" : "mg"} dalam ${vol} mL`}
                  tone="sky"
                />
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  Tabel Titrasi Cepat ({doseUnitLabel[unit]} → mL/jam)
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-white border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold">Kelipatan Dosis</th>
                      <th className="px-3.5 py-2 font-semibold font-mono">Dosis ({doseUnitLabel[unit]})</th>
                      <th className="px-3.5 py-2 font-semibold font-mono">Laju Pompa (mL/jam)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                    {[0.5, 1, 1.5, 2, 3].map((mult) => {
                      const d = dose * mult;
                      const r = rateMlPerHr * mult;
                      return (
                        <tr key={mult} className={mult === 1 ? "bg-teal-50/50 font-semibold text-teal-900" : ""}>
                          <td className="px-3.5 py-2 font-sans">{mult === 1 ? "Target Saat Ini (1×)" : `${mult}× target`}</td>
                          <td className="px-3.5 py-2">{d.toFixed(unit === "mcg_kg_min" ? 3 : 1)}</td>
                          <td className="px-3.5 py-2">{r.toFixed(2)} mL/jam</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ClinicalNote level="warning" title="Lengkapi Parameter Syringe Pump">
              Masukkan jumlah obat, volume pengencer, berat badan (bila diperlukan), dan dosis target &gt; 0.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 7. Kalkulator Kebutuhan Cairan & Elektrolit
//    (Holliday-Segar, Baxter/Parkland, Koreksi Hiponatremia & Hipokalemia)
// ============================================================================
export function FluidElectrolyteCalculator() {
  const [tab, setTab] = useState<"holliday" | "parkland" | "hyponatremia" | "hypokalemia">("holliday");

  // Holliday-Segar
  const [hsWeight, setHsWeight] = useState("18");

  // Parkland / Baxter
  const [pkWeight, setPkWeight] = useState("70");
  const [pkTbsa, setPkTbsa] = useState("30");
  const [pkElapsedHrs, setPkElapsedHrs] = useState("2");

  // Hyponatremia
  const [naWeight, setNaWeight] = useState("65");
  const [naProfile, setNaProfile] = useState<"adult_m" | "adult_f" | "elder_m" | "elder_f">("adult_m");
  const [naCurrent, setNaCurrent] = useState("120");
  const [naTarget, setNaTarget] = useState("128");
  const [naFluid, setNaFluid] = useState<"nacl3" | "nacl09">("nacl3");

  // Hypokalemia
  const [kCurrent, setKCurrent] = useState("2.8");
  const [kTarget, setKTarget] = useState("3.8");
  const [kWeight, setKWeight] = useState("65");

  // 1. Holliday-Segar Math
  const wHs = parseFloat(hsWeight);
  let hsDaily = 0;
  let hsHourly = 0;
  if (!isNaN(wHs) && wHs > 0) {
    if (wHs <= 10) {
      hsDaily = wHs * 100;
      hsHourly = wHs * 4;
    } else if (wHs <= 20) {
      hsDaily = 1000 + (wHs - 10) * 50;
      hsHourly = 40 + (wHs - 10) * 2;
    } else {
      hsDaily = 1500 + (wHs - 20) * 20;
      hsHourly = 60 + (wHs - 20) * 1;
    }
  }

  // 2. Parkland Math
  const wPk = parseFloat(pkWeight);
  const tbsa = parseFloat(pkTbsa);
  const elapsed = Math.min(7.5, Math.max(0, parseFloat(pkElapsedHrs) || 0));
  const pkValid = !isNaN(wPk) && wPk > 0 && !isNaN(tbsa) && tbsa > 0 && tbsa <= 100;
  const pkTotal24 = pkValid ? 4 * wPk * tbsa : 0;
  const pkFirst8 = pkTotal24 / 2;
  const pkNext16 = pkTotal24 / 2;
  const remainingFirst8Hrs = Math.max(0.5, 8 - elapsed);
  const pkRateFirst8 = pkValid ? pkFirst8 / remainingFirst8Hrs : 0;
  const pkRateNext16 = pkValid ? pkNext16 / 16 : 0;

  // 3. Hyponatremia Math (Adrogué-Madias + Sodium Deficit)
  const wNa = parseFloat(naWeight);
  const curNa = parseFloat(naCurrent);
  const tarNa = parseFloat(naTarget);
  const tbwFactor = { adult_m: 0.6, adult_f: 0.5, elder_m: 0.5, elder_f: 0.45 }[naProfile];
  const naValid = !isNaN(wNa) && wNa > 0 && !isNaN(curNa) && !isNaN(tarNa) && tarNa > curNa && curNa >= 90 && tarNa <= 145;
  const tbw = naValid ? wNa * tbwFactor : 0;
  const naDeficit = naValid ? tbw * (tarNa - curNa) : 0;
  const infusateNa = naFluid === "nacl3" ? 513 : 154; // mEq/L
  const deltaNaPerLiter = naValid ? (infusateNa - curNa) / (tbw + 1) : 0;
  const litersNeeded = naValid && deltaNaPerLiter > 0 ? (tarNa - curNa) / deltaNaPerLiter : 0;
  const deltaRequested = naValid ? tarNa - curNa : 0;

  // 4. Hypokalemia Math
  const curK = parseFloat(kCurrent);
  const tarK = parseFloat(kTarget);
  const wK = parseFloat(kWeight);
  const kValid = !isNaN(curK) && !isNaN(tarK) && tarK > curK && curK >= 1.5 && tarK <= 5.0 && !isNaN(wK) && wK > 0;
  // Clinical estimate: each 0.3 mEq/L drop below 4.0 ~ 100 mEq total body deficit (~300 mEq per 1.0 mEq/L drop)
  const kEstDeficitMeq = kValid ? (tarK - curK) * 300 : 0;
  const kInitialReplace = kValid ? Math.min(80, Math.max(20, Math.round((tarK - curK) * 40))) : 0;

  return (
    <CalculatorShell
      categoryLabel="Kalkulator Klinis & Dosis Obat"
      title="Kalkulator Kebutuhan Cairan &amp; Elektrolit"
      subtitle="Menghitung cairan rumatan anak (Holliday-Segar / 4-2-1), resusitasi luka bakar (Baxter / Parkland), koreksi hiponatremia (Adrogué-Madias), dan estimasi koreksi hipokalemia."
      onReset={() => {
        setHsWeight("18");
        setPkWeight("70");
        setPkTbsa("30");
        setPkElapsedHrs("2");
        setNaWeight("65");
        setNaCurrent("120");
        setNaTarget("128");
        setKCurrent("2.8");
        setKTarget("3.8");
        setKWeight("65");
      }}
      references={[
        "Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.",
        "Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns (Parkland Formula). Ann N Y Acad Sci. 1968.",
        "Adrogué HJ, Madias NE. Hyponatremia. N Engl J Med. 2000;342(21):1581-1589.",
      ]}
    >
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {[
          { id: "holliday", label: "Holliday-Segar (Anak)" },
          { id: "parkland", label: "Luka Bakar (Parkland)" },
          { id: "hyponatremia", label: "Koreksi Hiponatremia" },
          { id: "hypokalemia", label: "Koreksi Hipokalemia" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === t.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "holliday" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan Pasien (kg)</label>
              <input type="number" step="0.5" value={hsWeight} onChange={(e) => setHsWeight(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <FormulaBox
              formula="100 mL/kg (10 kg I) + 50 mL/kg (10 kg II) + 20 mL/kg (>20 kg)"
              details="Aturan per jam (4-2-1): 4 mL/kg/j (10 kg I) + 2 mL/kg/j (10 kg II) + 1 mL/kg/j (>20 kg)"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            {hsDaily > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout label="Kebutuhan Cairan 24 Jam" value={Math.round(hsDaily).toLocaleString("id-ID")} unit="mL/hari" sublabel={`Setara ${(hsDaily / 500).toFixed(1)} kolf 500 mL/hari`} tone="emerald" />
                  <MetricReadout label="Kecepatan Rumatan (4-2-1)" value={hsHourly.toFixed(1)} unit="mL/jam" sublabel={`Mikro drip (60): ${Math.round(hsHourly)} tpm · Makro (20): ${Math.round(hsHourly / 3)} tpm`} tone="sky" />
                </div>
                <ClinicalNote level="info" title="Catatan Klinis Rumatan Pediatrik">
                  Cairan rumatan isotonis (mis. D5% + NaCl 0,9% dengan KCl sesuai kalium serum) umumnya direkomendasikan AAP untuk mencegah hiponatremia iatrogenik pada anak rawat inap.
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Masukkan Berat Badan">Masukkan berat badan anak (kg) lebih dari 0.</ClinicalNote>
            )}
          </div>
        </div>
      )}

      {tab === "parkland" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan Pasien (kg)</label>
              <input type="number" value={pkWeight} onChange={(e) => setPkWeight(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Luas Luka Bakar — % TBSA (Derajat II &amp; III)</label>
              <input type="number" min="1" max="100" value={pkTbsa} onChange={(e) => setPkTbsa(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Waktu Berlalu Sejak Kejadian (Jam)</label>
              <input type="number" step="0.5" min="0" max="7.5" value={pkElapsedHrs} onChange={(e) => setPkElapsedHrs(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
            <FormulaBox formula="Total 24 Jam = 4 mL × BB (kg) × % TBSA (Ringer Laktat)" details="50% diberikan dalam 8 jam pertama sejak kejadian, 50% pada 16 jam berikutnya." />
          </div>
          <div className="lg:col-span-7 space-y-4">
            {pkValid ? (
              <>
                <MetricReadout label="Total Cairan Resusitasi 24 Jam (RL)" value={Math.round(pkTotal24).toLocaleString("id-ID")} unit="mL" sublabel={`${(pkTotal24 / 1000).toFixed(2)} Liter Ringer Laktat`} tone="emerald" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label={`8 Jam Pertama (sisa ${remainingFirst8Hrs.toFixed(1)} jam)`}
                    value={Math.round(pkRateFirst8).toLocaleString("id-ID")}
                    unit="mL/jam"
                    sublabel={`Total fase 1: ${Math.round(pkFirst8).toLocaleString("id-ID")} mL`}
                    tone="amber"
                  />
                  <MetricReadout
                    label="16 Jam Berikutnya"
                    value={Math.round(pkRateNext16).toLocaleString("id-ID")}
                    unit="mL/jam"
                    sublabel={`Total fase 2: ${Math.round(pkNext16).toLocaleString("id-ID")} mL`}
                    tone="sky"
                  />
                </div>
                <ClinicalNote level="info" title="Target Titrasi Produksi Urin">
                  Rumus Parkland adalah titik awal. Titrasi laju cairan secara berkala berdasarkan produksi urin target: 0,5 mL/kgBB/jam pada dewasa atau 1,0 mL/kgBB/jam pada anak.
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Input Belum Valid">Masukkan BB &gt; 0 kg dan % TBSA antara 1–100%.</ClinicalNote>
            )}
          </div>
        </div>
      )}

      {tab === "hyponatremia" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
                <input type="number" value={naWeight} onChange={(e) => setNaWeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Faktor TBW</label>
                <select value={naProfile} onChange={(e) => setNaProfile(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-teal-500">
                  <option value="adult_m">Pria Dewasa (0,60)</option>
                  <option value="adult_f">Wanita Dewasa (0,50)</option>
                  <option value="elder_m">Pria Lansia (0,50)</option>
                  <option value="elder_f">Wanita Lansia (0,45)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Na Serum Aktual (mEq/L)</label>
                <input type="number" step="0.5" value={naCurrent} onChange={(e) => setNaCurrent(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Na Target 24 Jam (mEq/L)</label>
                <input type="number" step="0.5" value={naTarget} onChange={(e) => setNaTarget(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cairan Koreksi</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setNaFluid("nacl3")} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${naFluid === "nacl3" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>NaCl 3% (513 mEq/L)</button>
                <button type="button" onClick={() => setNaFluid("nacl09")} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${naFluid === "nacl09" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>NaCl 0,9% (154 mEq/L)</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {naValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout label="Defisit Natrium Total" value={Math.round(naDeficit).toString()} unit="mEq" sublabel={`TBW: ${tbw.toFixed(1)} L · ΔNa target: +${deltaRequested.toFixed(1)} mEq/L`} tone="sky" />
                  <MetricReadout
                    label={`Estimasi Volume ${naFluid === "nacl3" ? "NaCl 3%" : "NaCl 0,9%"}`}
                    value={Math.round(litersNeeded * 1000).toLocaleString("id-ID")}
                    unit="mL / 24 jam"
                    sublabel={`Laju rata-rata: ${((litersNeeded * 1000) / 24).toFixed(1)} mL/jam · ΔNa/1L: +${deltaNaPerLiter.toFixed(1)} mEq/L`}
                    tone={deltaRequested > 8 ? "rose" : "emerald"}
                  />
                </div>
                <ClinicalNote
                  level={deltaRequested > 8 ? "critical" : "warning"}
                  title={deltaRequested > 8 ? "PERINGATAN ODS: Target Kenaikan Melebihi 8 mEq/L per 24 Jam!" : "Batas Aman Koreksi Hiponatremia"}
                >
                  {deltaRequested > 8
                    ? `Kenaikan Na sebesar +${deltaRequested.toFixed(1)} mEq/L dalam 24 jam berisiko tinggi memicu Osmotic Demyelination Syndrome (ODS). Batasi koreksi maksimal 6–8 mEq/L dalam 24 jam pertama (atau ≤ 4–6 mEq/L pada risiko tinggi ODS).`
                    : "Pantau Na serum setiap 4–6 jam selama koreksi untuk memastikan laju peningkatan tidak melebihi 8 mEq/L dalam 24 jam."}
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Input Belum Valid">
                Pastikan Na target lebih tinggi dari Na aktual (mis. 120 → 126 mEq/L).
              </ClinicalNote>
            )}
          </div>
        </div>
      )}

      {tab === "hypokalemia" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kalium Aktual (mEq/L)</label>
                <input type="number" step="0.1" value={kCurrent} onChange={(e) => setKCurrent(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kalium Target (mEq/L)</label>
                <input type="number" step="0.1" value={kTarget} onChange={(e) => setKTarget(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
              <input type="number" value={kWeight} onChange={(e) => setKWeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {kValid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label="Estimasi Defisit Kalium Tubuh"
                    value={`~${Math.round(kEstDeficitMeq)}`}
                    unit="mEq"
                    sublabel="Estimasi klinis ~300 mEq per penurunan 1,0 mEq/L"
                    tone={curK < 2.5 ? "rose" : "amber"}
                  />
                  <MetricReadout
                    label="Dosis Koreksi Awal Bertahap"
                    value={`${kInitialReplace}`}
                    unit="mEq KCl"
                    sublabel={`Evaluasi ulang K serum & cek Magnesium (Mg²⁺)`}
                    tone="emerald"
                  />
                </div>
                <ClinicalNote level={curK < 2.5 ? "critical" : "warning"} title="Keamanan Pemberian KCl Intravena (High-Alert)">
                  <strong>JANGAN PERNAH diberikan secara bolus IV langsung!</strong> Vena perifer: konsentrasi maks 40 mEq/L, kecepatan maks <strong>10 mEq/jam</strong>. Vena sentral: kecepatan maks <strong>20 mEq/jam</strong> wajib dengan pemantauan EKG kontinu. Koreksi hipomagnesemia bersamaan bila ada agar koreksi kalium efektif.
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Input Belum Valid">
                Masukkan kadar Kalium aktual (&lt; target) antara 1,5–4,9 mEq/L.
              </ClinicalNote>
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
