const fs = require('fs');
let code = fs.readFileSync('src/components/FloatingAIAssistant.tsx', 'utf8');

code = code.replace(
  "if (!response.ok) throw new Error('Network response was not ok');",
  "if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.error || 'Network response was not ok'); }"
);

code = code.replace(
  "content: 'Maaf, terjadi kesalahan saat menghubungi server AI. Silakan coba lagi.'",
  "content: 'Maaf, terjadi kesalahan: ' + (error.message || 'Gagal menghubungi server AI. Silakan coba lagi.')"
);

fs.writeFileSync('src/components/FloatingAIAssistant.tsx', code);
console.log("Updated UI error handling");
