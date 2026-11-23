import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Activity,
  Baby,
  BookOpen,
  Brain,
  Check,
  ClipboardCopy,
  Droplets,
  Flame,
  HeartPulse,
  Pill,
  RotateCcw,
  Search,
  ShieldAlert,
  Star,
  Stethoscope,
  TestTube2,
  Wind,
  X,
} from "lucide-react";
import {
  MEDSCAPE_CALCULATORS,
  MEDSCAPE_SPECIALTIES,
  MedscapeCalculatorDef,
  MedscapeSpecialtyId,
  CalcComputeResult,
} from "../data/medscapeCalculatorsData";

const FAVORITES_STORAGE_KEY = "piobari_medscape_calc_favs_v1";

const SPECIALTY_ICONS: Record<MedscapeSpecialtyId, React.ElementType> = {
  all: Stethoscope,
  cardiology: HeartPulse,
  nephrology: Droplets,
  critical_care: ShieldAlert,
  hepatology: Activity,
  pulmonology: Wind,
  neurology: Brain,
  hematology: TestTube2,
  endocrinology: Flame,
  obgyn: Baby,
  pediatrics: Baby,
  pharmacology: Pill,
};

const getSeverityStyles = (severity: CalcComputeResult["severity"]) => {
  switch (severity) {
    case "critical":
      return {
        box: "bg-rose-50/80 border-rose-200",
        value: "text-rose-700",
        label: "text-rose-800",
      };
    case "high":
      return {
        box: "bg-orange-50/80 border-orange-200",
        value: "text-orange-700",
        label: "text-orange-800",
      };
    case "moderate":
      return {
        box: "bg-amber-50/80 border-amber-200",
        value: "text-amber-700",
        label: "text-amber-800",
      };
    case "low":
    case "normal":
    default:
      return {
        box: "bg-teal-50/70 border-teal-200",
        value: "text-teal-700",
        label: "text-teal-800",
      };
  }
};

function buildDefaultsForCalc(calc: MedscapeCalculatorDef): Record<string, number | boolean> {
  const map: Record<string, number | boolean> = {};
  for (const field of calc.fields) {
    map[field.key] = field.defaultValue;
  }
  return map;
}

export const HealthCalculatorsDirectory: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedscapeSpecialtyId>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [selectedCalcId, setSelectedCalcId] = useState<string>(MEDSCAPE_CALCULATORS[0].id);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);

  // Store user input values per calculator id so switching back preserves data
  const [valuesByCalc, setValuesByCalc] = useState<Record<string, Record<string, number | boolean>>>(() => {
    const initial: Record<string, Record<string, number | boolean>> = {};
    for (const c of MEDSCAPE_CALCULATORS) {
      initial[c.id] = buildDefaultsForCalc(c);
    }
    return initial;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      // ignore storage read error
    }
    return ["cha2ds2-vasc", "qtc-corrected", "fena-feurea", "gcs-score", "meld-na"];
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage write error
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  // Count calculators per specialty
  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MEDSCAPE_CALCULATORS.length };
    for (const c of MEDSCAPE_CALCULATORS) {
      counts[c.specialty] = (counts[c.specialty] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered calculator list
  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MEDSCAPE_CALCULATORS.filter((c) => {
      if (selectedSpecialty !== "all" && c.specialty !== selectedSpecialty) return false;
      if (onlyFavorites && !favorites.includes(c.id)) return false;
      if (!q) return true;
      const specMeta = MEDSCAPE_SPECIALTIES.find((s) => s.id === c.specialty);
      return (
        c.title.toLowerCase().includes(q) ||
        c.englishTitle.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
        (specMeta && specMeta.label.toLowerCase().includes(q))
      );
    });
  }, [selectedSpecialty, searchQuery, onlyFavorites, favorites]);

  const activeCalc = useMemo(() => {
    return (
      MEDSCAPE_CALCULATORS.find((c) => c.id === selectedCalcId) ||
      filteredCalculators[0] ||
      MEDSCAPE_CALCULATORS[0]
    );
  }, [selectedCalcId, filteredCalculators]);

  const activeValues = valuesByCalc[activeCalc.id] || buildDefaultsForCalc(activeCalc);

  const computedResult = useMemo(() => {
    return activeCalc.compute(activeValues);
  }, [activeCalc, activeValues]);

  const handleFieldChange = useCallback(
    (fieldKey: string, nextVal: number | boolean) => {
      setValuesByCalc((prev) => ({
        ...prev,
        [activeCalc.id]: {
          ...(prev[activeCalc.id] || buildDefaultsForCalc(activeCalc)),
          [fieldKey]: nextVal,
        },
      }));
    },
    [activeCalc]
  );

  const handleResetActive = useCallback(() => {
    setValuesByCalc((prev) => ({
      ...prev,
      [activeCalc.id]: buildDefaultsForCalc(activeCalc),
    }));
  }, [activeCalc]);

  const handleCopySummary = useCallback(async () => {
    const lines = [
      `[${activeCalc.title}]`,
      `Referensi: ${activeCalc.englishTitle}`,
      `Hasil Utama: ${computedResult.primaryValue}${computedResult.primaryUnit ? ` ${computedResult.primaryUnit}` : ""}`,
      `Kategori: ${computedResult.categoryLabel}`,
      `Interpretasi: ${computedResult.interpretation}`,
      ...(computedResult.secondaryMetrics || []).map(
        (m) => `- ${m.label}: ${m.value}${m.note ? ` (${m.note})` : ""}`
      ),
      `Rumus: ${computedResult.formulaDisplay}`,
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedResult(true);
    window.setTimeout(() => setCopiedResult(false), 2000);
  }, [activeCalc, computedResult]);

  const activeSpecMeta = MEDSCAPE_SPECIALTIES.find((s) => s.id === activeCalc.specialty);
  const sevStyle = getSeverityStyles(computedResult.severity);
  const isActiveFav = favorites.includes(activeCalc.id);

  return (
    <div className="w-full space-y-5 pb-8">
      {/* HEADER & SEARCH */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Kalkulator Kesehatan (Referensi Medscape — Bahasa Indonesia)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {MEDSCAPE_CALCULATORS.length} kalkulator skor klinis, persamaan fisiologis &amp; konversi medis lintas 11 spesialisasi mengacu pada panduan Medscape Medical Calculators.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:min-w-[400px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kalkulator (mis. CHA2DS2, QTc, FENa, MELD, Wells, GCS)..."
                className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites((p) => !p)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                onlyFavorites
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
              <span>Favorit ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* SPECIALTY FILTER BAR */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          {MEDSCAPE_SPECIALTIES.map((spec) => {
            const Icon = SPECIALTY_ICONS[spec.id];
            const isSelected = selectedSpecialty === spec.id;
            const count = specialtyCounts[spec.id] || 0;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  setSelectedSpecialty(spec.id);
                  setOnlyFavorites(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-teal-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-teal-100" : "text-teal-600"}`} />
                <span>{spec.label}</span>
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded ${
                    isSelected ? "bg-teal-700 text-white" : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT DIRECTORY LIST */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Daftar Kalkulator ({filteredCalculators.length})
            </span>
            <span className="text-[11px] text-slate-500">Pilih untuk menghitung</span>
          </div>

          <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-100">
            {filteredCalculators.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700">Kalkulator tidak ditemukan</p>
                <p className="text-[11px] text-slate-500">
                  Coba kata kunci lain atau ubah filter spesialisasi di atas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecialty("all");
                    setOnlyFavorites(false);
                  }}
                  className="mt-1 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg cursor-pointer"
                >
                  Tampilkan Semua
                </button>
              </div>
            ) : (
              filteredCalculators.map((calc) => {
                const isSelected = calc.id === activeCalc.id;
                const isFav = favorites.includes(calc.id);
                const specLabel = MEDSCAPE_SPECIALTIES.find((s) => s.id === calc.specialty)?.label || "";
                return (
                  <div
                    key={calc.id}
                    className={`flex items-start justify-between gap-2 px-3.5 py-3 transition-colors ${
                      isSelected ? "bg-teal-50/80" : "hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCalcId(calc.id)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <div
                        className={`text-xs font-bold leading-snug ${
                          isSelected ? "text-teal-800" : "text-slate-900"
                        }`}
                      >
                        {calc.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {calc.englishTitle}
                      </div>
                      <div className="text-[10px] font-semibold text-teal-700 mt-1">
                        {specLabel}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(calc.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer"
                      title={isFav ? "Hapus dari favorit" : "Simpan ke favorit"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-500" : ""}`} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT ACTIVE CALCULATOR WORKSPACE */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* ACTIVE CALCULATOR HEADER */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  {activeSpecMeta?.label} · {activeSpecMeta?.englishRef}
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {activeCalc.title}
                </h2>
                <p className="text-xs text-slate-500">{activeCalc.shortDesc}</p>
                <p className="text-[11px] text-slate-400 italic">
                  Referensi Asli: {activeCalc.englishTitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(activeCalc.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5 cursor-pointer ${
                    isActiveFav
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isActiveFav ? "fill-amber-400 text-amber-500" : ""}`} />
                  {isActiveFav ? "Favorit" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={handleResetActive}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedResult ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      Salin Hasil
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeCalc.fields.map((field) => {
                  const currentVal = activeValues[field.key];
                  if (field.type === "checkbox") {
                    const checked = Boolean(currentVal);
                    return (
                      <label
                        key={field.key}
                        className={`sm:col-span-2 flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none ${
                          checked
                            ? "bg-teal-50/70 border-teal-300 text-slate-900"
                            : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 shrink-0"
                          />
                          <span className="text-xs font-semibold leading-snug">{field.label}</span>
                        </div>
                        {field.badgeText && (
                          <span
                            className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded shrink-0 ${
                              checked
                                ? "bg-teal-600 text-white"
                                : "bg-white border border-slate-200 text-slate-600"
                            }`}
                          >
                            {field.badgeText}
                          </span>
                        )}
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.key} className="sm:col-span-2 bg-slate-50/60 border border-slate-200 rounded-lg p-3">
                        <label
                          htmlFor={`calc-${activeCalc.id}-${field.key}`}
                          className="block text-xs font-bold text-slate-800 mb-1.5"
                        >
                          {field.label}
                        </label>
                        <select
                          id={`calc-${activeCalc.id}-${field.key}`}
                          value={Number(currentVal)}
                          onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
                        >
                          {(field.options || []).map((opt) => (
                            <option key={`${opt.value}-${opt.label}`} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={field.key}
                      className="bg-slate-50/60 border border-slate-200 rounded-lg p-3 focus-within:border-teal-500 focus-within:bg-white transition-colors"
                    >
                      <label
                        htmlFor={`calc-${activeCalc.id}-${field.key}`}
                        className="block text-xs font-bold text-slate-800 mb-1.5"
                      >
                        {field.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`calc-${activeCalc.id}-${field.key}`}
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step ?? "any"}
                          value={typeof currentVal === "number" ? currentVal : 0}
                          onChange={(e) => {
                            const parsed = Number(e.target.value);
                            handleFieldChange(field.key, Number.isFinite(parsed) ? parsed : 0);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-900 tabular-nums focus:outline-none focus:border-teal-500"
                        />
                        {field.unit && (
                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
                            {field.unit}
                          </span>
                        )}
                      </div>
                      {field.helper && <p className="text-[11px] text-slate-400 mt-1">{field.helper}</p>}
                    </div>
                  );
                })}
              </div>

              {/* LIVE RESULT PANEL */}
              <div className={`rounded-xl border p-4 sm:p-5 space-y-4 ${sevStyle.box}`}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-3 border-b border-black/5">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Hasil Kalkulasi Klinis
                    </div>
                    <div className="flex items-baseline gap-2 mt-1 tabular-nums">
                      <span className={`text-3xl sm:text-4xl font-black tracking-tight ${sevStyle.value}`}>
                        {computedResult.primaryValue}
                      </span>
                      {computedResult.primaryUnit && (
                        <span className="text-sm font-bold text-slate-600">
                          {computedResult.primaryUnit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-extrabold ${sevStyle.label}`}>
                    {computedResult.categoryLabel}
                  </div>
                </div>

                {/* INTERPRETATION */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Interpretasi &amp; Panduan Klinis
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium">
                    {computedResult.interpretation}
                  </p>
                </div>

                {/* SECONDARY METRICS */}
                {computedResult.secondaryMetrics && computedResult.secondaryMetrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 tabular-nums">
                    {computedResult.secondaryMetrics.map((m) => (
                      <div key={m.label} className="bg-white/90 border border-slate-200/80 rounded-lg p-3">
                        <div className="text-[11px] font-semibold text-slate-500">{m.label}</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">{m.value}</div>
                        {m.note && <div className="text-[10px] text-teal-700 font-medium mt-0.5">{m.note}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* FORMULA & REFERENCE */}
                <div className="pt-3 border-t border-black/5 space-y-1.5 text-[11px]">
                  <div className="text-slate-700 font-semibold tabular-nums">
                    <span className="text-slate-500 font-bold uppercase tracking-wider mr-1.5">Rumus:</span>
                    {computedResult.formulaDisplay}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                    <span>{computedResult.reference}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Catatan Klinis: Kalkulator ini ditujukan sebagai alat bantu keputusan klinis bagi tenaga kesehatan dan tidak menggantikan penilaian medis komprehensif pada pasien.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCalculatorsDirectory;
