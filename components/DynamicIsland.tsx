"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, BackgroundTask } from "@/lib/TaskContext";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function DynamicIsland() {
  const { tasks } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTask, setActiveTask] = useState<BackgroundTask | null>(null);

  // Automatically select the most recently active/running task or fallback
  useEffect(() => {
    if (tasks.length === 0) {
      setActiveTask(null);
      setIsExpanded(false);
      return;
    }
    
    // Sort tasks to prioritize running ones
    const runningTasks = tasks.filter(t => t.status === 'running');
    if (runningTasks.length > 0) {
      setActiveTask(runningTasks[runningTasks.length - 1]);
    } else {
      setActiveTask(tasks[tasks.length - 1]);
    }
  }, [tasks]);

  // If no active task, render the resting "notch" state
  if (!activeTask) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed left-1/2 -translate-x-1/2 top-4 z-[999] overflow-hidden bg-black/95 backdrop-blur-2xl border border-white/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-default"
        style={{
          borderRadius: 32,
          width: 80,
          height: 28,
        }}
      >
        <div className="w-full h-full flex items-center justify-center gap-2 opacity-30">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        </div>
      </motion.div>
    );
  }

  // Determine icon and color based on status
  const getStatusConfig = () => {
    switch (activeTask.status) {
      case 'running':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 text-gold-500 animate-spin" />,
          color: "border-gold-500/30",
          textColor: "text-white"
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
          color: "border-green-500/30",
          textColor: "text-green-500"
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
          color: "border-red-500/30",
          textColor: "text-red-500"
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" />,
          color: "border-blue-500/30",
          textColor: "text-blue-500"
        };
    }
  };

  const config = getStatusConfig();
  const hasMultipleTasks = tasks.length > 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="active-island"
        layout
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          mass: 0.8 
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed left-1/2 -translate-x-1/2 top-4 z-[999] overflow-hidden bg-black/95 backdrop-blur-2xl border ${config.color} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] cursor-pointer group`}
        style={{
          borderRadius: 32,
        }}
      >
        <motion.div 
          layout
          className="flex flex-col justify-center px-4"
          animate={{
            width: isExpanded ? 300 : "auto",
            minWidth: isExpanded ? 300 : 120,
            height: isExpanded ? (hasMultipleTasks ? "auto" : 64) : 40,
            paddingTop: isExpanded ? 12 : 0,
            paddingBottom: isExpanded ? 12 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Compact View / Header View */}
          <motion.div layout className="flex items-center justify-between h-[40px] shrink-0">
            <div className="flex items-center gap-3">
              <div className="shrink-0 flex items-center justify-center">
                {config.icon}
              </div>
              <motion.span 
                layout="position"
                className={`text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] ${isExpanded ? "text-neutral-300" : config.textColor}`}
              >
                {activeTask.name}
              </motion.span>
            </div>
            
            {/* Minimal Progress indicator (only on compact) */}
            {!isExpanded && activeTask.status === 'running' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 pl-3"
              >
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gold-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeTask.progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}
            
            {/* Multiple Tasks Indicator */}
            {!isExpanded && hasMultipleTasks && (
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-neutral-400 ml-2">
                +{tasks.length - 1}
              </div>
            )}
          </motion.div>

          {/* Expanded Detail View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-3"
              >
                {tasks.map((task) => (
                  <div key={task.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{task.name}</span>
                      <span className="text-[10px] text-white font-mono">{Math.round(task.progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${task.status === 'success' ? 'bg-green-500' : task.status === 'error' ? 'bg-red-500' : 'bg-gold-gradient'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
