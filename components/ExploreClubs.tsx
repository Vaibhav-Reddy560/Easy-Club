"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, MapPin, Instagram, Linkedin, Twitter, Facebook, ExternalLink, Loader2, Sparkles, Globe, Youtube, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { saveExploreClub, removeExploreClub, subscribeSavedExploreClubs } from "@/lib/db";
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

        const unsubscribe = subscribeSavedExploreClubs(userId, (clubs) => {
            setSavedClubs(clubs);
            setSavedClubKeys(new Set(clubs.map(c => `${c.name}__${c.college}`)));
        });

        return () => unsubscribe();
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

    const MOCK_CLUBS: ScrapedClub[] = [
        {
            name: "Ashwa Racing",
            description: "A premier Formula Student team from RVCE Bangalore, designing and building high-performance combustion and electric race cars.",
            location: "Bangalore, Karnataka",
            college: "RV College of Engineering",
            website: "https://ashwaracing.com",
            social: { instagram: "https://instagram.com/ashwaracing", linkedin: "https://linkedin.com/company/ashwaracing" },
            imageUrl: "https://images.unsplash.com/photo-1547915720-307fa29d18bc?q=80&w=800"
        },
        {
            name: "Shunya ramjas",
            description: "The official dramatics society of Ramjas College, known for its powerful street plays and social message-driven theater.",
            location: "New Delhi, Delhi",
            college: "Ramjas College, DU",
            website: "https://ramjas.du.ac.in",
            social: { instagram: "https://instagram.com/shunyaramjas" },
            imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800"
        },
        {
            name: "Gradient IIITS",
            description: "A vibrant coding and development club focused on competitive programming, hackathons, and open source projects.",
            location: "Sri City, AP",
            college: "IIIT Sri City",
            website: "https://iiits.ac.in",
            social: { linkedin: "https://linkedin.com/company/gradient-iiits" },
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800"
        },
        {
            name: "AeroClub IIST",
            description: "Focusing on aerospace innovation, aeromodelling, and rocketry projects at the premier space science institute.",
            location: "Thiruvananthapuram, KL",
            college: "IIST",
            website: "https://iist.ac.in",
            social: { instagram: "https://instagram.com/aeroclub_iist" },
            imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800"
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
                throw new Error(data.error || "Search Service Unavailable");
            }

            if (Array.isArray(data) && data.length > 0) {
                setScrapedClubs(data);
            } else {
                throw new Error("No organizations found. Try adjusting your search criteria.");
            }
        } catch (err: unknown) {
            const discoveryErr = err as DiscoveryError;
            clearTimeout(timeoutId);
            console.error("Discovery Engine Error:", discoveryErr);
            
            const isTimeout = discoveryErr.name === 'AbortError';
            const displayError = isTimeout ? "Search timed out" : (discoveryErr.message || "Network Fault");
            setError(displayError);

            setScrapedClubs(MOCK_CLUBS);
            setIsMock(true);
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
                    <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-[0.2em] ml-1">Universal Organization Discovery</p>
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
                                : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Saved ({savedClubs.length})
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-signature-gradient uppercase tracking-widest leading-none">Powered by Web Search</p>
                        <p className="text-[9px] text-neutral-600 mt-1">Live search aggregation</p>
                    </div>
                </div>
            </header>

            {/* FILTERS */}
            {!showSaved && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-neutral-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Type of Club</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            {CLUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Category</label>
                        <div className="flex p-1 bg-black border border-white/10 rounded-2xl h-[46px]">
                            {(["College", "Non-College"] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${category === cat ? "bg-gold-500 text-black shadow-lg" : "text-neutral-500 hover:text-white"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Location</label>
                        <div className="relative h-[46px]">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="E.g. Bengaluru, India"
                                className="w-full h-full bg-black border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white focus:border-gold-500/50 outline-none transition-all shadow-inner"
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
                        className="flex flex-col items-center gap-4 p-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-gold-500 opacity-40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                                Simulated Results
                            </span>
                        </div>
                        <p className="text-[10px] text-neutral-600 uppercase tracking-widest text-center max-w-md leading-relaxed">
                            Diagnostics: <span className="text-white/40 font-black">{error}</span>.
                            Displaying high-fidelity simulations for reference.
                        </p>
                        <button
                            onClick={() => {
                                setIsMock(false);
                                setScrapedClubs([]);
                                handleSearch();
                            }}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-gold-500 hover:text-black transition-all"
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
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {savedClubs.length} {savedClubs.length === 1 ? "club" : "clubs"} saved
                    </span>
                </div>
            )}

            {/* RESULTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {displayedClubs.map((club, idx) => {
                        const clubKey = `${club.name}__${club.college}`;
                        const isSaved = savedClubKeys.has(clubKey);

                        return (
                            <motion.div
                                key={club.name + idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-neutral-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-gold-500/30 transition-all shadow-xl flex flex-col"
                            >
                                <div className="h-48 relative overflow-hidden bg-neutral-800">
                                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
                                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">Search Result</span>
                                        </div>
                                    </div>
                                    {/* Save button */}
                                    <button
                                        onClick={() => toggleSaveClub(club)}
                                        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border backdrop-blur-md transition-all hover:scale-110 ${
                                            isSaved
                                                ? "bg-gold-500/90 border-gold-500 text-black shadow-lg shadow-gold-500/30"
                                                : "bg-black/50 border-white/10 text-white/60 hover:text-white hover:border-white/30"
                                        }`}
                                        title={isSaved ? "Remove from saved" : "Save this club"}
                                    >
                                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    </button>
                                    <Image
                                        src={club.imageUrl || getFallbackImage(type)}
                                        alt={club.name}
                                        width={800}
                                        height={400}
                                        unoptimized
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    {club.college && !["Academic Campus", "Independent", "None", "No", "N/A", "Independent Collective", "N/a", "no", "", location].includes(club.college) && (
                                        <div className="absolute bottom-4 left-6 pr-6 z-20">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-signature-gradient leading-none">Institution</span>
                                                <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white drop-shadow-xl leading-tight line-clamp-2">{club.college}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-signature-gradient transition-colors">{club.name}</h3>
                                        <div className="flex items-center gap-1.5 text-neutral-500">
                                            <MapPin className="w-3 h-3 text-gold-500/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{club.location}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                                        {club.description}
                                    </p>

                                    <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                                        {/* LEFT: Social media icons */}
                                        <div className="flex gap-3">
                                            {club.social?.instagram && club.social.instagram.trim() !== "" && (
                                                <a href={club.social.instagram} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-pink-500 transition-all hover:scale-110" title="Instagram">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.linkedin && club.social.linkedin.trim() !== "" && (
                                                <a href={club.social.linkedin} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-blue-400 transition-all hover:scale-110" title="LinkedIn">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.twitter && club.social.twitter.trim() !== "" && (
                                                <a href={club.social.twitter} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-sky-400 transition-all hover:scale-110" title="Twitter / X">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.facebook && club.social.facebook.trim() !== "" && (
                                                <a href={club.social.facebook} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-blue-500 transition-all hover:scale-110" title="Facebook">
                                                    <Facebook className="w-4 h-4" />
                                                </a>
                                            )}
                                            {club.social?.youtube && club.social.youtube.trim() !== "" && (
                                                <a href={club.social.youtube} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-red-500 transition-all hover:scale-110" title="YouTube">
                                                    <Youtube className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        {/* RIGHT: Visit Portal — ONLY for actual website, never social media */}
                                        {club.website && club.website.trim() !== "" && (
                                            <a
                                                href={club.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-signature-gradient font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Visit Portal <ExternalLink className="w-3 h-3 text-gold-500" />
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
                                <p className="text-xs text-neutral-600 max-w-xs mx-auto uppercase tracking-tighter">{error}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setError(null);
                                    handleSearch();
                                }}
                                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all"
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
                            <h3 className="text-lg font-bold text-neutral-400 uppercase tracking-widest">No Saved Clubs</h3>
                            <p className="text-xs text-neutral-600 max-w-xs mx-auto uppercase tracking-tighter">Click the bookmark icon on any club card to save it for later.</p>
                        </div>
                    </div>
                )}

                {!loading && !error && !showSaved && scrapedClubs.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gold-500/5 rounded-full flex items-center justify-center mx-auto border border-gold-500/10">
                            <Sparkles className="w-10 h-10 text-gold-500/20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-neutral-400 uppercase tracking-widest">Ready for Exploration</h3>
                            <p className="text-xs text-neutral-600 max-w-xs mx-auto uppercase tracking-tighter">Enter your criteria and launch the discovery sequence to find clubs nationwide.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
