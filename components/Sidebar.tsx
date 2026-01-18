"use client";

import React from "react";
import { Settings, User } from "lucide-react";

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  return (
    <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold-glow" />
        <h1 className="text-xl font-bold bg-gold-text bg-clip-text text-transparent tracking-tight italic">Easy Club</h1>
      </div>
      <div className="flex gap-6 items-center">
        <Settings className="w-5 h-5 text-neutral-500 hover:text-gold-400 cursor-pointer transition-colors" />
        <button 
          onClick={onLogout} 
          className="w-9 h-9 rounded-full border border-gold-500/40 bg-neutral-900 flex items-center justify-center overflow-hidden"
          title="Logout"
        >
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-gold-400" />
          )}
        </button>
      </div>
    </nav>
  );
}