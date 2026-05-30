"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { INDIA_CITIES } from "@/data/city-coordinates";
import { Plus, Minus, Maximize2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const INDIA_GEO_URL = "/india-states.json";
const ZOOM_STEPS = [1, 1.5, 2.2, 3, 4];
const PAN_STEP = 80; // pixels per arrow click

interface Props {
  clubs: any[];
  selectedCategory: string;
  selectedCity: string | null;
  onCitySelect: (city: string | null) => void;
  clubCountByCity: Record<string, number>;
}

export default function IndiaMapView({
  clubs,
  selectedCategory,
  selectedCity,
  onCitySelect,
  clubCountByCity,
}: Props) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Synchronize external selectedCity changes (like clicking a Quick-Jump city)
  useEffect(() => {
    if (!selectedCity) {
      setZoomIndex(0);
      setPan({ x: 0, y: 0 });
      return;
    }

    const city = INDIA_CITIES.find(c => c.name === selectedCity);
    if (city) {
      const [lon, lat] = city.coordinates;
      // Convert longitude/latitude to projected pixel coordinates on our 800x900 map
      const xVal = (lon - 82) * 19.2 + 400;
      const yVal = 450 - (lat - 22) * 20.8;

      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const newPanX = cx - xVal;
        const newPanY = cy - yVal;

        setIsAnimating(true);
        setPan({ x: newPanX, y: newPanY });
        setZoomIndex(3); // Zoom to level 3 for a closer view
      }
    }
  }, [selectedCity]);

  const zoom = ZOOM_STEPS[zoomIndex];
  const isZoomed = zoomIndex > 0;

  // --- Tooltip ---
  const handleMouseMove = useCallback((e: React.MouseEvent, cityName: string) => {
    if (isDragging) return;
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setHoveredCity(cityName);
  }, [isDragging]);

  // --- City click → zoom + select ---
  const handleCityClick = useCallback((e: React.MouseEvent, cityName: string) => {
    if (isDragging) return;
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    // Calculate where the city is relative to container center
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetZoom = 3;
    // Pan to center the clicked city
    const newPanX = (cx - clickX);
    const newPanY = (cy - clickY);

    setIsAnimating(true);
    setPan({ x: newPanX, y: newPanY });
    setZoomIndex(3);
    onCitySelect(cityName);
  }, [isDragging, onCitySelect]);

  // --- Zoom controls ---
  const zoomIn = useCallback(() => {
    setIsAnimating(true);
    setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
  }, []);

  const zoomOut = useCallback(() => {
    setIsAnimating(true);
    setZoomIndex((i) => {
      const next = Math.max(i - 1, 0);
      if (next === 0) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setIsAnimating(true);
    setZoomIndex(0);
    setPan({ x: 0, y: 0 });
    onCitySelect(null);
  }, [onCitySelect]);

  // --- Pan controls (arrow buttons) ---
  const panMap = useCallback((dx: number, dy: number) => {
    setIsAnimating(true);
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  // --- Drag to pan ---
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isZoomed) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
  }, [isZoomed, pan]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart.current.x) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    
    // Only consider it a drag if moved more than 5px
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
      setHoveredCity(null);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    dragStart.current.x = 0; // reset
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  return (
    <div
      ref={mapRef}
      className="relative w-full overflow-hidden rounded-[2rem]"
      style={{
        touchAction: "pan-y",
        cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "default",
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => { handleDragEnd(); setHoveredCity(null); }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-500/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gold-500/[0.02] blur-[100px] rounded-full" />
      </div>

      {/* Zoomable + Pannable Map Wrapper */}
      <div
        onTransitionEnd={() => setIsAnimating(false)}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          transformOrigin: "center center",
          willChange: isAnimating ? "transform" : "auto",
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1100, center: [82, 22] }}
          width={800}
          height={900}
          style={{ width: "100%", height: "auto", pointerEvents: "auto", shapeRendering: "geometricPrecision" }}
        >
          {/* India State Boundaries */}
          <Geographies geography={INDIA_GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0f0f0f"
                  stroke="rgba(234,179,8,0.12)"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#141414", outline: "none", stroke: "rgba(234,179,8,0.25)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* City Markers */}
          {INDIA_CITIES.map((city) => {
            const count = clubCountByCity[city.name] || 0;
            const hasClubs = count > 0;
            const isHovered = hoveredCity === city.name;
            const isSelected = selectedCity === city.name;

            const baseR = hasClubs
              ? count > 50 ? 4.5 : count > 20 ? 3.5 : count > 5 ? 2.8 : 2
              : 1.5;
            const r = isHovered ? baseR * 1.5 : isSelected ? baseR * 1.3 : baseR;

            return (
              <Marker key={city.name} coordinates={city.coordinates}>
                {hasClubs && (
                  <circle r={baseR * 3.5} fill="none" stroke="rgba(234,179,8,0.15)" strokeWidth={0.4}>
                    <animate attributeName="r" from={String(baseR * 2)} to={String(baseR * 4.5)} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={baseR * 2.2} fill={hasClubs ? "rgba(234,179,8,0.06)" : "rgba(234,179,8,0.02)"} />
                {isSelected && (
                  <circle r={baseR * 2} fill="none" stroke="#fbbf24" strokeWidth={0.8} opacity={0.6}>
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Visual Dot */}
                <circle
                  r={r}
                  fill={isSelected ? "#fbbf24" : isHovered ? "#fcd34d" : hasClubs ? "#eab308" : "rgba(234,179,8,0.35)"}
                  stroke={isSelected ? "#fde68a" : hasClubs ? "rgba(234,179,8,0.4)" : "rgba(234,179,8,0.15)"}
                  strokeWidth={isSelected ? 1 : 0.4}
                  style={{
                    transition: "all 0.25s ease",
                    filter: hasClubs ? `drop-shadow(0 0 ${isHovered ? 6 : 3}px rgba(234,179,8,${isHovered ? 0.8 : 0.5}))` : "none",
                    pointerEvents: "none",
                  }}
                />
                {/* Generous Invisible Hitbox for perfect hover/click capture */}
                <circle
                  r={12}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e: any) => handleMouseMove(e, city.name)}
                  onMouseMove={(e: any) => handleMouseMove(e, city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={(e: any) => handleCityClick(e, city.name)}
                />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* ─── Floating Controls ─── */}
      <div className="absolute bottom-6 right-6 flex flex-col items-center gap-1.5 z-30">
        {/* Directional Pad (visible when zoomed) */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="relative w-[90px] h-[90px] mb-2"
            >
              {/* Up */}
              <button onClick={() => panMap(0, PAN_STEP)}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 transition-all cursor-pointer">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              {/* Down */}
              <button onClick={() => panMap(0, -PAN_STEP)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 transition-all cursor-pointer">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {/* Left */}
              <button onClick={() => panMap(PAN_STEP, 0)}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 transition-all cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {/* Right */}
              <button onClick={() => panMap(-PAN_STEP, 0)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-gold-400 hover:border-gold-500/30 transition-all cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-700" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom Buttons */}
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={zoomIn}
          disabled={zoomIndex >= ZOOM_STEPS.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white hover:border-gold-500/40 hover:text-gold-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          <Plus className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={zoomOut}
          disabled={zoomIndex <= 0}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white hover:border-gold-500/40 hover:text-gold-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
          <Minus className="w-4 h-4" />
        </motion.button>
        <AnimatePresence>
          {isZoomed && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={resetZoom}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold-500/10 backdrop-blur-xl border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 transition-all cursor-pointer mt-1">
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom Level Indicator */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-6 left-6 z-30">
            <div className="px-3 py-1.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Zoom</span>
              <div className="flex gap-0.5">
                {ZOOM_STEPS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i <= zoomIndex ? "bg-gold-500 shadow-[0_0_4px_rgba(234,179,8,0.5)]" : "bg-zinc-700"}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredCity && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute pointer-events-none z-50"
            style={{ left: tooltipPos.x + 18, top: tooltipPos.y - 16 }}
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-gold-500/20 rounded-xl px-4 py-2.5 shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${(clubCountByCity[hoveredCity] || 0) > 0 ? "bg-gold-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" : "bg-gold-500/30"}`} />
                <p className="text-xs font-bold text-white whitespace-nowrap">{hoveredCity}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[9px] text-zinc-500 font-medium">{INDIA_CITIES.find(c => c.name === hoveredCity)?.state}</p>
                <span className="text-[9px] text-zinc-600">·</span>
                <p className="text-[9px] font-bold text-gold-400">
                  {clubCountByCity[hoveredCity] || 0} {(clubCountByCity[hoveredCity] || 0) === 1 ? "club" : "clubs"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
