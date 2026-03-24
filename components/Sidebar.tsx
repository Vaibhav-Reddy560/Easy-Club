"use client";

import React from "react";
import Image from "next/image";
import { Settings, User, Info } from "lucide-react";

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
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-[#FFA500]" />
        <h1 className="text-3xl font-normal text-signature-gradient tracking-tight font-airstream leading-none">Easy Club</h1>
      </div>
      <div className="flex gap-6 items-center">
        <button
          onClick={onAboutClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group"
        >
          <Info className="w-4 h-4 text-neutral-400 group-hover:text-gold-400 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-signature-gradient transition-colors">About the App</span>
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <Settings className="w-5 h-5 text-neutral-500 group-hover:text-gold-400 transition-colors" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full border border-gold-500/40 bg-neutral-900 flex items-center justify-center overflow-hidden hover:border-gold-500 transition-colors group"
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
            <div className="absolute right-0 mt-3 w-72 bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
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
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Verified Account</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <button 
                  onClick={() => { setIsProfileOpen(false); onAccountClick(); }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[11px] font-semibold text-neutral-400 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>Account Preferences</span>
                  <div className="w-1 h-1 rounded-full bg-gold-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); onAnalyticsClick(); }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-[11px] font-semibold text-neutral-400 hover:text-white transition-all flex items-center justify-between group"
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
  );
}