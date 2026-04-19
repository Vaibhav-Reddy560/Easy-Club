"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Club } from "@/lib/types";
import { Send, Loader2, Sparkles, BrainCircuit, Check, CheckCircle2 } from "lucide-react";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [finalizing, setFinalizing] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleStart = async () => {
        if (!selectedClubId || !selectedCategory) return;
        setStarted(true);
        setLoading(true);

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
            
            setMessages([{ role: "assistant", content: data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages([{ role: "assistant", content: "Sorry, I had trouble connecting. Let's brainstorm! What kind of event are you looking to host?" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

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
            
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (messages.length === 0 || finalizing) return;
        setFinalizing(true);
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
            
            // Expected JSON: { title: string, tags: string[], description: string }
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
        }
    };

    if (!started) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto py-12"
            >
                <div className="p-10 bg-neutral-900/40 border border-white/5 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-gold-500/10 blur-[120px] rounded-full point-events-none" />
                    
                    <div className="w-16 h-16 mx-auto bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center justify-center text-gold-500">
                        <BrainCircuit className="w-8 h-8" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-astronomus text-signature-gradient uppercase tracking-tighter mb-2">
                            Initialize Brainstorm
                        </h2>
                        <p className="text-neutral-400 text-sm font-medium">Set the parameters for your event ideation session.</p>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Target Club</label>
                            <select 
                                value={selectedClubId} 
                                onChange={(e) => setSelectedClubId(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-gold-500/50 appearance-none"
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
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-gold-500/50 appearance-none"
                            >
                                {CLUB_TYPES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!selectedClubId}
                        className="w-full py-4 bg-gold-500 text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-gold-400 transition-colors shadow-gold-glow mt-4 disabled:opacity-50"
                    >
                        Begin Session
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-[70vh] max-h-[800px] border border-white/10 rounded-[2rem] bg-neutral-900/20 overflow-hidden relative"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center text-gold-500">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">Brainstorming Session</h3>
                        <p className="text-[10px] text-signature-gradient uppercase tracking-widest font-black">
                            {clubs.find(c => c.id === selectedClubId)?.name} • {selectedCategory}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleFinalize}
                    disabled={finalizing || messages.length < 2}
                    className="px-4 py-2 bg-white/5 hover:bg-gold-500 hover:text-black border border-white/10 hover:border-transparent rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                    {finalizing ? (
                        <><Loader2 className="w-3 h-3 animate-spin"/> Generating</>
                    ) : (
                        <><CheckCircle2 className="w-3 h-3 group-hover:text-black" /> Confirm Generation</>
                    )}
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                                m.role === 'user' 
                                    ? 'bg-gold-500/10 border border-gold-500/20 text-gold-50 rounded-tr-sm' 
                                    : 'bg-black/40 border border-white/5 text-neutral-300 rounded-tl-sm'
                            }`}>
                                {m.content.split('\\n').map((line, idx) => (
                                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-black/40 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-neutral-500">
                                <span className="w-2 h-2 bg-gold-500/50 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gold-500/50 rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-gold-500/50 rounded-full animate-bounce delay-150" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/40">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 relative max-w-4xl mx-auto"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Suggest an outdoor event..."
                        className="flex-1 bg-neutral-900 border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                        disabled={loading || finalizing}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading || finalizing}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-gold-500 rounded-full flex items-center justify-center text-black hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:hover:bg-gold-500"
                    >
                        <Send className="w-4 h-4 ml-1" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
