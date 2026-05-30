import React from "react";
import { FileText, Award, ExternalLink } from "lucide-react";
import { ARTBOARD_POSITIONS, getCertificateUrl, FORMATS } from "../constants";
import { Layer, DesignTab, FillSettings } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import DesignLoader from "@/components/ui/DesignLoader";
import ArtboardOverlay from "./ArtboardOverlay";

const getArtboardLabelSizes = (artboardId: string) => {
  switch (artboardId) {
    case 'a3-poster':
      return { label: '72px', dim: '56px', gap: '16px', mb: '24px' };
    case 'banner':
      return { label: '50px', dim: '40px', gap: '12px', mb: '16px' };
    case 'forms-header':
      return { label: '34px', dim: '28px', gap: '8px', mb: '12px' };
    case 'standee':
      return { label: '26px', dim: '22px', gap: '6px', mb: '10px' };
    case 'ig-poster':
    case 'wa-poster':
    default:
      return { label: '22px', dim: '18px', gap: '6px', mb: '8px' };
  }
};

export interface CanvasAreaProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  posterRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isPanning: boolean;
  pan: { x: number; y: number };
  zoom: number;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleResizeMouseDown?: (e: React.MouseEvent, id: string, handle: string, layer: Layer) => void;
  selectedArtboard: string | null;
  setSelectedArtboard: (v: DesignTab) => void;
  activeTab: DesignTab | string | null;
  setActiveTab: (v: DesignTab) => void;
  setActiveTool?: (v: import('../types').ActiveTool) => void;
  selectedLayer: Layer | null;
  setSelectedLayer: (v: Layer) => void;
  imageGen: any;
  layerBlur: number;
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  backgroundFill: FillSettings;
  grainOpacity: number;
  editIntro: string;
  setEditIntro: (v: string) => void;
  aiTitleImage: string | null;
  setAiTitleImage: (v: string | null) => void;
  editTitle: string;
  setEditTitle: (v: string) => void;
  titleFont: string;
  textBackdropBlur: number;
  titleBold: boolean;
  textFill: FillSettings;
  textStrokeWidth: number;
  textStrokeColor: string;
  textStrokeFill?: FillSettings;
  textStrokeOpacity: number;
  strokePosition: string;
  textShadowOpacity: number;
  editSubtitle: string;
  setEditSubtitle: (v: string) => void;
  bodyFont: string;
  editDate: string;
  setEditDate: (v: string) => void;
  editTime: string;
  setEditTime: (v: string) => void;
  editVenue: string;
  setEditVenue: (v: string) => void;
  editFee: string;
  setEditFee: (v: string) => void;
  labelsBold: boolean;
  labelsUppercase: boolean;
  editTeamSize: string;
  setEditTeamSize: (v: string) => void;
  editPrizePool: string;
  setEditPrizePool: (v: string) => void;
  editPoc1: string;
  setEditPoc1: (v: string) => void;
  editPoc2: string;
  setEditPoc2: (v: string) => void;
  editScanText: string;
  setEditScanText: (v: string) => void;
  logos?: {
    club?: string;
    main?: string;
    collab?: string;
    extra?: string;
    extra2?: string;
    extra3?: string;
  };
  eventSubType?: string;
  customArtboards?: import('../types').CustomArtboard[];
  setCustomArtboards?: (v: import('../types').CustomArtboard[]) => void;
  isDrawing?: boolean;
  drawStartPoint?: { x: number, y: number };
  currentDrawPoint?: { x: number, y: number };
  activeTool?: import('../types').ActiveTool;
  activeShape?: import('../types').ShapeType;
  customElements?: import('../types').CustomElement[];
  setCustomElements?: (v: import('../types').CustomElement[]) => void;
  selectedElementId?: string | null;
  setSelectedElementId?: (v: string | null) => void;
  handleElementMouseDown?: (e: React.MouseEvent, id: string, startX: number, startY: number, layer: import('../types').Layer) => void;
  currentPenPoints?: { x: number, y: number }[];
  peers?: Record<string, import('@/hooks/useMultiplayer').Peer>;
  layerOverrides?: Record<string, any>;
}

export default function CanvasArea(props: CanvasAreaProps) {
  const {
    canvasContainerRef, posterRef, canvasRef, isPanning, pan, zoom,
    handleCanvasMouseDown,
    selectedArtboard, setSelectedArtboard, activeTab, setActiveTab, setActiveTool,
    selectedLayer, setSelectedLayer,
    imageGen, layerBlur, exposure, contrast, saturation, temperature, tint,
    backgroundFill, grainOpacity,
    eventSubType, customArtboards = [], setCustomArtboards,
    isDrawing = false, drawStartPoint = { x: 0, y: 0 }, currentDrawPoint = { x: 0, y: 0 },
    activeTool = 'select', activeShape = 'rectangle',
    customElements = [], setCustomElements,
    selectedElementId, setSelectedElementId, handleElementMouseDown, handleResizeMouseDown,
    currentPenPoints = [], peers = {}, layerOverrides = {}
  } = props;

  const validArtboards = ["a3-poster", "ig-poster", "wa-poster", "banner", "standee"];

  const generatePolygonPoints = (width: number, height: number, edges: number) => {
    const points = [];
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2;
    for (let i = 0; i < edges; i++) {
      const angle = (i * 2 * Math.PI) / edges - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return points.join(" ");
  };

  const renderBackground = () => (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none" />
      {(typeof imageGen.result === 'string' && (imageGen.result.startsWith("data:image") || imageGen.result.startsWith("http"))) && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 pointer-events-none"
          style={{
            backgroundImage: `url(${imageGen.result})`,
            filter: `blur(${layerBlur}px) brightness(${exposure}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${temperature > 0 ? temperature : 0}%) hue-rotate(${tint}deg)`,
            transform: 'scale(1.05)'
          }}
        />
      )}
      {typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image/svg") && (
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundImage: `url(${imageGen.result})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <div
        className="absolute inset-0 transition-all duration-500 pointer-events-none"
        style={{
          background: (() => {
            if (backgroundFill.type === 'solid') {
              return backgroundFill.stops[0]?.color || '#000000';
            }
            const sortedStops = [...backgroundFill.stops].sort((a, b) => a.position - b.position);
            const stopsString = sortedStops.map(s => {
              const alpha = Math.round((s.opacity / 100) * 255).toString(16).padStart(2, '0');
              return `${s.color}${alpha} ${s.position}%`;
            }).join(', ');
            
            if (backgroundFill.type === 'radial') {
              return `radial-gradient(circle, ${stopsString})`;
            }
            return `linear-gradient(${backgroundFill.angle}deg, ${stopsString})`;
          })(),
          opacity: backgroundFill.globalOpacity / 100
        }}
      />
      {grainOpacity > 0 && (
        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: grainOpacity / 100
          }}
        />
      )}
      <AnimatePresence>
        {imageGen.status === "generating" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="scale-50">
              <DesignLoader />
              <p className="text-[8px] text-white font-medium text-center mt-2 animate-pulse">Designing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div
      ref={canvasContainerRef}
      className="flex-1 w-full h-full overflow-hidden relative"
      style={{ cursor: isPanning ? 'grabbing' : 'default', background: '#121212' }}
      onMouseDown={handleCanvasMouseDown}
    >
      <div id="canvas-dot-grid-wrapper" className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div id="canvas-dot-grid" className="absolute -inset-[200px]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          transform: `translate(${pan.x % (20 * zoom)}px, ${pan.y % (20 * zoom)}px)`,
          willChange: 'transform'
        }} />
      </div>

      <div id="canvas-pan-wrapper" className="absolute" style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, willChange: 'transform' }}>
        <div id="canvas-zoom-wrapper" style={{ zoom: zoom }}>
        
        {/* Render all full-fidelity synchronized artboards */}
        {validArtboards.map((artboardId) => {
          const fmt = FORMATS.find(f => f.id === artboardId);
          const pos = ARTBOARD_POSITIONS[artboardId as keyof typeof ARTBOARD_POSITIONS];
          const isArtboardSelected = selectedArtboard === artboardId;
          const isTabActive = activeTab === artboardId;
          
          const labelSizes = getArtboardLabelSizes(artboardId);
          return (
            <div
                key={artboardId}
                className="absolute"
                style={{ left: pos.x, top: pos.y }}
                onMouseDownCapture={() => setActiveTab(artboardId as DesignTab)}
              >
                <div 
                  className="flex items-center cursor-pointer w-max absolute"
                  style={{ bottom: `calc(100% + ${labelSizes.mb})`, left: 0, gap: labelSizes.gap }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedArtboard(artboardId as DesignTab);
                    setActiveTab(artboardId as DesignTab);
                    if (setSelectedElementId) setSelectedElementId(null);
                    setSelectedLayer('background');
                  }}
                >
                  <span className="text-zinc-500 font-medium hover:text-white transition-colors" style={{ fontSize: labelSizes.label }}>{fmt?.label}</span>
                  <span className="text-[#555]" style={{ fontSize: labelSizes.dim }}>{pos.w}×{pos.h}</span>
                </div>
              <div
                id={"artboard-" + artboardId}
                className={`relative transition-shadow duration-200 ${isArtboardSelected ? "ring-2 ring-gold-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "ring-1 ring-[#383838]"}`}
                style={{ width: pos.w, height: pos.h }}
              >
                <div ref={isTabActive ? posterRef : null} className="relative w-full h-full bg-black overflow-hidden">
                  {renderBackground()}
                  
                  {/* Dynamic Scaling Wrapper based on Artboard width */}
                  <div className="absolute inset-0" style={{ fontSize: `${Number(pos.w) / 100}px` }}>
                     <ArtboardOverlay {...props} isActive={isTabActive} layerOverrides={layerOverrides} artboardId={artboardId} logos={props.logos} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ─── FORMS HEADER ARTBOARD (Preview Only) ──────────────────────── */}
        <div
          className="absolute"
          style={{ left: ARTBOARD_POSITIONS["forms-header"].x, top: ARTBOARD_POSITIONS["forms-header"].y }}
          onMouseDownCapture={() => setActiveTab("forms-header")}
        >
          <div 
            className="flex items-center cursor-pointer w-max absolute"
            style={{ bottom: `calc(100% + ${getArtboardLabelSizes("forms-header").mb})`, left: 0, gap: getArtboardLabelSizes("forms-header").gap }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setSelectedArtboard("forms-header");
              setActiveTab("forms-header");
              if (setSelectedElementId) setSelectedElementId(null);
              setSelectedLayer('background');
            }}
          >
            <span className="text-zinc-500 font-medium hover:text-white transition-colors" style={{ fontSize: getArtboardLabelSizes("forms-header").label }}>Forms Header</span>
            <span className="text-[#555]" style={{ fontSize: getArtboardLabelSizes("forms-header").dim }}>1600×400</span>
          </div>
          <div
            id="artboard-forms-header"
            className={`relative bg-black flex items-center justify-center transition-shadow duration-200 ${selectedArtboard === "forms-header" ? "ring-2 ring-gold-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "ring-1 ring-[#383838]"}`}
            style={{ width: ARTBOARD_POSITIONS["forms-header"].w, height: ARTBOARD_POSITIONS["forms-header"].h }}
          >
            <div className="text-center space-y-2 p-4">
              <FileText className="w-8 h-8 text-[#383838] mx-auto" />
              <p className="text-[10px] text-[#555]">Forms Header</p>
              <p className="text-[8px] text-[#444]">Google Forms / Registration</p>
            </div>
          </div>
        </div>

        {/* Render Custom Artboards */}
        {customArtboards.map((artboard) => (
          <div
            key={artboard.id}
            id={`custom_artboard-${artboard.id}`}
            onMouseDown={(e) => {
              if (handleElementMouseDown) handleElementMouseDown(e, artboard.id, artboard.x, artboard.y, "custom_artboard");
            }}
            onClick={(e) => {
               e.stopPropagation();
               setSelectedLayer("custom_artboard");
            }}
            className={`absolute border-2 transition-colors transition-shadow ${selectedLayer === 'custom_artboard' ? 'border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-50' : 'border-[#333] hover:border-[#666] z-10'}`}
            style={{
              left: `${artboard.x}px`,
              top: `${artboard.y}px`,
              width: `${artboard.width}px`,
              height: `${artboard.height}px`,
              backgroundColor: artboard.fill,
            }}
          >
            <div className="absolute -top-6 left-0 text-[10px] font-medium text-zinc-400 bg-black/50 px-2 py-0.5 rounded-t-md">
              {artboard.label}
            </div>
          </div>
        ))}
        
        {/* Render Custom Elements */}
        {customElements.map((el) => {
          const isSelected = selectedLayer === "custom_element" && selectedElementId === el.id;
          const selectingPeers = Object.values(peers).filter(p => p.selectedElementId === el.id);
          const firstSelectingPeer = selectingPeers[0];
          
          const getCSSFill = (fillObj: import('../types').FillSettings | string | undefined | null) => {
            if (!fillObj || fillObj === 'transparent' || fillObj === 'none') return 'transparent';
            if (typeof fillObj === 'string') return fillObj;
            if (fillObj.type === 'solid') return `${fillObj.stops[0]?.color || '#000000'}${Math.round(((fillObj.stops[0]?.opacity ?? 100) / 100 * (fillObj.globalOpacity ?? 100) / 100) * 255).toString(16).padStart(2, '0')}`;
            const sortedStops = [...fillObj.stops].sort((a, b) => a.position - b.position);
            const stopsStr = sortedStops.map(s => `${s.color}${Math.round(((s.opacity ?? 100) / 100 * (fillObj.globalOpacity ?? 100) / 100) * 255).toString(16).padStart(2, '0')} ${s.position}%`).join(', ');
            return fillObj.type === 'radial' ? `radial-gradient(circle, ${stopsStr})` : `linear-gradient(${fillObj.angle || 0}deg, ${stopsStr})`;
          };
          
          const bgFill = getCSSFill(el.fill);
          const strokeFill = getCSSFill(el.stroke as any);
          const isStrokeSolid = strokeFill.startsWith('#') || strokeFill.startsWith('rgb');
          
          if (el.type !== 'pen' && el.subType !== 'polygon') {
            const hasStroke = (el.strokeWidth || 0) > 0 && strokeFill !== 'transparent';
            const strokeInset = el.strokePosition === 'Outside' ? -(el.strokeWidth || 0) : (el.strokePosition === 'Center' ? -(el.strokeWidth || 0) / 2 : 0);
            
            const calcRadius = (base: number | undefined) => {
              const r = base || 0;
              return r === 0 ? 0 : Math.max(0, r - strokeInset);
            };

            const visibleEffects = el.effects?.filter(e => e.isVisible) || [];
            const glassEffect = visibleEffects.find(e => e.type === 'glass');
            const effectiveBgFill = glassEffect ? 'rgba(255, 255, 255, 0.1)' : bgFill;
            
            const boxShadows = visibleEffects
              .filter(e => e.type === 'innerShadow')
              .map(e => `inset ${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')}`)
              .join(', ');

            const noiseEffect = visibleEffects.find(e => e.type === 'noise');
            const textureEffect = visibleEffects.find(e => e.type === 'texture');

            const dropShadows = visibleEffects
              .filter(e => e.type === 'dropShadow')
              .map(e => `drop-shadow(${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')})`)
              .join(' ');
              
            const layerBlur = visibleEffects.find(e => e.type === 'layerBlur');
            const baseFilterStr = layerBlur ? `blur(${layerBlur.blur || 0}px)` : '';
            const filterStr = [baseFilterStr, dropShadows, textureEffect ? `url(#texture-${el.id})` : ''].filter(Boolean).join(' ');

            const maskImageStr = layerBlur?.blurType === 'progressive' ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' : undefined;
            const backdropBlurs = visibleEffects
              .filter(e => e.type === 'backgroundBlur' || e.type === 'glass')
              .map(e => `blur(${e.blur || 0}px)`);
            const backdropFilterStr = backdropBlurs.length > 0 ? backdropBlurs.join(' ') : undefined;

            return (
              <div
                key={el.id}
                id={`custom_element-${el.id}`}
                onMouseDown={(e) => { if (handleElementMouseDown) handleElementMouseDown(e, el.id, el.x, el.y, "custom_element"); }}
                onClick={(e) => { e.stopPropagation(); setSelectedLayer("custom_element"); if (setSelectedElementId) setSelectedElementId(el.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); if (setActiveTool) setActiveTool('text'); if (setSelectedElementId) setSelectedElementId(el.id); setSelectedLayer("custom_element"); }}
                className={`absolute transition-shadow ${isSelected ? 'z-50' : 'z-20'}`}
                style={{
                  left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, opacity: el.opacity ?? 1,
                  filter: filterStr || undefined
                }}
              >
                {textureEffect && (
                  <svg className="absolute w-0 h-0 pointer-events-none">
                    <defs>
                      <filter id={`texture-${el.id}`}>
                        <feTurbulence type="fractalNoise" baseFrequency={(textureEffect.radius || 10) / 100} numOctaves="2" result="turbulence" />
                        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>
                  </svg>
                )}
                {/* Background Div */ }
                {(effectiveBgFill !== 'transparent' || backdropFilterStr || glassEffect) && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    ...(effectiveBgFill.includes('gradient') || effectiveBgFill.includes(', ') ? { backgroundImage: effectiveBgFill } : { backgroundColor: effectiveBgFill }),
                    borderRadius: el.subType === 'ellipse' ? '50%' : (el.cornerRadii ? `${el.cornerRadii[0]}px ${el.cornerRadii[1]}px ${el.cornerRadii[2]}px ${el.cornerRadii[3]}px` : `${el.cornerRadius || 0}px`),
                    boxShadow: boxShadows || undefined,
                    backdropFilter: backdropFilterStr,
                    WebkitBackdropFilter: backdropFilterStr,
                    maskImage: maskImageStr,
                    WebkitMaskImage: maskImageStr,
                    border: glassEffect ? '1px solid rgba(255, 255, 255, 0.2)' : undefined
                  }}>
                  </div>
                )}

                {/* Stroke Div */}
                {hasStroke && (
                  <div className="absolute pointer-events-none" style={{
                    inset: `${strokeInset}px`,
                    border: isStrokeSolid ? `${el.strokeWidth}px solid ${strokeFill}` : `${el.strokeWidth}px solid transparent`,
                    backgroundImage: isStrokeSolid ? undefined : `linear-gradient(transparent, transparent), ${strokeFill}`,
                    backgroundClip: isStrokeSolid ? undefined : 'padding-box, border-box',
                    backgroundOrigin: isStrokeSolid ? undefined : 'padding-box, border-box',
                    borderRadius: el.subType === 'ellipse' ? '50%' : (el.cornerRadii ? `${calcRadius(el.cornerRadii[0])}px ${calcRadius(el.cornerRadii[1])}px ${calcRadius(el.cornerRadii[2])}px ${calcRadius(el.cornerRadii[3])}px` : `${calcRadius(el.cornerRadius)}px`)
                  }} />
                )}
              {isSelected && (
                <div className="absolute -inset-0 border-[1.5px] border-gold-500 z-50 pointer-events-none">
                  {/* Edges */}
                  <div className="absolute -top-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top', 'custom_element')} />
                  <div className="absolute -bottom-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom', 'custom_element')} />
                  <div className="absolute top-1.5 bottom-1.5 -left-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'left', 'custom_element')} />
                  <div className="absolute top-1.5 bottom-1.5 -right-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'right', 'custom_element')} />

                  {/* Top Left */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top-left', 'custom_element')} />
                  {/* Top Right */}
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top-right', 'custom_element')} />
                  {/* Bottom Left */}
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom-left', 'custom_element')} />
                  {/* Bottom Right */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom-right', 'custom_element')} />
                  
                  {/* Dimensions Tooltip */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-medium tracking-wide pointer-events-none whitespace-nowrap shadow-sm">
                    {Math.round(el.width)} &times; {Math.round(el.height)}
                  </div>
                </div>
              )}
              {firstSelectingPeer && !isSelected && (
                <div className="absolute -inset-0.5 z-40 pointer-events-none transition-colors border-2" style={{ borderColor: firstSelectingPeer.color }}>
                  <div 
                    className="absolute -top-6 left-[-2px] px-2 py-1 rounded-sm text-[8px] font-bold text-white uppercase tracking-widest whitespace-nowrap shadow-md" 
                    style={{ backgroundColor: firstSelectingPeer.color }}
                  >
                    {firstSelectingPeer.name}
                  </div>
                </div>
              )}
                {el.type === 'text' && (
                  <span 
                    contentEditable={isSelected && activeTool === 'text'}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === el.id ? { ...c, text: e.currentTarget.innerText } : c));
                      }
                    }}
                    className={`absolute left-0 whitespace-pre-wrap outline-none caret-white overflow-visible ${isSelected && activeTool === 'text' ? 'cursor-text pointer-events-auto' : 'select-none pointer-events-auto'}`}
                    style={{ 
                      top: `${el.textOffsetY || 0}px`,
                      fontFamily: el.fontFamily, 
                      fontSize: `${el.fontSize}px`, 
                      fontWeight: el.fontWeight || 'normal',
                      fontStyle: el.fontStyle || 'normal',
                      lineHeight: el.lineHeight || '1.2',
                      letterSpacing: el.letterSpacing ? `${Number(el.letterSpacing) / 100}em` : 'normal',
                      color: '#ffffff',
                      width: `${el.width}px`,
                      wordBreak: 'break-word',
                    }}
                  >
                    {el.text}
                  </span>
                )}
                {el.type === 'image' && el.imageUrl && (
                  <img 
                    src={el.imageUrl} 
                    alt="Custom Graphic" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
                    draggable={false} 
                  />
                )}
            </div>
          );
          }
          
          return (
            <div
              key={el.id}
              id={`custom_element-${el.id}`}
              onMouseDown={(e) => {
                if (handleElementMouseDown) handleElementMouseDown(e, el.id, el.x, el.y, "custom_element");
              }}
              onClick={(e) => {
                 e.stopPropagation();
                 setSelectedLayer("custom_element");
                 if (setSelectedElementId) setSelectedElementId(el.id);
              }}
              onDoubleClick={(e) => {
                 e.stopPropagation();
                 if (setActiveTool) setActiveTool('text');
                 if (setSelectedElementId) setSelectedElementId(el.id);
                 setSelectedLayer("custom_element");
              }}
              className={`absolute transition-shadow ${
                isSelected ? 'z-50' : 'z-20'
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                opacity: el.opacity ?? 1,
                filter: (el.effects?.find(e => e.type === 'dropShadow' && e.isVisible))
                  ? el.effects.filter(e => e.type === 'dropShadow' && e.isVisible)
                      .map(e => `drop-shadow(${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')})`)
                      .join(' ')
                  : undefined
              }}
            >
              {isSelected && (
                <div className="absolute -inset-0 border-[1.5px] border-gold-500 z-50 pointer-events-none">
                  {/* Edges */}
                  <div className="absolute -top-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top', 'custom_element')} />
                  <div className="absolute -bottom-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom', 'custom_element')} />
                  <div className="absolute top-1.5 bottom-1.5 -left-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'left', 'custom_element')} />
                  <div className="absolute top-1.5 bottom-1.5 -right-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'right', 'custom_element')} />

                  {/* Top Left */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top-left', 'custom_element')} />
                  {/* Top Right */}
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'top-right', 'custom_element')} />
                  {/* Bottom Left */}
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom-left', 'custom_element')} />
                  {/* Bottom Right */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, el.id, 'bottom-right', 'custom_element')} />
                  
                  {/* Dimensions Tooltip */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-medium tracking-wide pointer-events-none whitespace-nowrap shadow-sm">
                    {Math.round(el.width)} &times; {Math.round(el.height)}
                  </div>
                </div>
              )}
              {firstSelectingPeer && !isSelected && (
                <div className={`absolute -inset-0.5 z-40 pointer-events-none transition-colors ${el.type === 'pen' || el.subType === 'polygon' ? '' : 'border-2'}`} style={{ borderColor: firstSelectingPeer.color }}>
                  <div 
                    className="absolute -top-6 left-[-2px] px-2 py-1 rounded-sm text-[8px] font-bold text-white uppercase tracking-widest whitespace-nowrap shadow-md" 
                    style={{ backgroundColor: firstSelectingPeer.color }}
                  >
                    {firstSelectingPeer.name}
                  </div>
                </div>
              )}
              {(el.type === 'pen' || el.subType === 'polygon') && (
                <svg width="100%" height="100%" viewBox={`0 0 ${el.width} ${el.height}`} className="absolute inset-0 pointer-events-none overflow-visible">
                  <defs>
                    {typeof el.fill === 'object' && el.fill !== null && el.fill.type !== 'solid' && (
                      el.fill.type === 'linear' ? (
                        <linearGradient id={`grad-fill-${el.id}`} gradientTransform={`rotate(${el.fill.angle || 0})`}>
                          {[...(el.fill.stops || [])].sort((a, b) => a.position - b.position).map((s, i) => (
                             <stop key={i} offset={`${s.position}%`} stopColor={s.color} stopOpacity={((s.opacity ?? 100) / 100) * ((el.fill as any).globalOpacity ?? 100) / 100} />
                          ))}
                        </linearGradient>
                      ) : (
                        <radialGradient id={`grad-fill-${el.id}`}>
                          {[...(el.fill.stops || [])].sort((a, b) => a.position - b.position).map((s, i) => (
                             <stop key={i} offset={`${s.position}%`} stopColor={s.color} stopOpacity={((s.opacity ?? 100) / 100) * ((el.fill as any).globalOpacity ?? 100) / 100} />
                          ))}
                        </radialGradient>
                      )
                    )}
                    {typeof el.stroke === 'object' && el.stroke !== null && el.stroke.type !== 'solid' && (
                      el.stroke.type === 'linear' ? (
                        <linearGradient id={`grad-stroke-${el.id}`} gradientTransform={`rotate(${el.stroke.angle || 0})`}>
                          {[...(el.stroke.stops || [])].sort((a, b) => a.position - b.position).map((s, i) => (
                             <stop key={i} offset={`${s.position}%`} stopColor={s.color} stopOpacity={((s.opacity ?? 100) / 100) * ((el.stroke as any).globalOpacity ?? 100) / 100} />
                          ))}
                        </linearGradient>
                      ) : (
                        <radialGradient id={`grad-stroke-${el.id}`}>
                          {[...(el.stroke.stops || [])].sort((a, b) => a.position - b.position).map((s, i) => (
                             <stop key={i} offset={`${s.position}%`} stopColor={s.color} stopOpacity={((s.opacity ?? 100) / 100) * ((el.stroke as any).globalOpacity ?? 100) / 100} />
                          ))}
                        </radialGradient>
                      )
                    )}
                  </defs>
                  {el.type === 'pen' && el.points && (
                    <>
                      {(firstSelectingPeer) && (
                        <path
                          d={`M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')}${el.isClosed ? ' Z' : ''}`}
                          fill="none"
                          stroke={firstSelectingPeer?.color}
                          strokeWidth={(el.strokeWidth || 2) + 4}
                          strokeLinejoin="round"
                        />
                      )}
                      <path
                        d={`M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')}${el.isClosed ? ' Z' : ''}`}
                        fill={typeof el.fill === 'object' && el.fill !== null ? (el.fill.type === 'solid' ? (el.fill.stops[0]?.color || 'none') : `url(#grad-fill-${el.id})`) : (el.fill === 'transparent' ? 'none' : el.fill)}
                        stroke={typeof el.stroke === 'object' && el.stroke !== null ? (el.stroke.type === 'solid' ? (el.stroke.stops[0]?.color || 'none') : `url(#grad-stroke-${el.id})`) : (el.stroke || 'none')}
                        strokeWidth={(el.strokeWidth || 0) > 0 ? (el.strokePosition === 'Outside' ? (el.strokeWidth || 0) * 2 : (el.strokeWidth || 0)) : 0}
                        strokeLinejoin="round"
                        style={{ paintOrder: el.strokePosition === 'Outside' ? 'stroke fill' : (el.strokePosition === 'Inside' ? 'fill stroke' : 'normal') }}
                      />
                    </>
                  )}
                  {el.subType === 'polygon' && (
                    <>
                      {(firstSelectingPeer) && (
                        <polygon
                          points={generatePolygonPoints(el.width, el.height, el.edges || 3)}
                          fill="none"
                          stroke={firstSelectingPeer?.color}
                          strokeWidth={(el.strokeWidth || 2) + 4}
                          strokeLinejoin="round"
                        />
                      )}
                      <polygon
                        points={generatePolygonPoints(el.width, el.height, el.edges || 3)}
                        fill={typeof el.fill === 'object' && el.fill !== null ? (el.fill.type === 'solid' ? (el.fill.stops[0]?.color || 'none') : `url(#grad-fill-${el.id})`) : (el.fill === 'transparent' ? 'none' : el.fill)}
                        stroke={typeof el.stroke === 'object' && el.stroke !== null ? (el.stroke.type === 'solid' ? (el.stroke.stops[0]?.color || 'none') : `url(#grad-stroke-${el.id})`) : (el.stroke || 'none')}
                        strokeWidth={(el.strokeWidth || 0) > 0 ? (el.strokePosition === 'Outside' ? (el.strokeWidth || 0) * 2 : (el.strokeWidth || 0)) : 0}
                        strokeLinejoin="round"
                        style={{ paintOrder: el.strokePosition === 'Outside' ? 'stroke fill' : (el.strokePosition === 'Inside' ? 'fill stroke' : 'normal') }}
                      />
                    </>
                  )}
                </svg>
              )}
                {el.type === 'text' && (
                  <span 
                    contentEditable={isSelected && activeTool === 'text'}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === el.id ? { ...c, text: e.currentTarget.innerText } : c));
                      }
                    }}
                    className={`absolute left-0 whitespace-pre-wrap outline-none caret-white overflow-visible ${isSelected && activeTool === 'text' ? 'cursor-text pointer-events-auto' : 'select-none pointer-events-auto'}`}
                    style={{ 
                      top: `${el.textOffsetY || 0}px`,
                      fontFamily: el.fontFamily, 
                      fontSize: `${el.fontSize}px`, 
                      fontWeight: el.fontWeight || 'normal',
                      fontStyle: el.fontStyle || 'normal',
                      lineHeight: el.lineHeight || '1.2',
                      letterSpacing: el.letterSpacing ? `${Number(el.letterSpacing) / 100}em` : 'normal',
                      color: '#ffffff',
                      width: `${el.width}px`,
                      wordBreak: 'break-word',
                    }}
                  >
                    {el.text}
                  </span>
                )}

            </div>
          );
        })}

        {/* Render Temporary Drawing Preview */}
        {isDrawing && activeTool !== 'pen' && (
          <div
            className="absolute z-[100] border border-dashed border-white/70 bg-white/10 pointer-events-none"
            style={{
              left: Math.min(drawStartPoint.x, currentDrawPoint.x),
              top: Math.min(drawStartPoint.y, currentDrawPoint.y),
              width: Math.abs(currentDrawPoint.x - drawStartPoint.x),
              height: Math.abs(currentDrawPoint.y - drawStartPoint.y),
              borderRadius: activeTool === 'shape' && activeShape === 'ellipse' ? '50%' : '0px'
            }}
          />
        )}
        
        {/* Render Temporary Pen Preview */}
        {activeTool === 'pen' && currentPenPoints.length > 0 && (
          <svg className="absolute z-[100] pointer-events-none overflow-visible" style={{ left: 0, top: 0, width: 1, height: 1 }}>
            <path
              d={`M ${currentPenPoints.map(p => `${p.x} ${p.y}`).join(' L ')} L ${currentDrawPoint.x} ${currentDrawPoint.y}`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {currentPenPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#F59E0B" strokeWidth="2" />
            ))}
          </svg>
        )}

        {/* Render Multiplayer Peer Cursors */}
        {Object.values(peers).map((peer) => {
          if (!peer.cursor) return null;
          return (
            <div
              key={peer.id}
              className="absolute z-[110] peer-cursor-wrapper pointer-events-none flex flex-col items-start transition-all duration-100 ease-out"
              style={{
                left: `${peer.cursor.x}px`,
                top: `${peer.cursor.y}px`,
                transform: `scale(${1 / zoom})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Figma-like Cursor Arrow */}
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none" className="drop-shadow-lg" style={{ color: peer.color }}>
                <path d="M5.65376 2.15376C5.40263 1.90263 5 2.08064 5 2.43586V30.2223C5 30.6559 5.51654 30.8801 5.83023 30.5821L12.4414 24.2982C12.5935 24.1537 12.7981 24.0729 13.0084 24.0729H21.4359C21.7911 24.0729 21.9691 23.6703 21.718 23.4191L5.65376 2.15376Z" fill="currentColor" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <div 
                className="px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap drop-shadow-md ml-4 -mt-2 uppercase tracking-widest"
                style={{ backgroundColor: peer.color }}
              >
                {peer.name}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
