"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FileText, Share2, Table, Download, Check, Copy, File, Sparkles, Loader2 } from "lucide-react";
import { Club, ClubEvent, EventConfig } from "@/lib/types";
import { useGenerator } from "@/hooks/useGenerator";
import { exportToDocx, exportToExcel } from "@/lib/export-utils";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { useTasks } from "@/lib/TaskContext";
import TypewriterLoader from "@/components/ui/TypewriterLoader";

interface ContentWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  activeClub: Club | undefined;
  updateConfig: (newData: Partial<EventConfig>) => void;
  onLogActivity: (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => void;
}

export default function ContentWorkspace({ activeEvent, activeClub, updateConfig, onLogActivity }: ContentWorkspaceProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Hooks for new generators
  const letterGen = useGenerator("Generating Letter Copy...");
  const sheetGen = useGenerator("Assembling Coverage Sheet...");
  const { startTask, finishTask } = useTasks();

  // Use persisted content if available
  const generatedPromo = activeEvent?.config?.workspaceData?.content || null;
  const config = activeEvent?.config || {};

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGeneratePromo = useCallback(async () => {
    if (!activeEvent || !activeClub) return;

    setIsGeneratingPromo(true);
    setPromoError(null);
    const taskId = 'promo-' + activeEvent.id;
    startTask(taskId, `Writing Copy for ${activeEvent.name}`);
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
      
      if (data.standard && data.concise) {
        updateConfig({
          workspaceData: {
            ...activeEvent.config.workspaceData,
            content: { long: data.standard, short: data.concise }
          }
        });
        onLogActivity('Content', 'Generated Event Promo', `Blueprinted standard and concise copy for ${activeEvent.name}`);
      } else {
        throw new Error("Invalid response format from AI");
      }
      finishTask(taskId, true);
    } catch (err: unknown) {
      const error = err as Error;
      setPromoError(error.message || "Failed to generate promo content");
      finishTask(taskId, false);
    } finally {
      setIsGeneratingPromo(false);
    }
  }, [activeEvent, activeClub, updateConfig, onLogActivity, startTask, finishTask]);

  const handleGenerateLetter = async () => {
    if (!activeEvent || !activeClub) return;
    letterGen.startGeneration();
    const taskId = 'letter-' + activeEvent.id;
    startTask(taskId, `Drafting Letter for ${activeEvent.name}`);
    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'letter', event: activeEvent, club: activeClub, config })
      });
      if (!response.ok) throw new Error("Letter generation failed");
      const data = await response.json();
      letterGen.setSuccess(data.content);
      onLogActivity('Content', 'Generated Permission Letter', `Created official documentation for ${activeEvent.name}`);
      finishTask(taskId, true);
    } catch (err: unknown) {
      const error = err as Error;
      letterGen.setError(error.message);
      finishTask(taskId, false);
    }
  };

  const handleGenerateSheet = async () => {
    if (!activeEvent || !activeClub) return;
    sheetGen.startGeneration();
    const taskId = 'sheet-' + activeEvent.id;
    startTask(taskId, `Building Roster Data ${activeEvent.name}`);
    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'sheet', event: activeEvent, club: activeClub, config })
      });
      if (!response.ok) throw new Error("Sheet generation failed");
      const data = await response.json();
      sheetGen.setSuccess(data.data);
      onLogActivity('Content', 'Generated Roster Template', `Initialized member tracking sheet for ${activeEvent.name}`);
      finishTask(taskId, true);
    } catch (err: unknown) {
      const error = err as Error;
      sheetGen.setError(error.message);
      finishTask(taskId, false);
    }
  };

  const downloadDocx = async () => {
    if (!letterGen.result || typeof letterGen.result !== 'string') return;
    const blob = await exportToDocx(`${activeEvent?.name} - Permission Letter`, letterGen.result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent?.name}-Letter.docx`;
    a.click();
  };

  const downloadExcel = async () => {
    if (!sheetGen.result || !Array.isArray(sheetGen.result)) return;
    const blob = await exportToExcel(`${activeEvent?.name} Data`, sheetGen.result as Record<string, unknown>[]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent?.name}-Data.xlsx`;
    a.click();
  };

  useEffect(() => {
    if (activeEvent && activeClub && !generatedPromo && !isGeneratingPromo && !promoError) {
      handleGeneratePromo();
    }
  }, [activeEvent, activeClub, generatedPromo, isGeneratingPromo, promoError, handleGeneratePromo]);

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Content Lab</h2>
        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">AI-Powered Promotional & Document Engine</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outreach & Promo Messaging Section */}
        <div className="glass-panel rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          <BorderBeam duration={10} size={300} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -z-10" />

          <div className="flex justify-between items-center">
            <h4 className="text-signature-gradient font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gold-500" /> Promotional Campaign
            </h4>
            <button
              onClick={handleGeneratePromo}
              disabled={isGeneratingPromo}
              className="px-3 py-1 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-tighter text-neutral-500 hover:text-signature-gradient transition-all"
            >
              {isGeneratingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Regenerate'}
            </button>
          </div>

          <div className="space-y-6">
            {isGeneratingPromo ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-gold-500/40" />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Generating Professional Copy</p>
              </div>
            ) : generatedPromo ? (
              <div className="space-y-6">
                {/* Long Version */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Standard (WhatsApp / Email)</span>
                    <button onClick={() => copyToClipboard(generatedPromo.long, 'long')} className="text-signature-gradient text-[10px] font-bold flex items-center gap-1">
                      {copiedId === 'long' ? <Check className="w-3 h-3 text-gold-500" /> : <Copy className="w-3 h-3 text-gold-500" />} Copy
                    </button>
                  </div>
                  <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {generatedPromo.long}
                  </div>
                </div>

                {/* Short / Concise Version */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Short (Instagram Caption / Story)</span>
                    <button onClick={() => copyToClipboard(generatedPromo.short, 'short')} className="text-signature-gradient text-[10px] font-bold flex items-center gap-1">
                      {copiedId === 'short' ? <Check className="w-3 h-3 text-gold-500" /> : <Copy className="w-3 h-3 text-gold-500" />} Copy
                    </button>
                  </div>
                  <div className="bg-black/60 p-5 rounded-2xl border border-gold-500/10 text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {generatedPromo.short}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Official Documents Section */}
        <div className="glass-panel rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          <BorderBeam duration={12} size={350} colorFrom="#9c40ff" colorTo="#ffaa40" className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-signature-gradient font-bold uppercase text-xs tracking-widest flex items-center gap-2 justify-center">
            <FileText className="w-4 h-4 text-gold-500" /> Official Paperwork
          </h4>

          <div className="space-y-6">
            {letterGen.status === 'success' ? (
              <div className="space-y-4">
                <div className="bg-black/80 p-6 rounded-3xl border border-gold-500/20 max-h-[300px] overflow-auto text-[11px] text-neutral-300 font-mono leading-relaxed">
                  {typeof letterGen.result === 'string' ? letterGen.result : "No content available"}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={downloadDocx}
                    className="flex-1 bg-gold-500 text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110"
                  >
                    <Download className="w-4 h-4" /> Export to DOCX
                  </button>
                  <button 
                    onClick={handleGenerateLetter}
                    className="px-6 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-bold uppercase hover:bg-white/10"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : letterGen.status === 'generating' ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-6">
                <TypewriterLoader />
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Drafting Professional Letter</p>
              </div>
            ) : (
              <button 
                onClick={handleGenerateLetter}
                className="w-full bg-black/40 border border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center gap-4 group hover:border-gold-500/40 transition-all"
              >
                <File className="w-5 h-5 text-gold-500 group-hover:text-gold-500 transition-colors" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Generate Official Letter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sheet / Data Section */}
      <div className="glass-panel rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-signature-gradient font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <Table className="w-4 h-4 text-gold-500" /> Data Sheet Agent
          </h4>
          {sheetGen.status === 'success' && (
            <button 
              onClick={downloadExcel}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:text-signature-gradient hover:border-gold-500/30 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Download className="w-3 h-3" /> Export to Excel
            </button>
          )}
        </div>

        {sheetGen.status === 'success' ? (
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/40">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-white/5 text-signature-gradient font-black uppercase tracking-tighter">
                <tr>
                  {Array.isArray(sheetGen.result) && sheetGen.result.length > 0 && Object.keys(sheetGen.result[0] as Record<string, unknown>).map(key => (
                    <th key={key} className="px-6 py-4">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-400">
                {Array.isArray(sheetGen.result) && sheetGen.result.map((row: Record<string, string | number>, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    {Object.values(row).map((val: string | number, j: number) => (
                      <td key={j} className="px-6 py-4">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : sheetGen.status === 'generating' ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
            <Table className="w-10 h-10 text-gold-500/40" />
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Compiling Data Sheet...</p>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] space-y-6">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">No Active Data Sheet</p>
              <p className="text-[9px] text-neutral-600">The agent can generate budgets, schedules, or trackers</p>
            </div>
            <button 
              onClick={handleGenerateSheet}
              className="px-8 py-3 bg-neutral-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-signature-gradient hover:bg-gold-500/5 transition-all"
            >
              Initialize Data Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}