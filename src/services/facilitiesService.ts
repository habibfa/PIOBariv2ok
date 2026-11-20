import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

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

const COLLECTION_NAME = 'facilities';

export const getFacilitiesFromDb = async (): Promise<Facility[]> => {
  if (!isFirebaseConfigured) {
    console.warn("Firebase is not fully configured on Vercel environment. Using local data fallback.");
    return [];
  }
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore fetch timeout")), 3000)
    );
    const querySnapshot = await Promise.race([
      getDocs(collection(db, COLLECTION_NAME)),
      timeoutPromise
    ]);
    const facilities: Facility[] = [];
    querySnapshot.forEach((doc) => {
      facilities.push(doc.data() as Facility);
    });
    return facilities;
  } catch (error) {
    console.warn("Error or timeout fetching facilities from Firestore: ", error);
    return [];
  }
};

export const saveFacilitiesToDb = async (facilities: Facility[]) => {
  if (!isFirebaseConfigured) return;
  try {
    const batch = writeBatch(db);
    facilities.forEach((f) => {
      const docRef = doc(db, COLLECTION_NAME, String(f.id));
      batch.set(docRef, f);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error saving facilities: ", error);
  }
};

export const deleteAllFacilities = async () => {
  if (!isFirebaseConfigured) return;
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    querySnapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error deleting facilities: ", error);
  }
};
