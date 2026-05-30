import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Grid3x3, Square, PenTool, Type, Hand, ChevronDown, Circle, Triangle, Minus, Star, Hexagon } from 'lucide-react';
import { ActiveTool, ShapeType } from '../types';

interface BottomToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
}

export default function BottomToolbar({ activeTool, setActiveTool, activeShape, setActiveShape }: BottomToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'artboard', icon: Grid3x3, label: 'Artboard (F)' },
    { id: 'shape', icon: Square, label: 'Shape Tool (R)', hasDropdown: true },
    { id: 'pen', icon: PenTool, label: 'Pen Tool (P)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
    { id: 'hand', icon: Hand, label: 'Hand Tool (H)' }
  ];

  const shapes = [
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse (O)' },
    { id: 'polygon', icon: Triangle, label: 'Polygon' },
    { id: 'star', icon: Star, label: 'Star' },
    { id: 'line', icon: Minus, label: 'Line (L)' }
  ];

  const handleToolClick = (toolId: string, hasDropdown: boolean) => {
    if (hasDropdown) {
      if (activeTool === toolId) {
        setOpenDropdown(openDropdown === toolId ? null : toolId);
      } else {
        setActiveTool(toolId as ActiveTool);
        setOpenDropdown(null);
      }
    } else {
      setActiveTool(toolId as ActiveTool);
      setOpenDropdown(null);
    }
  };

  const renderShapeIcon = () => {
    switch (activeShape) {
      case 'ellipse': return Circle;
      case 'polygon': return Triangle;
      case 'star': return Star;
      case 'line': return Minus;
      default: return Square;
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
      <div className="flex items-center gap-1 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 shadow-2xl">
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          const Icon = tool.id === 'shape' ? renderShapeIcon() : tool.icon;
          
          return (
            <div key={tool.id} className="relative">
              <button
                onClick={() => handleToolClick(tool.id, !!tool.hasDropdown)}
                className={`group flex items-center gap-1 px-3 py-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-gold-500 text-black' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
                {tool.hasDropdown && (
                  <ChevronDown className={`w-3 h-3 ml-0.5 opacity-50 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                )}
              </button>

              {/* Shape Dropdown */}
              <AnimatePresence>
                {tool.hasDropdown && openDropdown === tool.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1"
                  >
                    {shapes.map(shape => {
                      const ShapeIcon = shape.icon;
                      return (
                        <button
                          key={shape.id}
                          onClick={() => {
                            setActiveShape(shape.id as ShapeType);
                            setActiveTool('shape');
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-colors ${
                            activeShape === shape.id ? 'bg-gold-500/20 text-gold-500' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <ShapeIcon className="w-3.5 h-3.5" />
                          <span>{shape.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
