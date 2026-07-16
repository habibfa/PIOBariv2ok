const fs = require('fs');
let content = fs.readFileSync('src/presets.ts', 'utf8');

content = content.replace(/name: "Becom-C \(Vitamin B Kompleks\)",/, 'name: "Becom-C",');
content = content.replace(/name: "Becom-Zet \(Multivitamin\)",/, 'name: "Becom-zet",');

content = content.replace(/name: "Borraginol-S \(Antihemoroid\)",/, 'name: "Borraginol S (Antihemoroid)",');
content = content.replace(/name: "Borraginol-N \(Antihemoroid \+ Steroid\)",/, 'name: "Borraginol N (Antihemoroid)",');

// Double check Bedak Salisil is Bedak Salisil
content = content.replace(/name: "Bedak Salisil \(Asam Salisilat\)",/, 'name: "Bedak Salisil",');

fs.writeFileSync('src/presets.ts', content);
