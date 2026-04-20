"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronRight, TrendingUp, Target, Info } from "lucide-react";

const CLUB_TYPES = [
    "Bio", "Math", "Physics", "Chemistry", "Racing", "Dance", "Singing",
    "Theatre/Acting", "Astronomy/Space", "Coding", "Mountaineering",
    "Fashion", "Photography", "Social Service", "Debating", "Fine Arts",
    "Literary", "Comedy", "Electronics", "Robotics", "Cultural", "Business"
];

interface TrendingIdea {
    title: string;
    tags: string[];
    summary: string;
    references: string;
    whyTrending: string;
    complexity: string;
    reach: string;
}

interface AdoptConfig {
    subType: string;
    tags: string;
    description?: string;
}

interface TrendingIdeasProps {
    onAdopt?: (title: string, config: AdoptConfig) => void;
}

export default function TrendingIdeas({ onAdopt }: TrendingIdeasProps) {
    const [selectedCategory, setSelectedCategory] = useState(CLUB_TYPES[0]);
    const [ideas, setIdeas] = useState<TrendingIdea[]>([]);
    const [cache, setCache] = useState<Record<string, TrendingIdea[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [adoptingIdea, setAdoptingIdea] = useState<TrendingIdea | null>(null);
    const [customInput, setCustomInput] = useState("");

    const fetchIdeas = React.useCallback(async (category: string) => {
        if (cache[category]) {
            setIdeas(cache[category]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/trending-ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "Failed to fetch ideas");
            }
            const data = await response.json();
            setIdeas(data);
            setCache(prev => ({ ...prev, [category]: data }));
        } catch (err: unknown) {
            const discoveryErr = err as { message?: string };
            console.error(discoveryErr);
            setError(discoveryErr.message || "The Intelligence Engine is currently recalibrating. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    }, [cache]);

    useEffect(() => {
        fetchIdeas(selectedCategory);
    }, [selectedCategory, fetchIdeas]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <header className="border-b border-white/5 pb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-airstream text-signature-gradient uppercase tracking-tighter flex items-center gap-3 whitespace-nowrap">
                            Trending Ideas
                            <TrendingUp className="w-8 h-8 text-gold-500 flex-shrink-0" />
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-widest">AI-Curated Event Blueprints & Market Analysis</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter bg-gold-500/5 px-4 py-2 rounded-full border border-gold-500/10">
                        <Sparkles className="w-3 h-3 text-gold-500 flex-shrink-0" /> 
                        <span className="text-signature-gradient">Real-time Trend Extraction</span>
                    </div>
                </div>
            </header>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 py-4 border-y border-white/5">
                {CLUB_TYPES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat
                            ? "bg-gold-500 text-black shadow-gold-glow"
                            : "bg-neutral-900/40 text-neutral-500 border border-white/5 hover:border-gold-500/30 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 space-y-4"
                    >
                        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] animate-pulse">Scanning Global Campus Trends...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-8 border border-red-500/20 bg-red-500/5 rounded-3xl text-center"
                    >
                        <p className="text-red-400 font-bold uppercase tracking-widest text-[10px]">{error}</p>
                        <button
                            onClick={() => fetchIdeas(selectedCategory)}
                            className="mt-4 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-bold uppercase text-white hover:bg-red-500/20 transition-all"
                        >
                            Retry Extraction
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="ideas"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {ideas.map((idea, i) => (
                            <motion.div
                                key={idea.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-10 bg-neutral-900/40 border border-white/5 rounded-[3rem] hover:border-gold-500/40 transition-all duration-500 overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 blur-[100px] rounded-full group-hover:bg-gold-500/10 transition-all" />

                                <div className="relative space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            {idea.tags.map(t => (
                                                <span key={t} className="px-3 py-1 bg-black/40 border border-white/5 text-[8px] font-black uppercase tracking-tighter text-signature-gradient rounded-lg">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center text-gold-500">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-white group-hover:text-gold-100 transition-colors leading-tight">
                                        {idea.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Complexity</p>
                                            <p className={`text-xs font-bold ${idea.complexity === 'High' ? 'text-red-400' : idea.complexity === 'Medium' ? 'text-signature-gradient' : 'text-green-400'}`}>
                                                {idea.complexity}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Est. Reach</p>
                                            <p className="text-xs font-bold text-white font-astronomus tracking-tighter" style={{ fontFamily: 'var(--font-astronomus), sans-serif !important' }}>{idea.reach}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-neutral-400 leading-relaxed font-medium line-clamp-2">
                                        {idea.summary}
                                    </p>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-signature-gradient uppercase tracking-widest">
                                                <Target className="w-3 h-3" /> Market Reference
                                            </div>
                                            <div className="p-4 bg-black/60 border border-white/10 rounded-2xl text-[11px] text-neutral-300 italic leading-relaxed">
                                                &quot;{idea.references}&quot;
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                <Info className="w-3 h-3" /> Why It&apos;s Trending
                                            </div>
                                            <p className="text-[11px] text-neutral-500 font-bold leading-relaxed">
                                                {idea.whyTrending}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setAdoptingIdea(idea)}
                                        className="w-full mt-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:bg-gold-500 group-hover:text-black group-hover:border-transparent transition-all flex items-center justify-center gap-2"
                                    >
                                        Adopt Blueprint <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Adopt Confirmation Modal */}
            <AnimatePresence>
                {adoptingIdea && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[100px] rounded-full point-events-none" />
                            
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
                                Customize Blueprint
                            </h3>
                            <p className="text-neutral-400 text-xs font-bold leading-relaxed mb-6">
                                Adopting: <span className="text-signature-gradient">{adoptingIdea.title}</span>. Add any specific custom ideas or opinions below before applying it to your club!
                            </p>

                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="I want this event to focus heavily on AI, make sure we have a speaker from XYZ..."
                                className="w-full h-32 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 mb-6 font-medium leading-relaxed resize-none"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setAdoptingIdea(null);
                                        setCustomInput("");
                                    }}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-neutral-400 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onAdopt?.(adoptingIdea.title, { 
                                            subType: adoptingIdea.tags[0] || 'Workshop',
                                            tags: adoptingIdea.tags.join(', '),
                                            description: `[Base Blueprint: ${adoptingIdea.summary}] ${customInput ? '\\n\\nUser Notes: ' + customInput : ''}`
                                        });
                                        setAdoptingIdea(null);
                                        setCustomInput("");
                                    }}
                                    className="flex-1 py-4 bg-gold-500 text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-gold-400 transition-colors shadow-gold-glow"
                                >
                                    Adopt Idea
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
