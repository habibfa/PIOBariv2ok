const fs = require('fs');
let code = fs.readFileSync('src/MapFacilities.tsx', 'utf-8');

const importReplacement = `import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getFacilitiesFromDb, saveFacilitiesToDb, Facility } from './services/facilitiesService';`;

code = code.replace(`import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';`, importReplacement);

const facilityInterface = `interface Facility {
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
}`;

code = code.replace(facilityInterface, '');

fs.writeFileSync('src/MapFacilities.tsx', code);
