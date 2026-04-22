"use client";

import React from "react";
import Image from "next/image";
import { Settings, User, Info } from "lucide-react";
import { motion } from "framer-motion";

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

import DynamicIsland from "@/components/DynamicIsland";

export default function Sidebar({ user, onLogout, onAboutClick, onAccountClick, onAnalyticsClick, onSettingsClick }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <>
      <DynamicIsland />
      <nav className="h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-1 md:gap-2 transition-all">
          <motion.div 
            className="relative w-10 h-10 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Atmospheric Ripple */}
            <motion.div 
              className="absolute inset-0 rounded-full border border-gold-400/20"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <svg 
              viewBox="0 0 216 218" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-8 h-8 drop-shadow-[0_0_12px_rgba(255,180,0,0.4)]"
            >
              {/* Thinner Outer Ring */}
              <circle cx="108" cy="108.8" r="102" stroke="url(#paint0_radial_195_3)" stroke-width="4"/>
              
              {/* Pulsing Glow Layer */}
              <motion.g 
                animate={{ 
                  scale: [1, 1.12, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: "center" }}
              >
                <circle cx="108.269" cy="108.808" r="78.6434" fill="url(#paint1_radial_195_3)" fill-opacity="0.4"/>
              </motion.g>

              {/* Pulsing Core */}
              <motion.g 
                animate={{ 
                  scale: [0.9, 1.05, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: "center" }}
              >
                <circle cx="108.269" cy="108.808" r="58" fill="url(#paint2_radial_195_3)"/>
                <circle cx="108.269" cy="108.808" r="15" fill="white" fill-opacity="0.3" filter="blur(8px)"/>
              </motion.g>

              <defs>
                <radialGradient id="paint0_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108 108.808) rotate(90) scale(108.808 108)">
                  <stop stop-color="#FFB000"/>
                  <stop offset="0.370192" stop-color="#FFD700"/>
                  <stop offset="0.663462" stop-color="#FFE1A6"/>
                  <stop offset="1" stop-color="#92400E"/>
                </radialGradient>
                <radialGradient id="paint1_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108.269 108.808) rotate(90) scale(78.6434)">
                  <stop stop-color="#FFC000"/>
                  <stop offset="0.360577" stop-color="#FFD700"/>
                  <stop offset="1" stop-color="#78350F"/>
                </radialGradient>
                <radialGradient id="paint2_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108.269 108.808) rotate(90) scale(58)">
                  <stop stop-color="#FFB000"/>
                  <stop offset="0.245192" stop-color="#FBBF24"/>
                  <stop offset="1" stop-color="#451A03"/>
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
          <h1 className="text-3xl md:text-[2.5rem] font-normal text-signature-gradient tracking-wider font-airstream leading-none pr-3 translate-y-[1px]">Easy Club</h1>
        </div>
        <div className="flex gap-3 md:gap-6 items-center">
          <button
            onClick={onAboutClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group"
          >
            <Info className="w-4 h-4 text-white group-hover:text-gold-400 transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-signature-gradient transition-colors">About the App</span>
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <Settings className="w-5 h-5 text-white group-hover:text-gold-400 transition-colors" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full border border-gold-500/40 bg-zinc-900 flex items-center justify-center overflow-hidden hover:border-gold-500 transition-colors group"
              title="Profile"
            >
              {user?.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover" 
                  unoptimized
                />
              ) : (
                <User className="w-5 h-5 text-[#FFA500] group-hover:scale-110 transition-transform" />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-signature-gradient font-black overflow-hidden border border-gold-500/20 shadow-inner">
                    {user?.user_metadata?.avatar_url ? (
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        width={48} 
                        height={48} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl">{user?.user_metadata?.full_name?.charAt(0) || "G"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white tracking-tight truncate">
                      {user?.user_metadata?.full_name || "Guest User"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-zinc-100 font-medium uppercase tracking-wider">Verified Account</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <button 
                    onClick={() => { setIsProfileOpen(false); onAccountClick(); }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[11px] font-semibold text-white hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>Account Preferences</span>
                    <div className="w-1 h-1 rounded-full bg-gold-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button 
                    onClick={() => { setIsProfileOpen(false); onAnalyticsClick(); }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[11px] font-semibold text-white hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>Usage Analytics</span>
                    <div className="w-1 h-1 rounded-full bg-gold-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full text-center px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 text-[11px] font-bold text-red-400 hover:text-red-300 transition-all"
                    >
                      Terminate Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}