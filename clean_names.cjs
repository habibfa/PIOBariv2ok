const fs = require('fs');
const file = 'src/presets.ts';
let content = fs.readFileSync(file, 'utf8');

const regexList = [
  { match: /name:\s*"Aricept Evess \(Donepezil\) 10 mg",([\s\S]*?)notes:\s*"/g, replace: 'name: "Aricept Evess (Donepezil)",$1notes: "Sediaan: 10 mg Tablet ODT. ' },
  { match: /name:\s*"Arixtra \(Fondaparinux\) 2\.5 mg\/0\.5 mL Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "Arixtra (Fondaparinux)",$1notes: "Sediaan: Injeksi 2.5 mg/0.5 mL. ' },
  { match: /name:\s*"Asam Askorbat \(Vitamin C\) 50 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Askorbat (Vitamin C)",$1notes: "Sediaan: 50 mg Tablet. ' },
  { match: /name:\s*"Asam Folat 0\.4 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Folat (0.4 mg)",$1notes: "Sediaan: 0.4 mg Tablet. ' },
  { match: /name:\s*"Asam Folat 1 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Folat (1 mg)",$1notes: "Sediaan: 1 mg Tablet. ' },
  { match: /name:\s*"Asam Salisilat Powder",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Salisilat",$1notes: "Sediaan: Powder. ' },
  { match: /name:\s*"Asam Traneksamat 500 mg\/5 mL Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Traneksamat (Injeksi)",$1notes: "Sediaan: Injeksi 500 mg/5 mL. ' },
  { match: /name:\s*"Asam Traneksamat 500 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asam Traneksamat (Tablet)",$1notes: "Sediaan: 500 mg Tablet. ' },
  { match: /name:\s*"Ascardia \(Asetilsalisilat\) 80 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Ascardia (Asetilsalisilat)",$1notes: "Sediaan: 80 mg Tablet. ' },
  { match: /name:\s*"Asering 500 mL Infus",([\s\S]*?)notes:\s*"/g, replace: 'name: "Asering",$1notes: "Sediaan: Infus 500 mL. ' },
  { match: /name:\s*"Aspar-K \(Kalium Aspartat\) 300 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Aspar-K (Kalium Aspartat)",$1notes: "Sediaan: 300 mg Tablet. ' },
  { match: /name:\s*"Aspilets \(Asetilsalisilat\) 80 mg Tablet Kunyah",([\s\S]*?)notes:\s*"/g, replace: 'name: "Aspilets (Asetilsalisilat)",$1notes: "Sediaan: 80 mg Tablet Kunyah. ' },
  { match: /name:\s*"AstraZeneca COVID-19 Vaccine Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "AstraZeneca COVID-19 Vaccine",$1notes: "Sediaan: Injeksi. ' },
  { match: /name:\s*"Atapulgit 600 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Atapulgit",$1notes: "Sediaan: 600 mg Tablet. ' },
  { match: /name:\s*"Atorvastatin 10 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Atorvastatin",$1notes: "Sediaan: 10 mg Tablet. ' },
  { match: /name:\s*"Atracurium Besylate 25 mg\/2\.5 mL Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "Atracurium Besylate",$1notes: "Sediaan: Injeksi 25 mg/2.5 mL. ' },
  { match: /name:\s*"Atropin Sulfat 0\.25 mg\/mL Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "Atropin Sulfat",$1notes: "Sediaan: Injeksi 0.25 mg/mL. ' },
  { match: /name:\s*"Avamys \(Fluticasone Furoate\) Nasal Spray",([\s\S]*?)notes:\s*"/g, replace: 'name: "Avamys (Fluticasone Furoate)",$1notes: "Sediaan: Nasal Spray. ' },
  { match: /name:\s*"Avigan \(Favipiravir\) 200 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Avigan (Favipiravir)",$1notes: "Sediaan: 200 mg Tablet. ' },
  { match: /name:\s*"Azithromycin 500 mg Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Azithromycin (Tablet)",$1notes: "Sediaan: 500 mg Tablet. ' },
  { match: /name:\s*"Azithromycin 200 mg\/5 mL Sirup",([\s\S]*?)notes:\s*"/g, replace: 'name: "Azithromycin (Sirup)",$1notes: "Sediaan: 200 mg/5 mL Sirup. ' },
  { match: /name:\s*"Azitromisin 0\.5 g Injeksi",([\s\S]*?)notes:\s*"/g, replace: 'name: "Azitromisin (Injeksi)",$1notes: "Sediaan: 0.5 g Injeksi. ' }
];

for (const rep of regexList) {
  content = content.replace(rep.match, rep.replace);
}

fs.writeFileSync(file, content);
console.log("Replaced successfully");
