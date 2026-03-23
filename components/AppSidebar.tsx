"use client";

import React from "react";
import { Globe, Trophy, Folder, Zap, BarChart3, Banknote, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { MemberRole } from "@/lib/types";

export type NavSection = 'explore-clubs' | 'explore-events' | 'my-clubs' | 'my-team' | 'membership' | 'trending' | 'social-tracker' | 'sponsorship';

interface AppSidebarProps {
    activeSection: NavSection;
    onSectionChange: (section: NavSection) => void;
    userRole?: MemberRole;
}

export default function AppSidebar({ activeSection, onSectionChange, userRole = 'Admin' }: AppSidebarProps) {
    const sections = [
        { id: 'my-team' as NavSection, label: 'My Team Hub', icon: Shield },
        { id: 'explore-clubs' as NavSection, label: 'Explore Clubs', icon: Globe },
        { id: 'explore-events' as NavSection, label: 'Explore Events', icon: Trophy },
        { id: 'my-clubs' as NavSection, label: 'My Clubs', icon: Folder },
        { id: 'membership' as NavSection, label: 'Membership and Recruitment', icon: Users, restricted: true },
        { id: 'trending' as NavSection, label: 'Trending Event Ideas', icon: Zap },
        { id: 'social-tracker' as NavSection, label: 'Social Tracker', icon: BarChart3 },
        { id: 'sponsorship' as NavSection, label: 'Funding & Sponsorship', icon: Banknote, restricted: true },
    ].filter(section => {
        if (userRole === 'Junior Core' && section.restricted) return false;
        return true;
    });

    return (
        <aside className="w-80 flex flex-col pt-16 pr-8 border-r border-white/5 space-y-8 sticky top-20 h-[calc(100vh-5rem)]">
            <div className="space-y-2">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(section.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-lg shadow-gold-500/5'
                                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-gold-500 rounded-full"
                                />
                            )}
                            <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gold-400' : 'text-neutral-500'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? 'translate-x-1' : ''} transition-transform`}>
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto pb-8">
                <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 text-center space-y-3">
                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="w-5 h-5 text-gold-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white">Pro Insight</p>
                    <p className="text-[9px] text-neutral-500 leading-tight">Clubs with 3+ weekly events gain 40% more visibility.</p>
                </div>
            </div>
        </aside>
    );
}
