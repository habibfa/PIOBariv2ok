const fs = require('fs');
let code = fs.readFileSync('src/MedicalCalculators.tsx', 'utf8');

// 1. Add ReferenceFooter component at the top inside MedicalCalculators component
const footerComponent = `  const ReferenceFooter = ({ references }: { references: string[] }) => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <h4 className="text-xs font-bold text-slate-500 mb-2">Referensi & Pustaka:</h4>
      <ul className="text-[10px] text-slate-400 list-disc pl-4 space-y-1">
        {references.map((ref, idx) => (
          <li key={idx}>{ref}</li>
        ))}
      </ul>
    </div>
  );\n\n`;

if (!code.includes("ReferenceFooter")) {
  code = code.replace(/const \[activeCalc, setActiveCalc\] = useState<CalculatorType \| null>\(null\);\n/, `const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);\n\n${footerComponent}`);
}

const refs = {
  renderEgfrCalculator: `["Inker LA, Schmid CH, Tighiouart H, et al. Estimating glomerular filtration rate from serum creatinine and cystatin C. N Engl J Med. 2012;367(1):20-29. (CKD-EPI 2021 update)"]`,
  renderLabCalculator: `["Fauci AS, et al. Harrison's Principles of Internal Medicine. 20th ed. McGraw-Hill Education; 2018.", "Kratz A, Ferraro M, Sluss PM, Lewandrowski KB. Case records of the Massachusetts General Hospital. Normal reference laboratory values. N Engl J Med. 2004;351(15):1548-1563."]`,
  renderBMICalculator: `["World Health Organization (WHO). Obesity: preventing and managing the global epidemic. Report of a WHO consultation. World Health Organ Tech Rep Ser. 2000;894:i-xii, 1-253.", "Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655. (IBW formula)"]`,
  renderCrClCalculator: `["Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41."]`,
  renderBSACalculator: `["Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098."]`,
  renderGCSCalculator: `["Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84."]`,
  renderApgarCalculator: `["Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.", "American Academy of Pediatrics, Committee on Fetus and Newborn; American College of Obstetricians and Gynecologists and Committee on Obstetric Practice. The Apgar Score. Pediatrics. 2015;136(4):819-822."]`,
  renderCha2ds2vasc: `["Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137(2):263-272."]`,
  renderPediatricDoseCalculator: `["Taketomo CK, Hodding JH, Kraus DM. Pediatric & Neonatal Dosage Handbook. 26th ed. Lexicomp; 2019-2020.", "Kliegman RM, St. Geme JW, Blum NJ, Shah SS, Tasker RC, Wilson KM. Nelson Textbook of Pediatrics. 21st ed. Elsevier; 2020."]`,
  renderChemoCalculator: `["Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal clearance. J Clin Oncol. 1989;7(11):1748-1756.", "NCCN Clinical Practice Guidelines in Oncology (NCCN Guidelines®)"]`
};

Object.keys(refs).forEach(funcName => {
  const funcStart = code.indexOf('const ' + funcName);
  if (funcStart !== -1 && !code.substring(funcStart, funcStart + 2000).includes("ReferenceFooter references")) {
    const nextFuncStart = code.indexOf('const render', funcStart + 10);
    let searchEnd = nextFuncStart !== -1 ? nextFuncStart : code.length;
    
    // Find the end of the return statement
    // We look for the last "</div>" before searchEnd, which is usually right before "); };"
    
    // Let's find "  };" or "    );  };" to be safe.
    let endIdx = code.lastIndexOf("    );", searchEnd);
    if (endIdx === -1) {
      endIdx = code.lastIndexOf("</div>", searchEnd);
    }
    
    if (endIdx !== -1) {
      // Find the last </div> before the endIdx
      let divEndIdx = code.lastIndexOf("</div>", endIdx);
      if (divEndIdx !== -1) {
         let before = code.substring(0, divEndIdx);
         let after = code.substring(divEndIdx);
         
         let insert = `\n        <ReferenceFooter references={${refs[funcName]}} />\n      `;
         code = before + insert + after;
      }
    }
  }
});

fs.writeFileSync('src/MedicalCalculators.tsx', code);
