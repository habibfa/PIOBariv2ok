import React, { useState } from "react";
import { CalculatorShell, MetricReadout, ClinicalNote, FormulaBox } from "./CalculatorShared";

// ============================================================================
// 1. Kalkulator Kebutuhan Kalori (BMR & TDEE + Faktor Stres Penyakit)
// ============================================================================
const ACTIVITY_FACTORS = [
  { id: "bedrest", label: "Tirah Baring (Bedrest / ICU)", factor: 1.1 },
  { id: "sedentary", label: "Sangat Ringan / Rawat Inap Mobilisasi Terbatas", factor: 1.2 },
  { id: "light", label: "Ringan (Aktivitas Harian / Jalan Santai)", factor: 1.375 },
  { id: "moderate", label: "Sedang (Olahraga 3–5×/minggu)", factor: 1.55 },
  { id: "active", label: "Aktif (Latihan Intensif 6–7×/minggu)", factor: 1.725 },
];

const STRESS_FACTORS = [
  { id: "none", label: "Sehat / Tanpa Stres Metabolik", factor: 1.0, proteinPerKg: "0,8 – 1,0" },
  { id: "minor_surgery", label: "Pasca Operasi Ringan / Tanpa Komplikasi", factor: 1.1, proteinPerKg: "1,0 – 1,2" },
  { id: "infection", label: "Infeksi Sedang / Demam / Pneumonia", factor: 1.2, proteinPerKg: "1,2 – 1,5" },
  { id: "major_surgery", label: "Operasi Mayor / Fraktur Tulang Panjang", factor: 1.3, proteinPerKg: "1,2 – 1,5" },
  { id: "sepsis", label: "Sepsis / Trauma Berat / Kanker Hipermetabolik", factor: 1.4, proteinPerKg: "1,5 – 2,0" },
  { id: "burn", label: "Luka Bakar Berat (> 20% TBSA)", factor: 1.6, proteinPerKg: "1,5 – 2,5" },
];

export function CalorieBmrTdeeCalculator() {
  const [formula, setFormula] = useState<"mifflin" | "harris">("mifflin");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("40");
  const [weight, setWeight] = useState("68");
  const [height, setHeight] = useState("170");
  const [activityId, setActivityId] = useState("sedentary");
  const [stressId, setStressId] = useState("none");

  const a = parseFloat(age);
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const valid = !isNaN(a) && a > 0 && !isNaN(w) && w > 0 && !isNaN(h) && h > 0;

  const act = ACTIVITY_FACTORS.find((x) => x.id === activityId) || ACTIVITY_FACTORS[1];
  const stress = STRESS_FACTORS.find((x) => x.id === stressId) || STRESS_FACTORS[0];

  let bmrMifflin = 0;
  let bmrHarris = 0;

  if (valid) {
    bmrMifflin =
      gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
    // Revised Harris-Benedict (Roza & Shizgal 1984)
    bmrHarris =
      gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
  }

  const activeBmr = formula === "mifflin" ? bmrMifflin : bmrHarris;
  const tdee = activeBmr * act.factor * stress.factor;
  const kcalPerKg = valid ? tdee / w : 0;

  // Macronutrient distribution (50% carb, 20% protein, 30% fat)
  const carbG = (tdee * 0.5) / 4;
  const protG = (tdee * 0.2) / 4;
  const fatG = (tdee * 0.3) / 9;

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="Kalkulator Kebutuhan Kalori (BMR &amp; TDEE)"
      subtitle="Menghitung Basal Metabolic Rate (BMR) dan Total Daily Energy Expenditure (TDEE) menggunakan persamaan Mifflin-St Jeor atau Harris-Benedict revisi dengan penyesuaian faktor aktivitas serta faktor stres penyakit klinis."
      onReset={() => {
        setFormula("mifflin");
        setGender("male");
        setAge("40");
        setWeight("68");
        setHeight("170");
        setActivityId("sedentary");
        setStressId("none");
      }}
      references={[
        "Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.",
        "Roza AM, Shizgal HM. The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass. Am J Clin Nutr. 1984;40(1):168-182.",
        "ESPEN Guideline on Clinical Nutrition in Hospitalized Patients & ASPEN Adult Nutrition Support Core Curriculum.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Metode Persamaan BMR</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormula("mifflin")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  formula === "mifflin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Mifflin-St Jeor
              </button>
              <button
                type="button"
                onClick={() => setFormula("harris")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  formula === "harris" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Harris-Benedict
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia (Tahun)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tinggi Badan (cm)</label>
              <input
                type="number"
                step="0.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Faktor Aktivitas Fisik</label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {ACTIVITY_FACTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (×{item.factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Faktor Stres Penyakit / Klinis</label>
            <select
              value={stressId}
              onChange={(e) => setStressId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {STRESS_FACTORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (×{item.factor})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label={`BMR (${formula === "mifflin" ? "Mifflin-St Jeor" : "Harris-Benedict"})`}
                  value={Math.round(activeBmr).toLocaleString("id-ID")}
                  unit="kkal/hari"
                  sublabel={`Pembanding ${formula === "mifflin" ? "Harris-Benedict" : "Mifflin-St Jeor"}: ${Math.round(
                    formula === "mifflin" ? bmrHarris : bmrMifflin
                  ).toLocaleString("id-ID")} kkal`}
                  tone="neutral"
                />
                <MetricReadout
                  label="Total Kebutuhan Energi (TDEE)"
                  value={Math.round(tdee).toLocaleString("id-ID")}
                  unit="kkal/hari"
                  sublabel={`Setara ${kcalPerKg.toFixed(1)} kkal/kgBB/hari (Faktor ×${(act.factor * stress.factor).toFixed(2)})`}
                  tone="emerald"
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700">Distribusi Makronutrien &amp; Target Protein Klinis</h4>
                  <span className="text-xs font-mono text-teal-700">Target protein: {stress.proteinPerKg} g/kgBB</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Karbohidrat (50%)</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">{Math.round(carbG)} g</div>
                    <div className="text-[11px] text-slate-400 font-mono">{Math.round(tdee * 0.5)} kkal</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Protein (20%)</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-teal-700 mt-0.5">{Math.round(protG)} g</div>
                    <div className="text-[11px] text-slate-400 font-mono">{Math.round(tdee * 0.2)} kkal</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Lemak (30%)</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">{Math.round(fatG)} g</div>
                    <div className="text-[11px] text-slate-400 font-mono">{Math.round(tdee * 0.3)} kkal</div>
                  </div>
                </div>
              </div>

              <ClinicalNote level="info" title="Catatan Nutrisi Klinis (ESPEN/ASPEN)">
                Pada pasien sakit kritis fase akut (ICU), pemberian kalori umumnya ditargetkan bertahap (20–25 kkal/kgBB/hari pada fase awal untuk menghindari <em>overfeeding</em> &amp; sindrom refeeding), lalu ditingkatkan ke 25–30 kkal/kgBB/hari pada fase pemulihan.
              </ClinicalNote>
            </>
          ) : (
            <ClinicalNote level="warning" title="Lengkapi Antropometri">
              Masukkan usia, berat badan, dan tinggi badan yang valid untuk menghitung BMR dan TDEE.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 2. HPL (Hari Perkiraan Lahir — Rumus Naegele)
// ============================================================================
export function HplCalculator() {
  const defaultLmp = () => {
    const d = new Date();
    d.setDate(d.getDate() - 84); // default 12 weeks ago
    return d.toISOString().split("T")[0];
  };

  const [hpht, setHpht] = useState<string>(defaultLmp);
  const [cycleDays, setCycleDays] = useState<string>("28");

  const cycle = Math.min(45, Math.max(21, parseInt(cycleDays, 10) || 28));
  const parsedDate = hpht ? new Date(`${hpht}T00:00:00`) : null;
  const valid = parsedDate !== null && !isNaN(parsedDate.getTime());

  let hplDate: Date | null = null;
  let conceptionDate: Date | null = null;
  let gaWeeks = 0;
  let gaDays = 0;
  let daysRemaining = 0;
  let trimester = "";

  if (valid && parsedDate) {
    const cycleOffset = cycle - 28;
    hplDate = new Date(parsedDate.getTime());
    hplDate.setDate(hplDate.getDate() + 280 + cycleOffset);

    conceptionDate = new Date(parsedDate.getTime());
    conceptionDate.setDate(conceptionDate.getDate() + 14 + cycleOffset);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((todayMidnight.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
    const adjustedDiff = Math.max(0, diffDays - cycleOffset);
    gaWeeks = Math.floor(adjustedDiff / 7);
    gaDays = adjustedDiff % 7;

    daysRemaining = Math.ceil((hplDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (gaWeeks < 14) trimester = "Trimester 1 (0 – 13 minggu)";
    else if (gaWeeks < 28) trimester = "Trimester 2 (14 – 27 minggu)";
    else if (gaWeeks <= 42) trimester = "Trimester 3 (28 – 42 minggu)";
    else trimester = "Lewat Waktu (Post-term > 42 minggu)";
  }

  const formatIndoDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="HPL (Hari Perkiraan Lahir)"
      subtitle="Menghitung estimasi tanggal persalinan berdasarkan Hari Pertama Haid Terakhir (HPHT) menggunakan Rumus Naegele yang disesuaikan dengan panjang siklus haid."
      onReset={() => {
        setHpht(defaultLmp());
        setCycleDays("28");
      }}
      references={[
        "ACOG Committee Opinion No. 700: Methods for Estimating the Due Date. Obstet Gynecol. 2017;129(5):e150-e154.",
        "Kementerian Kesehatan RI. Buku KIA & Pedoman Pelayanan Antenatal Terpadu.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hari Pertama Haid Terakhir (HPHT)
            </label>
            <input
              type="date"
              value={hpht}
              onChange={(e) => setHpht(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rata-rata Panjang Siklus Haid (Hari)
            </label>
            <input
              type="number"
              min="21"
              max="45"
              value={cycleDays}
              onChange={(e) => setCycleDays(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standar Rumus Naegele adalah 28 hari. Jika siklus berbeda, penyesuaian otomatis diterapkan (siklus − 28 hari).
            </p>
          </div>

          <FormulaBox
            formula="HPL = HPHT + 280 hari + (Panjang Siklus − 28 hari)"
            details={`Penyesuaian siklus saat ini: ${cycle - 28 >= 0 ? "+" : ""}${cycle - 28} hari`}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          {valid && hplDate ? (
            <>
              <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-5">
                <div className="text-xs font-semibold text-teal-800 mb-1">Hari Perkiraan Lahir (HPL / EDD)</div>
                <div className="text-2xl font-bold text-slate-900">{formatIndoDate(hplDate)}</div>
                <div className="text-xs text-teal-800 mt-1.5">
                  {daysRemaining > 0
                    ? `Sisa waktu sekitar ${daysRemaining} hari menuju HPL (rentang aterm 37–42 minggu)`
                    : daysRemaining === 0
                    ? "Hari ini adalah Hari Perkiraan Lahir (40 minggu)"
                    : `Melewati HPL sebesar ${Math.abs(daysRemaining)} hari — evaluasi kehamilan serotinus`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricReadout
                  label="Usia Kehamilan Saat Ini"
                  value={`${gaWeeks} mgg ${gaDays} hr`}
                  sublabel={trimester}
                  tone={gaWeeks >= 42 ? "rose" : gaWeeks >= 37 ? "emerald" : "sky"}
                />
                <MetricReadout
                  label="Perkiraan Tanggal Konsepsi"
                  value={conceptionDate ? conceptionDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  sublabel="Estimasi ovulasi & fertilisasi"
                  tone="neutral"
                />
              </div>

              <ClinicalNote level="info" title="Konfirmasi USG Trimester 1">
                Pemeriksaan USG Crown-Rump Length (CRL) pada usia kehamilan &lt; 13 minggu 6 hari merupakan metode paling akurat untuk menetapkan usia kehamilan, khususnya bila HPHT tidak pasti atau siklus menstruasi tidak teratur.
              </ClinicalNote>
            </>
          ) : (
            <ClinicalNote level="warning" title="Pilih Tanggal HPHT">
              Masukkan tanggal Hari Pertama Haid Terakhir (HPHT) yang valid.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}

// ============================================================================
// 3. Kalkulator Kurva Pertumbuhan Balita (Z-Score WHO 2006 / Permenkes RI)
// ============================================================================
interface LmsPoint {
  x: number; // age in months OR height in cm
  L: number;
  M: number;
  S: number;
}

// WHO 2006 Weight-for-Age (kg) 0-60 months
const WHO_WAZ_BOYS: LmsPoint[] = [
  { x: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { x: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { x: 6, L: 0.1738, M: 7.934, S: 0.10958 },
  { x: 9, L: 0.1738, M: 8.9014, S: 0.10718 },
  { x: 12, L: 0.1738, M: 9.6479, S: 0.1066 },
  { x: 18, L: 0.1419, M: 10.9415, S: 0.1069 },
  { x: 24, L: 0.0884, M: 12.1515, S: 0.1096 },
  { x: 30, L: 0.0365, M: 13.308, S: 0.1127 },
  { x: 36, L: -0.0137, M: 14.3429, S: 0.1162 },
  { x: 42, L: -0.0628, M: 15.323, S: 0.1199 },
  { x: 48, L: -0.1124, M: 16.3489, S: 0.1235 },
  { x: 54, L: -0.1605, M: 17.344, S: 0.1271 },
  { x: 60, L: -0.2072, M: 18.3366, S: 0.1306 },
];

const WHO_WAZ_GIRLS: LmsPoint[] = [
  { x: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { x: 3, L: 0.1121, M: 5.8458, S: 0.12174 },
  { x: 6, L: 0.0258, M: 7.297, S: 0.11655 },
  { x: 9, L: -0.0241, M: 8.2254, S: 0.1157 },
  { x: 12, L: -0.0566, M: 8.9481, S: 0.11618 },
  { x: 18, L: -0.1032, M: 10.2286, S: 0.118 },
  { x: 24, L: -0.1369, M: 11.4775, S: 0.1204 },
  { x: 30, L: -0.165, M: 12.697, S: 0.1234 },
  { x: 36, L: -0.1891, M: 13.8503, S: 0.1274 },
  { x: 42, L: -0.2121, M: 14.956, S: 0.1317 },
  { x: 48, L: -0.2367, M: 16.0697, S: 0.136 },
  { x: 54, L: -0.2615, M: 17.163, S: 0.1404 },
  { x: 60, L: -0.286, M: 18.2193, S: 0.1449 },
];

// WHO 2006 Length/Height-for-Age (cm) 0-60 months
const WHO_HAZ_BOYS: LmsPoint[] = [
  { x: 0, L: 1, M: 49.8842, S: 0.03795 },
  { x: 3, L: 1, M: 61.4292, S: 0.03328 },
  { x: 6, L: 1, M: 67.6236, S: 0.03165 },
  { x: 9, L: 1, M: 71.9687, S: 0.03152 },
  { x: 12, L: 1, M: 75.7488, S: 0.03218 },
  { x: 18, L: 1, M: 82.2587, S: 0.03382 },
  { x: 24, L: 1, M: 87.1161, S: 0.0354 },
  { x: 30, L: 1, M: 91.908, S: 0.0369 },
  { x: 36, L: 1, M: 96.0835, S: 0.03835 },
  { x: 42, L: 1, M: 99.888, S: 0.03965 },
  { x: 48, L: 1, M: 103.3273, S: 0.04088 },
  { x: 54, L: 1, M: 106.666, S: 0.04195 },
  { x: 60, L: 1, M: 109.9638, S: 0.04294 },
];

const WHO_HAZ_GIRLS: LmsPoint[] = [
  { x: 0, L: 1, M: 49.1477, S: 0.0379 },
  { x: 3, L: 1, M: 59.8029, S: 0.03493 },
  { x: 6, L: 1, M: 65.7311, S: 0.03418 },
  { x: 9, L: 1, M: 70.1435, S: 0.03435 },
  { x: 12, L: 1, M: 74.015, S: 0.035 },
  { x: 18, L: 1, M: 80.7079, S: 0.03647 },
  { x: 24, L: 1, M: 85.7153, S: 0.03784 },
  { x: 30, L: 1, M: 90.71, S: 0.0391 },
  { x: 36, L: 1, M: 95.0515, S: 0.04032 },
  { x: 42, L: 1, M: 99.043, S: 0.04148 },
  { x: 48, L: 1, M: 102.7312, S: 0.04258 },
  { x: 54, L: 1, M: 106.16, S: 0.04358 },
  { x: 60, L: 1, M: 109.4233, S: 0.04452 },
];

// WHO 2006 Weight-for-Length/Height (cm -> kg) 45-120 cm
const WHO_WHZ_BOYS: LmsPoint[] = [
  { x: 45, L: -0.3521, M: 2.441, S: 0.09182 },
  { x: 55, L: -0.3521, M: 4.536, S: 0.0853 },
  { x: 65, L: -0.3521, M: 7.213, S: 0.0819 },
  { x: 75, L: -0.3521, M: 9.575, S: 0.0806 },
  { x: 85, L: -0.3521, M: 11.714, S: 0.0806 },
  { x: 95, L: -0.3521, M: 13.927, S: 0.0818 },
  { x: 105, L: -0.3521, M: 16.697, S: 0.0852 },
  { x: 115, L: -0.3521, M: 20.435, S: 0.0908 },
  { x: 120, L: -0.3521, M: 22.416, S: 0.0938 },
];

const WHO_WHZ_GIRLS: LmsPoint[] = [
  { x: 45, L: -0.3833, M: 2.4607, S: 0.09029 },
  { x: 55, L: -0.3833, M: 4.462, S: 0.0887 },
  { x: 65, L: -0.3833, M: 6.993, S: 0.0867 },
  { x: 75, L: -0.3833, M: 9.211, S: 0.0846 },
  { x: 85, L: -0.3833, M: 11.425, S: 0.0839 },
  { x: 95, L: -0.3833, M: 13.681, S: 0.0856 },
  { x: 105, L: -0.3833, M: 16.529, S: 0.0897 },
  { x: 115, L: -0.3833, M: 20.175, S: 0.0955 },
  { x: 120, L: -0.3833, M: 22.346, S: 0.0987 },
];

function interpolateLms(table: LmsPoint[], xVal: number): LmsPoint {
  if (xVal <= table[0].x) return table[0];
  if (xVal >= table[table.length - 1].x) return table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (xVal >= a.x && xVal <= b.x) {
      const t = (xVal - a.x) / (b.x - a.x);
      return {
        x: xVal,
        L: a.L + (b.L - a.L) * t,
        M: a.M + (b.M - a.M) * t,
        S: a.S + (b.S - a.S) * t,
      };
    }
  }
  return table[table.length - 1];
}

function computeWhoZScore(value: number, lms: LmsPoint): number {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0 || S <= 0) return 0;
  let z = L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
  // WHO restricted procedure for |Z| > 3
  if (z > 3) {
    const sd3pos = M * Math.pow(1 + L * S * 3, 1 / L);
    const sd2pos = M * Math.pow(1 + L * S * 2, 1 / L);
    z = 3 + (value - sd3pos) / (sd3pos - sd2pos);
  } else if (z < -3) {
    const sd3neg = M * Math.pow(1 + L * S * -3, 1 / L);
    const sd2neg = M * Math.pow(1 + L * S * -2, 1 / L);
    z = -3 + (value - sd3neg) / (sd2neg - sd3neg);
  }
  return z;
}

function ZScoreBar({ label, z, classification, tone }: { label: string; z: number; classification: string; tone: "emerald" | "amber" | "rose" | "sky" }) {
  const clamped = Math.max(-4, Math.min(4, z));
  const pct = ((clamped + 4) / 8) * 100;
  const badgeColor = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    sky: "text-sky-700",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold font-mono tabular-nums ${badgeColor}`}>
            {z >= 0 ? "+" : ""}
            {z.toFixed(2)} SD
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className={`text-xs font-semibold ${badgeColor}`}>{classification}</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-400 via-emerald-400 to-rose-400">
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-900/40" />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
        <span>-3 SD</span>
        <span>-2 SD</span>
        <span>0 (Median)</span>
        <span>+2 SD</span>
        <span>+3 SD</span>
      </div>
    </div>
  );
}

export function WhoZScoreCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [ageMonths, setAgeMonths] = useState("24");
  const [weightKg, setWeightKg] = useState("11.8");
  const [heightCm, setHeightCm] = useState("85.5");

  const age = parseFloat(ageMonths);
  const weight = parseFloat(weightKg);
  const height = parseFloat(heightCm);

  const valid =
    !isNaN(age) && age >= 0 && age <= 60 &&
    !isNaN(weight) && weight > 0.5 && weight <= 40 &&
    !isNaN(height) && height >= 45 && height <= 120;

  let waz = 0;
  let haz = 0;
  let whz = 0;

  if (valid) {
    const wazLms = interpolateLms(gender === "male" ? WHO_WAZ_BOYS : WHO_WAZ_GIRLS, age);
    const hazLms = interpolateLms(gender === "male" ? WHO_HAZ_BOYS : WHO_HAZ_GIRLS, age);
    const whzLms = interpolateLms(gender === "male" ? WHO_WHZ_BOYS : WHO_WHZ_GIRLS, height);

    waz = computeWhoZScore(weight, wazLms);
    haz = computeWhoZScore(height, hazLms);
    whz = computeWhoZScore(weight, whzLms);
  }

  const classifyWaz = (z: number) =>
    z < -3
      ? { text: "Berat Badan Sangat Kurang (Severely Underweight)", tone: "rose" as const }
      : z < -2
      ? { text: "Berat Badan Kurang (Underweight)", tone: "amber" as const }
      : z <= 1
      ? { text: "Berat Badan Normal", tone: "emerald" as const }
      : { text: "Risiko Berat Badan Lebih", tone: "amber" as const };

  const classifyHaz = (z: number) =>
    z < -3
      ? { text: "Sangat Pendek (Severely Stunted)", tone: "rose" as const }
      : z < -2
      ? { text: "Pendek (Stunted)", tone: "amber" as const }
      : z <= 3
      ? { text: "Normal", tone: "emerald" as const }
      : { text: "Tinggi", tone: "sky" as const };

  const classifyWhz = (z: number) =>
    z < -3
      ? { text: "Gizi Buruk (Severely Wasted)", tone: "rose" as const }
      : z < -2
      ? { text: "Gizi Kurang (Wasted)", tone: "amber" as const }
      : z <= 1
      ? { text: "Gizi Baik (Normal)", tone: "emerald" as const }
      : z <= 2
      ? { text: "Berisiko Gizi Lebih", tone: "sky" as const }
      : z <= 3
      ? { text: "Gizi Lebih (Overweight)", tone: "amber" as const }
      : { text: "Obesitas", tone: "rose" as const };

  const wazRes = classifyWaz(waz);
  const hazRes = classifyHaz(haz);
  const whzRes = classifyWhz(whz);

  return (
    <CalculatorShell
      categoryLabel="Nutrisi, Metabolisme & Kehamilan"
      title="Kalkulator Kurva Pertumbuhan (Z-Score WHO)"
      subtitle="Menentukan status gizi balita usia 0–60 bulan berdasarkan Standar Antropometri Anak WHO (2006) & Permenkes RI No. 2 Tahun 2020 untuk mendeteksi stunting, wasting, gizi buruk, dan obesitas."
      onReset={() => {
        setGender("male");
        setAgeMonths("24");
        setWeightKg("11.8");
        setHeightCm("85.5");
      }}
      references={[
        "World Health Organization (WHO). WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age. Geneva: WHO; 2006.",
        "Peraturan Menteri Kesehatan RI Nomor 2 Tahun 2020 tentang Standar Antropometri Anak.",
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin Anak</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  gender === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Laki-laki
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  gender === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia Anak (0 – 60 Bulan)</label>
            <input
              type="number"
              min="0"
              max="60"
              step="1"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Panjang / Tinggi Badan (45 – 120 cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Usia &lt; 24 bulan diukur terlentang (PB); usia ≥ 24 bulan diukur berdiri (TB).
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-3.5">
          {valid ? (
            <>
              <ZScoreBar label="BB / U (Berat Badan menurut Umur — WAZ)" z={waz} classification={wazRes.text} tone={wazRes.tone} />
              <ZScoreBar label="PB atau TB / U (Panjang/Tinggi menurut Umur — HAZ / Deteksi Stunting)" z={haz} classification={hazRes.text} tone={hazRes.tone} />
              <ZScoreBar label="BB / PB atau TB (Berat menurut Tinggi — WHZ / Wasting & Obesitas)" z={whz} classification={whzRes.text} tone={whzRes.tone} />

              {(haz < -2 || whz < -2 || whz > 2) && (
                <ClinicalNote
                  level={haz < -3 || whz < -3 || whz > 3 ? "critical" : "warning"}
                  title="Tindak Lanjut Klinis Antropometri"
                >
                  {whz < -3
                    ? "Terdeteksi Gizi Buruk (WHZ < -3 SD). Evaluasi tanda bahaya klinis (edema bilateral, nafsu makan, infeksi) dan rujuk segera sesuai tata laksana Gizi Buruk Kemenkes RI."
                    : haz < -2
                    ? "Terdeteksi indikasi Stunting (HAZ < -2 SD). Evaluasi riwayat asupan protein hewani, infeksi berulang, dan rujuk ke dokter spesialis anak / tim gizi klinik."
                    : whz < -2
                    ? "Terdeteksi Gizi Kurang / Wasting (WHZ < -2 SD). Lakukan konseling pemberian makanan tambahan (PMT) padat energi-protein serta pemantauan berat badan tiap 2 minggu."
                    : "Terdeteksi Gizi Lebih / Obesitas (WHZ > +2 SD). Evaluasi pola makan, aktivitas fisik, dan konseling gizi keluarga."}
                </ClinicalNote>
              )}
            </>
          ) : (
            <ClinicalNote level="warning" title="Rentang Input WHO Balita">
              Masukkan usia 0–60 bulan, berat badan 0,5–40 kg, dan panjang/tinggi badan 45–120 cm.
            </ClinicalNote>
          )}
        </div>
      </div>
    </CalculatorShell>
  );
}
