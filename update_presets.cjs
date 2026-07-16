const fs = require('fs');
let content = fs.readFileSync('src/presets.ts', 'utf8');

// 1. Becom-C & Becom-Zet (ensure they are brand)
content = content.replace(/name: "Becom-C",/, 'name: "Becom-C (Vitamin B Kompleks)",');
content = content.replace(/name: "Becom-Zet",/, 'name: "Becom-Zet (Multivitamin)",');

// 2. Bedak Salisil (make it generic)
content = content.replace(/name: "Bedak Salisil \(Asam Salisilat\)",/, 'name: "Bedak Salisil",');

// 3. Betadine
content = content.replace(/name: "Betadine \(Povidone-Iodine\)",/, 'name: "Betadine (Iodine Povidone)",');

// 4. Betametason
// Maybe just add (Krim) to notes if it's not clear, but it's already topical. 
// "betametason ubah dari parenteral (injeksi) menjadi topikal"
// Let's check if the indication has parenteral. No, it says "(topikal)". I will just ensure the name is "Betametason".

// 5. Bfluid
content = content.replace(/name: "Bfluid",/, 'name: "Bfluid (Asam Amino)",');

// 6. Asering
content = content.replace(/name: "Asering",/, 'name: "Asering (Ringer Asetat)",');

// 7. Aspar
// It is already "Aspar-K (Kalium Aspartat)"

// 8. Bio ATP, Bioquinone, Borax Glycerin
content = content.replace(/name: "Bio ATP",/, 'name: "Bio ATP (Vitamin B Kompleks + ATP)",');
content = content.replace(/name: "Bioquinone",/, 'name: "Bioquinone (Coenzyme Q10)",');

// 9. Borraginol S & N
content = content.replace(
  /id: "borraginol_n",\s*name: "Borraginol-N",\s*indication: "Wasir\/hemoroid internal dan eksternal tanpa peradangan berat",/g,
  `id: "borraginol_s_new",
    name: "Borraginol-S (Antihemoroid)",
    indication: "Wasir/hemoroid internal dan eksternal tanpa peradangan berat",`
);

content = content.replace(
  /id: "borraginol_s",\s*name: "Borraginol-S",\s*indication: "Wasir disertai nyeri, pendarahan, dan peradangan \(mengandung steroid\)",/g,
  `id: "borraginol_n_new",
    name: "Borraginol-N (Antihemoroid + Steroid)",
    indication: "Wasir disertai nyeri, pendarahan, dan peradangan (mengandung steroid)",`
);

// 10. Braxidin
content = content.replace(/name: "Braxidin",/, 'name: "Braxidin (Chlordiazepoxide)",');

fs.writeFileSync('src/presets.ts', content);
