"use client";

import React, { useState } from "react";
import { Globe, Folder, Shield, Users, Zap, ChartBar, Banknote, Handshake, Menu, X } from "lucide-react";
import { NavSection } from "@/components/layout/AppSidebar";
import { MemberRole } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
    activeSection: NavSection;
    onSectionChange: (section: NavSection) => void;
    userRole?: MemberRole;
}

// Primary tabs shown in the bottom bar (max 4 + More)
const PRIMARY_SECTIONS = [
    { id: 'my-clubs' as NavSection, label: 'My Clubs', icon: Folder },
    { id: 'explore-clubs' as NavSection, label: 'Explore', icon: Globe },
    { id: 'my-team' as NavSection, label: 'My Team', icon: Shield },
    { id: 'collab-hub' as NavSection, label: 'Collab', icon: Handshake },
];

const MORE_SECTIONS = [
    { id: 'my-team' as NavSection, label: 'My Team', icon: Shield, group: 'Management' },
    { id: 'my-clubs' as NavSection, label: 'My Clubs', icon: Folder, group: 'Management' },
    { id: 'collab-hub' as NavSection, label: 'Collab Hub', icon: Handshake, group: 'Management' },
    { id: 'explore-clubs' as NavSection, label: 'Explore Clubs', icon: Globe, group: 'Explore' },
    { id: 'ideation' as NavSection, label: 'Event Ideation', icon: Zap, group: 'Explore' },
    { id: 'membership' as NavSection, label: 'Membership X Recruitment', icon: Users, group: 'Growth', restricted: true },
    { id: 'social-tracker' as NavSection, label: 'Social Tracker', icon: ChartBar, group: 'Growth' },
    { id: 'sponsorship' as NavSection, label: 'Funding X Sponsorship', icon: Banknote, group: 'Growth', restricted: true },
];

export default function MobileNav({ activeSection, onSectionChange, userRole = 'Admin' }: MobileNavProps) {
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const filteredMore = MORE_SECTIONS.filter(section => {
        if (userRole === 'Junior Core' && section.restricted) return false;
        return true;
    });

    // Check if the active section is in the "More" tray
    const isMoreActive = filteredMore.some(s => s.id === activeSection);

    const handleSelect = (id: NavSection) => {
        onSectionChange(id);
        setIsMoreOpen(false);
    };

    return (
        <>
            {/* Overlay backdrop when More tray is open */}
            <AnimatePresence>
                {isMoreOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMoreOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
                    />
                )}
            </AnimatePresence>

            {/* More tray */}
            <AnimatePresence>
                {isMoreOpen && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="md:hidden fixed bottom-0 left-0 right-0 z-[101] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl px-6 pt-6 pb-28"
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center mb-6">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setIsMoreOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Group by category */}
                        {['Management', 'Explore', 'Growth'].map(group => {
                            const items = filteredMore.filter(s => s.group === group);
                            if (items.length === 0) return null;
                            return (
                                <div key={group} className="mb-6">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-signature-gradient px-1 mb-3">{group}</h3>
                                    <div className="space-y-2">
                                        {items.map(section => {
                                            const isActive = activeSection === section.id;
                                            const Icon = section.icon;
                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => handleSelect(section.id)}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-[#0f0f0f] border border-gold-500/50'
                                                            : 'bg-[#050505] border border-white/10 hover:bg-[#0f0f0f]'
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gold-400' : 'text-white/50'}`} />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-signature-gradient' : 'text-white/70'}`}>
                                                        {section.label}
                                                    </span>
                                                    {isActive && (
                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom navigation bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 px-2 pb-6 pt-2 z-[100] flex items-center justify-around">
                {PRIMARY_SECTIONS.map((section) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;

                    return (
                        <button
                            key={section.id}
                            onClick={() => handleSelect(section.id)}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-0 ${
                                isActive ? 'text-gold-400' : 'text-zinc-500'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-zinc-500'}`} />
                            <span className={`text-[8px] font-bold uppercase tracking-tight whitespace-nowrap ${
                                isActive ? 'text-signature-gradient' : ''
                            }`}>
                                {section.label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-gold-500" />
                            )}
                        </button>
                    );
                })}

                {/* Menu button */}
                <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-0 ${
                        isMoreOpen || isMoreActive ? 'text-gold-400' : 'text-zinc-500'
                    }`}
                >
                    <Menu className={`w-5 h-5 ${isMoreOpen || isMoreActive ? 'text-gold-400' : 'text-zinc-500'}`} />
                    <span className={`text-[8px] font-bold uppercase tracking-tight whitespace-nowrap ${
                        isMoreOpen || isMoreActive ? 'text-signature-gradient' : ''
                    }`}>
                        Menu
                    </span>
                    {isMoreActive && !isMoreOpen && (
                        <div className="w-1 h-1 rounded-full bg-gold-500" />
                    )}
                </button>
            </nav>
        </>
    );
}
