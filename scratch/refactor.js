const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Replace FORMATS
content = content.replace(
  /const FORMATS: FormatSpec\[\] = \[\s*[\s\S]*?\];/,
  `const FORMATS: FormatSpec[] = [
  { id: "poster_a3", label: "A3 Poster", dim: "3508×4961", width: 3508, height: 4961, icon: LucideImage, previewH: 675 },
  { id: "poster", label: "Instagram Poster", dim: "1080×1350", width: 1080, height: 1350, icon: LucideImage, previewH: 675 },
  { id: "poster_wa", label: "WhatsApp Poster", dim: "1080×1080", width: 1080, height: 1080, icon: LucideImage, previewH: 675 },
  { id: "banner", label: "Banner", dim: "8×10 ft", width: 2400, height: 3000, icon: Layout, previewH: 600 },
  { id: "standee", label: "Standee", dim: "3×5 ft", width: 900, height: 1500, icon: Columns2, previewH: 600 },
  { id: "forms-header", label: "Forms Header", dim: "1600×400", width: 1600, height: 400, icon: FileText, previewH: 300 },
  { id: "certificate", label: "Certificate", dim: "Canva", width: 0, height: 0, icon: Award, previewH: 0 },
];`
);

// 2. Replace ARTBOARD_POSITIONS
content = content.replace(
  /const ARTBOARD_POSITIONS: Record[\s\S]*?\};/,
  `const ARTBOARD_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
    poster_a3: { x: 0, y: 0, w: 477, h: 675 },
    poster: { x: 577, y: 0, w: 540, h: 675 },
    poster_wa: { x: 1217, y: 0, w: 675, h: 675 },
    banner: { x: 0, y: 825, w: 480, h: 600 },
    standee: { x: 580, y: 825, w: 360, h: 600 },
    "forms-header": { x: 1040, y: 825, w: 1200, h: 300 },
  };`
);

// 3. Define renderArtboard right before return (
const renderArtboardStr = `  const renderArtboard = (
    id: string,
    label: string,
    dimStr: string,
    pos: { x: number; y: number; w: number; h: number } | undefined,
    isMainPoster: boolean = false
  ) => {
    if (!pos) return null;
    const baseW = 540;
    const scale = pos.w / baseW;
    const baseH = pos.h / scale;

    return (
      <div
        key={id}
        className="absolute"
        style={{ left: pos.x, top: pos.y }}
        onClick={() => { setSelectedArtboard(id as DesignTab); setActiveTab(id as DesignTab); }}
      >
        <div className="mb-2 flex items-center gap-4">
          <span className="text-[11px] text-[#808080] font-medium">{label}</span>
          <span className="text-[9px] text-[#555]">{dimStr}</span>
        </div>
        <div
          className={\`relative transition-shadow duration-200 \${selectedArtboard === id ? "ring-2 ring-[#FBBF24]" : "ring-1 ring-[#383838]"}\`}
          style={{ width: pos.w, height: pos.h }}
        >
          <div
            ref={isMainPoster ? posterRef : null}
            className="relative overflow-hidden bg-black origin-top-left"
            style={{ width: baseW, height: baseH, transform: \`scale(\${scale})\` }}
          >
            {isMainPoster && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />}

            {(typeof imageGen.result === 'string' && (imageGen.result.startsWith("data:image") || imageGen.result.startsWith("http"))) && (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
                style={{
                  backgroundImage: \`url(\${imageGen.result})\`,
                  filter: \`blur(\${layerBlur}px) brightness(\${exposure}%) contrast(\${contrast}%) saturate(\${saturation}%) sepia(\${temperature > 0 ? temperature : 0}%) hue-rotate(\${tint}deg)\`,
                  transform: 'scale(1.05)'
                }}
              />
            )}

            {typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image/svg") && (
              <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: \`url(\${imageGen.result})\`, backgroundSize: "cover", backgroundPosition: "center" }} />
            )}

            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: gradientType === 'radial'
                  ? \`radial-gradient(circle, \${gradientStart}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')}, \${gradientEnd}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')})\`
                  : \`linear-gradient(\${gradientAngle}deg, \${gradientStart}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')}, \${gradientEnd}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')})\`
              }}
            />

            {grainOpacity > 0 && (
              <div
                className="absolute inset-0 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`,
                  opacity: grainOpacity / 100
                }}
              />
            )}

            <AnimatePresence>
              {imageGen.status === "generating" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
                >
                  <div className="scale-50">
                    <DesignLoader />
                    <p className="text-[8px] text-white font-medium text-center mt-2 animate-pulse">Designing...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="absolute inset-0 p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer"
              style={{ fontFamily: bodyFont, fontSize: '8px' }}
              onClick={() => setSelectedLayer('background')}
            >
              <FigmaBox isSelected={selectedLayer === 'background'} />

              {/* HEADER */}
              <div
                className="flex flex-col items-center gap-4 p-1 relative cursor-pointer group/layer"
                onClick={(e) => { e.stopPropagation(); setSelectedLayer('header'); }}
              >
                <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#FBBF24]/50 pointer-events-none" />
                <FigmaBox isSelected={selectedLayer === 'header'} />
                <div className="flex justify-between items-start w-full px-2">
                  <div className="w-10 h-10 border border-dashed border-white/20 rounded-full flex items-center justify-center bg-black/20">
                    <span className="text-[4px] text-white/50 uppercase text-center font-bold">Logo</span>
                  </div>
                  <div className="w-12 h-10 border border-dashed border-white/20 rounded-md flex items-center justify-center bg-black/20">
                    <span className="text-[4px] text-white/50 uppercase text-center font-bold">Club</span>
                  </div>
                  <div className="w-10 h-10 border border-dashed border-white/20 rounded-full flex items-center justify-center bg-black/20">
                    <span className="text-[4px] text-white/50 uppercase text-center font-bold">Collab</span>
                  </div>
                </div>
                <textarea
                  value={editIntro}
                  onChange={e => setEditIntro(e.target.value)}
                  className="w-full bg-transparent text-center text-[6px] text-white/90 font-medium tracking-widest outline-none resize-none"
                  rows={2}
                />
              </div>

              {/* TITLE */}
              <div className={\`flex flex-col justify-center items-center \${id === 'forms-header' ? 'scale-75' : ''}\`}>
                {aiTitleImage ? (
                  <div className="relative h-20 flex items-center justify-center group/title">
                    <img src={aiTitleImage} alt="AI Title" className="h-full w-auto object-contain mix-blend-screen filter brightness-125" />
                    <button onClick={(e) => { e.stopPropagation(); setAiTitleImage(null); }} className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover/title:opacity-100 transition-opacity">
                      <RefreshCw className="w-2 h-2" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-full min-h-[3rem] relative group transition-all duration-300 flex items-center justify-center cursor-text group/layer"
                    onClick={(e) => { e.stopPropagation(); setSelectedLayer('title'); }}
                    style={{
                      fontFamily: titleFont,
                      backdropFilter: textBackdropBlur > 0 ? \`blur(\${textBackdropBlur}px)\` : 'none',
                      backgroundColor: textBackdropBlur > 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
                    }}
                  >
                    <AutoFitText
                      text={editTitle || "EVENT TITLE"}
                      maxFontSize={80}
                      className={\`uppercase \${titleBold ? 'font-black' : 'font-normal'}\`}
                      gradientColors={[textGradientStart, textGradientEnd]}
                      gradientType={textGradientType}
                      gradientAngle={textGradientAngle}
                      strokeWidth={textStrokeWidth}
                      strokeColor={textStrokeColor}
                      shadowOpacity={textShadowOpacity}
                    />
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                    />
                  </div>
                )}

                {/* Tagline */}
                <div
                  className="relative mx-auto w-full max-w-[80%] z-10 p-1 transition-all duration-300 cursor-text group/layer"
                  onClick={(e) => { e.stopPropagation(); setSelectedLayer('tagline'); }}
                >
                  <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#FBBF24]/50 pointer-events-none" />
                  <FigmaBox isSelected={selectedLayer === 'tagline'} />
                  <input
                    value={editSubtitle}
                    onChange={e => setEditSubtitle(e.target.value)}
                    className="bg-transparent text-center w-full outline-none text-[7px] font-medium tracking-[0.2em] transition-all duration-300"
                    style={{ fontFamily: bodyFont, color: textGradientEnd }}
                    placeholder="Add Event Tagline"
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className={\`flex \${id === 'forms-header' ? 'flex-row gap-4' : 'flex-col'} items-center space-y-4 pb-1 w-full px-1 mt-auto\`}>
                <div
                  className="w-full bg-black/40 border border-white/10 rounded-md flex overflow-hidden relative cursor-pointer group/layer"
                  onClick={(e) => { e.stopPropagation(); setSelectedLayer('details'); }}
                >
                  <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#FBBF24]/50 pointer-events-none" />
                  <FigmaBox isSelected={selectedLayer === 'details'} />
                  <div className="w-1/2 p-2 flex flex-col justify-center space-y-2 border-r border-white/10 text-left">
                    <div className="flex items-center gap-1 w-full">
                      <span className={\`text-[6px] tracking-widest w-8 shrink-0 \${labelsBold ? 'font-bold' : 'font-normal'} \${labelsUppercase ? 'uppercase' : 'capitalize'}\`} style={{ color: textGradientEnd }}>Date:</span>
                      <input value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium text-white tracking-wider flex-grow" placeholder="24th March 2026" />
                    </div>
                    <div className="flex items-center gap-1 w-full">
                      <span className={\`text-[6px] tracking-widest w-8 shrink-0 \${labelsBold ? 'font-bold' : 'font-normal'} \${labelsUppercase ? 'uppercase' : 'capitalize'}\`} style={{ color: textGradientEnd }}>Time:</span>
                      <input value={editTime} onChange={e => setEditTime(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium text-white tracking-wider flex-grow" placeholder="4:30 PM to 6:30 PM" />
                    </div>
                    <div className="flex items-start gap-1 w-full">
                      <span className={\`text-[6px] tracking-widest w-8 shrink-0 mt-0.5 \${labelsBold ? 'font-bold' : 'font-normal'} \${labelsUppercase ? 'uppercase' : 'capitalize'}\`} style={{ color: textGradientEnd }}>Venue:</span>
                      <textarea value={editVenue} onChange={e => setEditVenue(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium text-white tracking-wider flex-grow resize-none leading-tight" rows={2} placeholder="AIML Lab, 7th Floor" />
                    </div>
                  </div>
                  <div className="w-1/2 p-2 flex flex-col justify-center text-left space-y-2">
                    <span className={\`text-[6px] tracking-widest \${labelsBold ? 'font-bold' : 'font-normal'} \${labelsUppercase ? 'uppercase' : 'capitalize'}\`} style={{ color: textGradientEnd }}>Registration Fee:</span>
                    <textarea value={editFee} onChange={e => setEditFee(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium text-white tracking-wider w-full resize-none leading-tight" rows={3} placeholder="Registration is free for all!" />
                  </div>
                </div>

                {/* Tags */}
                <div
                  className="flex flex-col items-center gap-1 mt-2 p-1 w-full relative cursor-pointer group/layer"
                  onClick={(e) => { e.stopPropagation(); setSelectedLayer('tags'); }}
                >
                  <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#FBBF24]/50 pointer-events-none" />
                  <FigmaBox isSelected={selectedLayer === 'tags'} />
                  <input value={editTeamSize} onChange={e => setEditTeamSize(e.target.value)} className="bg-transparent outline-none text-[7px] font-medium text-white/90 tracking-[0.15em] text-center w-full" placeholder="Participate in teams of 2-4" />
                  <textarea
                    value={editPrizePool}
                    onChange={e => setEditPrizePool(e.target.value)}
                    className="bg-black/60 border rounded-md px-3 py-1 outline-none text-[8px] font-black uppercase tracking-widest text-center min-w-[100px] resize-none leading-tight"
                    rows={2}
                    placeholder="PRIZE POOL&#10;₹5000"
                  />
                </div>

                {/* FOOTER */}
                <div
                  className="flex justify-between items-end w-full px-2 pt-2 relative cursor-pointer group/layer"
                  onClick={(e) => { e.stopPropagation(); setSelectedLayer('footer'); }}
                >
                  <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#FBBF24]/50 pointer-events-none" />
                  <FigmaBox isSelected={selectedLayer === 'footer'} />
                  <input value={editContact} onChange={e => setEditContact(e.target.value)} className="bg-transparent outline-none text-[4px] font-medium tracking-widest text-white/60 w-1/3" placeholder="VAIBHAV: 9989900929" />
                  <div className="w-10 h-10 border border-dashed border-white/20 rounded-md flex items-center justify-center bg-black/20">
                    <span className="text-[4px] text-white/50 uppercase text-center font-bold">QR Code</span>
                  </div>
                  <input value={editSecondaryContact} onChange={e => setEditSecondaryContact(e.target.value)} className="bg-transparent outline-none text-[4px] font-medium tracking-widest text-white/60 w-1/3 text-right" placeholder="RAHUL: 9823304523" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (`;
content = content.replace(/  return \(/, renderArtboardStr);

// 4. Replace the huge artboard list in the canvas with just mapping renderArtboard over FORMATS.
// We need to replace from `{/* ─── POSTER ARTBOARD ────────────────────────────── */}`
// down to exactly before `</div>` `{/* ─── RIGHT PANEL: Properties ────────────────────────────── */}`

const canvasStartIndex = content.indexOf('{/* ─── POSTER ARTBOARD ────────────────────────────── */}');
const canvasEndIndex = content.indexOf('{/* ─── RIGHT PANEL: Properties ────────────────────────────── */}');

const beforeCanvas = content.slice(0, canvasStartIndex);
const afterCanvas = content.slice(canvasEndIndex);

const newCanvasContent = `
            {FORMATS.filter(f => f.id !== "certificate").map(f => 
              renderArtboard(f.id, f.label, f.dim, ARTBOARD_POSITIONS[f.id], f.id === "poster")
            )}
          </div>
        </div>

        `;

content = beforeCanvas + newCanvasContent + afterCanvas;

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
