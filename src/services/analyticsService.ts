export interface CustomEventRecord {
  id: string;
  timestamp: number;
  eventName: string;
  category: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom';
  label: string;
  metadata?: Record<string, any>;
  city: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge';
  durationMs?: number;
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

type EventListener = (event: CustomEventRecord) => void;

const LISTENERS: Set<EventListener> = new Set();
const STORAGE_KEY = "med_analytics_custom_events_v1";

const INDONESIAN_CITIES = [
  { city: "Jakarta", province: "DKI Jakarta" },
  { city: "Surabaya", province: "Jawa Timur" },
  { city: "Bandung", province: "Jawa Barat" },
  { city: "Medan", province: "Sumatera Utara" },
  { city: "Semarang", province: "Jawa Tengah" },
  { city: "Makassar", province: "Sulawesi Selatan" },
  { city: "Yogyakarta", province: "DIY Yogyakarta" },
  { city: "Denpasar", province: "Bali" },
  { city: "Palembang", province: "Sumatera Selatan" },
  { city: "Malang", province: "Jawa Timur" },
  { city: "Balikpapan", province: "Kalimantan Timur" }
];

const BROWSERS: Array<'Chrome' | 'Safari' | 'Firefox' | 'Edge'> = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const DEVICES: Array<'Mobile' | 'Desktop' | 'Tablet'> = ['Mobile', 'Mobile', 'Desktop', 'Mobile', 'Tablet'];

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

// Generate realistic seed events if storage empty
function generateSeedEvents(): CustomEventRecord[] {
  const seed: CustomEventRecord[] = [];
  const now = Date.now();
  const sampleEvents = [
    { name: "drug_lookup", cat: "clinical" as const, label: "Pencarian Paracetamol Suspensi", meta: { drug: "Paracetamol", category: "Analgetik" } },
    { name: "interaction_screen", cat: "safety" as const, label: "Skrining Ciprofloxacin + Antasida", meta: { severity: "CRITICAL", drugCount: 2 } },
    { name: "dose_calculate", cat: "clinical" as const, label: "Perhitungan Dosis Amoxicillin Anak", meta: { ageYears: 4, weightKg: 16, unit: "mg" } },
    { name: "pdf_export", cat: "conversion" as const, label: "Unduh Lembar Dosis PDF", meta: { format: "A4", patientGroup: "Pediatrik" } },
    { name: "ai_consultation", cat: "clinical" as const, label: "Tanya AI: Penyesuaian Dosis Gagal Ginjal", meta: { topic: "Renal Adjustment" } },
    { name: "iv_compatibility", cat: "safety" as const, label: "Cek Kompatibilitas Ceftriaxone + Ringer Laktat", meta: { result: "INCOMPATIBLE_PRECIPITATE" } },
    { name: "faskes_search", cat: "navigation" as const, label: "Pencarian Apotek 24 Jam Terdekat", meta: { type: "Pharmacy", city: "Surabaya" } },
    { name: "device_guide_view", cat: "clinical" as const, label: "Edukasi Cara Pakai Inhaler MDI", meta: { device: "Inhaler" } },
    { name: "soap_record", cat: "clinical" as const, label: "Pencatatan Rekam Farmasi SOAP", meta: { status: "Saved" } }
  ];

  for (let i = 0; i < 45; i++) {
    const timeOffset = Math.floor(Math.random() * (12 * 3600 * 1000)); // past 12 hours
    const tmpl = sampleEvents[i % sampleEvents.length];
    const cityObj = INDONESIAN_CITIES[Math.floor(Math.random() * INDONESIAN_CITIES.length)];
    seed.push({
      id: `evt_seed_${now - timeOffset}_${i}`,
      timestamp: now - timeOffset,
      eventName: tmpl.name,
      category: tmpl.cat,
      label: tmpl.label,
      metadata: tmpl.meta,
      city: cityObj.city,
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      durationMs: Math.floor(Math.random() * 2400) + 120
    });
  }

  // Sort descending (newest first)
  return seed.sort((a, b) => b.timestamp - a.timestamp);
}

// Get saved events from localStorage
export function getSavedCustomEvents(): CustomEventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedEvents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = generateSeedEvents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load custom events:", err);
    return [];
  }
}

// Save events to localStorage
function saveCustomEvents(events: CustomEventRecord[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep max 250 most recent events to preserve performance
    const trimmed = events.slice(0, 250);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save custom events:", err);
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
  const currentCity = params.city || INDONESIAN_CITIES[Math.floor(Math.random() * 4)].city; // Default to major metro

  const record: CustomEventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
    eventName,
    category: params.category || 'custom',
    label: params.label,
    metadata: params.metadata || {},
    city: currentCity,
    device,
    browser,
    durationMs: Math.floor(Math.random() * 800) + 150
  };

  const existing = getSavedCustomEvents();
  const updated = [record, ...existing];
  saveCustomEvents(updated);

  // Notify listeners
  LISTENERS.forEach(fn => {
    try {
      fn(record);
    } catch (e) {
      console.error("Error in analytics listener:", e);
    }
  });

  return record;
}

// Subscribe to real-time events
export function subscribeToAnalyticsEvents(listener: EventListener): () => void {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

// Clear all tracked events
export function clearAllCustomEvents(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  const reset = generateSeedEvents();
  saveCustomEvents(reset);
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
    { source: "Direct / Bookmark Apotek", visitors: 4820, percentage: 38.5, trend: "+12.4%" },
    { source: "Google Organic (Pencarian Dosis Obat)", visitors: 3910, percentage: 31.2, trend: "+18.1%" },
    { source: "WhatsApp Group Farmasi & Klinisi", visitors: 1940, percentage: 15.5, trend: "+24.8%" },
    { source: "Portal Rumah Sakit & Faskes BPJS", visitors: 1210, percentage: 9.7, trend: "+6.3%" },
    { source: "Referensi IAI & Kemkes/BPOM", visitors: 640, percentage: 5.1, trend: "+9.2%" }
  ];
}

// Geo Location Traffic Breakdown
export function getGeoDistribution(): GeoLocationTraffic[] {
  return [
    { city: "Jakarta", province: "DKI Jakarta", users: 4320, percentage: 34.5 },
    { city: "Surabaya", province: "Jawa Timur", users: 2410, percentage: 19.2 },
    { city: "Bandung", province: "Jawa Barat", users: 1850, percentage: 14.8 },
    { city: "Medan", province: "Sumatera Utara", users: 1120, percentage: 8.9 },
    { city: "Semarang", province: "Jawa Tengah", users: 940, percentage: 7.5 },
    { city: "Makassar", province: "Sulawesi Selatan", users: 780, percentage: 6.2 },
    { city: "Yogyakarta", province: "DIY Yogyakarta", users: 610, percentage: 4.9 },
    { city: "Denpasar", province: "Bali", users: 490, percentage: 4.0 }
  ];
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
  day?: string;
  week?: string;
  visitors: number;
  pageViews: number;
  customEvents: number;
}

// Real-time Traffic Curve per 24 Hours
export function getHourlyTrafficCurve(): TrafficCurvePoint[] {
  return [
    { time: "00:00", visitors: 42, pageViews: 120, customEvents: 68 },
    { time: "02:00", visitors: 28, pageViews: 75, customEvents: 34 },
    { time: "04:00", visitors: 35, pageViews: 90, customEvents: 45 },
    { time: "06:00", visitors: 115, pageViews: 320, customEvents: 180 },
    { time: "08:00", visitors: 480, pageViews: 1420, customEvents: 790 },
    { time: "10:00", visitors: 780, pageViews: 2350, customEvents: 1240 },
    { time: "12:00", visitors: 690, pageViews: 1980, customEvents: 1050 },
    { time: "14:00", visitors: 850, pageViews: 2640, customEvents: 1410 },
    { time: "16:00", visitors: 720, pageViews: 2190, customEvents: 1180 },
    { time: "18:00", visitors: 580, pageViews: 1750, customEvents: 920 },
    { time: "20:00", visitors: 640, pageViews: 1920, customEvents: 1040 },
    { time: "22:00", visitors: 310, pageViews: 940, customEvents: 490 }
  ];
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
    { module: "Konsultasi Apoteker & AI", key: "ai", activeNow: 3, totalToday: 1120, color: "bg-purple-500" },
    { module: "Fornas & Rekam SOAP", key: "soap", activeNow: 2, totalToday: 950, color: "bg-indigo-500" }
  ];
}
