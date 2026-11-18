import React, { useEffect, useState, useMemo, useCallback, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Upload,
  Save,
  X,
  Download,
  ExternalLink,
  Crosshair,
  Compass,
  Building2,
  Check,
  Copy,
  Search,
  Navigation,
  MapPin,
  Loader2,
  Layers,
  BarChart3,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowUpDown,
  ListFilter,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getFacilitiesFromDb, saveFacilitiesToDb, deleteAllFacilities, Facility } from './services/facilitiesService';

// Haversine formula to compute real-world geodesic distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MAP_TILE_STYLES = {
  standard: {
    id: 'standard' as const,
    label: 'Standar',
    subtitle: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  light: {
    id: 'light' as const,
    label: 'Terang Modern',
    subtitle: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    id: 'satellite' as const,
    label: 'Satelit',
    subtitle: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
  }
};

// Fix for default Leaflet icon not showing in React correctly due to bundler
// We're using standard icons from leaflet CDN as a fallback, or base64 inline them.
// A simpler robust way is using direct URL to unpkg/cdnjs.
const customIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Ikon Khusus Host Hospital: RSUD Palembang BARI (Pusat Layanan PIOBARI) - Static high-contrast ring for 60fps panning
const iconRSUDBari = new L.DivIcon({
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
    <div style="position: absolute; width: 42px; height: 42px; background-color: rgba(225, 29, 72, 0.24); border: 2px solid rgba(225, 29, 72, 0.55); border-radius: 14px;"></div>
    <div style="background: linear-gradient(135deg, #e11d48, #be123c); width: 34px; height: 34px; border-radius: 11px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.45); z-index: 10;">
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="white">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
      </svg>
    </div>
  </div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

// Map Controller Component to smoothly flyTo target real coordinates
function MapController({ targetCoords, zoom }: { targetCoords: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom || 15, { animate: true, duration: 0.75 });
    }
  }, [targetCoords, zoom, map]);
  return null;
}

// Self-contained Map Coordinates HUD that updates only on moveend/zoomend without re-rendering parent MapFacilities
function MapCoordinatesHud({ tileLabel }: { tileLabel: string }) {
  const map = useMap();
  const [coords, setCoords] = useState<{ lat: number; lng: number; zoom: number }>(() => {
    const c = map.getCenter();
    return { lat: c.lat, lng: c.lng, zoom: map.getZoom() };
  });

  useEffect(() => {
    const handleMoveEnd = () => {
      const c = map.getCenter();
      setCoords({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
    };
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map]);

  return (
    <div className="hidden md:flex absolute bottom-3 right-3 z-[400] bg-slate-900/90 text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-md items-center gap-2.5 text-[11px] font-mono tabular-nums pointer-events-none">
      <span>Lat: {coords.lat.toFixed(5)}</span>
      <span className="text-slate-500">·</span>
      <span>Lng: {coords.lng.toFixed(5)}</span>
      <span className="text-slate-500">·</span>
      <span className="text-teal-300 font-sans font-semibold text-[10px]">
        {tileLabel} ({coords.zoom}x)
      </span>
    </div>
  );
}

const iconHospital = new L.DivIcon({
  html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});
const iconClinic = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});
const iconPharmacy = new L.DivIcon({
  html: `<div style="background-color: #22c55e; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});
const iconPuskesmas = new L.DivIcon({
  html: `<div style="background-color: #f97316; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v16"/><path d="M4 12h16"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});
const iconUser = customIcon('violet');



const mockFacilities: Facility[] = [
  {
    "id": 101,
    "name": "Charitas Hospital Kenten",
    "type": "Hospital",
    "address": "Jl. Betawi Raya No.1340, Lebong Gajah, Kec. Sematang Borang, Kota Palembang, Sumatera Selatan 30163",
    "lat": -2.937275,
    "lng": 104.794784,
    "contact": "0711-817196",
    "kelas": "D",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 102,
    "name": "Charitas Hospital Palembang",
    "type": "Hospital",
    "address": "Jl. Jend. Sudirman No.1054, Sungai Pangeran, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30114",
    "lat": -2.9750631,
    "lng": 104.7526774,
    "contact": "0711-353374",
    "kelas": "B",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 105,
    "name": "Rumah Sakit Islam Ar-Rasyid Palembang",
    "type": "Hospital",
    "address": "Jl. HM. Saleh No.2 KM.7, Sukarami, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9361687,
    "lng": 104.7115559,
    "contact": "07115610503",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 108,
    "name": "RS Bhayangkara M. Hasan Palembang",
    "type": "Hospital",
    "address": "Jl. Jend. Sudirman No.km 4, RW.5, Ario Kemuning, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30128",
    "lat": -2.959032,
    "lng": 104.7269447,
    "contact": "0711-414855",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 110,
    "name": "RS Umum Bunda Palembang",
    "type": "Hospital",
    "address": "Jl. Demang Lebar Daun No 70 Palembang",
    "lat": -2.9679297,
    "lng": 104.7318648,
    "contact": "0711-311866",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 111,
    "name": "RS Bunda Medika Jakabaring",
    "type": "Hospital",
    "address": "Jl. Gubernur H. A Bastari, Sungai Kedukan, Kec. Rambutan, Kab. Banyuasin, Sumatera Selatan 30967",
    "lat": -3.0498861,
    "lng": 104.793065,
    "contact": "0711-3037000",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 114,
    "name": "RS Umum Pusat Dr. Mohammad Hoesin Palembang",
    "type": "Hospital",
    "address": "Jalan Jendral Sudirman KM.3,5, Sekip Jaya, Kemuning, Sekip Jaya, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30114",
    "lat": -2.9672422,
    "lng": 104.7481157,
    "contact": "0711-354088",
    "kelas": "A",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 115,
    "name": "RS Jiwa Ernaldi Bahar Provinsi Sumatera Selatan",
    "type": "Hospital",
    "address": "Jalan Gubernur H. Muhammad Ali Amin, RT./RW/RW.20, 04, Alang Alang Lebar, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30154",
    "lat": -2.9233796,
    "lng": 104.6802979,
    "contact": "07115645126",
    "kelas": "A",
    "jenis": "RSK Jiwa",
    "city": "Kota Palembang"
  },
  {
    "id": 117,
    "name": "RS Umum Graha Mandiri",
    "type": "Hospital",
    "address": "Jl. Kapten A. Anwar Arsyad No.12, Siring Agung, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.968516,
    "lng": 104.7236938,
    "contact": "0711-412354",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 118,
    "name": "RS Hermina Palembang",
    "type": "Hospital",
    "address": "Jl. Jend. Basuki Rachmat No.897, Pahlawan, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30127",
    "lat": -2.9557995,
    "lng": 104.7457326,
    "contact": "0711352525",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 119,
    "name": "RS Hermina OPI Jakabaring",
    "type": "Hospital",
    "address": "Jl. Gubernur H. A Bastari, RT.010/RW.005, Kelurahan Jakabaring Selatan, Kec. Rambutan, Kab. Banyuasin, Sumatera Selatan 30257",
    "lat": -3.0338765,
    "lng": 104.788419,
    "contact": "0711 3031520",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kabupaten Banyuasin"
  },
  {
    "id": 120,
    "name": "RS Khusus Gigi dan Mulut Provinsi Sumatera Selatan",
    "type": "Hospital",
    "address": "Jl. Suka Jaya No.316, Suka Bangun, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.949328,
    "lng": 104.7320669,
    "contact": "0711-5610494",
    "kelas": "C",
    "jenis": "RSK GM",
    "city": "Kota Palembang"
  },
  {
    "id": 122,
    "name": "RS Musi Medika Cendikia",
    "type": "Hospital",
    "address": "Jl. Demang Lebar Daun, Demang Lebar Daun, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.9799252,
    "lng": 104.7214043,
    "contact": "0711 - 446272",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 124,
    "name": "RS Muhammadiyah Palembang",
    "type": "Hospital",
    "address": "Jl. Jenderal Ahmad Yani Jl. Silaberanti No.13, 13 Ulu, Kec. Seberang Ulu II, Kota Palembang, Sumatera Selatan 30263",
    "lat": -2.9963576,
    "lng": 104.7741142,
    "contact": "08117441446",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 125,
    "name": "RS Pelabuhan Palembang",
    "type": "Hospital",
    "address": "Jl. Mayor Memet Sastra Wirya No.1, Lawang Kidul, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30163",
    "lat": -2.9783177,
    "lng": 104.7714601,
    "contact": "(0711) 711843",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 126,
    "name": "RS Permata Palembang",
    "type": "Hospital",
    "address": "Jl. Soekarno Hatta, Bukit Baru, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30139",
    "lat": -2.9857883,
    "lng": 104.7160428,
    "contact": "0711-5260000",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 127,
    "name": "RS Umum Pertamina Palembang",
    "type": "Hospital",
    "address": "Komplek Pertamina UP III, Jl. Pengantingan No.1, Komperta, Kec. Plaju, Kota Palembang, Sumatera Selatan 30967",
    "lat": -2.9944983,
    "lng": 104.8221109,
    "contact": "081515150442",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 131,
    "name": "RS Umum Pusri Palembang",
    "type": "Hospital",
    "address": "Komp. PT PUSRI, Jl. May Zen, Sei Selayur, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30118",
    "lat": -2.9702722,
    "lng": 104.7987858,
    "contact": "0711-721313",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 132,
    "name": "RS Siloam Sriwijaya Palembang",
    "type": "Hospital",
    "address": "Jl. POM IX, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30137",
    "lat": -2.9777647,
    "lng": 104.7397584,
    "contact": "1500911",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 133,
    "name": "RS Umum Sriwijaya",
    "type": "Hospital",
    "address": "Jalan Jenderal Sudirman KM.4.5 No.502, 20 Ilir D. IV, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30138",
    "lat": -2.9596254,
    "lng": 104.7344336,
    "contact": "0711-419680",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 135,
    "name": "RS Umum dr. AK. Gani Kota Palembang",
    "type": "Hospital",
    "address": "Jl. Dr. Ak. Gani No.1, 16 Ilir, Kec. Bukit Kecil, Kota Palembang, Sumatera Selatan 30113",
    "lat": -2.9903228,
    "lng": 104.7575673,
    "contact": "0711-354691",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 136,
    "name": "RSU YK Madira",
    "type": "Hospital",
    "address": "Jl. Jend. Sudirman No.1051, 20 Ilir D. I, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30114",
    "lat": -2.9727942,
    "lng": 104.7497437,
    "contact": "(0711) 364954",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 139,
    "name": "RS Islam Siti Khadijah",
    "type": "Hospital",
    "address": "Jl. Demang Lebar Daun, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30137",
    "lat": -2.9716447,
    "lng": 104.7288348,
    "contact": "0711-356008",
    "kelas": "B",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 140,
    "name": "Rumah Sakit Ibu dan Anak Az-Zahra Palembang",
    "type": "Hospital",
    "address": "Jalan Brigadir jenderal Hasan Khasim Nomor 1-2 Kelurahan, Bukit Sangkal, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30114",
    "lat": -2.9422792,
    "lng": 104.7815347,
    "contact": "07113038799",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 141,
    "name": "RSIA Bunda Noni",
    "type": "Hospital",
    "address": "Jl. Srijaya Negara No.1, Bukit Lama, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30121",
    "lat": -2.992938,
    "lng": 104.7238865,
    "contact": "0711441952",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 143,
    "name": "RS Ibu dan Anak Mama",
    "type": "Hospital",
    "address": "Jl. Lembing Kampus No.15, Jl. Lembing Kampus No.15 Blok f, Lorok Pakjo, Ilir Barat I, Palembang City, South Sumatra 30121",
    "lat": -2.9754798,
    "lng": 104.7381606,
    "contact": "0711 357351",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 144,
    "name": "Rumah Sakit Ibu Dan Anak Marissa",
    "type": "Hospital",
    "address": "Jl. Kapten Abdullah No.1212, RT.18, Plaju Ilir, Kec. Plaju, Kota Palembang, Sumatera Selatan 30119",
    "lat": -3.0057439,
    "lng": 104.815503,
    "contact": "082280841273",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 153,
    "name": "RS Umum Daerah Gandus Palembang",
    "type": "Hospital",
    "address": "Gandus, Kec. Gandus, Kota Palembang, Sumatera Selatan 30149",
    "lat": -3.0148165,
    "lng": 104.68721,
    "contact": "081379179785",
    "kelas": "D",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 165,
    "name": "RSUD Palembang BARI",
    "type": "Hospital",
    "address": "Jl. Panca Usaha No.1, 5 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30254",
    "lat": -3.010222,
    "lng": 104.768972,
    "contact": "0711-519211",
    "kelas": "B",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 169,
    "name": "RSUD Siti Fatimah Provinsi Sumatera Selatan",
    "type": "Hospital",
    "address": "Jl. Kolonel H. Barlian, Suka Bangun, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.9482292,
    "lng": 104.7319755,
    "contact": "07115178883",
    "kelas": "A",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 175,
    "name": "RS Umum Pusat Dr. Rivai Abdullah",
    "type": "Hospital",
    "address": "RSUP Dr. Rivai Abdullah, Jl. Sungai Kundur No.Kelurahan, Mariana, Kec. Banyuasin I, Kab. Banyuasin, Sumatera Selatan 30963",
    "lat": -2.9800618,
    "lng": 104.8615871,
    "contact": "0711-7537201",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kabupaten Banyuasin"
  },
  {
    "id": 199,
    "name": "RSIA Trinanda",
    "type": "Hospital",
    "address": "Jl. R. E. Martadinata No.6A, Sei Buah, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30118",
    "lat": -2.970158,
    "lng": 104.782502,
    "contact": "0711716643",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 999,
    "name": "Charitas Hospital KM. 7",
    "type": "Hospital",
    "address": "Jl. Kolonel H. Barlian No.228, Sukarami, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.941132,
    "lng": 104.7235104,
    "contact": "0711-411610",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 1000,
    "name": "Rumah Sakit Namira Palembang",
    "type": "Hospital",
    "address": "Lorong Foker Jl. Letjen Harun Sohar, Kebun Bunga, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30152",
    "lat": -2.9108146,
    "lng": 104.7110562,
    "contact": "08136011994",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 2001,
    "name": "Puskesmas 1 Ulu",
    "type": "Puskesmas",
    "address": "Jl. H Faqih Usman No.2329, 1 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30256",
    "lat": -3.0114406,
    "lng": 104.7493961,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2002,
    "name": "Puskesmas 11 Ilir",
    "type": "Puskesmas",
    "address": "Jl. Slamet Riady No.455, 11 Ilir, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30112",
    "lat": -2.9812056,
    "lng": 104.7648357,
    "contact": "0711364125",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2003,
    "name": "Puskesmas 23 Ilir",
    "type": "Puskesmas",
    "address": "Jl. Datuk Moh. Akib No.100, 23 Ilir, Kec. Bukit Kecil, Kota Palembang, Sumatera Selatan 30113",
    "lat": -2.9878873,
    "lng": 104.7523147,
    "contact": "08117111926",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2004,
    "name": "Puskesmas 4 Ulu",
    "type": "Puskesmas",
    "address": "Jalan Kyai Haji Asyik No.1484, 3-4 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30122",
    "lat": -3.0069627,
    "lng": 104.7583844,
    "contact": "0711511373",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2005,
    "name": "Puskesmas 5 Ilir",
    "type": "Puskesmas",
    "address": "Jalan Jendral Jalan Bambang Utoyo No.1095, 5 Ilir, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30111",
    "lat": -2.9650764,
    "lng": 104.7701258,
    "contact": "07115625790",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2006,
    "name": "Puskesmas 7 Ulu",
    "type": "Puskesmas",
    "address": "Jl. KH. Azhari, 7 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30253",
    "lat": -2.9967198,
    "lng": 104.7613694,
    "contact": "08117846767",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2007,
    "name": "Puskesmas Alang Alang Lebar",
    "type": "Puskesmas",
    "address": "Jl. Bypass Alang-Alang Lebar, Talang Klp., Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9315366,
    "lng": 104.6881571,
    "contact": "08117111699",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2008,
    "name": "Puskesmas Ariodillah",
    "type": "Puskesmas",
    "address": "Jl. Ariodillah 1 No.2102, 20 Ilir D. III, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.964005,
    "lng": 104.7400458,
    "contact": "0711317308",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2009,
    "name": "Puskesmas Basuki Rahmat",
    "type": "Puskesmas",
    "address": "Jl. Sersan Sani No.1305, Talang Aman, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9481797,
    "lng": 104.7464607,
    "contact": "0711814470",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2010,
    "name": "Puskesmas Boom Baru",
    "type": "Puskesmas",
    "address": "Jl. Penyaringan No.8, 3 Ilir, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30111",
    "lat": -2.9752538,
    "lng": 104.7798426,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2011,
    "name": "Puskesmas Bukit Sangkal",
    "type": "Puskesmas",
    "address": "Jl. Tj. Sari II No.46, Bukit Sangkal, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9376557,
    "lng": 104.7779766,
    "contact": "085369555755",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2012,
    "name": "Puskesmas Dempo",
    "type": "Puskesmas",
    "address": "Jl. Kolonel Atmo No.861, 17 Ilir, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30125",
    "lat": -2.9818032,
    "lng": 104.7563211,
    "contact": "08117182222",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2013,
    "name": "Puskesmas Gandus",
    "type": "Puskesmas",
    "address": "Jl. Tp Husin Damar Jaya Sungai Tenang, RT.19/RW.02, Pulo Kerto, Kec. Gandus, Kota Palembang, Sumatera Selatan 30149",
    "lat": -3.018992,
    "lng": 104.6745262,
    "contact": "081288224040",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2014,
    "name": "Puskesmas Jakabaring",
    "type": "Puskesmas",
    "address": "Plaju Darat, Kec. Plaju, Kota Palembang, Sumatera Selatan 30967",
    "lat": -3.0317825,
    "lng": 104.7970437,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2015,
    "name": "Puskesmas Kalidoni",
    "type": "Puskesmas",
    "address": "Jl. Talang Gading No.RT 07, Kalidoni, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30163",
    "lat": -2.9606593,
    "lng": 104.7966831,
    "contact": "0711712938",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2016,
    "name": "Puskesmas Kampus",
    "type": "Puskesmas",
    "address": "Jl. Golf No.5 Blok G, Lorok Pakjo, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30126",
    "lat": -2.975502,
    "lng": 104.7357682,
    "contact": "082279529534",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2017,
    "name": "Puskesmas Karya Jaya",
    "type": "Puskesmas",
    "address": "Jl. Musi, Keramasan, Kec. Kertapati, Kota Palembang, Sumatera Selatan 30259",
    "lat": -3.0408233,
    "lng": 104.7235448,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2018,
    "name": "Puskesmas Kenten",
    "type": "Puskesmas",
    "address": "Jl. MP. Mangkunegara No.1, Bukit Sangkal, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9404871,
    "lng": 104.7648187,
    "contact": "081279878741",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2019,
    "name": "Puskesmas Keramasan",
    "type": "Puskesmas",
    "address": "Jl. Gotong Royong No.466, Kemang Agung, Kec. Kertapati, Kota Palembang, Sumatera Selatan 30145",
    "lat": -3.0277071,
    "lng": 104.7432487,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2020,
    "name": "Puskesmas Kertapati",
    "type": "Puskesmas",
    "address": "Jl. Abi Kusno Cokro Suyoso No.335, Kemang Agung, Kec. Kertapati, Kota Palembang, Sumatera Selatan 30145",
    "lat": -3.0256198,
    "lng": 104.7444493,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2021,
    "name": "Puskesmas Makrayu",
    "type": "Puskesmas",
    "address": "Jl. Makrayu No.960, 32 Ilir, Kec. Ilir Bar. II, Kota Palembang, Sumatera Selatan 30129",
    "lat": -3.0000265,
    "lng": 104.7417205,
    "contact": "0711318400",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2022,
    "name": "Puskesmas Merdeka",
    "type": "Puskesmas",
    "address": "Jl. Merdeka No.66, Talang Semut, Kec. Bukit Kecil, Kota Palembang, Sumatera Selatan 30136",
    "lat": -2.9905595,
    "lng": 104.7502104,
    "contact": "0711317303",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2023,
    "name": "Puskesmas Multiwahana",
    "type": "Puskesmas",
    "address": "Jl. Musi Raya Komplek Perkantoran No.1, Sako, Kec. Sako, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9286993,
    "lng": 104.7779542,
    "contact": "082175338955",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2024,
    "name": "Puskesmas Naga Swidak",
    "type": "Puskesmas",
    "address": "Gg. Bangdes, 14 Ulu, Kec. Seberang Ulu II, Kota Palembang, Sumatera Selatan 30111",
    "lat": -2.9915556,
    "lng": 104.7801198,
    "contact": "081977873700",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2025,
    "name": "Puskesmas Ogan Permata Indah",
    "type": "Puskesmas",
    "address": "Jl. Opi Raya, Sungai Kedukan, Kec. Rambutan, Kab. Banyuasin, Sumatera Selatan 30257",
    "lat": -3.0485046,
    "lng": 104.7822671,
    "contact": "08117877668",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2026,
    "name": "Puskesmas Padang Selasa",
    "type": "Puskesmas",
    "address": "Jl. Padang Selasa, Bukit Lama, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30139",
    "lat": -2.9901656,
    "lng": 104.731724,
    "contact": "082279529534",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2027,
    "name": "Puskesmas Pakjo",
    "type": "Puskesmas",
    "address": "Jl. Inspektur Marzuki Lorong Bambu Kuning No.2240, Demang Lebar Daun, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.9635757,
    "lng": 104.7318695,
    "contact": "07115613007",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2028,
    "name": "Puskesmas Pembina",
    "type": "Puskesmas",
    "address": "Jl. Jenderal Ahmad Yani No.62A, Silaberanti, Kecamatan Jakabaring, Kota Palembang, Sumatera Selatan 30252",
    "lat": -2.9968641,
    "lng": 104.7727409,
    "contact": "0711510203",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2029,
    "name": "Puskesmas Plaju",
    "type": "Puskesmas",
    "address": "Jl. D.I. Panjaitan No.40, Plaju Ulu, Kec. Plaju, Kota Palembang, Sumatera Selatan 30268",
    "lat": -2.9957247,
    "lng": 104.8111146,
    "contact": "0711541212",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2030,
    "name": "Puskesmas Punti Kayu",
    "type": "Puskesmas",
    "address": "Komplek Pemda, Jl. Srijaya No.5,5, Srijaya, Kec. Alang-Alang Lebar, Kota Palembang, Sumatera Selatan 30151",
    "lat": -2.9498248,
    "lng": 104.7238623,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2031,
    "name": "Puskesmas Sabokingking",
    "type": "Puskesmas",
    "address": "Sei Buah, Kec. Ilir Tim. II, Kota Palembang, Sumatera Selatan 30111",
    "lat": -2.9737327,
    "lng": 104.7889828,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2032,
    "name": "Puskesmas Sako",
    "type": "Puskesmas",
    "address": "Jl. Sematang Borang No.765, RT.14/RW.06, Sako Baru, Kec. Sako, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9211914,
    "lng": 104.7895145,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2033,
    "name": "Puskesmas Sei Baung",
    "type": "Puskesmas",
    "address": "Jl. Pertiwi No.RT.10, Demang Lebar Daun, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30121",
    "lat": -2.9732879,
    "lng": 104.7405414,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2034,
    "name": "Puskesmas Sei Selincah",
    "type": "Puskesmas",
    "address": "Jl. May Zen No.3, Sei Selincah, Kec. Kalidoni, Kota Palembang, Sumatera Selatan 30161",
    "lat": -2.9682963,
    "lng": 104.8191075,
    "contact": "0711718374",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2035,
    "name": "Puskesmas Sekip",
    "type": "Puskesmas",
    "address": "20 Ilir D II, Kec. Kemuning, Kota Palembang, Sumatera Selatan",
    "lat": -2.957851,
    "lng": 104.7511441,
    "contact": "08117105145",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2036,
    "name": "Puskesmas Sematang Borang",
    "type": "Puskesmas",
    "address": "Jl. Lematang Raya No.16, Sialang, Kec. Sako, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9340606,
    "lng": 104.7879162,
    "contact": "0711824770",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2037,
    "name": "Puskesmas Sosial",
    "type": "Puskesmas",
    "address": "Lorong Mekar I, RT.033/RW.005, Suka Bangun, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9463286,
    "lng": 104.7388928,
    "contact": "085268184440",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2038,
    "name": "Puskesmas Sukarami",
    "type": "Puskesmas",
    "address": "Jl. Kebun Bunga, RT.37/RW.05, Kebun Bunga, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.9204236,
    "lng": 104.7144485,
    "contact": "088286531911",
    "kelas": "Rawat Inap",
    "jenis": "Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2039,
    "name": "Puskesmas Talang Betutu",
    "type": "Puskesmas",
    "address": "Palembang, Sumatera, Jalan Selatan, Talang Putri, Kota Palembang, Sumatera, Selatan, Talang Betutu, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.8888877,
    "lng": 104.6843079,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2040,
    "name": "Puskesmas Talang Jambe",
    "type": "Puskesmas",
    "address": "Jl. AMD, Talang Jambe, Kec. Sukarami, Kota Palembang, Sumatera Selatan 30961",
    "lat": -2.8897467,
    "lng": 104.7155045,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2041,
    "name": "Puskesmas Talang Ratu",
    "type": "Puskesmas",
    "address": "Jl. Letnan Murod No.986, RT.13, 20 Ilir D. IV, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30128",
    "lat": -2.9540056,
    "lng": 104.7295172,
    "contact": "0711353259",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2042,
    "name": "Puskesmas Taman Bacaan",
    "type": "Puskesmas",
    "address": "Lorong Taman Bacaan, Tangga Takat, Kec. Seberang Ulu II, Kota Palembang, Sumatera Selatan 30164",
    "lat": -2.9864392,
    "lng": 104.7809528,
    "contact": "0711514482",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  },
  {
    "id": 2043,
    "name": "Puskesmas Tegal Binangun",
    "type": "Puskesmas",
    "address": "Lorong Jambu, Plaju Darat, Kec. Plaju, Kota Palembang, Sumatera Selatan 30267",
    "lat": -3.0139221,
    "lng": 104.8090331,
    "contact": "-",
    "kelas": "Non Rawat Inap",
    "jenis": "Non Rawat Inap",
    "city": "Palembang"
  }
];

interface MapFacilitiesProps {
  isAdmin?: boolean;
}

export const MapFacilities: React.FC<MapFacilitiesProps> = ({ isAdmin = false }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState("");

  // Koordinat Real RSUD Palembang BARI (Pusat Layanan PIOBARI) & Kota Palembang
  const RSUD_BARI_COORDS: [number, number] = [-3.010222, 104.768972];
  const PALEMBANG_CENTER: [number, number] = [-2.9900, 104.7600];

  const center: [number, number] = RSUD_BARI_COORDS;
  const [targetCoords, setTargetCoords] = useState<[number, number] | null>(RSUD_BARI_COORDS);
  const [targetZoom, setTargetZoom] = useState<number>(14);
  const [copiedCoordsId, setCopiedCoordsId] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    setIsMobileViewport(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [cityFilter, setCityFilter] = useState("Semua");
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const saved = localStorage.getItem("faskes_facilities_v5");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading facilities from localStorage:", e);
    }
    return mockFacilities.map(f => ({ ...f, locked: false }));
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Deteksi GPS otomatis pada saat awal membuka menu peta jika diizinkan browser
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setTargetCoords([lat, lng]);
          setTargetZoom(15);
        },
        () => {
          // Default tetap fokus pada RSUD Palembang BARI
          setTargetCoords(RSUD_BARI_COORDS);
          setTargetZoom(14);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await getFacilitiesFromDb();
        if (isMounted && data && data.length > 0) {
          const sorted = data.map(f => ({ ...f, locked: false })).sort((a, b) => a.id - b.id);
          setFacilities(sorted);
          try {
            localStorage.setItem("faskes_facilities_v5", JSON.stringify(sorted));
          } catch (e) {}
        } else if (isMounted) {
          try {
            const saved = localStorage.getItem("faskes_facilities_v5");
            if (!saved) {
              localStorage.setItem("faskes_facilities_v5", JSON.stringify(mockFacilities.map(f => ({ ...f, locked: false }))));
            }
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Failed to load from DB, using local data", e);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const saveToDb = async (data: Facility[]) => {
    try {
      await saveFacilitiesToDb(data);
    } catch (e) {
      console.error("Failed to save to DB", e);
      alert("Gagal menyimpan data ke database");
    }
  };

  const handleUpdateData = async () => {
    if (!csvFile) {
      setCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }
    const fileExt = csvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          validateAndSetData(results.data);
        },
        error: (error) => {
          setCsvError("Gagal membaca file CSV: " + error.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const data = await csvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetData(parsed);
      } catch (err: any) {
        setCsvError("Gagal membaca file Excel: " + err.message);
      }
    } else {
      setCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetData = async (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      const newData = parsed.map(item => ({...item, locked: false}));
      let combined: Facility[] = [];
      setFacilities(prev => {
        const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
        combined = [...prevFiltered, ...newData].sort((a, b) => a.id - b.id);
        return combined;
      });
      setIsUpdateModalOpen(false);
      setCsvError("");
      setCsvFile(null);
      await saveToDb(newData);
    } else {
      setCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat.");
    }
  };

  const handleDownloadTemplate = () => {
    const template = [{ id: 101, name: "Charitas Hospital Kenten", type: "Hospital", address: "Jalan Betawi Raya No 1340 RT 22 RW 06", lat: -2.937483, lng: 104.794836, contact: "0711-817196", kelas: "D", jenis: "RSU", city: "Palembang" }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Peta_Faskes");
    XLSX.writeFile(wb, "Template_Peta_Faskes.xlsx");
  };

  const cities = ["Semua", ...Array.from(new Set(facilities.map(f => f.city).filter(Boolean)))];
  
  // Routing States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState("");
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number, destinationName: string} | null>(null);

  const locateUser = () => {
    setIsLocating(true);
    setRoutingError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setTargetCoords([lat, lng]);
          setTargetZoom(16);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          setRoutingError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif pada peramban Anda.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setRoutingError("Geolokasi tidak didukung oleh perangkat ini.");
    }
  };

  const focusRSUDBari = () => {
    setTargetCoords(RSUD_BARI_COORDS);
    setTargetZoom(16);
  };

  const focusPalembang = () => {
    setTargetCoords(PALEMBANG_CENTER);
    setTargetZoom(12);
  };

  const handleCopyCoords = (lat: number, lng: number, id: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoordsId(id);
    setTimeout(() => setCopiedCoordsId(null), 2000);
  };

  const getRouteTo = async (destination: [number, number], facilityName: string) => {
    if (!userLocation) {
      setRoutingError("Silakan aktifkan 'Lokasi Saya' terlebih dahulu.");
      return;
    }
    
    setIsRouting(true);
    setRoutingError("");
    setRouteCoordinates([]);
    setRouteInfo(null);
    
    try {
      // OSRM API expects lon,lat
      const start = `${userLocation[1]},${userLocation[0]}`;
      const end = `${destination[1]},${destination[0]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        // GeoJSON uses [lon, lat], Leaflet Polyline expects [lat, lon]
        const latLngs = coordinates.map((c: [number, number]) => [c[1], c[0]]);
        setRouteCoordinates(latLngs);
        setRouteInfo({
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          destinationName: facilityName
        });
      } else {
        setRoutingError("Rute jalan tidak ditemukan oleh server navigasi.");
      }
    } catch (err) {
      setRoutingError("Gagal terhubung ke server navigasi OSRM.");
    } finally {
      setIsRouting(false);
    }
  };

  const [hoveredKelas, setHoveredKelas] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"Semua" | "Hospital" | "Puskesmas" | "Clinic" | "Pharmacy">("Semua");
  const [sortBy, setSortBy] = useState<"distance" | "name">("distance");
  const [mapStyle, setMapStyle] = useState<"standard" | "light" | "satellite">("standard");
  const [panelTab, setPanelTab] = useState<"list" | "stats">("list");
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState<boolean>(true);
  const [mobileDrawerState, setMobileDrawerState] = useState<"minimized" | "half" | "expanded">("half");
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(165);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState<boolean>(true);

  // Reference point for distance calculation: User GPS if available, otherwise RSUD Palembang BARI
  const referenceCoords: [number, number] = userLocation || RSUD_BARI_COORDS;

  // Base filtered by city and deferred search query (used for category pill counts without blocking typing)
  const searchAndCityFiltered = useMemo(() => {
    const q = (deferredSearchQuery || "").toLowerCase().trim();
    return facilities.filter(facility =>
      facility &&
      (cityFilter === "Semua" || facility.city === cityFilter || !facility.city) &&
      (!q ||
        (facility.name || "").toLowerCase().includes(q) ||
        (facility.address || "").toLowerCase().includes(q) ||
        (facility.jenis && facility.jenis.toLowerCase().includes(q)) ||
        (facility.kelas && `kelas ${facility.kelas.toLowerCase()}`.includes(q)))
    );
  }, [facilities, cityFilter, deferredSearchQuery]);

  // Filtered by category typeFilter as well
  const baseFilteredFacilities = useMemo(() => {
    return searchAndCityFiltered.filter(facility =>
      typeFilter === "Semua" ? true : facility.type === typeFilter
    );
  }, [searchAndCityFiltered, typeFilter]);

  // Enriched with real-time geodesic distance and sorted
  const filteredFacilities = useMemo(() => {
    const list = baseFilteredFacilities
      .filter(facility => {
        if (hoveredKelas === null) return true;
        if (hoveredKelas === "Lainnya") return facility.type === "Hospital" && !facility.kelas;
        return facility.kelas === hoveredKelas.replace("Kelas ", "");
      })
      .map(facility => {
        const distanceKm = calculateDistanceKm(
          referenceCoords[0],
          referenceCoords[1],
          facility.lat,
          facility.lng
        );
        return { ...facility, distanceKm };
      });

    return list.sort((a, b) => {
      if (sortBy === "distance") {
        return a.distanceKm - b.distanceKm;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [baseFilteredFacilities, hoveredKelas, referenceCoords, sortBy]);

  const categoryCounts = useMemo(() => ({
    Semua: searchAndCityFiltered.length,
    Hospital: searchAndCityFiltered.filter(f => f.type === "Hospital").length,
    Puskesmas: searchAndCityFiltered.filter(f => f.type === "Puskesmas").length,
    Clinic: searchAndCityFiltered.filter(f => f.type === "Clinic").length,
    Pharmacy: searchAndCityFiltered.filter(f => f.type === "Pharmacy").length,
  }), [searchAndCityFiltered]);

  const stats = {
    rsKelasA: baseFilteredFacilities.filter(f => f.kelas === "A").length,
    rsKelasB: baseFilteredFacilities.filter(f => f.kelas === "B").length,
    rsKelasC: baseFilteredFacilities.filter(f => f.kelas === "C").length,
    rsKelasD: baseFilteredFacilities.filter(f => f.kelas === "D").length,
    rsUnclassified: baseFilteredFacilities.filter(f => f.type === "Hospital" && !f.kelas).length,
    totalRs: baseFilteredFacilities.filter(f => f.type === "Hospital").length,
    totalApotek: baseFilteredFacilities.filter(f => f.type === "Pharmacy").length,
    totalKlinik: baseFilteredFacilities.filter(f => f.type === "Clinic").length,
    totalPuskesmas: baseFilteredFacilities.filter(f => f.type === "Puskesmas").length,
    puskesmasRawatInap: baseFilteredFacilities.filter(f => f.type === "Puskesmas" && f.kelas === "Rawat Inap").length,
    puskesmasNonRawatInap: baseFilteredFacilities.filter(f => f.type === "Puskesmas" && f.kelas === "Non Rawat Inap").length,
  };

  const pieDataPuskesmas = [
    { name: "Rawat Inap", value: stats.puskesmasRawatInap, color: "#f97316" },
    { name: "Non Rawat Inap", value: stats.puskesmasNonRawatInap, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const pieDataKelas = [
    { name: "Kelas A", value: stats.rsKelasA, color: "#ef4444" },
    { name: "Kelas B", value: stats.rsKelasB, color: "#f97316" },
    { name: "Kelas C", value: stats.rsKelasC, color: "#10b981" },
    { name: "Kelas D", value: stats.rsKelasD, color: "#3b82f6" },
  ].filter(d => d.value > 0);
  if (stats.rsUnclassified > 0) {
    pieDataKelas.push({ name: "Lainnya", value: stats.rsUnclassified, color: "#94a3b8" });
  }

  const hospitalJenisCounts = baseFilteredFacilities
    .filter(f => f.type === "Hospital")
    .reduce((acc, f) => {
      const jenis = f.jenis || "Lainnya";
      acc[jenis] = (acc[jenis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const barDataJenis = Object.entries(hospitalJenisCounts)
    .map(([name, value]) => ({ name, value, color: "#0d9488" }))
    .sort((a, b) => b.value - a.value);

  // Selected facility object enriched with geodesic distance from referenceCoords
  const selectedFacility = useMemo(() => {
    if (selectedFacilityId === null) return null;
    const found = facilities.find(f => f && f.id === selectedFacilityId);
    if (!found) return null;
    const distanceKm = calculateDistanceKm(
      referenceCoords[0],
      referenceCoords[1],
      found.lat,
      found.lng
    );
    return { ...found, distanceKm };
  }, [facilities, selectedFacilityId, referenceCoords]);

  const getFacilityOperationalMeta = (facility: Facility) => {
    const isRSUDBari = facility.id === 165 || (facility.name || "").toUpperCase().includes("BARI");
    if (facility.type === "Hospital") {
      return {
        operatingHours: "IGD & Rawat Inap 24 Jam • Poliklinik 07.30 – 14.00 WIB",
        emergencyBadge: "IGD & Farmasi 24 Jam",
        bpjsStatus: "Melayani Pasien Umum & JKN-BPJS Kesehatan",
        services: isRSUDBari
          ? ["IGD Terpadu 24 Jam", "Pusat Informasi Obat (PIOBARI)", "Instalasi Farmasi 24 Jam", "Rawat Inap & ICU", "Poliklinik Spesialis"]
          : ["IGD 24 Jam", "Instalasi Farmasi RS", "Rawat Inap", "Poliklinik Spesialis", "Laboratorium & Penunjang"],
        contactPhone: facility.contact || "(0711) 350068 / 119",
        contactNote: facility.contact ? "Nomor Telepon Resmi Faskes" : "PSC 119 / Layanan Darurat Kesehatan Palembang",
      };
    }
    if (facility.type === "Puskesmas") {
      const isRawatInap = facility.kelas === "Rawat Inap";
      return {
        operatingHours: isRawatInap
          ? "UGD & Rawat Inap 24 Jam • Poli Rawat Jalan 07.30 – 14.30 WIB"
          : "Senin–Kamis 07.30–14.00 • Jumat 07.30–11.30 • Sabtu 07.30–13.00 WIB",
        emergencyBadge: isRawatInap ? "UGD & Persalinan 24 Jam" : "FKTP Layanan Primer",
        bpjsStatus: "FKTP Resmi JKN-BPJS Kesehatan & Pasien Umum",
        services: isRawatInap
          ? ["UGD 24 Jam", "Rawat Inap & Persalinan", "Poli Umum & Lansia", "KIA / Imunisasi", "Ruang Farmasi Puskesmas"]
          : ["Poli Umum", "Poli Gigi", "KIA / KB & Imunisasi", "Laboratorium Dasar", "Ruang Farmasi Puskesmas"],
        contactPhone: facility.contact || "(0711) 350068",
        contactNote: facility.contact ? "Kontak Layanan Puskesmas" : "Pusat Informasi Dinkes Kota Palembang",
      };
    }
    if (facility.type === "Clinic") {
      return {
        operatingHours: "Senin – Sabtu 08.00 – 21.00 WIB",
        emergencyBadge: "Klinik Pratama / Utama",
        bpjsStatus: "Melayani Pasien Umum & Mitra Asuransi",
        services: ["Praktek Dokter", "Tindakan Medis Dasar", "Pemeriksaan Kesehatan", "Instalasi Farmasi Klinik"],
        contactPhone: facility.contact || "(0711) 350068",
        contactNote: facility.contact ? "Nomor Kontak Klinik" : "Informasi Faskes Kota Palembang",
      };
    }
    return {
      operatingHours: "Setiap Hari 08.00 – 22.00 WIB",
      emergencyBadge: "Pelayanan Kefarmasian",
      bpjsStatus: "Pelayanan Resep Dokter, OTC & Alat Kesehatan",
      services: ["Teus Resep Dokter", "Obat Bebas & Alkes", "Konseling Apoteker", "Informasi Dosis & Cara Pakai"],
      contactPhone: facility.contact || "(0711) 511650",
      contactNote: facility.contact ? "Kontak Apotek" : "Referensi Pusat Informasi Obat (PIOBARI)",
    };
  };

  const handleSelectFacilityFromList = useCallback((facility: Facility & { distanceKm?: number }) => {
    setSelectedFacilityId(facility.id);
    setIsDetailCardOpen(true);
    setPanelTab("list");
    setIsDesktopPanelOpen(true);
    setTargetCoords([facility.lat, facility.lng]);
    setTargetZoom(16);
    setMobileDrawerState(prev => (prev === "minimized" ? "half" : prev));
  }, []);

  const handleMarkerPinClick = useCallback((facility: Facility & { distanceKm?: number }) => {
    setSelectedFacilityId(facility.id);
    setIsDetailCardOpen(true);
    setPanelTab("list");
    setIsDesktopPanelOpen(true);
    setMobileDrawerState(prev => (prev === "minimized" ? "half" : prev));
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "Hospital": return { label: "Rumah Sakit", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
      case "Puskesmas": return { label: "Puskesmas", dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" };
      case "Clinic": return { label: "Klinik", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" };
      case "Pharmacy": return { label: "Apotek", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
      default: return { label: type, dot: "bg-slate-500", text: "text-slate-700", bg: "bg-slate-50" };
    }
  };

  const QUICK_CATEGORY_CHIPS = [
    {
      id: "Semua",
      shortLabel: "Semua",
      fullLabel: "Semua Faskes",
      dot: "bg-teal-500",
      activeClass: "bg-slate-900 text-white border-slate-900 shadow-xs",
      inactiveClass: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-slate-100 text-slate-600",
    },
    {
      id: "Hospital",
      shortLabel: "RS",
      fullLabel: "Rumah Sakit (RS)",
      dot: "bg-red-500",
      activeClass: "bg-red-600 text-white border-red-600 shadow-xs",
      inactiveClass: "bg-red-50/60 hover:bg-red-50 text-red-800 border-red-200/80",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-red-100/80 text-red-700",
    },
    {
      id: "Puskesmas",
      shortLabel: "Puskesmas",
      fullLabel: "Puskesmas",
      dot: "bg-orange-500",
      activeClass: "bg-orange-500 text-white border-orange-500 shadow-xs",
      inactiveClass: "bg-orange-50/60 hover:bg-orange-50 text-orange-800 border-orange-200/80",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-orange-100/80 text-orange-700",
    },
    {
      id: "Clinic",
      shortLabel: "Klinik",
      fullLabel: "Klinik",
      dot: "bg-blue-500",
      activeClass: "bg-blue-600 text-white border-blue-600 shadow-xs",
      inactiveClass: "bg-blue-50/60 hover:bg-blue-50 text-blue-800 border-blue-200/80",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-blue-100/80 text-blue-700",
    },
    {
      id: "Pharmacy",
      shortLabel: "Apotek",
      fullLabel: "Apotek",
      dot: "bg-emerald-500",
      activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
      inactiveClass: "bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80",
      badgeActive: "bg-white/20 text-white",
      badgeInactive: "bg-emerald-100/80 text-emerald-700",
    },
  ] as const;

  const handleToggleCategoryChip = (categoryId: "Semua" | "Hospital" | "Puskesmas" | "Clinic" | "Pharmacy") => {
    setTypeFilter((prev) => (prev === categoryId && categoryId !== "Semua" ? "Semua" : categoryId));
  };

  // Shared inner content for both Desktop Floating Panel and Mobile Drawer
  const renderPanelContent = () => (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Sub-navigation Tabs: Daftar Terdekat vs Statistik */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-200/80 bg-white/80 shrink-0 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl w-full">
          <button
            type="button"
            onClick={() => setPanelTab("list")}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              panelTab === "list"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-teal-600" />
            <span>Daftar Faskes ({filteredFacilities.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("stats")}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              panelTab === "stats"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Statistik Sebaran</span>
          </button>
        </div>

        {/* Quick Filter Chips inside Map Panel: Semua, RS, Puskesmas, Klinik, Apotek */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            <span>Filter Cepat Kategori</span>
            {typeFilter !== "Semua" && (
              <button
                type="button"
                onClick={() => setTypeFilter("Semua")}
                className="text-teal-600 hover:text-teal-700 font-bold normal-case tracking-normal cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {QUICK_CATEGORY_CHIPS.map((chip) => {
              const isActive = typeFilter === chip.id;
              const count = categoryCounts[chip.id];
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleToggleCategoryChip(chip.id)}
                  title={`Saring kategori: ${chip.fullLabel}`}
                  className={`min-h-[32px] px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    isActive ? chip.activeClass : chip.inactiveClass
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : chip.dot}`} />
                  <span>{chip.shortLabel}</span>
                  <span
                    className={`font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      isActive ? chip.badgeActive : chip.badgeInactive
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
      {panelTab === "list" ? (
        <motion.div
          key="panel-list"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Distance Sort Bar */}
          <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="truncate">
              Acuan Jarak: <strong className="text-slate-700">{userLocation ? "GPS Anda" : "RSUD BARI"}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSortBy(prev => prev === "distance" ? "name" : "distance")}
              className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 bg-teal-50/80 hover:bg-teal-100/80 px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Ubah urutan daftar faskes"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortBy === "distance" ? "Terdekat" : "Abjad A-Z"}</span>
            </button>
          </div>

          {/* Scrollable Facility List (with Selected Facility Operational & Contact Detail Card at Top) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {selectedFacility && isDetailCardOpen && (() => {
                const opMeta = getFacilityOperationalMeta(selectedFacility);
                const typeMeta = getTypeLabel(selectedFacility.type);
                const isRSUDBari = selectedFacility.id === 165 || (selectedFacility.name || "").toUpperCase().includes("BARI");
                const cleanTel = opMeta.contactPhone.replace(/[^0-9+]/g, "");

                return (
                  <motion.div
                    key={`detail-card-${selectedFacility.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    className="overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white border-b-2 border-teal-500/30"
                  >
                    <div className="p-3.5 space-y-3">
                      {/* Header Badge & Close Detail */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              isRSUDBari
                                ? "bg-rose-600 text-white"
                                : `${typeMeta.bg} ${typeMeta.text}`
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isRSUDBari ? "bg-white" : typeMeta.dot}`} />
                              {isRSUDBari ? "RS Utama • Host PIOBARI" : typeMeta.label}
                            </span>
                            {selectedFacility.jenis && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {selectedFacility.jenis}
                              </span>
                            )}
                            {selectedFacility.kelas && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-bold">
                                {selectedFacility.type === "Hospital" ? `Kelas ${selectedFacility.kelas}` : selectedFacility.kelas}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {selectedFacility.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono tabular-nums text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-lg border border-teal-200">
                            {selectedFacility.distanceKm < 1
                              ? `${Math.round(selectedFacility.distanceKm * 1000)} m`
                              : `${selectedFacility.distanceKm.toFixed(1)} km`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsDetailCardOpen(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Tutup kartu detail"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Operational Details Box */}
                      <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <span className="font-bold text-slate-800 block">Jam & Status Operasional</span>
                            <span className="text-slate-600 font-medium">{opMeta.operatingHours}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <span className="font-bold text-slate-800 block">{opMeta.emergencyBadge}</span>
                            <span className="text-slate-600 font-medium">{opMeta.bpjsStatus}</span>
                          </div>
                        </div>

                        {/* Available Clinical/Pharmacy Services */}
                        <div className="pt-1.5 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Cakupan Layanan Utama
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {opMeta.services.map((srv) => (
                              <span
                                key={srv}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-[10px] font-semibold text-slate-700"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Contact & Location Info Box */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="text-[11px] text-slate-700 leading-relaxed">
                            <span className="font-bold text-slate-800 block">Alamat Lengkap</span>
                            {selectedFacility.address}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                                {opMeta.contactNote}
                              </span>
                              <span className="text-xs font-mono tabular-nums font-bold text-slate-900">
                                {opMeta.contactPhone}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`tel:${cleanTel}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
                            title="Hubungi nomor telepon faskes"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Hubungi</span>
                          </a>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
                          <div className="font-mono tabular-nums text-slate-600 truncate">
                            <span className="text-[10px] font-sans font-semibold text-slate-400 mr-1.5">WGS84:</span>
                            {selectedFacility.lat.toFixed(6)}, {selectedFacility.lng.toFixed(6)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCoords(selectedFacility.lat, selectedFacility.lng, selectedFacility.id)}
                            className="text-teal-600 hover:text-teal-700 font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedCoordsId === selectedFacility.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCoordsId === selectedFacility.id ? "Tersalin" : "Salin"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Primary Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => getRouteTo([selectedFacility.lat, selectedFacility.lng], selectedFacility.name)}
                          disabled={isRouting}
                          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                        >
                          {isRouting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                          <span>Rute Navigasi</span>
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedFacility.lat},${selectedFacility.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
            {filteredFacilities.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Tidak Ada Faskes Ditemukan</p>
                  <p className="text-[11px] text-slate-500">Coba ubah kata kunci pencarian atau pilih kategori Semua.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("Semua");
                    setCityFilter("Semua");
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredFacilities.map((facility) => {
                const isRSUDBari = facility.id === 165 || (facility.name || "").toUpperCase().includes("BARI");
                const isSelected = selectedFacilityId === facility.id;
                const typeMeta = getTypeLabel(facility.type);

                return (
                  <div
                    key={facility.id}
                    onClick={() => handleSelectFacilityFromList(facility)}
                    className={`p-3.5 transition-all cursor-pointer hover:bg-slate-50/90 ${
                      isSelected
                        ? "bg-teal-50/60 ring-1 ring-inset ring-teal-500/30"
                        : isRSUDBari
                        ? "bg-rose-50/30"
                        : "bg-white/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-0.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isRSUDBari ? "bg-rose-600" : typeMeta.dot}`} />
                          <span className={isRSUDBari ? "font-bold text-rose-700" : "font-semibold text-slate-600"}>
                            {isRSUDBari ? "RS Utama (Host PIOBARI)" : typeMeta.label}
                          </span>
                          {facility.jenis && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-600 font-semibold">{facility.jenis}</span>
                            </>
                          )}
                          {facility.kelas && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-600 font-semibold">
                                {facility.type === "Hospital" ? `Kelas ${facility.kelas}` : facility.kelas}
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className={`text-xs sm:text-sm font-bold leading-snug truncate ${isRSUDBari ? "text-rose-950" : "text-slate-900"}`}>
                          {facility.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block font-mono tabular-nums text-xs font-bold text-teal-700 bg-teal-50/90 px-2 py-0.5 rounded-md border border-teal-200/60">
                          {facility.distanceKm < 1
                            ? `${Math.round(facility.distanceKm * 1000)} m`
                            : `${facility.distanceKm.toFixed(1)} km`}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {facility.address}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                      <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums text-slate-400 truncate">
                        <span>{facility.lat.toFixed(5)}, {facility.lng.toFixed(5)}</span>
                        {facility.contact && (
                          <>
                            <span>·</span>
                            <span className="font-sans text-slate-600 font-medium inline-flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5 text-teal-600" />
                              {facility.contact}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectFacilityFromList(facility);
                            getRouteTo([facility.lat, facility.lng], facility.name);
                          }}
                          disabled={isRouting}
                          className="min-h-[32px] px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                          title="Tampilkan rute jalan ke faskes ini"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Rute</span>
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[32px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Buka di Google Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      ) : (
        /* Statistics & Charts Tab */
        <motion.div
          key="panel-stats"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5"
        >
          {/* Summary Metric Grid (4 Categories) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleToggleCategoryChip("Hospital");
                setPanelTab("list");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                typeFilter === "Hospital"
                  ? "bg-red-50 border-red-300 ring-1 ring-red-400"
                  : "bg-slate-50 hover:bg-red-50/40 border-slate-200/80"
              }`}
            >
              <span className="text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Rumah Sakit (RS)
              </span>
              <span className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
                {categoryCounts.Hospital}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleToggleCategoryChip("Puskesmas");
                setPanelTab("list");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                typeFilter === "Puskesmas"
                  ? "bg-orange-50 border-orange-300 ring-1 ring-orange-400"
                  : "bg-slate-50 hover:bg-orange-50/40 border-slate-200/80"
              }`}
            >
              <span className="text-[11px] font-bold text-orange-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Puskesmas
              </span>
              <span className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
                {categoryCounts.Puskesmas}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleToggleCategoryChip("Clinic");
                setPanelTab("list");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                typeFilter === "Clinic"
                  ? "bg-blue-50 border-blue-300 ring-1 ring-blue-400"
                  : "bg-slate-50 hover:bg-blue-50/40 border-slate-200/80"
              }`}
            >
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Klinik
              </span>
              <span className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
                {categoryCounts.Clinic}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleToggleCategoryChip("Pharmacy");
                setPanelTab("list");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                typeFilter === "Pharmacy"
                  ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                  : "bg-slate-50 hover:bg-emerald-50/40 border-slate-200/80"
              }`}
            >
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Apotek
              </span>
              <span className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
                {categoryCounts.Pharmacy}
              </span>
            </button>
          </div>

          {/* Rumah Sakit Charts */}
          {pieDataKelas.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Sebaran RS Berdasarkan Kelas</h4>
                {hoveredKelas && (
                  <button
                    type="button"
                    onClick={() => setHoveredKelas(null)}
                    className="text-[10px] text-teal-600 font-bold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataKelas}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      onMouseEnter={(_, index) => setHoveredKelas(pieDataKelas[index].name)}
                      onMouseLeave={() => setHoveredKelas(null)}
                    >
                      {pieDataKelas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {barDataJenis.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Sebaran RS Berdasarkan Jenis</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barDataJenis}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#475569' }}
                      width={52}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#0d9488" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {pieDataPuskesmas.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Puskesmas Berdasarkan Layanan</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataPuskesmas}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieDataPuskesmas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );

  const currentTile = MAP_TILE_STYLES[mapStyle];

  // Memoize Leaflet markers so typing or interacting with UI controls never re-mounts map pins
  const renderedMarkers = useMemo(() => {
    return filteredFacilities
      .filter(f => f && f.lat !== undefined && f.lng !== undefined && f.id !== undefined)
      .map(facility => {
        const isRSUDBari = facility.id === 165 || (facility.name || "").toUpperCase().includes("BARI");
        const markerIcon = isRSUDBari
          ? iconRSUDBari
          : facility.type === "Hospital"
          ? iconHospital
          : facility.type === "Clinic"
          ? iconClinic
          : facility.type === "Pharmacy"
          ? iconPharmacy
          : iconPuskesmas;

        return (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            draggable={false}
            icon={markerIcon}
            zIndexOffset={isRSUDBari ? 1000 : selectedFacilityId === facility.id ? 600 : 0}
            eventHandlers={{
              click: () => handleMarkerPinClick(facility)
            }}
          >
            <Popup>
              <div className="font-sans min-w-[235px] max-w-[285px]">
                {isRSUDBari && (
                  <div className="mb-2 px-2.5 py-1 bg-rose-600 text-white rounded-md text-[10px] font-extrabold uppercase tracking-wide flex items-center justify-between">
                    <span>Rumah Sakit Utama (Pusat PIOBARI)</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-bold text-sm m-0 ${isRSUDBari ? "text-rose-950 font-black text-base" : "text-slate-900"}`}>
                    {facility.name}
                  </h3>
                  {facility.distanceKm !== undefined && (
                    <span className="font-mono tabular-nums text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 shrink-0">
                      {facility.distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-1 mb-0 flex flex-wrap gap-1.5 items-center">
                  <span className="font-semibold text-slate-600">{facility.type}</span>
                  {facility.jenis && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-teal-700">{facility.jenis}</span>
                    </>
                  )}
                  {facility.kelas && (
                    <>
                      <span>·</span>
                      <span className="font-bold text-amber-700">Kelas {facility.kelas}</span>
                    </>
                  )}
                </div>

                <hr className="my-2 border-slate-200" />
                <p className="text-xs text-slate-700 m-0 leading-relaxed">{facility.address}</p>
                {facility.contact && (
                  <p className="text-xs text-teal-700 font-semibold mt-1 mb-0 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {facility.contact}
                  </p>
                )}

                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/90 rounded-lg">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                    <span className="uppercase tracking-wider">Koordinat Nyata (WGS84)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCoords(facility.lat, facility.lng, facility.id);
                      }}
                      className="text-teal-600 hover:text-teal-700 flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                      title="Salin Koordinat"
                    >
                      {copiedCoordsId === facility.id ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                      {copiedCoordsId === facility.id ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                  <div className="font-mono tabular-nums text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{facility.lat.toFixed(6)}, {facility.lng.toFixed(6)}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200 transition-colors ml-2"
                      title="Buka titik koordinat ini di Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Maps</span>
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => getRouteTo([facility.lat, facility.lng], facility.name)}
                  disabled={isRouting}
                  className="mt-2.5 w-full min-h-[38px] bg-teal-600 hover:bg-teal-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer"
                >
                  {isRouting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  {isRouting ? "Mencari Rute..." : "Arahkan Navigasi ke Sini"}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      });
  }, [filteredFacilities, selectedFacilityId, copiedCoordsId, isRouting, handleMarkerPinClick]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-148px)] lg:h-[calc(100vh-116px)] min-h-[620px] w-full bg-slate-900 rounded-3xl shadow-md border border-slate-200/90 overflow-hidden select-none">
      {/* FULL-SCREEN INTERACTIVE LEAFLET MAP CANVAS */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={center}
          zoom={14}
          preferCanvas={true}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={currentTile.id}
            attribution={currentTile.attribution}
            url={currentTile.url}
          />

          <MapController targetCoords={targetCoords} zoom={targetZoom} />
          <MapCoordinatesHud tileLabel={currentTile.label} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={iconUser}>
              <Popup>
                <div className="font-sans min-w-[210px]">
                  <div className="font-bold text-sm text-violet-800 flex items-center gap-1.5">
                    <span>📍 Lokasi GPS Anda Saat Ini</span>
                  </div>
                  <div className="mt-2 p-2 bg-violet-50 rounded-lg border border-violet-100 text-[11px] font-mono tabular-nums text-violet-900">
                    <span className="text-[9px] uppercase font-bold text-violet-500 font-sans block">Koordinat GPS Browser:</span>
                    <span className="font-bold text-xs">{userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 mb-0">Posisi real-time diverifikasi dari perangkat Anda.</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#0d9488"
              weight={5}
              opacity={0.9}
              lineCap="round"
              lineJoin="round"
              dashArray="10, 8"
            />
          )}

          {renderedMarkers}
        </MapContainer>
      </div>

      {/* FLOATING TOP BAR OVERLAY (Search, Category Filters, Quick Focus & Map Layer Switcher) */}
      <div className="relative z-20 p-3 sm:p-4 pointer-events-none flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Search & City Filter */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/90 w-full lg:w-auto lg:min-w-[430px] flex-1 max-w-2xl">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari RS, Puskesmas, alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="py-2 pl-2.5 pr-7 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-teal-500 transition-all cursor-pointer truncate max-w-[130px] sm:max-w-[150px]"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city === "Semua" ? "Semua Kota" : city}</option>
              ))}
            </select>
          </div>

          {/* Right: Quick Focus Controls + Map Style Switcher + Admin */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={focusRSUDBari}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border bg-rose-600 text-white border-rose-700 hover:bg-rose-700 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Pusatkan peta ke RSUD Palembang BARI (Lat -3.010222, Lng 104.768972)"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>RSUD BARI</span>
            </button>

            <button
              type="button"
              onClick={focusPalembang}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white active:scale-95 cursor-pointer whitespace-nowrap"
              title="Lihat seluruh sebaran faskes Kota Palembang"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Seluruh Kota</span>
            </button>

            {userLocation ? (
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/90">
                <button
                  type="button"
                  onClick={locateUser}
                  disabled={isLocating}
                  className="min-h-[30px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap"
                  title="Perbarui koordinat posisi GPS nyata Anda"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>GPS Aktif</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation(null);
                    setRouteCoordinates([]);
                    setRouteInfo(null);
                    setRoutingError("");
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Matikan penanda GPS"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={locateUser}
                disabled={isLocating}
                className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border bg-teal-600 text-white border-teal-700 hover:bg-teal-700 disabled:opacity-70 active:scale-95 cursor-pointer whitespace-nowrap"
                title="Deteksi koordinat GPS nyata posisi Anda sekarang"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                <span>GPS Saya</span>
              </button>
            )}

            {/* Map Style Switcher Segmented Control */}
            <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/90">
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:block shrink-0" />
              {(["standard", "light", "satellite"] as const).map((styleKey) => (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => setMapStyle(styleKey)}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mapStyle === styleKey
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {MAP_TILE_STYLES[styleKey].label}
                </button>
              ))}
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Update Data</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Apakah Anda yakin ingin menghapus semua data fasilitas kesehatan?")) {
                      try {
                        await deleteAllFacilities();
                        setFacilities([]);
                        localStorage.removeItem("faskes_facilities_v5");
                      } catch (e) {}
                    }
                  }}
                  className="min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  title="Hapus Semua Data"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Quick Category Filter Chips (Semua, RS, Puskesmas, Klinik, Apotek) */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {QUICK_CATEGORY_CHIPS.map((chip) => {
            const count = categoryCounts[chip.id];
            const active = typeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleToggleCategoryChip(chip.id)}
                title={`Filter kategori: ${chip.fullLabel}`}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm border whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                  active
                    ? chip.activeClass
                    : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : chip.dot}`} />
                <span>{chip.shortLabel}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    active ? chip.badgeActive : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Routing Status / Error Banner */}
        <AnimatePresence>
          {routingError && (
            <motion.div
              key="routing-error"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto self-start bg-rose-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2"
            >
              <span>{routingError}</span>
              <button type="button" onClick={() => setRoutingError("")} className="p-0.5 hover:bg-white/20 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {routeInfo && (
            <motion.div
              key="route-info"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto self-start bg-teal-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-lg border border-teal-700/60 flex flex-wrap items-center gap-3"
            >
              <div className="text-xs">
                Rute aktif menuju <strong className="font-bold text-teal-200">{routeInfo.destinationName}</strong>
              </div>
              <div className="flex items-center gap-3 font-mono tabular-nums text-xs font-bold bg-white/10 px-3 py-1 rounded-xl">
                <span>{(routeInfo.distance / 1000).toFixed(1)} km</span>
                <span className="text-teal-400">·</span>
                <span>{Math.ceil(routeInfo.duration / 60)} menit berkendara</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRouteCoordinates([]);
                  setRouteInfo(null);
                }}
                className="text-[11px] font-bold text-teal-200 hover:text-white underline cursor-pointer"
              >
                Tutup Rute
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP FLOATING GLASS PANEL (Left Side with Fast Framer Motion Transitions) */}
      <div className="hidden md:flex absolute top-28 bottom-12 left-4 z-20 pointer-events-none items-start">
        <AnimatePresence initial={false} mode="popLayout">
          {isDesktopPanelOpen && !isMobileViewport && (
            <motion.aside
              key="desktop-floating-panel"
              initial={{ opacity: 0, x: -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-auto h-full w-80 lg:w-96 bg-white/95 rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden origin-top-left"
            >
              {renderPanelContent()}
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsDesktopPanelOpen(prev => !prev)}
          className={`pointer-events-auto mt-3 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200/90 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95 ${
            isDesktopPanelOpen ? "ml-2 w-9 h-11" : "px-3.5 h-11 text-xs font-bold text-teal-800"
          }`}
          title={isDesktopPanelOpen ? "Sembunyikan Panel Daftar" : "Tampilkan Panel Daftar Faskes"}
        >
          {isDesktopPanelOpen ? (
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          ) : (
            <>
              <ListFilter className="w-4 h-4 text-teal-600" />
              <span>Daftar Faskes ({filteredFacilities.length})</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </>
          )}
        </button>
      </div>

      {/* MOBILE INTERACTIVE BOTTOM DRAWER / SHEET */}
      <motion.div
        initial={false}
        animate={{
          height:
            mobileDrawerState === "expanded"
              ? "82%"
              : mobileDrawerState === "half"
              ? "46%"
              : "64px",
        }}
        transition={{
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="md:hidden absolute left-0 right-0 bottom-0 z-30 bg-white/95 rounded-t-3xl shadow-[0_-8px_30px_rgba(15,23,42,0.18)] border-t border-slate-200/90 flex flex-col overflow-hidden"
      >
        {/* Touch Handle Header */}
        <div
          onClick={() =>
            setMobileDrawerState(prev =>
              prev === "minimized" ? "half" : prev === "half" ? "expanded" : "minimized"
            )
          }
          className="pt-2 pb-2.5 px-4 flex flex-col items-center cursor-pointer shrink-0 border-b border-slate-100"
        >
          <div className="w-10 h-1.5 bg-slate-300 rounded-full mb-2" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800">
                {filteredFacilities.length} Faskes Terdekat
              </span>
              <span className="text-[11px] text-slate-500">
                · {sortBy === "distance" ? "Urut Jarak" : "Urut Nama"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
              <span>{mobileDrawerState === "expanded" ? "Kecilkan" : mobileDrawerState === "half" ? "Perluas" : "Buka Daftar"}</span>
              {mobileDrawerState === "expanded" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileDrawerState !== "minimized" && isMobileViewport && (
            <motion.div
              key="mobile-drawer-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {renderPanelContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Peta Faskes</h3>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 mb-4">
                <p className="text-sm text-slate-600">
                  Unggah data Peta Faskes dalam format CSV atau Excel (.xlsx). Pastikan file memiliki baris pertama sebagai header yang tepat.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template Excel
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCsvFile(file);
                      setCsvError("");
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {csvError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {csvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateData}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

