const fs = require('fs');
const file = 'src/presets.ts';
let content = fs.readFileSync(file, 'utf8');

const regexList = [
  { match: /name:\s*"Ambroksol \(Ambroxol\) Sirup - Anak",([\s\S]*?)notes:\s*"/g, replace: 'name: "Ambroksol (Ambroxol)",$1notes: "Sediaan: Sirup (15 mg/5 mL, 30 mg/5 mL) & Tablet (30 mg). ' },
  { match: /name:\s*"Ambroksol \(Ambroxol\) Tablet",([\s\S]*?)notes:\s*"/g, replace: 'name: "Ambroksol (Ambroxol)",$1notes: "Sediaan: Sirup (15 mg/5 mL, 30 mg/5 mL) & Tablet (30 mg). ' }
];

for (const rep of regexList) {
  content = content.replace(rep.match, rep.replace);
}

// Ensure no duplicates exist if both were present.
// Actually, it's easier to manually replace the array or just delete the tablet one.
// Let's just find "Ambroksol (Ambroxol) Tablet" preset and delete it.
const blockRegex = /\s*\{\s*id:\s*"ambroxol_adult"[\s\S]*?\},/g;
content = content.replace(blockRegex, '');

fs.writeFileSync(file, content);
console.log("Ambroxol merged successfully");
