"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Activity, 
  Zap, 
  Users, 
  Layers,
  TrendingUp,
  Clock,
  Layout,
  ExternalLink,
  ArrowUpRight
} from "lucide-react";

interface AnalyticsViewProps {
  clubsCount: number;
  eventsCount: number;
  onBack: () => void;
}

// Number Ticker Component for that "live data" feel
const NumberTicker = ({ value, className }: { value: number | string, className?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const targetValue = typeof value === 'number' ? value : 0;

    useEffect(() => {
        if (typeof value !== 'number') return;
        let start = 0;
        const duration = 1000;
        const increment = targetValue / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= targetValue) {
                setDisplayValue(targetValue);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);
        
        return () => clearInterval(timer);
    }, [targetValue, value]);

    if (typeof value !== 'number') return <span className={className}>{value}</span>;
    return <span className={className}>{displayValue}</span>;
};

export default function AnalyticsView({ clubsCount, eventsCount, onBack }: AnalyticsViewProps) {
  const metrics = [
    { label: "Active Organizations", value: clubsCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
    { label: "Total Projects", value: eventsCount, icon: Layers, color: "text-gold-400", bg: "bg-gold-500/5", border: "border-gold-500/20" },
    { label: "AI Operations", value: "Locked", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/20" },
    { label: "Activity Index", value: "B+", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="max-w-7xl mx-auto px-4 md:px-0"
    >
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
          <ChevronLeft className="w-4 h-4 text-white/60 group-hover:-translate-x-1 group-hover:text-gold-400 transition-all" />
          <span className="text-xs uppercase font-black tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">Exit Command Center</span>
        </button>

        <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                    </div>
                ))}
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">3 active admins</span>
        </div>
      </div>

      <div className="space-y-12 pb-20">
        <header className="relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-12 bg-gold-500 rounded-full blur-[2px]" />
          <h2 className="text-5xl font-astronomus text-white tracking-tighter">
            Operational <span className="text-gold-gradient font-bold italic">Intelligence</span>
          </h2>
          <p className="text-white/50 text-sm mt-3 max-w-xl font-medium leading-relaxed">
            Real-time analytics engine processing club establishes, event lifecycle data, and operational productivity metrics across all connected nodes.
          </p>
        </header>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className={`relative bg-[#050505] backdrop-blur-xl border ${m.border} rounded-[2.5rem] p-8 group overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ArrowUpRight className={`w-4 h-4 ${m.color}`} />
              </div>
              
              <div className={`w-14 h-14 ${m.bg} rounded-[1.25rem] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <m.icon className={`w-7 h-7 ${m.color}`} />
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 group-hover:text-white/50 transition-colors">{m.label}</p>
              <h4 className="text-3xl text-white font-astronomus tracking-tighter">
                <NumberTicker value={m.value} />
              </h4>

              {/* Decorative accent */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${m.color.split('-')[1]}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Primary Data Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-0 bg-gold-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-[#050505] backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                <div>
                    <h4 className="text-2xl font-bold text-white tracking-tight">Productivity Pulse</h4>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Usage Patterns
                    </p>
                </div>
                <div className="flex items-center gap-6 p-2 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 px-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Growth</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Baseline</span>
                    </div>
                </div>
                </div>

                {/* Enhanced Chart Visual */}
                <div className="h-56 flex items-end justify-between gap-3 px-2">
                {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
                    <div key={i} className="flex-1 group cursor-pointer relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                            <div className="bg-white px-2 py-1 rounded-md text-[9px] font-black text-black shadow-xl">
                                {h}%
                            </div>
                        </div>
                        <div className="relative h-full flex items-end">
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${h}%`, opacity: 1 }}
                                transition={{ 
                                    delay: 0.5 + (i * 0.04),
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 100
                                }}
                                className="w-full bg-gold-500/10 rounded-t-xl group-hover:bg-gold-500/40 transition-all border-t border-white/20 relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                            </motion.div>
                        </div>
                    </div>
                ))}
                </div>
                
                <div className="flex justify-between mt-10 px-4 border-t border-white/5 pt-6">
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                        <span key={m} className="text-[9px] font-black text-white/20 tracking-[0.1em] group-hover:text-white/40 transition-colors">{m}</span>
                    ))}
                </div>
            </div>
          </div>

          <div className="bg-[#050505] backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 flex flex-col justify-between">
            <div>
                <h4 className="text-2xl font-bold text-white tracking-tight mb-10">Hub Distribution</h4>
                
                <div className="space-y-8">
                {[
                    { label: "Project Design", pct: 65, icon: Layout, color: "from-gold-600 to-gold-400" },
                    { label: "Content Generation", pct: 24, icon: Clock, color: "from-white/40 to-white/20" },
                    { label: "Trend Analysis", pct: 11, icon: TrendingUp, color: "from-blue-600 to-blue-400" }
                ].map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                <item.icon className="w-4 h-4 text-white/60 group-hover:text-gold-400 transition-colors" />
                            </div>
                            <span className="text-[11px] uppercase font-black text-white/60 tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-black text-white group-hover:scale-110 transition-transform">
                            <NumberTicker value={item.pct} />%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full p-[1px] overflow-hidden">
                        <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ delay: 0.8 + (i * 0.1), duration: 1.5, ease: "circOut" }}
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
                        >
                            <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                        </motion.div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gold-500/50" />
                <p className="text-[11px] text-white/40 font-medium leading-relaxed italic text-center px-4">
                    &quot;Heuristic analysis suggests a significant shift toward <span className="text-white">visual identity flows</span> in the current cluster.&quot;
                </p>
                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold-500 hover:text-white transition-colors group">
                        Full Report <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

