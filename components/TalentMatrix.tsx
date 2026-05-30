"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    Search, 
    Filter, 
    Mail, 
    Tag, 
    Briefcase, 
    ChevronRight,
    BrainCircuit,
    Star,
    ExternalLink
} from "lucide-react";
import { Club, ClubMember, Skill } from "@/lib/types";

interface TalentMatrixProps {
    clubs: Club[];
    onBack?: () => void;
}

export default function TalentMatrix({ clubs, onBack }: TalentMatrixProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    // Aggregate all members with club context
    const allMembersWithContext = useMemo(() => {
        const members: { member: ClubMember; clubName: string; clubId: string }[] = [];
        
        clubs.forEach(club => {
            // Add regular members
            (club.members || []).forEach(m => {
                members.push({ member: m, clubName: club.name, clubId: club.id });
            });
            
            // Add owner as an admin
            if (club.ownerId && club.ownerEmail) {
                const ownerExists = (club.members || []).some(m => m.id === club.ownerId);
                if (!ownerExists) {
                    members.push({
                        member: {
                            id: club.ownerId,
                            name: club.ownerName || "Founder",
                            email: club.ownerEmail,
                            role: 'Admin',
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

    // Extract all unique skills across all members
    const allUniqueSkills = useMemo(() => {
        const skills = new Set<string>();
        allMembersWithContext.forEach(({ member }) => {
            (member.skills || []).forEach(s => {
                const name = typeof s === 'string' ? s : s.name;
                skills.add(name);
            });
        });
        return Array.from(skills).sort();
    }, [allMembersWithContext]);

    // Filtered and Sorted list
    const filteredMembers = useMemo(() => {
        const filtered = allMembersWithContext.filter(({ member, clubName }) => {
            const matchesSearch = 
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clubName.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSkill = !selectedSkill || (member.skills || []).some(s => {
                const name = typeof s === 'string' ? s : s.name;
                return name === selectedSkill;
            });
            
            return matchesSearch && matchesSkill;
        });

        // Sort by competency if a skill is selected
        if (selectedSkill) {
            return filtered.sort((a, b) => {
                const getScore = (m: ClubMember) => {
                    const skill = (m.skills || []).find(s => (typeof s === 'string' ? s : s.name) === selectedSkill);
                    if (!skill) return 0;
                    if (typeof skill === 'string') return 1;
                    return skill.level === 'Expert' ? 3 : skill.level === 'Proficient' ? 2 : 1;
                };
                return getScore(b.member) - getScore(a.member);
            });
        }
        return filtered;
    }, [allMembersWithContext, searchQuery, selectedSkill]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter py-2 flex items-center gap-4">
                        <BrainCircuit className="w-10 h-10 text-gold-500" />
                        Talent Discovery Matrix
                    </h2>
                    <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-[0.2em] mt-1">
                        Cross-Club Human Capital Intelligence & Skill Mapping
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-gold-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search Name, Email, or Club..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0f0f0f] border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm text-white outline-none focus:border-gold-500/50 min-w-[300px] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Skill Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-[2rem] border border-white/10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-signature-gradient mb-6 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Expertise Filters
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedSkill(null)}
                                className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${!selectedSkill ? 'bg-gold-500 text-black shadow-gold-glow' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                            >
                                All Talent
                            </button>
                            {allUniqueSkills.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
                                    className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${selectedSkill === skill ? 'bg-gold-500 text-black shadow-gold-glow' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>

                        {allUniqueSkills.length === 0 && (
                            <p className="text-[10px] text-zinc-500 italic mt-4 px-2">
                                No skills mapped yet. Add skills to members in Membership view.
                            </p>
                        )}
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] border border-white/10 bg-gold-500/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gold-500 mb-4 flex items-center gap-2">
                            <Star className="w-3 h-3" /> Quick Stats
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-astronomus text-white">{filteredMembers.length}</p>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">Active Personnel</p>
                            </div>
                            <div>
                                <p className="text-2xl font-astronomus text-white">{allUniqueSkills.length}</p>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">Mapped Skills</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Talent Grid */}
                <div className="lg:col-span-3 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredMembers.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-panel py-32 rounded-[3rem] flex flex-col items-center justify-center text-center border-dashed border-white/10"
                            >
                                <Users className="w-16 h-16 text-white/10 mb-6" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">No Matches Found</h3>
                                <p className="text-zinc-400 text-sm mt-2">Try adjusting your search or filters.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMembers.map(({ member, clubName, clubId }) => (
                                    <motion.div
                                        key={`${clubId}-${member.id}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-card group p-6 rounded-[2.5rem] border border-white/10 hover:border-gold-500/30 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-black text-xl font-black">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors leading-none">{member.name}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                            member.role === 'Admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                            member.role === 'Senior Core' ? 'bg-gold-500/10 border-gold-500/20 text-gold-400' :
                                                            'bg-white/5 border-white/10 text-white'
                                                        }`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-signature-gradient uppercase tracking-widest">{clubName}</p>
                                                <p className="text-[8px] text-zinc-500 uppercase tracking-tighter mt-1">Source Cluster</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-3 text-zinc-400">
                                                <Mail className="w-3 h-3" />
                                                <span className="text-[10px] font-mono tracking-tighter">{member.email}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                                {(member.skills || []).length > 0 ? (
                                                    (member.skills || []).map((skill, idx) => {
                                                        const sName = typeof skill === 'string' ? skill : skill.name;
                                                        const sLevel = typeof skill === 'string' ? 'Novice' : skill.level;
                                                        const stars = sLevel === 'Expert' ? 3 : sLevel === 'Proficient' ? 2 : 1;
                                                        const isMatch = sName === selectedSkill;

                                                        return (
                                                            <div 
                                                                key={idx}
                                                                className={`flex flex-col gap-1 px-3 py-1.5 rounded-xl border transition-all ${isMatch ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/5 border-white/10'}`}
                                                            >
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isMatch ? 'text-gold-400' : 'text-white/60'}`}>
                                                                    {sName}
                                                                </span>
                                                                <div className="flex gap-0.5">
                                                                    {[1, 2, 3].map(i => (
                                                                        <Star 
                                                                            key={i} 
                                                                            className={`w-2 h-2 ${i <= stars ? (isMatch ? 'text-gold-500 fill-gold-500 shadow-gold-glow' : 'text-gold-500/50 fill-gold-500/50') : 'text-white/5 fill-white/5'}`} 
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-[9px] text-zinc-600 italic">No skills mapped</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                                        <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 text-white/0 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
