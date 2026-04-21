"use client";

import React from "react";
import { Globe, Trophy, Folder, Shield, Settings, Users, Zap, ChartBar, Banknote } from "lucide-react";
import { NavSection } from "./AppSidebar";
import { MemberRole } from "@/lib/types";

interface MobileNavProps {
    activeSection: NavSection;
    onSectionChange: (section: NavSection) => void;
    userRole?: MemberRole;
}

export default function MobileNav({ activeSection, onSectionChange, userRole = 'Admin' }: MobileNavProps) {
    const sections = [
        { id: 'my-team' as NavSection, label: 'Team', icon: Shield },
        { id: 'explore-clubs' as NavSection, label: 'Clubs', icon: Globe },
        { id: 'explore-events' as NavSection, label: 'Events', icon: Trophy },
        { id: 'my-clubs' as NavSection, label: 'My Hub', icon: Folder },
        { id: 'membership' as NavSection, label: 'Members', icon: Users, restricted: true },
        // Add more if needed, but 4-5 is best for bottom nav
    ].filter(section => {
        if (userRole === 'Junior Core' && section.restricted) return false;
        return true;
    });

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-4 pb-6 pt-3 z-[100] flex items-center justify-around">
            {sections.map((section) => {
                const isActive = activeSection === section.id;
                const Icon = section.icon;

                return (
                    <button
                        key={section.id}
                        onClick={() => onSectionChange(section.id)}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-gold-400 scale-110' : 'text-zinc-300'}`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-zinc-300'}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'text-signature-gradient' : ''}`}>
                            {section.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
