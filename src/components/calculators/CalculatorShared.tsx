import React from "react";
import { RotateCcw, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

interface CalculatorShellProps {
  title: string;
  subtitle: string;
  categoryLabel: string;
  onReset?: () => void;
  references: string[];
  children: React.ReactNode;
}

export function CalculatorShell({
  title,
  subtitle,
  categoryLabel,
  onReset,
  references,
  children,
}: CalculatorShellProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="text-xs font-medium text-teal-700">
            <span>{categoryLabel}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight text-balance">
            {title}
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Input
          </button>
        )}
      </div>

      <div>{children}</div>

      <div className="pt-5 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">Referensi &amp; Pustaka Klinis</h4>
        <ul className="text-[11px] text-slate-500 list-disc pl-4 space-y-1 leading-relaxed">
          {references.map((ref, idx) => (
            <li key={idx}>{ref}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface MetricReadoutProps {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  tone?: "neutral" | "emerald" | "amber" | "rose" | "sky";
}

export function MetricReadout({
  label,
  value,
  unit,
  sublabel,
  tone = "neutral",
}: MetricReadoutProps) {
  const toneStyles: Record<string, { box: string; val: string; sub: string }> = {
    neutral: {
      box: "bg-slate-50 border-slate-200",
      val: "text-slate-900",
      sub: "text-slate-600",
    },
    emerald: {
      box: "bg-emerald-50/70 border-emerald-200",
      val: "text-emerald-800",
      sub: "text-emerald-700",
    },
    amber: {
      box: "bg-amber-50/80 border-amber-200",
      val: "text-amber-800",
      sub: "text-amber-700",
    },
    rose: {
      box: "bg-rose-50/80 border-rose-200",
      val: "text-rose-800",
      sub: "text-rose-700",
    },
    sky: {
      box: "bg-sky-50/80 border-sky-200",
      val: "text-sky-800",
      sub: "text-sky-700",
    },
  };

  const s = toneStyles[tone];

  return (
    <div className={`rounded-xl border p-4 ${s.box}`}>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-2xl md:text-3xl font-bold font-mono tabular-nums tracking-tight ${s.val}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-slate-500">{unit}</span>}
      </div>
      {sublabel && <div className={`text-xs font-medium mt-1.5 leading-snug ${s.sub}`}>{sublabel}</div>}
    </div>
  );
}

interface ClinicalNoteProps {
  level: "info" | "success" | "warning" | "critical";
  title: string;
  children: React.ReactNode;
}

export function ClinicalNote({ level, title, children }: ClinicalNoteProps) {
  const config = {
    info: {
      wrap: "bg-slate-50 border-slate-200 text-slate-700",
      title: "text-slate-900",
      Icon: Info,
      iconColor: "text-sky-600",
    },
    success: {
      wrap: "bg-emerald-50/60 border-emerald-200 text-emerald-900",
      title: "text-emerald-900",
      Icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    warning: {
      wrap: "bg-amber-50/70 border-amber-200 text-amber-950",
      title: "text-amber-900",
      Icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    critical: {
      wrap: "bg-rose-50/80 border-rose-200 text-rose-950",
      title: "text-rose-900",
      Icon: ShieldAlert,
      iconColor: "text-rose-600",
    },
  }[level];

  const Icon = config.Icon;

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${config.wrap}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="text-xs leading-relaxed space-y-1">
        <div className={`font-semibold ${config.title}`}>{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function FormulaBox({ formula, details }: { formula: string; details?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
      <div className="text-[11px] font-semibold text-slate-500">Rumus &amp; Perhitungan</div>
      <div className="text-xs font-mono text-slate-800 break-words">{formula}</div>
      {details && <div className="text-[11px] text-slate-500">{details}</div>}
    </div>
  );
}
