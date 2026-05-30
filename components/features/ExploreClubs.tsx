"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, MapPin, Instagram, Linkedin, Twitter, Facebook, ExternalLink, Loader2, Sparkles, Globe, Youtube, Bookmark, BookmarkCheck } from "lucide-react";
import RadarDiscoveryLoader from "@/components/ui/RadarDiscoveryLoader";
import { useAuth } from "@/lib/auth";
import { saveExploreClub, removeExploreClub, subscribeSavedExploreClubs } from "@/lib/utils/db";
import { ScrapedClub } from "@/lib/types";

const CLUB_TYPES = [
    "Bio", "Math", "Physics", "Chemistry", "Racing", "Dance", "Singing",
    "Theatre/Acting", "Astronomy/Space", "Coding", "Mountaineering",
    "Fashion", "Photography", "Social Service", "Debating", "Fine Arts",
    "Literary", "Comedy", "Electronics", "Robotics", "Cultural", "Business"
];





export default function ExploreClubs() {
    const { user } = useAuth();
    const userId = user?.uid || null;
    const [type, setType] = useState(CLUB_TYPES[9]); // Default to Coding
    const [category, setCategory] = useState<"College" | "Non-College">("College");
    const [location, setLocation] = useState("India");
    const [scrapedClubs, setScrapedClubs] = useState<ScrapedClub[]>([]);
    const [loading, setLoading] = useState(false);
    // const isClubSaved = (id: string) => savedClubs.some(c => c.id === id);
    const [error, setError] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false);
    const [savedClubs, setSavedClubs] = useState<ScrapedClub[]>([]);
    const [savedClubKeys, setSavedClubKeys] = useState<Set<string>>(new Set());
    const [showSaved, setShowSaved] = useState(false);
    const [saveToast, setSaveToast] = useState<string | null>(null);

    const isCollege = category === "College";

    // Sync saved clubs with Firestore
    useEffect(() => {
        if (!userId) {
            setSavedClubs([]);
            setSavedClubKeys(new Set());
            return;
        }

        // Migrate local storage if exists (one-time)
        const LOCAL_KEY = `easyclub_saved_clubs_${userId}`;
        const localData = localStorage.getItem(LOCAL_KEY);
        if (localData) {
            void (async () => {
                try {
                    const clubs: ScrapedClub[] = JSON.parse(localData);
                    // Wait for all saves to finish before clearing
                    await Promise.all(clubs.map(c => saveExploreClub(userId, c)));
                    localStorage.removeItem(LOCAL_KEY);
                    console.log(`Successfully migrated ${clubs.length} clubs to Firestore.`);
                } catch (e) {
                    console.error("Migration failed:", e);
                }
            })();
        }

        if (userId) {
            try {
                const unsubscribe = subscribeSavedExploreClubs(userId, (clubs) => {
                    setSavedClubs(clubs);
                    setSavedClubKeys(new Set(clubs.map(c => `${c.name}__${c.college}`)));
                });
                return () => unsubscribe();
            } catch (err) {
                console.warn("[ExploreClubs] Saved clubs sync failed (Permissions). Continuing in guest mode.");
            }
        }
    }, [userId]);

    const toggleSaveClub = async (club: ScrapedClub) => {
        if (!userId) {
            setSaveToast("Please sign in to save clubs");
            setTimeout(() => setSaveToast(null), 2500);
            return;
        }

        const key = `${club.name}__${club.college}`;
        if (savedClubKeys.has(key)) {
            const success = await removeExploreClub(userId, club.name, club.college);
            if (success) setSaveToast(`Removed "${club.name}" from saved`);
        } else {
            const success = await saveExploreClub(userId, club);
            if (success) setSaveToast(`Saved "${club.name}"`);
        }
        setTimeout(() => setSaveToast(null), 2500);
    };

    interface DiscoveryError {
        name?: string;
        message?: string;
    }



    interface DiscoveryError {
        name?: string;
        message?: string;
    }

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setIsMock(false);
        setShowSaved(false);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const response = await fetch("/api/explore-clubs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, category, location }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Discovery service is optimizing. Stand by.");
            }

            if (Array.isArray(data) && data.length > 0) {
                // Map the new 3-Phase backend structure to the UI structure
                const formattedClubs: ScrapedClub[] = data.map((c: any) => ({
                    name: c.club_name,
                    description: `Official ${c.category} organization based in ${c.region}. Verified via ${c.parent_org || 'independent portal'}.`,
                    location: c.region,
                    college: c.parent_org || "",
                    website: c.official_website,
                    social: c.social_media || {},
                    imageUrl: "" // Will use fallback based on category
                }));
                setScrapedClubs(formattedClubs);
                setError(null);
            } else {
                setError("No verified clubs matching your criteria were found on authoritative portals.");
                setScrapedClubs([]);
            }
        } catch (err: unknown) {
            const discoveryErr = err as DiscoveryError;
            clearTimeout(timeoutId);
            console.warn("Discovery failed:", discoveryErr);
            setError(discoveryErr.message || "Cloud sync is adjusting. Please try a different category or region.");
            setScrapedClubs([]);
        } finally {
            setLoading(false);
        }
    };

    const getFallbackImage = (clubType: string) => {
        const images: Record<string, string> = {
            "Coding": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
            "Racing": "https://images.unsplash.com/photo-1547915720-307fa29d18bc?auto=format&fit=crop&q=80&w=800",
            "Dance": "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800",
            "Music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
            "Space": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
            "Astronomy": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
            "Acting": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
            "Theatre": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
            "Robotics": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800",
            "Photography": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"
        };
        const key = Object.keys(images).find(k => clubType.includes(k)) || "Coding";
        return images[key];
    };



    const displayedClubs = showSaved ? savedClubs : scrapedClubs;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="border-b border-white/5 pb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Explore Clubs</h2>
                    <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase ml-1">Discover clubs in a region</p>
                </div>
                <div className="flex gap-4 items-end">
                    <button
                        onClick={() => {
                            setShowSaved(!showSaved);
                            if (!showSaved) setError(null);
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            showSaved
                                ? "bg-gold-500 text-black border-gold-500 shadow-lg shadow-gold-500/20"
                                : "bg-white/5 text-white border-white/15 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Saved ({savedClubs.length})
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-signature-gradient uppercase tracking-widest leading-none">Powered by Web Search</p>
                        <p className="text-[9px] text-white mt-1">Live search aggregation</p>
                    </div>
                </div>
            </header>

            {/* FILTERS */}
            {!showSaved && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1fr_1.1fr] gap-6 glass-panel rounded-[2.5rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Type of Club</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Category</label>
                        <div className="flex p-1 bg-black border border-white/15 rounded-2xl h-[46px]">
                            {(["College", "Non-College"] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all px-2 ${category === cat ? "bg-gold-500 text-black shadow-lg" : "text-white hover:text-white"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Region</label>
                        <div className="relative h-[46px]">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="E.g. Bengaluru, India"
                                className="w-full h-full bg-black border border-white/15 rounded-2xl pl-11 pr-4 text-sm text-white focus:border-gold-500/50 outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full bg-gold-gradient h-[46px] rounded-2xl border border-white/15 flex items-center justify-center gap-2 text-black font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {loading ? "Discovering..." : "Launch Search"}
                        </button>
                    </div>
                </div>
            )}

            {/* SAVE TOAST */}
            <AnimatePresence>
                {saveToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 bg-gold-500 text-black px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-gold-500/30 flex items-center gap-2"
                    >
                        <BookmarkCheck className="w-4 h-4" />
                        {saveToast}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMock && !showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 p-8 glass-panel rounded-[2.5rem]"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-gold-500 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                Simulated Results
                            </span>
                        </div>
                        <p className="text-[10px] text-white uppercase tracking-widest text-center max-w-md leading-relaxed">
                            Diagnostics: <span className="text-white/40 font-black">{error}</span>.
                            Displaying high-fidelity simulations for reference.
                        </p>
                        <button
                            onClick={() => {
                                setIsMock(false);
                                setScrapedClubs([]);
                                handleSearch();
                            }}
                            className="px-6 py-2 bg-white/5 border border-white/15 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-gold-500 hover:text-black transition-all"
                        >
                            Force Refresh
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAVED CLUBS HEADER */}
            {showSaved && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <BookmarkCheck className="w-5 h-5 text-gold-500" />
                        <h3 className="text-lg font-black uppercase tracking-widest text-white">Saved Clubs</h3>
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {savedClubs.length} {savedClubs.length === 1 ? "club" : "clubs"} saved
                    </span>
                </div>
            )}

            {/* RESULTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && (
                    <div className="col-span-full py-12">
                        <RadarDiscoveryLoader label="Scanning national database for organizations..." />
                    </div>
                )}
                <AnimatePresence mode="popLayout">
                    {!loading && displayedClubs.map((club, idx) => {
                        const clubKey = `${club.name}__${club.college}`;
                        const isSaved = savedClubKeys.has(clubKey);

                        return (
                            <motion.div
                                key={club.name + idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card rounded-3xl overflow-hidden group hover:border-gold-500/30 transition-all flex flex-col h-full border border-white/10"
                            >
                                <div className="h-48 relative overflow-hidden bg-zinc-900">
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                        <div className={`backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-lg ${
                                            isCollege ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                        }`}>
                                            <Globe className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{isCollege ? "College Club" : "Organization"}</span>
                                        </div>
                                    </div>
                                    {/* Save button */}
                                    <button
                                        onClick={() => toggleSaveClub(club)}
                                        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border backdrop-blur-md transition-all hover:scale-110 ${
                                            isSaved
                                                ? "bg-gold-500 border-gold-500 text-black shadow-lg shadow-gold-500/30"
                                                : "bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/30"
                                        }`}
                                    >
                                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    </button>
                                    <Image
                                        src={club.imageUrl || getFallbackImage(type)}
                                        alt={club.name}
                                        width={800}
                                        height={400}
                                        unoptimized
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                </div>

                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">{club.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-gold-500" />
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{club.location}</span>
                                            </div>
                                        </div>

                                        {club.college && !["Academic Campus", "Independent", "None", "No", "N/A", "Independent Collective", "N/a", "no", "", location].includes(club.college) && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gold-500/70 block mb-0.5">Primary Institution</span>
                                                <p className="text-[11px] font-bold text-white uppercase tracking-tight line-clamp-1">{club.college}</p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                                        {club.description}
                                    </p>

                                    <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                                        {/* Social Links */}
                                        <div className="flex gap-3">
                                            {club.social?.instagram && (
                                                <a href={club.social.instagram} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-pink-500 transition-colors">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.linkedin && (
                                                <a href={club.social.linkedin} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.youtube && (
                                                <a href={club.social.youtube} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-red-500 transition-colors">
                                                    <Youtube className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        {/* Website Button */}
                                        {club.website && !club.website.includes('instagram.com') && !club.website.includes('facebook.com') && !club.website.includes('linkedin.com') && (
                                            <a
                                                href={club.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-gold-500 hover:bg-gold-500 hover:text-black transition-all"
                                            >
                                                Visit Website <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {!loading && error && !isMock && !showSaved && (
                    <div className="col-span-full py-20 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <Sparkles className="w-8 h-8 text-red-500 opacity-40" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest">Search Interrupted</h3>
                                <p className="text-xs text-white max-w-xs mx-auto uppercase tracking-tighter">{error}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setError(null);
                                    handleSearch();
                                }}
                                className="px-6 py-2 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:text-white transition-all"
                            >
                                Retry Search
                            </button>
                        </div>
                    </div>
                )}

                {showSaved && displayedClubs.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gold-500/5 rounded-full flex items-center justify-center mx-auto border border-gold-500/10">
                            <Bookmark className="w-10 h-10 text-gold-500/20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">No Saved Clubs</h3>
                            <p className="text-xs text-white max-w-xs mx-auto uppercase tracking-tighter">Click the bookmark icon on any club card to save it for later.</p>
                        </div>
                    </div>
                )}

                {!loading && !error && !showSaved && scrapedClubs.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gold-500/5 rounded-full flex items-center justify-center mx-auto border border-gold-500/10">
                            <Sparkles className="w-10 h-10 text-gold-500/20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Ready for Exploration</h3>
                            <p className="text-xs text-white max-w-xs mx-auto uppercase tracking-tighter">Enter your criteria and launch the discovery sequence to find clubs nationwide.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
