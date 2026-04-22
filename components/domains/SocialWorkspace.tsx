"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Linkedin, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  Mail, 
  Radio, 
  Briefcase,
  Loader2,
  Check,
  Copy,
  X
} from "lucide-react";
import { ClubEvent, EventConfig } from "@/lib/types";
import { useTasks } from "@/lib/TaskContext";
import ResourceRadar from "../ResourceRadar";

interface SocialWorkspaceProps {
  activeEvent: ClubEvent | undefined;
}

interface Expert {
  name: string;
  role: string;
  expertise: string;
  location: string;
}

export default function SocialWorkspace({ activeEvent }: SocialWorkspaceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [outreachTemplate, setOutreachTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { startTask, finishTask } = useTasks();
  
  const config = activeEvent?.config || {};
  const city = config.city || "Bengaluru";
  const subType = config.subType || "Workshop";
  const tracks = (config.tracks || "").split(',').map((t: string) => t.trim()).filter((t: string) => t !== "");

  // Simulated logic to suggest resource persons based on event type and tracks
  const getResourcePersons = () => {
    const roles: Expert[] = [];
    if (subType === 'Hackathon') {
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
  const initialSearchDomain = tracks[0] || subType || "Industry Experts";

  return (
    <div className="space-y-16 pb-20">
      {/* Unified Suggested Experts Discovery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ResourceRadar 
          initialDomain={initialSearchDomain} 
          targetPersonas={experts}
          city={city}
          subType={subType}
        />
      </motion.div>


      {/* Shared Invitation Engine */}
      <div className="p-8 bg-gold-500/5 rounded-[2.5rem] border border-gold-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Mail className="w-6 h-6 text-black" />
          </div>
          <div>
            <h6 className="font-bold text-lg text-white">Invitation Engine</h6>
            <p className="text-[10px] text-white font-bold uppercase tracking-widest mt-1 text-center md:text-left">
              {isGenerating ? "AI is drafting personalized outreach..." : "Generate professional expert invitations"}
            </p>
          </div>
        </div>
        <button 
          disabled={isGenerating || !activeEvent}
          onClick={async () => {
            if (!activeEvent) return;
            setIsGenerating(true);
            const taskId = "outreach-" + activeEvent.id;
            startTask(taskId, "Drafting Speaker Invitations");
            
            try {
              const response = await fetch("/api/generate-outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  event: activeEvent, 
                  expert: experts[0] // Generate for the primary suggested expert
                })
              });
              const data = await response.json();
              setOutreachTemplate(data.content);
              finishTask(taskId, true);
            } catch (err) {
              console.error(err);
              finishTask(taskId, false);
            } finally {
              setIsGenerating(false);
            }
          }}
          className="px-8 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-100 hover:text-signature-gradient hover:border-gold-500 transition-all flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {isGenerating ? "Processing..." : "Generate Master Invitation"}
        </button>
      </div>

      {/* Outreach Template Modal */}
      <AnimatePresence>
        {outreachTemplate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-gold-500/20 rounded-[2.5rem] p-10 shadow-3xl flex flex-col max-h-[80vh]"
            >
              <button 
                onClick={() => setOutreachTemplate(null)}
                className="absolute top-8 right-8 text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">AI Outreach Template</h3>
                <p className="text-zinc-100 text-[10px] uppercase font-bold tracking-widest">Tailored for: {experts[0]?.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto bg-black/40 border border-white/5 rounded-3xl p-8 mb-8 custom-scrollbar">
                <pre className="text-sm text-zinc-100 whitespace-pre-wrap font-sans leading-relaxed">
                  {outreachTemplate}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(outreachTemplate);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl bg-gold-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied to Buffer" : "Copy to Clipboard"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}