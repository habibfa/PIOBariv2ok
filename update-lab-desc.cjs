const fs = require('fs');
let code = fs.readFileSync('src/MedicalCalculators.tsx', 'utf8');

code = code.replace(
  'Evaluasi cepat nilai elektrolit, fungsi hati, dan fungsi ginjal.',
  'Evaluasi cepat nilai darah lengkap, elektrolit, profil lipid, gula darah, fungsi hati, dan fungsi ginjal.'
);

fs.writeFileSync('src/MedicalCalculators.tsx', code);
console.log("Updated description.");
