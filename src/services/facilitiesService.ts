import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface Facility {
  id: number;
  name: string;
  type: 'Hospital' | 'Pharmacy' | 'Clinic' | 'Puskesmas';
  address: string;
  lat: number;
  lng: number;
  contact?: string;
  kelas?: string;
  jenis?: string;
  city?: string;
  locked?: boolean;
}

const COLLECTION_NAME = 'facilities';

export const getFacilitiesFromDb = async (): Promise<Facility[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const facilities: Facility[] = [];
    querySnapshot.forEach((doc) => {
      facilities.push(doc.data() as Facility);
    });
    return facilities;
  } catch (error) {
    console.error("Error fetching facilities: ", error);
    return [];
  }
};

export const saveFacilitiesToDb = async (facilities: Facility[]) => {
  try {
    const batch = writeBatch(db);
    facilities.forEach((f) => {
      const docRef = doc(db, COLLECTION_NAME, String(f.id));
      batch.set(docRef, f);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error saving facilities: ", error);
    throw error;
  }
};
