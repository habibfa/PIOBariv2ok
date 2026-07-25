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
    "id": "f1",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Abakavir",
    "bentukSediaan": "tab 300 mg",
    "restriksi": "Disediakan oleh Program Kemenkes.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f2",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIARITMIA",
    "namaObat": "Adenosin",
    "bentukSediaan": "inj 3mg/ml",
    "restriksi": "Digunakan untuk mengatasi SVT (dibuktikan dengan EKG). Digunakan untuk uji pembebanan jantung.",
    "peresepanMaksimal": "Maks 5 ampul",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f3",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Afatinib [CA]",
    "bentukSediaan": "tab sal selaput 20 mg",
    "restriksi": "Untuk NSCLC jenis non squamous yang locally advanced atau metastatik dengan EGFR exon 19 delesi atau mutasi subsitusi exon 21 (L858R atau L861Q), substitusi exon 18 (G719X), atau substitusi mutasi exon 20 (S7681), pada pasien yang belum pernah mendapatkan TKI sebelumnya. Dosis terapi adalah 40 mg, diberikan 1x1 sehari. Tidak digunakan sebagai lini kedua. Jika terjadi progresi pada salah satu (gefitinib, erlotinib, atau afatinib), maka tidak dapat diganti dengan obat-obat tersebut. Dosis 20 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan.",
    "peresepanMaksimal": "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f4",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Afatinib [CA]",
    "bentukSediaan": "tab sal selaput 30 mg",
    "restriksi": "Dosis 30 mg bukan dosis terapeutik tetapi digunakan apabila muncul efek samping. Dosis dikembalikan ke 40 mg untuk mendapat efikasi yang diharapkan.",
    "peresepanMaksimal": "Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f5",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Afatinib [CA]",
    "bentukSediaan": "tab sal selaput 40 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan. Obat dihentikan jika respons terhadap obat kurang dari 50%, setelah 3 siklus.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f6",
    "kelasTerapi": "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN LAIN",
    "subKelasTerapi": "LAIN LAIN",
    "namaObat": "Air steril untuk injeksi",
    "bentukSediaan": "cairan inj",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f7",
    "kelasTerapi": "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN LAIN",
    "subKelasTerapi": "LAIN LAIN",
    "namaObat": "Air untuk irigasi",
    "bentukSediaan": "inf",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f8",
    "kelasTerapi": "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
    "subKelasTerapi": "ANTIDIABETES",
    "namaObat": "Akarbose",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f9",
    "kelasTerapi": "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
    "subKelasTerapi": "ANTIDIABETES",
    "namaObat": "Akarbose",
    "bentukSediaan": "tab 100 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f10",
    "kelasTerapi": "OBAT dan BAHAN untuk GIGI",
    "subKelasTerapi": "PREPARAT LAINNYA",
    "namaObat": "Akuades",
    "bentukSediaan": "cairan 500 mL",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f11",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTELMINTIK",
    "namaObat": "Albendazol",
    "bentukSediaan": "tab 400 mg",
    "restriksi": "Pada wanita hamil hanya digunakan bila manfaat jelas lebih besar daripada risiko, sebaiknya digunakan pada trimester 2 dan trimester 3.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f12",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTELMINTIK",
    "namaObat": "Albendazol",
    "bentukSediaan": "susp 200 mg/5 mL",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f13",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTELMINTIK",
    "namaObat": "Albendazol",
    "bentukSediaan": "susp 400 mg/10 mL",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f14",
    "kelasTerapi": "PRODUK DARAH dan PENGGANTI PLASMA",
    "subKelasTerapi": "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    "namaObat": "Albumin Serum Normal (Human Albumin)",
    "bentukSediaan": "inj 5%",
    "restriksi": "Untuk luka bakar tingkat 2 (luas permukaan terbakar lebih dari 30%) dan kadar albumin < 2,5 g/dL atau Untuk plasmaferesis.",
    "peresepanMaksimal": "Diberikan selama 24 jam. Perhitungkan kebutuhan albumin berdasarkan BB.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f15",
    "kelasTerapi": "PRODUK DARAH dan PENGGANTI PLASMA",
    "subKelasTerapi": "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    "namaObat": "Albumin Serum Normal (Human Albumin)",
    "bentukSediaan": "inj 20%",
    "restriksi": "Dapat digunakan pada salah satu atau lebih kondisi berikut: a.) Kadar albumin < 2,5 g/dL. b.)Kadar albumin < 2,5 g/dL pada sindrom nefrotik yang disertai edema anasarka dan/atau renjatan. Diberikan apabila terdapat kondisi presyok atau syok, dan/atau untuk kasus asites masif dengan penekanan organ pernapasan atau perut.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f16",
    "kelasTerapi": "PRODUK DARAH dan PENGGANTI PLASMA",
    "subKelasTerapi": "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    "namaObat": "Albumin Serum Normal (Human Albumin)",
    "bentukSediaan": "inj 25%",
    "restriksi": "Dapat digunakan pada salah satu atau lebih kondisi berikut: a.) Kadar albumin < 2,5 g/dL. b.)Kadar albumin < 2,5 g/dL pada sindrom nefrotik yang disertai edema anasarka dan/atau renjatan. Diberikan apabila terdapat kondisi presyok atau syok, dan/atau untuk kasus asites masif dengan penekanan organ pernapasan atau perut.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f17",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Alektinib [CA]",
    "bentukSediaan": "kaps 150 mg",
    "restriksi": "Hanya untuk kanker paru dengan ALK positif yang locally advanced atau metastatik NSCLC pada pasien yang belum pernah mendapatkan obat golongan penghambat (inhibitor) mutasi gen ALK positif sebelumnya. Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu hematologi dan onkologi medik, atau onkologi lain, atau penyakit dalam, atau penyakit paru.",
    "peresepanMaksimal": "240 kaps/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f18",
    "kelasTerapi": "OBAT yang MEMENGARUHI STRUKTUR dan MINERALISASI TULANG",
    "subKelasTerapi": "-",
    "namaObat": "Alendronat",
    "bentukSediaan": "tab 70 mg",
    "restriksi": "a)Pasien dengan osteoporosis,hasil pemeriksaan BMD DXA, T score < -2,5 (bukan BMD ultrasound); atau b)Riwayat fraktur osteoporosis.",
    "peresepanMaksimal": "4 tab/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f19",
    "kelasTerapi": "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    "subKelasTerapi": "ANTIPIRAI",
    "namaObat": "Alopurinol",
    "bentukSediaan": "tab 100 mg*",
    "restriksi": "Tidak diberikan pada saat nyeri akut",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f20",
    "kelasTerapi": "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    "subKelasTerapi": "ANTIPIRAI",
    "namaObat": "Alopurinol",
    "bentukSediaan": "tab 300 mg",
    "restriksi": "Tidak diberikan pada saat nyeri akut",
    "peresepanMaksimal": "60 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f21",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIANSIETAS",
    "namaObat": "Alprazolam",
    "bentukSediaan": "tab 0,25 mg",
    "restriksi": "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    "peresepanMaksimal": "Maks 2 minggu/kasus, 30 tab/bulan.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f22",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIANSIETAS",
    "namaObat": "Alprazolam",
    "bentukSediaan": "tab 0,5 mg",
    "restriksi": "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    "peresepanMaksimal": "Maks 2 minggu/kasus, 30 tab/bulan.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f23",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIANSIETAS",
    "namaObat": "Alprazolam",
    "bentukSediaan": "tab 1 mg",
    "restriksi": "a) Diresepkan oleh dokter yang memiliki kompetensi di bidang ilmu kedokteran jiwa atau penyakit dalam. b) Hanya untuk kasus: - Panic attack - Panic disorder",
    "peresepanMaksimal": "Maks 2 minggu/kasus, 30 tab/bulan.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f24",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "TROMBOLITIK",
    "namaObat": "Alteplase",
    "bentukSediaan": "serb inj 50 mg",
    "restriksi": "a) Untuk infark miokard akut dengan onset < 12 jam. b) Untuk stroke non hemoragik dengan onset < 4,5 jam. c) Dapat diberikan di FPKTL yang memiliki fasilitas ICCU/ICU/unit stroke. d) Kontraindikasi: tidak digunakan untuk stroke iskemik dengan riwayat perdarahan intrakranial dan cedera kepala berat dalam waktu 3 bulan terakhir, operasi mayor dalam waktu 3 bulan terakhir, riwayat gangguan koagulasi, hipertensi yang tidak terkendali.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f25",
    "kelasTerapi": "OBAT untuk MATA",
    "subKelasTerapi": "ANTIMIKROBA",
    "namaObat": "Amfoterisin B",
    "bentukSediaan": "salep mata 1%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f26",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIFUNGI",
    "namaObat": "Amfoterisin B",
    "bentukSediaan": "inj 5 mg/mL (i.v.)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f27",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIFUNGI",
    "namaObat": "Amfoterisin B",
    "bentukSediaan": "inj 50 mg",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Digunakan oleh ODHIV yang mengalami Infeksi oportunistik jenis meningitis karena cryptococcus. c) Digunakan untuk kondisi sub akut cryptococcus. d) Pengobatan selama 14 hari.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f28",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIINFEKSI KHUSUS",
    "namaObat": "Amikasin [P]",
    "bentukSediaan": "inj 500 mg",
    "restriksi": "Digunakan untuk paduan pengobatan pasien TB resistan obat (TB-RO).",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f29",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amikasin",
    "bentukSediaan": "inj 250 mg/mL",
    "restriksi": "Hanya digunakan untuk infeksi oleh bakteri gram negatif yang resistan terhadap gentamisin.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f30",
    "kelasTerapi": "OBAT untuk SALURAN NAPAS",
    "subKelasTerapi": "ANTIASMA",
    "namaObat": "Aminofilin",
    "bentukSediaan": "tab 150 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f31",
    "kelasTerapi": "OBAT untuk SALURAN NAPAS",
    "subKelasTerapi": "ANTIASMA",
    "namaObat": "Aminofilin",
    "bentukSediaan": "tab 200 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f32",
    "kelasTerapi": "OBAT untuk SALURAN NAPAS",
    "subKelasTerapi": "ANTIASMA",
    "namaObat": "Aminofilin",
    "bentukSediaan": "inj 24 mg/ml",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√, PP",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f33",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIARITMIA",
    "namaObat": "Amiodaron",
    "bentukSediaan": "tab 200 mg*",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f34",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIARITMIA",
    "namaObat": "Amiodaron",
    "bentukSediaan": "inj 50 mg/ml",
    "restriksi": "Untuk kasus rawat inap.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f35",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIDEPRESI",
    "namaObat": "Amitriptilin",
    "bentukSediaan": "tab 25 mg",
    "restriksi": "-",
    "peresepanMaksimal": "60 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f36",
    "kelasTerapi": "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    "subKelasTerapi": "NYERI NEUROPATIK",
    "namaObat": "Amitriptilin",
    "bentukSediaan": "tab 25 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f37",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIANGINA",
    "namaObat": "Amlodipin*",
    "bentukSediaan": "tab 5 mg",
    "restriksi": "Untuk angina dengan bradiaritmia.",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f38",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Amlodipin*",
    "bentukSediaan": "tab 5 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f39",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Amlodipin*",
    "bentukSediaan": "tab 10 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f40",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amoksisilin",
    "bentukSediaan": "tab 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "10 hari",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f41",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amoksisilin",
    "bentukSediaan": "tab 500 mg",
    "restriksi": "-",
    "peresepanMaksimal": "10 hari",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f42",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amoksisilin",
    "bentukSediaan": "drops 100 mg/ml",
    "restriksi": "-",
    "peresepanMaksimal": "1 btl/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f43",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amoksisilin",
    "bentukSediaan": "sir kering 125 mg/5 ml",
    "restriksi": "-",
    "peresepanMaksimal": "1 btl/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f44",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Amoksisilin",
    "bentukSediaan": "sir kering 250 mg/5 ml",
    "restriksi": "-",
    "peresepanMaksimal": "1 btl/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f45",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Ampisilin",
    "bentukSediaan": "inj 250 mg (i.m/i.v.)",
    "restriksi": "-",
    "peresepanMaksimal": "10 hari",
    "fpktp": "√, PP",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f46",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Ampisilin",
    "bentukSediaan": "inj 1.000 mg (i.v.)",
    "restriksi": "-",
    "peresepanMaksimal": "10 hari",
    "fpktp": "√, PP",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f47",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Basal: Insulin Detemir",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "Dalam kondisi tertentu, Dokter di FPKTP dapat melakukan penyesuaian dosis (titrasi) insulin basal hingga 20 IU/hari.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f48",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Basal: Insulin Glargine",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "Dalam kondisi tertentu, Dokter di FPKTP dapat melakukan penyesuaian dosis (titrasi) insulin basal hingga 20 IU/hari.",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f49",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Basal: Insulin Glargine",
    "bentukSediaan": "inj 300 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "Dalam kondisi tertentu, Dokter di FPKTP dapat melakukan penyesuaian dosis (titrasi) insulin basal hingga 20 IU/hari.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f50",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Campuran: Co-Formulation 70% Insulin Degludec (Ultra-Long Acting Insulin) Dan 30% Insulin Aspart",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f51",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Campuran: Kombinasi 50% Insulin Protamine Lispro Dan 50% Insulin Lispro",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f52",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Campuran: Kombinasi 70% Insulin Protamine Aspart Dan 30% Insulin Aspart",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f53",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Campuran: Kombinasi 75% Insulin Protamine Lispro Dan 25% Insulin Lispro",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "a) Pasien diabetes melitus tipe 2 yang sudah diberikan kombinasi metformin dan obat diabetes oral lainnya dengan dosis optimal masing-masing obat telah diberikan minimal dalam 3 bulan namun kadar glukosa darahnya belum terkendali (HbA1C > 7,5% atau gula darah rerata > 169 mg/dL). b) Pasien diabetes melitus tipe 2 dengan kadar HbA1C nya > 9% disertai dengan gejala-gejala dekompensasi metabolik. c) Pemberian insulin pada (a) dan (b) dapat dilanjutkan untuk pasien diabetes melitus tipe 2, jika insulin dibutuhkan untuk mempertahankan pengendalian glukosa darah.",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f54",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Prandial: Insulin Aspart",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f55",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Prandial: Insulin Glulisin",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f56",
    "kelasTerapi": "ANTIDIABETES",
    "subKelasTerapi": "Antidiabetes Parenteral",
    "namaObat": "Analog Insulin Prandial: Insulin Lispro",
    "bentukSediaan": "inj 100 IU/mL (kemasan vial, disposable cartridge, penfill cartridge)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f57",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "TERAPI ENDOKRIN",
    "namaObat": "Anastrozol [CA]",
    "bentukSediaan": "tab 1 mg",
    "restriksi": "a) Dapat digunakan untuk kanker payudara post menopause dengan pemeriksaan reseptor estrogen/progesteron positif. b)Dapat digunakan pada premenopause atau perimenopause yang dijadikan post menopause dengan pemberian goserelin asetat.",
    "peresepanMaksimal": "30 tab/bulan.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f58",
    "kelasTerapi": "OBAT dan BAHAN untuk GIGI",
    "subKelasTerapi": "PREPARAT LAINNYA",
    "namaObat": "Anestetik Lokal Gigi, Kombinasi Kdt/Fdc Mengandung Lidokain Dan Epinefrin",
    "bentukSediaan": "inj lidokain 2%, epinefrin 1:80.000",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f59",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "ANTASIDA dan ANTIULKUS",
    "namaObat": "Antasida, Kombinasi Aluminium  Hidroksida Dan Magnesium Hidroksida",
    "bentukSediaan": "tablet kunyah aluminium hidroksida 200 mg",
    "restriksi": "magnesium hidroksida 200 mg",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f60",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "ANTASIDA dan ANTIULKUS",
    "namaObat": "Antasida, Kombinasi Aluminium  Hidroksida Dan Magnesium Hidroksida",
    "bentukSediaan": "susp aluminium hidroksida 200 mg",
    "restriksi": "magnesium hidroksida 200 mg",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f61",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "-",
    "namaObat": "Antibakteri, Kombinasi Kdt/Fdc Mengandung Basitrasin Dan Polimiksin B",
    "bentukSediaan": "salep bsitrasin 500 IU/g",
    "restriksi": "polimiksin B 10.000IU/g",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f62",
    "kelasTerapi": "PRODUK DARAH dan PENGGANTI PLASMA",
    "subKelasTerapi": "PENGGANTI PLASMA dan PLASMA EKSPANDER",
    "namaObat": "Anti-D (Rho(D)) Imunoglobulin",
    "bentukSediaan": "inj 1.500 IU",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f63",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "ANTIFUNGI",
    "namaObat": "Antifungi, Kombinasi Kdt/Fdc Mengandung Asam Benzoat Dan Asam Salisilat",
    "bentukSediaan": "Salep asam benzoat 6%",
    "restriksi": "asam salisilat 3%",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f64",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "ANTIHEMOROID",
    "namaObat": "Antihemoroid, Kombinasi Kdt/Fdc Mengandung Bismut Subgalat, Heksaklorofen, Lidokain, Dan Seng Oksida",
    "bentukSediaan": "susp Bismut Subgalat, Heksaklorofen, Lidokain, Dan Seng Oksida",
    "restriksi": "-",
    "peresepanMaksimal": "5 sup/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f65",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIPSIKOTIK",
    "namaObat": "Aripiprazol",
    "bentukSediaan": "tab 5mg",
    "restriksi": "Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa, atau neurologi, atau neurologi anak. Termasuk untuk kasus iritabilitas terkait dengan gangguan autisme.",
    "peresepanMaksimal": "15 mg/hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f66",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIPSIKOTIK",
    "namaObat": "Aripiprazol",
    "bentukSediaan": "tab dispersible 10 mg*",
    "restriksi": "Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa, atau neurologi, atau neurologi anak. Termasuk untuk kasus iritabilitas terkait dengan gangguan autisme.",
    "peresepanMaksimal": "15 mg/hari",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f67",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIPSIKOTIK",
    "namaObat": "Aripiprazol",
    "bentukSediaan": "tab dispersible 15 mg*",
    "restriksi": "Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa, atau neurologi, atau neurologi anak. Termasuk untuk kasus iritabilitas terkait dengan gangguan autisme.",
    "peresepanMaksimal": "15 mg/hari",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f68",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIPSIKOTIK",
    "namaObat": "Aripiprazol",
    "bentukSediaan": "tab 5mg",
    "restriksi": "Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa, atau neurologi, atau neurologi anak. Termasuk untuk kasus iritabilitas terkait dengan gangguan autisme.",
    "peresepanMaksimal": "15 mg/hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f69",
    "kelasTerapi": "ANTIVIRUS",
    "subKelasTerapi": "ANTIPROTOZOA",
    "namaObat": "Artesunat [P]",
    "bentukSediaan": "inj 60 mg (i.v./i.m.)",
    "restriksi": "a) Diberikan pada malaria berat. b) Khusus di FPKTP, pemberian hanya 1 kali yang segera dirujuk ke FPKTL.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f70",
    "kelasTerapi": "OBAT dan BAHAN untuk GIGI",
    "subKelasTerapi": "PREPARAT LAINNYA",
    "namaObat": "Articulating Paper",
    "bentukSediaan": "-",
    "restriksi": "kertas warna penanda oklusi",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f71",
    "kelasTerapi": "OBAT untuk TELINGA, HIDUNG, dan TENGGOROK",
    "subKelasTerapi": "-",
    "namaObat": "Asam Asetat",
    "bentukSediaan": "tts telinga 2%",
    "restriksi": "Catatan: dibuat baru, recenter paratus (r.p.).",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f72",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIAGREGASI PLATELET",
    "namaObat": "Asam Asetilsalisilat (Asetosal)*",
    "bentukSediaan": "tab 80 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f73",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIAGREGASI PLATELET",
    "namaObat": "Asam Asetilsalisilat (Asetosal)*",
    "bentukSediaan": "tab sal enterik 100 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f74",
    "kelasTerapi": "VITAMIN dan MINERAL",
    "subKelasTerapi": "-",
    "namaObat": "Asam Askorbat (Vitamin C)",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f75",
    "kelasTerapi": "VITAMIN dan MINERAL",
    "subKelasTerapi": "-",
    "namaObat": "Asam Askorbat (Vitamin C)",
    "bentukSediaan": "tab 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f76",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "ANTIANEMI",
    "namaObat": "Asam Folat",
    "bentukSediaan": "tab 0,4mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f77",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "ANTIANEMI",
    "namaObat": "Asam Folat",
    "bentukSediaan": "tab 1 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f78",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "ANTIANEMI",
    "namaObat": "Asam Folat",
    "bentukSediaan": "tab 5 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f79",
    "kelasTerapi": "OBAT untuk MATA",
    "subKelasTerapi": "ANTIMIKROBA",
    "namaObat": "Asam Fusidat",
    "bentukSediaan": "tts mata 1%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f80",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Asam Fusidat",
    "bentukSediaan": "krim 2%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f81",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "LAIN-LAIN",
    "namaObat": "Asam Ibandronat [CA]",
    "bentukSediaan": "-",
    "restriksi": "a) Hiperkalsemia akibat keganasan. b) Metastatik tulang.",
    "peresepanMaksimal": "1 vial/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f82",
    "kelasTerapi": "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    "subKelasTerapi": "ANALGESIK NON NARKOTIK",
    "namaObat": "Asam Mefenamat",
    "bentukSediaan": "kaps 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 kaps/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f83",
    "kelasTerapi": "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
    "subKelasTerapi": "ANALGESIK NON NARKOTIK",
    "namaObat": "Asam Mefenamat",
    "bentukSediaan": "tab 500 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 kaps/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f84",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIINFEKSI KHUSUS",
    "namaObat": "Asam Pipemidat",
    "bentukSediaan": "kaps 400 mg",
    "restriksi": "-",
    "peresepanMaksimal": "28 kaps/kasus",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f85",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "ANTIAKNE",
    "namaObat": "Asam Retinoat",
    "bentukSediaan": "krim 0,05%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f86",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "ANTIAKNE",
    "namaObat": "Asam Retinoat",
    "bentukSediaan": "krim 0,1%",
    "restriksi": "a) tidak digunakan pada pagi dan siang hari b) tidak untuk ibu hamil",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f87",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "KERATOLITIK dan KERATOPLASTIK",
    "namaObat": "Asam Salisilat",
    "bentukSediaan": "salep 2%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f88",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "KERATOLITIK dan KERATOPLASTIK",
    "namaObat": "Asam Salisilat",
    "bentukSediaan": "salep 5%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f89",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "KERATOLITIK dan KERATOPLASTIK",
    "namaObat": "Asam Salisilat",
    "bentukSediaan": "salep 10%",
    "restriksi": "Kulit disekitar lesi harus dilindungi dengan pelembab.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f90",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "OBAT yang MEMENGARUHI KOAGULASI",
    "namaObat": "Asam Traneksamat",
    "bentukSediaan": "kaps 250 mg",
    "restriksi": "Untuk perdarahan masif atau berpotensi perdarahan > 600 cc.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f91",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "OBAT yang MEMENGARUHI KOAGULASI",
    "namaObat": "Asam Traneksamat",
    "bentukSediaan": "tab sal selaput 500 mg",
    "restriksi": "Untuk perdarahan masif atau berpotensi perdarahan > 600 cc.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f92",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "OBAT yang MEMENGARUHI KOAGULASI",
    "namaObat": "Asam Traneksamat",
    "bentukSediaan": "inj 50 mg/ml",
    "restriksi": "Untuk perdarahan masif atau berpotensi perdarahan > 600 cc.",
    "peresepanMaksimal": "Untuk FPKTP (PP): 4 amp/hari, maks. 3 hari.",
    "fpktp": "√ (PP)",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f93",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "OBAT yang MEMENGARUHI KOAGULASI",
    "namaObat": "Asam Traneksamat",
    "bentukSediaan": "inj 100 mg/ml",
    "restriksi": "Untuk perdarahan masif atau berpotensi perdarahan > 600 cc.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f94",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "LAIN-LAIN",
    "namaObat": "Asam Ursodeoksikolat",
    "bentukSediaan": "kaps 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 kaps/bulan",
    "fpktp": "√",
    "fpktl": "-",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f95",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "LAIN-LAIN",
    "namaObat": "Asam Zoledronat",
    "bentukSediaan": "-",
    "restriksi": "a) Hiperkalsemia akibat keganasan. b) Metastatik tulang.",
    "peresepanMaksimal": "1 vial/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f96",
    "kelasTerapi": "ANESTETIK LOKAL",
    "subKelasTerapi": "MIOTIK dan ANTIGLAUKOMA",
    "namaObat": "Asetazolamid",
    "bentukSediaan": "tab 250 mg",
    "restriksi": "a) Hati-hati pemberian pada pasien dengan gangguan fungsi ginjal b)Sebagai penanganan awal dan sementara di FPKTP pada pasien glaukoma akut sebelum dirujuk.",
    "peresepanMaksimal": "Glaukoma kronis: 120 tab/bulan",
    "fpktp": "Glaukoma akut: 30 tab/minggu (maks. 2 minggu)",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f97",
    "kelasTerapi": "OBAT untuk MATA",
    "subKelasTerapi": "ANTIMIKROBA",
    "namaObat": "Asiklovir",
    "bentukSediaan": "salep mata 3%",
    "restriksi": "Hanya untuk kasus keratitis herpetiformis.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f98",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Asiklovir",
    "bentukSediaan": "tab 200 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f99",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Asiklovir",
    "bentukSediaan": "tab 400 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f100",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Asiklovir",
    "bentukSediaan": "serb inj 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f101",
    "kelasTerapi": "OBAT TOPIKAL untuk KULIT",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Asiklovir",
    "bentukSediaan": "krip 5%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f102",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Asparaginase [CA]",
    "bentukSediaan": "-",
    "restriksi": "Untuk leukemia limfoblastik akut",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f103",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "OBAT untuk DIARE",
    "namaObat": "Atapulgit",
    "bentukSediaan": "tab",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f104",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Atenolol*",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "Pemberian obat antihipertensi harus didasarkan pada prinsip dosis titrasi, mulai dari dosis terkecil hingga tercapai dosis dengan outcome tekanan darah terbaik.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f105",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Atenolol*",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "Pemberian obat antihipertensi harus didasarkan pada prinsip dosis titrasi, mulai dari dosis terkecil hingga tercapai dosis dengan outcome tekanan darah terbaik.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f106",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIANGINA",
    "namaObat": "Atenolol*",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "Pemberian obat antihipertensi harus didasarkan pada prinsip dosis titrasi, mulai dari dosis terkecil hingga tercapai dosis dengan outcome tekanan darah terbaik.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f107",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERLIPIDEMIA",
    "namaObat": "Atorvastatin*",
    "bentukSediaan": "tab sal selaput 10 mg",
    "restriksi": "Sebagai terapi tambahan terhadap terapi diet pada pasien hiperlipidemia. a) Jika setelah pemberian simvastatin selama 3 bulan berturut-turut dengan dosis 40 mg/hari pasien tidak mencapai target penurunan LDL < 100 mg/dL, disamping diet ketat lemak. atau b) Pasien ASCVD (pasca PCI/CABG, stroke iskemi dan/atau PAD, pascainfark) yang dibuktikan dengan EKG atau MSCT atau riwayat angiografi. Target LDL adalah ? 55 mg/dL, yang harus diperiksa setiap 6 bulan. Pemberian dapat dilanjutkan untuk mempertahankan pengendalian LDL, kecuali apabila ada kontraindikasi.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f108",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERLIPIDEMIA",
    "namaObat": "Atorvastatin*",
    "bentukSediaan": "tab sal selaput 20 mg",
    "restriksi": "Sebagai terapi tambahan terhadap terapi diet pada pasien hiperlipidemia. a) Jika setelah pemberian simvastatin selama 3 bulan berturut-turut dengan dosis 40 mg/hari pasien tidak mencapai target penurunan LDL < 100 mg/dL, disamping diet ketat lemak. atau b) Pasien ASCVD (pasca PCI/CABG, stroke iskemi dan/atau PAD, pascainfark) yang dibuktikan dengan EKG atau MSCT atau riwayat angiografi. Target LDL adalah ? 55 mg/dL, yang harus diperiksa setiap 6 bulan. Pemberian dapat dilanjutkan untuk mempertahankan pengendalian LDL, kecuali apabila ada kontraindikasi.",
    "peresepanMaksimal": "60 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f109",
    "kelasTerapi": "RELAKSAN OTOT PERIFER dan PENGHAMBAT KOLINESTERASE",
    "subKelasTerapi": "RELAKSAN OTOT PERIFER",
    "namaObat": "Atrakurium",
    "bentukSediaan": "inj 10 mg/mL",
    "restriksi": "Hanya untuk tindakan anestesi dan pasien ICU yang memerlukan, karena menggunakan ventilator.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f110",
    "kelasTerapi": "OBAT untuk MATA",
    "subKelasTerapi": "MIDRIATIK",
    "namaObat": "Atropin",
    "bentukSediaan": "tts mata 0,5%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f111",
    "kelasTerapi": "OBAT untuk MATA",
    "subKelasTerapi": "MIDRIATIK",
    "namaObat": "Atropin",
    "bentukSediaan": "tts mata 1%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f112",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "ANTISPASMODIK",
    "namaObat": "Atropin",
    "bentukSediaan": "tab 0,5 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f113",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "ANTISPASMODIK",
    "namaObat": "Atropin",
    "bentukSediaan": "inj 0,25 mg/mL (i.v./s.k.)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f114",
    "kelasTerapi": "ANESTETIK",
    "subKelasTerapi": "OBAT untuk PROSEDUR PRE OPERATIF",
    "namaObat": "Atropin",
    "bentukSediaan": "inj 0,25 mg/mL (i.v./s.k.)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f115",
    "kelasTerapi": "ANTIDOT dan OBAT LAIN untuk KERACUNAN",
    "subKelasTerapi": "KHUSUS",
    "namaObat": "Atropin",
    "bentukSediaan": "tab 0,5 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f116",
    "kelasTerapi": "ANTIDOT dan OBAT LAIN untuk KERACUNAN",
    "subKelasTerapi": "KHUSUS",
    "namaObat": "Atropin",
    "bentukSediaan": "inj 0,25 mg/mL (i.v.)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f117",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "IMUNOSUPRESAN",
    "namaObat": "Azatioprin",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "-",
    "peresepanMaksimal": "120 tab/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f118",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Azitromisin",
    "bentukSediaan": "tab 250 mg",
    "restriksi": "Diberikan atas persetujuan dokter yang memiliki kompetensi di bidang ilmu penyakit tropik dan/atau infeksi atau DPJP yang ditunjuk oleh KFT/KPRA untuk: a) Antibiotik kategori Watch. b) Ketika antibiotik kategori Access tidak efektif.",
    "peresepanMaksimal": "3 hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f119",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Azitromisin",
    "bentukSediaan": "tab sal selaput 500 mg",
    "restriksi": "Diberikan atas persetujuan dokter yang memiliki kompetensi di bidang ilmu penyakit tropik dan/atau infeksi atau DPJP yang ditunjuk oleh KFT/KPRA untuk: a) Antibiotik kategori Watch. b) Ketika antibiotik kategori Access tidak efektif.",
    "peresepanMaksimal": "3 hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f120",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Azitromisin",
    "bentukSediaan": "sir kering 200 mg/5 mL",
    "restriksi": "Diberikan atas persetujuan dokter yang memiliki kompetensi di bidang ilmu penyakit tropik dan/atau infeksi atau DPJP yang ditunjuk oleh KFT/KPRA untuk: a) Antibiotik kategori Watch. b) Ketika antibiotik kategori Access tidak efektif.",
    "peresepanMaksimal": "3 hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f121",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Azitromisin",
    "bentukSediaan": "serb inj 500 mg",
    "restriksi": "Diberikan atas persetujuan dokter yang memiliki kompetensi di bidang ilmu penyakit tropik dan/atau infeksi atau DPJP yang ditunjuk oleh KFT/KPRA untuk: a) Antibiotik kategori Watch. b) Ketika antibiotik kategori Access tidak efektif.",
    "peresepanMaksimal": "3 hari",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f101001",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Zidovudin [P]",
    "bentukSediaan": "kaps 100 mg",
    "restriksi": "Dapat diberikan oleh FPKTP yang memiliki kemampuan pengobatan antiretroviral dengan persyaratan memiliki SK Penunjukan sebagai unit pelayanan yang berhak memberikan obat ARV dari Dinas Kesehatan setempat.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f101002",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Zidovudin [P]",
    "bentukSediaan": "sir 50 mg /5 mL",
    "restriksi": "Dapat diberikan oleh FPKTP yang memiliki kemampuan pengobatan antiretroviral dengan persyaratan memiliki SK Penunjukan sebagai unit pelayanan yang berhak memberikan obat ARV dari Dinas Kesehatan setempat. Dapat digunakan untuk terapi profilaksis pada bayi baru lahir dari ibu ODHIV selama 6 minggu.",
    "peresepanMaksimal": "Maks 6 minggu",
    "fpktp": "-",
    "fpktl": "-",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f101003",
    "kelasTerapi": "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN–LAIN",
    "subKelasTerapi": "ORAL",
    "namaObat": "Zinc",
    "bentukSediaan": "drops 10 mg/Ml",
    "restriksi": "Untuk anak usia < 2 tahun.",
    "peresepanMaksimal": "2 btl/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f101004",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "OBAT untuk DIARE",
    "namaObat": "Zinc",
    "bentukSediaan": "tab dispersible 20 mg",
    "restriksi": "Harus diberikan bersama oralit selama 10 hari.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f101005",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "OBAT untuk DIARE",
    "namaObat": "Zinc",
    "bentukSediaan": "sir 20 mg/5 mL",
    "restriksi": "Harus diberikan bersama oralit selama 10 hari.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f101006",
    "kelasTerapi": "OBAT untuk SALURAN CERNA",
    "subKelasTerapi": "OBAT untuk DIARE",
    "namaObat": "Zinc",
    "bentukSediaan": "drops 10 mg/Ml",
    "restriksi": "Harus diberikan bersama oralit selama 10 hari. Untuk anak usia < 2 tahun.",
    "peresepanMaksimal": "2 btl/kasus",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f101007",
    "kelasTerapi": "ANTIEPILEPSI - ANTIKONVULSI",
    "subKelasTerapi": "-",
    "namaObat": "Zonisamid",
    "bentukSediaan": "tab sal selaput 100 mg",
    "restriksi": "Digunakan pada pasien epilepsi dewasa dengan ketentuan: a) Sebagai monoterapi untuk pengobatan kejang parsial dengan atau tanpa generalisasi sekunder atau b) Sebagai terapi tambahan untuk pengobatan kejang parsial.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f101000",
    "kelasTerapi": "OBAT yang MEMENGARUHI DARAH",
    "subKelasTerapi": "OBAT yang MEMENGARUHI KOAGULASI",
    "namaObat": "Warfarin",
    "bentukSediaan": "tab 1 mg",
    "restriksi": "a) Untuk pencegahan dan/atau terapi thromboembolism. b) Dosis harian disesuaikan dengan target INR (2-3). c) Pada pasien dalam kondisi stabil (tidak ada perdarahan), dengan tercapainya target INR (2-3), diperlukan evaluasi INR rutin maksimal setiap 3 bulan.",
    "peresepanMaksimal": "-",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fw1",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "LAIN–LAIN",
    "namaObat": "Urea",
    "bentukSediaan": "krim 10%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fw2",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "LAIN–LAIN",
    "namaObat": "Urea",
    "bentukSediaan": "krim 20%",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fq1",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIDEPRESI",
    "namaObat": "Quetiapin",
    "bentukSediaan": "tab 100 mg",
    "restriksi": "a) Untuk skizofrenia. atau b) Untuk pasien bipolar yang tidak memberikan respons terhadap pemberian litium atau valproat. c) Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa.",
    "peresepanMaksimal": "120 tab / bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fq2",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIDEPRESI",
    "namaObat": "Quetiapin",
    "bentukSediaan": "tab 200 mg",
    "restriksi": "a) Untuk skizofrenia. atau b) Untuk pasien bipolar yang tidak memberikan respons terhadap pemberian litium atau valproat. c) Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa.",
    "peresepanMaksimal": "60 tab / bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fq3",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "ANTIDEPRESI",
    "namaObat": "Quetiapin",
    "bentukSediaan": "tab pelepasan lambat 150 mg*",
    "restriksi": "a) Untuk skizofrenia. atau b) Untuk pasien bipolar yang tidak memberikan respons terhadap pemberian litium atau valproat. c) Diresepkan oleh dokter yang memiliki kompetensi dibidang ilmu kedokteran jiwa.",
    "peresepanMaksimal": "60 tab / bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fzp3cj1kxe",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin BCG [P]",
    "bentukSediaan": "serb inj 0,75 mg/mL+pelarut (i.k.)",
    "restriksi": "a) Disimpan dekat evaporator.\nb) Vaksin yang telah dilarutkan tetapi tidak segera digunakan maka harus disimpan pada suhu 2-8 °C tidak lebih dari 3 jam penyimpanan.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f4ts305et8",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin COVID-19 Platform Inactivated [P]",
    "bentukSediaan": "inj",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f1v4fhajgn",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin COVID-19 Platform mRNA [P]",
    "bentukSediaan": "inj",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fsk83d36qe",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin COVID-19 Platform Protein Sub Unit Rekombinan [P]",
    "bentukSediaan": "inj",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f4lnrbw0sf",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin DPT-HB-Hib [P]",
    "bentukSediaan": "inj (i.m.)",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fvs6upb5u7",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Hepatitis B Rekombinan [P]",
    "bentukSediaan": "Prefilled Injection Device (Uniject) (i.m)",
    "restriksi": "Diberikan pada bayi < 24 jam pascalahir dengan didahului suntikan vitamin K1 2-3 jam sebelumnya.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fn93lw71me",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Human Papilomavirus [P]",
    "bentukSediaan": "inj (0,5 mL) vial dosis tunggal",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "ffu3frns8k",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Human Rotavirus [P]",
    "bentukSediaan": "drop, vial multi dosis",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f7xzlmghmf",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Human Rotavirus [P]",
    "bentukSediaan": "susp",
    "restriksi": "a) Disediakan oleh Program Kemenkes. b) Disimpan pada suhu 2-8 °C.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f0aqb56sye",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Japanese Encephalitis, Live Attenuated [P]",
    "bentukSediaan": "inj dengan pelarut (0,5 mL) vial multi dosis",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fpo6im0ty8",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Jerap Difteri Tetanus (DT)[P]",
    "bentukSediaan": "inj 40/15 lf/mL (i.m.)",
    "restriksi": "Untuk anak < 7 tahun.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f1p16ra80j",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Jerap Tetanus Difteri (Td) [P]",
    "bentukSediaan": "inj 15/4 lf/mL (i.m.)",
    "restriksi": "Untuk anak dan dewasa ( ≥ 7 tahun)",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fe62v668us",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Measles Rubella (MR) [P]",
    "bentukSediaan": "inj (s.k.)",
    "restriksi": "a) Disimpan dekat evaporator.\nb) Vaksin yang telah dilarutkan disimpan pada suhu 2-8 °C selama dan harus digunakan sebelum lewat 6 jam.\nc) Digunakan pada usia 9 bulan, 18 bulan, dan kelas 1 SD.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f4p327paau",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Pneumokokus Polisakarida Konjugasi (PCV)[P]",
    "bentukSediaan": "inj",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f00ao35kai",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Polio IPV [P]",
    "bentukSediaan": "inj (i.m.)",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "flq9j06uwu",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Polio Oral (b-OPV) [P]",
    "bentukSediaan": "drops",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fsech9atbb",
    "kelasTerapi": "OBAT yang MEMENGARUHI SISTEM IMUN",
    "subKelasTerapi": "VAKSIN",
    "namaObat": "Vaksin Rabies, Untuk Manusia [P]",
    "bentukSediaan": "inj 2,5 IU",
    "restriksi": "Digunakan untuk post exposure di daerah rabies.",
    "peresepanMaksimal": "-",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fe8wh5z0uu",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Valasiklovir",
    "bentukSediaan": "tab 500 mg",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fodycqcsih",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIVIRUS",
    "namaObat": "Valgansiklovir",
    "bentukSediaan": "tab sal 450 mg",
    "restriksi": "a) Hanya untuk pasien HIV/AIDS dengan CD4 <100, serta dibuktikan ada kelainan organik (retinitis CMV) atau untuk profilaksis CMV pada pasien CMV negatif yang menerima transplantasi organ dari donor yang CMV positif. b) Kadar transaminase serum dalam batas normal.",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f1euroqzfd",
    "kelasTerapi": "ANTIEPILEPSI - ANTIKONVULSI",
    "subKelasTerapi": "-",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "120 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f45vy1grti",
    "kelasTerapi": "ANTIEPILEPSI - ANTIKONVULSI",
    "subKelasTerapi": "-",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 500 mg",
    "restriksi": "-",
    "peresepanMaksimal": "120 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fzi0i6ddrc",
    "kelasTerapi": "ANTIEPILEPSI - ANTIKONVULSI",
    "subKelasTerapi": "-",
    "namaObat": "Valproat",
    "bentukSediaan": "tab sal enterik 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "ftuow5aa9i",
    "kelasTerapi": "ANTIEPILEPSI - ANTIKONVULSI",
    "subKelasTerapi": "-",
    "namaObat": "Valproat",
    "bentukSediaan": "sir 250 mg/5 ml",
    "restriksi": "-",
    "peresepanMaksimal": "5 btl/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f0iovzm6vi",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Valsartan",
    "bentukSediaan": "tab 80 mg",
    "restriksi": "Untuk pasien yang telah mendapat ACE inhibitor sebelumnya sekurang-kurangnya 1 bulan dan mengalami intoleransi terhadap ACE inhibitor yang dibuktikan dengan melampirkan resep sebelumnya.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fb1dbd7cox",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Valsartan",
    "bentukSediaan": "tab 160 mg",
    "restriksi": "Untuk pasien yang telah mendapat ACE inhibitor sebelumnya sekurang-kurangnya 1 bulan dan mengalami intoleransi terhadap ACE inhibitor yang dibuktikan dengan melampirkan resep sebelumnya.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fo2z1uyqfb",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIBAKTERI",
    "namaObat": "Vankomisin",
    "bentukSediaan": "inj 500 mg",
    "restriksi": "Diberikan atas persetujuan KFT/KPRA/pimpinan RS untuk antibiotik lini ketiga (reserved antibiotic) pada infeksi oleh kuman MRSA atau MRSE positif (dibuktikan dengan hasil kultur).",
    "peresepanMaksimal": "maks 10 hari/kasus",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fdp1meg6dl",
    "kelasTerapi": "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
    "subKelasTerapi": "HORMON ANTIDIURETIK",
    "namaObat": "Vasopresin",
    "bentukSediaan": "inj 20 IU/mL",
    "restriksi": "-",
    "peresepanMaksimal": "-",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f51c791cgp",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Verapamil",
    "bentukSediaan": "tab 80 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fujn1wajfn",
    "kelasTerapi": "OBAT KARDIOVASKULAR",
    "subKelasTerapi": "ANTIHIPERTENSI",
    "namaObat": "Verapamil",
    "bentukSediaan": "tab lepas lambat 240 mg",
    "restriksi": "-",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "faup18fgap",
    "kelasTerapi": "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
    "subKelasTerapi": "ANTIDIABETES",
    "namaObat": "Vildagliptin",
    "bentukSediaan": "tab 50 mg",
    "restriksi": "a) Tidak digunakan sebagai lini pertama/terapi inisial. b) Sebagai terapi tambahan pada metformin dan/atau sulfonilurea dengan dosis optimal yang masih dapat ditoleransi oleh pasien. c) Tidak digunakan sebagai obat tunggal.",
    "peresepanMaksimal": "60 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f0lv2o5ak6",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Vinblastin [CA]",
    "bentukSediaan": "inj 1 mg/mL",
    "restriksi": "Catatan: Hanya diberikan secara intravena.",
    "peresepanMaksimal": "6 mg/m2 setiap 2 minggu.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "frour8o8nj",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Vinkristin [CA]",
    "bentukSediaan": "inj 1 mg/mL",
    "restriksi": "-",
    "peresepanMaksimal": "1,5 mg/m2 maks weekly dose 2 mg. Kecuali untuk ALL maks 3 tahun.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f8rc8jghjr",
    "kelasTerapi": "ANTINEOPLASTIK DAN IMUNOMODULATOR",
    "subKelasTerapi": "ANTINEOPLASTIK",
    "namaObat": "Vinorelbin [CA]",
    "bentukSediaan": "inj 10 mg/mL",
    "restriksi": "a) Untuk Non Small Cell Lung Cancer (NSCLC). atau b) Untuk kanker payudara metastatik",
    "peresepanMaksimal": "25 mg/m2 hari 1 dan 8 diulang setiap 3 minggu.",
    "fpktp": "√",
    "fpktl": "-",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "f80qelp8ej",
    "kelasTerapi": "VITAMIN dan MINERAL",
    "subKelasTerapi": "-",
    "namaObat": "Vitamin B Kompleks",
    "bentukSediaan": "tab",
    "restriksi": "Mengandung Vitamin B1, Vitamin B6, Vitamin B12 Untuk pengobatan defisiensi vitamin B1, B6, dan B12",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "√",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fsj43q04jr",
    "kelasTerapi": "ANTIINFEKSI",
    "subKelasTerapi": "ANTIFUNGI",
    "namaObat": "Vorikonazol",
    "bentukSediaan": "tab sal selaput 200 mg",
    "restriksi": "a) Untuk invasif aspergilosis. b) Diagnosis harus dibuktikan dengan pemeriksaan kultur jaringan atau kultur aspirat paru atau serologi atau uji galaktomanan.",
    "peresepanMaksimal": "Selama 4 minggu.",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "f2p4hyy27h",
    "kelasTerapi": "ANTIMIGREN dan ANTIVERTIGO",
    "subKelasTerapi": "ANTIMIGREN",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 250 mg",
    "restriksi": "Hanya digunakan pada pasien yang memiliki kontraindikasi atau gagal profilaksis dengan beta bloker.",
    "peresepanMaksimal": "60 tab/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fdr4nmkf9j",
    "kelasTerapi": "ANTIMIGREN dan ANTIVERTIGO",
    "subKelasTerapi": "ANTIMIGREN",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 500 mg",
    "restriksi": "Hanya digunakan pada pasien yang memiliki kontraindikasi atau gagal profilaksis dengan beta bloker.",
    "peresepanMaksimal": "30 tab/bulan",
    "fpktp": "-",
    "fpktl": "√",
    "oen": "-",
    "catatan": "-"
  },
  {
    "id": "fbyjx6lk4y",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "OBAT untuk GANGGUAN BIPOLAR",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "futyunq2ib",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "OBAT untuk GANGGUAN BIPOLAR",
    "namaObat": "Valproat",
    "bentukSediaan": "tab lepas lambat 500 mg",
    "restriksi": "-",
    "peresepanMaksimal": "90 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  },
  {
    "id": "fq1vudimtz",
    "kelasTerapi": "PSIKOFARMAKA",
    "subKelasTerapi": "OBAT untuk GANGGUAN BIPOLAR",
    "namaObat": "Valproat",
    "bentukSediaan": "tab sal enterik 250 mg",
    "restriksi": "-",
    "peresepanMaksimal": "60 tab/bulan",
    "fpktp": "√*",
    "fpktl": "√",
    "oen": "√",
    "catatan": "-"
  }
];

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
    const saved = localStorage.getItem("fornasData_v2");
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
    localStorage.setItem("fornasData_v2", JSON.stringify(fornasData));
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

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showKeterangan, setShowKeterangan] = useState(false);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
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
      const key = `${drug.kelasTerapi}|${drug.namaObat}`;
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
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedData.length > 0 ? (
                groupedData.map((group) => {
                  const drug = group[0];
                  const hasMultiple = group.length > 1;
                  const groupKey = `${drug.kelasTerapi}|${drug.namaObat}`;
                  const isExpanded = expandedGroups[groupKey];
                  
                  return (
                  <React.Fragment key={groupKey}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-800">{drug.kelasTerapi}</div>
                        <div className="text-xs text-slate-500 mt-1">{drug.subKelasTerapi}</div>
                      </td>
                      <td className="px-4 py-3 align-top font-bold text-emerald-700">
                        <div className="flex items-center gap-2">
                          {hasMultiple && (
                            <button 
                              onClick={() => toggleGroup(groupKey)}
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
                    {hasMultiple && isExpanded && group.slice(1).map((subDrug) => (
                      <tr key={subDrug.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 align-top border-l-4 border-emerald-500"></td>
                        <td className="px-4 py-3 align-top font-bold text-emerald-700 pl-10">
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
              const groupKey = `${drug.kelasTerapi}|${drug.namaObat}`;
                  const isExpanded = expandedGroups[groupKey];
              
              return (
              <div key={`mob-${groupKey}`} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {hasMultiple && (
                    <button 
                      onClick={() => toggleGroup(groupKey)}
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
    </div>
  );
}
