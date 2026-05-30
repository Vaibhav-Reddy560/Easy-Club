const fs = require('fs');
const file = 'components/domains/DesignWorkspace.tsx';
let content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('{/* ─── RIGHT PANEL: Properties ────────────────────────────── */}');
const end = content.indexOf('{/* Error display */}');

if (start !== -1 && end !== -1) {
  const newPanel = `        {/* ─── RIGHT PANEL: Properties ────────────────────────────── */}
        <div className="w-[320px] shrink-0 bg-[#2C2C2C] border-l border-[#1E1E1E] overflow-y-auto z-[201] custom-scrollbar flex flex-col text-white pb-32">
          {/* Header */}
          <div className="p-3 border-b border-[#383838] flex items-center justify-between sticky top-0 bg-[#2C2C2C] z-10 text-[11px] font-medium">
            <span className="flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-[#808080]" />
              <span className="capitalize">{selectedLayer === 'background' ? 'Image' : selectedLayer === 'title' || selectedLayer === 'tagline' || selectedLayer === 'details' ? 'Text' : selectedLayer}</span>
            </span>
            <div className="flex gap-3 text-[#808080]">
               <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
               <ChevronDown className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Position */}
          <section className="p-4 border-b border-[#383838]">
            <label className="text-[11px] font-bold mb-3 block">Position</label>
            <div className="flex items-center justify-between mb-3 bg-[#1E1E1E] p-1 rounded border border-transparent">
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080]"><AlignLeft className="w-3 h-3" /></button>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080]"><AlignCenter className="w-3 h-3" /></button>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080]"><AlignRight className="w-3 h-3" /></button>
              <div className="w-px h-3 bg-[#383838] mx-1" />
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080]"><AlignVerticalSpaceAround className="w-3 h-3" /></button>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080]"><AlignHorizontalSpaceAround className="w-3 h-3" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                <span className="pl-2 text-[#808080] text-[9px] w-5">X</span>
                <input type="text" value="3247.75" readOnly className="w-full bg-transparent border-none py-1.5 pl-1 outline-none text-[10px]" />
              </div>
              <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                <span className="pl-2 text-[#808080] text-[9px] w-5">Y</span>
                <input type="text" value="277.36" readOnly className="w-full bg-transparent border-none py-1.5 pl-1 outline-none text-[10px]" />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mt-2 items-center">
              <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                <span className="pl-2 text-[#808080] text-[9px] w-5">∠</span>
                <input type="text" value="0°" readOnly className="w-full bg-transparent border-none py-1.5 pl-1 outline-none text-[10px]" />
              </div>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080] bg-[#1E1E1E]"><RefreshCw className="w-3 h-3" /></button>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080] bg-[#1E1E1E]"><Columns2 className="w-3 h-3" /></button>
              <button className="p-1.5 rounded hover:bg-[#383838] text-[#808080] bg-[#1E1E1E]"><Layout className="w-3 h-3" /></button>
            </div>
          </section>

          {/* Layout */}
          <section className="p-4 border-b border-[#383838]">
            <label className="text-[11px] font-bold mb-3 block">Layout</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                <span className="pl-2 text-[#808080] text-[9px] w-5">W</span>
                <input type="text" value="3498.27" readOnly className="w-full bg-transparent border-none py-1.5 pl-1 outline-none text-[10px]" />
              </div>
              <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                <span className="pl-2 text-[#808080] text-[9px] w-5">H</span>
                <input type="text" value="365" readOnly className="w-full bg-transparent border-none py-1.5 pl-1 outline-none text-[10px]" />
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="p-4 border-b border-[#383838]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold">Appearance</label>
              <div className="flex gap-3 text-[#808080]">
                <Eye className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <Droplets className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#808080]">Opacity</span>
                <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                  <span className="pl-2 text-[#808080] text-[9px]"><LayoutGrid className="w-3 h-3" /></span>
                  <input type="text" value="100%" readOnly className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px]" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#808080]">Corner radius</span>
                <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] rounded overflow-hidden">
                  <span className="pl-2 text-[#808080] text-[9px]">⌜ ⌝</span>
                  <input type="text" value="0" readOnly className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px]" />
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          {(selectedLayer === "title" || selectedLayer === "tagline" || selectedLayer === "details" || selectedLayer === "tags") && (
            <section className="p-4 border-b border-[#383838]">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-bold">Typography</label>
                <LayoutGrid className="w-3.5 h-3.5 text-[#808080]" />
              </div>
              
              <div className="space-y-2 text-[10px]">
                <div className="relative group">
                  <select value={titleFont} onChange={e => setTitleFont(e.target.value)} className="w-full appearance-none bg-[#1E1E1E] border border-transparent hover:border-[#444] focus:border-[#FBBF24]/50 rounded px-2.5 py-1.5 outline-none cursor-pointer text-white">
                    <option value="Inter">Inter</option>
                    <option value="var(--font-destrubia)">Destrubia</option>
                    <option value="var(--font-astronomus)">Astronomus</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#808080] pointer-events-none" />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <select className="w-full appearance-none bg-[#1E1E1E] border border-transparent hover:border-[#444] focus:border-[#FBBF24]/50 rounded px-2.5 py-1.5 outline-none cursor-pointer text-white" value={titleBold ? "Bold" : "Regular"} onChange={(e) => setTitleBold(e.target.value === "Bold")}>
                      <option>Regular</option>
                      <option>Bold</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#808080] pointer-events-none" />
                  </div>
                  <div className="relative w-20 group">
                    <input type="number" defaultValue="362.35" className="w-full bg-[#1E1E1E] border border-transparent hover:border-[#444] focus:border-[#FBBF24]/50 rounded px-2.5 py-1.5 outline-none text-white" />
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#808080] pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <div className="flex flex-col gap-1 flex-1">
                     <span className="text-[9px] text-[#808080]">Line height</span>
                     <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] focus-within:border-[#FBBF24]/50 rounded px-2 overflow-hidden">
                       <span className="text-[#808080] w-5 pr-1"><Type className="w-3 h-3" /></span>
                       <input value={textLineHeight} onChange={e => setTextLineHeight(e.target.value)} className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                     <span className="text-[9px] text-[#808080]">Letter spacing</span>
                     <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] focus-within:border-[#FBBF24]/50 rounded px-2 overflow-hidden">
                       <span className="text-[#808080] w-6 pr-1 flex gap-0.5"><span className="text-[8px]">|</span>A<span className="text-[8px]">|</span></span>
                       <input value={textLetterSpacing + "%"} onChange={e => setTextLetterSpacing(Number(e.target.value.replace("%","")))} className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white" />
                     </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                   <span className="text-[9px] text-[#808080]">Alignment</span>
                   <div className="flex items-center gap-1 bg-[#1E1E1E] p-1 rounded border border-transparent w-fit">
                     <button onClick={() => setTextAlign("left")} className={\`p-1.5 rounded hover:bg-[#383838] \${textAlign === "left" ? "bg-[#383838] text-white" : "text-[#808080]"}\`}><AlignLeft className="w-3 h-3" /></button>
                     <button onClick={() => setTextAlign("center")} className={\`p-1.5 rounded hover:bg-[#383838] \${textAlign === "center" ? "bg-[#383838] text-white" : "text-[#808080]"}\`}><AlignCenter className="w-3 h-3" /></button>
                     <button onClick={() => setTextAlign("right")} className={\`p-1.5 rounded hover:bg-[#383838] \${textAlign === "right" ? "bg-[#383838] text-white" : "text-[#808080]"}\`}><AlignRight className="w-3 h-3" /></button>
                   </div>
                </div>
              </div>
            </section>
          )}

          {/* Fill */}
          <section className="p-4 border-b border-[#383838]">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-bold">Fill</label>
              <div className="flex gap-3 text-[#808080]">
                <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            {selectedLayer === 'background' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 group hover:bg-[#1E1E1E] -mx-2 px-2 py-1 rounded cursor-pointer">
                  <div className="w-4 h-4 rounded-sm border border-[#383838] shrink-0 relative overflow-hidden">
                    <input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                  </div>
                  <input type="text" value={gradientStart.toUpperCase().replace('#', '')} onChange={e => setGradientStart('#' + e.target.value)} className="bg-transparent border-none py-1 text-[10px] text-white outline-none w-16 uppercase" />
                  <div className="flex-1" />
                  <input type="text" value="100%" className="bg-transparent border-none text-[10px] text-[#808080] outline-none w-10 text-right" readOnly />
                  <Eye className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                  <Minus className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex items-center gap-2 group hover:bg-[#1E1E1E] -mx-2 px-2 py-1 rounded cursor-pointer">
                  <div className="w-4 h-4 rounded-sm border border-[#383838] shrink-0 relative overflow-hidden">
                    <input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                  </div>
                  <input type="text" value={gradientEnd.toUpperCase().replace('#', '')} onChange={e => setGradientEnd('#' + e.target.value)} className="bg-transparent border-none py-1 text-[10px] text-white outline-none w-16 uppercase" />
                  <div className="flex-1" />
                  <input type="text" value={gradientOpacity + "%"} onChange={e => setGradientOpacity(Number(e.target.value.replace("%","")))} className="bg-transparent border-none text-[10px] text-[#808080] outline-none w-10 text-right" />
                  <Eye className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                  <Minus className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group hover:bg-[#1E1E1E] -mx-2 px-2 py-1 rounded cursor-pointer">
                <div className="w-4 h-4 rounded-sm border border-[#383838] shrink-0 relative overflow-hidden">
                  <input type="color" value={textGradientEnd} onChange={e => { setTextGradientEnd(e.target.value); setTextGradientStart(e.target.value); }} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                </div>
                <input type="text" value={textGradientEnd.toUpperCase().replace('#', '')} onChange={e => { const v = '#' + e.target.value; setTextGradientEnd(v); setTextGradientStart(v); }} className="bg-transparent border-none py-1 text-[10px] text-white outline-none w-16 uppercase" />
                <div className="flex-1" />
                <input type="text" value="100%" className="bg-transparent border-none text-[10px] text-[#808080] outline-none w-10 text-right" readOnly />
                <Eye className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                <Minus className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
              </div>
            )}
          </section>

          {/* Stroke (Only for Text) */}
          {(selectedLayer === "title" || selectedLayer === "tagline" || selectedLayer === "details" || selectedLayer === "tags") && (
            <section className="p-4 border-b border-[#383838]">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-bold">Stroke</label>
                <div className="flex gap-3 text-[#808080]">
                  <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                  <Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 group hover:bg-[#1E1E1E] -mx-2 px-2 py-1 rounded cursor-pointer">
                  <div className="w-4 h-4 rounded-sm border border-[#383838] shrink-0 relative overflow-hidden bg-white">
                    <input type="color" value={textStrokeColor} onChange={e => setTextStrokeColor(e.target.value)} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                  </div>
                  <input type="text" value={textStrokeColor.toUpperCase().replace('#', '')} onChange={e => setTextStrokeColor('#' + e.target.value)} className="bg-transparent border-none py-1 text-[10px] text-white outline-none w-16 uppercase" />
                  <div className="flex-1" />
                  <input type="text" value="100%" className="bg-transparent border-none text-[10px] text-[#808080] outline-none w-10 text-right" readOnly />
                  <EyeOff className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                  <Minus className="w-3.5 h-3.5 text-[#808080] ml-2 hover:text-white cursor-pointer shrink-0 opacity-0 group-hover:opacity-100" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] text-[#808080]">Position</span>
                     <div className="relative group">
                       <select value={strokePosition} onChange={(e) => setStrokePosition(e.target.value as any)} className="w-full appearance-none bg-[#1E1E1E] border border-transparent hover:border-[#444] focus:border-[#FBBF24]/50 rounded px-2.5 py-1.5 outline-none cursor-pointer text-white">
                         <option value="Outside">Outside</option>
                         <option value="Inside">Inside</option>
                         <option value="Center">Center</option>
                       </select>
                       <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#808080] pointer-events-none" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] text-[#808080]">Weight</span>
                     <div className="flex items-center bg-[#1E1E1E] border border-transparent hover:border-[#444] focus-within:border-[#FBBF24]/50 rounded px-2 overflow-hidden">
                       <span className="text-[#808080] pr-1.5 flex items-center"><AlignHorizontalSpaceAround className="w-3 h-3" /></span>
                       <input type="number" value={textStrokeWidth} onChange={e => setTextStrokeWidth(Number(e.target.value))} className="w-full bg-transparent border-none py-1.5 outline-none text-[10px] text-white" />
                     </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Effects */}
          <section className="p-4 border-b border-[#383838]">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-bold">Effects</label>
              <div className="flex gap-3 text-[#808080]">
                <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-white group cursor-pointer hover:bg-[#1E1E1E] -mx-2 px-2 py-1 rounded">
              <div className="flex items-center gap-2">
                <span>{selectedLayer === 'background' ? 'Layer blur' : 'Drop shadow'}</span>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100">
                <Droplets className="w-3.5 h-3.5 text-[#808080] hover:text-white" />
                <Eye className="w-3.5 h-3.5 text-[#808080] hover:text-white" />
                <Minus className="w-3.5 h-3.5 text-[#808080] hover:text-white" />
              </div>
            </div>
            
            {selectedLayer === 'background' ? (
              <div className="mt-3 bg-[#1E1E1E] border border-[#383838] rounded-xl p-3">
                <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                  <span className="text-[10px] text-[#808080]">Blur</span>
                  <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded overflow-hidden">
                    <span className="pl-2 text-[#808080] text-[9px]"><LayoutGrid className="w-2.5 h-2.5" /></span>
                    <input type="number" value={layerBlur} onChange={e => setLayerBlur(Number(e.target.value))} className="w-full bg-transparent border-none py-1.5 pl-2 pr-1 outline-none text-[10px] text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 bg-[#1E1E1E] border border-[#383838] rounded-xl p-3 space-y-3">
                <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                  <span className="text-[10px] text-[#808080]">Position</span>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded overflow-hidden flex-1">
                      <span className="pl-2 text-[#808080] text-[9px]">X</span>
                      <input type="number" value={textShadowX} onChange={e => setTextShadowX(Number(e.target.value))} className="w-full bg-transparent border-none py-1.5 pl-2 pr-1 outline-none text-[10px] text-white" />
                    </div>
                    <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded overflow-hidden flex-1">
                      <span className="pl-2 text-[#808080] text-[9px]">Y</span>
                      <input type="number" value={textShadowY} onChange={e => setTextShadowY(Number(e.target.value))} className="w-full bg-transparent border-none py-1.5 pl-2 pr-1 outline-none text-[10px] text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                  <span className="text-[10px] text-[#808080]">Blur</span>
                  <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded overflow-hidden">
                    <span className="pl-2 text-[#808080] text-[9px]"><LayoutGrid className="w-2.5 h-2.5" /></span>
                    <input type="number" value={textShadowBlur} onChange={e => setTextShadowBlur(Number(e.target.value))} className="w-full bg-transparent border-none py-1.5 pl-2 pr-1 outline-none text-[10px] text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                  <span className="text-[10px] text-[#808080]">Spread</span>
                  <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded overflow-hidden opacity-50 cursor-not-allowed">
                    <span className="pl-2 text-[#808080] text-[9px]"><Sparkles className="w-2.5 h-2.5" /></span>
                    <input type="number" value={0} disabled className="w-full bg-transparent border-none py-1.5 pl-2 pr-1 outline-none text-[10px] text-white cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                  <span className="text-[10px] text-[#808080]">Color</span>
                  <div className="flex items-center bg-[#2C2C2C] border border-transparent rounded px-2">
                    <div className="w-3 h-3 rounded-sm border border-[#383838] relative overflow-hidden flex-shrink-0">
                      <input type="color" value={textShadowColor} onChange={e => setTextShadowColor(e.target.value)} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                    </div>
                    <input type="text" value={textShadowColor.toUpperCase().replace('#', '')} onChange={e => setTextShadowColor('#' + e.target.value)} className="flex-1 bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white uppercase" />
                    <div className="w-px h-3 bg-[#444] mx-2" />
                    <input type="text" value={textShadowOpacity + "%"} onChange={e => setTextShadowOpacity(Number(e.target.value.replace("%","")))} className="w-10 bg-transparent border-none py-1.5 text-right outline-none text-[10px] text-white" />
                  </div>
                </div>
              </div>
            )}
          </section>
          
          {/* Image Adjustments (Only for background) */}
          {selectedLayer === 'background' && (
            <section className="p-4 border-b border-[#383838]">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-bold">Adjustments</label>
                <Sliders className="w-3.5 h-3.5 text-[#808080]" />
              </div>
              <div className="grid grid-cols-[1fr_40px] gap-x-2 gap-y-3 items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#808080] w-14">Exposure</span>
                  <input type="range" min={0} max={200} value={exposure} onChange={e => setExposure(Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{exposure}%</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[#808080] w-14">Contrast</span>
                  <input type="range" min={0} max={200} value={contrast} onChange={e => setContrast(Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{contrast}%</span>

                <div className="flex items-center gap-2">
                  <span className="text-[#808080] w-14">Saturation</span>
                  <input type="range" min={0} max={200} value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{saturation}%</span>

                <div className="flex items-center gap-2">
                  <span className="text-[#808080] w-14">Temp</span>
                  <input type="range" min={0} max={100} value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{temperature}</span>
              </div>
            </section>
          )}

          {/* Label Rules (Only for details, tags) */}
          {(selectedLayer === 'details' || selectedLayer === 'tags' || selectedLayer === 'footer' || selectedLayer === 'header') && (
            <section className="p-4 border-b border-[#383838]">
              <label className="text-[11px] font-bold mb-3 block">Label Rules</label>
              <div className="flex gap-2 mb-3 text-[10px]">
                <button onClick={() => setLabelsBold(!labelsBold)} className={\`flex-1 py-1.5 rounded font-medium \${labelsBold ? "bg-[#1E1E1E] text-white border border-[#444]" : "bg-[#2C2C2C] text-[#808080] border border-transparent"}\`}>Bold</button>
                <button onClick={() => setLabelsUppercase(!labelsUppercase)} className={\`flex-1 py-1.5 rounded font-medium \${labelsUppercase ? "bg-[#1E1E1E] text-white border border-[#444]" : "bg-[#2C2C2C] text-[#808080] border border-transparent"}\`}>Uppercase</button>
              </div>
              <div className="p-3 bg-[#1E1E1E] border border-[#383838] rounded text-[10px] text-[#808080]">
                Edit values directly on the canvas.
              </div>
            </section>
          )}

          {/* Export */}
          <section className="p-4 flex items-center justify-between">
             <label className="text-[11px] font-bold">Export</label>
             <Plus className="w-3.5 h-3.5 text-[#808080] hover:text-white cursor-pointer" />
          </section>
        </div>
`;
  
  content = content.substring(0, start) + newPanel + '\n          ' + content.substring(end);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced right panel using script.');
} else {
  console.log('Could not find start or end bounds for replacement.');
}
