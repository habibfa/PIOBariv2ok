import React, { useEffect, useState, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from 'react-leaflet';
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
  Globe,
  RefreshCw,
  MapPinned,
  AlertCircle,
  Route as RouteIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  getFacilitiesFromDb,
  saveFacilitiesToDb,
  deleteAllFacilities,
  Facility,
} from './services/facilitiesService';
import {
  SUMSEL_REGIONS,
  SUMSEL_KOTA_REGIONS,
  SUMSEL_KABUPATEN_REGIONS,
  SUMSEL_PROVINCE_CENTER,
  getSumselRegionById,
  getRegionBoundsLiteral,
  SumselRegion,
} from './data/sumselRegions';
import { SUMSEL_CURATED_FACILITIES } from './data/sumselFacilitiesData';

const RSUD_BARI_COORDS = { lat: -3.010222, lng: 104.768972 };

type FacilityCategory = 'Hospital' | 'Puskesmas' | 'Clinic' | 'Pharmacy';
type FilterCategory = 'Semua' | FacilityCategory;
type MapStyleKey = 'osm' | 'street' | 'satellite';

interface TileLayerConfig {
  id: MapStyleKey;
  label: string;
  url: string;
  overlayUrl?: string;
  attribution: string;
  maxZoom: number;
}

const TILE_LAYERS: Record<MapStyleKey, TileLayerConfig> = {
  osm: {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  street: {
    id: 'street',
    label: 'Peta Bersih',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Esri, TomTom, Garmin, FAO, NOAA, USGS',
    maxZoom: 18,
  },
  satellite: {
    id: 'satellite',
    label: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

const MAP_STYLE_OPTIONS: { id: MapStyleKey; label: string }[] = [
  { id: 'osm', label: 'Peta Jalan' },
  { id: 'street', label: 'Peta Bersih' },
  { id: 'satellite', label: 'Satelit' },
];

const QUICK_CATEGORY_CHIPS = [
  {
    id: 'Semua' as const,
    shortLabel: 'Semua',
    fullLabel: 'Semua Faskes',
    activeClass: 'bg-slate-900 text-white border-slate-900',
    inactiveClass: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200',
  },
  {
    id: 'Hospital' as const,
    shortLabel: 'RS',
    fullLabel: 'Rumah Sakit (RS)',
    activeClass: 'bg-red-600 text-white border-red-600',
    inactiveClass: 'bg-white hover:bg-red-50/70 text-red-800 border-slate-200',
  },
  {
    id: 'Puskesmas' as const,
    shortLabel: 'Puskesmas',
    fullLabel: 'Puskesmas',
    activeClass: 'bg-orange-600 text-white border-orange-600',
    inactiveClass: 'bg-white hover:bg-orange-50/70 text-orange-800 border-slate-200',
  },
  {
    id: 'Clinic' as const,
    shortLabel: 'Klinik',
    fullLabel: 'Klinik',
    activeClass: 'bg-blue-600 text-white border-blue-600',
    inactiveClass: 'bg-white hover:bg-blue-50/70 text-blue-800 border-slate-200',
  },
  {
    id: 'Pharmacy' as const,
    shortLabel: 'Apotek',
    fullLabel: 'Apotek',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    inactiveClass: 'bg-white hover:bg-emerald-50/70 text-emerald-800 border-slate-200',
  },
];

// Haversine geodesic distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

function hashStringToNumber(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return 200000 + (hash % 700000000);
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyOsmElement(tags: Record<string, string | undefined>): FacilityCategory {
  const name = (tags.name || '').toLowerCase();
  const amenity = (tags.amenity || '').toLowerCase();
  const healthcare = (tags.healthcare || '').toLowerCase();

  if (
    name.includes('puskesmas') ||
    name.includes('pusat kesehatan masyarakat') ||
    name.includes('pustu') ||
    name.includes('puskesdes')
  ) {
    return 'Puskesmas';
  }
  if (
    amenity === 'pharmacy' ||
    healthcare === 'pharmacy' ||
    name.includes('apotek') ||
    name.includes('apotik') ||
    name.includes('kimia farma') ||
    name.includes('k-24')
  ) {
    return 'Pharmacy';
  }
  if (
    amenity === 'hospital' ||
    healthcare === 'hospital' ||
    name.includes('rumah sakit') ||
    /\brs\b/.test(name) ||
    /\brsud\b/.test(name) ||
    /\brsup\b/.test(name) ||
    /\brsia\b/.test(name) ||
    /\brsu\b/.test(name)
  ) {
    return 'Hospital';
  }
  return 'Clinic';
}

function getTypeMeta(type: string) {
  switch (type) {
    case 'Hospital':
      return { label: 'Rumah Sakit', textClass: 'text-red-700', hex: '#ef4444' };
    case 'Puskesmas':
      return { label: 'Puskesmas', textClass: 'text-orange-700', hex: '#f97316' };
    case 'Clinic':
      return { label: 'Klinik', textClass: 'text-blue-700', hex: '#2563eb' };
    case 'Pharmacy':
      return { label: 'Apotek', textClass: 'text-emerald-700', hex: '#059669' };
    default:
      return { label: type, textClass: 'text-slate-700', hex: '#475569' };
  }
}

function formatDurationMinutes(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} menit`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} jam ${mins} mnt` : `${hours} jam`;
}

// Cached Leaflet custom SVG marker icons (zero broken default PNG icons)
const iconCache = new Map<string, L.DivIcon>();

function getFacilityDivIcon(type: Facility['type'], isRSUDBari: boolean, isSelected: boolean): L.DivIcon {
  const key = `${type}_${isRSUDBari ? 'bari' : 'std'}_${isSelected ? 'sel' : 'norm'}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const bgColor = isRSUDBari
    ? '#e11d48'
    : type === 'Hospital'
    ? '#ef4444'
    : type === 'Puskesmas'
    ? '#f97316'
    : type === 'Clinic'
    ? '#2563eb'
    : '#059669';

  const size = isRSUDBari ? 38 : isSelected ? 36 : 30;
  const radius = isRSUDBari || type === 'Hospital' ? '10px' : '9999px';
  const border = isSelected ? '3px solid #0f172a' : '2.5px solid #ffffff';
  const shadow = isSelected
    ? '0 0 0 4px rgba(13, 148, 136, 0.32), 0 6px 14px rgba(15, 23, 42, 0.35)'
    : '0 3px 9px rgba(15, 23, 42, 0.28)';

  let svgInner = '';
  if (type === 'Hospital' || isRSUDBari) {
    svgInner = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`;
  } else if (type === 'Puskesmas') {
    svgInner = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16"/><path d="M4 12h16"/></svg>`;
  } else if (type === 'Clinic') {
    svgInner = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
  } else {
    svgInner = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;
  }

  const icon = L.divIcon({
    className: 'piobari-leaflet-pin',
    html: `<div style="width:${size}px;height:${size}px;border-radius:${radius};background:${bgColor};border:${border};box-shadow:${shadow};display:flex;align-items:center;justify-content:center;transition:transform 150ms ease;">${svgInner}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });

  iconCache.set(key, icon);
  return icon;
}

const USER_GPS_PATH_OPTIONS: L.PathOptions = {
  color: '#ffffff',
  weight: 3,
  fillColor: '#0d9488',
  fillOpacity: 1,
};

const ROUTE_SHADOW_PATH_OPTIONS: L.PathOptions = {
  color: '#0f172a',
  weight: 8,
  opacity: 0.2,
};

const ROUTE_SOLID_PATH_OPTIONS: L.PathOptions = {
  color: '#0d9488',
  weight: 5,
  opacity: 0.92,
};

const ROUTE_DASHED_PATH_OPTIONS: L.PathOptions = {
  color: '#0d9488',
  weight: 5,
  opacity: 0.92,
  dashArray: '8 8',
};

// Isolated coordinates HUD rendered inside MapContainer so pan/zoom NEVER re-renders parent markers
const MapCoordsHud: React.FC<{ mapStyleLabel: string }> = React.memo(({ mapStyleLabel }) => {
  const map = useMap();
  const [coords, setCoords] = useState(() => {
    const c = map.getCenter();
    return { lat: c.lat, lng: c.lng, zoom: map.getZoom() };
  });

  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      setCoords((prev) => {
        if (
          Math.abs(prev.lat - c.lat) < 0.00001 &&
          Math.abs(prev.lng - c.lng) < 0.00001 &&
          prev.zoom === z
        ) {
          return prev;
        }
        return { lat: c.lat, lng: c.lng, zoom: z };
      });
    };
    map.on('moveend', update);
    map.on('zoomend', update);
    return () => {
      map.off('moveend', update);
      map.off('zoomend', update);
    };
  }, [map]);

  return (
    <div className="hidden md:flex absolute bottom-4 right-3 z-[450] bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md items-center gap-2 text-[11px] font-mono tabular-nums pointer-events-none">
      <span>{coords.lat.toFixed(5)}</span>
      <span className="text-slate-500">,</span>
      <span>{coords.lng.toFixed(5)}</span>
      <span className="text-slate-500">·</span>
      <span className="font-sans font-semibold text-teal-300 text-[10px]">
        {mapStyleLabel} ({coords.zoom}x)
      </span>
    </div>
  );
});

// Memoized facility marker so selection/pan/zoom never detaches refs or rebinds event handlers on all pins
interface FacilityMarkerItemProps {
  facility: Facility & { distanceKm: number };
  isSelected: boolean;
  originLat: number;
  originLng: number;
  onSelectId: (id: number) => void;
  onComputeRoute: (dest: { lat: number; lng: number }, name: string) => void;
  onRegisterRef: (id: number, marker: L.Marker | null) => void;
}

const FacilityMarkerItem: React.FC<FacilityMarkerItemProps> = React.memo(
  ({
    facility,
    isSelected,
    originLat,
    originLng,
    onSelectId,
    onComputeRoute,
    onRegisterRef,
  }) => {
    const isRSUDBari = facility.name.toUpperCase().includes('PALEMBANG BARI');
    const meta = getTypeMeta(facility.type);

    const position = useMemo<[number, number]>(
      () => [facility.lat, facility.lng],
      [facility.lat, facility.lng]
    );

    const icon = useMemo(
      () => getFacilityDivIcon(facility.type, isRSUDBari, isSelected),
      [facility.type, isRSUDBari, isSelected]
    );

    const eventHandlers = useMemo(
      () => ({
        click: () => {
          onSelectId(facility.id);
        },
      }),
      [facility.id, onSelectId]
    );

    const handleMarkerRef = useCallback(
      (marker: L.Marker | null) => {
        onRegisterRef(facility.id, marker);
      },
      [facility.id, onRegisterRef]
    );

    return (
      <Marker
        position={position}
        icon={icon}
        zIndexOffset={isRSUDBari ? 1000 : isSelected ? 800 : 100}
        ref={handleMarkerRef}
        eventHandlers={eventHandlers}
      >
        <Popup maxWidth={290} minWidth={230}>
          <div className="p-1 font-sans">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={`font-bold ${meta.textClass}`}>{meta.label}</span>
              <span>·</span>
              <span>{facility.city || 'Sumatera Selatan'}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
              {facility.name}
            </h3>
            {facility.kelas && (
              <div className="text-[11px] text-slate-500 mt-0.5">{facility.kelas}</div>
            )}
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{facility.address}</p>

            {facility.contact && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-700">
                <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <a
                  href={`tel:${facility.contact.replace(/[^0-9+]/g, '')}`}
                  className="font-mono font-medium hover:underline"
                >
                  {facility.contact}
                </a>
              </div>
            )}

            {facility.websiteUri && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={facility.websiteUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  Situs Web Resmi
                </a>
              </div>
            )}

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onComputeRoute({ lat: facility.lat, lng: facility.lng }, facility.name)
                }
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                <span>Hitung Rute</span>
              </button>
              <a
                href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originLat}%2C${originLng}%3B${facility.lat}%2C${facility.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Arah OSM</span>
              </a>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }
);

// Controller for smooth flyTo, route bounds fitting, and resize invalidation
interface LeafletControllerProps {
  targetCenter: { lat: number; lng: number } | null;
  targetZoom: number;
  cameraNonce: number;
  routeCoords: [number, number][] | null;
  layoutSignal: boolean;
}

const LeafletMapController: React.FC<LeafletControllerProps> = React.memo(
  ({ targetCenter, targetZoom, cameraNonce, routeCoords, layoutSignal }) => {
    const map = useMap();
    const lastFittedRouteRef = useRef<[number, number][] | null>(null);

    useEffect(() => {
      if (cameraNonce === 0 || !targetCenter) return;
      map.flyTo([targetCenter.lat, targetCenter.lng], targetZoom, {
        duration: 0.7,
      });
    }, [map, targetCenter, targetZoom, cameraNonce]);

    useEffect(() => {
      if (!routeCoords || routeCoords.length < 2) {
        lastFittedRouteRef.current = null;
        return;
      }
      if (lastFittedRouteRef.current === routeCoords) return;
      lastFittedRouteRef.current = routeCoords;
      const bounds = L.latLngBounds(routeCoords.map(([lat, lng]) => L.latLng(lat, lng)));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [52, 52], maxZoom: 15 });
      }
    }, [map, routeCoords]);

    useEffect(() => {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 280);
      return () => clearTimeout(timer);
    }, [map, layoutSignal]);

    return null;
  }
);

interface MapFacilitiesProps {
  isAdmin?: boolean;
}

export const MapFacilities: React.FC<MapFacilitiesProps> = ({ isAdmin = false }) => {
  // Default to Kota Palembang (user can switch to 'all-sumsel' or any of the 17 Kota/Kabupaten)
  const [selectedRegionId, setSelectedRegionId] = useState<string>('kota-palembang');
  const [typeFilter, setTypeFilter] = useState<FilterCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('osm');
  const [panelTab, setPanelTab] = useState<'list' | 'regions' | 'stats'>('list');
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState(true);
  const [mobileDrawerState, setMobileDrawerState] = useState<'minimized' | 'half' | 'expanded'>('half');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Optional live OpenStreetMap Overpass API enrichment cache keyed by regionId
  const [osmEnrichedByRegion, setOsmEnrichedByRegion] = useState<Record<string, Facility[]>>({});
  const [isSyncingOsm, setIsSyncingOsm] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  // Admin-imported custom institutional facilities
  const [adminFacilities, setAdminFacilities] = useState<Facility[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState('');

  // Camera state
  const [targetCenter, setTargetCenter] = useState<{ lat: number; lng: number } | null>(
    SUMSEL_REGIONS[0].center
  );
  const [targetZoom, setTargetZoom] = useState<number>(SUMSEL_REGIONS[0].zoom);
  const [cameraNonce, setCameraNonce] = useState(0);

  // Selected facility & copy state
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [copiedCoordsId, setCopiedCoordsId] = useState<number | null>(null);
  const markerRefs = useRef<Record<number, L.Marker | null>>({});

  const registerMarkerRef = useCallback((id: number, marker: L.Marker | null) => {
    if (marker) {
      markerRefs.current[id] = marker;
    } else {
      delete markerRefs.current[id];
    }
  }, []);

  // GPS & Free OSRM Driving Route
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState('');
  const [routeData, setRouteData] = useState<{
    coordinates: [number, number][];
    distanceMeters: number;
    durationSeconds: number;
    destinationName: string;
    originLabel: string;
    isApproximate: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    setIsMobileViewport((prev) => (prev === mq.matches ? prev : mq.matches));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load optional admin custom facilities from localStorage
  useEffect(() => {
    let active = true;
    getFacilitiesFromDb()
      .then((rows) => {
        if (active && Array.isArray(rows) && rows.length > 0) {
          setAdminFacilities(rows.map((r) => ({ ...r, source: 'admin' })));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const flyToLocation = useCallback((lat: number, lng: number, zoom: number) => {
    setTargetCenter({ lat, lng });
    setTargetZoom(zoom);
    setCameraNonce((n) => n + 1);
  }, []);

  // Optional Live Sync with OpenStreetMap Overpass API (100% Free, No API Key)
  const syncRegionWithOpenStreetMap = useCallback(async (region: SumselRegion) => {
    setIsSyncingOsm(true);
    setSyncError('');
    setSyncMessage(`Mengambil data tambahan OpenStreetMap untuk ${region.name}...`);

    const bounds = getRegionBoundsLiteral(region);
    const bbox = `${bounds.south.toFixed(4)},${bounds.west.toFixed(4)},${bounds.north.toFixed(4)},${bounds.east.toFixed(4)}`;
    const overpassQuery = `[out:json][timeout:18];(nwr["amenity"~"hospital|clinic|pharmacy|doctors"](${bbox});nwr["healthcare"~"hospital|clinic|pharmacy|centre"](${bbox}););out center 120;`;

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];

    let elements: any[] | null = null;
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 14000);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: `data=${encodeURIComponent(overpassQuery)}`,
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.elements)) {
            elements = json.elements;
            break;
          }
        }
      } catch {
        // Try next mirror
      }
    }

    if (!elements) {
      setSyncError(
        `Server OpenStreetMap sedang sibuk untuk ${region.shortName}. Basis data lokal Sumatera Selatan tetap aktif penuh.`
      );
      setIsSyncingOsm(false);
      setSyncMessage('');
      return;
    }

    const mapped: Facility[] = [];
    const seenKeys = new Set<string>();

    for (const el of elements) {
      const tags = el.tags || {};
      const rawName = (tags.name || tags['name:id'] || '').trim();
      if (!rawName) continue;

      const lat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
      const lng = typeof el.lon === 'number' ? el.lon : el.center?.lon;
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;

      const norm = normalizeName(rawName);
      if (seenKeys.has(norm)) continue;
      seenKeys.add(norm);

      const addressParts = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:suburb'] || tags['addr:village'],
        tags['addr:city'] || region.name,
      ].filter(Boolean);

      const detectedType = classifyOsmElement(tags);
      const osmId = `${el.type}/${el.id}`;

      mapped.push({
        id: hashStringToNumber(`osm_${osmId}`),
        osmId,
        name: rawName,
        type: detectedType,
        kelas:
          detectedType === 'Hospital'
            ? 'Rumah Sakit · OpenStreetMap'
            : detectedType === 'Puskesmas'
            ? 'Puskesmas · OpenStreetMap'
            : detectedType === 'Pharmacy'
            ? 'Apotek · OpenStreetMap'
            : 'Klinik · OpenStreetMap',
        address: addressParts.length > 0 ? addressParts.join(', ') : region.searchLabel,
        lat,
        lng,
        contact: tags.phone || tags['contact:phone'] || undefined,
        websiteUri: tags.website || tags['contact:website'] || undefined,
        city: region.name,
        regionId: region.id,
        source: 'osm',
      });
    }

    setOsmEnrichedByRegion((prev) => ({
      ...prev,
      [region.id]: mapped,
    }));

    setSyncMessage(
      mapped.length > 0
        ? `Berhasil memuat ${mapped.length} titik tambahan OpenStreetMap di ${region.shortName}.`
        : `Tidak ada titik tambahan baru di OpenStreetMap untuk ${region.shortName}.`
    );
    setTimeout(() => setSyncMessage(''), 4000);
    setIsSyncingOsm(false);
  }, []);

  // Merge built-in curated Sumatera Selatan database + optional OSM sync + admin custom CSV
  const allProvinceFacilities = useMemo(() => {
    const merged: Facility[] = [...SUMSEL_CURATED_FACILITIES];
    const existingNormNames = new Map<string, { lat: number; lng: number }[]>();

    const register = (f: Facility) => {
      const key = normalizeName(f.name);
      const arr = existingNormNames.get(key) || [];
      arr.push({ lat: f.lat, lng: f.lng });
      existingNormNames.set(key, arr);
    };

    merged.forEach(register);

    // Add OSM enriched items without duplicating curated entries nearby
    Object.values(osmEnrichedByRegion).forEach((list) => {
      list.forEach((item) => {
        const key = normalizeName(item.name);
        const sameNames = existingNormNames.get(key);
        if (sameNames && sameNames.some((p) => calculateDistanceKm(p.lat, p.lng, item.lat, item.lng) < 1.5)) {
          return;
        }
        merged.push(item);
        register(item);
      });
    });

    // Add Admin CSV facilities
    adminFacilities.forEach((f) => {
      const inferredRegion =
        f.regionId ||
        SUMSEL_REGIONS.find(
          (r) =>
            (f.city || '').toLowerCase().includes(r.shortName.toLowerCase()) ||
            (f.address || '').toLowerCase().includes(r.shortName.toLowerCase())
        )?.id ||
        'kota-palembang';
      merged.push({ ...f, regionId: inferredRegion });
    });

    return merged;
  }, [osmEnrichedByRegion, adminFacilities]);

  const countByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    allProvinceFacilities.forEach((f) => {
      const rId = f.regionId || 'kota-palembang';
      counts[rId] = (counts[rId] || 0) + 1;
    });
    return counts;
  }, [allProvinceFacilities]);

  const activeRegionObj = useMemo(
    () => (selectedRegionId === 'all-sumsel' ? null : getSumselRegionById(selectedRegionId) || null),
    [selectedRegionId]
  );

  // Facilities scoped to active Kota/Kabupaten or Seluruh Sumatera Selatan
  const regionFacilities = useMemo(() => {
    if (selectedRegionId === 'all-sumsel') return allProvinceFacilities;
    return allProvinceFacilities.filter((f) => f.regionId === selectedRegionId);
  }, [allProvinceFacilities, selectedRegionId]);

  const referenceCoords = useMemo(() => {
    if (userLocation) return userLocation;
    if (activeRegionObj) return activeRegionObj.center;
    return RSUD_BARI_COORDS;
  }, [userLocation, activeRegionObj]);

  // Text search filter (searches across current region; if user types and current region has 0 matches, searches whole province automatically!)
  const { searchFilteredFacilities, expandedToProvinceSearch } = useMemo(() => {
    const q = (deferredSearchQuery || '').trim().toLowerCase();
    if (!q) {
      return { searchFilteredFacilities: regionFacilities, expandedToProvinceSearch: false };
    }
    const localMatches = regionFacilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        (f.city || '').toLowerCase().includes(q) ||
        (f.kelas || '').toLowerCase().includes(q)
    );
    if (localMatches.length > 0 || selectedRegionId === 'all-sumsel') {
      return { searchFilteredFacilities: localMatches, expandedToProvinceSearch: false };
    }
    const provinceMatches = allProvinceFacilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        (f.city || '').toLowerCase().includes(q) ||
        (f.kelas || '').toLowerCase().includes(q)
    );
    return {
      searchFilteredFacilities: provinceMatches,
      expandedToProvinceSearch: provinceMatches.length > 0,
    };
  }, [regionFacilities, allProvinceFacilities, deferredSearchQuery, selectedRegionId]);

  const categoryCounts = useMemo(
    () => ({
      Semua: searchFilteredFacilities.length,
      Hospital: searchFilteredFacilities.filter((f) => f.type === 'Hospital').length,
      Puskesmas: searchFilteredFacilities.filter((f) => f.type === 'Puskesmas').length,
      Clinic: searchFilteredFacilities.filter((f) => f.type === 'Clinic').length,
      Pharmacy: searchFilteredFacilities.filter((f) => f.type === 'Pharmacy').length,
    }),
    [searchFilteredFacilities]
  );

  const filteredFacilities = useMemo(() => {
    const list = searchFilteredFacilities
      .filter((f) => (typeFilter === 'Semua' ? true : f.type === typeFilter))
      .map((f) => ({
        ...f,
        distanceKm: calculateDistanceKm(referenceCoords.lat, referenceCoords.lng, f.lat, f.lng),
      }));

    return list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.distanceKm - b.distanceKm;
    });
  }, [searchFilteredFacilities, typeFilter, referenceCoords, sortBy]);

  // Charts data
  const pieDataCategory = useMemo(
    () =>
      [
        { name: 'Rumah Sakit', value: categoryCounts.Hospital, color: '#ef4444' },
        { name: 'Puskesmas', value: categoryCounts.Puskesmas, color: '#f97316' },
        { name: 'Klinik', value: categoryCounts.Clinic, color: '#2563eb' },
        { name: 'Apotek', value: categoryCounts.Pharmacy, color: '#059669' },
      ].filter((d) => d.value > 0),
    [categoryCounts]
  );

  const barDataByRegion = useMemo(
    () =>
      SUMSEL_REGIONS.map((r) => ({
        name: r.shortName,
        value: countByRegion[r.id] || 0,
      })).sort((a, b) => b.value - a.value),
    [countByRegion]
  );

  const handleSelectRegion = useCallback(
    (regionId: string) => {
      setSelectedRegionId(regionId);
      setSelectedFacilityId(null);
      setSyncError('');
      setRouteData(null);

      if (regionId === 'all-sumsel') {
        flyToLocation(SUMSEL_PROVINCE_CENTER.lat, SUMSEL_PROVINCE_CENTER.lng, 8);
        return;
      }
      const region = getSumselRegionById(regionId);
      if (region) {
        flyToLocation(region.center.lat, region.center.lng, region.zoom);
      }
    },
    [flyToLocation]
  );

  const handleSelectFacility = useCallback(
    (facility: Facility & { distanceKm: number }, shouldFly = true) => {
      setSelectedFacilityId(facility.id);
      setPanelTab('list');
      setIsDesktopPanelOpen(true);
      setMobileDrawerState((prev) => (prev === 'minimized' ? 'half' : prev));
      if (shouldFly) {
        flyToLocation(facility.lat, facility.lng, 15);
      }
      setTimeout(() => {
        const marker = markerRefs.current[facility.id];
        if (marker) {
          marker.openPopup();
        }
      }, 350);
    },
    [flyToLocation]
  );

  const locateUser = () => {
    setIsLocating(true);
    setRoutingError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          flyToLocation(coords.lat, coords.lng, 14);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          setRoutingError('Gagal mengakses GPS. Pastikan izin lokasi aktif di browser Anda.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setRoutingError('Geolokasi tidak didukung oleh perangkat ini.');
    }
  };

  // Free Road Routing via OSRM (Open Source Routing Machine) with automatic direct-line fallback
  const computeRouteToFacility = useCallback(
    async (destination: { lat: number; lng: number }, facilityName: string) => {
      const origin = userLocation || RSUD_BARI_COORDS;
      const originLabel = userLocation ? 'Lokasi GPS Anda' : 'RSUD Palembang BARI';

      setIsRouting(true);
      setRoutingError('');
      setRouteData(null);

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 9000);
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const primary = data?.routes?.[0];
          if (primary?.geometry?.coordinates?.length >= 2) {
            const latLngs: [number, number][] = primary.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );
            setRouteData({
              coordinates: latLngs,
              distanceMeters: primary.distance || 0,
              durationSeconds: primary.duration || 0,
              destinationName: facilityName,
              originLabel,
              isApproximate: false,
            });
            setIsRouting(false);
            return;
          }
        }
        throw new Error('OSRM unavailable');
      } catch {
        // Resilient direct-line estimation fallback (zero broken UX)
        const km = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
        const estRoadKm = km * 1.25;
        const estSeconds = (estRoadKm / 42) * 3600;
        setRouteData({
          coordinates: [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ],
          distanceMeters: Math.round(estRoadKm * 1000),
          durationSeconds: Math.round(estSeconds),
          destinationName: facilityName,
          originLabel,
          isApproximate: true,
        });
      } finally {
        setIsRouting(false);
      }
    },
    [userLocation]
  );

  const handleCopyCoords = (lat: number, lng: number, id: number) => {
    navigator.clipboard?.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedCoordsId(id);
    setTimeout(() => setCopiedCoordsId(null), 2000);
  };

  const handleToggleCategoryChip = (categoryId: FilterCategory) => {
    setTypeFilter((prev) => (prev === categoryId && categoryId !== 'Semua' ? 'Semua' : categoryId));
  };

  // Admin optional CSV/Excel import handlers
  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const template = [
      {
        id: 90001,
        name: 'Contoh RS Daerah',
        type: 'Hospital',
        address: 'Jl. Contoh No. 1, Palembang, Sumatera Selatan',
        lat: -2.9761,
        lng: 104.7754,
        contact: '(0711) 000000',
        city: 'Kota Palembang',
        regionId: 'kota-palembang',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Faskes_Sumsel');
    XLSX.writeFile(wb, 'Template_Faskes_Sumsel.xlsx');
  };

  const validateAndSetAdminData = async (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      const newData: Facility[] = parsed.map((item) => ({
        ...item,
        lat: Number(item.lat),
        lng: Number(item.lng),
        source: 'admin',
        locked: false,
      }));
      setAdminFacilities((prev) => {
        const filtered = prev.filter((p) => !newData.some((n) => n.id === p.id));
        return [...filtered, ...newData];
      });
      setIsUpdateModalOpen(false);
      setCsvError('');
      setCsvFile(null);
      await saveFacilitiesToDb(newData);
    } else {
      setCsvError(
        'Format file tidak valid. Pastikan baris pertama berisi kolom id, name, type, address, lat, lng.'
      );
    }
  };

  const handleUpdateData = async () => {
    if (!csvFile) {
      setCsvError('Silakan pilih file CSV/Excel terlebih dahulu.');
      return;
    }
    const fileExt = csvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      try {
        const Papa = (await import('papaparse')).default;
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => void validateAndSetAdminData(results.data),
          error: (error) => setCsvError('Gagal membaca file CSV: ' + error.message),
        });
      } catch (err: any) {
        setCsvError('Gagal memuat parser CSV: ' + err?.message);
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = await import('xlsx');
        const data = await csvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        await validateAndSetAdminData(parsed);
      } catch (err: any) {
        setCsvError('Gagal membaca file Excel: ' + err.message);
      }
    } else {
      setCsvError('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)');
    }
  };

  const activeTileConfig = TILE_LAYERS[mapStyle];
  const originForExternalNav = userLocation || RSUD_BARI_COORDS;

  const renderPanelContent = () => (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Sub-navigation Tabs */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-200/80 bg-white shrink-0 flex flex-col gap-2">
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl w-full gap-0.5">
          <button
            type="button"
            onClick={() => setPanelTab('list')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
              panelTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span>Daftar ({filteredFacilities.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('regions')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
              panelTab === 'regions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPinned className="w-3.5 h-3.5 shrink-0" />
            <span>17 Wilayah</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('stats')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
              panelTab === 'stats'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Statistik</span>
          </button>
        </div>

        {/* Sort & Optional OpenStreetMap Live Sync Bar */}
        {panelTab === 'list' && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="font-semibold text-slate-800 truncate">
                {activeRegionObj ? activeRegionObj.name : 'Seluruh Sumatera Selatan'}
              </span>
              {expandedToProvinceSearch && (
                <span className="text-teal-700 font-medium shrink-0">· se-Sumsel</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeRegionObj && (
                <button
                  type="button"
                  onClick={() => void syncRegionWithOpenStreetMap(activeRegionObj)}
                  disabled={isSyncingOsm}
                  title="Muat tambahan fasilitas dari OpenStreetMap (Overpass API)"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-teal-200 bg-teal-50/80 hover:bg-teal-100/70 text-teal-800 font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingOsm ? 'animate-spin' : ''}`} />
                  <span>{osmEnrichedByRegion[activeRegionObj.id] ? 'Perbarui OSM' : '+ OSM'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSortBy((prev) => (prev === 'distance' ? 'name' : 'distance'))}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors whitespace-nowrap"
              >
                <ArrowUpDown className="w-3 h-3 text-slate-500" />
                <span>{sortBy === 'distance' ? 'Terdekat' : 'A-Z'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync / Error Notices */}
      {(syncMessage || syncError || routingError) && (
        <div
          className={`px-3.5 py-2 text-[11px] border-b flex items-start justify-between gap-2 shrink-0 ${
            syncError || routingError
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-start gap-1.5 leading-snug">
            {isSyncingOsm ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 mt-0.5 text-teal-700" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            )}
            <span>{routingError || syncError || syncMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSyncError('');
              setSyncMessage('');
              setRoutingError('');
            }}
            className="text-current opacity-60 hover:opacity-100 shrink-0"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: FACILITY DIRECTORY LIST */}
      {panelTab === 'list' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
          {filteredFacilities.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-slate-800">Tidak ada faskes yang cocok</p>
              <p className="text-xs text-slate-500 mt-1">
                Coba ubah kata kunci pencarian, kategori, atau pilih wilayah Kota/Kabupaten lain.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('Semua');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
                {activeRegionObj && (
                  <button
                    type="button"
                    onClick={() => void syncRegionWithOpenStreetMap(activeRegionObj)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                  >
                    Cari di OpenStreetMap
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredFacilities.map((facility) => {
              const isSelected = selectedFacilityId === facility.id;
              const meta = getTypeMeta(facility.type);
              const isRSUDBari = facility.name.toUpperCase().includes('PALEMBANG BARI');

              return (
                <div
                  key={`${facility.source || 'b'}_${facility.id}`}
                  onClick={() => handleSelectFacility(facility, true)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50/75' : 'hover:bg-slate-50/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-0.5">
                        <span className={`font-semibold ${meta.textClass}`}>{meta.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{facility.city || 'Sumatera Selatan'}</span>
                        {facility.source === 'osm' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-teal-700">OSM</span>
                          </>
                        )}
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 leading-snug">
                        {facility.name}
                        {isRSUDBari && (
                          <span className="ml-1.5 text-[11px] font-semibold text-rose-600">
                            (Rujukan Utama)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {facility.address}
                      </p>
                      {facility.kelas && (
                        <p className="text-[11px] text-slate-500 mt-1">{facility.kelas}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                        {facility.distanceKm < 1
                          ? `${Math.round(facility.distanceKm * 1000)} m`
                          : `${facility.distanceKm.toFixed(1)} km`}
                      </span>
                    </div>
                  </div>

                  {/* Action row visible on selected or quick hover */}
                  <div className="mt-2.5 flex items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFacility(facility, true);
                        void computeRouteToFacility({ lat: facility.lat, lng: facility.lng }, facility.name);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
                    >
                      <RouteIcon className="w-3 h-3" />
                      <span>Rute Jalan</span>
                    </button>

                    <a
                      href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originForExternalNav.lat}%2C${originForExternalNav.lng}%3B${facility.lat}%2C${facility.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka OSM</span>
                    </a>

                    {facility.contact && (
                      <a
                        href={`tel:${facility.contact.replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-700 whitespace-nowrap"
                      >
                        <Phone className="w-3 h-3" />
                        <span className="font-mono tabular-nums">{facility.contact}</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCoords(facility.lat, facility.lng, facility.id);
                      }}
                      className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap"
                      title="Salin koordinat geografis"
                    >
                      {copiedCoordsId === facility.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Koordinat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: 17 KOTA & KABUPATEN SUMATERA SELATAN */}
      {panelTab === 'regions' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-4 bg-white">
          <button
            type="button"
            onClick={() => {
              handleSelectRegion('all-sumsel');
              setPanelTab('list');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-colors ${
              selectedRegionId === 'all-sumsel'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div>
              <div className="text-xs font-bold">Seluruh Provinsi Sumatera Selatan</div>
              <div
                className={`text-[11px] mt-0.5 ${
                  selectedRegionId === 'all-sumsel' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                4 Kota Otonom · 13 Kabupaten
              </div>
            </div>
            <span className="text-xs font-mono font-bold tabular-nums">
              {allProvinceFacilities.length} faskes
            </span>
          </button>

          {/* 4 Kota */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-xs font-bold text-slate-900">Kota Otonom (4)</h4>
              <span className="text-[11px] text-slate-500">Klik wilayah untuk pindah peta</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SUMSEL_KOTA_REGIONS.map((region) => {
                const active = selectedRegionId === region.id;
                const total = countByRegion[region.id] || 0;
                const hasOsm = Boolean(osmEnrichedByRegion[region.id]?.length);
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      handleSelectRegion(region.id);
                      setPanelTab('list');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      active
                        ? 'bg-teal-50 border-teal-500 text-teal-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{region.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Ibu Kota: {region.capital}
                        {hasOsm ? ' · Tersinkron OSM' : ''}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums shrink-0 ml-2">
                      {total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 13 Kabupaten */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-xs font-bold text-slate-900">Kabupaten (13)</h4>
              <span className="text-[11px] text-slate-500">RS · Puskesmas · Klinik · Apotek</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SUMSEL_KABUPATEN_REGIONS.map((region) => {
                const active = selectedRegionId === region.id;
                const total = countByRegion[region.id] || 0;
                const hasOsm = Boolean(osmEnrichedByRegion[region.id]?.length);
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      handleSelectRegion(region.id);
                      setPanelTab('list');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      active
                        ? 'bg-teal-50 border-teal-500 text-teal-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{region.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Ibu Kota: {region.capital}
                        {hasOsm ? ' · Tersinkron OSM' : ''}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums shrink-0 ml-2">
                      {total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTICS & CHARTS */}
      {panelTab === 'stats' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 bg-white">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="text-[11px] text-slate-500 font-medium">Total Faskes Sumsel</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {allProvinceFacilities.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">17 Kota & Kabupaten</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="text-[11px] text-slate-500 font-medium">Wilayah Aktif</div>
              <div className="text-xl font-bold text-teal-700 font-mono tabular-nums mt-0.5">
                {categoryCounts.Semua}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {activeRegionObj ? activeRegionObj.shortName : 'Seluruh Provinsi'}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Komposisi Kategori ({activeRegionObj ? activeRegionObj.shortName : 'Sumsel'})
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Proporsi Rumah Sakit, Puskesmas, Klinik, dan Apotek
            </p>
            <div className="h-[208px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={208} minWidth={0} debounce={50}>
                <PieChart>
                  <Pie
                    data={pieDataCategory}
                    cx="50%"
                    cy="48%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieDataCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Faskes`, 'Jumlah']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Sebaran per Kota & Kabupaten (17 Wilayah)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Jumlah fasilitas terpetakan di setiap daerah Sumatera Selatan
            </p>
            <div className="h-[384px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={384} minWidth={0} debounce={50}>
                <BarChart
                  data={barDataByRegion}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={96}
                    tick={{ fontSize: 10, fill: '#334155' }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} Faskes`, 'Terpetakan']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-11.5rem)] min-h-[580px] max-h-[860px] flex flex-col bg-slate-50 border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-3.5 md:px-5 py-2.5 shrink-0 z-20">
        <div className="flex flex-col gap-2.5">
          {/* Row 1: Title + Region Selector + Search + Utility Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-bold text-slate-900 leading-tight truncate">
                  Peta Fasilitas Kesehatan Sumatera Selatan
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  OpenStreetMap · 17 Kota & Kabupaten · RS, Puskesmas, Klinik & Apotek
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto">
              {/* Region Dropdown */}
              <select
                aria-label="Pilih Kota atau Kabupaten Sumatera Selatan"
                value={selectedRegionId}
                onChange={(e) => handleSelectRegion(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 min-w-[180px] flex-1 sm:flex-initial"
              >
                <option value="all-sumsel">
                  Seluruh Sumatera Selatan ({allProvinceFacilities.length})
                </option>
                <optgroup label="Kota Otonom (4)">
                  {SUMSEL_KOTA_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({countByRegion[r.id] || 0})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Kabupaten (13)">
                  {SUMSEL_KABUPATEN_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({countByRegion[r.id] || 0})
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari RS, Puskesmas, Klinik, Apotek..."
                  className="w-full h-9 pl-8 pr-7 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={locateUser}
                disabled={isLocating}
                className={`h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  userLocation
                    ? 'bg-teal-50 border-teal-300 text-teal-800'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{userLocation ? 'GPS Aktif' : 'Lokasi Saya'}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Impor CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Filter Buttons + Map Layer Switcher */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              {QUICK_CATEGORY_CHIPS.map((chip) => {
                const isActive = typeFilter === chip.id;
                const count = categoryCounts[chip.id];
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleToggleCategoryChip(chip.id)}
                    className={`h-8 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      isActive ? chip.activeClass : chip.inactiveClass
                    }`}
                  >
                    <span>{chip.shortLabel}</span>
                    <span className="font-mono tabular-nums opacity-80">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Map Style Segmented Control */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
              {MAP_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMapStyle(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    mapStyle === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Area: Left Collapsible Directory + Full-Bleed Leaflet Map */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobileViewport && (
          <div
            className={`relative bg-white border-r border-slate-200 flex flex-col shrink-0 transition-[width] duration-200 z-10 ${
              isDesktopPanelOpen ? 'w-[370px] xl:w-[400px]' : 'w-0 overflow-hidden border-r-0'
            }`}
          >
            {isDesktopPanelOpen && renderPanelContent()}
          </div>
        )}

        {/* Interactive Leaflet Map Canvas */}
        <div className="flex-1 relative min-w-0 h-full bg-slate-100">
          {/* Desktop Sidebar Collapse Toggle — cleanly anchored to map left edge without overlapping zoom controls */}
          {!isMobileViewport && (
            <button
              type="button"
              onClick={() => setIsDesktopPanelOpen((prev) => !prev)}
              className="absolute top-1/2 -translate-y-1/2 left-0 z-[450] w-7 h-12 bg-white border border-l-0 border-slate-200 shadow-md rounded-r-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              aria-label={isDesktopPanelOpen ? 'Tutup panel daftar faskes' : 'Buka panel daftar faskes'}
            >
              {isDesktopPanelOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <MapContainer
            center={[SUMSEL_REGIONS[0].center.lat, SUMSEL_REGIONS[0].center.lng]}
            zoom={SUMSEL_REGIONS[0].zoom}
            className="w-full h-full z-0"
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              key={activeTileConfig.id}
              url={activeTileConfig.url}
              attribution={activeTileConfig.attribution}
              maxZoom={activeTileConfig.maxZoom}
            />
            {activeTileConfig.overlayUrl && (
              <TileLayer
                key={`${activeTileConfig.id}-labels`}
                url={activeTileConfig.overlayUrl}
                maxZoom={activeTileConfig.maxZoom}
              />
            )}

            <LeafletMapController
              targetCenter={targetCenter}
              targetZoom={targetZoom}
              cameraNonce={cameraNonce}
              routeCoords={routeData?.coordinates || null}
              layoutSignal={isDesktopPanelOpen}
            />

            <MapCoordsHud mapStyleLabel={activeTileConfig.label} />

            {/* User GPS Marker */}
            {userLocation && (
              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={9}
                pathOptions={USER_GPS_PATH_OPTIONS}
              >
                <Popup>
                  <div className="text-xs font-semibold text-slate-900">Lokasi GPS Anda</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Active Driving Route Polyline (OSRM) */}
            {routeData && routeData.coordinates.length >= 2 && (
              <>
                <Polyline
                  positions={routeData.coordinates}
                  pathOptions={ROUTE_SHADOW_PATH_OPTIONS}
                />
                <Polyline
                  positions={routeData.coordinates}
                  pathOptions={
                    routeData.isApproximate ? ROUTE_DASHED_PATH_OPTIONS : ROUTE_SOLID_PATH_OPTIONS
                  }
                />
              </>
            )}

            {/* Healthcare Facility Markers */}
            {filteredFacilities.map((facility) => (
              <FacilityMarkerItem
                key={`${facility.source || 'b'}_${facility.id}`}
                facility={facility}
                isSelected={selectedFacilityId === facility.id}
                originLat={originForExternalNav.lat}
                originLng={originForExternalNav.lng}
                onSelectId={setSelectedFacilityId}
                onComputeRoute={computeRouteToFacility}
                onRegisterRef={registerMarkerRef}
              />
            ))}
          </MapContainer>

          {/* Active Route Summary Overlay */}
          <AnimatePresence>
            {(routeData || isRouting) && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute top-3 right-3 z-[450] max-w-xs bg-white/95 backdrop-blur-xs border border-slate-200 shadow-lg rounded-xl p-3"
              >
                {isRouting ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Menghitung rute jalan tercepat...</span>
                  </div>
                ) : (
                  routeData && (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-teal-700">
                            {routeData.isApproximate ? 'Estimasi Jalur Langsung' : 'Rute Jalan OSRM'}
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                            {routeData.destinationName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Dari: {routeData.originLabel}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRouteData(null)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                          aria-label="Hapus rute"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-xs font-mono tabular-nums">
                        <span className="font-bold text-slate-900">
                          {(routeData.distanceMeters / 1000).toFixed(1)} km
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-teal-700">
                          ~{formatDurationMinutes(routeData.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Jump to RSUD Palembang BARI */}
          <button
            type="button"
            onClick={() => {
              setSelectedRegionId('kota-palembang');
              setTypeFilter('Semua');
              flyToLocation(RSUD_BARI_COORDS.lat, RSUD_BARI_COORDS.lng, 15);
              setSelectedFacilityId(1001);
              setTimeout(() => markerRefs.current[1001]?.openPopup(), 450);
            }}
            className="absolute bottom-4 left-3 z-[450] bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-md rounded-xl px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
            <span>RSUD Palembang BARI</span>
          </button>

          {/* Mobile Layer Switcher */}
          <div className="sm:hidden absolute top-3 right-3 z-[450] flex items-center gap-1 bg-white/95 border border-slate-200 shadow-sm rounded-lg p-1">
            {MAP_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMapStyle(opt.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold ${
                  mapStyle === opt.id ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Drawer */}
        {isMobileViewport && (
          <div
            className={`fixed inset-x-0 bottom-0 z-[500] bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl flex flex-col transition-all duration-200 ${
              mobileDrawerState === 'minimized'
                ? 'h-14'
                : mobileDrawerState === 'half'
                ? 'h-[48vh]'
                : 'h-[82vh]'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setMobileDrawerState((prev) =>
                  prev === 'minimized' ? 'half' : prev === 'half' ? 'expanded' : 'minimized'
                )
              }
              className="w-full px-4 py-3 flex items-center justify-between border-b border-slate-100 shrink-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">
                  {activeRegionObj ? activeRegionObj.shortName : 'Sumsel'} ·{' '}
                  {filteredFacilities.length} Faskes
                </span>
              </div>
              {mobileDrawerState === 'expanded' ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {mobileDrawerState !== 'minimized' && renderPanelContent()}
          </div>
        )}
      </div>

      {/* Admin CSV / Excel Import Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Impor Data Faskes Tambahan</h3>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Tambahkan daftar faskes kustom dalam format CSV atau Excel (.xlsx) untuk melengkapi
                basis data Sumatera Selatan.
              </p>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel (.xlsx)</span>
                </button>

                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    setCsvFile(e.target.files?.[0] || null);
                    setCsvError('');
                  }}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />

                {csvError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {csvError}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {adminFacilities.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteAllFacilities();
                      setAdminFacilities([]);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Hapus Impor ({adminFacilities.length})
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdateData()}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Data</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapFacilities;
