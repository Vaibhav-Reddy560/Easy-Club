"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Cpu, 
  Palette, 
  Sparkles, 
  Zap, 
  Eye, 
  MousePointer2,
  ShieldCheck,
  Save
} from "lucide-react";

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [aiModel, setAiModel] = useState("gemini-2.0-pro");
  const [brandColor, setBrandColor] = useState("#FAA41A");
  const [animations, setAnimations] = useState(true);
  const [density, setDensity] = useState("stable");

  type SettingsOption = 
    | { type: "select" | "segments"; label: string; value: string; options: string[]; onChange: (v: string) => void }
    | { type: "toggle"; label: string; value: string | boolean; enabled: boolean; onChange: () => void }
    | { type: "badge" | "text" | "color"; label: string; value: string | boolean; onChange?: (v: string) => void };

  const sections: { id: string; title: string; icon: React.ElementType; description: string; options: SettingsOption[] }[] = [
    {
      id: "ai",
      title: "AI Orchestration",
      icon: Cpu,
      description: "Configure intelligence thresholds for generation tasks.",
      options: [
        { label: "Active Model", value: aiModel, type: "select", options: ["Gemini 2.0 Pro", "Gemini 1.5 Flash", "Gemini Ultra"], onChange: (v: string) => setAiModel(v.toLowerCase().replace(/ /g, '-')) },
        { label: "Creativity bias", value: "High", type: "badge" },
        { label: "Token Optimization", value: "Active", type: "toggle", enabled: true, onChange: () => {} }
      ]
    },
    {
      id: "brand",
      title: "Brand Identity",
      icon: Palette,
      description: "Manage global design tokens and organization colors.",
      options: [
        { label: "Primary Accent", value: brandColor, type: "color", onChange: setBrandColor },
        { label: "Logo Variant", value: "Airstream Gold", type: "text" },
        { label: "Asset Resolution", value: "4K High-Res", type: "badge" }
      ]
    },
    {
      id: "interface",
      title: "Interface Control",
      icon: Eye,
      description: "Customize the visual density and responsive behavior.",
      options: [
        { label: "UI Density", value: density, type: "segments", options: ["Compact", "Stable", "Relaxed"], onChange: (v: string) => setDensity(v.toLowerCase()) },
        { label: "Dynamic Animations", value: animations, type: "toggle", enabled: animations, onChange: () => setAnimations(!animations) }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gold-500 font-bold hover:text-gold-400 group transition-colors"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest text-[#FFA500]">Exit Settings</span>
        </button>

        <button className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(250,164,26,0.2)]">
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </button>
      </div>

      <header className="border-b border-white/5 pb-10 mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20">
            <Settings className="w-6 h-6 text-gold-500 animate-[spin_8s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-tighter text-white">System <span className="text-neutral-600 font-normal ml-2">/ Control Hub</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Global Administration Protocol Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div 
            key={section.id} 
            className={`bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative group ${idx === 0 ? 'md:col-span-2' : ''}`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -mr-32 -mt-32 transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 transition-colors">
                  <section.icon className="w-5 h-5 text-gold-500/70 group-hover:text-gold-500 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{section.title}</h4>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{section.description}</p>
                </div>
              </div>

              <div className={`grid gap-4 ${idx === 0 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
                {section.options.map((opt, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-3">{opt.label}</p>
                    
                    {opt.type === "select" && (
                      <div className="flex flex-wrap gap-2">
                         {opt.options?.map(o => (
                           <button 
                             key={o} 
                             onClick={() => opt.onChange?.(o)}
                             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${opt.value === o.toLowerCase().replace(/ /g, '-') ? 'bg-gold-500 text-black' : 'bg-white/5 text-neutral-500 hover:text-white'}`}
                           >
                             {o}
                           </button>
                         ))}
                      </div>
                    )}

                    {opt.type === "segments" && (
                      <div className="flex bg-neutral-800/50 p-1 rounded-xl">
                         {opt.options?.map(o => (
                           <button 
                             key={o} 
                             onClick={() => opt.onChange?.(o)}
                             className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${opt.value === o.toLowerCase() ? 'bg-neutral-700 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                           >
                             {o}
                           </button>
                         ))}
                      </div>
                    )}

                    {opt.type === "toggle" && (
                      <button 
                        onClick={opt.onChange}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${opt.enabled ? 'bg-gold-500' : 'bg-neutral-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${opt.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    )}

                    {opt.type === "badge" && (
                      <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[9px] font-black uppercase tracking-widest border border-gold-500/20">
                        {opt.value as string}
                      </span>
                    )}

                    {opt.type === "color" && (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: opt.value as string }} />
                         <span className="text-[10px] font-mono text-neutral-300 uppercase">{opt.value as string}</span>
                         <button className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <MousePointer2 className="w-3.5 h-3.5 text-neutral-500" />
                         </button>
                      </div>
                    )}

                    {opt.type === "text" && (
                      <p className="text-sm text-white font-medium">{opt.value as string}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="md:col-span-2 flex items-center justify-center gap-12 py-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <Zap className="w-8 h-8 text-gold-500" />
           <Sparkles className="w-8 h-8 text-blue-500" />
           <Cpu className="w-8 h-8 text-purple-500" />
           <Palette className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </motion.div>
  );
}
