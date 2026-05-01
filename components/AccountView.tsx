"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { User as FirebaseUser, updateProfile } from "firebase/auth";
import { 
  ChevronLeft, 
  User, 
  Shield, 
  Globe, 
  Bell, 
  Smartphone,
  ExternalLink,
  CircleCheckBig,
  Download,
  Pencil,
  Check,
  X,
  Loader2,
  Lock
} from "lucide-react";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { getUserClubs } from "@/lib/db";

interface AccountViewProps {
  user: FirebaseUser | null;
  onBack: () => void;
}

export default function AccountView({ user, onBack }: AccountViewProps) {
  const [exporting, setExporting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notifs, setNotifs] = useState({
    push: true,
    email: false,
    updates: true
  });

  useEffect(() => {
    if (user?.displayName) setNewName(user.displayName);
  }, [user]);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: newName });
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update name.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const clubs = await getUserClubs(user.uid, user.email || "");
      const dataStr = JSON.stringify(clubs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `easy-club-data-${user.uid}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0, x: 20 },
        show: { 
          opacity: 1, 
          x: 0,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className="max-w-4xl mx-auto pb-20"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 font-bold hover:brightness-110 group transition-colors"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" />
        <span className="text-sm uppercase tracking-[0.2em] text-signature-gradient">Home</span>
      </button>

      <div className="space-y-8">
        <header className="border-b border-white/5 pb-8">
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Account Settings</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="md:col-span-2 space-y-6"
          >
            <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group border-white/10">
              <BorderBeam size={400} duration={12} delay={2} />
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 overflow-hidden shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                    {user?.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt="Avatar" 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                        unoptimized
                      />
                    ) : (
                      <User className="w-12 h-12 text-gold-500" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-xl">
                    <Shield className="w-4 h-4 text-gold-500" />
                  </div>
                </div>

                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xl font-bold text-white focus:outline-none focus:border-gold-500/50 w-full"
                        autoFocus
                      />
                      <button 
                        onClick={handleUpdateName}
                        disabled={isUpdating}
                        className="p-2 rounded-xl bg-gold-500 text-black hover:brightness-110 disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => { setIsEditingName(false); setNewName(user?.displayName || ""); }}
                        className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-bold text-white tracking-tight">{user?.displayName || "Club Member"}</h3>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-gold-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <CircleCheckBig className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-100">Verified System User</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group/field hover:border-white/20 transition-colors">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover/field:text-gold-500 transition-colors">Primary Email</p>
                  <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group/field hover:border-white/20 transition-colors">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover/field:text-gold-500 transition-colors">Auth Provider</p>
                  <div className="flex items-center gap-2">
                    <Image src="https://www.google.com/favicon.ico" width={12} height={12} alt="Google" className="w-3 h-3 grayscale group-hover/field:grayscale-0 transition-all" unoptimized />
                    <p className="text-sm text-white font-medium">Google SSO</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 sm:col-span-2 group/field hover:border-white/20 transition-colors">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover/field:text-gold-500 transition-colors">Unique Identifier (UID)</p>
                  <p className="text-[10px] text-zinc-100 font-mono tracking-tighter truncate opacity-50 group-hover/field:opacity-100 transition-opacity">{user?.uid}</p>
                </div>
              </div>
            </div>

            {/* Notifications Toggle Section */}
            <div className="glass-panel rounded-[2.5rem] p-8 border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                  <Bell className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">Communication Feed</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manage how the hub reaches you</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { id: 'push', icon: Smartphone, label: "Push Notifications", sub: "Instant alerts on this device" },
                  { id: 'email', icon: Globe, label: "Email Summaries", sub: "Weekly club performance reports" },
                  { id: 'updates', icon: Shield, label: "System Updates", sub: "Important security and feature logs" }
                ].map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setNotifs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${notifs[item.id as keyof typeof notifs] ? 'bg-gold-500/20' : 'bg-white/5'}`}>
                        <item.icon className={`w-5 h-5 transition-colors ${notifs[item.id as keyof typeof notifs] ? 'text-gold-500' : 'text-zinc-500'}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-widest">{item.label}</p>
                        <p className="text-[9px] text-zinc-500 font-medium">{item.sub}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${notifs[item.id as keyof typeof notifs] ? 'bg-gold-500' : 'bg-white/10'}`}>
                       <motion.div 
                        animate={{ x: notifs[item.id as keyof typeof notifs] ? 22 : 2 }}
                        className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-lg"
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={{
                hidden: { opacity: 0, x: 20 },
                show: { opacity: 1, x: 0 }
            }}
            className="space-y-8"
          >
            <div className="bg-gold-500/5 border border-gold-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <BorderBeam size={200} duration={6} colorFrom="#F59E0B" colorTo="#D97706" />
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-4 h-4 text-gold-500" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-signature-gradient">Privacy Protocol</h4>
              </div>
              <p className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest leading-relaxed mb-6 opacity-70">
                Your data is stored securely in Firebase and localized for peak performance.
              </p>
              <button 
                onClick={handleExportData}
                disabled={exporting}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-black border border-white/10 hover:border-gold-500/50 transition-all group/btn disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-gold-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover/btn:text-gold-500 transition-colors">
                    {exporting ? "Compiling..." : "Extract History"}
                  </span>
                </div>
                <ChevronLeft className="w-3 h-3 text-zinc-500 rotate-180" />
              </button>
            </div>

            <div className="p-8 rounded-[2.5rem] glass-panel border-white/5 text-center">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Current Build Status</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black tracking-widest uppercase">
                 Stable 2.0.4
              </div>
              <p className="mt-4 text-[9px] text-zinc-600 font-medium">All systems operational in India-South region.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

