const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// Replace border-gradient with the exact classes from the "Fee Based" button (black/dark-grey box with solid gold border)
content = content.replace(/border-gradient text-signature-gradient/g, 'bg-black shadow-[inset_0_0_10px_rgba(251,191,36,0.1)] border border-gold-500 text-signature-gradient');

// Fix any leftover text-gold-500 cases
content = content.replace(/border-gradient text-gold-500/g, 'bg-black shadow-[inset_0_0_10px_rgba(251,191,36,0.1)] border border-gold-500 text-gold-500');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Replaced custom border-gradient with exact Fee Based button styling");
