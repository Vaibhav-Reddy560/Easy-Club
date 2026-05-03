"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  ChevronDown,
  Layers
} from "lucide-react";
import { useTasks, BackgroundTask } from "@/lib/TaskContext";

interface DynamicIslandProps {
  isSaving?: boolean;
  isSyncing?: boolean;
}

export default function DynamicIsland({ isSaving, isSyncing }: DynamicIslandProps) {
  const { tasks } = useTasks();
  const [isHovered, setIsHovered] = useState(false);
  const activeTasks = tasks.filter(t => t.status === 'running');
  
  const hasGlobalActivity = isSaving || isSyncing || tasks.length > 0;

  if (!hasGlobalActivity && !isHovered) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] perspective-1000">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{
          width: isHovered ? 400 : (isSaving || isSyncing || activeTasks.length > 0 ? 240 : 180),
          height: isHovered ? (tasks.length > 0 ? 120 + (tasks.length * 40) : 100) : 42,
          borderRadius: isHovered ? 32 : 100,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          mass: 0.8
        }}
        className="bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-gold-500/10 overflow-hidden group"
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center gap-3 px-6"
            >
              {isSaving ? (
                <>
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-signature-gradient">Synchronizing...</span>
                </>
              ) : isSyncing ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Background Sync...</span>
                </>
              ) : activeTasks.length > 0 ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-gold-500 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {activeTasks.length} Active {activeTasks.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">System Ready</span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-gold-500/60 mt-0.5">Iron-Clad Disk Active</span>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gold-500/10 rounded-lg">
                    <Layers className="w-4 h-4 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Process Monitor</h4>
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Active Operations</p>
                  </div>
                </div>
                {(isSaving || isSyncing) && (
                  <div className={`flex items-center gap-2 px-3 py-1 ${isSaving ? 'bg-gold-500/5 border-gold-500/20' : 'bg-blue-500/5 border-blue-500/20'} border rounded-full`}>
                    <div className={`w-1.5 h-1.5 ${isSaving ? 'bg-gold-500' : 'bg-blue-500'} rounded-full animate-ping`} />
                    <span className={`text-[8px] font-black ${isSaving ? 'text-gold-500' : 'text-blue-400'} uppercase tracking-widest`}>
                      {isSaving ? 'Cloud Saving' : 'Cloud Fetch'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {tasks.length === 0 && !isSaving && !isSyncing && (
                  <div className="py-4 text-center">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">No background tasks</p>
                  </div>
                )}
                
                {tasks.map(task => (
                  <div key={task.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-4 transition-colors hover:bg-white/[0.05]">
                    <div className="shrink-0">
                      {task.status === 'running' ? (
                        <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                      ) : task.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white truncate mr-2">{task.name}</span>
                        <span className="text-[9px] font-bold text-zinc-500">{task.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          className={`h-full rounded-full ${task.status === 'error' ? 'bg-red-500' : 'bg-gold-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
