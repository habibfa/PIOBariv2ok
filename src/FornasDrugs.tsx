import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Filter, ArrowUpDown, Download, Upload, X, Save, FileSpreadsheet, Plus, Minus, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIVIRUS",
    namaObat: "Abakavir",
    bentukSediaan: "tab 300 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "Disediakan oleh Program Kemenkes."
  },
  {
    id: "f2",
    kelasTerapi: "OBAT KARDIOVASKULAR",
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
    id: "f3",
    kelasTerapi: "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib [CA]",
    bentukSediaan: "tab sal selaput 20 mg",
    restriksi: "Untuk NSCLC jenis non squamous yang locally advanced atau metastatik dengan EGFR exon 19 delesi atau mutasi subsitusi exon 21 (L858R atau L861Q), substitusi exon 18 (G719X), atau substitusi mutasi exon 20 (S7681), pada pasien yang belum pernah mendapatkan TKI sebelumnya. Dosis terapi adalah 40 mg, diberikan 1x1 sehari. Tidak digunakan sebagai lini kedua. Jika terjadi progresi pada salah satu (gefitinib, erlotinib, atau afatinib), maka tidak dapat diganti dengan obat-obat tersebut. Dosis 20 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan.",
    peresepanMaksimal: "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f4",
    kelasTerapi: "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib [CA]",
    bentukSediaan: "tab sal selaput 30 mg",
    restriksi: "Dosis 30 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan.",
    peresepanMaksimal: "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f5",
    kelasTerapi: "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Afatinib [CA]",
    bentukSediaan: "tab sal selaput 40 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan. Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f6",
    kelasTerapi: "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN LAIN",
    subKelasTerapi: "LAIN LAIN",
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
    id: "f7",
    kelasTerapi: "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN LAIN",
    subKelasTerapi: "LAIN LAIN",
    namaObat: "Air untuk irigasi",
    bentukSediaan: "inf",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f8",
    kelasTerapi: "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
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
    id: "f9",
    kelasTerapi: "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
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
    id: "f10",
    kelasTerapi: "OBAT dan BAHAN untuk GIGI",
    subKelasTerapi: "PREPARAT LAINNYA",
    namaObat: "Akuades",
    bentukSediaan: "cairan 500 mL",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f11",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "tab 400 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "Pada wanita hamil hanya digunakan bila manfaat jelas lebih besar daripada risiko, sebaiknya digunakan pada trimester 2 dan trimester 3."
  },
  {
    id: "f12",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "susp 200 mg/5 mL",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f13",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTELMINTIK",
    namaObat: "Albendazol",
    bentukSediaan: "susp 400 mg/10 mL",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "√",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f14",
    kelasTerapi: "PRODUK DARAH dan PENGGANTI PLASMA",
    subKelasTerapi: "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    namaObat: "Albumin Serum Normal (Human Albumin)",
    bentukSediaan: "inj 5%",
    restriksi: "Untuk luka bakar tingkat 2 (luas permukaan terbakar lebih dari 30%) dan kadar albumin < 2,5 g/dL atau Untuk plasmaferesis.",
    peresepanMaksimal: "Diberikan selama 24 jam. Perhitungkan kebutuhan albumin berdasarkan BB.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f15",
    kelasTerapi: "PRODUK DARAH dan PENGGANTI PLASMA",
    subKelasTerapi: "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    namaObat: "Albumin Serum Normal (Human Albumin)",
    bentukSediaan: "inj 20%",
    restriksi: "Dapat digunakan pada salah satu atau lebih kondisi berikut: a.) Kadar albumin < 2,5 g/dL. b.)Kadar albumin < 2,5 g/dL pada sindrom nefrotik yang disertai edema anasarka dan/atau renjatan. Diberikan apabila terdapat kondisi presyok atau syok, dan/atau untuk kasus asites masif dengan penekanan organ pernapasan atau perut.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f16",
    kelasTerapi: "PRODUK DARAH dan PENGGANTI PLASMA",
    subKelasTerapi: "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    namaObat: "Albumin Serum Normal (Human Albumin)",
    bentukSediaan: "inj 25%",
    restriksi: "Dapat digunakan pada salah satu atau lebih kondisi berikut: a.) Kadar albumin < 2,5 g/dL. b.)Kadar albumin < 2,5 g/dL pada sindrom nefrotik yang disertai edema anasarka dan/atau renjatan. Diberikan apabila terdapat kondisi presyok atau syok, dan/atau untuk kasus asites masif dengan penekanan organ pernapasan atau perut.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f17",
    kelasTerapi: "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    subKelasTerapi: "ANTINEOPLASTIK",
    namaObat: "Alektinib [CA]",
    bentukSediaan: "kaps 150 mg",
    restriksi: "Hanya untuk kanker paru dengan ALK positif yang locally advanced atau metastatik NSCLC pada pasien yang belum pernah mendapatkan obat golongan penghambat (inhibitor) mutasi gen ALK positif sebelumnya. Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu hematologi dan onkologi medik, atau onkologi lain, atau penyakit dalam, atau penyakit paru.",
    peresepanMaksimal: "240 kaps/bulan",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f18",
    kelasTerapi: "OBAT yang MEMENGARUHI STRUKTUR dan MINERALISASI TULANG",
    subKelasTerapi: "-",
    namaObat: "Alendronat",
    bentukSediaan: "tab 70 mg",
    restriksi: "a)Pasien dengan osteoporosis,hasil pemeriksaan BMD DXA, T score < -2,5 (bukan BMD ultrasound); atau b)Riwayat fraktur osteoporosis.",
    peresepanMaksimal: "4 tab/bulan",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f19",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    subKelasTerapi: "ANTIPIRAI",
    namaObat: "Alopurinol",
    bentukSediaan: "tab 100 mg*",
    restriksi: "Tidak diberikan pada saat nyeri akut",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f20",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    subKelasTerapi: "ANTIPIRAI",
    namaObat: "Alopurinol",
    bentukSediaan: "tab 300 mg",
    restriksi: "Tidak diberikan pada saat nyeri akut",
    peresepanMaksimal: "60 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f21",
    kelasTerapi: "PSIKOFARMAKA",
    subKelasTerapi: "ANTIANSIETAS",
    namaObat: "Alprazolam",
    bentukSediaan: "tab 0,25 mg",
    restriksi: "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    peresepanMaksimal: "Maks 2 minggu/kasus, 30 tab/bulan.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f22",
    kelasTerapi: "PSIKOFARMAKA",
    subKelasTerapi: "ANTIANSIETAS",
    namaObat: "Alprazolam",
    bentukSediaan: "tab 0,5 mg",
    restriksi: "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    peresepanMaksimal: "Maks 2 minggu/kasus, 30 tab/bulan.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f23",
    kelasTerapi: "PSIKOFARMAKA",
    subKelasTerapi: "ANTIANSIETAS",
    namaObat: "Alprazolam",
    bentukSediaan: "tab 1 mg",
    restriksi: "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    peresepanMaksimal: "Maks 2 minggu/kasus, 30 tab/bulan.",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f24",
    kelasTerapi: "OBAT KARDIOVASKULAR",
    subKelasTerapi: "TROMBOLITIK",
    namaObat: "Alteplase",
    bentukSediaan: "serb inj 50 mg",
    restriksi: "a) Untuk infark miokard akut dengan onset < 12 jam. b) Untuk stroke non hemoragik dengan onset < 4,5 jam. c) Dapat diberikan di FPKTL yang memiliki fasilitas ICCU/ICU/unit stroke. d) Kontraindikasi: tidak digunakan untuk stroke iskemik dengan riwayat perdarahan intrakranial dan cedera kepala berat dalam waktu 3 bulan terakhir, operasi mayor dalam waktu 3 bulan terakhir, riwayat gangguan koagulasi, hipertensi yang tidak terkendali.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f25",
    kelasTerapi: "OBAT untuk MATA",
    subKelasTerapi: "ANTIMIKROBA",
    namaObat: "Amfoterisin B",
    bentukSediaan: "salep mata 1%",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f26",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIFUNGI",
    namaObat: "Amfoterisin B",
    bentukSediaan: "inj 5 mg/mL (i.v.)",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f27",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIFUNGI",
    namaObat: "Amfoterisin B",
    bentukSediaan: "inj 50 mg",
    restriksi: "a) Disediakan oleh Program Kemenkes. b) Digunakan oleh ODHIV yang mengalami Infeksi oportunistik jenis meningitis karena cryptococcus. c) Digunakan untuk kondisi sub akut cryptococcus. d) Pengobatan selama 14 hari.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f28",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIINFEKSI KHUSUS",
    namaObat: "Amikasin [P]",
    bentukSediaan: "inj 500 mg",
    restriksi: "Digunakan untuk paduan pengobatan pasien TB resistan obat (TB-RO).",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "-",
    catatan: "-"
  },
  {
    id: "f29",
    kelasTerapi: "ANTIINFEKSI",
    subKelasTerapi: "ANTIBAKTERI",
    namaObat: "Amikasin",
    bentukSediaan: "inj 250 mg/mL",
    restriksi: "Hanya digunakan untuk infeksi oleh bakteri gram negatif yang resistan terhadap gentamisin.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f30",
    kelasTerapi: "OBAT untuk SALURAN NAPAS",
    subKelasTerapi: "ANTIASMA",
    namaObat: "Aminofilin",
    bentukSediaan: "tab 150 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f31",
    kelasTerapi: "OBAT untuk SALURAN NAPAS",
    subKelasTerapi: "ANTIASMA",
    namaObat: "Aminofilin",
    bentukSediaan: "tab 200 mg",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f32",
    kelasTerapi: "OBAT untuk SALURAN NAPAS",
    subKelasTerapi: "ANTIASMA",
    namaObat: "Aminofilin",
    bentukSediaan: "inj 24 mg/ml",
    restriksi: "-",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√, PP",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f33",
    kelasTerapi: "OBAT KARDIOVASKULAR",
    subKelasTerapi: "ANTIARITMIA",
    namaObat: "Amiodaron",
    bentukSediaan: "tab 200 mg*",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
    fpktp: "√*",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f34",
    kelasTerapi: "OBAT KARDIOVASKULAR",
    subKelasTerapi: "ANTIARITMIA",
    namaObat: "Amiodaron",
    bentukSediaan: "inj 50 mg/ml",
    restriksi: "Untuk kasus rawat inap.",
    peresepanMaksimal: "-",
    fpktp: "-",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f35",
    kelasTerapi: "PSIKOFARMAKA",
    subKelasTerapi: "ANTIDEPRESI",
    namaObat: "Amitriptilin",
    bentukSediaan: "tab 25 mg",
    restriksi: "-",
    peresepanMaksimal: "60 tab/bulan.",
    fpktp: "√",
    fpktl: "√",
    oen: "√",
    catatan: "-"
  },
  {
    id: "f36",
    kelasTerapi: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    subKelasTerapi: "NYERI NEUROPATIK",
    namaObat: "Amitriptilin",
    bentukSediaan: "tab 25 mg",
    restriksi: "-",
    peresepanMaksimal: "30 tab/bulan.",
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
        const parsed = JSON.parse(saved) as FornasDrug[];
        const updated = parsed.map(p => {
          const initial = INITIAL_FORNAS_DATA.find(i => i.id === p.id);
          if (initial && (p.namaObat !== initial.namaObat || p.bentukSediaan !== initial.bentukSediaan || p.kelasTerapi !== initial.kelasTerapi || p.subKelasTerapi !== initial.subKelasTerapi || p.restriksi !== initial.restriksi || p.peresepanMaksimal !== initial.peresepanMaksimal || p.fpktp !== initial.fpktp || p.fpktl !== initial.fpktl || p.oen !== initial.oen || p.catatan !== initial.catatan)) {
             return { ...p, ...initial };
          }
          return p;
        });
        const newInitial = INITIAL_FORNAS_DATA.filter(
          (initial) => !updated.some((p) => p.id === initial.id)
        );
        return [...updated, ...newInitial];
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
  const [selectedAlphabet, setSelectedAlphabet] = useState("all");
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
  const [showKeterangan, setShowKeterangan] = useState(false);

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

      let matchesAlphabet = true;
      if (selectedAlphabet !== "all") {
        matchesAlphabet = drug.namaObat.charAt(0).toUpperCase() === selectedAlphabet;
      }

      return matchesSearch && matchesFaskes && matchesName && matchesAlphabet;
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
  }, [searchTerm, nameFilter, selectedAlphabet, selectedFaskes, fornasData]);

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
              <>
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  Update Data
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
