"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Banknote,
    Target,
    Briefcase,
    TrendingUp,
    FileText,
    Download,
    ChevronRight,
    CircleAlert,
    Building2,
    IndianRupee,
    Sparkles
} from "lucide-react";
import { Club } from "@/lib/types";

interface SponsorshipManagerProps {
    clubs: Club[];
}

export default function SponsorshipManager({ clubs }: SponsorshipManagerProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);

    // Simulated Pipeline States
    const pipeline = [
        { stage: "Prospecting", count: 12, value: "₹4,50,000", color: "blue" },
        { stage: "Contacted", count: 8, value: "₹2,80,000", color: "purple" },
        { stage: "Negotiating", count: 3, value: "₹1,20,000", color: "gold" },
        { stage: "Closed", count: 5, value: "₹2,00,000", color: "green" },
    ];

    // const currentClub = clubs.find(c => c.id === selectedClubId);

    if (clubs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <Banknote className="w-10 h-10 text-neutral-700" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Organizations for Funding</h3>
                    <p className="text-neutral-500 text-sm max-w-xs mx-auto font-medium">Create a club to unlock the Sponsorship Pipeline Engine.</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter flex items-center gap-3">
                        Funding Forge
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1 uppercase font-bold tracking-widest">Sponsorship Pipeline & Financial Resource Manager</p>
                </div>

                <div className="flex gap-2 p-1 bg-neutral-900/60 rounded-2xl border border-white/5">
                    {clubs.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedClubId(c.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedClubId === c.id
                                ? "bg-gold-500 text-black shadow-gold-glow"
                                : "text-neutral-500 hover:text-white"
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", val: "₹2,00,000", sub: "+12% from last event", icon: IndianRupee, color: "text-green-400" },
                    { label: "Target Funding", val: "₹10,50,000", sub: "Goal for 2024", icon: Target, color: "text-blue-400" },
                    { label: "Pipeline Value", val: "₹8,50,000", sub: "Weighted potential", icon: TrendingUp, color: "text-gold-400" },
                    { label: "Active Partners", val: "15", sub: "Global Organizations", icon: Building2, color: "text-purple-400" },
                ].map((stat: { label: string; val: string; sub: string; icon: any; color: string }, i) => (
                    <div key={i} className="p-8 bg-neutral-900/40 border border-white/5 rounded-[2rem] group hover:border-gold-500/20 transition-all">
                        <stat.icon className={`w-5 h-5 mb-4 ${stat.color}`} />
                        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white mb-2">{stat.val}</p>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-tight">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sponsorship Pipeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-gold-500" /> Active Deals Pipeline
                        </h4>
                        <button className="text-[10px] font-black text-signature-gradient uppercase tracking-widest hover:underline flex items-center gap-1">
                            Add Lead <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {pipeline.map((p) => (
                            <div key={p.stage} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${p.color === 'blue' ? 'bg-blue-500' :
                                        p.color === 'purple' ? 'bg-purple-500' :
                                            p.color === 'gold' ? 'bg-gold-500' : 'bg-green-500'
                                        }`} />
                                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-tighter">{p.stage}</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{p.count}</p>
                                    <p className="text-[9px] text-neutral-600 font-bold uppercase">{p.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Company</th>
                                    <th className="px-8 py-4">Category</th>
                                    <th className="px-8 py-4">Value</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { name: "Google Cloud", cat: "Technical", val: "₹1,50,000", status: "Negotiating", icon: Building2 },
                                    { name: "Red Bull", cat: "Beverage", val: "₹50,000", status: "Closed", icon: Sparkles },
                                    { name: "Byju's", cat: "EdTech", val: "₹2,00,000", status: "Prospecting", icon: Briefcase },
                                ].map((deal) => (
                                    <tr key={deal.name} className="hover:bg-white/5 transition-all group">
                                        <td className="px-8 py-6 font-bold text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center">
                                                    <deal.icon className="w-4 h-4 text-neutral-500" />
                                                </div>
                                                {deal.name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{deal.cat}</span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-white">{deal.val}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${deal.status === 'Closed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                deal.status === 'Negotiating' ? 'bg-gold-500/10 border-gold-500/20 text-signature-gradient' :
                                                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}>
                                                {deal.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resource Center */}
                <div className="space-y-8">
                    <div className="p-8 bg-gold-500/5 border border-gold-500/20 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                                <FileText className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-white">Sponsorship Deck</h5>
                                <p className="text-[10px] text-signature-gradient font-black uppercase tracking-widest">AI Content Ready</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                            Your club&apos;s value proposition is automatically generated based on your past event success and social reach.
                        </p>
                        <button className="w-full py-4 bg-gold-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold-500/10">
                            Download Pitch Deck <Download className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-[3rem] space-y-6">
                        <h5 className="font-bold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" /> Smart Suggestions
                        </h5>
                        <div className="space-y-4">
                            {[
                                { title: "Draft Proposal for PepsiCo", desc: "Based on your recent Sports Event trending status." },
                                { title: "Update Budget Sheet", desc: "Expenses have exceeded sponsorship for Hackathon." },
                                { title: "Retainer Opportunity", desc: "TechSpark is looking for annual partners." },
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-blue-500/30 cursor-pointer transition-all">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <CircleAlert className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white group-hover:text-blue-100">{tip.title}</p>
                                        <p className="text-[9px] text-neutral-600 mt-1 font-medium">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
