import React, { useState, useMemo } from "react";
import { CalculatorShell, MetricReadout, ClinicalNote, FormulaBox } from "./CalculatorShared";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Baby, Heart, Ruler, Brain } from "lucide-react";

// ============================================================================
// 1. KALKULATOR MASA SUBUR WANITA (Siklus Teratur & Ogino-Knaus Tidak Teratur)
// ============================================================================
export function FertilityCalculator() {
  const defaultHpht = () => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split("T")[0];
  };

  const [mode, setMode] = useState<"regular" | "irregular">("regular");
  const [hpht, setHpht] = useState<string>(defaultHpht);
  const [cycleLength, setCycleLength] = useState<string>("28");
  const [periodLength, setPeriodLength] = useState<string>("5");
  const [shortestCycle, setShortestCycle] = useState<string>("26");
  const [longestCycle, setLongestCycle] = useState<string>("32");

  const baseDate = hpht ? new Date(`${hpht}T00:00:00`) : null;
  const validDate = baseDate !== null && !isNaN(baseDate.getTime());

  const cycle = Math.min(45, Math.max(21, parseInt(cycleLength, 10) || 28));
  const periodDays = Math.min(10, Math.max(2, parseInt(periodLength, 10) || 5));
  const shortC = Math.min(40, Math.max(21, parseInt(shortestCycle, 10) || 26));
  const longC = Math.min(50, Math.max(shortC, parseInt(longestCycle, 10) || 32));

  const addDays = (date: Date, days: number) => {
    const res = new Date(date.getTime());
    res.setDate(res.getDate() + days);
    return res;
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const fmtFullDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const result = useMemo(() => {
    if (!validDate || !baseDate) return null;

    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentCycleDay = Math.floor((todayMid.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (mode === "regular") {
      // Luteal phase ~14 days prior to next period
      const ovulationDayIndex = cycle - 14; // 1-based day index (e.g., Day 14 in 28-day cycle -> +13 days from HPHT)
      const ovulationDate = addDays(baseDate, ovulationDayIndex - 1);
      const fertileStart = addDays(ovulationDate, -5);
      const fertileEnd = addDays(ovulationDate, 1);
      const peakStart = addDays(ovulationDate, -2);
      const nextPeriod = addDays(baseDate, cycle);
      const testPackDate = addDays(nextPeriod, 1);

      // 3-cycle projection
      const projections = [0, 1, 2].map((idx) => {
        const start = addDays(baseDate, idx * cycle);
        const ov = addDays(start, ovulationDayIndex - 1);
        return {
          cycleNo: idx + 1,
          periodStart: start,
          fertileStart: addDays(ov, -5),
          fertileEnd: addDays(ov, 1),
          ovulation: ov,
          nextPeriod: addDays(start, cycle),
        };
      });

      const fertileStartDay = Math.max(periodDays + 1, ovulationDayIndex - 5);
      const fertileEndDay = Math.min(cycle, ovulationDayIndex + 1);

      let currentPhase = "Siklus Sebelumnya / Mendatang";
      if (currentCycleDay >= 1 && currentCycleDay <= cycle) {
        if (currentCycleDay <= periodDays) currentPhase = "Fase Menstruasi";
        else if (currentCycleDay >= ovulationDayIndex - 2 && currentCycleDay <= ovulationDayIndex) currentPhase = "Puncak Masa Subur & Ovulasi";
        else if (currentCycleDay >= fertileStartDay && currentCycleDay <= fertileEndDay) currentPhase = "Masa Subur (Fertile Window)";
        else if (currentCycleDay < fertileStartDay) currentPhase = "Fase Folikuler (Pra-Subur)";
        else currentPhase = "Fase Luteal (Pasca-Ovulasi)";
      }

      return {
        mode: "regular" as const,
        ovulationDayIndex,
        ovulationDate,
        fertileStart,
        fertileEnd,
        peakStart,
        nextPeriod,
        testPackDate,
        projections,
        currentCycleDay,
        currentPhase,
        fertileStartDay,
        fertileEndDay,
        totalCycle: cycle,
      };
    } else {
      // Ogino-Knaus Calendar Method for Irregular Cycles
      const firstFertileDay = Math.max(1, shortC - 18);
      const lastFertileDay = Math.max(firstFertileDay, longC - 11);
      const fertileStart = addDays(baseDate, firstFertileDay - 1);
      const fertileEnd = addDays(baseDate, lastFertileDay - 1);
      const ovStart = addDays(baseDate, Math.max(1, shortC - 14) - 1);
      const ovEnd = addDays(baseDate, Math.max(1, longC - 14) - 1);
      const nextPeriodEarly = addDays(baseDate, shortC);
      const nextPeriodLate = addDays(baseDate, longC);
      const testPackDate = addDays(nextPeriodLate, 1);

      let currentPhase = "Di Luar Rentang Siklus Saat Ini";
      if (currentCycleDay >= 1 && currentCycleDay <= longC) {
        if (currentCycleDay <= periodDays) currentPhase = "Fase Menstruasi";
        else if (currentCycleDay >= firstFertileDay && currentCycleDay <= lastFertileDay) currentPhase = "Masa Subur (Ogino-Knaus)";
        else if (currentCycleDay < firstFertileDay) currentPhase = "Fase Pra-Subur";
        else currentPhase = "Fase Luteal / Menjelang Haid";
      }

      return {
        mode: "irregular" as const,
        firstFertileDay,
        lastFertileDay,
        fertileStart,
        fertileEnd,
        ovStart,
        ovEnd,
        nextPeriodEarly,
        nextPeriodLate,
        testPackDate,
        currentCycleDay,
        currentPhase,
        fertileStartDay: firstFertileDay,
        fertileEndDay: lastFertileDay,
        totalCycle: longC,
      };
    }
  }, [validDate, baseDate, mode, cycle, periodDays, shortC, longC]);

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="Kalkulator Masa Subur Wanita &amp; Ovulasi"
      subtitle="Memperkirakan jendela masa subur (fertile window), puncak ovulasi, fase siklus menstruasi, dan jadwal haid berikutnya untuk perencanaan kehamilan maupun edukasi kesehatan reproduksi."
      onReset={() => {
        setMode("regular");
        setHpht(defaultHpht());
        setCycleLength("28");
        setPeriodLength("5");
        setShortestCycle("26");
        setLongestCycle("32");
      }}
      references={[
        "Wilcox AJ, Weinberg CR, Baird DD. Timing of sexual intercourse in relation to ovulation — effects on the probability of conception. N Engl J Med. 1995;333(23):1517-1521.",
        "ASRM Practice Committee. Optimizing natural fertility: a committee opinion. Fertil Steril. 2022;117(1):53-63.",
        "WHO Medical Eligibility Criteria & Metode Kalender Ogino-Knaus untuk siklus menstruasi teratur dan tidak teratur.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pola Siklus Menstruasi</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("regular")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  mode === "regular" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Siklus Teratur
              </button>
              <button
                type="button"
                onClick={() => setMode("irregular")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  mode === "irregular" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Tidak Teratur (Ogino-Knaus)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hari Pertama Haid Terakhir (HPHT)
            </label>
            <input
              type="date"
              value={hpht}
              onChange={(e) => setHpht(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {mode === "regular" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Panjang Siklus (Hari)
                </label>
                <input
                  type="number"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Normal: 21–35 hari</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lama Haid (Hari)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Rata-rata: 3–7 hari</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Siklus Terpendek (Hari)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="40"
                    value={shortestCycle}
                    onChange={(e) => setShortestCycle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Siklus Terpanjang (Hari)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="50"
                    value={longestCycle}
                    onChange={(e) => setLongestCycle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lama Haid (Hari)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          )}

          <FormulaBox
            formula={
              mode === "regular"
                ? "Ovulasi = HPHT + (Siklus − 14) | Masa Subur = Ovulasi − 5 s.d. +1 hari"
                : "Awal Subur = Siklus Terpendek − 18 | Akhir Subur = Siklus Terpanjang − 11"
            }
            details={
              mode === "regular"
                ? `Fase luteal fisiologis berlangsung ±14 hari sebelum haid berikutnya.`
                : `Metode Ogino-Knaus berdasarkan catatan minimal 6 siklus menstruasi terakhir.`
            }
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Primary Fertile Window Highlight */}
              <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/90 to-rose-50/50 p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-600" />
                    Rentang Masa Subur (Fertile Window)
                  </span>
                  {result.currentCycleDay >= 1 && result.currentCycleDay <= result.totalCycle && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-pink-200 text-[11px] font-bold text-pink-700">
                      Hari ke-{result.currentCycleDay} · {result.currentPhase}
                    </span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {fmtDate(result.fertileStart)} — {fmtDate(result.fertileEnd)}
                </div>
                <p className="text-xs text-pink-900/80">
                  {result.mode === "regular"
                    ? `Hari ke-${result.fertileStartDay} hingga Hari ke-${result.fertileEndDay} siklus. Peluang pembuahan tertinggi pada ${fmtDate(result.peakStart)} – ${fmtDate(result.ovulationDate)} (2 hari pra-ovulasi hingga hari ovulasi).`
                    : `Hari ke-${result.firstFertileDay} hingga Hari ke-${result.lastFertileDay} siklus (metode kalender Ogino-Knaus untuk variasi siklus ${shortC}–${longC} hari).`}
                </p>
              </div>

              {/* Key Date Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricReadout
                  label="Perkiraan Ovulasi"
                  value={
                    result.mode === "regular"
                      ? fmtDate(result.ovulationDate)
                      : `${fmtDate(result.ovStart).split(" ").slice(0, 2).join(" ")}–${fmtDate(result.ovEnd).split(" ").slice(0, 2).join(" ")}`
                  }
                  sublabel={
                    result.mode === "regular"
                      ? `Hari ke-${result.ovulationDayIndex} siklus`
                      : `Hari ke-${shortC - 14} s.d. ke-${longC - 14}`
                  }
                  tone="rose"
                />
                <MetricReadout
                  label="Perkiraan Haid Berikutnya"
                  value={
                    result.mode === "regular"
                      ? fmtDate(result.nextPeriod)
                      : `${fmtDate(result.nextPeriodEarly).split(" ").slice(0, 2).join(" ")}–${fmtDate(result.nextPeriodLate).split(" ").slice(0, 2).join(" ")}`
                  }
                  sublabel={result.mode === "regular" ? `Siklus ${cycle} hari` : `Rentang ${shortC}–${longC} hari`}
                  tone="sky"
                />
                <MetricReadout
                  label="Jadwal Test Pack Akurat"
                  value={fmtDate(result.testPackDate)}
                  sublabel="1 hari setelah telat haid"
                  tone="emerald"
                />
              </div>

              {/* Visual Cycle Phase Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Peta Fase Siklus Menstruasi (Hari 1 – {result.totalCycle})</span>
                  <span className="text-[11px] font-mono text-slate-500">HPHT: {fmtFullDate(baseDate!)}</span>
                </div>
                <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-200">
                  <div
                    className="bg-rose-400"
                    style={{ width: `${(periodDays / result.totalCycle) * 100}%` }}
                    title={`Menstruasi: Hari 1–${periodDays}`}
                  />
                  <div
                    className="bg-slate-300"
                    style={{
                      width: `${(Math.max(0, result.fertileStartDay - 1 - periodDays) / result.totalCycle) * 100}%`,
                    }}
                    title="Fase Folikuler"
                  />
                  <div
                    className="bg-emerald-500"
                    style={{
                      width: `${((result.fertileEndDay - result.fertileStartDay + 1) / result.totalCycle) * 100}%`,
                    }}
                    title={`Masa Subur: Hari ${result.fertileStartDay}–${result.fertileEndDay}`}
                  />
                  <div
                    className="bg-sky-300 flex-1"
                    title="Fase Luteal"
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Haid (Hr 1–{periodDays})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Masa Subur (Hr {result.fertileStartDay}–{result.fertileEndDay})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-300" /> Fase Luteal (Hr {Math.min(result.totalCycle, result.fertileEndDay + 1)}–{result.totalCycle})
                  </span>
                </div>
              </div>

              {/* 3-Cycle Projection Table (for Regular Mode) */}
              {result.mode === "regular" && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700">
                    Proyeksi Masa Subur 3 Siklus ke Depan
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/70 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Siklus</th>
                          <th className="py-2 px-3">Mulai Haid</th>
                          <th className="py-2 px-3">Masa Subur</th>
                          <th className="py-2 px-3">Ovulasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.projections.map((p) => (
                          <tr key={p.cycleNo} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-700">Siklus {p.cycleNo}</td>
                            <td className="py-2 px-3 text-slate-600">{fmtDate(p.periodStart)}</td>
                            <td className="py-2 px-3 font-semibold text-emerald-700">
                              {fmtDate(p.fertileStart)} – {fmtDate(p.fertileEnd)}
                            </td>
                            <td className="py-2 px-3 font-bold text-pink-700">{fmtDate(p.ovulation)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <ClinicalNote level="info" title="Catatan Klinis &amp; Tanda Ovulasi">
                Untuk akurasi lebih tinggi, kombinasikan perhitungan kalender dengan pemantauan <strong>lendir serviks bening elastis (seperti putih telur)</strong>, <strong>suhu basal tubuh (BBT)</strong>, atau alat uji lonjakan hormon LH (<em>ovulation predictor kit</em>). Bila digunakan untuk menunda kehamilan, metode kalender memiliki tingkat kegagalan lebih tinggi dibanding kontrasepsi modern.
              </ClinicalNote>
            </>
          ) : (
            <ClinicalNote level="warning" title="Pilih Tanggal HPHT">
              Masukkan tanggal Hari Pertama Haid Terakhir (HPHT) yang valid untuk menghitung masa subur.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 2. KALKULATOR PERTUMBUHAN FISIK (ANTROPOMETRI & GIZI KOMPREHENSIF)
// ============================================================================
interface LmsRow {
  x: number;
  L: number;
  M: number;
  S: number;
}

// WHO 2006 Head Circumference-for-Age (cm) 0-60 months
const WHO_HC_BOYS: LmsRow[] = [
  { x: 0, L: 1, M: 34.4618, S: 0.03686 },
  { x: 3, L: 1, M: 40.5135, S: 0.03062 },
  { x: 6, L: 1, M: 43.3306, S: 0.02944 },
  { x: 9, L: 1, M: 44.9898, S: 0.02902 },
  { x: 12, L: 1, M: 46.0689, S: 0.02892 },
  { x: 18, L: 1, M: 47.4192, S: 0.02898 },
  { x: 24, L: 1, M: 48.2703, S: 0.02916 },
  { x: 36, L: 1, M: 49.477, S: 0.02956 },
  { x: 48, L: 1, M: 50.2512, S: 0.02987 },
  { x: 60, L: 1, M: 50.742, S: 0.0301 },
];

const WHO_HC_GIRLS: LmsRow[] = [
  { x: 0, L: 1, M: 33.8787, S: 0.03496 },
  { x: 3, L: 1, M: 39.5328, S: 0.03152 },
  { x: 6, L: 1, M: 42.1995, S: 0.03076 },
  { x: 9, L: 1, M: 43.8292, S: 0.03037 },
  { x: 12, L: 1, M: 44.8986, S: 0.03015 },
  { x: 18, L: 1, M: 46.2389, S: 0.02994 },
  { x: 24, L: 1, M: 47.1779, S: 0.02985 },
  { x: 36, L: 1, M: 48.5138, S: 0.02982 },
  { x: 48, L: 1, M: 49.342, S: 0.02987 },
  { x: 60, L: 1, M: 49.895, S: 0.02994 },
];

// WHO 2006 BMI-for-Age (kg/m²) 0-60 months
const WHO_BAZ_BOYS_0_60: LmsRow[] = [
  { x: 0, L: -0.0631, M: 13.4069, S: 0.09559 },
  { x: 3, L: 0.0566, M: 16.8891, S: 0.08469 },
  { x: 6, L: 0.0757, M: 17.3357, S: 0.08152 },
  { x: 12, L: -0.0756, M: 16.7745, S: 0.08065 },
  { x: 18, L: -0.221, M: 16.1223, S: 0.08109 },
  { x: 24, L: -0.3511, M: 15.7366, S: 0.08176 },
  { x: 36, L: -0.5427, M: 15.5652, S: 0.08294 },
  { x: 48, L: -0.6844, M: 15.323, S: 0.08427 },
  { x: 60, L: -0.788, M: 15.206, S: 0.0859 },
];

const WHO_BAZ_GIRLS_0_60: LmsRow[] = [
  { x: 0, L: -0.0631, M: 13.3363, S: 0.09259 },
  { x: 3, L: -0.107, M: 16.3511, S: 0.08677 },
  { x: 6, L: -0.1745, M: 16.8669, S: 0.08537 },
  { x: 12, L: -0.3212, M: 16.3551, S: 0.08519 },
  { x: 18, L: -0.453, M: 15.744, S: 0.0862 },
  { x: 24, L: -0.562, M: 15.426, S: 0.0875 },
  { x: 36, L: -0.701, M: 15.367, S: 0.0897 },
  { x: 48, L: -0.812, M: 15.263, S: 0.0924 },
  { x: 60, L: -0.892, M: 15.249, S: 0.0956 },
];

// WHO 2007 BMI-for-Age 5-18 years (x = age in years)
const WHO_BAZ_BOYS_5_18: LmsRow[] = [
  { x: 5, L: -0.7387, M: 15.2641, S: 0.0839 },
  { x: 7, L: -0.96, M: 15.51, S: 0.0908 },
  { x: 9, L: -1.16, M: 16.05, S: 0.1004 },
  { x: 11, L: -1.24, M: 16.92, S: 0.1098 },
  { x: 13, L: -1.19, M: 18.16, S: 0.1157 },
  { x: 15, L: -1.03, M: 19.75, S: 0.1173 },
  { x: 17, L: -0.86, M: 21.13, S: 0.1165 },
  { x: 18, L: -0.78, M: 21.74, S: 0.1162 },
];

const WHO_BAZ_GIRLS_5_18: LmsRow[] = [
  { x: 5, L: -0.8886, M: 15.2441, S: 0.0969 },
  { x: 7, L: -0.96, M: 15.42, S: 0.1055 },
  { x: 9, L: -1.02, M: 16.08, S: 0.1162 },
  { x: 11, L: -1.03, M: 17.24, S: 0.1243 },
  { x: 13, L: -0.96, M: 18.76, S: 0.1277 },
  { x: 15, L: -0.84, M: 20.22, S: 0.1271 },
  { x: 17, L: -0.73, M: 21.09, S: 0.1257 },
  { x: 18, L: -0.68, M: 21.31, S: 0.1253 },
];

// WHO 2007 Height-for-Age 5-18 years (x = age in years, M in cm)
const WHO_HAZ_BOYS_5_18: LmsRow[] = [
  { x: 5, L: 1, M: 110.0, S: 0.0429 },
  { x: 7, L: 1, M: 121.7, S: 0.0445 },
  { x: 9, L: 1, M: 132.6, S: 0.0462 },
  { x: 11, L: 1, M: 143.1, S: 0.0478 },
  { x: 13, L: 1, M: 156.0, S: 0.0488 },
  { x: 15, L: 1, M: 169.0, S: 0.0454 },
  { x: 17, L: 1, M: 175.2, S: 0.0428 },
  { x: 18, L: 1, M: 176.1, S: 0.0424 },
];

const WHO_HAZ_GIRLS_5_18: LmsRow[] = [
  { x: 5, L: 1, M: 109.4, S: 0.0445 },
  { x: 7, L: 1, M: 120.8, S: 0.0457 },
  { x: 9, L: 1, M: 132.5, S: 0.0469 },
  { x: 11, L: 1, M: 145.0, S: 0.0467 },
  { x: 13, L: 1, M: 156.4, S: 0.0439 },
  { x: 15, L: 1, M: 161.7, S: 0.0418 },
  { x: 17, L: 1, M: 162.9, S: 0.0413 },
  { x: 18, L: 1, M: 163.1, S: 0.0412 },
];

function interpLmsRow(table: LmsRow[], xVal: number): LmsRow {
  if (xVal <= table[0].x) return table[0];
  if (xVal >= table[table.length - 1].x) return table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (xVal >= a.x && xVal <= b.x) {
      const t = (xVal - a.x) / (b.x - a.x);
      return {
        x: xVal,
        L: a.L + (b.L - a.L) * t,
        M: a.M + (b.M - a.M) * t,
        S: a.S + (b.S - a.S) * t,
      };
    }
  }
  return table[table.length - 1];
}

function calcLmsZ(value: number, lms: LmsRow): number {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0 || S <= 0) return 0;
  return L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
}

export function PhysicalGrowthAnthropometryCalculator() {
  const [groupTab, setGroupTab] = useState<"toddler" | "school" | "adult">("toddler");

  // Tab 1: Balita 0-60 bulan
  const [tGender, setTGender] = useState<"male" | "female">("male");
  const [tAgeMonths, setTAgeMonths] = useState("18");
  const [tWeight, setTWeight] = useState("10.8");
  const [tHeight, setTHeight] = useState("81.5");
  const [tHeadCirc, setTHeadCirc] = useState("47.2");
  const [tMuac, setTMuac] = useState("14.2");
  const [fatherHeight, setFatherHeight] = useState("170");
  const [motherHeight, setMotherHeight] = useState("158");

  // Tab 2: Anak/Remaja 5-18 tahun
  const [sGender, setSGender] = useState<"male" | "female">("male");
  const [sAgeYears, setSAgeYears] = useState("10");
  const [sWeight, setSWeight] = useState("31");
  const [sHeight, setSHeight] = useState("138");

  // Tab 3: Dewasa & Ibu Hamil (Antropometri Gizi)
  const [aGender, setAGender] = useState<"male" | "female">("female");
  const [aWeight, setAWeight] = useState("58");
  const [aHeight, setAHeight] = useState("158");
  const [aWaist, setAWaist] = useState("76");
  const [aHip, setAHip] = useState("94");
  const [aMuac, setAMuac] = useState("25.5");

  // Calculations Tab 1 (Toddler)
  const toddlerEval = useMemo(() => {
    const age = parseFloat(tAgeMonths);
    const w = parseFloat(tWeight);
    const h = parseFloat(tHeight);
    const hc = parseFloat(tHeadCirc);
    const muac = parseFloat(tMuac);
    const fh = parseFloat(fatherHeight);
    const mh = parseFloat(motherHeight);

    const validBase = !isNaN(age) && age >= 0 && age <= 60 && !isNaN(w) && w > 0.5 && !isNaN(h) && h >= 40;
    if (!validBase) return null;

    const bmi = w / Math.pow(h / 100, 2);
    const bazLms = interpLmsRow(tGender === "male" ? WHO_BAZ_BOYS_0_60 : WHO_BAZ_GIRLS_0_60, age);
    const baz = calcLmsZ(bmi, bazLms);

    const bazStatus =
      baz < -3 ? { text: "Gizi Buruk (Severely Wasted)", tone: "rose" as const } :
      baz < -2 ? { text: "Gizi Kurang (Wasted)", tone: "amber" as const } :
      baz <= 1 ? { text: "Gizi Baik (Normal)", tone: "emerald" as const } :
      baz <= 2 ? { text: "Berisiko Gizi Lebih", tone: "sky" as const } :
      baz <= 3 ? { text: "Gizi Lebih (Overweight)", tone: "amber" as const } :
      { text: "Obesitas", tone: "rose" as const };

    let hcZ: number | null = null;
    let hcStatus: { text: string; tone: "emerald" | "amber" | "rose" } | null = null;
    if (!isNaN(hc) && hc >= 25 && hc <= 62) {
      const hcLms = interpLmsRow(tGender === "male" ? WHO_HC_BOYS : WHO_HC_GIRLS, age);
      hcZ = calcLmsZ(hc, hcLms);
      hcStatus =
        hcZ < -2 ? { text: "Mikrosefali (< -2 SD)", tone: "rose" } :
        hcZ > 2 ? { text: "Makrosefali (> +2 SD)", tone: "rose" } :
        { text: "Lingkar Kepala Normal", tone: "emerald" };
    }

    let muacStatus: { text: string; tone: "emerald" | "amber" | "rose"; note: string } | null = null;
    if (!isNaN(muac) && muac >= 7 && muac <= 25) {
      if (age < 6) {
        muacStatus = { text: "Usia < 6 Bulan (Gunakan BB/PB)", tone: "amber", note: "Ambang batas LILA standar WHO berlaku untuk anak usia 6–59 bulan." };
      } else if (muac < 11.5) {
        muacStatus = { text: "Gizi Buruk Akut (SAM)", tone: "rose", note: "LILA < 11,5 cm — indikasi rujukan tatalaksana gizi buruk segera." };
      } else if (muac < 12.5) {
        muacStatus = { text: "Gizi Kurang Akut (MAM)", tone: "amber", note: "LILA 11,5–12,4 cm — perlukan PMT padat energi-protein & pantau ketat." };
      } else {
        muacStatus = { text: "Status Gizi LILA Normal", tone: "emerald", note: "LILA ≥ 12,5 cm — tidak ada tanda malnutrisi akut." };
      }
    }

    let mph: { target: number; min: number; max: number } | null = null;
    if (!isNaN(fh) && fh >= 120 && !isNaN(mh) && mh >= 120) {
      const target = tGender === "male" ? (mh + 13 + fh) / 2 : (fh - 13 + mh) / 2;
      mph = { target, min: target - 8.5, max: target + 8.5 };
    }

    const expectedWeightGain =
      age <= 3 ? "750 – 900 g/bulan" :
      age <= 6 ? "500 – 600 g/bulan" :
      age <= 12 ? "300 – 400 g/bulan" :
      age <= 24 ? "200 – 250 g/bulan" : "150 – 200 g/bulan (≈ 2 kg/tahun)";

    return { bmi, baz, bazStatus, hcZ, hcStatus, muacStatus, mph, expectedWeightGain };
  }, [tGender, tAgeMonths, tWeight, tHeight, tHeadCirc, tMuac, fatherHeight, motherHeight]);

  // Calculations Tab 2 (School / Adolescent 5-18 yrs)
  const schoolEval = useMemo(() => {
    const age = parseFloat(sAgeYears);
    const w = parseFloat(sWeight);
    const h = parseFloat(sHeight);
    if (isNaN(age) || age < 5 || age > 18 || isNaN(w) || w <= 5 || isNaN(h) || h < 80) return null;

    const bmi = w / Math.pow(h / 100, 2);
    const bazLms = interpLmsRow(sGender === "male" ? WHO_BAZ_BOYS_5_18 : WHO_BAZ_GIRLS_5_18, age);
    const hazLms = interpLmsRow(sGender === "male" ? WHO_HAZ_BOYS_5_18 : WHO_HAZ_GIRLS_5_18, age);
    const baz = calcLmsZ(bmi, bazLms);
    const haz = calcLmsZ(h, hazLms);

    const bazStatus =
      baz < -3 ? { text: "Gizi Buruk / Sangat Kurus", tone: "rose" as const } :
      baz < -2 ? { text: "Gizi Kurang / Kurus", tone: "amber" as const } :
      baz <= 1 ? { text: "Gizi Baik (Normal)", tone: "emerald" as const } :
      baz <= 2 ? { text: "Gizi Lebih (Overweight)", tone: "amber" as const } :
      { text: "Obesitas", tone: "rose" as const };

    const hazStatus =
      haz < -3 ? { text: "Sangat Pendek (Severely Stunted)", tone: "rose" as const } :
      haz < -2 ? { text: "Pendek (Stunted)", tone: "amber" as const } :
      haz <= 3 ? { text: "Tinggi Badan Normal", tone: "emerald" as const } :
      { text: "Tinggi", tone: "sky" as const };

    return { bmi, baz, haz, bazStatus, hazStatus };
  }, [sGender, sAgeYears, sWeight, sHeight]);

  // Calculations Tab 3 (Adult & Maternal)
  const adultEval = useMemo(() => {
    const w = parseFloat(aWeight);
    const h = parseFloat(aHeight);
    const waist = parseFloat(aWaist);
    const hip = parseFloat(aHip);
    const muac = parseFloat(aMuac);
    if (isNaN(w) || w <= 20 || isNaN(h) || h < 100) return null;

    const bmi = w / Math.pow(h / 100, 2);
    const bmiAsia =
      bmi < 18.5 ? { text: "Berat Badan Kurang (Underweight)", tone: "amber" as const } :
      bmi < 23 ? { text: "Normal (Asia-Pasifik)", tone: "emerald" as const } :
      bmi < 25 ? { text: "Berisiko / Overweight", tone: "amber" as const } :
      bmi < 30 ? { text: "Obesitas Tingkat I", tone: "rose" as const } :
      { text: "Obesitas Tingkat II", tone: "rose" as const };

    const whr = !isNaN(waist) && !isNaN(hip) && hip > 0 ? waist / hip : null;
    const whrHigh = whr !== null && (aGender === "male" ? whr >= 0.9 : whr >= 0.85);
    const waistHigh = !isNaN(waist) && (aGender === "male" ? waist >= 90 : waist >= 80);
    const whtr = !isNaN(waist) && h > 0 ? waist / h : null;

    const kekRisk = !isNaN(muac) && muac > 0 && muac < 23.5;

    return { bmi, bmiAsia, whr, whrHigh, waistHigh, whtr, muac: !isNaN(muac) ? muac : null, kekRisk };
  }, [aGender, aWeight, aHeight, aWaist, aHip, aMuac]);

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="Kalkulator Pertumbuhan Fisik (Antropometri &amp; Gizi)"
      subtitle="Evaluasi antropometri fisik menyeluruh mencakup IMT/U, Lingkar Kepala/U, LILA (MUAC), Potensi Tinggi Genetik (MPH), pertumbuhan anak/remaja 5–18 tahun, serta skrining KEK dan obesitas sentral dewasa/ibu hamil."
      onReset={() => {
        setTAgeMonths("18"); setTWeight("10.8"); setTHeight("81.5"); setTHeadCirc("47.2"); setTMuac("14.2");
        setSAgeYears("10"); setSWeight("31"); setSHeight("138");
        setAWeight("58"); setAHeight("158"); setAWaist("76"); setAHip("94"); setAMuac("25.5");
      }}
      references={[
        "Peraturan Menteri Kesehatan RI Nomor 2 Tahun 2020 tentang Standar Antropometri Anak (WHO 2006 & WHO Reference 2007).",
        "Ikatan Dokter Anak Indonesia (IDAI). Rekomendasi Penilaian Pertumbuhan Fisik & Potensi Tinggi Genetik (Mid-Parental Height).",
        "WHO Consultation on Waist Circumference & Waist-Hip Ratio; Kementerian Kesehatan RI Pedoman Penanggulangan KEK (LILA < 23,5 cm).",
      ]}
    >
      {/* Age-Group Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setGroupTab("toddler")}
          className={`flex-1 min-w-[150px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            groupTab === "toddler" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Balita (0–60 Bln · LK, LILA, MPH)
        </button>
        <button
          type="button"
          onClick={() => setGroupTab("school")}
          className={`flex-1 min-w-[150px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            groupTab === "school" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Anak &amp; Remaja (5–18 Tahun)
        </button>
        <button
          type="button"
          onClick={() => setGroupTab("adult")}
          className={`flex-1 min-w-[150px] py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            groupTab === "adult" ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Dewasa &amp; Ibu Hamil (LILA / WHR)
        </button>
      </div>

      {/* TAB 1: TODDLER 0-60 MONTHS */}
      {groupTab === "toddler" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin Anak</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setTGender("male")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${tGender === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Laki-laki</button>
                <button type="button" onClick={() => setTGender("female")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${tGender === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Perempuan</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usia (0–60 Bulan)</label>
                <input type="number" min="0" max="60" value={tAgeMonths} onChange={(e) => setTAgeMonths(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
                <input type="number" step="0.1" value={tWeight} onChange={(e) => setTWeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang / Tinggi (cm)</label>
                <input type="number" step="0.1" value={tHeight} onChange={(e) => setTHeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lingkar Kepala (cm)</label>
                <input type="number" step="0.1" value={tHeadCirc} onChange={(e) => setTHeadCirc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LILA / Lingkar Lengan Atas (cm)</label>
              <input type="number" step="0.1" value={tMuac} onChange={(e) => setTMuac(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 mb-2">Tinggi Orang Tua (Untuk Potensi Tinggi Genetik / MPH)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">TB Ayah (cm)</label>
                  <input type="number" value={fatherHeight} onChange={(e) => setFatherHeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">TB Ibu (cm)</label>
                  <input type="number" value={motherHeight} onChange={(e) => setMotherHeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {toddlerEval ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <MetricReadout
                    label="IMT / Umur (BAZ WHO)"
                    value={`${toddlerEval.baz >= 0 ? "+" : ""}${toddlerEval.baz.toFixed(2)} SD`}
                    sublabel={`IMT ${toddlerEval.bmi.toFixed(1)} kg/m² · ${toddlerEval.bazStatus.text}`}
                    tone={toddlerEval.bazStatus.tone}
                  />
                  {toddlerEval.hcZ !== null && toddlerEval.hcStatus && (
                    <MetricReadout
                      label="Lingkar Kepala / Umur (LK/U)"
                      value={`${toddlerEval.hcZ >= 0 ? "+" : ""}${toddlerEval.hcZ.toFixed(2)} SD`}
                      sublabel={toddlerEval.hcStatus.text}
                      tone={toddlerEval.hcStatus.tone}
                    />
                  )}
                </div>

                {toddlerEval.muacStatus && (
                  <MetricReadout
                    label="Skrining LILA / MUAC (6–59 Bulan)"
                    value={`${parseFloat(tMuac).toFixed(1)}`}
                    unit="cm"
                    sublabel={`${toddlerEval.muacStatus.text} — ${toddlerEval.muacStatus.note}`}
                    tone={toddlerEval.muacStatus.tone}
                  />
                )}

                {toddlerEval.mph && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-teal-600" />
                        Potensi Tinggi Genetik Dewasa (Mid-Parental Height)
                      </div>
                      <p className="text-[11px] text-teal-900/80 mt-0.5">
                        Estimasi rentang tinggi badan akhir anak saat dewasa (±8,5 cm sesuai panduan IDAI)
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black font-mono text-teal-900">
                        {toddlerEval.mph.target.toFixed(1)} cm
                      </div>
                      <div className="text-[11px] font-mono text-teal-700">
                        Rentang: {toddlerEval.mph.min.toFixed(1)} – {toddlerEval.mph.max.toFixed(1)} cm
                      </div>
                    </div>
                  </div>
                )}

                <ClinicalNote level="info" title="Target Kenaikan Berat Badan Minimal (KBM) Usia Ini">
                  Target pertambahan berat badan fisiologis untuk anak usia {tAgeMonths} bulan adalah sekitar <strong>{toddlerEval.expectedWeightGain}</strong>. Bila grafik berat badan mendatar (<em>weight faltering</em>) 2 bulan berturut-turut, segera evaluasi asupan kalori dan infeksi tersembunyi.
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Lengkapi Data Balita">
                Masukkan usia 0–60 bulan, berat badan (&gt;0,5 kg), dan tinggi/panjang badan (≥40 cm).
              </ClinicalNote>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL AGE & ADOLESCENT 5-18 YEARS */}
      {groupTab === "school" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setSGender("male")} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${sGender === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Laki-laki</button>
                <button type="button" onClick={() => setSGender("female")} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${sGender === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Perempuan</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia Anak / Remaja (5 – 18 Tahun)</label>
              <input type="number" min="5" max="18" step="0.5" value={sAgeYears} onChange={(e) => setSAgeYears(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
                <input type="number" step="0.1" value={sWeight} onChange={(e) => setSWeight(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tinggi Badan (cm)</label>
                <input type="number" step="0.5" value={sHeight} onChange={(e) => setSHeight(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {schoolEval ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MetricReadout
                    label="IMT / Umur (WHO 2007 · 5–18 Th)"
                    value={`${schoolEval.baz >= 0 ? "+" : ""}${schoolEval.baz.toFixed(2)} SD`}
                    sublabel={`IMT ${schoolEval.bmi.toFixed(1)} kg/m² · ${schoolEval.bazStatus.text}`}
                    tone={schoolEval.bazStatus.tone}
                  />
                  <MetricReadout
                    label="Tinggi Badan / Umur (TB/U)"
                    value={`${schoolEval.haz >= 0 ? "+" : ""}${schoolEval.haz.toFixed(2)} SD`}
                    sublabel={schoolEval.hazStatus.text}
                    tone={schoolEval.hazStatus.tone}
                  />
                </div>
                <ClinicalNote level="info" title="Standar Antropometri Usia 5–18 Tahun (Permenkes No. 2/2020)">
                  Penilaian status gizi anak usia sekolah dan remaja menggunakan indeks <strong>IMT menurut Umur (IMT/U)</strong>, bukan batas IMT dewasa. Nilai Z-Score antara −2 SD hingga +1 SD menunjukkan status gizi baik (normal).
                </ClinicalNote>
              </>
            ) : (
              <ClinicalNote level="warning" title="Rentang Input 5–18 Tahun">
                Masukkan usia antara 5 sampai 18 tahun beserta berat dan tinggi badan yang valid.
              </ClinicalNote>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADULT & MATERNAL NUTRITION */}
      {groupTab === "adult" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setAGender("female")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${aGender === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Perempuan / Ibu Hamil</button>
                <button type="button" onClick={() => setAGender("male")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${aGender === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}>Laki-laki</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
                <input type="number" step="0.1" value={aWeight} onChange={(e) => setAWeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                <input type="number" step="0.5" value={aHeight} onChange={(e) => setAHeight(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lingkar Pinggang (cm)</label>
                <input type="number" step="0.5" value={aWaist} onChange={(e) => setAWaist(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lingkar Panggul (cm)</label>
                <input type="number" step="0.5" value={aHip} onChange={(e) => setAHip(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LILA / Lingkar Lengan Atas (cm)</label>
              <input type="number" step="0.1" value={aMuac} onChange={(e) => setAMuac(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none" />
              <p className="text-[10px] text-slate-400 mt-1">Ambang batas KEK (WUS/Ibu Hamil Kemenkes RI): &lt; 23,5 cm</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {adultEval ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <MetricReadout
                    label="IMT (Klasifikasi Asia-Pasifik)"
                    value={adultEval.bmi.toFixed(1)}
                    unit="kg/m²"
                    sublabel={adultEval.bmiAsia.text}
                    tone={adultEval.bmiAsia.tone}
                  />
                  {adultEval.muac !== null && (
                    <MetricReadout
                      label="Skrining KEK via LILA"
                      value={adultEval.muac.toFixed(1)}
                      unit="cm"
                      sublabel={
                        adultEval.kekRisk
                          ? "Berisiko KEK (< 23,5 cm) — Perlu PMT & Evaluasi Gizi"
                          : "Status Gizi LILA Normal (≥ 23,5 cm)"
                      }
                      tone={adultEval.kekRisk ? "rose" : "emerald"}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {adultEval.whr !== null && (
                    <MetricReadout
                      label="Rasio Pinggang-Panggul (WHR)"
                      value={adultEval.whr.toFixed(2)}
                      sublabel={
                        adultEval.whrHigh || adultEval.waistHigh
                          ? `Risiko Obesitas Sentral Meningkat (Batas ${aGender === "male" ? "LP ≥90 cm / WHR ≥0,90" : "LP ≥80 cm / WHR ≥0,85"})`
                          : "Distribusi Lemak Viseral Normal"
                      }
                      tone={adultEval.whrHigh || adultEval.waistHigh ? "amber" : "emerald"}
                    />
                  )}
                  {adultEval.whtr !== null && (
                    <MetricReadout
                      label="Waist-to-Height Ratio (WHtR)"
                      value={adultEval.whtr.toFixed(2)}
                      sublabel={
                        adultEval.whtr >= 0.5
                          ? "≥ 0,50 · Risiko Kardiometabolik Meningkat"
                          : "< 0,50 · Proporsi Lingkar Pinggang Sehat"
                      }
                      tone={adultEval.whtr >= 0.5 ? "amber" : "emerald"}
                    />
                  )}
                </div>

                {adultEval.kekRisk && (
                  <ClinicalNote level="warning" title="Tindak Lanjut Kekurangan Energi Kronis (KEK)">
                    LILA &lt; 23,5 cm pada Wanita Usia Subur (WUS) atau Ibu Hamil menandakan risiko KEK yang meningkatkan risiko Bayi Berat Lahir Rendah (BBLR). Dianjurkan konseling gizi, pemberian makanan tambahan (PMT) tinggi protein-energi, serta suplementasi Tablet Tambah Darah (TTD).
                  </ClinicalNote>
                )}
              </>
            ) : (
              <ClinicalNote level="warning" title="Lengkapi Input Dewasa">
                Masukkan berat badan (&gt;20 kg) dan tinggi badan (≥100 cm).
              </ClinicalNote>
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

// ============================================================================
// 3. ALAT SKRINING PERKEMBANGAN ANAK (MOTORIK, BAHASA, SOSIAL — KPSP / SDIDTK)
// ============================================================================
type DevDomain = "motorik_kasar" | "motorik_halus" | "bahasa" | "sosial";

interface DevMilestoneItem {
  id: string;
  domain: DevDomain;
  question: string;
  stimulation: string;
}

interface DevAgeGroup {
  months: number;
  label: string;
  redFlags: string[];
  items: DevMilestoneItem[];
}

const DOMAIN_META: Record<DevDomain, { label: string; badge: string; bar: string }> = {
  motorik_kasar: { label: "Motorik Kasar", badge: "bg-sky-50 text-sky-700 border-sky-200", bar: "bg-sky-500" },
  motorik_halus: { label: "Motorik Halus", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", bar: "bg-indigo-500" },
  bahasa: { label: "Bicara & Bahasa", badge: "bg-amber-50 text-amber-800 border-amber-200", bar: "bg-amber-500" },
  sosial: { label: "Sosialisasi & Kemandirian", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
};

const KPSP_AGE_GROUPS: DevAgeGroup[] = [
  {
    months: 3,
    label: "3 Bulan",
    redFlags: ["Tidak menatap wajah atau tidak tersenyum sosial", "Tidak bereaksi terhadap suara keras", "Kepala sama sekali tidak terangkat saat tengkurap"],
    items: [
      { id: "3m_1", domain: "motorik_kasar", question: "Pada posisi tengkurap, apakah bayi mampu mengangkat kepala setinggi 45° dan menahannya beberapa detik?", stimulation: "Lakukan tummy time rutin 3–5 menit beberapa kali sehari dengan mainan berwarna cerah di depannya." },
      { id: "3m_2", domain: "motorik_kasar", question: "Apakah bayi menggerakkan kedua lengan dan kedua tungkai secara aktif dan simetris?", stimulation: "Ajak bayi bergerak bebas di atas alas datar dan rangsang dengan mainan gantung." },
      { id: "3m_3", domain: "motorik_halus", question: "Apakah mata bayi mengikuti gerakan benda/mainan dari sisi kiri ke kanan melewati garis tengah?", stimulation: "Gerakkan mainan berwarna kontras perlahan 20–30 cm di depan mata bayi dari kiri ke kanan." },
      { id: "3m_4", domain: "motorik_halus", question: "Apakah bayi mulai membuka telapak tangan (tidak selalu mengepal erat) dan memegang jari saat disentuh?", stimulation: "Letakkan kerincingan ringan di telapak tangan bayi untuk melatih genggaman." },
      { id: "3m_5", domain: "bahasa", question: "Apakah bayi mengeluarkan suara ocehan ringan seperti 'ooo', 'aaa', atau 'guuu' (cooing)?", stimulation: "Sering ajak bayi berbicara dengan intonasi ramah dan tirukan suara ocehannya." },
      { id: "3m_6", domain: "bahasa", question: "Apakah bayi menoleh atau bereaksi ketika mendengar suara lonceng, kerincingan, atau panggilan orang tua?", stimulation: "Bunyikan mainan lembut dari samping kiri dan kanan untuk melatih orientasi pendengaran." },
      { id: "3m_7", domain: "sosial", question: "Apakah bayi membalas senyuman saat diajak bicara atau tersenyum spontan menatap wajah orang tua?", stimulation: "Lakukan kontak mata, senyum, dan ekspresi wajah ceria saat menyusui atau mengganti popok." },
      { id: "3m_8", domain: "sosial", question: "Apakah bayi tampak tenang saat digendong atau diajak bicara oleh pengasuh utama?", stimulation: "Berikan pelukan hangat dan respons cepat saat bayi menangis untuk membangun rasa aman." },
    ],
  },
  {
    months: 6,
    label: "6 Bulan",
    redFlags: ["Belum dapat berguling sama sekali", "Tidak meraih benda di depannya", "Tidak mengeluarkan suara vokal / tertawa", "Tubuh tampak sangat kaku atau sangat lunglai"],
    items: [
      { id: "6m_1", domain: "motorik_kasar", question: "Apakah bayi dapat berbalik/berguling dari posisi telentang ke tengkurap atau sebaliknya?", stimulation: "Letakkan mainan favorit di samping tubuh bayi agar ia berusaha miring dan berguling." },
      { id: "6m_2", domain: "motorik_kasar", question: "Saat didudukkan dengan sedikit sandaran, apakah kepala bayi sudah tegak stabil tanpa terkulai?", stimulation: "Latih posisi duduk bersandar bantal dengan pengawasan dan mainan di depannya." },
      { id: "6m_3", domain: "motorik_halus", question: "Apakah bayi dapat meraih mainan yang diletakkan dalam jangkauannya dan memindahkannya antar tangan?", stimulation: "Berikan mainan balok lunak atau kerincingan bergantian ke tangan kiri dan kanan." },
      { id: "6m_4", domain: "motorik_halus", question: "Apakah bayi mulai mengamati benda kecil (seperti kismis/remah) dan berusaha meraupnya?", stimulation: "Latih koordinasi mata-tangan dengan benda aman berukuran sedang di meja makan bayi." },
      { id: "6m_5", domain: "bahasa", question: "Apakah bayi tertawa keras, memekik gembira, atau mengoceh suku kata seperti 'ba', 'ma', 'da'?", stimulation: "Bacakan buku bergambar singkat dan sebutkan nama benda dengan suara jelas." },
      { id: "6m_6", domain: "bahasa", question: "Apakah bayi segera menoleh ke arah sumber suara ketika dipanggil namanya?", stimulation: "Panggil nama bayi dari berbagai arah dan beri pujian saat ia menoleh." },
      { id: "6m_7", domain: "sosial", question: "Apakah bayi mengenali wajah anggota keluarga terdekat dan mulai antusias bermain cilukba?", stimulation: "Mainkan permainan cilukba dan bercermin bersama bayi." },
      { id: "6m_8", domain: "sosial", question: "Apakah bayi tertarik memasukkan makanan/biskuit lembut ke mulutnya sendiri saat mulai MPASI?", stimulation: "Kenalkan tekstur MPASI bertahap dan biarkan bayi menyentuh sendok/makanan aman." },
    ],
  },
  {
    months: 9,
    label: "9 Bulan",
    redFlags: ["Belum mampu duduk sendiri tanpa penyangga", "Tidak merespons saat dipanggil namanya", "Tidak mengoceh kombinasi konsonan-vokal (babbling)"],
    items: [
      { id: "9m_1", domain: "motorik_kasar", question: "Apakah bayi dapat duduk sendiri dengan tegak tanpa ditopang selama minimal 1 menit?", stimulation: "Latih duduk mandiri di alas empuk sambil bermain menyusun/meraih mainan." },
      { id: "9m_2", domain: "motorik_kasar", question: "Apakah bayi mulai merangkak, mengesot, atau belajar berdiri sambil berpegangan pada perabot?", stimulation: "Letakkan mainan menarik agak jauh untuk memotivasi merangkak dan berpegangan." },
      { id: "9m_3", domain: "motorik_halus", question: "Apakah bayi mampu menjepit benda kecil menggunakan ibu jari dan jari telunjuk (pincer grasp awal)?", stimulation: "Berikan finger food lunak (potongan pisang/wortel kukus) di bawah pengawasan." },
      { id: "9m_4", domain: "motorik_halus", question: "Apakah bayi dapat membenturkan dua kubus/mainan yang dipegang di kedua tangannya?", stimulation: "Contohkan mengetukkan dua mainan kayu/plastik dan ajak bayi menirukan." },
      { id: "9m_5", domain: "bahasa", question: "Apakah bayi mengoceh berulang seperti 'mama-mama', 'baba-baba', atau 'dada-dada'?", stimulation: "Respon setiap celotehan bayi seolah sedang bercakap-cakap dua arah." },
      { id: "9m_6", domain: "bahasa", question: "Apakah bayi mengerti larangan sederhana seperti 'tidak' atau menoleh saat namanya dipanggil?", stimulation: "Gunakan kata pendek konsisten disertai gerakan tangan dan ekspresi wajah." },
      { id: "9m_7", domain: "sosial", question: "Apakah bayi mulai melambaikan tangan ('dadah'), bertepuk tangan, atau mencari mainan yang disembunyikan?", stimulation: "Ajarkan melambaikan tangan saat berpamitan dan sembunyikan mainan di balik kain." },
      { id: "9m_8", domain: "sosial", question: "Apakah bayi menunjukkan rasa malu atau cemas ringan terhadap orang asing (stranger anxiety)?", stimulation: "Kenalkan orang baru secara perlahan sambil tetap mendampingi anak." },
    ],
  },
  {
    months: 12,
    label: "12 Bulan",
    redFlags: ["Belum merangkak atau berdiri berpegangan", "Tidak menunjuk benda yang diinginkan", "Tidak menggunakan gestur (dadah/geleng) atau belum ada kata bermakna"],
    items: [
      { id: "12m_1", domain: "motorik_kasar", question: "Apakah anak mampu berdiri sendiri beberapa detik atau berjalan sambil merambat/dituntun?", stimulation: "Latih berjalan merambat sepanjang sofa aman atau dorong mainan stabil (push walker)." },
      { id: "12m_2", domain: "motorik_kasar", question: "Apakah anak dapat bangkit sendiri dari posisi duduk ke posisi berdiri dengan berpegangan?", stimulation: "Letakkan mainan di atas kursi rendah agar anak termotivasi berdiri meraihnya." },
      { id: "12m_3", domain: "motorik_halus", question: "Apakah anak mampu memasukkan kubus/benda kecil ke dalam wadah atau cangkir?", stimulation: "Ajak bermain memasukkan dan mengeluarkan balok dari kotak terbuka." },
      { id: "12m_4", domain: "motorik_halus", question: "Apakah anak dapat mengambil benda kecil dengan tepat menggunakan ujung ibu jari dan telunjuk?", stimulation: "Latih memindahkan potongan makanan sehat ke mangkuk kecil." },
      { id: "12m_5", domain: "bahasa", question: "Apakah anak dapat mengucapkan minimal 1–2 kata bermakna (misal 'mama', 'papa', 'mamam')?", stimulation: "Sebutkan nama objek sehari-hari berulang kali dan kurangi screen time (0 menit di bawah 18 bln)." },
      { id: "12m_6", domain: "bahasa", question: "Apakah anak menunjuk dengan jari telunjuk untuk meminta sesuatu atau menarik perhatian orang tua?", stimulation: "Tunjuk benda menarik sambil menamainya dan tunggu anak ikut menunjuk." },
      { id: "12m_7", domain: "sosial", question: "Apakah anak mampu minum dari gelas/cangkir dengan bantuan dan menirukan aktivitas sederhana?", stimulation: "Latih minum dari gelas kecil terbuka serta bermain menirukan menyisir rambut." },
      { id: "12m_8", domain: "sosial", question: "Apakah anak mau memberikan mainan saat diminta ('tolong berikan ke ibu')?", stimulation: "Bermain oper-operan bola dan berikan pujian saat anak merespons perintah sederhana." },
    ],
  },
  {
    months: 18,
    label: "18 Bulan",
    redFlags: ["Belum mampu berjalan mandiri", "Belum mengucapkan minimal 6–10 kata bermakna", "Tidak menunjuk untuk menunjukkan minat (joint attention)", "Kehilangan kemampuan bicara/sosial yang pernah dimiliki"],
    items: [
      { id: "18m_1", domain: "motorik_kasar", question: "Apakah anak mampu berjalan sendiri dengan stabil tanpa berpegangan?", stimulation: "Ajak berjalan di berbagai permukaan aman dan bermain menendang bola besar." },
      { id: "18m_2", domain: "motorik_kasar", question: "Apakah anak dapat membungkuk mengambil mainan di lantai lalu berdiri kembali tanpa jatuh?", stimulation: "Bermain memungut bola atau mainan bersama untuk melatih keseimbangan." },
      { id: "18m_3", domain: "motorik_halus", question: "Apakah anak mampu menyusun menara minimal 2–3 kubus tanpa jatuh?", stimulation: "Ajak bermain menumpuk balok kayu besar sambil menghitung bersama." },
      { id: "18m_4", domain: "motorik_halus", question: "Apakah anak dapat mencoret-coret kertas menggunakan krayon besar?", stimulation: "Sediakan kertas lebar dan krayon jumbo non-toksik untuk latihan menggenggam." },
      { id: "18m_5", domain: "bahasa", question: "Apakah anak dapat mengucapkan minimal 6–10 kata tunggal yang jelas dan bermakna?", stimulation: "Bacakan buku bergambar 15 menit setiap hari dan perluas kosakata anak tanpa gadget." },
      { id: "18m_6", domain: "bahasa", question: "Apakah anak dapat menunjuk minimal 1–2 bagian tubuhnya (mata, hidung, mulut) saat ditanya?", stimulation: "Nyanyikan lagu bagian tubuh sambil menunjuk mata, hidung, dan telinga." },
      { id: "18m_7", domain: "sosial", question: "Apakah anak dapat makan menggunakan sendok sendiri (meski masih sedikit tumpah)?", stimulation: "Biarkan anak berlatih menyendok makanan sendiri pada setiap jam makan." },
      { id: "18m_8", domain: "sosial", question: "Apakah anak mulai bermain pura-pura sederhana (misal menyuapi boneka atau menelepon)?", stimulation: "Ajak bermain peran sederhana dengan boneka, sendok mainan, atau mobil-mobilan." },
    ],
  },
  {
    months: 24,
    label: "24 Bulan (2 Th)",
    redFlags: ["Belum bisa menggabungkan 2 kata spontan ('mau minum', 'ibu pulang')", "Belum mampu mengikuti perintah sederhana 1–2 langkah", "Tidak meniru tindakan atau kata orang lain", "Berjalan tidak stabil atau jinjit terus-menerus"],
    items: [
      { id: "24m_1", domain: "motorik_kasar", question: "Apakah anak mampu berlari kecil, naik tangga sambil berpegangan, atau menendang bola ke depan?", stimulation: "Ajak bermain bola di halaman dan latihan naik-turun anak tangga rendah dengan pegangan." },
      { id: "24m_2", domain: "motorik_kasar", question: "Apakah anak dapat berjalan mundur beberapa langkah atau melompat kecil di tempat?", stimulation: "Bermain meniru gerakan binatang (melompat seperti kelinci) bersama anak." },
      { id: "24m_3", domain: "motorik_halus", question: "Apakah anak dapat menyusun menara 4–6 kubus dan membuka halaman buku satu per satu?", stimulation: "Latih menyusun balok, meronce manik besar, dan membalik halaman buku tebal." },
      { id: "24m_4", domain: "motorik_halus", question: "Apakah anak dapat meniru membuat garis lurus vertikal atau melingkar di kertas?", stimulation: "Gambar garis lurus bersama dan ajak anak menirukan bentuk sederhana." },
      { id: "24m_5", domain: "bahasa", question: "Apakah anak sudah menggabungkan minimal 2 kata bermakna secara spontan (misal 'mau susu', 'ayah kerja')?", stimulation: "Perpanjang kalimat anak (jika anak berkata 'bola', balas 'iya, bola biru besar')." },
      { id: "24m_6", domain: "bahasa", question: "Apakah anak memahami perintah 2 langkah sederhana (misal 'ambil bola lalu taruh di kotak')?", stimulation: "Libatkan anak dalam tugas rumah ringan dengan instruksi 2 langkah." },
      { id: "24m_7", domain: "sosial", question: "Apakah anak mulai membantu melepas pakaian sederhana (celana/kaus kaki) dan mencuci tangan?", stimulation: "Ajarkan rutinitas mandi, cuci tangan, dan menyimpan mainan secara mandiri." },
      { id: "24m_8", domain: "sosial", question: "Apakah anak menunjukkan minat bermain di dekat anak sebaya (parallel play) dan meniru perilaku orang dewasa?", stimulation: "Berikan kesempatan berinteraksi di taman bermain bersama teman sebaya." },
    ],
  },
  {
    months: 36,
    label: "36 Bulan (3 Th)",
    redFlags: ["Bicara sangat tidak jelas / sulit dipahami keluarga", "Belum bisa menyusun kalimat 3 kata", "Tidak ada kontak mata atau tidak tertarik bermain dengan anak lain", "Sering jatuh atau kesulitan naik tangga"],
    items: [
      { id: "36m_1", domain: "motorik_kasar", question: "Apakah anak mampu melompat dengan kedua kaki sekaligus dan mengayuh sepeda roda tiga?", stimulation: "Bermain lompat garis di lantai dan bersepeda roda tiga/balance bike." },
      { id: "36m_2", domain: "motorik_kasar", question: "Apakah anak dapat berdiri sejenak di atas 1 kaki (1–2 detik) dan naik tangga bergantian kaki?", stimulation: "Latih permainan keseimbangan seperti meniti garis lurus." },
      { id: "36m_3", domain: "motorik_halus", question: "Apakah anak mampu meniru menggambar lingkaran dan menyusun menara 8 kubus?", stimulation: "Ajak menggambar bentuk lingkaran, bermain plastisin, dan puzzle 4–6 keping." },
      { id: "36m_4", domain: "motorik_halus", question: "Apakah anak dapat memegang pensil/krayon dengan jari (bukan menggenggam penuh telapak)?", stimulation: "Latih menggunting kertas aman (gunting tumpul) dan mewarnai bentuk besar." },
      { id: "36m_5", domain: "bahasa", question: "Apakah anak berbicara dalam kalimat 3–4 kata dan ucapannya ≥75% dipahami orang tua?", stimulation: "Ajak bercerita tentang kegiatan harian dengan pertanyaan terbuka ('apa yang terjadi?')." },
      { id: "36m_6", domain: "bahasa", question: "Apakah anak dapat menyebutkan nama lengkap, usia/jenis kelamin, serta memahami konsep 'di atas/di bawah'?", stimulation: "Mainkan tebak posisi benda ('taruh boneka di atas kursi') dan kenalkan warna dasar." },
      { id: "36m_7", domain: "sosial", question: "Apakah anak mampu bermain bersama anak lain (bergiliran) dan berbagi mainan?", stimulation: "Latih permainan bergiliran (ular tangga sederhana, lempar tangkap bola)." },
      { id: "36m_8", domain: "sosial", question: "Apakah anak mulai terlatih buang air kecil di toilet (toilet training) dan memakai baju sederhana?", stimulation: "Dukung kemandirian ke toilet, memakai celana/sepatu sendiri tanpa tergesa." },
    ],
  },
  {
    months: 48,
    label: "48 Bulan (4 Th)",
    redFlags: ["Tidak dapat melompat di tempat", "Kesulitan mencoret/menggambar atau belum mengenal warna/bentuk", "Bicara masih sulit dipahami orang di luar keluarga", "Menghindari interaksi sosial sepenuhnya"],
    items: [
      { id: "48m_1", domain: "motorik_kasar", question: "Apakah anak dapat berdiri dengan 1 kaki selama 3–5 detik dan melompat dengan 1 kaki (engklek)?", stimulation: "Ajak bermain permainan tradisional engklek dan tangkap bola memantul." },
      { id: "48m_2", domain: "motorik_kasar", question: "Apakah anak mampu menangkap bola berukuran sedang dengan kedua tangan?", stimulation: "Latih lempar tangkap bola dari jarak 1,5–2 meter secara rutin." },
      { id: "48m_3", domain: "motorik_halus", question: "Apakah anak dapat meniru menggambar tanda tambah (+) atau gambar orang minimal 3 bagian tubuh?", stimulation: "Ajak menggambar keluarga dan berlatih menggunting mengikuti garis lurus." },
      { id: "48m_4", domain: "motorik_halus", question: "Apakah anak mampu memasang kancing besar atau merangkai manik-manik dengan rapi?", stimulation: "Latih mengancing baju sendiri dan bermain lego/balok konstruksi." },
      { id: "48m_5", domain: "bahasa", question: "Apakah anak dapat bercerita singkat tentang pengalaman sehari-hari dan menjawab pertanyaan 'mengapa'?", stimulation: "Diskusikan isi buku cerita dan minta anak menceritakan kembali dengan bahasanya." },
      { id: "48m_6", domain: "bahasa", question: "Apakah anak mengenal minimal 4 warna dasar dan mampu berhitung benda 1 sampai 5?", stimulation: "Hitung buah, mainan, atau anak tangga sambil mengelompokkan berdasarkan warna." },
      { id: "48m_7", domain: "sosial", question: "Apakah anak dapat mengikuti aturan permainan kelompok dan menunjukkan empati saat teman sedih?", stimulation: "Bermain peran (dokter-pasien, pasar-pasaran) dan diskusikan perasaan tokoh cerita." },
      { id: "48m_8", domain: "sosial", question: "Apakah anak dapat menggosok gigi dan berpakaian sendiri dengan sedikit bantuan?", stimulation: "Buat jadwal visual rutinitas pagi dan malam agar anak bangga mandiri." },
    ],
  },
  {
    months: 60,
    label: "60 Bulan (5 Th)",
    redFlags: ["Tidak mampu bercerita runtut atau bicara tidak jelas", "Belum bisa melompat 1 kaki atau menggunting/menggambar bentuk sederhana", "Sangat sulit berkonsentrasi (>5 menit) atau tidak mau bermain kooperatif"],
    items: [
      { id: "60m_1", domain: "motorik_kasar", question: "Apakah anak mampu berdiri di atas 1 kaki selama ≥6 detik dan melompat-lompat bergantian kaki?", stimulation: "Ajak olahraga ringan, lompat tali rendah, dan berjalan meniti papan keseimbangan." },
      { id: "60m_2", domain: "motorik_kasar", question: "Apakah anak dapat berjalan maju dengan tumit menyentuh ujung jari kaki (tandem walk)?", stimulation: "Latih permainan keseimbangan dan koordinasi gerak berirama." },
      { id: "60m_3", domain: "motorik_halus", question: "Apakah anak mampu meniru menggambar segi empat/segitiga dan menggambar orang ≥6 bagian tubuh?", stimulation: "Latih menebalkan huruf/angka dasar, menggambar pemandangan, dan origami sederhana." },
      { id: "60m_4", domain: "motorik_halus", question: "Apakah anak dapat menggunting mengikuti garis dan menulis namanya sendiri (huruf besar)?", stimulation: "Buat proyek prakarya gunting-tempel dan kenalkan huruf penyusun namanya." },
      { id: "60m_5", domain: "bahasa", question: "Apakah anak dapat berbicara lancar menggunakan kalimat lengkap, memahami lawan kata, dan dipahami semua orang?", stimulation: "Bermain tebak lawan kata (besar-kecil, panas-dingin) dan membaca buku cerita bersama." },
      { id: "60m_6", domain: "bahasa", question: "Apakah anak mampu mengikuti perintah 3 langkah berurutan tanpa diulang?", stimulation: "Berikan instruksi beruntun saat membantu merapikan kamar atau menyiapkan meja." },
      { id: "60m_7", domain: "sosial", question: "Apakah anak mampu bermain kooperatif mematuhi aturan bersama dan mengendalikan emosi dasar?", stimulation: "Ajak bermain board game edukatif dan latih menyampaikan perasaan dengan kata-kata." },
      { id: "60m_8", domain: "sosial", question: "Apakah anak mandiri dalam berpakaian, makan rapi, dan buang air di toilet tanpa bantuan?", stimulation: "Berikan tanggung jawab harian kecil (merapikan sepatu, menyiapkan tas sekolah)." },
    ],
  },
];

export function DevelopmentalScreeningCalculator() {
  const [selectedMonths, setSelectedMonths] = useState<number>(24);
  const [exactAgeInput, setExactAgeInput] = useState<string>("24");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const activeGroup = useMemo(
    () => KPSP_AGE_GROUPS.find((g) => g.months === selectedMonths) || KPSP_AGE_GROUPS[5],
    [selectedMonths]
  );

  // Auto-select closest KPSP age bracket when user enters exact age in months
  const handleExactAgeChange = (val: string) => {
    setExactAgeInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 1 && num <= 72) {
      let closest = KPSP_AGE_GROUPS[0];
      let minDiff = Math.abs(num - closest.months);
      for (const g of KPSP_AGE_GROUPS) {
        const diff = Math.abs(num - g.months);
        if (diff < minDiff) {
          minDiff = diff;
          closest = g;
        }
      }
      if (closest.months !== selectedMonths) {
        setSelectedMonths(closest.months);
      }
    }
  };

  const setAnswer = (id: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const markAllYes = () => {
    const next: Record<string, boolean> = { ...answers };
    activeGroup.items.forEach((item) => {
      next[item.id] = true;
    });
    setAnswers(next);
  };

  const clearCurrentGroup = () => {
    const next: Record<string, boolean> = { ...answers };
    activeGroup.items.forEach((item) => {
      delete next[item.id];
    });
    setAnswers(next);
  };

  const evaluation = useMemo(() => {
    const totalItems = activeGroup.items.length;
    let answeredCount = 0;
    let yesCount = 0;

    const domainStats: Record<DevDomain, { total: number; yes: number; answered: number }> = {
      motorik_kasar: { total: 0, yes: 0, answered: 0 },
      motorik_halus: { total: 0, yes: 0, answered: 0 },
      bahasa: { total: 0, yes: 0, answered: 0 },
      sosial: { total: 0, yes: 0, answered: 0 },
    };

    const missedItems: DevMilestoneItem[] = [];

    activeGroup.items.forEach((item) => {
      domainStats[item.domain].total++;
      const ans = answers[item.id];
      if (ans !== undefined) {
        answeredCount++;
        domainStats[item.domain].answered++;
        if (ans) {
          yesCount++;
          domainStats[item.domain].yes++;
        } else {
          missedItems.push(item);
        }
      }
    });

    const pct = totalItems > 0 ? Math.round((yesCount / totalItems) * 100) : 0;

    let interpretation: {
      code: "S" | "M" | "P";
      label: string;
      tone: "emerald" | "amber" | "rose";
      action: string;
    };

    if (pct >= 88) {
      interpretation = {
        code: "S",
        label: "Sesuai Tahap Umur (S)",
        tone: "emerald",
        action:
          "Perkembangan anak sesuai dengan usianya. Puji orang tua/pengasuh, lanjutkan pola asuh dan stimulasi sesuai umur, serta lakukan skrining ulang rutin pada kunjungan SDIDTK berikutnya.",
      };
    } else if (pct >= 63) {
      interpretation = {
        code: "M",
        label: "Meragukan (M)",
        tone: "amber",
        action:
          "Perkembangan anak meragukan pada sebagian domain. Berikan stimulasi terarah setiap hari selama 2 minggu terutama pada item yang belum tercapai, lalu evaluasi ulang KPSP. Bila tetap meragukan, rujuk ke dokter spesialis anak.",
      };
    } else {
      interpretation = {
        code: "P",
        label: "Kemungkinan Penyimpangan (P)",
        tone: "rose",
        action:
          "Terdapat indikasi penyimpangan perkembangan. Segera rujuk anak ke fasilitas pelayanan kesehatan rujukan / Dokter Spesialis Anak (Sp.A) Tumbuh Kembang untuk pemeriksaan diagnostik dan intervensi dini.",
      };
    }

    return { totalItems, answeredCount, yesCount, pct, domainStats, missedItems, interpretation };
  }, [activeGroup, answers]);

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="Alat Skrining Perkembangan Anak (Motorik, Bahasa &amp; Sosial)"
      subtitle="Skrining cepat tumbuh kembang anak usia 3–60 bulan mencakup 4 domain utama (Motorik Kasar, Motorik Halus, Bicara &amp; Bahasa, serta Sosialisasi &amp; Kemandirian) mengacu pada Pedoman SDIDTK / KPSP Kemenkes RI dan Denver II."
      onReset={clearCurrentGroup}
      references={[
        "Kementerian Kesehatan RI. Pedoman Pelaksanaan Stimulasi, Deteksi dan Intervensi Dini Tumbuh Kembang (SDIDTK) Anak di Tingkat Pelayanan Kesehatan Dasar (KPSP).",
        "Ikatan Dokter Anak Indonesia (IDAI). Rekomendasi Skrining Perkembangan Anak & Tanda Bahaya (Red Flags) Tumbuh Kembang.",
        "CDC 'Learn the Signs. Act Early.' Developmental Milestones (2022) & Denver Developmental Screening Test II.",
      ]}
    >
      {/* Age Selection Bar */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Usia Anak (Bulan):</label>
            <input
              type="number"
              min="1"
              max="72"
              value={exactAgeInput}
              onChange={(e) => handleExactAgeChange(e.target.value)}
              className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <span className="text-[11px] text-slate-500">
              → Paket skrining terdekat: <strong className="text-teal-700">{activeGroup.label}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllYes}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              Tandai Semua &ldquo;Ya&rdquo;
            </button>
            <button
              type="button"
              onClick={clearCurrentGroup}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors"
            >
              Bersihkan
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {KPSP_AGE_GROUPS.map((g) => (
            <button
              key={g.months}
              type="button"
              onClick={() => {
                setSelectedMonths(g.months);
                setExactAgeInput(String(g.months));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedMonths === g.months
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-800"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Checklist Questions */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-600" />
              Daftar Cek Milestone Usia {activeGroup.label} ({evaluation.answeredCount}/{evaluation.totalItems} dijawab)
            </h4>
          </div>

          <div className="space-y-2.5">
            {activeGroup.items.map((item, idx) => {
              const val = answers[item.id];
              const meta = DOMAIN_META[item.domain];
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    val === true
                      ? "bg-emerald-50/40 border-emerald-200"
                      : val === false
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {item.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAnswer(item.id, true)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          val === true
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswer(item.id, false)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          val === false
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-rose-400 hover:text-rose-700"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tidak
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Domain Breakdown, Score, Red Flags & Targeted Stimulation */}
        <div className="lg:col-span-5 space-y-4">
          {evaluation.answeredCount === 0 ? (
            <ClinicalNote level="info" title="Mulai Penilaian Skrining">
              Jawab setiap pertanyaan <strong>Ya</strong> (anak sudah mampu melakukan) atau <strong>Tidak</strong> (belum mampu) untuk memperoleh skor total, profil 4 domain perkembangan, dan rekomendasi stimulasi personal.
            </ClinicalNote>
          ) : (
            <>
              <MetricReadout
                label={`Hasil Skrining KPSP (${activeGroup.label})`}
                value={`${evaluation.yesCount} / ${evaluation.totalItems}`}
                unit={`(${evaluation.pct}%)`}
                sublabel={evaluation.interpretation.label}
                tone={evaluation.interpretation.tone}
              />

              <ClinicalNote
                level={
                  evaluation.interpretation.code === "S"
                    ? "success"
                    : evaluation.interpretation.code === "M"
                    ? "warning"
                    : "critical"
                }
                title={`Rekomendasi Tindak Lanjut (${evaluation.interpretation.label})`}
              >
                {evaluation.interpretation.action}
                {evaluation.answeredCount < evaluation.totalItems && (
                  <p className="mt-1.5 font-semibold">
                    Catatan: Masih ada {evaluation.totalItems - evaluation.answeredCount} item belum dijawab. Lengkapi seluruh item untuk hasil akurat.
                  </p>
                )}
              </ClinicalNote>
            </>
          )}

          {/* 4-Domain Progress Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-teal-600" />
              Profil Pencapaian 4 Domain Perkembangan
            </h4>
            {(Object.keys(DOMAIN_META) as DevDomain[]).map((domKey) => {
              const st = evaluation.domainStats[domKey];
              const meta = DOMAIN_META[domKey];
              const domPct = st.total > 0 ? Math.round((st.yes / st.total) * 100) : 0;
              return (
                <div key={domKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{meta.label}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {st.yes}/{st.total} ({domPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bar} transition-all duration-300`}
                      style={{ width: `${domPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Targeted Stimulation Suggestions for any 'Tidak' answers */}
          {evaluation.missedItems.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Saran Stimulasi Terarah ({evaluation.missedItems.length} Area Prioritas)
              </h4>
              <ul className="space-y-2 text-xs text-amber-950">
                {evaluation.missedItems.map((m) => (
                  <li key={m.id} className="bg-white/80 rounded-lg p-2.5 border border-amber-200/70">
                    <span className="font-bold text-amber-800 block text-[11px] mb-0.5">
                      {DOMAIN_META[m.domain].label}
                    </span>
                    {m.stimulation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Age-Specific Red Flags */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
            <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Tanda Bahaya (Red Flags) Usia {activeGroup.label}
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-xs text-rose-950">
              {activeGroup.redFlags.map((rf, i) => (
                <li key={i}>{rf}</li>
              ))}
            </ul>
            <p className="text-[11px] text-rose-800 pt-1">
              Bila ditemukan salah satu tanda bahaya di atas, segera konsultasikan ke dokter anak tanpa menunggu jadwal skrining berikutnya.
            </p>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
