"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Activity, 
  Zap, 
  Users, 
  Layers,
  TrendingUp,
  Clock,
  Layout
} from "lucide-react";

interface AnalyticsViewProps {
  clubsCount: number;
  eventsCount: number;
  onBack: () => void;
}

export default function AnalyticsView({ clubsCount, eventsCount, onBack }: AnalyticsViewProps) {
  const metrics = [
    { label: "Active Organizations", value: clubsCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Projects", value: eventsCount, icon: Layers, color: "text-gold-500", bg: "bg-gold-500/10" },
    { label: "AI Operations", value: "Locked", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Activity Index", value: "B+", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gold-500 mb-8 font-bold hover:text-gold-400 group transition-colors"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm uppercase tracking-widest text-[#FFA500]">Back to Hub</span>
      </button>

      <div className="space-y-12">
        <header className="border-b border-white/5 pb-8">
          <h2 className="text-4xl font-bold tracking-tighter text-white">
            Usage <span className="text-neutral-600 font-normal ml-2">/ Analytics</span>
          </h2>
          <p className="text-neutral-500 text-sm mt-2 max-w-lg font-medium">
            Intelligence overview of your club establishes and event productions.
          </p>
        </header>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all group"
            >
              <div className={`w-12 h-12 ${m.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">{m.label}</p>
              <h4 className="text-3xl font-bold text-white tracking-tighter">{m.value}</h4>
            </motion.div>
          ))}
        </div>

        {/* Secondary Charts Section (Mock) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">Productivity Pulse</h4>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Real-time usage patterns</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Target</span>
                </div>
              </div>
            </div>

            {/* Mock Chart Visual */}
            <div className="h-48 flex items-end justify-between gap-2 px-4">
              {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
                <div key={i} className="flex-1 space-y-2 group cursor-pointer">
                  <div className="relative h-full flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + (i * 0.05) }}
                      className="w-full bg-gold-500/20 rounded-t-lg group-hover:bg-gold-500/40 transition-all border-t border-gold-500/40"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-8 px-4">
              {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                <span key={m} className="text-[8px] font-black text-neutral-600 tracking-tighter">{m}</span>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
            <h4 className="text-xl font-bold text-white tracking-tight">Hub Distribution</h4>
            
            <div className="space-y-6">
              {[
                { label: "Project Design", pct: 65, icon: Layout },
                { label: "Content Generation", pct: 24, icon: Clock },
                { label: "Trend Analysis", pct: 11, icon: TrendingUp }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                       <item.icon className="w-3 h-3 text-gold-500/50" />
                       <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: 0.8 }}
                      className="h-full bg-gold-gradient"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-neutral-500 font-medium italic">
                "Usage patterns indicate a high focus on Visual Identity establish flows."
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
