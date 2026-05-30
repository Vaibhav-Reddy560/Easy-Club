const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Revert container rounding and glass-panels
content = content.replace(
  /<div className="fixed inset-0 z-\[90\] bg-black\/95 backdrop-blur-2xl flex flex-col select-none".*?>/,
  `<div className="fixed inset-0 z-[90] bg-[#050505] flex flex-col select-none" style={{ fontFamily: 'var(--font-destrubia), system-ui, sans-serif' }}>`
);

content = content.replace(
  /<div className="h-14 glass-panel border-b border-white\/10 flex items-center justify-between px-6 shrink-0 z-\[92\]">/,
  `<div className="h-14 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-[92]">`
);

// 2. Change Left/Right Panels from glass-panel to sharp flat dark panels
content = content.replace(
  /<div className="w-\[240px\] shrink-0 glass-panel !bg-neutral-900\/40 border-r border-white\/10 flex flex-col overflow-hidden z-\[91\]">/,
  `<div className="w-[240px] shrink-0 bg-[#0A0A0A] border-r border-white/10 flex flex-col overflow-hidden z-[91]">`
);

content = content.replace(
  /<div className="w-\[320px\] shrink-0 glass-panel !bg-neutral-900\/40 border-l border-white\/10 overflow-y-auto z-\[91\] custom-scrollbar">/,
  `<div className="w-[320px] shrink-0 bg-[#0A0A0A] border-l border-white/10 overflow-y-auto z-[91] custom-scrollbar">`
);

content = content.replace(
  /<div className="p-4 border-b border-white\/10 flex items-center justify-between sticky top-0 bg-neutral-900\/80 backdrop-blur-md z-10">/,
  `<div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0A0A0A] z-10">`
);

// 3. Replace all #0d99ff (Figma blue) or #0D99FF with gold variants
// We use regex to replace all instances of Figma blue with Gold
content = content.replace(/#0D99FF/g, '#FBBF24');
content = content.replace(/#0d99ff/g, '#FBBF24');
content = content.replace(/#0B85E0/g, '#F59E0B'); // darker blue to darker gold

// 4. Update the "Back" button to match Destrubia + Gold
content = content.replace(
  /<span className="text-lg font-astronomus text-signature-gradient uppercase tracking-widest truncate max-w-\[300px\] ml-4">\{activeEvent\.name\}<\/span>/,
  `<span className="text-xl font-destrubia text-signature-gradient uppercase tracking-widest truncate max-w-[300px] ml-4">{activeEvent.name}</span>`
);

content = content.replace(
  /font-astronomus/g,
  `font-destrubia`
);

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Reverted to flat layout with Gold/Destrubia vibe.");
