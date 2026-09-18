const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  "VitePWA({",
  "VitePWA({\n        workbox: {\n          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10MB\n        },"
);
fs.writeFileSync('vite.config.ts', code);
console.log("Updated vite PWA config");
