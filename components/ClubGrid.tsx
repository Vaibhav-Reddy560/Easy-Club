"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, FolderClosed, Pencil, Trash2, FileText, Clock, RotateCcw, CheckCircle } from "lucide-react";
import { Magnetic } from "@/components/animations/Magnetic";
import { EventStatus } from "@/lib/types";

interface GridItem {
  id: string;
  name: string;
  config?: {
    date?: string;
    status?: EventStatus;
    postponedTo?: string;
    report?: { content: string; generatedAt: string; lastEditedAt?: string };
  };
}

interface ClubGridProps {
  items: GridItem[];
  onItemClick: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => void;
  onAddClick: () => void;
  onStatusChange?: (id: string) => void;
  onViewReport?: (id: string) => void;
  onRevive?: (id: string) => void;
  title: string;
  subtitle: string;
  addLabel: string;
  isEventGrid?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Countdown helper
function getCountdown(dateStr?: string): string | null {
  if (!dateStr) return null;
  
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return null;
  
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff < 0) return "Past";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) return `${days}d left`;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Today!";
}

function getStatusColor(status?: EventStatus): string {
  switch (status) {
    case 'completed': return 'text-green-400';
    case 'cancelled': return 'text-neutral-600';
    case 'postponed': return 'text-yellow-400';
    default: return 'text-gold-500/60';
  }
}

const GoldFolder = ({ 
  name, 
  config,
  onClick, 
  onRename, 
  onDelete,
  onStatusChange,
  onViewReport,
  onRevive,
  isEventGrid
}: { 
  name: string; 
  config?: GridItem['config'];
  onClick: () => void; 
  onRename: () => void; 
  onDelete: () => void;
  onStatusChange?: () => void;
  onViewReport?: () => void;
  onRevive?: () => void;
  isEventGrid?: boolean;
}) => {
  const status = config?.status || 'upcoming';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const isPostponed = status === 'postponed';
  const hasReport = !!config?.report;
  const countdown = isEventGrid ? getCountdown(isPostponed ? config?.postponedTo : config?.date) : null;

  return (
    <Magnetic strength={0.2}>
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5, scale: 1.02 }}
        className={`group relative flex flex-col items-center gap-3 p-4 w-32 ${isCancelled ? 'grayscale opacity-50 hover:opacity-80 hover:grayscale-[50%]' : ''} transition-all duration-300`}
      >
        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 z-20">
            <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
          </div>
        )}

        {/* Folder */}
        <div
          onClick={isCancelled ? undefined : onClick}
          className={`relative w-20 h-16 ${isCancelled ? 'cursor-default' : 'cursor-pointer'} transform transition-transform group-hover:scale-105`}
        >
          <div className={`absolute -top-1 left-1 w-10 h-4 ${isCancelled ? 'bg-neutral-700' : 'bg-gold-600'} rounded-t-lg -z-10 shadow-sm transition-colors`} />
          <div className={`absolute inset-0 ${isCancelled ? 'bg-neutral-700' : 'bg-gold-600'} rounded-lg shadow-lg border ${isCancelled ? 'border-neutral-600' : 'border-gold-500/20'} transition-colors`} />
          <div className={`absolute inset-0 top-2.5 ${isCancelled ? 'bg-gradient-to-b from-neutral-600 to-neutral-700' : 'bg-mac-folder'} rounded-md shadow-2xl border-t ${isCancelled ? 'border-neutral-500/40' : 'border-gold-100/40'} flex items-center justify-center overflow-hidden`}>
            <FolderClosed className={`w-7 h-7 ${isCancelled ? 'text-neutral-500/40' : 'text-gold-100/40'}`} />
          </div>
        </div>

        {/* Name & countdown */}
        <div className="flex flex-col items-center gap-0.5 w-full">
          <span className={`text-[11px] font-semibold ${isCancelled ? 'text-neutral-600 line-through' : 'text-neutral-400 group-hover:text-signature-gradient'} transition-colors text-center truncate w-full px-1 font-sans`}>
            {name}
          </span>

          {/* Status indicators */}
          {isEventGrid && (
            <div className="flex flex-col items-center gap-0.5 min-h-[16px]">
              {isPostponed && config?.postponedTo && (
                <span className="text-[8px] text-yellow-500/80 font-bold uppercase tracking-wider">
                  Moved: {new Date(config.postponedTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {isCancelled && (
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">Cancelled</span>
              )}
              {countdown && !isCancelled && status !== 'completed' && (
                <span className={`text-[8px] font-bold uppercase tracking-wider ${countdown === 'Past' ? 'text-red-400/60' : countdown === 'Today!' ? 'text-green-400 animate-pulse' : getStatusColor(status)}`}>
                  {countdown}
                </span>
              )}
              {isCompleted && (
                <span className="text-[8px] text-green-400/70 font-bold uppercase tracking-wider">Completed</span>
              )}
            </div>
          )}

          {/* Hover actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 items-center justify-center">
            {/* View Report (only for completed events with report) */}
            {hasReport && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewReport?.(); }}
                className="p-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors"
                title="View Report"
              >
                <FileText className="w-3 h-3" />
              </button>
            )}

            {/* Revive (only for cancelled) */}
            {isCancelled && onRevive && (
              <button
                onClick={(e) => { e.stopPropagation(); onRevive(); }}
                className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                title="Revive Event"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            {/* Mark Status (not for completed/cancelled) */}
            {isEventGrid && status !== 'completed' && !isCancelled && onStatusChange && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(); }}
                className="p-1 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/20 transition-colors"
                title="Update Status"
              >
                <Clock className="w-3 h-3" />
              </button>
            )}

            {/* Standard actions: Rename + Delete */}
            {!isCancelled && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onRename(); }}
                  className="p-1 rounded-md hover:bg-white/10 text-neutral-500 hover:text-blue-400 transition-colors"
                  title="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 rounded-md hover:bg-white/10 text-neutral-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Magnetic>
  );
};

export default function ClubGrid({ items, onItemClick, onRename, onDelete, onAddClick, onStatusChange, onViewReport, onRevive, title, subtitle, addLabel, isEventGrid }: ClubGridProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">{title}</h2>
          <p className="text-neutral-500 text-sm mt-1 font-medium tracking-[0.2em] uppercase">{subtitle}</p>
        </div>
      </header>
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-6"
      >
        <Magnetic strength={0.2} className="w-32">
          <motion.div variants={itemVariants} onClick={onAddClick} className="group flex flex-col items-center gap-3 p-4 w-full cursor-pointer">
            <div className="relative overflow-hidden w-20 h-16 rounded-xl glass-card flex items-center justify-center group-hover:border-gold-500/60 transition-all duration-500">
              <div className="relative z-10">
                <Plus className="w-7 h-7 text-neutral-500 group-hover:text-gold-400 group-hover:rotate-90 transition-transform" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-neutral-500 group-hover:text-signature-gradient uppercase tracking-widest">{addLabel}</span>
          </motion.div>
        </Magnetic>
        {items.map((item) => (
          <GoldFolder
            key={item.id}
            name={item.name}
            config={item.config}
            onClick={() => onItemClick(item.id)}
            onRename={() => onRename(item.id, item.name)}
            onDelete={() => onDelete(item.id, item.name)}
            onStatusChange={onStatusChange ? () => onStatusChange(item.id) : undefined}
            onViewReport={onViewReport ? () => onViewReport(item.id) : undefined}
            onRevive={onRevive ? () => onRevive(item.id) : undefined}
            isEventGrid={isEventGrid}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}