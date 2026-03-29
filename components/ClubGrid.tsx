"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, FolderClosed, Pencil, Trash2 } from "lucide-react";

interface GridItem {
  id: string;
  name: string;
}

interface ClubGridProps {
  items: GridItem[];
  onItemClick: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => void;
  onAddClick: () => void;
  title: string;
  subtitle: string;
  addLabel: string;
}

const GoldFolder = ({ name, onClick, onRename, onDelete }: { name: string; onClick: () => void; onRename: () => void; onDelete: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className="group relative flex flex-col items-center gap-3 p-4 w-32"
  >
    <div
      onClick={onClick}
      className="relative w-20 h-16 cursor-pointer transform transition-transform group-hover:scale-105"
    >
      <div className="absolute -top-1 left-1 w-10 h-4 bg-gold-600 rounded-t-lg -z-10 shadow-sm" />
      <div className="absolute inset-0 bg-gold-600 rounded-lg shadow-lg border border-gold-500/20" />
      <div className="absolute inset-0 top-2.5 bg-mac-folder rounded-md shadow-2xl border-t border-gold-100/40 flex items-center justify-center overflow-hidden">
        <FolderClosed className="w-7 h-7 text-gold-100/40" />
      </div>
    </div>

    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-signature-gradient transition-colors text-center truncate w-full px-1 font-sans">
        {name}
      </span>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onRename(); }}
          className="p-1 rounded-md hover:bg-white/10 text-neutral-500 hover:text-blue-400 transition-colors"
          title="Rename"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md hover:bg-white/10 text-neutral-500 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </motion.div>
);

export default function ClubGrid({ items, onItemClick, onRename, onDelete, onAddClick, title, subtitle, addLabel }: ClubGridProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">{title}</h2>
          <p className="text-neutral-500 text-sm mt-1 font-medium tracking-[0.2em] uppercase">{subtitle}</p>
        </div>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-6">
        <div onClick={onAddClick} className="group flex flex-col items-center gap-3 p-4 w-32 cursor-pointer">
          <div className="w-20 h-16 rounded-xl border-2 border-dashed border-neutral-800 flex items-center justify-center group-hover:border-gold-500/60 transition-all duration-500">
            <Plus className="w-7 h-7 text-neutral-700 group-hover:text-gold-400 group-hover:rotate-90 transition-transform" />
          </div>
          <span className="text-[11px] font-bold text-neutral-600 group-hover:text-signature-gradient uppercase tracking-widest">{addLabel}</span>
        </div>
        {items.map((item) => (
          <GoldFolder
            key={item.id}
            name={item.name}
            onClick={() => onItemClick(item.id)}
            onRename={() => onRename(item.id, item.name)}
            onDelete={() => onDelete(item.id, item.name)}
          />
        ))}
      </div>
    </motion.div>
  );
}