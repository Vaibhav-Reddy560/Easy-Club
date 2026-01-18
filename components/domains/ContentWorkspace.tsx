"use client";

import React from "react";
import { FileText, Share2, Copy, Check, Table } from "lucide-react";

export default function ContentWorkspace({ activeEvent, activeClub, copyToClipboard, copiedId, generateMessage, generateLetter }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-neutral-900/60 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl">
        <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Spam Msg Generators
        </h4>
        <div className="space-y-5">
          {['short', 'long'].map(label => (
            <div key={label} className="p-6 bg-black rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">{label} Msg</span>
                <button 
                  onClick={() => copyToClipboard(generateMessage(label as any), label)} 
                  className="text-gold-500 text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedId === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 
                  {copiedId === label ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed italic line-clamp-3">
                "{generateMessage(label as any)}"
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-neutral-900/60 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl text-center">
        <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2 justify-center">
          <FileText className="w-4 h-4" /> Official Documents
        </h4>
        {['Permission', 'Venue'].map(t => (
          <button 
            key={t} 
            onClick={() => copyToClipboard(generateLetter(t === 'Permission' ? 'event' : 'venue'), t)} 
            className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xs font-bold text-neutral-400 hover:text-gold-500 transition-all uppercase tracking-widest"
          >
            {copiedId === t ? 'Copied Letter!' : `Preview ${t} Letter`}
          </button>
        ))}
        <div className="p-6 bg-gold-500/5 rounded-2xl border border-gold-500/20 flex flex-col gap-2 mt-4 text-center">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sheets Integration</span>
          <button className="w-full bg-gold-500 text-black text-[10px] font-bold py-2 rounded-lg hover:shadow-gold-glow">
            <Table className="w-3 h-3 inline mr-2" /> Initialize Form Link
          </button>
        </div>
      </div>
    </div>
  );
}