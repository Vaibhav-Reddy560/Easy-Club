import React, { useState } from "react";
import {
  Layout, LayoutGrid, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  AlignVerticalSpaceAround, AlignHorizontalSpaceAround, RefreshCw, Columns2,
  Eye, Droplets, Plus, Minus, Type, Sparkles, EyeOff, Sliders, Square, Maximize2, Trash, Settings, Search
} from "lucide-react";
import { Layer, FillSettings, NATIVE_LAYER_IDS, EffectSettings, EffectType } from "../types";
import AdvancedColorPicker from "./AdvancedColorPicker";
import NumberInput from "@/components/ui/NumberInput";
import FontSelector from "./FontSelector";
import Tooltip from "@/components/ui/Tooltip";
import { LAYER_ICONS, ARTBOARD_POSITIONS } from "../constants";

export interface RightSidebarProps {
  selectedLayer: Layer | null;
  useOverride: boolean;
  setUseOverride: (v: boolean) => void;
  vibeOverride: string;
  setVibeOverride: (v: string) => void;
  vibeData: any;
  vibeAccepted: boolean;
  setVibeAccepted: (v: boolean) => void;
  generateVibe: () => void;
  handleGenerateImage: () => void;
  imageGen: any;
  titleFont: string;
  setTitleFont: (v: string) => void;
  titleBold: boolean;
  setTitleBold: (v: boolean) => void;
  textLineHeight: string;
  setTextLineHeight: (v: string) => void;
  textLetterSpacing: number;
  setTextLetterSpacing: (v: number) => void;
  textAlign: string;
  setTextAlign: (v: string) => void;
  backgroundFill: FillSettings;
  setBackgroundFill: (v: FillSettings) => void;
  textFill: FillSettings;
  setTextFill: (v: FillSettings) => void;
  textStrokeColor: string;
  setTextStrokeColor: (v: string) => void;
  textStrokeOpacity: number;
  setTextStrokeOpacity: (v: number) => void;
  textStrokeFill?: import('../types').FillSettings;
  setTextStrokeFill?: (v: import('../types').FillSettings) => void;
  textStrokeWidth: number;
  setTextStrokeWidth: (v: number) => void;
  strokePosition: string;
  setStrokePosition: (v: string) => void;
  layerBlur: number;
  setLayerBlur: (v: number) => void;
  textShadowX: number;
  setTextShadowX: (v: number) => void;
  textShadowY: number;
  setTextShadowY: (v: number) => void;
  textShadowBlur: number;
  setTextShadowBlur: (v: number) => void;
  textShadowColor: string;
  setTextShadowColor: (v: string) => void;
  textShadowOpacity: number;
  setTextShadowOpacity: (v: number) => void;
  exposure: number;
  setExposure: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  saturation: number;
  setSaturation: (v: number) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  labelsBold: boolean;
  setLabelsBold: (v: boolean) => void;
  labelsUppercase: boolean;
  setLabelsUppercase: (v: boolean) => void;
  customArtboards?: import('../types').CustomArtboard[];
  setCustomArtboards?: (v: import('../types').CustomArtboard[]) => void;
  customElements?: import('../types').CustomElement[];
  setCustomElements?: (v: import('../types').CustomElement[]) => void;
  selectedElementId?: string | null;
  dragPreviewBounds?: { id: string, x: number, y: number, width: number, height: number } | null;
  layerOverrides?: Record<string, any>;
  setLayerOverrides?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  activeTab?: string | null;
}

export default function RightSidebar(props: RightSidebarProps) {
  const {
    selectedLayer, useOverride, setUseOverride, vibeOverride, setVibeOverride,
    vibeData, vibeAccepted, setVibeAccepted, generateVibe,
    handleGenerateImage, imageGen, titleFont, setTitleFont, titleBold, setTitleBold,
    textLineHeight, setTextLineHeight, textLetterSpacing, setTextLetterSpacing,
    textAlign, setTextAlign, backgroundFill, setBackgroundFill, textFill, setTextFill,
    textStrokeColor, setTextStrokeColor, textStrokeOpacity, setTextStrokeOpacity,
    textStrokeFill, setTextStrokeFill,
    textStrokeWidth, setTextStrokeWidth, strokePosition, setStrokePosition,
    layerBlur, setLayerBlur, textShadowX, setTextShadowX, textShadowY, setTextShadowY,
    textShadowBlur, setTextShadowBlur, textShadowColor, setTextShadowColor,
    textShadowOpacity, setTextShadowOpacity, exposure, setExposure, contrast, setContrast,
    saturation, setSaturation, temperature, setTemperature, labelsBold, setLabelsBold,
    labelsUppercase, setLabelsUppercase, customArtboards, setCustomArtboards,
    customElements = [], setCustomElements, selectedElementId, dragPreviewBounds,
    layerOverrides, setLayerOverrides, activeTab
  } = props;
  const [currentFontVariants, setCurrentFontVariants] = useState<string[] | null>(null);
  const [showIndividualCorners, setShowIndividualCorners] = useState(false);
  const [expandedEffectId, setExpandedEffectId] = useState<string | null>(null);

  const activeEffects: EffectSettings[] = (selectedLayer === "custom_element" || selectedLayer === "custom_artboard")
    ? (customElements.find(c => c.id === selectedElementId)?.effects || [])
    : (layerOverrides?.[`${activeTab}_${selectedLayer}`]?.effects || []);

  const updateEffects = (newEffects: EffectSettings[]) => {
    if (selectedLayer === "custom_element" || selectedLayer === "custom_artboard") {
      if (setCustomElements && selectedElementId) {
        setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, effects: newEffects } : c));
      }
    } else if (selectedLayer && activeTab) {
      if (setLayerOverrides) {
        const key = `${activeTab}_${selectedLayer}`;
        setLayerOverrides(prev => ({
          ...prev,
          [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), effects: newEffects }
        }));
      }
    }
  };

  const handleAddEffect = () => {
    const type: EffectType = 'dropShadow';
    const newEffect: EffectSettings = {
      id: crypto.randomUUID(),
      type,
      isVisible: true,
      x: 4,
      y: 4,
      blur: 4,
      color: '#000000',
      opacity: 25,
    };
    const newEffects = [...activeEffects, newEffect];
    updateEffects(newEffects);
    setExpandedEffectId(newEffect.id);
  };

  const updateEffect = (id: string, updates: Partial<EffectSettings>) => {
    updateEffects(activeEffects.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const removeEffect = (id: string) => {
    updateEffects(activeEffects.filter(e => e.id !== id));
  };

  const getSelectedLayerOverride = () => {
    if (!selectedLayer || !activeTab || !layerOverrides) return null;
    const key = `${activeTab}_${selectedLayer}`;
    return layerOverrides[key] || layerOverrides[selectedLayer];
  };

  const handleAlignCenterHorizontally = () => {
    if (!selectedLayer || !activeTab) return;
    
    const refArtboardId = selectedLayer === "custom_element" 
      ? (customElements.find(c => c.id === selectedElementId)?.parentArtboardId || activeTab) 
      : activeTab;
      
    const artboardPos = ARTBOARD_POSITIONS[refArtboardId as keyof typeof ARTBOARD_POSITIONS];
    const customArtboard = customArtboards?.find(a => a.id === refArtboardId);
    const artboardCanvasW = artboardPos ? artboardPos.w : (customArtboard ? customArtboard.width : 0);
    
    if (!artboardCanvasW) return;
    
    const artboardDom = document.getElementById(`artboard-${refArtboardId}`);
    const elementDomId = selectedLayer === "custom_element" 
      ? `custom_element-${selectedElementId}` 
      : `${refArtboardId}-${selectedLayer}`;
    const elementDom = document.getElementById(elementDomId);
    
    if (!artboardDom || !elementDom) return;
    
    const artboardRect = artboardDom.getBoundingClientRect();
    const elementRect = elementDom.getBoundingClientRect();
    
    const zoomFactor = artboardRect.width / artboardCanvasW;
    const deltaScreenX = (artboardRect.left + artboardRect.width / 2) - (elementRect.left + elementRect.width / 2);
    const deltaCanvasX = deltaScreenX / zoomFactor;
    
    if (selectedLayer === "custom_element" && setCustomElements && selectedElementId) {
      setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, x: c.x + deltaCanvasX } : c));
    } else if (setLayerOverrides) {
      const key = `${refArtboardId}_${selectedLayer}`;
      setLayerOverrides(prev => {
        const current = prev?.[key] || { id: selectedLayer, x: 0, y: 0 };
        const newX = (current.x || 0) + deltaCanvasX;
        
        elementDom.style.transform = `translate(${Math.round(newX)}px, ${Math.round(current.y || 0)}px)`;
        
        return {
          ...prev,
          [key]: {
            ...current,
            x: newX
          }
        };
      });
    }
  };

  const handleAlignCenterVertically = () => {
    if (!selectedLayer || !activeTab) return;
    
    const refArtboardId = selectedLayer === "custom_element" 
      ? (customElements.find(c => c.id === selectedElementId)?.parentArtboardId || activeTab) 
      : activeTab;
      
    const artboardPos = ARTBOARD_POSITIONS[refArtboardId as keyof typeof ARTBOARD_POSITIONS];
    const customArtboard = customArtboards?.find(a => a.id === refArtboardId);
    const artboardCanvasH = artboardPos ? artboardPos.h : (customArtboard ? customArtboard.height : 0);
    
    if (!artboardCanvasH) return;
    
    const artboardDom = document.getElementById(`artboard-${refArtboardId}`);
    const elementDomId = selectedLayer === "custom_element" 
      ? `custom_element-${selectedElementId}` 
      : `${refArtboardId}-${selectedLayer}`;
    const elementDom = document.getElementById(elementDomId);
    
    if (!artboardDom || !elementDom) return;
    
    const artboardRect = artboardDom.getBoundingClientRect();
    const elementRect = elementDom.getBoundingClientRect();
    
    const zoomFactor = artboardRect.height / artboardCanvasH;
    const deltaScreenY = (artboardRect.top + artboardRect.height / 2) - (elementRect.top + elementRect.height / 2);
    const deltaCanvasY = deltaScreenY / zoomFactor;
    
    if (selectedLayer === "custom_element" && setCustomElements && selectedElementId) {
      setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, y: c.y + deltaCanvasY } : c));
    } else if (setLayerOverrides) {
      const key = `${refArtboardId}_${selectedLayer}`;
      setLayerOverrides(prev => {
        const current = prev?.[key] || { id: selectedLayer, x: 0, y: 0 };
        const newY = (current.y || 0) + deltaCanvasY;
        
        elementDom.style.transform = `translate(${Math.round(current.x || 0)}px, ${Math.round(newY)}px)`;
        
        return {
          ...prev,
          [key]: {
            ...current,
            y: newY
          }
        };
      });
    }
  };

  const getDefaultFontSize = (layerId: string) => {
    if (layerId === 'header-intro' || layerId === 'tagline-text') return 300;
    if (layerId.startsWith('footer-poc')) return 240;
    if (layerId.startsWith('details-') || layerId.startsWith('tags-')) return 200;
    return 100;
  };

  const HeaderIcon = selectedLayer ? (LAYER_ICONS[selectedLayer as import('../types').Layer] || Type) : Layout;

  const isTextSelected = (selectedLayer && NATIVE_LAYER_IDS.includes(selectedLayer as any) && selectedLayer !== "background" && (!selectedLayer.startsWith("header") || selectedLayer === "header-intro")) || 
                         (selectedLayer === "custom_element" && customElements.find(c => c.id === selectedElementId)?.type === "text");

  return (
    <div className="w-[320px] shrink-0 bg-black/60 border-l border-[#1E1E1E] overflow-y-auto z-[201] custom-scrollbar flex flex-col text-white pb-32">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#111111] z-50 text-[11px] font-medium">
        <span className="flex items-center gap-2">
          <HeaderIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span className="capitalize">{selectedLayer || 'No Layer Selected'}</span>
        </span>
        <div className="flex gap-3 text-zinc-500">
           <LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
           <ChevronDown className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Alignment Buttons */}
      {selectedLayer && selectedLayer !== "background" && (
        <div className="p-3 border-b border-white/10 flex items-center justify-around bg-[#151515]/80 text-zinc-400">
          <button 
            onClick={handleAlignCenterHorizontally}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors text-[9px] font-medium w-1/2"
            title="Align Center Horizontally"
          >
            <AlignCenter className="w-4 h-4 text-gold-500 mb-0.5" />
            <span>Align Horizontally</span>
          </button>
          <div className="h-6 w-px bg-white/10" />
          <button 
            onClick={handleAlignCenterVertically}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded hover:bg-white/5 hover:text-white transition-colors text-[9px] font-medium w-1/2"
            title="Align Center Vertically"
          >
            <AlignVerticalSpaceAround className="w-4 h-4 text-gold-500 mb-0.5" />
            <span>Align Vertically</span>
          </button>
        </div>
      )}

      {/* Dimensions (Custom Elements) */}
      {(selectedLayer === "custom_artboard" || selectedLayer === "custom_element") && (
        <section className="p-4 border-b border-white/10">
          <label className="text-[11px] mb-3 flex items-center justify-between">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Dimensions</span>
          </label>
          {(() => {
            const baseEl = selectedLayer === "custom_artboard" 
              ? customArtboards?.find(a => a.id === selectedElementId) 
              : customElements.find(c => c.id === selectedElementId);
            
            if (!baseEl) return null;
            
            // Override with drag preview if applicable
            const el = (dragPreviewBounds?.id === baseEl.id) ? dragPreviewBounds : baseEl;

            return (
              <div className="flex flex-col gap-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500">X</span>
                    <NumberInput value={Math.round(el.x)} onChange={(val) => {
                      if (selectedLayer === "custom_element" && setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === baseEl.id ? { ...c, x: val } : c));
                      } else if (setCustomArtboards) {
                        setCustomArtboards((customArtboards || []).map(a => a.id === baseEl.id ? { ...a, x: val } : a));
                      }
                    }} className="w-full bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 rounded px-2.5 py-1.5 outline-none text-white text-[10px]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500">Y</span>
                    <NumberInput value={Math.round(el.y)} onChange={(val) => {
                      if (selectedLayer === "custom_element" && setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === baseEl.id ? { ...c, y: val } : c));
                      } else if (setCustomArtboards) {
                        setCustomArtboards((customArtboards || []).map(a => a.id === baseEl.id ? { ...a, y: val } : a));
                      }
                    }} className="w-full bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 rounded px-2.5 py-1.5 outline-none text-white text-[10px]" />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[9px] text-zinc-500">Width</span>
                    <NumberInput value={Math.round(el.width)} onChange={(val) => {
                      const safeVal = Math.max(1, val);
                      if (selectedLayer === "custom_element" && setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === baseEl.id ? { ...c, width: safeVal } : c));
                      } else if (setCustomArtboards) {
                        setCustomArtboards((customArtboards || []).map(a => a.id === baseEl.id ? { ...a, width: safeVal } : a));
                      }
                    }} className="w-full bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 rounded px-2.5 py-1.5 outline-none text-white text-[10px]" />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[9px] text-zinc-500">Height</span>
                    <NumberInput value={Math.round(el.height)} onChange={(val) => {
                      const safeVal = Math.max(1, val);
                      if (selectedLayer === "custom_element" && setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === baseEl.id ? { ...c, height: safeVal } : c));
                      } else if (setCustomArtboards) {
                        setCustomArtboards((customArtboards || []).map(a => a.id === baseEl.id ? { ...a, height: safeVal } : a));
                      }
                    }} className="w-full bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 rounded px-2.5 py-1.5 outline-none text-white text-[10px]" />
                  </div>
                </div>
                
                {selectedLayer === "custom_element" && ('subType' in baseEl) && baseEl.subType === 'polygon' && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>Edges</span>
                      <span className="text-white">{baseEl.edges || 3}</span>
                    </div>
                    <input 
                      type="range" 
                      min="3" 
                      max="12" 
                      value={baseEl.edges || 3} 
                      onChange={e => setCustomElements && setCustomElements(customElements.map(c => c.id === baseEl.id ? { ...c, edges: Number(e.target.value) } : c))}
                      className="w-full accent-gold-500" 
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}



      {/* AI Vibe Director */}
      <section className="p-4 border-b border-white/10">
        <label className="text-[11px] mb-3 flex items-center justify-between">
          <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">AI Vibe Director</span>
        </label>
        
        <div className="space-y-3">
          {!vibeData && !useOverride && (
            <button
              onClick={generateVibe}
              className="w-full py-1.5 bg-gradient-to-r from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-lg text-[10px] font-medium transition-colors text-gold-500 mt-1 flex items-center justify-center gap-2 hover:bg-gold-500/30"
            >
              <Sparkles className="w-3 h-3" /> Propose Vibe
            </button>
          )}

          {vibeData && !useOverride && !vibeAccepted && (
            <div className="bg-[#111] border border-white/10 rounded-lg p-3 text-[11px] space-y-2">
              <p className="text-zinc-300 leading-relaxed">
                <span className="text-gold-500 font-bold block mb-1 text-[12px]">Proposed Direction:</span>
                {vibeData.vibe}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setVibeAccepted(true)}
                  className="flex-1 py-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-lg"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setVibeOverride(vibeData.vibe);
                    setUseOverride(true);
                  }}
                  className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium"
                >
                  Overwrite
                </button>
              </div>
            </div>
          )}

          {useOverride && (
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500">Manual Override Prompt</span>
              <textarea
                value={vibeOverride}
                onChange={(e) => setVibeOverride(e.target.value)}
                placeholder="Describe the background image you want..."
                className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-[10px] text-white resize-none h-16 outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20"
              />
            </div>
          )}
          
          {(vibeAccepted || useOverride) && (
            <button
              onClick={handleGenerateImage}
              disabled={imageGen.status === "generating"}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-medium transition-colors text-white flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-3 h-3 text-gold-500 group-hover:animate-pulse" />
              {imageGen.status === "generating" ? "Generating..." : "Regenerate Canvas"}
            </button>
          )}
        </div>
      </section>



      {/* Appearance */}
      {!isTextSelected && (
        <section className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] flex items-center mb-3">
              <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Appearance</span></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-500">Corner radius</span>
                <button 
                  onClick={() => setShowIndividualCorners(!showIndividualCorners)}
                  className={`p-1 hover:text-white rounded ${showIndividualCorners ? 'bg-[#333] text-white' : 'text-zinc-500 hover:bg-[#333]'}`}
                  disabled={selectedLayer !== "custom_element"}
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
              
              {!showIndividualCorners ? (
                <div className="flex items-center bg-black border border-transparent hover:border-[#444] rounded overflow-hidden">
                  <span className="pl-2 text-zinc-500 text-[9px]"><Square className="w-3 h-3" /></span>
                  <NumberInput 
                    min="0"
                    value={selectedLayer === "custom_element" && selectedElementId ? (customElements.find(c => c.id === selectedElementId)?.cornerRadius ?? 0) : 0}
                    onChange={(val) => {
                      if (selectedLayer === "custom_element" && setCustomElements) {
                        setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, cornerRadius: Math.max(0, val), cornerRadii: undefined } : c));
                      }
                    }}
                    readOnly={selectedLayer !== "custom_element"} 
                    className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px]" 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {/* Top Left, Top Right, Bottom Left, Bottom Right */}
                  {[
                    { id: 'tl', label: '⌜', index: 0 },
                    { id: 'tr', label: '⌝', index: 1 },
                    { id: 'bl', label: '⌞', index: 3 },
                    { id: 'br', label: '⌟', index: 2 }
                  ].map(({ id, label, index }) => {
                    const el = customElements.find(c => c.id === selectedElementId);
                    const radii = el?.cornerRadii || [el?.cornerRadius || 0, el?.cornerRadius || 0, el?.cornerRadius || 0, el?.cornerRadius || 0];
                    return (
                      <div key={id} className="flex items-center bg-black border border-transparent hover:border-[#444] rounded overflow-hidden">
                        <span className="pl-2 text-zinc-500 text-[10px] w-4">{label}</span>
                        <NumberInput 
                          min="0"
                          value={radii[index]}
                          onChange={(val) => {
                            if (selectedLayer === "custom_element" && setCustomElements) {
                              setCustomElements(customElements.map(c => {
                                if (c.id === selectedElementId) {
                                  const newRadii: [number, number, number, number] = [...radii] as any;
                                  newRadii[index] = Math.max(0, val);
                                  return { ...c, cornerRadii: newRadii };
                                }
                                return c;
                              }));
                            }
                          }}
                          readOnly={selectedLayer !== "custom_element"} 
                          className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px]" 
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Typography */}
      {isTextSelected && (
        <section className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] flex items-center mb-3">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Typography</span></label>
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          
          <div className="space-y-2 text-[10px]">
            <FontSelector 
              value={
                selectedLayer === "custom_element" 
                  ? (customElements.find(c => c.id === selectedElementId)?.fontFamily || 'Inter') 
                  : (getSelectedLayerOverride()?.fontFamily || titleFont)
              } 
              onChange={(newFont, variants) => {
                setCurrentFontVariants(variants || null);
                if (selectedLayer === "custom_element" && setCustomElements) {
                  setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, fontFamily: newFont } : c));
                } else if (selectedLayer && activeTab && setLayerOverrides) {
                  const key = `${activeTab}_${selectedLayer}`;
                  setLayerOverrides(prev => ({
                    ...prev,
                    [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), fontFamily: newFont }
                  }));
                } else {
                  setTitleFont(newFont);
                }
              }} 
              className="w-full z-50" 
            />

            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <select 
                  className="w-full appearance-none bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2.5 py-1.5 outline-none cursor-pointer text-white" 
                  value={
                    selectedLayer === "custom_element"
                      ? (() => {
                          const el = customElements.find(c => c.id === selectedElementId);
                          if (!el) return "400";
                          if (el.fontStyle === "italic") return `${el.fontWeight || "400"}italic`;
                          return el.fontWeight || "400";
                        })()
                      : (() => {
                          const override = getSelectedLayerOverride();
                          if (!override) return titleBold ? "700" : "400";
                          if (override.fontStyle === "italic") return `${override.fontWeight || "400"}italic`;
                          return override.fontWeight || "400";
                        })()
                  } 
                  onChange={(e) => {
                    const variant = e.target.value;
                    const isItalic = variant.includes("italic");
                    const weight = variant.replace("italic", "") || "400";
                    
                    if (selectedLayer === "custom_element" && setCustomElements) {
                      setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, fontWeight: weight, fontStyle: isItalic ? "italic" : "normal" } : c));
                    } else if (selectedLayer && activeTab && setLayerOverrides) {
                      const key = `${activeTab}_${selectedLayer}`;
                      setLayerOverrides(prev => ({
                        ...prev,
                        [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), fontWeight: weight, fontStyle: isItalic ? "italic" : "normal" }
                      }));
                    } else {
                      setTitleBold(weight >= "600");
                    }
                  }}
                >
                  {currentFontVariants ? (
                    currentFontVariants.map(v => {
                      let label = v;
                      if (v === "regular") label = "Regular (400)";
                      else if (v === "italic") label = "Italic (400)";
                      else {
                        const weight = v.replace("italic", "");
                        const isItalic = v.includes("italic");
                        const nameMap: Record<string, string> = {
                          "100": "Thin", "200": "ExtraLight", "300": "Light", "400": "Regular",
                          "500": "Medium", "600": "SemiBold", "700": "Bold", "800": "ExtraBold", "900": "Black"
                        };
                        label = `${nameMap[weight] || weight} ${isItalic ? "Italic" : ""}`.trim() + ` (${weight})`;
                      }
                      
                      let val = v;
                      if (v === "regular") val = "400";
                      if (v === "italic") val = "400italic";
                      
                      return <option key={val} value={val}>{label}</option>;
                    })
                  ) : (
                    <>
                      <option value="100">Thin</option>
                      <option value="300">Light</option>
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">SemiBold</option>
                      <option value="700">Bold</option>
                      <option value="800">ExtraBold</option>
                      <option value="900">Black</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>
              <div className="relative w-20 group">
                <input 
                  type="number" 
                  value={
                    selectedLayer === "custom_element"
                      ? (customElements.find(c => c.id === selectedElementId)?.fontSize || 24)
                      : (getSelectedLayerOverride()?.fontSize || getDefaultFontSize(selectedLayer || ''))
                  } 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) return;
                    if (selectedLayer === "custom_element" && setCustomElements) {
                      setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, fontSize: val } : c));
                    } else if (selectedLayer && activeTab && setLayerOverrides) {
                      const key = `${activeTab}_${selectedLayer}`;
                      setLayerOverrides(prev => ({
                        ...prev,
                        [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), fontSize: val }
                      }));
                    }
                  }}
                  className="w-full bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2.5 py-1.5 outline-none text-white" 
                />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <div className="flex flex-col gap-1 flex-1">
                 <span className="text-[9px] text-zinc-500">Line height</span>
                 <div className="flex items-center bg-black border border-transparent hover:border-[#444] focus-within:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2 overflow-hidden">
                   <span className="text-zinc-500 w-5 pr-1"><Type className="w-3 h-3" /></span>
                   <input 
                     type="text"
                     value={selectedLayer === "custom_element" ? (customElements.find(c => c.id === selectedElementId)?.lineHeight ?? "1.2") : (getSelectedLayerOverride()?.lineHeight ?? textLineHeight)} 
                     onChange={e => {
                       const val = e.target.value;
                       if (selectedLayer === "custom_element" && setCustomElements) {
                         setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, lineHeight: val } : c));
                       } else if (selectedLayer && activeTab && setLayerOverrides) {
                         const key = `${activeTab}_${selectedLayer}`;
                         setLayerOverrides(prev => ({
                           ...prev,
                           [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), lineHeight: val }
                         }));
                       } else {
                         setTextLineHeight(val);
                       }
                     }} 
                     className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white" 
                   />
                 </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                 <span className="text-[9px] text-zinc-500">Letter spacing</span>
                 <div className="flex items-center bg-black border border-transparent hover:border-[#444] focus-within:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2 overflow-hidden">
                   <span className="text-zinc-500 w-6 pr-1 flex gap-0.5"><span className="text-[8px]">|</span>A<span className="text-[8px]">|</span></span>
                   <input 
                     type="text"
                     value={selectedLayer === "custom_element" ? (customElements.find(c => c.id === selectedElementId)?.letterSpacing ?? "0") : (getSelectedLayerOverride()?.letterSpacing ?? textLetterSpacing)} 
                     onChange={e => {
                       const val = e.target.value;
                       if (!/^-?\d*\.?\d*$/.test(val)) return;
                       
                       if (selectedLayer === "custom_element" && setCustomElements) {
                         setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, letterSpacing: val as any } : c));
                       } else if (selectedLayer && activeTab && setLayerOverrides) {
                         const key = `${activeTab}_${selectedLayer}`;
                         setLayerOverrides(prev => ({
                           ...prev,
                           [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), letterSpacing: val }
                         }));
                       } else {
                         setTextLetterSpacing(val as any);
                       }
                     }} 
                     className="w-full bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white" 
                   />
                   <span className="text-zinc-500 text-[9px] pr-2 pointer-events-none">%</span>
                 </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1">
               <span className="text-[9px] text-zinc-500">Alignment</span>
               <div className="flex items-center gap-1 bg-black p-1 rounded border border-transparent w-fit">
                 {(() => {
                   const currentAlign = selectedLayer === "custom_element" 
                     ? (customElements.find(c => c.id === selectedElementId)?.textAlign || "center") 
                     : (getSelectedLayerOverride()?.textAlign || textAlign);
                   const handleAlign = (val: string) => {
                     if (selectedLayer === "custom_element" && setCustomElements) {
                       setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, textAlign: val } : c));
                     } else if (selectedLayer && activeTab && setLayerOverrides) {
                       const key = `${activeTab}_${selectedLayer}`;
                       setLayerOverrides(prev => ({
                         ...prev,
                         [key]: { ...(prev?.[key] || { id: selectedLayer, x: 0, y: 0 }), textAlign: val }
                       }));
                     } else {
                       setTextAlign(val);
                     }
                   };
                   return (
                     <>
                       <button onClick={() => handleAlign("left")} className={`p-1.5 rounded hover:bg-white/10 ${currentAlign === "left" ? "bg-white/10 text-white" : "text-zinc-500"}`}><AlignLeft className="w-3 h-3" /></button>
                       <button onClick={() => handleAlign("center")} className={`p-1.5 rounded hover:bg-white/10 ${currentAlign === "center" ? "bg-white/10 text-white" : "text-zinc-500"}`}><AlignCenter className="w-3 h-3" /></button>
                       <button onClick={() => handleAlign("right")} className={`p-1.5 rounded hover:bg-white/10 ${currentAlign === "right" ? "bg-white/10 text-white" : "text-zinc-500"}`}><AlignRight className="w-3 h-3" /></button>
                     </>
                   );
                 })()}
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Fill */}
      <section className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[11px] flex items-center mb-3">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Fill</span></label>
          <div className="flex gap-3 text-zinc-500">
            <Tooltip content="Layout Options"><LayoutGrid className="w-3.5 h-3.5 hover:text-white cursor-pointer" /></Tooltip>
            <Tooltip content="Add Fill"><Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer" /></Tooltip>
          </div>
        </div>
        
        {(() => {
          let currentFill: FillSettings;
          if (selectedLayer === 'background') {
            currentFill = backgroundFill;
          } else if (selectedLayer === 'custom_element' && selectedElementId) {
            const el = customElements.find(c => c.id === selectedElementId);
            if (typeof el?.fill === 'object' && el.fill !== null) {
              currentFill = el.fill as FillSettings;
            } else {
              currentFill = {
                type: 'solid',
                stops: [{ id: '1', color: typeof el?.fill === 'string' && el.fill !== 'transparent' ? el.fill : '#ffffff', opacity: 100, position: 0 }],
                angle: 0,
                isReversed: false,
                globalOpacity: 100
              };
            }
          } else {
            currentFill = textFill;
          }

          return (
            <AdvancedColorPicker 
              fill={currentFill} 
              onChange={(newFill) => {
                if (selectedLayer === 'background') {
                  setBackgroundFill(newFill);
                } else if (selectedLayer === 'custom_element' && selectedElementId && setCustomElements) {
                  setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, fill: newFill } : c));
                } else {
                  setTextFill(newFill);
                }
              }} 
            />
          );
        })()}
      </section>

      {/* Stroke (Global) */}
      <section className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] flex items-center mb-3">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Stroke</span></label>
          </div>
          
          <div className="space-y-3">
            {(() => {
              let currentStroke: import('../types').FillSettings;
              if (selectedLayer === 'custom_element' && selectedElementId) {
                const el = customElements.find(c => c.id === selectedElementId);
                if (typeof el?.stroke === 'object' && el.stroke !== null) {
                  currentStroke = el.stroke as import('../types').FillSettings;
                } else {
                  currentStroke = {
                    type: 'solid',
                    stops: [{ id: '1', color: typeof el?.stroke === 'string' && el.stroke !== 'transparent' && el.stroke !== 'none' ? el.stroke : '#000000', opacity: 100, position: 0 }],
                    angle: 0,
                    isReversed: false,
                    globalOpacity: (el?.strokeOpacity ?? 1) * 100
                  };
                }
              } else {
                currentStroke = textStrokeFill || {
                  type: 'solid',
                  stops: [{ id: '1', color: textStrokeColor || '#000000', opacity: 100, position: 0 }],
                  angle: 0,
                  isReversed: false,
                  globalOpacity: (textStrokeOpacity ?? 1) * 100
                };
              }

              return (
                <AdvancedColorPicker 
                  fill={currentStroke} 
                  onChange={(newStroke) => {
                    if (selectedLayer === 'custom_element' && selectedElementId && setCustomElements) {
                      setCustomElements(customElements.map(c => c.id === selectedElementId ? { 
                        ...c, 
                        stroke: newStroke, 
                        strokeOpacity: newStroke.globalOpacity / 100 
                      } : c));
                    } else {
                      if (setTextStrokeFill) setTextStrokeFill(newStroke);
                      if (setTextStrokeOpacity) setTextStrokeOpacity(newStroke.globalOpacity / 100);
                      // keep string color for backwards compatibility
                      if (newStroke.type === 'solid' && setTextStrokeColor) setTextStrokeColor(newStroke.stops[0].color);
                    }
                  }} 
                />
              );
            })()}
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] text-zinc-500">Position</span>
                 <div className="relative group">
                   <select 
                     value={selectedLayer === "custom_element" ? (customElements.find(c => c.id === selectedElementId)?.strokePosition || "Center") : strokePosition} 
                     onChange={(e) => {
                       if (selectedLayer === "custom_element" && setCustomElements) {
                         setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, strokePosition: e.target.value } : c));
                       } else {
                         setStrokePosition(e.target.value as any);
                       }
                     }} 
                     className="w-full appearance-none bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2.5 py-1.5 outline-none cursor-pointer text-white"
                   >
                     <option value="Outside">Outside</option>
                     <option value="Inside">Inside</option>
                     <option value="Center">Center</option>
                   </select>
                   <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                 </div>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] text-zinc-500">Weight</span>
                 <div className="flex items-center bg-black border border-transparent hover:border-[#444] focus-within:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2 overflow-hidden">
                   <span className="text-zinc-500 pr-1.5 flex items-center"><AlignHorizontalSpaceAround className="w-3 h-3" /></span>
                   <NumberInput value={selectedLayer === "custom_element" ? (customElements.find(c => c.id === selectedElementId)?.strokeWidth ?? 2) : textStrokeWidth} onChange={val => {
                     if (selectedLayer === "custom_element" && setCustomElements) {
                       setCustomElements(customElements.map(c => c.id === selectedElementId ? { ...c, strokeWidth: val } : c));
                     } else {
                       setTextStrokeWidth(val);
                     }
                   }} className="w-full bg-transparent border-none py-1.5 outline-none text-[10px] text-white" />
                 </div>
              </div>
            </div>
          </div>
        </section>

      {/* Effects */}
      {/* Effects */}
      <section className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[11px] flex items-center mb-3">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Effects</span>
          </label>
          <button onClick={handleAddEffect} className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {activeEffects.map((effect) => (
            <div key={effect.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 group p-1.5 hover:bg-white/5 rounded border border-transparent hover:border-white/10 bg-black/20 transition-colors">
                <button 
                  onClick={() => setExpandedEffectId(expandedEffectId === effect.id ? null : effect.id)} 
                  className="p-1 text-zinc-400 hover:text-white shrink-0 hover:bg-white/10 rounded"
                >
                  <Settings className="w-3 h-3" />
                </button>
                <div className="flex-1 relative">
                  <select 
                    value={effect.type} 
                    onChange={(e) => {
                      const t = e.target.value as EffectType;
                      updateEffect(effect.id, { 
                        type: t, 
                        x: t.toLowerCase().includes('shadow') ? (effect.x ?? 4) : undefined,
                        y: t.toLowerCase().includes('shadow') ? (effect.y ?? 4) : undefined,
                        blur: t === 'glass' ? 20 : (effect.blur ?? 4),
                        color: t.toLowerCase().includes('shadow') ? (effect.color ?? '#000000') : undefined,
                        opacity: t.toLowerCase().includes('shadow') ? (effect.opacity ?? 25) : undefined,
                        density: t === 'noise' ? 50 : undefined,
                        radius: t === 'texture' ? 10 : undefined,
                      });
                    }}
                    className="w-full bg-transparent appearance-none outline-none text-[10px] text-white cursor-pointer py-1"
                  >
                    <option value="dropShadow">Drop shadow</option>
                    <option value="innerShadow">Inner shadow</option>
                    <option value="layerBlur">Layer blur</option>
                    <option value="backgroundBlur">Background blur</option>
                    <option value="noise">Noise</option>
                    <option value="texture">Texture</option>
                    <option value="glass">Glass</option>
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                </div>
                <button onClick={() => updateEffect(effect.id, { isVisible: !effect.isVisible })} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded">
                  {effect.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button onClick={() => removeEffect(effect.id)} className="p-1 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded">
                  <Minus className="w-3 h-3" />
                </button>
              </div>
              
              
              {expandedEffectId === effect.id && (
                <div className="fixed right-[330px] top-[150px] w-[280px] bg-[#111] border border-white/10 rounded-xl p-4 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[300]">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{effect.type} Settings</span>
                    <button onClick={() => setExpandedEffectId(null)} className="text-zinc-500 hover:text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                  {(effect.type === 'dropShadow' || effect.type === 'innerShadow') && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>X Offset</span>
                          <span className="text-white">{effect.x || 0}px</span>
                        </div>
                        <input type="range" min="-100" max="100" value={effect.x || 0} onChange={e => updateEffect(effect.id, { x: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Y Offset</span>
                          <span className="text-white">{effect.y || 0}px</span>
                        </div>
                        <input type="range" min="-100" max="100" value={effect.y || 0} onChange={e => updateEffect(effect.id, { y: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Blur</span>
                          <span className="text-white">{effect.blur || 0}px</span>
                        </div>
                        <input type="range" min="0" max="100" value={effect.blur || 0} onChange={e => updateEffect(effect.id, { blur: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                      </div>
                      
                      <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                        <span className="text-[10px] text-zinc-500">Color</span>
                        <div className="flex items-center bg-black/60 border border-transparent rounded px-2">
                          <div className="w-3 h-3 rounded-sm border border-white/10 relative overflow-hidden flex-shrink-0">
                            <input type="color" value={effect.color || '#000000'} onChange={e => updateEffect(effect.id, { color: e.target.value })} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
                          </div>
                          <input type="text" value={(effect.color || '#000000').toUpperCase().replace('#', '')} onChange={e => updateEffect(effect.id, { color: '#' + e.target.value })} className="flex-1 bg-transparent border-none py-1.5 pl-2 outline-none text-[10px] text-white uppercase" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Opacity</span>
                          <span className="text-white">{effect.opacity ?? 25}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={effect.opacity ?? 25} onChange={e => updateEffect(effect.id, { opacity: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                      </div>
                    </>
                  )}
                  
                  {(effect.type === 'layerBlur' || effect.type === 'backgroundBlur' || effect.type === 'glass') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Blur</span>
                        <span className="text-white">{effect.blur || 0}px</span>
                      </div>
                      <input type="range" min="0" max="100" value={effect.blur || 0} onChange={e => updateEffect(effect.id, { blur: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                    </div>
                  )}

                  {effect.type === 'layerBlur' && (
                    <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
                      <span className="text-[10px] text-zinc-500">Type</span>
                      <div className="flex bg-black/60 border border-white/10 rounded overflow-hidden">
                        <button 
                          onClick={() => updateEffect(effect.id, { blurType: 'uniform' })}
                          className={`flex-1 py-1 text-[9px] ${effect.blurType !== 'progressive' ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-white'}`}
                        >Uniform</button>
                        <button 
                          onClick={() => updateEffect(effect.id, { blurType: 'progressive' })}
                          className={`flex-1 py-1 text-[9px] ${effect.blurType === 'progressive' ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-white'}`}
                        >Progressive</button>
                      </div>
                    </div>
                  )}
                  
                  {effect.type === 'noise' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Density</span>
                        <span className="text-white">{effect.density || 50}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={effect.density || 50} onChange={e => updateEffect(effect.id, { density: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                    </div>
                  )}

                  {effect.type === 'texture' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Scale</span>
                        <span className="text-white">{effect.radius || 10}px</span>
                      </div>
                      <input type="range" min="1" max="100" value={effect.radius || 10} onChange={e => updateEffect(effect.id, { radius: parseInt(e.target.value) })} className="w-full accent-gold-500" />
                    </div>
                  )}
                  
                  {effect.type === 'glass' && (
                    <div className="text-[9px] text-zinc-500 italic px-1">
                      Glass automatically overrides background fill and applies blur and border.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Image Adjustments (Only for background & logos) */}
      {(selectedLayer === 'background' || selectedLayer === 'header-logo' || selectedLayer === 'header-club' || selectedLayer === 'header-collab' || selectedLayer === 'header-extra' || selectedLayer === 'header-extra2') && (
        <section className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] flex items-center mb-3">
            <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Adjustments</span></label>
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          {(() => {
            const isLogo = selectedLayer && selectedLayer.startsWith('header-');
            const overrideKey = isLogo && activeTab ? `${activeTab}_${selectedLayer}` : selectedLayer;
            const currentOverride = (isLogo && layerOverrides && overrideKey) ? (layerOverrides[overrideKey] || layerOverrides[selectedLayer] || {}) : {};
            
            const currentExposure = isLogo ? (currentOverride.exposure ?? 100) : exposure;
            const currentContrast = isLogo ? (currentOverride.contrast ?? 100) : contrast;
            const currentSaturation = isLogo ? (currentOverride.saturation ?? 100) : saturation;
            const currentTemperature = isLogo ? (currentOverride.temperature ?? 0) : temperature;
            const handleUpdate = (key: string, val: number) => {
              if (isLogo && setLayerOverrides && overrideKey && selectedLayer) {
                setLayerOverrides(prev => ({
                  ...prev,
                  [overrideKey]: {
                    ...(prev[overrideKey] || { id: selectedLayer, x: 0, y: 0 }),
                    [key]: val
                  }
                }));
              } else {
                if (key === 'exposure') setExposure(val);
                if (key === 'contrast') setContrast(val);
                if (key === 'saturation') setSaturation(val);
                if (key === 'temperature') setTemperature(val);
              }
            };

            return (
              <div className="grid grid-cols-[1fr_40px] gap-x-2 gap-y-3 items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 w-14">Exposure</span>
                  <input type="range" min={0} max={200} value={currentExposure} onChange={e => handleUpdate('exposure', Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{currentExposure}%</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 w-14">Contrast</span>
                  <input type="range" min={0} max={200} value={currentContrast} onChange={e => handleUpdate('contrast', Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{currentContrast}%</span>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 w-14">Saturation</span>
                  <input type="range" min={0} max={200} value={currentSaturation} onChange={e => handleUpdate('saturation', Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{currentSaturation}%</span>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 w-14">Temp</span>
                  <input type="range" min={0} max={100} value={currentTemperature} onChange={e => handleUpdate('temperature', Number(e.target.value))} className="flex-1 accent-[#808080]" />
                </div>
                <span className="text-white text-right">{currentTemperature}</span>
              </div>
            );
          })()}
        </section>
      )}

      {/* Label Rules (Only for details, tags) */}
      {(selectedLayer === 'details' || selectedLayer === 'tags' || selectedLayer === 'footer' || selectedLayer === 'header') && (
        <section className="p-4 border-b border-white/10">
          <label className="text-[11px] mb-3 flex items-center">
          <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Label Rules</span></label>
          <div className="flex gap-2 mb-3 text-[10px]">
            <button onClick={() => setLabelsBold(!labelsBold)} className={`flex-1 py-1.5 rounded font-medium ${labelsBold ? "bg-black text-white border border-[#444]" : "bg-black/60 text-zinc-500 border border-transparent"}`}>Bold</button>
            <button onClick={() => setLabelsUppercase(!labelsUppercase)} className={`flex-1 py-1.5 rounded font-medium ${labelsUppercase ? "bg-black text-white border border-[#444]" : "bg-black/60 text-zinc-500 border border-transparent"}`}>Uppercase</button>
          </div>
          <div className="p-3 bg-black border border-white/10 rounded text-[10px] text-zinc-500">
            Edit values directly on the canvas.
          </div>
        </section>
      )}

      {/* Export */}
      <section className="p-4 flex items-center justify-between">
         <label className="text-[11px] flex items-center mb-3">
           <span className="flex items-center font-bold uppercase tracking-widest text-gold-500 text-[11px]">Export</span>
         </label>
         <Plus className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer" />
      </section>

      {/* Error display */}
      {imageGen.error && (
        <div className="m-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-[10px] font-medium text-center">
          {imageGen.error}
        </div>
      )}
    </div>
  );
}
