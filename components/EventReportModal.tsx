"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Save, Copy, Check } from "lucide-react";
import { EventReport } from "@/lib/types";

interface EventReportModalProps {
  isOpen: boolean;
  eventName: string;
  report: EventReport;
  onClose: () => void;
  onSave: (updatedContent: string) => void;
}

export default function EventReportModal({ isOpen, eventName, report, onClose, onSave }: EventReportModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(report.content);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onSave(editContent);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isEditing ? editContent : report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-3xl flex flex-col max-h-[85vh]"
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 flex items-start justify-between pr-8">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Event Report</h3>
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mt-1">{eventName}</p>
              <p className="text-neutral-600 text-[9px] mt-1">
                Generated: {new Date(report.generatedAt).toLocaleDateString()}
                {report.lastEditedAt && ` · Edited: ${new Date(report.lastEditedAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-full min-h-[400px] bg-black border border-white/10 rounded-2xl p-6 text-sm text-neutral-300 outline-none focus:border-gold-500/30 resize-none font-sans leading-relaxed"
              />
            ) : (
              <div className="bg-black/40 border border-white/5 rounded-2xl p-8">
                <div className="prose prose-invert prose-sm max-w-none">
                  {report.content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('# ', '')}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-gold-400 mt-5 mb-2">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white text-sm my-2">{line.replace(/\*\*/g, '')}</p>;
                    if (line.startsWith('- ')) return <li key={i} className="text-sm text-neutral-300 ml-4 my-1 list-disc">{line.replace('- ', '')}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="text-sm text-neutral-300 leading-relaxed my-1">{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>

            {isEditing ? (
              <button onClick={handleSave} className="flex-1 py-3 bg-gold-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all flex items-center justify-center gap-2">
                <Save className="w-3 h-3" /> Save Changes
              </button>
            ) : (
              <button onClick={() => { setEditContent(report.content); setIsEditing(true); }} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Pencil className="w-3 h-3" /> Edit Report
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
