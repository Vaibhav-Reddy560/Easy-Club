const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

const marker = "// ─── Render ───────────────────────────────────────────────────────";
const splitIndex = content.indexOf(marker);

if (splitIndex === -1) {
  console.error("Marker not found");
  process.exit(1);
}

const beforeRender = content.substring(0, splitIndex);

const newRender = `// ─── Render ───────────────────────────────────────────────────────
  if (!activeEvent) {
    return (
      <div className="fixed inset-0 z-[90] bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0D99FF]" />
          <h3 className="text-sm font-medium text-white">Syncing Event Data...</h3>
          <p className="text-xs text-[#808080] max-w-xs mx-auto">Please check your internet or select an event from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-[#181818] flex flex-col select-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ─── TOP TOOLBAR ──────────────────────────────────────────── */}
      <div className="h-10 bg-[#2C2C2C] border-b border-[#383838] flex items-center justify-between px-3 shrink-0 z-[92]">
        {/* Left: Back + Event Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[11px] text-[#B0B0B0] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="w-px h-4 bg-[#383838]" />
          <span className="text-[11px] text-white font-medium truncate max-w-[200px]">{activeEvent.name}</span>
          <span className="text-[10px] text-[#808080]">— Design Studio</span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))} className="w-6 h-6 flex items-center justify-center text-[#B0B0B0] hover:text-white hover:bg-white/5 rounded text-sm">−</button>
          <button onClick={handleFitToView} className="px-2 py-0.5 text-[10px] text-[#B0B0B0] hover:text-white hover:bg-white/5 rounded font-mono">{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="w-6 h-6 flex items-center justify-center text-[#B0B0B0] hover:text-white hover:bg-white/5 rounded text-sm">+</button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateImage}
            disabled={imageGen.status === "generating" || (!vibeAccepted && !useOverride)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#0D99FF] text-white rounded text-[11px] font-medium hover:bg-[#0B85E0] transition-colors disabled:opacity-40"
          >
            <Sparkles className={\`w-3 h-3 \${imageGen.status === "generating" ? "animate-spin" : ""}\`} />
            {imageGen.status === "generating" ? "Rendering..." : "Render Canvas"}
          </button>
          {imageGen.status === "success" && (
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded text-[11px] font-medium hover:bg-white/15 transition-colors">
              <Download className="w-3 h-3" />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT PANEL: Layers ──────────────────────────────────── */}
        <div className="w-[200px] shrink-0 bg-[#252525] border-r border-[#383838] flex flex-col overflow-hidden z-[91]">
          {/* Artboards List */}
          <div className="p-2 border-b border-[#383838]">
            <h3 className="text-[10px] font-medium text-[#808080] uppercase tracking-wider px-2 py-1">Artboards</h3>
            {FORMATS.filter(f => f.id !== "certificate").map(f => (
              <button
                key={f.id}
                onClick={() => { setSelectedArtboard(f.id); setActiveTab(f.id); }}
                className={\`w-full text-left px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors flex items-center gap-2 \${selectedArtboard === f.id ? 'bg-[#0d99ff] text-white' : 'text-[#C0C0C0] hover:bg-white/5'}\`}
              >
                <f.icon className="w-3 h-3" />
                {f.label}
                <span className="ml-auto text-[9px] text-[#808080]">{f.dim}</span>
              </button>
            ))}
          </div>

          {/* Layers for Selected Artboard */}
          <div className="p-2 flex-1 overflow-y-auto">
            <h3 className="text-[10px] font-medium text-[#808080] uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Layout className="w-3 h-3" /> Layers
            </h3>
            {(['header', 'title', 'tagline', 'details', 'tags', 'footer', 'background'] as Layer[]).map(layer => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={\`w-full text-left px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors flex items-center justify-between \${selectedLayer === layer ? 'bg-[#0d99ff] text-white' : 'text-[#C0C0C0] hover:bg-white/5'}\`}
              >
                {layer}
                {selectedLayer === layer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>

          {/* Generation Progress */}
          {imageGen.status === "generating" && (
            <div className="p-2 border-t border-[#383838]">
              <div className="w-full bg-[#383838] rounded-full h-1 overflow-hidden">
                <motion.div className="h-full bg-[#0d99ff] rounded-full" initial={{ width: "0%" }} animate={{ width: \`\${imageGen.progress}%\` }} transition={{ duration: 0.5 }} />
              </div>
              <p className="text-[9px] text-[#808080] mt-1 text-center">Rendering...</p>
            </div>
          )}
        </div>

        {/* ─── CENTER: Infinite Canvas ────────────────────────────── */}
        <div
          ref={canvasContainerRef}
          className="flex-1 overflow-hidden relative"
          style={{ cursor: isPanning ? 'grabbing' : 'default', background: '#121212' }}
          onWheel={handleCanvasWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: \`\${20 * zoom}px \${20 * zoom}px\`,
            backgroundPosition: \`\${panX % (20 * zoom)}px \${panY % (20 * zoom)}px\`
          }} />

          {/* Transform Container */}
          <div
            className="absolute"
            style={{
              transform: \`translate(\${panX}px, \${panY}px) scale(\${zoom})\`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            {/* ─── POSTER ARTBOARD ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS.poster.x, top: ARTBOARD_POSITIONS.poster.y }}
              onClick={() => { setSelectedArtboard("poster"); setActiveTab("poster"); }}
            >
              {/* Artboard Label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] text-[#808080] font-medium">Poster</span>
                <span className="text-[9px] text-[#555]">{posterDim.dim}</span>
              </div>
              {/* Artboard Frame */}
              <div
                className={\`relative transition-shadow duration-200 \${selectedArtboard === "poster" ? "ring-2 ring-[#0D99FF]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS.poster.w, height: ARTBOARD_POSITIONS.poster.h }}
              >
                <div
                  ref={posterRef}
                  className="relative w-full h-full overflow-hidden bg-black"
                >
                  {/* Background canvas */}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />

                  {/* Direct Image */}
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

                  {/* SVG fallback */}
                  {typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image/svg") && (
                    <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: \`url(\${imageGen.result})\`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  )}

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: gradientType === 'radial'
                        ? \`radial-gradient(circle, \${gradientStart}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')}, \${gradientEnd}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')})\`
                        : \`linear-gradient(\${gradientAngle}deg, \${gradientStart}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')}, \${gradientEnd}\${Math.round((gradientOpacity/100)*255).toString(16).padStart(2,'0')})\`
                    }}
                  />

                  {/* Grain Overlay */}
                  {grainOpacity > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`,
                        opacity: grainOpacity / 100
                      }}
                    />
                  )}

                  {/* Generation Loader */}
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

                  {/* Editable content overlay */}
                  <div
                    className="absolute inset-0 p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer"
                    style={{ fontFamily: bodyFont, fontSize: '8px' }}
                    onClick={() => setSelectedLayer('background')}
                  >
                    <FigmaBox isSelected={selectedLayer === 'background'} />

                    {/* HEADER */}
                    <div
                      className="flex flex-col items-center gap-2 p-1 relative cursor-pointer group/layer"
                      onClick={(e) => { e.stopPropagation(); setSelectedLayer('header'); }}
                    >
                      <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#0d99ff]/50 pointer-events-none" />
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
                    <div className="flex flex-col justify-center items-center">
                      {aiTitleImage ? (
                        <div className="relative h-20 flex items-center justify-center group/title">
                          <img src={aiTitleImage} alt="AI Title" className="h-full w-auto object-contain mix-blend-screen filter brightness-125" />
                          <button onClick={() => setAiTitleImage(null)} className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover/title:opacity-100 transition-opacity">
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
                        <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#0d99ff]/50 pointer-events-none" />
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
                    <div className="flex flex-col items-center space-y-2 pb-1 w-full px-1 mt-auto">
                      <div
                        className="w-full bg-black/40 border border-white/10 rounded-md flex overflow-hidden relative cursor-pointer group/layer"
                        onClick={(e) => { e.stopPropagation(); setSelectedLayer('details'); }}
                      >
                        <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#0d99ff]/50 pointer-events-none" />
                        <FigmaBox isSelected={selectedLayer === 'details'} />
                        <div className="w-1/2 p-2 flex flex-col justify-center space-y-1 border-r border-white/10 text-left">
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
                        <div className="w-1/2 p-2 flex flex-col justify-center text-left space-y-1">
                          <span className={\`text-[6px] tracking-widest \${labelsBold ? 'font-bold' : 'font-normal'} \${labelsUppercase ? 'uppercase' : 'capitalize'}\`} style={{ color: textGradientEnd }}>Registration Fee:</span>
                          <textarea value={editFee} onChange={e => setEditFee(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium text-white tracking-wider w-full resize-none leading-tight" rows={3} placeholder="Registration is free for all!" />
                        </div>
                      </div>

                      {/* Tags */}
                      <div
                        className="flex flex-col items-center gap-1 mt-2 p-1 w-full relative cursor-pointer group/layer"
                        onClick={(e) => { e.stopPropagation(); setSelectedLayer('tags'); }}
                      >
                        <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#0d99ff]/50 pointer-events-none" />
                        <FigmaBox isSelected={selectedLayer === 'tags'} />
                        <input value={editTeamSize} onChange={e => setEditTeamSize(e.target.value)} className="bg-transparent outline-none text-[7px] font-medium text-white/90 tracking-[0.15em] text-center w-full" placeholder="Participate in teams of 2-4" />
                        <textarea
                          value={editPrizePool}
                          onChange={e => setEditPrizePool(e.target.value)}
                          className="bg-black/60 border rounded-md px-3 py-1 outline-none text-[8px] font-black uppercase tracking-widest text-center min-w-[100px] resize-none leading-tight"
                          style={{ color: textGradientEnd, borderColor: \`\${textGradientEnd}40\` }}
                          rows={2}
                          placeholder={"PRIZE POOL\\n₹3000"}
                        />
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div
                      className="flex justify-between items-end w-full px-1 mb-1 pt-2 relative cursor-pointer group/layer"
                      onClick={(e) => { e.stopPropagation(); setSelectedLayer('footer'); }}
                    >
                      <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-[#0d99ff]/50 pointer-events-none" />
                      <FigmaBox isSelected={selectedLayer === 'footer'} />
                      <input value={editPoc1} onChange={e => setEditPoc1(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium tracking-widest w-1/3" style={{ color: textGradientEnd }} placeholder="Name: Phone" />
                      <input value={editPoc2} onChange={e => setEditPoc2(e.target.value)} className="bg-transparent outline-none text-[6px] font-medium tracking-widest w-1/3 text-right" style={{ color: textGradientEnd }} placeholder="Name: Phone" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── BANNER ARTBOARD ────────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS.banner.x, top: ARTBOARD_POSITIONS.banner.y }}
              onClick={() => { setSelectedArtboard("banner"); setActiveTab("banner"); }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-[#808080] font-medium">Banner</span>
                <span className="text-[9px] text-[#555] ml-2">8×10 ft</span>
              </div>
              <div
                className={\`relative bg-black flex items-center justify-center transition-shadow duration-200 \${selectedArtboard === "banner" ? "ring-2 ring-[#0D99FF]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS.banner.w, height: ARTBOARD_POSITIONS.banner.h }}
              >
                <div className="text-center space-y-2 p-4">
                  <LucideImage className="w-8 h-8 text-[#383838] mx-auto" />
                  <p className="text-[10px] text-[#555]">Banner Preview</p>
                  <p className="text-[8px] text-[#444]">Same content as poster,<br/>optimized for 8×10 ft print</p>
                </div>
              </div>
            </div>

            {/* ─── STANDEE ARTBOARD ───────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS.standee.x, top: ARTBOARD_POSITIONS.standee.y }}
              onClick={() => { setSelectedArtboard("standee"); setActiveTab("standee"); }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-[#808080] font-medium">Standee</span>
                <span className="text-[9px] text-[#555] ml-2">3×5 ft</span>
              </div>
              <div
                className={\`relative bg-black flex items-center justify-center transition-shadow duration-200 \${selectedArtboard === "standee" ? "ring-2 ring-[#0D99FF]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS.standee.w, height: ARTBOARD_POSITIONS.standee.h }}
              >
                <div className="text-center space-y-2 p-4">
                  <Columns2 className="w-8 h-8 text-[#383838] mx-auto" />
                  <p className="text-[10px] text-[#555]">Standee Preview</p>
                  <p className="text-[8px] text-[#444]">3×5 ft vertical standee</p>
                </div>
              </div>
            </div>

            {/* ─── FORMS HEADER ARTBOARD ──────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS["forms-header"].x, top: ARTBOARD_POSITIONS["forms-header"].y }}
              onClick={() => { setSelectedArtboard("forms-header"); setActiveTab("forms-header"); }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-[#808080] font-medium">Forms Header</span>
                <span className="text-[9px] text-[#555] ml-2">1600×400</span>
              </div>
              <div
                className={\`relative bg-black flex items-center justify-center transition-shadow duration-200 \${selectedArtboard === "forms-header" ? "ring-2 ring-[#0D99FF]" : "ring-1 ring-[#383838]"}\`}
                style={{ width: ARTBOARD_POSITIONS["forms-header"].w, height: ARTBOARD_POSITIONS["forms-header"].h }}
              >
                <div className="text-center space-y-2 p-4">
                  <FileText className="w-8 h-8 text-[#383838] mx-auto" />
                  <p className="text-[10px] text-[#555]">Forms Header</p>
                  <p className="text-[8px] text-[#444]">Google Forms / Registration</p>
                </div>
              </div>
            </div>

            {/* ─── CERTIFICATE CARD ──────────────────────────── */}
            <div
              className="absolute"
              style={{ left: ARTBOARD_POSITIONS.certificate.x, top: ARTBOARD_POSITIONS.certificate.y }}
            >
              <div className="mb-2">
                <span className="text-[11px] text-[#808080] font-medium">Certificate</span>
                <span className="text-[9px] text-[#555] ml-2">Canva</span>
              </div>
              <div
                className="relative bg-[#1E1E1E] border border-[#383838] rounded-md flex flex-col items-center justify-center p-6"
                style={{ width: ARTBOARD_POSITIONS.certificate.w, height: ARTBOARD_POSITIONS.certificate.h }}
              >
                <Award className="w-10 h-10 text-[#555] mb-3" />
                <p className="text-[11px] text-[#C0C0C0] font-medium mb-2">Certificate Design</p>
                <a
                  href={getCertificateUrl(config.subType)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 bg-[#0D99FF] text-white rounded text-[10px] font-medium hover:bg-[#0B85E0] transition-colors flex items-center gap-1.5"
                >
                  Open Canva <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ─── RIGHT PANEL: Properties ────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-[#252525] border-l border-[#383838] overflow-y-auto z-[91]">
          {/* Selected Layer Header */}
          <div className="p-3 border-b border-[#383838] flex items-center justify-between sticky top-0 bg-[#252525] z-10">
            <span className="text-[11px] text-[#808080] font-medium flex items-center gap-1.5"><Layout className="w-3 h-3" /> Properties</span>
            <span className="text-[10px] text-white bg-[#383838] px-2 py-0.5 rounded-sm">{selectedLayer}</span>
          </div>

          <div className="p-3 space-y-4">
            {/* --- BACKGROUND LAYER PROPERTIES --- */}
            {selectedLayer === "background" && (
              <div className="space-y-4">
                {/* Poster sub-dimensions */}
                {activeTab === "poster" && (
                  <section className="space-y-2">
                    <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2">
                      <LucideImage className="w-3 h-3" /> Poster Size
                    </label>
                    <div className="flex gap-2">
                      {POSTER_DIMS.map(d => (
                        <button
                          key={d.label}
                          onClick={() => setPosterDim(d)}
                          className={\`flex-1 px-2 py-1.5 rounded text-[9px] font-medium transition-colors border \${posterDim.label === d.label ? "bg-[#0D99FF] text-white border-[#0D99FF]" : "bg-[#2C2C2C] text-[#C0C0C0] border-[#383838] hover:border-[#555]"}\`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Creativity Level */}
                <section className="space-y-2">
                  <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2">
                    <Sliders className="w-3 h-3" /> Creativity Level: <span className="text-[#0D99FF]">{creativityLevel}/10</span>
                  </label>
                  <input type="range" min={1} max={10} value={creativityLevel} onChange={e => setCreativityLevel(Number(e.target.value))} className="w-full accent-[#0D99FF] cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-[#808080]">
                    <span>Clean & Minimal</span><span>Bold & Artistic</span>
                  </div>
                </section>

                {/* AI Vibe */}
                <section className="space-y-2 border-t border-[#383838] pt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUseOverride(!useOverride)}
                      className={\`flex-1 px-3 py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors \${useOverride ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0] border border-[#383838]'}\`}
                    >
                      <Sparkles className="w-3 h-3" /> AI Vibe Direction
                    </button>
                    <button
                      onClick={handleSuggestVibe}
                      disabled={vibeGen.status === "generating"}
                      className="flex-1 px-3 py-1.5 bg-[#0D99FF] text-white rounded text-[10px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#0B85E0] transition-colors disabled:opacity-50"
                    >
                      {vibeGen.status === "generating" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {vibeGen.status === "generating" ? "Thinking..." : vibeData ? "Re-Suggest" : "Suggest Vibe"}
                    </button>
                  </div>

                  {vibeGen.status === "generating" && (
                    <div className="flex items-center gap-2 text-[10px] text-[#808080] py-2">
                      <Loader2 className="w-3 h-3 animate-spin text-[#0D99FF]" />
                      Analyzing event aesthetic...
                    </div>
                  )}

                  {vibeData && vibeGen.status === "success" && (
                    <div className="bg-[#1E1E1E] border border-[#383838] rounded p-3 space-y-2">
                      <h4 className="text-[11px] font-medium text-white">{vibeData.vibe}</h4>
                      <p className="text-[9px] text-[#A0A0A0] leading-relaxed">{vibeData.description}</p>
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        <span className="px-2 py-0.5 bg-[#0D99FF]/10 border border-[#0D99FF]/20 rounded text-[#0D99FF] font-medium">Font: {vibeData.titleFont}</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-white font-medium">Body: {vibeData.bodyFont}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setVibeAccepted(true)} className="flex-1 py-1.5 bg-[#0D99FF] text-white rounded text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-[#0B85E0] transition-colors">
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={handleSuggestVibe} className="flex-1 py-1.5 bg-[#2C2C2C] text-white border border-[#383838] rounded text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-[#333] transition-colors">
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {vibeGen.error && (
                    <p className="text-[10px] text-red-400 py-1">{vibeGen.error}</p>
                  )}

                  {useOverride && (
                    <textarea
                      value={vibeOverride}
                      onChange={e => setVibeOverride(e.target.value)}
                      placeholder="Describe the vibe you want..."
                      className="w-full bg-[#1E1E1E] border border-[#383838] rounded p-3 text-[11px] text-white focus:border-[#0D99FF]/50 outline-none resize-none min-h-[80px]"
                    />
                  )}
                </section>

                {/* Image Adjustments */}
                <section className="space-y-3 border-t border-[#383838] pt-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2">
                    <Sliders className="w-3 h-3" /> Image Adjustments
                  </label>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
                    <div><span className="text-[#808080]">Exposure</span><span className="float-right text-white">{exposure}%</span></div>
                    <div><span className="text-[#808080]">Contrast</span><span className="float-right text-white">{contrast}%</span></div>
                    <input type="range" min={0} max={200} value={exposure} onChange={e => setExposure(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                    <input type="range" min={0} max={200} value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                    <div><span className="text-[#808080]">Saturation</span><span className="float-right text-white">{saturation}%</span></div>
                    <div><span className="text-[#808080]">Temperature</span><span className="float-right text-white">{temperature}</span></div>
                    <input type="range" min={0} max={200} value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                    <input type="range" min={0} max={100} value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                    <div><span className="text-[#808080]">Blur</span><span className="float-right text-white">{layerBlur}px</span></div>
                    <div><span className="text-[#808080]">Grain</span><span className="float-right text-white">{grainOpacity}%</span></div>
                    <input type="range" min={0} max={20} value={layerBlur} onChange={e => setLayerBlur(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                    <input type="range" min={0} max={100} value={grainOpacity} onChange={e => setGrainOpacity(Number(e.target.value))} className="w-full accent-[#0D99FF]" />
                  </div>
                </section>

                {/* Gradient Overlay */}
                <section className="space-y-3 border-t border-[#383838] pt-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium">Gradient Overlay</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-[#808080] w-16">Opacity</span>
                      <input type="range" min={0} max={100} value={gradientOpacity} onChange={e => setGradientOpacity(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                      <span className="text-white w-8 text-right">{gradientOpacity}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setGradientType('linear')} className={\`flex-1 py-1 rounded text-[10px] font-medium \${gradientType === 'linear' ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>Linear</button>
                      <button onClick={() => setGradientType('radial')} className={\`flex-1 py-1 rounded text-[10px] font-medium \${gradientType === 'radial' ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>Radial</button>
                    </div>
                    {gradientType === 'linear' && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#808080] w-16">Angle</span>
                        <input type="range" min={0} max={360} value={gradientAngle} onChange={e => setGradientAngle(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                        <span className="text-white w-8 text-right">{gradientAngle}°</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="flex-1"><label className="text-[9px] text-[#808080]">Start</label><input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border-0" /></div>
                      <div className="flex-1"><label className="text-[9px] text-[#808080]">End</label><input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border-0" /></div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* --- TITLE LAYER PROPERTIES --- */}
            {selectedLayer === "title" && (
              <div className="space-y-4">
                <section className="space-y-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2"><Type className="w-3 h-3" /> Typography</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setTitleBold(!titleBold)} className={\`py-2 rounded text-[10px] font-medium transition-colors \${titleBold ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>
                      {titleBold ? 'Bold' : 'Normal'}
                    </button>
                  </div>
                </section>

                <section className="space-y-3 border-t border-[#383838] pt-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium">Text Effects</label>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#808080] w-16">Shadow</span>
                      <input type="range" min={0} max={100} value={textShadowOpacity} onChange={e => setTextShadowOpacity(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                      <span className="text-white w-8 text-right">{textShadowOpacity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#808080] w-16">Stroke</span>
                      <input type="range" min={0} max={5} value={textStrokeWidth} onChange={e => setTextStrokeWidth(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                      <span className="text-white w-8 text-right">{textStrokeWidth}px</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 border-t border-[#383838] pt-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium">Text Gradient</label>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setTextGradientType('linear')} className={\`flex-1 py-1 rounded text-[10px] font-medium \${textGradientType === 'linear' ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>Linear</button>
                    <button onClick={() => setTextGradientType('radial')} className={\`flex-1 py-1 rounded text-[10px] font-medium \${textGradientType === 'radial' ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>Radial</button>
                  </div>
                  {textGradientType === 'linear' && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-[#808080] w-16">Angle</span>
                      <input type="range" min={0} max={360} value={textGradientAngle} onChange={e => setTextGradientAngle(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                      <span className="text-white w-8 text-right">{textGradientAngle}°</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <div className="flex-1"><label className="text-[9px] text-[#808080]">Start</label><input type="color" value={textGradientStart} onChange={e => setTextGradientStart(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border-0" /></div>
                    <div className="flex-1"><label className="text-[9px] text-[#808080]">End</label><input type="color" value={textGradientEnd} onChange={e => setTextGradientEnd(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border-0" /></div>
                    <div className="flex-1"><label className="text-[9px] text-[#808080]">Stroke</label><input type="color" value={textStrokeColor} onChange={e => setTextStrokeColor(e.target.value)} className="w-full h-6 rounded cursor-pointer bg-transparent border-0" /></div>
                  </div>
                </section>

                <section className="space-y-3 border-t border-[#383838] pt-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium">Backdrop Blur</label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <input type="range" min={0} max={20} value={textBackdropBlur} onChange={e => setTextBackdropBlur(Number(e.target.value))} className="flex-1 accent-[#0D99FF]" />
                    <span className="text-white w-8 text-right">{textBackdropBlur}px</span>
                  </div>
                </section>
              </div>
            )}

            {/* --- TAGLINE LAYER --- */}
            {selectedLayer === "tagline" && (
              <div className="space-y-4">
                <section className="space-y-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2"><Type className="w-3 h-3" /> Tagline</label>
                  <p className="text-[10px] text-[#808080]">Edit the tagline directly on the canvas.</p>
                </section>
              </div>
            )}

            {/* --- DETAILS, TAGS, FOOTER, HEADER LAYER PROPERTIES --- */}
            {(selectedLayer === "details" || selectedLayer === "tags" || selectedLayer === "footer" || selectedLayer === "header") && (
              <div className="space-y-4">
                <section className="space-y-3">
                  <label className="text-[11px] text-[#E0E0E0] font-medium flex items-center gap-2"><Type className="w-3 h-3" /> Label Rules</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setLabelsBold(!labelsBold)} className={\`py-2 rounded text-[10px] font-medium transition-colors \${labelsBold ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>
                      Labels: {labelsBold ? 'Bold' : 'Normal'}
                    </button>
                    <button onClick={() => setLabelsUppercase(!labelsUppercase)} className={\`py-2 rounded text-[10px] font-medium transition-colors \${labelsUppercase ? 'bg-[#0D99FF] text-white' : 'bg-[#2C2C2C] text-[#C0C0C0]'}\`}>
                      {labelsUppercase ? 'Uppercase' : 'Capitalize'}
                    </button>
                  </div>
                  <div className="p-3 bg-[#1E1E1E] border border-[#383838] rounded text-[10px] text-[#808080]">
                    Edit values directly on the canvas by clicking into fields.
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Error display */}
          {imageGen.error && (
            <div className="m-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium text-center">
              {imageGen.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('components/domains/DesignWorkspace.tsx', beforeRender + newRender);
console.log("Render section replaced successfully.");
