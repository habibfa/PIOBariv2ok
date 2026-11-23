import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  RotateCcw,
  Activity,
  ShieldCheck,
} from "lucide-react";

export interface HealthStatusTrendPoint {
  id: string;
  period: string;
  cbr: number;
  cdr: number;
  rni: number;
  imr: number;
  mmr: number;
  irDbd: number;
  cfrDbd: number;
  irTb: number;
  gfr: number;
  propWus: number;
  isLive?: boolean;
}

export interface HealthStatusChartsProps {
  regionName: string;
  reportPeriod: string;
  compactMode?: boolean;
  coreValues: {
    jumlahPenduduk: number;
    perempuanWUS: number;
    cbr: number;
    cdr: number;
    rni: number;
    imr: number;
    mmr: number;
    irDbd: number;
    cfrDbd: number;
    irTb: number;
    gfr: number;
    propWus: number;
  };
  asfrBands: [number, number, number, number, number, number, number];
  tfr: number;
  ageStructure: {
    muda0_14: number;
    produktif15_64: number;
    lansia65Plus: number;
    dependencyRatio: number;
  };
  morbidityRates: {
    ci: number;
    pointPrevPct: number;
    periodPrevPct: number;
    attackRatePct: number;
    sarPct: number;
    cfrUmumPct: number;
  };
  diagnosticRates: {
    sens: number;
    spec: number;
    ppv: number;
    npv: number;
    accuracy: number;
    iePct: number;
    i0Pct: number;
    rr: number | null;
    or: number | null;
  };
}

const STORAGE_TREND_KEY = "piobari_health_status_trend_history_v1";

const ASFR_LABELS = [
  "15–19",
  "20–24",
  "25–29",
  "30–34",
  "35–39",
  "40–44",
  "45–49",
];

const fmtDec = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return "0,00";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};

const fmtInt = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("id-ID");
};

// Default historical comparison baseline (3 prior quarters) so the trend chart is immediately informative
// while the final point ("Saat Ini") dynamically mirrors the user's live calculator inputs.
function buildDefaultBaseline(current: HealthStatusChartsProps["coreValues"]): HealthStatusTrendPoint[] {
  const round2 = (v: number) => Math.round(Math.max(0, v) * 100) / 100;
  return [
    {
      id: "hist-tw1",
      period: "TW I",
      cbr: round2(current.cbr > 0 ? current.cbr * 0.91 : 6.7),
      cdr: round2(current.cdr > 0 ? current.cdr * 1.08 : 0.45),
      rni: round2((current.cbr > 0 ? current.cbr * 0.91 : 6.7) - (current.cdr > 0 ? current.cdr * 1.08 : 0.45)),
      imr: round2(current.imr > 0 ? current.imr * 1.15 : 1.8),
      mmr: round2(current.mmr > 0 ? current.mmr * 1.1 : 0),
      irDbd: round2(current.irDbd > 0 ? current.irDbd * 1.32 : 33.5),
      cfrDbd: round2(current.cfrDbd > 0 ? current.cfrDbd * 1.2 : 0.4),
      irTb: round2(current.irTb > 0 ? current.irTb * 1.25 : 7.9),
      gfr: round2(current.gfr > 0 ? current.gfr * 0.92 : 27.1),
      propWus: round2(current.propWus > 0 ? current.propWus * 0.98 : 24.5),
    },
    {
      id: "hist-tw2",
      period: "TW II",
      cbr: round2(current.cbr > 0 ? current.cbr * 0.96 : 7.05),
      cdr: round2(current.cdr > 0 ? current.cdr * 1.04 : 0.25),
      rni: round2((current.cbr > 0 ? current.cbr * 0.96 : 7.05) - (current.cdr > 0 ? current.cdr * 1.04 : 0.25)),
      imr: round2(current.imr > 0 ? current.imr * 1.05 : 0.9),
      mmr: round2(current.mmr > 0 ? current.mmr * 1.05 : 0),
      irDbd: round2(current.irDbd > 0 ? current.irDbd * 1.16 : 29.4),
      cfrDbd: round2(current.cfrDbd > 0 ? current.cfrDbd * 1.05 : 0.2),
      irTb: round2(current.irTb > 0 ? current.irTb * 1.12 : 7.1),
      gfr: round2(current.gfr > 0 ? current.gfr * 0.96 : 28.2),
      propWus: round2(current.propWus > 0 ? current.propWus * 0.99 : 24.8),
    },
    {
      id: "hist-tw3",
      period: "TW III",
      cbr: round2(current.cbr > 0 ? current.cbr * 0.98 : 7.2),
      cdr: round2(current.cdr > 0 ? current.cdr * 1.0 : 0.12),
      rni: round2((current.cbr > 0 ? current.cbr * 0.98 : 7.2) - (current.cdr > 0 ? current.cdr * 1.0 : 0.12)),
      imr: round2(current.imr > 0 ? current.imr * 1.0 : 0),
      mmr: round2(current.mmr > 0 ? current.mmr * 1.0 : 0),
      irDbd: round2(current.irDbd > 0 ? current.irDbd * 1.05 : 26.7),
      cfrDbd: round2(current.cfrDbd > 0 ? current.cfrDbd * 1.0 : 0),
      irTb: round2(current.irTb > 0 ? current.irTb * 1.04 : 6.6),
      gfr: round2(current.gfr > 0 ? current.gfr * 0.99 : 29.0),
      propWus: round2(current.propWus > 0 ? current.propWus * 1.0 : 24.9),
    },
  ];
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
  unitSuffix?: string;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unitSuffix = "" }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs tabular-nums">
      {label && <div className="font-bold text-slate-900 mb-1.5 border-b border-slate-100 pb-1">{label}</div>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={`${entry.name}-${idx}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color || "#0d9488" }}
              />
              {entry.name}
            </span>
            <span className="font-bold text-slate-900">
              {typeof entry.value === "number" ? fmtDec(entry.value, 2) : entry.value}
              {entry.unit || unitSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

type TrendCategory = "surveilans" | "vital" | "kia";
type PieMode = "wus" | "age";

export const HealthStatusCharts: React.FC<HealthStatusChartsProps> = ({
  regionName,
  reportPeriod,
  compactMode = false,
  coreValues,
  asfrBands,
  tfr,
  ageStructure,
  morbidityRates,
  diagnosticRates,
}) => {
  const [trendCategory, setTrendCategory] = useState<TrendCategory>("surveilans");
  const [pieMode, setPieMode] = useState<PieMode>("wus");
  const [newPeriodLabel, setNewPeriodLabel] = useState<string>("");
  const [savedHistory, setSavedHistory] = useState<HealthStatusTrendPoint[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_TREND_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return buildDefaultBaseline(coreValues);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TREND_KEY, JSON.stringify(savedHistory));
    } catch {
      // ignore storage errors
    }
  }, [savedHistory]);

  const livePoint: HealthStatusTrendPoint = useMemo(() => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return {
      id: "live-current",
      period: `${reportPeriod || "Saat Ini"} (Input)`,
      cbr: r2(coreValues.cbr),
      cdr: r2(coreValues.cdr),
      rni: r2(coreValues.rni),
      imr: r2(coreValues.imr),
      mmr: r2(coreValues.mmr),
      irDbd: r2(coreValues.irDbd),
      cfrDbd: r2(coreValues.cfrDbd),
      irTb: r2(coreValues.irTb),
      gfr: r2(coreValues.gfr),
      propWus: r2(coreValues.propWus),
      isLive: true,
    };
  }, [coreValues, reportPeriod]);

  const trendSeries = useMemo(() => {
    return [...savedHistory, livePoint];
  }, [savedHistory, livePoint]);

  const handleSaveSnapshot = () => {
    const label = newPeriodLabel.trim() || `Periode ${savedHistory.length + 1}`;
    const snapshot: HealthStatusTrendPoint = {
      ...livePoint,
      id: `snap-${Date.now()}`,
      period: label,
      isLive: false,
    };
    setSavedHistory((prev) => [...prev.slice(-11), snapshot]);
    setNewPeriodLabel("");
  };

  const handleRemoveSnapshot = (id: string) => {
    setSavedHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetBaseline = () => {
    setSavedHistory(buildDefaultBaseline(coreValues));
  };

  // Comparison Bar Chart Data (Current 10-Indicator Derived Measures)
  const benchmarkBarData = useMemo(() => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return [
      {
        name: "CBR",
        fullName: "Crude Birth Rate (per 1.000)",
        nilai: r2(coreValues.cbr),
        fill: "#0284c7",
      },
      {
        name: "CDR",
        fullName: "Crude Death Rate (per 1.000)",
        nilai: r2(coreValues.cdr),
        fill: coreValues.cdr === 0 ? "#0d9488" : "#0ea5e9",
      },
      {
        name: "IMR",
        fullName: "Infant Mortality Rate (per 1.000 KH)",
        nilai: r2(coreValues.imr),
        fill: coreValues.imr > 16 ? "#e11d48" : "#0d9488",
      },
      {
        name: "IR DBD",
        fullName: "Incidence Rate DBD (per 100.000)",
        nilai: r2(coreValues.irDbd),
        fill: coreValues.irDbd >= 49 ? "#e11d48" : "#0284c7",
      },
      {
        name: "CFR DBD",
        fullName: "Case Fatality Rate DBD (%)",
        nilai: r2(coreValues.cfrDbd),
        fill: coreValues.cfrDbd >= 1 ? "#e11d48" : "#0d9488",
      },
      {
        name: "IR TB",
        fullName: "Incidence Rate TB Paru (per 100.000)",
        nilai: r2(coreValues.irTb),
        fill: "#0369a1",
      },
      {
        name: "GFR",
        fullName: "General Fertility Rate (per 1.000 WUS)",
        nilai: r2(coreValues.gfr),
        fill: "#0d9488",
      },
    ];
  }, [coreValues]);

  // ASFR Age Curve Data
  const asfrChartData = useMemo(() => {
    return ASFR_LABELS.map((band, idx) => ({
      kelompok: band,
      asfr: asfrBands[idx] || 0,
    }));
  }, [asfrBands]);

  // Population Composition Pie Data
  const populationPieData = useMemo(() => {
    if (pieMode === "wus") {
      const wus = Math.max(0, coreValues.perempuanWUS);
      const nonWus = Math.max(0, coreValues.jumlahPenduduk - wus);
      return [
        { name: "WUS (15–49 thn)", value: wus, color: "#0d9488" },
        { name: "Penduduk Lainnya", value: nonWus, color: "#cbd5e1" },
      ];
    }
    return [
      { name: "Usia Muda (0–14 thn)", value: Math.max(0, ageStructure.muda0_14), color: "#38bdf8" },
      { name: "Usia Produktif (15–64 thn)", value: Math.max(0, ageStructure.produktif15_64), color: "#0d9488" },
      { name: "Lansia (≥65 thn)", value: Math.max(0, ageStructure.lansia65Plus), color: "#f59e0b" },
    ];
  }, [pieMode, coreValues.jumlahPenduduk, coreValues.perempuanWUS, ageStructure]);

  // Diagnostic & Morbidity Bar Chart Data
  const diagnosticBarData = useMemo(() => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return [
      { name: "Sensitivitas", nilai: r2(diagnosticRates.sens), fill: "#0d9488" },
      { name: "Spesifisitas", nilai: r2(diagnosticRates.spec), fill: "#0284c7" },
      { name: "PPV", nilai: r2(diagnosticRates.ppv), fill: "#0369a1" },
      { name: "NPV", nilai: r2(diagnosticRates.npv), fill: "#14b8a6" },
      { name: "Akurasi", nilai: r2(diagnosticRates.accuracy), fill: "#0f766e" },
    ];
  }, [diagnosticRates]);

  const morbidityBarData = useMemo(() => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return [
      { name: "Point Prev (%)", nilai: r2(morbidityRates.pointPrevPct), fill: "#0284c7" },
      { name: "Period Prev (%)", nilai: r2(morbidityRates.periodPrevPct), fill: "#0ea5e9" },
      { name: "Attack Rate (%)", nilai: r2(morbidityRates.attackRatePct), fill: morbidityRates.attackRatePct >= 20 ? "#e11d48" : "#f59e0b" },
      { name: "SAR (%)", nilai: r2(morbidityRates.sarPct), fill: "#6366f1" },
      { name: "CFR Umum (%)", nilai: r2(morbidityRates.cfrUmumPct), fill: morbidityRates.cfrUmumPct >= 5 ? "#e11d48" : "#0d9488" },
    ];
  }, [morbidityRates]);

  return (
    <div className="space-y-5">
      {/* TOP GRID: TREND LINE CHART + CURRENT INDICATORS COMPARISON */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* CHART 1: MULTI-PERIOD EPIDEMIOLOGICAL TREND */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Grafik Tren Indikator Epidemiologi ({regionName})
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Titik terakhir ({reportPeriod || "Saat Ini"}) diperbarui secara langsung mengikuti input pengguna.
              </p>
            </div>

            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
              {(
                [
                  { id: "surveilans", label: "Surveilans DBD/TB" },
                  { id: "vital", label: "Vital (CBR/CDR/GFR)" },
                  { id: "kia", label: "KIA (IMR/MMR)" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTrendCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    trendCategory === cat.id
                      ? "bg-white text-teal-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries} margin={{ top: 10, right: 18, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

                {trendCategory === "surveilans" && (
                  <>
                    <ReferenceLine
                      y={49}
                      stroke="#e11d48"
                      strokeDasharray="4 4"
                      label={{ value: "Ambang IR DBD (49)", position: "insideTopRight", fill: "#e11d48", fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="irDbd"
                      name="IR DBD (per 100rb)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="irTb"
                      name="IR TB Paru (per 100rb)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cfrDbd"
                      name="CFR DBD (%)"
                      stroke="#e11d48"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 3.5, fill: "#e11d48", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </>
                )}

                {trendCategory === "vital" && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="gfr"
                      name="GFR (per 1.000 WUS)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cbr"
                      name="CBR (per 1.000)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rni"
                      name="RNI Pertumbuhan (‰)"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3.5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cdr"
                      name="CDR (per 1.000)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3.5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </>
                )}

                {trendCategory === "kia" && (
                  <>
                    <ReferenceLine
                      y={16}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: "Target IMR (<16)", position: "insideTopRight", fill: "#d97706", fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="imr"
                      name="IMR (per 1.000 KH)"
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#e11d48", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mmr"
                      name="MMR (per 100.000 KH)"
                      stroke="#9333ea"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#9333ea", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SNAPSHOT PERIOD RECORDER CONTROLS */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={newPeriodLabel}
                onChange={(e) => setNewPeriodLabel(e.target.value)}
                placeholder="Label periode baru (mis. TW IV 2026)"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Simpan ke Tren
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Baseline
            </button>
          </div>

          {/* SAVED PERIODS CHIPS (REMOVABLE) */}
          {!compactMode && savedHistory.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 print:hidden">
              {savedHistory.map((pt) => (
                <span
                  key={pt.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
                >
                  <span>{pt.period}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSnapshot(pt.id)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    title={`Hapus periode ${pt.period}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CHART 2: CURRENT 10-INDICATOR DERIVED RATES BAR CHART */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Profil Laju Indikator Utama (Saat Ini)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Perbandingan langsung nilai CBR, CDR, IMR, IR DBD, CFR DBD, IR TB Paru, dan GFR dari input aktif.
            </p>
          </div>

          <div className="w-full h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkBarData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0].payload as { fullName: string; nilai: number; fill: string };
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs tabular-nums">
                        <div className="font-bold text-slate-900">{item.fullName}</div>
                        <div className="mt-1 font-extrabold" style={{ color: item.fill }}>
                          Nilai: {fmtDec(item.nilai, 2)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="nilai" name="Nilai Indikator" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {benchmarkBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
              Optimal / Nol Kematian
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
              Laju Terpantau
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
              Waspada (IR DBD ≥49 / CFR ≥1%)
            </span>
          </div>
        </div>
      </div>

      {/* FULL ANALYTICS MODE: EXTRA CHARTS FOR FERTILITY, DEMOGRAPHY, MORBIDITY & 2x2 DIAGNOSTICS */}
      {!compactMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CHART 3: KURVA FERTILITAS ASFR (15-49 TAHUN) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Kurva Fertilitas Menurut Kelompok Umur (ASFR)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Distribusi kelahiran per 1.000 WUS pada 7 kelompok usia reproduksi (15–49 tahun).
                </p>
              </div>
              <div className="text-right tabular-nums shrink-0">
                <div className="text-[10px] font-semibold uppercase text-slate-400">Total Fertility Rate</div>
                <div className="text-base font-extrabold text-teal-700">{fmtDec(tfr, 2)} anak</div>
              </div>
            </div>

            <div className="w-full h-[240px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={asfrChartData} margin={{ top: 10, right: 14, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="asfrAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="kelompok"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip content={<ChartTooltip unitSuffix=" per 1.000 WUS" />} />
                  <Area
                    type="monotone"
                    dataKey="asfr"
                    name="ASFR"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fill="url(#asfrAreaGrad)"
                    dot={{ r: 3.5, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 4: KOMPOSISI POPULASI (WUS & STRUKTUR UMUR) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Struktur Demografi &amp; Proporsi WUS
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {pieMode === "wus"
                    ? `Proporsi WUS (15–49 thn): ${fmtDec(coreValues.propWus, 2)}% dari ${fmtInt(coreValues.jumlahPenduduk)} jiwa`
                    : `Rasio Ketergantungan (Dependency Ratio): ${fmtDec(ageStructure.dependencyRatio, 2)}%`}
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setPieMode("wus")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                    pieMode === "wus" ? "bg-white text-teal-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Proporsi WUS
                </button>
                <button
                  type="button"
                  onClick={() => setPieMode("age")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                    pieMode === "age" ? "bg-white text-teal-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Struktur Umur
                </button>
              </div>
            </div>

            <div className="w-full h-[240px] mt-4 grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
              <div className="sm:col-span-7 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={populationPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={84}
                      paddingAngle={2}
                    >
                      {populationPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const item = payload[0].payload as { name: string; value: number; color: string };
                        const sum = populationPieData.reduce((acc, d) => acc + d.value, 0);
                        const pct = sum > 0 ? (item.value / sum) * 100 : 0;
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs tabular-nums">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-slate-600 mt-0.5">
                              {fmtInt(item.value)} jiwa ({fmtDec(pct, 2)}%)
                            </div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="sm:col-span-5 space-y-2.5 text-xs tabular-nums">
                {populationPieData.map((item) => {
                  const sum = populationPieData.reduce((acc, d) => acc + d.value, 0);
                  const pct = sum > 0 ? (item.value / sum) * 100 : 0;
                  return (
                    <div key={item.name} className="p-2 rounded-lg border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="mt-0.5 font-extrabold text-slate-900">
                        {fmtInt(item.value)} jiwa{" "}
                        <span className="text-slate-500 font-semibold">({fmtDec(pct, 1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CHART 5: PROFIL MORBIDITAS & SURVEILANS KLB (%) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Visualisasi Ukuran Morbiditas &amp; Surveilans KLB (%)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Perbandingan Point Prevalence, Period Prevalence, Attack Rate, Secondary Attack Rate, dan CFR Umum.
              </p>
            </div>
            <div className="w-full h-[230px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={morbidityBarData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} unit="%" axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip unitSuffix="%" />} />
                  <Bar dataKey="nilai" name="Persentase" radius={[0, 6, 6, 0]} barSize={22}>
                    {morbidityBarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 6: VALIDITAS UJI DIAGNOSTIK & ASOSIASI 2x2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Performa Uji Skrining / Diagnostik (Tabel 2×2)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sensitivitas, Spesifisitas, PPV, NPV, dan Akurasi (%) dari matriks 2×2 aktif.
                </p>
              </div>
              <div className="text-right tabular-nums shrink-0 text-[11px] font-bold text-slate-700">
                <div>RR: <span className="text-sky-600">{diagnosticRates.rr !== null ? fmtDec(diagnosticRates.rr, 2) : "—"}</span></div>
                <div>OR: <span className="text-teal-600">{diagnosticRates.or !== null ? fmtDec(diagnosticRates.or, 2) : "—"}</span></div>
              </div>
            </div>
            <div className="w-full h-[230px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosticBarData} margin={{ top: 10, right: 14, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <ReferenceLine y={80} stroke="#0d9488" strokeDasharray="4 4" />
                  <Tooltip content={<ChartTooltip unitSuffix="%" />} />
                  <Bar dataKey="nilai" name="Skor Validitas" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {diagnosticBarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatusCharts;
