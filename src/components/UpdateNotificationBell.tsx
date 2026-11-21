import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellRing, CheckCheck, X, ArrowUpRight, Sparkles, Database, Sliders, RefreshCw } from "lucide-react";
import {
  SiteUpdateItem,
  SiteUpdateCategory,
  SITE_UPDATE_EVENT_NAME,
  loadSiteUpdates,
  loadReadUpdateIds,
  saveReadUpdateIds,
} from "../utils/siteUpdates";

interface UpdateNotificationBellProps {
  onNavigateTab?: (tabId: string) => void;
}

function formatRelativeIndo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_META: Record<SiteUpdateCategory, { label: string; Icon: React.ComponentType<{ className?: string }>; color: string }> = {
  fitur: { label: "Pembaruan Fitur", Icon: Sparkles, color: "text-teal-700 bg-teal-50" },
  data: { label: "Perubahan Data", Icon: Database, color: "text-sky-700 bg-sky-50" },
  tampilan: { label: "Perbaikan Tampilan", Icon: Sliders, color: "text-indigo-700 bg-indigo-50" },
  sistem: { label: "Sistem", Icon: RefreshCw, color: "text-amber-700 bg-amber-50" },
};

export function UpdateNotificationBell({ onNavigateTab }: UpdateNotificationBellProps) {
  const [updates, setUpdates] = useState<SiteUpdateItem[]>(() => loadSiteUpdates());
  const [readIds, setReadIds] = useState<string[]>(() => loadReadUpdateIds());
  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
  const [liveToast, setLiveToast] = useState<SiteUpdateItem | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToastBriefly = useCallback((item: SiteUpdateItem) => {
    setLiveToast(item);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setLiveToast(null);
    }, 6000);
  }, []);

  useEffect(() => {
    const handleLiveUpdate = (event: Event) => {
      const custom = event as CustomEvent<SiteUpdateItem>;
      const newItem = custom.detail;
      if (!newItem) return;
      setUpdates(loadSiteUpdates());
      showToastBriefly(newItem);
    };

    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === "piobari_site_updates_v1" || event.key === "piobari_site_updates_read_v1") {
        const nextUpdates = loadSiteUpdates();
        setUpdates(nextUpdates);
        setReadIds(loadReadUpdateIds());
        if (event.key === "piobari_site_updates_v1" && nextUpdates[0]) {
          showToastBriefly(nextUpdates[0]);
        }
      }
    };

    window.addEventListener(SITE_UPDATE_EVENT_NAME, handleLiveUpdate);
    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener(SITE_UPDATE_EVENT_NAME, handleLiveUpdate);
      window.removeEventListener("storage", handleStorageSync);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [showToastBriefly]);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const unreadItems = updates.filter((u) => !readIds.includes(u.id));
  const unreadCount = unreadItems.length;
  const visibleItems = filterMode === "unread" ? unreadItems : updates;

  const markSingleRead = (id: string) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    saveReadUpdateIds(next);
  };

  const markAllRead = () => {
    const allIds = Array.from(new Set([...readIds, ...updates.map((u) => u.id)]));
    setReadIds(allIds);
    saveReadUpdateIds(allIds);
  };

  const handleItemClick = (item: SiteUpdateItem) => {
    markSingleRead(item.id);
    if (item.targetTab && onNavigateTab) {
      onNavigateTab(item.targetTab);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Top-Right Blinking Notification Bell Button */}
      <button
        type="button"
        id="btn-site-updates-bell"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setLiveToast(null);
        }}
        aria-label={
          unreadCount > 0
            ? `Notifikasi pembaruan website: ${unreadCount} belum dibaca`
            : "Notifikasi pembaruan website"
        }
        aria-expanded={isOpen}
        title={unreadCount > 0 ? `${unreadCount} pembaruan baru di website` : "Riwayat Pembaruan Website"}
        className={`relative min-w-[38px] min-h-[38px] px-2.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          unreadCount > 0
            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-2xs"
            : isOpen
            ? "bg-teal-50 text-teal-800 border-teal-300"
            : "glass-card hover:bg-white text-slate-700 border-slate-200/80 shadow-2xs"
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-rose-600 animate-pulse motion-reduce:animate-none shrink-0" />
        ) : (
          <Bell className="w-4 h-4 text-slate-600 shrink-0" />
        )}

        <span className="hidden md:inline whitespace-nowrap">
          {unreadCount > 0 ? "Update" : "Info"}
        </span>

        {/* Blinking indicator dot + counter when there are unread updates */}
        {unreadCount > 0 && (
          <span className="relative flex items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping motion-reduce:animate-none"
            />
            <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold tabular-nums leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Live Floating Blinking Toast at Top-Right Corner when a change occurs */}
      {liveToast && !isOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-[4.5rem] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white border border-rose-300 rounded-2xl shadow-lg p-3.5 flex items-start gap-3"
        >
          <div className="relative mt-0.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-rose-400 opacity-60 animate-ping motion-reduce:animate-none" />
            <div className="relative w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-rose-700">Pembaruan Baru Website</span>
              <button
                type="button"
                onClick={() => setLiveToast(null)}
                aria-label="Tutup notifikasi"
                className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{liveToast.title}</p>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
              {liveToast.description}
            </p>
            <button
              type="button"
              onClick={() => {
                setLiveToast(null);
                setIsOpen(true);
              }}
              className="mt-1.5 text-[11px] font-semibold text-teal-700 hover:text-teal-900"
            >
              Lihat semua pembaruan
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Changelog Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Riwayat Pembaruan Website"
          className="fixed sm:absolute right-3 sm:right-0 top-[4.5rem] sm:top-full sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-[390px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[75vh]"
        >
          {/* Panel Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pembaruan &amp; Perubahan Website</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {unreadCount > 0 ? `${unreadCount} belum dibaca · ` : "Semua sudah dibaca · "}
                {updates.length} catatan
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup panel notifikasi"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs + Mark All Read */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterMode === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({updates.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("unread")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterMode === "unread" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 whitespace-nowrap"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* Update List */}
          <div className="overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {visibleItems.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">Tidak ada notifikasi belum dibaca</p>
                <p className="text-[11px] text-slate-500">
                  Notifikasi akan berkedip otomatis saat ada pembaruan fitur atau perubahan data website.
                </p>
              </div>
            ) : (
              visibleItems.map((item) => {
                const isUnread = !readIds.includes(item.id);
                const cat = CATEGORY_META[item.category] || CATEGORY_META.sistem;
                const CatIcon = cat.Icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left px-4 py-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                      isUnread ? "bg-rose-50/35" : "bg-white"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cat.color}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-bold leading-snug ${isUnread ? "text-slate-900" : "text-slate-700"}`}>
                          {item.title}
                        </span>
                        {isUnread && (
                          <span className="relative flex h-2 w-2 mt-1.5 shrink-0" title="Belum dibaca">
                            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 pt-0.5">
                        <span>
                          {cat.label} · {formatRelativeIndo(item.timestamp)}
                        </span>
                        {item.targetTab && (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-teal-700">
                            Buka
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
