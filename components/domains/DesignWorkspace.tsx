"use client";

import React from "react";
import { Palette, ExternalLink, Layout, Image as ImageIcon } from "lucide-react";

export default function DesignWorkspace({ activeEvent, activeClub }: any) {
  return (
    <div className="space-y-8 bg-neutral-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">
            Poster Dimensions
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['Instagram', 'WhatsApp', 'A3 Print'].map(dim => (
              <div key={dim} className="aspect-[3/4] bg-black border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 text-[9px] text-neutral-500 hover:text-gold-500 hover:border-gold-500/50 cursor-pointer transition-all">
                <ImageIcon className="w-4 h-4 mb-2 opacity-20" />
                {dim}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">
            Production Assets
          </label>
          <div className="p-5 bg-gold-500/5 rounded-2xl border border-gold-500/20 flex justify-between items-center shadow-xl group cursor-pointer hover:bg-gold-500/10 transition-all">
            <span className="text-sm font-bold text-gold-100">Event Certificate</span>
            <ExternalLink className="w-4 h-4 text-gold-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="p-5 bg-black border border-white/5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-gold-500/30 transition-all">
            <span className="text-sm font-medium">Google Form Header</span>
            <Layout className="w-4 h-4 text-neutral-600 group-hover:text-gold-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}