export type SumselRegionKind = "Kota" | "Kabupaten";

export interface SumselRegion {
  id: string;
  name: string;
  shortName: string;
  kind: SumselRegionKind;
  capital: string;
  center: { lat: number; lng: number };
  zoom: number;
  /** Radius in meters for Google Maps Places locationBias circle */
  biasRadiusMeters: number;
  /** Clean geographic search phrase used in Google Maps Places API (New) Text Search */
  searchLabel: string;
}

/**
 * 17 Wilayah Administratif Provinsi Sumatera Selatan
 * (4 Kota Otonom & 13 Kabupaten) — dipakai sebagai filter wilayah & bias koordinat
 * pencarian langsung ke basis data Google Maps Places API (New).
 */
export const SUMSEL_PROVINCE_CENTER = { lat: -3.3194, lng: 103.9144 };

export const SUMSEL_REGIONS: SumselRegion[] = [
  // === 4 KOTA ===
  {
    id: "kota-palembang",
    name: "Kota Palembang",
    shortName: "Palembang",
    kind: "Kota",
    capital: "Palembang",
    center: { lat: -2.9761, lng: 104.7754 },
    zoom: 12,
    biasRadiusMeters: 15000,
    searchLabel: "Kota Palembang, Sumatera Selatan",
  },
  {
    id: "kota-prabumulih",
    name: "Kota Prabumulih",
    shortName: "Prabumulih",
    kind: "Kota",
    capital: "Prabumulih",
    center: { lat: -3.4328, lng: 104.2356 },
    zoom: 12,
    biasRadiusMeters: 12000,
    searchLabel: "Kota Prabumulih, Sumatera Selatan",
  },
  {
    id: "kota-lubuklinggau",
    name: "Kota Lubuklinggau",
    shortName: "Lubuklinggau",
    kind: "Kota",
    capital: "Lubuklinggau",
    center: { lat: -3.2967, lng: 102.8617 },
    zoom: 12,
    biasRadiusMeters: 12000,
    searchLabel: "Kota Lubuklinggau, Sumatera Selatan",
  },
  {
    id: "kota-pagar-alam",
    name: "Kota Pagar Alam",
    shortName: "Pagar Alam",
    kind: "Kota",
    capital: "Pagar Alam",
    center: { lat: -4.0226, lng: 103.2528 },
    zoom: 12,
    biasRadiusMeters: 12000,
    searchLabel: "Kota Pagar Alam, Sumatera Selatan",
  },

  // === 13 KABUPATEN ===
  {
    id: "kab-banyuasin",
    name: "Kabupaten Banyuasin",
    shortName: "Banyuasin",
    kind: "Kabupaten",
    capital: "Pangkalan Balai",
    center: { lat: -2.8833, lng: 104.3833 },
    zoom: 11,
    biasRadiusMeters: 30000,
    searchLabel: "Kabupaten Banyuasin, Sumatera Selatan",
  },
  {
    id: "kab-ogan-ilir",
    name: "Kabupaten Ogan Ilir",
    shortName: "Ogan Ilir",
    kind: "Kabupaten",
    capital: "Indralaya",
    center: { lat: -3.2314, lng: 104.6589 },
    zoom: 11,
    biasRadiusMeters: 25000,
    searchLabel: "Kabupaten Ogan Ilir, Sumatera Selatan",
  },
  {
    id: "kab-oki",
    name: "Kabupaten Ogan Komering Ilir",
    shortName: "OKI (Kayu Agung)",
    kind: "Kabupaten",
    capital: "Kayu Agung",
    center: { lat: -3.3853, lng: 104.8322 },
    zoom: 11,
    biasRadiusMeters: 30000,
    searchLabel: "Kabupaten Ogan Komering Ilir, Sumatera Selatan",
  },
  {
    id: "kab-oku",
    name: "Kabupaten Ogan Komering Ulu",
    shortName: "OKU (Baturaja)",
    kind: "Kabupaten",
    capital: "Baturaja",
    center: { lat: -4.1333, lng: 104.1667 },
    zoom: 11,
    biasRadiusMeters: 25000,
    searchLabel: "Kabupaten Ogan Komering Ulu Baturaja, Sumatera Selatan",
  },
  {
    id: "kab-oku-timur",
    name: "Kabupaten OKU Timur",
    shortName: "OKU Timur",
    kind: "Kabupaten",
    capital: "Martapura",
    center: { lat: -4.3167, lng: 104.3500 },
    zoom: 11,
    biasRadiusMeters: 28000,
    searchLabel: "Kabupaten Ogan Komering Ulu Timur, Sumatera Selatan",
  },
  {
    id: "kab-oku-selatan",
    name: "Kabupaten OKU Selatan",
    shortName: "OKU Selatan",
    kind: "Kabupaten",
    capital: "Muaradua",
    center: { lat: -4.5444, lng: 104.0667 },
    zoom: 11,
    biasRadiusMeters: 28000,
    searchLabel: "Kabupaten Ogan Komering Ulu Selatan, Sumatera Selatan",
  },
  {
    id: "kab-muara-enim",
    name: "Kabupaten Muara Enim",
    shortName: "Muara Enim",
    kind: "Kabupaten",
    capital: "Muara Enim",
    center: { lat: -3.6556, lng: 103.7764 },
    zoom: 11,
    biasRadiusMeters: 30000,
    searchLabel: "Kabupaten Muara Enim, Sumatera Selatan",
  },
  {
    id: "kab-pali",
    name: "Kabupaten PALI",
    shortName: "PALI (Talang Ubi)",
    kind: "Kabupaten",
    capital: "Talang Ubi",
    center: { lat: -3.3067, lng: 103.8542 },
    zoom: 11,
    biasRadiusMeters: 22000,
    searchLabel: "Kabupaten Penukal Abab Lematang Ilir PALI, Sumatera Selatan",
  },
  {
    id: "kab-lahat",
    name: "Kabupaten Lahat",
    shortName: "Lahat",
    kind: "Kabupaten",
    capital: "Lahat",
    center: { lat: -3.7867, lng: 103.5425 },
    zoom: 11,
    biasRadiusMeters: 28000,
    searchLabel: "Kabupaten Lahat, Sumatera Selatan",
  },
  {
    id: "kab-empat-lawang",
    name: "Kabupaten Empat Lawang",
    shortName: "Empat Lawang",
    kind: "Kabupaten",
    capital: "Tebing Tinggi",
    center: { lat: -3.6000, lng: 103.0833 },
    zoom: 11,
    biasRadiusMeters: 25000,
    searchLabel: "Kabupaten Empat Lawang, Sumatera Selatan",
  },
  {
    id: "kab-musi-banyuasin",
    name: "Kabupaten Musi Banyuasin",
    shortName: "MUBA (Sekayu)",
    kind: "Kabupaten",
    capital: "Sekayu",
    center: { lat: -2.8850, lng: 103.8414 },
    zoom: 11,
    biasRadiusMeters: 32000,
    searchLabel: "Kabupaten Musi Banyuasin Sekayu, Sumatera Selatan",
  },
  {
    id: "kab-musi-rawas",
    name: "Kabupaten Musi Rawas",
    shortName: "Musi Rawas",
    kind: "Kabupaten",
    capital: "Muara Beliti",
    center: { lat: -3.2083, lng: 103.0500 },
    zoom: 11,
    biasRadiusMeters: 28000,
    searchLabel: "Kabupaten Musi Rawas, Sumatera Selatan",
  },
  {
    id: "kab-muratara",
    name: "Kabupaten Musi Rawas Utara",
    shortName: "Muratara (Rupit)",
    kind: "Kabupaten",
    capital: "Rupit",
    center: { lat: -2.7333, lng: 102.8667 },
    zoom: 11,
    biasRadiusMeters: 28000,
    searchLabel: "Kabupaten Musi Rawas Utara, Sumatera Selatan",
  },
];

export const SUMSEL_KOTA_REGIONS = SUMSEL_REGIONS.filter((r) => r.kind === "Kota");
export const SUMSEL_KABUPATEN_REGIONS = SUMSEL_REGIONS.filter((r) => r.kind === "Kabupaten");

export function getSumselRegionById(regionId: string): SumselRegion | undefined {
  return SUMSEL_REGIONS.find((r) => r.id === regionId);
}

/**
 * Generates a compact LatLngBoundsLiteral box around a region's center
 * for Google Maps Places API (New) locationBias.
 */
export function getRegionBoundsLiteral(region: SumselRegion): google.maps.LatLngBoundsLiteral {
  const latDelta = region.biasRadiusMeters / 111320;
  const lngDelta = region.biasRadiusMeters / (111320 * Math.cos((region.center.lat * Math.PI) / 180));
  return {
    north: region.center.lat + latDelta,
    south: region.center.lat - latDelta,
    east: region.center.lng + lngDelta,
    west: region.center.lng - lngDelta,
  };
}
