"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Cpu, 
  Palette, 
  Sparkles, 
  Zap, 
  Eye, 
  MousePointer2,
  ShieldCheck,
  Save,
  Loader2
} from "lucide-react";

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [aiModel, setAiModel] = useState("gemini-2.0-pro");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("custom_gemini_api_key") || "");
      setOpenaiKey(localStorage.getItem("custom_openai_api_key") || "");
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("custom_gemini_api_key", geminiKey);
        localStorage.setItem("custom_openai_api_key", openaiKey);
        document.cookie = `custom_gemini_api_key=${geminiKey}; path=/; max-age=31536000`;
        document.cookie = `custom_openai_api_key=${openaiKey}; path=/; max-age=31536000`;
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  type SettingsOption = 
    | { type: "select" | "segments"; label: string; value: string; options: string[]; onChange: (v: string) => void }
    | { type: "toggle"; label: string; value: string | boolean; enabled: boolean; onChange: () => void }
    | { type: "badge" | "text" | "color"; label: string; value: string | boolean; onChange?: (v: string) => void }
    | { type: "input"; label: string; value: string; placeholder?: string; isSecret?: boolean; onChange: (v: string) => void };

  const sections: { id: string; title: string; icon: React.ElementType; description: string; options: SettingsOption[] }[] = [
    {
      id: "ai",
      title: "AI Orchestration",
      icon: Cpu,
      description: "Configure intelligence thresholds and private credentials for generation tasks.",
      options: [
        { label: "Active Model", value: aiModel, type: "select", options: ["Gemini 2.0 Pro", "Gemini 1.5 Flash", "Gemini Ultra"], onChange: (v: string) => setAiModel(v.toLowerCase().replace(/ /g, '-')) },
        { label: "Gemini API Key", value: geminiKey, type: "input", placeholder: "AIzaSy...", isSecret: true, onChange: setGeminiKey },
        { label: "OpenAI API Key (Fallback)", value: openaiKey, type: "input", placeholder: "sk-proj-...", isSecret: true, onChange: setOpenaiKey },
        { label: "Creativity bias", value: "High", type: "badge" },
        { label: "Token Optimization", value: "Active", type: "toggle", enabled: true, onChange: () => {} }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-signature-gradient font-bold hover:brightness-110 group transition-colors"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest text-signature-gradient">Exit Settings</span>
        </button>

        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(250,164,26,0.2)] ${saved ? 'bg-green-500 text-white' : 'bg-gold-500 text-black hover:bg-gold-400'}`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <ShieldCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Encrypting..." : saved ? "Protocol Saved" : "Save Configuration"}
        </button>
      </div>

      <header className="border-b border-white/5 pb-10 mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20">
            <Settings className="w-6 h-6 text-gold-500 animate-[spin_8s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">System <span className="text-white font-normal ml-2">/ Control Hub</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Global Administration Protocol Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative group shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -mr-32 -mt-32 transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 transition-colors">
                  <section.icon className="w-5 h-5 text-gold-500/70 group-hover:text-gold-500 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{section.title}</h4>
                  <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest mt-0.5">{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.options.map((opt, i) => (
                  <div key={i} className={`bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all ${opt.type === "input" ? "md:col-span-2" : ""}`}>
                    <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-3">{opt.label}</p>
                    
                    {opt.type === "input" && (
                      <input
                        type={opt.isSecret ? "password" : "text"}
                        value={opt.value as string}
                        placeholder={opt.placeholder}
                        onChange={e => opt.onChange?.(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors font-mono"
                      />
                    )}

                    {opt.type === "select" && (
                      <div className="flex flex-wrap gap-2">
                         {opt.options?.map(o => (
                           <button 
                             key={o} 
                             onClick={() => opt.onChange?.(o)}
                             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${opt.value === o.toLowerCase().replace(/ /g, '-') ? 'bg-gold-500 text-black' : 'bg-white/5 text-white'}`}
                           >
                             {o}
                           </button>
                         ))}
                      </div>
                    )}

                    {opt.type === "segments" && (
                      <div className="flex bg-zinc-800/50 p-1 rounded-xl">
                         {opt.options?.map(o => (
                           <button 
                             key={o} 
                             onClick={() => opt.onChange?.(o)}
                             className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${opt.value === o.toLowerCase() ? 'bg-zinc-700 text-white shadow-lg' : 'text-white'}`}
                           >
                             {o}
                           </button>
                         ))}
                      </div>
                    )}

                    {opt.type === "toggle" && (
                      <button 
                        onClick={opt.onChange}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${opt.enabled ? 'bg-gold-500' : 'bg-zinc-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${opt.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    )}

                    {opt.type === "badge" && (
                      <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[9px] font-black uppercase tracking-widest border border-gold-500/20">
                        {opt.value as string}
                      </span>
                    )}

                    {opt.type === "color" && (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: opt.value as string }} />
                         <span className="text-[10px] font-mono text-white uppercase">{opt.value as string}</span>
                         <button className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <MousePointer2 className="w-3.5 h-3.5 text-white" />
                         </button>
                      </div>
                    )}

                    {opt.type === "text" && (
                      <p className="text-sm text-white font-medium">{opt.value as string}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-12 py-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <Zap className="w-8 h-8 text-gold-500" />
           <Sparkles className="w-8 h-8 text-blue-500" />
           <Cpu className="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </motion.div>
  );
}
