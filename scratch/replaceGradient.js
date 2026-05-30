const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// Replace active state classes
content = content.replace(/bg-signature-gradient text-black text-white border-\[#FBBF24\]/g, 'border-gradient text-signature-gradient');
content = content.replace(/bg-signature-gradient text-black text-white/g, 'border-gradient text-signature-gradient');
content = content.replace(/bg-signature-gradient text-black/g, 'border-gradient text-signature-gradient');

// Fix border-gradient overlapping with existing border styles in some cases
content = content.replace(/border-gradient text-signature-gradient border-\[#FBBF24\]/g, 'border-gradient text-signature-gradient');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Replaced gradient fills with gradient strokes");
