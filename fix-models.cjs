const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/gemini-3\.5-flash/g, 'gemini-2.5-flash');
code = code.replace(/gemini-3\.1-flash-lite/g, 'gemini-2.5-pro');
code = code.replace(/gemini-1\.5-flash/g, 'gemini-2.5-pro');

fs.writeFileSync('server.ts', code);
console.log("Replaced model names in server.ts");
