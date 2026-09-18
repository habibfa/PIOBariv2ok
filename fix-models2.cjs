const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace everything back to 3.5-flash and 3.1-flash-lite
code = code.replace(/gemini-2\.5-flash/g, 'gemini-3.5-flash');
code = code.replace(/gemini-2\.5-pro/g, 'gemini-3.1-flash-lite');
code = code.replace(/gemini-1\.5-flash/g, 'gemini-3.1-flash-lite');

fs.writeFileSync('server.ts', code);
console.log("Reverted model names in server.ts");
