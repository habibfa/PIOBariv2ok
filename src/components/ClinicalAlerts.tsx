import React from "react";
import { ValidationAlert, AlertLevel } from "../types";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ClinicalAlertsProps {
  alerts: ValidationAlert[];
}

export default function ClinicalAlerts({ alerts }: ClinicalAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div id="no-alerts-card" className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 text-emerald-800 flex items-center gap-3">
        <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Parameter Berada dalam Batas Klinis Aman</h4>
          <p className="text-xs text-emerald-700/90 mt-0.5">Tidak ada batas keamanan major atau indikator fisiologi ekstrem yang terpicu.</p>
        </div>
      </div>
    );
  }

  // Sort alerts: CRITICAL first, then WARNING, then INFO
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { [AlertLevel.CRITICAL]: 3, [AlertLevel.WARNING]: 2, [AlertLevel.INFO]: 1 };
    return priority[b.level] - priority[a.level];
  });

  return (
    <div id="clinical-alerts-container" className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
        Sistem Deteksi Keamanan Aktif ({alerts.length})
      </h3>
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {sortedAlerts.map((alert) => {
          const isCritical = alert.level === AlertLevel.CRITICAL;
          const isWarning = alert.level === AlertLevel.WARNING;

          let bgClass = "bg-emerald-50/60 border-emerald-100 text-emerald-900";
          let iconColor = "text-emerald-500";
          let badgeBg = "bg-emerald-100 text-emerald-700";
          let badgeLabel = "INFO";
          let IconComponent = Info;

          if (isCritical) {
            bgClass = "bg-rose-50/70 border-rose-100 text-rose-950";
            iconColor = "text-rose-600";
            badgeBg = "bg-rose-100 text-rose-700";
            badgeLabel = "MAJOR";
            IconComponent = AlertCircle;
          } else if (isWarning) {
            bgClass = "bg-amber-50/70 border-amber-100 text-amber-950";
            iconColor = "text-amber-600";
            badgeBg = "bg-amber-100 text-amber-800";
            badgeLabel = "PERINGATAN";
            IconComponent = AlertTriangle;
          }

          return (
            <div
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`p-3.5 rounded-xl border ${bgClass} transition-all duration-200 flex items-start gap-3`}
            >
              <div className={`p-1.5 rounded-lg bg-white shadow-xs ${iconColor} shrink-0 mt-0.5`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold leading-tight">{alert.message}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeBg}`}>
                    {badgeLabel}
                  </span>
                </div>
                {alert.details && (
                  <p className="text-xs opacity-90 leading-relaxed font-sans">{alert.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
