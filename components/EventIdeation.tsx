"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrendingIdeas from "@/components/TrendingIdeas";
import IdeationBrainstorm from "@/components/IdeationBrainstorm";
import { Club } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface AdoptConfig {
    subType: string;
    tags: string;
    description?: string;
}

interface EventIdeationProps {
    clubs: Club[];
    onAdopt?: (title: string, config: AdoptConfig, clubId?: string) => void;
}

export default function EventIdeation({ clubs, onAdopt }: EventIdeationProps) {
    const [activeTab, setActiveTab] = useState<'trending' | 'brainstorm'>('trending');
    const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || "");

    const handleAdopt = (title: string, config: AdoptConfig) => {
        if (onAdopt) {
            // Pass the currently selected club ID
            onAdopt(title, config, selectedClubId);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex gap-4">
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

                {/* Club Switcher for Ideation */}
                <div className="relative group min-w-[250px]">
                    <select
                        value={selectedClubId || ""}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                        className="w-full appearance-none bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500 cursor-pointer"
                    >
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id} className="bg-black text-white">{club.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none group-hover:text-gold-500 transition-colors" />
                </div>
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
                        <TrendingIdeas onAdopt={handleAdopt} />
                    ) : (
                        <IdeationBrainstorm clubs={clubs} selectedClubId={selectedClubId} onAdopt={handleAdopt} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
