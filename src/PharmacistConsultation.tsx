import React, { useState, useEffect, useRef } from 'react';
import { Upload, Save, X, Edit, Download } from 'lucide-react';
import { User, Phone, MapPin, Calendar, FileText, Award, ShieldCheck } from 'lucide-react';
import { pushSiteUpdate } from './utils/siteUpdates';

interface Pharmacist {
  id: string;
  name: string;
  nip: string;
  str: string;
  strValidity: string;
  sipa: string;
  sipaValidity: string;
  phone: string;
  room: string;
  schedule: string;
  imageUrl: string;
  specialty: string;
}

const INITIAL_PHARMACISTS: Pharmacist[] = [
  {
    id: "p3",
    name: "apt. Dharmilis, S.Farm",
    nip: "198202242010012014",
    str: "NI00000819195315",
    strValidity: "Seumur Hidup",
    sipa: "440/IPA/0148/DPMPTSP-PPK/2026",
    sipaValidity: "24 April 2030",
    phone: "6281367281183",
    room: "Kebidanan",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/dharmilis.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p2",
    name: "apt. Ester Tampubolon, S.Farm",
    nip: "198110192010012020",
    str: "EA00001152127890",
    strValidity: "Seumur Hidup",
    sipa: "440/SIPA/0263/DPMPTSP-PPK/2026",
    sipaValidity: "31 Juli 2031",
    phone: "628129603330",
    room: "Penyakit Dalam Laki-laki dan Hasanah",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/ester.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p5",
    name: "apt. Gita Reflika, S.Farm",
    nip: "199105042024212031",
    str: "GB00001122525689",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0098/DPMPTSP-PPK/2021",
    sipaValidity: "29 April 2030",
    phone: "6285269394414",
    room: "Instalasi Gawat Darurat (IGD)",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/gita.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p1",
    name: "apt. Habib Almunawwar, S.Farm",
    nip: "199005302019021003",
    str: "UK00000108552085",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0070/DPMPTSP-PPK/2022",
    sipaValidity: "30 Mei 2027",
    phone: "6281377791910",
    room: "Instalasi Farmasi Rawat Jalan",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/habib.jpg",
    specialty: "Pelayanan Informasi Obat & Konseling"
  },
  {
    id: "p6",
    name: "apt. Lely Anggraeni, S.Farm",
    nip: "198510162023212003",
    str: "SN00000135311419",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0280/DPMPTSP-PPK/2023",
    sipaValidity: "6 November 2028",
    phone: "6281373370606",
    room: "Bedah dan ICU",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/lely.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p4",
    name: "apt. Suci Permata Sari, S.Farm",
    nip: "199606122020122024",
    str: "HI00001514507310",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0128/DPMPTSP-PPK/2021",
    sipaValidity: "26 Mei 2030",
    phone: "6281377526026",
    room: "Penyakit Dalam Perempuan",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/suci.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p7",
    name: "apt. Dian Pratiwi, S.Farm",
    nip: "198803292024212015",
    str: "JI00001093288072",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0059/DPMPTSP-PPK/2023",
    sipaValidity: "29 Maret 2028",
    phone: "6281373413627",
    room: "Kelas 2",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/dian.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p8",
    name: "apt. Muhammad Awaluddin, S.Farm",
    nip: "198407272006041006",
    str: "OL00000478386606",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0187/DPMPTSP-PPK/2024",
    sipaValidity: "23 Juli 2029",
    phone: "6282372729927",
    room: "Instalasi Bedah Sentral (IBS)",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/awal.jpg",
    specialty: "Instalasi Bedah Sentral (IBS)"
  },
  {
    id: "p9",
    name: "apt. Sri Hartati, S.Farm",
    nip: "199308162019022003",
    str: "XP00000934296315",
    strValidity: "Seumur Hidup",
    sipa: "440/SIPA/0260/DPMPTSP-PPK/2026",
    sipaValidity: "30 Juli 2031",
    phone: "6281287376506",
    room: "Anak 3",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/sri.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p10",
    name: "apt. Siti Adilah, S.Farm",
    nip: "199005222019022001",
    str: "OT00001130620320",
    strValidity: "Seumur Hidup",
    sipa: "446/IPA/0085/DPMPTSP-PPK/2025",
    sipaValidity: "5 Mei 2030",
    phone: "6282183844485",
    room: "Paru dan PICU",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/dila.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
  {
    id: "p11",
    name: "apt. Mery Dwi Susanti, S.Farm",
    nip: "198405252023212003",
    str: "GI00001966373573",
    strValidity: "Seumur Hidup",
    sipa: "440/SIPA/0162/DPMPTSP-PPK/2026",
    sipaValidity: "11 Mei 2031",
    phone: "6281930288078",
    room: "VVIP, VIP, dan Kelas 1",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/merry.jpg",
    specialty: "Farmasi Klinis Rawat Inap"
  },
];

interface PharmacistConsultationProps {
  isAdmin?: boolean;
}

export default function PharmacistConsultation({ isAdmin = false }: PharmacistConsultationProps) {
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>(() => {
    const saved = localStorage.getItem("pharmacistsData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Pharmacist[];
        const updated = parsed.map(p => {
          const initial = INITIAL_PHARMACISTS.find(i => i.id === p.id);
          // If initial data has changed (e.g. image, name), we overwrite to ensure updates are reflected
          if (initial && (p.name !== initial.name || p.imageUrl !== initial.imageUrl || p.str !== initial.str || p.sipa !== initial.sipa || p.specialty !== initial.specialty || p.sipaValidity !== initial.sipaValidity || p.strValidity !== initial.strValidity || p.schedule !== initial.schedule || p.room !== initial.room)) {
             return { ...p, ...initial };
          }
          return p;
        });
        const newInitial = INITIAL_PHARMACISTS.filter(
          (initial) => !updated.some((p) => p.id === initial.id)
        );
        return [...updated, ...newInitial].sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        return [...INITIAL_PHARMACISTS].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    return [...INITIAL_PHARMACISTS].sort((a, b) => a.name.localeCompare(b.name));
  });

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem("pharmacistsData", JSON.stringify(pharmacists));
    } catch {
      // ignore storage quota errors
    }
  }, [pharmacists]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPharmacist, setEditingPharmacist] = useState<Pharmacist | null>(null);

  const handleUpdateData = async () => {
    if (!csvFile) {
      setCsvError("Silakan pilih file CSV/Excel terlebih dahulu.");
      return;
    }
    const fileExt = csvFile.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'csv' || fileExt === 'tsv') {
      try {
        const Papa = (await import('papaparse')).default;
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            validateAndSetData(results.data as any[]);
          },
          error: (error) => {
            setCsvError("Gagal membaca file CSV: " + error.message);
          }
        });
      } catch (err) {
        setCsvError("Gagal memuat parser CSV: " + (err as Error).message);
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = await import('xlsx');
        const data = await csvFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetData(parsed as any[]);
      } catch (err) {
        setCsvError("Gagal membaca file Excel: " + (err as Error).message);
      }
    } else {
      setCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetData = (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      setPharmacists(prev => {
        const newData = parsed as Pharmacist[];
        const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
        const combined = [...prevFiltered, ...newData];
        return combined.sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsUpdateModalOpen(false);
      setCsvError("");
      setCsvFile(null);
      pushSiteUpdate({
        title: "Data Apoteker Diperbarui",
        description: `${parsed.length} data profil apoteker baru berhasil diimpor ke menu Konsultasi Apoteker.`,
        category: "data",
        targetTab: "pharmacist",
      });
    } else {
      setCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat.");
    }
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(INITIAL_PHARMACISTS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Apoteker");
    XLSX.writeFile(wb, "Template_Apoteker.xlsx");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacist) return;
    setPharmacists(prev => prev.map(p => p.id === editingPharmacist.id ? editingPharmacist : p));
    pushSiteUpdate({
      title: `Profil ${editingPharmacist.name} Diperbarui`,
      description: `Informasi ruangan (${editingPharmacist.room}) dan jadwal praktek telah diperbarui.`,
      category: "data",
      targetTab: "pharmacist",
    });
    setIsEditModalOpen(false);
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = encodeURIComponent(`Halo ${name}, saya ingin berkonsultasi mengenai obat...`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col h-full">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Konsultasi Apoteker
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih apoteker untuk berkonsultasi mengenai informasi obat, efek samping, dan cara penggunaan.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-xs shrink-0"
            >
              <Upload className="w-4 h-4" />
              Update Data
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5 items-stretch">
        {pharmacists.map((pharmacist) => (
          <div
            key={pharmacist.id}
            className="h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-colors flex flex-col sm:flex-row gap-5"
          >
            {/* Photo & Action Column (fixed width & pinned alignment) */}
            <div className="flex flex-col items-center justify-between gap-4 sm:w-40 shrink-0 sm:border-r sm:border-slate-100 sm:pr-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-emerald-50 bg-slate-100 shrink-0">
                <img
                  src={pharmacist.imageUrl}
                  alt={`Foto ${pharmacist.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <button
                type="button"
                onClick={() => handleWhatsAppClick(pharmacist.phone, pharmacist.name)}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>Hubungi via WA</span>
              </button>
            </div>

            {/* Details Column (strictly locked row alignment) */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3.5">
              {/* Header: Name & Specialty (uniform height) */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 min-h-[3.5rem]">
                <div className="min-w-0">
                  <h3
                    className="text-base font-bold text-slate-900 leading-snug truncate"
                    title={pharmacist.name}
                  >
                    {pharmacist.name}
                  </h3>
                  <p
                    className="text-xs text-emerald-700 font-semibold mt-0.5 truncate"
                    title={pharmacist.specialty}
                  >
                    {pharmacist.specialty}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPharmacist(pharmacist);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors shrink-0"
                    title="Edit Profil"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Structured Key-Value Rows: Locked label column + clean value column */}
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    NIP
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 truncate" title={pharmacist.nip}>
                    {pharmacist.nip}
                  </span>
                </div>

                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Nomor STR
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono tabular-nums font-semibold text-slate-800 truncate" title={pharmacist.str}>
                      {pharmacist.str}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Berlaku: {pharmacist.strValidity}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Nomor SIPA
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono tabular-nums font-semibold text-slate-800 truncate" title={pharmacist.sipa}>
                      {pharmacist.sipa}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Berlaku: {pharmacist.sipaValidity}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Ruangan
                  </span>
                  <span className="font-semibold text-slate-800 truncate" title={pharmacist.room}>
                    {pharmacist.room}
                  </span>
                </div>

                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Hari Praktek
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums truncate" title={pharmacist.schedule}>
                    {pharmacist.schedule}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Apoteker</h3>
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
                  Unggah data Apoteker dalam format CSV atau Excel (.xlsx). Pastikan file memiliki baris pertama sebagai header yang tepat.
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

      {isEditModalOpen && editingPharmacist && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Edit Profil Apoteker</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <form id="edit-pharmacist-form" onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nama</label>
                    <input type="text" value={editingPharmacist.name} onChange={e => setEditingPharmacist({...editingPharmacist, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Spesialisasi</label>
                    <input type="text" value={editingPharmacist.specialty} onChange={e => setEditingPharmacist({...editingPharmacist, specialty: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">NIP</label>
                    <input type="text" value={editingPharmacist.nip} onChange={e => setEditingPharmacist({...editingPharmacist, nip: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">WhatsApp (628...)</label>
                    <input type="text" value={editingPharmacist.phone} onChange={e => setEditingPharmacist({...editingPharmacist, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">STR</label>
                    <input type="text" value={editingPharmacist.str} onChange={e => setEditingPharmacist({...editingPharmacist, str: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Masa Berlaku STR</label>
                    <input type="text" value={editingPharmacist.strValidity} onChange={e => setEditingPharmacist({...editingPharmacist, strValidity: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">SIPA</label>
                    <input type="text" value={editingPharmacist.sipa} onChange={e => setEditingPharmacist({...editingPharmacist, sipa: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Masa Berlaku SIPA</label>
                    <input type="text" value={editingPharmacist.sipaValidity} onChange={e => setEditingPharmacist({...editingPharmacist, sipaValidity: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Ruangan</label>
                    <input type="text" value={editingPharmacist.room} onChange={e => setEditingPharmacist({...editingPharmacist, room: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Jadwal</label>
                    <input type="text" value={editingPharmacist.schedule} onChange={e => setEditingPharmacist({...editingPharmacist, schedule: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">URL Gambar (Opsional)</label>
                    <input type="text" value={editingPharmacist.imageUrl} onChange={e => setEditingPharmacist({...editingPharmacist, imageUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                type="button"
              >
                Batal
              </button>
              <button
                type="submit"
                form="edit-pharmacist-form"
                className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
