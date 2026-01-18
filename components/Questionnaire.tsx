"use client";

import React from "react";
import { ChevronLeft, Users, Upload } from "lucide-react";

export default function Questionnaire({ activeEvent, activeEventId, updateConfig, onBack, onProceed }: any) {
  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="self-start flex items-center gap-2 text-gold-500 mb-6 font-bold hover:text-gold-400 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Events
      </button>
      
      <div className="w-full max-w-4xl bg-neutral-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl space-y-12">
        <header className="border-b border-white/5 pb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Event Setup: {activeEvent?.name}</h2>
            <p className="text-gold-500/70 font-medium italic">Configuring logistics & scope...</p>
          </div>
          <span className="text-[9px] text-neutral-600 font-mono border border-neutral-800 px-3 py-1 rounded-full uppercase">
            Ref: {activeEventId?.substring(0, 8)}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Classification */}
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">A. Classification</label>
            <div className="flex gap-2">
              {['Technical', 'Social'].map(t => (
                <button 
                  key={t} 
                  onClick={() => updateConfig({ type: t })} 
                  className={`flex-1 py-3 rounded-xl border font-bold transition-all ${activeEvent?.config?.type === t ? 'bg-gold-gradient text-black border-transparent' : 'bg-black border-neutral-800 text-neutral-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <select className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-gold-500/50" value={activeEvent?.config?.subType || ""} onChange={(e) => updateConfig({ subType: e.target.value })}>
              <option value="">Select Sub-Type...</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
              <option value="Talk">Talk</option>
            </select>
            {(activeEvent?.config?.subType === 'Hackathon' || activeEvent?.config?.subType === 'Competition') && (
              <input placeholder="Team Size (e.g. 2-4)" className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={activeEvent?.config?.teamSize || ""} onChange={(e) => updateConfig({ teamSize: e.target.value })} />
            )}
          </div>

          {/* Logistics */}
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">B. Logistics</label>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="City" className="bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={activeEvent?.config?.city || ""} onChange={(e) => updateConfig({ city: e.target.value })} />
              <input placeholder="Venue" className="bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={activeEvent?.config?.venue || ""} onChange={(e) => updateConfig({ venue: e.target.value })} />
              <input type="date" className="bg-black border border-neutral-800 rounded-xl p-3 text-xs focus:border-gold-500/50 outline-none text-neutral-400" value={activeEvent?.config?.date || ""} onChange={(e) => updateConfig({ date: e.target.value })} />
              <input type="time" className="bg-black border border-neutral-800 rounded-xl p-3 text-xs focus:border-gold-500/50 outline-none text-neutral-400" value={activeEvent?.config?.time || ""} onChange={(e) => updateConfig({ time: e.target.value })} />
            </div>
            <input placeholder="Entry Fee" className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={activeEvent?.config?.fee || ""} onChange={(e) => updateConfig({ fee: e.target.value })} />
          </div>

          {/* POCs */}
          <div className="col-span-full bg-black/40 p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-2"><Users className="w-4 h-4 text-gold-500" /> Contacts</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-2"><input placeholder="POC 1 Name" className="flex-1 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500" value={activeEvent?.config?.poc1Name || ""} onChange={(e) => updateConfig({ poc1Name: e.target.value })} /><input placeholder="Phone" className="w-32 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500" value={activeEvent?.config?.poc1Phone || ""} onChange={(e) => updateConfig({ poc1Phone: e.target.value })} /></div>
              <div className="flex gap-2"><input placeholder="POC 2 Name" className="flex-1 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500" value={activeEvent?.config?.poc2Name || ""} onChange={(e) => updateConfig({ poc2Name: e.target.value })} /><input placeholder="Phone" className="w-32 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500" value={activeEvent?.config?.poc2Phone || ""} onChange={(e) => updateConfig({ poc2Phone: e.target.value })} /></div>
            </div>
          </div>

          {/* Scope & tracks */}
          <div className="col-span-full space-y-8">
            <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">C. Scope & Collaborations</label>
            <div className="flex gap-4">
              {['College Event', 'Open Event'].map(opt => (
                <button key={opt} onClick={() => updateConfig({ isCollegeEvent: opt.includes('College') })} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${activeEvent?.config?.isCollegeEvent === opt.includes('College') ? 'border-gold-500 text-gold-500 bg-gold-500/5' : 'border-neutral-800 text-neutral-500'}`}>{opt}</button>
              ))}
            </div>
            <textarea rows={2} placeholder="Collaborators" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none font-sans" value={activeEvent?.config?.collaborators || ""} onChange={(e) => updateConfig({ collaborators: e.target.value })} />
            <input placeholder="Tracks (e.g. AI, Web3)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={activeEvent?.config?.tracks || ""} onChange={(e) => updateConfig({ tracks: e.target.value })} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
              {['Club Logo', 'College Logo', 'Logo 3', 'Logo 4'].map(l => (
                <div key={l} className="aspect-square bg-black border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-gold-500/40 cursor-pointer group transition-all">
                  <Upload className="w-5 h-5 text-neutral-700 group-hover:text-gold-500" />
                  <span className="text-[9px] font-bold text-neutral-600 group-hover:text-gold-400 uppercase">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onProceed} className="w-full bg-gold-gradient text-black font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase tracking-widest">Generate Workspaces</button>
      </div>
    </div>
  );
}