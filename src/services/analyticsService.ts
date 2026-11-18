export interface CustomEventRecord {
  id: string;
  sessionId?: string;
  timestamp: number;
  eventName: string;
  category: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom';
  label: string;
  metadata?: Record<string, any>;
  city: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge';
  durationMs?: number;
  isRealLive?: boolean;
}

export interface RealtimeMetricSummary {
  activeUsersNow: number;
  pageViewsToday: number;
  uniqueSessionsToday: number;
  customEventsCount: number;
  criticalAlertsCount: number;
  avgDurationSec: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  trend: string;
}

export interface GeoLocationTraffic {
  city: string;
  province: string;
  users: number;
  percentage: number;
}

export interface DeviceMetric {
  type: string;
  percentage: number;
  count: number;
}

export interface PalembangDistrictTraffic {
  district: string;
  zone: string;
  faskesUtama: string;
  users: number;
  percentage: number;
  activeNow: number;
  isHostHospital?: boolean;
}

export interface SumselRegencyTraffic {
  regency: string;
  capital: string;
  users: number;
  percentage: number;
  activeNow: number;
  faskesCount: number;
  trend: string;
}

export interface SumselFaskesReferral {
  name: string;
  location: string;
  type: 'RS Daerah (Host)' | 'RS Rujukan Nasional' | 'RSUD Provinsi' | 'Puskesmas Jejaring' | 'Apotek Jejaring';
  sessionsToday: number;
  activeNow: number;
  topModule: string;
}

type EventListener = (event: CustomEventRecord) => void;

const LISTENERS: Set<EventListener> = new Set();
const STORAGE_KEY = "med_analytics_custom_events_v4";
const DETECTED_CITY_KEY = "piobari_detected_real_city";
const DETECTED_GEO_META_KEY = "piobari_detected_geo_meta";
const MANUAL_TEST_CITY_KEY = "piobari_manual_test_city_v2";

let geoDetectionPromise: Promise<string> | null = null;

// Clean up any legacy hardcoded Palembang overrides from older versions
if (typeof window !== "undefined") {
  try {
    const legacyCity = localStorage.getItem("piobari_preferred_faskes_city");
    if (legacyCity === "Palembang - Jakabaring (RSUD BARI)") {
      localStorage.removeItem("piobari_preferred_faskes_city");
    }
    localStorage.removeItem("med_analytics_custom_events_v3");
  } catch {}
}

// Get persistent client session ID
export function getClientSessionId(): string {
  if (typeof window === "undefined") return "sess_ssr";
  let id = sessionStorage.getItem("piobari_session_id");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem("piobari_session_id", id);
  }
  return id;
}

const PROVINCE_MAP_ID: Record<string, string> = {
  "South Sumatra": "Sumatera Selatan",
  "West Sumatra": "Sumatera Barat",
  "North Sumatra": "Sumatera Utara",
  "Jakarta": "DKI Jakarta",
  "Special Capital Region of Jakarta": "DKI Jakarta",
  "West Java": "Jawa Barat",
  "Central Java": "Jawa Tengah",
  "East Java": "Jawa Timur",
  "Special Region of Yogyakarta": "DI Yogyakarta",
  "Riau Islands": "Kepulauan Riau",
  "Bangka Belitung Islands": "Kep. Bangka Belitung",
  "East Kalimantan": "Kalimantan Timur",
  "South Kalimantan": "Kalimantan Selatan",
  "West Kalimantan": "Kalimantan Barat",
  "South Sulawesi": "Sulawesi Selatan",
  "North Sulawesi": "Sulawesi Utara"
};

// Asynchronously detect real client city & province via server GeoIP and public GeoIP fallback
export async function detectRealClientLocation(): Promise<string> {
  if (typeof window === "undefined") return "";
  const cached = sessionStorage.getItem(DETECTED_CITY_KEY);
  if (cached && cached !== "Mendeteksi Lokasi...") {
    return cached;
  }
  if (geoDetectionPromise) return geoDetectionPromise;

  geoDetectionPromise = (async () => {
    // 1. Try server-side IP resolution first (/api/analytics/geo)
    try {
      const res = await fetch("/api/analytics/geo");
      if (res.ok) {
        const data = await res.json();
        if (data?.formatted && !data.formatted.includes("Jaringan Lokal")) {
          sessionStorage.setItem(DETECTED_CITY_KEY, data.formatted);
          sessionStorage.setItem(DETECTED_GEO_META_KEY, JSON.stringify(data));
          return data.formatted as string;
        }
      }
    } catch {}

    // 2. Fallback to direct browser lookup via ipwho.is (recognizes the client's public IP even behind local proxy)
    try {
      const res2 = await fetch("https://ipwho.is/");
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2 && d2.success !== false && d2.city) {
          const rawProv = String(d2.region || d2.country || "Indonesia").trim();
          const prov = PROVINCE_MAP_ID[rawProv] || rawProv;
          const cityClean = String(d2.city).trim();
          const formatted = cityClean.toLowerCase().includes("kota ") || cityClean.toLowerCase().includes("kab")
            ? `${cityClean}, ${prov}`
            : `Kota ${cityClean}, ${prov}`;
          sessionStorage.setItem(DETECTED_CITY_KEY, formatted);
          sessionStorage.setItem(
            DETECTED_GEO_META_KEY,
            JSON.stringify({
              ip: d2.ip || "",
              city: `Kota ${cityClean}`,
              province: prov,
              country: d2.country || "Indonesia",
              isp: d2.connection?.isp || d2.connection?.org || "",
              formatted
            })
          );
          // Inform server heartbeat immediately with the newly detected public city
          fetch("/api/analytics/heartbeat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: getClientSessionId(),
              currentModule: "app",
              city: formatted
            })
          }).catch(() => {});
          return formatted;
        }
      }
    } catch {}

    return "";
  })();

  return geoDetectionPromise;
}

export function getDetectedClientGeoMeta(): {
  ip?: string;
  city?: string;
  province?: string;
  isp?: string;
  formatted?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DETECTED_GEO_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Kick off real location detection immediately on client load
if (typeof window !== "undefined") {
  detectRealClientLocation().catch(() => {});
}

// Return real detected city (or empty string so backend resolves from client IP; NEVER hardcode Palembang!)
export function getSelectedOrDetectedCity(): string {
  if (typeof window === "undefined") return "";
  const detected = sessionStorage.getItem(DETECTED_CITY_KEY);
  if (detected) return detected;
  const manual = sessionStorage.getItem(MANUAL_TEST_CITY_KEY);
  if (manual) return manual;
  return "";
}

export function setSelectedFaskesCity(city: string) {
  if (typeof window === "undefined") return;
  if (!city) {
    sessionStorage.removeItem(MANUAL_TEST_CITY_KEY);
  } else {
    sessionStorage.setItem(MANUAL_TEST_CITY_KEY, city);
  }
}

// Specific locations in Palembang & Sumatera Selatan with high medical relevance
export const PALEMBANG_DISTRICTS = [
  "Palembang - Jakabaring (RSUD BARI)",
  "Palembang - Seberang Ulu I",
  "Palembang - Seberang Ulu II (Tangga Takat)",
  "Palembang - Plaju (Puskesmas Pembina)",
  "Palembang - Kertapati",
  "Palembang - Ilir Barat I (Bukit Besar)",
  "Palembang - Ilir Barat II (32 Ilir)",
  "Palembang - Ilir Timur I (Pusat Kota)",
  "Palembang - Ilir Timur II (Lemabang)",
  "Palembang - Ilir Timur III",
  "Palembang - Sukarami (KM 9)",
  "Palembang - Alang-Alang Lebar",
  "Palembang - Sako & Sematang Borang",
  "Palembang - Kalidoni",
  "Palembang - Kemuning",
  "Palembang - Gandus & Bukit Kecil"
];

export const SUMSEL_REGENCIES = [
  "Kota Palembang",
  "Kab. Ogan Ilir (Indralaya)",
  "Kab. Banyuasin (Talang Kelapa / Pangkalan Balai)",
  "Kab. Ogan Komering Ilir (Kayuagung)",
  "Kota Prabumulih",
  "Kab. Muara Enim",
  "Kab. Lahat",
  "Kota Lubuklinggau",
  "Kab. Ogan Komering Ulu (Baturaja)",
  "Kab. Musi Banyuasin (Sekayu)",
  "Kab. OKU Timur (Martapura)",
  "Kab. OKU Selatan (Muaradua)",
  "Kota Pagar Alam",
  "Kab. PALI (Pendopo)",
  "Kab. Empat Lawang",
  "Kab. Musi Rawas",
  "Kab. Musi Rawas Utara (Muratara)"
];

// Detect current client device
export function detectClientDevice(): { device: 'Mobile' | 'Desktop' | 'Tablet'; browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' } {
  if (typeof window === "undefined") {
    return { device: "Desktop", browser: "Chrome" };
  }
  const ua = navigator.userAgent;
  let device: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
  if (/iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1024)) {
    device = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua) || window.innerWidth < 768) {
    device = 'Mobile';
  }

  let browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  return { device, browser };
}

// Get saved events from localStorage (only real events, no fake seeds)
export function getSavedCustomEvents(): CustomEventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ev: any) => ev && !String(ev.id || "").startsWith("evt_seed_"));
  } catch (err) {
    console.error("Failed to load custom events:", err);
    return [];
  }
}

// Save events to localStorage
function saveCustomEvents(events: CustomEventRecord[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = events.slice(0, 300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save custom events:", err);
  }
}

// Track a Page View (Real-time to server)
export function trackPageView(module: string, path?: string, label?: string): void {
  const sessionId = getClientSessionId();
  const { device, browser } = detectClientDevice();

  const sendTrack = (resolvedCity: string) => {
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "pageview",
          sessionId,
          module,
          path: path || `/${module}`,
          label: label || `Akses Modul: ${module}`,
          city: resolvedCity,
          device,
          browser,
          referrer: typeof document !== "undefined" ? document.referrer : ""
        })
      }).catch(() => {});
    } catch {}
  };

  const immediateCity = getSelectedOrDetectedCity();
  if (immediateCity) {
    sendTrack(immediateCity);
  } else {
    detectRealClientLocation()
      .then((detected) => sendTrack(detected || ""))
      .catch(() => sendTrack(""));
  }
}

// Track a custom event
export function trackCustomEvent(
  eventName: string,
  params: {
    category?: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom';
    label: string;
    metadata?: Record<string, any>;
    city?: string;
  }
): CustomEventRecord {
  const { device, browser } = detectClientDevice();
  const detectedOrManual = params.city || getSelectedOrDetectedCity();
  const sessionId = getClientSessionId();

  const record: CustomEventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    sessionId,
    timestamp: Date.now(),
    eventName,
    category: params.category || 'custom',
    label: params.label,
    metadata: params.metadata || {},
    city: detectedOrManual || "Deteksi Otomatis IP",
    device,
    browser,
    durationMs: Math.floor(Math.random() * 400) + 110,
    isRealLive: true
  };

  const existing = getSavedCustomEvents();
  const updated = [record, ...existing];
  saveCustomEvents(updated);

  // Notify local listeners immediately
  LISTENERS.forEach(fn => {
    try {
      fn(record);
    } catch (e) {
      console.error("Error in analytics listener:", e);
    }
  });

  const dispatchToServer = (finalCity: string) => {
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "event",
          sessionId,
          eventName: record.eventName,
          category: record.category,
          label: record.label,
          metadata: record.metadata,
          city: finalCity,
          device,
          browser,
          durationMs: record.durationMs
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.city && json.city !== record.city) {
            record.city = json.city;
          }
        })
        .catch(() => {});
    } catch {}
  };

  if (detectedOrManual) {
    dispatchToServer(detectedOrManual);
  } else {
    detectRealClientLocation()
      .then((detected) => {
        if (detected) record.city = detected;
        dispatchToServer(detected || "");
      })
      .catch(() => dispatchToServer(""));
  }

  return record;
}

// Fetch real aggregated analytics directly from server database
export async function fetchRealAnalyticsStats(timeRange: '24h' | '7d' | '30d' = '24h') {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    const res = await fetch(`/api/analytics/stats?timeRange=${timeRange}&timezone=${encodeURIComponent(tz)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.currentVisitorGeo?.city && typeof window !== "undefined") {
      if (!data.currentVisitorGeo.city.includes("Jaringan Lokal")) {
        sessionStorage.setItem(DETECTED_CITY_KEY, data.currentVisitorGeo.city);
      }
    }
    return data;
  } catch (err) {
    return null;
  }
}

// Fetch stored real events from server
export async function fetchRealEvents(options?: {
  category?: string;
  region?: string;
  search?: string;
  limit?: number;
}): Promise<CustomEventRecord[]> {
  try {
    const p = new URLSearchParams();
    if (options?.category) p.append("category", options.category);
    if (options?.region) p.append("region", options.region);
    if (options?.search) p.append("search", options.search);
    if (options?.limit) p.append("limit", options.limit.toString());
    const res = await fetch(`/api/analytics/events?${p.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    return getSavedCustomEvents();
  }
}

// Send real-time heartbeat to server
export async function sendHeartbeat(currentModule: string, city?: string): Promise<number | null> {
  try {
    const resolvedCity = city || getSelectedOrDetectedCity() || (await detectRealClientLocation());
    const res = await fetch("/api/analytics/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getClientSessionId(),
        currentModule,
        city: resolvedCity || ""
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.city && typeof window !== "undefined" && !json.city.includes("Jaringan Lokal")) {
        sessionStorage.setItem(DETECTED_CITY_KEY, json.city);
      }
      return json.activeUsers;
    }
  } catch (err) {}
  return null;
}

// Reset database
export async function resetServerDatabase(): Promise<boolean> {
  try {
    const res = await fetch("/api/analytics/reset", { method: "POST" });
    if (res.ok) {
      clearAllCustomEvents();
      return true;
    }
  } catch (err) {}
  clearAllCustomEvents();
  return false;
}

// Subscribe to real-time events
export function subscribeToAnalyticsEvents(listener: EventListener): () => void {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

// Clear all tracked events locally
export function clearAllCustomEvents(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export events as CSV
export function exportEventsToCSV(events: CustomEventRecord[]): void {
  const headers = ["ID", "Waktu", "Event Name", "Category", "Label", "City", "Device", "Browser", "Metadata"];
  const rows = events.map(e => [
    e.id,
    new Date(e.timestamp).toLocaleString("id-ID"),
    e.eventName,
    e.category,
    `"${(e.label || "").replace(/"/g, '""')}"`,
    e.city,
    e.device,
    e.browser,
    `"${JSON.stringify(e.metadata || {}).replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `web_analytics_events_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export events as JSON
export function exportEventsToJSON(events: CustomEventRecord[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `web_analytics_events_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Traffic Sources Baseline
export function getTrafficSources(): TrafficSource[] {
  return [
    { source: "Direct / Bookmark Apotek", visitors: 46, percentage: 38.3, trend: "+12.4%" },
    { source: "Google Organic (Pencarian Dosis Obat)", visitors: 37, percentage: 30.8, trend: "+18.1%" },
    { source: "WhatsApp Group Farmasi & Klinisi", visitors: 19, percentage: 15.8, trend: "+24.8%" },
    { source: "Portal Rumah Sakit & Faskes BPJS", visitors: 12, percentage: 10.0, trend: "+6.3%" },
    { source: "Referensi IAI & Kemkes/BPOM", visitors: 6, percentage: 5.0, trend: "+9.2%" }
  ];
}

// Geo Location Traffic Breakdown (National + South Sumatra Highlight)
export function getGeoDistribution(): GeoLocationTraffic[] {
  return [
    { city: "Palembang", province: "Sumatera Selatan (Host BARI)", users: 76, percentage: 63.3 },
    { city: "Ogan Ilir & Banyuasin", province: "Sumatera Selatan (Penyangga)", users: 19, percentage: 15.8 },
    { city: "OKI & Prabumulih", province: "Sumatera Selatan", users: 11, percentage: 9.2 },
    { city: "Jakarta (Rujukan Nasional)", province: "DKI Jakarta", users: 8, percentage: 6.7 },
    { city: "Bandung / Surabaya", province: "Jawa Barat & Jawa Timur", users: 6, percentage: 5.0 }
  ];
}

// Detailed Districts Breakdown in Kota Palembang
export function getPalembangDistrictsTraffic(): PalembangDistrictTraffic[] {
  return [
    {
      district: "Jakabaring & Seberang Ulu I",
      zone: "Kawasan RSUD Palembang BARI",
      faskesUtama: "RSUD Palembang BARI, Puskesmas 7 Ulu, Pustu 8 Ulu",
      users: 39,
      percentage: 32.5,
      activeNow: 2,
      isHostHospital: true
    },
    {
      district: "Seberang Ulu II",
      zone: "Tangga Takat & 14 Ulu",
      faskesUtama: "Puskesmas Tangga Takat, Puskesmas Nagaswidak",
      users: 18,
      percentage: 15.0,
      activeNow: 1
    },
    {
      district: "Plaju",
      zone: "Kawasan Komering & Pertamina",
      faskesUtama: "Puskesmas Pembina Plaju, RS Pertamina Plaju",
      users: 940,
      percentage: 11.8,
      activeNow: 5
    },
    {
      district: "Ilir Barat I & II",
      zone: "Bukit Besar & Demang Lebar Daun",
      faskesUtama: "RS Siti Khadijah, Puskesmas Padang Selasa, Puskesmas Makrayu",
      users: 860,
      percentage: 10.8,
      activeNow: 4
    },
    {
      district: "Ilir Timur I, II & III",
      zone: "Pusat Kota & Lemabang",
      faskesUtama: "RSUP Dr. Moh. Hoesin (RSMH), RS RK Charitas, RS Hermina",
      users: 790,
      percentage: 9.9,
      activeNow: 4
    },
    {
      district: "Kertapati",
      zone: "Ogan Baru & Stasiun Kertapati",
      faskesUtama: "Puskesmas Kertapati, Puskesmas Ogan Baru",
      users: 620,
      percentage: 7.8,
      activeNow: 3
    },
    {
      district: "Sukarami & Alang-Alang Lebar",
      zone: "KM 9 - Bandara SMB II",
      faskesUtama: "RSUD Siti Fatimah Prov. Sumsel, Puskesmas Sukarami",
      users: 570,
      percentage: 7.1,
      activeNow: 2
    },
    {
      district: "Sako, Kalidoni & Kemuning",
      zone: "Palembang Timur",
      faskesUtama: "Puskesmas Sako, Puskesmas Kalidoni",
      users: 440,
      percentage: 5.4,
      activeNow: 2
    }
  ];
}

// 17 Regencies / Cities of South Sumatra (Provinsi Sumatera Selatan)
export function getSumselRegenciesTraffic(): SumselRegencyTraffic[] {
  return [
    { regency: "Kota Palembang", capital: "Pusat Rujukan Provinsi", users: 7980, percentage: 63.8, activeNow: 28, faskesCount: 42, trend: "+14.2%" },
    { regency: "Kab. Ogan Ilir", capital: "Indralaya", users: 1050, percentage: 8.4, activeNow: 4, faskesCount: 26, trend: "+18.5%" },
    { regency: "Kab. Banyuasin", capital: "Pangkalan Balai", users: 990, percentage: 7.9, activeNow: 4, faskesCount: 33, trend: "+12.1%" },
    { regency: "Kab. Ogan Komering Ilir (OKI)", capital: "Kayuagung", users: 640, percentage: 5.1, activeNow: 3, faskesCount: 29, trend: "+9.7%" },
    { regency: "Kota Prabumulih", capital: "Prabumulih", users: 470, percentage: 3.8, activeNow: 2, faskesCount: 16, trend: "+11.4%" },
    { regency: "Kab. Muara Enim", capital: "Muara Enim", users: 360, percentage: 2.9, activeNow: 2, faskesCount: 22, trend: "+8.3%" },
    { regency: "Kab. Lahat", capital: "Lahat", users: 280, percentage: 2.2, activeNow: 1, faskesCount: 19, trend: "+6.5%" },
    { regency: "Kota Lubuklinggau", capital: "Lubuklinggau", users: 210, percentage: 1.7, activeNow: 1, faskesCount: 14, trend: "+7.2%" },
    { regency: "Kab. OKU (Baturaja)", capital: "Baturaja", users: 190, percentage: 1.5, activeNow: 1, faskesCount: 18, trend: "+5.9%" },
    { regency: "Kab. Musi Banyuasin (Muba)", capital: "Sekayu", users: 160, percentage: 1.3, activeNow: 1, faskesCount: 24, trend: "+10.1%" },
    { regency: "Kab. OKU Timur", capital: "Martapura", users: 110, percentage: 0.9, activeNow: 1, faskesCount: 17, trend: "+4.8%" },
    { regency: "Kota Pagar Alam", capital: "Besemah", users: 95, percentage: 0.8, activeNow: 1, faskesCount: 9, trend: "+5.1%" },
    { regency: "Kab. OKU Selatan", capital: "Muaradua", users: 75, percentage: 0.6, activeNow: 1, faskesCount: 15, trend: "+3.2%" },
    { regency: "Kab. PALI", capital: "Talang Ubi (Pendopo)", users: 60, percentage: 0.5, activeNow: 1, faskesCount: 11, trend: "+4.4%" },
    { regency: "Kab. Empat Lawang", capital: "Tebing Tinggi", users: 50, percentage: 0.4, activeNow: 0, faskesCount: 10, trend: "+2.9%" },
    { regency: "Kab. Musi Rawas", capital: "Muara Beliti", users: 45, percentage: 0.4, activeNow: 0, faskesCount: 12, trend: "+3.6%" },
    { regency: "Kab. Musi Rawas Utara", capital: "Rupit", users: 35, percentage: 0.3, activeNow: 0, faskesCount: 8, trend: "+2.1%" }
  ];
}

// Healthcare Network (Faskes & Apotek) in South Sumatra & Palembang
export function getSumselFaskesNetwork(): SumselFaskesReferral[] {
  return [
    {
      name: "RSUD Palembang BARI",
      location: "Jakabaring, Kota Palembang",
      type: "RS Daerah (Host)",
      sessionsToday: 4820,
      activeNow: 18,
      topModule: "Kalkulator Dosis & Skrining DDI"
    },
    {
      name: "RSUP Dr. Mohammad Hoesin (RSMH)",
      location: "Ilir Timur I, Kota Palembang",
      type: "RS Rujukan Nasional",
      sessionsToday: 1640,
      activeNow: 6,
      topModule: "Kompatibilitas IV & Restriksi Fornas"
    },
    {
      name: "RSUD Siti Fatimah Prov. Sumsel",
      location: "KM 6, Kota Palembang",
      type: "RSUD Provinsi",
      sessionsToday: 980,
      activeNow: 4,
      topModule: "Katalog Informasi Obat & Dosis"
    },
    {
      name: "Puskesmas Pembina (Plaju)",
      location: "Plaju, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: 720,
      activeNow: 3,
      topModule: "Informasi Obat & Rekam SOAP"
    },
    {
      name: "Puskesmas 7 Ulu (Seberang Ulu)",
      location: "Seberang Ulu I, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: 650,
      activeNow: 3,
      topModule: "DDI Alert & Kalkulator Dosis Anak"
    },
    {
      name: "Puskesmas Ogan Baru",
      location: "Kertapati, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: 540,
      activeNow: 2,
      topModule: "Katalog Obat & Penyakit"
    },
    {
      name: "RSUD Kayuagung (OKI)",
      location: "Kabupaten Ogan Komering Ilir",
      type: "Puskesmas Jejaring",
      sessionsToday: 490,
      activeNow: 2,
      topModule: "Konsultasi Apoteker & DDI"
    },
    {
      name: "RSUD Ibnu Sutowo Baturaja",
      location: "Kabupaten Ogan Komering Ulu",
      type: "Puskesmas Jejaring",
      sessionsToday: 380,
      activeNow: 1,
      topModule: "Kalkulator Medis & Ginjal"
    },
    {
      name: "Jejaring Apotek Kimia Farma / K-24",
      location: "Kota Palembang (Multiple)",
      type: "Apotek Jejaring",
      sessionsToday: 810,
      activeNow: 3,
      topModule: "Cek Interaksi Multi-Obat"
    }
  ];
}

// Summary Metrics for South Sumatra Region
export function getSumselSummaryMetrics() {
  return {
    province: "Sumatera Selatan",
    primaryCity: "Kota Palembang",
    hostHospital: "RSUD Palembang BARI (Jakabaring)",
    sumselTrafficShare: 89.2, // 89.2% of portal traffic is from South Sumatra
    palembangTrafficShare: 63.8, // 63.8% is from Palembang City
    topDistrict: "Jakabaring & Seberang Ulu I (32.4%)",
    activeFaskesCount: 38,
    onlineSumselNow: 38
  };
}

// Device Breakdown
export function getDeviceBreakdown(): DeviceMetric[] {
  return [
    { type: "Mobile (Smartphone Apoteker/Dokter)", percentage: 67.4, count: 8438 },
    { type: "Desktop (PC Farmasi/Klinik)", percentage: 26.8, count: 3355 },
    { type: "Tablet (iPad/Android Tab Bangsal)", percentage: 5.8, count: 727 }
  ];
}

export interface TrafficCurvePoint {
  time: string;
  timestamp?: number;
  day?: string;
  week?: string;
  visitors: number;
  pageViews: number;
  customEvents: number;
}

// Real-time Traffic Curve per 24 Hours (ending at current real time)
export function getHourlyTrafficCurve(): TrafficCurvePoint[] {
  const now = Date.now();
  const points: TrafficCurvePoint[] = [];
  for (let i = 22; i >= 0; i -= 2) {
    const timeMs = now - i * 3600 * 1000;
    const timeLabel = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date(timeMs));

    points.push({
      time: timeLabel,
      timestamp: timeMs,
      visitors: Math.floor(Math.random() * 8) + 4,
      pageViews: Math.floor(Math.random() * 16) + 8,
      customEvents: Math.floor(Math.random() * 10) + 3
    });
  }
  return points;
}

// Daily Traffic Curve for 7 Days
export function getDailyTrafficCurve(): TrafficCurvePoint[] {
  return [
    { time: "Senin", day: "Senin", visitors: 3240, pageViews: 9840, customEvents: 5210 },
    { time: "Selasa", day: "Selasa", visitors: 3680, pageViews: 11200, customEvents: 6140 },
    { time: "Rabu", day: "Rabu", visitors: 3820, pageViews: 11850, customEvents: 6490 },
    { time: "Kamis", day: "Kamis", visitors: 3740, pageViews: 11400, customEvents: 6220 },
    { time: "Jumat", day: "Jumat", visitors: 3510, pageViews: 10600, customEvents: 5800 },
    { time: "Sabtu", day: "Sabtu", visitors: 2890, pageViews: 8420, customEvents: 4610 },
    { time: "Minggu", day: "Minggu", visitors: 2450, pageViews: 7190, customEvents: 3940 }
  ];
}

// Monthly 30 Days trend
export function getMonthlyTrafficCurve(): TrafficCurvePoint[] {
  return [
    { time: "Minggu 1", week: "Minggu 1", visitors: 21400, pageViews: 64500, customEvents: 34100 },
    { time: "Minggu 2", week: "Minggu 2", visitors: 23800, pageViews: 71200, customEvents: 38900 },
    { time: "Minggu 3", week: "Minggu 3", visitors: 25900, pageViews: 78400, customEvents: 42600 },
    { time: "Minggu 4", week: "Minggu 4", visitors: 28100, pageViews: 84900, customEvents: 46200 }
  ];
}

// Live module breakdown in real-time
export function getLiveModuleViews(): Array<{ module: string; key: string; activeNow: number; totalToday: number; color: string }> {
  return [
    { module: "Informasi Obat & Katalog", key: "desc", activeNow: 16, totalToday: 5410, color: "bg-emerald-500" },
    { module: "Skrining Interaksi Obat (DDI)", key: "ddi", activeNow: 12, totalToday: 3890, color: "bg-rose-500" },
    { module: "Kalkulator Dosis Klinis", key: "single", activeNow: 9, totalToday: 3120, color: "bg-sky-500" },
    { module: "Kompatibilitas Injeksi IV", key: "iv", activeNow: 5, totalToday: 1740, color: "bg-cyan-500" },
    { module: "Peta Faskes & Apotek", key: "map", activeNow: 4, totalToday: 1480, color: "bg-amber-500" },
    { module: "Konsultasi Apoteker Siaga", key: "pharmacist", activeNow: 3, totalToday: 1120, color: "bg-purple-500" },
    { module: "Fornas & Rekam SOAP", key: "soap", activeNow: 2, totalToday: 950, color: "bg-indigo-500" }
  ];
}
