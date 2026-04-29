"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, MapPin, Calendar, Trophy, ExternalLink, Loader2, Sparkles } from "lucide-react";
import RadarDiscoveryLoader from "./ui/RadarDiscoveryLoader";

const EVENT_CATEGORIES = ["Hackathon", "Workshop", "Summit", "Competition", "Cultural", "Webinar"];
const EVENT_TYPES = ["Technical", "Non-Technical", "Mixed"];

interface ScrapedEvent {
    name: string;
    clubName: string;
    college: string;
    description: string;
    date: string;
    location: string;
    website: string;
    imageUrl: string;
    tags: string[];
}

export default function ExploreEvents() {
    const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
    const [type, setType] = useState(EVENT_TYPES[0]);
    const [location, setLocation] = useState("India");
    const [events, setEvents] = useState<ScrapedEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false);

    const MOCK_EVENTS: ScrapedEvent[] = [
        {
            name: "Inter-University Hackathon 2026",
            clubName: "IEEE Student Branch",
            college: "IIT Hyderabad",
            description: "Solve massive scale urban infrastructure problems using modern GenAI frameworks and decentralized sensor networks.",
            date: "Dec 15-18",
            location: "Hyderabad",
            website: "#",
            imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
            tags: ["AI", "Tech", "Prizes"]
        },
        {
            name: "National Space Summit",
            clubName: "Astronomy Society",
            college: "ISRO Hub",
            description: "A three-day immersive experience featuring satellite engineering workshops and talks from ISRO advisors.",
            date: "Nov 02-04",
            location: "Sriharikota",
            website: "#",
            imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
            tags: ["Space", "Satellite", "ISRO"]
        }
    ];

    interface DiscoveryError {
        name?: string;
        message?: string;
    }

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setIsMock(false);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const response = await fetch("/api/explore-events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, type, location }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Event Radar Unavailable");
            }

            if (Array.isArray(data) && data.length > 0) {
                setEvents(data);
            } else {
                throw new Error("No live events found matching these filters.");
            }
        } catch (err: unknown) {
            const discoveryErr = err as DiscoveryError;
            clearTimeout(timeoutId);
            console.error("Critical Sync Error:", discoveryErr);

            const isTimeout = discoveryErr.name === 'AbortError';
            const displayError = isTimeout ? "Sync timed out" : (discoveryErr.message || "Feed Fault");
            setError(displayError);

            setEvents(MOCK_EVENTS);
            setIsMock(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="border-b border-white/5 pb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Explore Events</h2>
                    <p className="text-zinc-100 text-sm mt-1 uppercase font-bold tracking-[0.2em] ml-1">National Activity Stream</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-signature-gradient uppercase tracking-widest leading-none">Direct Feed Mode</p>
                        <p className="text-[9px] text-white mt-1">Live search aggregation</p>
                    </div>
                </div>
            </header>

            {/* FILTERS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 glass-panel p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                    >
                        {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Type</label>
                    <div className="flex p-1 bg-black border border-white/10 rounded-2xl h-[46px]">
                        {EVENT_TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${type === t ? "bg-gold-500 text-black shadow-lg" : "text-white"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Region</label>
                    <div className="relative h-[46px]">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="All India"
                            className="w-full h-full bg-black border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:border-gold-500/50 outline-none shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full bg-gold-gradient h-[46px] rounded-2xl flex items-center justify-center gap-2 text-black font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loading ? "Scanning..." : "Launch Search"}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMock && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-gold-500 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">
                                Simulated Results
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-100 uppercase tracking-widest text-center max-w-md leading-relaxed">
                            Diagnostics: <span className="text-white/40 font-black">{error}</span>.
                            Displaying high-fidelity simulations for reference.
                        </p>
                        <button
                            onClick={() => {
                                setIsMock(false);
                                setEvents([]);
                                handleSearch();
                            }}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-gold-500 hover:text-black transition-all"
                        >
                            Force Refresh
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESULTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && (
                    <div className="col-span-full py-12">
                        <RadarDiscoveryLoader label="Scanning national activity stream..." />
                    </div>
                )}
                <AnimatePresence mode="popLayout">
                    {!loading && events.map((event, idx) => (
                        <motion.div
                            key={event.name + idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card overflow-hidden group hover:border-gold-500/30 transition-all flex flex-col relative"
                        >
                            <div className="absolute top-6 right-6 z-10">
                                <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black text-signature-gradient uppercase tracking-widest">
                                    {event.date}
                                </div>
                            </div>

                            <div className="h-48 relative overflow-hidden">
                                <Image
                                    src={event.imageUrl}
                                    alt={event.name}
                                    width={400}
                                    height={200}
                                    unoptimized
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            </div>

                            <div className="p-8 space-y-4 flex-1 flex flex-col">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-signature-gradient transition-colors uppercase italic">{event.name}</h3>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-100 uppercase tracking-widest leading-none">
                                            <Trophy className="w-3 h-3 text-gold-500" />
                                            <span>{event.clubName}</span>
                                        </div>
                                        {event.college && event.college !== event.location && (
                                            <div className="text-[9px] font-bold text-signature-gradient uppercase tracking-widest pl-5">
                                                @{event.college}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-100 leading-relaxed line-clamp-2">
                                    {event.description}
                                </p>

                                <div className="flex flex-wrap gap-2 py-2">
                                    {event.tags?.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black text-white uppercase tracking-tighter border border-white/5 whitespace-nowrap">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase">{event.location}</span>
                                    </div>
                                    {event.website && event.website.trim() !== "" && (
                                        <a
                                            href={event.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest hover:text-signature-gradient transition-colors"
                                        >
                                            Visit Source <ExternalLink className="w-3 h-3 text-gold-500" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && error && !isMock && (
                    <div className="col-span-full py-20 text-center space-y-8">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <Trophy className="w-10 h-10 text-red-500/30" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-red-400 uppercase tracking-widest italic">Sync Interrupted</h3>
                                <p className="text-xs text-zinc-100 max-w-xs mx-auto uppercase tracking-tighter leading-relaxed">{error}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setError(null);
                                    setEvents([
                                        {
                                            name: "Inter-University Hackathon 2026",
                                            clubName: "IEEE Student Branch",
                                            college: "IIT Hyderabad",
                                            description: "Solve massive scale urban infrastructure problems using modern GenAI frameworks and decentralized sensor networks.",
                                            date: "Dec 15-18",
                                            location: "Hyderabad",
                                            website: "#",
                                            imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
                                            tags: ["AI", "Tech", "Prizes"]
                                        },
                                        {
                                            name: "National Space Summit",
                                            clubName: "Astronomy Society",
                                            college: "ISRO Hub",
                                            description: "A three-day immersive experience featuring satellite engineering workshops and talks from ISRO advisors.",
                                            date: "Nov 02-04",
                                            location: "Sriharikota",
                                            website: "#",
                                            imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
                                            tags: ["Space", "Satellite", "ISRO"]
                                        }
                                    ]);
                                }}
                                className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:text-white transition-all shadow-xl"
                            >
                                Simulate with Local Stream
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && events.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-50">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 animate-pulse">
                            <Calendar className="w-12 h-12 text-gold-500/20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest italic font-sans">Awaiting Feed</h3>
                            <p className="text-[10px] text-zinc-100 max-w-xs mx-auto uppercase tracking-tighter">Initialize the national sync to aggregate upcoming organization activities.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
