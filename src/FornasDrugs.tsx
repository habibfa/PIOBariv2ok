import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, ArrowUpDown, Download, Upload, X, Save, 
  FileSpreadsheet, Plus, Minus, Trash2, Info, ChevronDown, ChevronUp,
  AlertTriangle, Repeat, ShieldAlert, AlertCircle, Sparkles
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { INITIAL_FORNAS_DATA, FornasDrug } from './data/fornasData';
import { getDrugSafetyAlert, DrugSafetyAlert } from './data/drugSafetyAlerts';

interface FornasDrugsProps {
  isAdmin?: boolean;
}


const ExpandableText = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text === "-") return <span>-</span>;
  if (text.length <= maxLength) return <span>{text}</span>;

  return (
    <div>
      <span>{isExpanded ? text : `${text.substring(0, maxLength)}...`}</span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-emerald-600 font-medium ml-1 hover:underline focus:outline-none"
      >
        {isExpanded ? "Tutup" : "Selengkapnya"}
      </button>
    </div>
  );
};


export default function FornasDrugs({ isAdmin = false }: FornasDrugsProps) {
  const [fornasData, setFornasData] = useState<FornasDrug[]>(() => {
    const saved = localStorage.getItem("fornasData_v7_complete");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FornasDrug[];
        // Validate that parsed data is complete and not contaminated
        const isCorrupted = parsed.some(p => 
          p.namaObat === "Hari." || 
          p.namaObat.startsWith("Hari ") || 
          p.namaObat.includes("luas permukaan") ||
          p.namaObat.startsWith("(")
        );
        if (Array.isArray(parsed) && parsed.length >= 1200 && !isCorrupted) {
          return parsed;
        }
      } catch (e) {
        // fallback to initial
      }
    }
    // Purge outdated caches
    localStorage.removeItem("fornasData_v6_clean");
    localStorage.removeItem("fornasData_v5_clean");
    localStorage.removeItem("fornasData_v4_kmk1199");
    localStorage.removeItem("fornasData_v3");
    localStorage.removeItem("fornasData_v2");
    return INITIAL_FORNAS_DATA;
  });

  useEffect(() => {
    localStorage.setItem("fornasData_v7_complete", JSON.stringify(fornasData));
  }, [fornasData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState("all");
  const [selectedFaskes, setSelectedFaskes] = useState("All");
  const [safetyFilter, setSafetyFilter] = useState<'ALL' | 'HIGH_ALERT' | 'LASA' | 'ANY_ALERT'>('ALL');
  const [selectedSafetyDrug, setSelectedSafetyDrug] = useState<{ drug: FornasDrug; safety: DrugSafetyAlert } | null>(null);

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
       setCsvError("Format file tidak valid. Pastikan baris pertama berisi header (id, kelasTerapi, subKelasTerapi, namaObat, bentukSediaan, restriksi, peresepanMaksimal, fpktp, fpktl, oen).");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = INITIAL_FORNAS_DATA.slice(0, 3);
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Template_Data_Fornas.xlsx");
  };

  const handleExportFullData = () => {
    const worksheet = XLSX.utils.json_to_sheet(fornasData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fornas_KMK_1199_2025");
    XLSX.writeFile(workbook, `Fornas_KMK_1199_2025_${fornasData.length}_Obat.xlsx`);
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showKeterangan, setShowKeterangan] = useState(false);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Safety Statistics across all drugs in dataset
  const safetyStats = useMemo(() => {
    let haCount = 0;
    let lasaCount = 0;
    let anyCount = 0;

    fornasData.forEach(d => {
      const alert = getDrugSafetyAlert(d);
      if (alert.highAlert) haCount++;
      if (alert.lasa) lasaCount++;
      if (alert.highAlert || alert.lasa) anyCount++;
    });

    return { haCount, lasaCount, anyCount };
  }, [fornasData]);

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

      let matchesAlphabet = true;
      if (selectedAlphabet !== "all") {
        matchesAlphabet = drug.namaObat.charAt(0).toUpperCase() === selectedAlphabet;
      }

      let matchesSafety = true;
      if (safetyFilter !== 'ALL') {
        const safety = getDrugSafetyAlert(drug);
        if (safetyFilter === 'HIGH_ALERT') {
          matchesSafety = Boolean(safety.highAlert);
        } else if (safetyFilter === 'LASA') {
          matchesSafety = Boolean(safety.lasa);
        } else if (safetyFilter === 'ANY_ALERT') {
          matchesSafety = Boolean(safety.highAlert || safety.lasa);
        }
      }

      return matchesSearch && matchesFaskes && matchesName && matchesAlphabet && matchesSafety;
    });

    const groups: Record<string, FornasDrug[]> = {};
    filtered.forEach(drug => {
      const key = `${drug.kelasTerapi}|${drug.namaObat}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(drug);
    });

    return Object.values(groups).sort((a, b) => a[0].namaObat.localeCompare(b[0].namaObat));
  }, [searchTerm, nameFilter, selectedAlphabet, selectedFaskes, safetyFilter, fornasData]);

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
              Data Berdasarkan Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/1199/2025 tentang Formularium Nasional tanggal 31 Desember 2025, berlaku efektif 1 April 2026.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Resmi KMK 1199/2025
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                30 Kelas Terapi
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {new Set(fornasData.map(d => d.namaObat)).size} Obat Generik
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {fornasData.length} Bentuk Sediaan
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Update Data
                </button>
                <button
                  onClick={() => setFornasData(INITIAL_FORNAS_DATA)}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Pulihkan Standar Resmi
                </button>
                <button
                  onClick={() => setFornasData([])}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Bersihkan Data
                </button>
              </>
            )}
            <div className="flex flex-wrap sm:flex-col gap-2">
              <button
                onClick={handleExportFullData}
                className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                title="Unduh seluruh data Fornas resmi ke format Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Ekspor Excel ({fornasData.length})
              </button>
              <a
                href="/fornas_2025.pdf"
                download
                className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
        
        {/* Keterangan */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowKeterangan(!showKeterangan)}
            className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors hover:bg-emerald-100/50"
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-900">Keterangan / Petunjuk Penggunaan Fornas</span>
            </div>
            {showKeterangan ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-emerald-600" />}
          </button>
          {showKeterangan && (
            <div className="px-4 pb-4 pt-1 text-sm text-emerald-800 space-y-2 leading-relaxed">
              <p><strong>a.</strong> Sistematika penggolongan nama obat didasarkan pada kelas terapi, subkelas terapi, sub-subkelas terapi, nama generik obat, sediaan/kekuatan, restriksi, tingkat fasilitas pelayanan kesehatan dan peresepan maksimal.</p>
              <p><strong>b.</strong> Penulisan nama obat disusun berdasarkan abjad nama obat dan dituliskan sesuai Farmakope Indonesia edisi terakhir. Jika tidak ada dalam Farmakope Indonesia, maka digunakan International Non-proprietary Names (INN)/nama generik yang diterbitkan WHO. Obat yang sudah lazim digunakan dan tidak mempunyai nama INN (generik) ditulis dengan nama lazimnya. Obat kombinasi yang tidak mempunyai nama INN (generik) diberi nama yang disepakati sebagai nama generik untuk kombinasi dan dituliskan masing-masing komponen zat berkhasiatnya disertai kekuatan masing-masing komponen. Untuk beberapa hal yang dianggap perlu nama sinonim, dituliskan di antara tanda kurung.</p>
              <p><strong>c.</strong> Satu jenis obat dapat tercantum dalam beberapa kelas terapi, subkelas atau sub-subkelas terapi sesuai indikasi medis. Satu jenis obat dapat terdiri dari beberapa bentuk sediaan dan satu bentuk sediaan dapat terdiri dari beberapa jenis kekuatan.</p>
              <p><strong>d.</strong> Tanda simbol [P] menunjukkan bahwa obat tersebut pengadaannya disediakan oleh Program Kementerian Kesehatan atau Program Badan Kependudukan dan Keluarga Berencana dengan ketentuan sebagai berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>1) Apabila tercantum di belakang nama zat aktif, maka ketentuan ini berlaku untuk semua kekuatan dan bentuk sediaan zat aktif tersebut.</li>
                <li>2) Apabila tercantum di belakang masing-masing kekuatan atau bentuk sediaan zat aktif tertentu, maka ketentuan ini berlaku hanya untuk kekuatan atau bentuk sediaan zat aktif tersebut.</li>
              </ul>
              <p><strong>e.</strong> Tanda simbol [Ca] yang tercantum di belakang nama zat aktif menunjukkan bahwa obat antineoplastik.</p>
              <p><strong>f.</strong> Tanda centang (√) pada kolom FPKTP menunjukkan obat yang dipakai di FPKTP untuk pelayanan kesehatan primer.</p>
              <p><strong>g.</strong> Tanda centang (√) dan tulisan "PP" pada kolom FPKTP menunjukkan obat yang dipakai di Puskesmas Perawatan.</p>
              <p><strong>h.</strong> Tanda centang (√) pada kolom FPKTL menunjukkan obat yang dipakai di FPKTL untuk pelayanan kesehatan spesialistik atau sub spesialistik.</p>
              <p><strong>i.</strong> Tanda bintang (*) menunjukkan bahwa obat tersebut dapat disediakan dan diberikan oleh FPKTP atau apotek yang bekerjasama dengan BPJS Kesehatan untuk program rujuk balik dengan ketentuan sebagai berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>1) Apabila tercantum di belakang nama zat aktif, maka ketentuan ini berlaku untuk semua kekuatan dan bentuk sediaan zat aktif tersebut.</li>
                <li>2) Apabila tercantum di belakang masing-masing kekuatan atau bentuk sediaan zat aktif tertentu, maka ketentuan ini berlaku hanya untuk kekuatan atau bentuk sediaan zat aktif tersebut.</li>
              </ul>
              <p><strong>j.</strong> Tanda centang bintang (√*) menunjukkan bahwa initial treatment dilakukan di FPKTL, yang kemudian selanjutnya obat tersebut dapat disediakan dan diberikan oleh FPKTP atau apotek yang bekerjasama dengan Badan Penyelenggara Jaminan Sosial Kesehatan untuk program rujuk balik.</p>
              <p><strong>k.</strong> Penulisan restriksi dilakukan dengan ketentuan sebagai berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>1) Apabila tercantum di bawah kelas terapi/sub kelas terapi, maka ketentuan ini berlaku untuk semua item obat yang termasuk di dalam kelas terapi/sub kelas terapi tersebut.</li>
                <li>2) Apabila tercantum di bawah nama zat aktif, maka ketentuan ini berlaku untuk semua kekuatan dan bentuk sediaan zat aktif tersebut.</li>
                <li>3) Apabila tercantum di bawah masing-masing kekuatan atau bentuk sediaan zat aktif tertentu, maka ketentuan ini berlaku hanya untuk kekuatan atau bentuk sediaan zat aktif tersebut.</li>
              </ul>
              <p><strong>l.</strong> Peresepan maksimal dituliskan di samping masing-masing kekuatan dan/atau bentuk sediaan zat aktif.</p>
              <p><strong>m.</strong> Tanda centang (√) dalam kolom OEN menunjukkan obat yang termasuk dalam obat esensial.</p>
              <p><strong>n.</strong> Peringatan Visual <strong>High Alert</strong> (ikon segitiga merah) menandakan Obat Kewaspadaan Tinggi (High-Alert Medications) yang berisiko fatal jika terjadi kesalahan peresepan/pemberian sesuai standar KARS SNARS dan ISMP (seperti sitostatika, narkotika, insulin, elektrolit konsentrat pekat, pelemas otot, dan vasopresor). Wajib double-check independen.</p>
              <p><strong>o.</strong> Peringatan Visual <strong>LASA / NORUM</strong> (ikon panah kuning/oranye) menandakan obat Look-Alike Sound-Alike (Nama Obat Rupa Ucapan Mirip). Disertai rekomendasi Tall-Man Lettering dan daftar obat pasangan yang rentan tertukar untuk mencegah medication error.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
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
          
          {/* Safety Category Filter Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                Filter Kewaspadaan:
              </span>
              <button
                type="button"
                onClick={() => setSafetyFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  safetyFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({fornasData.length})
              </button>
              <button
                type="button"
                onClick={() => setSafetyFilter('HIGH_ALERT')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  safetyFilter === 'HIGH_ALERT'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                High Alert ({safetyStats.haCount})
              </button>
              <button
                type="button"
                onClick={() => setSafetyFilter('LASA')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  safetyFilter === 'LASA'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                LASA / NORUM ({safetyStats.lasaCount})
              </button>
              <button
                type="button"
                onClick={() => setSafetyFilter('ANY_ALERT')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  safetyFilter === 'ANY_ALERT'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Semua Alert ({safetyStats.anyCount})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span>💡 Klik ikon</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                <AlertTriangle className="w-2.5 h-2.5" /> High Alert
              </span>
              <span>/</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                <Repeat className="w-2.5 h-2.5" /> LASA
              </span>
              <span>untuk panduan</span>
            </div>
          </div>
          
          {/* Alphabet Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Berdasarkan Alfabet Nama Obat</label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedAlphabet("all")}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  selectedAlphabet === "all" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Semua
              </button>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                const hasDrugs = fornasData.some(p => p.namaObat.charAt(0).toUpperCase() === letter);
                return (
                  <button
                    key={letter}
                    onClick={() => hasDrugs && setSelectedAlphabet(letter)}
                    disabled={!hasDrugs}
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${
                      selectedAlphabet === letter
                        ? "bg-emerald-600 text-white shadow-xs"
                        : hasDrugs
                        ? "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                        : "bg-transparent text-slate-300 cursor-not-allowed border border-slate-100/50"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
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
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedData.length > 0 ? (
                groupedData.map((group) => {
                  const drug = group[0];
                  const hasMultiple = group.length > 1;
                  const groupKey = `${drug.kelasTerapi}|${drug.namaObat}`;
                  const isExpanded = expandedGroups[groupKey];
                  const safety = getDrugSafetyAlert(drug);
                  const isLasa = !!safety.lasa;
                  
                  return (
                  <React.Fragment key={groupKey}>
                    <tr className={`drug-table-row transition-colors ${
                      isLasa 
                        ? "has-lasa drug-table-row-lasa" 
                        : "hover:bg-slate-50"
                    }`}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">{drug.kelasTerapi}</div>
                        <div className="text-xs text-slate-500 mt-1">{drug.subKelasTerapi}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          {hasMultiple && (
                            <button 
                              onClick={() => toggleGroup(groupKey)}
                              className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                            >
                              {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                          )}
                          <span className="text-slate-900 font-bold">{drug.namaObat}</span>
                        </div>

                        {/* Peringatan Visual: Icon Alert High Alert & LASA */}
                        {(safety.highAlert || safety.lasa) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {safety.highAlert && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSafetyDrug({ drug, safety });
                                }}
                                title={`${safety.highAlert.categoryLabel}: Klik untuk melihat panduan keselamatan KARS/ISMP`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs group"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                                <span>High Alert</span>
                              </button>
                            )}
                            {safety.lasa && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSafetyDrug({ drug, safety });
                                }}
                                title={`LASA / NORUM: Waspada tertukar dengan ${safety.lasa.pairedWith.join(', ')}`}
                                className="lasa-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer shadow-xs group"
                              >
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
                                </span>
                                <Repeat className="w-3 h-3 text-amber-700 shrink-0 group-hover:rotate-180 transition-transform duration-300" />
                                <span>LASA</span>
                              </button>
                            )}
                          </div>
                        )}

                        {drug.catatan && drug.catatan !== "-" && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {drug.catatan}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {hasMultiple && !isExpanded ? (
                          <span className="text-xs font-semibold text-slate-500">{group.length} Sediaan</span>
                        ) : (
                          drug.bentukSediaan
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs leading-relaxed">
                        {hasMultiple && !isExpanded ? "-" : <ExpandableText text={drug.restriksi} />}
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
                      </tr>
                    {hasMultiple && isExpanded && group.slice(1).map((subDrug) => {
                      const subSafety = getDrugSafetyAlert(subDrug);
                      const isSubLasa = !!subSafety.lasa;
                      return (
                      <tr key={subDrug.id} className={`drug-table-row transition-colors ${
                        isSubLasa 
                          ? "has-lasa drug-table-row-lasa" 
                          : "bg-slate-50/50 hover:bg-slate-50"
                      }`}>
                        <td className="px-4 py-3 align-top border-l-4 border-emerald-500"></td>
                        <td className="px-4 py-3 align-top pl-8">
                          <span className="text-xs text-slate-400 font-medium">↳ Varian Sediaan</span>
                          {(subSafety.highAlert || subSafety.lasa) && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {subSafety.highAlert && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSafetyDrug({ drug: subDrug, safety: subSafety });
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                  High Alert
                                </button>
                              )}
                              {subSafety.lasa && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSafetyDrug({ drug: subDrug, safety: subSafety });
                                  }}
                                  className="lasa-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer"
                                >
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
                                  </span>
                                  <Repeat className="w-2.5 h-2.5 text-amber-700" />
                                  LASA
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">{subDrug.bentukSediaan}</td>
                        <td className="px-4 py-3 align-top text-xs leading-relaxed">
                          <ExpandableText text={subDrug.restriksi} />
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
                      </tr>
                      );
                    })}
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
              const groupKey = `${drug.kelasTerapi}|${drug.namaObat}`;
              const isExpanded = expandedGroups[groupKey];
              const safety = getDrugSafetyAlert(drug);
              const isLasa = !!safety.lasa;
              
              return (
              <div 
                key={`mob-${groupKey}`} 
                className={`drug-table-row p-4 space-y-3 transition-all ${
                  isLasa 
                    ? "has-lasa drug-table-row-lasa border-l-4 border-amber-500 my-1 rounded-r-xl" 
                    : "hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  {hasMultiple && (
                    <button 
                      onClick={() => toggleGroup(groupKey)}
                      className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                    >
                      {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  )}
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{drug.namaObat}</h3>
                </div>

                {/* Mobile Peringatan Visual: High Alert & LASA */}
                {(safety.highAlert || safety.lasa) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {safety.highAlert && (
                      <button
                        type="button"
                        onClick={() => setSelectedSafetyDrug({ drug, safety })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 active:bg-rose-100"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>High Alert</span>
                      </button>
                    )}
                    {safety.lasa && (
                      <button
                        type="button"
                        onClick={() => setSelectedSafetyDrug({ drug, safety })}
                        className="lasa-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 active:bg-amber-200"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                        </span>
                        <Repeat className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>LASA / NORUM</span>
                      </button>
                    )}
                  </div>
                )}

                {drug.catatan && drug.catatan !== "-" && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {drug.catatan}
                    </span>
                  )}
                
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
                        <ExpandableText text={drug.restriksi} />
                      </div>
                    )}
                    {drug.peresepanMaksimal !== "-" && (
                      <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 leading-relaxed">
                        <span className="font-semibold block mb-1">Maks. Peresepan:</span> 
                        {drug.peresepanMaksimal}
                      </div>
                    )}
                    </>
                )}

                {hasMultiple && !isExpanded && (
                  <div className="text-xs text-slate-500">{group.length} Varian Sediaan</div>
                )}

                {hasMultiple && isExpanded && group.slice(1).map((subDrug) => {
                  const subSafety = getDrugSafetyAlert(subDrug);
                  return (
                  <div key={`mob-${subDrug.id}`} className="mt-4 pt-4 border-t border-slate-100 space-y-3 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></div>
                    <div className="pl-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-800">{subDrug.bentukSediaan}</div>
                        {(subSafety.highAlert || subSafety.lasa) && (
                          <div className="flex flex-wrap items-center gap-1">
                            {subSafety.highAlert && (
                              <button
                                type="button"
                                onClick={() => setSelectedSafetyDrug({ drug: subDrug, safety: subSafety })}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                High Alert
                              </button>
                            )}
                            {subSafety.lasa && (
                              <button
                                type="button"
                                onClick={() => setSelectedSafetyDrug({ drug: subDrug, safety: subSafety })}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                <Repeat className="w-2.5 h-2.5 text-amber-600" />
                                LASA
                              </button>
                            )}
                          </div>
                        )}
                      </div>
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
                          <ExpandableText text={subDrug.restriksi} />
                        </div>
                      )}
                      {subDrug.peresepanMaksimal !== "-" && (
                        <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 leading-relaxed">
                          <span className="font-semibold block mb-1">Maks. Peresepan:</span> 
                          {subDrug.peresepanMaksimal}
                        </div>
                      )}
                      </div>
                  </div>
                  );
                })}
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
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-emerald-600">id, kelasTerapi, subKelasTerapi, namaObat, bentukSediaan, restriksi, peresepanMaksimal, fpktp, fpktl, oen</code>
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

      {/* Modal Detail Peringatan Keselamatan Obat (High Alert & LASA) */}
      {selectedSafetyDrug && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedSafetyDrug(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                    Patient Safety Alert
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Fornas KMK 1199/2025</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {selectedSafetyDrug.drug.namaObat}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedSafetyDrug.drug.bentukSediaan} • {selectedSafetyDrug.drug.kelasTerapi}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSafetyDrug(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 text-sm">
              {/* High Alert Section */}
              {selectedSafetyDrug.safety.highAlert && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{selectedSafetyDrug.safety.highAlert.badgeText}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-200 text-rose-800">
                      Risiko Fatal
                    </span>
                  </div>

                  <div className="text-xs text-rose-950 leading-relaxed font-medium">
                    <strong className="block text-rose-950 font-bold mb-0.5">
                      Kategori: {selectedSafetyDrug.safety.highAlert.categoryLabel}
                    </strong>
                    <p className="text-rose-900">{selectedSafetyDrug.safety.highAlert.reason}</p>
                  </div>

                  <div className="text-xs text-rose-950 bg-white/90 p-3 rounded-lg border border-rose-200/80 leading-relaxed shadow-2xs">
                    <strong className="block text-rose-900 font-bold mb-1">
                      🛡️ Pedoman Penanganan Rumah Sakit (KARS SNARS & ISMP):
                    </strong>
                    <p className="text-slate-700 font-normal">{selectedSafetyDrug.safety.highAlert.handlingGuideline}</p>
                  </div>
                </div>
              )}

              {/* LASA / NORUM Section */}
              {selectedSafetyDrug.safety.lasa && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                      <Repeat className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>LASA / NORUM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                      Rupa / Bunyi Mirip
                    </span>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-amber-200/80 space-y-2.5 shadow-2xs">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Rekomendasi Tall-Man Lettering:
                      </span>
                      <div className="font-mono text-sm font-black text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded border border-amber-300 inline-block tracking-wider">
                        {selectedSafetyDrug.safety.lasa.tallMan}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Waspada Tertukar Dengan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSafetyDrug.safety.lasa.pairedWith.map((pair, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            {pair}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-amber-950 bg-white/90 p-3 rounded-lg border border-amber-200/80 leading-relaxed shadow-2xs">
                    <strong className="block text-amber-900 font-bold mb-1">
                      ⚠️ Tindakan Pencegahan Kesalahan (Medication Error):
                    </strong>
                    <p className="text-slate-700 font-normal">{selectedSafetyDrug.safety.lasa.preventionTip}</p>
                  </div>
                </div>
              )}

              {/* Standard note */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Standar Akreditasi KARS & Permenkes RI:</strong> Penandaan High Alert dan LASA bertujuan mencegah Kejadian Nyaris Cedera (KNC) dan Kejadian Tidak Diharapkan (KTD). Selalu terapkan double-check independen oleh dua tenaga kesehatan sebelum pemberian obat.
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSafetyDrug(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
