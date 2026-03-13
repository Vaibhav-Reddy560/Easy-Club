"use client";

import React from "react";
import { ExternalLink, Layout, Image as ImageIcon, Maximize2, Terminal, Square } from "lucide-react";
import { ClubEvent, EventConfig } from "@/lib/types";

interface DesignWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  updateConfig: (newData: Partial<EventConfig>) => void;
}

export default function DesignWorkspace({ activeEvent, updateConfig }: DesignWorkspaceProps) {
  const config = activeEvent?.config || {};

  const posters = [
    { name: 'Instagram', dim: '1080 X 1350 px', label: '(4:5)', color: 'from-purple-500/10 to-pink-500/10' },
    { name: 'WhatsApp Spam', dim: '1080 X 1080 px', label: '(1:1)', color: 'from-green-500/10 to-emerald-500/10' },
    { name: 'A3 Dimension', dim: '3508 X 4961 px', label: 'Printable', color: 'from-blue-500/10 to-indigo-500/10' },
  ];

  const largeFormats = [
    { name: 'Banner Design', dim: '8 X 10 ft', icon: Maximize2 },
    { name: 'Standee Design', dim: '3 X 5 ft', icon: Square },
  ];

  return (
    <div className="space-y-10 bg-neutral-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Poster Dimensions Section */}
        <div className="space-y-6">
          <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Poster Layouts
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {posters.map(p => (
              <div
                key={p.name}
                className={`aspect-[3/4] bg-neutral-950 border border-neutral-800 rounded-3xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all hover:border-gold-500/40 hover:-translate-y-1 group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <ImageIcon className="w-5 h-5 mb-3 text-neutral-700 group-hover:text-gold-500 transition-colors" />
                <span className="text-[11px] font-bold text-white mb-1">{p.name}</span>
                <span className="text-[9px] text-neutral-600 font-bold group-hover:text-neutral-400">{p.dim}</span>
                <span className="text-[8px] text-gold-500/40 mt-2 font-mono">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Design Assets Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <Maximize2 className="w-3 h-3" /> Event Production Designs
            </label>
            <div className="grid grid-cols-2 gap-4">
              {largeFormats.map(f => (
                <div
                  key={f.name}
                  className="p-6 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-2 text-center hover:border-gold-500/30 transition-all cursor-pointer group"
                >
                  <f.icon className="w-5 h-5 text-neutral-700 group-hover:text-gold-500" />
                  <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white uppercase tracking-tight">{f.name}</span>
                  <span className="text-[9px] text-neutral-600 font-mono">{f.dim}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Branding & Forms
            </label>
            <div className="p-5 bg-gold-500/5 rounded-2xl border border-gold-500/20 flex justify-between items-center group cursor-pointer hover:bg-gold-500/10 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.05)]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gold-100">Event Certificate</span>
                <span className="text-[9px] text-gold-500/40 uppercase font-black">Canva Recommendation</span>
              </div>
              <a
                href={`https://www.canva.com/certificates/templates/search?q=certificate%20of%20appreciation%20${config.type || 'event'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gold-500/10 rounded-full group-hover:bg-gold-500 group-hover:text-black transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-5 bg-black/60 border border-white/5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-gold-500/30 transition-all shadow-xl">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white">Google Form Header</span>
                <span className="text-[9px] text-neutral-600 font-mono tracking-tighter">1600 X 400 pixels</span>
              </div>
              <Layout className="w-4 h-4 text-neutral-700 group-hover:text-gold-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-white/5 flex flex-wrap gap-6 justify-center text-[10px] font-bold uppercase text-neutral-600">
        <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-gold-500" /> Export All Assets</span>
        <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-neutral-800" /> Color Consistency Check</span>
        <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-neutral-800" /> Typography Audit</span>
      </footer>
    </div>
  );
}