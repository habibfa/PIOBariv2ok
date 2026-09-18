const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import FloatingAIAssistant')) {
  code = code.replace(
    'import { generateMedicalReportPDF } from "./pdfUtils";',
    'import { generateMedicalReportPDF } from "./pdfUtils";\nimport FloatingAIAssistant from "./components/FloatingAIAssistant";'
  );
  
  // Find where to inject the component. A good place is right before the final closing div/main tags.
  // The structure seems to end with something like:
  //         </footer>
  //       </div>
  //     </div>
  //   );
  
  // Let's inject it before the last </div>
  const lastDivIndex = code.lastIndexOf('</div>');
  if (lastDivIndex !== -1) {
    code = code.substring(0, lastDivIndex) + '  <FloatingAIAssistant />\n' + code.substring(lastDivIndex);
  }
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Injected FloatingAIAssistant into App.tsx");
} else {
  console.log("Already injected.");
}
