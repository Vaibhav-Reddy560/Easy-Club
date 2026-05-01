"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Settings, User, Info, LogOut, ShieldCheck, ChevronDown, Activity } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import DynamicIsland from "@/components/DynamicIsland";

interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
}

interface User {
  id: string;
  user_metadata?: UserMetadata;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onAboutClick: () => void;
  onAccountClick: () => void;
  onAnalyticsClick: () => void;
  onSettingsClick: () => void;
}



export default function Sidebar({ user, onLogout, onAboutClick, onAccountClick, onAnalyticsClick, onSettingsClick }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <DynamicIsland />
      <nav className="h-20 glass-panel !bg-[#050505] !backdrop-blur-3xl !border-t-0 !border-x-0 !rounded-none flex items-center justify-between px-6 md:px-10 sticky top-0 z-[100] shadow-[0_1px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="flex items-center gap-3 md:gap-4 transition-all">
          <Image 
            src="/Logo.png" 
            alt="Easy Club Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-normal text-signature-gradient tracking-wider font-airstream leading-none">Easy Club</h1>
        </div>

        <div className="flex gap-4 md:gap-8 items-center">
          <div className="hidden sm:flex items-center gap-2">
            <button
                onClick={onAboutClick}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:border-gold-500/30 hover:bg-white/10 transition-all group overflow-hidden relative"
              >
                <Info className="w-4 h-4 text-white group-hover:text-gold-400 transition-colors relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors relative z-10">About the app</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

            <button
                onClick={onSettingsClick}
                className="p-3 rounded-full bg-white/5 border border-white/5 hover:border-gold-500/30 hover:bg-white/10 transition-all group"
              >
                <Settings className="w-4 h-4 text-white group-hover:text-gold-400 transition-colors" />
              </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-neutral-900/60 border border-white/5 hover:border-gold-500/40 transition-all group shadow-xl"
            >
              <div className="w-7 h-7 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 font-black overflow-hidden border border-gold-500/20 group-hover:border-gold-500 transition-colors">
                {user?.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    width={28} 
                    height={28} 
                    className="w-full h-full object-cover" 
                    unoptimized
                  />
                ) : (
                  <span className="text-xs">{user?.user_metadata?.full_name?.charAt(0) || "U"}</span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/30 group-hover:text-gold-500 transition-all ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 bg-[#080808] border border-white/10 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] z-[200] overflow-hidden rounded-[2.5rem]"
                >
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-xl font-black text-white overflow-hidden">
                          {user?.user_metadata?.avatar_url ? (
                            <Image src={user.user_metadata.avatar_url} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            user?.user_metadata?.full_name?.charAt(0) || "U"
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white tracking-tight truncate uppercase">
                          {user?.user_metadata?.full_name || "Guest Operator"}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ShieldCheck className="w-3 h-3 text-green-500" />
                          <span className="text-[9px] text-zinc-100 font-black uppercase tracking-widest">Authenticated</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <ProfileItem icon={User} label="Account Settings" onClick={() => { setIsProfileOpen(false); onAccountClick(); }} />
                      
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <button
                          onClick={() => { setIsProfileOpen(false); onLogout(); }}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 text-red-400 transition-all group"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  );
}

function ProfileItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all flex items-center gap-3 group"
    >
      <Icon className="w-4 h-4 text-white/20 group-hover:text-gold-400 transition-colors" />
      <span>{label}</span>
      <div className="ml-auto w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}