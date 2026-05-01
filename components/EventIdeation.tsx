"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrendingIdeas from "@/components/TrendingIdeas";
import IdeationBrainstorm from "@/components/IdeationBrainstorm";
import { Club } from "@/lib/types";

interface AdoptConfig {
    subType: string;
    tags: string;
    description?: string;
}

interface EventIdeationProps {
    clubs: Club[];
    onAdopt?: (title: string, config: AdoptConfig) => void;
}

export default function EventIdeation({ clubs, onAdopt }: EventIdeationProps) {
    const [activeTab, setActiveTab] = useState<'trending' | 'brainstorm'>('trending');

    return (
        <div className="space-y-8">
            {/* Header / Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-4">
                <button
                    onClick={() => setActiveTab('trending')}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'trending'
                            ? "bg-gold-500 text-black shadow-gold-glow"
                            : "bg-[#050505] text-white border border-white/15 hover:border-gold-500/30 hover:text-white shadow-sm"
                    }`}
                >
                    Trending Blueprints
                </button>
                <button
                    onClick={() => setActiveTab('brainstorm')}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'brainstorm'
                            ? "bg-gold-500 text-black shadow-gold-glow"
                            : "bg-[#050505] text-white border border-white/15 hover:border-gold-500/30 hover:text-white shadow-sm"
                    }`}
                >
                    AI Brainstorming
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'trending' ? (
                        <TrendingIdeas onAdopt={onAdopt} />
                    ) : (
                        <IdeationBrainstorm clubs={clubs} onAdopt={onAdopt} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
