"use client";

import React, { useState } from "react";
import { FileText, Share2, Table, Link as LinkIcon, Download, Check, Copy, FileIcon, Mail, Sparkles, AlertCircle } from "lucide-react";
import { Club, ClubEvent, EventConfig } from "@/lib/types";

interface ContentWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  activeClub: Club | undefined;
  updateConfig: (newData: Partial<EventConfig>) => void;
}

export default function ContentWorkspace({ activeEvent, activeClub, updateConfig }: ContentWorkspaceProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use persisted content if available
  const generatedContent = activeEvent?.config?.workspaceData?.content || null;

  const config = activeEvent?.config || {};

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!activeEvent || !activeClub) {
      console.log("Missing data:", { activeEvent, activeClub });
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: activeEvent,
          club: activeClub,
          config: activeEvent.config
        }),
      });

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));

      if (data.standard && data.concise) {
        // Ensure both are strings. Sometimes AI returns objects like { message: "..." }
        const longVersion = typeof data.standard === 'string' ? data.standard : (data.standard.message || JSON.stringify(data.standard));
        const shortVersion = typeof data.concise === 'string' ? data.concise : (data.concise.message || JSON.stringify(data.concise));

        updateConfig({
          workspaceData: {
            ...activeEvent.config.workspaceData,
            content: {
              long: longVersion,
              short: shortVersion
            }
          }
        });
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to generate content. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (activeEvent && activeClub && !generatedContent && !isGenerating && !error) {
      handleGenerate();
    }
  }, [activeEvent, activeClub, generatedContent, isGenerating, error]);

  const generateLetter = (type: 'event' | 'venue') => {
    return `To,\nThe Authority,\nBMS College of Engineering,\nBengluru.\n\nDate: ${new Date().toLocaleDateString()}\n\nSubject: Request for ${type === 'event' ? 'Event Permission' : 'Venue Allocation'} - ${activeEvent?.name}\n\nRespected Sir/Madam,\n\nWe, the ${activeClub?.name || 'Club'} members, are organizing "${activeEvent?.name}" under the theme of ${config.description?.substring(0, 50) || 'Academic Excellence'}. We request your kind permission to conduct this ${config.type || 'activity'} on ${config.date || '[Date]'}.\n\nWe also request allocation of ${config.venue || '[Venue]'} from ${config.time || '[Time]'}.\n\nThanking you.\n\nYours faithfully,\n${config.poc1Name || '[POC Name]'}\n${activeClub?.name || 'Club Name'}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Outreach & Promo Messaging Section */}
      <div className="bg-neutral-900/60 rounded-[3rem] p-8 md:p-10 border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -z-10 group-hover:bg-gold-500/10 transition-colors" />

        <div className="flex justify-between items-center">
          <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Promotional Campaign Content
          </h4>
          <button
            onClick={() => {
              updateConfig({ workspaceData: { ...activeEvent?.config.workspaceData, content: undefined } });
              setError(null);
              handleGenerate();
            }}
            disabled={isGenerating}
            className={`px-3 py-1 border rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all ${isGenerating ? 'bg-neutral-800 text-neutral-600 border-transparent' : 'bg-white/5 border-white/10 text-neutral-500 hover:text-gold-500 hover:border-gold-500/30'
              }`}
          >
            {isGenerating ? 'Working...' : 'Regenerate'}
          </button>
        </div>

        <div className="space-y-6">
          {isGenerating ? (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-white/5 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gold-500/40" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Generating Professional Copy</p>
                <p className="text-[9px] text-neutral-600 mt-1 uppercase tracking-tighter">Athenticating with Gemini Engine...</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-red-500/5 rounded-3xl border border-dashed border-red-500/20">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="px-8">
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Generation Errored</p>
                <p className="text-[9px] text-neutral-600 mt-1">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-4 px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl text-[10px] text-white hover:text-gold-500 transition-colors uppercase font-bold"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : generatedContent ? (
            <div className="space-y-8 transition-all duration-700 fade-in">
              {/* LONG VERSION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Detailed WhatsApp/Email Draft
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedContent.long, 'long')}
                    className="text-gold-500 text-[10px] font-bold flex items-center gap-1.5 px-4 py-1.5 bg-gold-500/5 rounded-full hover:bg-gold-500/10 transition-all border border-gold-500/20"
                  >
                    {copiedId === 'long' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'long' ? 'Copied' : 'Copy Long'}
                  </button>
                </div>
                <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                  <p className="text-[11px] text-neutral-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {generatedContent.long}
                  </p>
                </div>
              </div>

              {/* SHORT VERSION */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                    <Share2 className="w-3 h-3" /> Quick Short version
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedContent.short, 'short')}
                    className="text-gold-500 text-[10px] font-bold flex items-center gap-1.5 px-4 py-1.5 bg-gold-500/5 rounded-full hover:bg-gold-500/10 transition-all border border-gold-500/20"
                  >
                    {copiedId === 'short' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'short' ? 'Copied' : 'Copy Short'}
                  </button>
                </div>
                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <p className="text-[11px] text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {generatedContent.short}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-black/40 rounded-3xl border border-dashed border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neutral-800" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  {!activeClub ? 'Organization identity missing' : !activeEvent ? 'Event instance missing' : 'Awaiting manual trigger'}
                </p>
                <p className="text-[9px] text-neutral-600 px-12">
                  {!activeClub || !activeEvent
                    ? 'Please head back to setup and ensure your event details are initialized.'
                    : 'The automatic campaign generation window is ready.'}
                </p>
              </div>
              {(activeClub && activeEvent) && (
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-gold-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Generate Campaign Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official Documents Section */}
      <div className="bg-neutral-900/60 rounded-[3rem] p-8 md:p-10 border border-white/5 space-y-8 shadow-2xl relative">
        <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2 justify-center">
          <FileText className="w-4 h-4" /> Official Paperwork
        </h4>

        <div className="space-y-6">
          {['Event Permission', 'Venue Allocation'].map(t => {
            const type = t.toLowerCase().includes('event') ? 'event' : 'venue';
            const content = generateLetter(type);
            return (
              <div key={t} className="flex flex-col gap-3 group/doc">
                <button
                  onClick={() => copyToClipboard(content, t)}
                  className="w-full bg-black border border-neutral-800 rounded-2xl p-5 text-xs font-bold text-neutral-400 hover:text-gold-500 hover:border-gold-500 transition-all uppercase tracking-widest flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <FileIcon className="w-4 h-4 opacity-40 group-hover/doc:opacity-100 transition-opacity" />
                    {copiedId === t ? 'Copied Content!' : `Preview ${t} Letter`}
                  </span>
                  {copiedId === t ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4 opacity-20" />}
                </button>
                <button className="flex items-center justify-center gap-2 text-[10px] text-neutral-600 hover:text-white transition-colors uppercase font-bold self-center">
                  <Download className="w-3 h-3" /> Download Printable DOCX
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-8 border-t border-white/5 mt-4">
          <div className="p-6 bg-gold-500/5 rounded-3xl border border-gold-500/20 flex flex-col gap-4 text-center">
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Attendance & RSVP Data</span>
              <p className="text-[9px] text-neutral-600">Connected to Google Registration Forms</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-black/60 border border-neutral-800 text-neutral-300 py-3 rounded-xl shadow-xl hover:border-gold-500 transition-all text-[10px] uppercase font-bold flex items-center justify-center gap-2">
                <LinkIcon className="w-3 h-3" /> Forms Link
              </button>
              <button className="flex-1 bg-gold-500 text-black py-3 rounded-xl shadow-xl hover:brightness-110 transition-all text-[10px] uppercase font-bold flex items-center justify-center gap-2">
                <Table className="w-3 h-3" /> Connected Sheet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}