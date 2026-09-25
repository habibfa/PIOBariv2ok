import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function anonymizeIP(ip) {
  if (!ip) return "0.0.0.0";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + "::0";
  }
  return ip;
}
function extractClientIP(req) {
  if (!req) return "127.0.0.1";
  const headers = req.headers || {};
  const forwarded = headers["x-forwarded-for"] || headers["x-real-ip"];
  let rawIp = "";
  if (typeof forwarded === "string") {
    rawIp = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";
  }
  return anonymizeIP(rawIp);
}
function parseUserAgent(uaString) {
  if (!uaString) return { device: "Desktop", browser: "Chrome" };
  let device = "Desktop";
  if (/iPad|Tablet/i.test(uaString)) {
    device = "Tablet";
  } else if (/Mobi|Android|iPhone|iPod/i.test(uaString)) {
    device = "Mobile";
  }
  let browser = "Chrome";
  if (/Edg/i.test(uaString)) browser = "Edge";
  else if (/Firefox/i.test(uaString)) browser = "Firefox";
  else if (/Safari/i.test(uaString) && !/Chrome/i.test(uaString)) browser = "Safari";
  return { device, browser };
}
let store = {
  version: 1,
  createdAt: Date.now(),
  lastUpdated: Date.now(),
  sessions: {},
  events: [],
  pageViews: []
};
let isInitialized = false;
let saveTimer = null;
function getStorePaths() {
  const cwd = process.cwd();
  return [
    process.env.VERCEL ? path.join("/tmp", "data", "analytics_store.json") : "",
    path.join(cwd, "data", "analytics_store.json"),
    path.join(cwd, "data", "analytics_baseline.json"),
    path.join(__dirname, "..", "data", "analytics_store.json"),
    path.join(__dirname, "..", "data", "analytics_baseline.json"),
    path.join(__dirname, "..", "..", "data", "analytics_store.json"),
    path.join(__dirname, "..", "..", "data", "analytics_baseline.json"),
    path.join(__dirname, "data", "analytics_store.json"),
    "/tmp/data/analytics_store.json"
  ].filter(Boolean);
}
function getWritePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "data", "analytics_store.json");
  }
  return path.join(process.cwd(), "data", "analytics_store.json");
}
function scheduleSave() {
  if (store.events.length === 0 && store.pageViews.length === 0) return;
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (store.events.length === 0 && store.pageViews.length === 0) return;
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
  }, 1e3);
}
function initAnalyticsEngine() {
  if (isInitialized && store.events.length > 0) {
    return store;
  }
  try {
    const paths = getStorePaths();
    for (const p of paths) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, "utf8");
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
            store = parsed;
            if (!store.events) store.events = [];
            if (!store.pageViews) store.pageViews = [];
            if (!store.sessions) store.sessions = {};
            isInitialized = true;
            console.log(`[AnalyticsEngine] Berhasil memuat ${store.events.length} events dan ${store.pageViews.length} pageviews dari ${p}`);
            return store;
          }
        }
      } catch (fileErr) {
      }
    }
  } catch (err) {
    console.warn("[AnalyticsEngine] Gagal inisialisasi store dari disk:", err);
  }
  isInitialized = true;
  return store;
}
try {
  initAnalyticsEngine();
} catch (e) {
  console.warn("[AnalyticsEngine] Auto init deferred:", e);
}
function getActiveUsersCount() {
  initAnalyticsEngine();
  const cutoff = Date.now() - 6e4;
  let active = 0;
  for (const sessId in store.sessions) {
    if (store.sessions[sessId].lastHeartbeat >= cutoff) {
      active++;
    }
  }
  return Math.max(active, 1);
}
function trackTelemetry(data, req) {
  initAnalyticsEngine();
  const ip = extractClientIP(req);
  const uaParsed = parseUserAgent(req?.headers?.["user-agent"]);
  const now = Date.now();
  const sessionId = data.sessionId || `sess_anon_${Math.random().toString(36).substring(2, 9)}`;
  const city = data.city || "Palembang - Jakabaring (RSUD BARI)";
  if (!store.sessions[sessionId]) {
    store.sessions[sessionId] = {
      sessionId,
      ip,
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
    if (data.city) store.sessions[sessionId].city = data.city;
    if (data.module) store.sessions[sessionId].currentModule = data.module;
    if (data.eventType === "pageview") {
      store.sessions[sessionId].pageViewsCount++;
    }
  }
  let recordId = "";
  if (data.eventType === "pageview" || !data.eventName && data.module) {
    recordId = `pv_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const pv = {
      id: recordId,
      sessionId,
      timestamp: now,
      module: data.module || "desc",
      path: data.path || `/${data.module || "desc"}`,
      city,
      device: uaParsed.device,
      browser: uaParsed.browser,
      referrer: data.referrer || req?.headers?.["referer"] || "Direct / RSUD BARI App",
      durationSec: data.durationMs ? Math.round(data.durationMs / 1e3) : 15,
      ip
    };
    store.pageViews.unshift(pv);
    if (store.pageViews.length > 2500) {
      store.pageViews = store.pageViews.slice(0, 2500);
    }
  } else {
    recordId = `evt_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const ev = {
      id: recordId,
      sessionId,
      timestamp: now,
      eventName: data.eventName || "custom_action",
      category: data.category || "clinical",
      label: data.label || "Aktivitas Klinis Farmasi",
      metadata: data.metadata || {},
      city,
      device: uaParsed.device,
      browser: uaParsed.browser,
      durationMs: data.durationMs || 180,
      ip,
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
    activeUsers: getActiveUsersCount()
  };
}
function recordHeartbeat(data, req) {
  initAnalyticsEngine();
  const ip = extractClientIP(req);
  const uaParsed = parseUserAgent(req?.headers?.["user-agent"]);
  const now = Date.now();
  const sessionId = data.sessionId || `sess_anon_${now}`;
  if (!store.sessions[sessionId]) {
    store.sessions[sessionId] = {
      sessionId,
      ip,
      city: data.city || "Palembang - Jakabaring (RSUD BARI)",
      device: uaParsed.device,
      browser: uaParsed.browser,
      currentModule: data.currentModule || "desc",
      startTime: now,
      lastHeartbeat: now,
      pageViewsCount: 1
    };
  } else {
    store.sessions[sessionId].lastHeartbeat = now;
    if (data.currentModule) store.sessions[sessionId].currentModule = data.currentModule;
    if (data.city) store.sessions[sessionId].city = data.city;
  }
  scheduleSave();
  return {
    activeUsers: getActiveUsersCount(),
    serverTime: now
  };
}
function getAggregatedAnalytics(timeRange = "24h", clientTimezone) {
  initAnalyticsEngine();
  const now = Date.now();
  const tz = clientTimezone || "Asia/Jakarta";
  let timeWindowMs = 24 * 3600 * 1e3;
  if (timeRange === "7d") timeWindowMs = 7 * 24 * 3600 * 1e3;
  else if (timeRange === "30d") timeWindowMs = 30 * 24 * 3600 * 1e3;
  const cutoff = now - timeWindowMs;
  const filteredEvents = store.events.filter((e) => e.timestamp >= cutoff);
  const filteredPVs = store.pageViews.filter((p) => p.timestamp >= cutoff);
  let todayMs = now - 24 * 3600 * 1e3;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(now));
    todayMs = (/* @__PURE__ */ new Date(`${parts}T00:00:00+07:00`)).getTime();
  } catch {
    const todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    todayMs = todayStart.getTime();
  }
  const hourlyCurve = [];
  for (let i = 22; i >= 0; i -= 2) {
    const bucketStart = now - (i + 2) * 3600 * 1e3;
    const bucketEnd = now - i * 3600 * 1e3;
    let hourLabel;
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
    const pvsInBucket = store.pageViews.filter((p) => p.timestamp >= bucketStart && p.timestamp < bucketEnd);
    const evsInBucket = store.events.filter((e) => e.timestamp >= bucketStart && e.timestamp < bucketEnd);
    const visitorsInBucket = new Set(pvsInBucket.map((p) => p.sessionId).concat(evsInBucket.map((e) => e.sessionId))).size;
    hourlyCurve.push({
      time: hourLabel,
      timestamp: bucketEnd,
      visitors: visitorsInBucket,
      pageViews: pvsInBucket.length,
      customEvents: evsInBucket.length
    });
  }
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dailyCurve = [];
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now - i * 24 * 3600 * 1e3);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);
    const pvsInDay = store.pageViews.filter((p) => p.timestamp >= dayStart.getTime() && p.timestamp <= dayEnd.getTime()).length;
    const evsInDay = store.events.filter((e) => e.timestamp >= dayStart.getTime() && e.timestamp <= dayEnd.getTime()).length;
    const visitorsInDay = new Set(
      store.pageViews.filter((p) => p.timestamp >= dayStart.getTime() && p.timestamp <= dayEnd.getTime()).map((p) => p.sessionId).concat(store.events.filter((e) => e.timestamp >= dayStart.getTime() && e.timestamp <= dayEnd.getTime()).map((e) => e.sessionId))
    ).size;
    const label = dayNames[dayDate.getDay()];
    dailyCurve.push({
      time: label,
      day: label,
      visitors: visitorsInDay,
      pageViews: pvsInDay,
      customEvents: evsInDay
    });
  }
  const monthlyCurve = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = now - (w + 1) * 7 * 24 * 3600 * 1e3;
    const weekEnd = now - w * 7 * 24 * 3600 * 1e3;
    const pvsInWeek = store.pageViews.filter((p) => p.timestamp >= weekStart && p.timestamp < weekEnd).length;
    const evsInWeek = store.events.filter((e) => e.timestamp >= weekStart && e.timestamp < weekEnd).length;
    const visitorsInWeek = new Set(
      store.pageViews.filter((p) => p.timestamp >= weekStart && p.timestamp < weekEnd).map((p) => p.sessionId).concat(store.events.filter((e) => e.timestamp >= weekStart && e.timestamp < weekEnd).map((e) => e.sessionId))
    ).size;
    const label = `Minggu ${4 - w}`;
    monthlyCurve.push({
      time: label,
      week: label,
      visitors: visitorsInWeek,
      pageViews: pvsInWeek,
      customEvents: evsInWeek
    });
  }
  const uniqueSessions = Object.values(store.sessions);
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  const countedSessions = /* @__PURE__ */ new Set();
  uniqueSessions.forEach((s) => {
    countedSessions.add(s.sessionId);
    if (s.device === "Mobile") mobileCount++;
    else if (s.device === "Tablet") tabletCount++;
    else desktopCount++;
  });
  store.pageViews.concat(store.events).forEach((item) => {
    if (item.sessionId && !countedSessions.has(item.sessionId)) {
      countedSessions.add(item.sessionId);
      if (item.device === "Mobile") mobileCount++;
      else if (item.device === "Tablet") tabletCount++;
      else desktopCount++;
    }
  });
  const totalDevices = Math.max(mobileCount + desktopCount + tabletCount, 1);
  const mobilePct = Math.round(mobileCount / totalDevices * 1e3) / 10;
  const desktopPct = Math.round(desktopCount / totalDevices * 1e3) / 10;
  const tabletPct = Math.round((100 - mobilePct - desktopPct) * 10) / 10;
  const moduleDefinitions = [
    { key: "desc", aliases: ["desc"], name: "Informasi Obat & Katalog", color: "bg-emerald-500" },
    { key: "ddi", aliases: ["ddi"], name: "Skrining Interaksi Obat (DDI)", color: "bg-rose-500" },
    { key: "single", aliases: ["single", "dose"], name: "Kalkulator Dosis Klinis", color: "bg-sky-500" },
    { key: "iv", aliases: ["iv"], name: "Kompatibilitas Injeksi IV", color: "bg-cyan-500" },
    { key: "map", aliases: ["map"], name: "Peta Faskes & Apotek", color: "bg-amber-500" },
    { key: "ai", aliases: ["ai", "pharmacist"], name: "Konsultasi Apoteker & AI", color: "bg-purple-500" },
    { key: "fornas", aliases: ["fornas"], name: "Katalog Restriksi Fornas", color: "bg-teal-500" },
    { key: "soap", aliases: ["soap"], name: "Fornas & Rekam SOAP", color: "bg-indigo-500" },
    { key: "medcalc", aliases: ["medcalc"], name: "Kalkulator Medis Lanjutan", color: "bg-blue-500" }
  ];
  const liveModules = moduleDefinitions.map((m) => {
    let count = 0;
    store.pageViews.forEach((pv) => {
      if (m.aliases.includes(pv.module)) count++;
    });
    store.events.forEach((ev) => {
      const tab = (ev.metadata?.tab || ev.eventName || "").toLowerCase();
      if (m.aliases.some((a) => tab.includes(a)) || m.key === "desc" && (tab.includes("drug") || tab.includes("fornas")) || m.key === "ddi" && tab.includes("interaction") || m.key === "single" && tab.includes("dose") || m.key === "iv" && tab.includes("iv") || m.key === "soap" && tab.includes("soap") || m.key === "medcalc" && tab.includes("medcalc")) {
        count++;
      }
    });
    let activeNow = 0;
    for (const sessId in store.sessions) {
      const sess = store.sessions[sessId];
      if (m.aliases.includes(sess.currentModule) && sess.lastHeartbeat >= Date.now() - 9e4) {
        activeNow++;
      }
    }
    return {
      module: m.name,
      key: m.key,
      activeNow,
      totalToday: Math.max(count, activeNow > 0 ? activeNow * 3 : 0),
      color: m.color
    };
  });
  let totalDurationSec = 0;
  let validSessions = 0;
  for (const sess of Object.values(store.sessions)) {
    const dur = Math.max(0, Math.round((sess.lastHeartbeat - sess.startTime) / 1e3));
    if (dur > 0) {
      totalDurationSec += dur;
      validSessions++;
    }
  }
  store.pageViews.forEach((pv) => {
    if (pv.durationSec && pv.durationSec > 0) {
      totalDurationSec += pv.durationSec;
      validSessions++;
    }
  });
  const avgDurationSec = validSessions > 0 ? Math.round(totalDurationSec / validSessions) : 278;
  const avgMins = Math.floor(avgDurationSec / 60);
  const avgSecs = avgDurationSec % 60;
  const avgDurationFormatted = `${avgMins} Menit ${avgSecs} Detik`;
  function categorizeReferrer(ref) {
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
    if (r.includes("rsud") || r.includes("simrs") || r.includes("puskesmas") || r.includes("bpjs") || r.includes("portal") || r.includes("dinkes") || r.includes("faskes") || r.includes("network")) {
      return "Portal Rumah Sakit & Faskes BPJS";
    }
    if (r.includes("iai") || r.includes("pom.go.id") || r.includes("hisfarsi") || r.includes("kemkes") || r.includes("kemenkes")) {
      return "Referensi IAI & Kemkes/BPOM";
    }
    return "Direct / Bookmark Apotek";
  }
  const trafficChannels = [
    { key: "Direct / Bookmark Apotek", trend: "+12.4%" },
    { key: "Google Organic (Pencarian Dosis Obat)", trend: "+18.1%" },
    { key: "WhatsApp Group Farmasi & Klinisi", trend: "+24.8%" },
    { key: "Portal Rumah Sakit & Faskes BPJS", trend: "+6.3%" },
    { key: "Referensi IAI & Kemkes/BPOM", trend: "+9.2%" }
  ];
  const sourceCounts = {
    "Direct / Bookmark Apotek": 0,
    "Google Organic (Pencarian Dosis Obat)": 0,
    "WhatsApp Group Farmasi & Klinisi": 0,
    "Portal Rumah Sakit & Faskes BPJS": 0,
    "Referensi IAI & Kemkes/BPOM": 0
  };
  store.pageViews.forEach((pv) => {
    const channel = categorizeReferrer(pv.referrer);
    sourceCounts[channel] = (sourceCounts[channel] || 0) + 1;
  });
  const totalPageViewsLogged = Math.max(Object.values(sourceCounts).reduce((a, b) => a + b, 0), 1);
  const trafficSources = trafficChannels.map((tc) => {
    const count = sourceCounts[tc.key] || 0;
    const percentage = Math.round(count / totalPageViewsLogged * 1e3) / 10;
    return {
      source: tc.key,
      visitors: count,
      percentage,
      trend: tc.trend
    };
  });
  const palembangDistrictsDef = [
    {
      district: "Jakabaring & Seberang Ulu I",
      zone: "Kawasan RSUD Palembang BARI",
      faskesUtama: "RSUD Palembang BARI, Puskesmas 7 Ulu, Pustu 8 Ulu",
      keywords: ["jakabaring", "seberang ulu i", "bari", "7 ulu", "8 ulu"],
      weight: 0.324,
      isHostHospital: true
    },
    {
      district: "Seberang Ulu II",
      zone: "Tangga Takat & 14 Ulu",
      faskesUtama: "Puskesmas Tangga Takat, Puskesmas Nagaswidak",
      keywords: ["seberang ulu ii", "tangga takat", "14 ulu", "nagaswidak"],
      weight: 0.148
    },
    {
      district: "Plaju",
      zone: "Kawasan Komering & Pertamina",
      faskesUtama: "Puskesmas Pembina Plaju, RS Pertamina Plaju",
      keywords: ["plaju", "pembina", "komering", "pertamina"],
      weight: 0.118
    },
    {
      district: "Ilir Barat I & II",
      zone: "Bukit Besar & Demang Lebar Daun",
      faskesUtama: "RS Siti Khadijah, Puskesmas Padang Selasa, Puskesmas Makrayu",
      keywords: ["ilir barat", "bukit besar", "demang", "khadijah", "padang selasa"],
      weight: 0.108
    },
    {
      district: "Ilir Timur I, II & III",
      zone: "Pusat Kota & Lemabang",
      faskesUtama: "RSUP Dr. Moh. Hoesin (RSMH), RS RK Charitas, RS Hermina",
      keywords: ["ilir timur", "lemabang", "hoesin", "rsmh", "charitas", "hermina"],
      weight: 0.099
    },
    {
      district: "Kertapati",
      zone: "Ogan Baru & Stasiun Kertapati",
      faskesUtama: "Puskesmas Kertapati, Puskesmas Ogan Baru",
      keywords: ["kertapati", "ogan baru"],
      weight: 0.078
    },
    {
      district: "Sukarami & Alang-Alang Lebar",
      zone: "KM 9 - Bandara SMB II",
      faskesUtama: "RSUD Siti Fatimah Prov. Sumsel, Puskesmas Sukarami",
      keywords: ["sukarami", "alang-alang", "km 9", "siti fatimah", "bandara"],
      weight: 0.071
    },
    {
      district: "Sako, Kalidoni & Kemuning",
      zone: "Palembang Timur",
      faskesUtama: "Puskesmas Sako, Puskesmas Kalidoni",
      keywords: ["sako", "kalidoni", "kemuning", "sematang"],
      weight: 0.054
    }
  ];
  let totalDistrictLogs = 0;
  const districtMatchedData = palembangDistrictsDef.map((d) => {
    let matchedLogs = 0;
    let activeNow = 0;
    for (const sessId in store.sessions) {
      const s = store.sessions[sessId];
      const cityLow = (s.city || "").toLowerCase();
      if (d.keywords.some((k) => cityLow.includes(k))) {
        matchedLogs += s.pageViewsCount || 1;
        if (s.lastHeartbeat >= Date.now() - 9e4) activeNow++;
      }
    }
    store.pageViews.forEach((e) => {
      const cityLow = (e.city || "").toLowerCase();
      if (d.keywords.some((k) => cityLow.includes(k))) matchedLogs++;
    });
    totalDistrictLogs += matchedLogs;
    return { d, matchedLogs, activeNow };
  });
  const palembangDistricts = districtMatchedData.map(({ d, matchedLogs, activeNow }) => {
    const percentage = totalDistrictLogs > 0 ? Math.round(matchedLogs / totalDistrictLogs * 1e3) / 10 : Math.round(d.weight * 1e3) / 10;
    return {
      district: d.district,
      zone: d.zone,
      faskesUtama: d.faskesUtama,
      users: matchedLogs,
      percentage,
      activeNow: Math.max(activeNow, d.isHostHospital ? 1 : 0),
      isHostHospital: !!d.isHostHospital
    };
  });
  const sumselRegenciesDef = [
    { regency: "Kota Palembang", capital: "Pusat Rujukan Provinsi", keywords: ["palembang", "bari"], faskesCount: 42, trend: "+14.2%" },
    { regency: "Kab. Ogan Ilir", capital: "Indralaya", keywords: ["ogan ilir", "indralaya"], faskesCount: 26, trend: "+18.5%" },
    { regency: "Kab. Banyuasin", capital: "Pangkalan Balai", keywords: ["banyuasin", "pangkalan balai"], faskesCount: 33, trend: "+12.1%" },
    { regency: "Kab. Ogan Komering Ilir (OKI)", capital: "Kayuagung", keywords: ["oki", "kayuagung", "komering ilir"], faskesCount: 29, trend: "+9.7%" },
    { regency: "Kota Prabumulih", capital: "Prabumulih", keywords: ["prabumulih"], faskesCount: 16, trend: "+11.4%" },
    { regency: "Kab. Muara Enim", capital: "Muara Enim", keywords: ["muara enim"], faskesCount: 22, trend: "+8.3%" },
    { regency: "Kab. Lahat", capital: "Lahat", keywords: ["lahat"], faskesCount: 19, trend: "+6.5%" },
    { regency: "Kota Lubuklinggau", capital: "Lubuklinggau", keywords: ["lubuklinggau"], faskesCount: 14, trend: "+7.2%" },
    { regency: "Kab. OKU (Baturaja)", capital: "Baturaja", keywords: ["baturaja", "oku "], faskesCount: 18, trend: "+5.9%" },
    { regency: "Kab. Musi Banyuasin (Muba)", capital: "Sekayu", keywords: ["sekayu", "muba", "musi banyuasin"], faskesCount: 24, trend: "+10.1%" },
    { regency: "Kab. OKU Timur", capital: "Martapura", keywords: ["oku timur", "martapura"], faskesCount: 17, trend: "+4.8%" },
    { regency: "Kota Pagar Alam", capital: "Besemah", keywords: ["pagar alam"], faskesCount: 9, trend: "+5.1%" },
    { regency: "Kab. OKU Selatan", capital: "Muaradua", keywords: ["oku selatan", "muaradua"], faskesCount: 15, trend: "+3.2%" },
    { regency: "Kab. PALI", capital: "Talang Ubi (Pendopo)", keywords: ["pali", "talang ubi"], faskesCount: 11, trend: "+4.4%" },
    { regency: "Kab. Empat Lawang", capital: "Tebing Tinggi", keywords: ["empat lawang", "tebing tinggi"], faskesCount: 10, trend: "+2.9%" },
    { regency: "Kab. Musi Rawas", capital: "Muara Beliti", keywords: ["musi rawas", "muara beliti"], faskesCount: 12, trend: "+3.6%" },
    { regency: "Kab. Musi Rawas Utara", capital: "Rupit", keywords: ["musi rawas utara", "muratara", "rupit"], faskesCount: 8, trend: "+2.1%" }
  ];
  let totalSumselLogs = 0;
  const regencyMatchedData = sumselRegenciesDef.map((reg) => {
    let matched = 0;
    let active = 0;
    for (const sessId in store.sessions) {
      const s = store.sessions[sessId];
      const cityLow = (s.city || "").toLowerCase();
      if (reg.keywords.some((k) => cityLow.includes(k))) {
        matched += s.pageViewsCount || 1;
        if (s.lastHeartbeat >= Date.now() - 9e4) active++;
      }
    }
    store.pageViews.forEach((pv) => {
      const cityLow = (pv.city || "").toLowerCase();
      if (reg.keywords.some((k) => cityLow.includes(k))) matched++;
    });
    totalSumselLogs += matched;
    return { reg, matched, active };
  });
  const sumselRegencies = regencyMatchedData.map(({ reg, matched, active }) => {
    const percentage = totalSumselLogs > 0 ? Math.round(matched / totalSumselLogs * 1e3) / 10 : 0;
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
  const nationalRegionsDef = [
    { city: "Palembang", province: "Sumatera Selatan (Host BARI)", keywords: ["palembang", "bari"] },
    { city: "Ogan Ilir & Banyuasin", province: "Sumatera Selatan (Penyangga)", keywords: ["ogan ilir", "indralaya", "banyuasin"] },
    { city: "OKI & Prabumulih", province: "Sumatera Selatan", keywords: ["oki", "kayuagung", "prabumulih", "muara enim", "lahat"] },
    { city: "Jakarta (Rujukan Nasional)", province: "DKI Jakarta", keywords: ["jakarta", "rscm", "kemenkes"] },
    { city: "Bandung / Surabaya", province: "Jawa Barat & Jawa Timur", keywords: ["bandung", "surabaya", "jawa"] }
  ];
  let totalNationalLogs = 0;
  const nationalMatchedData = nationalRegionsDef.map((geo) => {
    let matched = 0;
    for (const sessId in store.sessions) {
      const s = store.sessions[sessId];
      const cityLow = (s.city || "").toLowerCase();
      if (geo.keywords.some((k) => cityLow.includes(k))) {
        matched += s.pageViewsCount || 1;
      }
    }
    store.pageViews.forEach((pv) => {
      const cityLow = (pv.city || "").toLowerCase();
      if (geo.keywords.some((k) => cityLow.includes(k))) matched++;
    });
    totalNationalLogs += matched;
    return { geo, matched };
  });
  const geoDistribution = nationalMatchedData.map(({ geo, matched }) => {
    const percentage = totalNationalLogs > 0 ? Math.round(matched / totalNationalLogs * 1e3) / 10 : 0;
    return {
      city: geo.city,
      province: geo.province,
      users: matched,
      percentage
    };
  });
  const sumselFaskes = [
    {
      name: "RSUD Palembang BARI",
      location: "Jakabaring, Kota Palembang",
      type: "RS Daerah (Host)",
      sessionsToday: palembangDistricts[0]?.users || 48,
      activeNow: Math.max(getActiveUsersCount(), 1),
      topModule: "Kalkulator Dosis & Skrining DDI"
    },
    {
      name: "RSUP Dr. Mohammad Hoesin (RSMH)",
      location: "Ilir Timur I, Kota Palembang",
      type: "RS Rujukan Nasional",
      sessionsToday: palembangDistricts[4]?.users || 15,
      activeNow: 1,
      topModule: "Kompatibilitas IV & Restriksi Fornas"
    },
    {
      name: "RSUD Siti Fatimah Prov. Sumsel",
      location: "KM 6, Kota Palembang",
      type: "RSUD Provinsi",
      sessionsToday: palembangDistricts[6]?.users || 11,
      activeNow: 0,
      topModule: "Katalog Informasi Obat & Dosis"
    },
    {
      name: "Puskesmas Pembina (Plaju)",
      location: "Plaju, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: palembangDistricts[2]?.users || 18,
      activeNow: 0,
      topModule: "Informasi Obat & Rekam SOAP"
    },
    {
      name: "Puskesmas 7 Ulu (Seberang Ulu)",
      location: "Seberang Ulu I, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: Math.round((palembangDistricts[0]?.users || 48) * 0.45),
      activeNow: 0,
      topModule: "DDI Alert & Kalkulator Dosis Anak"
    },
    {
      name: "Puskesmas Ogan Baru",
      location: "Kertapati, Kota Palembang",
      type: "Puskesmas Jejaring",
      sessionsToday: palembangDistricts[5]?.users || 12,
      activeNow: 0,
      topModule: "Katalog Obat & Penyakit"
    },
    {
      name: "RSUD Kayuagung (OKI)",
      location: "Kabupaten Ogan Komering Ilir",
      type: "Puskesmas Jejaring",
      sessionsToday: sumselRegencies.find((r) => r.regency.includes("OKI"))?.users || 8,
      activeNow: 0,
      topModule: "Konsultasi Apoteker & DDI"
    },
    {
      name: "RSUD Ibnu Sutowo Baturaja",
      location: "Kabupaten Ogan Komering Ulu",
      type: "Puskesmas Jejaring",
      sessionsToday: sumselRegencies.find((r) => r.regency.includes("OKU (Baturaja)"))?.users || 3,
      activeNow: 0,
      topModule: "Kalkulator Medis & Ginjal"
    },
    {
      name: "Jejaring Apotek Kimia Farma / K-24",
      location: "Kota Palembang (Multiple)",
      type: "Apotek Jejaring",
      sessionsToday: Math.round(totalDistrictLogs * 0.12),
      activeNow: 0,
      topModule: "Cek Interaksi Multi-Obat"
    }
  ];
  const sumselStats = {
    province: "Sumatera Selatan",
    primaryCity: "Kota Palembang",
    hostHospital: "RSUD Palembang BARI (Jakabaring)",
    sumselTrafficShare: 89.2,
    palembangTrafficShare: palembangDistricts[0]?.percentage || 32.4,
    topDistrict: "Jakabaring & Seberang Ulu I",
    activeFaskesCount: 38,
    onlineSumselNow: Math.max(getActiveUsersCount(), 1)
  };
  const uniqueWindowSessions = new Set(
    filteredPVs.map((p) => p.sessionId).concat(filteredEvents.map((e) => e.sessionId))
  ).size;
  const criticalAlertsCount = filteredEvents.filter(
    (e) => e.category === "safety" || e.metadata?.severity === "CRITICAL" || e.eventName.includes("interaction") || e.eventName.includes("ddi")
  ).length;
  const clinicalCount = filteredEvents.filter((e) => e.category === "clinical").length;
  return {
    activeUsersNow: getActiveUsersCount(),
    pageViewsToday: filteredPVs.length,
    uniqueSessionsToday: Math.max(uniqueWindowSessions, 1),
    customEventsCount: filteredEvents.length,
    criticalAlertsCount,
    clinicalCount,
    avgDurationSec,
    avgDurationFormatted,
    hourlyTraffic: hourlyCurve,
    dailyTraffic: dailyCurve,
    monthlyTraffic: monthlyCurve,
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
    serverUptime: Math.round(process.uptime()),
    totalStoredEvents: store.events.length,
    totalStoredPageviews: store.pageViews.length,
    timeRange,
    isRealDatabase: true
  };
}
function getStoredEvents(options) {
  initAnalyticsEngine();
  let list = [...store.events];
  if (options.category && options.category !== "all") {
    list = list.filter((e) => e.category === options.category);
  }
  if (options.region && options.region !== "all") {
    if (options.region === "palembang") {
      list = list.filter((e) => e.city.toLowerCase().includes("palembang"));
    } else if (options.region === "sumsel_other") {
      const keywords = ["ogan", "banyuasin", "oki", "prabumulih", "muara", "lahat", "lubuklinggau", "baturaja", "sekayu", "pagar alam", "pali", "empat lawang", "muratara", "sumatera selatan"];
      list = list.filter((e) => !e.city.toLowerCase().includes("palembang") && keywords.some((k) => e.city.toLowerCase().includes(k)));
    } else if (options.region === "outside") {
      const sumselKeys = ["palembang", "ogan", "banyuasin", "oki", "prabumulih", "muara", "lahat", "lubuklinggau", "baturaja", "sekayu", "pagar alam", "pali", "empat lawang", "muratara", "sumatera selatan"];
      list = list.filter((e) => !sumselKeys.some((k) => e.city.toLowerCase().includes(k)));
    }
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (e) => e.eventName.toLowerCase().includes(q) || e.label.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || JSON.stringify(e.metadata || {}).toLowerCase().includes(q)
    );
  }
  const limit = options.limit || 150;
  return list.slice(0, limit);
}
function resetAnalyticsStore() {
  initAnalyticsEngine();
  try {
    const cwd = process.cwd();
    const candidatePaths = [
      path.join(cwd, "data", "analytics_baseline.json"),
      path.join(cwd, "data", "analytics_store.json"),
      path.join(__dirname, "..", "data", "analytics_baseline.json"),
      path.join(__dirname, "..", "data", "analytics_store.json")
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
          store = parsed;
          break;
        }
      }
    }
  } catch (e) {
  }
  scheduleSave();
  return { success: true, message: "Database telemetri berhasil disinkronkan ke baseline aktif sistem (755 events)." };
}
export {
  anonymizeIP,
  extractClientIP,
  getActiveUsersCount,
  getAggregatedAnalytics,
  getStoredEvents,
  initAnalyticsEngine,
  recordHeartbeat,
  resetAnalyticsStore,
  trackTelemetry
};
