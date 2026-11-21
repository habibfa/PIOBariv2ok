export interface Facility {
  id: number;
  placeId?: string;
  name: string;
  type: 'Hospital' | 'Pharmacy' | 'Clinic' | 'Puskesmas';
  address: string;
  lat: number;
  lng: number;
  contact?: string;
  kelas?: string;
  jenis?: string;
  city?: string;
  regionId?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  openingHours?: string[];
  googleMapsUri?: string;
  websiteUri?: string;
  source?: 'google_maps' | 'admin';
  locked?: boolean;
}

const ADMIN_FACILITIES_STORAGE_KEY = 'piobari_admin_custom_facilities_v1';

/**
 * Loads optional admin-imported custom institutional facilities from browser storage.
 * Live Sumatera Selatan facilities are fetched directly from Google Maps Platform Places API (New)
 * without persisting Google Maps content to Firestore.
 */
export const getFacilitiesFromDb = async (): Promise<Facility[]> => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_FACILITIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Facility[]) : [];
  } catch {
    return [];
  }
};

export const saveFacilitiesToDb = async (facilities: Facility[]): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    const existing = await getFacilitiesFromDb();
    const mergedMap: Record<number, Facility> = {};
    existing.forEach((f) => {
      mergedMap[f.id] = f;
    });
    facilities.forEach((f) => {
      mergedMap[f.id] = { ...f, source: 'admin' };
    });
    window.localStorage.setItem(
      ADMIN_FACILITIES_STORAGE_KEY,
      JSON.stringify(Object.values(mergedMap))
    );
  } catch (error) {
    console.warn('Gagal menyimpan data faskes kustom admin:', error);
  }
};

export const deleteAllFacilities = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ADMIN_FACILITIES_STORAGE_KEY);
  } catch {
    // Ignore storage removal errors
  }
};
