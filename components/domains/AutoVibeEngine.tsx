'use client';

/**
 * AutoVibe Design Engine
 * Automatically generates designs based on AI-analyzed event vibes.
 */

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface AutoVibeEngineProps {
  onImageGenerated: (dataUrl: string) => void;
  vibePrompt: string;
  colors?: string[];
}

export const AutoVibeEngine = forwardRef<any, AutoVibeEngineProps>(({ 
  onImageGenerated, 
  vibePrompt,
  colors = ['#1a1a1a', '#d4af37'] // Fallback to premium gold
}, ref) => {

  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'preparing' | 'ready'>('idle');
  
  // Auto-initialize on mount
  useEffect(() => {
    setLoadingStatus('preparing');
    // Simulate background preparation of the WebGPU pipeline
    const timer = setTimeout(() => {
      setLoadingStatus('ready');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    generate: async () => {
      // If still preparing, we wait a moment
      if (loadingStatus !== 'ready') {
        await new Promise(r => setTimeout(r, 1000));
      }
      
      return await performGeneration();
    }
  }));

  const performGeneration = async () => {
    try {
      console.log("[AutoVibe] Generating exact design for colors:", colors);
      
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d')!;
      
      // Use the AI's exact palette
      const primaryColor = colors[0] || '#0a0a0a';
      const accentColor = colors[1] || colors[0] || '#d4af37';
      const tertiaryColor = colors[2] || accentColor;

      // 1. Create the base gradient using AI palette
      const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
      grad.addColorStop(0, '#050505'); // Deep base
      grad.addColorStop(0.5, primaryColor + '44'); // 25% opacity primary
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1350);

      // 2. Add Aesthetic Texture based on Vibe Text
      ctx.globalAlpha = 1;
      const lowerVibe = vibePrompt.toLowerCase();
      
      if (lowerVibe.includes('tech') || lowerVibe.includes('digital') || lowerVibe.includes('modern')) {
        // AI wanted Tech: Create a high-end digital matrix/grid
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 0.3;
        ctx.globalAlpha = 0.2;
        for(let i=0; i<1080; i+=30) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1350); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
        }
        // Add "Nodes"
        ctx.fillStyle = accentColor;
        for(let i=0; i<20; i++) {
          ctx.beginPath();
          ctx.arc(Math.random()*1080, Math.random()*1350, 2, 0, Math.PI*2);
          ctx.fill();
        }
      } else {
        // AI wanted Organic/Soft: Create ambient light bleeds
        for(let i=0; i<3; i++) {
          const x = Math.random() * 1080;
          const y = Math.random() * 1350;
          const r = 400 + Math.random() * 400;
          const bleed = ctx.createRadialGradient(x, y, 0, x, y, r);
          bleed.addColorStop(0, (i === 0 ? accentColor : tertiaryColor) + '22');
          bleed.addColorStop(1, 'transparent');
          ctx.fillStyle = bleed;
          ctx.fillRect(0, 0, 1080, 1350);
        }
      }

      // 3. Final Signature Overlay
      const noise = ctx.createImageData(1080, 1350);
      for (let i = 0; i < noise.data.length; i += 4) {
        const val = Math.random() * 10;
        noise.data[i] = noise.data[i+1] = noise.data[i+2] = val;
        noise.data[i+3] = 20; // Subtle noise
      }
      ctx.putImageData(noise, 0, 0);

      const finalImage = canvas.toDataURL('image/jpeg', 0.95);
      onImageGenerated(finalImage);
      return true;
    } catch (err) {

      console.error("[AutoVibe] Generation Failed:", err);
      return false;
    }
  };

  return null; // Invisible component, purely logical
});
