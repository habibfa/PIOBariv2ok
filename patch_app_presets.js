import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const stateBlock = `export default function App() {
  const [drugPresets, setDrugPresets] = useState(() => {
    const saved = localStorage.getItem("drugPresets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DRUG_PRESETS;
      }
    }
    return INITIAL_DRUG_PRESETS;
  });

  useEffect(() => {
    localStorage.setItem("drugPresets", JSON.stringify(drugPresets));
  }, [drugPresets]);
`;

code = code.replace("export default function App() {", stateBlock);
fs.writeFileSync('src/App.tsx', code);
