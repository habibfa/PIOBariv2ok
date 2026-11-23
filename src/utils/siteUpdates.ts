export type SiteUpdateCategory = "fitur" | "data" | "tampilan" | "sistem";

export interface SiteUpdateItem {
  id: string;
  title: string;
  description: string;
  category: SiteUpdateCategory;
  timestamp: string; // ISO string
  targetTab?: string;
  isLive?: boolean;
}

const STORAGE_UPDATES_KEY = "piobari_site_updates_v1";
const STORAGE_READ_IDS_KEY = "piobari_site_updates_read_v1";
export const SITE_UPDATE_EVENT_NAME = "piobari:site-update";

/**
 * Daftar pembaruan resmi website.
 * Setiap kali ada pembaruan baru dengan ID baru ditambahkan ke daftar ini,
 * notifikasi berkedip di pojok kanan akan otomatis aktif untuk pengguna.
 */
export const RELEASE_SITE_UPDATES: SiteUpdateItem[] = [
  {
    id: "rel-2026-11-23-medscape-health-calc",
    title: "Menu Baru: Kalkulator Kesehatan (Referensi Medscape — Bahasa Indonesia)",
    description:
      "Tersedia 37 kalkulator klinis lintas 11 spesialisasi (Kardiologi, Nefrologi, IGD/ICU, Hepatologi, Pulmonologi, Neurologi, Hematologi, Endokrinologi, Obgyn, Pediatri & Farmakologi) lengkap dengan pencarian, favorit, rumus, dan interpretasi klinis.",
    category: "fitur",
    timestamp: "2026-11-23T09:05:00.000Z",
    targetTab: "health_calc",
  },
  {
    id: "rel-2026-11-23-health-status-charts",
    title: "Visualisasi Grafik Tren Epidemiologi (Recharts)",
    description:
      "Kalkulator Ukuran Status Kesehatan kini dilengkapi 6 grafik interaktif (tren multi-periode DBD/TB/Vital/KIA dengan penyimpanan snapshot periode, perbandingan indikator utama, kurva fertilitas ASFR, struktur demografi WUS/umur, morbiditas KLB, dan performa uji diagnostik 2×2).",
    category: "fitur",
    timestamp: "2026-11-23T08:30:00.000Z",
    targetTab: "health_status",
  },
  {
    id: "rel-2026-11-23-health-status-epi",
    title: "Menu Baru: Kalkulator Ukuran Status Kesehatan & Epidemiologi",
    description:
      "Tersedia menu baru 10 Indikator Dasar (CBR, IMR, MMR, CDR, IR DBD, CFR DBD, IR TB Paru, Proporsi WUS & GFR) lengkap beserta seluruh ukuran mortalitas, fertilitas, morbiditas, asosiasi RR/OR, uji diagnostik 2×2, dan ekspor Excel.",
    category: "fitur",
    timestamp: "2026-11-23T04:00:00.000Z",
    targetTab: "health_status",
  },
  {
    id: "rel-2026-11-21-pharmacist-align",
    title: "Kerapian Tata Letak Konsultasi Apoteker",
    description:
      "Posisi teks NIP, STR, SIPA, Ruangan, Hari Praktek, dan tombol WhatsApp pada 11 kartu apoteker kini sejajar presisi dan tidak bergeser.",
    category: "tampilan",
    timestamp: "2026-11-21T04:45:00.000Z",
    targetTab: "pharmacist",
  },
  {
    id: "rel-2026-11-21-iv-clean",
    title: "Penyederhanaan Menu Kompatibilitas IV",
    description:
      "Tab Regimen Kemoterapi & Protokol Kanker telah dirapikan dari Kompatibilitas IV dan difokuskan pada menu Kalkulator Medis.",
    category: "fitur",
    timestamp: "2026-11-21T04:38:00.000Z",
    targetTab: "iv",
  },
  {
    id: "rel-2026-11-21-medcalc-6groups",
    title: "6 Kelompok Kalkulator Medis & 14 Kalkulator Baru",
    description:
      "Tersedia pengelompokan klinis lengkap beserta MAP, PREVENT/ASCVD, qSOFA/CURB-65, SpO₂/FiO₂, BMR/TDEE, HPL, Z-Score WHO, Infus IV, Racikan, Farmakokinetika, TPM, Syringe Pump, dan Cairan Elektrolit.",
    category: "fitur",
    timestamp: "2026-11-21T04:20:00.000Z",
    targetTab: "medcalc",
  },
  {
    id: "rel-2026-11-21-map-osm",
    title: "Peta Faskes Sumatera Selatan (OpenStreetMap)",
    description:
      "Peta interaktif 17 Kota & Kabupaten Sumatera Selatan dengan 208 fasilitas kesehatan, pilihan 3 layer peta, dan rute jalan gratis.",
    category: "fitur",
    timestamp: "2026-11-20T22:00:00.000Z",
    targetTab: "map",
  },
  {
    id: "rel-2026-11-20-device-anim",
    title: "Animasi Panduan Alat & Cara Pakai",
    description:
      "Panduan penggunaan alat obat khusus kini dilengkapi animasi langkah demi langkah, mode Putar Otomatis, dan timer instruksi.",
    category: "fitur",
    timestamp: "2026-11-20T18:30:00.000Z",
    targetTab: "video",
  },
];

export function loadSiteUpdates(): SiteUpdateItem[] {
  let storedLive: SiteUpdateItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_UPDATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        storedLive = parsed.filter(
          (item): item is SiteUpdateItem =>
            item && typeof item.id === "string" && typeof item.title === "string"
        );
      }
    }
  } catch {
    storedLive = [];
  }

  // Gabungkan update live tersimpan + daftar rilis terbaru (deduplikasi berdasarkan id)
  const map = new Map<string, SiteUpdateItem>();
  for (const item of storedLive) {
    map.set(item.id, item);
  }
  for (const rel of RELEASE_SITE_UPDATES) {
    if (!map.has(rel.id)) {
      map.set(rel.id, rel);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 40);
}

export function loadReadUpdateIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_READ_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

export function saveReadUpdateIds(ids: string[]): void {
  try {
    const unique = Array.from(new Set(ids)).slice(-100);
    localStorage.setItem(STORAGE_READ_IDS_KEY, JSON.stringify(unique));
  } catch {
    // ignore storage errors
  }
}

export function pushSiteUpdate(input: {
  title: string;
  description: string;
  category?: SiteUpdateCategory;
  targetTab?: string;
}): SiteUpdateItem {
  const item: SiteUpdateItem = {
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    description: input.description,
    category: input.category || "data",
    timestamp: new Date().toISOString(),
    targetTab: input.targetTab,
    isLive: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_UPDATES_KEY);
    const existing: SiteUpdateItem[] = raw ? JSON.parse(raw) : [];
    const next = [item, ...(Array.isArray(existing) ? existing : [])].slice(0, 30);
    localStorage.setItem(STORAGE_UPDATES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<SiteUpdateItem>(SITE_UPDATE_EVENT_NAME, { detail: item }));
  }

  return item;
}
