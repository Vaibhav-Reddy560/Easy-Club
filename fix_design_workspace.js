const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Fix the golden classes (remove brackets around gold-*)
content = content.replace(/\[gold-(\d+)\]/g, 'gold-$1');

// 2. Fix the $1 bug in right panel headers
// Previously I replaced <label className="text-[11px] font-bold mb-3 block">
// And I used $1, which literally put $1.
// Let's replace `$1` with nothing in those labels.
content = content.replace(/<label className="text-\[11px\] font-bold mb-3 flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" \/>\$1(.*?)<\/label>/g, '<label className="text-[11px] font-bold mb-3 flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />$1</label>');
content = content.replace(/<label className="text-\[11px\] font-bold flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" \/>\$1(.*?)<\/label>/g, '<label className="text-[11px] font-bold flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />$1</label>');

// Wait, the previous script did:
// content.replace(/<label className="text-\[11px\] font-bold mb-3 block">/g, '<label className="text-[11px] font-bold mb-3 flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-[gold-400] to-[gold-600]" />$1');
// This means it completely replaced the closing chevron ">" and left the label text intact but prepended "$1" to it.
// e.g. `<label ...>$1Position</label>`.
// So we just need to replace `/>$1` with `/>`
content = content.replace(/\/>\$1/g, '/>');

// 3. Move the Vibe Director from Left Panel to Right Panel.
// Let's extract the Vibe Director block.
const vibeDirectorStart = `          {/* AI Vibe Controls */}`;
const vibeDirectorEnd = `          {/* Generation Progress */}`;
const vibeIdxStart = content.indexOf(vibeDirectorStart);
const vibeIdxEnd = content.indexOf(vibeDirectorEnd);

if (vibeIdxStart !== -1 && vibeIdxEnd !== -1) {
  const vibeControlsCode = content.substring(vibeIdxStart, vibeIdxEnd);
  // Remove from left panel
  content = content.substring(0, vibeIdxStart) + content.substring(vibeIdxEnd);
  
  // Insert into Right Panel. We can place it at the top of the right panel, just below the header.
  const rightPanelHeader = `          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/60 z-10 text-[11px] font-medium">
            <span className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-zinc-500" />
              {selectedLayer ? selectedLayer.charAt(0).toUpperCase() + selectedLayer.slice(1) : "Properties"}
            </span>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-white/10 rounded"><LayoutGrid className="w-3.5 h-3.5 text-zinc-400" /></button>
              <button className="p-1 hover:bg-white/10 rounded"><ChevronDown className="w-3.5 h-3.5 text-zinc-400" /></button>
            </div>
          </div>`;
          
  const rightPanelHeaderIdx = content.indexOf(rightPanelHeader);
  if (rightPanelHeaderIdx !== -1) {
    const insertIdx = rightPanelHeaderIdx + rightPanelHeader.length;
    // Tweak Vibe Director style to fit Right Panel better
    let updatedVibeControls = vibeControlsCode.replace('bg-black/20', '');
    updatedVibeControls = updatedVibeControls.replace('border-t border-white/10', 'border-b border-white/5');
    
    content = content.substring(0, insertIdx) + '\n\n' + updatedVibeControls + content.substring(insertIdx);
  }
}

// Ensure shadow glow for left sidebar uses valid tailwind classes, not arbitrary values if it's too complex.
// Actually, `shadow-[0_0_15px_rgba(212,175,55,0.2)]` is valid arbitrary syntax! So we can leave it.
// Wait, the main app sidebar uses `shadow-gold-glow` from tailwind config!
content = content.replace(/shadow-\[0_0_15px_rgba\(212,175,55,0\.2\)\]/g, 'shadow-gold-glow');

// Same for artboards outline glow
content = content.replace(/shadow-\[0_0_30px_rgba\(212,175,55,0\.15\)\]/g, 'shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-gold-500');
content = content.replace(/ring-2 ring-\[gold-500\]/g, 'ring-2 ring-gold-500');
content = content.replace(/ring-\[gold-500\]/g, 'ring-gold-500');

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log('Update script completed.');
