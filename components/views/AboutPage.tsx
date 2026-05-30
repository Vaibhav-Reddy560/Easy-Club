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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-8 py-12 px-6"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-signature-gradient font-bold hover:brightness-110 group transition-colors mb-4"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Return to Dashboard</span>
            </button>

            <div className="relative bg-[#050505] border border-white/10 rounded-[3rem] p-12 md:p-16 shadow-2xl overflow-hidden backdrop-blur-3xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient opacity-50" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Header Section */}
                <div className="flex items-start gap-6 mb-16 relative z-10">
                    <img
                        src="/Logo.png"
                        alt="Easy Club Logo"
                        className="w-16 h-16 object-contain brightness-110 drop-shadow-gold group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="flex-1 pt-0">
                        <h2 className="text-6xl font-normal tracking-wider text-signature-gradient font-airstream leading-none">Easy Club</h2>
                        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.25em] mt-3 ml-1">Club operations made easy</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-20 relative z-10">
                    {/* Vision */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-px bg-gold-500/20" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500/80">The Vision</h3>
                        </div>
                        <p className="text-lg text-zinc-300 leading-relaxed font-medium max-w-3xl">
                            <span className="text-white font-bold">Easy Club</span> is a comprehensive web application designed as a management system for student and professional clubs to automate design, content, and social scouting tasks. It serves as a definitive workspace for organizations to orchestrate seamless operations while facilitating discovery within a nationwide network of excellence.
                        </p>
                    </section>

                    {/* Lists Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                        {/* Capabilities */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <CircleCheck className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Core Capabilities</h3>
                            </div>
                            <ul className="space-y-5">
                                {[
                                    "Design, Social, Content domain automation",
                                    "Funding, Sponsorship Management",
                                    "Institutional Memory System",
                                    "Social Club Networking",
                                    "Idea Brainstorming"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm text-zinc-100 font-bold tracking-wide group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Non-Capabilities */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <CircleAlert className="w-4 h-4 text-red-500" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Non-Capabilities</h3>
                            </div>
                            <ul className="space-y-5">
                                {[
                                    "Legal Responsibility",
                                    "Physical Logistics handling",
                                    "Financial Liability",
                                    "Automatic Marketing",
                                    "Transaction processing"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm text-zinc-100 font-bold tracking-wide group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
