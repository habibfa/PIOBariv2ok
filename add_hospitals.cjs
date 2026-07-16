const fs = require('fs');

const rawHospitals = `Charitas Hospital Belitang
Charitas Hospital Kenten
Charitas Hospital Palembang
RS AR Bunda Linggau
RS AR Bunda Prabumulih
RS Ar-Rasyid
RS Ar-Royyan Indralaya
RS At-Taqwa Gumawang
RS Bhayangkara Mohamad Hasan
RS Bukit Asam Medika
RS Bunda
RS Bunda Medika Jakabaring
RS Charitas KM 7
RS DKT Lahat
RS dr. Mohammad Hoesin
RS Ernaldi Bahar
RS Fadilla Prabumulih
RS Graha Mandiri
RS Hermina Basuki Rahmat
RS Hermina OPI Jakabaring
RS Khusus Gigi dan Mulut Prov Sumsel
RS Khusus Mata Prop Sumsel
RS MMC
RS Muhammadiyah Palembang
RS Pelabuhan Palembang
RS Permata Palembang
RS Pertamina
RS Pertamina Kota Prabumulih
RS Pratama Pali
RS Pratama Sukajadi
RS PUSRI
RS Siloam Silampari Lubuk Linggau
RS Siloam Sriwijaya Palembang
RS Sriwijaya
RS Tk. II Dr. AK. Gani
RS Umum Daerah Siti Aisyah Lubuk Linggau
RS YK Madira
RS. Santo Antonio Baturaja
RS. Tk.II dr. Noesmir Baturaja
RSI Siti Khadijah Palembang
RSIA Az -Zahra
RSIA Bunda Noni
RSIA Dwi Sari Lubuk Linggau
RSIA Mama
RSIA Marissa
RSIA Rika Amelia
RSIA Tiara Fatrin
RSUD Banyuasin
RSUD Basemah Pagar Alam
RSUD Bayung Lencir
RSUD Dr. Sobirin Kab Mura
RSUD dr.H.M.Rabain Muara Enim
RSUD Dr.Ibnu Sutowo Baturaja
RSUD Gandus Kota Palembang
RSUD Gelumbang
RSUD Kabupaten Empat Lawang
RSUD Kayuagung
RSUD Kota Prabumulih
RSUD Lahat
RSUD Lubai Ulu
RSUD Martapura Kab OKUT
RSUD Muara Beliti
RSUD Muara Dua
RSUD Ogan Ilir
RSUD OKU Timur
RSUD Palembang BARI
RSUD Rupit Muratara
RSUD Sekayu
RSUD Semende Darat Laut
RSUD Siti Fatimah Palembang
RSUD Sungai Lilin
RSUD Talang Ubi
RSUD Tanjung Tebat Kab Lahat
RSUD Tugu Jaya
RSUP Dr. Rivai Abdullah
Rumah Sakit Umum Trijaya Medical Center
RS Karunia Indah Medika`;

const locations = {
  "palembang": { lat: -2.9761, lng: 104.7754 },
  "linggau": { lat: -3.2981, lng: 102.8624 },
  "prabumulih": { lat: -3.4339, lng: 104.2335 },
  "indralaya": { lat: -3.2205, lng: 104.6521 },
  "ogan ilir": { lat: -3.2205, lng: 104.6521 },
  "lahat": { lat: -3.7928, lng: 103.5435 },
  "baturaja": { lat: -4.1147, lng: 104.1627 },
  "pagar alam": { lat: -4.0201, lng: 103.2657 },
  "muara enim": { lat: -3.6429, lng: 103.7744 },
  "sekayu": { lat: -2.8841, lng: 103.8340 },
  "banyuasin": { lat: -2.9103, lng: 104.3808 },
  "empat lawang": { lat: -3.6397, lng: 102.9419 },
  "kayuagung": { lat: -3.3934, lng: 104.8358 },
  "martapura": { lat: -4.3015, lng: 104.3860 },
  "oku timur": { lat: -4.3015, lng: 104.3860 },
  "belitang": { lat: -4.0132, lng: 104.6063 },
  "muara dua": { lat: -4.5126, lng: 104.0308 },
  "muratara": { lat: -2.6791, lng: 102.7958 },
  "rupit": { lat: -2.6791, lng: 102.7958 },
  "pali": { lat: -3.2753, lng: 103.8447 },
  "talang ubi": { lat: -3.2753, lng: 103.8447 },
  "mura": { lat: -3.1979, lng: 102.9793 },
  "muara beliti": { lat: -3.1979, lng: 102.9793 },
  "bayung lencir": { lat: -2.0463, lng: 103.6890 },
  "sungai lilin": { lat: -2.5768, lng: 104.0538 },
  "jakabaring": { lat: -3.0270, lng: 104.7765 },
  "kenten": { lat: -2.9341, lng: 104.7709 }
};

const hospLines = rawHospitals.split('\n').map(s => s.trim()).filter(s => s);
const newFacilities = [];
let idCounter = 100;

hospLines.forEach(name => {
  let matchedLat = locations["palembang"].lat;
  let matchedLng = locations["palembang"].lng;
  let found = false;

  const lowerName = name.toLowerCase();
  for (const [key, coords] of Object.entries(locations)) {
    if (lowerName.includes(key)) {
      matchedLat = coords.lat;
      matchedLng = coords.lng;
      found = true;
      break;
    }
  }
  
  // Apply a small random jitter so they don't overlap perfectly
  const jitterLat = (Math.random() - 0.5) * 0.05;
  const jitterLng = (Math.random() - 0.5) * 0.05;
  
  newFacilities.push({
    id: idCounter++,
    name: name,
    type: "Hospital",
    address: found ? "Sumatera Selatan" : "Palembang, Sumatera Selatan",
    lat: matchedLat + jitterLat,
    lng: matchedLng + jitterLng
  });
});

// Existing other facilities to keep (clinics, pharmacies, puskesmas)
const otherFacilities = [
  {
    id: 3,
    name: "Klinik Utama Mata Sriwijaya",
    type: "Clinic",
    address: "Jl. Jend. Sudirman, Palembang",
    lat: -2.978550,
    lng: 104.750100
  },
  {
    id: 4,
    name: "Klinik Pratama K-24",
    type: "Clinic",
    address: "Jl. MP Mangkunegara, Palembang",
    lat: -2.943120,
    lng: 104.764890
  },
  {
    id: 5,
    name: "Apotek Kimia Farma",
    type: "Pharmacy",
    address: "Jl. Merdeka No. 10, Palembang",
    lat: -2.986345,
    lng: 104.753300
  },
  {
    id: 6,
    name: "Apotek K-24 Plaju",
    type: "Pharmacy",
    address: "Jl. DI Panjaitan, Plaju, Palembang",
    lat: -2.998120,
    lng: 104.776100
  },
  {
    id: 7,
    name: "Puskesmas Pembina",
    type: "Puskesmas",
    address: "Jl. Ratu Sianu, Seberang Ulu I, Palembang",
    lat: -3.011500,
    lng: 104.780100,
    contact: "(0711) 512211"
  }
];

const allFacilities = [...newFacilities, ...otherFacilities];

const file = 'src/MapFacilities.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the mockFacilities array
// Find "const mockFacilities: Facility[] = [" and the ending "];" right before "export const MapFacilities"
const startIndex = content.indexOf('const mockFacilities: Facility[] = [');
const endIndex = content.indexOf('export const MapFacilities');

if (startIndex !== -1 && endIndex !== -1) {
  // Find the exact closing brace before export
  const arrayString = 'const mockFacilities: Facility[] = ' + JSON.stringify(allFacilities, null, 2) + ';\n\n';
  
  content = content.substring(0, startIndex) + arrayString + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Updated mockFacilities with " + allFacilities.length + " items.");
} else {
  console.log("Could not find array boundaries");
}
