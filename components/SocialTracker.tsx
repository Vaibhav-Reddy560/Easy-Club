"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Heart, 
    Share2, 
    Instagram, 
    Linkedin, 
    Twitter, 
    Globe, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    AtSign as Zap,
    Sparkles,
    Loader2 
} from "lucide-react";
import { Club } from "@/lib/types";
import { linkSocialAccount } from "@/lib/firebase_social";

interface SocialTrackerProps {
    clubs: Club[];
}

interface AyrshareData {
    likes: number;
    shares: number;
    impressions: number;
    followerGrowth: number;
    lastUpdated: string;
    isMock?: boolean;
}

export default function SocialTracker({ clubs }: SocialTrackerProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
    const [ayrshareData, setAyrshareData] = useState<AyrshareData | null>(null);
    const [loadingAyrshare, setLoadingAyrshare] = useState(true);

    const fetchAyrshare = async () => {
        setLoadingAyrshare(true);
        try {
            const response = await fetch("/api/analytics");
            if (!response.ok) throw new Error("Ayrshare sync failed");
            const data = await response.json();
            setAyrshareData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAyrshare(false);
        }
    };

    const [isConnecting, setIsConnecting] = useState(false);

    const handleFirebaseLink = async (platform: 'google' | 'x') => {
        if (!selectedClubId) return;
        setIsConnecting(true);
        try {
            await linkSocialAccount(selectedClubId, platform);
            alert(`${platform.toUpperCase()} Protocol Established Successfully!`);
            // In a real app, we'd refresh the club data from Firestore here
        } catch (err: unknown) {
            console.error(err);
            const error = err as Error;
            alert("Linking Failed: " + (error.message || "Unknown Error"));
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        fetchAyrshare();
    }, [selectedClubId]);

    // Simulated stats for each club
    const getStats = (clubId: string) => {
        const seed = clubId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            followers: (seed % 5000) + 1200,
            engagement: ((seed % 10) + 2) / 10,
            growth: (seed % 15) - 3,
            reach: (seed % 10000) + 5000,
            posts: (seed % 30) + 5
        };
    };

    const activeClub = clubs.find(c => c.id === selectedClubId);

    if (clubs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <BarChart3 className="w-10 h-10 text-neutral-700" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Organizations Established</h3>
                    <p className="text-neutral-500 text-sm max-w-xs mx-auto font-medium">Create a club in the &quot;My Clubs&quot; section to start tracking social performance.</p>
                </div>
            </div>
        );
    }

    const stats = activeClub ? getStats(activeClub.id) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter flex items-center gap-3">
                            Social Pulse
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-widest">Universal Organization & Profile Intelligence</p>
                    </div>

                    {/* Club Switcher */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                        {clubs.map((club) => (
                            <button
                                key={club.id}
                                onClick={() => setSelectedClubId(club.id)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedClubId === club.id ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/10' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {club.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={fetchAyrshare}
                        className="px-5 py-3 bg-neutral-900/40 border border-white/5 rounded-2xl flex items-center gap-3 hover:bg-neutral-900 transition-all group"
                    >
                        {loadingAyrshare ? <Loader2 className="w-4 h-4 text-gold-500 animate-spin" /> : <Clock className="w-4 h-4 text-neutral-500 group-hover:text-gold-500" />}
                        <div className="text-left">
                            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-tighter">Last Intelligence Sync</p>
                            <p className="text-xs font-bold text-white uppercase">{ayrshareData?.isMock ? 'SimulationActive' : 'LiveStable'}</p>
                        </div>
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeClub && stats ? (
                    <motion.div
                        key={activeClub.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-16"
                    >
                        {/* Club Performance Section */}
                        {Object.values(activeClub.socialConnections || {}).every(conn => !conn.isConnected) ? (
                            <div className="bg-neutral-900/40 border border-gold-500/10 rounded-[2.5rem] p-12 text-center space-y-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                                        <Sparkles className="w-8 h-8 text-gold-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold text-white tracking-tight">Establish Social Connectivity</h4>
                                        <p className="text-neutral-500 text-sm max-w-sm mx-auto font-medium">Link your organization&apos;s accounts via Firebase to enable live tracker stability.</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button 
                                            onClick={() => handleFirebaseLink('google')}
                                            disabled={isConnecting}
                                            className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Globe className="w-4 h-4" /> Connect Google
                                        </button>
                                        <button 
                                            onClick={() => handleFirebaseLink('x')}
                                            disabled={isConnecting}
                                            className="px-6 py-3 bg-neutral-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Twitter className="w-4 h-4" /> Connect X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center text-black shadow-lg shadow-gold-500/10">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{activeClub.name} Performance</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Organization Metrics</p>
                                                <div className="h-1 w-1 rounded-full bg-green-500" />
                                                <span className="text-[8px] text-signature-gradient font-black uppercase tracking-widest">Firebase Linked</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleFirebaseLink('google')}
                                        className="px-4 py-2 border border-white/5 bg-black/40 rounded-xl text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all"
                                    >
                                        Manage Connections
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <MetricCard 
                                        label="Followers" 
                                        value={stats.followers.toLocaleString()} 
                                        icon={Users} 
                                        growth={stats.growth} 
                                    />
                                    <MetricCard 
                                        label="Engagement" 
                                        value={`${stats.engagement}%`} 
                                        icon={Heart} 
                                    />
                                    <MetricCard 
                                        label="Monthly Impressions" 
                                        value={`${(stats.reach / 1000).toFixed(1)}K`} 
                                        icon={BarChart3} 
                                    />
                                    <SocialMetricCard />
                                </div>
                            </div>
                        )}

                        {/* Personal Profile Analytics (Ayrshare) */}
                        <div className="space-y-8 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-center text-gold-500 shadow-xl">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                                            Ayrshare Intel <Sparkles className="w-4 h-4 text-gold-500" />
                                        </h3>
                                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Unified Profile Analytics</p>
                                    </div>
                                </div>
                                {ayrshareData?.isMock && (
                                    <div className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full">
                                        <span className="text-[8px] font-black text-signature-gradient uppercase tracking-widest">Mock Enabled</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard 
                                    label="Ayrshare Likes" 
                                    value={ayrshareData?.likes.toLocaleString() || "..."} 
                                    icon={Heart} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Ayrshare Shares" 
                                    value={ayrshareData?.shares.toLocaleString() || "..."} 
                                    icon={Share2} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Unified Impressions" 
                                    value={ayrshareData?.impressions.toLocaleString() || "..."} 
                                    icon={TrendingUp} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Follower Growth" 
                                    value={`+${ayrshareData?.followerGrowth || "0"}`} 
                                    icon={ArrowUpRight} 
                                    isAyrshare 
                                />
                            </div>
                        </div>

                        {/* Recent Activity Bar */}
                        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Live Tracker Active</span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <p className="text-[10px] font-bold text-neutral-500 uppercase">
                                    Universal Sync: <span className="text-white ml-1">{new Date(ayrshareData?.lastUpdated || "").toLocaleTimeString()}</span>
                                </p>
                            </div>
                            <button 
                                onClick={fetchAyrshare}
                                className="px-6 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-gold-500/30 transition-all"
                            >
                                Refresh Intelligence
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center py-20 text-neutral-500 italic text-sm">
                        Select an organization to view detailed analytics.
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    growth?: number;
    isAyrshare?: boolean;
}

function MetricCard({ label, value, icon: Icon, growth, isAyrshare }: MetricCardProps) {
    return (
        <div className={`p-8 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] hover:border-gold-500/20 transition-all group ${isAyrshare ? 'border-gold-500/5' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 bg-neutral-950 border border-white/5 rounded-xl flex items-center justify-center ${isAyrshare ? 'group-hover:text-signature-gradient' : ''}`}>
                    <Icon className="w-5 h-5 text-neutral-500 group-hover:text-gold-500 transition-colors" />
                </div>
                {growth !== undefined && (
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(growth)}%
                    </span>
                )}
            </div>
            <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white group-hover:text-signature-gradient transition-colors tracking-tight">{value}</p>
        </div>
    );
}

function SocialMetricCard() {
    return (
        <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] hover:border-gold-500/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Twitter className="w-4 h-4 text-sky-500" />
                    </div>
                </div>
            </div>
            <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">Active Portals</p>
            <p className="text-3xl font-black text-white">03</p>
        </div>
    );
}
