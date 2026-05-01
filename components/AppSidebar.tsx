"use client";

import React from "react";
import { Globe, Trophy, Folder, ChartBar, Banknote, Users, Shield, Zap } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MemberRole } from "@/lib/types";
import { useRef } from "react";

export type NavSection = 'explore-clubs' | 'explore-events' | 'my-clubs' | 'my-team' | 'membership' | 'ideation' | 'social-tracker' | 'sponsorship';

interface AppSidebarProps {
    activeSection: NavSection;
    onSectionChange: (section: NavSection) => void;
    userRole?: MemberRole;
}

interface SidebarItemProps {
    section: any;
    isActive: boolean;
    onSectionChange: (id: NavSection) => void;
    mouseY: any;
}

function SidebarItem({ section, isActive, onSectionChange, mouseY }: SidebarItemProps) {
    const ref = useRef<HTMLButtonElement>(null);
    
    const distance = useTransform(mouseY, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
        return val - bounds.y - bounds.height / 2;
    });
    
    const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.15, 1]);
    const Icon = section.icon;

    return (
        <motion.button
            ref={ref}
            style={{ scale: scaleSync }}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex flex-row flex-nowrap items-center gap-4 px-4 py-2.5 rounded-2xl transition-all duration-300 group relative ${isActive
                ? 'bg-[#0f0f0f] border border-gold-500/50'
                : 'bg-[#050505] text-white hover:bg-[#0f0f0f] border border-white/15'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-gold-500 rounded-full"
                />
            )}
            <Icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gold-400' : 'text-white/60'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${isActive ? 'translate-x-1 text-signature-gradient' : 'text-white/80'}`}>
                {section.label}
            </span>
        </motion.button>
    );
}

export default function AppSidebar({ activeSection, onSectionChange, userRole = 'Admin' }: AppSidebarProps) {
    const groupedSections = [
        {
            title: "Management",
            items: [
                { id: 'my-team' as NavSection, label: 'My Team', icon: Shield },
                { id: 'my-clubs' as NavSection, label: 'My Clubs', icon: Folder },
            ]
        },
        {
            title: "Explore",
            items: [
                { id: 'explore-clubs' as NavSection, label: 'Explore Clubs', icon: Globe },
                { id: 'explore-events' as NavSection, label: 'Explore Events', icon: Trophy },
                { id: 'ideation' as NavSection, label: 'Event Ideation', icon: Zap },
            ]
        },
        {
            title: "Growth",
            items: [
                { id: 'membership' as NavSection, label: 'Membership X Recruitment', icon: Users, restricted: true },
                { id: 'social-tracker' as NavSection, label: 'Social Tracker', icon: ChartBar },
                { id: 'sponsorship' as NavSection, label: 'Funding X Sponsorship', icon: Banknote, restricted: true },
            ]
        }
    ];

    const mouseY = useMotionValue(Infinity);

    return (
        <aside 
            onMouseMove={(e) => mouseY.set(e.clientY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            className="hidden md:flex w-80 flex-col pt-8 pl-8 pr-8 border-r border-white/15 bg-black/35 sticky top-20 h-full min-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden pb-8 custom-scrollbar"
        >
            <div className="space-y-8">
                {groupedSections.map((group) => {
                    const items = group.items.filter((section) => {
                        if (userRole === 'Junior Core' && section.restricted) return false;
                        return true;
                    });

                    if (items.length === 0) return null;

                    return (
                        <div key={group.title} className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-signature-gradient px-4 mb-2">{group.title}</h3>
                            <div className="space-y-3">
                                {items.map((section) => (
                                    <SidebarItem
                                        key={section.id}
                                        section={section}
                                        isActive={activeSection === section.id}
                                        onSectionChange={onSectionChange}
                                        mouseY={mouseY}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
