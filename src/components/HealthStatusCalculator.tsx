import React, { useMemo, useState, useCallback } from "react";
import {
  Activity,
  BarChart3,
  Check,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  HeartPulse,
  Microscope,
  Printer,
  RotateCcw,
  ShieldCheck,
  Table2,
  TrendingUp,
  Users,
} from "lucide-react";
import { HealthStatusCharts } from "./HealthStatusCharts";

// ============================================================================
// TYPES & DEFAULT REFERENCE DATASET
// ============================================================================

interface TenIndicatorInputs {
  jumlahPenduduk: number;
  pendudukPertengahanTahun: number;
  kelahiranHidup: number;
  kematianBayi: number;
  kematianIbu: number;
  totalKematian: number;
  kasusDBD: number;
  kematianDBD: number;
  kasusTBParu: number;
  perempuanWUS: number;
}

interface MortalityFertilityInputs {
  kematianNeonatal: number;
  kematianNeonatalDini: number;
  kematianPostNeonatal: number;
  kematianBalita: number;
  lahirMati: number;
  namaPenyebabKhusus: string;
  kematianPenyebabKhusus: number;
  kelompokUmurLabel: string;
  kematianKelompokUmur: number;
  pendudukKelompokUmur: number;
  kelahiranKelompokUmurIbu: number;
  wusKelompokUmurIbu: number;
  asfrBands: [number, number, number, number, number, number, number]; // 15-19..45-49 per 1.000
  anakBalita0_4: number;
  pendudukUsiaMuda0_14: number;
  pendudukUsiaProduktif15_64: number;
  pendudukLansia65Plus: number;
}

interface MorbidityInputs {
  namaPenyakit: string;
  kasusBaru: number;
  kasusLama: number;
  populasiBerisiko: number;
  totalPersonYears: number;
  kasusAktifTitikWaktu: number;
  kasusKLB: number;
  populasiTerpaparKLB: number;
  kasusPrimer: number;
  kasusSekunder: number;
  kontakRentan: number;
  kematianPenyakitUmum: number;
  totalKasusPenyakitUmum: number;
  konstantaCI: number;
}

interface TwoByTwoInputs {
  a: number; // Terpapar & Sakit (atau TP)
  b: number; // Terpapar & Sehat (atau FP)
  c: number; // Tidak Terpapar & Sakit (atau FN)
  d: number; // Tidak Terpapar & Sehat (atau TN)
}

export interface EpiTableRow {
  no: number;
  indikator: string;
  nilaiInput: string;
  nilaiTone?: "blue" | "teal" | "rose" | "slate";
  ukuran: string;
  ukuranTone?: "blue" | "teal" | "rose" | "bold" | "slate";
  rumusPrefix?: string;
  hasilHighlight?: string;
  hasilTone?: "blue" | "teal" | "rose" | "slate";
  rumusSuffix?: string;
  rumusPlain?: string; // Plain text for CSV / Excel / Copy
  customFormulaNode?: React.ReactNode;
}

const DEFAULT_TEN_INPUTS: TenIndicatorInputs = {
  jumlahPenduduk: 15768,
  pendudukPertengahanTahun: 15768,
  kelahiranHidup: 116,
  kematianBayi: 0,
  kematianIbu: 0,
  totalKematian: 0,
  kasusDBD: 4,
  kematianDBD: 0,
  kasusTBParu: 1,
  perempuanWUS: 3942,
};

const ZERO_TEN_INPUTS: TenIndicatorInputs = {
  jumlahPenduduk: 0,
  pendudukPertengahanTahun: 0,
  kelahiranHidup: 0,
  kematianBayi: 0,
  kematianIbu: 0,
  totalKematian: 0,
  kasusDBD: 0,
  kematianDBD: 0,
  kasusTBParu: 0,
  perempuanWUS: 0,
};

const DEFAULT_MF_INPUTS: MortalityFertilityInputs = {
  kematianNeonatal: 0,
  kematianNeonatalDini: 0,
  kematianPostNeonatal: 0,
  kematianBalita: 0,
  lahirMati: 1,
  namaPenyebabKhusus: "Penyakit Kardiovaskular",
  kematianPenyebabKhusus: 2,
  kelompokUmurLabel: "45–54 tahun",
  kematianKelompokUmur: 3,
  pendudukKelompokUmur: 1850,
  kelahiranKelompokUmurIbu: 42,
  wusKelompokUmurIbu: 780,
  asfrBands: [18, 86, 112, 84, 48, 16, 4], // Sum = 368 -> TFR = 1.84
  anakBalita0_4: 1180,
  pendudukUsiaMuda0_14: 3420,
  pendudukUsiaProduktif15_64: 10980,
  pendudukLansia65Plus: 1368,
};

const DEFAULT_MORB_INPUTS: MorbidityInputs = {
  namaPenyakit: "ISPA / Pneumonia",
  kasusBaru: 45,
  kasusLama: 18,
  populasiBerisiko: 15750,
  totalPersonYears: 14920,
  kasusAktifTitikWaktu: 32,
  kasusKLB: 28,
  populasiTerpaparKLB: 120,
  kasusPrimer: 2,
  kasusSekunder: 9,
  kontakRentan: 42,
  kematianPenyakitUmum: 1,
  totalKasusPenyakitUmum: 45,
  konstantaCI: 1000,
};

const DEFAULT_2X2: TwoByTwoInputs = {
  a: 42,
  b: 18,
  c: 12,
  d: 128,
};

// ============================================================================
// INDONESIAN NUMBER FORMATTING HELPERS
// ============================================================================

const fmtInt = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("id-ID");
};

const fmtDec = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return "0,00";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};

// Clean rate formatting: exact 0 renders as "0" (matching reference image for IMR/MMR/CDR), non-zero renders with 2 decimals
const fmtRateClean = (n: number): string => {
  if (!Number.isFinite(n) || n === 0) return "0";
  return fmtDec(n, 2);
};

const safeNonNeg = (val: string): number => {
  const cleaned = val.replace(/[^0-9.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

const toneClass = (tone?: "blue" | "teal" | "rose" | "bold" | "slate"): string => {
  switch (tone) {
    case "blue":
      return "text-sky-600 font-semibold";
    case "teal":
      return "text-teal-600 font-semibold";
    case "rose":
      return "text-rose-600 font-semibold";
    case "bold":
      return "text-slate-900 font-bold";
    default:
      return "text-slate-700 font-medium";
  }
};

// ============================================================================
// REUSABLE 5-COLUMN EPIDEMIOLOGY TABLE (MATCHING REFERENCE IMAGE)
// ============================================================================

interface EpidemiologyTableProps {
  title?: string;
  subtitle?: string;
  rows: EpiTableRow[];
  firstColLabel?: string;
  secondColLabel?: string;
  thirdColLabel?: string;
  fourthColLabel?: string;
  fifthColLabel?: string;
}

const EpidemiologyTable: React.FC<EpidemiologyTableProps> = ({
  title,
  subtitle,
  rows,
  firstColLabel = "No",
  secondColLabel = "Indikator Dasar",
  thirdColLabel = "Nilai Numerik Input",
  fourthColLabel = "Ukuran Epidemiologi Terkait",
  fifthColLabel = "Rumus Matematis & Hasil Akhir",
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
              <th className="py-3 px-4 w-12">{firstColLabel}</th>
              <th className="py-3 px-4 min-w-[200px]">{secondColLabel}</th>
              <th className="py-3 px-4 min-w-[155px]">{thirdColLabel}</th>
              <th className="py-3 px-4 min-w-[215px]">{fourthColLabel}</th>
              <th className="py-3 px-4 min-w-[330px]">{fifthColLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13px] tabular-nums">
            {rows.map((row) => (
              <tr
                key={`${row.no}-${row.indikator}`}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-3 px-4 text-slate-500 font-medium align-middle">
                  {row.no}
                </td>
                <td className="py-3 px-4 text-slate-900 font-bold align-middle">
                  {row.indikator}
                </td>
                <td className={`py-3 px-4 align-middle whitespace-nowrap ${toneClass(row.nilaiTone)}`}>
                  {row.nilaiInput}
                </td>
                <td className={`py-3 px-4 align-middle ${toneClass(row.ukuranTone)}`}>
                  {row.ukuran}
                </td>
                <td className="py-3 px-4 align-middle text-slate-800">
                  {row.customFormulaNode ? (
                    row.customFormulaNode
                  ) : row.hasilHighlight !== undefined ? (
                    <span className="font-semibold text-slate-900">
                      {row.rumusPrefix}
                      <span className={toneClass(row.hasilTone)}>
                        {row.hasilHighlight}
                      </span>
                      {row.rumusSuffix}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-normal">
                      {row.rumusPlain}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type EpiSectionTab = "basic10" | "charts" | "mortality_fertility" | "morbidity" | "association_2x2" | "all_summary";

const ASFR_AGE_BANDS = [
  "15–19 thn",
  "20–24 thn",
  "25–29 thn",
  "30–34 thn",
  "35–39 thn",
  "40–44 thn",
  "45–49 thn",
];

export const HealthStatusCalculator: React.FC = () => {
  const [regionName, setRegionName] = useState<string>("Wilayah Kerja Puskesmas / RSUD Palembang BARI");
  const [reportPeriod, setReportPeriod] = useState<string>("Tahun 2026");
  const [syncMidYearPop, setSyncMidYearPop] = useState<boolean>(true);

  const [inputs, setInputs] = useState<TenIndicatorInputs>(DEFAULT_TEN_INPUTS);
  const [mfInputs, setMfInputs] = useState<MortalityFertilityInputs>(DEFAULT_MF_INPUTS);
  const [morbInputs, setMorbInputs] = useState<MorbidityInputs>(DEFAULT_MORB_INPUTS);
  const [table2x2, setTable2x2] = useState<TwoByTwoInputs>(DEFAULT_2X2);

  const [activeSection, setActiveSection] = useState<EpiSectionTab>("basic10");
  const [copiedTable, setCopiedTable] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);

  const updateBasicInput = useCallback(
    (key: keyof TenIndicatorInputs, rawValue: string) => {
      const val = safeNonNeg(rawValue);
      setInputs((prev) => {
        const next = { ...prev, [key]: val };
        if (key === "jumlahPenduduk" && syncMidYearPop) {
          next.pendudukPertengahanTahun = val;
        }
        if (key === "pendudukPertengahanTahun" && val !== prev.jumlahPenduduk) {
          setSyncMidYearPop(false);
        }
        return next;
      });
    },
    [syncMidYearPop]
  );

  // ==========================================================================
  // 1. CORE 10 BASIC INDICATORS CALCULATIONS
  // ==========================================================================
  const coreMetrics = useMemo(() => {
    const P = inputs.jumlahPenduduk;
    const Pmid = inputs.pendudukPertengahanTahun;
    const B = inputs.kelahiranHidup;
    const D_inf = inputs.kematianBayi;
    const D_mat = inputs.kematianIbu;
    const D_tot = inputs.totalKematian;
    const C_dbd = inputs.kasusDBD;
    const D_dbd = inputs.kematianDBD;
    const C_tb = inputs.kasusTBParu;
    const WUS = inputs.perempuanWUS;

    const cbr = Pmid > 0 ? (B / Pmid) * 1000 : null;
    const imr = B > 0 ? (D_inf / B) * 1000 : null;
    const mmr = B > 0 ? (D_mat / B) * 100000 : null;
    const cdr = Pmid > 0 ? (D_tot / Pmid) * 1000 : null;
    const irDbd = Pmid > 0 ? (C_dbd / Pmid) * 100000 : null;
    const cfrDbd = C_dbd > 0 ? (D_dbd / C_dbd) * 100 : null;
    const irTb = Pmid > 0 ? (C_tb / Pmid) * 100000 : null;
    const propWus = P > 0 ? (WUS / P) * 100 : null;
    const gfr = WUS > 0 ? (B / WUS) * 1000 : null;
    const rniPer1000 = cbr !== null && cdr !== null ? cbr - cdr : null;
    const rniPercent = rniPer1000 !== null ? rniPer1000 / 10 : null;

    return {
      cbr,
      imr,
      mmr,
      cdr,
      irDbd,
      cfrDbd,
      irTb,
      propWus,
      gfr,
      rniPer1000,
      rniPercent,
    };
  }, [inputs]);

  const basic10Rows: EpiTableRow[] = useMemo(() => {
    const P = inputs.jumlahPenduduk;
    const Pmid = inputs.pendudukPertengahanTahun;
    const B = inputs.kelahiranHidup;
    const D_inf = inputs.kematianBayi;
    const D_mat = inputs.kematianIbu;
    const D_tot = inputs.totalKematian;
    const C_dbd = inputs.kasusDBD;
    const D_dbd = inputs.kematianDBD;
    const C_tb = inputs.kasusTBParu;
    const WUS = inputs.perempuanWUS;

    const cbrVal = coreMetrics.cbr !== null ? fmtDec(coreMetrics.cbr, 2) : "—";
    const imrVal = coreMetrics.imr !== null ? fmtRateClean(coreMetrics.imr) : "—";
    const mmrVal = coreMetrics.mmr !== null ? fmtRateClean(coreMetrics.mmr) : "—";
    const cdrVal = coreMetrics.cdr !== null ? fmtRateClean(coreMetrics.cdr) : "—";
    const irDbdVal = coreMetrics.irDbd !== null ? fmtDec(coreMetrics.irDbd, 2) : "—";
    const cfrDbdVal = coreMetrics.cfrDbd !== null ? `${fmtDec(coreMetrics.cfrDbd, 2)}%` : "0,00%";
    const irTbVal = coreMetrics.irTb !== null ? fmtDec(coreMetrics.irTb, 2) : "—";
    const propWusVal = coreMetrics.propWus !== null ? `${fmtDec(coreMetrics.propWus, 2)}%` : "0,00%";
    const gfrVal = coreMetrics.gfr !== null ? fmtDec(coreMetrics.gfr, 2) : "—";

    return [
      {
        no: 1,
        indikator: "Jumlah penduduk",
        nilaiInput: `${fmtInt(P)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Total Populasi Wilayah",
        ukuranTone: "slate",
        rumusPlain: "Agregat cacah jiwa registrasi kependudukan",
      },
      {
        no: 2,
        indikator: "Penduduk pertengahan tahun",
        nilaiInput: `${fmtInt(Pmid)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Denominator Standar Laju",
        ukuranTone: "slate",
        rumusPlain: "Pembagi baku untuk kalkulasi CBR, CDR, dan IR",
      },
      {
        no: 3,
        indikator: "Kelahiran hidup",
        nilaiInput: `${fmtInt(B)} kelahiran`,
        nilaiTone: "blue",
        ukuran: "Crude Birth Rate (CBR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(B)} / ${fmtInt(Pmid)}) × 1.000 = `,
        hasilHighlight: cbrVal,
        hasilTone: "blue",
        rumusSuffix: " per 1.000 penduduk",
        rumusPlain: `(${fmtInt(B)} / ${fmtInt(Pmid)}) × 1.000 = ${cbrVal} per 1.000 penduduk`,
      },
      {
        no: 4,
        indikator: "Kematian bayi",
        nilaiInput: `${fmtInt(D_inf)} kematian`,
        nilaiTone: D_inf === 0 ? "teal" : "rose",
        ukuran: "Infant Mortality Rate (IMR)",
        ukuranTone: D_inf === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(D_inf)} / ${fmtInt(B)}) × 1.000 = `,
        hasilHighlight: imrVal,
        hasilTone: D_inf === 0 ? "teal" : "rose",
        rumusSuffix: " per 1.000 kelahiran hidup",
        rumusPlain: `(${fmtInt(D_inf)} / ${fmtInt(B)}) × 1.000 = ${imrVal} per 1.000 kelahiran hidup`,
      },
      {
        no: 5,
        indikator: "Kematian ibu",
        nilaiInput: `${fmtInt(D_mat)} kematian`,
        nilaiTone: D_mat === 0 ? "teal" : "rose",
        ukuran: "Maternal Mortality Ratio (MMR)",
        ukuranTone: D_mat === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(D_mat)} / ${fmtInt(B)}) × 100.000 = `,
        hasilHighlight: mmrVal,
        hasilTone: D_mat === 0 ? "teal" : "rose",
        rumusSuffix: " per 100.000 kelahiran hidup",
        rumusPlain: `(${fmtInt(D_mat)} / ${fmtInt(B)}) × 100.000 = ${mmrVal} per 100.000 kelahiran hidup`,
      },
      {
        no: 6,
        indikator: "Total kematian",
        nilaiInput: `${fmtInt(D_tot)} kematian`,
        nilaiTone: D_tot === 0 ? "teal" : "blue",
        ukuran: "Crude Death Rate (CDR)",
        ukuranTone: D_tot === 0 ? "teal" : "blue",
        rumusPrefix: `(${fmtInt(D_tot)} / ${fmtInt(Pmid)}) × 1.000 = `,
        hasilHighlight: cdrVal,
        hasilTone: D_tot === 0 ? "teal" : "blue",
        rumusSuffix: " per 1.000 penduduk",
        rumusPlain: `(${fmtInt(D_tot)} / ${fmtInt(Pmid)}) × 1.000 = ${cdrVal} per 1.000 penduduk`,
      },
      {
        no: 7,
        indikator: "Kasus DBD",
        nilaiInput: `${fmtInt(C_dbd)} kasus`,
        nilaiTone: "blue",
        ukuran: "Incidence Rate (IR) DBD",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(C_dbd)} / ${fmtInt(Pmid)}) × 100.000 = `,
        hasilHighlight: irDbdVal,
        hasilTone: (coreMetrics.irDbd ?? 0) >= 49 ? "rose" : "blue",
        rumusSuffix: " per 100.000 penduduk",
        rumusPlain: `(${fmtInt(C_dbd)} / ${fmtInt(Pmid)}) × 100.000 = ${irDbdVal} per 100.000 penduduk`,
      },
      {
        no: 8,
        indikator: "Kematian akibat DBD",
        nilaiInput: `${fmtInt(D_dbd)} kematian`,
        nilaiTone: D_dbd === 0 ? "teal" : "rose",
        ukuran: "Case Fatality Rate (CFR) DBD",
        ukuranTone: D_dbd === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(D_dbd)} / ${fmtInt(C_dbd)}) × 100% = `,
        hasilHighlight: cfrDbdVal,
        hasilTone: D_dbd === 0 ? "teal" : (coreMetrics.cfrDbd ?? 0) >= 1 ? "rose" : "teal",
        rumusSuffix: " fatalitas kasus",
        rumusPlain: `(${fmtInt(D_dbd)} / ${fmtInt(C_dbd)}) × 100% = ${cfrDbdVal} fatalitas kasus`,
      },
      {
        no: 9,
        indikator: "Kasus TB paru",
        nilaiInput: `${fmtInt(C_tb)} kasus`,
        nilaiTone: "blue",
        ukuran: "Incidence Rate (IR) TB Paru",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(C_tb)} / ${fmtInt(Pmid)}) × 100.000 = `,
        hasilHighlight: irTbVal,
        hasilTone: "blue",
        rumusSuffix: " per 100.000 penduduk",
        rumusPlain: `(${fmtInt(C_tb)} / ${fmtInt(Pmid)}) × 100.000 = ${irTbVal} per 100.000 penduduk`,
      },
      {
        no: 10,
        indikator: "Perempuan usia 15–49 tahun",
        nilaiInput: `${fmtInt(WUS)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Proporsi WUS & GFR Wilayah",
        ukuranTone: "bold",
        rumusPlain: `Proporsi: ${propWusVal} ; GFR: (${fmtInt(B)} / ${fmtInt(WUS)}) × 1.000 = ${gfrVal} per 1.000 WUS`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900 leading-relaxed">
            Proporsi:{" "}
            <span className="text-sky-600 font-semibold">{propWusVal}</span> ;
            GFR: ({fmtInt(B)} / {fmtInt(WUS)}) × 1.000 ={" "}
            <span className="text-sky-600 font-semibold">{gfrVal}</span> per
            1.000 WUS
          </span>
        ),
      },
    ];
  }, [inputs, coreMetrics]);

  // ==========================================================================
  // 2. ADVANCED MORTALITY & FERTILITY MEASURES
  // ==========================================================================
  const mortalityFertilityRows: EpiTableRow[] = useMemo(() => {
    const Pmid = inputs.pendudukPertengahanTahun;
    const B = inputs.kelahiranHidup;
    const D_tot = inputs.totalKematian;
    const WUS = inputs.perempuanWUS;

    const rni1000 = coreMetrics.rniPer1000;
    const rniPct = coreMetrics.rniPercent;
    const nmr = B > 0 ? (mfInputs.kematianNeonatal / B) * 1000 : null;
    const pnmr = B > 0 ? (mfInputs.kematianPostNeonatal / B) * 1000 : null;
    const u5mr = B > 0 ? (mfInputs.kematianBalita / B) * 1000 : null;
    const totalBirths = B + mfInputs.lahirMati;
    const fdr = totalBirths > 0 ? (mfInputs.lahirMati / totalBirths) * 1000 : null;
    const perinatal =
      totalBirths > 0
        ? ((mfInputs.lahirMati + mfInputs.kematianNeonatalDini) / totalBirths) * 1000
        : null;
    const csmr =
      Pmid > 0 ? (mfInputs.kematianPenyebabKhusus / Pmid) * 100000 : null;
    const pmrDenom = Math.max(D_tot, mfInputs.kematianPenyebabKhusus);
    const pmr =
      pmrDenom > 0 ? (mfInputs.kematianPenyebabKhusus / pmrDenom) * 100 : null;
    const asdr =
      mfInputs.pendudukKelompokUmur > 0
        ? (mfInputs.kematianKelompokUmur / mfInputs.pendudukKelompokUmur) * 1000
        : null;
    const asfr =
      mfInputs.wusKelompokUmurIbu > 0
        ? (mfInputs.kelahiranKelompokUmurIbu / mfInputs.wusKelompokUmurIbu) * 1000
        : null;
    const sumAsfr = mfInputs.asfrBands.reduce((acc, v) => acc + v, 0);
    const tfr = (5 * sumAsfr) / 1000;
    const cwr = WUS > 0 ? (mfInputs.anakBalita0_4 / WUS) * 1000 : null;
    const depRatio =
      mfInputs.pendudukUsiaProduktif15_64 > 0
        ? ((mfInputs.pendudukUsiaMuda0_14 + mfInputs.pendudukLansia65Plus) /
            mfInputs.pendudukUsiaProduktif15_64) *
          100
        : null;

    return [
      {
        no: 1,
        indikator: "Selisih CBR & CDR (Pertumbuhan Alamiah)",
        nilaiInput: `CBR ${fmtDec(coreMetrics.cbr ?? 0, 2)} − CDR ${fmtDec(coreMetrics.cdr ?? 0, 2)}`,
        nilaiTone: "blue",
        ukuran: "Rate of Natural Increase (RNI)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtDec(coreMetrics.cbr ?? 0, 2)} − ${fmtDec(coreMetrics.cdr ?? 0, 2)}) = `,
        hasilHighlight: rni1000 !== null ? `${fmtDec(rni1000, 2)}‰ (${fmtDec(rniPct ?? 0, 2)}%)` : "—",
        hasilTone: (rni1000 ?? 0) >= 0 ? "teal" : "rose",
        rumusSuffix: " pertumbuhan penduduk alami/tahun",
        rumusPlain: `(${fmtDec(coreMetrics.cbr ?? 0, 2)} − ${fmtDec(coreMetrics.cdr ?? 0, 2)}) = ${rni1000 !== null ? `${fmtDec(rni1000, 2)} per 1.000 (${fmtDec(rniPct ?? 0, 2)}%)` : "—"}`,
      },
      {
        no: 2,
        indikator: "Kematian neonatal (0–28 hari)",
        nilaiInput: `${fmtInt(mfInputs.kematianNeonatal)} kematian`,
        nilaiTone: mfInputs.kematianNeonatal === 0 ? "teal" : "rose",
        ukuran: "Neonatal Mortality Rate (NMR)",
        ukuranTone: mfInputs.kematianNeonatal === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(mfInputs.kematianNeonatal)} / ${fmtInt(B)}) × 1.000 = `,
        hasilHighlight: nmr !== null ? fmtRateClean(nmr) : "—",
        hasilTone: mfInputs.kematianNeonatal === 0 ? "teal" : "rose",
        rumusSuffix: " per 1.000 kelahiran hidup",
        rumusPlain: `(${fmtInt(mfInputs.kematianNeonatal)} / ${fmtInt(B)}) × 1.000 = ${nmr !== null ? fmtRateClean(nmr) : "—"} per 1.000 kelahiran hidup`,
      },
      {
        no: 3,
        indikator: "Kematian post-neonatal (29 hr–11 bln)",
        nilaiInput: `${fmtInt(mfInputs.kematianPostNeonatal)} kematian`,
        nilaiTone: mfInputs.kematianPostNeonatal === 0 ? "teal" : "rose",
        ukuran: "Post-Neonatal Mortality Rate (PNMR)",
        ukuranTone: mfInputs.kematianPostNeonatal === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(mfInputs.kematianPostNeonatal)} / ${fmtInt(B)}) × 1.000 = `,
        hasilHighlight: pnmr !== null ? fmtRateClean(pnmr) : "—",
        hasilTone: mfInputs.kematianPostNeonatal === 0 ? "teal" : "rose",
        rumusSuffix: " per 1.000 kelahiran hidup",
        rumusPlain: `(${fmtInt(mfInputs.kematianPostNeonatal)} / ${fmtInt(B)}) × 1.000 = ${pnmr !== null ? fmtRateClean(pnmr) : "—"} per 1.000 kelahiran hidup`,
      },
      {
        no: 4,
        indikator: "Kematian balita (<5 tahun)",
        nilaiInput: `${fmtInt(mfInputs.kematianBalita)} kematian`,
        nilaiTone: mfInputs.kematianBalita === 0 ? "teal" : "rose",
        ukuran: "Under-Five Mortality Rate (U5MR / AKABA)",
        ukuranTone: mfInputs.kematianBalita === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(mfInputs.kematianBalita)} / ${fmtInt(B)}) × 1.000 = `,
        hasilHighlight: u5mr !== null ? fmtRateClean(u5mr) : "—",
        hasilTone: mfInputs.kematianBalita === 0 ? "teal" : "rose",
        rumusSuffix: " per 1.000 kelahiran hidup",
        rumusPlain: `(${fmtInt(mfInputs.kematianBalita)} / ${fmtInt(B)}) × 1.000 = ${u5mr !== null ? fmtRateClean(u5mr) : "—"} per 1.000 kelahiran hidup`,
      },
      {
        no: 5,
        indikator: "Lahir mati (Stillbirth ≥28 minggu)",
        nilaiInput: `${fmtInt(mfInputs.lahirMati)} kasus`,
        nilaiTone: mfInputs.lahirMati === 0 ? "teal" : "blue",
        ukuran: "Fetal Death / Stillbirth Rate (FDR)",
        ukuranTone: mfInputs.lahirMati === 0 ? "teal" : "blue",
        rumusPrefix: `(${fmtInt(mfInputs.lahirMati)} / ${fmtInt(totalBirths)}) × 1.000 = `,
        hasilHighlight: fdr !== null ? fmtDec(fdr, 2) : "—",
        hasilTone: mfInputs.lahirMati === 0 ? "teal" : "blue",
        rumusSuffix: " per 1.000 total kelahiran",
        rumusPlain: `(${fmtInt(mfInputs.lahirMati)} / ${fmtInt(totalBirths)}) × 1.000 = ${fdr !== null ? fmtDec(fdr, 2) : "—"} per 1.000 total kelahiran`,
      },
      {
        no: 6,
        indikator: "Lahir mati + neonatal dini (<7 hari)",
        nilaiInput: `${fmtInt(mfInputs.lahirMati + mfInputs.kematianNeonatalDini)} kasus`,
        nilaiTone: "blue",
        ukuran: "Perinatal Mortality Rate (PMR Perinatal)",
        ukuranTone: "blue",
        rumusPrefix: `((${fmtInt(mfInputs.lahirMati)} + ${fmtInt(mfInputs.kematianNeonatalDini)}) / ${fmtInt(totalBirths)}) × 1.000 = `,
        hasilHighlight: perinatal !== null ? fmtDec(perinatal, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 1.000 total kelahiran",
        rumusPlain: `((${fmtInt(mfInputs.lahirMati)} + ${fmtInt(mfInputs.kematianNeonatalDini)}) / ${fmtInt(totalBirths)}) × 1.000 = ${perinatal !== null ? fmtDec(perinatal, 2) : "—"} per 1.000 total kelahiran`,
      },
      {
        no: 7,
        indikator: `Kematian penyebab khusus (${mfInputs.namaPenyebabKhusus || "Penyakit X"})`,
        nilaiInput: `${fmtInt(mfInputs.kematianPenyebabKhusus)} kematian`,
        nilaiTone: "blue",
        ukuran: "Cause-Specific Mortality Rate (CSMR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(mfInputs.kematianPenyebabKhusus)} / ${fmtInt(Pmid)}) × 100.000 = `,
        hasilHighlight: csmr !== null ? fmtDec(csmr, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 100.000 penduduk",
        rumusPlain: `(${fmtInt(mfInputs.kematianPenyebabKhusus)} / ${fmtInt(Pmid)}) × 100.000 = ${csmr !== null ? fmtDec(csmr, 2) : "—"} per 100.000 penduduk`,
      },
      {
        no: 8,
        indikator: `Proporsi kematian ${mfInputs.namaPenyebabKhusus || "Penyakit X"}`,
        nilaiInput: `${fmtInt(mfInputs.kematianPenyebabKhusus)} / ${fmtInt(pmrDenom)} kematian`,
        nilaiTone: "blue",
        ukuran: "Proportionate Mortality Ratio (PMR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(mfInputs.kematianPenyebabKhusus)} / ${fmtInt(pmrDenom)}) × 100% = `,
        hasilHighlight: pmr !== null ? `${fmtDec(pmr, 2)}%` : "0,00%",
        hasilTone: "blue",
        rumusSuffix: D_tot === 0 && mfInputs.kematianPenyebabKhusus > 0 ? " (total kematian disesuaikan)" : " dari total kematian",
        rumusPlain: `(${fmtInt(mfInputs.kematianPenyebabKhusus)} / ${fmtInt(pmrDenom)}) × 100% = ${pmr !== null ? `${fmtDec(pmr, 2)}%` : "0,00%"} dari total kematian`,
      },
      {
        no: 9,
        indikator: `Kematian kelompok umur (${mfInputs.kelompokUmurLabel})`,
        nilaiInput: `${fmtInt(mfInputs.kematianKelompokUmur)} / ${fmtInt(mfInputs.pendudukKelompokUmur)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Age-Specific Death Rate (ASDR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(mfInputs.kematianKelompokUmur)} / ${fmtInt(mfInputs.pendudukKelompokUmur)}) × 1.000 = `,
        hasilHighlight: asdr !== null ? fmtDec(asdr, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 1.000 penduduk usia tsb",
        rumusPlain: `(${fmtInt(mfInputs.kematianKelompokUmur)} / ${fmtInt(mfInputs.pendudukKelompokUmur)}) × 1.000 = ${asdr !== null ? fmtDec(asdr, 2) : "—"} per 1.000 penduduk kelompok umur`,
      },
      {
        no: 10,
        indikator: "Kelahiran pada kelompok umur ibu spesifik",
        nilaiInput: `${fmtInt(mfInputs.kelahiranKelompokUmurIbu)} / ${fmtInt(mfInputs.wusKelompokUmurIbu)} WUS`,
        nilaiTone: "blue",
        ukuran: "Age-Specific Fertility Rate (ASFR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(mfInputs.kelahiranKelompokUmurIbu)} / ${fmtInt(mfInputs.wusKelompokUmurIbu)}) × 1.000 = `,
        hasilHighlight: asfr !== null ? fmtDec(asfr, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 1.000 WUS kelompok umur",
        rumusPlain: `(${fmtInt(mfInputs.kelahiranKelompokUmurIbu)} / ${fmtInt(mfInputs.wusKelompokUmurIbu)}) × 1.000 = ${asfr !== null ? fmtDec(asfr, 2) : "—"} per 1.000 WUS kelompok umur`,
      },
      {
        no: 11,
        indikator: "Total ASFR 7 kelompok umur (15–49 thn)",
        nilaiInput: `Σ ASFR = ${fmtDec(sumAsfr, 1)}‰`,
        nilaiTone: "blue",
        ukuran: "Total Fertility Rate (TFR)",
        ukuranTone: "bold",
        rumusPrefix: `(5 × ${fmtDec(sumAsfr, 1)}) / 1.000 = `,
        hasilHighlight: `${fmtDec(tfr, 2)} anak`,
        hasilTone: "blue",
        rumusSuffix: " rata-rata per wanita sepanjang masa subur",
        rumusPlain: `(5 × ${fmtDec(sumAsfr, 1)}) / 1.000 = ${fmtDec(tfr, 2)} anak per wanita`,
      },
      {
        no: 12,
        indikator: "Anak balita 0–4 tahun & Rasio Ketergantungan",
        nilaiInput: `${fmtInt(mfInputs.anakBalita0_4)} balita`,
        nilaiTone: "blue",
        ukuran: "Child-Woman Ratio (CWR) & Dependency Ratio",
        ukuranTone: "bold",
        rumusPlain: `CWR: (${fmtInt(mfInputs.anakBalita0_4)} / ${fmtInt(WUS)}) × 1.000 = ${cwr !== null ? fmtDec(cwr, 2) : "—"} per 1.000 WUS ; Dependency Ratio: ${depRatio !== null ? `${fmtDec(depRatio, 2)}%` : "—"}`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900 leading-relaxed">
            CWR: ({fmtInt(mfInputs.anakBalita0_4)} / {fmtInt(WUS)}) × 1.000 ={" "}
            <span className="text-sky-600 font-semibold">
              {cwr !== null ? fmtDec(cwr, 2) : "—"}
            </span>{" "}
            per 1.000 WUS ; Rasio Ketergantungan:{" "}
            <span className="text-sky-600 font-semibold">
              {depRatio !== null ? `${fmtDec(depRatio, 2)}%` : "—"}
            </span>
          </span>
        ),
      },
    ];
  }, [inputs, coreMetrics, mfInputs]);

  // ==========================================================================
  // 3. MORBIDITY & SURVEILLANCE MEASURES
  // ==========================================================================
  const morbidityRows: EpiTableRow[] = useMemo(() => {
    const P = inputs.jumlahPenduduk;
    const Pmid = inputs.pendudukPertengahanTahun;
    const k = morbInputs.konstantaCI || 1000;

    const ci =
      morbInputs.populasiBerisiko > 0
        ? (morbInputs.kasusBaru / morbInputs.populasiBerisiko) * k
        : null;
    const idRate =
      morbInputs.totalPersonYears > 0
        ? (morbInputs.kasusBaru / morbInputs.totalPersonYears) * 1000
        : null;
    const pointPrevPct =
      P > 0 ? (morbInputs.kasusAktifTitikWaktu / P) * 100 : null;
    const pointPrev1000 =
      P > 0 ? (morbInputs.kasusAktifTitikWaktu / P) * 1000 : null;
    const totalPeriodCases = morbInputs.kasusLama + morbInputs.kasusBaru;
    const periodPrevPct =
      Pmid > 0 ? (totalPeriodCases / Pmid) * 100 : null;
    const ar =
      morbInputs.populasiTerpaparKLB > 0
        ? (morbInputs.kasusKLB / morbInputs.populasiTerpaparKLB) * 100
        : null;
    const sarDenom = Math.max(0, morbInputs.kontakRentan - morbInputs.kasusPrimer);
    const sar = sarDenom > 0 ? (morbInputs.kasusSekunder / sarDenom) * 100 : null;
    const cfrUmum =
      morbInputs.totalKasusPenyakitUmum > 0
        ? (morbInputs.kematianPenyakitUmum / morbInputs.totalKasusPenyakitUmum) * 100
        : null;
    const irUmum =
      Pmid > 0 ? (morbInputs.kasusBaru / Pmid) * 100000 : null;
    // Steady state P / I duration estimate (in years, assuming P = pointPrev fraction, I = idRate per person-year)
    const pFrac = P > 0 ? morbInputs.kasusAktifTitikWaktu / P : 0;
    const iFrac = morbInputs.totalPersonYears > 0 ? morbInputs.kasusBaru / morbInputs.totalPersonYears : 0;
    const estDurationMonths = iFrac > 0 ? (pFrac / iFrac) * 12 : null;

    return [
      {
        no: 1,
        indikator: `Kasus baru ${morbInputs.namaPenyakit || "Penyakit"} (Populasi Berisiko)`,
        nilaiInput: `${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.populasiBerisiko)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Cumulative Incidence (CI / Risiko)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.populasiBerisiko)}) × ${fmtInt(k)} = `,
        hasilHighlight: ci !== null ? fmtDec(ci, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: ` per ${fmtInt(k)} populasi berisiko`,
        rumusPlain: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.populasiBerisiko)}) × ${fmtInt(k)} = ${ci !== null ? fmtDec(ci, 2) : "—"} per ${fmtInt(k)} populasi berisiko`,
      },
      {
        no: 2,
        indikator: "Kasus baru per total waktu-orang (Person-Time)",
        nilaiInput: `${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.totalPersonYears)} org-thn`,
        nilaiTone: "blue",
        ukuran: "Incidence Density / Person-Time Rate (ID)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.totalPersonYears)}) × 1.000 = `,
        hasilHighlight: idRate !== null ? fmtDec(idRate, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 1.000 person-years",
        rumusPlain: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(morbInputs.totalPersonYears)}) × 1.000 = ${idRate !== null ? fmtDec(idRate, 2) : "—"} per 1.000 person-years`,
      },
      {
        no: 3,
        indikator: "Kasus aktif pada satu titik waktu",
        nilaiInput: `${fmtInt(morbInputs.kasusAktifTitikWaktu)} kasus`,
        nilaiTone: "blue",
        ukuran: "Point Prevalence (Prevalensi Titik)",
        ukuranTone: "blue",
        rumusPlain: `(${fmtInt(morbInputs.kasusAktifTitikWaktu)} / ${fmtInt(P)}) × 100% = ${pointPrevPct !== null ? `${fmtDec(pointPrevPct, 2)}%` : "—"} (${pointPrev1000 !== null ? fmtDec(pointPrev1000, 2) : "—"} per 1.000)`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900">
            ({fmtInt(morbInputs.kasusAktifTitikWaktu)} / {fmtInt(P)}) × 100% ={" "}
            <span className="text-sky-600 font-semibold">
              {pointPrevPct !== null ? `${fmtDec(pointPrevPct, 2)}%` : "—"}
            </span>{" "}
            (
            <span className="text-sky-600 font-semibold">
              {pointPrev1000 !== null ? fmtDec(pointPrev1000, 2) : "—"}
            </span>{" "}
            per 1.000 penduduk)
          </span>
        ),
      },
      {
        no: 4,
        indikator: "Total kasus lama + baru dalam periode",
        nilaiInput: `${fmtInt(morbInputs.kasusLama)} + ${fmtInt(morbInputs.kasusBaru)} = ${fmtInt(totalPeriodCases)}`,
        nilaiTone: "blue",
        ukuran: "Period Prevalence (Prevalensi Periode)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(totalPeriodCases)} / ${fmtInt(Pmid)}) × 100% = `,
        hasilHighlight: periodPrevPct !== null ? `${fmtDec(periodPrevPct, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: " populasi terdampak dalam periode",
        rumusPlain: `(${fmtInt(totalPeriodCases)} / ${fmtInt(Pmid)}) × 100% = ${periodPrevPct !== null ? `${fmtDec(periodPrevPct, 2)}%` : "—"} populasi terdampak`,
      },
      {
        no: 5,
        indikator: "Kasus KLB / Wabah pada kelompok terpapar",
        nilaiInput: `${fmtInt(morbInputs.kasusKLB)} / ${fmtInt(morbInputs.populasiTerpaparKLB)} terpapar`,
        nilaiTone: "blue",
        ukuran: "Attack Rate (AR / Angka Serangan)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(morbInputs.kasusKLB)} / ${fmtInt(morbInputs.populasiTerpaparKLB)}) × 100% = `,
        hasilHighlight: ar !== null ? `${fmtDec(ar, 2)}%` : "—",
        hasilTone: (ar ?? 0) >= 20 ? "rose" : "blue",
        rumusSuffix: " risiko serangan KLB",
        rumusPlain: `(${fmtInt(morbInputs.kasusKLB)} / ${fmtInt(morbInputs.populasiTerpaparKLB)}) × 100% = ${ar !== null ? `${fmtDec(ar, 2)}%` : "—"} risiko serangan`,
      },
      {
        no: 6,
        indikator: "Penularan sekunder dari kontak erat rentan",
        nilaiInput: `${fmtInt(morbInputs.kasusSekunder)} / (${fmtInt(morbInputs.kontakRentan)} − ${fmtInt(morbInputs.kasusPrimer)})`,
        nilaiTone: "blue",
        ukuran: "Secondary Attack Rate (SAR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(morbInputs.kasusSekunder)} / ${fmtInt(sarDenom)}) × 100% = `,
        hasilHighlight: sar !== null ? `${fmtDec(sar, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: " tingkat penularan kontak serumah/erat",
        rumusPlain: `(${fmtInt(morbInputs.kasusSekunder)} / ${fmtInt(sarDenom)}) × 100% = ${sar !== null ? `${fmtDec(sar, 2)}%` : "—"} penularan sekunder`,
      },
      {
        no: 7,
        indikator: `Kematian akibat ${morbInputs.namaPenyakit || "Penyakit"}`,
        nilaiInput: `${fmtInt(morbInputs.kematianPenyakitUmum)} / ${fmtInt(morbInputs.totalKasusPenyakitUmum)} kasus`,
        nilaiTone: morbInputs.kematianPenyakitUmum === 0 ? "teal" : "rose",
        ukuran: "Case Fatality Rate (CFR) Penyakit",
        ukuranTone: morbInputs.kematianPenyakitUmum === 0 ? "teal" : "rose",
        rumusPrefix: `(${fmtInt(morbInputs.kematianPenyakitUmum)} / ${fmtInt(morbInputs.totalKasusPenyakitUmum)}) × 100% = `,
        hasilHighlight: cfrUmum !== null ? `${fmtDec(cfrUmum, 2)}%` : "0,00%",
        hasilTone: morbInputs.kematianPenyakitUmum === 0 ? "teal" : "rose",
        rumusSuffix: " fatalitas kasus spesifik",
        rumusPlain: `(${fmtInt(morbInputs.kematianPenyakitUmum)} / ${fmtInt(morbInputs.totalKasusPenyakitUmum)}) × 100% = ${cfrUmum !== null ? `${fmtDec(cfrUmum, 2)}%` : "0,00%"} fatalitas kasus`,
      },
      {
        no: 8,
        indikator: `Insidens ${morbInputs.namaPenyakit || "Penyakit"} berbasis populasi`,
        nilaiInput: `${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(Pmid)} jiwa`,
        nilaiTone: "blue",
        ukuran: "Cause-Specific Incidence Rate (IR)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(Pmid)}) × 100.000 = `,
        hasilHighlight: irUmum !== null ? fmtDec(irUmum, 2) : "—",
        hasilTone: "blue",
        rumusSuffix: " per 100.000 penduduk",
        rumusPlain: `(${fmtInt(morbInputs.kasusBaru)} / ${fmtInt(Pmid)}) × 100.000 = ${irUmum !== null ? fmtDec(irUmum, 2) : "—"} per 100.000 penduduk`,
      },
      {
        no: 9,
        indikator: "Relasi Prevalensi & Insidens (P ≈ I × D)",
        nilaiInput: `P = ${fmtDec(pFrac * 100, 2)}% ; I = ${fmtDec(idRate ?? 0, 2)}‰`,
        nilaiTone: "slate",
        ukuran: "Estimasi Durasi Rata-Rata Penyakit (D)",
        ukuranTone: "bold",
        rumusPrefix: `D = (P / I) × 12 bulan = `,
        hasilHighlight: estDurationMonths !== null ? `${fmtDec(estDurationMonths, 1)} bulan` : "—",
        hasilTone: "blue",
        rumusSuffix: " (asumsi steady-state)",
        rumusPlain: `D = (P / I) × 12 bulan = ${estDurationMonths !== null ? `${fmtDec(estDurationMonths, 1)} bulan` : "—"} (asumsi steady-state)`,
      },
    ];
  }, [inputs, morbInputs]);

  // ==========================================================================
  // 4. 2x2 ASSOCIATION & DIAGNOSTIC SCREENING MEASURES
  // ==========================================================================
  const twoByTwoComputed = useMemo(() => {
    const { a, b, c, d } = table2x2;
    const row1 = a + b;
    const row2 = c + d;
    const col1 = a + c;
    const col2 = b + d;
    const total = a + b + c + d;

    const ie = row1 > 0 ? a / row1 : null;
    const i0 = row2 > 0 ? c / row2 : null;
    const itotal = total > 0 ? col1 / total : null;

    const rr = ie !== null && i0 !== null && i0 > 0 ? ie / i0 : null;
    let rrCi: [number, number] | null = null;
    if (rr !== null && a > 0 && c > 0 && row1 > 0 && row2 > 0) {
      const seLnRr = Math.sqrt(1 / a - 1 / row1 + 1 / c - 1 / row2);
      rrCi = [Math.exp(Math.log(rr) - 1.96 * seLnRr), Math.exp(Math.log(rr) + 1.96 * seLnRr)];
    }

    const or = b > 0 && c > 0 ? (a * d) / (b * c) : null;
    let orCi: [number, number] | null = null;
    if (or !== null && a > 0 && b > 0 && c > 0 && d > 0) {
      const seLnOr = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      orCi = [Math.exp(Math.log(or) - 1.96 * seLnOr), Math.exp(Math.log(or) + 1.96 * seLnOr)];
    }

    const ar = ie !== null && i0 !== null ? ie - i0 : null;
    const arPct = ie !== null && i0 !== null && ie > 0 ? ((ie - i0) / ie) * 100 : null;
    const par = itotal !== null && i0 !== null ? itotal - i0 : null;
    const parPct = itotal !== null && i0 !== null && itotal > 0 ? ((itotal - i0) / itotal) * 100 : null;
    const nnt = ar !== null && Math.abs(ar) > 0 ? 1 / Math.abs(ar) : null;

    // Diagnostic screening (TP=a, FP=b, FN=c, TN=d)
    const sens = col1 > 0 ? (a / col1) * 100 : null;
    const spec = col2 > 0 ? (d / col2) * 100 : null;
    const ppv = row1 > 0 ? (a / row1) * 100 : null;
    const npv = row2 > 0 ? (d / row2) * 100 : null;
    const lrPos =
      sens !== null && spec !== null && spec < 100
        ? (sens / 100) / (1 - spec / 100)
        : null;
    const lrNeg =
      sens !== null && spec !== null && spec > 0
        ? (1 - sens / 100) / (spec / 100)
        : null;
    const accuracy = total > 0 ? ((a + d) / total) * 100 : null;
    const prevSample = total > 0 ? (col1 / total) * 100 : null;

    return {
      row1,
      row2,
      col1,
      col2,
      total,
      ie,
      i0,
      itotal,
      rr,
      rrCi,
      or,
      orCi,
      ar,
      arPct,
      par,
      parPct,
      nnt,
      sens,
      spec,
      ppv,
      npv,
      lrPos,
      lrNeg,
      accuracy,
      prevSample,
    };
  }, [table2x2]);

  const associationRows: EpiTableRow[] = useMemo(() => {
    const { a, b, c, d } = table2x2;
    const m = twoByTwoComputed;
    const rrLabel =
      m.rr === null
        ? "—"
        : m.rr > 1
        ? "Faktor Risiko"
        : m.rr < 1
        ? "Faktor Protektif"
        : "Tidak Berasosiasi";

    return [
      {
        no: 1,
        indikator: "Insidens kelompok terpapar (Ie) vs tidak terpapar (I0)",
        nilaiInput: `a=${fmtInt(a)}, a+b=${fmtInt(m.row1)} | c=${fmtInt(c)}, c+d=${fmtInt(m.row2)}`,
        nilaiTone: "blue",
        ukuran: "Incidence Exposed (Ie) & Unexposed (I0)",
        ukuranTone: "blue",
        rumusPlain: `Ie = ${m.ie !== null ? `${fmtDec(m.ie * 100, 2)}%` : "—"} ; I0 = ${m.i0 !== null ? `${fmtDec(m.i0 * 100, 2)}%` : "—"}`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900">
            Ie = ({fmtInt(a)} / {fmtInt(m.row1)}) ={" "}
            <span className="text-sky-600">{m.ie !== null ? `${fmtDec(m.ie * 100, 2)}%` : "—"}</span> ; I0 = ({fmtInt(c)} / {fmtInt(m.row2)}) ={" "}
            <span className="text-teal-600">{m.i0 !== null ? `${fmtDec(m.i0 * 100, 2)}%` : "—"}</span>
          </span>
        ),
      },
      {
        no: 2,
        indikator: "Perbandingan risiko terpapar / tidak terpapar (Kohort)",
        nilaiInput: `Ie / I0`,
        nilaiTone: "blue",
        ukuran: "Relative Risk (RR) & 95% CI",
        ukuranTone: m.rr !== null && m.rr > 1 ? "rose" : "teal",
        rumusPrefix: `(${m.ie !== null ? fmtDec(m.ie, 4) : "0"} / ${m.i0 !== null ? fmtDec(m.i0, 4) : "0"}) = `,
        hasilHighlight: m.rr !== null ? fmtDec(m.rr, 2) : "—",
        hasilTone: m.rr !== null && m.rr > 1 ? "rose" : "teal",
        rumusSuffix: m.rrCi
          ? ` (95% CI: ${fmtDec(m.rrCi[0], 2)}–${fmtDec(m.rrCi[1], 2)}) · ${rrLabel}`
          : ` · ${rrLabel}`,
        rumusPlain: `RR = ${m.rr !== null ? fmtDec(m.rr, 2) : "—"}${m.rrCi ? ` (95% CI: ${fmtDec(m.rrCi[0], 2)}–${fmtDec(m.rrCi[1], 2)})` : ""} · ${rrLabel}`,
      },
      {
        no: 3,
        indikator: "Rasio odds paparan kasus vs kontrol (Kasus-Kontrol)",
        nilaiInput: `(${fmtInt(a)}×${fmtInt(d)}) / (${fmtInt(b)}×${fmtInt(c)})`,
        nilaiTone: "blue",
        ukuran: "Odds Ratio (OR) & 95% CI",
        ukuranTone: m.or !== null && m.or > 1 ? "rose" : "teal",
        rumusPrefix: `(${fmtInt(a * d)} / ${fmtInt(b * c)}) = `,
        hasilHighlight: m.or !== null ? fmtDec(m.or, 2) : "—",
        hasilTone: m.or !== null && m.or > 1 ? "rose" : "teal",
        rumusSuffix: m.orCi
          ? ` (95% CI: ${fmtDec(m.orCi[0], 2)}–${fmtDec(m.orCi[1], 2)})`
          : "",
        rumusPlain: `OR = (${fmtInt(a)}×${fmtInt(d)}) / (${fmtInt(b)}×${fmtInt(c)}) = ${m.or !== null ? fmtDec(m.or, 2) : "—"}${m.orCi ? ` (95% CI: ${fmtDec(m.orCi[0], 2)}–${fmtDec(m.orCi[1], 2)})` : ""}`,
      },
      {
        no: 4,
        indikator: "Selisih risiko absolut akibat paparan",
        nilaiInput: `Ie − I0`,
        nilaiTone: "blue",
        ukuran: "Attributable Risk (AR / Risk Difference)",
        ukuranTone: "blue",
        rumusPrefix: `(${m.ie !== null ? `${fmtDec(m.ie * 100, 2)}%` : "—"} − ${m.i0 !== null ? `${fmtDec(m.i0 * 100, 2)}%` : "—"}) = `,
        hasilHighlight: m.ar !== null ? `${fmtDec(m.ar * 100, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: m.nnt !== null ? ` ; ${m.ar !== null && m.ar < 0 ? "NNT" : "NNH"} = ${fmtDec(m.nnt, 1)}` : "",
        rumusPlain: `AR = ${m.ar !== null ? `${fmtDec(m.ar * 100, 2)}%` : "—"}${m.nnt !== null ? ` ; ${m.ar !== null && m.ar < 0 ? "NNT" : "NNH"} = ${fmtDec(m.nnt, 1)}` : ""}`,
      },
      {
        no: 5,
        indikator: "Fraksi etiologi pada kelompok terpapar",
        nilaiInput: `((Ie − I0) / Ie) × 100%`,
        nilaiTone: "blue",
        ukuran: "Attributable Risk Percent (AR% / EF)",
        ukuranTone: "blue",
        rumusPrefix: `AR% = `,
        hasilHighlight: m.arPct !== null ? `${fmtDec(m.arPct, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: " kasus pada terpapar dapat dicegah jika paparan dihilangkan",
        rumusPlain: `AR% = ${m.arPct !== null ? `${fmtDec(m.arPct, 2)}%` : "—"}`,
      },
      {
        no: 6,
        indikator: "Dampak paparan pada populasi total",
        nilaiInput: `Itotal = ${m.itotal !== null ? `${fmtDec(m.itotal * 100, 2)}%` : "—"}`,
        nilaiTone: "blue",
        ukuran: "Population Attributable Risk (PAR & PAR%)",
        ukuranTone: "bold",
        rumusPlain: `PAR = ${m.par !== null ? `${fmtDec(m.par * 100, 2)}%` : "—"} ; PAR% = ${m.parPct !== null ? `${fmtDec(m.parPct, 2)}%` : "—"}`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900">
            PAR = (Itotal − I0) ={" "}
            <span className="text-sky-600">{m.par !== null ? `${fmtDec(m.par * 100, 2)}%` : "—"}</span> ; PAR% ={" "}
            <span className="text-sky-600">{m.parPct !== null ? `${fmtDec(m.parPct, 2)}%` : "—"}</span>
          </span>
        ),
      },
    ];
  }, [table2x2, twoByTwoComputed]);

  const diagnosticRows: EpiTableRow[] = useMemo(() => {
    const { a, b, c, d } = table2x2;
    const m = twoByTwoComputed;
    return [
      {
        no: 1,
        indikator: "True Positive (a) / Total Sakit (a + c)",
        nilaiInput: `${fmtInt(a)} / ${fmtInt(m.col1)}`,
        nilaiTone: "teal",
        ukuran: "Sensitivitas (Sensitivity / TPR)",
        ukuranTone: "teal",
        rumusPrefix: `(${fmtInt(a)} / ${fmtInt(m.col1)}) × 100% = `,
        hasilHighlight: m.sens !== null ? `${fmtDec(m.sens, 2)}%` : "—",
        hasilTone: "teal",
        rumusSuffix: " kemampuan mendeteksi benar sakit",
        rumusPlain: `(${fmtInt(a)} / ${fmtInt(m.col1)}) × 100% = ${m.sens !== null ? `${fmtDec(m.sens, 2)}%` : "—"}`,
      },
      {
        no: 2,
        indikator: "True Negative (d) / Total Sehat (b + d)",
        nilaiInput: `${fmtInt(d)} / ${fmtInt(m.col2)}`,
        nilaiTone: "teal",
        ukuran: "Spesifisitas (Specificity / TNR)",
        ukuranTone: "teal",
        rumusPrefix: `(${fmtInt(d)} / ${fmtInt(m.col2)}) × 100% = `,
        hasilHighlight: m.spec !== null ? `${fmtDec(m.spec, 2)}%` : "—",
        hasilTone: "teal",
        rumusSuffix: " kemampuan mendeteksi benar sehat",
        rumusPlain: `(${fmtInt(d)} / ${fmtInt(m.col2)}) × 100% = ${m.spec !== null ? `${fmtDec(m.spec, 2)}%` : "—"}`,
      },
      {
        no: 3,
        indikator: "Nilai Prediksi Positif (TP / Total Tes Positif)",
        nilaiInput: `${fmtInt(a)} / ${fmtInt(m.row1)}`,
        nilaiTone: "blue",
        ukuran: "Positive Predictive Value (PPV)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(a)} / ${fmtInt(m.row1)}) × 100% = `,
        hasilHighlight: m.ppv !== null ? `${fmtDec(m.ppv, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: " probabilitas sakit bila hasil tes (+)",
        rumusPlain: `(${fmtInt(a)} / ${fmtInt(m.row1)}) × 100% = ${m.ppv !== null ? `${fmtDec(m.ppv, 2)}%` : "—"}`,
      },
      {
        no: 4,
        indikator: "Nilai Prediksi Negatif (TN / Total Tes Negatif)",
        nilaiInput: `${fmtInt(d)} / ${fmtInt(m.row2)}`,
        nilaiTone: "blue",
        ukuran: "Negative Predictive Value (NPV)",
        ukuranTone: "blue",
        rumusPrefix: `(${fmtInt(d)} / ${fmtInt(m.row2)}) × 100% = `,
        hasilHighlight: m.npv !== null ? `${fmtDec(m.npv, 2)}%` : "—",
        hasilTone: "blue",
        rumusSuffix: " probabilitas sehat bila hasil tes (−)",
        rumusPlain: `(${fmtInt(d)} / ${fmtInt(m.row2)}) × 100% = ${m.npv !== null ? `${fmtDec(m.npv, 2)}%` : "—"}`,
      },
      {
        no: 5,
        indikator: "Rasio Kemungkinan (Likelihood Ratio)",
        nilaiInput: `Sens ${m.sens !== null ? `${fmtDec(m.sens, 1)}%` : "—"} ; Spes ${m.spec !== null ? `${fmtDec(m.spec, 1)}%` : "—"}`,
        nilaiTone: "blue",
        ukuran: "Likelihood Ratio Positif (LR+) & Negatif (LR−)",
        ukuranTone: "bold",
        rumusPlain: `LR+ = ${m.lrPos !== null ? fmtDec(m.lrPos, 2) : "—"} ; LR− = ${m.lrNeg !== null ? fmtDec(m.lrNeg, 2) : "—"}`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900">
            LR+ ={" "}
            <span className="text-sky-600">{m.lrPos !== null ? fmtDec(m.lrPos, 2) : "—"}</span> ; LR− ={" "}
            <span className="text-teal-600">{m.lrNeg !== null ? fmtDec(m.lrNeg, 2) : "—"}</span>
          </span>
        ),
      },
      {
        no: 6,
        indikator: "Akurasi Diagnostik & Prevalensi Sampel",
        nilaiInput: `N = ${fmtInt(m.total)} subjek`,
        nilaiTone: "blue",
        ukuran: "Diagnostic Accuracy & Sample Prevalence",
        ukuranTone: "bold",
        rumusPlain: `Akurasi = (${fmtInt(a + d)} / ${fmtInt(m.total)}) × 100% = ${m.accuracy !== null ? `${fmtDec(m.accuracy, 2)}%` : "—"} ; Prevalensi = ${m.prevSample !== null ? `${fmtDec(m.prevSample, 2)}%` : "—"}`,
        customFormulaNode: (
          <span className="font-semibold text-slate-900">
            Akurasi: ({fmtInt(a + d)} / {fmtInt(m.total)}) × 100% ={" "}
            <span className="text-sky-600">{m.accuracy !== null ? `${fmtDec(m.accuracy, 2)}%` : "—"}</span> ; Prevalensi:{" "}
            <span className="text-sky-600">{m.prevSample !== null ? `${fmtDec(m.prevSample, 2)}%` : "—"}</span>
          </span>
        ),
      },
    ];
  }, [table2x2, twoByTwoComputed]);

  // ==========================================================================
  // ACTIONS: COPY TABLE & EXPORT MULTI-SHEET EXCEL (.xlsx)
  // ==========================================================================
  const handleCopyCurrentTable = useCallback(async () => {
    const rowsToCopy =
      activeSection === "basic10"
        ? basic10Rows
        : activeSection === "mortality_fertility"
        ? mortalityFertilityRows
        : activeSection === "morbidity"
        ? morbidityRows
        : activeSection === "association_2x2"
        ? [...associationRows, ...diagnosticRows]
        : [
            ...basic10Rows,
            ...mortalityFertilityRows,
            ...morbidityRows,
            ...associationRows,
            ...diagnosticRows,
          ];

    const header = [
      "No",
      "Indikator Dasar",
      "Nilai Numerik Input",
      "Ukuran Epidemiologi Terkait",
      "Rumus Matematis & Hasil Akhir",
    ].join("\t");

    const body = rowsToCopy
      .map((r, idx) =>
        [
          idx + 1,
          r.indikator,
          r.nilaiInput,
          r.ukuran,
          r.rumusPlain || `${r.rumusPrefix || ""}${r.hasilHighlight || ""}${r.rumusSuffix || ""}`,
        ].join("\t")
      )
      .join("\n");

    const text = `${regionName} — ${reportPeriod}\n${header}\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTable(true);
      window.setTimeout(() => setCopiedTable(false), 2200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedTable(true);
      window.setTimeout(() => setCopiedTable(false), 2200);
    }
  }, [
    activeSection,
    basic10Rows,
    mortalityFertilityRows,
    morbidityRows,
    associationRows,
    diagnosticRows,
    regionName,
    reportPeriod,
  ]);

  const handleDownloadExcel = useCallback(async () => {
    if (exportingExcel) return;
    setExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const buildSheet = (sheetTitle: string, rows: EpiTableRow[]) => {
        const aoa: (string | number)[][] = [
          [`KALKULATOR UKURAN STATUS KESEHATAN — ${sheetTitle.toUpperCase()}`],
          [`Wilayah / Instansi: ${regionName}`, "", `Periode: ${reportPeriod}`, "", `Diekspor: ${new Date().toLocaleString("id-ID")}`],
          [],
          [
            "No",
            "Indikator Dasar",
            "Nilai Numerik Input",
            "Ukuran Epidemiologi Terkait",
            "Rumus Matematis & Hasil Akhir",
          ],
          ...rows.map((r, idx) => [
            idx + 1,
            r.indikator,
            r.nilaiInput,
            r.ukuran,
            r.rumusPlain || `${r.rumusPrefix || ""}${r.hasilHighlight || ""}${r.rumusSuffix || ""}`,
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 36 },
          { wch: 24 },
          { wch: 36 },
          { wch: 58 },
        ];
        return ws;
      };

      XLSX.utils.book_append_sheet(wb, buildSheet("10 Indikator Dasar", basic10Rows), "10_Indikator_Dasar");
      XLSX.utils.book_append_sheet(wb, buildSheet("Mortalitas & Fertilitas", mortalityFertilityRows), "Mortalitas_Fertilitas");
      XLSX.utils.book_append_sheet(wb, buildSheet("Morbiditas & Surveilans", morbidityRows), "Morbiditas_Surveilans");
      XLSX.utils.book_append_sheet(
        wb,
        buildSheet("Asosiasi & Diagnostik 2x2", [...associationRows, ...diagnosticRows]),
        "Asosiasi_Diagnostik_2x2"
      );

      const safePeriod = reportPeriod.replace(/[^a-zA-Z0-9_-]+/g, "_");
      XLSX.writeFile(wb, `Ukuran_Status_Kesehatan_Epidemiologi_${safePeriod}.xlsx`);
    } finally {
      setExportingExcel(false);
    }
  }, [
    exportingExcel,
    regionName,
    reportPeriod,
    basic10Rows,
    mortalityFertilityRows,
    morbidityRows,
    associationRows,
    diagnosticRows,
  ]);

  const handleLoadExample = () => {
    setInputs(DEFAULT_TEN_INPUTS);
    setSyncMidYearPop(true);
    setMfInputs(DEFAULT_MF_INPUTS);
    setMorbInputs(DEFAULT_MORB_INPUTS);
    setTable2x2(DEFAULT_2X2);
  };

  const handleResetZero = () => {
    setInputs(ZERO_TEN_INPUTS);
    setSyncMidYearPop(true);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  const basicInputFields: Array<{
    key: keyof TenIndicatorInputs;
    no: number;
    label: string;
    unit: string;
    hint: string;
  }> = [
    { key: "jumlahPenduduk", no: 1, label: "Jumlah penduduk", unit: "jiwa", hint: "Total populasi wilayah" },
    { key: "pendudukPertengahanTahun", no: 2, label: "Penduduk pertengahan tahun", unit: "jiwa", hint: "Denominator CBR, CDR, IR" },
    { key: "kelahiranHidup", no: 3, label: "Kelahiran hidup", unit: "kelahiran", hint: "Hitung CBR, IMR, MMR, GFR" },
    { key: "kematianBayi", no: 4, label: "Kematian bayi (<1 thn)", unit: "kematian", hint: "Hitung IMR" },
    { key: "kematianIbu", no: 5, label: "Kematian ibu", unit: "kematian", hint: "Hitung MMR" },
    { key: "totalKematian", no: 6, label: "Total kematian", unit: "kematian", hint: "Hitung CDR & RNI" },
    { key: "kasusDBD", no: 7, label: "Kasus DBD", unit: "kasus", hint: "Hitung IR DBD" },
    { key: "kematianDBD", no: 8, label: "Kematian akibat DBD", unit: "kematian", hint: "Hitung CFR DBD" },
    { key: "kasusTBParu", no: 9, label: "Kasus TB paru", unit: "kasus", hint: "Hitung IR TB Paru" },
    { key: "perempuanWUS", no: 10, label: "Perempuan usia 15–49 tahun", unit: "jiwa", hint: "Hitung Proporsi WUS & GFR" },
  ];

  const chartsDataProps = useMemo(() => {
    const P = inputs.jumlahPenduduk;
    const Pmid = inputs.pendudukPertengahanTahun;
    const sumAsfr = mfInputs.asfrBands.reduce((acc, v) => acc + v, 0);
    const tfrVal = (5 * sumAsfr) / 1000;
    const depRatioVal =
      mfInputs.pendudukUsiaProduktif15_64 > 0
        ? ((mfInputs.pendudukUsiaMuda0_14 + mfInputs.pendudukLansia65Plus) /
            mfInputs.pendudukUsiaProduktif15_64) *
          100
        : 0;
    const k = morbInputs.konstantaCI || 1000;
    const ciVal =
      morbInputs.populasiBerisiko > 0
        ? (morbInputs.kasusBaru / morbInputs.populasiBerisiko) * k
        : 0;
    const pointPrevPct = P > 0 ? (morbInputs.kasusAktifTitikWaktu / P) * 100 : 0;
    const periodPrevPct =
      Pmid > 0 ? ((morbInputs.kasusLama + morbInputs.kasusBaru) / Pmid) * 100 : 0;
    const attackRatePct =
      morbInputs.populasiTerpaparKLB > 0
        ? (morbInputs.kasusKLB / morbInputs.populasiTerpaparKLB) * 100
        : 0;
    const sarDenom = Math.max(0, morbInputs.kontakRentan - morbInputs.kasusPrimer);
    const sarPct = sarDenom > 0 ? (morbInputs.kasusSekunder / sarDenom) * 100 : 0;
    const cfrUmumPct =
      morbInputs.totalKasusPenyakitUmum > 0
        ? (morbInputs.kematianPenyakitUmum / morbInputs.totalKasusPenyakitUmum) * 100
        : 0;

    return {
      regionName,
      reportPeriod,
      coreValues: {
        jumlahPenduduk: inputs.jumlahPenduduk,
        perempuanWUS: inputs.perempuanWUS,
        cbr: coreMetrics.cbr ?? 0,
        cdr: coreMetrics.cdr ?? 0,
        rni: coreMetrics.rniPer1000 ?? 0,
        imr: coreMetrics.imr ?? 0,
        mmr: coreMetrics.mmr ?? 0,
        irDbd: coreMetrics.irDbd ?? 0,
        cfrDbd: coreMetrics.cfrDbd ?? 0,
        irTb: coreMetrics.irTb ?? 0,
        gfr: coreMetrics.gfr ?? 0,
        propWus: coreMetrics.propWus ?? 0,
      },
      asfrBands: mfInputs.asfrBands,
      tfr: tfrVal,
      ageStructure: {
        muda0_14: mfInputs.pendudukUsiaMuda0_14,
        produktif15_64: mfInputs.pendudukUsiaProduktif15_64,
        lansia65Plus: mfInputs.pendudukLansia65Plus,
        dependencyRatio: depRatioVal,
      },
      morbidityRates: {
        ci: ciVal,
        pointPrevPct,
        periodPrevPct,
        attackRatePct,
        sarPct,
        cfrUmumPct,
      },
      diagnosticRates: {
        sens: twoByTwoComputed.sens ?? 0,
        spec: twoByTwoComputed.spec ?? 0,
        ppv: twoByTwoComputed.ppv ?? 0,
        npv: twoByTwoComputed.npv ?? 0,
        accuracy: twoByTwoComputed.accuracy ?? 0,
        iePct: (twoByTwoComputed.ie ?? 0) * 100,
        i0Pct: (twoByTwoComputed.i0 ?? 0) * 100,
        rr: twoByTwoComputed.rr,
        or: twoByTwoComputed.or,
      },
    };
  }, [regionName, reportPeriod, inputs, coreMetrics, mfInputs, morbInputs, twoByTwoComputed]);

  const sectionTabs: Array<{ id: EpiSectionTab; label: string; count: string; icon: React.ElementType }> = [
    { id: "basic10", label: "10 Indikator Dasar", count: "10", icon: Table2 },
    { id: "charts", label: "Grafik Tren & Visual", count: "6", icon: TrendingUp },
    { id: "mortality_fertility", label: "Mortalitas & Fertilitas", count: "12", icon: HeartPulse },
    { id: "morbidity", label: "Morbiditas & Surveilans", count: "9", icon: Activity },
    { id: "association_2x2", label: "Asosiasi & Diagnostik 2×2", count: "12", icon: Microscope },
    { id: "all_summary", label: "Tabel Gabungan Lengkap", count: "43", icon: BarChart3 },
  ];

  return (
    <div className="w-full space-y-5 pb-8">
      {/* HEADER BAR & GLOBAL EXPORT ACTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Kalkulator Ukuran Status Kesehatan &amp; Epidemiologi
                </h1>
                <p className="text-xs text-slate-500">
                  10 Indikator Dasar beserta seluruh ukuran epidemiologi (mortalitas, fertilitas, morbiditas, surveilans KLB, asosiasi RR/OR &amp; uji diagnostik 2×2).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handleLoadExample}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Muat Contoh Data
            </button>
            <button
              type="button"
              onClick={handleResetZero}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset (0)
            </button>
            <button
              type="button"
              onClick={handleCopyCurrentTable}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedTable ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-teal-700">Tersalin</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  Salin Tabel
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak
            </button>
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={exportingExcel}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {exportingExcel ? (
                <Download className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              Unduh Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* METADATA ROW: REGION & PERIOD */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Wilayah / Puskesmas / Instansi
            </label>
            <input
              type="text"
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
              placeholder="Contoh: Wilayah Kerja Puskesmas X"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Periode Laporan
            </label>
            <input
              type="text"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white"
              placeholder="Contoh: Tahun 2026"
            />
          </div>
          <label className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncMidYearPop}
              onChange={(e) => {
                const checked = e.target.checked;
                setSyncMidYearPop(checked);
                if (checked) {
                  setInputs((prev) => ({
                    ...prev,
                    pendudukPertengahanTahun: prev.jumlahPenduduk,
                  }));
                }
              }}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Samakan Penduduk Pertengahan Tahun = Jumlah Penduduk</span>
          </label>
        </div>
      </div>

      {/* SECTION NAVIGATION TABS */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 print:hidden">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 min-w-[155px] px-3 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
              <span
                className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                  active ? "bg-teal-700 text-teal-50" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: 10 INDIKATOR DASAR (INPUT + EXACT 5-COLUMN TABLE)             */}
      {/* ==================================================================== */}
      {activeSection === "basic10" && (
        <div className="space-y-5">
          {/* 10 NUMERIC INPUT GRID */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Input Data 10 Indikator Dasar Status Kesehatan
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                Ubah angka di bawah untuk menghitung seluruh tabel epidemiologi secara otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {basicInputFields.map((field) => (
                <div
                  key={field.key}
                  className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 focus-within:border-teal-500 focus-within:bg-white transition-colors"
                >
                  <label
                    htmlFor={`ind-${field.key}`}
                    className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-700 mb-1.5"
                  >
                    <span className="truncate">
                      {field.no}. {field.label}
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id={`ind-${field.key}`}
                      type="number"
                      min={0}
                      step="1"
                      value={inputs[field.key]}
                      onChange={(e) => updateBasicInput(field.key, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
                      {field.unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{field.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN 5-COLUMN PRESENTATION TABLE (MATCHING REFERENCE IMAGE) */}
          <EpidemiologyTable
            title={`Tabel Ukuran Status Kesehatan — 10 Indikator Dasar (${regionName})`}
            subtitle={reportPeriod}
            rows={basic10Rows}
          />

          {/* COMPACT KEY DERIVED BENCHMARKS STRIP */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Ringkasan Cepat Indeks Kunci &amp; Ambang Pemantauan Epidemiologi
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">CBR (Kelahiran Kasar)</div>
                <div className="text-lg font-extrabold text-sky-600 mt-0.5">
                  {coreMetrics.cbr !== null ? fmtDec(coreMetrics.cbr, 2) : "—"}
                </div>
                <div className="text-[10px] text-slate-500">per 1.000 penduduk</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">CDR (Kematian Kasar)</div>
                <div className={`text-lg font-extrabold mt-0.5 ${inputs.totalKematian === 0 ? "text-teal-600" : "text-sky-600"}`}>
                  {coreMetrics.cdr !== null ? fmtRateClean(coreMetrics.cdr) : "—"}
                </div>
                <div className="text-[10px] text-slate-500">per 1.000 penduduk</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">RNI (Pertumbuhan Alami)</div>
                <div className="text-lg font-extrabold text-teal-600 mt-0.5">
                  {coreMetrics.rniPercent !== null ? `${fmtDec(coreMetrics.rniPercent, 2)}%` : "—"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {coreMetrics.rniPer1000 !== null ? `${fmtDec(coreMetrics.rniPer1000, 2)} per 1.000` : "—"}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">IMR / MMR</div>
                <div className={`text-lg font-extrabold mt-0.5 ${inputs.kematianBayi === 0 && inputs.kematianIbu === 0 ? "text-teal-600" : "text-rose-600"}`}>
                  {coreMetrics.imr !== null ? fmtRateClean(coreMetrics.imr) : "—"} / {coreMetrics.mmr !== null ? fmtRateClean(coreMetrics.mmr) : "—"}
                </div>
                <div className="text-[10px] text-slate-500">per 1.000 / 100.000 KH</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">IR DBD · CFR DBD</div>
                <div className={`text-lg font-extrabold mt-0.5 ${(coreMetrics.irDbd ?? 0) >= 49 || (coreMetrics.cfrDbd ?? 0) >= 1 ? "text-rose-600" : "text-sky-600"}`}>
                  {coreMetrics.irDbd !== null ? fmtDec(coreMetrics.irDbd, 2) : "—"} · {coreMetrics.cfrDbd !== null ? `${fmtDec(coreMetrics.cfrDbd, 2)}%` : "0,00%"}
                </div>
                <div className="text-[10px] text-slate-500">Target IR &lt;49 · CFR &lt;1%</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-[11px] text-slate-500 font-medium">IR TB · GFR WUS</div>
                <div className="text-lg font-extrabold text-sky-600 mt-0.5">
                  {coreMetrics.irTb !== null ? fmtDec(coreMetrics.irTb, 2) : "—"} · {coreMetrics.gfr !== null ? fmtDec(coreMetrics.gfr, 2) : "—"}
                </div>
                <div className="text-[10px] text-slate-500">TB/100rb · GFR/1.000 WUS</div>
              </div>
            </div>
          </div>
          {/* LIVE TREND & COMPARISON CHARTS INLINE UNDER 10 INDICATORS */}
          <HealthStatusCharts {...chartsDataProps} compactMode />
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1B: VISUALISASI & GRAFIK TREN EPIDEMIOLOGI LENGKAP (6 CHARTS)    */}
      {/* ==================================================================== */}
      {activeSection === "charts" && (
        <div className="space-y-5">
          <HealthStatusCharts {...chartsDataProps} />
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MORTALITAS & FERTILITAS LANJUTAN                              */}
      {/* ==================================================================== */}
      {activeSection === "mortality_fertility" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 print:hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Input Tambahan Ukuran Mortalitas, Fertilitas &amp; Demografi
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                Otomatis tersinkronisasi dengan Penduduk ({fmtInt(inputs.pendudukPertengahanTahun)}), Kelahiran Hidup ({fmtInt(inputs.kelahiranHidup)}), dan WUS ({fmtInt(inputs.perempuanWUS)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kematian Neonatal (0–28 hr)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.kematianNeonatal}
                  onChange={(e) => setMfInputs((p) => ({ ...p, kematianNeonatal: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Neonatal Dini (&lt;7 hr)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.kematianNeonatalDini}
                  onChange={(e) => setMfInputs((p) => ({ ...p, kematianNeonatalDini: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Post-Neonatal (29 hr–11 bln)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.kematianPostNeonatal}
                  onChange={(e) => setMfInputs((p) => ({ ...p, kematianPostNeonatal: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kematian Balita (&lt;5 thn)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.kematianBalita}
                  onChange={(e) => setMfInputs((p) => ({ ...p, kematianBalita: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Lahir Mati (Stillbirth)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.lahirMati}
                  onChange={(e) => setMfInputs((p) => ({ ...p, lahirMati: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Penyebab Khusus (CSMR/PMR)</label>
                <input
                  type="text"
                  value={mfInputs.namaPenyebabKhusus}
                  onChange={(e) => setMfInputs((p) => ({ ...p, namaPenyebabKhusus: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kematian Penyebab Khusus</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.kematianPenyebabKhusus}
                  onChange={(e) => setMfInputs((p) => ({ ...p, kematianPenyebabKhusus: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Anak Balita 0–4 thn (CWR)</label>
                <input
                  type="number"
                  min={0}
                  value={mfInputs.anakBalita0_4}
                  onChange={(e) => setMfInputs((p) => ({ ...p, anakBalita0_4: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ASDR: Kematian / Penduduk Umur</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.kematianKelompokUmur}
                    onChange={(e) => setMfInputs((p) => ({ ...p, kematianKelompokUmur: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    title="Jumlah kematian kelompok umur"
                  />
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.pendudukKelompokUmur}
                    onChange={(e) => setMfInputs((p) => ({ ...p, pendudukKelompokUmur: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    title="Penduduk kelompok umur"
                  />
                </div>
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ASFR: Kelahiran / WUS Umur</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.kelahiranKelompokUmurIbu}
                    onChange={(e) => setMfInputs((p) => ({ ...p, kelahiranKelompokUmurIbu: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.wusKelompokUmurIbu}
                    onChange={(e) => setMfInputs((p) => ({ ...p, wusKelompokUmurIbu: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                </div>
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Struktur Umur (Dependency Ratio: 0–14 thn / 15–64 thn / ≥65 thn)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.pendudukUsiaMuda0_14}
                    onChange={(e) => setMfInputs((p) => ({ ...p, pendudukUsiaMuda0_14: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    placeholder="0-14"
                  />
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.pendudukUsiaProduktif15_64}
                    onChange={(e) => setMfInputs((p) => ({ ...p, pendudukUsiaProduktif15_64: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    placeholder="15-64"
                  />
                  <input
                    type="number"
                    min={0}
                    value={mfInputs.pendudukLansia65Plus}
                    onChange={(e) => setMfInputs((p) => ({ ...p, pendudukLansia65Plus: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    placeholder="65+"
                  />
                </div>
              </div>
            </div>

            {/* 7-BAND ASFR FOR TFR */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-600 mb-2">
                Input ASFR 7 Kelompok Umur (per 1.000 WUS) untuk Kalkulasi TFR (Total Fertility Rate):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {ASFR_AGE_BANDS.map((band, idx) => (
                  <div key={band} className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">{band}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={mfInputs.asfrBands[idx]}
                      onChange={(e) => {
                        const val = safeNonNeg(e.target.value);
                        setMfInputs((prev) => {
                          const nextBands = [...prev.asfrBands] as MortalityFertilityInputs["asfrBands"];
                          nextBands[idx] = val;
                          return { ...prev, asfrBands: nextBands };
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900 tabular-nums"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <EpidemiologyTable
            title="Tabel Ukuran Mortalitas, Fertilitas & Demografi Lanjutan"
            subtitle="NMR, PNMR, U5MR, Stillbirth, Perinatal, CSMR, PMR, ASDR, ASFR, TFR, CWR & Dependency Ratio"
            rows={mortalityFertilityRows}
            secondColLabel="Parameter Mortalitas / Fertilitas"
          />
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MORBIDITAS & SURVEILANS PENYAKIT                              */}
      {/* ==================================================================== */}
      {activeSection === "morbidity" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Input Ukuran Morbiditas, Prevalensi &amp; Investigasi KLB
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                Tersinkronisasi dengan Populasi Total ({fmtInt(inputs.jumlahPenduduk)}) &amp; Pertengahan Tahun ({fmtInt(inputs.pendudukPertengahanTahun)})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Penyakit / KLB</label>
                <input
                  type="text"
                  value={morbInputs.namaPenyakit}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, namaPenyakit: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kasus Baru (Insidens)</label>
                <input
                  type="number"
                  min={0}
                  value={morbInputs.kasusBaru}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, kasusBaru: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kasus Lama (Prevalensi Periode)</label>
                <input
                  type="number"
                  min={0}
                  value={morbInputs.kasusLama}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, kasusLama: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Populasi Berisiko (CI)</label>
                <input
                  type="number"
                  min={0}
                  value={morbInputs.populasiBerisiko}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, populasiBerisiko: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Person-Years (ID)</label>
                <input
                  type="number"
                  min={0}
                  value={morbInputs.totalPersonYears}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, totalPersonYears: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kasus Aktif Titik Waktu (Point Prev)</label>
                <input
                  type="number"
                  min={0}
                  value={morbInputs.kasusAktifTitikWaktu}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, kasusAktifTitikWaktu: safeNonNeg(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Attack Rate: Sakit / Terpapar KLB</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.kasusKLB}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, kasusKLB: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.populasiTerpaparKLB}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, populasiTerpaparKLB: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                </div>
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SAR: Sekunder / Kontak / Primer</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.kasusSekunder}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, kasusSekunder: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    title="Kasus sekunder"
                  />
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.kontakRentan}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, kontakRentan: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    title="Total kontak rentan"
                  />
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.kasusPrimer}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, kasusPrimer: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                    title="Kasus primer"
                  />
                </div>
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CFR: Kematian / Total Kasus</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.kematianPenyakitUmum}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, kematianPenyakitUmum: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                  <input
                    type="number"
                    min={0}
                    value={morbInputs.totalKasusPenyakitUmum}
                    onChange={(e) => setMorbInputs((p) => ({ ...p, totalKasusPenyakitUmum: safeNonNeg(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-bold text-slate-900 tabular-nums"
                  />
                </div>
              </div>
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Konstanta Pengali CI (k)</label>
                <select
                  value={morbInputs.konstantaCI}
                  onChange={(e) => setMorbInputs((p) => ({ ...p, konstantaCI: Number(e.target.value) }))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value={100}>100 (%)</option>
                  <option value={1000}>1.000 penduduk</option>
                  <option value={10000}>10.000 penduduk</option>
                  <option value={100000}>100.000 penduduk</option>
                </select>
              </div>
            </div>
          </div>

          <EpidemiologyTable
            title="Tabel Ukuran Morbiditas, Prevalensi & Surveilans Penyakit"
            subtitle="Cumulative Incidence, Incidence Density, Point & Period Prevalence, Attack Rate, SAR, CFR & Durasi Penyakit"
            rows={morbidityRows}
            secondColLabel="Parameter Morbiditas / Surveilans"
          />
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: ASOSIASI EPIDEMIOLOGI & UJI DIAGNOSTIK (TABEL 2x2)            */}
      {/* ==================================================================== */}
      {activeSection === "association_2x2" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Microscope className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Matriks Kontingensi Epidemiologi 2×2 (Kohort, Kasus-Kontrol &amp; Uji Skrining)
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTable2x2({ a: 42, b: 18, c: 12, d: 128 })}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Contoh Faktor Risiko
                </button>
                <button
                  type="button"
                  onClick={() => setTable2x2({ a: 14, b: 86, c: 38, d: 62 })}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Contoh Vaksin / Protektif
                </button>
                <button
                  type="button"
                  onClick={() => setTable2x2({ a: 92, b: 14, c: 8, d: 186 })}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Contoh Uji Skrining Rapid
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full max-w-2xl border-collapse text-xs tabular-nums border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3 text-left font-bold border-r border-slate-200">
                      Status Paparan / Hasil Tes
                    </th>
                    <th className="p-3 text-center font-bold border-r border-slate-200">
                      Sakit / Kasus (+)
                    </th>
                    <th className="p-3 text-center font-bold border-r border-slate-200">
                      Sehat / Kontrol (−)
                    </th>
                    <th className="p-3 text-center font-bold bg-slate-100/70">Total Baris</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-50/40">
                      Terpapar / Tes Positif (+)
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-sky-700 w-9 shrink-0">a (TP)</span>
                        <input
                          type="number"
                          min={0}
                          value={table2x2.a}
                          onChange={(e) => setTable2x2((p) => ({ ...p, a: safeNonNeg(e.target.value) }))}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-9 shrink-0">b (FP)</span>
                        <input
                          type="number"
                          min={0}
                          value={table2x2.b}
                          onChange={(e) => setTable2x2((p) => ({ ...p, b: safeNonNeg(e.target.value) }))}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center font-extrabold text-slate-900 bg-slate-50">
                      {fmtInt(twoByTwoComputed.row1)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 border-r border-slate-200 bg-slate-50/40">
                      Tidak Terpapar / Tes Negatif (−)
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-9 shrink-0">c (FN)</span>
                        <input
                          type="number"
                          min={0}
                          value={table2x2.c}
                          onChange={(e) => setTable2x2((p) => ({ ...p, c: safeNonNeg(e.target.value) }))}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-teal-700 w-9 shrink-0">d (TN)</span>
                        <input
                          type="number"
                          min={0}
                          value={table2x2.d}
                          onChange={(e) => setTable2x2((p) => ({ ...p, d: safeNonNeg(e.target.value) }))}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center font-extrabold text-slate-900 bg-slate-50">
                      {fmtInt(twoByTwoComputed.row2)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/70 font-extrabold text-slate-900">
                    <td className="p-3 border-r border-slate-200">Total Kolom</td>
                    <td className="p-3 text-center border-r border-slate-200">{fmtInt(twoByTwoComputed.col1)}</td>
                    <td className="p-3 text-center border-r border-slate-200">{fmtInt(twoByTwoComputed.col2)}</td>
                    <td className="p-3 text-center text-teal-700">N = {fmtInt(twoByTwoComputed.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <EpidemiologyTable
            title="Bagian A — Ukuran Asosiasi & Dampak Epidemiologi (Kohort & Kasus-Kontrol)"
            subtitle="Relative Risk (RR), Odds Ratio (OR), Attributable Risk (AR / AR%), PAR & NNT/NNH"
            rows={associationRows}
            secondColLabel="Parameter Asosiasi"
          />

          <EpidemiologyTable
            title="Bagian B — Ukuran Validitas Uji Skrining & Diagnostik"
            subtitle="Sensitivitas, Spesifisitas, PPV, NPV, Likelihood Ratio (LR+ / LR−) & Akurasi"
            rows={diagnosticRows}
            secondColLabel="Parameter Uji Diagnostik"
          />
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: TABEL GABUNGAN LENGKAP (ALL 43 EPIDEMIOLOGICAL MEASURES)      */}
      {/* ==================================================================== */}
      {activeSection === "all_summary" && (
        <div className="space-y-5">
          <EpidemiologyTable
            title={`1. Ukuran Status Kesehatan — 10 Indikator Dasar (${regionName})`}
            subtitle={reportPeriod}
            rows={basic10Rows}
          />
          <EpidemiologyTable
            title="2. Ukuran Mortalitas, Fertilitas & Demografi Lanjutan"
            subtitle="12 indikator tambahan tersinkronisasi"
            rows={mortalityFertilityRows}
            secondColLabel="Parameter Mortalitas / Fertilitas"
          />
          <EpidemiologyTable
            title="3. Ukuran Morbiditas, Prevalensi & Surveilans KLB"
            subtitle="9 ukuran kejadian penyakit & investigasi wabah"
            rows={morbidityRows}
            secondColLabel="Parameter Morbiditas / Surveilans"
          />
          <EpidemiologyTable
            title="4. Ukuran Asosiasi Epidemiologi & Validitas Uji Diagnostik (Tabel 2×2)"
            subtitle="12 ukuran analitik & skrining diagnostik"
            rows={[
              ...associationRows,
              ...diagnosticRows.map((r, i) => ({ ...r, no: associationRows.length + i + 1 })),
            ]}
            secondColLabel="Parameter Analitik / Diagnostik"
          />
        </div>
      )}
    </div>
  );
};

export default HealthStatusCalculator;
