"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, MapPin, Users, Award, ExternalLink, Linkedin, Twitter, Github, Globe, Loader2, Sparkles, Trophy, Mail, Briefcase } from "lucide-react";
import { BorderBeam } from "@/components/animations/BorderBeam";
import RadarDiscoveryLoader from "@/components/ui/RadarDiscoveryLoader";

interface ResourcePerson {
    name: string;
    role: string;
    college_affiliation?: string;
    reason: string;
    website: string;
    location: string;
    imageUrl: string;
    tags: string[];
}

interface TargetPersona {
    name: string;
    role: string;
    expertise: string;
    location: string;
}

interface ResourceRadarProps {
    initialDomain?: string;
    targetPersonas?: TargetPersona[];
    city?: string;
    subType?: string;
}

export default function ResourceRadar({ initialDomain, targetPersonas = [], city, subType }: ResourceRadarProps) {
    const [domain, setDomain] = useState(initialDomain || "AI & Machine Learning");
    const [location, setLocation] = useState(city || "Bengaluru");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ResourcePerson[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Update domain when initialDomain prop changes (event context)
    React.useEffect(() => {
        if (initialDomain) {
            setDomain(initialDomain);
        }
        if (city) {
            setLocation(city);
        }
    }, [initialDomain, city]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/find-resource", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, location })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Search failed");
            setResults(data);
        } catch (err: unknown) {
            const discoveryErr = err as Error;
            setError(discoveryErr.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Unified Suggested Experts Header */}
            <div className="glass-panel p-10 rounded-[3rem] space-y-10 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 blur-[120px] -z-10" />
                
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                                <Users className="w-8 h-8 text-gold-500" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-[-0.05em] text-signature-gradient font-astronomus leading-tight">
                                    Suggested <span className="text-white opacity-80">Experts</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="px-2 py-0.5 bg-gold-500/10 rounded-md text-[8px] font-black uppercase tracking-widest text-gold-500 border border-gold-500/20">
                                        {subType || "General Event"}
                                    </span>
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                        <MapPin className="w-3 h-3 text-gold-500" />
                                        Tailored for {location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold-500 transition-colors" />
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="Expert Domain"
                                className="w-full pl-12 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-gold-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="relative group w-full sm:w-48">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold-500 transition-colors" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Location"
                                className="w-full pl-12 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-gold-500/50 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full sm:w-auto px-10 py-4 bg-gold-500 hover:bg-gold-400 disabled:bg-zinc-800 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-gold-500/10 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Scan Talent
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll of Target Personas (Option A) */}
                {targetPersonas.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase className="w-3.5 h-3.5 text-gold-500" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Required Target Personas</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                            {targetPersonas.map((persona, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    className="flex-shrink-0 w-64 p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 hover:border-gold-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-white/5 group-hover:border-gold-500/20">
                                            <Linkedin className="w-5 h-5 text-gold-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-bold text-white truncate uppercase tracking-tight">{persona.name}</h3>
                                            <p className="text-[9px] text-signature-gradient font-black uppercase tracking-widest">{persona.role}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setDomain(persona.expertise)}
                                        className="w-full py-2.5 bg-black/40 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-gold-500/50 transition-all"
                                    >
                                        Auto-Match Domain
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-32 text-center"
                    >
                        <RadarDiscoveryLoader 
                            label="Discovery in Progress" 
                            className="scale-125"
                        />
                    </motion.div>
                ) : results.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32"
                    >
                        {results.map((person, idx) => (
                            <div
                                key={idx}
                                className="group relative glass-card p-1 rounded-[2.5rem] overflow-hidden"
                            >
                                <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[2.3rem] overflow-hidden relative border border-white/5 h-full flex flex-col">
                                    <BorderBeam duration={8} size={300} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="p-8 space-y-6 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Image
                                                    src={person.imageUrl}
                                                    alt={person.name}
                                                    width={72}
                                                    height={72}
                                                    unoptimized
                                                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 relative z-10"
                                                />
                                            </div>
                                            <div className="px-3 py-1 bg-white/[0.03] rounded-full border border-white/5 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-gold-500 transition-colors">
                                                <Linkedin className="w-2.5 h-2.5" />
                                                Professional
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">{person.name}</h3>
                                            <p className="text-[10px] font-black text-signature-gradient uppercase tracking-[0.1em]">{person.role}</p>
                                        </div>

                                        <p className="text-[11px] text-white/60 font-medium leading-[1.8] italic line-clamp-3">
                                            &quot;{person.reason}&quot;
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {person.tags?.map((tag, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase tracking-widest text-white/40">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0">
                                        <a
                                            href={person.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-4 bg-gold-500 text-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-white font-black uppercase tracking-[0.2em] text-[9px] shadow-[0_10px_20px_rgba(245,158,11,0.1)]"
                                        >
                                            View LinkedIn Profile 
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-white/[0.01] rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <Search className="w-10 h-10 text-white/5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-md font-black text-white uppercase tracking-[0.3em]">Expert Engine Standby</h3>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Awaiting discovery scan for {domain}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
