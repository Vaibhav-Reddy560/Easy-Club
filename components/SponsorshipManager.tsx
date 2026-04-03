"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Banknote,
    Target,
    Briefcase,
    TrendingUp,
    FileText,
    Download,
    ChevronRight,
    Building2,
    IndianRupee,
    Sparkles,
    Plus,
    X,
    Trash2,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Club, Sponsor, SponsorStage } from "@/lib/types";
import { useTasks } from "@/lib/TaskContext";
import { exportToDocx } from "@/lib/export-utils";
import { saveClub } from "@/lib/db";

interface SponsorshipManagerProps {
    clubs: Club[];
    onUpdateClub: (updatedClub: Club) => void;
}

const STAGES: SponsorStage[] = ['Prospecting', 'Contacted', 'Negotiating', 'Closed'];

const STAGE_COLORS: Record<SponsorStage, string> = {
    Prospecting: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    Contacted: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    Negotiating: 'bg-gold-500/10 border-gold-500/20 text-signature-gradient',
    Closed: 'bg-green-500/10 border-green-500/20 text-green-400',
};

const STAGE_DOT: Record<SponsorStage, string> = {
    Prospecting: 'bg-blue-500',
    Contacted: 'bg-purple-500',
    Negotiating: 'bg-gold-500',
    Closed: 'bg-green-500',
};

export default function SponsorshipManager({ clubs, onUpdateClub }: SponsorshipManagerProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
    const [isAddingLead, setIsAddingLead] = useState(false);
    const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
    const [deckSuccess, setDeckSuccess] = useState(false);
    const { startTask, finishTask } = useTasks();

    // New lead form state
    const [newCompany, setNewCompany] = useState('');
    const [newCategory, setNewCategory] = useState('Technical');
    const [newValue, setNewValue] = useState('');
    const [newStage, setNewStage] = useState<SponsorStage>('Prospecting');
    const [newNotes, setNewNotes] = useState('');

    const currentClub = clubs.find(c => c.id === selectedClubId);
    const sponsors = currentClub?.sponsors || [];

    // Derived stats from real data
    const totalRevenue = sponsors.filter(s => s.stage === 'Closed').reduce((acc, s) => acc + s.value, 0);
    const pipelineValue = sponsors.filter(s => s.stage !== 'Closed').reduce((acc, s) => acc + s.value, 0);
    const activePartners = sponsors.filter(s => s.stage === 'Closed').length;

    const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    const handleAddLead = async () => {
        if (!currentClub || !newCompany.trim() || !newValue.trim()) return;

        const newSponsor: Sponsor = {
            id: Date.now().toString(),
            company: newCompany.trim(),
            category: newCategory,
            value: parseInt(newValue.replace(/[^0-9]/g, ''), 10) || 0,
            stage: newStage,
            addedAt: new Date().toISOString(),
            notes: newNotes.trim() || undefined,
        };

        const updatedClub: Club = {
            ...currentClub,
            sponsors: [...sponsors, newSponsor],
        };

        onUpdateClub(updatedClub);
        await saveClub(updatedClub as Club & { ownerId: string });

        // Reset form
        setNewCompany('');
        setNewCategory('Technical');
        setNewValue('');
        setNewStage('Prospecting');
        setNewNotes('');
        setIsAddingLead(false);
    };

    const handleAdvanceStage = async (sponsorId: string) => {
        if (!currentClub) return;
        const updatedSponsors = sponsors.map(s => {
            if (s.id !== sponsorId) return s;
            const idx = STAGES.indexOf(s.stage);
            if (idx >= STAGES.length - 1) return s; // Already Closed
            return { ...s, stage: STAGES[idx + 1] };
        });
        const updatedClub = { ...currentClub, sponsors: updatedSponsors };
        onUpdateClub(updatedClub);
        await saveClub(updatedClub as Club & { ownerId: string });
    };

    const handleDeleteLead = async (sponsorId: string) => {
        if (!currentClub) return;
        const updatedClub = { ...currentClub, sponsors: sponsors.filter(s => s.id !== sponsorId) };
        onUpdateClub(updatedClub);
        await saveClub(updatedClub as Club & { ownerId: string });
    };

    const handleGenerateDeck = async () => {
        if (!currentClub) return;
        setIsGeneratingDeck(true);
        setDeckSuccess(false);
        const taskId = 'pitch-' + currentClub.id;
        startTask(taskId, `Generating Pitch Deck for ${currentClub.name}`);

        try {
            const response = await fetch('/api/generate-pitch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ club: currentClub, sponsors }),
            });
            if (!response.ok) throw new Error("Pitch generation failed");
            const data = await response.json();
            const blob = await exportToDocx(`${currentClub.name} — Sponsorship Pitch Deck`, data.content);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentClub.name}-Pitch-Deck.docx`;
            a.click();
            URL.revokeObjectURL(url);
            setDeckSuccess(true);
            finishTask(taskId, true);
            setTimeout(() => setDeckSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            finishTask(taskId, false);
        } finally {
            setIsGeneratingDeck(false);
        }
    };

    // Pipeline counts by stage
    const pipelineByStage = STAGES.map(stage => ({
        stage,
        count: sponsors.filter(s => s.stage === stage).length,
        value: sponsors.filter(s => s.stage === stage).reduce((acc, s) => acc + s.value, 0),
    }));

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
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Funding Forge</h2>
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

            {/* Top Stats Row — Derived from real data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Revenue Closed", val: formatINR(totalRevenue), sub: `${activePartners} deal${activePartners !== 1 ? 's' : ''} closed`, icon: IndianRupee, color: "text-green-400" },
                    { label: "Pipeline Value", val: formatINR(pipelineValue), sub: "Weighted potential", icon: TrendingUp, color: "text-gold-400" },
                    { label: "Active Partners", val: String(activePartners), sub: "Closed partnerships", icon: Building2, color: "text-purple-400" },
                    { label: "Total Leads", val: String(sponsors.length), sub: "Across all stages", icon: Target, color: "text-blue-400" },
                ].map((stat, i) => (
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
                        <button
                            onClick={() => setIsAddingLead(true)}
                            className="text-[10px] font-black text-signature-gradient uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Lead
                        </button>
                    </div>

                    {/* Stage Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {pipelineByStage.map((p) => (
                            <div key={p.stage} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[p.stage]}`} />
                                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-tighter">{p.stage}</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{p.count}</p>
                                    <p className="text-[9px] text-neutral-600 font-bold uppercase">{formatINR(p.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Deals Table */}
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                        {sponsors.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <Briefcase className="w-10 h-10 text-neutral-700" />
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">No leads yet</p>
                                <p className="text-[9px] text-neutral-700 max-w-xs">Click &ldquo;Add Lead&rdquo; above to log your first sponsorship deal.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Company</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Value</th>
                                        <th className="px-8 py-4">Stage</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sponsors.map((deal) => (
                                        <tr key={deal.id} className="hover:bg-white/5 transition-all group">
                                            <td className="px-8 py-6 font-bold text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-neutral-500" />
                                                    </div>
                                                    <div>
                                                        <p>{deal.company}</p>
                                                        {deal.notes && <p className="text-[9px] text-neutral-600 font-normal line-clamp-1">{deal.notes}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{deal.category}</span>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-white">{formatINR(deal.value)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${STAGE_COLORS[deal.stage]}`}>
                                                    {deal.stage}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {deal.stage !== 'Closed' && (
                                                        <button
                                                            onClick={() => handleAdvanceStage(deal.id)}
                                                            title={`Advance to ${STAGES[STAGES.indexOf(deal.stage) + 1]}`}
                                                            className="p-2 text-neutral-500 hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteLead(deal.id)}
                                                        title="Remove lead"
                                                        className="p-2 text-neutral-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Resource Center */}
                <div className="space-y-8">
                    {/* Pitch Deck Generator */}
                    <div className="p-8 bg-gold-500/5 border border-gold-500/20 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                                <FileText className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-white">Sponsorship Deck</h5>
                                <p className="text-[10px] text-signature-gradient font-black uppercase tracking-widest">AI Generated</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                            Your club&apos;s value proposition is dynamically generated from your real sponsor pipeline and event history.
                        </p>
                        <button
                            onClick={handleGenerateDeck}
                            disabled={isGeneratingDeck}
                            className="w-full py-4 bg-gold-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold-500/10 disabled:opacity-60"
                        >
                            {isGeneratingDeck ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Deck...</>
                            ) : deckSuccess ? (
                                <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
                            ) : (
                                <><Download className="w-4 h-4" /> Download Pitch Deck</>
                            )}
                        </button>
                    </div>

                    {/* Smart Suggestions — derived from real pipeline data */}
                    <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-[3rem] space-y-6">
                        <h5 className="font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-gold-500" /> Smart Insights
                        </h5>
                        <div className="space-y-4">
                            {sponsors.length === 0 && (
                                <p className="text-[10px] text-neutral-600 font-medium">Add your first lead to unlock intelligent pipeline insights.</p>
                            )}
                            {sponsors.filter(s => s.stage === 'Prospecting').length > 0 && (
                                <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 border-blue-500/10 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white">{sponsors.filter(s => s.stage === 'Prospecting').length} leads need first contact</p>
                                        <p className="text-[9px] text-neutral-600 mt-1 font-medium">Move them to &ldquo;Contacted&rdquo; after your outreach.</p>
                                    </div>
                                </div>
                            )}
                            {sponsors.filter(s => s.stage === 'Negotiating').length > 0 && (
                                <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-gold-500/10 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-4 h-4 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white">{formatINR(sponsors.filter(s => s.stage === 'Negotiating').reduce((a, s) => a + s.value, 0))} in active negotiation</p>
                                        <p className="text-[9px] text-neutral-600 mt-1 font-medium">Close these deals to hit your revenue targets.</p>
                                    </div>
                                </div>
                            )}
                            {totalRevenue > 0 && (
                                <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-green-500/10 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white">{formatINR(totalRevenue)} successfully secured</p>
                                        <p className="text-[9px] text-neutral-600 mt-1 font-medium">Great work! Download your pitch deck to attract more.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Lead Modal */}
            <AnimatePresence>
                {isAddingLead && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-[#121212] border border-gold-500/20 rounded-[2.5rem] p-10 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Add Sponsor Lead</h3>
                                    <p className="text-neutral-500 text-xs mt-1">Log a new potential partnership for {currentClub?.name}</p>
                                </div>
                                <button onClick={() => setIsAddingLead(false)} className="text-neutral-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Company Name *</label>
                                    <input
                                        type="text"
                                        value={newCompany}
                                        onChange={e => setNewCompany(e.target.value)}
                                        placeholder="e.g. Google Cloud, Red Bull..."
                                        autoFocus
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Category</label>
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={e => setNewCategory(e.target.value)}
                                            placeholder="Technical, EdTech..."
                                            className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Deal Value (₹) *</label>
                                        <input
                                            type="number"
                                            value={newValue}
                                            onChange={e => setNewValue(e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Stage</label>
                                    <div className="flex gap-2 p-1 bg-black border border-white/10 rounded-2xl">
                                        {STAGES.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setNewStage(s)}
                                                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${newStage === s ? 'bg-gold-500 text-black' : 'text-neutral-500 hover:text-white'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Notes (optional)</label>
                                    <input
                                        type="text"
                                        value={newNotes}
                                        onChange={e => setNewNotes(e.target.value)}
                                        placeholder="Any context, contact name, etc."
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setIsAddingLead(false)}
                                    className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLead}
                                    disabled={!newCompany.trim() || !newValue.trim()}
                                    className="flex-1 py-4 bg-gold-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50"
                                >
                                    Log Lead
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
