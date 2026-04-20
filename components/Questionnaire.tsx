"use client";

import React from "react";
import { ChevronLeft, Users, Upload, Info, MapPin, Link as LinkIcon } from "lucide-react";
import { ClubEvent, EventConfig } from "@/lib/types";

interface QuestionnaireProps {
  activeEvent: ClubEvent | undefined;
  activeEventId: string | null;
  updateConfig: (newData: Partial<EventConfig>) => void;
  onBack: () => void;
  onProceed: () => void;
}

export default function Questionnaire({ activeEvent, activeEventId, updateConfig, onBack, onProceed }: QuestionnaireProps) {
  const config = activeEvent?.config || {};

  const technicalSubTypes = ["Hackathon", "Workshop", "Conference", "Competition", "Talk", "Peer Learning"];
  const socialSubTypes = ["Stand up", "Fitness", "Cooking", "Charity"];

  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="self-start flex items-center gap-2 mb-6 font-bold hover:text-gold-400 transition-colors">
        <ChevronLeft className="w-4 h-4 text-gold-500" /> <span className="text-signature-gradient">Back to Events</span>
      </button>

      <div className="w-full max-w-5xl bg-neutral-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-12">
        <header className="border-b border-white/5 pb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-airstream text-signature-gradient tracking-tight">Event Name: {activeEvent?.name}</h2>
            <p className="text-signature-gradient font-medium">Define the core blueprint...</p>
          </div>
          <span className="text-[9px] text-neutral-600 font-mono border border-neutral-800 px-3 py-1 rounded-full uppercase">
            ID: {activeEventId?.substring(0, 8)}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* SECTION 1: CLASSIFICATION */}
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-signature-gradient uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3 text-gold-500" /> A. Classification
            </label>
            <div className="flex gap-2">
              {['Technical', 'Social'].map(t => (
                <button
                  key={t}
                  onClick={() => updateConfig({ type: t, subType: '' })}
                  className={`flex-1 py-3 rounded-xl border font-bold transition-all ${config.type === t ? 'bg-gold-gradient text-black border-transparent shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-black border-neutral-800 text-neutral-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button className="px-8 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-signature-gradient hover:border-gold-500 transition-all">
          Unlock Automation
        </button>
            <select
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-gold-500/50 transition-colors"
              value={config.subType || ""}
              onChange={(e) => updateConfig({ subType: e.target.value })}
            >
              <option value="">Select Sub-Type...</option>
              {(config.type === 'Technical' ? technicalSubTypes : socialSubTypes).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <input
              placeholder="Team Size (Individual, Teams of 2-4, etc.)"
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none"
              value={config.teamSize || ""}
              onChange={(e) => updateConfig({ teamSize: e.target.value })}
            />

            {(config.subType === 'Hackathon') && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <textarea
                  placeholder="Enter 1 or more tracks (e.g. AI, Web3, FinTech)"
                  className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none"
                  rows={2}
                  value={config.tracks || ""}
                  onChange={(e) => updateConfig({ tracks: e.target.value })}
                />
              </div>
            )}

            <textarea
              placeholder="Event Idea & Theme (Write a paragraph...)"
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none min-h-[100px]"
              value={config.description || ""}
              onChange={(e) => updateConfig({ description: e.target.value })}
            />
          </div>

          {/* SECTION 2: LOGISTICS */}
          <div className="space-y-6">
            <label className="text-[10px] font-bold text-signature-gradient uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gold-500" /> B. Location & Fee
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">City</span>
                <input placeholder="Location (City)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.city || ""} onChange={(e) => updateConfig({ city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Venue</span>
                <input placeholder="Specific Place" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.venue || ""} onChange={(e) => updateConfig({ venue: e.target.value })} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Date</span>
                <input type="date" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none text-neutral-400" value={config.date || ""} onChange={(e) => updateConfig({ date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Time</span>
                <input type="time" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none text-neutral-400" value={config.time || ""} onChange={(e) => updateConfig({ time: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-neutral-500 font-bold uppercase ml-1">Registration Fee Structure</span>
              <div className="grid grid-cols-1 gap-3">
                <input
                  placeholder="For Club Members (e.g. ₹100 or Free)"
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none"
                  value={config.feeClub || ""}
                  onChange={(e) => updateConfig({ feeClub: e.target.value })}
                />
                <input
                  placeholder="For Non-Club Members"
                  className="w-full bg-black/40 border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none"
                  value={config.feeNonClub || ""}
                  onChange={(e) => updateConfig({ feeNonClub: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACTS */}
          <div className="col-span-full bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
              <Users className="w-4 h-4 text-gold-500" /> Points of Contact (2 People)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <input placeholder="POC 1 Full Name" className="flex-1 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500 transition-colors" value={config.poc1Name || ""} onChange={(e) => updateConfig({ poc1Name: e.target.value })} />
                <input placeholder="Phone Number" className="w-40 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500 transition-colors" value={config.poc1Phone || ""} onChange={(e) => updateConfig({ poc1Phone: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <input placeholder="POC 2 Full Name" className="flex-1 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500 transition-colors" value={config.poc2Name || ""} onChange={(e) => updateConfig({ poc2Name: e.target.value })} />
                <input placeholder="Phone Number" className="w-40 bg-transparent border-b border-neutral-800 p-2 text-sm outline-none focus:border-gold-500 transition-colors" value={config.poc2Phone || ""} onChange={(e) => updateConfig({ poc2Phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* SECTION 4: CONTEXT & LINKS */}
          <div className="col-span-full bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">
              <LinkIcon className="w-4 h-4 text-gold-500" /> D. Context & Online Presence
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Special Occasion / Theme Week</span>
                  <input placeholder="e.g. IEEE Week 2025, Open Source Week" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.occasion || ""} onChange={(e) => updateConfig({ occasion: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Registration Link</span>
                  <input placeholder="https://forms.gle/..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.regLink || ""} onChange={(e) => updateConfig({ regLink: e.target.value })} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                      <div className="text-[9px] font-black text-signature-gradient uppercase tracking-widest mb-1">Target Persona</div>
                  <input placeholder="Link to profile" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.resourceLink || ""} onChange={(e) => updateConfig({ resourceLink: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-600 font-bold uppercase ml-3 tracking-tighter">Event Brochure Link</span>
                  <input placeholder="Drive or Website Link" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none" value={config.brochureLink || ""} onChange={(e) => updateConfig({ brochureLink: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: SCOPE & LOGOS */}
          <div className="col-span-full space-y-8">
            <label className="text-[10px] font-bold text-signature-gradient uppercase tracking-widest">E. Scope & Assets</label>
            <div className="flex gap-4 p-1 bg-black border border-neutral-800 rounded-[1.25rem]">
              {['College Event', 'Non-College Event'].map(opt => (
                <button
                  key={opt}
                  onClick={() => updateConfig({ isCollegeEvent: opt === 'College Event' })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-tight ${config.isCollegeEvent === (opt === 'College Event') ? 'bg-neutral-800 text-white shadow-xl' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-500">
              {config.isCollegeEvent ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Collaborations (College Dept / Clubs)</label>
                  <textarea
                    placeholder="Enter names of College Departments or Clubs involved..."
                    className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none"
                    rows={2}
                    value={config.collaborators || ""}
                    onChange={(e) => updateConfig({ collaborators: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Collaborations (Public / Private Orgs)</label>
                  <textarea
                    placeholder="Enter names of Public (Govt) or Private Organizations..."
                    className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none"
                    rows={2}
                    value={config.collaborators || ""}
                    onChange={(e) => updateConfig({ collaborators: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
              {[
                { label: 'Club Logo', key: 'logoClub' },
                { label: config.isCollegeEvent ? 'College Logo' : 'Org Logo', key: 'logoMain' },
                { label: config.isCollegeEvent ? 'Collab Clubs' : 'Collab Orgs', key: 'logoCollab' },
                { label: 'Extra Assets', key: 'logoExtra' }
              ].map(asset => (
                <div key={asset.key} className="flex flex-col gap-2">
                  <div className="aspect-square bg-black border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-gold-500/40 cursor-pointer group transition-all relative overflow-hidden">
                        <h5 className="font-bold text-lg text-white group-hover:text-signature-gradient transition-colors">{asset.label}</h5>
                        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mt-1">{asset.key}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onProceed}
          className="w-full bg-gold-gradient text-black font-bold py-6 rounded-[2rem] shadow-[0_10px_40px_rgba(245,158,11,0.2)] hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all uppercase tracking-widest text-sm"
        >
          {config.isLaunched ? 'Update Blueprint & Return to Workspace' : 'Initialize Workspaces & Launch'}
        </button>
      </div>
    </div>
  );
}