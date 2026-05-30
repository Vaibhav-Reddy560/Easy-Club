"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    UsersRound, 
    User,
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
    ChevronDown,
    Calendar,
    Star,
    ClipboardList,
    Trophy,
    ExternalLink,
    Send,
    Plus,
    CheckCircle,
    BrainCircuit,
    Tag,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Club, MemberRole, TeamInvite, ActivityLogEvent, ClubMember, MeetingMinutes, AssignedTask, Skill, SkillLevel } from "@/lib/types";
import { saveMeetingMinutes, assignTask, updateTaskProgress, updateMemberSkills } from "@/lib/utils/db";

interface MyTeamViewProps {
    clubs: Club[];
    user: any; // Using any for auth user compatibility
    onUpdateClub: (updatedClub: Club) => void;
    defaultSelection?: string;
}

export default function MyTeamView({ clubs, user, onUpdateClub, defaultSelection }: MyTeamViewProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(defaultSelection || clubs[0]?.id || null);
    
    // Automatically select the first club if available and none selected
    React.useEffect(() => {
        if (defaultSelection) {
            setSelectedClubId(defaultSelection);
        } else if (!selectedClubId && clubs.length > 0) {
            setSelectedClubId(clubs[0].id);
        }
    }, [clubs, defaultSelection]);

    const activeClub = clubs.find(c => c.id === selectedClubId);
    const isGlobal = selectedClubId === 'global';

    // Role detection
    const currentUserMember = activeClub?.members?.find(m => m.email.toLowerCase() === user?.email?.toLowerCase());
    const currentUserRole = currentUserMember?.role || 'Member';
    const isOwner = activeClub?.founderId === user?.uid || user?.email === activeClub?.founderEmail;

    const handleUpdateActiveClub = async (updatedClubFn: (c: Club) => Club) => {
        if (!selectedClubId || isGlobal) return;
        const activeClub = clubs.find(c => c.id === selectedClubId);
        if (!activeClub) return;
        
        // Apply transformation and push to centralized handler
        const updatedClub = updatedClubFn(activeClub);
        onUpdateClub(updatedClub);
    };

    const [activeTab, setActiveTab] = useState<'roster' | 'invites' | 'activity' | 'mom' | 'tasks'>('roster');
    const [talentSearchQuery, setTalentSearchQuery] = useState("");
    const [selectedTalentSkill, setSelectedTalentSkill] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>('Junior Core');

    // Skills state
    const [isAddingSkill, setIsAddingSkill] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState("");
    const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Beginner');
    const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

    // Activity Watchtower filter
    const [activityTimeRange, setActivityTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('all');

    // MOM Form state
    const [isMomModalOpen, setIsMomModalOpen] = useState(false);
    const [momForm, setMomForm] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: "10:00",
        endTime: "11:00",
        attendees: [] as string[],
        eventId: "",
        keyTopics: "",
        progressNotes: "",
        rating: 5
    });

    // Task Form state
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        assigneeId: "",
        eventId: "",
        domain: 'Management' as any,
        deadline: new Date().toISOString().split('T')[0],
        externalLink: ""
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleSaveMOM = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClub || isGlobal) return;

        const newMOM: MeetingMinutes = {
            ...momForm,
            id: `mom_${Date.now()}`,
            createdBy: currentUserMember?.name || user?.displayName || "Founder",
            createdById: user?.uid || "",
            createdAt: new Date().toISOString()
        };

        const success = await saveMeetingMinutes(activeClub.id, newMOM);
        if (success) {
            handleUpdateActiveClub((c: Club) => ({
                ...c,
                meetingMinutes: [...(c.meetingMinutes || []), newMOM]
            }));
            setIsMomModalOpen(false);
            setMomForm({
                date: new Date().toISOString().split('T')[0],
                startTime: "10:00",
                endTime: "11:00",
                attendees: [],
                eventId: "",
                keyTopics: "",
                progressNotes: "",
                rating: 5
            });
        }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClub || isGlobal) return;

        const assignee = members.find(m => m.id === taskForm.assigneeId);
        const newTask: AssignedTask = {
            ...taskForm,
            id: `task_${Date.now()}`,
            assigneeName: assignee?.name || "Unknown",
            assignerId: user?.uid || "",
            assignerName: currentUserMember?.name || user?.displayName || "Founder",
            status: 'Assigned',
            progressValue: 0,
            createdAt: new Date().toISOString()
        };

        const success = await assignTask(activeClub.id, newTask);
        if (success) {
            handleUpdateActiveClub((c: Club) => ({
                ...c,
                assignedTasks: [...(c.assignedTasks || []), newTask]
            }));
            setIsTaskModalOpen(false);
            setTaskForm({
                title: "",
                description: "",
                assigneeId: "",
                eventId: "",
                domain: 'Management',
                deadline: new Date().toISOString().split('T')[0],
                externalLink: ""
            });
        }
    };


    const members = React.useMemo(() => {
        if (isGlobal) {
            const allMembers: ClubMember[] = [];
            const seenIds = new Set<string>();
            clubs.forEach(c => {
                // Determine owner info
                const ownerId = c.ownerId || c.id + "_founder";
                if (!seenIds.has(ownerId)) {
                    allMembers.push({
                        id: ownerId,
                        name: (c.ownerName && c.ownerName !== 'Founder') ? c.ownerName : (user?.displayName || "Founder"),
                        email: c.ownerEmail || "",
                        role: 'Senior Core',
                        customPosition: (c as any).ownerPosition || "",
                        joinDate: c.id?.startsWith('club_') ? new Date(parseInt(c.id.split('_')[1])).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        basis: 'Fee Paid',
                        skills: (c as any).ownerSkills || []
                    });
                    seenIds.add(ownerId);
                }
                (c.members || []).forEach(m => {
                    if (m.role !== 'General Member' && m.id !== c.ownerId && !seenIds.has(m.id)) {
                        allMembers.push(m);
                        seenIds.add(m.id);
                    }
                });
            });
            return allMembers;
        }
        
        const ownerAsMember: ClubMember = {
            id: activeClub?.ownerId || activeClub?.id + "_founder",
            name: (activeClub?.ownerName && activeClub.ownerName !== 'Founder') ? activeClub.ownerName : (user?.displayName || "Founder"),
            email: activeClub?.ownerEmail || "",
            role: 'Senior Core',
            customPosition: (activeClub as any)?.ownerPosition || "", 
            joinDate: activeClub?.id?.startsWith('club_') ? new Date(parseInt(activeClub.id.split('_')[1])).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            basis: 'Fee Paid',
            skills: (activeClub as any)?.ownerSkills || []
        };
        return activeClub ? [ownerAsMember, ...(activeClub.members || []).filter(m => m.role !== 'General Member' && m.id !== activeClub.ownerId)] : [];
    }, [isGlobal, clubs, activeClub, user]);

    const invites = React.useMemo(() => {
        if (isGlobal) {
            const allInvites: TeamInvite[] = [];
            clubs.forEach(c => allInvites.push(...(c.invites || [])));
            return allInvites;
        }
        return activeClub?.invites || [];
    }, [isGlobal, clubs, activeClub]);

    const activityLog = React.useMemo(() => {
        if (isGlobal) {
            const globalEvents: any[] = [];
            clubs.forEach(club => {
                (club.activityLog || []).forEach(event => {
                    globalEvents.push({ ...event, clubName: club.name, clubId: club.id });
                });
            });
            return globalEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return activeClub?.activityLog || [];
    }, [isGlobal, clubs, activeClub]);

    const meetingMinutes = React.useMemo(() => {
        if (isGlobal) {
            const allMoM: any[] = [];
            clubs.forEach(c => allMoM.push(...((c as any).meetingMinutes || []).map((m: any) => ({ ...m, clubName: c.name, clubId: c.id }))));
            return allMoM.sort((a, b) => new Date(b.date + " " + b.startTime).getTime() - new Date(a.date + " " + a.startTime).getTime());
        }
        return (activeClub as any)?.meetingMinutes || [];
    }, [isGlobal, clubs, activeClub]);

    const assignedTasks = React.useMemo(() => {
        if (isGlobal) {
            const allTasks: any[] = [];
            clubs.forEach(c => allTasks.push(...((c as any).assignedTasks || []).map((t: any) => ({ ...t, clubName: c.name, clubId: c.id }))));
            return allTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        }
        return (activeClub as any)?.assignedTasks || [];
    }, [isGlobal, clubs, activeClub]);

    // --- Computed Activity for Watchtower ---
    const allActivity = activityLog;

    const getDomainIcon = (domain: string) => {
        switch (domain) {
            case 'Management': return <Shield className="w-5 h-5" />;
            case 'Technical': return <BrainCircuit className="w-5 h-5" />;
            case 'Creative': return <Palette className="w-5 h-5" />;
            case 'PR/Outreach': return <Share2 className="w-5 h-5" />;
            default: return <ClipboardList className="w-5 h-5" />;
        }
    };

    // --- Talent Matrix Logic ---
    const allMembersWithContext = React.useMemo(() => {
        const members: { member: ClubMember; clubName: string; clubId: string }[] = [];
        
        clubs.forEach(club => {
            (club.members || []).forEach(m => {
                members.push({ member: m, clubName: club.name, clubId: club.id });
            });
            
            if (club.ownerId && club.ownerEmail) {
                const ownerExists = (club.members || []).some(m => m.id === club.ownerId);
                if (!ownerExists) {
                    members.push({
                        member: {
                            id: club.ownerId,
                            name: (club.ownerName && club.ownerName !== 'Founder') ? club.ownerName : (user?.displayName || "Founder"),
                            email: club.ownerEmail,
                            role: 'Senior Core',
                            customPosition: (club as any).ownerPosition || "",
                            joinDate: club.lastUpdated || new Date().toISOString(),
                            basis: 'Fee Paid',
                            skills: (club as any).ownerSkills || []
                        },
                        clubName: club.name,
                        clubId: club.id
                    });
                }
            }
        });
        
        return members;
    }, [clubs]);


    const allUniqueSkills = React.useMemo(() => {
        const skills = new Set<string>();
        allMembersWithContext.forEach(({ member }) => {
            (member.skills || []).forEach(s => {
                const name = typeof s === 'string' ? s : s.name;
                skills.add(name);
            });
        });
        return Array.from(skills).sort();
    }, [allMembersWithContext]);

    const filteredTalent = React.useMemo(() => {
        const filtered = allMembersWithContext.filter(({ member, clubName }) => {
            const matchesSearch = 
                member.name.toLowerCase().includes(talentSearchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(talentSearchQuery.toLowerCase()) ||
                clubName.toLowerCase().includes(talentSearchQuery.toLowerCase());
            
            const matchesSkill = !selectedTalentSkill || (member.skills || []).some(s => {
                const name = typeof s === 'string' ? s : s.name;
                return name === selectedTalentSkill;
            });
            
            return matchesSearch && matchesSkill;
        });

        if (selectedTalentSkill) {
            return filtered.sort((a, b) => {
                const getScore = (m: ClubMember) => {
                    const skill = (m.skills || []).find(s => (typeof s === 'string' ? s : s.name) === selectedTalentSkill);
                    if (!skill) return 0;
                    if (typeof skill === 'string') return 1;
                    return skill.level === 'Expert' ? 3 : skill.level === 'Proficient' ? 2 : 1;
                };
                return getScore(b.member) - getScore(a.member);
            });
        }
        return filtered;
    }, [allMembersWithContext, talentSearchQuery, selectedTalentSkill]);
    // --- End Talent Matrix Logic ---

    const suggestedMembers = React.useMemo(() => {
        if (!activeClub) return [];
        
        const keywords: Record<string, string[]> = {
            Management: ['management', 'lead', 'leadership', 'strategy', 'organiz', 'coordination', 'admin', 'product', 'project', 'finance', 'operations', 'manager', 'founder'],
            Technical: ['tech', 'code', 'development', 'program', 'engineering', 'software', 'web', 'script', 'python', 'java', 'react', 'html', 'css', 'database', 'security', 'ai', 'analytics', 'data', 'dev'],
            Creative: ['design', 'figma', 'creative', 'art', 'ui', 'ux', 'graphic', 'video', 'photo', 'animation', 'fashion', 'copywriting', 'content', 'brand', 'illustrator'],
            'PR/Outreach': ['pr', 'outreach', 'marketing', 'social', 'media', 'sales', 'public speak', 'communication', 'toastmasters', 'debate', 'sponsor', 'relations', 'event', 'writing']
        };

        const activeKeywords = keywords[taskForm.domain] || [];

        const scored = members.map(m => {
            let score = 0;
            const matchedSkills: string[] = [];

            (m.skills || []).forEach(s => {
                const sName = typeof s === 'string' ? s : s.name;
                const sLevel = typeof s === 'string' ? 'Beginner' : s.level;
                const sLevelMultiplier = sLevel === 'Expert' ? 3 : sLevel === 'Proficient' ? 2 : 1;

                const lowerSkill = sName.toLowerCase();
                const matchedKeyword = activeKeywords.find(kw => lowerSkill.includes(kw));
                if (matchedKeyword) {
                    score += sLevelMultiplier * 2;
                    matchedSkills.push(sName);
                }
            });

            const customPosLower = (m.customPosition || "").toLowerCase();
            const roleLower = m.role.toLowerCase();
            activeKeywords.forEach(kw => {
                if (customPosLower.includes(kw)) score += 3;
                if (roleLower.includes(kw)) score += 1;
            });

            return {
                member: m,
                score,
                matchedSkills
            };
        });

        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }, [members, taskForm.domain, activeClub]);

    if ((!activeClub && !isGlobal) || (clubs.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <UsersRound className="w-16 h-16 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">No Clubs Established</h3>
                <p className="text-white text-sm">Create a club to manage your team.</p>
            </div>
        );
    }

    const handleUpdateMemberPosition = (memberId: string, position: string) => {
        if (!activeClub) return;
        if (memberId === activeClub.ownerId) {
            // Special handling for owner's position
            onUpdateClub({
                ...activeClub,
                ownerPosition: position
            } as any);
        } else {
            // Standard handling for core members
            onUpdateClub({
                ...activeClub,
                members: activeClub.members?.map(m => 
                    m.id === memberId ? { ...m, customPosition: position } : m
                ) || []
            });
        }
    };

    const handleRemoveConfirm = () => {
        if (!activeClub || !memberToRemove) return;
        onUpdateClub({
            ...activeClub,
            members: activeClub.members?.filter(m => m.id !== memberToRemove) || []
        });
        setMemberToRemove(null);
    };

    const handleCopyLink = async (inviteId: string) => {
        if (!activeClub) return;
        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://easy-club.vercel.app';
            const fullLink = `${baseUrl}/join?clubId=${activeClub.id}&token=${inviteId}`;
            await navigator.clipboard.writeText(fullLink);
            setCopiedId(inviteId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClubId || isGlobal) return;
        if (!inviteEmail || !activeClub) return;

        const newInvite: TeamInvite = {
            id: `inv_${Math.random().toString(36).substring(2, 15)}`,
            email: inviteEmail.toLowerCase(),
            role: inviteRole,
            status: 'pending',
            sentAt: new Date().toISOString()
        };

        onUpdateClub({
            ...activeClub,
            invites: [...(activeClub.invites || []), newInvite]
        });

        setInviteEmail("");
    };

    const handleAddSkill = async (memberId: string) => {
        if (!activeClub || !newSkill.trim()) return;
        const member = members.find(m => m.id === memberId);
        const newSkillObj: Skill = { name: newSkill.trim(), level: newSkillLevel };
        const updatedSkills = [...(member?.skills || []), newSkillObj];
        
        handleUpdateActiveClub((c: Club) => ({
            ...c,
            members: (c.members || []).map(m => m.id === memberId ? { ...m, skills: updatedSkills } : m)
        }));

        await updateMemberSkills(activeClub.id, memberId, updatedSkills);
        setNewSkill("");
        setNewSkillLevel('Beginner');
        setIsAddingSkill(null);
    };

    const handleRemoveSkill = async (memberId: string, skillName: string) => {
        if (!activeClub) return;
        const member = members.find(m => m.id === memberId);
        const updatedSkills = (member?.skills || []).filter(s => {
            const name = typeof s === 'string' ? s : s.name;
            return name !== skillName;
        });
        
        handleUpdateActiveClub((c: Club) => ({
            ...c,
            members: (c.members || []).map(m => m.id === memberId ? { ...m, skills: updatedSkills } : m)
        }));

        await updateMemberSkills(activeClub.id, memberId, updatedSkills);
    };

    const handleUpdateProgress = async (taskId: string, progressValue: number, statusOrLink: any) => {
        if (!activeClub) return;
        
        let update: any = { progressValue };
        if (typeof statusOrLink === 'string') {
            update.status = statusOrLink;
        } else if (statusOrLink && typeof statusOrLink === 'object') {
            update = { ...update, ...statusOrLink };
        }

        const updatedTasks = (activeClub as any).assignedTasks?.map((t: AssignedTask) => 
            t.id === taskId ? { ...t, ...update } : t
        );

        handleUpdateActiveClub((c: Club) => ({
            ...c,
            assignedTasks: updatedTasks
        } as any));

        await updateTaskProgress(activeClub.id, taskId, update);
    };

    const handleAction = async (inviteId: string, action: 'accepted' | 'declined') => {
        if (!activeClub) return;
        
        const updatedInvites = (activeClub.invites || []).filter(inv => inv.id !== inviteId);
        
        handleUpdateActiveClub((c: Club) => ({
            ...c,
            invites: updatedInvites
        }));
        
        // Note: Real DB deletion or status update should happen here
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">My Team</h2>
                    <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase">
                        Form your team and track activity
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Intelligence Toggle */}
                    <button 
                        onClick={() => setSelectedClubId('global')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${isGlobal ? 'bg-gold-gradient text-black border-transparent shadow-gold-glow' : 'bg-black/40 text-white/60 border-white/10 hover:border-gold-500/50 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Overall View</span>
                    </button>

                    {/* Club Selector */}
                    <div className="relative group min-w-[250px]">
                        <select 
                            value={isGlobal ? "" : (selectedClubId || "")} 
                            onChange={(e) => setSelectedClubId(e.target.value)}
                            className="w-full appearance-none bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500 cursor-pointer"
                        >
                            {!selectedClubId || isGlobal ? <option value="" disabled className="bg-black text-white">Select a Club</option> : null}
                            {clubs.map(club => (
                                <option key={club.id} value={club.id} className="bg-black text-white">{club.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none group-hover:text-gold-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Global Warning for restrictive tabs */}
            {isGlobal && (activeTab === 'roster' || activeTab === 'invites') && (
                <div className="p-8 bg-gold-500/5 border border-gold-500/20 rounded-[2.5rem] flex items-center gap-6 mb-8">
                    <div className="p-4 bg-gold-gradient rounded-2xl">
                        <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Management Lock</h4>
                        <p className="text-[10px] text-zinc-400 font-medium mt-1">Direct member management and invites are disabled in Global view. Please select a specific club cluster to modify its core roster.</p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#050505] border border-white/15 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <UsersRound className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Active Core</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-white tracking-tighter" style={{ fontFamily: 'var(--font-destrubia) !important' }}>{members.length}</span>
                        <span className="text-[10px] text-white font-bold tracking-wider">MEMBERS</span>
                    </div>
                </div>
                <div className="bg-[#050505] border border-white/15 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <Clock className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Pending Requests</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-white tracking-tighter" style={{ fontFamily: 'var(--font-destrubia) !important' }}>{invites.length}</span>
                        <span className="text-[10px] text-white font-bold tracking-wider">INVITES</span>
                    </div>
                </div>
                <div className="bg-[#050505] border border-white/15 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <History className="w-4 h-4 text-gold-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Global Actions</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-white tracking-tighter" style={{ fontFamily: 'var(--font-destrubia) !important' }}>{activityLog.length}</span>
                        <span className="text-[10px] text-white font-bold tracking-wider">LOGGED</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/15">
                {[
                    { id: 'roster', label: 'Core Roster', icon: Shield },
                    { id: 'invites', label: 'Team Invites', icon: UserPlus },
                    { id: 'activity', label: 'Watchtower', icon: History },
                    { id: 'mom', label: 'MOM Registry', icon: FileText },
                    { id: 'tasks', label: 'Task Console', icon: ClipboardList }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-5 px-4 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap ${isActive ? 'border-gold-500 text-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-gold-500' : 'text-zinc-500'}`} />
                            <span className={isActive ? 'text-white' : ''}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
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
                                <div className="col-span-2 py-20 text-center bg-[#050505] rounded-[2rem] border border-dashed border-white/15">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">No core members yet. Send an invite to begin collaborating.</p>
                                </div>
                            ) : (
                                    members.map((member: ClubMember) => (
                                        <div key={member.id} className="bg-[#050505] border border-white/15 rounded-3xl p-8 flex flex-col gap-6 hover:border-gold-500/30 transition-all group shadow-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/15 shadow-xl group-hover:scale-110 transition-transform">
                                                        <User className="w-6 h-6 text-gold-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-white tracking-tight">{member.name}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                                member.role === 'Senior Core' ? 'text-signature-gradient border-gold-400/30 bg-gold-400/5' :
                                                                member.role === 'Junior Core' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                                                                'text-white border-white/15 bg-white/5'
                                                            }`}>
                                                                {member.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {member.id !== activeClub?.ownerId && !isGlobal && (
                                                        <>
                                                            <a href={`mailto:${member.email}`} className="p-2 text-zinc-200 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Send Email">
                                                                <Mail className="w-4 h-4" />
                                                            </a>
                                                            <button onClick={() => setMemberToRemove(member.id)} className="p-2 text-zinc-200 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Remove Member">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Position Management Area */}
                                            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Designated Position</label>
                                                    {(member.id === activeClub?.ownerId || member.customPosition) && (
                                                        <span className="text-[9px] font-bold text-gold-500 uppercase tracking-widest px-2 py-1 bg-gold-500/5 border border-gold-500/20 rounded-md">
                                                            {member.id === activeClub?.ownerId ? "Founder" : member.customPosition}
                                                        </span>
                                                    )}
                                                </div>
                                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {(() => {
                                                        const skills = member.skills || [];
                                                        const isExpanded = expandedSkills[member.id];
                                                        const visibleSkills = isExpanded ? skills : skills.slice(0, 3);
                                                        const hiddenCount = skills.length - visibleSkills.length;

                                                        return (
                                                            <>
                                                                {visibleSkills.map((skill, idx) => {
                                                                    const sName = typeof skill === 'string' ? skill : skill.name;
                                                                    const sLevel = typeof skill === 'string' ? 'Beginner' : skill.level;
                                                                    return (
                                                                        <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gold-500/5 text-gold-500 border border-gold-500/10 group/skill">
                                                                            {sName}
                                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${
                                                                                sLevel === 'Expert' ? 'bg-gold-500 text-black' : 
                                                                                sLevel === 'Proficient' ? 'bg-white/10 text-white' : 
                                                                                'bg-white/5 text-zinc-400'
                                                                            }`}>
                                                                                {sLevel}
                                                                            </span>
                                                                            {!isGlobal && (
                                                                                <button onClick={() => handleRemoveSkill(member.id, sName)} className="hover:text-white transition-colors">
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                        </span>
                                                                    );
                                                                })}
                                                                {!isExpanded && hiddenCount > 0 && (
                                                                    <button 
                                                                        onClick={() => setExpandedSkills(prev => ({ ...prev, [member.id]: true }))}
                                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                                                                    >
                                                                        +{hiddenCount} More
                                                                    </button>
                                                                )}
                                                                {isExpanded && hiddenCount === 0 && skills.length > 3 && (
                                                                    <button 
                                                                        onClick={() => setExpandedSkills(prev => ({ ...prev, [member.id]: false }))}
                                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                                                                    >
                                                                        Show Less
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                    {/* Only the member themselves can manage their skills */}
                                                    {user?.uid === member.id && (
                                                        isAddingSkill === member.id ? (
                                                            <div className="flex flex-col gap-4 p-6 bg-[#121212] border border-white/10 rounded-2xl w-full min-w-[320px] shadow-2xl z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <h4 className="text-sm font-destrubia text-white tracking-widest text-center">Add your skills</h4>
                                                                
                                                                <div>
                                                                    <input 
                                                                        autoFocus
                                                                        value={newSkill}
                                                                        onChange={e => setNewSkill(e.target.value)}
                                                                        onKeyDown={e => e.key === 'Enter' && handleAddSkill(member.id)}
                                                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500 transition-colors mb-4"
                                                                        placeholder="e.g. Web Design"
                                                                    />
                                                                    
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                                            <span>Proficiency:</span>
                                                                            <span className={
                                                                                newSkillLevel === 'Expert' ? 'text-gold-500' :
                                                                                newSkillLevel === 'Proficient' ? 'text-white' : 'text-zinc-500'
                                                                            }>{newSkillLevel}</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" 
                                                                            min="0" 
                                                                            max="2" 
                                                                            step="1"
                                                                            value={newSkillLevel === 'Beginner' ? 0 : newSkillLevel === 'Proficient' ? 1 : 2}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value);
                                                                                setNewSkillLevel(val === 0 ? 'Beginner' : val === 1 ? 'Proficient' : 'Expert');
                                                                            }}
                                                                            className="w-full accent-gold-500"
                                                                        />
                                                                        <div className="flex justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase mt-2">
                                                                            <span>Beginner</span>
                                                                            <span>Proficient</span>
                                                                            <span>Expert</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2 mt-2">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleAddSkill(member.id)}
                                                                        className="flex-1 bg-gold-gradient text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg"
                                                                    >
                                                                        Add Skill
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => setIsAddingSkill(null)}
                                                                        className="px-4 py-3 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setIsAddingSkill(member.id)}
                                                                className="text-[10px] font-black text-gold-500 uppercase tracking-widest bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/30 border-dashed px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 group/btn"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" /> Add Skill
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                                
                                                {/* Only the owner can change positions */}
                                                {user?.uid === activeClub?.ownerId ? (
                                                    <div className="relative group/select">
                                                        <select
                                                            value={member.customPosition || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === "__new__") {
                                                                    const newPos = prompt("Enter Custom Position Name (e.g. Lead Researcher):");
                                                                    if (newPos) {
                                                                        handleUpdateMemberPosition(member.id, newPos);
                                                                    }
                                                                } else {
                                                                    handleUpdateMemberPosition(member.id, val);
                                                                }
                                                            }}
                                                            className="w-full appearance-none bg-zinc-950 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-[11px] font-bold text-white uppercase tracking-widest outline-none hover:border-gold-500/30 transition-all focus:border-gold-500"
                                                        >
                                                            <option value="">Unassigned Role</option>
                                                            <optgroup label="Core Leadership" className="bg-black">
                                                                <option value="Chairperson">Chairperson</option>
                                                                <option value="Vice-Chairperson">Vice-Chairperson</option>
                                                                <option value="Secretary">Secretary</option>
                                                                <option value="Joint Secretary">Joint Secretary</option>
                                                                <option value="Treasurer">Treasurer</option>
                                                                <option value="Joint Treasurer">Joint Treasurer</option>
                                                            </optgroup>
                                                            <optgroup label="Technical Heads" className="bg-black">
                                                                <option value="Tech Head">Tech Head</option>
                                                                <option value="AI/ML Lead">AI/ML Lead</option>
                                                                <option value="Web Dev Head">Web Dev Head</option>
                                                                <option value="App Dev Lead">App Dev Lead</option>
                                                                <option value="IOT Head">IOT Head</option>
                                                            </optgroup>
                                                            <optgroup label="Operational Heads" className="bg-black">
                                                                <option value="Events Head">Events Head</option>
                                                                <option value="Design Head">Design Head</option>
                                                                <option value="Projects Head">Projects Head</option>
                                                                <option value="PR/Outreach Head">PR/Outreach Head</option>
                                                            </optgroup>
                                                            <option value="__new__" className="text-gold-500 font-black">+ Create New Position</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none group-hover/select:text-gold-500 transition-colors" />
                                                    </div>
                                                ) : (
                                                    <div className="py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                        {member.customPosition || "Title Unassigned by Founder"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}

                    {activeTab === 'invites' && (
                        <div className={`grid grid-cols-1 ${!isGlobal ? 'lg:grid-cols-2' : ''} gap-8`}>
                            {/* Invite Form */}
                            {!isGlobal && (
                            <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                                <div>
                                    <h3 className="text-xl font-astronomus text-white mb-2 tracking-wider">Send Core Invite</h3>
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">Collaborators gain access to your project workspace</p>
                                </div>

                                <form onSubmit={handleInvite} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Member Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            placeholder="collaborator@example.com"
                                            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Assigned Role</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Junior Core', 'Senior Core'].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setInviteRole(role as MemberRole)}
                                                    className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${inviteRole === role ? 'bg-gold-500/10 border-gold-500 text-signature-gradient shadow-gold-glow' : 'bg-black/40 border-white/15 text-zinc-200 hover:border-white/30'}`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-start gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Info className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-white leading-relaxed uppercase font-bold">
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
                            )}

                            {/* Pending Invites List */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white ml-2">Pending Clearances</h4>
                                {invites.length === 0 ? (
                                    <div className="py-20 text-center bg-[#050505] rounded-[2.5rem] border border-dashed border-white/15">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">No pending invitations. Use the form to send one.</p>
                                    </div>
                                ) : (
                                    invites.map((invite: TeamInvite) => (
                                        <div key={invite.id} className="bg-[#050505] border border-white/15 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-1">{invite.email}</p>
                                                    <p className="text-[9px] font-black text-signature-gradient uppercase tracking-widest">{invite.role}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleAction(invite.id, 'declined')}
                                                        className="p-3 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                                        title="Revoke Invitation"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Token: {invite.id}</span>
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

                    {activeTab === 'mom' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-[#050505] border border-white/15 rounded-3xl p-8 shadow-2xl">
                                <div>
                                    <h3 className="text-2xl font-astronomus text-white mb-1 uppercase tracking-wider">Minutes of Meeting</h3>
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">Document important decisions & progress</p>
                                </div>
                                    {!isGlobal && (
                                        <button 
                                            onClick={() => setIsMomModalOpen(true)}
                                            className="bg-gold-gradient text-black font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-gold-glow"
                                        >
                                            <Plus className="w-4 h-4" /> Log New Meeting
                                        </button>
                                    )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {meetingMinutes.length === 0 ? (
                                    <div className="col-span-2 py-32 text-center bg-[#050505] rounded-[2.5rem] border border-dashed border-white/15">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-50">No meetings recorded yet.</p>
                                    </div>
                                ) : (
                                    meetingMinutes.slice().reverse().map((mom: any) => (
                                        <div key={mom.id} className="bg-[#050505] border border-white/15 rounded-3xl p-8 flex flex-col gap-6 group hover:border-gold-500/30 transition-all shadow-xl">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-4 h-4 text-gold-500" />
                                                        <span className="text-sm font-bold text-white">{mom.date}</span>
                                                        <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{mom.startTime} - {mom.endTime}</span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-signature-gradient uppercase tracking-tight">
                                                        {isGlobal && <span className="text-gold-500 mr-2">[{mom.clubName}]</span>}
                                                        {(activeClub || clubs.find(c => c.id === mom.clubId))?.events?.find(e => e.id === mom.eventId)?.name || "General Sync"}
                                                    </h4>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} className={`w-3 h-3 ${star <= mom.rating ? 'text-gold-500 fill-gold-500' : 'text-zinc-800 fill-zinc-800'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-gold-500 block mb-2">Key Topics</label>
                                                    <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{mom.keyTopics}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-gold-500 block mb-2">Progress & Decisions</label>
                                                    <p className="text-xs text-white leading-relaxed whitespace-pre-wrap italic">&quot;{mom.progressNotes}&quot;</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                <div className="flex -space-x-3">
                                                    {mom.attendees.map((id: string) => {
                                                        const m = members.find(mem => mem.id === id);
                                                        return (
                                                            <div key={id} className="w-8 h-8 rounded-lg bg-zinc-800 border-2 border-[#050505] flex items-center justify-center text-[10px] font-black text-white uppercase" title={m?.name}>
                                                                {m?.name.charAt(0)}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">
                                                    Protocol by <span className="text-zinc-300">{mom.createdBy}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-[#050505] border border-white/15 rounded-3xl p-8 shadow-2xl">
                                <div>
                                    <h3 className="text-2xl font-astronomus text-white mb-1 uppercase tracking-wider">Task Console</h3>
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">Create and assign tasks</p>
                                </div>
                                {!isGlobal && (currentUserRole === 'Senior Core' || isOwner) && (
                                    <button 
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] px-10 py-5 rounded-2xl hover:bg-gold-500 transition-all flex items-center gap-3 shadow-2xl active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> Assign Task
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 pb-20">
                                {assignedTasks.length === 0 ? (
                                    <div className="py-32 text-center bg-[#050505] rounded-[2.5rem] border border-dashed border-white/15">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-50">No tasks assigned yet.</p>
                                    </div>
                                ) : (
                                    assignedTasks.slice().reverse().map((task: any) => (
                                        <div key={task.id} className="bg-[#050505] border border-white/15 rounded-3xl p-8 flex flex-col md:flex-row gap-8 group hover:border-gold-500/30 transition-all shadow-xl relative overflow-hidden">
                                            {/* Status Badge */}
                                            <div className="absolute top-0 right-0 p-4">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl border-l border-b border-white/10 ${
                                                    task.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                                                    task.status === 'Review Required' ? 'bg-gold-500/10 text-gold-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </div>

                                            {/* Left Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center text-signature-gradient">
                                                        {getDomainIcon(task.domain)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-white tracking-tight">{task.title}</h4>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                            {isGlobal && <span className="text-gold-500 mr-2">[{ (task as any).clubName }]</span>}
                                                            {task.domain} • { (activeClub || clubs.find(c => c.id === (task as any).clubId))?.events?.find(e => e.id === task.eventId)?.name || "General" }
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white leading-relaxed opacity-70">{task.description}</p>
                                                
                                                {task.externalLink && (
                                                    <a href={task.externalLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold text-gold-500 hover:brightness-125 transition-all">
                                                        <ExternalLink className="w-3 h-3" /> Submit Materials / Review Link
                                                    </a>
                                                )}
                                            </div>

                                            {/* Center Progress */}
                                            <div className="flex-1 flex flex-col justify-center gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Milestone Progress</label>
                                                        <span className="text-xl font-bold text-white tracking-tighter">{task.progressValue}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${task.progressValue}%` }}
                                                            className="h-full bg-gold-gradient shadow-gold-glow"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 block mb-2">Primary Lead</label>
                                                        <p className="text-[11px] font-bold text-white tracking-wide">{task.assigneeName}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Deadline</label>
                                                        <p className="text-[10px] font-bold text-red-400">{task.deadline}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Actions */}
                                            <div className="flex flex-col justify-center gap-3">
                                                {user?.uid === task.assigneeId && task.status !== 'Completed' && (
                                                    <>
                                                        <button 
                                                            onClick={() => {
                                                                const link = prompt("Enter submission link (Docs, Figma, etc.):", task.externalLink || "");
                                                                if (link !== null) handleUpdateProgress(task.id, task.progressValue, { externalLink: link });
                                                            }}
                                                            className="px-6 py-3 rounded-xl border border-white/15 text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-white flex items-center gap-2"
                                                        >
                                                            <Share2 className="w-3 h-3" /> Add Link
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const prog = parseInt(prompt("Update Progress (0-100):", task.progressValue.toString()) || "0");
                                                                if (!isNaN(prog)) handleUpdateProgress(task.id, prog, prog === 100 ? 'Review Required' : 'In Progress');
                                                            }}
                                                            className="px-6 py-3 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                                                        >
                                                            <Send className="w-3 h-3" /> Update & Publish
                                                        </button>
                                                    </>
                                                )}
                                                {(currentUserRole === 'Senior Core' || isOwner) && task.status === 'Review Required' && (
                                                    <button 
                                                        onClick={() => handleUpdateProgress(task.id, 100, 'Completed')}
                                                        className="px-6 py-3 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all flex items-center gap-2 shadow-lg"
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> Approve & Close
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-4">
                                <h3 className="text-xl font-normal font-astronomus text-white uppercase tracking-tighter whitespace-nowrap">Activity Watchtower</h3>
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                    <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Real-time collaborative operation logs</p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <div className="bg-zinc-950 border border-white/5 rounded-xl flex items-center p-1 w-full sm:w-auto overflow-x-auto custom-scrollbar">
                                            {(['today', '7d', '30d', 'all'] as const).map((range) => (
                                                <button
                                                    key={range}
                                                    onClick={() => setActivityTimeRange(range)}
                                                    className={`flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activityTimeRange === range ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 bg-zinc-950 border border-white/5 rounded-xl flex items-center gap-2 px-4 group w-full sm:w-auto">
                                            <Search className="w-4 h-4 text-white group-focus-within:text-gold-500 transition-colors shrink-0" />
                                            <input 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="bg-transparent outline-none text-xs text-white placeholder:text-zinc-700 w-full sm:w-40" 
                                                placeholder={isGlobal ? "Search all clubs..." : "Filter actions..."} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                {allActivity.filter(event => {
                                    // Text Search
                                    const searchMatch = event.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        event.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (event.details && event.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                        event.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (isGlobal && (event as any).clubName.toLowerCase().includes(searchQuery.toLowerCase()));
                                    
                                    if (!searchMatch) return false;

                                    // Time Range Filter
                                    if (activityTimeRange === 'all') return true;
                                    const eventDate = new Date(event.timestamp);
                                    const now = new Date();
                                    const diffMs = now.getTime() - eventDate.getTime();
                                    const diffDays = diffMs / (1000 * 60 * 60 * 24);

                                    if (activityTimeRange === 'today') {
                                        return eventDate.toDateString() === now.toDateString();
                                    } else if (activityTimeRange === '7d') {
                                        return diffDays <= 7;
                                    } else if (activityTimeRange === '30d') {
                                        return diffDays <= 30;
                                    }
                                    return true;
                                }).length === 0 ? (
                                    <div className="py-32 text-center text-white uppercase tracking-[0.3em] font-black text-[10px]">
                                        Observatory is quiet. No recent collaborative actions for this period.
                                    </div>
                                ) : (
                                    allActivity.filter(event => {
                                        const searchMatch = event.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            event.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            (event.details && event.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                            event.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (isGlobal && (event as any).clubName.toLowerCase().includes(searchQuery.toLowerCase()));
                                        
                                        if (!searchMatch) return false;

                                        if (activityTimeRange === 'all') return true;
                                        const eventDate = new Date(event.timestamp);
                                        const now = new Date();
                                        const diffMs = now.getTime() - eventDate.getTime();
                                        const diffDays = diffMs / (1000 * 60 * 60 * 24);

                                        if (activityTimeRange === 'today') {
                                            return eventDate.toDateString() === now.toDateString();
                                        } else if (activityTimeRange === '7d') {
                                            return diffDays <= 7;
                                        } else if (activityTimeRange === '30d') {
                                            return diffDays <= 30;
                                        }
                                        return true;
                                    }).slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event: any) => (
                                        <div key={event.id} className="p-6 px-10 flex items-center gap-8 hover:bg-white/[0.02] transition-colors relative">
                                            {isGlobal && (
                                                <div className="absolute top-0 right-0 px-4 py-1 bg-gold-500/10 text-gold-500 text-[7px] font-black uppercase tracking-widest border-l border-b border-white/10 rounded-bl-lg">
                                                    {event.clubName}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold text-white">{event.userName}</span>
                                                    <span className="text-[10px] text-white uppercase tracking-widest">{event.action}</span>
                                                </div>
                                                <p className="text-[11px] text-white leading-relaxed font-sans italic">&quot;{event.details}&quot;</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/15 rounded-lg">
                                                    <Clock className="w-3 h-3 text-gold-500" />
                                                    <span className="text-[10px] text-white font-mono tracking-tight">
                                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white">Sequence Verified</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {isMomModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[92vh] bg-[#050505] border border-white/15 rounded-[2rem] p-8 shadow-3xl overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-astronomus text-white mb-0.5 uppercase tracking-wider">Log Meeting</h3>
                                    <p className="text-[9px] text-white font-bold uppercase tracking-widest opacity-60">Meeting Minutes Documentation</p>
                                </div>
                                <button onClick={() => setIsMomModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5 text-white" /></button>
                            </div>

                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                <form onSubmit={handleSaveMOM} className="space-y-4 pb-2">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Session Date</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={momForm.date}
                                                onChange={e => setMomForm({...momForm, date: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Start Time</label>
                                            <input 
                                                type="time" 
                                                value={momForm.startTime}
                                                onChange={e => setMomForm({...momForm, startTime: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">End Time</label>
                                            <input 
                                                type="time" 
                                                value={momForm.endTime}
                                                onChange={e => setMomForm({...momForm, endTime: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Associate Event (Optional)</label>
                                        <select 
                                            value={momForm.eventId}
                                            onChange={e => setMomForm({...momForm, eventId: e.target.value})}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">General Organizational Sync</option>
                                            {activeClub?.events?.map(e => (
                                                <option key={e.id} value={e.id}>{e.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Attendees Of Meeting</label>
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950 border border-white/10 rounded-xl min-h-[60px]">
                                        {members.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    const newAttendees = momForm.attendees.includes(m.id)
                                                        ? momForm.attendees.filter(id => id !== m.id)
                                                        : [...momForm.attendees, m.id];
                                                    setMomForm({...momForm, attendees: newAttendees});
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${momForm.attendees.includes(m.id) ? 'bg-gold-500 text-black shadow-gold-glow' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                                            >
                                                {m.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Key Objectives</label>
                                        <textarea 
                                            required
                                            value={momForm.keyTopics}
                                            onChange={e => setMomForm({...momForm, keyTopics: e.target.value})}
                                            className="w-full h-20 bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none resize-none"
                                            placeholder="Discourser..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Decisions</label>
                                        <textarea 
                                            required
                                            value={momForm.progressNotes}
                                            onChange={e => setMomForm({...momForm, progressNotes: e.target.value})}
                                            className="w-full h-20 bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none resize-none"
                                            placeholder="Resolutions..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Efficiency</label>
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(star => (
                                                <button 
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setMomForm({...momForm, rating: star})}
                                                    className={`p-0.5 transition-all ${star <= momForm.rating ? 'text-gold-500' : 'text-zinc-800'}`}
                                                >
                                                    <Star className={`w-4 h-4 ${star <= momForm.rating ? 'fill-gold-500' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" className="bg-gold-gradient text-black font-black uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-xl hover:scale-105 transition-transform shadow-gold-glow">
                                        Save It
                                    </button>
                                </div>
                            </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Task Assignment Modal */}
            <AnimatePresence>
                {isTaskModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[92vh] bg-[#050505] border border-white/15 rounded-[2rem] p-8 shadow-3xl overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-astronomus text-white mb-0.5 uppercase tracking-wider">Assign Task</h3>
                                    <p className="text-[9px] text-white font-bold uppercase tracking-widest opacity-60">Strategic Task Allocation</p>
                                </div>
                                <button onClick={() => setIsTaskModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5 text-white" /></button>
                            </div>

                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                <form onSubmit={handleAssignTask} className="space-y-4 pb-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Task Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={taskForm.title}
                                            onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
                                            placeholder="What task is it..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Task Description</label>
                                        <textarea 
                                            required
                                            value={taskForm.description}
                                            onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                                            className="w-full h-16 bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none resize-none"
                                            placeholder="What is the task about..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Assign to</label>
                                            <select 
                                                required
                                                value={taskForm.assigneeId}
                                                onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none appearance-none"
                                            >
                                                <option value="">Select Asset</option>
                                                {members.filter(m => m.id !== user?.uid).map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Deadline</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={taskForm.deadline}
                                                onChange={e => setTaskForm({...taskForm, deadline: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Associate Event (Optional)</label>
                                        <select 
                                            value={taskForm.eventId}
                                            onChange={e => setTaskForm({...taskForm, eventId: e.target.value})}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">General Organizational Sync</option>
                                            {activeClub?.events?.map(e => (
                                                <option key={e.id} value={e.id}>{e.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Domain</label>
                                            <select 
                                                value={taskForm.domain}
                                                onChange={e => setTaskForm({...taskForm, domain: e.target.value as any})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none appearance-none"
                                            >
                                                <option value="Management">Management</option>
                                                <option value="Technical">Technical</option>
                                                <option value="Creative">Creative</option>
                                                <option value="PR/Outreach">PR/Outreach</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Resource Link</label>
                                            <input 
                                                type="url" 
                                                value={taskForm.externalLink}
                                                onChange={e => setTaskForm({...taskForm, externalLink: e.target.value})}
                                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    {suggestedMembers.length > 0 && (
                                        <div className="p-5 bg-gold-500/5 border border-gold-500/20 rounded-2xl">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gold-500 block mb-3 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Recommended Assets for {taskForm.domain}
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {suggestedMembers.map(({ member, matchedSkills }) => (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => setTaskForm({ ...taskForm, assigneeId: member.id })}
                                                        className={`p-3.5 text-left rounded-xl border transition-all flex flex-col justify-between ${taskForm.assigneeId === member.id ? 'bg-gold-500/10 border-gold-500 shadow-gold-glow' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                                                    >
                                                        <div>
                                                            <p className="text-[10px] font-black text-white uppercase truncate">{member.name}</p>
                                                            <p className="text-[8px] text-zinc-400 uppercase truncate font-bold mt-0.5">{member.customPosition || member.role}</p>
                                                        </div>
                                                        {matchedSkills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2.5">
                                                                {matchedSkills.slice(0, 2).map((sk, idx) => (
                                                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/20 text-[6px] font-black text-gold-400 uppercase tracking-widest">
                                                                        {sk}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/5 flex gap-3">
                                        <button onClick={() => setIsTaskModalOpen(false)} type="button" className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-all">
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-1 bg-gold-gradient text-black font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl hover:scale-[1.02] transition-all shadow-gold-glow">
                                            Assign
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
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
                            <p className="text-zinc-300 text-xs mb-8 leading-relaxed">
                                Are you sure you want to remove <strong className="text-white">{(activeClub?.members || []).find(m => m.id === memberToRemove)?.name || ""}</strong> from the core roster? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMemberToRemove(null)}
                                    className="flex-1 px-6 py-4 rounded-xl border border-white/15 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-white"
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
