"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { useTasks, BackgroundTask } from "@/lib/TaskContext";

function TaskCard({ task, onClear }: { task: BackgroundTask; onClear: () => void }) {
    const isRunning = task.status === "running";
    const isSuccess = task.status === "success";
    const isError = task.status === "error";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`
                relative flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-2xl shadow-black/50
                backdrop-blur-xl overflow-hidden min-w-[280px] max-w-[360px]
                ${isSuccess ? "bg-green-950/80 border-green-500/20" : ""}
                ${isError ? "bg-red-950/80 border-red-500/20" : ""}
                ${isRunning ? "bg-zinc-900/90 border-white/10" : ""}
            `}
        >
            {/* Shimmer sweep for running state */}
            {isRunning && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
            )}

            {/* Icon */}
            <div className="shrink-0 relative z-10">
                {isRunning && <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                {isError && <XCircle className="w-5 h-5 text-red-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 relative z-10">
                <p className="text-[11px] font-black uppercase tracking-widest text-white truncate">
                    {task.name}
                </p>
                <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                    isSuccess ? "text-green-500" : isError ? "text-red-500" : "text-zinc-300"
                }`}>
                    {isRunning ? "Processing..." : isSuccess ? "Complete" : "Failed"}
                </p>

                {/* Progress bar (only while running) */}
                {isRunning && (
                    <div className="mt-2 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gold-500 rounded-full"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ width: "60%" }}
                        />
                    </div>
                )}
            </div>

            {/* Dismiss button */}
            {!isRunning && (
                <button
                    onClick={onClear}
                    className="shrink-0 p-1 text-zinc-200 hover:text-white transition-colors relative z-10"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </motion.div>
    );
}

export default function TaskOverlay() {
    const { tasks, clearTask } = useTasks();

    if (tasks.length === 0) return null;

    return (
        <div className="fixed bottom-24 md:bottom-8 right-6 z-[200] flex flex-col gap-3 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                    <div key={task.id} className="pointer-events-auto">
                        <TaskCard
                            task={task}
                            onClear={() => clearTask(task.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
