"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * GlowingStarsBackground – Aceternity-inspired glowing star grid effect.
 * Adapted for the Easy Club app's gold/amber palette.
 * Use as a fixed/absolute background layer, NOT inside cards.
 */

const GRID_SIZE = 15; // number of columns & rows

function generateStarStates(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.7)
  );
}

export function GlowingStarsBackground({ className }: { className?: string }) {
  const [stars, setStars] = useState<boolean[][]>(() =>
    generateStarStates(GRID_SIZE, GRID_SIZE)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStars(generateStarStates(GRID_SIZE, GRID_SIZE));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className || ""}`}
      aria-hidden="true"
    >
      {/* Subtle radial gradient overlay to fade edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050505_80%)]" />

      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          gap: "1px",
        }}
      >
        {stars.flat().map((isGlowing, i) => (
          <div key={i} className="relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isGlowing && (
                <motion.div
                  key={`glow-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.8,
                    ease: "easeInOut",
                  }}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(245,158,11,0.8) 0%, rgba(251,191,36,0.4) 40%, transparent 70%)",
                    boxShadow:
                      "0 0 4px rgba(245,158,11,0.6), 0 0 10px rgba(245,158,11,0.3), 0 0 20px rgba(245,158,11,0.1)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Static dim dot (always visible for grid texture) */}
            <div
              className="w-px h-px rounded-full"
              style={{
                background: "rgba(245,158,11,0.06)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Illustrative glow – a single large soft orb */}
      <GlowOrb />
    </div>
  );
}

function GlowOrb() {
  return (
    <motion.div
      className="absolute w-64 h-64 rounded-full pointer-events-none"
      style={{
        top: "30%",
        left: "60%",
        background:
          "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -20, 15, 0],
        opacity: [0.4, 0.7, 0.5, 0.4],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
