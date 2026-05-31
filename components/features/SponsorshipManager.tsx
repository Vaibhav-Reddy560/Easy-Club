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
    CheckCircle2,
    ChevronDown
} from "lucide-react";
import PremiumLoader from "@/components/ui/PremiumLoader";
import { Club, Sponsor, SponsorStage, SponsorTier, SponsorDeliverable } from "@/lib/types";
import { useTasks } from "@/lib/context/TaskContext";
import { exportToDocx } from "@/lib/utils/export-utils";

interface SponsorshipManagerProps {
    clubs: Club[];
    onUpdateClub: (updatedClub: Club) => void;
}

const STAGES: SponsorStage[] = ['Prospecting', 'Contacted', 'Negotiating', 'Closed'];
const TIERS: SponsorTier[] = ['Title', 'Platinum', 'Gold', 'Silver', 'In-Kind', 'Custom'];

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
    const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
    const { startTask, finishTask } = useTasks();

    // New lead form state
    const [newCompany, setNewCompany] = useState('');
    const [newCategory, setNewCategory] = useState('Technical');
    const [newTier, setNewTier] = useState<SponsorTier>('Custom');
    const [newValue, setNewValue] = useState('');
    const [newStage, setNewStage] = useState<SponsorStage>('Prospecting');
    const [newNotes, setNewNotes] = useState('');
    const [newPocName, setNewPocName] = useState('');
    const [newPocEmail, setNewPocEmail] = useState('');
    const [newPocPhone, setNewPocPhone] = useState('');

    const [isGeneratingMOU, setIsGeneratingMOU] = useState(false);

    const currentClub = clubs.find(c => c.id === selectedClubId);
    const sponsors = currentClub?.sponsors || [];

    // Derived stats from real data
    const totalRevenue = sponsors.filter(s => s.stage === 'Closed').reduce((acc, s) => acc + s.value, 0);
    const cashCollected = sponsors.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
    const pipelineValue = sponsors.filter(s => s.stage !== 'Closed').reduce((acc, s) => acc + s.value, 0);
    const activePartners = sponsors.filter(s => s.stage === 'Closed').length;

    const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    const handleAddLead = async () => {
        if (!currentClub || !newCompany.trim() || !newValue.trim()) return;

        const newSponsor: Sponsor = {
            id: Date.now().toString(),
            company: newCompany.trim(),
            category: newCategory,
            tier: newTier,
            value: parseInt(newValue.replace(/[^0-9]/g, ''), 10) || 0,
            amountPaid: 0,
            stage: newStage,
            addedAt: new Date().toISOString(),
            notes: newNotes.trim() || undefined,
            pocName: newPocName.trim() || undefined,
            pocEmail: newPocEmail.trim() || undefined,
            pocPhone: newPocPhone.trim() || undefined,
            deliverables: [],
        };

        const updatedClub: Club = {
            ...currentClub,
            sponsors: [...sponsors, newSponsor],
        };

        onUpdateClub(updatedClub);

        // Reset form
        setNewCompany('');
        setNewCategory('Technical');
        setNewTier('Custom');
        setNewValue('');
        setNewStage('Prospecting');
        setNewNotes('');
        setNewPocName('');
        setNewPocEmail('');
        setNewPocPhone('');
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
    };

    const handleDeleteLead = async (sponsorId: string) => {
        if (!currentClub) return;
        const updatedClub = { ...currentClub, sponsors: sponsors.filter(s => s.id !== sponsorId) };
        onUpdateClub(updatedClub);
    };

    const handleGenerateMOU = async (sponsor: Sponsor) => {
        if (!currentClub) return;
        setIsGeneratingMOU(true);
        const taskId = `mou-${sponsor.id}-${Date.now()}`;
        startTask(taskId, `Drafting MOU for ${sponsor.company}`);

        try {
            const event = sponsor.eventId ? currentClub.events?.find(e => e.id === sponsor.eventId) : undefined;
            const res = await fetch('/api/generate-mou', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ club: currentClub, sponsor, event }),
            });

            if (!res.ok) throw new Error("Failed to generate MOU");
            
            const data = await res.json();
            
            // Export to DOCX
            const filename = `${currentClub.name.replace(/\s+/g, '_')}_MOU_${sponsor.company.replace(/\s+/g, '_')}`;
            const blob = await exportToDocx(filename, data.content);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.docx`;
            a.click();
            URL.revokeObjectURL(url);
            
            finishTask(taskId, true);
        } catch (error) {
            console.error(error);
            finishTask(taskId, false);
        } finally {
            setIsGeneratingMOU(false);
        }
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
                <div className="w-20 h-20 bg-zinc-900 border border-white/15 rounded-full flex items-center justify-center animate-pulse">
                    <Banknote className="w-10 h-10 text-white/50" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Organizations for Funding</h3>
                    <p className="text-white text-sm max-w-xs mx-auto font-medium">Create a club to unlock the Sponsorship Pipeline Engine.</p>
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
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter py-2">
                        Funding X Sponsorship
                    </h2>
                    <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase">Raise funds and grow your treasury</p>
                </div>

                <div className="relative group min-w-[250px]">
                    <select
                        value={selectedClubId || ""}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                        className="w-full appearance-none bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500 cursor-pointer"
                    >
                        <option value="" disabled className="bg-black text-white">Select a Club</option>
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id} className="bg-black text-white">{club.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none group-hover:text-gold-500 transition-colors" />
                </div>
            </header>

            {/* Top Stats Row — Derived from real data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Revenue Closed", val: formatINR(totalRevenue), sub: `${activePartners} deal${activePartners !== 1 ? 's' : ''} closed`, icon: IndianRupee, color: "text-green-400" },
                    { label: "Cash Collected", val: formatINR(cashCollected), sub: "Actual received", icon: Banknote, color: "text-emerald-400" },
                    { label: "Pipeline Value", val: formatINR(pipelineValue), sub: "Weighted potential", icon: TrendingUp, color: "text-gold-400" },
                    { label: "Active Deals", val: String(sponsors.length), sub: "Across all stages", icon: Target, color: "text-blue-400" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 bg-[#050505] border border-white/15 rounded-[2rem] group hover:border-gold-500/20 transition-all shadow-xl">
                        <stat.icon className={`w-5 h-5 mb-4 ${stat.color}`} />
                        <p className="text-[10px] text-white font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white mb-2 font-destrubia">{stat.val}</p>
                        <p className="text-[9px] text-white font-bold uppercase tracking-tight">{stat.sub}</p>
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
                            <div key={p.stage} className="p-6 bg-black/60 border-2 border-white/15 rounded-3xl space-y-3 hover:border-white/30 hover:bg-black transition-all shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[p.stage]}`} />
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{p.stage}</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white font-destrubia">{p.count}</p>
                                    <p className="text-[9px] text-white font-bold uppercase font-destrubia">{formatINR(p.value)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Deals Table */}
                    <div className="bg-black/40 border-2 border-white/15 rounded-[2.5rem] overflow-hidden shadow-lg transition-all hover:border-white/30">
                        {sponsors.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                <Briefcase className="w-12 h-12 text-white/40" />
                                <p className="text-sm font-bold text-white uppercase tracking-[0.2em]">No leads yet</p>
                                <p className="text-[11px] text-zinc-300 max-w-sm tracking-wider font-medium">Click &ldquo;Add Lead&rdquo; above to log your first sponsorship deal.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-white text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Company</th>
                                        <th className="px-8 py-4">Tier</th>
                                        <th className="px-8 py-4">Value</th>
                                        <th className="px-8 py-4">Stage</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sponsors.map((deal) => (
                                        <tr key={deal.id} onClick={() => setSelectedSponsorId(deal.id)} className="hover:bg-white/5 transition-all group cursor-pointer">
                                            <td className="px-8 py-6 font-bold text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center group-hover:border-gold-500/50 transition-colors">
                                                        <Building2 className="w-4 h-4 text-white/50 group-hover:text-gold-500 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p>{deal.company}</p>
                                                        {deal.pocName ? (
                                                            <p className="text-[9px] text-zinc-400 font-normal mt-0.5">{deal.pocName}</p>
                                                        ) : deal.notes && (
                                                            <p className="text-[9px] text-zinc-400 font-normal line-clamp-1 mt-0.5">{deal.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-tight">{deal.tier || 'Custom'}</span>
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
                                                            onClick={(e) => { e.stopPropagation(); handleAdvanceStage(deal.id); }}
                                                            title={`Advance to ${STAGES[STAGES.indexOf(deal.stage) + 1]}`}
                                                            className="p-2 text-white hover:text-gold-500 transition-colors rounded-lg hover:bg-white/5"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteLead(deal.id); }}
                                                        title="Remove lead"
                                                        className="p-2 text-white/60 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
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
                        <p className="text-[11px] text-white font-medium leading-relaxed">
                            Your club&apos;s value proposition is dynamically generated from your real sponsor pipeline and event history.
                        </p>
                        <button
                            onClick={handleGenerateDeck}
                            disabled={isGeneratingDeck}
                            className="w-full py-4 bg-gold-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold-500/10 disabled:opacity-60"
                        >
                            {isGeneratingDeck ? (
                                <><PremiumLoader size="sm" dotCount={3} className="mr-1" /> Generating Deck...</>
                            ) : deckSuccess ? (
                                <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
                            ) : (
                                <><Download className="w-4 h-4" /> Download Pitch Deck</>
                            )}
                        </button>
                    </div>

                    {/* Smart Suggestions — derived from real pipeline data */}
                    <div className="p-8 bg-[#050505] border border-white/15 rounded-[3rem] space-y-6 shadow-2xl">
                        <h5 className="font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-gold-500" /> Smart Insights
                        </h5>
                        <div className="space-y-4">
                            {sponsors.length === 0 && (
                                <p className="text-[10px] text-white font-medium">Add your first lead to unlock intelligent pipeline insights.</p>
                            )}
                            {sponsors.filter(s => s.stage === 'Prospecting').length > 0 && (
                                <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 border-blue-500/10 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white">{sponsors.filter(s => s.stage === 'Prospecting').length} leads need first contact</p>
                                        <p className="text-[9px] text-white mt-1 font-medium">Move them to &ldquo;Contacted&rdquo; after your outreach.</p>
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
                                        <p className="text-[9px] text-white mt-1 font-medium">Close these deals to hit your revenue targets.</p>
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
                                        <p className="text-[9px] text-white mt-1 font-medium">Great work! Download your pitch deck to attract more.</p>
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
                                    <p className="text-white text-xs mt-1">Log a new potential partnership for {currentClub?.name}</p>
                                </div>
                                <button onClick={() => setIsAddingLead(false)} className="text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Company Name *</label>
                                    <input
                                        type="text"
                                        value={newCompany}
                                        onChange={e => setNewCompany(e.target.value)}
                                        placeholder="e.g. Google Cloud, Red Bull..."
                                        autoFocus
                                        className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Category</label>
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={e => setNewCategory(e.target.value)}
                                            placeholder="Technical, EdTech..."
                                            className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Deal Value (₹) *</label>
                                        <input
                                            type="number"
                                            value={newValue}
                                            onChange={e => setNewValue(e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Sponsor Tier</label>
                                        <div className="relative group">
                                            <select
                                                value={newTier}
                                                onChange={e => setNewTier(e.target.value as SponsorTier)}
                                                className="w-full appearance-none bg-black border border-white/15 rounded-2xl px-4 py-3 pr-10 text-sm text-white focus:border-gold-500/50 outline-none transition-all cursor-pointer"
                                            >
                                                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Stage</label>
                                        <div className="relative group">
                                            <select
                                                value={newStage}
                                                onChange={e => setNewStage(e.target.value as SponsorStage)}
                                                className="w-full appearance-none bg-black border border-white/15 rounded-2xl px-4 py-3 pr-10 text-sm text-white focus:border-gold-500/50 outline-none transition-all cursor-pointer"
                                            >
                                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-signature-gradient">Point of Contact (CRM)</h4>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">POC Name</label>
                                        <input
                                            type="text"
                                            value={newPocName}
                                            onChange={e => setNewPocName(e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">POC Email</label>
                                            <input
                                                type="email"
                                                value={newPocEmail}
                                                onChange={e => setNewPocEmail(e.target.value)}
                                                placeholder="jane@company.com"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">POC Phone</label>
                                            <input
                                                type="tel"
                                                value={newPocPhone}
                                                onChange={e => setNewPocPhone(e.target.value)}
                                                placeholder="+91..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white mb-2 block">Notes (optional)</label>
                                    <input
                                        type="text"
                                        value={newNotes}
                                        onChange={e => setNewNotes(e.target.value)}
                                        placeholder="Any context..."
                                        className="w-full bg-black border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setIsAddingLead(false)}
                                    className="flex-1 py-4 border border-white/15 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all"
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

            {/* Sponsor CRM Detail Modal */}
            <AnimatePresence>
                {selectedSponsorId && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSponsorId(null)}>
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-xl h-full bg-[#0a0a0a] border-l border-white/10 p-8 overflow-y-auto custom-scrollbar flex flex-col"
                        >
                            {(() => {
                                const sponsor = sponsors.find(s => s.id === selectedSponsorId);
                                if (!sponsor) return null;
                                return (
                                    <div className="space-y-8 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${STAGE_COLORS[sponsor.stage]}`}>
                                                        {sponsor.stage}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{sponsor.tier || 'Custom'} Tier</span>
                                                </div>
                                                <h3 className="text-3xl font-bold text-white">{sponsor.company}</h3>
                                                <p className="text-xs text-zinc-400 mt-1">{sponsor.category}</p>
                                            </div>
                                            <button onClick={() => setSelectedSponsorId(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-black border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Deal Value</p>
                                                <p className="text-xl font-bold text-white font-destrubia">{formatINR(sponsor.value)}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-black border border-gold-500/20">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gold-500 mb-1">Amount Received</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-white font-destrubia">₹</span>
                                                    <input 
                                                        type="number"
                                                        value={sponsor.amountPaid || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value, 10) || 0;
                                                            const updated = { ...sponsor, amountPaid: val };
                                                            const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                            if (currentClub) onUpdateClub(updatedClub as Club);
                                                        }}
                                                        className="w-full bg-transparent text-xl font-bold text-white font-destrubia outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-signature-gradient">Point of Contact</h4>
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={sponsor.pocName || ''}
                                                        onChange={(e) => {
                                                            const updated = { ...sponsor, pocName: e.target.value };
                                                            const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                            if (currentClub) onUpdateClub(updatedClub as Club);
                                                        }}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-gold-500/30"
                                                        placeholder="Add POC Name"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Email</label>
                                                        <input 
                                                            type="email" 
                                                            value={sponsor.pocEmail || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...sponsor, pocEmail: e.target.value };
                                                                const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                                if (currentClub) onUpdateClub(updatedClub as Club);
                                                            }}
                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-gold-500/30"
                                                            placeholder="Add Email"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Phone</label>
                                                        <input 
                                                            type="tel" 
                                                            value={sponsor.pocPhone || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...sponsor, pocPhone: e.target.value };
                                                                const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                                if (currentClub) onUpdateClub(updatedClub as Club);
                                                            }}
                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-gold-500/30"
                                                            placeholder="Add Phone"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Deliverables Checklist</h4>
                                                <button 
                                                    onClick={() => {
                                                        const newDeliverable = { id: Date.now().toString(), text: "New Deliverable", completed: false };
                                                        const updated = { ...sponsor, deliverables: [...(sponsor.deliverables || []), newDeliverable] };
                                                        const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                        if (currentClub) onUpdateClub(updatedClub as Club);
                                                    }}
                                                    className="text-[9px] font-bold text-gold-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Item
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(!sponsor.deliverables || sponsor.deliverables.length === 0) && (
                                                    <p className="text-xs text-zinc-500 italic py-4">No deliverables added yet. Add items promised to the sponsor to track fulfillment.</p>
                                                )}
                                                {sponsor.deliverables?.map(del => (
                                                    <div key={del.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                                                        <button 
                                                            onClick={() => {
                                                                const updatedDels = sponsor.deliverables!.map(d => d.id === del.id ? { ...d, completed: !d.completed } : d);
                                                                const updated = { ...sponsor, deliverables: updatedDels };
                                                                const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                                if (currentClub) onUpdateClub(updatedClub as Club);
                                                            }}
                                                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${del.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/20 hover:border-white/40 text-transparent'}`}
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        </button>
                                                        <input 
                                                            type="text"
                                                            value={del.text}
                                                            onChange={(e) => {
                                                                const updatedDels = sponsor.deliverables!.map(d => d.id === del.id ? { ...d, text: e.target.value } : d);
                                                                const updated = { ...sponsor, deliverables: updatedDels };
                                                                const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                                if (currentClub) onUpdateClub(updatedClub as Club);
                                                            }}
                                                            className={`flex-1 bg-transparent text-sm outline-none ${del.completed ? 'text-zinc-500 line-through' : 'text-white'}`}
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const updatedDels = sponsor.deliverables!.filter(d => d.id !== del.id);
                                                                const updated = { ...sponsor, deliverables: updatedDels };
                                                                const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                                if (currentClub) onUpdateClub(updatedClub as Club);
                                                            }}
                                                            className="text-white/20 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-signature-gradient">Formal Agreement</h4>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">Link to Event (Optional)</label>
                                                <div className="relative group">
                                                    <select
                                                        value={sponsor.eventId || ""}
                                                        onChange={(e) => {
                                                            const updated = { ...sponsor, eventId: e.target.value || undefined };
                                                            const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                            if (currentClub) onUpdateClub(updatedClub as Club);
                                                        }}
                                                        className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:border-gold-500/30 outline-none transition-all cursor-pointer"
                                                    >
                                                        <option value="">General Club Sponsorship</option>
                                                        {currentClub?.events?.map(ev => (
                                                            <option key={ev.id} value={ev.id}>{(ev.config as any)?.name || 'Unnamed Event'}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleGenerateMOU(sponsor)}
                                                disabled={isGeneratingMOU}
                                                className="w-full py-4 bg-gold-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold-500/10 disabled:opacity-60"
                                            >
                                                {isGeneratingMOU ? (
                                                    <><PremiumLoader size="sm" dotCount={3} className="mr-1" /> Drafting MOU...</>
                                                ) : (
                                                    <><FileText className="w-4 h-4" /> Generate Formal MOU</>
                                                )}
                                            </button>

                                            {sponsor.stage !== 'Closed' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updated = { ...sponsor, stage: 'Closed' as SponsorStage };
                                                        const updatedClub = { ...currentClub, sponsors: sponsors.map(s => s.id === sponsor.id ? updated : s) };
                                                        if (currentClub) onUpdateClub(updatedClub as Club);
                                                    }}
                                                    className="w-full py-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Mark as Funding Received
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
