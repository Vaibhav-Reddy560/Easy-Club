"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, FolderClosed } from "lucide-react";

/**
 * Internal GoldFolder component for the grid
 */
const GoldFolder = ({ name, onClick }: { name: string; onClick?: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -3 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="group flex flex-col items-center gap-3 cursor-pointer p-4 w-32"
  >
    <div className="relative w-20 h-16">
      <div className="absolute -top-1 left-1 w-10 h-4 bg-gold-600 rounded-t-lg -z-10 shadow-sm" />
      <div className="absolute inset-0 bg-gold-600 rounded-lg shadow-lg border border-gold-500/20" />
      <div className="absolute inset-0 top-2.5 bg-mac-folder rounded-md shadow-2xl border-t border-gold-100/40 flex items-center justify-center overflow-hidden">
        <FolderClosed className="w-7 h-7 text-gold-100/40" />
      </div>
    </div>
    <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-gold-400 transition-colors text-center truncate w-full px-1 font-sans">
      {name}
    </span>
  </motion.div>
);

interface ClubGridProps {
  items: any[];
  onItemClick: (id: string) => void;
  onAddClick: () => void;
  title: string;
  subtitle: string;
  addLabel: string;
}

export default function ClubGrid({ items, onItemClick, onAddClick, title, subtitle, addLabel }: ClubGridProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">{title}</h2>
          <p className="text-neutral-500 text-sm mt-1 italic font-medium">{subtitle}</p>
        </div>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-6">
        <div onClick={onAddClick} className="group flex flex-col items-center gap-3 p-4 w-32 cursor-pointer">
          <div className="w-20 h-16 rounded-xl border-2 border-dashed border-neutral-800 flex items-center justify-center group-hover:border-gold-500/60 transition-all duration-300">
            <Plus className="w-7 h-7 text-neutral-700 group-hover:text-gold-400" />
          </div>
          <span className="text-[11px] font-bold text-neutral-600 group-hover:text-gold-500 uppercase tracking-widest">{addLabel}</span>
        </div>
        {items.map((item) => (
          <GoldFolder key={item.id} name={item.name} onClick={() => onItemClick(item.id)} />
        ))}
      </div>
    </motion.div>
  );
}