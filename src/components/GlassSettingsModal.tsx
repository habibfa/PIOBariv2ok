import React from 'react';
import { Sliders, Sparkles, Eye, Check } from 'lucide-react';

interface GlassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opacity: number; // 0.2 to 1.0
  onOpacityChange: (val: number) => void;
  blur: number; // 0 to 32
  onBlurChange: (val: number) => void;
}

export default function GlassSettingsModal({
  isOpen,
  onClose,
  opacity,
  onOpacityChange,
  blur,
  onBlurChange
}: GlassSettingsModalProps) {
  if (!isOpen) return null;

  const presets = [
    { label: 'Kristal (Ultra Transparan)', opacity: 0.45, blur: 24, desc: 'Latar belakang sangat tembus pandang dengan pantulan cahaya tinggi' },
    { label: 'Kaca Seimbang (Default)', opacity: 0.82, blur: 16, desc: 'Kombinasi ideal transparansi modern dan keterbacaan data medis' },
    { label: 'Frosted Glass (Solid Halus)', opacity: 0.94, blur: 10, desc: 'Kontras teks maksimal dengan efek buram lembut di tepi' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/90 relative overflow-hidden transition-all"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${Math.max(opacity, 0.75)})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`
        }}
      >
        {/* Glow ambient background inside modal */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-rose-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-inner">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Kustomisasi Glassmorphism</h3>
                <p className="text-[11px] font-medium text-slate-500">Atur tingkat transparansi & keburaman latar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Sliders Area */}
          <div className="space-y-5">
            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  Transparansi Kaca (Opacity)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-mono text-xs border border-teal-200/60">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.98"
                step="0.02"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Lebih Transparan (30%)</span>
                <span>Lebih Solid (98%)</span>
              </div>
            </div>

            {/* Blur Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Efek Keburaman (Backdrop Blur)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-mono text-xs border border-sky-200/60">
                  {blur} px
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={blur}
                onChange={(e) => onBlurChange(parseInt(e.target.value, 10))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Halus / Lembut (4px)</span>
                <span>Buram Kuat (32px)</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Preset Cepat</label>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((p, idx) => {
                const isActive = Math.abs(opacity - p.opacity) < 0.05 && Math.abs(blur - p.blur) <= 2;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onOpacityChange(p.opacity);
                      onBlurChange(p.blur);
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-teal-50/80 border-teal-500 shadow-2xs' 
                        : 'bg-white/60 hover:bg-white/90 border-slate-200/80'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {p.label}
                        {isActive && <Check className="w-3.5 h-3.5 text-teal-600 inline" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-1 bg-slate-100/90 text-slate-600 rounded-lg shrink-0 ml-2">
                      {Math.round(p.opacity * 100)}% / {p.blur}px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 active:scale-98 transition-all"
            >
              Simpan & Terapkan Tampilan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
