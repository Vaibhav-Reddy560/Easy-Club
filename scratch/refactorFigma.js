const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Remove BorderBeam
content = content.replace(/<BorderBeam [^>]+ \/>/g, '');

// 2. Tab Navigation
content = content.replace(/bg-black\/60 rounded-2xl border border-white\/5 overflow-x-auto scrollbar-none/g, 
  'bg-[#2C2C2C] border-b border-[#383838] overflow-x-auto scrollbar-none rounded-none');
content = content.replace(/px-5 py-3 rounded-xl text-\[10px\] font-black uppercase tracking-widest/g, 
  'px-4 py-2 rounded-md text-[11px] font-medium');
content = content.replace(/shadow-lg shadow-gold-500\/10/g, '');

// 3. Left Panel (Layers)
content = content.replace(/glass-panel rounded-\[2rem\] p-4 space-y-2/g, 
  'bg-[#1E1E1E] rounded-md p-2 space-y-1 border border-[#383838]');
content = content.replace(/text-\[10px\] font-bold text-zinc-400 uppercase tracking-widest/g, 
  'text-[11px] font-medium text-[#A0A0A0]');
content = content.replace(/w-full text-left px-4 py-2\.5 rounded-xl text-\[10px\] font-bold uppercase tracking-widest transition-all flex items-center justify-between/g, 
  'w-full text-left px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors flex items-center justify-between');

// 4. Generate Button
content = content.replace(/py-4 bg-gradient-to-r from-\[#0d99ff\] to-blue-500 text-white rounded-2xl text-\[10px\] font-black uppercase tracking-\[0\.2em\] shadow-xl hover:scale-\[1\.02\] active:scale-\[0\.98\]/g, 
  'py-2 bg-[#0D99FF] text-white rounded-md text-[11px] font-medium hover:bg-[#0B85E0]');

// 5. Center Canvas container
content = content.replace(/flex-1 min-w-0 h-full flex flex-col items-center justify-center bg-\[#0a0a0a\] rounded-\[2rem\] border border-white\/5 relative overflow-hidden py-12 px-8 shadow-inner group/g, 
  'flex-1 min-w-0 h-full flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden py-6 lg:py-12 px-4 lg:px-8 border border-[#383838] rounded-md');
content = content.replace(/absolute top-6 left-6/g, 'absolute top-4 left-4');
content = content.replace(/text-\[10px\] text-zinc-500 font-bold uppercase tracking-widest/g, 
  'text-[11px] text-[#808080] font-medium');

// 6. Right Properties Panel
content = content.replace(/glass-panel rounded-\[2rem\] p-6 space-y-4/g, 
  'bg-[#1E1E1E] border border-[#383838] rounded-md p-4 space-y-3');
content = content.replace(/glass-panel rounded-\[2rem\] p-4 flex/g, 
  'bg-[#1E1E1E] border border-[#383838] rounded-md p-3 flex');
content = content.replace(/text-\[10px\] text-signature-gradient font-bold uppercase tracking-widest/g, 
  'text-[11px] text-[#E0E0E0] font-medium');
content = content.replace(/text-\[9px\] text-signature-gradient font-bold uppercase tracking-widest/g, 
  'text-[11px] text-[#E0E0E0] font-medium');
content = content.replace(/text-\[9px\] font-bold uppercase tracking-widest/g, 
  'text-[11px] font-medium');
content = content.replace(/text-\[10px\] font-bold uppercase tracking-widest/g, 
  'text-[11px] font-medium');
content = content.replace(/text-\[12px\] font-black uppercase tracking-widest/g, 
  'text-[12px] font-medium');
content = content.replace(/text-\[8px\] text-zinc-400 uppercase tracking-widest/g, 
  'text-[11px] text-[#A0A0A0] font-medium');

// 7. Remove random shadows
content = content.replace(/shadow-xl/g, '');
content = content.replace(/shadow-2xl/g, '');
content = content.replace(/backdrop-blur-xl/g, '');
content = content.replace(/backdrop-blur-md/g, '');

// 8. Buttons & Inputs in properties
content = content.replace(/bg-black\/40 border border-white\/5 hover:border-white\/10 rounded-xl px-4 py-3/g, 
  'bg-[#2C2C2C] border border-[#383838] hover:border-[#555] rounded-md px-3 py-1.5');
content = content.replace(/rounded-xl/g, 'rounded-md');
content = content.replace(/rounded-2xl/g, 'rounded-md');
content = content.replace(/bg-black border border-white\/10/g, 'bg-[#121212] border border-[#383838]');

// 9. Selected pills (e.g. "BACKGROUND")
content = content.replace(/text-black font-black uppercase tracking-widest bg-gold-500 px-3 py-1 rounded-full/g, 
  'text-white font-medium bg-[#383838] px-2 py-0.5 rounded-sm text-[11px]');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Refactor applied.");
