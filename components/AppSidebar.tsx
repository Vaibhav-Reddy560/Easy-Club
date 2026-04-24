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

export default function AppSidebar({ activeSection, onSectionChange, userRole = 'Admin' }: AppSidebarProps) {
    const sections = [
        { id: 'my-team' as NavSection, label: 'My Team', icon: Shield },
        { id: 'explore-clubs' as NavSection, label: 'Explore Clubs', icon: Globe },
        { id: 'explore-events' as NavSection, label: 'Explore Events', icon: Trophy },
        { id: 'my-clubs' as NavSection, label: 'My Clubs', icon: Folder },
        { id: 'membership' as NavSection, label: 'Membership X Recruitment', icon: Users, restricted: true },
        { id: 'ideation' as NavSection, label: 'Event Ideation', icon: Zap },
        { id: 'social-tracker' as NavSection, label: 'Social Tracker', icon: ChartBar },
        { id: 'sponsorship' as NavSection, label: 'Funding X Sponsorship', icon: Banknote, restricted: true },
    ].filter(section => {
        if (userRole === 'Junior Core' && section.restricted) return false;
        return true;
    });

    const mouseY = useMotionValue(Infinity);

    return (
        <aside
            onMouseMove={(e) => mouseY.set(e.clientY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            className="hidden md:flex w-80 flex-col pt-16 pl-6 pr-8 border-r border-white/5 space-y-8 sticky top-20 h-[calc(100vh-5rem)]"
        >
            <div className="space-y-2">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const ref = useRef<HTMLButtonElement>(null);

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const distance = useTransform(mouseY, (val) => {
                        const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
                        return val - bounds.y - bounds.height / 2;
                    });

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.15, 1]);

                    return (
                        <motion.button
                            ref={ref}
                            style={{ scale: scaleSync }}
                            key={section.id}
                            onClick={() => onSectionChange(section.id)}
                            className={`w-full flex flex-row flex-nowrap items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? 'bg-gold-500/10 border border-gold-500/20 shadow-lg shadow-gold-500/5'
                                : 'text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-gold-500 rounded-full"
                                />
                            )}
                            <Icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gold-400' : 'text-white/60'}`} />
                            <span className={`text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 ${isActive ? 'translate-x-1 text-signature-gradient' : 'text-white'}`}>
                                {section.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

        </aside>
    );
}
