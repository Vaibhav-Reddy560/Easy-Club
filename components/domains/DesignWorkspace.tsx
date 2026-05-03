"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Image as LucideImage, Sparkles, Download, RefreshCw, Upload, Sliders, Check,
  Layout, Award, FileText, Columns2, Loader2, ExternalLink, Type
} from "lucide-react";
import NextImage from "next/image";
import { ClubEvent, EventConfig } from "@/lib/types";
import { useGenerator } from "@/hooks/useGenerator";
import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
import { BorderBeam } from "@/components/animations/BorderBeam";
import DesignLoader from "@/components/ui/DesignLoader";




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
  const localEngineRef = useRef<any>(null);

  // State
  const [activeTab, setActiveTab] = useState<DesignTab>("poster");
  const [posterDim, setPosterDim] = useState(POSTER_DIMS[0]);
  const [creativityLevel, setCreativityLevel] = useState(5);
  const [vibeData, setVibeData] = useState<VibeData | null>(null);
  const [vibeOverride, setVibeOverride] = useState("");
  const [useOverride, setUseOverride] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [vibeAccepted, setVibeAccepted] = useState(false);
  const [localReady, setLocalReady] = useState(true);
  const [aiTitleImage, setAiTitleImage] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [activeProvider, setActiveProvider] = useState<{name: string, tier: number} | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);





  // Editable poster text
  const [editTitle, setEditTitle] = useState(config.designTitle || activeEvent?.name || "Event Title");
  const [editSubtitle, setEditSubtitle] = useState(config.designSubtitle || "");
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
      setEditTitle(config.designTitle || activeEvent.name || "Event Title");
      setEditSubtitle(config.designSubtitle || "");
      setEditDate(config.date || "");
      setEditTime(config.time || "");
      setEditVenue(config.venue || "");
      setEditTeamSize(config.teamSize || "");
      setEditFee(config.feeClub || "");
      setEditPoc1(config.poc1Name ? `${config.poc1Name}: ${config.poc1Phone || ""}` : "");
      setEditPoc2(config.poc2Name ? `${config.poc2Name}: ${config.poc2Phone || ""}` : "");
      
      if (config.designVibe) setVibeData(config.designVibe as VibeData);
      if (config.designTitleImage) setAiTitleImage(config.designTitleImage);
      if (config.designActiveTab) setActiveTab(config.designActiveTab);
      if (config.designPosterDim) setPosterDim(config.designPosterDim);
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

  // --- AUTO-SAVE ENGINE ---
  // This ensures every keystroke is eventually recorded in Firestore
  useEffect(() => {
    if (!activeEvent || !vibeAccepted) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editSubtitle, editDate, editTime, editVenue, editTeamSize, editFee, editPoc1, editPoc2, vibeData, aiTitleImage, activeTab, posterDim]);

  const handleAutoSave = () => {
    if (!activeEvent) return;
    
    // Construct the updated event configuration
    const updatedConfig: Partial<EventConfig> = {
      ...activeEvent.config,
      date: editDate,
      time: editTime,
      venue: editVenue,
      teamSize: editTeamSize,
      feeClub: editFee,
      poc1Name: editPoc1.split(':')[0]?.trim(),
      poc1Phone: editPoc1.split(':')[1]?.trim(),
      poc2Name: editPoc2.split(':')[0]?.trim(),
      poc2Phone: editPoc2.split(':')[1]?.trim(),
      // Store Design Specific Metadata
      designVibe: vibeData,
      designTitle: editTitle,
      designSubtitle: editSubtitle,
      designMainImage: typeof imageGen.result === 'string' ? imageGen.result : undefined,
      designTitleImage: aiTitleImage || undefined,
      designActiveTab: activeTab,
      designPosterDim: posterDim
    };

    onLogActivity('Management', 'Auto-Saved Design', `Synced ${activeTab} metadata to cloud.`);
    
    // We trigger the parent's activity logger which we will enhance to trigger a full DB save
    onLogActivity('Design', 'Sync State', JSON.stringify(updatedConfig));
  };

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleSuggestVibe = async () => {
    if (!activeEvent) return;
    vibeGen.startGeneration();
    setVibeAccepted(false);
    
    const userDirection = vibeOverride.trim();
    
    try {
      const res = await fetch("/api/ai-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "text", 
          prompt: `You are a world-class Art Director and Graphic Designer. 
          Analyze this event: ${activeEvent.name}. 
          ${userDirection ? `User specific direction: ${userDirection}` : ""}
          
          Create a MASTERPIECE design direction. 
          Return ONLY a JSON object with this EXACT structure:
          {
            "vibe": "A sophisticated, short name for the style",
            "description": "A deep, 2-3 sentence explanation of the visual strategy, lighting, and mood.",
            "colors": ["#primary", "#secondary", "#accent"],
            "fontFamily": "Professional typeface name",
            "effectStyle": "Specific visual effect (e.g., 'Liquid Glass', 'Cyber Grid', 'Organic Gradient')",
            "imagePrompt": "A highly detailed 50-word prompt for a flux-1-schnell image model including lighting, texture, and technical tags."
          }`
        }),
      });
      
      const data = await res.json();
      let parsed = null;

      if (data.text) {
        // Robust JSON extraction
        try {
          const firstBrace = data.text.indexOf('{');
          const lastBrace = data.text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = data.text.substring(firstBrace, lastBrace + 1);
            parsed = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.warn("[Design] AI JSON Parse failed, trying aggressive regex...");
          const match = data.text.match(/\{[\s\S]*\}/);
          if (match) {
            try { parsed = JSON.parse(match[0]); } catch(e2) {}
          }
        }
      }

      // HIGH-END FALLBACKS (If AI is down or returns junk)
      if (!parsed) {
        console.warn("[Design] AI Failure, using Elite Fallback Engine.");
        const fallbackOptions = [
          { 
            vibe: "Liquid Obsidian", 
            description: "Deep, ink-black surfaces with fluid, high-gloss reflections and tactical gold highlights.", 
            colors: ["#000000", "#18181b", "#d4af37"], 
            fontFamily: "Inter", 
            effectStyle: "matte",
            imagePrompt: "Macro shot of liquid black obsidian, gold veins, cinematic studio lighting, 8k, ray-traced reflections."
          },
          { 
            vibe: "Holographic Prism", 
            description: "Iridescent light refraction through frosted crystalline layers and glass geometry.", 
            colors: ["#f472b6", "#60a5fa", "#ffffff"], 
            fontFamily: "Outfit", 
            effectStyle: "glass",
            imagePrompt: "Prismatic crystal geometry, holographic light refraction, frosted glass texture, soft bokeh, 8k resolution."
          }
        ];
        parsed = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      }

      setVibeData(parsed);
      setActiveProvider({ name: data.provider || "Art Director AI", tier: data.tier || 1 });
      vibeGen.setSuccess(parsed);
      
    } catch (err: any) {
      console.error("[Design] Art Direction Failed:", err);
      vibeGen.setError("System recalibrating for maximum creativity. Please retry.");
    }
  };






   const handleGenerateImage = async () => {
    if (!activeEvent) return;
    imageGen.startGeneration();
    setAiTitleImage(null);

    // ELITE PROMPT EXTRACTION
    const bgPrompt = vibeData?.imagePrompt || 
      `[MASTERPIECE] High-end abstract event poster for "${activeEvent.name}". 
       Vibe: ${vibeData?.vibe || "Premium"}. 
       Concept: ${vibeData?.description || "Luxurious"}. 
       Colors: ${vibeData?.colors?.join(", ") || "Gold, Charcoal"}. 
       Lighting: Cinematic, Ray-traced. Texture: 8k, Detailed. --no text, people, faces.`;


    generateLocalFallback();
    imageGen.updateProgress(40);

    try {
      // 2. CLOUD AI RACE (NVIDIA -> GEMINI -> POLLINATIONS)
      const bgRes = await fetch("/api/ai-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", prompt: bgPrompt }),
      });

      if (bgRes.ok) {
        const data = await bgRes.json();
        if (data.image) {
          setActiveProvider({ name: data.provider, tier: data.tier });
          if (data.tier > 1) setQuotaWarning(`NVIDIA Credits Low. Switching to ${data.provider} Backup...`);
          
          imageGen.setSuccess(data.image);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            syncToCanvas(data.image);
            imageGen.updateProgress(100);
          };
          img.src = data.image;
        }
      }

      // Title Gen (Optional/Experimental)
      const titleRes = await fetch("/api/ai-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "text", 
          prompt: `Create a professional title graphic prompt for: ${editTitle}. Theme: ${vibeData?.vibe || "Premium"}.`
        }),
      });


    } catch (err: any) {
      console.error("[Design] AI Orchestration failed:", err.message);
    }
  };









  const generateLocalFallback = () => {
    console.log("[DesignWorkspace] Generating Procedural Masterpiece...");
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d')!;
    
    const colors = vibeData?.colors || ['#050505', '#d4af37'];
    const primary = colors[0];
    const accent = colors[1] || colors[0];
    
    // 1. Base Dark Gradient
    const bgGrad = ctx.createRadialGradient(540, 675, 0, 540, 675, 1000);
    bgGrad.addColorStop(0, '#121212');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);
    
    // 2. Isometric Grid Layer
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.08;
    const size = 60;
    for (let x = -1080; x < 2160; x += size) {
      for (let y = -1350; y < 2700; y += size) {
        // Draw isometric lines
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y + size/2);
        ctx.stroke();
      }
    }

    // 3. Ambient Light Glows
    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
    glow.addColorStop(0, accent + '22');
    glow.addColorStop(1, 'transparent');
    
    ctx.save();
    ctx.translate(1080, 0);
    ctx.fillStyle = glow;
    ctx.fillRect(-800, 0, 800, 800);
    ctx.restore();

    // 4. Film Grain / Noise
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1080;
      const y = Math.random() * 1350;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 1, 1);
    }
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    imageGen.setSuccess(dataUrl);
    syncToCanvas(dataUrl);
  };


  const syncToCanvas = (dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 1080;
        canvas.height = 1350;
        canvas.getContext('2d')?.drawImage(img, 0, 0, 1080, 1350);
      }
    };
    img.src = dataUrl;
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
  if (!activeEvent) {
    return (
      <div className="p-12 text-center glass-panel rounded-[3rem] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold-500/40" />
        <h3 className="text-xl font-bold text-white">Syncing Event Data...</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">We're having trouble connecting to the design database. Please check your internet or select an event from the sidebar.</p>
      </div>
    );
  }

  return (

    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Design Studio</h2>
        <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-[0.2em]">AI-Powered Visual Asset Engine</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-black/60 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveTab(f.id)}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === f.id ? "bg-gold-500 text-black shadow-lg shadow-gold-500/10" : "text-white hover:text-white"}`}
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
              <p className="text-white text-sm max-w-md mx-auto">For professional certificate designs, we recommend using Canva&apos;s template library. We&apos;ve selected the best category for your event type.</p>
            </div>
            <a
              href={getCertificateUrl(config.subType)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 bg-gold-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
            >
              Open Canva Templates <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[9px] text-zinc-100 uppercase tracking-widest">Best match: <span className="text-signature-gradient font-bold">{config.subType || "Event"} Certificate</span></p>
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
                          className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-bold uppercase transition-all border ${posterDim.label === d.label ? "bg-gold-500 text-black border-gold-500" : "bg-black/40 text-white border-white/5 hover:border-white/10"}`}
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
                  <div className="flex justify-between text-[8px] text-zinc-100 uppercase tracking-widest font-bold">
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
                      <p className="text-[9px] text-white font-bold uppercase tracking-widest">Analyzing event profile...</p>
                    </div>
                  )}

                  {vibeData && vibeGen.status === "success" && (
                    <div className="space-y-4 relative z-10">
                      <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-[11px] text-white leading-relaxed">
                        {vibeData.vibe}
                      </div>
                      <div className="flex gap-2 text-[9px]">
                        <span className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-signature-gradient font-bold">Font: {vibeData.fontFamily}</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-white font-bold">Effect: {vibeData.effectStyle}</span>
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
                      <Upload className="w-6 h-6 text-white group-hover:text-gold-500 transition-colors" />
                      <span className="text-[9px] text-white font-bold uppercase tracking-widest">Drop or click to upload</span>
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
                  <Sparkles className={`w-4 h-4 ${imageGen.status === "generating" ? "animate-spin" : ""}`} />
                  {imageGen.status === "generating" ? "Creating AI Magic..." : "Generate AI Poster"}
                </button>



                {!vibeAccepted && !useOverride && (
                  <p className="text-[9px] text-zinc-100 text-center uppercase tracking-widest">Suggest and accept a vibe first, or override with your own</p>
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
                  <label className="text-[10px] text-white font-bold uppercase tracking-widest">Live Preview — {currentFormat.label} {activeTab === "poster" ? `(${posterDim.dim})` : `(${currentFormat.dim})`}</label>
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

                    {/* Direct Image Fallback (Ensures visibility if canvas draw is slow/fails) */}
                    {(typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image")) && (
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90 transition-opacity duration-1000"
                        style={{ backgroundImage: `url(${imageGen.result})` }}
                      />
                    )}


                    {/* SVG fallback background (for gradient fallback) */}
                    {typeof imageGen.result === 'string' && imageGen.result.startsWith("data:image/svg") && (
                      <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: `url(${imageGen.result})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    )}


                    {/* Overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    {/* Generation Loader Overlay */}
                    <AnimatePresence>
                      {imageGen.status === "generating" && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20"
                        >
                          <div className="scale-75 sm:scale-100">
                            <DesignLoader />
                            <p className="text-[10px] text-white font-bold uppercase tracking-[0.3em] text-center mt-4 animate-pulse">
                              Designing Poster...
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Editable content overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between" style={{ fontFamily }}>
                      {/* Top: Title + Subtitle */}
                      <div className="space-y-4 pt-4 text-center">
                        {aiTitleImage ? (
                          <div className="relative h-32 sm:h-48 flex items-center justify-center group/title">
                            <img 
                              src={aiTitleImage} 
                              alt="AI Title" 
                              className="h-full w-auto object-contain mix-blend-screen filter brightness-125"
                            />
                            <button 
                              onClick={() => setAiTitleImage(null)}
                              className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover/title:opacity-100 transition-opacity"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-transparent text-center outline-none text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white"
                            style={{ ...effectCSS, fontFamily }}
                            placeholder="EVENT TITLE"
                          />
                        )}

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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}