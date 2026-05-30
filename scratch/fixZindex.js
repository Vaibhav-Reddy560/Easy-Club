const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// Fix z-index to cover the Sidebar (which is z-[100])
content = content.replace(/z-\[90\]/g, 'z-[200]');
content = content.replace(/z-\[91\]/g, 'z-[201]');
content = content.replace(/z-\[92\]/g, 'z-[202]');

// Replace flat Gold with the app's signature gradient
// For backgrounds (like active Artboard, "Render Canvas" button)
content = content.replace(/bg-\[#FBBF24\]/g, 'bg-signature-gradient text-black');

// For text colors (like hover states or active states)
content = content.replace(/text-\[#FBBF24\]/g, 'text-signature-gradient');

// The "Back" button text color
content = content.replace(/text-\[#F59E0B\]/g, 'text-gold-500');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Fixed z-index and colors");
