"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Linkedin, ExternalLink, Sparkles, MapPin, Mail, Radar, Briefcase } from "lucide-react";
import { ClubEvent, EventConfig } from "@/lib/types";
import ResourceRadar from "../ResourceRadar";

interface SocialWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  updateConfig?: (newData: Partial<EventConfig>) => void;
  onLogActivity: (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => void;
}

interface Expert {
  name: string;
  role: string;
  expertise: string;
  location: string;
}

export default function SocialWorkspace({ activeEvent, onLogActivity }: SocialWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<'radar' | 'proposals'>('radar');
  const config = activeEvent?.config || {};
  const city = config.city || "Bengaluru";
  const subType = config.subType || "Workshop";
  const tracks = (config.tracks || "").split(',').map((t: string) => t.trim()).filter((t: string) => t !== "");

  // Simulated logic to suggest resource persons based on event type and tracks
  const getResourcePersons = () => {
    const roles: Expert[] = [];
    if (subType === 'Hackathon') {
      // One judge per track
      if (tracks.length > 0) {
        tracks.forEach((track: string) => {
          roles.push({
            name: `${track} Expert`,
            role: `Hackathon Judge (${track})`,
            expertise: track,
            location: city
          });
        });
      } else {
        roles.push({ name: "Senior Tech Judge", role: "Hackathon Lead Judge", expertise: "General Tech", location: city });
      }
    } else if (subType === 'Workshop') {
      roles.push({ name: `${tracks[0] || 'Technical'} Instructor`, role: "Workshop Host", expertise: tracks[0] || "Hands-on Training", location: city });
    } else if (subType === 'Peer Learning') {
      roles.push({ name: "Student Mentor", role: "Session Facilitator", expertise: "Mentorship", location: city });
    } else {
      roles.push({ name: "Domain Specialist", role: "Guest Speaker", expertise: "Industry Insights", location: city });
    }
    return roles;
  };

  const experts = getResourcePersons();

  return (
    <div className="space-y-12">
      {/* Sub-Navigation */}
      <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'radar' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/10' : 'text-neutral-500 hover:text-white'}`}
        >
          <Radar className="w-3 h-3" /> Talent Radar
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'proposals' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/10' : 'text-neutral-500 hover:text-white'}`}
        >
          <Briefcase className="w-3 h-3" /> Role Suggestions
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'radar' ? (
          <motion.div
            key="radar-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ResourceRadar />
          </motion.div>
        ) : (
          <motion.div
            key="proposals-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-neutral-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 blur-3xl rounded-full -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
              <div>
                <h4 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
                  <Sparkles className="w-6 h-6 text-gold-500" /> Proposed Speaker Roles
                </h4>
                <p className="text-neutral-500 text-xs font-medium uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Tailored for location: {city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((person: Expert, i: number) => (
                <div
                  key={i}
                  className="p-8 bg-black/60 border border-white/5 rounded-[2.5rem] flex flex-col justify-between group hover:border-gold-500 transition-all shadow-xl hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-gold-500/20" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-1050 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Linkedin className="w-7 h-7 text-gold-400 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-lg text-white group-hover:text-gold-100 transition-colors">{person.name}</h5>
                        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mt-1">{person.location}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[9px] font-black text-gold-500 uppercase tracking-widest mb-1">Target Persona</div>
                      <div className="bg-neutral-900/40 p-3 rounded-xl border border-white/5 text-[11px] font-bold text-neutral-400 group-hover:text-neutral-200">
                        {person.role}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(person.expertise)}%20${encodeURIComponent(person.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 w-full bg-neutral-950 border border-neutral-800 text-[10px] uppercase font-black tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 group-hover:bg-gold-500 group-hover:text-black transition-all group-hover:border-transparent"
                  >
                    Find Candidate <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Invitation Engine */}
      <div className="p-8 bg-gold-500/5 rounded-[2.5rem] border border-gold-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Mail className="w-6 h-6 text-black" />
          </div>
          <div>
            <h6 className="font-bold text-lg text-white">Invitation Engine</h6>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1 text-center md:text-left">AI-generated outreach templates coming soon</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-gold-500 hover:border-gold-500 transition-all">
          Unlock Automation
        </button>
      </div>
    </div>
  );
}