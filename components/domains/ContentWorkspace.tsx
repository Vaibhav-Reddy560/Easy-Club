"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FileText, Share2, Table, Download, Check, Copy, File, Sparkles, Loader2, QrCode, UserCheck, Link, ExternalLink } from "lucide-react";
import { Club, ClubEvent, EventConfig } from "@/lib/types";
import { useGenerator } from "@/hooks/useGenerator";
import { exportToDocx, exportToExcel } from "@/lib/export-utils";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { useTasks } from "@/lib/TaskContext";
import TypewriterLoader from "@/components/ui/TypewriterLoader";
import { QRCodeCanvas } from "qrcode.react";

interface ContentWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  activeClub: Club | undefined;
  updateConfig: (newData: Partial<EventConfig>) => void;
  onLogActivity: (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => void;
  onUpdateClub?: (updatedClub: Club) => void;
}

export default function ContentWorkspace({ activeEvent, activeClub, updateConfig, onLogActivity, onUpdateClub }: ContentWorkspaceProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isSyncingPromo, setIsSyncingPromo] = useState(false);
  const [promoSyncError, setPromoSyncError] = useState<string | null>(null);
  const [includeEmojis, setIncludeEmojis] = useState(false);

  const [selectedLetterType, setSelectedLetterType] = useState<string | null>(null);
  const [generatedLetters, setGeneratedLetters] = useState<Record<string, string>>((activeEvent?.config?.workspaceData as any)?.letters || {});

  const [sheetUrlInput, setSheetUrlInput] = useState((activeEvent?.config?.responseSheetLink as string) || "");
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);


  // Hooks for new generators
  const letterGen = useGenerator("Generating Letter Copy...");
  const sheetGen = useGenerator("Assembling Coverage Sheet...", (activeEvent?.config?.workspaceData as any)?.sheet);
  const { startTask, finishTask } = useTasks();
  const letterSaveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Use persisted content if available
  const generatedPromo = activeEvent?.config?.workspaceData?.content || null;
  const config = activeEvent?.config || {};

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  
  const availableLetters = React.useMemo(() => {
    const isCollege = config.isCollegeEvent;
    const isHackathon = (config.type?.toLowerCase().includes('hackathon') || config.subType?.toLowerCase().includes('hackathon') || activeEvent?.name?.toLowerCase().includes('hackathon'));
    
    let letters = [];
    if (isCollege) {
      letters.push("Event Permission Letter (To Principal/HoD)");
      letters.push("Venue Permission Letter (To Venue In-charge)");
      letters.push("Off-campus Campaigning Permission Letter");
      letters.push("Chief Guest / VIP Invitation Letter");
      if (isHackathon) {
        letters.push("Overnight Water & Electricity Supply Permission Letter");
        letters.push("Overnight Hostel Stay Permission Letter");
      }
    } else {
      letters.push("Venue Permission Letter (To Venue Owner/Manager)");
      letters.push("Police Intimation / Event Permission Letter");
      letters.push("Noise / Loudspeaker Permission Letter");
      letters.push("Traffic Management / Road Usage Letter");
      letters.push("Fire Safety & Emergency Services NOC");
      letters.push("Medical / Ambulance Standby Request");
      letters.push("Chief Guest / VIP Invitation Letter");
    }
    return letters;
  }, [config, activeEvent?.name]);


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
          config: activeEvent.config,
          includeEmojis: includeEmojis
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

  const handleSyncPromo = async () => {
    if (!activeEvent || !generatedPromo?.long || !config.editFormLink) return;
    setIsSyncingPromo(true);
    setPromoSyncError(null);
    try {
      const response = await fetch("/api/update-google-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editFormLink: config.editFormLink,
          description: generatedPromo.long
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update Google Form");
      
      onLogActivity('Content', 'Synced Promo to Form', `Updated Google Form description for ${activeEvent.name}`);
      alert(data.isSandbox ? "Sandbox Mode: Form description synced." : "Successfully updated Google Form Description!");
    } catch (err: any) {
      setPromoSyncError(err.message || "Failed to sync promo to form");
    } finally {
      setIsSyncingPromo(false);
    }
  };

  const handleGenerateLetter = async (letterType: string) => {
    if (!activeEvent || !activeClub) return;
    letterGen.startGeneration();
    const taskId = 'letter-' + activeEvent.id;
    startTask(taskId, `Drafting ${letterType} for ${activeEvent.name}`);
    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'letter', letterType, event: activeEvent, club: activeClub, config })
      });
      if (!response.ok) throw new Error("Letter generation failed");
      const data = await response.json();
      letterGen.setSuccess(data.content);
      
      setGeneratedLetters(prev => {
        const newLetters = {
          ...prev,
          [letterType]: data.content
        };
        updateConfig({ workspaceData: { ...config.workspaceData, letters: newLetters } });
        return newLetters;
      });
      
    onLogActivity('Content', 'Generated Letter', `Created ${letterType} for ${activeEvent.name}`);
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
      updateConfig({ workspaceData: { ...config.workspaceData, sheet: data.data } });
      onLogActivity('Content', 'Generated Roster Template', `Initialized member tracking sheet for ${activeEvent.name}`);
      finishTask(taskId, true);
    } catch (err: unknown) {
      const error = err as Error;
      sheetGen.setError(error.message);
      finishTask(taskId, false);
    }
  };

  const downloadDocx = async (letterType: string) => {
    const letterContent = generatedLetters[letterType];
    if (!letterContent) return;
    const blob = await exportToDocx(`${activeEvent?.name} - ${letterType}`, letterContent);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent?.name}-${letterType.split(' ')[0]}.docx`;
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

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeEvent?.name || 'Event'}-Scanner-QR.png`;
    a.click();
  };

  const handleSyncSheet = async () => {
    if (!sheetUrlInput || !activeClub || !activeEvent) return;
    setIsSyncingSheet(true);
    setSheetSyncError(null);
    try {
        const res = await fetch(`/api/sheets?url=${encodeURIComponent(sheetUrlInput)}&t=${Date.now()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to sync sheet");
        
        // Perform an atomic update to avoid Firebase race conditions from separate calls
        const newEventLog = {
            id: Math.random().toString(36).substr(2, 9),
            userId: activeClub.ownerId || "unknown",
            userName: "System Sync",
            action: 'Synced Google Sheet',
            domain: 'Management' as const,
            timestamp: new Date().toISOString(),
            details: `Fetched ${data.count} registrations for ${activeEvent.name}`
        };

        const updatedClub = {
            ...activeClub,
            events: (activeClub.events || []).map(e => 
                e.id === activeEvent.id 
                ? { 
                    ...e, 
                    config: { 
                        ...e.config, 
                        responseSheetLink: sheetUrlInput,
                        totalRegistrations: data.count,
                        registeredEmails: data.emails 
                    }
                  }
                : e
            ),
            activityLog: [...(activeClub.activityLog || []), newEventLog].slice(-50)
        };

        if (onUpdateClub) onUpdateClub(updatedClub);
    } catch (e: any) {
        setSheetSyncError(e.message);
    } finally {
        setIsSyncingSheet(false);
    }
  };

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);
  const scannerLink = `${origin}/checkin/${activeEvent?.id}`;

  // Automatic promo generation disabled to prevent quota exhaustion
  // User must manually click "Regenerate" or "Generate" button.

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Content Lab</h2>
        <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase">AI-Powered Promotional & Document Engine</p>
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIncludeEmojis(!includeEmojis)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300 ${includeEmojis ? 'border-gold-500/50 bg-gold-500/10 text-gold-400' : 'border-white/15 bg-white/5 text-zinc-400'}`}
                title={includeEmojis ? "Emojis Enabled" : "Emojis Disabled"}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider">{includeEmojis ? 'Emojis ON' : 'Emojis OFF'}</span>
                <span className="text-xs">{includeEmojis ? '✨' : '🚫'}</span>
              </button>
              <button
                onClick={handleGeneratePromo}
                disabled={isGeneratingPromo}
                className="px-3 py-1 border border-white/15 rounded-full text-[9px] font-bold uppercase tracking-wider text-zinc-100 hover:text-signature-gradient transition-all"
              >
                {isGeneratingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : (generatedPromo ? 'Regenerate' : 'Generate')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {isGeneratingPromo ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-gold-500/40" />
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Generating Professional Copy</p>
              </div>
            ) : generatedPromo ? (
              <div className="space-y-6">
                {/* Long Version */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-100 uppercase">Standard (WhatsApp / Email)</span>
                    <div className="flex items-center gap-3">
                      {!!config.editFormLink && (
                        <button 
                          onClick={handleSyncPromo}
                          disabled={isSyncingPromo}
                          className="text-[9px] font-bold uppercase tracking-wider text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors flex items-center gap-1 bg-green-400/10 px-2 py-1 rounded"
                        >
                          {isSyncingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sync to Form"}
                        </button>
                      )}
                      <button onClick={() => copyToClipboard(generatedPromo.long, 'long')} className="text-signature-gradient text-[10px] font-bold flex items-center gap-1">
                        {copiedId === 'long' ? <Check className="w-3 h-3 text-gold-500" /> : <Copy className="w-3 h-3 text-gold-500" />} Copy
                      </button>
                    </div>
                  </div>
                  {promoSyncError && <p className="text-red-400 text-[10px]">{promoSyncError}</p>}
                  <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-[11px] text-white whitespace-pre-wrap leading-relaxed">
                    {generatedPromo.long}
                  </div>
                </div>

                {/* Short / Concise Version */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-100 uppercase">Short (Instagram Caption / Story)</span>
                    <button onClick={() => copyToClipboard(generatedPromo.short, 'short')} className="text-signature-gradient text-[10px] font-bold flex items-center gap-1">
                      {copiedId === 'short' ? <Check className="w-3 h-3 text-gold-500" /> : <Copy className="w-3 h-3 text-gold-500" />} Copy
                    </button>
                  </div>
                  <div className="bg-black/60 p-5 rounded-2xl border border-gold-500/10 text-[11px] text-white whitespace-pre-wrap leading-relaxed">
                    {generatedPromo.short}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl group-hover:border-gold-500/20 transition-all">
                <Share2 className="w-6 h-6 text-zinc-500 mb-4" />
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center px-4">Click Generate to draft your promotional campaign messaging</p>
                {promoError && (
                  <p className="text-[10px] text-red-400 mt-4 px-4 text-center max-w-sm">{promoError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Official Documents Section */}
        <div className="glass-panel rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group flex flex-col h-full">
          <BorderBeam duration={12} size={350} colorFrom="#9c40ff" colorTo="#ffaa40" className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h4 className="text-signature-gradient font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-500" /> Official Paperwork
            </h4>
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{config.isCollegeEvent ? 'College Event' : 'Non-College Event'}</span>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-wrap gap-2 mb-4 shrink-0">
              {availableLetters.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetterType(letter)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedLetterType === letter ? 'bg-gold-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'}`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {selectedLetterType && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-end mb-4 shrink-0">
                  <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">{selectedLetterType}</h5>
                </div>
                
                {generatedLetters[selectedLetterType] ? (
                  <div className="flex flex-col flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <textarea
                      className="bg-black/80 p-6 rounded-3xl border border-gold-500/20 flex-1 min-h-[300px] overflow-auto text-[11px] text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap mb-4 resize-none focus:outline-none focus:border-gold-500/50 transition-colors"
                      value={generatedLetters[selectedLetterType]}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setGeneratedLetters(prev => ({ ...prev, [selectedLetterType]: newText }));
                        
                        // Debounced save
                        if (letterSaveTimeout.current) clearTimeout(letterSaveTimeout.current);
                        letterSaveTimeout.current = setTimeout(() => {
                          updateConfig({ 
                            workspaceData: { 
                              ...config.workspaceData, 
                              letters: { ...generatedLetters, [selectedLetterType]: newText } 
                            } 
                          });
                        }, 1000);
                      }}
                    />
                    <div className="flex gap-4 shrink-0">
                      <button 
                        onClick={() => downloadDocx(selectedLetterType)}
                        className="flex-1 bg-gold-500 text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110"
                      >
                        <Download className="w-4 h-4" /> Export to DOCX
                      </button>
                      <button 
                        onClick={() => handleGenerateLetter(selectedLetterType)}
                        disabled={letterGen.status === 'generating'}
                        className="px-6 bg-white/5 border border-white/15 text-white rounded-2xl text-[10px] font-bold uppercase hover:bg-white/10 disabled:opacity-50"
                      >
                        {letterGen.status === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Regenerate'}
                      </button>
                    </div>
                  </div>
                ) : letterGen.status === 'generating' ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-6">
                    <TypewriterLoader />
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">Drafting Professional Letter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleGenerateLetter(selectedLetterType)}
                      className="w-full bg-black/40 border border-dashed border-white/15 rounded-3xl p-10 flex flex-col items-center gap-4 group hover:border-gold-500/40 transition-all"
                    >
                      <File className="w-5 h-5 text-gold-500 group-hover:text-gold-500 transition-colors" />
                      <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">Generate Document</span>
                    </button>
                    {letterGen.error && (
                      <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center mt-2 px-4">{letterGen.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!selectedLetterType && (
               <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Select a document type to begin</p>
               </div>
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
              className="px-6 py-2 bg-white/5 border border-white/15 rounded-xl text-[10px] font-bold text-white hover:text-signature-gradient hover:border-gold-500/30 transition-all uppercase tracking-widest flex items-center gap-2"
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
              <tbody className="divide-y divide-white/5 text-white">
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
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Compiling Data Sheet...</p>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/15 rounded-[3rem] space-y-6">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-bold text-white uppercase tracking-widest">No Active Data Sheet</p>
              <p className="text-[9px] text-zinc-100">The agent can generate budgets, schedules, or trackers</p>
            </div>
            <button 
              onClick={handleGenerateSheet}
              className="px-8 py-3 bg-zinc-900 border border-white/15 rounded-2xl text-[10px] font-black uppercase tracking-widest text-signature-gradient hover:bg-gold-500/5 transition-all"
            >
              Initialize Data Agent
            </button>
          </div>
        )}
      </div>

      {/* Attendance & QR Section */}
      <div className="glass-panel rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <BorderBeam duration={15} size={400} colorFrom="#FFD700" colorTo="#FFA500" className="opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h4 className="text-signature-gradient font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <QrCode className="w-4 h-4 text-gold-500" /> Attendance X Authentication
            </h4>
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">QR-Based Check-in synchronized with Registration Sheets</p>
          </div>
          
          <div className="flex flex-col items-start gap-1">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <input 
                type="text"
                value={sheetUrlInput}
                onChange={e => setSheetUrlInput(e.target.value)}
                placeholder="Paste Google Form Response Sheet URL..."
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white w-64 outline-none focus:border-gold-500/50"
              />
              <button
                onClick={handleSyncSheet}
                disabled={isSyncingSheet || !sheetUrlInput}
                className="bg-gold-500 text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
              >
                {isSyncingSheet ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />} Sync
              </button>
              {!!activeEvent?.config?.responseSheetLink && (
                <a 
                    href={(activeEvent?.config?.responseSheetLink as string)} 
                    target="_blank" 
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
                    title="View Responses Spreadsheet"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest pl-2">
              * Ensure sheet access is set to "Anyone with link can View"
            </p>
          </div>
        </div>
        {sheetSyncError && (
            <p className="text-red-400 text-[10px] mb-6">{sheetSyncError}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* QR Generation Area */}
            <div className="lg:col-span-1 space-y-6 flex flex-col items-center justify-center border-r border-white/5 pr-0 lg:pr-10">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-gold-500/20 relative group/qr">
                    <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center border-4 border-black rounded-2xl overflow-hidden relative">
                        <QRCodeCanvas value={scannerLink} size={160} id="qr-code-canvas" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 opacity-0 group-hover/qr:opacity-100 transition-opacity p-4 text-center">
                            <p className="text-[9px] font-bold text-gold-500 uppercase leading-tight">Scanner Link:</p>
                            <p className="text-[8px] text-white break-all mt-1">/checkin/{activeEvent?.id}</p>
                        </div>
                    </div>
                </div>
                <div className="w-full space-y-3">
                    <button 
                        onClick={downloadQR}
                        className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:brightness-90 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-3.5 h-3.5" /> Download QR Code
                    </button>
                    {/* Simulation Button for Functionality Demo */}
                    <button 
                        onClick={() => {
                            if (!activeClub || !activeEvent) return;
                            const randomAttendee = {
                                email: `user_${Math.floor(Math.random()*1000)}@gmail.com`,
                                name: "Demo User",
                                markedAt: new Date().toLocaleTimeString(),
                                source: 'QR' as const
                            };
                            const currentAttendees = activeEvent.attendees || [];
                            const updatedEvent = {
                                ...activeEvent,
                                attendees: [randomAttendee, ...currentAttendees]
                            };
                            if (onUpdateClub) {
                                onUpdateClub({
                                    ...activeClub,
                                    events: activeClub.events.map(e => e.id === activeEvent.id ? updatedEvent : e)
                                });
                            } else {
                                // fallback for isolated preview modes if any
                                updateConfig({ attendees: [randomAttendee, ...currentAttendees] as any });
                            }
                            onLogActivity('Management', 'QR Check-in Processed', `Verified attendee via encrypted scan for ${activeEvent.name}`);
                        }}
                        className="w-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black uppercase tracking-widest text-[9px] py-2.5 rounded-xl hover:bg-gold-500/20 transition-all"
                    >
                        Simulate Scan Check-in
                    </button>
                </div>
            </div>

            {/* Attendance Monitoring Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Registered</span>
                        <span className="text-3xl font-destrubia text-white">
                            {(activeEvent?.config?.totalRegistrations as number) || 0}
                        </span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                        <span className="text-[9px] font-bold text-gold-500 uppercase tracking-widest block mb-1">Checked In</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-destrubia text-white">
                                {activeEvent?.attendees?.length || 0}
                            </span>
                            <span className="text-[10px] font-destrubia text-green-500 mb-1.5">
                                ({activeEvent?.config?.totalRegistrations ? Math.round(((activeEvent.attendees?.length || 0) / (activeEvent.config.totalRegistrations as number)) * 100) : 0}%)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Recent Check-ins</span>
                        <span className="text-[9px] text-zinc-500 font-mono">Syncing live...</span>
                    </div>
                    <div className="max-h-[180px] overflow-auto divide-y divide-white/5">
                        {activeEvent?.attendees?.length ? activeEvent.attendees.map((attendee: any, i: number) => (
                            <div key={i} className="px-6 py-4 flex justify-between items-center group/row hover:bg-white/[0.02]">
                                <div>
                                    <p className="text-xs font-bold text-white">{attendee.name || "Anonymous User"}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{attendee.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-destrubia text-zinc-400">{attendee.markedAt}</p>
                                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                                        <Check className="w-2.5 h-2.5 text-green-500" />
                                        <span className="text-[8px] font-black text-green-500 uppercase">Verified</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em]">Waiting for first check-in...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gold-500/5 border border-gold-500/10 rounded-2xl">
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                        <span className="text-gold-500 font-bold uppercase mr-1">Validation Logic:</span> 
                        The scanner cross-references the scanned Google account email with the Registration ID in the linked spreadsheet. Attendance is only marked if there is a 1:1 email match.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}