import React, { useEffect, useState, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
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
  Star,
  Globe,
  RefreshCw,
  MapPinned,
  AlertCircle,
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

function getInitialGoogleMapsApiKey(): string {
  const buildKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  if (buildKey.trim()) return buildKey.trim();
  if (typeof window !== 'undefined') {
    const runtimeKey = (window as unknown as { __PIOBARI_MAPS_API_KEY__?: string }).__PIOBARI_MAPS_API_KEY__;
    if (typeof runtimeKey === 'string' && runtimeKey.trim()) {
      return runtimeKey.trim();
    }
  }
  return '';
}

const GMP_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];
const RSUD_BARI_COORDS = { lat: -3.010222, lng: 104.768972 };

type FacilityCategory = 'Hospital' | 'Puskesmas' | 'Clinic' | 'Pharmacy';
type FilterCategory = 'Semua' | FacilityCategory;
type MapStyleKey = 'roadmap' | 'hybrid' | 'terrain';

const ALL_CATEGORIES: FacilityCategory[] = ['Hospital', 'Puskesmas', 'Clinic', 'Pharmacy'];

const CATEGORY_QUERY_CONFIG: Record<
  FacilityCategory,
  {
    label: string;
    shortLabel: string;
    queryPrefix: string;
    includedType?: string;
    colorHex: string;
  }
> = {
  Hospital: {
    label: 'Rumah Sakit (RS)',
    shortLabel: 'RS',
    queryPrefix: 'Rumah Sakit di',
    includedType: 'hospital',
    colorHex: '#ef4444',
  },
  Puskesmas: {
    label: 'Puskesmas',
    shortLabel: 'Puskesmas',
    queryPrefix: 'Puskesmas di',
    colorHex: '#f97316',
  },
  Clinic: {
    label: 'Klinik',
    shortLabel: 'Klinik',
    queryPrefix: 'Klinik Kesehatan di',
    colorHex: '#3b82f6',
  },
  Pharmacy: {
    label: 'Apotek',
    shortLabel: 'Apotek',
    queryPrefix: 'Apotek di',
    includedType: 'pharmacy',
    colorHex: '#10b981',
  },
};

const QUICK_CATEGORY_CHIPS = [
  {
    id: 'Semua' as const,
    shortLabel: 'Semua',
    fullLabel: 'Semua Faskes',
    dot: 'bg-teal-500',
    activeClass: 'bg-slate-900 text-white border-slate-900 shadow-xs',
    inactiveClass: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'Hospital' as const,
    shortLabel: 'RS',
    fullLabel: 'Rumah Sakit (RS)',
    dot: 'bg-red-500',
    activeClass: 'bg-red-600 text-white border-red-600 shadow-xs',
    inactiveClass: 'bg-red-50/60 hover:bg-red-50 text-red-800 border-red-200/80',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-red-100/80 text-red-700',
  },
  {
    id: 'Puskesmas' as const,
    shortLabel: 'Puskesmas',
    fullLabel: 'Puskesmas',
    dot: 'bg-orange-500',
    activeClass: 'bg-orange-500 text-white border-orange-500 shadow-xs',
    inactiveClass: 'bg-orange-50/60 hover:bg-orange-50 text-orange-800 border-orange-200/80',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-orange-100/80 text-orange-700',
  },
  {
    id: 'Clinic' as const,
    shortLabel: 'Klinik',
    fullLabel: 'Klinik',
    dot: 'bg-blue-500',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    inactiveClass: 'bg-blue-50/60 hover:bg-blue-50 text-blue-800 border-blue-200/80',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-blue-100/80 text-blue-700',
  },
  {
    id: 'Pharmacy' as const,
    shortLabel: 'Apotek',
    fullLabel: 'Apotek',
    dot: 'bg-emerald-500',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    inactiveClass: 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-emerald-100/80 text-emerald-700',
  },
];

const MAP_STYLE_OPTIONS: { id: MapStyleKey; label: string }[] = [
  { id: 'roadmap', label: 'Peta Jalan' },
  { id: 'hybrid', label: 'Satelit' },
  { id: 'terrain', label: 'Medan' },
];

// Deterministic numeric hash from Google Place ID so Facility.id stays compatible with numeric IDs
function hashPlaceIdToNumber(placeId: string): number {
  let hash = 5381;
  for (let i = 0; i < placeId.length; i++) {
    hash = ((hash << 5) + hash + placeId.charCodeAt(i)) >>> 0;
  }
  return 100000 + (hash % 900000000);
}

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

// Tier 2 Quota Error Detector (avoids false positives on empty results or generic network issues)
function isGoogleMapsQuotaError(err: unknown): boolean {
  if (!err) return false;
  const status = (err as { status?: number | string; code?: number | string })?.status;
  const code = (err as { code?: number | string })?.code;
  const message = String(
    (err as { message?: string })?.message || err
  ).toUpperCase();

  return (
    status === 429 ||
    code === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'OVER_QUERY_LIMIT' ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('OVER_QUERY_LIMIT') ||
    message.includes('QUOTA')
  );
}

function classifyPlaceCategory(
  name: string,
  types: string[] | undefined,
  fallback: FacilityCategory
): FacilityCategory {
  const lower = name.toLowerCase();
  const typeSet = types || [];

  if (lower.includes('puskesmas') || lower.includes('pusat kesehatan masyarakat') || lower.includes('pustu')) {
    return 'Puskesmas';
  }
  if (lower.includes('apotek') || lower.includes('apotik') || lower.includes('kimia farma') || lower.includes('k-24') || typeSet.includes('pharmacy')) {
    return 'Pharmacy';
  }
  if (
    lower.includes('rumah sakit') ||
    /\brs\b/.test(lower) ||
    /\brsud\b/.test(lower) ||
    /\brsup\b/.test(lower) ||
    /\brsia\b/.test(lower) ||
    /\brsu\b/.test(lower) ||
    lower.includes('hospital')
  ) {
    return 'Hospital';
  }
  if (lower.includes('klinik') || lower.includes('clinic') || lower.includes('balai pengobatan')) {
    return 'Clinic';
  }
  if (typeSet.includes('hospital')) return 'Hospital';
  if (typeSet.includes('pharmacy')) return 'Pharmacy';
  if (typeSet.includes('medical_clinic') || typeSet.includes('doctor')) return 'Clinic';

  return fallback;
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'Hospital':
      return { label: 'Rumah Sakit', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
    case 'Puskesmas':
      return { label: 'Puskesmas', dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' };
    case 'Clinic':
      return { label: 'Klinik', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
    case 'Pharmacy':
      return { label: 'Apotek', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    default:
      return { label: type, dot: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50' };
  }
}

interface FacilityPinProps {
  facility: Facility & { distanceKm: number };
  isSelected: boolean;
  onClick: () => void;
}

const FacilityMarkerPin: React.FC<FacilityPinProps> = React.memo(({ facility, isSelected, onClick }) => {
  const isRSUDBari = (facility.name || '').toUpperCase().includes('PALEMBANG BARI');
  const bgColor = isRSUDBari
    ? '#e11d48'
    : facility.type === 'Hospital'
    ? '#ef4444'
    : facility.type === 'Puskesmas'
    ? '#f97316'
    : facility.type === 'Clinic'
    ? '#3b82f6'
    : '#10b981';

  const size = isRSUDBari ? 38 : isSelected ? 36 : 30;
  const borderRadius = isRSUDBari || facility.type === 'Hospital' ? '10px' : '9999px';

  return (
    <AdvancedMarker
      position={{ lat: facility.lat, lng: facility.lng }}
      title={facility.name}
      zIndex={isRSUDBari ? 1000 : isSelected ? 800 : 100}
      onClick={onClick}
    >
      <div
        className="flex items-center justify-center transition-transform duration-150 cursor-pointer"
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: bgColor,
          border: isSelected ? '3px solid #0f172a' : '2.5px solid #ffffff',
          boxShadow: isSelected
            ? '0 0 0 4px rgba(13, 148, 136, 0.35), 0 6px 14px rgba(15, 23, 42, 0.35)'
            : '0 4px 10px rgba(15, 23, 42, 0.28)',
          transform: isSelected ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        {facility.type === 'Hospital' || isRSUDBari ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        ) : facility.type === 'Puskesmas' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v16" />
            <path d="M4 12h16" />
          </svg>
        ) : facility.type === 'Clinic' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        )}
      </div>
    </AdvancedMarker>
  );
});

interface MapCameraControllerProps {
  targetCenter: { lat: number; lng: number } | null;
  targetZoom: number;
  cameraNonce: number;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({
  targetCenter,
  targetZoom,
  cameraNonce,
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !targetCenter) return;
    map.panTo(targetCenter);
    map.setZoom(targetZoom);
  }, [map, targetCenter, targetZoom, cameraNonce]);
  return null;
};

interface MapCoordsHudProps {
  mapStyleLabel: string;
}

const MapCoordsHud: React.FC<MapCoordsHudProps> = ({ mapStyleLabel }) => {
  const map = useMap();
  const [coords, setCoords] = useState({ lat: -2.9761, lng: 104.7754, zoom: 12 });

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('idle', () => {
      const c = map.getCenter();
      const z = map.getZoom();
      if (c) {
        setCoords({ lat: c.lat(), lng: c.lng(), zoom: z ?? 12 });
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  return (
    <div className="hidden md:flex absolute bottom-3 right-14 z-20 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-md items-center gap-2.5 text-[11px] font-mono tabular-nums pointer-events-none">
      <span>Lat: {coords.lat.toFixed(5)}</span>
      <span className="text-slate-500">·</span>
      <span>Lng: {coords.lng.toFixed(5)}</span>
      <span className="text-slate-500">·</span>
      <span className="text-teal-300 font-sans font-semibold text-[10px]">
        Google Maps · {mapStyleLabel} ({coords.zoom}x)
      </span>
    </div>
  );
};

interface SumselMapInnerProps {
  isAdmin: boolean;
}

const SumselMapInner: React.FC<SumselMapInnerProps> = ({ isAdmin }) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  // Selected Sumatera Selatan administrative region ('all-loaded' or one of 17 region IDs)
  const [selectedRegionId, setSelectedRegionId] = useState<string>('kota-palembang');
  const [typeFilter, setTypeFilter] = useState<FilterCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('distance');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('roadmap');
  const [panelTab, setPanelTab] = useState<'list' | 'regions' | 'stats'>('list');
  const [isDesktopPanelOpen, setIsDesktopPanelOpen] = useState(true);
  const [mobileDrawerState, setMobileDrawerState] = useState<'minimized' | 'half' | 'expanded'>('half');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // In-memory session cache of live Google Maps Places results keyed by `${regionId}:${category}`
  // (No persistent scraping/storage of Google Maps data; compliant with GMP ToS)
  const [googlePlacesCache, setGooglePlacesCache] = useState<Record<string, Facility[]>>({});
  // Custom keyword search results from Google Maps Places API (New)
  const [customSearchResults, setCustomSearchResults] = useState<Facility[]>([]);
  const [activeCustomSearchLabel, setActiveCustomSearchLabel] = useState<string>('');
  // On-demand Place Details cache (phone, opening hours, website) keyed by placeId
  const [placeDetailsCache, setPlaceDetailsCache] = useState<
    Record<string, { contact?: string; openingHours?: string[]; websiteUri?: string }>
  >({});
  const [loadingDetailsPlaceId, setLoadingDetailsPlaceId] = useState<string | null>(null);

  // Admin-imported custom institutional facilities (optional supplement)
  const [adminFacilities, setAdminFacilities] = useState<Facility[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState('');

  // Loading & feedback states
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [fetchStatusText, setFetchStatusText] = useState('');
  const [fetchError, setFetchError] = useState('');
  const inFlightKeysRef = useRef<Record<string, boolean>>({});

  // Camera state
  const [targetCenter, setTargetCenter] = useState<{ lat: number; lng: number } | null>(
    SUMSEL_REGIONS[0].center
  );
  const [targetZoom, setTargetZoom] = useState<number>(SUMSEL_REGIONS[0].zoom);
  const [cameraNonce, setCameraNonce] = useState(0);

  // Selected facility & InfoWindow state
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [infoWindowFacilityId, setInfoWindowFacilityId] = useState<number | null>(null);
  const [copiedCoordsId, setCopiedCoordsId] = useState<number | null>(null);

  // Explicit, revocable GPS & Routes API states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distanceMeters: number;
    durationMillis: number;
    destinationName: string;
    originLabel: string;
  } | null>(null);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    setIsMobileViewport(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Cleanup route polylines on unmount
  useEffect(() => {
    return () => {
      routePolylinesRef.current.forEach((p) => p.setMap(null));
      routePolylinesRef.current = [];
    };
  }, []);

  // Optionally load admin-uploaded custom facilities from Firestore (non-blocking)
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

  // Fetch a single category for a specific Kota/Kabupaten via Google Maps Places API (New)
  const fetchRegionCategoriesFromGoogleMaps = useCallback(
    async (region: SumselRegion, categories: FacilityCategory[], forceRefresh = false) => {
      if (!placesLib) return;

      const missingCategories = categories.filter((cat) => {
        const cacheKey = `${region.id}:${cat}`;
        if (!forceRefresh && googlePlacesCache[cacheKey]) return false;
        if (inFlightKeysRef.current[cacheKey]) return false;
        return true;
      });

      if (missingCategories.length === 0) return;

      missingCategories.forEach((cat) => {
        inFlightKeysRef.current[`${region.id}:${cat}`] = true;
      });

      setIsFetchingPlaces(true);
      setFetchError('');
      setFetchStatusText(
        `Mengambil data ${missingCategories.map((c) => CATEGORY_QUERY_CONFIG[c].shortLabel).join(', ')} di ${region.name} dari Google Maps...`
      );

      const bounds = getRegionBoundsLiteral(region);
      const updates: Record<string, Facility[]> = {};
      let encounteredError = '';

      await Promise.all(
        missingCategories.map(async (cat) => {
          const cfg = CATEGORY_QUERY_CONFIG[cat];
          const cacheKey = `${region.id}:${cat}`;
          try {
            const request: google.maps.places.SearchByTextRequest & {
              internalUsageAttributionIds?: string[];
            } = {
              textQuery: `${cfg.queryPrefix} ${region.searchLabel}`,
              fields: [
                'id',
                'displayName',
                'formattedAddress',
                'location',
                'businessStatus',
                'googleMapsURI',
                'rating',
                'userRatingCount',
                'types',
              ],
              locationBias: bounds,
              language: 'id',
              region: 'ID',
              maxResultCount: 20,
              ...(cfg.includedType
                ? { includedType: cfg.includedType, useStrictTypeFiltering: false }
                : {}),
              internalUsageAttributionIds: GMP_ATTRIBUTION_IDS,
            };

            const { places } = await placesLib.Place.searchByText(request);
            const mapped: Facility[] = (places || [])
              .filter((p) => p && p.location && p.displayName)
              .map((p) => {
                const lat = typeof p.location!.lat === 'function' ? p.location!.lat() : Number(p.location!.lat);
                const lng = typeof p.location!.lng === 'function' ? p.location!.lng() : Number(p.location!.lng);
                const placeId = p.id || `${region.id}_${cat}_${lat}_${lng}`;
                const displayName = p.displayName || 'Fasilitas Kesehatan';
                const detectedType = classifyPlaceCategory(displayName, p.types, cat);
                return {
                  id: hashPlaceIdToNumber(placeId),
                  placeId,
                  name: displayName,
                  type: detectedType,
                  address: p.formattedAddress || region.searchLabel,
                  lat,
                  lng,
                  city: region.name,
                  regionId: region.id,
                  rating: typeof p.rating === 'number' ? p.rating : undefined,
                  userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
                  businessStatus: p.businessStatus || undefined,
                  googleMapsUri: p.googleMapsURI || undefined,
                  source: 'google_maps',
                };
              });

            updates[cacheKey] = mapped;
          } catch (err) {
            if (isGoogleMapsQuotaError(err)) {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
              encounteredError =
                'Batas kuota Google Maps Platform tercapai untuk saat ini. Data wilayah yang sudah dimuat tetap dapat dilihat.';
            } else {
              console.warn(`Places searchByText failed for ${region.name} (${cat}):`, err);
              encounteredError = `Sebagian data Google Maps di ${region.name} gagal dimuat. Silakan coba muat ulang.`;
            }
          } finally {
            delete inFlightKeysRef.current[cacheKey];
          }
        })
      );

      if (Object.keys(updates).length > 0) {
        setGooglePlacesCache((prev) => ({ ...prev, ...updates }));
      }
      if (encounteredError) {
        setFetchError(encounteredError);
      }
      setIsFetchingPlaces(false);
      setFetchStatusText('');
    },
    [placesLib, googlePlacesCache]
  );

  // Automatically fetch live Google Maps Places for the selected Sumatera Selatan region & active category
  useEffect(() => {
    if (!placesLib) return;
    if (selectedRegionId === 'all-loaded') return;
    const region = getSumselRegionById(selectedRegionId);
    if (!region) return;

    const categoriesToLoad: FacilityCategory[] =
      typeFilter === 'Semua' ? ALL_CATEGORIES : [typeFilter];

    fetchRegionCategoriesFromGoogleMaps(region, categoriesToLoad, false);
  }, [placesLib, selectedRegionId, typeFilter, fetchRegionCategoriesFromGoogleMaps]);

  // Live Google Maps keyword search scoped to active Kota/Kabupaten or seluruh Sumatera Selatan
  const handleLiveGoogleMapsSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !placesLib) return;

    const activeRegion =
      selectedRegionId !== 'all-loaded' ? getSumselRegionById(selectedRegionId) : undefined;
    const scopeLabel = activeRegion ? activeRegion.searchLabel : 'Sumatera Selatan';
    const typeHint =
      typeFilter !== 'Semua' ? `${CATEGORY_QUERY_CONFIG[typeFilter].shortLabel} ` : '';

    setIsFetchingPlaces(true);
    setFetchError('');
    setFetchStatusText(`Mencari "${trimmed}" di ${scopeLabel} melalui Google Maps...`);

    try {
      const request: google.maps.places.SearchByTextRequest & {
        internalUsageAttributionIds?: string[];
      } = {
        textQuery: `${typeHint}${trimmed} ${scopeLabel}`,
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'location',
          'businessStatus',
          'googleMapsURI',
          'rating',
          'userRatingCount',
          'types',
        ],
        locationBias: activeRegion
          ? getRegionBoundsLiteral(activeRegion)
          : { north: -1.6, south: -4.95, east: 106.2, west: 102.05 },
        language: 'id',
        region: 'ID',
        maxResultCount: 20,
        internalUsageAttributionIds: GMP_ATTRIBUTION_IDS,
      };

      const { places } = await placesLib.Place.searchByText(request);
      const fallbackCat: FacilityCategory = typeFilter === 'Semua' ? 'Hospital' : typeFilter;

      const mapped: Facility[] = (places || [])
        .filter((p) => p && p.location && p.displayName)
        .map((p) => {
          const lat = typeof p.location!.lat === 'function' ? p.location!.lat() : Number(p.location!.lat);
          const lng = typeof p.location!.lng === 'function' ? p.location!.lng() : Number(p.location!.lng);
          const placeId = p.id || `search_${lat}_${lng}`;
          const displayName = p.displayName || trimmed;
          const address = p.formattedAddress || scopeLabel;
          // Try inferring region from formattedAddress if searching province-wide
          const matchedRegion =
            activeRegion ||
            SUMSEL_REGIONS.find(
              (r) =>
                address.toLowerCase().includes(r.shortName.toLowerCase()) ||
                address.toLowerCase().includes(r.capital.toLowerCase())
            );

          return {
            id: hashPlaceIdToNumber(placeId),
            placeId,
            name: displayName,
            type: classifyPlaceCategory(displayName, p.types, fallbackCat),
            address,
            lat,
            lng,
            city: matchedRegion?.name || 'Sumatera Selatan',
            regionId: matchedRegion?.id,
            rating: typeof p.rating === 'number' ? p.rating : undefined,
            userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
            businessStatus: p.businessStatus || undefined,
            googleMapsUri: p.googleMapsURI || undefined,
            source: 'google_maps',
          };
        });

      setCustomSearchResults(mapped);
      setActiveCustomSearchLabel(`Hasil Google Maps: "${trimmed}" (${mapped.length})`);

      if (mapped.length > 0) {
        flyToLocation(mapped[0].lat, mapped[0].lng, 13);
        setSelectedFacilityId(mapped[0].id);
        setInfoWindowFacilityId(mapped[0].id);
      }
    } catch (err) {
      if (isGoogleMapsQuotaError(err)) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        setFetchError('Batas kuota pencarian Google Maps tercapai.');
      } else {
        setFetchError('Gagal melakukan pencarian langsung di Google Maps. Periksa koneksi Anda.');
      }
    } finally {
      setIsFetchingPlaces(false);
      setFetchStatusText('');
    }
  }, [searchQuery, placesLib, selectedRegionId, typeFilter, flyToLocation]);

  // On-demand Place Details (phone, opening hours, website) when user inspects a specific place
  const loadOnDemandPlaceDetails = useCallback(
    async (facility: Facility) => {
      if (!placesLib || !facility.placeId) return;
      if (placeDetailsCache[facility.placeId]) return;

      setLoadingDetailsPlaceId(facility.placeId);
      try {
        const place = new placesLib.Place({ id: facility.placeId });
        await place.fetchFields({
          fields: ['nationalPhoneNumber', 'regularOpeningHours', 'websiteURI'],
        });
        const details = {
          contact: place.nationalPhoneNumber || undefined,
          openingHours: place.regularOpeningHours?.weekdayDescriptions || undefined,
          websiteUri: place.websiteURI || undefined,
        };
        setPlaceDetailsCache((prev) => ({
          ...prev,
          [facility.placeId!]: details,
        }));
      } catch (err) {
        if (isGoogleMapsQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      } finally {
        setLoadingDetailsPlaceId(null);
      }
    },
    [placesLib, placeDetailsCache]
  );

  // Select region handler: pans map smoothly to chosen Kota/Kabupaten
  const handleSelectRegion = useCallback(
    (regionId: string) => {
      setSelectedRegionId(regionId);
      setCustomSearchResults([]);
      setActiveCustomSearchLabel('');
      setSelectedFacilityId(null);
      setInfoWindowFacilityId(null);

      if (regionId === 'all-loaded') {
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

  // Deduplicated pool of facilities for the currently selected region (or all loaded regions)
  const regionFacilities = useMemo(() => {
    const dedupRecord: Record<string, Facility> = {};

    const addItem = (item: Facility) => {
      const key = item.placeId || `id_${item.id}`;
      const detail = item.placeId ? placeDetailsCache[item.placeId] : undefined;
      dedupRecord[key] = detail
        ? {
            ...item,
            contact: detail.contact || item.contact,
            openingHours: detail.openingHours || item.openingHours,
            websiteUri: detail.websiteUri || item.websiteUri,
          }
        : item;
    };

    if (customSearchResults.length > 0 && activeCustomSearchLabel) {
      customSearchResults.forEach(addItem);
    } else {
      Object.entries(googlePlacesCache).forEach(([cacheKey, list]) => {
        const regionIdFromKey = cacheKey.split(':')[0];
        if (selectedRegionId === 'all-loaded' || regionIdFromKey === selectedRegionId) {
          list.forEach(addItem);
        }
      });

      // Also include any admin-uploaded custom facilities matching selected region
      adminFacilities.forEach((f) => {
        if (
          selectedRegionId === 'all-loaded' ||
          f.regionId === selectedRegionId ||
          (f.city &&
            getSumselRegionById(selectedRegionId)?.shortName &&
            f.city.toLowerCase().includes(getSumselRegionById(selectedRegionId)!.shortName.toLowerCase()))
        ) {
          addItem(f);
        }
      });
    }

    return Object.values(dedupRecord);
  }, [
    googlePlacesCache,
    customSearchResults,
    activeCustomSearchLabel,
    selectedRegionId,
    placeDetailsCache,
    adminFacilities,
  ]);

  // All facilities loaded across the entire province so far (for regional breakdown & badges)
  const allLoadedProvinceFacilities = useMemo(() => {
    const dedup: Record<string, Facility> = {};
    Object.values(googlePlacesCache).forEach((list) => {
      list.forEach((f) => {
        dedup[f.placeId || `id_${f.id}`] = f;
      });
    });
    return Object.values(dedup);
  }, [googlePlacesCache]);

  const loadedCountByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    const seenByRegion: Record<string, Record<string, boolean>> = {};
    Object.entries(googlePlacesCache).forEach(([cacheKey, list]) => {
      const regionId = cacheKey.split(':')[0];
      if (!seenByRegion[regionId]) seenByRegion[regionId] = {};
      list.forEach((f) => {
        seenByRegion[regionId][f.placeId || String(f.id)] = true;
      });
    });
    Object.entries(seenByRegion).forEach(([rId, idMap]) => {
      counts[rId] = Object.keys(idMap).length;
    });
    return counts;
  }, [googlePlacesCache]);

  const activeRegionObj = useMemo(
    () => (selectedRegionId === 'all-loaded' ? null : getSumselRegionById(selectedRegionId) || null),
    [selectedRegionId]
  );

  const referenceCoords = useMemo(() => {
    if (userLocation) return userLocation;
    if (activeRegionObj) return activeRegionObj.center;
    return RSUD_BARI_COORDS;
  }, [userLocation, activeRegionObj]);

  // Local text filter on top of loaded Google Maps places
  const searchFilteredFacilities = useMemo(() => {
    const q = (deferredSearchQuery || '').trim().toLowerCase();
    if (!q || activeCustomSearchLabel) return regionFacilities;
    return regionFacilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        (f.city || '').toLowerCase().includes(q)
    );
  }, [regionFacilities, deferredSearchQuery, activeCustomSearchLabel]);

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
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.distanceKm - b.distanceKm;
    });
  }, [searchFilteredFacilities, typeFilter, referenceCoords, sortBy]);

  const selectedFacility = useMemo(() => {
    if (selectedFacilityId === null) return null;
    const found = filteredFacilities.find((f) => f.id === selectedFacilityId);
    if (found) return found;
    const fallback = regionFacilities.find((f) => f.id === selectedFacilityId);
    if (!fallback) return null;
    return {
      ...fallback,
      distanceKm: calculateDistanceKm(
        referenceCoords.lat,
        referenceCoords.lng,
        fallback.lat,
        fallback.lng
      ),
    };
  }, [filteredFacilities, regionFacilities, selectedFacilityId, referenceCoords]);

  const infoWindowFacility = useMemo(() => {
    if (infoWindowFacilityId === null) return null;
    return filteredFacilities.find((f) => f.id === infoWindowFacilityId) || null;
  }, [filteredFacilities, infoWindowFacilityId]);

  // Charts Data
  const pieDataCategory = useMemo(
    () =>
      [
        { name: 'Rumah Sakit', value: categoryCounts.Hospital, color: '#ef4444' },
        { name: 'Puskesmas', value: categoryCounts.Puskesmas, color: '#f97316' },
        { name: 'Klinik', value: categoryCounts.Clinic, color: '#3b82f6' },
        { name: 'Apotek', value: categoryCounts.Pharmacy, color: '#10b981' },
      ].filter((d) => d.value > 0),
    [categoryCounts]
  );

  const barDataByRegion = useMemo(() => {
    return SUMSEL_REGIONS.map((r) => ({
      name: r.shortName,
      value: loadedCountByRegion[r.id] || 0,
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [loadedCountByRegion]);

  // Explicit, user-initiated GPS detection (revocable consent)
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
          flyToLocation(coords.lat, coords.lng, 15);
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

  const clearRoute = useCallback(() => {
    routePolylinesRef.current.forEach((p) => p.setMap(null));
    routePolylinesRef.current = [];
    setRouteInfo(null);
    setRoutingError('');
  }, []);

  // Modern Google Maps Routes API (`Route.computeRoutes`) via `useMapsLibrary('routes')`
  const computeRouteToFacility = useCallback(
    async (destination: { lat: number; lng: number }, facilityName: string) => {
      if (!routesLib || !map) {
        setRoutingError('Layanan rute Google Maps sedang dimuat. Silakan coba sesaat lagi.');
        return;
      }

      const origin = userLocation || RSUD_BARI_COORDS;
      const originLabel = userLocation ? 'Lokasi GPS Anda' : 'RSUD Palembang BARI';

      clearRoute();
      setIsRouting(true);

      try {
        const request = {
          origin,
          destination,
          travelMode: 'DRIVING',
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
        };

        const response = await (routesLib.Route as any).computeRoutes(request);
        const routes = response?.routes;

        if (!routes || routes.length === 0) {
          setRoutingError('Rute jalan tidak ditemukan menuju faskes ini.');
          return;
        }

        const primaryRoute = routes[0];
        const polylines: google.maps.Polyline[] = primaryRoute.createPolylines();
        polylines.forEach((poly) => {
          poly.setOptions({
            strokeColor: '#0d9488',
            strokeWeight: 6,
            strokeOpacity: 0.9,
          });
          poly.setMap(map);
        });
        routePolylinesRef.current = polylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport);
        }

        setRouteInfo({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
          destinationName: facilityName,
          originLabel,
        });
      } catch (err) {
        if (isGoogleMapsQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setRoutingError('Kuota Routes API Google Maps tercapai. Gunakan tombol "Google Maps" untuk navigasi eksternal.');
        } else {
          console.error('Error computing Google Maps route:', err);
          setRoutingError('Gagal menghitung rute melalui Google Maps Routes API.');
        }
      } finally {
        setIsRouting(false);
      }
    },
    [routesLib, map, userLocation, clearRoute]
  );

  const handleSelectFacility = useCallback(
    (facility: Facility & { distanceKm: number }, shouldFly = true) => {
      setSelectedFacilityId(facility.id);
      setInfoWindowFacilityId(facility.id);
      setPanelTab('list');
      setIsDesktopPanelOpen(true);
      setMobileDrawerState((prev) => (prev === 'minimized' ? 'half' : prev));
      if (shouldFly) {
        flyToLocation(facility.lat, facility.lng, 16);
      }
      if (facility.placeId) {
        void loadOnDemandPlaceDetails(facility);
      }
    },
    [flyToLocation, loadOnDemandPlaceDetails]
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
  const handleDownloadTemplate = () => {
    const template = [
      {
        id: 101,
        name: 'Contoh RS Daerah',
        type: 'Hospital',
        address: 'Jl. Contoh No. 1, Palembang, Sumatera Selatan',
        lat: -2.9761,
        lng: 104.7754,
        contact: '0711-000000',
        city: 'Kota Palembang',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Faskes_Sumsel');
    XLSX.writeFile(wb, 'Template_Faskes_Sumsel.xlsx');
  };

  const validateAndSetAdminData = async (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      const newData: Facility[] = parsed.map((item) => ({ ...item, source: 'admin', locked: false }));
      setAdminFacilities((prev) => {
        const filtered = prev.filter((p) => !newData.some((n) => n.id === p.id));
        return [...filtered, ...newData];
      });
      setIsUpdateModalOpen(false);
      setCsvError('');
      setCsvFile(null);
      await saveFacilitiesToDb(newData);
    } else {
      setCsvError('Format file tidak valid. Pastikan baris pertama berisi kolom id, name, type, address, lat, lng.');
    }
  };

  const handleUpdateData = async () => {
    if (!csvFile) {
      setCsvError('Silakan pilih file CSV/Excel terlebih dahulu.');
      return;
    }
    const fileExt = csvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => void validateAndSetAdminData(results.data),
        error: (error) => setCsvError('Gagal membaca file CSV: ' + error.message),
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
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

  const currentMapStyleLabel =
    MAP_STYLE_OPTIONS.find((s) => s.id === mapStyle)?.label || 'Peta Jalan';

  const loadedRegionsCount = Object.keys(loadedCountByRegion).length;

  const renderPanelContent = () => (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Sub-navigation Tabs */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-slate-200/80 bg-white/90 shrink-0 flex flex-col gap-2">
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl w-full gap-0.5">
          <button
            type="button"
            onClick={() => setPanelTab('list')}
            className={`min-h-[34px] px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
              panelTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Faskes ({filteredFacilities.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('regions')}
            className={`min-h-[34px] px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
              panelTab === 'regions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPinned className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>17 Wilayah</span>
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('stats')}
            className={`min-h-[34px] px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
              panelTab === 'stats'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Statistik</span>
          </button>
        </div>

        {/* Active Region Banner inside panel */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-teal-50/80 border border-teal-200/70 rounded-xl">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block leading-none">
              Wilayah Aktif · Google Maps Live
            </span>
            <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5">
              {activeRegionObj
                ? `${activeRegionObj.name} (${activeRegionObj.capital})`
                : `Sumatera Selatan (${loadedRegionsCount}/17 Wilayah Dimuat)`}
            </span>
          </div>
          {activeRegionObj && (
            <button
              type="button"
              onClick={() =>
                fetchRegionCategoriesFromGoogleMaps(
                  activeRegionObj,
                  typeFilter === 'Semua' ? ALL_CATEGORIES : [typeFilter],
                  true
                )
              }
              disabled={isFetchingPlaces}
              className="p-1.5 rounded-lg bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title={`Muat ulang data Google Maps untuk ${activeRegionObj.name}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPlaces ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {panelTab === 'list' ? (
          <motion.div
            key="panel-list"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Sort & Reference Bar */}
            <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
              <span className="truncate">
                Acuan:{' '}
                <strong className="text-slate-700">
                  {userLocation ? 'GPS Anda' : activeRegionObj ? activeRegionObj.shortName : 'RSUD BARI'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  setSortBy((prev) =>
                    prev === 'distance' ? 'rating' : prev === 'rating' ? 'name' : 'distance'
                  )
                }
                className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-800 bg-teal-50/80 hover:bg-teal-100/80 px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>
                  {sortBy === 'distance' ? 'Terdekat' : sortBy === 'rating' ? 'Rating Tertinggi' : 'Abjad A-Z'}
                </span>
              </button>
            </div>

            {activeCustomSearchLabel && (
              <div className="px-3.5 py-2 bg-indigo-50 border-b border-indigo-200/70 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold text-indigo-900 truncate">{activeCustomSearchLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomSearchResults([]);
                    setActiveCustomSearchLabel('');
                    setSearchQuery('');
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-bold underline shrink-0 cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            )}

            {/* Selected Facility Detail Card */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {selectedFacility && (
                <div className="p-3.5 bg-gradient-to-b from-teal-50/70 via-white to-white border-b-2 border-teal-500/30 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(() => {
                          const tm = getTypeLabel(selectedFacility.type);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${tm.bg} ${tm.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${tm.dot}`} />
                              {tm.label}
                            </span>
                          );
                        })()}
                        {selectedFacility.city && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {selectedFacility.city}
                          </span>
                        )}
                        {selectedFacility.rating !== undefined && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            {selectedFacility.rating.toFixed(1)}
                            {selectedFacility.userRatingCount ? ` (${selectedFacility.userRatingCount})` : ''}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {selectedFacility.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFacilityId(null);
                        setInfoWindowFacilityId(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                      title="Tutup detail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 space-y-2 text-[11px]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-relaxed">{selectedFacility.address}</span>
                    </div>

                    {loadingDetailsPlaceId === selectedFacility.placeId && (
                      <div className="flex items-center gap-1.5 text-teal-700 font-semibold pt-1 border-t border-slate-100">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Memuat nomor telepon & jam buka dari Google Maps...</span>
                      </div>
                    )}

                    {selectedFacility.contact && (
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-800 font-mono font-bold">
                          <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{selectedFacility.contact}</span>
                        </div>
                        <a
                          href={`tel:${selectedFacility.contact.replace(/[^0-9+]/g, '')}`}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                        >
                          Hubungi
                        </a>
                      </div>
                    )}

                    {selectedFacility.openingHours && selectedFacility.openingHours.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>Jam Operasional (Google Maps)</span>
                        </div>
                        <div className="pl-5 space-y-0.5 text-[10px] text-slate-600">
                          {selectedFacility.openingHours.slice(0, 3).map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                      <span className="font-mono tabular-nums text-[10px] text-slate-500">
                        {selectedFacility.lat.toFixed(6)}, {selectedFacility.lng.toFixed(6)} ·{' '}
                        <strong className="text-teal-700">
                          {selectedFacility.distanceKm < 1
                            ? `${Math.round(selectedFacility.distanceKm * 1000)} m`
                            : `${selectedFacility.distanceKm.toFixed(1)} km`}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCoords(selectedFacility.lat, selectedFacility.lng, selectedFacility.id)
                        }
                        className="text-teal-600 hover:text-teal-700 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCoordsId === selectedFacility.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedCoordsId === selectedFacility.id ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        computeRouteToFacility(
                          { lat: selectedFacility.lat, lng: selectedFacility.lng },
                          selectedFacility.name
                        )
                      }
                      disabled={isRouting}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isRouting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5" />
                      )}
                      <span>Rute Navigasi</span>
                    </button>
                    <a
                      href={
                        selectedFacility.googleMapsUri ||
                        `https://www.google.com/maps/search/?api=1&query=${selectedFacility.lat},${selectedFacility.lng}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                    </a>
                  </div>

                  {selectedFacility.websiteUri && (
                    <a
                      href={selectedFacility.websiteUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>Kunjungi Situs Resmi Faskes</span>
                    </a>
                  )}
                </div>
              )}

              {isFetchingPlaces && filteredFacilities.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    {fetchStatusText || 'Mengambil data faskes dari Google Maps...'}
                  </p>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Belum Ada Faskes Tampil</p>
                    <p className="text-[11px] text-slate-500">
                      Pilih Kota/Kabupaten di Sumatera Selatan atau tekan tombol Cari di Google Maps.
                    </p>
                  </div>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => void handleLiveGoogleMapsSearch()}
                      className="px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      Cari "{searchQuery.trim()}" di Google Maps
                    </button>
                  )}
                </div>
              ) : (
                filteredFacilities.map((facility) => {
                  const isSelected = selectedFacilityId === facility.id;
                  const typeMeta = getTypeLabel(facility.type);

                  return (
                    <div
                      key={`${facility.placeId || facility.id}`}
                      onClick={() => handleSelectFacility(facility, true)}
                      className={`p-3.5 transition-all cursor-pointer hover:bg-slate-50/90 ${
                        isSelected ? 'bg-teal-50/60 ring-1 ring-inset ring-teal-500/30' : 'bg-white/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mb-0.5 flex-wrap">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${typeMeta.dot}`} />
                            <span className="font-bold text-slate-700">{typeMeta.label}</span>
                            {facility.city && (
                              <>
                                <span>·</span>
                                <span className="text-slate-600">{facility.city}</span>
                              </>
                            )}
                            {facility.rating !== undefined && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  {facility.rating.toFixed(1)}
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold leading-snug text-slate-900 truncate">
                            {facility.name}
                          </h4>
                        </div>

                        <span className="inline-block font-mono tabular-nums text-[11px] font-bold text-teal-700 bg-teal-50/90 px-2 py-0.5 rounded-md border border-teal-200/60 shrink-0">
                          {facility.distanceKm < 1
                            ? `${Math.round(facility.distanceKm * 1000)} m`
                            : `${facility.distanceKm.toFixed(1)} km`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {facility.address}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
                        <span className="text-[10px] font-mono tabular-nums text-slate-400">
                          {facility.lat.toFixed(5)}, {facility.lng.toFixed(5)}
                        </span>
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectFacility(facility, false);
                              void computeRouteToFacility(
                                { lat: facility.lat, lng: facility.lng },
                                facility.name
                              );
                            }}
                            disabled={isRouting}
                            className="min-h-[30px] px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Rute</span>
                          </button>
                          <a
                            href={
                              facility.googleMapsUri ||
                              `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[30px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
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
        ) : panelTab === 'regions' ? (
          /* 17 Kota & Kabupaten Sumatera Selatan Directory Tab */
          <motion.div
            key="panel-regions"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-4"
          >
            <button
              type="button"
              onClick={() => {
                handleSelectRegion('all-loaded');
                setPanelTab('list');
              }}
              className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedRegionId === 'all-loaded'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div>
                <div className="text-xs font-extrabold">Semua Wilayah Sumsel (Terkumpul)</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    selectedRegionId === 'all-loaded' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {loadedRegionsCount} dari 17 Kota/Kabupaten telah dimuat dari Google Maps
                </div>
              </div>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-600">
                {allLoadedProvinceFacilities.length}
              </span>
            </button>

            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                Kota Otonom (4 Kota)
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {SUMSEL_KOTA_REGIONS.map((region) => {
                  const count = loadedCountByRegion[region.id] || 0;
                  const isActive = selectedRegionId === region.id;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => {
                        handleSelectRegion(region.id);
                        setPanelTab('list');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                          : 'bg-white hover:bg-teal-50/60 text-slate-800 border-slate-200/90'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{region.name}</div>
                        <div
                          className={`text-[10px] ${
                            isActive ? 'text-teal-100' : 'text-slate-500'
                          }`}
                        >
                          RS · Puskesmas · Klinik · Apotek
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : count > 0
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count > 0 ? `${count} faskes` : 'Muat Live'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                Kabupaten (13 Kabupaten)
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {SUMSEL_KABUPATEN_REGIONS.map((region) => {
                  const count = loadedCountByRegion[region.id] || 0;
                  const isActive = selectedRegionId === region.id;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => {
                        handleSelectRegion(region.id);
                        setPanelTab('list');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                          : 'bg-white hover:bg-teal-50/60 text-slate-800 border-slate-200/90'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{region.name}</div>
                        <div
                          className={`text-[10px] ${
                            isActive ? 'text-teal-100' : 'text-slate-500'
                          }`}
                        >
                          Ibu Kota: {region.capital}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : count > 0
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count > 0 ? `${count} faskes` : 'Muat Live'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Statistics & Charts Tab */
          <motion.div
            key="panel-stats"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'Hospital', label: 'Rumah Sakit', dot: 'bg-red-500', text: 'text-red-700', ring: 'bg-red-50 border-red-300' },
                  { id: 'Puskesmas', label: 'Puskesmas', dot: 'bg-orange-500', text: 'text-orange-700', ring: 'bg-orange-50 border-orange-300' },
                  { id: 'Clinic', label: 'Klinik', dot: 'bg-blue-500', text: 'text-blue-700', ring: 'bg-blue-50 border-blue-300' },
                  { id: 'Pharmacy', label: 'Apotek', dot: 'bg-emerald-500', text: 'text-emerald-700', ring: 'bg-emerald-50 border-emerald-300' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    handleToggleCategoryChip(c.id);
                    setPanelTab('list');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    typeFilter === c.id ? c.ring : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80'
                  }`}
                >
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${c.text}`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </span>
                  <span className="text-xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
                    {categoryCounts[c.id]}
                  </span>
                </button>
              ))}
            </div>

            {pieDataCategory.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Proporsi Kategori ({activeRegionObj ? activeRegionObj.shortName : 'Sumsel'})
                </h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieDataCategory.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
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

            {barDataByRegion.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Sebaran Faskes per Kota/Kabupaten Dimuat
                </h4>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barDataByRegion}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#475569' }}
                        width={86}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="#0d9488" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="relative flex flex-col h-[calc(100vh-148px)] lg:h-[calc(100vh-116px)] min-h-[620px] w-full bg-slate-900 rounded-3xl shadow-md border border-slate-200/90 overflow-hidden">
      {/* FULL-SCREEN INTERACTIVE GOOGLE MAPS CANVAS */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={SUMSEL_REGIONS[0].center}
          defaultZoom={SUMSEL_REGIONS[0].zoom}
          mapTypeId={mapStyle}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
          style={{ width: '100%', height: '100%' }}
        >
          <MapCameraController
            targetCenter={targetCenter}
            targetZoom={targetZoom}
            cameraNonce={cameraNonce}
          />

          {/* User GPS Marker (only rendered when explicitly activated by user) */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Lokasi GPS Anda" zIndex={1200}>
              <div className="w-5 h-5 rounded-full bg-violet-600 border-3 border-white shadow-lg ring-4 ring-violet-500/30" />
            </AdvancedMarker>
          )}

          {/* Facility AdvancedMarkers */}
          {filteredFacilities.map((facility) => (
            <FacilityMarkerPin
              key={`${facility.placeId || facility.id}`}
              facility={facility}
              isSelected={selectedFacilityId === facility.id}
              onClick={() => handleSelectFacility(facility, false)}
            />
          ))}

          {/* Interactive InfoWindow for Active Facility */}
          {infoWindowFacility && (
            <InfoWindow
              position={{ lat: infoWindowFacility.lat, lng: infoWindowFacility.lng }}
              pixelOffset={[0, -34]}
              maxWidth={290}
              onCloseClick={() => setInfoWindowFacilityId(null)}
            >
              <div className="font-sans text-slate-800 space-y-2 pr-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {infoWindowFacility.name}
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 shrink-0">
                    {infoWindowFacility.distanceKm < 1
                      ? `${Math.round(infoWindowFacility.distanceKm * 1000)} m`
                      : `${infoWindowFacility.distanceKm.toFixed(1)} km`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-teal-700">
                    {getTypeLabel(infoWindowFacility.type).label}
                  </span>
                  {infoWindowFacility.city && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 font-semibold">{infoWindowFacility.city}</span>
                    </>
                  )}
                  {infoWindowFacility.rating !== undefined && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-amber-700">★ {infoWindowFacility.rating.toFixed(1)}</span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed m-0">
                  {infoWindowFacility.address}
                </p>

                {infoWindowFacility.contact && (
                  <p className="text-[11px] font-mono font-bold text-teal-700 m-0">
                    Telp: {infoWindowFacility.contact}
                  </p>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      computeRouteToFacility(
                        { lat: infoWindowFacility.lat, lng: infoWindowFacility.lng },
                        infoWindowFacility.name
                      )
                    }
                    disabled={isRouting}
                    className="flex-1 py-1.5 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-60"
                  >
                    {isRouting ? 'Menghitung...' : 'Rute Google Maps'}
                  </button>
                  <a
                    href={
                      infoWindowFacility.googleMapsUri ||
                      `https://www.google.com/maps/search/?api=1&query=${infoWindowFacility.lat},${infoWindowFacility.lng}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold"
                  >
                    Buka Maps
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        <MapCoordsHud mapStyleLabel={currentMapStyleLabel} />
      </div>

      {/* FLOATING TOP BAR OVERLAY */}
      <div className="relative z-20 p-3 sm:p-4 pointer-events-none flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Search Input + 17 Kota/Kabupaten Sumatera Selatan Selector */}
          <div className="pointer-events-auto flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/90 w-full lg:w-auto lg:min-w-[520px] flex-1 max-w-3xl">
            <div className="relative flex-1 min-w-[160px] flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari RS, Puskesmas, Klinik, Apotek di Sumsel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleLiveGoogleMapsSearch();
                  }
                }}
                className="w-full pl-9 pr-7 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCustomSearchResults([]);
                    setActiveCustomSearchLabel('');
                  }}
                  className="absolute right-1.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => void handleLiveGoogleMapsSearch()}
                disabled={isFetchingPlaces}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                Cari Maps
              </button>
            )}

            <div className="hidden sm:block h-5 w-px bg-slate-200 shrink-0" />

            <select
              value={selectedRegionId}
              onChange={(e) => handleSelectRegion(e.target.value)}
              aria-label="Pilih Kota atau Kabupaten di Sumatera Selatan"
              className="py-2 pl-2.5 pr-7 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-500 transition-all cursor-pointer max-w-[205px] truncate"
            >
              <option value="all-loaded">
                Semua Sumsel Terkumpul ({allLoadedProvinceFacilities.length})
              </option>
              <optgroup label="Kota Otonom Sumatera Selatan (4)">
                {SUMSEL_KOTA_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {loadedCountByRegion[r.id] ? ` (${loadedCountByRegion[r.id]})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kabupaten Sumatera Selatan (13)">
                {SUMSEL_KABUPATEN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {loadedCountByRegion[r.id] ? ` (${loadedCountByRegion[r.id]})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Right: Quick Focus Controls + Map Type Switcher + Admin */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                handleSelectRegion('kota-palembang');
                flyToLocation(RSUD_BARI_COORDS.lat, RSUD_BARI_COORDS.lng, 15);
              }}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border bg-rose-600 text-white border-rose-700 hover:bg-rose-700 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Pusatkan peta ke RSUD Palembang BARI"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>RSUD BARI</span>
            </button>

            <button
              type="button"
              onClick={() => flyToLocation(SUMSEL_PROVINCE_CENTER.lat, SUMSEL_PROVINCE_CENTER.lng, 8)}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white active:scale-95 cursor-pointer whitespace-nowrap"
              title="Lihat seluruh Provinsi Sumatera Selatan"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Peta Sumsel</span>
            </button>

            {userLocation ? (
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/90">
                <button
                  type="button"
                  onClick={locateUser}
                  disabled={isLocating}
                  className="min-h-[30px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all disabled:opacity-70 cursor-pointer whitespace-nowrap"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span>GPS Aktif</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation(null);
                    clearRoute();
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Matikan lokasi GPS"
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
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5" />
                )}
                <span>GPS Saya</span>
              </button>
            )}

            {/* Google Maps Type Switcher */}
            <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/90">
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:block shrink-0" />
              {MAP_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMapStyle(opt.id)}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mapStyle === opt.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
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
                  <span className="hidden sm:inline">Impor Faskes</span>
                </button>
                {adminFacilities.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteAllFacilities();
                      setAdminFacilities([]);
                    }}
                    className="min-h-[38px] inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                    title="Hapus Data Tambahan Admin"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Second Row: Category Filter Chips + Live Sync Indicator */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {QUICK_CATEGORY_CHIPS.map((chip) => {
            const count = categoryCounts[chip.id];
            const active = typeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleToggleCategoryChip(chip.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm border whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                  active
                    ? chip.activeClass
                    : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : chip.dot}`} />
                <span>{chip.shortLabel}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    active ? chip.badgeActive : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {isFetchingPlaces && (
            <div className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold flex items-center gap-2 shrink-0 shadow-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span className="max-w-[240px] truncate">{fetchStatusText || 'Sinkronisasi Google Maps...'}</span>
            </div>
          )}
        </div>

        {/* Status / Route / Error Banners */}
        <AnimatePresence>
          {fetchError && (
            <motion.div
              key="fetch-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-auto self-start bg-amber-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={() => setFetchError('')}
                className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {routingError && (
            <motion.div
              key="routing-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-auto self-start bg-rose-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2"
            >
              <span>{routingError}</span>
              <button
                type="button"
                onClick={() => setRoutingError('')}
                className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {routeInfo && (
            <motion.div
              key="route-info"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-auto self-start bg-teal-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-lg border border-teal-700/60 flex flex-wrap items-center gap-3"
            >
              <div className="text-xs">
                Rute dari <span className="text-teal-300 font-semibold">{routeInfo.originLabel}</span> ke{' '}
                <strong className="font-bold text-white">{routeInfo.destinationName}</strong>
              </div>
              <div className="flex items-center gap-2.5 font-mono tabular-nums text-xs font-bold bg-white/10 px-3 py-1 rounded-xl">
                <span>{(routeInfo.distanceMeters / 1000).toFixed(1)} km</span>
                <span className="text-teal-400">·</span>
                <span>{Math.max(1, Math.round(routeInfo.durationMillis / 60000))} menit</span>
              </div>
              <button
                type="button"
                onClick={clearRoute}
                className="text-[11px] font-bold text-teal-200 hover:text-white underline cursor-pointer"
              >
                Tutup Rute
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP FLOATING GLASS PANEL */}
      <div className="hidden md:flex absolute top-28 bottom-12 left-4 z-20 pointer-events-none items-start">
        <AnimatePresence initial={false} mode="popLayout">
          {isDesktopPanelOpen && !isMobileViewport && (
            <motion.aside
              key="desktop-floating-panel"
              initial={{ opacity: 0, x: -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto h-full w-80 lg:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden origin-top-left"
            >
              {renderPanelContent()}
            </motion.aside>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsDesktopPanelOpen((prev) => !prev)}
          className={`pointer-events-auto mt-3 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200/90 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95 ${
            isDesktopPanelOpen ? 'ml-2 w-9 h-11' : 'px-3.5 h-11 text-xs font-bold text-teal-800'
          }`}
          title={isDesktopPanelOpen ? 'Sembunyikan Panel Daftar' : 'Tampilkan Panel Daftar Faskes'}
        >
          {isDesktopPanelOpen ? (
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          ) : (
            <>
              <ListFilter className="w-4 h-4 text-teal-600" />
              <span>Faskes Sumsel ({filteredFacilities.length})</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </>
          )}
        </button>
      </div>

      {/* MOBILE INTERACTIVE BOTTOM DRAWER */}
      <motion.div
        initial={false}
        animate={{
          height:
            mobileDrawerState === 'expanded'
              ? '82%'
              : mobileDrawerState === 'half'
              ? '46%'
              : '64px',
        }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden absolute left-0 right-0 bottom-0 z-30 bg-white/95 rounded-t-3xl shadow-[0_-8px_30px_rgba(15,23,42,0.18)] border-t border-slate-200/90 flex flex-col overflow-hidden"
      >
        <div
          onClick={() =>
            setMobileDrawerState((prev) =>
              prev === 'minimized' ? 'half' : prev === 'half' ? 'expanded' : 'minimized'
            )
          }
          className="pt-2 pb-2.5 px-4 flex flex-col items-center cursor-pointer shrink-0 border-b border-slate-100"
        >
          <div className="w-10 h-1.5 bg-slate-300 rounded-full mb-2" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold text-slate-800 truncate">
                {filteredFacilities.length} Faskes · {activeRegionObj ? activeRegionObj.shortName : 'Sumsel'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 shrink-0">
              <span>
                {mobileDrawerState === 'expanded'
                  ? 'Kecilkan'
                  : mobileDrawerState === 'half'
                  ? 'Perluas'
                  : 'Buka Daftar'}
              </span>
              {mobileDrawerState === 'expanded' ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileDrawerState !== 'minimized' && isMobileViewport && (
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

      {/* Admin CSV/Excel Import Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Impor Data Faskes Tambahan (Admin)</h3>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <p className="text-sm text-slate-600">
                Data utama Rumah Sakit, Puskesmas, Klinik, dan Apotek diambil secara langsung dari{' '}
                <strong>Google Maps Platform (Places API New)</strong>. Unggah CSV/Excel hanya jika Admin ingin
                menambahkan titik faskes internal khusus.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Template Excel
              </button>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCsvFile(file);
                      setCsvError('');
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
              {csvError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {csvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateData}
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
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

interface MapFacilitiesProps {
  isAdmin?: boolean;
}

export const MapFacilities: React.FC<MapFacilitiesProps> = ({ isAdmin = false }) => {
  const [resolvedApiKey, setResolvedApiKey] = useState<string>(() => getInitialGoogleMapsApiKey());
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(() => !getInitialGoogleMapsApiKey());

  const loadRuntimeMapsConfig = useCallback(async () => {
    const initial = getInitialGoogleMapsApiKey();
    if (initial) {
      setResolvedApiKey(initial);
      setIsLoadingConfig(false);
      return;
    }

    setIsLoadingConfig(true);
    try {
      const res = await fetch('/api/maps-config', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { apiKey?: string };
        const key = typeof data?.apiKey === 'string' ? data.apiKey.trim() : '';
        if (key) {
          setResolvedApiKey(key);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat konfigurasi runtime Google Maps:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    if (!resolvedApiKey) {
      loadRuntimeMapsConfig();
    }
  }, [resolvedApiKey, loadRuntimeMapsConfig]);

  if (isLoadingConfig) {
    return (
      <div className="min-h-[480px] rounded-3xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-bold text-slate-800">Memuat Google Maps Platform...</p>
        <p className="text-xs text-slate-500">
          Menyiapkan peta interaktif 17 Kota &amp; Kabupaten Sumatera Selatan
        </p>
      </div>
    );
  }

  if (!resolvedApiKey) {
    return (
      <div className="min-h-[480px] rounded-3xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <MapPinned className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">
          Kunci API Google Maps Platform Belum Tersedia
        </h3>
        <p className="text-xs text-slate-600 max-w-md leading-relaxed">
          Pastikan variabel lingkungan <code className="font-mono font-bold">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
          telah aktif pada proyek ini untuk memuat peta interaktif dan basis data Rumah Sakit, Puskesmas, Klinik,
          serta Apotek di seluruh 17 Kota &amp; Kabupaten Sumatera Selatan dari Google Maps.
        </p>
        <button
          type="button"
          onClick={loadRuntimeMapsConfig}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Konfigurasi Peta</span>
        </button>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={resolvedApiKey}
      language="id"
      region="ID"
      libraries={['places', 'marker', 'routes']}
      onError={(err) => {
        console.error('Google Maps APIProvider Error:', err);
        if (isGoogleMapsQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }}
    >
      <SumselMapInner isAdmin={isAdmin} />
    </APIProvider>
  );
};
