"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Image as LucideImage, Sparkles, Download, RefreshCw, Upload, Sliders, Check,
  Layout, Award, FileText, Columns2, Loader2, ExternalLink
} from "lucide-react";
import NextImage from "next/image";
import { ClubEvent, EventConfig } from "@/lib/types";
import { useGenerator } from "@/hooks/useGenerator";
import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
import { BorderBeam } from "@/components/animations/BorderBeam";

// ─── Types ───────────────────────────────────────────────────────────
interface DesignWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  onLogActivity: (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => void;
}

interface VibeData {
  vibe: string;
  fontFamily: string;
  fontUrl: string;
  effectStyle: string;
}

type DesignTab = "poster" | "banner" | "standee" | "certificate" | "forms-header";

interface FormatSpec {
  id: DesignTab;
  label: string;
  dim: string;
  width: number;
  height: number;
  icon: React.ElementType;
  previewH: number; // preview height in px
}

// ─── Constants ───────────────────────────────────────────────────────
const FORMATS: FormatSpec[] = [
  { id: "poster", label: "Poster", dim: "1080×1350", width: 1080, height: 1350, icon: LucideImage, previewH: 540 },
  { id: "banner", label: "Banner", dim: "8×10 ft", width: 2400, height: 3000, icon: Layout, previewH: 400 },
  { id: "standee", label: "Standee", dim: "3×5 ft", width: 900, height: 1500, icon: Columns2, previewH: 500 },
  { id: "certificate", label: "Certificate", dim: "Canva", width: 0, height: 0, icon: Award, previewH: 0 },
  { id: "forms-header", label: "Forms Header", dim: "1600×400", width: 1600, height: 400, icon: FileText, previewH: 200 },
];

const POSTER_DIMS = [
  { label: "Instagram (4:5)", dim: "1080×1350", w: 1080, h: 1350 },
  { label: "WhatsApp (1:1)", dim: "1080×1080", w: 1080, h: 1080 },
  { label: "A3 Print", dim: "3508×4961", w: 3508, h: 4961 },
];

const EFFECT_CSS: Record<string, React.CSSProperties> = {
  "shadow": { textShadow: "2px 4px 12px rgba(0,0,0,0.8)" },
  "shadow-depth": { textShadow: "3px 3px 0px rgba(0,0,0,0.9), 6px 6px 0px rgba(0,0,0,0.4)" },
  "emboss": { textShadow: "1px 1px 0px rgba(255,255,255,0.3), -1px -1px 0px rgba(0,0,0,0.8)" },
  "gradient-gold": { background: "linear-gradient(180deg, #fde68a, #f59e0b, #b45309)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  "neon-glow": { textShadow: "0 0 5px #fff, 0 0 10px #fff, 0 0 20px #f59e0b, 0 0 30px #f59e0b, 0 0 40px #f59e0b", color: "#fff" },
};

// ─── Canva template suggestions ──────────────────────────────────────
function getCertificateUrl(subType?: string): string {
  const templates: Record<string, string> = {
    "Hackathon": "https://www.canva.com/certificates/templates/?query=hackathon+certificate",
    "Workshop": "https://www.canva.com/certificates/templates/?query=workshop+certificate",
    "Competition": "https://www.canva.com/certificates/templates/?query=competition+certificate",
    "Conference": "https://www.canva.com/certificates/templates/?query=conference+certificate",
  };
  return templates[subType || ""] || "https://www.canva.com/certificates/templates/?query=event+certificate";
}

// ─── Component ───────────────────────────────────────────────────────
export default function DesignWorkspace({ activeEvent, onLogActivity }: DesignWorkspaceProps) {
  const config = activeEvent?.config || {};
  const posterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<DesignTab>("poster");
  const [posterDim, setPosterDim] = useState(POSTER_DIMS[0]);
  const [creativityLevel, setCreativityLevel] = useState(5);
  const [vibeData, setVibeData] = useState<VibeData | null>(null);
  const [vibeOverride, setVibeOverride] = useState("");
  const [useOverride, setUseOverride] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [vibeAccepted, setVibeAccepted] = useState(false);

  // Editable poster text
  const [editTitle, setEditTitle] = useState(activeEvent?.name || "Event Title");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editDate, setEditDate] = useState(config.date || "");
  const [editTime, setEditTime] = useState(config.time || "");
  const [editVenue, setEditVenue] = useState(config.venue || "");
  const [editTeamSize, setEditTeamSize] = useState(config.teamSize || "");
  const [editFee, setEditFee] = useState(config.feeClub || "");
  const [editPoc1, setEditPoc1] = useState(config.poc1Name ? `${config.poc1Name}: ${config.poc1Phone || ""}` : "");
  const [editPoc2, setEditPoc2] = useState(config.poc2Name ? `${config.poc2Name}: ${config.poc2Phone || ""}` : "");

  // Generators
  const vibeGen = useGenerator("Scanning Vibe Database...");
  const imageGen = useGenerator("Rendering Visual Assets...");

  // Sync editable fields when activeEvent changes
  useEffect(() => {
    if (activeEvent) {
      setEditTitle(activeEvent.name || "Event Title");
      setEditDate(config.date || "");
      setEditTime(config.time || "");
      setEditVenue(config.venue || "");
      setEditTeamSize(config.teamSize || "");
      setEditFee(config.feeClub || "");
      setEditPoc1(config.poc1Name ? `${config.poc1Name}: ${config.poc1Phone || ""}` : "");
      setEditPoc2(config.poc2Name ? `${config.poc2Name}: ${config.poc2Phone || ""}` : "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent?.id]);

  // Load Google Font dynamically
  useEffect(() => {
    if (vibeData?.fontUrl) {
      const linkId = "dynamic-google-font";
      let link = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = vibeData.fontUrl;
    }
  }, [vibeData?.fontUrl]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleSuggestVibe = async () => {
    if (!activeEvent) return;
    vibeGen.startGeneration();
    setVibeAccepted(false);
    try {
      const res = await fetch("/api/suggest-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: activeEvent.name,
          description: config.description || "",
          type: config.type || "",
          subType: config.subType || "",
          creativityLevel,
        }),
      });
      if (!res.ok) throw new Error("Vibe suggestion failed");
      const data: VibeData = await res.json();
      setVibeData(data);
      vibeGen.setSuccess(data);
      onLogActivity('Design', 'Drafted Design Vibe', `Engineered ${data.vibe} aesthetic for ${activeEvent.name} ${activeTab}`);
    } catch (err: unknown) {
      vibeGen.setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleGenerateImage = async () => {
    if (!activeEvent) return;
    imageGen.startGeneration();
    imageGen.updateProgress(10);

    const currentFormat = FORMATS.find(f => f.id === activeTab) || FORMATS[0];
    const dims = activeTab === "poster" ? `${posterDim.w}x${posterDim.h}` : `${currentFormat.width}x${currentFormat.height}`;
    const vibeText = useOverride && vibeOverride.trim() ? vibeOverride : (vibeData?.vibe || "");

    try {
      const prompt = `A professional, ultra-aesthetic, premium background for an event poster titled "${activeEvent.name}". Category: ${config.subType || config.type || "Professional"}. No text at all in the image.`;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          config,
          vibe: vibeText,
          creativityLevel,
          dimensions: dims,
          referenceImage: referenceImage || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Image generation failed");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      imageGen.updateProgress(70);

      // Handle SVG fallback (gradient) — display directly
      if (data.image && data.image.startsWith("data:image/svg")) {
        imageGen.updateProgress(100);
        imageGen.setSuccess(data.image);
        return;
      }

      // Draw external image (Pollinations/AI) to canvas
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const currentFmt = FORMATS.find(f => f.id === activeTab) || FORMATS[0];
            canvas.width = activeTab === "poster" ? posterDim.w : currentFmt.width;
            canvas.height = activeTab === "poster" ? posterDim.h : currentFmt.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
        imageGen.updateProgress(100);
        imageGen.setSuccess(data.image);
        onLogActivity('Design', 'Generated Visual Asset', `Composed AI background for ${activeEvent.name} using Pollinations engine`);
      };
      img.onerror = () => imageGen.setError("Failed to load generated image");
    } catch (err: unknown) {
      imageGen.setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleExport = async () => {
    if (!posterRef.current) return;
    const currentFmt = FORMATS.find(f => f.id === activeTab) || FORMATS[0];
    const exportW = activeTab === "poster" ? posterDim.w : currentFmt.width;
    const exportH = activeTab === "poster" ? posterDim.h : currentFmt.height;

    try {
      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: exportW,
        height: exportH,
        style: {
          borderRadius: '0',
          transform: 'scale(1)',
        },
        filter: (node: HTMLElement) => {
          // Skip link elements that point to cross-origin stylesheets (Google Fonts)
          if (node.tagName === "LINK" && (node as HTMLLinkElement).href?.includes("fonts.googleapis.com")) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = `${activeEvent?.name || "design"}-${activeTab}.png`;
      link.href = dataUrl;
      link.click();
      onLogActivity('Design', 'Exported Design', `Finalized and downloaded ${activeTab} for ${activeEvent?.name}`);
    } catch {
      // Fallback: try without external fonts
      try {
        const dataUrl = await htmlToImage.toPng(posterRef.current!, {
          quality: 1.0,
          pixelRatio: 2,
          width: exportW,
          height: exportH,
          skipFonts: true,
        });
        const link = document.createElement("a");
        link.download = `${activeEvent?.name || "design"}-${activeTab}.png`;
        link.href = dataUrl;
        link.click();
      } catch (fallbackErr) {
        console.error("Export failed", fallbackErr);
      }
    }
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReferenceImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ─── Derived ──────────────────────────────────────────────────────
  const currentFormat = FORMATS.find(f => f.id === activeTab)!;
  const effectCSS = vibeData ? (EFFECT_CSS[vibeData.effectStyle] || EFFECT_CSS["shadow"]) : EFFECT_CSS["shadow"];
  const fontFamily = vibeData?.fontFamily || "var(--font-astronomus)";
  const aspectRatio = activeTab === "poster" ? posterDim.w / posterDim.h : (currentFormat.width / currentFormat.height || 4 / 5);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Design Studio</h2>
        <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-[0.2em]">AI-Powered Visual Asset Engine</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-black/60 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveTab(f.id)}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === f.id ? "bg-gold-500 text-black shadow-lg shadow-gold-500/10" : "text-zinc-200 hover:text-white"}`}
          >
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── CERTIFICATE TAB ─────────────────────────────────────── */}
        {activeTab === "certificate" && (
          <motion.div key="cert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel rounded-[3rem] p-10 text-center space-y-8 relative overflow-hidden group">
            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto relative z-10">
              <Award className="w-10 h-10 text-gold-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Certificate Design</h3>
              <p className="text-zinc-200 text-sm max-w-md mx-auto">For professional certificate designs, we recommend using Canva&apos;s template library. We&apos;ve selected the best category for your event type.</p>
            </div>
            <a
              href={getCertificateUrl(config.subType)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 bg-gold-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
            >
              Open Canva Templates <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[9px] text-zinc-300 uppercase tracking-widest">Best match: <span className="text-signature-gradient font-bold">{config.subType || "Event"} Certificate</span></p>
          </motion.div>
        )}

        {/* ─── VISUAL DESIGN TABS (poster, banner, standee, forms-header) ── */}
        {activeTab !== "certificate" && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

              {/* ─── LEFT: Controls (2 cols) ─────────────────────────── */}
              <div className="xl:col-span-2 space-y-8">
                {/* Poster sub-dimensions */}
                {activeTab === "poster" && (
                  <section className="glass-panel rounded-[2rem] p-6 space-y-4">
                    <label className="text-[10px] text-signature-gradient font-bold uppercase tracking-widest flex items-center gap-2">
                      <LucideImage className="w-3 h-3" /> Poster Size
                    </label>
                    <div className="flex gap-2">
                      {POSTER_DIMS.map(d => (
                        <button
                          key={d.label}
                          onClick={() => setPosterDim(d)}
                          className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-bold uppercase transition-all border ${posterDim.label === d.label ? "bg-gold-500 text-black border-gold-500" : "bg-black/40 text-zinc-200 border-white/5 hover:border-white/10"}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Creativity Slider */}
                <section className="glass-panel rounded-[2rem] p-6 space-y-4">
                  <label className="text-[10px] text-signature-gradient font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="w-3 h-3" /> Creativity Level: <span className="text-white ml-1">{creativityLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={creativityLevel}
                    onChange={e => setCreativityLevel(Number(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-zinc-300 uppercase tracking-widest font-bold">
                    <span>Clean & Minimal</span>
                    <span>Bold & Artistic</span>
                  </div>
                </section>

                {/* AI Vibe Suggestion */}
                <section className="glass-panel rounded-[2rem] p-6 space-y-5 relative overflow-hidden group">
                  <div className="flex justify-between items-center relative z-10">
                    <label className="text-[10px] text-signature-gradient font-bold uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> AI Vibe Direction
                    </label>
                    <button
                      onClick={handleSuggestVibe}
                      disabled={vibeGen.status === "generating"}
                      className="px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-signature-gradient hover:bg-gold-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {vibeGen.status === "generating" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {vibeGen.status === "generating" ? "Thinking..." : vibeData ? "Re-Suggest" : "Suggest Vibe"}
                    </button>
                  </div>

                  {vibeGen.status === "generating" && (
                    <div className="py-8 flex flex-col items-center gap-3 animate-pulse relative z-10">
                      <BorderBeam duration={3} size={200} />
                      <Sparkles className="w-6 h-6 text-gold-500/40" />
                      <p className="text-[9px] text-zinc-200 font-bold uppercase tracking-widest">Analyzing event profile...</p>
                    </div>
                  )}

                  {vibeData && vibeGen.status === "success" && (
                    <div className="space-y-4 relative z-10">
                      <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-[11px] text-zinc-300 leading-relaxed">
                        {vibeData.vibe}
                      </div>
                      <div className="flex gap-2 text-[9px]">
                        <span className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-signature-gradient font-bold">Font: {vibeData.fontFamily}</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-zinc-200 font-bold">Effect: {vibeData.effectStyle}</span>
                      </div>
                      {!vibeAccepted && (
                        <div className="flex gap-3">
                          <button onClick={() => setVibeAccepted(true)} className="flex-1 py-3 bg-gold-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button onClick={() => { setUseOverride(true); setVibeAccepted(true); }} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                            Override
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {vibeGen.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center">
                      {vibeGen.error}
                    </div>
                  )}
                </section>

                {/* User Vibe Override */}
                {useOverride && (
                  <section className="glass-panel rounded-[2rem] p-6 space-y-4">
                    <label className="text-[10px] text-signature-gradient font-bold uppercase tracking-widest">Your Vibe Description</label>
                    <textarea
                      value={vibeOverride}
                      onChange={e => setVibeOverride(e.target.value)}
                      placeholder="Describe the color theme, mood, and overall vibe you want for the poster..."
                      className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold-500/50 outline-none resize-none min-h-[100px]"
                    />
                  </section>
                )}

                {/* Reference Image Upload */}
                <section className="glass-panel rounded-[2rem] p-6 space-y-4">
                  <label className="text-[10px] text-signature-gradient font-bold uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-3 h-3" /> Reference Image (Optional)
                  </label>
                  {referenceImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <NextImage 
                        src={referenceImage} 
                        alt="Reference" 
                        width={400} 
                        height={128} 
                        className="w-full h-32 object-cover" 
                        unoptimized
                      />
                      <button onClick={() => setReferenceImage(null)} className="absolute top-2 right-2 px-3 py-1 bg-black/80 rounded-full text-[9px] font-bold text-red-400 border border-red-500/20">Remove</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-3 py-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-gold-500/30 transition-all group">
                      <Upload className="w-6 h-6 text-zinc-300 group-hover:text-gold-500 transition-colors" />
                      <span className="text-[9px] text-zinc-200 font-bold uppercase tracking-widest">Drop or click to upload</span>
                      <input type="file" accept="image/*" onChange={handleRefUpload} className="hidden" />
                    </label>
                  )}
                </section>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateImage}
                  disabled={imageGen.status === "generating" || (!vibeAccepted && !useOverride)}
                  className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <RefreshCw className={`w-4 h-4 ${imageGen.status === "generating" ? "animate-spin" : ""}`} />
                  {imageGen.status === "generating" ? "Generating..." : "Generate Background"}
                </button>

                {!vibeAccepted && !useOverride && (
                  <p className="text-[9px] text-zinc-300 text-center uppercase tracking-widest">Suggest and accept a vibe first, or override with your own</p>
                )}

                {imageGen.status === "generating" && (
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div className="h-full bg-gold-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${imageGen.progress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </div>

              {/* ─── RIGHT: Live Preview (3 cols) ────────────────────── */}
              <div className="xl:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest">Live Preview — {currentFormat.label} {activeTab === "poster" ? `(${posterDim.dim})` : `(${currentFormat.dim})`}</label>
                  {imageGen.status === "success" && (
                    <button onClick={handleExport} className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gold-500 transition-all shadow-lg">
                      <Download className="w-3 h-3" /> Export Digital
                    </button>
                  )}
                </div>

                {/* UI Wrapper with rounded corners for the preview window */}
                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 mx-auto relative group" style={{ maxWidth: activeTab === "forms-header" ? "100%" : "480px" }}>
                  <BorderBeam duration={6} size={400} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    ref={posterRef}
                    className="relative w-full overflow-hidden bg-black"
                    style={{ aspectRatio: `${aspectRatio}` }}
                  >
                    {/* Background canvas (for raster AI images) */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-90" />

                    {/* SVG fallback background (for gradient fallback) */}
                    {typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image/svg") && (
                      <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${imageGen.result})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    )}

                    {/* Overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    {/* Editable content overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between" style={{ fontFamily }}>
                      {/* Top: Title + Subtitle */}
                      <div className="space-y-4 pt-4 text-center">
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full bg-transparent text-center outline-none text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white"
                          style={{ ...effectCSS, fontFamily }}
                          placeholder="EVENT TITLE"
                        />
                        <input
                          value={editSubtitle}
                          onChange={e => setEditSubtitle(e.target.value)}
                          className="w-full bg-transparent text-center outline-none text-base font-bold tracking-[0.3em] uppercase text-white/80"
                          placeholder="ADD EVENT TAGLINE"
                        />
                      </div>

                      {/* Middle: Event Details */}
                      <div className="space-y-4 text-center">
                        <div className="flex justify-center items-center gap-6">
                          <input value={editDate} onChange={e => setEditDate(e.target.value)} className="bg-transparent outline-none text-lg font-black text-white text-center w-36 border-b border-white/10 focus:border-gold-500/50" placeholder="DATE" />
                          <span className="text-gold-500/40 text-xl font-bold">|</span>
                          <input value={editTime} onChange={e => setEditTime(e.target.value)} className="bg-transparent outline-none text-lg font-black text-white text-center w-28 border-b border-white/10 focus:border-gold-500/50" placeholder="TIME" />
                        </div>
                        <input value={editVenue} onChange={e => setEditVenue(e.target.value)} className="w-full bg-transparent outline-none text-lg font-bold text-white/90 text-center uppercase tracking-wide" placeholder="VENUE NAME & LOCATION" />
                        
                        <div className="flex justify-center gap-6 pt-2">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[8px] text-gold-500/60 font-black uppercase">Team Size</span>
                            <input value={editTeamSize} onChange={e => setEditTeamSize(e.target.value)} className="bg-black/40 px-3 py-1 rounded-lg outline-none text-xs font-bold text-white text-center w-24 border border-white/5" placeholder="Size" />
                          </div>
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[8px] text-gold-500/60 font-black uppercase">Entry Fee</span>
                            <input value={editFee} onChange={e => setEditFee(e.target.value)} className="bg-black/40 px-3 py-1 rounded-lg outline-none text-xs font-bold text-white text-center w-24 border border-white/5" placeholder="Free" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom: POC Details */}
                      <div className="grid grid-cols-2 gap-4 items-end pt-4 pb-2 border-t border-white/10">
                        <div className="space-y-1">
                          <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest block">Contact Info</span>
                          <input value={editPoc1} onChange={e => setEditPoc1(e.target.value)} className="bg-transparent outline-none text-[10px] text-white/80 font-black w-full" placeholder="NAME | PHONE" />
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest block">Coordinator</span>
                          <input value={editPoc2} onChange={e => setEditPoc2(e.target.value)} className="bg-transparent outline-none text-[10px] text-white/80 font-black w-full text-right" placeholder="NAME | PHONE" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error display */}
                {imageGen.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                    {imageGen.error}
                  </div>
                )}
                {/* Error display */}
                {imageGen.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                    {imageGen.error}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}