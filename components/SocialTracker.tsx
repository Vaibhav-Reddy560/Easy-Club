"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChartBar, 
    TrendingUp, 
    Activity,
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

    const handleConnectSocial = async () => {
        setIsConnecting(true);
        try {
            const response = await fetch("/api/social-link");
            if (!response.ok) throw new Error("Connection protocol failed");
            const data = await response.json();
            
            if (!data.token) throw new Error("No connectivity token received");

            // Open the Ayrshare Social Link window
            const width = 600;
            const height = 800;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            
            const url = `https://social.ayrshare.com/${data.token}`;
            window.open(
                url, 
                'Ayrshare Social Link', 
                `width=${width},height=${height},left=${left},top=${top}`
            );

        } catch (err: unknown) {
            console.error(err);
            const error = err as Error;
            alert("Linking Failed: " + (error.message || "Check your API keys"));
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        fetchAyrshare();
    }, [selectedClubId]);

    // Simulated stats for each club
    const getStats = () => {
        return {
            followers: ayrshareData?.isMock ? 0 : (ayrshareData?.followerGrowth || 0),
            engagement: ayrshareData?.isMock ? 0.0 : (((ayrshareData?.likes || 0) + (ayrshareData?.shares || 0)) / (ayrshareData?.impressions || 1)) * 100,
            growth: ayrshareData?.isMock ? 0 : (ayrshareData?.followerGrowth || 0),
            reach: ayrshareData?.isMock ? 0 : (ayrshareData?.impressions || 0),
            posts: ayrshareData?.isMock ? 0 : 0
        };
    };

    const activeClub = clubs.find(c => c.id === selectedClubId);

    if (clubs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                <div className="w-20 h-20 bg-zinc-900 border border-white/15 rounded-full flex items-center justify-center animate-pulse">
                    <ChartBar className="w-10 h-10 text-white/50" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Organizations Established</h3>
                    <p className="text-white text-sm max-w-xs mx-auto font-medium">Create a club in the &quot;My Clubs&quot; section to start tracking social performance.</p>
                </div>
            </div>
        );
    }

    const stats = activeClub ? getStats() : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">
                            Social Tracker
                        </h2>
                        <p className="text-zinc-100 text-[10px] mt-1 uppercase font-bold tracking-[0.2em]">Track your social media performance</p>
                    </div>

                    {/* Club Switcher */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/15">
                        {clubs.map((club) => (
                            <button
                                key={club.id}
                                onClick={() => setSelectedClubId(club.id)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedClubId === club.id ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/10' : 'text-white hover:text-secondary-foreground'}`}
                            >
                                {club.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={fetchAyrshare}
                        className="px-5 py-3 bg-[#050505] border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-black transition-all group"
                    >
                        {loadingAyrshare ? <Loader2 className="w-4 h-4 text-gold-500 animate-spin" /> : <Clock className="w-4 h-4 text-white/60 group-hover:text-gold-500" />}
                        <div className="text-left">
                            <p className="text-[8px] text-white font-black uppercase tracking-tighter">Last Intelligence Sync</p>
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
                            <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-12 text-center space-y-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                                        <Sparkles className="w-8 h-8 text-gold-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold text-white tracking-tight">Establish Social Connectivity</h4>
                                        <p className="text-white text-xs font-medium">Post visibility and profile growth are currently optimal.</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button 
                                            onClick={handleConnectSocial}
                                            disabled={isConnecting}
                                            className="px-8 py-4 bg-gold-gradient text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-3 shadow-gold-glow"
                                        >
                                            <Zap className="w-4 h-4" /> Initialize Social Link
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
                                                 <p className="text-[9px] text-white font-bold uppercase tracking-widest">Organization Metrics</p>
                                                 <div className="h-1 w-1 rounded-full bg-green-500" />
                                                 <span className="text-[8px] text-signature-gradient font-black uppercase tracking-widest">Firebase Linked</span>
                                             </div>
                                         </div>
                                     </div>
                                     <button 
                                         onClick={handleConnectSocial}
                                         className="px-4 py-2 border border-white/15 bg-black/40 rounded-xl text-[8px] font-black uppercase tracking-widest text-white hover:text-white transition-all underline decoration-gold-500/30"
                                     >
                                         Manage Protocols
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
                                         value={`${stats.engagement.toFixed(1)}%`} 
                                         icon={Heart} 
                                     />
                                     <MetricCard 
                                         label="Monthly Impressions" 
                                         value={`${(stats.reach / 1000).toFixed(1)}K`} 
                                         icon={ChartBar} 
                                     />
                                     <SocialMetricCard />
                                 </div>
                            </div>
                        )}

                        {/* Personal Profile Analytics (Ayrshare) */}
                        <div className="space-y-8 pt-8 border-t border-white/15">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-900 border border-white/15 rounded-xl flex items-center justify-center text-gold-500 shadow-xl">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                                            Ayrshare Intel <Sparkles className="w-4 h-4 text-gold-500" />
                                        </h3>
                                        <p className="text-[9px] text-white font-bold uppercase tracking-widest">Unified Profile Analytics</p>
                                    </div>
                                </div>
                                {ayrshareData?.isMock && (
                                    <div className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full">
                                        <span className="text-[8px] font-black text-signature-gradient uppercase tracking-widest">Mock Enabled</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                <MetricCard 
                                    label="Ayrshare Likes" 
                                    value={ayrshareData?.likes !== undefined ? ayrshareData.likes.toLocaleString() : "..."} 
                                    icon={Heart} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Ayrshare Shares" 
                                    value={ayrshareData?.shares !== undefined ? ayrshareData.shares.toLocaleString() : "..."} 
                                    icon={Share2} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Total Interactions" 
                                    value={ayrshareData ? ((ayrshareData.likes || 0) + (ayrshareData.shares || 0)).toLocaleString() : "..."} 
                                    icon={Activity} 
                                    color="text-emerald-400"
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Unified Impressions" 
                                    value={ayrshareData?.impressions !== undefined ? ayrshareData.impressions.toLocaleString() : "..."} 
                                    icon={TrendingUp} 
                                    isAyrshare 
                                />
                                <MetricCard 
                                    label="Follower Growth" 
                                    value={ayrshareData?.followerGrowth !== undefined ? `+${ayrshareData.followerGrowth}` : "..."} 
                                    icon={ArrowUpRight} 
                                    isAyrshare 
                                />
                            </div>
                        </div>

                        {/* Recent Activity Bar */}
                        <div className="bg-black/40 border border-white/15 rounded-3xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Live Tracker Active</span>
                                </div>
                                <div className="h-4 w-px bg-white/15" />
                                <p className="text-[10px] font-bold text-white uppercase">
                                    Universal Sync: <span className="text-white ml-1">{new Date(ayrshareData?.lastUpdated || "").toLocaleTimeString()}</span>
                                </p>
                            </div>
                            <button 
                                onClick={fetchAyrshare}
                                className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:text-white hover:border-gold-500/30 transition-all"
                            >
                                Refresh Intelligence
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center py-20 text-white italic text-sm">
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
    color?: string;
    isAyrshare?: boolean;
}

function MetricCard({ label, value, icon: Icon, growth, color, isAyrshare }: MetricCardProps) {
    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className={`p-8 glass-card rounded-[2.5rem] group ${isAyrshare ? 'border-gold-500/15' : ''}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 bg-zinc-950 border border-white/15 rounded-xl flex items-center justify-center ${isAyrshare ? 'group-hover:shadow-[0_0_15px_rgba(255,165,0,0.2)]' : ''}`}>
                    <Icon className={`w-5 h-5 ${color || 'text-white/40'} group-hover:text-gold-500 transition-colors`} />
                </div>
                {growth !== undefined && (
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(growth)}%
                    </span>
                )}
            </div>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white group-hover:text-signature-gradient transition-colors tracking-tight">{value}</p>
        </motion.div>
    );
}

function SocialMetricCard() {
    return (
        <div className="p-8 bg-[#050505] border border-white/15 rounded-[2.5rem] hover:border-gold-500/20 transition-all group shadow-xl">
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
            <p className="text-[10px] text-white font-black uppercase tracking-widest mb-1">Active Portals</p>
            <p className="text-3xl font-black text-white">03</p>
        </div>
    );
}
