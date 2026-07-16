import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Search, Navigation, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

interface Facility {
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

const mockFacilities: Facility[] = [
  {
    "id": 101,
    "name": "Charitas Hospital Kenten",
    "type": "Hospital",
    "address": "Jalan Betawi Raya No 1340 RT 22 RW 06",
    "lat": -2.9374835285955725,
    "lng": 104.79483646196289,
    "contact": "0711-817196",
    "kelas": "D",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 102,
    "name": "RS Umum Charitas Hospital Palembang",
    "type": "Hospital",
    "address": "Jalan Jenderal Sudirman",
    "lat": -2.9765,
    "lng": 104.754,
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
    "lat": -2.9364778,
    "lng": 104.7200747,
    "contact": "07115610503",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 108,
    "name": "RS Bhayangkara M. Hasan Palembang",
    "type": "Hospital",
    "address": "Jl. Jenderal Sudirman KM. 4.5",
    "lat": -2.9588564218828313,
    "lng": 104.73754837829966,
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
    "lat": -2.9679362,
    "lng": 104.7254294,
    "contact": "0711-311866",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 111,
    "name": "RS Bunda Medika Jakabaring",
    "type": "Hospital",
    "address": "Jl. Gubernur H.A. Bastari",
    "lat": -3.050035,
    "lng": 104.803463,
    "contact": "0711-3037000",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 114,
    "name": "RS Umum Pusat Dr. Mohammad Hoesin Palembang",
    "type": "Hospital",
    "address": "Jalan Jendral Sudirman Km. 3,5",
    "lat": -2.9663924,
    "lng": 104.7488317,
    "contact": "0711-354088",
    "kelas": "A",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 115,
    "name": "RS Jiwa Ernaldi Bahar Provinsi Sumatera Selatan",
    "type": "Hospital",
    "address": "Jalan Gubernur H. Muhammad Ali Amin KM. 12",
    "lat": -2.9383527,
    "lng": 104.7069004,
    "contact": "07115645126",
    "kelas": "A",
    "jenis": "RSK Jiwa",
    "city": "Kota Palembang"
  },
  {
    "id": 117,
    "name": "RS Umum Graha Mandiri",
    "type": "Hospital",
    "address": "Jl.ANWAR ARSYAD NO.12",
    "lat": -2.9685113930494835,
    "lng": 104.7262533263893,
    "contact": "0711-414082",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 118,
    "name": "RS Hermina Palembang",
    "type": "Hospital",
    "address": "JALAN BASUKI RAHMAT NOMOR 897 RUKUN TETANGGA 11 RUKUN WARGA 003",
    "lat": -2.955951968134232,
    "lng": 104.74863915648803,
    "contact": "0711352525",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 119,
    "name": "RS Hermina OPI Jakabaring",
    "type": "Hospital",
    "address": "Jl. Gub H A Bastari RT 010 RW 005 Kel. Jakabaring Selatan Kec. Rambutan",
    "lat": -3.034199,
    "lng": 104.791005,
    "contact": "0711 3031520",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kabupaten Banyuasin"
  },
  {
    "id": 120,
    "name": "RS Khusus Gigi dan Mulut Palembang Provinsi Sumate",
    "type": "Hospital",
    "address": "Jalan Kolonel. H. Burlian KM. 6",
    "lat": -2.9482346,
    "lng": 104.7345504,
    "contact": "0711-5610491",
    "kelas": "C",
    "jenis": "RSK GM",
    "city": "Kota Palembang"
  },
  {
    "id": 122,
    "name": "RS Musi Medika Cendikia",
    "type": "Hospital",
    "address": "Jl. Demang Lebar Daun No.62",
    "lat": -2.9863592,
    "lng": 104.6885311,
    "contact": "0711 - 446272",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 124,
    "name": "RS Muhammadiyah Palembang",
    "type": "Hospital",
    "address": "Jl. A. Yani 13 Ulu, kota Palembang,Sumatera selatan",
    "lat": -2.996709841809831,
    "lng": 104.77676896762841,
    "contact": "0711511446",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 125,
    "name": "RS Pelabuhan Palembang",
    "type": "Hospital",
    "address": "Jl. Mayor Memet Sastra Wirya No.1 Boom Baru",
    "lat": -2.9788835698905314,
    "lng": 104.7768023511444,
    "contact": "(0711) 711843",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 126,
    "name": "RS Permata Palembang",
    "type": "Hospital",
    "address": "Jalan Soekarno Hatta, Ilir Barat I",
    "lat": -2.9861858851054244,
    "lng": 104.71837103513413,
    "contact": "0711-5260000",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 127,
    "name": "RS Umum Pertamina Palembang",
    "type": "Hospital",
    "address": "Jalan Pengantingan Nomor 1",
    "lat": -3.0008927511793027,
    "lng": 104.82427423858644,
    "contact": "0711-597401",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 131,
    "name": "RS Umum Pusri Palembang",
    "type": "Hospital",
    "address": "Jl May Zen Komplek Pusri, 2 Ilir Palembang",
    "lat": -2.9697602476057607,
    "lng": 104.80142086770628,
    "contact": "0711-721313",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 132,
    "name": "RS Siloam Sriwijaya Palembang",
    "type": "Hospital",
    "address": "JL.POM IX (KOMPLEK PS MALL)",
    "lat": -2.9779351,
    "lng": 104.7422583,
    "contact": "0711-5229100",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 133,
    "name": "RS Umum Sriwijaya",
    "type": "Hospital",
    "address": "Jl. Jenderal Sudirman, Km. 4.5, No. 502",
    "lat": -2.95965,
    "lng": 104.737173,
    "contact": "0711-419680",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 135,
    "name": "RS Umum dr. AK. Gani Kota Palembang",
    "type": "Hospital",
    "address": "Jl. dr AK Gani no I",
    "lat": -2.9900512,
    "lng": 104.7573011,
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
    "lat": -2.9727999,
    "lng": 104.751192,
    "contact": "(0711) 364954",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 139,
    "name": "RS Islam Siti Khadijah",
    "type": "Hospital",
    "address": "Jl. Demang Lebar Daun, Lorok Pakjo",
    "lat": -2.9714035538447767,
    "lng": 104.730974105835,
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
    "lat": -2.9422846,
    "lng": 104.7841096,
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
    "lat": -2.9929434,
    "lng": 104.7264614,
    "contact": "0711441952",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 143,
    "name": "RS Ibu dan Anak Mama",
    "type": "Hospital",
    "address": "Jalan Lembing Blok F No. 15 Kampus POM IX",
    "lat": -2.975501,
    "lng": 104.740858,
    "contact": "0711 357351",
    "kelas": "C",
    "jenis": "RSIA",
    "city": "Kota Palembang"
  },
  {
    "id": 144,
    "name": "Rumah Sakit Ibu Dan Anak Marissa",
    "type": "Hospital",
    "address": "Jl. Kapten Abdullah No.1212, RT.18, Plaju Ilir, Kec. Plaju, Kota Palembang, Sumatera Selatan 30119",
    "lat": -3.0057493,
    "lng": 104.8180779,
    "contact": "082280841273",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 153,
    "name": "RS Umum Daerah Gandus Palembang",
    "type": "Hospital",
    "address": "Jl. Sofyan Kenawas Gandus",
    "lat": -3.0148010021291323,
    "lng": 104.68978397722073,
    "contact": "081178718686",
    "kelas": "D",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 165,
    "name": "RS Umum Daerah Palembang Bari",
    "type": "Hospital",
    "address": "Jl. Panca Usaha No.1",
    "lat": -3.0105683345683327,
    "lng": 104.76858652053224,
    "contact": "0711-519211",
    "kelas": "B",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 169,
    "name": "RS Umum Daerah Siti Fatimah Provinsi Sumatera Sela",
    "type": "Hospital",
    "address": "Jl. Kol. H. Burlian Km 6",
    "lat": -2.9482346,
    "lng": 104.7345504,
    "contact": "07115178883",
    "kelas": "A",
    "jenis": "RSU",
    "city": "Kota Palembang"
  },
  {
    "id": 175,
    "name": "RS Umum Pusat Dr. Rivai Abdullah",
    "type": "Hospital",
    "address": "Jalan Sungai Kundur No. 1",
    "lat": -2.9795094329980407,
    "lng": 104.8638046119213,
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
    "lat": -2.9701634,
    "lng": 104.7850769,
    "contact": "0711716643",
    "kelas": "C",
    "jenis": "Rumah Sakit Khusus Ibu dan Anak",
    "city": "Kota Palembang"
  },
  {
    "id": 999,
    "name": "RS Umum Myria Palembang",
    "type": "Hospital",
    "address": "Jl. Kol. H. Burlian Km. 7 No. 228",
    "lat": -2.9411326568720257,
    "lng": 104.72608905713885,
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
    "lat": -2.9113902,
    "lng": 104.7125229,
    "contact": "08136011994",
    "kelas": "C",
    "jenis": "RSU",
    "city": "Kota Palembang"
  }
];

export const MapFacilities: React.FC = () => {
  // Koordinat pusat Palembang
  const center: [number, number] = [-2.9761, 104.7754];
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities.map(f => ({ ...f, locked: false })));
  
  const cities = ["Semua", ...Array.from(new Set(facilities.map(f => f.city).filter(Boolean)))];
  
  // Routing States
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState("");
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number, destinationName: string} | null>(null);

  const handleDragEnd = (e: L.DragEndEvent, id: number) => {
    const marker = e.target as L.Marker;
    const newPos = marker.getLatLng();
    setFacilities(prev => prev.map(f => 
      f.id === id ? { ...f, lat: newPos.lat, lng: newPos.lng } : f
    ));
  };

  const lockFacility = (id: number) => {
    setFacilities(prev => prev.map(f =>
      f.id === id ? { ...f, locked: true } : f
    ));
  };

  const locateUser = () => {
    setIsLocating(true);
    setRoutingError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          setRoutingError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      setRoutingError("Geolokasi tidak didukung oleh perangkat ini.");
    }
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

  const baseFilteredFacilities = facilities.filter(facility => 
    (cityFilter === "Semua" || facility.city === cityFilter) &&
    (facility.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (facility.jenis && facility.jenis.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredFacilities = baseFilteredFacilities.filter(facility => {
    if (hoveredKelas === null) return true;
    if (hoveredKelas === "Lainnya") return facility.type === "Hospital" && !facility.kelas;
    return facility.kelas === hoveredKelas.replace("Kelas ", "");
  });

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
  };

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
    .map(([name, value]) => ({ name, value, color: "#8b5cf6" }))
    .sort((a, b) => b.value - a.value);

  const getPercent = (val: number, max: number) => max > 0 ? (val / max) * 100 : 0;

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px]">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Peta Sebaran Faskes
            <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{filteredFacilities.length} Faskes</span>
          </h2>
          <div className="relative mt-2 max-w-lg flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari nama RS, klinik, atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer truncate max-w-[150px]"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 24 24\\\' fill=\\\'none\\\' stroke=\\\'currentColor\\\' stroke-width=\\\'2\\\' stroke-linecap=\\\'round\\\' stroke-linejoin=\\\'round\\\'%3e%3cpolyline points=\\\'6 9 12 15 18 9\\\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
            >
              {cities.map(city => (
                <option key={city} value={city}>{city === "Semua" ? "Semua Kota" : city}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          {userLocation ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={locateUser}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 disabled:opacity-70"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                Perbarui Lokasi
              </button>
              <button
                onClick={() => {
                  setUserLocation(null);
                  setRouteCoordinates([]);
                  setRouteInfo(null);
                  setRoutingError("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                Hapus Lokasi
              </button>
            </div>
          ) : (
            <button 
              onClick={locateUser}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 disabled:opacity-70"
            >
              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              Lokasi Saya
            </button>
          )}
          
          <div className="h-4 w-px bg-slate-300 hidden md:block"></div>
          
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div> RS
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <div className="w-3 h-3 bg-violet-500 rounded-full"></div> Anda
          </div>
        </div>
      </div>
      
      {routingError && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs font-bold text-red-600 flex items-center justify-center">
          ⚠️ {routingError}
        </div>
      )}
      
      {routeInfo && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-inner z-10 relative">
          <div className="text-sm text-emerald-900">
            Menuju <strong>{routeInfo.destinationName}</strong>
          </div>
          <div className="flex gap-4 font-bold text-emerald-700 text-xs bg-white/60 px-3 py-1.5 rounded-md border border-emerald-200">
            <span className="flex items-center gap-1.5">🚗 {(routeInfo.distance / 1000).toFixed(1)} km</span>
            <span className="w-px h-3 bg-emerald-300"></span>
            <span className="flex items-center gap-1.5">⏱ {Math.ceil(routeInfo.duration / 60)} menit</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard Sidebar */}
        <div className="w-full md:w-72 lg:w-80 bg-white border-r border-slate-200 p-5 overflow-y-auto hidden md:block">
          <h3 className="font-bold text-sm text-slate-800 mb-5 flex items-center gap-2">
            📊 Statistik Fasilitas
          </h3>

          <div className="space-y-6">
            {/* Rumah Sakit Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rumah Sakit (Total: {stats.totalRs})</span>
              </div>
              <div className="space-y-6">
                
                {/* Pie Chart: Statistik Kelas */}
                {pieDataKelas.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 mb-2 text-center">Berdasarkan Kelas</h4>
                    <div className="h-48 w-full -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieDataKelas}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
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
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                          />
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Bar Chart: Statistik Jenis */}
                {barDataJenis.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="text-[11px] font-bold text-slate-500 mb-2 text-center">Berdasarkan Jenis</h4>
                    <div className="h-48 w-full -ml-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barDataJenis}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            width={50}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                            {barDataJenis.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 h-full relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={iconUser}>
              <Popup>
                <div className="font-bold text-sm text-violet-800">📍 Lokasi Anda Saat Ini</div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates} 
              color="#3b82f6" 
              weight={5} 
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
              dashArray="10, 10"
            />
          )}
          
          {filteredFacilities.map(facility => (
            <Marker 
              key={facility.id} 
              position={[facility.lat, facility.lng]}
              draggable={!facility.locked}
              eventHandlers={{
                dragend: (e) => handleDragEnd(e, facility.id)
              }}
              icon={iconHospital}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-sm text-slate-800 m-0">{facility.name}</h3>
                  <div className="text-xs text-slate-500 mt-1 mb-0 flex gap-2 items-center">
                    <span>{facility.type}</span>
                    {facility.jenis && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{facility.jenis}</span>}
                    {facility.kelas && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">Kelas {facility.kelas}</span>}
                  </div>
                  <hr className="my-1.5 border-slate-200" />
                  <p className="text-xs text-slate-700 m-0">{facility.address}</p>
                  {facility.contact && (
                    <p className="text-xs text-emerald-600 mt-1 mb-0">☎ {facility.contact}</p>
                  )}
                  
                  {!facility.locked && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 p-1 rounded mt-2 text-center border border-amber-200">
                      Anda dapat menggeser pin ini
                    </p>
                  )}
                  
                  {!facility.locked ? (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => lockFacility(facility.id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center"
                      >
                        Simpan Pin
                      </button>
                      <button 
                        onClick={() => getRouteTo([facility.lat, facility.lng], facility.name)}
                        disabled={isRouting}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isRouting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                        {isRouting ? "Rute..." : "Arahkan"}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => getRouteTo([facility.lat, facility.lng], facility.name)}
                      disabled={isRouting}
                      className="mt-3 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isRouting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      {isRouting ? "Mencari Rute..." : "Arahkan ke Sini"}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        </div>
      </div>
    </div>
  );
};
