"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Club } from "@/lib/types";
import { Send, Loader2, Sparkles, BrainCircuit, Check, CheckCircle2, Search, Zap } from "lucide-react";

interface IdeationBrainstormProps {
    clubs: Club[];
    onAdopt?: (title: string, config: { subType: string, tags: string, description?: string }) => void;
}

const CLUB_TYPES = [
    "Bio", "Math", "Physics", "Chemistry", "Racing", "Dance", "Singing",
    "Theatre/Acting", "Astronomy/Space", "Coding", "Mountaineering",
    "Fashion", "Photography", "Social Service", "Debating", "Fine Arts",
    "Literary", "Comedy", "Electronics", "Robotics", "Cultural", "Business"
];

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function IdeationBrainstorm({ clubs, onAdopt }: IdeationBrainstormProps) {
    const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || "");
    const [selectedCategory, setSelectedCategory] = useState<string>(CLUB_TYPES[0]);
    
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [finalizing, setFinalizing] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleStart = async () => {
        if (!selectedClubId || !selectedCategory) return;
        setStarted(true);
        setLoading(true);
        setCurrentStatus("Analyzing Trends...");

        try {
            const clubName = clubs.find(c => c.id === selectedClubId)?.name || "Unknown Club";
            const response = await fetch("/api/brainstorm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "start",
                    clubName,
                    category: selectedCategory,
                }),
            });

            if (!response.ok) throw new Error("Failed to start brainstorm");
            const data = await response.json();
            
            if (data.status) setCurrentStatus(data.status);
            setMessages([{ role: "assistant", content: data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages([{ role: "assistant", content: "Sorry, I had trouble connecting. Let's brainstorm! What kind of event are you looking to host?" }]);
        } finally {
            setLoading(false);
            setCurrentStatus("");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setCurrentStatus("Architecting Response...");

        try {
            const response = await fetch("/api/brainstorm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "chat",
                    messages: [...messages, userMsg],
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");
            const data = await response.json();
            
            if (data.status) setCurrentStatus(data.status);
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setCurrentStatus("");
        }
    };

    const handleFinalize = async () => {
        if (messages.length === 0 || finalizing) return;
        setFinalizing(true);
        setCurrentStatus("Engineering Blueprint...");
        try {
            const response = await fetch("/api/brainstorm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "finalize",
                    messages,
                }),
            });

            if (!response.ok) throw new Error("Failed to finalize blueprint");
            const data = await response.json();
            
            onAdopt?.(data.title, {
                subType: data.tags?.[0] || 'Workshop',
                tags: data.tags?.join(', ') || 'Brainstormed',
                description: data.description || "Generated from Brainstorm."
            });
        } catch (err) {
            console.error("Failed to generate blueprint", err);
            alert("Could not finalize blueprint. Please try again.");
        } finally {
            setFinalizing(false);
            setCurrentStatus("");
        }
    };

    if (!started) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto py-12 px-4"
            >
                <div className="p-10 bg-neutral-900/40 border border-white/5 rounded-[3rem] text-center space-y-8 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="w-16 h-16 mx-auto bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center text-gold-500 relative group transition-transform hover:scale-110 duration-500 shadow-2xl">
                        <BrainCircuit className="w-8 h-8" />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-gold-500/20 rounded-2xl scale-125 opacity-30"
                        />
                    </div>

                    <div>
                        <h2 className="text-3xl font-airstream text-signature-gradient uppercase tracking-tighter mb-3">
                            Event Architect Hub
                        </h2>
                        <p className="text-neutral-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                            Initialize a high-performance session to build your next flagship event.
                        </p>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Target Club</label>
                                <select 
                                    value={selectedClubId} 
                                    onChange={(e) => setSelectedClubId(e.target.value)}
                                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-gold-500/50 appearance-none backdrop-blur-md cursor-pointer hover:border-white/20 transition-all"
                                >
                                    {clubs.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                    {clubs.length === 0 && <option value="">No Clubs Found</option>}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Primary Field</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-gold-500/50 appearance-none backdrop-blur-md cursor-pointer hover:border-white/20 transition-all"
                                >
                                    {CLUB_TYPES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!selectedClubId}
                        className="w-full py-4 bg-gold-500 text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-gold-glow mt-4 disabled:opacity-50 relative overflow-hidden group active:scale-95"
                    >
                        <span className="relative z-10">Start Architectural Session</span>
                        <motion.div 
                            className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full"
                        />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-[75vh] max-h-[850px] border border-white/10 rounded-[3rem] bg-black/40 backdrop-blur-2xl overflow-hidden relative shadow-2xl"
        >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 bg-black/60 flex justify-between items-center z-10 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center text-gold-500 shadow-inner">
                        <BrainCircuit className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base tracking-tight leading-tight">Live Architect Session</h3>
                        <p className="text-[10px] text-signature-gradient uppercase tracking-widest font-black mt-0.5">
                            {clubs.find(c => c.id === selectedClubId)?.name} • {selectedCategory}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {messages.length >= 3 && !finalizing && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-[9px] font-black tracking-widest text-gold-500 uppercase"
                            >
                                <Zap className="w-3 h-3 fill-gold-500" /> Idea Developed
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleFinalize}
                        disabled={finalizing || messages.length < 2}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group disabled:opacity-40
                            ${messages.length >= 3 
                                ? 'bg-gold-500 text-black shadow-gold-glow hover:scale-105' 
                                : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {finalizing ? (
                            <><Loader2 className="w-3 h-3 animate-spin"/> Engineering</>
                        ) : (
                            <><CheckCircle2 className={`w-3.5 h-3.5 ${messages.length >= 3 ? 'text-black' : 'group-hover:text-gold-500'}`} /> Confirm Blueprint</>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`relative max-w-[85%] rounded-[2rem] p-5 text-sm leading-relaxed shadow-xl ${
                                m.role === 'user' 
                                    ? 'bg-gold-500/10 border border-gold-500/30 text-gold-50 rounded-tr-sm backdrop-blur-sm' 
                                    : 'bg-neutral-800/40 border border-white/10 text-neutral-200 rounded-tl-sm backdrop-blur-md'
                            }`}>
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-3 h-3 text-gold-500" />
                                </div>
                                {m.content.split('\n').map((line, idx) => (
                                    <p key={idx} className={idx > 0 ? "mt-3" : ""}>
                                        {line.split('**').map((part, pidx) => 
                                            pidx % 2 === 1 ? <span key={pidx} className="font-black text-gold-400">{part}</span> : part
                                        )}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-neutral-800/40 border border-white/5 rounded-[1.5rem] rounded-tl-sm p-5 flex flex-col gap-3 min-w-[200px] shadow-lg backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <motion.span 
                                            animate={{ scale: [1, 1.3, 1] }} 
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="w-2.5 h-2.5 bg-gold-500/60 rounded-full" 
                                        />
                                        <motion.span 
                                            animate={{ scale: [1, 1.3, 1] }} 
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                            className="w-2.5 h-2.5 bg-gold-500/40 rounded-full" 
                                        />
                                        <motion.span 
                                            animate={{ scale: [1, 1.3, 1] }} 
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                            className="w-2.5 h-2.5 bg-gold-500/20 rounded-full" 
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-signature-gradient">
                                        Architect at work
                                    </span>
                                </div>
                                {currentStatus && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-2 text-neutral-500 text-[11px] font-medium italic border-t border-white/5 pt-2"
                                    >
                                        <Search className="w-3 h-3 text-gold-500/40" /> {currentStatus}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-8 py-8 border-t border-white/5 bg-black/60 backdrop-blur-3xl">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-3 relative max-w-5xl mx-auto group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/0 via-gold-500/10 to-gold-500/0 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="E.g. Build a blueprint for an outdoor racing hackathon..."
                        className="flex-1 bg-neutral-900/60 border border-white/10 rounded-full px-8 py-5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50 transition-all backdrop-blur-md pr-16 shadow-inner"
                        disabled={loading || finalizing}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading || finalizing}
                        className="absolute right-2.5 top-2.5 bottom-2.5 aspect-square bg-gold-500 rounded-full flex items-center justify-center text-black hover:bg-gold-400 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-1" />
                        )}
                    </button>
                    
                    <div className="absolute -bottom-6 left-8 flex items-center gap-2 text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                        <span className="w-1 h-1 bg-gold-500/40 rounded-full" />
                        Enter to Send
                        <span className="w-1 h-1 bg-gold-500/40 rounded-full ml-1" />
                        Architect is ready for complex prompts
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
