import fs from 'fs';
import { PDFParse } from 'pdf-parse';

// Official 30 Kelas Terapi from KMK 1199/2025
const KELAS_MAP = {
  1: "ANALGESIK, ANTIPIRETIK, ANTIINFLAMASI NON STEROID, ANTIPIRAI",
  2: "ANESTETIK",
  3: "ANTIALERGI dan OBAT untuk ANAFILAKSIS",
  4: "ANTIDOT dan OBAT LAIN untuk KERACUNAN",
  5: "ANTIEPILEPSI - ANTIKONVULSI",
  6: "ANTIINFEKSI",
  7: "ANTIMIGREN dan ANTIVERTIGO",
  8: "ANTINEOPLASTIK DAN IMUNOMODULATOR",
  9: "ANTIPARKINSON",
  10: "OBAT yang MEMENGARUHI DARAH",
  11: "PRODUK DARAH dan PENGGANTI PLASMA",
  12: "DIAGNOSTIK",
  13: "ANTISEPTIK dan DISINFEKTAN",
  14: "OBAT dan BAHAN untuk GIGI",
  15: "DIURETIK dan OBAT untuk HIPERTROFI PROSTAT",
  16: "HORMON, OBAT ENDOKRIN LAIN dan KONTRASEPSI",
  17: "OBAT KARDIOVASKULAR",
  18: "OBAT TOPIKAL untuk KULIT",
  19: "LARUTAN DIALISIS PERITONEAL",
  20: "LARUTAN ELEKTROLIT, NUTRISI, dan LAIN–LAIN",
  21: "OBAT untuk MATA",
  22: "OKSITOSIK",
  23: "PSIKOFARMAKA",
  24: "RELAKSAN OTOT PERIFER dan PENGHAMBAT KOLINESTERASE",
  25: "OBAT untuk SALURAN CERNA",
  26: "OBAT untuk SALURAN NAPAS",
  27: "OBAT UNTUK SALURAN KEMIH",
  28: "OBAT yang MEMENGARUHI SISTEM IMUN",
  29: "OBAT untuk TELINGA, HIDUNG, dan TENGGOROK",
  30: "VITAMIN dan MINERAL"
};

const INVALID_START_WORDS = /^(hari|minggu|bulan|tahun|jam|menit|kali|dosis|siklus|kasus|tab|kaps|amp|vial|btl|kantong|drop|sir|puff|mg|mcg|g|kg|ml|l|iu|kecuali|untuk|selama|pemberian|diberikan|hanya|tidak|bila|jika|setiap|pada|dengan|atau|dan|dalam|sampai|seperti|oleh|harus|dapat|dilakukan|setara|maks|maksimal)\b/i;

async function runExtraction() {
  console.log("Loading public/fornas_2025.pdf...");
  const buf = fs.readFileSync('public/fornas_2025.pdf');
  const parser = new PDFParse({ data: buf });
  const res = await parser.getText();
  console.log(`Parsed PDF successfully. Total pages: ${res.pages.length}`);

  const allLines = [];
  for (let i = 8; i < res.pages.length; i++) {
    const raw = res.pages[i].text;
    const rawLines = raw.split('\n');
    for (let j = 0; j < rawLines.length; j++) {
      const splitTab = rawLines[j].split(/\t+(?=\d+\.\s+)/);
      for (const st of splitTab) {
        const l = st.trim();
        if (!l) continue;
        if (/^-\s*\d+\s*-$/.test(l)) continue;
        if (l === 'KEMENTERIAN KESEHATAN' || l === 'jdih.kemkes.go.id' || l === 'B. DAFTAR OBAT FORMULARIUM NASIONAL') continue;
        if (['KELAS', 'TERAPI', 'SUB KELAS TERAPI/NAMA', 'GENERIK/SEDIAAN/KEKUATAN', 'DAN', 'RESTRIKSI PENGGUNAAN', 'FASILITAS', 'PELAYANAN', 'KESEHATAN PERESEPAN', 'MAKSIMAL OEN', 'FPK', 'TP', 'TL', 'FPKTP', 'FPKTL', 'KELASTERAPISUB', 'KELAS TERAPI'].includes(l)) {
          continue;
        }
        allLines.push({ text: l, page: i + 1 });
      }
    }
  }

  function parseCheckmarksAndValues(rawStr) {
    let content = rawStr.replace(//g, '√');
    const checkCount = (content.match(/√/g) || []).length;
    const parts = content.split('√').map(p => p.trim());
    
    let sediaan = parts[0] ? parts[0].trim() : content;
    sediaan = sediaan.replace(/[*]+$/, '').trim();

    let fpktp = "-";
    let fpktl = "-";
    let oen = "-";
    let peresepanMaks = "-";

    if (checkCount === 1) {
      fpktl = "√";
      if (parts[1]) peresepanMaks = parts[1].trim();
    } else if (checkCount === 2) {
      if (parts[1] === "" || parts[1] === "," || parts[1] === ", PP" || parts[1] === "" || parts[1].length <= 3) {
        fpktp = "√";
        fpktl = "√";
        if (parts[2]) peresepanMaks = parts[2].trim();
      } else {
        fpktl = "√";
        peresepanMaks = parts[1].trim();
        oen = "√";
      }
    } else if (checkCount >= 3) {
      fpktp = "√";
      fpktl = "√";
      oen = "√";
      if (parts[2]) peresepanMaks = parts[2].trim();
      else if (parts[1]) peresepanMaks = parts[1].trim();
    }

    if (!peresepanMaks || peresepanMaks === "" || peresepanMaks === "-") {
      peresepanMaks = "-";
    }

    return { sediaan, fpktp, fpktl, oen, peresepanMaks };
  }

  let currentKelas = KELAS_MAP[1];
  let currentSubKelas = "ANALGESIK NARKOTIK";
  let currentDrug = "";
  let expectedDrugNum = 1;
  const items = [];
  let accumulatedDrugRestrictions = [];
  let currentItem = null;

  const detectedKelas = new Set();
  const detectedDrugs = new Set();

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i].text;

    // Check Kelas
    const km = line.match(/^(\d{1,2})\.\s+(.*)/);
    if (km && parseInt(km[1]) >= 1 && parseInt(km[1]) <= 30) {
      const num = parseInt(km[1]);
      if (KELAS_MAP[num]) {
        const expected = KELAS_MAP[num].toUpperCase().split(/[\s,]+/)[0];
        if (km[2].toUpperCase().includes(expected) && !/^(tab|kaps|inj|sir|lar|inf)\b/i.test(km[2])) {
          currentKelas = KELAS_MAP[num];
          detectedKelas.add(num);
          currentSubKelas = "-";
          currentDrug = "";
          expectedDrugNum = 1;
          accumulatedDrugRestrictions = [];
          currentItem = null;
          continue;
        }
      }
    }

    // Check SubKelas
    const sm = line.match(/^(\d{1,2}(?:\.\d{1,2})+)\s+([A-Za-z\s,/\–\-]+)$/);
    if (sm && !/mg|mcg|ml|g\b/i.test(sm[2])) {
      currentSubKelas = sm[2].trim();
      currentDrug = "";
      expectedDrugNum = 1;
      accumulatedDrugRestrictions = [];
      currentItem = null;
      continue;
    }

    // Special check for Parenteral 20.2 solutions (Larutan Mengandung...)
    if (currentKelas.includes('ELEKTROLIT') && (line.startsWith('Larutan Mengandung') || line.startsWith('Larutan mengandung'))) {
      let combinedName = line;
      let checkLine = '';
      if (/[√]/.test(combinedName)) {
        checkLine = combinedName;
      }
      while (allLines[i+1] && !allLines[i+1].text.startsWith('Larutan Mengandung') && !/^\d+\./.test(allLines[i+1].text) && !allLines[i+1].text.startsWith('20.') && !allLines[i+1].text.startsWith('21.')) {
        const nextL = allLines[i+1].text.trim();
        if (/[√]/.test(nextL)) {
          checkLine = nextL;
          i++;
          break;
        }
        if (nextL.startsWith('Hanya ') || nextL.startsWith('Digunakan ')) break;
        combinedName += ' ' + nextL;
        i++;
      }

      const parsed = parseCheckmarksAndValues(checkLine || combinedName);
      let drugName = combinedName.replace(/[√].*$/, '').replace(/\+/g, ' + ').replace(/\s+/g, ' ').trim();
      currentDrug = drugName;
      accumulatedDrugRestrictions = [];
      
      if (drugName.toLowerCase().includes('elektrolit') && !drugName.includes('+')) {
        expectedDrugNum = 1;
        continue;
      }

      currentItem = {
        id: `f${items.length + 1}`,
        kelasTerapi: currentKelas,
        subKelasTerapi: 'PARENTERAL',
        namaObat: drugName,
        bentukSediaan: 'inf',
        restriksi: '-',
        peresepanMaksimal: parsed.peresepanMaks,
        fpktp: parsed.fpktp,
        fpktl: parsed.fpktl,
        oen: parsed.oen,
        catatan: '-'
      };
      items.push(currentItem);
      continue;
    }

    // Standalone number for drug heading: e.g. '8', '6', '2'
    if (/^\d{1,3}$/.test(line)) {
      const num = parseInt(line);
      if (num === expectedDrugNum) {
        let k = i + 1;
        while (allLines[k] && (allLines[k].text.startsWith('Catatan:') || allLines[k].text.startsWith('sebelum ') || allLines[k].text.startsWith('hilangnya ') || allLines[k].text.startsWith('disimpan ') || allLines[k].text.startsWith('dan digunakan '))) {
          k++;
        }
        if (allLines[k]) {
          let cand = allLines[k].text.trim();
          if (cand.startsWith('kombinasi') || cand.startsWith('Kombipak')) {
            i = k;
            let combinedName = cand;
            while (allLines[i+1]) {
              const nextL = allLines[i+1].text.trim();
              if (/^\d+\.?\s+/.test(nextL) || /[√]/.test(nextL) || nextL.startsWith('a)')) break;
              if (/^[a-z]\.\s+/i.test(nextL)) {
                let ingredients = [];
                let m = i + 1;
                while (allLines[m] && /^[a-z]\.\s+/i.test(allLines[m].text)) {
                  ingredients.push(allLines[m].text.replace(/^[a-z]\.\s+/i, '').trim());
                  m++;
                }
                if (ingredients.length > 0) {
                  combinedName += ' ' + ingredients.join(' + ');
                  i = m - 1;
                }
                break;
              } else {
                combinedName += ' ' + nextL;
                i++;
              }
            }
            let drugName = combinedName.charAt(0).toUpperCase() + combinedName.slice(1);
            currentDrug = drugName;
            detectedDrugs.add(currentDrug);
            expectedDrugNum++;
            accumulatedDrugRestrictions = [];
            currentItem = null;

            if (allLines[i+1] && /[√]/.test(allLines[i+1].text) && !/^\d+\./.test(allLines[i+1].text)) {
              const parsed = parseCheckmarksAndValues(allLines[i+1].text);
              currentItem = {
                id: `f${items.length + 1}`,
                kelasTerapi: currentKelas,
                subKelasTerapi: currentSubKelas,
                namaObat: currentDrug,
                bentukSediaan: 'paket kombipak',
                restriksi: '-',
                peresepanMaksimal: parsed.peresepanMaks,
                fpktp: parsed.fpktp,
                fpktl: parsed.fpktl,
                oen: parsed.oen,
                catatan: '-'
              };
              items.push(currentItem);
              i++;
            }
            continue;
          }
        }
      }
    }

    // Check Drug heading: MUST match expectedDrugNum! Supports letters, 131I, 153-Sm
    const dm = line.match(/^(\d{1,3})\s+([a-zA-Z]|131I|153-Sm)(.*)/);
    if (dm && !/^\d+\./.test(line)) {
      const num = parseInt(dm[1]);
      let nameCandidate = (dm[2] + dm[3]).trim();

      if (!nameCandidate.startsWith('(') && !nameCandidate.startsWith('[') && !INVALID_START_WORDS.test(nameCandidate) && !nameCandidate.includes('/bulan') && !nameCandidate.includes('/hari') && !nameCandidate.includes('/kasus')) {
        // Handle "Catatan: Dibuat baru (recenter... hidrogen peroksida"
        if (nameCandidate.startsWith('Catatan:')) {
          let k = i + 1;
          let actualDrug = '';
          while (allLines[k] && !/^\d+\./.test(allLines[k].text) && !/[√]/.test(allLines[k].text)) {
            const cand = allLines[k].text.trim();
            if (/^[a-z]/i.test(cand) && !cand.startsWith('dalam ') && !cand.startsWith('rapat') && !cand.startsWith('terlindung') && !cand.startsWith('paratus')) {
              actualDrug = cand;
              i = k;
              break;
            }
            k++;
          }
          if (actualDrug) {
            nameCandidate = actualDrug;
          } else {
            continue;
          }
        }

        if (num === expectedDrugNum) {
          // Check if multi-line drug title continues (unclosed parens, trailing hyphen, or connector words)
          let combinedName = nameCandidate;
          while (allLines[i+1]) {
            const nextL = allLines[i+1].text.trim();
            const openP = (combinedName.match(/\(/g) || []).length;
            const closeP = (combinedName.match(/\)/g) || []).length;
            const needsContinuation = openP > closeP || 
              combinedName.endsWith('-') || 
              combinedName.endsWith(',') || 
              combinedName.endsWith('(') || 
              combinedName.endsWith(':') || 
              combinedName.endsWith(' dengan') || 
              combinedName.endsWith(' dan') || 
              combinedName.endsWith(' atau') || 
              (nextL.startsWith('(') && (nextL.includes('[P]') || (allLines[i+2] && /[√]/.test(allLines[i+2].text)))) ||
              /^[a-z]\.\s+/i.test(nextL);

            if (!needsContinuation) break;
            if (/^\d+\./.test(nextL) || /[√]/.test(nextL)) break;

            if (/^[a-z]\.\s+/i.test(nextL)) {
              let ingredients = [];
              let k = i + 1;
              while (allLines[k] && /^[a-z]\.\s+/i.test(allLines[k].text)) {
                ingredients.push(allLines[k].text.replace(/^[a-z]\.\s+/i, '').trim());
                k++;
              }
              if (ingredients.length > 0) {
                combinedName += ' ' + ingredients.join(' + ');
                i = k - 1;
              }
              break;
            } else {
              combinedName += (combinedName.endsWith('-') ? '' : ' ') + nextL;
              i++;
            }
          }

          let drugName = combinedName.charAt(0).toUpperCase() + combinedName.slice(1);
          currentDrug = drugName;
          detectedDrugs.add(currentDrug);
          expectedDrugNum++;
          accumulatedDrugRestrictions = [];
          currentItem = null;

          // Check if this drug itself has checkmark on line or immediate next line (e.g. Kombipak)
          let checkLine = '';
          if (/[√]/.test(line)) {
            checkLine = line;
          } else if (allLines[i+1] && /[√]/.test(allLines[i+1].text) && !/^\d+\./.test(allLines[i+1].text) && !allLines[i+1].text.startsWith('a)')) {
            checkLine = allLines[i+1].text;
            i++;
          }

          if (checkLine) {
            const parsed = parseCheckmarksAndValues(checkLine);
            currentItem = {
              id: `f${items.length + 1}`,
              kelasTerapi: currentKelas,
              subKelasTerapi: currentSubKelas,
              namaObat: currentDrug,
              bentukSediaan: 'paket kombipak',
              restriksi: '-',
              peresepanMaksimal: parsed.peresepanMaks,
              fpktp: parsed.fpktp,
              fpktl: parsed.fpktl,
              oen: parsed.oen,
              catatan: '-'
            };
            items.push(currentItem);
          }
          continue;
        }
      }
    }

    // Check Sediaan line (supports 1. or 1 serb etc)
    const mNum = line.match(/^(\d{1,2})\.\s+(.*)/) || line.match(/^(\d{1,2})\s+(serb|inj|inf|tab|kaps|lar|susp|sir|drops|krim|salep|gel)\b(.*)/);
    if (mNum && currentDrug) {
      let fullSediaanLine = line;
      if (!/[√]/.test(fullSediaanLine) && allLines[i+1] && /[√]/.test(allLines[i+1].text)) {
        fullSediaanLine += " " + allLines[i+1].text;
        i++;
      }

      if (/[√]/.test(fullSediaanLine)) {
        const rawContent = mNum[3] !== undefined ? (mNum[2] + " " + mNum[3]).trim() : mNum[2];
        const parsed = parseCheckmarksAndValues(rawContent);
        let initialRestriction = accumulatedDrugRestrictions.length > 0 
          ? accumulatedDrugRestrictions.join(' ') 
          : "-";

        currentItem = {
          id: `f${items.length + 1}`,
          kelasTerapi: currentKelas,
          subKelasTerapi: currentSubKelas,
          namaObat: currentDrug,
          bentukSediaan: parsed.sediaan,
          restriksi: initialRestriction,
          peresepanMaksimal: parsed.peresepanMaks,
          fpktp: parsed.fpktp,
          fpktl: parsed.fpktl,
          oen: parsed.oen,
          catatan: "-"
        };
        items.push(currentItem);
        continue;
      }
    }

    // Handle lone checkmarks or continuations of peresepan / restriksi
    if (currentItem) {
      if (line === '' || line === '√') {
        if (currentItem.oen === "-") currentItem.oen = "√";
        continue;
      }

      if (line.includes('/bulan') || line.includes('/hari') || line.includes('/kasus') || line.includes('tab/minggu') || line.includes('amp/hari') || line.includes('btl/bulan') || line.includes('FPKTL:') || line.includes('FPKTP:') || line.includes('maks.')) {
        const clean = line.replace(/[√]/g, '').trim();
        if (currentItem.peresepanMaksimal === "-") {
          currentItem.peresepanMaksimal = clean;
        } else if (!currentItem.peresepanMaksimal.includes(clean)) {
          currentItem.peresepanMaksimal += " " + clean;
        }
        if (/[√]/.test(line)) {
          currentItem.oen = "√";
        }
        continue;
      }
    }

    // Otherwise, restriction text
    if (currentDrug && !line.startsWith('ttd.') && !line.startsWith('BUDI G. SADIKIN') && !line.startsWith('MENTERI KESEHATAN')) {
      accumulatedDrugRestrictions.push(line);
      if (currentItem) {
        if (currentItem.restriksi === "-") {
          currentItem.restriksi = line;
        } else if (!currentItem.restriksi.includes(line)) {
          currentItem.restriksi += " " + line;
        }
      }
    }
  }

  console.log(`\n=== EXTRACTION SUMMARY ===`);
  console.log(`Kelas Terapi extracted: ${detectedKelas.size} of 30`);
  console.log(`Unique Generic Drugs extracted: ${detectedDrugs.size}`);
  console.log(`Total Formulations (Sediaan) extracted: ${items.length}`);

  // Save the full extracted dataset to JSON and TypeScript
  fs.writeFileSync('src/data/fornasData.json', JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Wrote src/data/fornasData.json with ${items.length} items.`);

  const tsContent = `// Data Formularium Nasional (Fornas) Kementerian Kesehatan Republik Indonesia
// Berdasarkan KMK NOMOR HK.01.07/MENKES/1199/2025 tentang Formularium Nasional
// Ditetapkan 31 Desember 2025, berlaku efektif 1 April 2026.
// Seluruh data resmi KMK 1199/2025 (224 halaman, 30 Kelas Terapi, ${detectedDrugs.size} obat generik resmi, ${items.length} sediaan lengkap).

export interface FornasDrug {
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

export const INITIAL_FORNAS_DATA: FornasDrug[] = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync('src/data/fornasData.ts', tsContent, 'utf-8');
  console.log(`Successfully updated src/data/fornasData.ts with ${items.length} items!`);
}

runExtraction().catch(console.error);
