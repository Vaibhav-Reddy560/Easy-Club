"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, CircleCheck, CircleAlert, ChevronLeft } from "lucide-react";

interface AboutPageProps {
    onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl mx-auto space-y-16 py-12 px-6"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-signature-gradient font-bold hover:brightness-110 group transition-colors mb-4"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm uppercase tracking-widest">Return to Dashboard</span>
            </button>

            <div className="relative bg-neutral-900/40 border border-white/5 rounded-[4rem] p-16 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-gradient" />

                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-[2rem] bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                        <Zap className="w-8 h-8 text-gold-500" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-normal tracking-wide text-signature-gradient font-airstream leading-none">Easy Club</h2>
                        <p className="text-signature-gradient font-black text-xs uppercase tracking-[0.3em] mt-1 ml-1 leading-none">The Ultimate Operating System for Organizations</p>
                    </div>
                </div>

                <div className="space-y-16">
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-signature-gradient flex items-center gap-3">
                            <span className="w-8 h-px bg-gold-500/30" /> The Vision
                        </h3>
                        <p className="text-lg text-neutral-300 leading-relaxed font-medium pl-11">
                            <span className="text-signature-gradient font-airstream">Easy Club</span> is a unified intelligence workspace designed to empower student organizations. It eliminates the manual friction of event management by automating content generation, streamlining design workflows, and facilitating expert outreach—all in one high-performance dashboard.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-11">
                        <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3">
                                <CircleCheck className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" /> Core Capabilities
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Multi-Club & Event Portfolio Tracking",
                                    "AI-Powered Promo Generation (Multi-Length)",
                                    "Strict Content Formatting Controls",
                                    "Local Project Persistence & Data Sync",
                                    "Design-Ready Domain Segregation",
                                    "Automated Expert Sourcing Workflows"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-xs text-neutral-400 font-bold group">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-3">
                                <CircleAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /> Non-Capabilities
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Physical Event Logistics Handling",
                                    "Financial Transaction Processing",
                                    "Real-time Attendance Tracking",
                                    "Club Membership Billing",
                                    "Hardware Resource Management"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-xs text-neutral-600 font-bold opacity-80 group">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-800 group-hover:scale-125 transition-transform" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-neutral-700 tracking-tighter uppercase">
                    <div className="flex gap-4">
                        <span className="px-3 py-1 bg-white/5 rounded-full">V 1.0.4 PRODUCTION</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full">System: Stable</span>
                    </div>
                    <span className="font-airstream text-lg mt-1 text-signature-gradient">© 2026 EASY CLUB INTEL</span>
                </div>
            </div>
        </motion.div>
    );
}
