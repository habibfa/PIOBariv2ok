import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  ShieldAlert,
  Sparkles,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Code,
  Trash2,
  Zap,
  Sliders,
  ChevronRight,
  Database
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  CustomEventRecord,
  getSavedCustomEvents,
  trackCustomEvent,
  subscribeToAnalyticsEvents,
  clearAllCustomEvents,
  exportEventsToCSV,
  exportEventsToJSON,
  getTrafficSources,
  getGeoDistribution,
  getDeviceBreakdown,
  getHourlyTrafficCurve,
  getDailyTrafficCurve,
  getMonthlyTrafficCurve,
  getLiveModuleViews
} from "../services/analyticsService";

export const AdminWebAnalytics: React.FC = () => {
  // Time frame
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [events, setEvents] = useState<CustomEventRecord[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(44);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventModal, setSelectedEventModal] = useState<CustomEventRecord | null>(null);

  // Custom Event Creator state
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [customEventName, setCustomEventName] = useState<string>("");
  const [customEventCategory, setCustomEventCategory] = useState<'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom'>('custom');
  const [customEventLabel, setCustomEventLabel] = useState<string>("");
  const [customEventMetaKey, setCustomEventMetaKey] = useState<string>("target");
  const [customEventMetaVal, setCustomEventMetaVal] = useState<string>("bangsal_icu");
  const [creationSuccess, setCreationSuccess] = useState<boolean>(false);

  // Load events & subscribe
  useEffect(() => {
    setEvents(getSavedCustomEvents());

    const unsubscribe = subscribeToAnalyticsEvents((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 249)]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Simulate subtle real-time active users fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return Math.max(34, Math.min(62, next));
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (activeCategoryFilter !== "all" && ev.category !== activeCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ev.eventName.toLowerCase().includes(q);
        const matchLabel = ev.label.toLowerCase().includes(q);
        const matchCity = ev.city.toLowerCase().includes(q);
        if (!matchName && !matchLabel && !matchCity) return false;
      }
      return true;
    });
  }, [events, activeCategoryFilter, searchQuery]);

  // Aggregate stats from events
  const stats = useMemo(() => {
    const criticalCount = events.filter((e) => e.category === "safety" || e.eventName.includes("interaction")).length;
    const clinicalCount = events.filter((e) => e.category === "clinical").length;
    const totalTodayViews = 18450 + events.length * 3;
    const uniqueSessions = 3890 + Math.floor(events.length * 0.8);

    return {
      activeUsers,
      totalTodayViews,
      uniqueSessions,
      customEventsCount: events.length,
      criticalCount,
      clinicalCount
    };
  }, [events, activeUsers]);

  // Chart data based on selected time range
  const chartData = useMemo(() => {
    if (timeRange === "24h") return getHourlyTrafficCurve();
    if (timeRange === "7d") return getDailyTrafficCurve();
    return getMonthlyTrafficCurve();
  }, [timeRange]);

  // Event category counts for bar chart
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      clinical: 0,
      safety: 0,
      navigation: 0,
      conversion: 0,
      custom: 0
    };
    events.forEach((e) => {
      if (counts[e.category] !== undefined) {
        counts[e.category]++;
      } else {
        counts.custom++;
      }
    });

    return [
      { name: "Klinis (Dosis/Obat)", count: counts.clinical, fill: "#0d9488" },
      { name: "Safety (Interaksi DDI)", count: counts.safety, fill: "#e11d48" },
      { name: "Navigasi & Faskes", count: counts.navigation, fill: "#0284c7" },
      { name: "Konversi (Unduh PDF)", count: counts.conversion, fill: "#7c3aed" },
      { name: "Custom Event Kustom", count: counts.custom, fill: "#f59e0b" }
    ];
  }, [events]);

  const trafficSources = useMemo(() => getTrafficSources(), []);
  const geoDistribution = useMemo(() => getGeoDistribution(), []);
  const deviceBreakdown = useMemo(() => getDeviceBreakdown(), []);
  const liveModules = useMemo(() => getLiveModuleViews(), []);

  // Handle custom event dispatch
  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEventName.trim()) return;

    const meta: Record<string, any> = {};
    if (customEventMetaKey.trim()) {
      meta[customEventMetaKey.trim()] = customEventMetaVal.trim();
    }

    trackCustomEvent(customEventName.trim().toLowerCase().replace(/\s+/g, "_"), {
      category: customEventCategory,
      label: customEventLabel.trim() || `Custom Tracked Event: ${customEventName}`,
      metadata: meta
    });

    setCreationSuccess(true);
    setTimeout(() => setCreationSuccess(false), 2500);
    setCustomEventName("");
    setCustomEventLabel("");
    setIsCreatorOpen(false);
  };

  // Quick preset dispatchers
  const triggerQuickEvent = (name: string, cat: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom', label: string, meta: Record<string, any>) => {
    trackCustomEvent(name, {
      category: cat,
      label,
      metadata: meta
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "safety":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "clinical":
        return "bg-teal-50 text-teal-700 border-teal-200/80";
      case "conversion":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "navigation":
        return "bg-sky-50 text-sky-700 border-sky-200/80";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Global Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              Real-time Traffic Telemetry
            </span>
            <span className="text-xs text-slate-400">Web Analytics Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-teal-400" />
            Web Analytics & Insights Pengunjung
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pantau arus lalu lintas real-time, aktivitas fasilitas farmasi, dan pelacakan interaksi kustom (*Custom Events*) di seluruh sistem secara langsung.
          </p>
        </div>

        {/* Time range selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setTimeRange("24h")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "24h"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              24 Jam
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "7d"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "30d"
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatorOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Track Custom Event
          </button>

          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 hidden group-hover:block z-30">
              <button
                type="button"
                onClick={() => exportEventsToCSV(events)}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Unduh Format CSV
              </button>
              <button
                type="button"
                onClick={() => exportEventsToJSON(events)}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Unduh Format JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Key Real-time Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Real-time Active Visitors */}
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg border border-teal-400/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-100 uppercase tracking-wider">Aktif Saat Ini</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{stats.activeUsers}</span>
            <span className="text-xs text-teal-100 font-semibold">pengguna online</span>
          </div>
          <p className="mt-2 text-[11px] text-teal-100/90 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% dibandingkan jam sibuk kemarin
          </p>
        </div>

        {/* Metric 2: Total Page Views */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kunjungan</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {stats.totalTodayViews.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats.uniqueSessions.toLocaleString("id-ID")} Sesi Klinis Unik</span>
              <span className="text-emerald-600 font-bold">+12.6%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Custom Events Tracked */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Events</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {stats.customEventsCount.toLocaleString("id-ID")}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats.clinicalCount} aksi klinis tercatat</span>
              <span className="text-purple-600 font-bold">100% Terpantau</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Safety & DDI Interventions */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peringatan Kritis DDI</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-600 tracking-tight">
              {stats.criticalCount}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Potensi risiko interaksi dicegah</span>
              <span className="text-rose-600 font-bold">Safety Guard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section 1: Real-Time Traffic & Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Traffic Curve Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Tren Lalu Lintas Pengunjung & Interaksi
              </h2>
              <p className="text-xs text-slate-500">
                Visualisasi dinamika pengunjung aktif, tampilan halaman, dan *custom events* ({timeRange === "24h" ? "24 Jam Terakhir" : timeRange === "7d" ? "7 Hari Terakhir" : "30 Hari Terakhir"}).
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
              Data Diperbarui Otomatis
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={timeRange === "24h" ? "time" : timeRange === "7d" ? "day" : "week"}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Tampilan Halaman (Pageviews)"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPageViews)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Pengunjung Unik (Visitors)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Live Module Distribution */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              Modul Terpopuler (Real-Time)
            </h2>
            <p className="text-xs text-slate-500">
              Distribusi pengguna yang sedang mengakses modul saat ini
            </p>
          </div>

          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {liveModules.map((item) => {
              const maxActive = Math.max(...liveModules.map((m) => m.activeNow));
              const pct = Math.round((item.activeNow / maxActive) * 100);
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">{item.module}</span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {item.activeNow} <span className="text-[10px] text-slate-400 font-normal">online</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Rata-rata Durasi Sesi:</span>
            <span className="font-bold text-teal-700">4 Menit 38 Detik</span>
          </div>
        </div>
      </div>

      {/* Main Section 2: Traffic Breakdown (Sources, Geography, Devices) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Traffic Sources / Referrers */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              Sumber Lalu Lintas (Referrers)
            </h3>
            <p className="text-[11px] text-slate-500">Kanal kedatangan tenaga medis & apoteker</p>
          </div>
          <div className="space-y-3">
            {trafficSources.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="space-y-0.5 truncate pr-2">
                  <p className="font-bold text-slate-800 truncate">{src.source}</p>
                  <p className="text-[10px] text-slate-400">{src.visitors.toLocaleString("id-ID")} kunjungan</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-700">{src.percentage}%</span>
                  <p className="text-[10px] font-bold text-emerald-600">{src.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Indonesian Geographical Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" />
              Sebaran Geografis (Indonesia)
            </h3>
            <p className="text-[11px] text-slate-500">Kota dengan akses faskes & apotek tertinggi</p>
          </div>
          <div className="space-y-2.5">
            {geoDistribution.slice(0, 5).map((geo, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{geo.city}, {geo.province}</span>
                  <span className="font-bold text-slate-900">{geo.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${geo.percentage * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Devices & Technology */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              Perangkat & Browser
            </h3>
            <p className="text-[11px] text-slate-500">Platform akses operasional faskes</p>
          </div>
          <div className="space-y-3">
            {deviceBreakdown.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {dev.type.includes("Mobile") ? (
                    <Smartphone className="w-4 h-4 text-slate-600" />
                  ) : dev.type.includes("Desktop") ? (
                    <Laptop className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Tablet className="w-4 h-4 text-slate-600" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800">{dev.type.split(" ")[0]}</p>
                    <p className="text-[10px] text-slate-400">{dev.count.toLocaleString("id-ID")} pengguna</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-800">{dev.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Section 3: Deeper Insights With Custom Events */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Deeper Insights with Custom Events
            </h2>
            <p className="text-xs text-slate-500">
              Pelacakan interaksi mendalam klinis, pencarian obat, skrining interaksi, dan aksi pengguna (*Real-Time Event Stream*).
            </p>
          </div>

          {/* Quick Simulation Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => triggerQuickEvent("interaction_screen", "safety", "Skrining Resep Polifarmasi (>3 Obat)", { drugs: ["Aspirin", "Warfarin", "Ibuprofen"], severity: "CRITICAL" })}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
            >
              + Simulasikan DDI Alert
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("dose_calculate", "clinical", "Perhitungan Dosis Antibiotik Neonatus", { weightKg: 3.2, gestationalWeeks: 38, drug: "Gentamicin" })}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-colors"
            >
              + Simulasikan Dosis Dihitung
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("pdf_export", "conversion", "Cetak Rekomendasi Farmakoterapi PDF", { pageCount: 2, recipient: "Sp.A" })}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors"
            >
              + Simulasikan Export PDF
            </button>
          </div>
        </div>

        {/* Event Breakdown Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Volume Berdasarkan Kategori Event
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Membedah interaksi spesifik tenaga farmasi dalam mendeteksi bahaya interaksi, kalkulasi dosis, navigasi faskes, serta konversi unduhan laporan klinis.
            </p>
            <div className="pt-2 space-y-2">
              {categoryCounts.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{cat.count} aksi</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="count" name="Jumlah Event" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Event Stream Filter & Search */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Kategori:
              </span>
              {(["all", "clinical", "safety", "navigation", "conversion", "custom"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize ${
                    activeCategoryFilter === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat === "all" ? "Semua" : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari event, label, kota..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Real-time Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/50">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Label / Deskripsi Aktivitas</th>
                  <th className="py-3 px-4">Lokasi & Platform</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 bg-white">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada custom event yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.slice(0, 20).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(ev.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {ev.eventName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(ev.category)}`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {ev.label}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{ev.city}</span>
                          <span className="text-slate-300">•</span>
                          <span>{ev.device}</span>
                          <span className="text-[10px] text-slate-400">({ev.browser})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEventModal(ev)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Code className="w-3 h-3 text-slate-500" />
                          Payload
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Menampilkan {Math.min(20, filteredEvents.length)} dari {filteredEvents.length} event tersimpan</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin mereset riwayat custom event telemetri?")) {
                  clearAllCustomEvents();
                  setEvents(getSavedCustomEvents());
                }
              }}
              className="text-rose-600 hover:text-rose-700 text-xs font-bold inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Event Log
            </button>
          </div>
        </div>
      </div>

      {/* Main Section 4: "Track Whatever is Relevant for Website" */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Goal & Interaction Tracker
            </span>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-700" />
              Track Whatever is Relevant for Website
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Buat dan definisikan target pelacakan baru kapan saja tanpa mengubah kode. Lacak kampanye farmasi, konversi konsultasi apoteker, pelaporan efek samping, hingga kepatuhan obat khusus.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Tracker Baru
          </button>
        </div>

        {/* Quick Recommended Tracker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div
            onClick={() => triggerQuickEvent("faskes_referral_click", "conversion", "Rujukan Rumah Sakit Faskes Tingkat Lanjut", { faskesType: "Hospital", kelas: "A" })}
            className="p-4 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Rujukan Faskes Lanjutan
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lacak klik rekomendasi rumah sakit tipe A/B dari pencarian peta.</p>
          </div>

          <div
            onClick={() => triggerQuickEvent("geriatric_fall_risk_check", "safety", "Skrining Risiko Jatuh Obat Sedatif Geriatri", { ageYears: 74, drugs: ["Diazepam", "Amitriptyline"] })}
            className="p-4 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Skrining Risiko Jatuh Geriatri
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lacak deteksi kombinasi obat penenang/sedatif berisiko pada lansia.</p>
          </div>

          <div
            onClick={() => triggerQuickEvent("antimicrobial_stewardship", "clinical", "Evaluasi Restriksi Fornas Antibiotik Reserve", { drug: "Meropenem", indication: "Sepsis" })}
            className="p-4 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                Antimicrobial Stewardship (PPA)
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lacak pencatatan kepatuhan restriksi antibiotik lini ketiga FORNAS.</p>
          </div>
        </div>
      </div>

      {/* Modal: Custom Event Creator */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  Kirim Custom Event Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Lacak parameter baru secara real-time pada sistem telemetri website
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Event (Identifier) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: resep_polifarmasi_screen, klik_wa_apoteker"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Event
                  </label>
                  <select
                    value={customEventCategory}
                    onChange={(e) => setCustomEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="clinical">Klinis (Dosis/Obat)</option>
                    <option value="safety">Safety (Interaksi/Alergi)</option>
                    <option value="navigation">Navigasi (Peta/Menu)</option>
                    <option value="conversion">Konversi (Unduh/Daftar)</option>
                    <option value="custom">Custom Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Keterangan
                  </label>
                  <input
                    type="text"
                    placeholder="Deskripsi singkat aksi..."
                    value={customEventLabel}
                    onChange={(e) => setCustomEventLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Metadata key-value */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Tambahan Metadata Payload (Key - Value)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Key (misal: dept, obat)"
                    value={customEventMetaKey}
                    onChange={(e) => setCustomEventMetaKey(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Value (misal: bangsal_icu, amox)"
                    value={customEventMetaVal}
                    onChange={(e) => setCustomEventMetaVal(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Kirim & Lacak Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Raw JSON Payload */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Detail Telemetri Event
                </span>
                <h3 className="text-base font-bold text-slate-800 font-mono">
                  {selectedEventModal.eventName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ID Telemetri:</span>
                <span className="font-mono text-slate-800">{selectedEventModal.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-800">{new Date(selectedEventModal.timestamp).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Label:</span>
                <span className="font-medium text-slate-800">{selectedEventModal.label}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kota & Perangkat:</span>
                <span className="font-medium text-slate-800">{selectedEventModal.city} ({selectedEventModal.device} - {selectedEventModal.browser})</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">Metadata JSON Payload:</span>
              <pre className="p-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                {JSON.stringify(selectedEventModal.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebAnalytics;
