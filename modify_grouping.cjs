const fs = require('fs');

let content = fs.readFileSync('src/FornasDrugs.tsx', 'utf-8');

// Insert ExpandableText component after interface FornasDrugsProps
const expandableComponent = `

const ExpandableText = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text === "-") return <span>-</span>;
  if (text.length <= maxLength) return <span>{text}</span>;

  return (
    <div>
      <span>{isExpanded ? text : \`\${text.substring(0, maxLength)}...\`}</span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-emerald-600 font-medium ml-1 hover:underline focus:outline-none"
      >
        {isExpanded ? "Tutup" : "Selengkapnya"}
      </button>
    </div>
  );
};
`;

content = content.replace(/(interface FornasDrugsProps \{\s*isAdmin\?: boolean;\s*\})/, '$1\n' + expandableComponent);

// Change grouping logic
content = content.replace(/const key = drug\.namaObat;/g, 'const key = `${drug.kelasTerapi}|${drug.namaObat}`;');

// Change expandedGroups toggle logic in FornasDrugsProps component
content = content.replace(/const toggleGroup = \(namaObat: string\) => \{/g, 'const toggleGroup = (key: string) => {');
content = content.replace(/\[namaObat\]: !prev\[namaObat\]/g, '[key]: !prev[key]');

// Change expandedGroups usage in rendering
content = content.replace(/const isExpanded = expandedGroups\[drug\.namaObat\];/g, 'const groupKey = `${drug.kelasTerapi}|${drug.namaObat}`;\n                  const isExpanded = expandedGroups[groupKey];');
content = content.replace(/<React\.Fragment key=\{drug\.namaObat\}>/g, '<React.Fragment key={groupKey}>');
content = content.replace(/onClick=\{\(\) => toggleGroup\(drug\.namaObat\)\}/g, 'onClick={() => toggleGroup(groupKey)}');
content = content.replace(/<div key=\{\`mob-\$\{drug\.namaObat\}\`\}/g, '<div key={`mob-${groupKey}`}');

// Replace {drug.restriksi} with <ExpandableText text={drug.restriksi} />
content = content.replace(/\{hasMultiple && !isExpanded \? "-" : drug\.restriksi\}/g, '{hasMultiple && !isExpanded ? "-" : <ExpandableText text={drug.restriksi} />}');
content = content.replace(/\{drug\.restriksi\}/g, '<ExpandableText text={drug.restriksi} />');

// Replace {drug.catatan !== "-" ? drug.catatan : ""} with <ExpandableText text={drug.catatan} />
content = content.replace(/\{hasMultiple && !isExpanded \? "-" : \(drug\.catatan !== "-" \? drug\.catatan : ""\)\}/g, '{hasMultiple && !isExpanded ? "-" : (drug.catatan !== "-" ? <ExpandableText text={drug.catatan} /> : "")}');
// Mobile view uses {drug.catatan} inside a div, so:
content = content.replace(/\{drug\.catatan\}/g, '<ExpandableText text={drug.catatan} />');

fs.writeFileSync('src/FornasDrugs.tsx', content);
