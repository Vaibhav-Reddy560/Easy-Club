"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, XCircle, Loader2, Sparkles } from "lucide-react";
import { ClubEvent, EventStatus, PostEventData } from "@/lib/types";

interface EventStatusModalProps {
  isOpen: boolean;
  event: ClubEvent;
  onClose: () => void;
  onStatusChange: (
    eventId: string, 
    status: EventStatus, 
    extra?: { 
      postponedTo?: string; 
      postEventData?: PostEventData;
      reportContent?: string;
    }
  ) => void;
}

type Step = 'choose' | 'completed-form' | 'postponed-form' | 'cancelled-confirm' | 'generating';

export default function EventStatusModal({ isOpen, event, onClose, onStatusChange }: EventStatusModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [postponedDate, setPostponedDate] = useState("");

  // Post-event form state
  const [totalRegistrations, setTotalRegistrations] = useState("");
  const [totalAttendees, setTotalAttendees] = useState("");
  const [clubMembers, setClubMembers] = useState("");
  const [engagement, setEngagement] = useState("");
  const [benefits, setBenefits] = useState("");
  const [conductSummary, setConductSummary] = useState("");

  const resetForm = () => {
    setStep('choose');
    setPostponedDate("");
    setTotalRegistrations("");
    setTotalAttendees("");
    setClubMembers("");
    setEngagement("");
    setBenefits("");
    setConductSummary("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePostponed = () => {
    if (!postponedDate) return;
    onStatusChange(event.id, 'postponed', { postponedTo: postponedDate });
    handleClose();
  };

  const handleCancelled = () => {
    onStatusChange(event.id, 'cancelled');
    handleClose();
  };

  const handleCompletedSubmit = async () => {
    const regs = parseInt(totalRegistrations) || 0;
    const attendees = parseInt(totalAttendees) || 0;
    const clubMem = parseInt(clubMembers) || 0;

    const postEventData: PostEventData = {
      totalRegistrations: regs,
      totalAttendees: attendees,
      clubMemberAttendees: clubMem,
      nonClubMemberAttendees: Math.max(0, attendees - clubMem),
      participantEngagement: engagement,
      benefitsGained: benefits,
      conductSummary: conductSummary,
    };

    setStep('generating');

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, postEventData }),
      });
      const data = await res.json();

      if (data.error) {
        alert("Report generation failed: " + data.error);
        setStep('completed-form');
        return;
      }

      onStatusChange(event.id, 'completed', {
        postEventData,
        reportContent: data.content,
      });
      handleClose();
    } catch {
      alert("Network error. Please try again.");
      setStep('completed-form');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[120px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-3xl"
        >
          <button onClick={handleClose} className="absolute top-8 right-8 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Update Event Status</h3>
            <p className="text-zinc-300 text-[10px] uppercase font-bold tracking-widest mt-1">{event.name}</p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Choose status */}
            {step === 'choose' && (
              <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <button
                  onClick={() => setStep('completed-form')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-green-500/40 hover:bg-green-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Completed</p>
                    <p className="text-[10px] text-zinc-300 uppercase tracking-widest">Fill post-event data & generate report</p>
                  </div>
                </button>

                <button
                  onClick={() => setStep('postponed-form')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">Postponed</p>
                    <p className="text-[10px] text-zinc-300 uppercase tracking-widest">Set a new date for the event</p>
                  </div>
                </button>

                <button
                  onClick={() => setStep('cancelled-confirm')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Cancelled</p>
                    <p className="text-[10px] text-zinc-300 uppercase tracking-widest">Archive and grey out the event</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Step 2a: Completed Form */}
            {step === 'completed-form' && (
              <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Total Registrations</label>
                    <input type="number" value={totalRegistrations} onChange={e => setTotalRegistrations(e.target.value)} placeholder="0" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Total Attendees</label>
                    <input type="number" value={totalAttendees} onChange={e => setTotalAttendees(e.target.value)} placeholder="0" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Club Member Attendees</label>
                  <input type="number" value={clubMembers} onChange={e => setClubMembers(e.target.value)} placeholder="0" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50" />
                  {totalAttendees && clubMembers && (
                    <p className="text-[9px] text-zinc-200 mt-1">Non-club: {Math.max(0, (parseInt(totalAttendees) || 0) - (parseInt(clubMembers) || 0))}</p>
                  )}
                </div>

                <div>
                  <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Participant Engagement</label>
                  <textarea value={engagement} onChange={e => setEngagement(e.target.value)} placeholder="How did participants engage? (Q&A, networking, hands-on activities...)" rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50 resize-none" />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Benefits Gained</label>
                  <textarea value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="What did participants take away? (skills, connections, certifications...)" rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50 resize-none" />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Day Conduct Summary</label>
                  <textarea value={conductSummary} onChange={e => setConductSummary(e.target.value)} placeholder="How was the event conducted on the day? Any highlights or issues?" rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50 resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep('choose')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-200 hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button
                    onClick={handleCompletedSubmit}
                    disabled={!totalRegistrations || !totalAttendees}
                    className="flex-1 py-3 bg-gold-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Report
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2b: Postponed Form */}
            {step === 'postponed-form' && (
              <motion.div key="postponed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div>
                  <label className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest block mb-2">Postponed To</label>
                  <input type="date" value={postponedDate} onChange={e => setPostponedDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500/50 [color-scheme:dark]" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('choose')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-200 hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button onClick={handlePostponed} disabled={!postponedDate} className="flex-1 py-3 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Confirm Postpone
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2c: Cancelled Confirm */}
            {step === 'cancelled-confirm' && (
              <motion.div key="cancelled" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center space-y-2">
                  <XCircle className="w-10 h-10 text-red-500/60 mx-auto" />
                  <p className="text-sm text-white font-bold">Cancel this event?</p>
                  <p className="text-[10px] text-zinc-300">The folder will be greyed out. You can revive it anytime.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('choose')} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-200 hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button onClick={handleCancelled} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all">
                    Confirm Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Generating State */}
            {step === 'generating' && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
                <p className="text-sm font-bold text-white">Generating Event Report</p>
                <p className="text-[10px] text-zinc-200 uppercase tracking-widest">AI is analyzing your event data...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
