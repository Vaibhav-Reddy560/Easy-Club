import React from "react";
import { RefreshCw } from "lucide-react";
import AutoFitText from "@/components/ui/AutoFitText";
import { Layer, FillSettings } from "../types";
import { FORMATS, ARTBOARD_POSITIONS } from "../constants";

function FigmaBox({ isSelected, id, handleResizeMouseDown, layer }: { isSelected: boolean, id?: string, handleResizeMouseDown?: any, layer?: string }) {
  if (!isSelected) return null;
  if (!id || !handleResizeMouseDown || !layer) {
    return (
      <div className="absolute inset-0 pointer-events-none border border-gold-500 z-50">
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-gold-500" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-gold-500" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-gold-500" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-gold-500" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <div className="absolute -inset-0 border-[1.5px] border-gold-500 pointer-events-none" />
      {/* Edges */}
      <div className="absolute -top-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'top', layer)} />
      <div className="absolute -bottom-[5px] left-1.5 right-1.5 h-[10px] cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'bottom', layer)} />
      <div className="absolute top-1.5 bottom-1.5 -left-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'left', layer)} />
      <div className="absolute top-1.5 bottom-1.5 -right-[5px] w-[10px] cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'right', layer)} />

      {/* Corners */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'top-left', layer)} />
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'top-right', layer)} />
      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'bottom-left', layer)} />
      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-[1.5px] border-gold-500 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResizeMouseDown?.(e, id, 'bottom-right', layer)} />
    </div>
  );
}

export interface ArtboardOverlayProps {
  selectedLayer: Layer | null;
  setSelectedLayer: (v: Layer) => void;
  bodyFont: string;
  
  editIntro: string;
  setEditIntro: (v: string) => void;
  
  aiTitleImage: string | null;
  setAiTitleImage: (v: string | null) => void;
  editTitle: string;
  setEditTitle: (v: string) => void;
  titleFont: string;
  titleBold: boolean;
  textBackdropBlur: number;
  textFill: FillSettings;
  textStrokeWidth: number;
  textStrokeColor: string;
  textStrokeFill?: import('../types').FillSettings;
  textStrokeOpacity: number;
  strokePosition?: string;
  textShadowOpacity: number;
  
  editSubtitle: string;
  setEditSubtitle: (v: string) => void;
  
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
  isActive?: boolean;
  layerOverrides?: Record<string, import('../types').LayerOverride>;
  handleElementMouseDown?: (e: React.MouseEvent, id: string, startX: number, startY: number, layer: Layer) => void;
  handleResizeMouseDown?: (e: React.MouseEvent, id: string, handle: string, layer: Layer) => void;
  artboardId?: string;
  logos?: {
    club?: string;
    main?: string;
    collab?: string;
    extra?: string;
    extra2?: string;
    extra3?: string;
  };
}

const ArtboardContext = React.createContext<{
  isActive?: boolean;
  selectedLayer: Layer | null;
  handleElementMouseDown?: any;
  handleResizeMouseDown?: any;
  setSelectedLayer: any;
  artboardId?: string;
  layerOverrides: any;
} | null>(null);

const SubLayerWrapper = ({ id, children, className = "" }: { id: string, children: React.ReactNode, className?: string }) => {
  const ctx = React.useContext(ArtboardContext);
  if (!ctx) return <>{children}</>;
  
  const { isActive, selectedLayer, handleElementMouseDown, handleResizeMouseDown, setSelectedLayer, artboardId, layerOverrides } = ctx;
  
  const overrideKey = artboardId ? `${artboardId}_${id}` : id;
  const override = layerOverrides[overrideKey] || layerOverrides[id];
  const visibleEffects = override?.effects?.filter((e: any) => e.isVisible) || [];
  const textureEffect = visibleEffects.find((e: any) => e.type === 'texture');
  const noiseEffect = visibleEffects.find((e: any) => e.type === 'noise');

  const getOverrideStyle = (layerId: string): React.CSSProperties => {
    let style: React.CSSProperties = {};
    if (override) {
      if (typeof override.dx === 'number' && typeof override.dy === 'number') {
        style.transform = `translate(${Math.round(override.dx)}px, ${Math.round(override.dy)}px)`;
      } else if (typeof override.x === 'number' && typeof override.y === 'number') {
        style.transform = `translate(${Math.round(override.x)}px, ${Math.round(override.y)}px)`;
      }
      if (override.originalWidth) style.width = override.originalWidth;
      if (override.originalHeight) style.height = override.originalHeight;
      // We do NOT set style.width = override.width here because that applies to the outer wrapper!
      
      const glassEffect = visibleEffects.find((e: any) => e.type === 'glass');
      
      const boxShadows = visibleEffects
        .filter((e: any) => e.type === 'innerShadow')
        .map((e: any) => `inset ${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')}`)
        .join(', ');

      const dropShadows = visibleEffects
        .filter((e: any) => e.type === 'dropShadow')
        .map((e: any) => `drop-shadow(${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')})`)
        .join(' ');

      const layerBlur = visibleEffects.find((e: any) => e.type === 'layerBlur');
      const baseFilterStr = layerBlur ? `blur(${layerBlur.blur || 0}px)` : '';
      const textureStr = textureEffect ? `url(#texture-${id})` : '';
      const filterStr = [baseFilterStr, dropShadows, textureStr].filter(Boolean).join(' ');

      const maskImageStr = layerBlur?.blurType === 'progressive' ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' : undefined;

      const backdropBlurs = visibleEffects
        .filter((e: any) => e.type === 'backgroundBlur' || e.type === 'glass')
        .map((e: any) => `blur(${e.blur || 0}px)`);
      const backdropFilterStr = backdropBlurs.length > 0 ? backdropBlurs.join(' ') : undefined;

      if (boxShadows) style.boxShadow = boxShadows;
      if (filterStr) style.filter = filterStr;
      if (backdropFilterStr) {
        style.backdropFilter = backdropFilterStr;
        style.WebkitBackdropFilter = backdropFilterStr;
      }
      if (maskImageStr) {
        style.maskImage = maskImageStr;
        style.WebkitMaskImage = maskImageStr;
      }
      if (glassEffect) {
        style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        style.border = '1px solid rgba(255, 255, 255, 0.2)';
      }
    }
    return style;
  };

  return (
    <div 
      id={artboardId ? `${artboardId}-${id}` : `${id}-${id}`}
      className={`relative group/sublayer ${isActive ? 'cursor-pointer' : ''} ${className} ${isActive && selectedLayer === id ? 'z-[100]' : 'z-10'}`}
      style={getOverrideStyle(id)}
      onMouseDown={(e) => { 
        if (isActive && handleElementMouseDown) {
          e.stopPropagation();
          handleElementMouseDown(e, id, 0, 0, id as Layer);
        }
      }}
      onClick={(e) => { 
        if (isActive) { 
          e.stopPropagation(); 
          setSelectedLayer(id as Layer); 
        } 
      }}
    >
      {textureEffect && (
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <filter id={`texture-${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency={(textureEffect.radius || 10) / 100} numOctaves="2" result="turbulence" />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}
      {noiseEffect && (
        <div className="absolute inset-0 mix-blend-overlay pointer-events-none z-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: (noiseEffect.density || 50) / 100,
          borderRadius: 'inherit'
        }} />
      )}
      
      {/* Inner wrapper for resized elements to detach from flex layout */}
      <div 
        id={artboardId ? `inner-${artboardId}-${id}` : `inner-${id}`}
        style={override && (override.width !== undefined || override.height !== undefined) ? {
          position: 'absolute',
          left: 0,
          top: 0,
          width: override.width,
          height: override.height,
        } : {
          position: 'relative',
          width: id.startsWith('header-') && id !== 'header-intro' ? 'auto' : '100%',
          height: '100%'
        }}
      >
        {isActive && selectedLayer !== id && (
          <div className="absolute inset-0 group-hover/sublayer:ring-1 group-hover/sublayer:ring-gold-500/50 pointer-events-none z-10" />
        )}
        <FigmaBox isSelected={!!isActive && selectedLayer === id} id={id} handleResizeMouseDown={handleResizeMouseDown} layer={id} />
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ArtboardOverlay(props: ArtboardOverlayProps) {
  const {
    selectedLayer, setSelectedLayer, bodyFont, editIntro, setEditIntro, aiTitleImage,
    setAiTitleImage, editTitle, setEditTitle, titleFont, textBackdropBlur, titleBold,
    textFill, textStrokeWidth,
    textStrokeColor, textStrokeFill, textStrokeOpacity, strokePosition, textShadowOpacity, editSubtitle, setEditSubtitle, editDate, setEditDate,
    editTime, setEditTime, editVenue, setEditVenue, editFee, setEditFee, labelsBold,
    labelsUppercase, editTeamSize, setEditTeamSize, editPrizePool, setEditPrizePool,
    editPoc1, setEditPoc1, editPoc2, setEditPoc2, editScanText, setEditScanText, isActive, layerOverrides = {}, handleElementMouseDown, handleResizeMouseDown
  } = props;
  
  const getOverrideStyle = (layerId: string): React.CSSProperties => {
    const overrideKey = props.artboardId ? `${props.artboardId}_${layerId}` : layerId;
    const override = layerOverrides[overrideKey] || layerOverrides[layerId];
    
    let style: React.CSSProperties = {};
    if (override) {
      if (typeof override.dx === 'number' && typeof override.dy === 'number') {
        style.transform = `translate(${Math.round(override.dx)}px, ${Math.round(override.dy)}px)`;
      } else if (typeof override.x === 'number' && typeof override.y === 'number') {
        style.transform = `translate(${Math.round(override.x)}px, ${Math.round(override.y)}px)`;
      }
      if (override.width) style.width = override.width;
      if (override.height) style.height = override.height;
      
      const visibleEffects = override.effects?.filter((e: any) => e.isVisible) || [];
      const glassEffect = visibleEffects.find((e: any) => e.type === 'glass');
      const textureEffect = visibleEffects.find((e: any) => e.type === 'texture');
      
      const boxShadows = visibleEffects
        .filter((e: any) => e.type === 'dropShadow' || e.type === 'innerShadow')
        .map((e: any) => `${e.type === 'innerShadow' ? 'inset ' : ''}${e.x || 0}px ${e.y || 0}px ${e.blur || 0}px ${e.color || '#000000'}${Math.round((e.opacity ?? 25) * 2.55).toString(16).padStart(2, '0')}`)
        .join(', ');

      const layerBlur = visibleEffects.find((e: any) => e.type === 'layerBlur');
      const baseFilterStr = layerBlur ? `blur(${layerBlur.blur || 0}px)` : '';
      const textureStr = textureEffect ? `url(#texture-${layerId})` : '';
      const filterStr = [baseFilterStr, textureStr].filter(Boolean).join(' ');

      const maskImageStr = layerBlur?.blurType === 'progressive' ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' : undefined;

      const backdropBlurs = visibleEffects
        .filter((e: any) => e.type === 'backgroundBlur' || e.type === 'glass')
        .map((e: any) => `blur(${e.blur || 0}px)`);
      const backdropFilterStr = backdropBlurs.length > 0 ? backdropBlurs.join(' ') : undefined;

      if (boxShadows) style.boxShadow = boxShadows;
      if (filterStr) style.filter = filterStr;
      if (backdropFilterStr) {
        style.backdropFilter = backdropFilterStr;
        style.WebkitBackdropFilter = backdropFilterStr;
      }
      if (maskImageStr) {
        style.maskImage = maskImageStr;
        style.WebkitMaskImage = maskImageStr;
      }
      if (glassEffect) {
        style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        style.border = '1px solid rgba(255, 255, 255, 0.2)';
      }
    }
    return style;
  };

  const getIsResized = (layerId: string): boolean => {
    const overrideKey = props.artboardId ? `${props.artboardId}_${layerId}` : layerId;
    const override = layerOverrides[overrideKey] || layerOverrides[layerId];
    return !!(override && (override.width !== undefined || override.height !== undefined));
  };

  const getLongestLineLength = (text: string): number => {
    if (!text) return 0;
    return Math.max(...text.split('\n').map(l => l.length));
  };

  const getTextOverrideStyle = (layerId: string): React.CSSProperties => {
    const overrideKey = props.artboardId ? `${props.artboardId}_${layerId}` : layerId;
    const override = layerOverrides[overrideKey] || layerOverrides[layerId];
    
    let style: React.CSSProperties = {};
    if (override) {
      if (override.fontSize !== undefined) {
        style.fontSize = typeof override.fontSize === 'number' ? `${override.fontSize}%` : override.fontSize;
      }
      if (override.fontFamily) style.fontFamily = override.fontFamily;
      if (override.fontWeight) style.fontWeight = override.fontWeight;
      if (override.fontStyle) style.fontStyle = override.fontStyle;
      if (override.textAlign) style.textAlign = override.textAlign as any;
      if (override.lineHeight) style.lineHeight = override.lineHeight;
      if (override.letterSpacing !== undefined) {
        style.letterSpacing = `${override.letterSpacing}%`;
      }
    }
    return style;
  };

  const getImageOverrideStyle = (layerId: string, align: 'left' | 'center' | 'right' = 'center'): React.CSSProperties => {
    const overrideKey = props.artboardId ? `${props.artboardId}_${layerId}` : layerId;
    const override = layerOverrides[overrideKey] || layerOverrides[layerId];
    
    let filterStr = "";
    if (override) {
      if (override.exposure !== undefined || override.contrast !== undefined || override.saturation !== undefined || override.temperature !== undefined || override.tint !== undefined) {
         const exposure = override.exposure ?? 100;
         const contrast = override.contrast ?? 100;
         const saturation = override.saturation ?? 100;
         const temperature = override.temperature ?? 0;
         const tint = override.tint ?? 0;
         
         filterStr = `brightness(${exposure}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${temperature > 0 ? temperature : 0}%) hue-rotate(${tint}deg)`;
      }
    }
    
    const hasSizeOverride = override && (override.width !== undefined || override.height !== undefined);
    
    return {
      width: hasSizeOverride ? '100%' : 'auto',
      height: '100%',
      objectFit: 'contain',
      objectPosition: align,
      maxHeight: '100%',
      maxWidth: 'none',
      filter: filterStr || undefined
    };
  };

  const renderLayerEffects = (layerId: string) => {
    const overrideKey = props.artboardId ? `${props.artboardId}_${layerId}` : layerId;
    const override = layerOverrides[overrideKey] || layerOverrides[layerId];
    const visibleEffects = override?.effects?.filter((e: any) => e.isVisible) || [];
    const textureEffect = visibleEffects.find((e: any) => e.type === 'texture');
    const noiseEffect = visibleEffects.find((e: any) => e.type === 'noise');

    if (!textureEffect && !noiseEffect) return null;

    return (
      <>
        {textureEffect && (
          <svg className="absolute w-0 h-0 pointer-events-none">
            <defs>
              <filter id={`texture-${layerId}`}>
                <feTurbulence type="fractalNoise" baseFrequency={(textureEffect.radius || 10) / 100} numOctaves="2" result="turbulence" />
                <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
        )}
        {noiseEffect && (
          <div className="absolute inset-0 mix-blend-overlay pointer-events-none z-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: (noiseEffect.density || 50) / 100,
            borderRadius: 'inherit'
          }} />
        )}
      </>
    );
  };
  const format = props.artboardId ? FORMATS.find(f => f.id === props.artboardId) : null;
  const pos = props.artboardId ? ARTBOARD_POSITIONS[props.artboardId as keyof typeof ARTBOARD_POSITIONS] : null;
  const scale = (pos && format && format.width) ? pos.w / format.width : 1;
  
  const baseMargin = props.artboardId === 'a3-poster' ? 100 : 40;
  const baseLogoHeight = props.artboardId === 'a3-poster' ? 400 : 100; // 500 - 100 = 400, 140 - 40 = 100
  
  const marginPx = baseMargin * scale;
  const logoHeightPx = baseLogoHeight * scale;

  return (
    <ArtboardContext.Provider value={{ isActive, selectedLayer, handleElementMouseDown, handleResizeMouseDown, setSelectedLayer, artboardId: props.artboardId, layerOverrides }}>
    
    {isActive && (
      <div className="absolute inset-0 pointer-events-none z-[200]">
        {/* Top Margin */}
        <div className="absolute left-0 right-0 border-t border-red-500/60" style={{ top: `${marginPx}px` }} />
        {/* Bottom Margin */}
        <div className="absolute left-0 right-0 border-b border-red-500/60" style={{ bottom: `${marginPx}px` }} />
        {/* Left Margin */}
        <div className="absolute top-0 bottom-0 border-l border-red-500/60" style={{ left: `${marginPx}px` }} />
        {/* Right Margin */}
        <div className="absolute top-0 bottom-0 border-r border-red-500/60" style={{ right: `${marginPx}px` }} />
        {/* Logo Section Bottom */}
        <div className="absolute left-0 right-0 border-b border-red-500/60" style={{ top: `${marginPx + logoHeightPx}px` }} />
      </div>
    )}

    <div
      className={`absolute inset-0 flex flex-col justify-between ${isActive ? 'cursor-pointer' : ''}`}
      style={{ padding: `${marginPx}px`, fontFamily: bodyFont, fontSize: '0.8em' }}
      onClick={() => { if (isActive) { setSelectedLayer('background'); (props as any).setSelectedArtboard?.(null); } }}
    >
      <FigmaBox isSelected={!!isActive && selectedLayer === 'background'} />

      {/* HEADER */}
      <div
        id="header-header"
        className={`flex flex-col items-center gap-[2%] relative group/layer ${isActive ? 'cursor-pointer' : ''} ${selectedLayer === 'header' || selectedLayer?.startsWith('header-') ? 'z-[100]' : 'z-10'}`}
        style={getOverrideStyle('header')}
        onMouseDown={(e) => { if (isActive && handleElementMouseDown) handleElementMouseDown(e, 'header', 0, 0, 'header'); }}
        onClick={(e) => { if (isActive) { e.stopPropagation(); setSelectedLayer('header'); } }}
      >
        {renderLayerEffects('header')}
        {isActive && (!selectedLayer || !selectedLayer.startsWith('header-')) && <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-gold-500/50 pointer-events-none" />}
        <FigmaBox isSelected={!!isActive && selectedLayer === 'header'} />
        <div className="relative w-full flex items-center justify-between gap-2 min-w-0 min-h-0" style={{ height: `${logoHeightPx}px` }}>
          {/* Left Group */}
          <div className="relative flex items-center justify-start gap-4 h-full overflow-visible min-w-0 min-h-0 shrink-0 z-10">
            <SubLayerWrapper id="header-logo" className="h-full shrink-0 flex items-center justify-start min-w-0 min-h-0">
              {props.logos?.main ? (
                <img src={props.logos.main} style={getImageOverrideStyle('header-logo', 'left')} alt="Main Logo" draggable={false} />
              ) : (
                <div className="h-full aspect-square border border-dashed border-white/20 rounded-md flex items-center justify-center bg-black/20 px-2 min-w-0 min-h-0">
                  <span className="text-[150%] text-white/50 uppercase text-center font-bold">Logo</span>
                </div>
              )}
            </SubLayerWrapper>
            {props.logos?.extra && (
              <SubLayerWrapper id="header-extra" className="h-full shrink-0 flex items-center justify-start min-w-0 min-h-0">
                <img src={props.logos.extra} style={getImageOverrideStyle('header-extra', 'left')} alt="Extra Logo" draggable={false} />
              </SubLayerWrapper>
            )}
          </div>
          
          {/* Center Group (Absolutely Centered) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none min-w-0 min-h-0 z-20">
            <div className="h-full flex items-center justify-center pointer-events-auto shrink-0 min-w-0 min-h-0">
              <SubLayerWrapper id="header-club" className="h-full flex items-center justify-center min-w-0 min-h-0">
                {props.logos?.club ? (
                  <img src={props.logos.club} style={getImageOverrideStyle('header-club', 'center')} alt="Club Logo" draggable={false} />
                ) : (
                  <div className="h-full aspect-square border border-dashed border-white/20 rounded-md flex items-center justify-center bg-black/20 px-2 min-w-0 min-h-0">
                    <span className="text-[150%] text-white/50 uppercase text-center font-bold">Club</span>
                  </div>
                )}
              </SubLayerWrapper>
            </div>
          </div>

          {/* Right Group */}
          <div className="relative flex items-center justify-end gap-4 h-full overflow-visible min-w-0 min-h-0 shrink-0 z-10">
            {props.logos?.extra2 && (
              <SubLayerWrapper id="header-extra2" className="h-full shrink-0 flex items-center justify-end min-w-0 min-h-0">
                <img src={props.logos.extra2} style={getImageOverrideStyle('header-extra2', 'right')} alt="Extra Logo 2" draggable={false} />
              </SubLayerWrapper>
            )}
            <SubLayerWrapper id="header-collab" className="h-full shrink-0 flex items-center justify-end min-w-0 min-h-0">
              {props.logos?.collab ? (
                <img src={props.logos.collab} style={getImageOverrideStyle('header-collab', 'right')} alt="Collab Logo" draggable={false} />
              ) : (
                <div className="h-full aspect-square border border-dashed border-white/20 rounded-md flex items-center justify-center bg-black/20 px-2 min-w-0 min-h-0">
                  <span className="text-[150%] text-white/50 uppercase text-center font-bold">Collab</span>
                </div>
              )}
            </SubLayerWrapper>
          </div>
        </div>
        <SubLayerWrapper id="header-intro" className="w-fit mx-auto mt-[6%] flex justify-center">
          <textarea
            value={editIntro}
            onChange={e => setEditIntro(e.target.value)}
            className="bg-transparent text-center text-[300%] text-white/90 font-medium tracking-[0.2em] outline-none resize-none"
            rows={editIntro ? editIntro.split('\n').length : 1}
            style={{
              width: getIsResized('header-intro') ? '100%' : `${Math.max(15, Math.min(35, getLongestLineLength(editIntro) + 2))}ch`,
              height: getIsResized('header-intro') ? '100%' : 'auto',
              maxWidth: '100%',
              ...getTextOverrideStyle('header-intro')
            }}
          />
        </SubLayerWrapper>
      </div>

      {/* Grouped Middle Sections to stack title/tagline/details/tags closer and shift up */}
      <div className="flex-1 flex flex-col justify-start space-y-[2.5%] w-full mt-[1%] mb-auto">
        {/* TITLE */}
        <div className={`flex flex-col justify-start items-center relative ${selectedLayer === 'title' || selectedLayer?.startsWith('title-') || selectedLayer?.startsWith('tagline') ? 'z-[100]' : 'z-10'}`}>
          <SubLayerWrapper id="title-text" className="w-full flex items-center justify-center">
            {renderLayerEffects('title')}
            {aiTitleImage ? (
              <div className="relative h-[20%] min-h-[50px] flex items-center justify-center group/title">
                <img src={aiTitleImage} alt="AI Title" className="h-full w-auto object-contain mix-blend-screen filter brightness-125 pointer-events-none" draggable={false} />
                <button onClick={() => setAiTitleImage(null)} className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover/title:opacity-100 transition-opacity z-50">
                  <RefreshCw className="w-2 h-2" />
                </button>
              </div>
            ) : (
              <div
                className={`w-full relative flex items-center justify-center`}
                style={{
                  fontFamily: titleFont,
                  backdropFilter: textBackdropBlur > 0 ? `blur(${textBackdropBlur}px)` : 'none',
                  backgroundColor: textBackdropBlur > 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
                }}
              >
                <AutoFitText
                  text={editTitle || "EVENT TITLE"}
                  maxFontSize={120}
                  className={`uppercase ${titleBold ? 'font-black' : 'font-normal'}`}
                  textFill={textFill}
                  strokeWidth={textStrokeWidth}
                  strokeColor={textStrokeColor}
                  strokeFill={textStrokeFill}
                  strokeOpacity={textStrokeOpacity}
                  strokePosition={strokePosition}
                  shadowOpacity={textShadowOpacity}
                />
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text z-30"
                />
              </div>
            )}
          </SubLayerWrapper>

          {/* Tagline */}
          <SubLayerWrapper id="tagline-text" className="mx-auto w-fit z-10 px-[1%] py-[0.2%] mt-[0.5%] flex justify-center">
            <textarea
              value={editSubtitle}
              onChange={e => setEditSubtitle(e.target.value)}
              className="bg-transparent text-center outline-none text-[300%] font-medium tracking-[0.2em] transition-all duration-300 relative z-30 resize-none overflow-hidden"
              rows={editSubtitle ? editSubtitle.split('\n').length : 1}
              style={{
                fontFamily: bodyFont,
                color: textFill.stops[0]?.color || '#ffffff',
                width: getIsResized('tagline-text') ? '100%' : `${Math.max(12, getLongestLineLength(editSubtitle) + 2)}ch`,
                height: getIsResized('tagline-text') ? '100%' : 'auto',
                maxWidth: '100%',
                ...getTextOverrideStyle('tagline-text')
              }}
              placeholder="Add Event Tagline"
            />
          </SubLayerWrapper>
        </div>

        {/* DETAILS */}
        <div className={`flex flex-col items-center space-y-[2%] w-full relative ${selectedLayer === 'details' || selectedLayer?.startsWith('details-') ? 'z-[100]' : 'z-10'}`}>
          <div
            id="details-details"
            className={`w-full bg-black/40 border border-white/10 rounded-xl flex overflow-hidden relative group/layer ${isActive ? 'cursor-pointer' : ''}`}
            onMouseDown={(e) => { if (isActive && handleElementMouseDown) handleElementMouseDown(e, 'details', 0, 0, 'details'); }}
            onClick={(e) => { if (isActive) { e.stopPropagation(); setSelectedLayer('details'); } }}
            style={getOverrideStyle('details')}
          >
            {renderLayerEffects('details')}
            {isActive && (!selectedLayer || !selectedLayer.startsWith('details-')) && <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-gold-500/50 pointer-events-none" />}
            <FigmaBox isSelected={!!isActive && selectedLayer === 'details'} />
            <div className="w-1/2 p-[3%] flex flex-col justify-center space-y-[4%] border-r border-white/10 text-left relative z-20">
              <SubLayerWrapper id="details-date" className="w-full">
                <div className="flex items-center gap-[2%] w-full">
                  <span className={`text-[260%] tracking-widest w-[30%] shrink-0 ${labelsBold ? 'font-bold' : 'font-normal'} ${labelsUppercase ? 'uppercase' : 'capitalize'}`} style={{ color: textFill.stops[0]?.color || '#ffffff' }}>Date:</span>
                  <input value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-transparent outline-none text-[260%] font-medium text-white tracking-wider flex-grow relative z-30" style={{ ...(getIsResized('details-date') ? { width: '100%', height: '100%' } : {}), ...getTextOverrideStyle('details-date') }} placeholder="24th March 2026" />
                </div>
              </SubLayerWrapper>
              <SubLayerWrapper id="details-time" className="w-full">
                <div className="flex items-center gap-[2%] w-full">
                  <span className={`text-[260%] tracking-widest w-[30%] shrink-0 ${labelsBold ? 'font-bold' : 'font-normal'} ${labelsUppercase ? 'uppercase' : 'capitalize'}`} style={{ color: textFill.stops[0]?.color || '#ffffff' }}>Time:</span>
                  <input value={editTime} onChange={e => setEditTime(e.target.value)} className="bg-transparent outline-none text-[260%] font-medium text-white tracking-wider flex-grow relative z-30" style={{ ...(getIsResized('details-time') ? { width: '100%', height: '100%' } : {}), ...getTextOverrideStyle('details-time') }} placeholder="4:30 PM to 6:30 PM" />
                </div>
              </SubLayerWrapper>
              <SubLayerWrapper id="details-venue" className="w-full">
                <div className="flex items-start gap-[2%] w-full">
                  <span className={`text-[260%] tracking-widest w-[30%] shrink-0 mt-[1%] ${labelsBold ? 'font-bold' : 'font-normal'} ${labelsUppercase ? 'uppercase' : 'capitalize'}`} style={{ color: textFill.stops[0]?.color || '#ffffff' }}>Venue:</span>
                  <textarea value={editVenue} onChange={e => setEditVenue(e.target.value)} className="bg-transparent outline-none text-[260%] font-medium text-white tracking-wider flex-grow resize-none leading-tight relative z-30" rows={2} style={{ ...(getIsResized('details-venue') ? { width: '100%', height: '100%' } : {}), ...getTextOverrideStyle('details-venue') }} placeholder="AIML Lab, 7th Floor" />
                </div>
              </SubLayerWrapper>
            </div>
            <div className="w-1/2 p-[3%] flex flex-col justify-center text-left space-y-[4%] relative z-20">
              <SubLayerWrapper id="details-fee" className="w-full">
                <span className={`text-[260%] tracking-widest ${labelsBold ? 'font-bold' : 'font-normal'} ${labelsUppercase ? 'uppercase' : 'capitalize'}`} style={{ color: textFill.stops[0]?.color || '#ffffff' }}>Registration Fee:</span>
                <textarea value={editFee} onChange={e => setEditFee(e.target.value)} className="bg-transparent outline-none text-[260%] font-medium text-white tracking-wider w-full resize-none leading-tight relative z-30 mt-1" rows={3} style={{ ...(getIsResized('details-fee') ? { width: '100%', height: '100%' } : {}), ...getTextOverrideStyle('details-fee') }} placeholder="Registration is free for all!" />
              </SubLayerWrapper>
            </div>
          </div>

          {/* Tags */}
          <div
            id="tags-tags"
            className={`flex flex-col items-center gap-[2%] p-[2%] w-full relative group/layer ${isActive ? 'cursor-pointer' : ''} ${selectedLayer === 'tags' || selectedLayer?.startsWith('tags-') ? 'z-[100]' : 'z-10'}`}
            onMouseDown={(e) => { if (isActive && handleElementMouseDown) handleElementMouseDown(e, 'tags', 0, 0, 'tags'); }}
            onClick={(e) => { if (isActive) { e.stopPropagation(); setSelectedLayer('tags'); } }}
            style={getOverrideStyle('tags')}
          >
            {renderLayerEffects('tags')}
            {isActive && (!selectedLayer || !selectedLayer.startsWith('tags-')) && <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-gold-500/50 pointer-events-none" />}
            <FigmaBox isSelected={!!isActive && selectedLayer === 'tags'} />
            {!['a3-poster', 'banner', 'standee'].includes(props.artboardId || '') && (
              <SubLayerWrapper id="tags-teamsize" className="w-fit mx-auto relative z-20">
                <textarea
                  value={editTeamSize}
                  onChange={e => setEditTeamSize(e.target.value)}
                  className="bg-transparent outline-none text-[200%] font-medium text-white/90 tracking-[0.15em] text-center relative z-30 resize-none overflow-hidden"
                  rows={editTeamSize ? editTeamSize.split('\n').length : 1}
                  style={{
                    width: getIsResized('tags-teamsize') ? '100%' : `${Math.max(15, getLongestLineLength(editTeamSize) + 2)}ch`,
                    height: getIsResized('tags-teamsize') ? '100%' : 'auto',
                    maxWidth: '100%',
                    ...getTextOverrideStyle('tags-teamsize')
                  }}
                  placeholder="Participate in teams of 2-4"
                />
              </SubLayerWrapper>
            )}
            <SubLayerWrapper id="tags-prizepool" className="relative z-20 mt-[2%]">
              <textarea
                value={editPrizePool}
                onChange={e => setEditPrizePool(e.target.value)}
                className="bg-black/60 border-2 rounded-xl px-[6%] py-[3%] outline-none text-[250%] font-black uppercase tracking-widest text-center min-w-[200px] resize-none leading-tight relative z-30"
                style={{
                  color: textFill.stops[0]?.color || '#ffffff',
                  borderColor: `${textFill.stops[0]?.color || '#ffffff'}40`,
                  width: getIsResized('tags-prizepool') ? '100%' : undefined,
                  height: getIsResized('tags-prizepool') ? '100%' : undefined,
                  ...getTextOverrideStyle('tags-prizepool')
                }}
                rows={2}
                placeholder={"PRIZE POOL\n₹3000"}
              />
            </SubLayerWrapper>
          </div>
        </div>
      </div>

      {/* QR Code Section - A3, Banner, Standee Only */}
      {['a3-poster', 'banner', 'standee'].includes(props.artboardId || '') && (
        <div 
          className="w-full flex items-center justify-between border-t border-dashed border-white/20 pt-[6%] mt-[8%] mb-[6%] relative z-20"
          style={{ minHeight: '26em' }}
        >
          {/* Left Column: Team Size Sentence */}
          <div className="w-[30%] flex justify-start items-center shrink-0">
            <SubLayerWrapper id="tags-teamsize" className="w-full relative z-20">
              <textarea
                value={editTeamSize}
                onChange={e => setEditTeamSize(e.target.value)}
                className="bg-transparent outline-none text-[220%] font-semibold text-white tracking-widest text-left resize-none overflow-hidden"
                rows={editTeamSize ? editTeamSize.split('\n').length : 1}
                style={{
                  width: '100%',
                  height: getIsResized('tags-teamsize') ? '100%' : 'auto',
                  maxWidth: '100%',
                  ...getTextOverrideStyle('tags-teamsize')
                }}
                placeholder="Participate in teams of 2-4"
              />
            </SubLayerWrapper>
          </div>
          
          {/* Center Column: Big QR Code Outline Box Placeholder */}
          <div className="w-[40%] flex justify-center items-center shrink-0">
            <SubLayerWrapper id="footer-qrbox" className="w-fit relative z-20">
              <div 
                className="border-[4px] border-white/40 bg-black/60 border-dashed flex flex-col items-center justify-center shadow-2xl rounded-2xl"
                style={{ 
                  width: getIsResized('footer-qrbox') ? '100%' : '22em', 
                  height: getIsResized('footer-qrbox') ? '100%' : '22em' 
                }}
              >
                <span className="text-[170%] font-black text-white/70 tracking-[0.25em] uppercase text-center px-[4%]">
                  QR CODE
                </span>
                <span className="text-[100%] font-bold text-white/40 tracking-wider uppercase text-center mt-[6%]">
                  Placeholder
                </span>
              </div>
            </SubLayerWrapper>
          </div>
          
          {/* Right Column: Scan Text */}
          <div className="w-[30%] flex justify-end items-center text-right shrink-0">
            <SubLayerWrapper id="footer-qrscan" className="w-fit relative z-20">
              <textarea
                value={editScanText}
                onChange={e => setEditScanText(e.target.value)}
                className="bg-transparent outline-none text-[220%] font-semibold text-white/90 tracking-widest leading-snug text-right resize-none overflow-hidden relative z-30"
                rows={editScanText ? editScanText.split('\n').length : 2}
                style={{
                  width: getIsResized('footer-qrscan') ? '100%' : `${Math.max(10, getLongestLineLength(editScanText) * 1.5 + 2)}ch`,
                  height: getIsResized('footer-qrscan') ? '100%' : 'auto',
                  maxWidth: '320px',
                  ...getTextOverrideStyle('footer-qrscan')
                }}
                placeholder="Scan the QR code to register"
              />
            </SubLayerWrapper>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div
        id="footer-footer"
        className={`flex justify-between items-end w-full px-[4%] pt-[4%] relative group/layer ${isActive ? 'cursor-pointer' : ''} ${selectedLayer === 'footer' || selectedLayer?.startsWith('footer-') ? 'z-[100]' : 'z-10'}`}
        onMouseDown={(e) => { if (isActive && handleElementMouseDown) handleElementMouseDown(e, 'footer', 0, 0, 'footer'); }}
        onClick={(e) => { if (isActive) { e.stopPropagation(); setSelectedLayer('footer'); } }}
        style={getOverrideStyle('footer')}
      >
        {renderLayerEffects('footer')}
        {isActive && (!selectedLayer || !selectedLayer.startsWith('footer-')) && <div className="absolute inset-0 group-hover/layer:ring-1 group-hover/layer:ring-gold-500/50 pointer-events-none" />}
        <FigmaBox isSelected={!!isActive && selectedLayer === 'footer'} />
        <SubLayerWrapper id="footer-poc1" className="w-fit relative z-20">
          <input
            type="text"
            value={editPoc1}
            onChange={e => setEditPoc1(e.target.value)}
            className="bg-transparent outline-none text-[240%] font-medium tracking-widest relative z-30"
            style={{
              color: textFill.stops[0]?.color || '#ffffff',
              width: getIsResized('footer-poc1') ? '100%' : `${Math.max(10, editPoc1.length * 1.5 + 2)}ch`,
              height: getIsResized('footer-poc1') ? '100%' : 'auto',
              ...getTextOverrideStyle('footer-poc1')
            }}
            placeholder="Name: Phone"
          />
        </SubLayerWrapper>
        <SubLayerWrapper id="footer-poc2" className="w-fit relative z-20">
          <input
            type="text"
            value={editPoc2}
            onChange={e => setEditPoc2(e.target.value)}
            className="bg-transparent outline-none text-[240%] font-medium tracking-widest text-right relative z-30"
            style={{
              color: textFill.stops[0]?.color || '#ffffff',
              width: getIsResized('footer-poc2') ? '100%' : `${Math.max(10, editPoc2.length * 1.5 + 2)}ch`,
              height: getIsResized('footer-poc2') ? '100%' : 'auto',
              ...getTextOverrideStyle('footer-poc2')
            }}
            placeholder="Name: Phone"
          />
        </SubLayerWrapper>
      </div>
    </div>
    </ArtboardContext.Provider>
  );
}
