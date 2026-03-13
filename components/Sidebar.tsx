"use client";

import React from "react";
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
}

export default function Sidebar({ user, onLogout, onAboutClick }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-[#FFA500]" />
        <h1 className="text-3xl font-normal text-[#FFA500] tracking-tight font-airstream leading-none">Easy Club</h1>
      </div>
      <div className="flex gap-6 items-center">
        <button
          onClick={onAboutClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group"
        >
          <Info className="w-4 h-4 text-neutral-400 group-hover:text-gold-400 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">About the App</span>
        </button>

        <button
          onClick={() => alert("Settings configured for AI & Brand preferences.")}
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
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#FFA500] group-hover:scale-110 transition-transform" />
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-neutral-900 border border-white/10 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-black">
                  {user?.user_metadata?.full_name?.charAt(0) || "G"}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    {user?.user_metadata?.full_name || "Guest User"}
                  </p>
                  <p className="text-[9px] text-neutral-500 font-mono tracking-tighter truncate w-32">
                    {user?.id}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                  Account Preferences
                </button>
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-[10px] font-bold text-neutral-400 hover:text-white transition-all">
                  Usage Analytics
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 text-[10px] font-bold text-red-400 hover:text-red-300 transition-all mt-2"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}