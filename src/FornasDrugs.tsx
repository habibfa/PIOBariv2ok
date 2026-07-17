import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Filter, ArrowUpDown, Download, Upload, X, Save, FileSpreadsheet, Plus, Minus } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface FornasDrug {
  id: string;
  kelasTerapi: string;
  subKelasTerapi: string;
  namaObat: string;
  bentukSediaan: string;
  restriksi: string;
  peresepanMaksimal: string;
  fpktp: string;
  fpktl: string;
  oen: string;
  catatan: string;
}

const INITIAL_FORNAS_DATA: FornasDrug[] = [
  {
    id: "f1",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NONSTEROID, ANTIPIRAI",
    subKelasTerapi: "Analgesik Narkotik",
    namaObat: "Fentanil",
    bentukSediaan: "inj 0,05 mg/mL (i.m./i.v.)",
    restriksi: "Hanya untuk nyeri berat yang tidak teratasi dengan analgesik non narkotik dan nyeri pada tindakan pembedahan.",
    peresepanMaksimal: "5 amp/kasus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f2",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NONSTEROID, ANTIPIRAI",
    subKelasTerapi: "Analgesik Non Narkotik",
    namaObat: "Parasetamol",
    bentukSediaan: "tab 500 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f2_2",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NONSTEROID, ANTIPIRAI",
    subKelasTerapi: "Analgesik Non Narkotik",
    namaObat: "Parasetamol",
    bentukSediaan: "syr 120 mg/5 mL",
    restriksi: "-",
    peresepanMaksimal: "1 btl/kasus.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f3",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NONSTEROID, ANTIPIRAI",
    subKelasTerapi: "Antiinflamasi Nonsteroid",
    namaObat: "Meloksikam",
    bentukSediaan: "tab 15 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f4",
    kelasTerapi: "ANTIALERGI dan OBAT untuk ANAFILAKSIS",
    subKelasTerapi: "Antialergi",
    namaObat: "Loratadin",
    bentukSediaan: "tab 10 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f5",
    kelasTerapi: "ANTIEPILEPSI - ANTIKONVULSI",
    subKelasTerapi: "Antiepilepsi",
    namaObat: "Fenitoin",
    bentukSediaan: "kaps 100 mg",
    restriksi: "-",
    peresepanMaksimal: "90 kaps/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f6",
    kelasTerapi: "ANTIMIKROBA",
    subKelasTerapi: "Antibakteri Beta Laktam",
    namaObat: "Amoksisilin",
    bentukSediaan: "kaps 500 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f7",
    kelasTerapi: "ANTIMIKROBA",
    subKelasTerapi: "Antibakteri Lain",
    namaObat: "Siprofloksasin",
    bentukSediaan: "tab 500 mg",
    restriksi: "-",
    peresepanMaksimal: "10 tab/kasus.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f8",
    kelasTerapi: "OBAT KARDIOVASKULER",
    subKelasTerapi: "Antihipertensi",
    namaObat: "Amlodipin",
    bentukSediaan: "tab 10 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f9",
    kelasTerapi: "OBAT KARDIOVASKULER",
    subKelasTerapi: "Antihipertensi",
    namaObat: "Bisoprolol",
    bentukSediaan: "tab 5 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f10",
    kelasTerapi: "OBAT UNTUK SALURAN PENCERNAAN",
    subKelasTerapi: "Antasida dan Ulkus Peptikum",
    namaObat: "Omeprazol",
    bentukSediaan: "kaps 20 mg",
    restriksi: "Untuk terapi tukak peptik dan refluks gastroesofageal.",
    peresepanMaksimal: "30 kaps/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f11",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIVIRUS",
    namaObat: "Abakavir",
    bentukSediaan: "tab 300 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "Disediakan program"
  },
  {
    id: "f12",
    kelasTerapi: "OBAT KARDIOVASKULER",
    subKelasTerapi: "ANTIARITMIA",
    namaObat: "Adenosin",
    bentukSediaan: "inj 3mg/ml",
    restriksi: "Digunakan untuk mengatasi SVT (dibuktikan dengan EKG). Digunakan untuk uji pembebanan jantung.",
    peresepanMaksimal: "Maks 5 ampul",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f13",
    kelasTerapi: "ANTINEOPLASTIK",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib",
    bentukSediaan: "tab sal selaput 40 mg",
    restriksi: "Untuk NSCLC jenis non squamous yang locally advanced atau metastatik dengan EGFR exon 19 delesi atau mutasi subsitusi exon 21 (L858R atau L861Q), substitusi exon 18 (G719X), atau substitusi mutasi exon 20 (S7681), pada pasien yang belum pernah mendapatkan TKI sebelumnya. Dosis terapi adalah 40 mg, diberikan 1x1 sehari. Tidak digunakan sebagai lini kedua. Jika terjadi progresi pada salah satu (gefitinib, erlotinib, atau afatinib), maka tidak dapat diganti dengan obat-obat tersebut. Dosis 20 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan",
    peresepanMaksimal: "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f14",
    kelasTerapi: "ANTINEOPLASTIK",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib",
    bentukSediaan: "tab sal selaput 30 mg",
    restriksi: "Dosis 30 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan.",
    peresepanMaksimal: "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus. 30 tab/bulan.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f15",
    kelasTerapi: "ANTINEOPLASTIK",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib",
    bentukSediaan: "tab sal selaput 20 mg",
    restriksi: "-",
    peresepanMaksimal: "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f16",
    kelasTerapi: "LARUTAN INTRAVENA",
    subKelasTerapi: "LAIN-LAIN",
    namaObat: "Air steril untuk injeksi",
    bentukSediaan: "cairan inj",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f17",
    kelasTerapi: "LARUTAN INTRAVENA",
    subKelasTerapi: "LAIN-LAIN",
    namaObat: "Air untuk irigasi",
    bentukSediaan: "cairan irigasi",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f18",
    kelasTerapi: "HORMON, ANTIDIABETIK",
    subKelasTerapi: "ANTIDIABETES",
    namaObat: "Akarbose",
    bentukSediaan: "tab 50 mg",
    restriksi: "-",
    peresepanMaksimal: "90 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f19",
    kelasTerapi: "HORMON, ANTIDIABETIK",
    subKelasTerapi: "ANTIDIABETES",
    namaObat: "Akarbose",
    bentukSediaan: "tab 100 mg",
    restriksi: "-",
    peresepanMaksimal: "90 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f20",
    kelasTerapi: "OBAT dan SEDIAAN UNTUK MATA",
    subKelasTerapi: "PREPARAT MATA LAINNYA",
    namaObat: "Akuades",
    bentukSediaan: "cairan 500 ml",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f21",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "tab 400 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "Pada wanita hamil"
  },
  {
    id: "f22",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "susp 200 mg/5ml",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f23",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "susp 400 mg/10ml",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  }
];

interface FornasDrugsProps {
  isAdmin?: boolean;
}

export default function FornasDrugs({ isAdmin = false }: FornasDrugsProps) {
  const [fornasData, setFornasData] = useState<FornasDrug[]>(() => {
    const saved = localStorage.getItem("fornasData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FORNAS_DATA;
      }
    }
    return INITIAL_FORNAS_DATA;
  });

  useEffect(() => {
    localStorage.setItem("fornasData", JSON.stringify(fornasData));
  }, [fornasData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [selectedFaskes, setSelectedFaskes] = useState("All");

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState("");

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
      } catch (err: any) {
        setCsvError("Gagal membaca file Excel: " + err.message);
      }
    } else {
      setCsvError("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx)");
    }
  };

  const validateAndSetData = (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].namaObat !== undefined) {
       setFornasData(prev => {
         const newData = parsed as FornasDrug[];
         const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
         const combined = [...prevFiltered, ...newData];
         return combined.sort((a, b) => a.namaObat.localeCompare(b.namaObat));
       });
       setIsUpdateModalOpen(false);
       setCsvError("");
       setCsvFile(null);
    } else {
       setCsvError("Format file tidak valid. Pastikan baris pertama berisi header (id, kelasTerapi, subKelasTerapi, namaObat, bentukSediaan, restriksi, peresepanMaksimal, fpktp, fpktl, oen, catatan).");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = INITIAL_FORNAS_DATA.slice(0, 3);
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Template_Data_Fornas.xlsx");
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (namaObat: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [namaObat]: !prev[namaObat]
    }));
  };

  const groupedData = useMemo(() => {
    const filtered = fornasData.filter((drug) => {
      const matchesSearch = 
        drug.kelasTerapi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.subKelasTerapi.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesName = drug.namaObat.toLowerCase().includes(nameFilter.toLowerCase());

      let matchesFaskes = true;
      if (selectedFaskes === "FPKTP") {
        matchesFaskes = Boolean(drug.fpktp && drug.fpktp !== "-" && drug.fpktp !== "");
      } else if (selectedFaskes === "FPKTL") {
        matchesFaskes = Boolean(drug.fpktl && drug.fpktl !== "-" && drug.fpktl !== "");
      }

      return matchesSearch && matchesFaskes && matchesName;
    });

    const groups: Record<string, FornasDrug[]> = {};
    filtered.forEach(drug => {
      const key = drug.namaObat;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(drug);
    });

    return Object.values(groups).sort((a, b) => a[0].namaObat.localeCompare(b[0].namaObat));
  }, [searchTerm, nameFilter, selectedFaskes, fornasData]);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col h-full">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Daftar Obat Fornas
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Formularium Nasional (Fornas) Kementerian Kesehatan Republik Indonesia.
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Data Berdasarkan KMK NOMOR HK.01.07/MENKES/1199/2025 tentang Formularium Nasional tanggal 31 Desember 2025, berlaku pada 1 April 2026.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Update Data
              </button>
            )}
            <a
              href="/fornas_2025.pdf"
              download
              className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Sumber
            </a>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelas terapi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama obat..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedFaskes}
              onChange={(e) => setSelectedFaskes(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            >
              <option value="All">Semua Faskes</option>
              <option value="FPKTP">FPKTP</option>
              <option value="FPKTL">FPKTL</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[150px]">Kelas Terapi</th>
                <th className="px-4 py-3 min-w-[200px]">Nama Obat</th>
                <th className="px-4 py-3 min-w-[120px]">Bentuk Sediaan</th>
                <th className="px-4 py-3 min-w-[200px]">Restriksi</th>
                <th className="px-4 py-3 min-w-[150px]">Maks. Peresepan</th>
                <th className="px-4 py-3 min-w-[80px]">FPKTP</th>
                <th className="px-4 py-3 min-w-[80px]">FPKTL</th>
                <th className="px-4 py-3 min-w-[80px]">OEN</th>
                <th className="px-4 py-3 min-w-[200px]">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedData.length > 0 ? (
                groupedData.map((group) => {
                  const drug = group[0];
                  const hasMultiple = group.length > 1;
                  const isExpanded = expandedGroups[drug.namaObat];
                  
                  return (
                  <React.Fragment key={drug.namaObat}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">{drug.kelasTerapi}</div>
                        <div className="text-xs text-slate-500 mt-1">{drug.subKelasTerapi}</div>
                      </td>
                      <td className="px-4 py-3 align-top font-bold text-emerald-700">
                        <div className="flex items-center gap-2">
                          {hasMultiple && (
                            <button 
                              onClick={() => toggleGroup(drug.namaObat)}
                              className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                            >
                              {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                          )}
                          {drug.namaObat}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {hasMultiple && !isExpanded ? (
                          <span className="text-xs font-semibold text-slate-500">{group.length} Sediaan</span>
                        ) : (
                          drug.bentukSediaan
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs leading-relaxed">
                        {hasMultiple && !isExpanded ? "-" : drug.restriksi}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        {hasMultiple && !isExpanded ? "-" : drug.peresepanMaksimal}
                      </td>
                      <td className="px-4 py-3 align-top font-medium text-center">
                        {hasMultiple && !isExpanded ? "-" : (drug.fpktp && drug.fpktp !== "-" ? <span className="text-emerald-600 font-bold">{drug.fpktp}</span> : <span className="text-slate-300">-</span>)}
                      </td>
                      <td className="px-4 py-3 align-top font-medium text-center">
                        {hasMultiple && !isExpanded ? "-" : (drug.fpktl && drug.fpktl !== "-" ? <span className="text-emerald-600 font-bold">{drug.fpktl}</span> : <span className="text-slate-300">-</span>)}
                      </td>
                      <td className="px-4 py-3 align-top font-medium text-center">
                        {hasMultiple && !isExpanded ? "-" : (drug.oen && drug.oen !== "-" ? <span className="text-emerald-600 font-bold">{drug.oen}</span> : <span className="text-slate-300">-</span>)}
                      </td>
                      <td className="px-4 py-3 align-top text-xs leading-relaxed text-slate-600">
                        {hasMultiple && !isExpanded ? "-" : (drug.catatan !== "-" ? drug.catatan : "")}
                      </td>
                    </tr>
                    {hasMultiple && isExpanded && group.slice(1).map((subDrug) => (
                      <tr key={subDrug.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 align-top border-l-4 border-emerald-500"></td>
                        <td className="px-4 py-3 align-top font-bold text-emerald-700 pl-10">
                        </td>
                        <td className="px-4 py-3 align-top">{subDrug.bentukSediaan}</td>
                        <td className="px-4 py-3 align-top text-xs leading-relaxed">
                          {subDrug.restriksi}
                        </td>
                        <td className="px-4 py-3 align-top text-xs">
                          {subDrug.peresepanMaksimal}
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-center">
                          {subDrug.fpktp && subDrug.fpktp !== "-" ? <span className="text-emerald-600 font-bold">{subDrug.fpktp}</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-center">
                          {subDrug.fpktl && subDrug.fpktl !== "-" ? <span className="text-emerald-600 font-bold">{subDrug.fpktl}</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-center">
                          {subDrug.oen && subDrug.oen !== "-" ? <span className="text-emerald-600 font-bold">{subDrug.oen}</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="px-4 py-3 align-top text-xs leading-relaxed text-slate-600">
                          {subDrug.catatan !== "-" ? subDrug.catatan : ""}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data obat yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {groupedData.length > 0 ? (
            groupedData.map((group) => {
              const drug = group[0];
              const hasMultiple = group.length > 1;
              const isExpanded = expandedGroups[drug.namaObat];
              
              return (
              <div key={`mob-${drug.namaObat}`} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {hasMultiple && (
                    <button 
                      onClick={() => toggleGroup(drug.namaObat)}
                      className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                    >
                      {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  )}
                  <h3 className="font-bold text-emerald-700 text-base leading-tight">{drug.namaObat}</h3>
                </div>
                
                {(!hasMultiple || isExpanded) && (
                  <>
                    <div className="text-xs font-bold text-slate-800">{drug.bentukSediaan}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${drug.fpktp && drug.fpktp !== "-" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                        FPKTP
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${drug.fpktl && drug.fpktl !== "-" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                        FPKTL
                      </span>
                      {drug.oen && drug.oen !== "-" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                          OEN
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-700 leading-tight">{drug.kelasTerapi}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{drug.subKelasTerapi}</div>
                    </div>
                    {drug.restriksi !== "-" && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        <span className="font-semibold block mb-1">Restriksi:</span>
                        {drug.restriksi}
                      </div>
                    )}
                    {drug.peresepanMaksimal !== "-" && (
                      <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 leading-relaxed">
                        <span className="font-semibold block mb-1">Maks. Peresepan:</span> 
                        {drug.peresepanMaksimal}
                      </div>
                    )}
                    {drug.catatan !== "-" && (
                      <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 leading-relaxed">
                        <span className="font-semibold block mb-1">Catatan:</span> 
                        {drug.catatan}
                      </div>
                    )}
                  </>
                )}

                {hasMultiple && !isExpanded && (
                  <div className="text-xs text-slate-500">{group.length} Varian Sediaan</div>
                )}

                {hasMultiple && isExpanded && group.slice(1).map((subDrug) => (
                  <div key={`mob-${subDrug.id}`} className="mt-4 pt-4 border-t border-slate-100 space-y-3 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></div>
                    <div className="pl-3 space-y-3">
                      <div className="text-xs font-bold text-slate-800">{subDrug.bentukSediaan}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subDrug.fpktp && subDrug.fpktp !== "-" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          FPKTP
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subDrug.fpktl && subDrug.fpktl !== "-" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                          FPKTL
                        </span>
                        {subDrug.oen && subDrug.oen !== "-" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                            OEN
                          </span>
                        )}
                      </div>
                      {subDrug.restriksi !== "-" && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          <span className="font-semibold block mb-1">Restriksi:</span>
                          {subDrug.restriksi}
                        </div>
                      )}
                      {subDrug.peresepanMaksimal !== "-" && (
                        <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 leading-relaxed">
                          <span className="font-semibold block mb-1">Maks. Peresepan:</span> 
                          {subDrug.peresepanMaksimal}
                        </div>
                      )}
                      {subDrug.catatan !== "-" && (
                        <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 leading-relaxed">
                          <span className="font-semibold block mb-1">Catatan:</span> 
                          {subDrug.catatan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Tidak ada data obat yang sesuai dengan pencarian Anda.
            </div>
          )}
        </div>
      </div>



      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Update Data Fornas</h3>
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
                  Unggah data Fornas dalam format CSV atau Excel (.xlsx). Pastikan file memiliki baris pertama sebagai header dengan nama kolom berikut secara tepat: <br/>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-emerald-600">id, kelasTerapi, subKelasTerapi, namaObat, bentukSediaan, restriksi, peresepanMaksimal, fpktp, fpktl, oen, catatan</code>
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template Excel
                </button>
              </div>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-3" />
                    <p className="mb-2 text-sm text-slate-500 font-semibold">
                      {csvFile ? csvFile.name : "Klik untuk mengunggah file CSV/Excel"}
                    </p>
                    <p className="text-xs text-slate-400">CSV, TSV, XLSX, XLS (Max. 10MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    accept=".csv, .tsv, text/csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setCsvFile(e.target.files[0]);
                        setCsvError("");
                      }
                    }}
                  />
                </label>
              </div>
              {csvError && (
                <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm font-semibold border border-rose-100">
                  {csvError}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
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
}
