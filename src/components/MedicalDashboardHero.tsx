import React from 'react';
import { 
  ShieldAlert, 
  Pill, 
  Calculator, 
  Sparkles, 
  FileText, 
  Droplets, 
  MapPin, 
  BookOpen, 
  Stethoscope, 
  Heart, 
  Activity, 
  ChevronRight,
  Search,
  X,
  Building2,
  Navigation,
  Star,
  MessageSquare
} from 'lucide-react';

interface MedicalDashboardHeroProps {
  onNavigateTab: (tab: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalDrugsCount?: number;
}

function MedicalDashboardHero({
  onNavigateTab,
  searchQuery = "",
  onSearchChange,
  totalDrugsCount = 930
}: MedicalDashboardHeroProps) {
  return (
    <div className="w-full space-y-5 sm:space-y-6 mb-6 sm:mb-8">
      {/* Modern Clinical Hero Greeting & Search */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-teal-50/40 border border-slate-200/80 p-5 sm:p-7 lg:p-8 shadow-[0_10px_28px_-10px_rgba(13,148,136,0.08)]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-700">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/70 text-teal-800">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                RSUD Palembang BARI
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Portal Kefarmasian Klinis Terintegrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pusat Informasi Obat & Keamanan Resep
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              Panduan klinis terpadu bagi Apoteker, Dokter, Perawat, dan Tenaga Kesehatan. Dilengkapi skrining polifarmasi, kalkulator klirens ginjal, kompatibilitas IV, Formularium Nasional, serta peta sebaran faskes Palembang.
            </p>
          </div>

          {/* Quick Coordinate / Hospital & Site Rating CTA Card on Desktop */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2.5 shrink-0">
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/20 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Peta Faskes Palembang</div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">165 Faskes • Koordinat Akurat</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("map")}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Peta</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20 shrink-0">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Rating Situs</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                      Real-Time
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">Kasih Bintang & Komentar</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("reviews")}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nilai Situs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Bar directly in Hero */}
        {onSearchChange && (
          <div className="relative z-10 mt-5 sm:mt-6 pt-5 border-t border-slate-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Pencarian Cepat Obat (Nama Generik / Merek Dagang / Indikasi)</span>
              </label>
              <span className="text-[11px] font-bold text-teal-700 font-mono tabular-nums">
                {totalDrugsCount}+ Monografi Obat Terverifikasi
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  onNavigateTab("desc");
                }}
                placeholder="Ketik nama generik atau merek dagang (cth: Parasetamol, Sanmol, Bisoprolol, Concor, Lasix)..."
                className="w-full min-h-[48px] bg-slate-50/80 hover:bg-white focus:bg-white border-2 border-slate-200/90 hover:border-teal-300 focus:border-teal-600 rounded-2xl py-3 pl-12 pr-11 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions Chips - Horizontally scrollable on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Populer:</span>
              {[
                { label: "Parasetamol", q: "paracetamol" },
                { label: "Sanmol", q: "sanmol" },
                { label: "Amoksisilin", q: "amoksisilin" },
                { label: "Bisoprolol", q: "bisoprolol" },
                { label: "Concor", q: "concor" },
                { label: "Furosemid", q: "furosemid" },
                { label: "Lasix", q: "lasix" },
                { label: "Salbutamol", q: "salbutamol" },
                { label: "Ventolin", q: "ventolin" },
                { label: "Ceftriaxone", q: "ceftriaxone" },
              ].map((chip) => (
                <button
                  key={chip.q}
                  type="button"
                  onClick={() => {
                    onSearchChange(chip.q);
                    onNavigateTab("desc");
                  }}
                  className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer shrink-0 ${
                    searchQuery.toLowerCase() === chip.q.toLowerCase()
                      ? "bg-teal-600 text-white border-teal-700 shadow-2xs"
                      : "bg-white hover:bg-teal-50/80 text-slate-600 hover:text-teal-700 border-slate-200/90 hover:border-teal-200"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Overview Bento Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Modul Utama Kefarmasian Klinis</h2>
          </div>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            Pilih modul untuk memulai telaah klinis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Skrining Multi-Obat & Interaksi */}
          <button
            type="button"
            onClick={() => onNavigateTab("ddi")}
            className="group relative text-left cursor-pointer overflow-hidden rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-rose-300 p-5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <span className="text-[11px] font-bold text-rose-700 font-mono tabular-nums">
                Multi-Obat
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center justify-between">
              <span>Skrining Interaksi (DDI)</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              Deteksi otomatis risiko interaksi mayor, moderat, dan minor antar kombinasi resep.
            </p>
          </button>

          {/* Card 2: Katalog & Dosis Obat */}
          <button
            type="button"
            onClick={() => onNavigateTab("desc")}
            className="group relative text-left cursor-pointer overflow-hidden rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-teal-300 p-5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-teal-700 font-mono tabular-nums">
                {totalDrugsCount}+ Obat
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center justify-between">
              <span>Monografi & Dosis Obat</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              Dosis dewasa & anak, indikasi, kontraindikasi, efek samping, dan indeks kehamilan FDA.
            </p>
          </button>

          {/* Card 3: Kalkulator Medis Ginjal & Pediatrik */}
          <button
            type="button"
            onClick={() => onNavigateTab("medcalc")}
            className="group relative text-left cursor-pointer overflow-hidden rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-sky-300 p-5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-sky-700 font-mono tabular-nums">
                eGFR & CrCl
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center justify-between">
              <span>Kalkulator Medis Klinis</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              Cockcroft-Gault, CKD-EPI, laju tetesan infus, BSA, dan penyesuaian dosis gagal ginjal.
            </p>
          </button>

          {/* Card 4: Peta Sebaran Faskes */}
          <button
            type="button"
            onClick={() => onNavigateTab("map")}
            className="group relative text-left cursor-pointer overflow-hidden rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 font-mono tabular-nums">
                GPS Real-Time
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center justify-between">
              <span>Peta Sebaran Faskes</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              Lokasi akurat RS, Puskesmas, Klinik, & Apotek Palembang dengan urutan jarak terdekat.
            </p>
          </button>
        </div>
      </div>

      {/* Responsive Quick Actions Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Akses Cepat Semua Layanan</h2>
          <span className="text-[11px] text-slate-400 font-medium">Sentuh untuk beralih modul</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
          {[
            { id: "desc", label: "Katalog Obat", icon: Pill, bg: "bg-teal-50 text-teal-700 border-teal-200/70" },
            { id: "ddi", label: "Skrining DDI", icon: ShieldAlert, bg: "bg-rose-50 text-rose-700 border-rose-200/70" },
            { id: "medcalc", label: "Kalkulator", icon: Calculator, bg: "bg-sky-50 text-sky-700 border-sky-200/70" },
            { id: "health_status", label: "Status Kes.", icon: Activity, bg: "bg-teal-50 text-teal-700 border-teal-200/70" },
            { id: "iv", label: "Injeksi IV", icon: Droplets, bg: "bg-cyan-50 text-cyan-700 border-cyan-200/70" },
            { id: "soap", label: "Form SOAP", icon: FileText, bg: "bg-indigo-50 text-indigo-700 border-indigo-200/70" },
            { id: "fornas", label: "Fornas 2025", icon: BookOpen, bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70" },
            { id: "diseases", label: "Penyakit", icon: Stethoscope, bg: "bg-amber-50 text-amber-700 border-amber-200/70" },
            { id: "map", label: "Peta Faskes", icon: MapPin, bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70" },
            { id: "reviews", label: "Beri Bintang", icon: Star, bg: "bg-amber-50 text-amber-600 border-amber-200/80" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateTab(item.id)}
                className="min-h-[68px] flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-teal-300 shadow-2xs hover:shadow-sm active:scale-95 transition-all text-center group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.bg} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-teal-700 transition-colors truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MedicalDashboardHero);
