import React from "react";
import { FORMATS, LAYER_ICONS, getCertificateUrl } from "../constants";
import { Layer, DesignTab } from "../types";

import { ExternalLink, ChevronRight } from "lucide-react";
import { NATIVE_SUBLAYERS_MAP } from "../types";

interface LeftSidebarProps {
  selectedArtboard: string | null;
  setSelectedArtboard: (id: DesignTab | null) => void;
  activeTab: DesignTab | string | null;
  setActiveTab: (id: DesignTab | string | null) => void;
  selectedLayer: Layer | null;
  setSelectedLayer: (layer: Layer) => void;
  eventSubType?: string;
  customArtboards?: import('../types').CustomArtboard[];
  customElements?: import('../types').CustomElement[];
  setCustomElements?: React.Dispatch<React.SetStateAction<import('../types').CustomElement[]>>;
  selectedElementId?: string | null;
  setSelectedElementId?: (id: string | null) => void;
}

export default function LeftSidebar({
  selectedArtboard,
  setSelectedArtboard,
  activeTab,
  setActiveTab,
  selectedLayer,
  setSelectedLayer,
  eventSubType,
  customArtboards = [],
  customElements = [],
  setCustomElements,
  selectedElementId,
  setSelectedElementId
}: LeftSidebarProps) {
  const [dragOverLayerId, setDragOverLayerId] = React.useState<string | null>(null);
  const [dragOverElement, setDragOverElement] = React.useState<{id: string, position: 'top'|'bottom'} | null>(null);
  const [expandedLayers, setExpandedLayers] = React.useState<Record<string, boolean>>({});

  const toggleLayer = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData("text/plain", elementId);
    e.dataTransfer.effectAllowed = "move";
    
    // Set a transparent drag image so the browser doesn't draw the "full box"
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverLayerId !== targetId) {
      setDragOverLayerId(targetId);
    }
    if (dragOverElement) setDragOverElement(null);
  };

  const handleDragLeave = (e: React.DragEvent, targetId: string) => {
    if (dragOverLayerId === targetId) {
      setDragOverLayerId(null);
    }
  };

  const handleDragOverElement = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverLayerId) setDragOverLayerId(null);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = (e.clientY - rect.top) < (rect.height / 2) ? 'top' : 'bottom';
    
    if (dragOverElement?.id !== targetId || dragOverElement?.position !== position) {
      setDragOverElement({ id: targetId, position });
    }
  };

  const handleDragLeaveElement = (e: React.DragEvent, targetId: string) => {
    e.stopPropagation();
    if (dragOverElement?.id === targetId) {
      setDragOverElement(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLayerId(null);
    setDragOverElement(null);
    const elementId = e.dataTransfer.getData("text/plain");
    if (elementId && setCustomElements) {
      setCustomElements((prev) => {
        // Move element to end of layer's elements (so it renders on top by default)
        const updated = prev.map(c => c.id === elementId ? { ...c, parentLayerId: targetLayerId === "none" ? undefined : targetLayerId } : c);
        const el = updated.find(c => c.id === elementId);
        if (el) {
           const others = updated.filter(c => c.id !== elementId);
           return [...others, el];
        }
        return updated;
      });
    }
  };

  const handleElementDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dragOverElement?.position || 'top';
    setDragOverLayerId(null);
    setDragOverElement(null);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== targetElementId && setCustomElements) {
      setCustomElements((prev) => {
        const draggedEl = prev.find(c => c.id === draggedId);
        const targetEl = prev.find(c => c.id === targetElementId);
        if (!draggedEl || !targetEl) return prev;
        
        // Inherit target's layer and artboard
        const updatedDragged = { 
           ...draggedEl, 
           parentLayerId: targetEl.parentLayerId,
           parentArtboardId: targetEl.parentArtboardId
        };
        
        const withoutDragged = prev.filter(c => c.id !== draggedId);
        let targetIndex = withoutDragged.findIndex(c => c.id === targetElementId);
        
        if (pos === 'bottom') targetIndex += 1;
        
        const result = [...withoutDragged];
        result.splice(targetIndex, 0, updatedDragged);
        return result;
      });
    }
  };
  return (
    <div className="w-[260px] shrink-0 bg-transparent border-r border-white/5 flex flex-col z-[92]">
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Artboards */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4 pl-4">
            Artboards
          </h3>
          <div className="space-y-1">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  if (f.id === "certificate") {
                     window.open(getCertificateUrl(eventSubType), '_blank');
                  } else {
                     setSelectedArtboard(f.id); setActiveTab(f.id);
                  }
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3 group relative overflow-hidden ${
                  activeTab === f.id 
                    ? 'border border-gold-500 text-gold-500 bg-transparent' 
                    : 'bg-black/40 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <f.icon className={`w-4 h-4 shrink-0 ${activeTab === f.id ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />
                <span className="whitespace-nowrap bg-transparent">{f.label}</span>
                <span className={`ml-auto text-[10px] whitespace-nowrap bg-transparent flex items-center gap-1 ${activeTab === f.id ? 'text-gold-500/70' : 'text-zinc-500'}`}>
                  {f.id === "certificate" && <ExternalLink className="w-3 h-3" />}
                  {f.dim}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Layers */}
        {activeTab && (
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4 pl-4">
              Layers
            </h3>
            <div 
              className="space-y-1"
              onDragOver={(e) => handleDragOver(e, "none")}
              onDragLeave={(e) => handleDragLeave(e, "none")}
              onDrop={(e) => handleDrop(e, "none")}
            >
              {(["header", "title", "tagline", "details", "tags", "footer", "background"] as Layer[]).map(layer => {
                const Icon = LAYER_ICONS[layer];
                const layerCustomElements = customElements.filter(e => e.parentLayerId === layer && (!e.parentArtboardId || e.parentArtboardId === activeTab));
                const nativeSublayers = NATIVE_SUBLAYERS_MAP[layer] || [];
                const isExpanded = expandedLayers[layer] || nativeSublayers.some(s => s.id === selectedLayer) || layerCustomElements.some(e => e.id === selectedElementId);

              return (
                <div 
                  key={layer} 
                  className="space-y-1 relative group"
                  onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, layer); }}
                  onDragLeave={(e) => { e.stopPropagation(); handleDragLeave(e, layer); }}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(e, layer); }}
                >
                  {dragOverLayerId === layer && (
                    <div className="absolute -bottom-1 left-4 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                  )}
                  <button
                    onClick={() => { setSelectedLayer(layer); setSelectedArtboard(null as any); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3 group relative overflow-hidden ${
                      selectedLayer === layer || (selectedArtboard && selectedArtboard === activeTab)
                        ? 'border border-gold-500 text-gold-500 bg-transparent' 
                        : 'bg-black/40 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {nativeSublayers.length > 0 ? (
                      <div 
                        onClick={(e) => toggleLayer(layer, e)}
                        className={`w-4 h-4 shrink-0 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <ChevronRight className="w-3 h-3 text-zinc-500 hover:text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 shrink-0" />
                    )}
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${selectedLayer === layer || (selectedArtboard && selectedArtboard === activeTab) ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                    <span className="capitalize whitespace-nowrap bg-transparent">{layer}</span>
                  </button>
                  
                  {isExpanded && nativeSublayers.length > 0 && (
                    <div className="pl-6 space-y-1 border-l border-white/10 ml-4 my-1">
                      {nativeSublayers.map(sublayer => {
                        const ElIcon = LAYER_ICONS["custom_element"];
                        const isSel = selectedLayer === sublayer.id;
                        return (
                          <div key={sublayer.id} className="relative">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedLayer(sublayer.id as Layer); 
                                setSelectedArtboard(null as any);
                                setActiveTab(activeTab);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${
                                isSel 
                                  ? 'border border-gold-500 text-gold-500 bg-transparent' 
                                  : selectedArtboard && selectedArtboard === activeTab
                                    ? 'border border-transparent text-gold-500 bg-transparent'
                                    : 'bg-transparent text-zinc-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {ElIcon && <ElIcon className={`w-3 h-3 shrink-0 ${isSel || (selectedArtboard && selectedArtboard === activeTab) ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                              <span className="whitespace-nowrap bg-transparent truncate">
                                {sublayer.label}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {isExpanded && layerCustomElements.length > 0 && (
                    <div className="pl-6 space-y-1 border-l border-white/10 ml-4 my-1">
                      {layerCustomElements.map(el => {
                        const ElIcon = LAYER_ICONS["custom_element"];
                        const isSel = selectedLayer === "custom_element" && selectedElementId === el.id;
                        return (
                          <div
                            key={el.id}
                            className="relative"
                            onDragOver={(e) => handleDragOverElement(e, el.id)}
                            onDragLeave={(e) => handleDragLeaveElement(e, el.id)}
                            onDrop={(e) => { e.stopPropagation(); handleElementDrop(e, el.id); }}
                          >
                            {dragOverElement?.id === el.id && dragOverElement.position === 'top' && (
                              <div className="absolute -top-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                            )}
                            {dragOverElement?.id === el.id && dragOverElement.position === 'bottom' && (
                              <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                            )}
                            <button
                              draggable
                              onDragStart={(e) => handleDragStart(e, el.id)}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedLayer("custom_element"); 
                                if(setSelectedElementId) setSelectedElementId(el.id); 
                                setSelectedArtboard(null as any);
                                setActiveTab(el.parentArtboardId || (null as any));
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${
                                isSel 
                                  ? 'border border-gold-500 text-gold-500 bg-transparent' 
                                  : selectedArtboard && selectedArtboard === activeTab
                                    ? 'border border-transparent text-gold-500 bg-transparent'
                                    : 'bg-transparent text-zinc-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {ElIcon && <ElIcon className={`w-3 h-3 shrink-0 ${isSel || (selectedArtboard && selectedArtboard === activeTab) ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                              <span className="whitespace-nowrap bg-transparent truncate">
                                {el.type === 'text' ? ((el as any).text || 'Text') : (el.subType || el.type)}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
              {/* Custom Artboards and their Sublayers */}
              {customArtboards.map(artboard => {
                if (artboard.id !== activeTab && !customArtboards.some(a => a.id === activeTab)) return null; 
                const Icon = LAYER_ICONS["custom_artboard"];
              const subElements = customElements.filter(e => e.parentArtboardId === artboard.id);
              
              return (
                <div key={artboard.id} className="space-y-1">
                  <button
                    onClick={() => setSelectedLayer("custom_artboard")} // Ideally would set specific artboard ID
                    className={`w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3 group relative overflow-hidden ${
                      selectedLayer === "custom_artboard" 
                        ? 'border border-gold-500 text-gold-500 bg-transparent' 
                        : 'bg-black/40 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${selectedLayer === "custom_artboard" ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                    <span className="whitespace-nowrap bg-transparent">{artboard.label}</span>
                  </button>
                  
                  {subElements.length > 0 && (
                    <div className="pl-6 space-y-1 border-l border-white/10 ml-4 my-1">
                      {subElements.map(el => {
                        const ElIcon = LAYER_ICONS["custom_element"];
                        const isSel = selectedLayer === "custom_element" && selectedElementId === el.id;
                        return (
                              <div
                            key={el.id}
                            className="relative"
                            onDragOver={(e) => handleDragOverElement(e, el.id)}
                            onDragLeave={(e) => handleDragLeaveElement(e, el.id)}
                            onDrop={(e) => { e.stopPropagation(); handleElementDrop(e, el.id); }}
                          >
                            {dragOverElement?.id === el.id && dragOverElement.position === 'top' && (
                              <div className="absolute -top-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                            )}
                            {dragOverElement?.id === el.id && dragOverElement.position === 'bottom' && (
                              <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                            )}
                            <button
                            key={el.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, el.id)}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedLayer("custom_element"); 
                              if(setSelectedElementId) setSelectedElementId(el.id); 
                              setSelectedArtboard(null as any);
                              setActiveTab(el.parentArtboardId || (null as any));
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${
                              isSel 
                                ? 'border border-gold-500 text-gold-500 bg-transparent' 
                                : selectedArtboard && selectedArtboard === activeTab
                                  ? 'border border-transparent text-gold-500 bg-transparent'
                                  : 'bg-transparent text-zinc-400 hover:text-white border border-transparent'
                            }`}
                          >
                            {ElIcon && <ElIcon className={`w-3 h-3 shrink-0 ${isSel || (selectedArtboard && selectedArtboard === activeTab) ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                            <span className="whitespace-nowrap bg-transparent truncate">
                              {el.type === 'text' ? ((el as any).text || 'Text') : (el.subType || el.type)}
                            </span>
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Native Artboard Sublayers (Custom Elements grouped by parentArtboardId if it matches a format id) */}
            {FORMATS.map(f => {
              const subElements = customElements.filter(e => !e.parentLayerId && e.parentArtboardId === f.id);
              if (subElements.length === 0) return null;
              
              return (
                <div key={f.id} className="pl-6 space-y-1 border-l border-white/10 ml-4 my-1">
                  {subElements.map(el => {
                    const ElIcon = LAYER_ICONS["custom_element"];
                    const isSel = selectedLayer === "custom_element" && selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        className="relative"
                        onDragOver={(e) => handleDragOverElement(e, el.id)}
                        onDragLeave={(e) => handleDragLeaveElement(e, el.id)}
                        onDrop={(e) => { e.stopPropagation(); handleElementDrop(e, el.id); }}
                      >
                        {dragOverElement?.id === el.id && dragOverElement.position === 'top' && (
                          <div className="absolute -top-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                        )}
                        {dragOverElement?.id === el.id && dragOverElement.position === 'bottom' && (
                          <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                        )}
                        <button
                          draggable
                          onDragStart={(e) => handleDragStart(e, el.id)}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedLayer("custom_element"); 
                            if(setSelectedElementId) setSelectedElementId(el.id); 
                            setSelectedArtboard(null as any);
                            setActiveTab(el.parentArtboardId || (null as any));
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${
                            isSel 
                              ? 'border border-gold-500 text-gold-500 bg-transparent' 
                              : selectedArtboard && selectedArtboard === activeTab
                                ? 'border border-transparent text-gold-500 bg-transparent'
                                : 'bg-transparent text-zinc-400 hover:text-white border border-transparent'
                          }`}
                        >
                          {ElIcon && <ElIcon className={`w-3 h-3 shrink-0 ${isSel || (selectedArtboard && selectedArtboard === activeTab) ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                          <span className="whitespace-nowrap bg-transparent truncate">
                            {el.type === 'text' ? ((el as any).text || 'Text') : (el.subType || el.type)}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Global / Unparented Elements */}
        <div className="mt-6 mb-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-3 pl-4 flex items-center gap-2">
            Outside Artboards
          </h3>
          <div 
             className={`space-y-1 pb-4 min-h-[50px] rounded-lg mx-3 p-2 transition-all border border-dashed ${dragOverLayerId === 'global' ? 'border-gold-500 bg-gold-500/5' : 'border-white/10'}`}
             onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOverLayerId !== 'global') setDragOverLayerId('global'); }}
             onDragLeave={() => setDragOverLayerId(null)}
             onDrop={(e) => {
                 e.preventDefault();
                 setDragOverLayerId(null);
                 const draggedId = e.dataTransfer.getData("text/plain");
                 if (draggedId && setCustomElements) {
                   setCustomElements(prev => prev.map(c => c.id === draggedId ? { ...c, parentLayerId: undefined, parentArtboardId: undefined } : c));
                 }
             }}
          >
             {customElements.filter(e => !e.parentArtboardId && !e.parentLayerId).length === 0 && (
                <div className="text-[10px] text-zinc-600 text-center py-2 pointer-events-none">Drop elements here to un-parent</div>
             )}
             {customElements.filter(e => !e.parentLayerId && !e.parentArtboardId).map(el => {
                const Icon = LAYER_ICONS["custom_element"];
                const isSel = selectedLayer === "custom_element" && selectedElementId === el.id;
                return (
                  <div
                    key={el.id}
                    className="relative"
                    onDragOver={(e) => handleDragOverElement(e, el.id)}
                    onDragLeave={(e) => handleDragLeaveElement(e, el.id)}
                    onDrop={(e) => { e.stopPropagation(); handleElementDrop(e, el.id); }}
                  >
                    {dragOverElement?.id === el.id && dragOverElement.position === 'top' && (
                      <div className="absolute -top-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                    )}
                    {dragOverElement?.id === el.id && dragOverElement.position === 'bottom' && (
                      <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(245,158,11,0.6)] z-50 pointer-events-none" />
                    )}
                    <button
                      draggable
                      onDragStart={(e) => handleDragStart(e, el.id)}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedLayer("custom_element"); 
                        if(setSelectedElementId) setSelectedElementId(el.id); 
                        setSelectedArtboard(null as any);
                        setActiveTab(el.parentArtboardId || (null as any));
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2 group relative overflow-hidden ${
                        isSel 
                          ? 'border border-gold-500 text-gold-500 bg-transparent' 
                          : 'bg-transparent text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {Icon && <Icon className={`w-3 h-3 shrink-0 ${isSel ? 'text-gold-500' : 'text-zinc-500 group-hover:text-white'}`} />}
                      <span className="whitespace-nowrap bg-transparent truncate">
                        {el.type === 'text' ? ((el as any).text || 'Text') : (el.subType || el.type)}
                      </span>
                    </button>
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
