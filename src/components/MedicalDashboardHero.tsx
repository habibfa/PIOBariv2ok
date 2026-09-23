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
  Sparkle,
  Search,
  X
} from 'lucide-react';

interface MedicalDashboardHeroProps {
  onNavigateTab: (tab: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalDrugsCount?: number;
}

export default function MedicalDashboardHero({
  onNavigateTab,
  searchQuery = "",
  onSearchChange,
  totalDrugsCount = 930
}: MedicalDashboardHeroProps) {
  return (
    <div className="w-full space-y-6 mb-8">
      {/* 3D Healthcare Hero Greeting & Search */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 shadow-[0_12px_40px_rgba(13,148,136,0.06)]">
        {/* Soft 3D Ambient Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-rose-200/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-800 tracking-wide uppercase">
                RSUD Palembang BARI • Portal Kefarmasian Klinis
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
              Pusat Informasi Obat & Keamanan Resep
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Panduan terintegrasi untuk Apoteker, Dokter, Perawat dan Tenaga Kesehatan lainnya. Dilengkapi kalkulator klirens ginjal, skrining polifarmasi, kompatibilitas IV, dan Formularium Nasional.
            </p>
          </div>
        </div>

        {/* Quick Search Bar directly in Hero Greeting */}
        {onSearchChange && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Pencarian Cepat Obat (Nama Generik / Merek Dagang)</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 w-fit">
                {totalDrugsCount}+ Obat Terdaftar
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  onNavigateTab("desc");
                }}
                placeholder="Cari obat berdasarkan nama generik atau merek dagang (cth: Parasetamol, Sanmol, Bisoprolol, Concor, Lasix)..."
                className="w-full bg-white/95 border-2 border-emerald-100 hover:border-emerald-300 focus:border-emerald-500 rounded-2xl py-3 pl-11 pr-10 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cari Cepat:</span>
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
                  className={`text-[10px] px-2.5 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === chip.q.toLowerCase()
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                      : "bg-white/80 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200/80 hover:border-emerald-200"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3D "Health Overview" Bento Grid (Inspired by Reference Design) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Ringkasan Layanan Klinis</h2>
          </div>
          <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            Sistem Aktif & Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Skrining Multi-Obat & Interaksi */}
          <div 
            onClick={() => onNavigateTab("ddi")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card glass-card-hover p-5 hover:border-rose-300/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 to-rose-100/80 border border-rose-200/60 flex items-center justify-center shadow-inner text-rose-600 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                100% Siaga
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
              Skrining Interaksi
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
              Deteksi otomatis risiko interaksi mayor, moderat, & minor antar obat bersamaan.
            </p>
          </div>

          {/* Card 2: Katalog & Dosis Obat */}
          <div 
            onClick={() => onNavigateTab("desc")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card glass-card-hover p-5 hover:border-teal-300/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-100/80 border border-teal-200/60 flex items-center justify-center shadow-inner text-teal-600 group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                {totalDrugsCount}+ Obat
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
              Informasi Obat
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
              Dosis standar, indikasi, kontraindikasi, dan kategori keamanan kehamilan FDA.
            </p>
          </div>

          {/* Card 3: Kalkulator Medis Ginjal & Pediatrik */}
          <div 
            onClick={() => onNavigateTab("medcalc")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card glass-card-hover p-5 hover:border-sky-300/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-sky-100/80 border border-sky-200/60 flex items-center justify-center shadow-inner text-sky-600 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                eGFR & CrCl
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
              Kalkulator Medis
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
              Cockcroft-Gault, CKD-EPI, penyesuaian dosis gangguan ginjal & pediatrik.
            </p>
          </div>

          {/* Card 4: Asisten AI & Rekam SOAP */}
          <div 
            onClick={() => onNavigateTab("soap")}
            className="group relative cursor-pointer overflow-hidden rounded-3xl glass-card glass-card-hover p-5 hover:border-purple-300/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-violet-100/80 border border-purple-200/60 flex items-center justify-center shadow-inner text-purple-600 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                AI Terintegrasi
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center justify-between">
              Clinical SOAP & AI
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
              Penyusunan catatan rekam farmasi klinis dan konsultasi obat berbasis AI.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Squircle "Quick Actions" (Matching the reference's 4-column quick action row) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Menu Cepat (Quick Actions)</h2>
          <span className="text-[11px] text-slate-400 font-medium">Klik untuk akses langsung</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: "desc", label: "Katalog Obat", icon: Pill, color: "teal", bg: "bg-teal-50 text-teal-700 border-teal-200/60" },
            { id: "ddi", label: "Skrining DDI", icon: ShieldAlert, color: "rose", bg: "bg-rose-50 text-rose-700 border-rose-200/60" },
            { id: "medcalc", label: "Kalkulator", icon: Calculator, color: "sky", bg: "bg-sky-50 text-sky-700 border-sky-200/60" },
            { id: "iv", label: "Injeksi IV", icon: Droplets, color: "cyan", bg: "bg-cyan-50 text-cyan-700 border-cyan-200/60" },
            { id: "soap", label: "Form SOAP", icon: FileText, color: "indigo", bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60" },
            { id: "fornas", label: "Fornas 2025", icon: BookOpen, color: "emerald", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
            { id: "diseases", label: "Penyakit", icon: Stethoscope, color: "amber", bg: "bg-amber-50 text-amber-700 border-amber-200/60" },
            { id: "map", label: "Peta Faskes", icon: MapPin, color: "teal", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateTab(item.id)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl glass-pill shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all text-center group"
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-inner ${item.bg} group-hover:scale-105 transition-transform`}>
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
