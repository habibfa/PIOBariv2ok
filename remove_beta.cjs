const fs = require('fs');
let content = fs.readFileSync('src/presets.ts', 'utf8');

content = content.replace(/\{\s*id: "beta_one"[\s\S]*?\},/g, '');
content = content.replace(/\{\s*id: "betaserc"[\s\S]*?\},/g, '');

fs.writeFileSync('src/presets.ts', content);
