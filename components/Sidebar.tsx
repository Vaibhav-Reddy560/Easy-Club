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
        <div className="flex items-center gap-2 md:gap-4 transition-all">
          <motion.svg 
            width="40" 
            height="40" 
            viewBox="0 0 216 218" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-10 h-10 drop-shadow-[0_0_12px_rgba(255,165,0,0.4)]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <path d="M108 5.38672C164.634 5.38672 210.613 51.6518 210.613 108.808C210.613 165.964 164.634 212.229 108 212.229C51.3659 212.229 5.38672 165.964 5.38672 108.808C5.38692 51.6518 51.3661 5.38672 108 5.38672Z" stroke="url(#paint0_radial_195_3)" stroke-width="10.7731"/>
            
            {/* Pulsing Glow Layer */}
            <motion.g 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "center" }}
            >
              <g filter="url(#filter0_f_195_3)">
                <circle cx="108.269" cy="108.808" r="78.6434" fill="url(#paint1_radial_195_3)" fill-opacity="0.55"/>
              </g>
            </motion.g>

            {/* Pulsing Core Layer */}
            <motion.g 
              animate={{ 
                scale: [0.85, 1.1, 0.85],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "center" }}
            >
              <g filter="url(#filter1_dd_195_3)">
                <circle cx="108.269" cy="108.808" r="55.4813" fill="url(#paint2_radial_195_3)"/>
              </g>
            </motion.g>

            <defs>
              <filter id="filter0_f_195_3" x="18.8529" y="19.3915" width="178.833" height="178.833" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="5.38653" result="effect1_foregroundBlur_195_3"/>
              </filter>
              <filter id="filter1_dd_195_3" x="31.2418" y="31.7806" width="154.055" height="154.055" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="2.15461"/>
                <feGaussianBlur stdDeviation="5.38653"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.48 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_195_3"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="10.7731"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.45 0 0 0 0 0 0 0 0 0.45 0"/>
                <feBlend mode="normal" in2="effect1_dropShadow_195_3" result="effect2_dropShadow_195_3"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_195_3" result="shape"/>
              </filter>
              <radialGradient id="paint0_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108 108.808) rotate(90) scale(108.808 108)">
                <stop stop-color="#FF9900"/>
                <stop offset="0.370192" stop-color="#FFD37E"/>
                <stop offset="0.663462" stop-color="#FFE1A6"/>
                <stop offset="1" stop-color="#CA7F00"/>
              </radialGradient>
              <radialGradient id="paint1_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108.269 108.808) rotate(90) scale(78.6434)">
                <stop stop-color="#FFA900"/>
                <stop offset="0.360577" stop-color="#FFC95F"/>
                <stop offset="0.673077" stop-color="#FF9100"/>
                <stop offset="1" stop-color="#996500"/>
              </radialGradient>
              <radialGradient id="paint2_radial_195_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(108.269 108.808) rotate(90) scale(55.4813)">
                <stop stop-color="#FFA600"/>
                <stop offset="0.245192" stop-color="#FFBB34"/>
                <stop offset="0.399038" stop-color="#FFA900"/>
                <stop offset="0.605769" stop-color="#FF9D00"/>
                <stop offset="0.793269" stop-color="#FFA900"/>
                <stop offset="1" stop-color="#AC7202"/>
              </radialGradient>
            </defs>
          </motion.svg>
          <h1 className="text-2xl md:text-3xl font-normal text-signature-gradient tracking-wide font-airstream leading-none pr-3">Easy Club</h1>
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