import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, Save, X, Edit, Download } from 'lucide-react';
import { User, Phone, MapPin, Calendar, FileText, Award, ShieldCheck } from 'lucide-react';

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
    strValidity: "Seumur hidup",
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
    strValidity: "Seumur hidup",
    sipa: "446/IPA/0273/DPMPTSP-PPK/2021",
    sipaValidity: "19 Oktober 2026",
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
    strValidity: "Seumur hidup",
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
    strValidity: "Seumur hidup",
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
    strValidity: "Seumur hidup",
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
    strValidity: "Seumur hidup",
    sipa: "446/IPA/0059/DPMPTSP-PPK/2023",
    sipaValidity: "29 Maret 2026",
    phone: "6281373413627",
    room: "Kelas 2",
    schedule: "Senin - Jumat, 08:00 - 14:00",
    imageUrl: "/dian.jpg",
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
          if (initial && (p.name !== initial.name || p.imageUrl !== initial.imageUrl || p.str !== initial.str || p.sipa !== initial.sipa || p.specialty !== initial.specialty)) {
             return { ...p, ...initial };
          }
          return p;
        });
        const newInitial = INITIAL_PHARMACISTS.filter(
          (initial) => !updated.some((p) => p.id === initial.id)
        );
        return [...updated, ...newInitial];
      } catch (e) {
        return INITIAL_PHARMACISTS;
      }
    }
    return INITIAL_PHARMACISTS;
  });

  useEffect(() => {
    localStorage.setItem("pharmacistsData", JSON.stringify(pharmacists));
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
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
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
    } else {
      setCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat.");
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(INITIAL_PHARMACISTS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Apoteker");
    XLSX.writeFile(wb, "Template_Apoteker.xlsx");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacist) return;
    setPharmacists(prev => prev.map(p => p.id === editingPharmacist.id ? editingPharmacist : p));
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {pharmacists.map((pharmacist) => (
          <div
            key={pharmacist.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6"
          >
            {/* Photo & Action Column */}
            <div className="flex flex-col items-center gap-4 sm:w-48 shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-50 shadow-sm bg-slate-100 shrink-0">
                <img
                  src={pharmacist.imageUrl}
                  alt={`Foto ${pharmacist.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center w-full">
                <button
                  onClick={() => handleWhatsAppClick(pharmacist.phone, pharmacist.name)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  Hubungi via WA
                </button>
              </div>
            </div>

            {/* Details Column */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">
                    {pharmacist.name}
                  </h3>
                  <p className="text-sm text-emerald-600 font-medium mt-0.5">
                    {pharmacist.specialty}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingPharmacist(pharmacist);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors ml-auto"
                    title="Edit Profil"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block font-medium">NIP</span>
                    <span className="text-slate-800 font-semibold">{pharmacist.nip}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block font-medium">Nomor STR</span>
                    <span className="text-slate-800 font-semibold">{pharmacist.str}</span>
                    <span className="text-slate-500 block mt-0.5 text-[10px]">
                      Berlaku: {pharmacist.strValidity}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="pr-2">
                    <span className="text-slate-500 block font-medium">Nomor SIPA</span>
                    <span className="text-slate-800 font-semibold break-words">{pharmacist.sipa}</span>
                    <span className="text-slate-500 block mt-0.5 text-[10px]">
                      Berlaku: {pharmacist.sipaValidity}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block font-medium">Ruangan</span>
                    <span className="text-slate-800 font-semibold">{pharmacist.room}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:col-span-2">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block font-medium">Hari Praktek</span>
                    <span className="text-slate-800 font-semibold">{pharmacist.schedule}</span>
                  </div>
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
