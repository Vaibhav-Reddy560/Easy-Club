"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const CursorGlow = () => {
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  // Smooth movement for the gradient centers
  const springConfig = { damping: 50, stiffness: 80 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert to percentage for the gradient positioning
      mouseX.set((e.clientX / window.innerWidth) * 100);
      mouseY.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Create multiple "washes" of light that are very subtle and large
  const background = useTransform(
    [x, y],
    ([latestX, latestY]) => `
      radial-gradient(ellipse 100% 80% at ${latestX}% ${latestY}%, rgba(255, 180, 5, 0.1) 0%, transparent 80%),
      radial-gradient(ellipse 80% 100% at ${100 - latestX}% ${latestY}%, rgba(255, 120, 0, 0.06) 0%, transparent 75%),
      radial-gradient(ellipse 120% 120% at ${latestX}% ${100 - latestY}%, rgba(255, 160, 5, 0.04) 0%, transparent 90%)
    `
  );

  return (
    <>
      {/* Very Gentle Liquid Distortion Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="liquid-wash">
            <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" seed="1">
              <animate attributeName="baseFrequency" dur="30s" values="0.005;0.008;0.005" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="20" />
          </filter>
        </defs>
      </svg>

      <motion.div
        className="fixed pointer-events-none z-[2]"
        style={{
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          background,
          filter: "url(#liquid-wash)",
          opacity: 0.5,
          mixBlendMode: "screen"
        }}
      />
    </>
  );
};
