import { CalculatorInputs, CalculationResult, DrugPreset, AlertLevel } from "./types";

interface PDFParams {
  inputs: CalculatorInputs;
  calculated: CalculationResult;
  calculatedBsa: number;
  calculatedCrCl: number;
  selectedPreset: DrugPreset | undefined;
  aiReport: string;
  isFemale: boolean;
}

export async function generateMedicalReportPDF({
  inputs,
  calculated,
  calculatedBsa,
  calculatedCrCl,
  selectedPreset,
  aiReport,
  isFemale,
}: PDFParams) {
  const { jsPDF } = await import("jspdf");
  // Initialize A4 PDF: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  // Colors based on clinical design theme
  const primaryColor = [30, 41, 59]; // slate-800
  const accentColor = [37, 99, 235]; // blue-600
  const lightGray = [248, 250, 252]; // slate-50
  const borderGray = [226, 232, 240]; // slate-200
  const textDark = [15, 23, 42]; // slate-900
  const textMuted = [100, 116, 139]; // slate-500
  const alertCritical = [225, 29, 72]; // rose-600
  const alertWarning = [217, 119, 6]; // amber-600
  const alertInfo = [13, 148, 136]; // teal-600

  // Helper: check page space and add page if needed
  function checkSpace(neededHeight: number) {
    if (y + neededHeight > pageHeight - 20) {
      drawFooter();
      doc.addPage();
      y = 20;
      drawHeader();
    }
  }

  function drawHeader() {
    // Header background bar (minimalist and professional)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, contentWidth, 2, "F");
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("MedDose Clinical Engine", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Platform Dukungan Keputusan & Verifikasi Dosis Medis", margin, y + 5);

    // Right-aligned logo text/metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("LAPORAN DOSIS MEDIS", pageWidth - margin, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Waktu Cetak: ${new Date().toLocaleString("id-ID")}`, pageWidth - margin, y + 5, { align: "right" });

    y += 12;

    // Separation line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  function drawFooter() {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      "Dibuat secara otomatis oleh MedDose Engine - Diperuntukkan bagi verifikasi rekam medis.",
      margin,
      pageHeight - 12
    );

    doc.setFont("helvetica", "normal");
    doc.text(
      "Halaman " + (doc as any).internal.getNumberOfPages(),
      pageWidth - margin,
      pageHeight - 12,
      { align: "right" }
    );
  }

  // Draw initial page decoration
  drawHeader();

  // SECTION 1: PROFIL PASIEN (BIOMETRIK)
  checkSpace(40);
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, y, contentWidth, 32, "F");
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, y, contentWidth, 32, "S");

  // Section Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("1. BIOMETRIK & PROFIL PASIEN", margin + 4, y + 6);

  // Left column variables
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Jenis Kelamin:", margin + 6, y + 13);
  doc.text("Usia:", margin + 6, y + 19);
  doc.text("Berat Badan:", margin + 6, y + 25);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(isFemale ? "Perempuan" : "Laki-laki", margin + 32, y + 13);
  
  const ageY = inputs.ageYears !== "" ? inputs.ageYears : 0;
  const ageM = inputs.ageMonths !== "" ? inputs.ageMonths : 0;
  doc.text(`${ageY} tahun, ${ageM} bulan`, margin + 32, y + 19);
  doc.text(inputs.weightKg !== "" ? `${inputs.weightKg} kg` : "Tidak ditentukan", margin + 32, y + 25);

  // Middle-Right column variables
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Tinggi Badan:", margin + 85, y + 13);
  doc.text("Kreatinin Serum:", margin + 85, y + 19);
  doc.text("Luas Permukaan (BSA):", margin + 85, y + 25);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(inputs.heightCm !== "" ? `${inputs.heightCm} cm` : "Tidak ditentukan", margin + 120, y + 13);
  doc.text(inputs.serumCreatinine !== "" ? `${inputs.serumCreatinine} mg/dL` : "Tidak ditentukan", margin + 120, y + 19);
  doc.text(`${calculatedBsa.toFixed(2)} m² (Mosteller)`, margin + 120, y + 25);

  // Far-Right key stat: Estimated CrCl
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.rect(margin + 148, y + 2, 38, 28, "F");
  doc.rect(margin + 148, y + 2, 38, 28, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("ESTIMASI CrCl", margin + 167, y + 8, { align: "center" });

  if (calculatedCrCl > 0) {
    let statColor = alertInfo;
    if (calculatedCrCl < 30) statColor = alertCritical;
    else if (calculatedCrCl < 60) statColor = alertWarning;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(statColor[0], statColor[1], statColor[2]);
    doc.text(calculatedCrCl.toFixed(1), margin + 167, y + 17, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("mL/min (CG-Eq)", margin + 167, y + 24, { align: "center" });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Butuh SCr", margin + 167, y + 17, { align: "center" });
  }

  y += 38;

  // SECTION 2: PROTOKOL & FORMULASI OBAT
  checkSpace(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("2. PROTOKOL & REGIMEN OBAT", margin, y);
  y += 4;

  const presetName = selectedPreset ? selectedPreset.name : "Templat Dosis Kustom";
  const presetIndication = selectedPreset ? selectedPreset.indication : "Formulasi / Desain Dosis Kustom";
  
  // Create a nice list of parameters
  const formulaLabelMap: Record<string, string> = {
    mg_per_kg: "Berdasarkan Berat Badan (mg/kg atau mcg/kg)",
    mg_per_m2: "Berdasarkan Luas Permukaan Tubuh (mg/m² atau mcg/m²)",
    flat: "Dosis Tetap (Nilai Langsung)",
  };

  const frequencyLabelMap: Record<string, string> = {
    once: "Sekali (Dosis Tunggal)",
    q12h: "q12h / BID (Dua kali sehari)",
    q8h: "q8h / TID (Tiga kali sehari)",
    q6h: "q6h / QID (Empat kali sehari)",
    q4h: "q4h (Enam kali sehari)",
  };

  const paramsTable = [
    ["Protokol Obat:", presetName],
    ["Indikasi Terapi:", presetIndication],
    ["Metode Rumus:", formulaLabelMap[inputs.calcMethod] || inputs.calcMethod],
    ["Dosis Target:", `${inputs.targetDoseValue} ${inputs.doseUnit}${inputs.calcMethod === "mg_per_kg" ? "/kg" : inputs.calcMethod === "mg_per_m2" ? "/m²" : ""}`],
    ["Frekuensi / Interval:", frequencyLabelMap[inputs.frequency] || inputs.frequency],
  ];

  if (typeof inputs.liquidConcentrationValue === "number" && typeof inputs.liquidConcentrationVolume === "number") {
    paramsTable.push([
      "Konsentrasi Sediaan:",
      `${inputs.liquidConcentrationValue} ${inputs.doseUnit} / ${inputs.liquidConcentrationVolume} mL (Suspensi Cair)`,
    ]);
  }

  doc.setFontSize(8.5);
  paramsTable.forEach(([label, val]) => {
    checkSpace(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(label, margin + 4, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(val, margin + 45, y);
    y += 5.5;
  });

  y += 2;

  // SECTION 3: HASIL PERHITUNGAN UTAMA
  checkSpace(40);
  y += 2;
  doc.setFillColor(240, 253, 250); // Teal-50 / super clean background for results
  doc.rect(margin, y, contentWidth, 26, "F");
  doc.setDrawColor(20, 184, 166); // Teal-500 border
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 26, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text("3. HASIL DOSIS TERKONFIRMASI", margin + 4, y + 6);

  // Main single dose
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Dosis Tunggal (Per Pemberian):", margin + 6, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${calculated.singleDose.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${inputs.doseUnit}`, margin + 55, y + 13);

  // Cumulative daily dose
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Kumulatif Harian (24 Jam):", margin + 6, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${calculated.dailyDose.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${inputs.doseUnit}/hari`, margin + 55, y + 20);

  // Liquid volume if applicable
  if (calculated.liquidVolumeMl && calculated.liquidVolumeMl > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("Volume Cairan Cair:", margin + 112, y + 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${calculated.liquidVolumeMl.toFixed(2)} mL`, margin + 144, y + 13);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(calculated.liquidVolumeFormula || "", margin + 112, y + 20, { maxWidth: 58 });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Tidak menggunakan formulasi suspensi cair", margin + 112, y + 15, { maxWidth: 58 });
  }

  y += 32;

  // Render Formula Text Detail
  checkSpace(18);
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, y, contentWidth, 12, "F");
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 12, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Langkah Rumus Matematika:", margin + 4, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  
  // Format long formulas safely
  const formattedFormula = calculated.doseFormula.replace(/\n/g, "  |  ");
  doc.text(formattedFormula, margin + 4, y + 9, { maxWidth: contentWidth - 8 });

  y += 18;

  // SECTION 4: ALARM DETEKSI KEAMANAN DAN TINJAUAN FISIK (SAFETY ALERTS)
  if (calculated.alerts && calculated.alerts.length > 0) {
    checkSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("4. ALARM DETEKSI KEAMANAN FISIK KLINIS", margin, y);
    y += 5;

    calculated.alerts.forEach((alert) => {
      // Determine height of alert message + details
      const alertText = `[${alert.level.toUpperCase()}] ${alert.message}: ${alert.details}`;
      const splitAlert = doc.splitTextToSize(alertText, contentWidth - 10);
      const boxHeight = splitAlert.length * 4.5 + 4;

      checkSpace(boxHeight + 2);

      let boxBg = [254, 242, 242]; // Rose-50
      let borderCol = [252, 165, 165]; // Rose-300
      let textCol = alertCritical;

      if (alert.level === AlertLevel.WARNING) {
        boxBg = [255, 251, 235]; // Amber-50
        borderCol = [253, 230, 138]; // Amber-200
        textCol = alertWarning;
      } else if (alert.level === AlertLevel.INFO) {
        boxBg = [240, 253, 250]; // Teal-50
        borderCol = [204, 251, 241]; // Teal-200
        textCol = alertInfo;
      }

      doc.setFillColor(boxBg[0], boxBg[1], boxBg[2]);
      doc.rect(margin, y, contentWidth, boxHeight, "F");
      doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
      doc.rect(margin, y, contentWidth, boxHeight, "S");

      // Draw vertical block indicator on left
      doc.setFillColor(textCol[0], textCol[1], textCol[2]);
      doc.rect(margin, y, 1.5, boxHeight, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);

      let innerY = y + 4.5;
      splitAlert.forEach((line: string) => {
        doc.text(line, margin + 4, innerY);
        innerY += 4.2;
      });

      y += boxHeight + 3;
    });
    y += 2;
  }

  // SECTION 5: PENILAIAN KLINIS PENALARAN MENDALAM AI (DEEP AI REPORT)
  if (aiReport) {
    checkSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("5. KONSULTASI & TINJAUAN MEDIS MENDALAM AI", margin, y);
    y += 5;

    // Draw a neat subtitle card indicating high-reasoning model was active
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, "S");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("KONSULTASI SPESIALIS (DIHASILKAN SECARA DINAMIS OLEH GEMINI MEDICAL AGENT)", margin + 3, y + 4.5);
    
    y += 11;

    // Parse the markdown elements manually and layout nicely
    const lines = aiReport.split("\n");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        y += 3; // empty line spacing
        continue;
      }

      let isHeader = false;
      let isBold = false;
      let isBullet = false;
      let indent = 0;

      // Simple Markdown Parsing
      if (line.startsWith("###")) {
        line = line.replace(/^###\s*/, "");
        isHeader = true;
        isBold = true;
      } else if (line.startsWith("##")) {
        line = line.replace(/^##\s*/, "");
        isHeader = true;
        isBold = true;
      } else if (line.startsWith("#")) {
        line = line.replace(/^#\s*/, "");
        isHeader = true;
        isBold = true;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        line = line.replace(/^\*\*/, "").replace(/\*\*$/, "");
        isBold = true;
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        line = line.replace(/^[\*\-]\s*/, "");
        isBullet = true;
        indent = 4;
      }

      // Format markdown bold tokens **within** the line
      // For simplicity, we remove '**' tokens in raw text or let them print, but removing them looks cleaner.
      line = line.replace(/\*\*/g, "");

      if (isHeader) {
        checkSpace(10);
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(line, margin, y);
        y += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      } else if (isBullet) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);

        const splitBullet = doc.splitTextToSize(line, contentWidth - indent - 2);
        checkSpace(splitBullet.length * 4 + 2);

        // draw small bullet circle
        doc.setFillColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.circle(margin + indent, y + 1.2, 0.6, "F");

        let first = true;
        splitBullet.forEach((bulletLine: string) => {
          doc.text(bulletLine, margin + indent + 3, y + 2);
          y += 4;
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);

        const splitParagraph = doc.splitTextToSize(line, contentWidth);
        checkSpace(splitParagraph.length * 4 + 1);

        splitParagraph.forEach((paraLine: string) => {
          doc.text(paraLine, margin, y + 2);
          y += 4;
        });
      }
    }
    y += 4;
  }

  // MEDICAL DISCLAIMER SECTION
  checkSpace(24);
  y += 2;
  doc.setFillColor(254, 242, 242); // Warm rose-50 background for disclaimer
  doc.rect(margin, y, contentWidth, 20, "F");
  doc.setDrawColor(251, 113, 133); // Rose-400 border
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 20, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(alertCritical[0], alertCritical[1], alertCritical[2]);
  doc.text("PERNYATAAN PENYANGKALAN MEDIS PENTING (MEDICAL DISCLAIMER):", margin + 4, y + 4.5);

  const disclaimerText = "Analisis medis dan tinjauan dosis ini dihasilkan secara otomatis sebagai alat bantu keputusan klinis berbasis aturan dan kecerdasan buatan untuk verifikasi pendidikan. Laporan ini BUKAN merupakan saran medis langsung, diagnosis, atau rencana perawatan mandiri. Hasil perhitungan ini harus ditinjau dan divalidasi kembali secara independen oleh dokter berlisensi atau apoteker resmi sebelum melakukan dispensing atau pemberian terapi obat ke pasien.";
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(disclaimerText, margin + 4, y + 8, { maxWidth: contentWidth - 8 });

  // Final page footer draw for all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter();
  }

  // Save the PDF
  const filename = `Laporan_MedDose_${presetName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}
