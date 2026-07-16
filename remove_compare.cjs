const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = content.indexOf('    ) : activeTab === "compare" ? (\n      <>\n        {/* COMPARE MODE: Right Column (Side-by-Side Regimen A & B) */}');
const endIndex = content.indexOf('    ) : activeTab === "ddi" ? (\n      <>\n        {/* DDI MULTI-DRUG SCREENING TAB */}');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content, 'utf-8');
  console.log("Successfully removed compare block");
} else {
  console.log("Failed to find start or end index");
}
