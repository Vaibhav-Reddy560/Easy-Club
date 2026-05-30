const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Update ARTBOARD_POSITIONS and FORMATS
const newConstants = `
const FORMATS: FormatSpec[] = [
  { id: "a3-poster", label: "A3 Poster", dim: "3508×4961", width: 3508, height: 4961, icon: LucideImage, previewH: 800 },
  { id: "ig-poster", label: "Instagram Poster", dim: "1080×1350", width: 1080, height: 1350, icon: LucideImage, previewH: 675 },
  { id: "wa-poster", label: "WhatsApp Poster", dim: "1080×1080", width: 1080, height: 1080, icon: LucideImage, previewH: 540 },
  { id: "banner", label: "Banner", dim: "8×10 ft", width: 2400, height: 3000, icon: Layout, previewH: 400 },
  { id: "standee", label: "Standee", dim: "3×5 ft", width: 900, height: 1500, icon: Columns2, previewH: 500 },
  { id: "forms-header", label: "Forms Header", dim: "1600×400", width: 1600, height: 400, icon: FileText, previewH: 200 },
  { id: "certificate", label: "Certificates", dim: "Canva", width: 0, height: 0, icon: Award, previewH: 0 },
];

const ARTBOARD_POSITIONS = {
  "a3-poster": { x: 100, y: 100, w: 700, h: 990 }, // Scale down A3 visually
  "ig-poster": { x: 900, y: 100, w: 540, h: 675 },
  "wa-poster": { x: 1540, y: 100, w: 540, h: 540 },
  "banner": { x: 100, y: 1200, w: 1200, h: 1500 },
  "standee": { x: 1400, y: 1200, w: 450, h: 750 },
  "forms-header": { x: 1950, y: 1200, w: 800, h: 200 },
  "certificate": { x: 2850, y: 1200, w: 600, h: 400 }
};
`;

content = content.replace(/const FORMATS: FormatSpec\[\] = \[[\s\S]*?certificate: \{ x: 1000, y: 1800, w: 1123, h: 794 \}\n\};\n/, newConstants.trim() + '\n\n');

// 2. Add layer icons mapping
const layerIconsMap = `
const LAYER_ICONS: Record<Layer, React.ElementType> = {
  header: LayoutTemplate,
  title: Type,
  tagline: Quote,
  details: List,
  tags: Tag,
  footer: PanelBottom,
  background: LucideImage
};
`;
content = content.replace('type Layer = "header" | "title" | "tagline" | "details" | "tags" | "footer" | "background";', 'type Layer = "header" | "title" | "tagline" | "details" | "tags" | "footer" | "background";\n' + layerIconsMap);

// 3. Fix left sidebar styling (glowing border) and icons
const layersOld = `{(["header", "title", "tagline", "details", "tags", "footer", "background"] as Layer[]).map(layer => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={\`w-full text-left px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors flex items-center justify-between \${selectedLayer === layer ? 'bg-[gold-500] text-white' : 'text-zinc-300 hover:bg-white/5 border border-transparent transition-all duration-300'}\`}
              >
                {layer}
                {selectedLayer === layer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}`;

const layersNew = `{(["header", "title", "tagline", "details", "tags", "footer", "background"] as Layer[]).map(layer => {
              const Icon = LAYER_ICONS[layer];
              return (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  className={\`w-full text-left px-2 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden \${selectedLayer === layer ? 'bg-gradient-to-r from-[gold-500]/20 to-[gold-600]/10 border border-[gold-500]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] text-[gold-500]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}\`}
                >
                  <Icon className={\`w-3.5 h-3.5 \${selectedLayer === layer ? 'text-[gold-500]' : 'text-zinc-500 group-hover:text-white'}\`} />
                  <span className="capitalize">{layer}</span>
                  {selectedLayer === layer && <div className="absolute inset-0 rounded-lg border border-[gold-500]/20 pointer-events-none" />}
                </button>
              );
            })}`;
content = content.replace(layersOld, layersNew);

const artboardsOld = `{FORMATS.filter(f => f.id !== "certificate").map(f => (
              <button
                key={f.id}
                onClick={() => { setSelectedArtboard(f.id); setActiveTab(f.id); }}
                className={\`w-full text-left px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors flex items-center gap-2 \${selectedArtboard === f.id ? 'bg-[gold-500] text-white' : 'text-zinc-300 hover:bg-white/5 border border-transparent transition-all duration-300'}\`}
              >
                <f.icon className="w-3 h-3" />
                {f.label}
                <span className="ml-auto text-[9px] text-zinc-500">{f.dim}</span>
              </button>
            ))}`;

const artboardsNew = `{FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  if (f.id === "certificate") {
                     window.open(getCertificateUrl(config.subType), '_blank');
                  } else {
                     setSelectedArtboard(f.id); setActiveTab(f.id);
                  }
                }}
                className={\`w-full text-left px-2 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden \${selectedArtboard === f.id ? 'bg-gradient-to-r from-[gold-500]/20 to-[gold-600]/10 border border-[gold-500]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)] text-[gold-500]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}\`}
              >
                <f.icon className={\`w-3.5 h-3.5 \${selectedArtboard === f.id ? 'text-[gold-500]' : 'text-zinc-500 group-hover:text-white'}\`} />
                {f.label}
                <span className="ml-auto text-[9px] opacity-50">{f.dim}</span>
                {selectedArtboard === f.id && <div className="absolute inset-0 rounded-lg border border-[gold-500]/20 pointer-events-none" />}
              </button>
            ))}`;
content = content.replace(artboardsOld, artboardsNew);


// 4. Update the actual canvas layout rendering to include A3, IG, WhatsApp, Banner, Standee, Forms, Cert
// First, find the POSTER block and duplicate it for A3, IG, WA.
// Actually, it's easier to dynamically render all formats EXCEPT certificate, using a map. Or we can hardcode them like they were.
// Let's hardcode for simplicity of keeping the custom SVG inside each.

const oldCanvasRender = `            {/* ─── POSTER ARTBOARD ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS.poster.x, top: ARTBOARD_POSITIONS.poster.y }}
              onClick={() => { setSelectedArtboard("poster"); setActiveTab("poster"); }}
            >
              {/* Artboard Label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">Poster</span>
                <span className="text-[9px] text-[#555]">{posterDim.dim}</span>
              </div>
              {/* Artboard Frame */}
              <div
                className={\`relative transition-shadow duration-200 \${selectedArtboard === "poster" ? "ring-2 ring-[gold-500]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS.poster.w, height: ARTBOARD_POSITIONS.poster.h }}
              >
                <div
                  ref={posterRef}
                  className="relative w-full h-full overflow-hidden bg-black"
                >
                  {/* Background canvas */}`;

const newCanvasRender = `            {/* ─── A3 POSTER ARTBOARD (Main Editor) ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS["a3-poster"].x, top: ARTBOARD_POSITIONS["a3-poster"].y }}
              onClick={() => { setSelectedArtboard("a3-poster"); setActiveTab("a3-poster"); }}
            >
              {/* Artboard Label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">A3 Poster</span>
                <span className="text-[9px] text-[#555]">3508×4961</span>
              </div>
              {/* Artboard Frame */}
              <div
                className={\`relative transition-shadow duration-200 \${selectedArtboard === "a3-poster" ? "ring-2 ring-[gold-500] shadow-[0_0_30px_rgba(212,175,55,0.15)]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS["a3-poster"].w, height: ARTBOARD_POSITIONS["a3-poster"].h }}
              >
                <div
                  ref={posterRef}
                  className="relative w-full h-full overflow-hidden bg-black"
                >
                  {/* Background canvas */}`;

content = content.replace(oldCanvasRender, newCanvasRender);
// Also need to fix the export dimension logic, but they are hardcoded anyway. We'll leave it for now.

// Wait, the other two posters (IG, WhatsApp) need to be drawn too.
// I will just add them where Banner was.
const oldBannerStandeeEtc = `            {/* ─── BANNER ARTBOARD ────────────────────────────── */}`;

const igWhatsAppPosters = `            {/* ─── IG POSTER ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS["ig-poster"].x, top: ARTBOARD_POSITIONS["ig-poster"].y }}
              onClick={() => { setSelectedArtboard("ig-poster"); setActiveTab("ig-poster"); }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-zinc-500 font-medium">Instagram</span>
                <span className="text-[9px] text-[#555] ml-2">1080×1350</span>
              </div>
              <div className={\`relative bg-black flex items-center justify-center transition-shadow duration-200 \${selectedArtboard === "ig-poster" ? "ring-2 ring-[gold-500] shadow-[0_0_30px_rgba(212,175,55,0.15)]" : "ring-1 ring-[#383838]"}\`} style={{ width: ARTBOARD_POSITIONS["ig-poster"].w, height: ARTBOARD_POSITIONS["ig-poster"].h }}>
                <div className="text-center p-4 opacity-50"><LucideImage className="w-8 h-8 mx-auto mb-2" /><p className="text-[10px]">IG Scale Preview</p></div>
              </div>
            </div>

            {/* ─── WA POSTER ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS["wa-poster"].x, top: ARTBOARD_POSITIONS["wa-poster"].y }}
              onClick={() => { setSelectedArtboard("wa-poster"); setActiveTab("wa-poster"); }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-zinc-500 font-medium">WhatsApp</span>
                <span className="text-[9px] text-[#555] ml-2">1080×1080</span>
              </div>
              <div className={\`relative bg-black flex items-center justify-center transition-shadow duration-200 \${selectedArtboard === "wa-poster" ? "ring-2 ring-[gold-500] shadow-[0_0_30px_rgba(212,175,55,0.15)]" : "ring-1 ring-[#383838]"}\`} style={{ width: ARTBOARD_POSITIONS["wa-poster"].w, height: ARTBOARD_POSITIONS["wa-poster"].h }}>
                <div className="text-center p-4 opacity-50"><LucideImage className="w-8 h-8 mx-auto mb-2" /><p className="text-[10px]">WA Square Preview</p></div>
              </div>
            </div>

            {/* ─── BANNER ARTBOARD ────────────────────────────── */}`;

content = content.replace(oldBannerStandeeEtc, igWhatsAppPosters);

// Replace selectedArtboard === "poster" with selectedArtboard === "a3-poster" everywhere
content = content.replace(/selectedArtboard === "poster"/g, 'selectedArtboard === "a3-poster"');
content = content.replace(/activeTab === "poster"/g, 'activeTab === "a3-poster"');

// Fix selectedArtboard glow for banner, standee, forms-header
content = content.replace(/ring-2 ring-\[gold-500\]/g, 'ring-2 ring-[gold-500] shadow-[0_0_30px_rgba(212,175,55,0.15)]');


// 5. Re-add Vibe Controls to Left Sidebar
const newVibeControls = `
          {/* AI Vibe Controls */}
          <div className="p-3 border-t border-white/10 bg-black/20">
            <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Vibe Director
            </h3>
            
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-[10px]">
                 <span className="text-zinc-400">Override AI Vibe</span>
                 <button 
                   onClick={() => setUseOverride(!useOverride)}
                   className={\`w-6 h-3 rounded-full relative transition-colors \${useOverride ? 'bg-[gold-500]' : 'bg-white/10'}\`}
                 >
                   <div className={\`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform \${useOverride ? 'translate-x-3' : 'translate-x-0'}\`} />
                 </button>
              </div>
              
              {useOverride && (
                <textarea
                  value={overridePrompt}
                  onChange={(e) => setOverridePrompt(e.target.value)}
                  placeholder="Describe the background image you want..."
                  className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-[10px] text-white resize-none h-16 outline-none focus:border-[gold-500]/50"
                />
              )}
              
              <button
                onClick={handleGenerateImage}
                disabled={imageGen.status === "generating"}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-medium transition-colors text-white mt-1"
              >
                Regenerate Canvas
              </button>
            </div>
          </div>
`;
// Insert before: {/* Generation Progress */}
content = content.replace('{/* Generation Progress */}', newVibeControls + '\n          {/* Generation Progress */}');

// Ensure useOverride and overridePrompt exist in state
if (!content.includes('const [useOverride, setUseOverride] = useState(false)')) {
  content = content.replace('const [zoom, setZoom] = useState(1);', 'const [useOverride, setUseOverride] = useState(false);\n  const [overridePrompt, setOverridePrompt] = useState("");\n  const [zoom, setZoom] = useState(1);');
}
// Update handleGenerateImage to use overridePrompt
const oldPromptExtraction = `    // ELITE PROMPT EXTRACTION
    const bgPrompt = (vibeData as any)?.imagePrompt || 
      \`[MASTERPIECE] High-end abstract event poster for "\${activeEvent.name}". 
       Vibe: \${vibeData?.vibe || "Premium"}. 
       Concept: \${(vibeData as any)?.description || "Luxurious"}. 
       Colors: \${(vibeData as any)?.colors?.join(", ") || "Gold, Charcoal"}. 
       Lighting: Cinematic, Ray-traced. Texture: 8k, Detailed. --no text, people, faces.\`;`;

const newPromptExtraction = `    // ELITE PROMPT EXTRACTION
    const bgPrompt = useOverride && overridePrompt.trim() !== "" ? overridePrompt : ((vibeData as any)?.imagePrompt || 
      \`[MASTERPIECE] High-end abstract event poster for "\${activeEvent.name}". 
       Vibe: \${vibeData?.vibe || "Premium"}. 
       Concept: \${(vibeData as any)?.description || "Luxurious"}. 
       Colors: \${(vibeData as any)?.colors?.join(", ") || "Gold, Charcoal"}. 
       Lighting: Cinematic, Ray-traced. Texture: 8k, Detailed. --no text, people, faces.\`);`;

content = content.replace(oldPromptExtraction, newPromptExtraction);

// 6. Right Sidebar Golden Accents
// They want "some rectangles around each text or maybe shall options like that... golden gradient boxes... try to add in a few golden gradient or you know boxes there as well."
// Let's modify the right panel section headers to have a subtle gold accent, and maybe the inputs.
content = content.replace(/<label className="text-\[11px\] font-bold mb-3 block">/g, '<label className="text-[11px] font-bold mb-3 flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-[gold-400] to-[gold-600]" />$1');
content = content.replace(/<label className="text-\[11px\] font-bold">/g, '<label className="text-[11px] font-bold flex items-center gap-2"><div className="w-1 h-3 rounded-full bg-gradient-to-b from-[gold-400] to-[gold-600]" />$1');

// For inputs, change focus:border-[#FBBF24]/50 to focus:border-[gold-500] and add a subtle gold border to the currently active UI elements if possible.
// "make some rectangles around each text or maybe shell options like that"
// Maybe for typography selections:
content = content.replace(/focus:border-\[\#FBBF24\]\/50/g, 'focus:border-[gold-500]/60 focus:ring-1 focus:ring-[gold-500]/20');


fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log('Update script completed.');
