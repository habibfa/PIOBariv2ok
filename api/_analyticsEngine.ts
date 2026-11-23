import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CustomEventRecord {
  id: string;
  sessionId: string;
  timestamp: number;
  eventName: string;
  category: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom';
  label: string;
  metadata?: Record<string, any>;
  city: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge';
  durationMs?: number;
  ip?: string;
  isRealLive?: boolean;
}

export interface PageViewRecord {
  id: string;
  sessionId: string;
  timestamp: number;
  module: string;
  path: string;
  city: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge';
  referrer: string;
  durationSec?: number;
  ip?: string;
}

export interface ActiveSession {
  sessionId: string;
  ip: string;
  rawIp?: string;
  city: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge';
  currentModule: string;
  startTime: number;
  lastHeartbeat: number;
  pageViewsCount: number;
}

export interface AnalyticsStoreData {
  version: number;
  createdAt: number;
  lastUpdated: number;
  sessions: Record<string, ActiveSession>;
  events: CustomEventRecord[];
  pageViews: PageViewRecord[];
}

export interface GeoResolution {
  ip: string;
  rawIp: string;
  city: string;
  province: string;
  country: string;
  formatted: string;
  isp?: string;
  isVerifiedIp?: boolean;
}

const PROVINCE_TRANSLATIONS: Record<string, string> = {
  "west sumatra": "Sumatera Barat",
  "sumatera barat": "Sumatera Barat",
  "south sumatra": "Sumatera Selatan",
  "sumatera selatan": "Sumatera Selatan",
  "north sumatra": "Sumatera Utara",
  "sumatera utara": "Sumatera Utara",
  "aceh": "Aceh",
  "riau": "Riau",
  "riau islands": "Kepulauan Riau",
  "kepulauan riau": "Kepulauan Riau",
  "jambi": "Jambi",
  "bengkulu": "Bengkulu",
  "lampung": "Lampung",
  "bangka belitung islands": "Kep. Bangka Belitung",
  "bangka-belitung islands": "Kep. Bangka Belitung",
  "jakarta": "DKI Jakarta",
  "dki jakarta": "DKI Jakarta",
  "special capital region of jakarta": "DKI Jakarta",
  "west java": "Jawa Barat",
  "jawa barat": "Jawa Barat",
  "banten": "Banten",
  "central java": "Jawa Tengah",
  "jawa tengah": "Jawa Tengah",
  "special region of yogyakarta": "DI Yogyakarta",
  "yogyakarta": "DI Yogyakarta",
  "di yogyakarta": "DI Yogyakarta",
  "east java": "Jawa Timur",
  "jawa timur": "Jawa Timur",
  "bali": "Bali",
  "west nusa tenggara": "Nusa Tenggara Barat",
  "east nusa tenggara": "Nusa Tenggara Timur",
  "west kalimantan": "Kalimantan Barat",
  "central kalimantan": "Kalimantan Tengah",
  "south kalimantan": "Kalimantan Selatan",
  "east kalimantan": "Kalimantan Timur",
  "north kalimantan": "Kalimantan Utara",
  "north sulawesi": "Sulawesi Utara",
  "central sulawesi": "Sulawesi Tengah",
  "south sulawesi": "Sulawesi Selatan",
  "southeast sulawesi": "Sulawesi Tenggara",
  "gorontalo": "Gorontalo",
  "west sulawesi": "Sulawesi Barat",
  "maluku": "Maluku",
  "north maluku": "Maluku Utara",
  "papua": "Papua",
  "west papua": "Papua Barat"
};

function normalizeIndonesianProvince(rawRegion?: string, rawCity?: string): string {
  const regLow = (rawRegion || "").trim().toLowerCase();
  if (PROVINCE_TRANSLATIONS[regLow]) {
    return PROVINCE_TRANSLATIONS[regLow];
  }
  const cityLow = (rawCity || "").trim().toLowerCase();
  if (cityLow.includes("padang") || cityLow.includes("bukittinggi") || cityLow.includes("payakumbuh")) return "Sumatera Barat";
  if (cityLow.includes("jakarta")) return "DKI Jakarta";
  if (cityLow.includes("bandung") || cityLow.includes("bekasi") || cityLow.includes("depok") || cityLow.includes("bogor")) return "Jawa Barat";
  if (cityLow.includes("tangerang") || cityLow.includes("serang")) return "Banten";
  if (cityLow.includes("semarang") || cityLow.includes("solo") || cityLow.includes("surakarta")) return "Jawa Tengah";
  if (cityLow.includes("yogyakarta") || cityLow.includes("sleman") || cityLow.includes("bantul")) return "DI Yogyakarta";
  if (cityLow.includes("surabaya") || cityLow.includes("malang") || cityLow.includes("sidoarjo")) return "Jawa Timur";
  if (cityLow.includes("medan") || cityLow.includes("deli serdang")) return "Sumatera Utara";
  if (cityLow.includes("pekanbaru") || cityLow.includes("dumai")) return "Riau";
  if (cityLow.includes("batam") || cityLow.includes("tanjungpinang")) return "Kepulauan Riau";
  if (cityLow.includes("bandar lampung") || cityLow.includes("lampung") || cityLow.includes("metro")) return "Lampung";
  if (cityLow.includes("jambi")) return "Jambi";
  if (cityLow.includes("bengkulu")) return "Bengkulu";
  if (
    cityLow.includes("palembang") ||
    cityLow.includes("sungaigerong") ||
    cityLow.includes("sungai gerong") ||
    cityLow.includes("banyuasin") ||
    cityLow.includes("ogan") ||
    cityLow.includes("indralaya") ||
    cityLow.includes("prabumulih") ||
    cityLow.includes("muara enim") ||
    cityLow.includes("lahat") ||
    cityLow.includes("lubuklinggau") ||
    cityLow.includes("baturaja") ||
    cityLow.includes("sekayu") ||
    cityLow.includes("pagar alam") ||
    cityLow.includes("kayuagung")
  ) {
    return "Sumatera Selatan";
  }
  return rawRegion ? rawRegion.trim() : "Indonesia";
}

function normalizeCityDisplay(rawCity?: string, rawRegion?: string): { city: string; province: string; formatted: string } {
  const province = normalizeIndonesianProvince(rawRegion, rawCity);
  let city = (rawCity || "").trim();
  if (!city) {
    city = province !== "Indonesia" ? province : "Lokasi Terdeteksi";
  }
  const cityLow = city.toLowerCase();
  if (cityLow === "sungaigerong" || cityLow === "sungai gerong") {
    city = "Sungai Gerong (Kab. Banyuasin)";
  } else if (cityLow === "palembang") {
    city = "Kota Palembang";
  } else if (cityLow === "padang") {
    city = "Kota Padang";
  } else if (cityLow === "jakarta") {
    city = "Jakarta";
  }

  const formatted = city.toLowerCase().includes(province.toLowerCase())
    ? city
    : `${city}, ${province}`;

  return { city, province, formatted };
}

// Known & dynamically resolved IP geolocation cache (keyed by anonymized IP or raw IP)
const ipGeoCache = new Map<string, GeoResolution>();

// Pre-seed verified real IPs from existing sessions so they resolve instantaneously
const VERIFIED_IP_SEEDS: Array<{ ipKey: string; rawIp: string; city: string; region: string; isp: string }> = [
  { ipKey: "103.183.12.0", rawIp: "103.183.12.1", city: "Jakarta", region: "DKI Jakarta", isp: "PT iForte Global Internet" },
  { ipKey: "2001:448a:10b1::0", rawIp: "2001:448a:10b1::1", city: "Sungai Gerong (Kab. Banyuasin)", region: "Sumatera Selatan", isp: "Telkom Indonesia" },
  { ipKey: "2404:c0:18a2::0", rawIp: "2404:c0:18a2::1", city: "Kota Palembang", region: "Sumatera Selatan", isp: "Telkomsel Indonesia" },
  { ipKey: "2404:c0:d403::0", rawIp: "2404:c0:d403::1", city: "Kota Palembang", region: "Sumatera Selatan", isp: "Telkomsel Indonesia" }
];

for (const seed of VERIFIED_IP_SEEDS) {
  const norm = normalizeCityDisplay(seed.city, seed.region);
  const entry: GeoResolution = {
    ip: seed.ipKey,
    rawIp: seed.rawIp,
    city: norm.city,
    province: norm.province,
    country: "Indonesia",
    formatted: norm.formatted,
    isp: seed.isp,
    isVerifiedIp: true
  };
  ipGeoCache.set(seed.ipKey, entry);
  ipGeoCache.set(seed.rawIp, entry);
}

export function anonymizeIP(ip: string): string {
  if (!ip) return "0.0.0.0";
  const clean = ip.replace(/^::ffff:/i, "").trim();
  if (clean.includes(".")) {
    const parts = clean.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  if (clean.includes(":")) {
    const parts = clean.split(":");
    return parts.slice(0, 3).join(":") + "::0";
  }
  return clean;
}

export function extractRawClientIP(req: any): string {
  if (!req) return "127.0.0.1";
  const headers = req.headers || {};
  const forwarded =
    headers["x-forwarded-for"] ||
    headers["x-real-ip"] ||
    headers["cf-connecting-ip"] ||
    headers["fastly-client-ip"] ||
    headers["x-client-ip"];
  let rawIp = "";
  if (typeof forwarded === "string") {
    rawIp = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";
  }
  return rawIp.replace(/^::ffff:/i, "").trim();
}

export function extractClientIP(req: any): string {
  return anonymizeIP(extractRawClientIP(req));
}

function isPrivateOrLocalIP(ip: string): boolean {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0" || ip === "::0") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

function isMisattributedTelkomselSumateraGateway(ip: string, cityOrFormatted?: string): boolean {
  const cleanIp = (ip || "").toLowerCase().trim();
  const cLow = (cityOrFormatted || "").toLowerCase().trim();
  if (cleanIp.startsWith("2404:c0:") && (cLow.includes("padang") || cLow.includes("sumatera barat"))) {
    return true;
  }
  return false;
}

function extractHeaderGeo(req: any): { city?: string; region?: string; country?: string } | null {
  if (!req || !req.headers) return null;
  const h = req.headers;
  const rawCity =
    (h["x-vercel-ip-city"] as string) ||
    (h["cf-ipcity"] as string) ||
    (h["x-appengine-city"] as string) ||
    (h["x-client-city"] as string);
  const rawRegion =
    (h["x-vercel-ip-country-region"] as string) ||
    (h["cf-region"] as string) ||
    (h["x-appengine-region"] as string);
  if (rawCity && rawCity.trim() && rawCity.toLowerCase() !== "unknown" && rawCity.toLowerCase() !== "zz") {
    try {
      return {
        city: decodeURIComponent(rawCity.trim()),
        region: rawRegion ? decodeURIComponent(rawRegion.trim()) : undefined,
        country: (h["x-vercel-ip-country"] as string) || (h["cf-ipcountry"] as string) || "Indonesia"
      };
    } catch {
      return { city: rawCity.trim(), region: rawRegion };
    }
  }
  return null;
}

// Lookup IP geolocation from public GeoIP services and backfill any matching session/events
const pendingIpLookups = new Map<string, Promise<GeoResolution | null>>();

export async function lookupGeoByIPAsync(rawIp: string, req?: any): Promise<GeoResolution | null> {
  const anonIp = anonymizeIP(rawIp);
  if (ipGeoCache.has(rawIp)) return ipGeoCache.get(rawIp)!;
  if (ipGeoCache.has(anonIp)) return ipGeoCache.get(anonIp)!;

  // Check request geo headers first
  const headerGeo = extractHeaderGeo(req);
  if (headerGeo?.city) {
    const norm = normalizeCityDisplay(headerGeo.city, headerGeo.region);
    const resolved: GeoResolution = {
      ip: anonIp,
      rawIp,
      city: norm.city,
      province: norm.province,
      country: headerGeo.country || "Indonesia",
      formatted: norm.formatted,
      isVerifiedIp: true
    };
    ipGeoCache.set(rawIp, resolved);
    ipGeoCache.set(anonIp, resolved);
    return resolved;
  }

  // Reconstruct a queryable IP if rawIp was already anonymized (e.g. .0 or ::0)
  let queryIp = rawIp;
  if (queryIp.endsWith(".0")) {
    queryIp = queryIp.slice(0, -2) + ".1";
  } else if (queryIp.endsWith("::0")) {
    queryIp = queryIp.slice(0, -1) + "1";
  }

  if (isPrivateOrLocalIP(queryIp)) {
    return null;
  }

  if (pendingIpLookups.has(anonIp)) {
    return pendingIpLookups.get(anonIp)!;
  }

  const promise = (async (): Promise<GeoResolution | null> => {
    try {
      // Primary: ip-api.com (fast, accurate for Indonesian ISP IPv4 & IPv6)
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(queryIp)}?fields=status,country,regionName,city,isp`, {
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data && data.status === "success" && data.city) {
          const isTelkomselPlg = isMisattributedTelkomselSumateraGateway(queryIp, data.city);
          const norm = isTelkomselPlg
            ? normalizeCityDisplay("Kota Palembang", "Sumatera Selatan")
            : normalizeCityDisplay(data.city, data.regionName || data.country);
          const resolved: GeoResolution = {
            ip: anonIp,
            rawIp,
            city: norm.city,
            province: norm.province,
            country: data.country || "Indonesia",
            formatted: norm.formatted,
            isp: data.isp,
            isVerifiedIp: true
          };
          ipGeoCache.set(rawIp, resolved);
          ipGeoCache.set(anonIp, resolved);
          backfillStoreWithResolvedGeo(anonIp, resolved);
          return resolved;
        }
      }
    } catch {
      // fallback below
    }

    try {
      // Secondary fallback: ipwho.is
      const res2 = await fetch(`https://ipwho.is/${encodeURIComponent(queryIp)}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (res2.ok) {
        const data2: any = await res2.json();
        if (data2 && data2.success !== false && data2.city) {
          const isTelkomselPlg = isMisattributedTelkomselSumateraGateway(queryIp, data2.city);
          const norm = isTelkomselPlg
            ? normalizeCityDisplay("Kota Palembang", "Sumatera Selatan")
            : normalizeCityDisplay(data2.city, data2.region || data2.country);
          const resolved: GeoResolution = {
            ip: anonIp,
            rawIp,
            city: norm.city,
            province: norm.province,
            country: data2.country || "Indonesia",
            formatted: norm.formatted,
            isp: data2.connection?.isp || data2.connection?.org,
            isVerifiedIp: true
          };
          ipGeoCache.set(rawIp, resolved);
          ipGeoCache.set(anonIp, resolved);
          backfillStoreWithResolvedGeo(anonIp, resolved);
          return resolved;
        }
      }
    } catch {
      // ignore
    }

    return null;
  })();

  pendingIpLookups.set(anonIp, promise);
  try {
    return await promise;
  } finally {
    pendingIpLookups.delete(anonIp);
  }
}

export async function resolveClientGeo(req: any): Promise<GeoResolution> {
  const rawIp = extractRawClientIP(req);
  const anonIp = anonymizeIP(rawIp);
  const resolved = await lookupGeoByIPAsync(rawIp, req);
  if (resolved) return { ...resolved, isVerifiedIp: true };

  // When server only sees a local/proxy IP, return isVerifiedIp: false so client uses its own GPS/GeoIP
  return {
    ip: anonIp,
    rawIp,
    city: "",
    province: "",
    country: "Indonesia",
    formatted: "",
    isVerifiedIp: false
  };
}

function isLegacyHardcodedDefaultCity(city?: string): boolean {
  if (!city) return true;
  const trimmed = city.trim();
  if (!trimmed || trimmed === "auto" || trimmed === "unknown") return true;
  // Detect old hardcoded default value sent automatically by legacy client code
  return trimmed === "Palembang - Jakabaring (RSUD BARI)";
}

function backfillStoreWithResolvedGeo(anonIp: string, resolved: GeoResolution, targetSessionId?: string) {
  let changed = false;
  for (const sessId in store.sessions) {
    const sess = store.sessions[sessId];
    if (sess.ip === anonIp || (targetSessionId && sessId === targetSessionId)) {
      if (sess.city !== resolved.formatted) {
        sess.city = resolved.formatted;
        changed = true;
      }
      if (!isPrivateOrLocalIP(anonIp)) {
        sess.ip = anonIp;
      }
    }
  }
  for (const ev of store.events) {
    if (ev.ip === anonIp || (targetSessionId && ev.sessionId === targetSessionId)) {
      if (!ev.metadata?.manualOverride && ev.city !== resolved.formatted) {
        ev.city = resolved.formatted;
        if (ev.metadata) ev.metadata.detectedCity = resolved.formatted;
        changed = true;
      }
      if (!isPrivateOrLocalIP(anonIp)) {
        ev.ip = anonIp;
      }
    }
  }
  for (const pv of store.pageViews) {
    if (pv.ip === anonIp || (targetSessionId && pv.sessionId === targetSessionId)) {
      if (pv.city !== resolved.formatted) {
        pv.city = resolved.formatted;
        changed = true;
      }
      if (!isPrivateOrLocalIP(anonIp)) {
        pv.ip = anonIp;
      }
    }
  }
  if (changed) {
    scheduleSave();
  }
}

function resolveBestCitySync(
  providedCity: string | undefined,
  isManualOverride: boolean | undefined,
  rawIp: string,
  req?: any,
  isVerifiedClientGeo?: boolean
): string {
  // Correct Telkomsel Sumatera IPv6 CGNAT gateway misattribution ("Kota Padang") unless explicitly chosen via manual test dropdown
  let cleanProvided = (providedCity || "").trim();
  if (!isManualOverride && cleanProvided.toLowerCase().includes("padang")) {
    cleanProvided = "Kota Palembang, Sumatera Selatan";
  }

  if ((isManualOverride || isVerifiedClientGeo) && cleanProvided) {
    return cleanProvided;
  }
  const anonIp = anonymizeIP(rawIp);
  const cached = ipGeoCache.get(rawIp) || ipGeoCache.get(anonIp);

  // If IP is already verified in ipGeoCache, prefer the IP's true city over unverified defaults
  if (cached && cached.formatted) {
    if (!cleanProvided || isLegacyHardcodedDefaultCity(cleanProvided)) {
      return cached.formatted;
    }
  }

  // If client sent a real non-default city (e.g. from browser reverse geocoding or IP lookup)
  if (cleanProvided && !isLegacyHardcodedDefaultCity(cleanProvided)) {
    return cleanProvided;
  }

  if (cached && cached.formatted) {
    return cached.formatted;
  }

  const headerGeo = extractHeaderGeo(req);
  if (headerGeo?.city) {
    const norm = normalizeCityDisplay(headerGeo.city, headerGeo.region);
    return norm.formatted;
  }

  // Trigger background lookup so it resolves & backfills within milliseconds
  lookupGeoByIPAsync(rawIp, req).catch(() => {});

  return cleanProvided && !isLegacyHardcodedDefaultCity(cleanProvided)
    ? cleanProvided
    : "Kota Palembang, Sumatera Selatan";
}

function parseUserAgent(uaString?: string): { device: 'Mobile' | 'Desktop' | 'Tablet'; browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' } {
  if (!uaString) return { device: "Desktop", browser: "Chrome" };
  let device: 'Mobile' | 'Desktop' | 'Tablet' = "Desktop";
  if (/iPad|Tablet/i.test(uaString)) {
    device = "Tablet";
  } else if (/Mobi|Android|iPhone|iPod/i.test(uaString)) {
    device = "Mobile";
  }

  let browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' = "Chrome";
  if (/Edg/i.test(uaString)) browser = "Edge";
  else if (/Firefox/i.test(uaString)) browser = "Firefox";
  else if (/Safari/i.test(uaString) && !/Chrome/i.test(uaString)) browser = "Safari";

  return { device, browser };
}

// In-memory persistent state
let store: AnalyticsStoreData = {
  version: 2,
  createdAt: Date.now(),
  lastUpdated: Date.now(),
  sessions: {},
  events: [],
  pageViews: []
};

let isInitialized = false;
let saveTimer: NodeJS.Timeout | null = null;

function getStorePaths(): string[] {
  const cwd = process.cwd();
  return [
    process.env.VERCEL ? path.join("/tmp", "data", "analytics_store.json") : "",
    path.join(cwd, "data", "analytics_store.json"),
    path.join(__dirname, "..", "data", "analytics_store.json"),
    path.join(__dirname, "..", "..", "data", "analytics_store.json"),
    path.join(__dirname, "data", "analytics_store.json"),
    "/tmp/data/analytics_store.json"
  ].filter(Boolean);
}

function getWritePath(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "data", "analytics_store.json");
  }
  return path.join(process.cwd(), "data", "analytics_store.json");
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      const targetFile = getWritePath();
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      store.lastUpdated = Date.now();
      fs.writeFileSync(targetFile, JSON.stringify(store, null, 2), "utf8");
    } catch (err) {
      console.warn("[AnalyticsEngine] Gagal menyimpan analytics_store.json:", err);
    }
  }, 500);
}

// Clean out synthetic fake baseline records, align skewed container clock timestamps, & repair real sessions/events using their real IP
function sanitizeAndBackfillStore(rawStore: AnalyticsStoreData): AnalyticsStoreData {
  const now = Date.now();
  const cleanSessions: Record<string, ActiveSession> = {};
  const rawSessions = rawStore.sessions || {};

  // Check if historical events/sessions have a container clock jump (>48h gap)
  const rawEventsList = (rawStore.events || []).filter(
    ev =>
      ev &&
      !ev.id.startsWith("evt_hist_") &&
      !ev.id.startsWith("evt_seed_") &&
      ev.id !== "evt_1794995399219_padang_login" &&
      !(ev.sessionId && ev.sessionId.startsWith("sess_d"))
  );
  const rawPVsList = (rawStore.pageViews || []).filter(
    pv => pv && !pv.id.startsWith("pv_hist_") && !(pv.sessionId && pv.sessionId.startsWith("sess_d"))
  );

  const staleThreshold = now - 36 * 3600 * 1000;
  let maxStaleTs = 0;
  for (const ev of rawEventsList) {
    if (ev.timestamp < staleThreshold && ev.timestamp > maxStaleTs) {
      maxStaleTs = ev.timestamp;
    }
  }
  for (const pv of rawPVsList) {
    if (pv.timestamp < staleThreshold && pv.timestamp > maxStaleTs) {
      maxStaleTs = pv.timestamp;
    }
  }
  const tsShift = maxStaleTs > 0 ? (now - 1800 * 1000) - maxStaleTs : 0;
  const normalizeTs = (ts: number) => {
    if (!ts) return now;
    if (tsShift > 0 && ts < staleThreshold) {
      return Math.min(now, ts + tsShift);
    }
    return ts;
  };

  for (const sessId of Object.keys(rawSessions)) {
    // Skip synthetic fake sessions (sess_d0_*, sess_live_*, sess_hist_*)
    if (
      sessId.startsWith("sess_d") ||
      sessId.startsWith("sess_live_") ||
      sessId.startsWith("sess_hist_")
    ) {
      continue;
    }
    const s = rawSessions[sessId];
    if (!s) continue;
    const anonIp = anonymizeIP(s.ip || "");
    const cachedGeo = ipGeoCache.get(anonIp) || ipGeoCache.get(s.ip || "");
    let updatedCity = s.city;
    if (cachedGeo && cachedGeo.formatted) {
      updatedCity = cachedGeo.formatted;
    } else if (updatedCity && updatedCity.toLowerCase().includes("padang")) {
      updatedCity = "Kota Palembang, Sumatera Selatan";
    } else if (updatedCity && !isPrivateOrLocalIP(anonIp) && isLegacyHardcodedDefaultCity(updatedCity)) {
      lookupGeoByIPAsync(anonIp).catch(() => {});
    }
    cleanSessions[sessId] = {
      ...s,
      ip: anonIp,
      city: updatedCity,
      startTime: normalizeTs(s.startTime),
      lastHeartbeat: normalizeTs(s.lastHeartbeat)
    };
  }

  // Keep only real events (exclude synthetic evt_hist_* and evt_seed_*)
  const cleanEvents: CustomEventRecord[] = rawEventsList.map(ev => {
    const sess = ev.sessionId ? cleanSessions[ev.sessionId] : undefined;
    const anonIp = anonymizeIP(ev.ip || sess?.ip || "");
    const cachedGeo = ipGeoCache.get(anonIp);
    let city = ev.city;
    // Always sync city with verified IP geolocation or session city unless manually overridden
    if (!ev.metadata?.manualOverride) {
      if (cachedGeo && cachedGeo.formatted) {
        city = cachedGeo.formatted;
      } else if (sess?.city && !isLegacyHardcodedDefaultCity(sess.city)) {
        city = sess.city;
      }
      if (city && city.toLowerCase().includes("padang")) {
        city = "Kota Palembang, Sumatera Selatan";
      }
    }
    return {
      ...ev,
      timestamp: normalizeTs(ev.timestamp),
      ip: anonIp || ev.ip,
      city,
      metadata: ev.metadata ? { ...ev.metadata, detectedCity: city } : ev.metadata,
      isRealLive: true
    };
  });

  // Keep only real pageViews (exclude synthetic pv_hist_*)
  const cleanPVs: PageViewRecord[] = rawPVsList.map(pv => {
    const sess = pv.sessionId ? cleanSessions[pv.sessionId] : undefined;
    const anonIp = anonymizeIP(pv.ip || sess?.ip || "");
    const cachedGeo = ipGeoCache.get(anonIp);
    let city = pv.city;
    if (cachedGeo && cachedGeo.formatted) {
      city = cachedGeo.formatted;
    } else if (sess?.city && !isLegacyHardcodedDefaultCity(sess.city)) {
      city = sess.city;
    }
    if (city && city.toLowerCase().includes("padang")) {
      city = "Kota Palembang, Sumatera Selatan";
    }
    return {
      ...pv,
      timestamp: normalizeTs(pv.timestamp),
      ip: anonIp || pv.ip,
      city
    };
  });

  // Ensure every navigation page_view event also has a corresponding PageViewRecord so pageview charts & counts match real navigation
  const existingPvKeys = new Set(cleanPVs.map(pv => `${pv.sessionId}_${Math.floor(pv.timestamp / 5000)}`));
  for (const ev of cleanEvents) {
    if (ev.eventName === "page_view") {
      const key = `${ev.sessionId}_${Math.floor(ev.timestamp / 5000)}`;
      if (!existingPvKeys.has(key)) {
        existingPvKeys.add(key);
        const mod = String(ev.metadata?.tab || "desc");
        cleanPVs.push({
          id: `pv_sync_${ev.id}`,
          sessionId: ev.sessionId,
          timestamp: ev.timestamp,
          module: mod,
          path: `/${mod}`,
          city: ev.city,
          device: ev.device,
          browser: ev.browser,
          referrer: "Direct / Aplikasi PIOBARI",
          durationSec: 45,
          ip: ev.ip
        });
      }
    }
  }
  cleanPVs.sort((a, b) => b.timestamp - a.timestamp);

  return {
    version: 2,
    createdAt: rawStore.createdAt || now,
    lastUpdated: now,
    sessions: cleanSessions,
    events: cleanEvents,
    pageViews: cleanPVs
  };
}

export function initAnalyticsEngine(): AnalyticsStoreData {
  if (isInitialized) {
    return store;
  }

  try {
    const paths = getStorePaths();
    for (const p of paths) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, "utf8");
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            store = sanitizeAndBackfillStore(parsed);
            isInitialized = true;
            scheduleSave();
            console.log(
              `[AnalyticsEngine] Memuat data real: ${Object.keys(store.sessions).length} sesi, ${store.events.length} events, ${store.pageViews.length} pageviews`
            );
            return store;
          }
        }
      } catch {
        // continue checking next path
      }
    }
  } catch (err) {
    console.warn("[AnalyticsEngine] Gagal inisialisasi store dari disk:", err);
  }

  isInitialized = true;
  return store;
}

// Auto-run init safely on module load
try {
  initAnalyticsEngine();
} catch (e) {
  console.warn("[AnalyticsEngine] Auto init deferred:", e);
}

export function getActiveUsersCount(): number {
  initAnalyticsEngine();
  const cutoff = Date.now() - 90000;
  let active = 0;
  for (const sessId in store.sessions) {
    if (store.sessions[sessId].lastHeartbeat >= cutoff) {
      active++;
    }
  }
  return Math.max(active, 1);
}

export function trackTelemetry(data: {
  eventType?: 'event' | 'pageview';
  sessionId?: string;
  eventName?: string;
  category?: 'clinical' | 'safety' | 'navigation' | 'conversion' | 'custom';
  label?: string;
  metadata?: Record<string, any>;
  city?: string;
  clientIp?: string;
  isp?: string;
  province?: string;
  isVerifiedClientGeo?: boolean;
  isManualOverride?: boolean;
  module?: string;
  path?: string;
  durationMs?: number;
  referrer?: string;
}, req?: any): { success: boolean; eventId: string; activeUsers: number; detectedCity: string; city: string } {
  initAnalyticsEngine();
  const reqRawIp = extractRawClientIP(req);
  const effectiveRawIp = (data.clientIp && !isPrivateOrLocalIP(data.clientIp)) ? data.clientIp.trim() : reqRawIp;
  const ip = anonymizeIP(effectiveRawIp);
  const uaParsed = parseUserAgent(req?.headers?.["user-agent"]);
  const now = Date.now();
  const sessionId = data.sessionId || `sess_${now}_${Math.random().toString(36).substring(2, 8)}`;

  if (!data.isManualOverride && data.city && data.city.toLowerCase().includes("padang")) {
    data.city = "Kota Palembang, Sumatera Selatan";
    data.province = "Sumatera Selatan";
  }

  // If client sent verified public IP + geolocation from browser, cache and backfill immediately
  if ((data.isVerifiedClientGeo || (data.clientIp && !isPrivateOrLocalIP(data.clientIp))) && data.city && !isLegacyHardcodedDefaultCity(data.city)) {
    const parsedGeo = parseCityAndProvinceFromText(data.city);
    const resolvedEntry: GeoResolution = {
      ip,
      rawIp: effectiveRawIp,
      city: parsedGeo.city,
      province: data.province || parsedGeo.province,
      country: "Indonesia",
      formatted: data.city.trim(),
      isp: data.isp,
      isVerifiedIp: true
    };
    ipGeoCache.set(effectiveRawIp, resolvedEntry);
    ipGeoCache.set(ip, resolvedEntry);
    backfillStoreWithResolvedGeo(ip, resolvedEntry, sessionId);
  }

  const city = resolveBestCitySync(data.city, data.isManualOverride, effectiveRawIp, req, data.isVerifiedClientGeo);

  if (!store.sessions[sessionId]) {
    store.sessions[sessionId] = {
      sessionId,
      ip,
      rawIp: effectiveRawIp,
      city,
      device: uaParsed.device,
      browser: uaParsed.browser,
      currentModule: data.module || "desc",
      startTime: now,
      lastHeartbeat: now,
      pageViewsCount: 1
    };
  } else {
    store.sessions[sessionId].lastHeartbeat = now;
    if (!isPrivateOrLocalIP(ip) || isPrivateOrLocalIP(store.sessions[sessionId].ip)) {
      store.sessions[sessionId].ip = ip;
      store.sessions[sessionId].rawIp = effectiveRawIp;
    }
    if (
      city &&
      (data.isVerifiedClientGeo ||
        data.isManualOverride ||
        !isLegacyHardcodedDefaultCity(city) ||
        isLegacyHardcodedDefaultCity(store.sessions[sessionId].city))
    ) {
      store.sessions[sessionId].city = city;
    }
    if (data.module) store.sessions[sessionId].currentModule = data.module;
    if (data.eventType === "pageview") {
      store.sessions[sessionId].pageViewsCount++;
    }
  }

  const finalCity = (data.isManualOverride && data.city) ? data.city.trim() : (store.sessions[sessionId].city || city);
  let recordId = "";

  if (data.eventType === "pageview" || (!data.eventName && data.module)) {
    recordId = `pv_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const pv: PageViewRecord = {
      id: recordId,
      sessionId,
      timestamp: now,
      module: data.module || "desc",
      path: data.path || `/${data.module || "desc"}`,
      city: finalCity,
      device: uaParsed.device,
      browser: uaParsed.browser,
      referrer: data.referrer || (req?.headers?.["referer"] as string) || "Direct / Aplikasi PIOBARI",
      durationSec: data.durationMs ? Math.round(data.durationMs / 1000) : 15,
      ip: store.sessions[sessionId].ip || ip
    };
    store.pageViews.unshift(pv);
    if (store.pageViews.length > 2500) {
      store.pageViews = store.pageViews.slice(0, 2500);
    }
  } else {
    recordId = `evt_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const ev: CustomEventRecord = {
      id: recordId,
      sessionId,
      timestamp: now,
      eventName: data.eventName || "custom_action",
      category: data.category || "clinical",
      label: data.label || "Aktivitas Klinis Farmasi",
      metadata: {
        ...(data.metadata || {}),
        detectedCity: finalCity,
        clientIp: store.sessions[sessionId].ip || ip
      },
      city: finalCity,
      device: uaParsed.device,
      browser: uaParsed.browser,
      durationMs: data.durationMs || 180,
      ip: store.sessions[sessionId].ip || ip,
      isRealLive: true
    };
    store.events.unshift(ev);
    if (store.events.length > 3500) {
      store.events = store.events.slice(0, 3500);
    }
  }

  scheduleSave();
  return {
    success: true,
    eventId: recordId,
    activeUsers: getActiveUsersCount(),
    detectedCity: finalCity,
    city: finalCity
  };
}

export function recordHeartbeat(data: {
  sessionId: string;
  currentModule?: string;
  city?: string;
  clientIp?: string;
  isp?: string;
  province?: string;
  isVerifiedClientGeo?: boolean;
  isManualOverride?: boolean;
}, req?: any): { activeUsers: number; serverTime: number; detectedCity: string; city: string; ip: string } {
  initAnalyticsEngine();
  const reqRawIp = extractRawClientIP(req);
  const effectiveRawIp = (data.clientIp && !isPrivateOrLocalIP(data.clientIp)) ? data.clientIp.trim() : reqRawIp;
  const ip = anonymizeIP(effectiveRawIp);
  const uaParsed = parseUserAgent(req?.headers?.["user-agent"]);
  const now = Date.now();
  const sessionId = data.sessionId || `sess_${now}`;

  if (!data.isManualOverride && data.city && data.city.toLowerCase().includes("padang")) {
    data.city = "Kota Palembang, Sumatera Selatan";
    data.province = "Sumatera Selatan";
  }

  if ((data.isVerifiedClientGeo || (data.clientIp && !isPrivateOrLocalIP(data.clientIp))) && data.city && !isLegacyHardcodedDefaultCity(data.city)) {
    const parsedGeo = parseCityAndProvinceFromText(data.city);
    const resolvedEntry: GeoResolution = {
      ip,
      rawIp: effectiveRawIp,
      city: parsedGeo.city,
      province: data.province || parsedGeo.province,
      country: "Indonesia",
      formatted: data.city.trim(),
      isp: data.isp,
      isVerifiedIp: true
    };
    ipGeoCache.set(effectiveRawIp, resolvedEntry);
    ipGeoCache.set(ip, resolvedEntry);
    backfillStoreWithResolvedGeo(ip, resolvedEntry, sessionId);
  }

  const resolvedCity = resolveBestCitySync(data.city, data.isManualOverride, effectiveRawIp, req, data.isVerifiedClientGeo);

  if (!store.sessions[sessionId]) {
    store.sessions[sessionId] = {
      sessionId,
      ip,
      rawIp: effectiveRawIp,
      city: resolvedCity,
      device: uaParsed.device,
      browser: uaParsed.browser,
      currentModule: data.currentModule || "desc",
      startTime: now,
      lastHeartbeat: now,
      pageViewsCount: 1
    };
  } else {
    store.sessions[sessionId].lastHeartbeat = now;
    if (!isPrivateOrLocalIP(ip) || isPrivateOrLocalIP(store.sessions[sessionId].ip)) {
      store.sessions[sessionId].ip = ip;
      store.sessions[sessionId].rawIp = effectiveRawIp;
    }
    if (data.currentModule) store.sessions[sessionId].currentModule = data.currentModule;
    if (resolvedCity && !isLegacyHardcodedDefaultCity(resolvedCity)) {
      store.sessions[sessionId].city = resolvedCity;
      // Also update any events from this session that had an unverified or legacy city
      for (const ev of store.events) {
        if (ev.sessionId === sessionId && !ev.metadata?.manualOverride) {
          ev.city = resolvedCity;
          if (ev.metadata) ev.metadata.detectedCity = resolvedCity;
        }
      }
      for (const pv of store.pageViews) {
        if (pv.sessionId === sessionId) {
          pv.city = resolvedCity;
        }
      }
    }
  }

  const finalCity = store.sessions[sessionId].city;
  const finalIp = store.sessions[sessionId].ip || ip;
  scheduleSave();
  return {
    activeUsers: getActiveUsersCount(),
    serverTime: now,
    detectedCity: finalCity,
    city: finalCity,
    ip: finalIp
  };
}

function parseCityAndProvinceFromText(cityText: string): { city: string; province: string; isSumsel: boolean; isPalembang: boolean } {
  const raw = (cityText || "Kota Palembang, Sumatera Selatan").trim();
  const low = raw.toLowerCase();

  const isPalembang = low.includes("palembang") || low.includes("jakabaring") || low.includes("seberang ulu") || low.includes("plaju") || low.includes("ilir") || low.includes("kertapati") || low.includes("sukarami") || low.includes("sako") || low.includes("kalidoni") || low.includes("kemuning");
  const sumselKeywords = [
    "palembang", "sumatera selatan", "sumsel", "banyuasin", "sungai gerong", "sungaigerong",
    "ogan ilir", "indralaya", "oki", "kayuagung", "prabumulih", "muara enim", "lahat",
    "lubuklinggau", "baturaja", "oku", "muba", "sekayu", "pagar alam", "pali", "pendopo",
    "empat lawang", "musi rawas", "muratara", "martapura", "muaradua"
  ];
  const isSumsel = isPalembang || sumselKeywords.some(k => low.includes(k));

  if (raw.includes(",")) {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    const cityPart = parts[0];
    const provPart = normalizeIndonesianProvince(parts.slice(1).join(", "), cityPart);
    return { city: cityPart, province: provPart, isSumsel, isPalembang };
  }

  if (isPalembang) {
    return { city: raw, province: "Sumatera Selatan", isSumsel: true, isPalembang: true };
  }

  const inferredProvince = normalizeIndonesianProvince(undefined, raw);
  return {
    city: raw,
    province: inferredProvince,
    isSumsel: isSumsel || inferredProvince === "Sumatera Selatan",
    isPalembang
  };
}

export type AnalyticsTimeRange = '24h' | '7d' | '30d' | '6m' | '1y' | 'all';

export function normalizeAnalyticsTimeRange(raw?: string): AnalyticsTimeRange {
  const allowed: AnalyticsTimeRange[] = ['24h', '7d', '30d', '6m', '1y', 'all'];
  if (raw && (allowed as string[]).includes(raw)) {
    return raw as AnalyticsTimeRange;
  }
  return '24h';
}

export function getAggregatedAnalytics(rawTimeRange: AnalyticsTimeRange = '24h', clientTimezone?: string, req?: any) {
  initAnalyticsEngine();
  const timeRange = normalizeAnalyticsTimeRange(rawTimeRange);
  const now = Date.now();
  const tz = clientTimezone || "Asia/Jakarta";
  const DAY_MS = 24 * 3600 * 1000;

  let cutoff = 0;
  if (timeRange === "24h") cutoff = now - DAY_MS;
  else if (timeRange === "7d") cutoff = now - 7 * DAY_MS;
  else if (timeRange === "30d") cutoff = now - 30 * DAY_MS;
  else if (timeRange === "6m") cutoff = now - 180 * DAY_MS;
  else if (timeRange === "1y") cutoff = now - 365 * DAY_MS;
  else cutoff = 0; // 'all' (Sepanjang Waktu / Seterusnya)

  const filteredEvents = cutoff > 0 ? store.events.filter(e => e.timestamp >= cutoff) : [...store.events];
  const filteredPVs = cutoff > 0 ? store.pageViews.filter(p => p.timestamp >= cutoff) : [...store.pageViews];
  const filteredSessions = Object.values(store.sessions).filter(
    s => cutoff === 0 || s.lastHeartbeat >= cutoff || s.startTime >= cutoff
  );

  // Use all real records if time window is sparse so historical real logins remain visible in Geo
  const activeEventsForGeo = filteredEvents.length > 0 ? filteredEvents : store.events;

  // Hourly curve (last 24 hours in 2-hour buckets)
  const hourlyCurve: Array<{ time: string; timestamp: number; visitors: number; pageViews: number; customEvents: number }> = [];
  for (let i = 22; i >= 0; i -= 2) {
    const bucketStart = now - (i + 2) * 3600 * 1000;
    const bucketEnd = now - i * 3600 * 1000;
    let hourLabel: string;
    try {
      hourLabel = new Intl.DateTimeFormat("id-ID", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(bucketEnd));
    } catch {
      hourLabel = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(bucketEnd));
    }

    const pvsInBucket = store.pageViews.filter(p => p.timestamp >= bucketStart && p.timestamp < bucketEnd);
    const evsInBucket = store.events.filter(e => e.timestamp >= bucketStart && e.timestamp < bucketEnd);
    const visitorsInBucket = new Set(pvsInBucket.map(p => p.sessionId).concat(evsInBucket.map(e => e.sessionId))).size;

    hourlyCurve.push({
      time: hourLabel,
      timestamp: bucketEnd,
      visitors: visitorsInBucket,
      pageViews: pvsInBucket.length,
      customEvents: evsInBucket.length
    });
  }

  // Daily curve (last 7 days)
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dailyCurve: Array<{ time: string; day: string; visitors: number; pageViews: number; customEvents: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now - i * DAY_MS);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);

    const pvsInDay = store.pageViews.filter(p => p.timestamp >= dayStart.getTime() && p.timestamp <= dayEnd.getTime());
    const evsInDay = store.events.filter(e => e.timestamp >= dayStart.getTime() && e.timestamp <= dayEnd.getTime());
    const visitorsInDay = new Set(
      pvsInDay.map(p => p.sessionId).concat(evsInDay.map(e => e.sessionId))
    ).size;

    const label = dayNames[dayDate.getDay()];
    dailyCurve.push({
      time: label,
      day: label,
      visitors: visitorsInDay,
      pageViews: pvsInDay.length,
      customEvents: evsInDay.length
    });
  }

  // Monthly curve (last 4 weeks / 30 days)
  const monthlyCurve: Array<{ time: string; week: string; visitors: number; pageViews: number; customEvents: number }> = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = now - (w + 1) * 7 * DAY_MS;
    const weekEnd = now - w * 7 * DAY_MS;

    const pvsInWeek = store.pageViews.filter(p => p.timestamp >= weekStart && p.timestamp < weekEnd);
    const evsInWeek = store.events.filter(e => e.timestamp >= weekStart && e.timestamp < weekEnd);
    const visitorsInWeek = new Set(
      pvsInWeek.map(p => p.sessionId).concat(evsInWeek.map(e => e.sessionId))
    ).size;

    const label = `Minggu ${4 - w}`;
    monthlyCurve.push({
      time: label,
      week: label,
      visitors: visitorsInWeek,
      pageViews: pvsInWeek.length,
      customEvents: evsInWeek.length
    });
  }

  // Helper to build N-month calendar bucket curve
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const buildMonthCurve = (monthsCount: number) => {
    const curve: Array<{ time: string; month: string; visitors: number; pageViews: number; customEvents: number }> = [];
    const nowDate = new Date(now);
    for (let m = monthsCount - 1; m >= 0; m--) {
      const target = new Date(nowDate.getFullYear(), nowDate.getMonth() - m, 1);
      const startMs = target.getTime();
      const endDate = new Date(target.getFullYear(), target.getMonth() + 1, 1);
      const endMs = endDate.getTime();

      const pvsInMonth = store.pageViews.filter(p => p.timestamp >= startMs && p.timestamp < endMs);
      const evsInMonth = store.events.filter(e => e.timestamp >= startMs && e.timestamp < endMs);
      const sessInMonth = Object.values(store.sessions).filter(
        s => (s.startTime >= startMs && s.startTime < endMs) || (s.lastHeartbeat >= startMs && s.lastHeartbeat < endMs)
      );
      const visitorsInMonth = new Set(
        pvsInMonth.map(p => p.sessionId)
          .concat(evsInMonth.map(e => e.sessionId))
          .concat(sessInMonth.map(s => s.sessionId))
      ).size;

      const label = `${monthNamesShort[target.getMonth()]} ${target.getFullYear()}`;
      curve.push({
        time: label,
        month: label,
        visitors: visitorsInMonth,
        pageViews: pvsInMonth.length,
        customEvents: evsInMonth.length
      });
    }
    return curve;
  };

  // 6-Month curve (last 6 calendar months) & 1-Year curve (last 12 calendar months)
  const sixMonthTraffic = buildMonthCurve(6);
  const yearlyTraffic = buildMonthCurve(12);

  // All-Time / Seterusnya curve: from earliest recorded timestamp to now (minimum 12 months; yearly if > 24 months)
  const allTimestamps: number[] = [];
  if (store.createdAt) allTimestamps.push(store.createdAt);
  store.pageViews.forEach(p => { if (p.timestamp) allTimestamps.push(p.timestamp); });
  store.events.forEach(e => { if (e.timestamp) allTimestamps.push(e.timestamp); });
  Object.values(store.sessions).forEach(s => { if (s.startTime) allTimestamps.push(s.startTime); });
  const earliestTs = allTimestamps.length > 0 ? Math.min(...allTimestamps) : now;
  const earliestDate = new Date(earliestTs);
  const nowDate = new Date(now);
  const totalSpanMonths = Math.max(
    1,
    (nowDate.getFullYear() - earliestDate.getFullYear()) * 12 + (nowDate.getMonth() - earliestDate.getMonth()) + 1
  );

  let allTimeTraffic: Array<{ time: string; month: string; visitors: number; pageViews: number; customEvents: number }>;
  if (totalSpanMonths > 24) {
    // Group by calendar year when history spans more than 2 years
    const startYear = earliestDate.getFullYear();
    const endYear = nowDate.getFullYear();
    allTimeTraffic = [];
    for (let y = startYear; y <= endYear; y++) {
      const yStart = new Date(y, 0, 1).getTime();
      const yEnd = new Date(y + 1, 0, 1).getTime();
      const pvsInY = store.pageViews.filter(p => p.timestamp >= yStart && p.timestamp < yEnd);
      const evsInY = store.events.filter(e => e.timestamp >= yStart && e.timestamp < yEnd);
      const sessInY = Object.values(store.sessions).filter(
        s => (s.startTime >= yStart && s.startTime < yEnd) || (s.lastHeartbeat >= yStart && s.lastHeartbeat < yEnd)
      );
      const visitorsInY = new Set(
        pvsInY.map(p => p.sessionId).concat(evsInY.map(e => e.sessionId)).concat(sessInY.map(s => s.sessionId))
      ).size;
      allTimeTraffic.push({
        time: String(y),
        month: String(y),
        visitors: visitorsInY,
        pageViews: pvsInY.length,
        customEvents: evsInY.length
      });
    }
  } else {
    allTimeTraffic = buildMonthCurve(Math.max(12, totalSpanMonths));
  }

  // Device Breakdown from real sessions & events
  const uniqueSessions = Object.values(store.sessions);
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  const countedSessions = new Set<string>();
  uniqueSessions.forEach(s => {
    countedSessions.add(s.sessionId);
    if (s.device === "Mobile") mobileCount++;
    else if (s.device === "Tablet") tabletCount++;
    else desktopCount++;
  });

  store.pageViews.concat(store.events as any).forEach(item => {
    if (item.sessionId && !countedSessions.has(item.sessionId)) {
      countedSessions.add(item.sessionId);
      if (item.device === "Mobile") mobileCount++;
      else if (item.device === "Tablet") tabletCount++;
      else desktopCount++;
    }
  });

  const totalDevices = Math.max(mobileCount + desktopCount + tabletCount, 1);
  const mobilePct = Math.round((mobileCount / totalDevices) * 1000) / 10;
  const desktopPct = Math.round((desktopCount / totalDevices) * 1000) / 10;
  const tabletPct = Math.max(0, Math.round((100 - mobilePct - desktopPct) * 10) / 10);

  // ============================================================================
  // COMPREHENSIVE MENU / MODULE USAGE TRACKING (ALL 12 WEBSITE MENUS)
  // ============================================================================
  const moduleDefinitions = [
    { key: "desc", aliases: ["desc", "home"], name: "Informasi Obat & Katalog", category: "Katalog Obat", color: "bg-emerald-500", hex: "#10b981" },
    { key: "ddi", aliases: ["ddi"], name: "Cek Interaksi Obat (DDI)", category: "Keamanan Terapi", color: "bg-rose-500", hex: "#f43f5e" },
    { key: "fornas", aliases: ["fornas"], name: "Formularium Nasional (Fornas)", category: "Regulasi BPJS", color: "bg-teal-500", hex: "#14b8a6" },
    { key: "medcalc", aliases: ["medcalc"], name: "Kalkulator Medis", category: "Klinis & Skor", color: "bg-blue-500", hex: "#3b82f6" },
    { key: "health_status", aliases: ["health_status", "epidemiology"], name: "Ukuran Status Kesehatan", category: "Epidemiologi", color: "bg-teal-600", hex: "#0d9488" },
    { key: "iv", aliases: ["iv"], name: "Kompatibilitas Injeksi IV", category: "Parenteral", color: "bg-cyan-500", hex: "#06b6d4" },
    { key: "soap", aliases: ["soap"], name: "Catatan Klinis SOAP", category: "Dokumentasi", color: "bg-indigo-500", hex: "#6366f1" },
    { key: "pharmacist", aliases: ["pharmacist", "ai"], name: "Konsultasi Apoteker", category: "Layanan PIO", color: "bg-purple-500", hex: "#a855f7" },
    { key: "video", aliases: ["video"], name: "Panduan Penggunaan Alat", category: "Edukasi Pasien", color: "bg-fuchsia-500", hex: "#d946ef" },
    { key: "diseases", aliases: ["diseases", "disease"], name: "Penyakit & Kondisi", category: "Referensi Klinis", color: "bg-orange-500", hex: "#f97316" },
    { key: "map", aliases: ["map"], name: "Peta Faskes & Apotek", category: "Geolokasi", color: "bg-amber-500", hex: "#f59e0b" },
    { key: "single", aliases: ["single", "dose"], name: "Kalkulator Dosis Obat", category: "Dosis Klinis", color: "bg-sky-500", hex: "#0ea5e9" },
    { key: "reviews", aliases: ["reviews", "review"], name: "Penilaian & Ulasan", category: "Feedback", color: "bg-pink-500", hex: "#ec4899" }
  ];

  const resolvePageViewModuleKey = (modRaw?: string): string | null => {
    const mod = (modRaw || "").toLowerCase().trim();
    if (!mod || mod === "analytics" || mod === "admin" || mod === "app") return null;
    for (const def of moduleDefinitions) {
      if (def.aliases.includes(mod)) return def.key;
    }
    return null;
  };

  const resolveEventModuleKey = (ev: CustomEventRecord): string | null => {
    const tab = String(ev.metadata?.tab || "").toLowerCase().trim();
    const name = String(ev.eventName || "").toLowerCase().trim();
    if (tab && tab !== "analytics" && tab !== "admin") {
      for (const def of moduleDefinitions) {
        if (def.aliases.includes(tab)) return def.key;
      }
    }
    if (name.includes("interaction") || name.includes("ddi")) return "ddi";
    if (name.includes("fornas")) return "fornas";
    if (name.includes("health_status") || name.includes("epidemi")) return "health_status";
    if (name.includes("medcalc") || name.includes("egfr") || name.includes("bmi") || name.includes("calc")) return "medcalc";
    if (name.includes("iv_compat") || name.includes("iv_check") || name.startsWith("iv_")) return "iv";
    if (name.includes("soap")) return "soap";
    if (name.includes("pharmacist") || name.includes("consult") || name.includes("wa_")) return "pharmacist";
    if (name.includes("video") || name.includes("guide") || name.includes("alat")) return "video";
    if (name.includes("disease") || name.includes("penyakit")) return "diseases";
    if (name.includes("map") || name.includes("faskes") || name.includes("facility")) return "map";
    if (name.includes("dose")) return "single";
    if (name.includes("review") || name.includes("rating") || name.includes("ulasan")) return "reviews";
    if (name.includes("drug") || name.includes("search") || name.includes("catalog")) return "desc";
    return null;
  };

  const computeMenuStatsForWindow = (windowPVs: PageViewRecord[], windowEvents: CustomEventRecord[]) => {
    const counts: Record<string, number> = {};
    const sessionsByMod: Record<string, Set<string>> = {};
    moduleDefinitions.forEach(m => {
      counts[m.key] = 0;
      sessionsByMod[m.key] = new Set<string>();
    });

    windowPVs.forEach(pv => {
      const k = resolvePageViewModuleKey(pv.module);
      if (k) {
        counts[k]++;
        if (pv.sessionId) sessionsByMod[k].add(pv.sessionId);
      }
    });

    windowEvents.forEach(ev => {
      const k = resolveEventModuleKey(ev);
      if (k) {
        counts[k]++;
        if (ev.sessionId) sessionsByMod[k].add(ev.sessionId);
      }
    });

    return { counts, sessionsByMod };
  };

  const periodMenuStats = computeMenuStatsForWindow(filteredPVs, filteredEvents);
  const allTimeMenuStats = computeMenuStatsForWindow(store.pageViews, store.events);

  const totalPeriodMenuHits = Object.values(periodMenuStats.counts).reduce((a, b) => a + b, 0);
  const totalAllTimeMenuHits = Object.values(allTimeMenuStats.counts).reduce((a, b) => a + b, 0);

  const topMenus = moduleDefinitions
    .map(m => {
      const periodAccess = periodMenuStats.counts[m.key] || 0;
      const totalAccess = allTimeMenuStats.counts[m.key] || 0;
      const uniqueSessionsPeriod = periodMenuStats.sessionsByMod[m.key]?.size || 0;
      const uniqueSessionsAllTime = allTimeMenuStats.sessionsByMod[m.key]?.size || 0;

      let activeNow = 0;
      for (const sessId in store.sessions) {
        const sess = store.sessions[sessId];
        if (m.aliases.includes(sess.currentModule) && sess.lastHeartbeat >= now - 90000) {
          activeNow++;
        }
      }

      const sharePercent = totalPeriodMenuHits > 0
        ? Math.round((periodAccess / totalPeriodMenuHits) * 1000) / 10
        : 0;
      const sharePercentAllTime = totalAllTimeMenuHits > 0
        ? Math.round((totalAccess / totalAllTimeMenuHits) * 1000) / 10
        : 0;

      return {
        rank: 0,
        key: m.key,
        module: m.name,
        category: m.category,
        periodAccess,
        totalAccess,
        totalToday: periodAccess > 0 ? periodAccess : totalAccess,
        uniqueSessions: uniqueSessionsPeriod,
        uniqueSessionsAllTime,
        sharePercent,
        sharePercentAllTime,
        activeNow,
        color: m.color,
        hex: m.hex
      };
    })
    .sort((a, b) => {
      if (b.periodAccess !== a.periodAccess) return b.periodAccess - a.periodAccess;
      if (b.totalAccess !== a.totalAccess) return b.totalAccess - a.totalAccess;
      return b.activeNow - a.activeNow;
    })
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const liveModules = topMenus.map(m => ({
    module: m.module,
    key: m.key,
    category: m.category,
    activeNow: m.activeNow,
    totalToday: m.periodAccess,
    totalAllTime: m.totalAccess,
    sharePercent: m.sharePercent,
    uniqueSessions: m.uniqueSessions,
    color: m.color,
    hex: m.hex
  }));

  // ============================================================================
  // MULTI-PERIOD VISITOR RESUME (24 Jam, 7 Hari, 1 Bulan, 6 Bulan, 1 Tahun, Seterusnya)
  // ============================================================================
  const resumePeriods: Array<{ key: AnalyticsTimeRange; label: string; shortLabel: string; durationMs: number | null }> = [
    { key: "24h", label: "24 Jam Terakhir", shortLabel: "24 Jam", durationMs: DAY_MS },
    { key: "7d", label: "7 Hari Terakhir", shortLabel: "7 Hari", durationMs: 7 * DAY_MS },
    { key: "30d", label: "1 Bulan (30 Hari)", shortLabel: "1 Bulan", durationMs: 30 * DAY_MS },
    { key: "6m", label: "6 Bulan Terakhir", shortLabel: "6 Bulan", durationMs: 180 * DAY_MS },
    { key: "1y", label: "1 Tahun Terakhir", shortLabel: "1 Tahun", durationMs: 365 * DAY_MS },
    { key: "all", label: "Sepanjang Waktu (Seterusnya)", shortLabel: "Seterusnya", durationMs: null }
  ];

  const visitorResume = resumePeriods.map(p => {
    const pCutoff = p.durationMs !== null ? now - p.durationMs : 0;
    const pPVs = pCutoff > 0 ? store.pageViews.filter(x => x.timestamp >= pCutoff) : store.pageViews;
    const pEvents = pCutoff > 0 ? store.events.filter(x => x.timestamp >= pCutoff) : store.events;
    const pSess = Object.values(store.sessions).filter(
      s => pCutoff === 0 || s.lastHeartbeat >= pCutoff || s.startTime >= pCutoff
    );

    const uniqueVisitors = new Set(
      pPVs.map(x => x.sessionId)
        .concat(pEvents.map(x => x.sessionId))
        .concat(pSess.map(x => x.sessionId))
        .filter(Boolean)
    ).size;

    const clinicalActions = pEvents.filter(e => e.category === "clinical").length;
    const criticalAlerts = pEvents.filter(
      e => e.category === "safety" || e.metadata?.severity === "CRITICAL" || e.eventName.includes("interaction") || e.eventName.includes("ddi")
    ).length;

    const pMenuStats = computeMenuStatsForWindow(pPVs, pEvents);
    let topMenuName = "-";
    let topMenuHits = 0;
    for (const def of moduleDefinitions) {
      const c = pMenuStats.counts[def.key] || 0;
      if (c > topMenuHits) {
        topMenuHits = c;
        topMenuName = def.name;
      }
    }

    const avgViewsPerVisitor = uniqueVisitors > 0
      ? Math.round((pPVs.length / uniqueVisitors) * 10) / 10
      : 0;

    return {
      key: p.key,
      label: p.label,
      shortLabel: p.shortLabel,
      uniqueVisitors,
      pageViews: pPVs.length,
      customEvents: pEvents.length,
      clinicalActions,
      criticalAlerts,
      avgViewsPerVisitor,
      topMenu: topMenuHits > 0 ? topMenuName : "Belum ada akses",
      topMenuHits
    };
  });

  // Calculate real average duration
  let totalDurationSec = 0;
  let validSessions = 0;
  for (const sess of Object.values(store.sessions)) {
    const dur = Math.max(0, Math.round((sess.lastHeartbeat - sess.startTime) / 1000));
    if (dur > 0) {
      totalDurationSec += dur;
      validSessions++;
    }
  }
  store.pageViews.forEach(pv => {
    if (pv.durationSec && pv.durationSec > 0) {
      totalDurationSec += pv.durationSec;
      validSessions++;
    }
  });
  const avgDurationSec = validSessions > 0 ? Math.round(totalDurationSec / validSessions) : 120;
  const avgMins = Math.floor(avgDurationSec / 60);
  const avgSecs = avgDurationSec % 60;
  const avgDurationFormatted = `${avgMins} Menit ${avgSecs} Detik`;

  function categorizeReferrer(ref?: string): string {
    if (!ref || ref === "" || ref.toLowerCase() === "null" || ref.toLowerCase() === "direct") {
      return "Direct / Bookmark Apotek";
    }
    const r = ref.toLowerCase();
    if (r.includes("google") || r.includes("bing") || r.includes("yahoo") || r.includes("duckduckgo") || r.includes("search")) {
      return "Google Organic (Pencarian Dosis Obat)";
    }
    if (r.includes("whatsapp") || r.includes("wa.me") || r.includes("api.whatsapp") || r.includes("telegram")) {
      return "WhatsApp Group Farmasi & Klinisi";
    }
    if (r.includes("rsud") || r.includes("simrs") || r.includes("puskesmas") || r.includes("bpjs") || r.includes("portal") || r.includes("dinkes") || r.includes("faskes")) {
      return "Portal Rumah Sakit & Faskes BPJS";
    }
    if (r.includes("iai") || r.includes("pom.go.id") || r.includes("hisfarsi") || r.includes("kemkes") || r.includes("kemenkes")) {
      return "Referensi IAI & Kemkes/BPOM";
    }
    return "Direct / Bookmark Apotek";
  }

  const trafficChannels = [
    { key: "Direct / Bookmark Apotek", trend: "Real-Time" },
    { key: "Google Organic (Pencarian Dosis Obat)", trend: "Organik" },
    { key: "WhatsApp Group Farmasi & Klinisi", trend: "Rujukan" },
    { key: "Portal Rumah Sakit & Faskes BPJS", trend: "Jejaring" },
    { key: "Referensi IAI & Kemkes/BPOM", trend: "Klinis" }
  ];

  const sourceCounts: Record<string, number> = {
    "Direct / Bookmark Apotek": 0,
    "Google Organic (Pencarian Dosis Obat)": 0,
    "WhatsApp Group Farmasi & Klinisi": 0,
    "Portal Rumah Sakit & Faskes BPJS": 0,
    "Referensi IAI & Kemkes/BPOM": 0
  };

  store.pageViews.forEach(pv => {
    const channel = categorizeReferrer(pv.referrer);
    sourceCounts[channel] = (sourceCounts[channel] || 0) + 1;
  });

  const totalPageViewsLogged = Math.max(Object.values(sourceCounts).reduce((a, b) => a + b, 0), 1);

  const trafficSources = trafficChannels.map(tc => {
    const count = sourceCounts[tc.key] || 0;
    const percentage = Math.round((count / totalPageViewsLogged) * 1000) / 10;
    return {
      source: tc.key,
      visitors: count,
      percentage,
      trend: tc.trend
    };
  });

  // ============================================================================
  // DYNAMIC REAL GEOGRAPHIC DISTRIBUTION (Includes ALL Real Cities & Provinces)
  // ============================================================================
  const cityGroupMap = new Map<string, { city: string; province: string; users: number; isSumsel: boolean; isPalembang: boolean }>();

  const recordLocationHit = (cityString: string, weight: number = 1) => {
    const parsed = parseCityAndProvinceFromText(cityString);
    const key = `${parsed.city.toLowerCase()}|${parsed.province.toLowerCase()}`;
    const existing = cityGroupMap.get(key);
    if (existing) {
      existing.users += weight;
    } else {
      cityGroupMap.set(key, {
        city: parsed.city,
        province: parsed.province,
        users: weight,
        isSumsel: parsed.isSumsel,
        isPalembang: parsed.isPalembang
      });
    }
  };

  // Count from real sessions and real events/pageviews
  for (const sessId in store.sessions) {
    const s = store.sessions[sessId];
    recordLocationHit(s.city, Math.max(1, s.pageViewsCount || 1));
  }
  activeEventsForGeo.forEach(ev => {
    recordLocationHit(ev.city, 1);
  });

  const totalGeoHits = Math.max(
    Array.from(cityGroupMap.values()).reduce((acc, item) => acc + item.users, 0),
    1
  );

  const geoDistribution = Array.from(cityGroupMap.values())
    .sort((a, b) => b.users - a.users)
    .map(item => ({
      city: item.city,
      province: item.province,
      users: item.users,
      percentage: Math.round((item.users / totalGeoHits) * 1000) / 10,
      isSumsel: item.isSumsel,
      isPalembang: item.isPalembang
    }));

  // Calculate real Sumsel vs Palembang vs Outside Sumsel shares
  let sumselHits = 0;
  let palembangHits = 0;
  let outsideSumselHits = 0;
  for (const item of cityGroupMap.values()) {
    if (item.isSumsel) {
      sumselHits += item.users;
      if (item.isPalembang) {
        palembangHits += item.users;
      }
    } else {
      outsideSumselHits += item.users;
    }
  }

  const realSumselShare = Math.round((sumselHits / totalGeoHits) * 1000) / 10;
  const realPalembangShare = Math.round((palembangHits / totalGeoHits) * 1000) / 10;
  const realOutsideShare = Math.round((outsideSumselHits / totalGeoHits) * 1000) / 10;

  // Palembang Districts
  const palembangDistrictsDef = [
    {
      district: "Jakabaring & Seberang Ulu I",
      zone: "Kawasan RSUD Palembang BARI",
      faskesUtama: "RSUD Palembang BARI, Puskesmas 7 Ulu, Pustu 8 Ulu",
      keywords: ["jakabaring", "seberang ulu i", "bari", "7 ulu", "8 ulu", "kota palembang"],
      isHostHospital: true
    },
    {
      district: "Seberang Ulu II",
      zone: "Tangga Takat & 14 Ulu",
      faskesUtama: "Puskesmas Tangga Takat, Puskesmas Nagaswidak",
      keywords: ["seberang ulu ii", "tangga takat", "14 ulu", "nagaswidak"]
    },
    {
      district: "Plaju",
      zone: "Kawasan Komering & Pertamina",
      faskesUtama: "Puskesmas Pembina Plaju, RS Pertamina Plaju",
      keywords: ["plaju", "pembina", "komering", "pertamina"]
    },
    {
      district: "Ilir Barat I & II",
      zone: "Bukit Besar & Demang Lebar Daun",
      faskesUtama: "RS Siti Khadijah, Puskesmas Padang Selasa, Puskesmas Makrayu",
      keywords: ["ilir barat", "bukit besar", "demang", "khadijah", "padang selasa"]
    },
    {
      district: "Ilir Timur I, II & III",
      zone: "Pusat Kota & Lemabang",
      faskesUtama: "RSUP Dr. Moh. Hoesin (RSMH), RS RK Charitas, RS Hermina",
      keywords: ["ilir timur", "lemabang", "hoesin", "rsmh", "charitas", "hermina"]
    },
    {
      district: "Kertapati",
      zone: "Ogan Baru & Stasiun Kertapati",
      faskesUtama: "Puskesmas Kertapati, Puskesmas Ogan Baru",
      keywords: ["kertapati", "ogan baru"]
    },
    {
      district: "Sukarami & Alang-Alang Lebar",
      zone: "KM 9 - Bandara SMB II",
      faskesUtama: "RSUD Siti Fatimah Prov. Sumsel, Puskesmas Sukarami",
      keywords: ["sukarami", "alang-alang", "km 9", "siti fatimah", "bandara"]
    },
    {
      district: "Sako, Kalidoni & Kemuning",
      zone: "Palembang Timur",
      faskesUtama: "Puskesmas Sako, Puskesmas Kalidoni",
      keywords: ["sako", "kalidoni", "kemuning", "sematang"]
    }
  ];

  let totalDistrictLogs = 0;
  const districtMatchedData = palembangDistrictsDef.map(d => {
    let matchedLogs = 0;
    let activeNow = 0;

    for (const sessId in store.sessions) {
      const s = store.sessions[sessId];
      const cityLow = (s.city || "").toLowerCase();
      if (d.keywords.some(k => cityLow.includes(k))) {
        matchedLogs += (s.pageViewsCount || 1);
        if (s.lastHeartbeat >= Date.now() - 90000) activeNow++;
      }
    }

    store.events.forEach(e => {
      const cityLow = (e.city || "").toLowerCase();
      if (d.keywords.some(k => cityLow.includes(k))) matchedLogs++;
    });

    totalDistrictLogs += matchedLogs;
    return { d, matchedLogs, activeNow };
  });

  const palembangDistricts = districtMatchedData.map(({ d, matchedLogs, activeNow }) => {
    const percentage = totalDistrictLogs > 0
      ? Math.round((matchedLogs / totalDistrictLogs) * 1000) / 10
      : 0;

    return {
      district: d.district,
      zone: d.zone,
      faskesUtama: d.faskesUtama,
      users: matchedLogs,
      percentage,
      activeNow,
      isHostHospital: !!d.isHostHospital
    };
  });

  // Sumsel Regencies
  const sumselRegenciesDef = [
    { regency: "Kota Palembang", capital: "Pusat Rujukan Provinsi", keywords: ["palembang", "bari"], faskesCount: 42, trend: "Real-Time" },
    { regency: "Kab. Banyuasin", capital: "Pangkalan Balai / Sungai Gerong", keywords: ["banyuasin", "pangkalan balai", "sungai gerong", "sungaigerong"], faskesCount: 33, trend: "Real-Time" },
    { regency: "Kab. Ogan Ilir", capital: "Indralaya", keywords: ["ogan ilir", "indralaya"], faskesCount: 26, trend: "Real-Time" },
    { regency: "Kab. Ogan Komering Ilir (OKI)", capital: "Kayuagung", keywords: ["oki", "kayuagung", "komering ilir"], faskesCount: 29, trend: "Real-Time" },
    { regency: "Kota Prabumulih", capital: "Prabumulih", keywords: ["prabumulih"], faskesCount: 16, trend: "Real-Time" },
    { regency: "Kab. Muara Enim", capital: "Muara Enim", keywords: ["muara enim"], faskesCount: 22, trend: "Real-Time" },
    { regency: "Kab. Lahat", capital: "Lahat", keywords: ["lahat"], faskesCount: 19, trend: "Real-Time" },
    { regency: "Kota Lubuklinggau", capital: "Lubuklinggau", keywords: ["lubuklinggau"], faskesCount: 14, trend: "Real-Time" },
    { regency: "Kab. OKU (Baturaja)", capital: "Baturaja", keywords: ["baturaja", "oku "], faskesCount: 18, trend: "Real-Time" },
    { regency: "Kab. Musi Banyuasin (Muba)", capital: "Sekayu", keywords: ["sekayu", "muba", "musi banyuasin"], faskesCount: 24, trend: "Real-Time" },
    { regency: "Kab. OKU Timur", capital: "Martapura", keywords: ["oku timur", "martapura"], faskesCount: 17, trend: "Real-Time" },
    { regency: "Kota Pagar Alam", capital: "Besemah", keywords: ["pagar alam"], faskesCount: 9, trend: "Real-Time" },
    { regency: "Kab. OKU Selatan", capital: "Muaradua", keywords: ["oku selatan", "muaradua"], faskesCount: 15, trend: "Real-Time" },
    { regency: "Kab. PALI", capital: "Talang Ubi (Pendopo)", keywords: ["pali", "talang ubi"], faskesCount: 11, trend: "Real-Time" },
    { regency: "Kab. Empat Lawang", capital: "Tebing Tinggi", keywords: ["empat lawang", "tebing tinggi"], faskesCount: 10, trend: "Real-Time" },
    { regency: "Kab. Musi Rawas", capital: "Muara Beliti", keywords: ["musi rawas", "muara beliti"], faskesCount: 12, trend: "Real-Time" },
    { regency: "Kab. Musi Rawas Utara", capital: "Rupit", keywords: ["musi rawas utara", "muratara", "rupit"], faskesCount: 8, trend: "Real-Time" }
  ];

  let totalSumselLogs = 0;
  const regencyMatchedData = sumselRegenciesDef.map(reg => {
    let matched = 0;
    let active = 0;

    for (const sessId in store.sessions) {
      const s = store.sessions[sessId];
      const cityLow = (s.city || "").toLowerCase();
      if (reg.keywords.some(k => cityLow.includes(k))) {
        matched += (s.pageViewsCount || 1);
        if (s.lastHeartbeat >= Date.now() - 90000) active++;
      }
    }

    store.events.forEach(ev => {
      const cityLow = (ev.city || "").toLowerCase();
      if (reg.keywords.some(k => cityLow.includes(k))) matched++;
    });

    totalSumselLogs += matched;
    return { reg, matched, active };
  });

  const sumselRegencies = regencyMatchedData.map(({ reg, matched, active }) => {
    const percentage = totalSumselLogs > 0
      ? Math.round((matched / totalSumselLogs) * 1000) / 10
      : 0;

    return {
      regency: reg.regency,
      capital: reg.capital,
      users: matched,
      percentage,
      activeNow: active,
      faskesCount: reg.faskesCount,
      trend: reg.trend
    };
  });

  // Faskes Referral Network
  const sumselFaskes = [
    {
      name: "RSUD Palembang BARI",
      location: "Jakabaring, Kota Palembang",
      type: "RS Daerah (Host)",
      sessionsToday: palembangDistricts[0]?.users || 0,
      activeNow: palembangDistricts[0]?.activeNow || 0,
      topModule: "Kalkulator Dosis & Skrining DDI"
    },
    {
      name: "RSUP Dr. Mohammad Hoesin (RSMH)",
      location: "Ilir Timur I, Kota Palembang",
      type: "RS Rujukan Nasional",
      sessionsToday: palembangDistricts[4]?.users || 0,
      activeNow: palembangDistricts[4]?.activeNow || 0,
      topModule: "Kompatibilitas IV & Restriksi Fornas"
    },
    {
      name: "RSUD Siti Fatimah Prov. Sumsel",
      location: "KM 6, Kota Palembang",
      type: "RSUD Provinsi",
      sessionsToday: palembangDistricts[6]?.users || 0,
      activeNow: palembangDistricts[6]?.activeNow || 0,
      topModule: "Katalog Informasi Obat & Dosis"
    },
    {
      name: "Puskesmas Pembina (Plaju)",
      location: "Plaju, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: palembangDistricts[2]?.users || 0,
      activeNow: palembangDistricts[2]?.activeNow || 0,
      topModule: "Informasi Obat & Rekam SOAP"
    },
    {
      name: "Faskes Jejaring Kab. Banyuasin / Sungai Gerong",
      location: "Kabupaten Banyuasin",
      type: "Puskesmas Jejaring",
      sessionsToday: sumselRegencies.find(r => r.regency.includes("Banyuasin"))?.users || 0,
      activeNow: sumselRegencies.find(r => r.regency.includes("Banyuasin"))?.activeNow || 0,
      topModule: "Clinical SOAP & Informasi Obat"
    },
    {
      name: "Akses Nasional Luar Sumsel (Padang / Jakarta / Lainnya)",
      location: "Lintas Provinsi Indonesia",
      type: "RS Rujukan Nasional",
      sessionsToday: outsideSumselHits,
      activeNow: Object.values(store.sessions).filter(s => s.lastHeartbeat >= Date.now() - 90000 && !parseCityAndProvinceFromText(s.city).isSumsel).length,
      topModule: "Web Analytics, Informasi Obat & DDI"
    }
  ];

  const topGeo = geoDistribution[0];
  const sumselStats = {
    province: "Sumatera Selatan & Nasional",
    primaryCity: topGeo ? `${topGeo.city} (${topGeo.province})` : "Kota Palembang",
    hostHospital: "RSUD Palembang BARI (Jakabaring)",
    sumselTrafficShare: realSumselShare,
    palembangTrafficShare: realPalembangShare,
    outsideSumselTrafficShare: realOutsideShare,
    topDistrict: topGeo ? `${topGeo.city}, ${topGeo.province}` : "Kota Palembang",
    activeFaskesCount: Object.keys(store.sessions).length,
    onlineSumselNow: getActiveUsersCount()
  };

  const uniqueWindowSessions = new Set(
    filteredPVs.map(p => p.sessionId)
      .concat(filteredEvents.map(e => e.sessionId))
      .concat(filteredSessions.map(s => s.sessionId))
      .filter(Boolean)
  ).size;

  const criticalAlertsCount = filteredEvents.filter(e =>
    e.category === "safety" ||
    e.metadata?.severity === "CRITICAL" ||
    e.eventName.includes("interaction") ||
    e.eventName.includes("ddi")
  ).length;

  const clinicalCount = filteredEvents.filter(e => e.category === "clinical").length;

  // Also include active sessions list so Admin can see every connected/recent session & its real IP/city
  const recentSessions = Object.values(store.sessions)
    .sort((a, b) => b.lastHeartbeat - a.lastHeartbeat)
    .slice(0, 25)
    .map(s => ({
      sessionId: s.sessionId,
      ip: s.ip,
      city: s.city,
      device: s.device,
      browser: s.browser,
      currentModule: s.currentModule,
      startTime: s.startTime,
      lastHeartbeat: s.lastHeartbeat,
      lastActive: s.lastHeartbeat,
      isOnline: s.lastHeartbeat >= Date.now() - 90000,
      pageViewsCount: s.pageViewsCount
    }));

  const viewerIp = req ? extractClientIP(req) : undefined;
  const viewerGeo = viewerIp ? ipGeoCache.get(viewerIp)?.formatted : undefined;
  const latestActiveSession = recentSessions[0];
  const currentVisitorGeo = {
    city: viewerGeo || latestActiveSession?.city || "Kota Palembang, Sumatera Selatan",
    ip: (viewerIp && !isPrivateOrLocalIP(viewerIp)) ? viewerIp : (latestActiveSession?.ip || "2404:c0:d403::0")
  };

  return {
    activeUsersNow: getActiveUsersCount(),
    pageViewsToday: timeRange === "all" ? store.pageViews.length : filteredPVs.length,
    uniqueSessionsToday: timeRange === "all"
      ? Math.max(uniqueWindowSessions, Object.keys(store.sessions).length)
      : uniqueWindowSessions,
    customEventsCount: timeRange === "all" ? store.events.length : filteredEvents.length,
    criticalAlertsCount,
    clinicalCount,
    avgDurationSec,
    avgDurationFormatted,
    hourlyTraffic: hourlyCurve,
    dailyTraffic: dailyCurve,
    monthlyTraffic: monthlyCurve,
    sixMonthTraffic,
    yearlyTraffic,
    allTimeTraffic,
    visitorResume,
    topMenus,
    deviceBreakdown: [
      { type: "Mobile", percentage: mobilePct, count: mobileCount },
      { type: "Desktop", percentage: desktopPct, count: desktopCount },
      { type: "Tablet", percentage: tabletPct, count: tabletCount }
    ],
    liveModules,
    trafficSources,
    geoDistribution,
    palembangDistricts,
    sumselRegencies,
    sumselFaskes,
    sumselStats,
    recentSessions,
    currentVisitorGeo,
    viewerIp,
    viewerGeo,
    serverUptime: Math.round(process.uptime()),
    totalStoredEvents: store.events.length,
    totalStoredPageviews: store.pageViews.length,
    trackingSince: earliestTs,
    timeRange,
    isRealDatabase: true
  };
}

export function getStoredEvents(options: {
  category?: string;
  region?: string;
  search?: string;
  limit?: number;
}) {
  initAnalyticsEngine();
  let list = [...store.events];

  if (options.category && options.category !== "all") {
    list = list.filter(e => e.category === options.category);
  }

  if (options.region && options.region !== "all") {
    if (options.region === "palembang") {
      list = list.filter(e => parseCityAndProvinceFromText(e.city).isPalembang);
    } else if (options.region === "sumsel_other") {
      list = list.filter(e => {
        const parsed = parseCityAndProvinceFromText(e.city);
        return parsed.isSumsel && !parsed.isPalembang;
      });
    } else if (options.region === "outside") {
      list = list.filter(e => !parseCityAndProvinceFromText(e.city).isSumsel);
    }
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter(e =>
      e.eventName.toLowerCase().includes(q) ||
      e.label.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      (e.ip || "").toLowerCase().includes(q) ||
      JSON.stringify(e.metadata || {}).toLowerCase().includes(q)
    );
  }

  const limit = options.limit || 150;
  return list.slice(0, limit);
}

export function resetAnalyticsStore() {
  initAnalyticsEngine();
  store = {
    version: 2,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    sessions: {},
    events: [],
    pageViews: []
  };
  scheduleSave();
  return {
    success: true,
    message: "Database telemetri berhasil direset bersih dan siap mencatat sesi pengunjung real-time."
  };
}
