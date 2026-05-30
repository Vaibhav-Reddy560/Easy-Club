import React, { useRef, useState, useEffect } from "react";
import { Plus, Minus, RotateCcw, ArrowRightLeft, Trash2, SlidersHorizontal, MousePointerClick } from "lucide-react";
import { FillSettings, ColorStop } from "../types";
import Tooltip from "@/components/ui/Tooltip";
import NumberInput from "@/components/ui/NumberInput";

interface Props {
  fill: FillSettings;
  onChange: (fill: FillSettings) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AdvancedColorPicker({ fill, onChange }: Props) {
  const [activeStopId, setActiveStopId] = useState<string>(fill.stops[0]?.id || "");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fill.stops.find(s => s.id === activeStopId) && fill.stops.length > 0) {
      setActiveStopId(fill.stops[0].id);
    }
  }, [fill.stops, activeStopId]);

  const activeStop = fill.stops.find(s => s.id === activeStopId) || fill.stops[0];

  const handleTrackClick = (e: React.MouseEvent) => {
    if (fill.type === 'solid') return;
    if (!trackRef.current) return;
    
    // Prevent adding if clicking on a stop thumb
    if ((e.target as HTMLElement).closest('.stop-thumb')) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const position = Math.round((x / rect.width) * 100);

    const newStop: ColorStop = {
      id: generateId(),
      color: activeStop ? activeStop.color : '#ffffff',
      opacity: activeStop ? activeStop.opacity : 100,
      position
    };

    const newStops = [...fill.stops, newStop].sort((a, b) => a.position - b.position);
    onChange({ ...fill, stops: newStops });
    setActiveStopId(newStop.id);
  };

  const updateActiveStop = (updates: Partial<ColorStop>) => {
    const newStops = fill.stops.map(s => s.id === activeStopId ? { ...s, ...updates } : s);
    onChange({ ...fill, stops: newStops });
  };

  const removeActiveStop = () => {
    if (fill.stops.length <= 2) return; // Minimum 2 stops for gradient
    const newStops = fill.stops.filter(s => s.id !== activeStopId);
    onChange({ ...fill, stops: newStops });
    setActiveStopId(newStops[0].id);
  };

  const renderGradientPreview = () => {
    if (fill.type === 'solid') return fill.stops[0]?.color || '#000000';
    
    const sortedStops = [...fill.stops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(s => {
      const alpha = Math.round((s.opacity / 100) * 255).toString(16).padStart(2, '0');
      return `${s.color}${alpha} ${s.position}%`;
    }).join(', ');
    
    return `linear-gradient(90deg, ${stopsString})`;
  };

  return (
    <div className="bg-black border border-white/10 rounded-xl p-3 mt-3 space-y-4">
      {/* Type Toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg text-[10px]">
        {(['solid', 'linear', 'radial'] as const).map(type => (
          <button
            key={type}
            onClick={() => onChange({ ...fill, type })}
            className={`flex-1 py-1.5 capitalize rounded-md transition-colors ${fill.type === type ? 'bg-gold-500 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Gradient Track & Tools - Hidden for solid fill */}
      {fill.type !== 'solid' && (
        <>
          <div 
            ref={trackRef}
            className="h-6 rounded border border-white/20 relative cursor-crosshair shadow-inner"
            style={{ background: renderGradientPreview() }}
            onClick={handleTrackClick}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 4px)' }} />
            
            {fill.stops.map((stop) => (
              <div
                key={stop.id}
                className={`stop-thumb absolute top-1/2 -translate-y-1/2 w-4 h-5 -ml-2 rounded-[2px] border-2 shadow-md cursor-ew-resize transition-transform ${activeStopId === stop.id ? 'border-white z-10 scale-110' : 'border-zinc-400 z-0'}`}
                style={{ 
                  left: `${stop.position}%`, 
                  backgroundColor: stop.color 
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveStopId(stop.id);
                  
                  const startX = e.clientX;
                  const startPos = stop.position;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    if (!trackRef.current) return;
                    const rect = trackRef.current.getBoundingClientRect();
                    const deltaX = moveEvent.clientX - startX;
                    const deltaPos = (deltaX / rect.width) * 100;
                    let newPos = Math.round(startPos + deltaPos);
                    newPos = Math.max(0, Math.min(100, newPos));
                    
                    onChange({
                      ...fill,
                      stops: fill.stops.map(s => s.id === stop.id ? { ...s, position: newPos } : s)
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Tooltip content="Add Stop">
                <button onClick={() => {
                  if (!trackRef.current) return;
                  const newStop: ColorStop = { id: generateId(), color: activeStop?.color || '#fff', opacity: activeStop?.opacity || 100, position: 50 };
                  onChange({ ...fill, stops: [...fill.stops, newStop] });
                  setActiveStopId(newStop.id);
                }} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              
              <Tooltip content="Remove Stop">
                <button onClick={removeActiveStop} disabled={fill.stops.length <= 2} className={`p-1.5 rounded ${fill.stops.length <= 2 ? 'text-zinc-600' : 'hover:bg-white/10 text-zinc-400 hover:text-red-400'}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
            
            <div className="flex gap-2">
              {fill.type === 'linear' && (
                <Tooltip content="Rotate 90°">
                  <button onClick={() => onChange({ ...fill, angle: (fill.angle + 90) % 360 })} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white flex items-center gap-1 text-[9px]">
                    <RotateCcw className="w-3.5 h-3.5" /> {fill.angle}°
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Reverse Gradient">
                <button onClick={() => {
                  const reversed = fill.stops.map(s => ({ ...s, position: 100 - s.position }));
                  onChange({ ...fill, stops: reversed });
                }} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </>
      )}

      {/* Active Color Settings */}
      {activeStop && (
        <div className="grid grid-cols-[1fr_110px] gap-3 items-center">
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded px-2 overflow-hidden h-8">
            <div className="w-4 h-4 rounded-sm relative overflow-hidden shrink-0 border border-white/20">
              <input type="color" value={activeStop.color} onChange={e => updateActiveStop({ color: e.target.value })} className="absolute -inset-2 w-8 h-8 cursor-pointer" />
            </div>
            <input type="text" value={activeStop.color.toUpperCase().replace('#', '')} onChange={e => updateActiveStop({ color: '#' + e.target.value })} className="w-full bg-transparent border-none outline-none text-[10px] text-white uppercase font-mono" />
          </div>
          
          <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded px-2 h-8">
            <span className="text-zinc-500 text-[10px]">Opacity:</span>
            <NumberInput value={activeStop.opacity} onChange={val => updateActiveStop({ opacity: val })} min={0} max={100} className="w-full bg-transparent border-none outline-none text-[10px] text-white text-right" />
            <span className="text-zinc-500 text-[9px]">%</span>
          </div>
        </div>
      )}

      {/* Global Opacity */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="text-[10px] text-zinc-400 w-12">Global</span>
        <input type="range" min="0" max="100" value={fill.globalOpacity} onChange={e => onChange({ ...fill, globalOpacity: Number(e.target.value) })} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold-500" />
        <span className="text-[10px] text-zinc-400 w-8 text-right">{fill.globalOpacity}%</span>
      </div>
    </div>
  );
}
