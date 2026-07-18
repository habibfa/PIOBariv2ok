const fs = require('fs');

let content = fs.readFileSync('src/FornasDrugs.tsx', 'utf-8');

// Fix broken replace
content = content.replace(/<ExpandableText text=<ExpandableText text=\{drug\.catatan\} \/> \/>/g, '<ExpandableText text={drug.catatan} />');

// In mobile view subDrug map
content = content.replace(/\{subDrug\.restriksi\}/g, '<ExpandableText text={subDrug.restriksi} />');
content = content.replace(/\{subDrug\.catatan\}/g, '<ExpandableText text={subDrug.catatan} />');

// Also check desktop subDrug map:
// {subDrug.restriksi !== "-" ? subDrug.restriksi : ""} -> <ExpandableText text={subDrug.restriksi} />
content = content.replace(/\{subDrug\.restriksi !== "-" \? <ExpandableText text=\{subDrug\.restriksi\} \/> : ""\}/g, '{subDrug.restriksi !== "-" ? <ExpandableText text={subDrug.restriksi} /> : ""}');
content = content.replace(/\{subDrug\.restriksi !== "-" \? subDrug\.restriksi : ""\}/g, '{subDrug.restriksi !== "-" ? <ExpandableText text={subDrug.restriksi} /> : ""}');

// {subDrug.catatan !== "-" ? subDrug.catatan : ""} -> <ExpandableText text={subDrug.catatan} />
content = content.replace(/\{subDrug\.catatan !== "-" \? subDrug\.catatan : ""\}/g, '{subDrug.catatan !== "-" ? <ExpandableText text={subDrug.catatan} /> : ""}');


fs.writeFileSync('src/FornasDrugs.tsx', content);
