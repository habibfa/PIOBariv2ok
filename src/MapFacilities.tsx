import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Save, X, Download } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Search, Navigation, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getFacilitiesFromDb, saveFacilitiesToDb, deleteAllFacilities, Facility } from './services/facilitiesService';

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
    "name": "RS Umum Daerah Palembang Bari",
    "type": "Hospital",
    "address": "Jl. Panca Usaha No.1, 5 Ulu, Kecamatan Seberang Ulu I, Kota Palembang, Sumatera Selatan 30254",
    "lat": -3.0106723,
    "lng": 104.7660224,
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

  // Koordinat pusat Palembang
  const center: [number, number] = [-2.9761, 104.7754];
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Semua");
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const saved = localStorage.getItem("faskes_facilities_v4");
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

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await getFacilitiesFromDb();
        if (isMounted && data && data.length > 0) {
          const sorted = data.map(f => ({ ...f, locked: false })).sort((a, b) => a.id - b.id);
          setFacilities(sorted);
          try {
            localStorage.setItem("faskes_facilities_v4", JSON.stringify(sorted));
          } catch (e) {}
        } else if (isMounted) {
          try {
            const saved = localStorage.getItem("faskes_facilities_v4");
            if (!saved) {
              localStorage.setItem("faskes_facilities_v4", JSON.stringify(mockFacilities.map(f => ({ ...f, locked: false }))));
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
      } catch (err) {
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
      await saveToDb(newData); // Only saving the new/updated ones or all? Actually saveFacilitiesToDb uses batch.set which upserts.
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
    facility && 
    (cityFilter === "Semua" || facility.city === cityFilter || !facility.city) &&
    ((facility.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) || 
     (facility.address || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
     (facility.jenis && facility.jenis.toLowerCase().includes((searchQuery || "").toLowerCase())))
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
    .map(([name, value]) => ({ name, value, color: "#8b5cf6" }))
    .sort((a, b) => b.value - a.value);

  const getPercent = (val: number, max: number) => max > 0 ? (val / max) * 100 : 0;

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Peta Sebaran Faskes
              <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{filteredFacilities.length} Faskes</span>
            </h2>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (window.confirm("Apakah Anda yakin ingin menghapus semua data fasilitas kesehatan? Data tidak dapat dikembalikan.")) {
                      try {
                        await deleteAllFacilities();
                        setFacilities([]); localStorage.removeItem("faskes_facilities_v4");
                        alert("Semua data berhasil dihapus.");
                      } catch (e) {
                        alert("Gagal menghapus data.");
                      }
                    }
                  }}
                  className="inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                  Hapus Semua
                </button>
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Update Data
                </button>
              </div>
            )}
          </div>
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

            {/* Puskesmas Section */}
            {stats.totalPuskesmas > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Puskesmas (Total: {stats.totalPuskesmas})</span>
              </div>
              <div className="space-y-6">
                
                {/* Pie Chart: Puskesmas */}
                {pieDataPuskesmas.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 mb-2 text-center">Berdasarkan Pelayanan</h4>
                    <div className="h-48 w-full -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieDataPuskesmas}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            onMouseEnter={(_, index) => setHoveredKelas(pieDataPuskesmas[index].name)}
                            onMouseLeave={() => setHoveredKelas(null)}
                          >
                            {pieDataPuskesmas.map((entry, index) => (
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
              </div>
            </div>
            )}

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
          
          {filteredFacilities.filter(f => f && f.lat !== undefined && f.lng !== undefined && f.id !== undefined).map(facility => (
            <Marker 
              key={facility.id} 
              position={[facility.lat, facility.lng]}
              draggable={false}
              icon={facility.type === "Hospital" ? iconHospital : facility.type === "Clinic" ? iconClinic : facility.type === "Pharmacy" ? iconPharmacy : facility.type === "Puskesmas" ? iconPuskesmas : iconHospital}
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
                  
                  <button 
                    onClick={() => getRouteTo([facility.lat, facility.lng], facility.name)}
                    disabled={isRouting}
                    className="mt-3 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isRouting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    {isRouting ? "Mencari Rute..." : "Arahkan ke Sini"}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        </div>
      </div>
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
