"use client";

import React from "react";
import { Linkedin, ExternalLink } from "lucide-react";

export default function SocialWorkspace({ activeEvent, getResourcePersons }: any) {
  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl">
      <div className="flex justify-between items-center border-l-4 border-gold-500 pl-4">
        <h4 className="text-xl font-bold">Expert Sourcing Hub</h4>
        <span className="text-[10px] bg-gold-500/10 text-gold-500 px-4 py-1 rounded-full font-bold uppercase tracking-widest">
          Location: {activeEvent?.config?.city || 'TBA'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getResourcePersons().map((person: any, i: number) => (
          <div key={i} className="p-6 bg-black border border-white/5 rounded-3xl flex justify-between items-center group hover:border-gold-500 transition-all cursor-pointer shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 transition-all">
                <Linkedin className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">{person.name}</h5>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">{person.role}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-700 group-hover:text-gold-500" />
          </div>
        ))}
      </div>
    </div>
  );
}