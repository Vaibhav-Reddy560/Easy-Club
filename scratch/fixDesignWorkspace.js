const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Add native wheel listener
const importReactMarker = 'import React, { useRef, useState, useEffect } from "react";';
// It already has useEffect.

// Find the handleCanvasWheel and replace it
const wheelHandlerRegex = /const handleCanvasWheel = \(e: React\.WheelEvent\) => \{[\s\S]*?\};\n\n/m;
content = content.replace(wheelHandlerRegex, `
  // Use a native event listener in useEffect for wheel to properly prevent default pinch-zoom
  useEffect(() => {
    const canvas = canvasContainerRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent browser zoom/scroll
      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom
        const delta = -e.deltaY * 0.002;
        setZoom(prev => Math.min(2, Math.max(0.1, prev + delta)));
      } else {
        // Two-finger scroll = pan
        setPanX(prev => prev - e.deltaX);
        setPanY(prev => prev - e.deltaY);
      }
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
`);

// 2. Remove onWheel={handleCanvasWheel} from the render
content = content.replace(/onWheel=\{handleCanvasWheel\}/, '');

// 3. Update styling of the outer container
content = content.replace(
  /<div className="fixed inset-0 z-\[90\] bg-\[#181818\] flex flex-col select-none"/,
  `<div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex flex-col select-none"`
);

// Top toolbar
content = content.replace(
  /<div className="h-10 bg-\[#2C2C2C\] border-b border-\[#383838\] flex items-center justify-between px-3 shrink-0 z-\[92\]">/,
  `<div className="h-14 glass-panel border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-[92]">`
);

// Back Button & Header
content = content.replace(
  /<button\s+onClick=\{onClose\}\s+className="flex items-center gap-1\.5 text-\[11px\] text-\[#B0B0B0\] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white\/5"\s*>/m,
  `<button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl"
          >`
);

content = content.replace(
  /<span className="text-\[11px\] text-white font-medium truncate max-w-\[200px\]">\{activeEvent\.name\}<\/span>\n\s*<span className="text-\[10px\] text-\[#808080\]">— Design Studio<\/span>/m,
  `<span className="text-lg font-astronomus text-signature-gradient uppercase tracking-widest truncate max-w-[300px] ml-4">{activeEvent.name}</span>
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">/ Design Studio</span>`
);

// Left Panel
content = content.replace(
  /<div className="w-\[200px\] shrink-0 bg-\[#252525\] border-r border-\[#383838\] flex flex-col overflow-hidden z-\[91\]">/,
  `<div className="w-[240px] shrink-0 glass-panel !bg-neutral-900/40 border-r border-white/10 flex flex-col overflow-hidden z-[91]">`
);

// Right Panel
content = content.replace(
  /<div className="w-\[280px\] shrink-0 bg-\[#252525\] border-l border-\[#383838\] overflow-y-auto z-\[91\]">/,
  `<div className="w-[320px] shrink-0 glass-panel !bg-neutral-900/40 border-l border-white/10 overflow-y-auto z-[91] custom-scrollbar">`
);
content = content.replace(
  /<div className="p-3 border-b border-\[#383838\] flex items-center justify-between sticky top-0 bg-\[#252525\] z-10">/,
  `<div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-neutral-900/80 backdrop-blur-md z-10">`
);

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Replaced");
