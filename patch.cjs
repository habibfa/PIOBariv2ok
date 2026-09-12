const fs = require('fs');
let code = fs.readFileSync('src/PharmacistConsultation.tsx', 'utf8');
code = code.replace(
  "if (initial && (p.name !== initial.name || p.imageUrl !== initial.imageUrl || p.str !== initial.str || p.sipa !== initial.sipa || p.specialty !== initial.specialty)) {",
  "if (initial && (p.name !== initial.name || p.imageUrl !== initial.imageUrl || p.str !== initial.str || p.sipa !== initial.sipa || p.specialty !== initial.specialty || p.sipaValidity !== initial.sipaValidity || p.strValidity !== initial.strValidity || p.schedule !== initial.schedule || p.room !== initial.room)) {"
);
fs.writeFileSync('src/PharmacistConsultation.tsx', code);
