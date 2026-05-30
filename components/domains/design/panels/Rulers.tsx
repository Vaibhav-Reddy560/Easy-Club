import React, { useEffect, useRef } from 'react';

interface RulersProps {
  pan: { x: number, y: number };
  zoom: number;
  onAddHorizontalGuide: (y: number) => void;
  onAddVerticalGuide: (x: number) => void;
}

export default function Rulers({ pan, zoom, onAddHorizontalGuide, onAddVerticalGuide }: RulersProps) {
  const horizontalCanvasRef = useRef<HTMLCanvasElement>(null);
  const verticalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderRuler = (canvas: HTMLCanvasElement, isHorizontal: boolean) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = isHorizontal ? canvas.offsetWidth : 20;
      const height = isHorizontal ? 20 : canvas.offsetHeight;
      
      // Setup high DPI canvas
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#666';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = isHorizontal ? 'center' : 'left';
      ctx.textBaseline = isHorizontal ? 'bottom' : 'middle';
      
      const majorTickSpacing = 100 * zoom;
      const minorTickSpacing = 10 * zoom;
      
      const offset = isHorizontal ? pan.x : pan.y;
      const length = isHorizontal ? width : height;
      
      // Calculate starting value based on offset
      const startVal = -offset / zoom;
      const endVal = (length - offset) / zoom;
      
      const startMajor = Math.floor(startVal / 100) * 100;
      const startMinor = Math.floor(startVal / 10) * 10;
      
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      
      // Draw minor ticks
      if (zoom > 0.5) { // Only draw minor ticks if zoomed in enough
        for (let val = startMinor; val <= endVal; val += 10) {
          const pos = val * zoom + offset;
          if (pos < 0 || pos > length) continue;
          
          if (val % 100 !== 0) { // skip where major ticks are
            if (isHorizontal) {
              ctx.moveTo(pos, height - 4);
              ctx.lineTo(pos, height);
            } else {
              ctx.moveTo(width - 4, pos);
              ctx.lineTo(width, pos);
            }
          }
        }
      }
      
      // Draw major ticks & labels
      for (let val = startMajor; val <= endVal; val += 100) {
        const pos = val * zoom + offset;
        if (pos < 0 || pos > length) continue;
        
        if (isHorizontal) {
          ctx.moveTo(pos, height - 12);
          ctx.lineTo(pos, height);
          ctx.fillText(val.toString(), pos, height - 12);
        } else {
          ctx.moveTo(width - 12, pos);
          ctx.lineTo(width, pos);
          
          // Rotate text for vertical ruler
          ctx.save();
          ctx.translate(width - 12, pos);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(val.toString(), 0, 0);
          ctx.restore();
        }
      }
      
      ctx.stroke();
    };
    
    if (horizontalCanvasRef.current) renderRuler(horizontalCanvasRef.current, true);
    if (verticalCanvasRef.current) renderRuler(verticalCanvasRef.current, false);
    
    // Resize observer to re-render when window size changes
    const resizeObserver = new ResizeObserver(() => {
      if (horizontalCanvasRef.current) renderRuler(horizontalCanvasRef.current, true);
      if (verticalCanvasRef.current) renderRuler(verticalCanvasRef.current, false);
    });
    
    if (horizontalCanvasRef.current) resizeObserver.observe(horizontalCanvasRef.current);
    if (verticalCanvasRef.current) resizeObserver.observe(verticalCanvasRef.current);
    
    return () => resizeObserver.disconnect();
  }, [pan, zoom]);

  const handleHorizontalMouseDown = (e: React.MouseEvent) => {
    // Extract Y in screen coords to calculate canvas Y
    // But since it's the top ruler, we just want to create a guide at the current mouse position in canvas coordinates
    // We let the parent handle the initial position and dragging state
    onAddHorizontalGuide(e.clientY);
  };

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    onAddVerticalGuide(e.clientX);
  };

  return (
    <>
      <div 
        className="absolute top-0 left-5 right-0 h-5 z-40 bg-[#111] cursor-ns-resize border-b border-white/10"
        onMouseDown={handleHorizontalMouseDown}
      >
        <canvas ref={horizontalCanvasRef} className="w-full h-full block" />
      </div>
      <div 
        className="absolute top-5 left-0 bottom-0 w-5 z-40 bg-[#111] cursor-ew-resize border-r border-white/10"
        onMouseDown={handleVerticalMouseDown}
      >
        <canvas ref={verticalCanvasRef} className="w-full h-full block" />
      </div>
      {/* Top Left Corner */}
      <div className="absolute top-0 left-0 w-5 h-5 z-50 bg-[#111] border-b border-r border-white/10" />
    </>
  );
}
