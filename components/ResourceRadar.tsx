"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, MapPin, Users, Award, ExternalLink, Linkedin, Twitter, Github, Globe, Loader2, Sparkles, Trophy, Mail } from "lucide-react";
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

interface ResourceRadarProps {
    initialDomain?: string;
}

export default function ResourceRadar({ initialDomain }: ResourceRadarProps) {
    const [domain, setDomain] = useState(initialDomain || "AI & Machine Learning");
    const [location, setLocation] = useState("Bengaluru");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ResourcePerson[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Update domain when initialDomain prop changes (event context)
    React.useEffect(() => {
        if (initialDomain) {
            setDomain(initialDomain);
        }
    }, [initialDomain]);

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
        <div className="space-y-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gold-500/10 rounded-2xl border border-gold-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                            <Users className="w-6 h-6 text-gold-500" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-signature-gradient font-astronomus">Suggested <span className="text-white opacity-90">Experts</span></h1>
                    </div>
                    <p className="text-sm text-zinc-100 font-medium max-w-lg leading-relaxed">
                        Precision professional discovery. Find the perfect mentors, speakers, and industry specialists tailored to your event&apos;s core focus.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-100 group-hover:text-gold-500 transition-colors" />
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Expert Domain (e.g. AI, Music, Design)"
                            className="w-full sm:w-64 pl-12 pr-6 py-4 glass-card rounded-2xl text-sm font-bold text-white focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all placeholder:text-zinc-100"
                        />
                    </div>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-100 group-hover:text-gold-500 transition-colors" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City"
                            className="w-full sm:w-48 pl-12 pr-6 py-4 glass-card rounded-2xl text-sm font-bold text-white focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all placeholder:text-zinc-100"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-8 py-4 bg-gold-500 hover:bg-gold-600 disabled:bg-zinc-800 disabled:text-zinc-200 text-black font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-lg shadow-gold-500/10 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4" />}
                        Scan Talent
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-32 text-center space-y-6"
                    >
                        <div className="mx-auto flex flex-col items-center">
                            <RadarDiscoveryLoader 
                                label="Mining Intelligence..." 
                                className="scale-110 sm:scale-125"
                            />
                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em] mt-4 opacity-60">
                                Scanning professional networks and university records
                            </p>
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-20 text-center"
                    >
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                            <p className="text-red-400 font-bold mb-2">Search Error</p>
                            <p className="text-sm text-white">{error}</p>
                            <button 
                                onClick={handleSearch}
                                className="mt-6 text-[10px] font-black uppercase tracking-widest text-signature-gradient hover:brightness-110 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                ) : results.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
                    >
                        {results.map((person, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative glass-card p-1 rounded-[2.2rem] overflow-hidden shadow-2xl"
                            >
                                <div className="bg-[#0A0A0A]/80 backdrop-blur-xl rounded-[2rem] overflow-hidden relative border border-white/5 h-full">
                                    <BorderBeam duration={10} size={250} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {/* Platform Label */}
                                <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                                    <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                                        {person.website.includes("linkedin") ? <Linkedin className="w-2.5 h-2.5" /> : 
                                         person.website.includes("twitter") || person.website.includes("x.com") ? <Twitter className="w-2.5 h-2.5" /> :
                                         person.website.includes("github") ? <Github className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                                        Verified Network
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gold-500/20 blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Image
                                                src={person.imageUrl}
                                                alt={person.name}
                                                width={64}
                                                height={64}
                                                unoptimized
                                                className="w-16 h-16 rounded-2xl object-cover border border-white/10 relative z-10"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <h3 className="text-lg font-black text-white truncate leading-none uppercase tracking-tighter">{person.name}</h3>
                                            <p className="text-[10px] font-bold text-signature-gradient uppercase tracking-widest line-clamp-1">{person.role}</p>
                                            {person.college_affiliation && (
                                                <div className="flex items-center gap-1.5 text-[8px] font-black text-white/40 uppercase tracking-widest pt-1">
                                                    <Award className="w-2.5 h-2.5 text-gold-500" />
                                                    {person.college_affiliation}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold-500/20 to-transparent" />
                                        <p className="text-[11px] text-white font-medium leading-[1.8] pl-2 italic">
                                            &quot;{person.reason}&quot;
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {person.tags?.map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-zinc-900 rounded text-[7px] font-black uppercase tracking-widest text-white">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={`mailto:expert@example.com?subject=Invitation to Speak at Easy Club&body=Hi ${encodeURIComponent(person.name)},%0D%0A%0D%0AWe are highly impressed by your work in ${encodeURIComponent(person.tags?.[0] || 'your field')} and would love to invite you as a speaker for our upcoming event.%0D%0A%0D%0ALooking forward to connecting!`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-4 bg-white/[0.03] hover:bg-gold-500 hover:text-black rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all group/btn"
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover/btn:scale-105 transition-transform">Initiate Email Invitation</span>
                                        <Mail className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                                    </a>
                                </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center"
                    >
                        <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto border border-white/5 mb-8">
                            <Trophy className="w-8 h-8 text-white/10" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Awaiting Discovery Scan</h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
