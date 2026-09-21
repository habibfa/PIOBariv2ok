import React, { useState, useMemo } from 'react';
import { 
  CHEMO_REGIMENS_DATA, 
  CHEMO_GOALS_DATA, 
  ChemoTherapyGoal, 
  ChemoRegimen 
} from '../data/chemoRegimensData';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Scissors, 
  Droplets, 
  AlertTriangle, 
  Info, 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Pill,
  BookOpen,
  Filter,
  X,
  Stethoscope,
  Activity
} from 'lucide-react';

interface ChemoRegimensViewProps {
  onSelectRegimenForIvCheck?: (drugIds: string[]) => void;
}

export const ChemoRegimensView: React.FC<ChemoRegimensViewProps> = ({ onSelectRegimenForIvCheck }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<ChemoTherapyGoal | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedRegimenId, setExpandedRegimenId] = useState<string | null>("abvd");
  
  // Patient BSA Calculator State
  const [patientBsa, setPatientBsa] = useState<number | "">(1.65);
  const [patientWeight, setPatientWeight] = useState<number | "">("");
  const [patientHeight, setPatientHeight] = useState<number | "">("");
  const [patientGfr, setPatientGfr] = useState<number | "">("");

  // Calculate Mosteller BSA if weight and height are provided
  const handleCalculateBsa = (weight: number | "", height: number | "") => {
    if (typeof weight === 'number' && weight > 0 && typeof height === 'number' && height > 0) {
      const bsa = Math.sqrt((weight * height) / 3600);
      setPatientBsa(parseFloat(bsa.toFixed(2)));
    }
  };

  const filteredRegimens = useMemo(() => {
    return CHEMO_REGIMENS_DATA.filter(regimen => {
      // Goal filter
      if (selectedGoal !== "all" && !regimen.applicableGoals.includes(selectedGoal)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "all" && regimen.cancerCategory !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchAcronym = regimen.acronym.toLowerCase().includes(query);
        const matchName = regimen.fullName.toLowerCase().includes(query);
        const matchCancer = regimen.cancerTypeDetail.toLowerCase().includes(query);
        const matchComponent = regimen.components.some(c => 
          c.drugName.toLowerCase().includes(query) || 
          (c.genericAlias && c.genericAlias.toLowerCase().includes(query))
        );
        return matchAcronym || matchName || matchCancer || matchComponent;
      }
      return true;
    });
  }, [searchQuery, selectedGoal, selectedCategory]);

  return (
    <div className="space-y-8 w-full">
      
      {/* SECTION 1: Header & Penjelasan Jenis Berdasarkan Tujuan Terapi */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden border border-indigo-800/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Katalog Protokol Onkologi & Rekomendasi Klinis
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terintegrasi Kompatibilitas IV
            </span>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Regimen Kemoterapi & Klasifikasi Tujuan Terapi
            </h2>
            <p className="text-sm md:text-base text-indigo-200/90 font-sans mt-1.5 max-w-4xl leading-relaxed">
              Panduan lengkap protokol kemoterapi kombinasi berbasis bukti klinis (ABVD, R-CHOP, FOLFOX, FOLFIRI, TCHP, FAC, AC), urutan pemberian infus intravena, pelarut yang diperbolehkan/dilarang, kalkulator dosis personal BSA, dan pemantauan toksisitas organ vital.
            </p>
          </div>

          {/* Cards: Jenis Berdasarkan Tujuan Terapi (Interactive Filter & Explanations) */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-300 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                Klasifikasi Jenis Berdasarkan Tujuan Terapi (Klik untuk Memfilter):
              </h3>
              {selectedGoal !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedGoal("all")}
                  className="text-xs text-indigo-300 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Tampilkan Semua Tujuan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(Object.keys(CHEMO_GOALS_DATA) as ChemoTherapyGoal[]).map(goalKey => {
                const goal = CHEMO_GOALS_DATA[goalKey];
                const isSelected = selectedGoal === goalKey;

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(isSelected ? "all" : goalKey)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-white text-slate-900 border-indigo-400 ring-2 ring-indigo-400 shadow-lg scale-[1.02]"
                        : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isSelected ? goal.badgeColor : "bg-white/20 text-indigo-100 border-white/20"
                        }`}>
                          {goal.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold leading-snug ${isSelected ? "text-slate-900" : "text-indigo-100"}`}>
                        {goal.shortDesc}
                      </p>
                    </div>

                    <p className={`text-[11px] mt-2.5 pt-2 border-t font-sans line-clamp-3 leading-relaxed ${
                      isSelected ? "border-slate-200 text-slate-600" : "border-white/10 text-indigo-200/80"
                    }`}>
                      {goal.fullDesc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Filter & Search Bar + BSA Quick Calculator */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama regimen (ABVD, R-CHOP, FOLFOX...), kanker, atau obat (Doxorubicin, Trastuzumab...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cancer Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "Semua Kanker" },
              { id: "limfoma", label: "Limfoma" },
              { id: "kolorektal", label: "Kolorektal" },
              { id: "payudara", label: "Payudara" },
              { id: "ginekologi", label: "Ginekologi & Ovarium" },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient BSA Calculation Helper Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Kalkulator Cepat Luas Permukaan Tubuh (BSA Pasien):</p>
              <p className="text-[11px] text-slate-500 font-sans">
                Digunakan untuk menghitung estimasi dosis individual tiap obat sitostatika dalam regimen secara instan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold">BB:</span>
              <input
                type="number"
                placeholder="kg"
                value={patientWeight}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                  setPatientWeight(val);
                  handleCalculateBsa(val, patientHeight);
                }}
                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-slate-400 text-[11px]">kg</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold">TB:</span>
              <input
                type="number"
                placeholder="cm"
                value={patientHeight}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                  setPatientHeight(val);
                  handleCalculateBsa(patientWeight, val);
                }}
                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-slate-400 text-[11px]">cm</span>
            </div>

            <div className="flex items-center gap-1.5 ml-1 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200">
              <span className="font-bold text-indigo-950">BSA Terpasang:</span>
              <input
                type="number"
                step="0.01"
                value={patientBsa}
                onChange={(e) => setPatientBsa(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-16 px-1.5 py-0.5 bg-white border border-indigo-300 rounded text-xs font-extrabold text-indigo-700 text-center focus:outline-none"
              />
              <span className="text-indigo-900 font-bold">m²</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Regimens Catalog List */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Daftar Protokol Regimen Kemoterapi ({filteredRegimens.length} Regimen Ditemukan)
          </h3>
          {(selectedGoal !== "all" || selectedCategory !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedGoal("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {filteredRegimens.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">Tidak Ada Regimen yang Cocok</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan protokol kemoterapi yang sesuai dengan kata kunci atau filter tujuan terapi yang Anda pilih. Silakan gunakan kata kunci lain atau reset filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGoal("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Tampilkan Semua Regimen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegimens.map((regimen) => {
              const isExpanded = expandedRegimenId === regimen.id;
              const numericBsa = typeof patientBsa === 'number' && patientBsa > 0 ? patientBsa : 1.65;

              return (
                <div
                  key={regimen.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? "border-indigo-300 shadow-md ring-1 ring-indigo-200" 
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  {/* Regimen Card Header */}
                  <div 
                    onClick={() => setExpandedRegimenId(isExpanded ? null : regimen.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Acronym Badge */}
                        <span className="px-3 py-1 bg-indigo-600 text-white font-black text-sm rounded-xl tracking-tight shadow-2xs">
                          {regimen.acronym}
                        </span>

                        {/* Cancer Category Badge */}
                        <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                          {regimen.cancerCategoryLabel}
                        </span>

                        {/* Applicable Goals Badges */}
                        {regimen.applicableGoals.map(goalKey => {
                          const goal = CHEMO_GOALS_DATA[goalKey];
                          return (
                            <span 
                              key={goalKey} 
                              className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-md border ${goal.badgeColor}`}
                            >
                              {goal.title}
                            </span>
                          );
                        })}
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {regimen.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">
                          <strong className="text-slate-700 font-semibold">Indikasi:</strong> {regimen.cancerTypeDetail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          Siklus: {regimen.cycleLengthDays} Hari
                        </p>
                        <p className="text-[11px] text-slate-400 font-sans">
                          {regimen.components.length} Komponen Obat
                        </p>
                      </div>

                      <div className="p-2 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Regimen Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 md:p-6 bg-slate-50/50 space-y-6">
                      
                      {/* Overview & Primary Goal Highlight */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-3xs">
                        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                          <Info className="w-4 h-4 text-indigo-600" />
                          <span>Ikhtisar & Tujuan Terapi Utama:</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-700 font-sans leading-relaxed">
                          {regimen.overview}
                        </p>
                        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-950 font-medium">
                          <strong className="text-indigo-900">Peran Klinis: </strong> {regimen.primaryGoalHighlight}
                        </div>
                      </div>

                      {/* Protocol Schedule Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                            Jadwal & Frekuensi Pemberian
                          </span>
                          <p className="font-bold text-slate-800 text-xs">
                            {regimen.cycleProtocol}
                          </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                            Rekomendasi Jumlah Siklus Total
                          </span>
                          <p className="font-bold text-slate-800 text-xs">
                            {regimen.totalRecommendedCycles}
                          </p>
                        </div>
                      </div>

                      {/* Components Table & Sequence of Administration */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-emerald-600" />
                            Urutan Pemberian Obat (Sequence of Administration) & Dosis
                          </h5>

                          {onSelectRegimenForIvCheck && (
                            <button
                              type="button"
                              onClick={() => {
                                const validDrugIds = regimen.components.map(c => c.drugId).filter(id => Boolean(id));
                                onSelectRegimenForIvCheck(validDrugIds);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title="Pilih otomatis semua obat regimen ini di matriks Kompatibilitas IV"
                            >
                              <Droplets className="w-3.5 h-3.5" />
                              <span>Uji Kompatibilitas IV Regimen Ini</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {regimen.components.map((comp) => {
                            // Calculate estimated patient dose based on BSA or Flat
                            let calculatedPatientDoseText = "";
                            if (comp.doseUnit === "mg/m2") {
                              const totalDose = Math.round(comp.defaultDoseValue * numericBsa);
                              calculatedPatientDoseText = `≈ ${totalDose} mg (untuk BSA ${numericBsa} m²)`;
                            } else if (comp.doseUnit === "unit/m2") {
                              const totalUnits = Math.round(comp.defaultDoseValue * numericBsa);
                              calculatedPatientDoseText = `≈ ${totalUnits} unit (untuk BSA ${numericBsa} m²)`;
                            } else if (comp.doseUnit === "mg/kg") {
                              const weightVal = typeof patientWeight === 'number' && patientWeight > 0 ? patientWeight : 60;
                              const totalDose = Math.round(comp.defaultDoseValue * weightVal);
                              calculatedPatientDoseText = `≈ ${totalDose} mg (untuk BB ${weightVal} kg)`;
                            } else if (comp.doseUnit === "AUC") {
                              calculatedPatientDoseText = `Gunakan Rumus Calvert: AUC × (GFR + 25)`;
                            } else {
                              calculatedPatientDoseText = `Dosis Tetap (Flat Dose)`;
                            }

                            const isVesicant = comp.vesicantStatus.includes("Vesikant");

                            return (
                              <div 
                                key={comp.drugName}
                                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                                      {comp.sequenceOrder}
                                    </span>
                                    <div>
                                      <h6 className="font-bold text-slate-900 text-sm">
                                        {comp.drugName}
                                      </h6>
                                      <p className="text-[11px] text-slate-500 font-sans">
                                        {comp.role}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                      comp.vesicantStatus.includes("Vesikan") 
                                        ? "bg-rose-100 text-rose-800 border border-rose-200" 
                                        : comp.vesicantStatus.includes("Iritan")
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-slate-100 text-slate-600"
                                    }`}>
                                      {comp.vesicantStatus}
                                    </span>

                                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 font-black px-2.5 py-0.5 rounded text-xs">
                                      {comp.dosageFormula}
                                    </div>
                                  </div>
                                </div>

                                {/* Calculated Dose & Administration Route */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="space-y-1">
                                    <p className="text-slate-500 font-medium">
                                      <strong className="text-slate-700">Rute & Durasi: </strong>
                                      {comp.adminRoute}
                                    </p>
                                    <p className="text-indigo-700 font-bold bg-indigo-50/60 px-2 py-1 rounded inline-block">
                                      Estimasi Dosis: {calculatedPatientDoseText}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-slate-700">
                                      <strong>Pelarut Standar: </strong>
                                      <span className="font-bold text-emerald-700">{comp.diluentStandard}</span>
                                    </p>
                                    {comp.diluentForbidden && (
                                      <p className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        {comp.diluentForbidden}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Sequence Note & Special Precautions */}
                                <div className="bg-slate-50 p-2.5 rounded-lg text-[11.5px] text-slate-700 space-y-1 border border-slate-200/70 font-sans">
                                  <p>
                                    <strong className="text-slate-900 font-semibold">Urutan & Protokol Infus: </strong>
                                    {comp.sequenceNote}
                                  </p>
                                  <p className="text-slate-600">
                                    <strong className="text-slate-900 font-semibold">Peringatan Keamanan & Ekstravasasi: </strong>
                                    {comp.specialPrecautions}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Premedication & Protection Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* Premedications */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-3xs">
                          <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-indigo-900">
                            <Pill className="w-4 h-4 text-indigo-600" />
                            Protokol Premedikasi Wajib
                          </h6>
                          <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                            {regimen.premedicationProtocol.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-500 font-bold mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Hydration & Support */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-3xs">
                          <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Hidrasi & Terapi Suportif
                          </h6>
                          <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                            {regimen.hydrationAndProtection.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Organ Toxicities & Monitoring */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
                        <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-rose-900">
                          <HeartPulse className="w-4 h-4 text-rose-600" />
                          Toksisitas Organ Spesifik & Strategi Pencegahan
                        </h6>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {regimen.organToxicities.map((tox, idx) => (
                            <div key={idx} className="p-3 bg-rose-50/40 border border-rose-200/70 rounded-xl space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="text-rose-950 font-bold">{tox.organ}</strong>
                                <span className="text-[10px] bg-white text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
                                  {tox.responsibleDrug}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-700 font-sans">
                                <strong>Manifestasi: </strong>{tox.manifestation}
                              </p>
                              <p className="text-[11px] text-emerald-900 bg-white/80 p-1.5 rounded border border-emerald-100 font-sans">
                                <strong>Pencegahan: </strong>{tox.preventionStrategy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Clinical Pearls & Reference */}
                      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2 text-xs text-amber-950 font-sans">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Mutiara Klinis Apoteker Onkologi (Clinical Pearls):</span>
                        </div>
                        <ul className="space-y-1 pl-4 list-disc text-[11.5px] text-amber-900/90">
                          {regimen.clinicalPearls.map((pearl, idx) => (
                            <li key={idx}>{pearl}</li>
                          ))}
                        </ul>
                        <p className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/50 italic">
                          <strong>Referensi: </strong> {regimen.references}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
