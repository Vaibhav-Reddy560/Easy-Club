"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    UsersRound, 
    UserPlus, 
    History, 
    Shield, 
    Clock, 
    Check, 
    X, 
    Mail, 
    Copy,
    ArrowRight,
    Search,
    LayoutDashboard,
    FileText,
    Palette,
    Share2,
    Info,
    Trash2,
    ChevronDown
} from "lucide-react";
import { Club, MemberRole, TeamInvite, ActivityLogEvent, ClubMember } from "@/lib/types";
import { saveClub } from "@/lib/db";

interface MyTeamViewProps {
    clubs: Club[];
    setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
}

export default function MyTeamView({ clubs, setClubs }: MyTeamViewProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
    
    // Automatically select the first club if available and none selected
    React.useEffect(() => {
        if (!selectedClubId && clubs.length > 0) {
            setSelectedClubId(clubs[0].id);
        }
    }, [clubs, selectedClubId]);

    const activeClub = clubs.find(c => c.id === selectedClubId);

    const onUpdateClub = async (updatedClub: Club) => {
        if (!selectedClubId) return;
        const newClubs = clubs.map(c => c.id === selectedClubId ? updatedClub : c);
        setClubs(newClubs);
        
        const activeC = newClubs.find(c => c.id === selectedClubId);
        if (activeC && activeC.ownerId) {
            void saveClub(activeC as Club & { ownerId: string });
        }
    };

    const [activeTab, setActiveTab] = useState<'roster' | 'invites' | 'activity'>('roster');
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>('Junior Core');

    const [searchQuery, setSearchQuery] = useState("");
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!activeClub || clubs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <UsersRound className="w-16 h-16 text-neutral-800 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">No Clubs Established</h3>
                <p className="text-neutral-500 text-sm">Create a club to manage your team.</p>
            </div>
        );
    }

    const members = (activeClub.members || []).filter(m => m.role !== 'General Member');
    const invites = activeClub.invites || [];
    const activityLog = activeClub.activityLog || [];

    const handleRemoveConfirm = () => {
        if (!memberToRemove) return;
        onUpdateClub({
            ...activeClub,
            members: activeClub.members?.filter(m => m.id !== memberToRemove) || []
        });
        setMemberToRemove(null);
    };

    const handleCopyLink = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        const newInvite: TeamInvite = {
            id: Math.random().toString(36).substr(2, 9),
            email: inviteEmail,
            role: inviteRole,
            status: 'pending',
            sentAt: new Date().toISOString()
        };

        onUpdateClub({
            ...activeClub,
            invites: [...invites, newInvite]
        });

        setInviteEmail("");
    };

    const handleAction = (inviteId: string, action: 'accepted' | 'declined') => {
        const invite = invites.find((i: TeamInvite) => i.id === inviteId);
        if (!invite) return;

        const updatedMembers = [...members];
        if (action === 'accepted') {
            updatedMembers.push({
                id: Math.random().toString(36).substr(2, 9),
                name: invite.email.split('@')[0],
                email: invite.email,
                role: invite.role,
                joinDate: new Date().toISOString().split('T')[0],
                basis: 'Fee Paid' // Default
            });
        }

        onUpdateClub({
            ...activeClub,
            invites: invites.filter((i: TeamInvite) => i.id !== inviteId),
            members: updatedMembers
        });
    };

    const getDomainIcon = (domain: string) => {
        switch (domain) {
            case 'Design': return <Palette className="w-4 h-4" />;
            case 'Content': return <FileText className="w-4 h-4" />;
            case 'Social': return <Share2 className="w-4 h-4" />;
            default: return <LayoutDashboard className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">My Team Hub</h2>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-2">
                        Collaboration, Permissions & Global Activity Tracking
                    </p>
                </div>

                <div className="relative group min-w-[250px]">
                    <select
                        value={selectedClubId || ""}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                        className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500"
                    >
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id}>{club.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none group-hover:text-gold-500 transition-colors" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <UsersRound className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Active Core</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-astronomus text-white">{members.length}</span>
                        <span className="text-[10px] text-neutral-600 font-bold">MEMBERS</span>
                    </div>
                </div>
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Clock className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Pending Requests</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-astronomus text-white">{invites.length}</span>
                        <span className="text-[10px] text-neutral-600 font-bold">INVITES</span>
                    </div>
                </div>
                <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <History className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Global Actions</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-astronomus text-white">{activityLog.length}</span>
                        <span className="text-[10px] text-neutral-600 font-bold">LOGGED</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                {[
                    { id: 'roster', label: 'Core Roster', icon: Shield },
                    { id: 'invites', label: 'Team Invites', icon: UserPlus },
                    { id: 'activity', label: 'Activity Watchtower', icon: History }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'roster' | 'invites' | 'activity')}
                        className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-signature-gradient border-gold-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[400px]"
                >
                    {activeTab === 'roster' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {members.length === 0 ? (
                                <div className="col-span-2 py-20 text-center bg-neutral-900/40 rounded-[2rem] border border-dashed border-white/10">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No core members yet. Send an invite to begin collaborating.</p>
                                </div>
                            ) : (
                                members.map((member: ClubMember) => (
                                    <div key={member.id} className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 flex items-center justify-between hover:border-gold-500/30 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-xl font-black text-signature-gradient border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white tracking-tight">{member.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                        member.role === 'Senior Core' ? 'text-signature-gradient border-gold-400/30 bg-gold-400/5' :
                                                        member.role === 'Junior Core' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                                                        'text-neutral-500 border-white/10 bg-white/5'
                                                    }`}>
                                                        {member.role}
                                                    </span>
                                                    <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{member.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={`mailto:${member.email}`} className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Send Email">
                                                <Mail className="w-4 h-4" />
                                            </a>
                                            <button onClick={() => setMemberToRemove(member.id)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Remove Member">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'invites' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Invite Form */}
                            <div className="bg-neutral-900/60 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><UserPlus className="w-5 h-5 text-gold-500" /> Send Core Invite</h3>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Collaborators gain access to your project workspace</p>
                                </div>

                                <form onSubmit={handleInvite} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Member Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            placeholder="collaborator@example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Assigned Role</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Junior Core', 'Senior Core'].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setInviteRole(role as MemberRole)}
                                                    className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${inviteRole === role ? 'bg-gold-500/10 border-gold-500 text-signature-gradient shadow-gold-glow' : 'bg-black/40 border-white/10 text-neutral-500 hover:border-white/30'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-start gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-neutral-500 leading-relaxed uppercase font-bold">
                                                {inviteRole === 'Junior Core' 
                                                    ? "Junior Core cannot access Sponsorship, Funding, or Recruitment modules."
                                                    : "Senior Core has full administrative access across all organizational modules."}
                                            </p>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-gold-gradient text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                        Send Secure Invite <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            {/* Pending Invites List */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Pending Clearances</h4>
                                {invites.length === 0 ? (
                                    <div className="py-20 text-center bg-neutral-900/20 rounded-[2.5rem] border border-dashed border-white/5">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No pending invitations. Use the form to send one.</p>
                                    </div>
                                ) : (
                                    invites.map((invite: TeamInvite) => (
                                        <div key={invite.id} className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-1">{invite.email}</p>
                                                    <p className="text-[9px] font-black text-signature-gradient uppercase tracking-widest">{invite.role}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleAction(invite.id, 'accepted')}
                                                        className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl transition-colors"
                                                        title="Force Accept (Demo)"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(invite.id, 'declined')}
                                                        className="p-3 bg-white/5 text-neutral-400 hover:text-white rounded-xl transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Token: {invite.id}</span>
                                                <button onClick={() => handleCopyLink(invite.id)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-signature-gradient hover:brightness-110 transition-colors">
                                                    {copiedId === invite.id ? (
                                                        <><Check className="w-3 h-3" /> Copied</>
                                                    ) : (
                                                        <><Copy className="w-3 h-3" /> Copy Link</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-normal font-astronomus text-white uppercase tracking-tighter">Activity Watchtower</h3>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Real-time collaborative operation logs</p>
                                </div>
                                <div className="p-2 bg-neutral-950 border border-white/5 rounded-xl flex items-center gap-2 px-4 group">
                                    <Search className="w-4 h-4 text-neutral-600 group-focus-within:text-gold-500 transition-colors" />
                                    <input 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent outline-none text-xs text-white placeholder:text-neutral-700 w-40" 
                                        placeholder="Filter actions..." 
                                    />
                                </div>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                {activityLog.filter(event => 
                                    event.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    event.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (event.details && event.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                    event.domain.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 ? (
                                    <div className="py-32 text-center text-neutral-600 uppercase tracking-[0.3em] font-black text-[10px]">
                                        Observatory is quiet. No recent collaborative actions.
                                    </div>
                                ) : (
                                    activityLog.filter(event => 
                                        event.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        event.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (event.details && event.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                        event.domain.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).slice().reverse().map((event: ActivityLogEvent) => (
                                        <div key={event.id} className="p-6 px-10 flex items-center gap-8 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/5 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                                                    {getDomainIcon(event.domain)}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold text-white">{event.userName}</span>
                                                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{event.action}</span>
                                                </div>
                                                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans italic">&quot;{event.details}&quot;</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg">
                                                    <Clock className="w-3 h-3 text-gold-500" />
                                                    <span className="text-[10px] text-neutral-400 font-mono tracking-tight">
                                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-700">Sequence Verified</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Remove Confirmation Modal */}
            <AnimatePresence>
                {memberToRemove && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#121212] border border-red-500/20 rounded-[2.5rem] p-10 shadow-3xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Remove Member?</h3>
                            <p className="text-neutral-500 text-xs mb-8 leading-relaxed">
                                Are you sure you want to remove <strong className="text-white">{(activeClub.members || []).find(m => m.id === memberToRemove)?.name}</strong> from the core roster? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMemberToRemove(null)}
                                    className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemoveConfirm}
                                    className="flex-1 px-6 py-4 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg"
                                >
                                    Confirm Removal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
