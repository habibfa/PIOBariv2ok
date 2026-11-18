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
  Database,
  MapPin,
  Building2,
  Hospital,
  Navigation,
  Compass,
  Layers,
  Map,
  Server,
  Wifi,
  WifiOff,
  Check,
  FileText
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
  getLiveModuleViews,
  getPalembangDistrictsTraffic,
  getSumselRegenciesTraffic,
  getSumselFaskesNetwork,
  getSumselSummaryMetrics,
  PALEMBANG_DISTRICTS,
  SUMSEL_REGENCIES,
  PalembangDistrictTraffic,
  SumselRegencyTraffic,
  SumselFaskesReferral,
  fetchRealAnalyticsStats,
  fetchRealEvents,
  resetServerDatabase,
  sendHeartbeat,
  setSelectedFaskesCity,
  getSelectedOrDetectedCity,
  detectRealClientLocation,
  getDetectedClientGeoMeta
} from "../services/analyticsService";

export const AdminWebAnalytics: React.FC = () => {
  // Time frame
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [events, setEvents] = useState<CustomEventRecord[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeRegionFilter, setActiveRegionFilter] = useState<"all" | "palembang" | "sumsel_other" | "outside">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventModal, setSelectedEventModal] = useState<CustomEventRecord | null>(null);

  // Real Server Engine States
  const [serverStats, setServerStats] = useState<any>(null);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Memuat...");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [detectedClientGeo, setDetectedClientGeo] = useState<{
    ip?: string;
    city?: string;
    province?: string;
    isp?: string;
    formatted?: string;
  } | null>(() => getDetectedClientGeoMeta());

  // Regional Focus View state - default card2GeoScope to "nasional" so real cities outside Palembang are immediately shown
  const [geoTab, setGeoTab] = useState<"palembang" | "sumsel" | "faskes">("palembang");
  const [card2GeoScope, setCard2GeoScope] = useState<"palembang" | "sumsel" | "nasional">("nasional");

  // Custom Event Creator state - empty string means use real IP-detected location
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [customEventName, setCustomEventName] = useState<string>("");
  const [customEventCategory, setCustomEventCategory] = useState<'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom'>('custom');
  const [customEventLabel, setCustomEventLabel] = useState<string>("");
  const [customEventCity, setCustomEventCity] = useState<string>("");
  const [customEventMetaKey, setCustomEventMetaKey] = useState<string>("target");
  const [customEventMetaVal, setCustomEventMetaVal] = useState<string>("bangsal_icu");
  const [creationSuccess, setCreationSuccess] = useState<boolean>(false);

  // Fetch real data from server
  const refreshServerData = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const data = await fetchRealAnalyticsStats(timeRange);
      const ping = Math.max(1, Math.round(performance.now() - start));
      setLatencyMs(ping);
      if (data) {
        setServerStats(data);
        setIsServerConnected(true);
        if (typeof data.activeUsersNow === "number") {
          setActiveUsers(data.activeUsersNow);
        }
      } else {
        setIsServerConnected(false);
      }
      const remoteEvents = await fetchRealEvents({ limit: 150 });
      if (remoteEvents && remoteEvents.length > 0) {
        setEvents(remoteEvents);
      }
      setLastSyncTime(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      console.warn("Analytics server offline fallback:", e);
      setIsServerConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load events & subscribe
  useEffect(() => {
    // Detect real client location via IP
    detectRealClientLocation().then(() => {
      const meta = getDetectedClientGeoMeta();
      if (meta) setDetectedClientGeo(meta);
    });
    // Initial local read
    setEvents(getSavedCustomEvents());
    // Initial server fetch
    refreshServerData();

    const unsubscribe = subscribeToAnalyticsEvents((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 249)]);
      if (serverStats) {
        setServerStats((prev: any) => prev ? {
          ...prev,
          customEventsCount: (prev.customEventsCount || 0) + 1,
          pageViewsToday: newEvent.eventName === "page_view" ? (prev.pageViewsToday || 0) + 1 : prev.pageViewsToday
        } : prev);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [timeRange]);

  // Periodic Auto-Sync with Real Database Engine (every 5 seconds)
  useEffect(() => {
    if (!autoSync) return;
    const timer = setInterval(() => {
      refreshServerData();
    }, 5000);
    return () => clearInterval(timer);
  }, [autoSync, timeRange]);

  // Quick Action Handler for Live Telemetry Testing
  const handleQuickLiveAction = (
    name: string,
    cat: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom',
    label: string,
    meta: Record<string, any>
  ) => {
    const ev = trackCustomEvent(name, {
      category: cat,
      label,
      metadata: meta,
      city: customEventCity
    });
    setToastMessage(`Berhasil mengirim: "${label}" ke database server real-time!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset Server Database
  const handleResetDatabase = async () => {
    await resetServerDatabase();
    setIsResetConfirmOpen(false);
    await refreshServerData();
    setToastMessage("Database telemetri server berhasil di-reset ke baseline aktif.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (activeCategoryFilter !== "all" && ev.category !== activeCategoryFilter) {
        return false;
      }
      if (activeRegionFilter === "palembang") {
        if (!ev.city.toLowerCase().includes("palembang")) return false;
      } else if (activeRegionFilter === "sumsel_other") {
        const isPalembang = ev.city.toLowerCase().includes("palembang");
        const isSumsel = ev.city.includes("Sumatera Selatan") ||
          ["ogan", "banyuasin", "oki", "prabumulih", "muara", "lahat", "lubuklinggau", "baturaja", "sekayu", "pagar alam", "pali", "empat lawang", "muratara"].some(k => ev.city.toLowerCase().includes(k));
        if (isPalembang || !isSumsel) return false;
      } else if (activeRegionFilter === "outside") {
        const isSumsel = ev.city.toLowerCase().includes("palembang") ||
          ev.city.includes("Sumatera Selatan") ||
          ["ogan", "banyuasin", "oki", "prabumulih", "muara", "lahat", "lubuklinggau", "baturaja", "sekayu", "pagar alam", "pali", "empat lawang", "muratara"].some(k => ev.city.toLowerCase().includes(k));
        if (isSumsel) return false;
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
  }, [events, activeCategoryFilter, activeRegionFilter, searchQuery]);

  // Aggregate stats from real server database with smooth fallback
  const stats = useMemo(() => {
    const criticalCount = events.filter((e) => e.category === "safety" || e.eventName.includes("interaction")).length;
    const clinicalCount = events.filter((e) => e.category === "clinical").length;

    if (serverStats) {
      return {
        activeUsers: serverStats.activeUsersNow ?? activeUsers,
        totalTodayViews: serverStats.pageViewsToday ?? events.length,
        uniqueSessions: serverStats.uniqueSessionsToday ?? Math.max(1, Math.floor(events.length * 0.4)),
        customEventsCount: serverStats.customEventsCount ?? events.length,
        criticalCount: serverStats.criticalAlertsCount ?? criticalCount,
        clinicalCount: serverStats.clinicalCount ?? clinicalCount
      };
    }

    const totalTodayViews = Math.max(events.length, 1);
    const uniqueSessions = Math.max(Math.floor(events.length * 0.4), 1);

    return {
      activeUsers,
      totalTodayViews,
      uniqueSessions,
      customEventsCount: events.length,
      criticalCount,
      clinicalCount
    };
  }, [events, activeUsers, serverStats]);

  // Chart data based on selected time range (using real curve from server when available)
  const chartData = useMemo(() => {
    if (serverStats) {
      if (timeRange === "24h" && serverStats.hourlyTraffic && serverStats.hourlyTraffic.length > 0) {
        return serverStats.hourlyTraffic.map((item: any) => {
          if (item.timestamp) {
            try {
              const formattedTime = new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              }).format(new Date(item.timestamp));
              return { ...item, time: formattedTime };
            } catch {
              return item;
            }
          }
          return item;
        });
      }
      if (timeRange === "7d" && serverStats.dailyTraffic && serverStats.dailyTraffic.length > 0) {
        return serverStats.dailyTraffic;
      }
      if (timeRange === "30d" && serverStats.monthlyTraffic && serverStats.monthlyTraffic.length > 0) {
        return serverStats.monthlyTraffic;
      }
    }
    if (timeRange === "24h") return getHourlyTrafficCurve();
    if (timeRange === "7d") return getDailyTrafficCurve();
    return getMonthlyTrafficCurve();
  }, [timeRange, serverStats]);

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

  const trafficSources = useMemo(() => {
    if (serverStats && serverStats.trafficSources && serverStats.trafficSources.length > 0) {
      return serverStats.trafficSources;
    }
    return getTrafficSources();
  }, [serverStats]);

  const geoDistribution = useMemo(() => {
    if (serverStats && serverStats.geoDistribution && serverStats.geoDistribution.length > 0) {
      return serverStats.geoDistribution;
    }
    return getGeoDistribution();
  }, [serverStats]);
  const deviceBreakdown = useMemo(() => {
    if (serverStats && serverStats.deviceBreakdown) {
      return serverStats.deviceBreakdown;
    }
    return getDeviceBreakdown();
  }, [serverStats]);
  const liveModules = useMemo(() => {
    if (serverStats && serverStats.liveModules) {
      return serverStats.liveModules;
    }
    return getLiveModuleViews();
  }, [serverStats]);

  // Regional South Sumatra & Palembang Datasets (Synced with real live database)
  const palembangDistricts = useMemo(() => {
    if (serverStats && serverStats.palembangDistricts) {
      return serverStats.palembangDistricts;
    }
    return getPalembangDistrictsTraffic();
  }, [serverStats]);

  const sumselRegencies = useMemo(() => {
    if (serverStats && serverStats.sumselRegencies) {
      return serverStats.sumselRegencies;
    }
    return getSumselRegenciesTraffic();
  }, [serverStats]);

  const sumselFaskes = useMemo(() => {
    if (serverStats && serverStats.sumselFaskes) {
      return serverStats.sumselFaskes;
    }
    return getSumselFaskesNetwork();
  }, [serverStats]);

  const sumselStats = useMemo(() => {
    if (serverStats && serverStats.sumselStats) {
      return serverStats.sumselStats;
    }
    return getSumselSummaryMetrics();
  }, [serverStats]);

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
      metadata: meta,
      city: customEventCity
    });

    setCreationSuccess(true);
    setTimeout(() => setCreationSuccess(false), 2500);
    setCustomEventName("");
    setCustomEventLabel("");
    setIsCreatorOpen(false);
  };

  // Quick preset dispatchers
  const triggerQuickEvent = (
    name: string,
    cat: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom',
    label: string,
    meta: Record<string, any>,
    city?: string
  ) => {
    trackCustomEvent(name, {
      category: cat,
      label,
      metadata: meta,
      city: city || customEventCity || getSelectedOrDetectedCity()
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

      {/* Floating Real-time Action Feedback Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-900 text-white border border-emerald-500 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-300 hover:text-white font-bold px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* REAL SERVER DATABASE STATUS & CONTROL BAR */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80">
            {isServerConnected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">
                  Real Server Database Engine (Aktif)
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  Mode Lokal / Offline
                </span>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/50">
            <span className="text-teal-400 font-bold">Penyimpanan:</span>
            <span>data/analytics_store.json</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/50">
            <span className="text-sky-400 font-bold">Latensi:</span>
            <span>{latencyMs} ms</span>
          </div>

          <span className="text-[11px] text-slate-400">
            Sinkronisasi: <strong className="text-slate-200">{lastSyncTime}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              autoSync
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Toggle sinkronisasi data real-time otomatis setiap 5 detik"
          >
            <span className={`w-2 h-2 rounded-full ${autoSync ? "bg-teal-400 animate-ping" : "bg-slate-500"}`}></span>
            Auto-Sync 5s: {autoSync ? "AKTIF" : "OFF"}
          </button>

          <button
            type="button"
            onClick={refreshServerData}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-teal-400" : ""}`} />
            {isRefreshing ? "Menyinkronkan..." : "Muat Ulang"}
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset DB
          </button>
        </div>
      </div>

      {/* REAL-TIME IP GEOLOCATION & ACTIVE VISITOR SESSIONS MONITOR */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white border border-teal-700/50 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                GeoIP Akurat (Tanpa Default Palembang)
              </span>
              {(() => {
                const activeVisitorCity =
                  detectedClientGeo?.formatted ||
                  serverStats?.currentVisitorGeo?.city ||
                  getSelectedOrDetectedCity() ||
                  "Mendeteksi lokasi...";
                const isOutsidePalembang = !activeVisitorCity.toLowerCase().includes("palembang");
                return (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOutsidePalembang
                        ? "bg-indigo-500/20 text-indigo-200 border-indigo-400/40"
                        : "bg-teal-500/20 text-teal-200 border-teal-400/40"
                    }`}
                  >
                    {isOutsidePalembang ? "🌐 Login Terdeteksi di Luar Palembang" : "📍 Login di Dalam Kota Palembang"}
                  </span>
                );
              })()}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              Deteksi Lokasi Login & Sesi Pengunjung Real-Time (Berdasarkan IP Asli)
            </h3>
            <p className="text-xs text-slate-300">
              Sistem kini mendeteksi kota & provinsi asli setiap pengunjung menggunakan resolusi IP publik (GeoIP) tanpa memaksa default ke Palembang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-teal-500/30 shrink-0">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                Lokasi Sesi Anda Saat Ini:
              </span>
              <span className="font-extrabold text-emerald-300">
                {detectedClientGeo?.formatted ||
                  serverStats?.currentVisitorGeo?.city ||
                  getSelectedOrDetectedCity() ||
                  "Kota Padang, Sumatera Barat"}
              </span>
              {(detectedClientGeo?.ip || serverStats?.currentVisitorGeo?.ip) && (
                <span className="ml-2 text-[11px] font-mono text-slate-400">
                  (IP: {detectedClientGeo?.ip || serverStats?.currentVisitorGeo?.ip})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real Visitor Sessions List from store.sessions */}
        {serverStats?.recentSessions && serverStats.recentSessions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-bold uppercase tracking-wider text-teal-300">
                Daftar Sesi Login & Kunjungan Tercatat ({serverStats.recentSessions.length} Sesi Real):
              </span>
              <span className="text-slate-400">Diurutkan dari aktivitas terbaru</span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5">Kota & Provinsi (GeoIP Asli)</th>
                    <th className="py-2.5 px-3.5">Alamat IP</th>
                    <th className="py-2.5 px-3.5">Perangkat & Browser</th>
                    <th className="py-2.5 px-3.5">Modul Terakhir</th>
                    <th className="py-2.5 px-3.5 text-right">Aktivitas Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {serverStats.recentSessions.slice(0, 8).map((sess: any) => {
                    const isPlg = String(sess.city || "").toLowerCase().includes("palembang");
                    const isSumsel =
                      isPlg ||
                      String(sess.city || "").toLowerCase().includes("sumatera selatan") ||
                      String(sess.city || "").toLowerCase().includes("banyuasin") ||
                      String(sess.city || "").toLowerCase().includes("ogan");
                    return (
                      <tr key={sess.sessionId} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3.5 whitespace-nowrap">
                          {sess.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                              Tercatat
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3.5 font-bold">
                          <div className="flex items-center gap-1.5">
                            {isPlg ? (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 border border-teal-500/30 text-[11px]">
                                📍 {sess.city}
                              </span>
                            ) : isSumsel ? (
                              <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-200 border border-sky-500/30 text-[11px]">
                                🏛️ {sess.city}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 text-[11px]">
                                🌐 {sess.city}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3.5 font-mono text-[11px] text-slate-300">
                          {sess.ip || "-"}
                        </td>
                        <td className="py-2 px-3.5 text-[11px] text-slate-300">
                          {sess.device} • {sess.browser}
                        </td>
                        <td className="py-2 px-3.5 text-[11px] text-teal-300 font-semibold">
                          /{sess.currentModule || "home"}
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono text-[11px] text-slate-400">
                          {new Date(sess.lastActive).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QUICK LIVE ACTION TEST TOOLBAR: Dispatch real telemetry with 1 click */}
      <div className="p-5 rounded-3xl bg-white border border-teal-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex p-1 rounded-lg bg-teal-50 text-teal-700">
                <Zap className="w-4 h-4 text-teal-600" />
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                Uji Coba Telemetri Nyata Langsung (Live Clinical Action Test)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Klik aksi klinis di bawah ini untuk mengirim data event asli ke database server real-time dan langsung melihat metrik berubah:
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Lokasi Asal Uji:</span>
            <select
              value={customEventCity}
              onChange={(e) => {
                setCustomEventCity(e.target.value);
                setSelectedFaskesCity(e.target.value);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="">
                🌐 Otomatis Sesuai IP Anda ({detectedClientGeo?.formatted || serverStats?.currentVisitorGeo?.city || getSelectedOrDetectedCity() || "GeoIP Real-Time"})
              </option>
              <optgroup label="🌐 Luar Sumatera Selatan (Nasional)">
                <option value="Kota Padang, Sumatera Barat">Kota Padang, Sumatera Barat</option>
                <option value="Jakarta, DKI Jakarta">Jakarta, DKI Jakarta</option>
                <option value="Kota Bandung, Jawa Barat">Kota Bandung, Jawa Barat</option>
                <option value="Kota Surabaya, Jawa Timur">Kota Surabaya, Jawa Timur</option>
                <option value="Kota Medan, Sumatera Utara">Kota Medan, Sumatera Utara</option>
              </optgroup>
              <optgroup label="📍 Kota Palembang & Sumatera Selatan">
                {PALEMBANG_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "interaction_screen",
                "safety",
                "Skrining Interaksi Ciprofloxacin + Antasida (Precipitate Risk)",
                { severity: "CRITICAL", drugs: ["Ciprofloxacin", "Antasida"] }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            + Skrining DDI (Kritis)
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "dose_calculate",
                "clinical",
                "Perhitungan Dosis Gentamicin Pediatrik 3.2 kg",
                { drug: "Gentamicin", patientWeight: 3.2, unit: "mg" }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            + Hitung Dosis Gentamicin
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "iv_compatibility_check",
                "safety",
                "Uji Kompatibilitas Ceftriaxone + Ringer Laktat Inkompatibel",
                { outcome: "INCOMPATIBLE", precipitateRisk: true }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            + Cek IV Ceftriaxone + RL
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "fornas_lookup",
                "clinical",
                "Pencarian Restriksi Fornas: Meropenem Injeksi Lini 3",
                { drug: "Meropenem", class: "Antibiotik" }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-sky-600" />
            + Cek Fornas Meropenem
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "soap_record",
                "clinical",
                "Dokumentasi Catatan Farmasi SOAP Bangsal Anak",
                { ward: "Bangsal Anak RSUD BARI", validatedBy: "Apoteker Farmasi Klinis" }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            + Simpan SOAP Bangsal
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickLiveAction(
                "pdf_export",
                "conversion",
                "Ekspor Lembar Rekomendasi Farmakoterapi Klinis PDF",
                { format: "A4", recipient: "Dokter Spesialis Sp.A" }
              )
            }
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            + Ekspor Rekomendasi PDF
          </button>
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Kunjungan ({timeRange === "24h" ? "24 Jam" : timeRange === "7d" ? "7 Hari" : "30 Hari"})
            </span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Custom Events ({timeRange === "24h" ? "24 Jam" : timeRange === "7d" ? "7 Hari" : "30 Hari"})
            </span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Peringatan Kritis DDI ({timeRange === "24h" ? "24 Jam" : timeRange === "7d" ? "7 Hari" : "30 Hari"})
            </span>
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
              const maxUsage = Math.max(...liveModules.map((m) => m.totalToday), 1);
              const pct = Math.max(Math.round((item.totalToday / maxUsage) * 100), item.totalToday > 0 ? 5 : 2);
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">{item.module}</span>
                    {item.activeNow > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] shrink-0 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {item.activeNow} online
                      </span>
                    ) : (
                      <span className="font-bold text-slate-800 shrink-0">
                        {item.totalToday.toLocaleString("id-ID")} <span className="text-[10px] text-slate-400 font-normal">akses</span>
                      </span>
                    )}
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
            <span className="font-bold text-teal-700">
              {serverStats?.avgDurationFormatted || "4 Menit 38 Detik"}
            </span>
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

        {/* Card 2: Indonesian & Regional Geographical Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                Sebaran Geografis Akses
              </h3>
              <p className="text-[11px] text-slate-500">Akses spesifik faskes & apotek</p>
            </div>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setCard2GeoScope("palembang")}
                className={`px-2 py-1 rounded-md transition-all ${
                  card2GeoScope === "palembang"
                    ? "bg-teal-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Palembang
              </button>
              <button
                type="button"
                onClick={() => setCard2GeoScope("sumsel")}
                className={`px-2 py-1 rounded-md transition-all ${
                  card2GeoScope === "sumsel"
                    ? "bg-teal-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sumsel
              </button>
              <button
                type="button"
                onClick={() => setCard2GeoScope("nasional")}
                className={`px-2 py-1 rounded-md transition-all ${
                  card2GeoScope === "nasional"
                    ? "bg-teal-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Nasional
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {card2GeoScope === "palembang" ? (
              (() => {
                const maxPct = Math.max(...palembangDistricts.slice(0, 5).map((item: any) => item.percentage), 1);
                return palembangDistricts.slice(0, 5).map((d: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="font-semibold text-slate-800 truncate">{d.district}</span>
                        {d.isHostHospital && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                            BARI
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">{d.percentage}%</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({d.users.toLocaleString("id-ID")})</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${d.isHostHospital ? "bg-teal-600" : "bg-sky-500"}`}
                        style={{ width: `${Math.max(Math.round((d.percentage / maxPct) * 100), 4)}%` }}
                      />
                    </div>
                  </div>
                ));
              })()
            ) : card2GeoScope === "sumsel" ? (
              (() => {
                const maxPct = Math.max(...sumselRegencies.slice(0, 5).map((item: any) => item.percentage), 1);
                return sumselRegencies.slice(0, 5).map((reg: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{reg.regency}</span>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">{reg.percentage}%</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({reg.users.toLocaleString("id-ID")})</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(Math.round((reg.percentage / maxPct) * 100), 4)}%` }}
                      />
                    </div>
                  </div>
                ));
              })()
            ) : (
              (() => {
                const maxPct = Math.max(...geoDistribution.slice(0, 5).map((item: any) => item.percentage), 1);
                return geoDistribution.slice(0, 5).map((geo: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{geo.city}, {geo.province}</span>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900">{geo.percentage}%</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({geo.users.toLocaleString("id-ID")})</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${Math.max(Math.round((geo.percentage / maxPct) * 100), 4)}%` }}
                      />
                    </div>
                  </div>
                ));
              })()
            )}
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

      {/* Dedicated Section: Fokus Wilayah Spesifik Sumatera Selatan & Kota Palembang */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-700/40 space-y-6">
        {/* Header with Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-teal-800/40 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-wide uppercase border border-emerald-500/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Fokus Lokasi Spesifik
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] font-bold border border-teal-500/30">
                Host Utama: RSUD Palembang BARI (Jakabaring)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                {sumselStats.sumselTrafficShare}% Trafik Sumsel
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
                {sumselStats.outsideSumselTrafficShare ?? Math.max(0, Number((100 - (sumselStats.sumselTrafficShare || 0)).toFixed(1)))}% Luar Sumsel / Nasional
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Hospital className="w-6 h-6 text-teal-400" />
              Telemetri Wilayah: Sumatera Selatan, Palembang & Nasional
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Pemantauan real-time lalu lintas pengguna farmasi dan klinisi berdasarkan lokasi IP sesungguhnya—mencakup akses dari luar provinsi (seperti Sumatera Barat & DKI Jakarta), 17 Kabupaten/Kota se-Sumatera Selatan, hingga Kecamatan di Kota Palembang.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-center min-w-[100px]">
              <p className="text-[10px] font-semibold text-indigo-300">Luar Sumsel</p>
              <p className="text-lg font-black text-indigo-200">
                {sumselStats.outsideSumselTrafficShare ?? Math.max(0, Number((100 - (sumselStats.sumselTrafficShare || 0)).toFixed(1)))}%
              </p>
              <p className="text-[9px] text-indigo-300">Nasional (Real IP)</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-900/60 border border-teal-700/40 text-center min-w-[100px]">
              <p className="text-[10px] font-semibold text-teal-300">Pengguna Sumsel</p>
              <p className="text-lg font-black text-white">{sumselStats.sumselTrafficShare}%</p>
              <p className="text-[9px] text-teal-400">Total Provinsi</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-900/60 border border-teal-700/40 text-center min-w-[100px]">
              <p className="text-[10px] font-semibold text-teal-300">Kota Palembang</p>
              <p className="text-lg font-black text-emerald-400">{sumselStats.palembangTrafficShare}%</p>
              <p className="text-[9px] text-slate-300">Pusat Rujukan</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-900/60 border border-teal-700/40 text-center min-w-[100px]">
              <p className="text-[10px] font-semibold text-teal-300">Faskes Terhubung</p>
              <p className="text-lg font-black text-amber-300">{sumselStats.activeFaskesCount}</p>
              <p className="text-[9px] text-slate-300">RS & Puskesmas</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Regional Analysis */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-slate-800/90 border border-slate-700/80">
            <button
              type="button"
              onClick={() => setGeoTab("palembang")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                geoTab === "palembang"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Kecamatan di Kota Palembang
            </button>
            <button
              type="button"
              onClick={() => setGeoTab("sumsel")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                geoTab === "sumsel"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              17 Kab/Kota se-Sumatera Selatan
            </button>
            <button
              type="button"
              onClick={() => setGeoTab("faskes")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                geoTab === "faskes"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              Jejaring RS & Faskes Sumsel
            </button>
          </div>

          <span className="text-[11px] text-teal-300/90 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Terhubung Langsung dengan Unit Farmasi & Bangsal RSUD Palembang BARI
          </span>
        </div>

        {/* Tab Content 1: Palembang Districts */}
        {geoTab === "palembang" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {palembangDistricts.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isHostHospital
                      ? "bg-gradient-to-br from-teal-900/80 to-slate-900 border-teal-500 shadow-md ring-1 ring-teal-400/40"
                      : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {item.district}
                        </h4>
                        {item.isHostHospital && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-400 text-slate-950">
                            HOST
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5">{item.zone}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 shrink-0">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full ${item.isHostHospital ? "bg-teal-400" : "bg-sky-400"}`}
                      style={{ width: `${item.percentage * 2.8}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Sesi:</span>
                      <span className="text-slate-200 font-bold">{item.users.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Aktif Sekarang:</span>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {item.activeNow} klinisi
                      </span>
                    </div>
                    <p className="text-[10px] text-teal-200/90 pt-1 border-t border-slate-700/60 truncate">
                      {item.faskesUtama}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-teal-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                Zona Seberang Ulu I & Jakabaring merupakan klaster interaksi tertinggi karena lokasi operasional utama RSUD Palembang BARI.
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerQuickEvent("district_spotlight_view", "navigation", "Inspeksi Klaster Seberang Ulu & Jakabaring", { district: "Jakabaring", host: "RSUD BARI" });
                  setToastMessage("Data lalu lintas zona Jakabaring & Seberang Ulu I RSUD Palembang BARI berhasil disinkronisasi dengan database!");
                  refreshServerData();
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white text-[11px] font-bold self-start sm:self-auto shrink-0 shadow-sm"
              >
                Sinkronisasi Zona BARI
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: 17 Regencies / Cities of South Sumatra */}
        {geoTab === "sumsel" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Kabupaten / Kota</th>
                    <th className="py-3 px-4">Ibu Kota / Pusat Layanan</th>
                    <th className="py-3 px-4">Total Pengguna</th>
                    <th className="py-3 px-4">Persentase</th>
                    <th className="py-3 px-4">Aktif Sekarang</th>
                    <th className="py-3 px-4">Faskes Jejaring</th>
                    <th className="py-3 px-4 text-right">Tren</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {sumselRegencies.map((reg, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-700/40 transition-colors ${
                        reg.regency.includes("Palembang") ? "bg-teal-950/40 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        {reg.regency.includes("Palembang") ? (
                          <Hospital className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-white font-bold">{reg.regency}</span>
                        {reg.regency.includes("Palembang") && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Pusat
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{reg.capital}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{reg.users.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{reg.percentage}%</span>
                          <div className="w-16 h-1 rounded-full bg-slate-700 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-400"
                              style={{ width: `${Math.min(100, reg.percentage * 1.5)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.activeNow > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-500"
                        }`}>
                          {reg.activeNow > 0 ? `${reg.activeNow} online` : "idle"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{reg.faskesCount} unit</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{reg.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              Menampilkan seluruh 17 Kabupaten/Kota di Provinsi Sumatera Selatan dengan perincian akses telemetri terhadap modul dosis & keselamatan terapi obat.
            </p>
          </div>
        )}

        {/* Tab Content 3: Healthcare Network (RS & Puskesmas Sumsel) */}
        {geoTab === "faskes" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sumselFaskes.map((faskes, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    faskes.type === "RS Daerah (Host)"
                      ? "bg-gradient-to-br from-teal-900/90 to-slate-900 border-teal-500 shadow-md ring-1 ring-teal-400/40"
                      : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      faskes.type === "RS Daerah (Host)"
                        ? "bg-teal-400 text-slate-950"
                        : faskes.type === "RS Rujukan Nasional"
                        ? "bg-sky-400 text-slate-950"
                        : "bg-slate-700 text-slate-200"
                    }`}>
                      {faskes.type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {faskes.activeNow} klinisi online
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-0.5">{faskes.name}</h4>
                  <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    {faskes.location}
                  </p>

                  <div className="pt-2 border-t border-slate-700/60 space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Sesi Akses Hari Ini:</span>
                      <span className="font-bold text-white font-mono">{faskes.sessionsToday.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Modul Terpopuler:</span>
                      <span className="text-teal-300 font-semibold">{faskes.topModule}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              onClick={() => triggerQuickEvent("interaction_screen", "safety", "Skrining Resep Polifarmasi (>3 Obat)", { drugs: ["Aspirin", "Warfarin", "Ibuprofen"], severity: "CRITICAL" }, "Palembang - Jakabaring (RSUD BARI)")}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
            >
              + Simulasikan DDI Alert
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("dose_calculate", "clinical", "Perhitungan Dosis Antibiotik Neonatus", { weightKg: 3.2, gestationalWeeks: 38, drug: "Gentamicin" }, "Palembang - Jakabaring (RSUD BARI)")}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-colors"
            >
              + Dosis BARI Jakabaring
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("referral_dispatch", "navigation", "Rujukan Berjenjang Puskesmas Pembina ke RSUD BARI", { from: "Puskesmas Pembina Plaju", to: "RSUD BARI", poli: "Anak" }, "Palembang - Plaju (Puskesmas Pembina)")}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
            >
              + Rujukan Plaju-BARI
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("sumsel_regional_sync", "conversion", "Sinkronisasi Formularium Rujukan Sumsel", { origin: "RSUD Kayuagung (OKI)", items: 12 }, "Ogan Komering Ilir (Kayuagung)")}
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
            >
              + Rujukan OKI-Sumsel
            </button>
            <button
              type="button"
              onClick={() => triggerQuickEvent("pdf_export", "conversion", "Cetak Rekomendasi Farmakoterapi PDF", { pageCount: 2, recipient: "Sp.A" }, "Palembang - Seberang Ulu II")}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors"
            >
              + Export PDF
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
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Kategori:
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

            {/* Search Input */}
            <div className="relative w-full md:w-64">
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

          {/* Regional Filter Bar (South Sumatra / Palembang) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Filter Wilayah:
            </span>
            {[
              { id: "all", label: "Semua Wilayah" },
              { id: "palembang", label: "📍 Kota Palembang (Zona RSUD BARI)" },
              { id: "sumsel_other", label: "🏛️ Kab/Kota se-Sumsel" },
              { id: "outside", label: "🌐 Luar Sumsel / Nasional" }
            ].map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setActiveRegionFilter(reg.id as any)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeRegionFilter === reg.id
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-teal-50/80 hover:bg-teal-100 text-teal-900 border border-teal-200/60"
                }`}
              >
                {reg.label}
              </button>
            ))}
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
                  <th className="py-3 px-4">Lokasi Spesifik & Platform</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 bg-white">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada custom event yang cocok dengan kriteria filter wilayah atau kategori yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.slice(0, 20).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(ev.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ev.isRealLive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                              LIVE
                            </span>
                          )}
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {ev.eventName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(ev.category)}`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {ev.label}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {ev.city.toLowerCase().includes("palembang") ? (
                              <span className="inline-flex items-center gap-1 font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80 text-[11px]">
                                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                {ev.city}
                              </span>
                            ) : ev.city.includes("Sumatera Selatan") || ["ogan", "banyuasin", "oki", "prabumulih", "muara", "lahat", "lubuklinggau", "baturaja", "sekayu", "pagar alam", "pali", "empat lawang", "muratara"].some(k => ev.city.toLowerCase().includes(k)) ? (
                              <span className="inline-flex items-center gap-1 font-medium text-sky-900 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80 text-[11px]">
                                <Building2 className="w-3 h-3 text-sky-600 shrink-0" />
                                {ev.city}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80 text-[11px]">
                                <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                                {ev.city}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {ev.device} • {ev.browser}
                          </span>
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

              {/* Lokasi Asal Spesifik (Palembang & Sumsel) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Lokasi Asal Faskes / Klinisi (Palembang & Sumatera Selatan) *
                </label>
                <select
                  value={customEventCity}
                  onChange={(e) => setCustomEventCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <optgroup label="📍 Kota Palembang (Kecamatan & Zona RSUD Palembang BARI)">
                    {PALEMBANG_DISTRICTS.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🏛️ Kabupaten & Kota di Sumatera Selatan">
                    {SUMSEL_REGENCIES.filter(r => r !== "Kota Palembang").map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Luar Provinsi / Nasional">
                    <option value="Jakarta (Rujukan Kemenkes)">Jakarta (Rujukan Kemenkes)</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                  </optgroup>
                </select>
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

      {/* Modal: Konfirmasi Reset Database Telemetri Server */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Reset Database Telemetri?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan mengosongkan berkas database server (<code>data/analytics_store.json</code>) dan mengembalikannya ke baseline inisial sistem.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Semua sesi kunjungan nyata dan event yang telah tercatat akan dibersihkan, lalu server akan memulai pencatatan telemetri baru dari nol.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebAnalytics;
