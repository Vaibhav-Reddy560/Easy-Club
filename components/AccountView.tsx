"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { User as FirebaseUser } from "firebase/auth";
import { 
  ChevronLeft, 
  User, 
  Shield, 
  Globe, 
  Bell, 
  Smartphone,
  ExternalLink,
  CircleCheckBig,
  Download
} from "lucide-react";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { getUserClubs } from "@/lib/db";

interface AccountViewProps {
  user: FirebaseUser | null;
  onBack: () => void;
}

export default function AccountView({ user, onBack }: AccountViewProps) {
  const [exporting, setExporting] = React.useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const clubs = await getUserClubs(user.uid, user.email);
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
      className="max-w-4xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 font-bold hover:brightness-110 group transition-colors"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-gold-500" />
        <span className="text-sm uppercase tracking-widest text-signature-gradient">Exit Settings</span>
      </button>

      <div className="space-y-8">
        <header className="border-b border-white/5 pb-8">
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">Account <span className="text-neutral-600 font-normal ml-2">/ Preferences</span></h2>
          <p className="text-neutral-500 text-sm mt-2 max-w-lg font-medium">
            Manage your digital identity and hub security settings. 
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="md:col-span-2 space-y-6"
          >
            <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group">
              <BorderBeam size={400} duration={12} delay={2} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-[2rem] bg-gold-500/10 flex items-center justify-center border border-gold-500/20 overflow-hidden shadow-2xl">
                  {user?.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="Avatar" 
                      width={80} 
                      height={80} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      unoptimized
                    />
                  ) : (
                    <User className="w-10 h-10 text-gold-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{user?.displayName || "Club Member"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CircleCheckBig className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Verified System User</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Primary Email</p>
                  <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Authorization Method</p>
                  <div className="flex items-center gap-2">
                    <Image src="https://www.google.com/favicon.ico" width={12} height={12} alt="Google" className="w-3 h-3" unoptimized />
                    <p className="text-sm text-white font-medium">Google SSO</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 sm:col-span-2">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Unique Identifier (UID)</p>
                  <p className="text-[10px] text-neutral-500 font-mono tracking-tighter truncate">{user?.uid}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="glass-panel rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-gold-500" />
                <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Security & Safety</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Globe, label: "Connected Platforms", status: "Active", sub: "Ayrshare, Gemini, Serper" },
                  { icon: Smartphone, label: "Session Security", status: "Protected", sub: "End-to-end encryption active" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
                        <item.icon className="w-5 h-5 text-neutral-500 group-hover:text-gold-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white group-hover:text-signature-gradient transition-colors">{item.label}</p>
                        <p className="text-[9px] text-neutral-600 font-medium">{item.sub}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500/50">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions / Shortcuts */}
          <motion.div 
            variants={{
                hidden: { opacity: 0, x: 20 },
                show: { opacity: 1, x: 0 }
            }}
            className="space-y-8"
          >
            <div className="bg-gold-500/5 border border-gold-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <BorderBeam size={200} duration={6} colorFrom="#F59E0B" colorTo="#D97706" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-signature-gradient mb-4 relative z-10">Quick Preferences</h4>
              <div className="space-y-4 relative z-10">
                {[
                  { icon: Bell, label: "Notifications" },
                  { icon: User, label: "Edit Persona" }
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gold-500/10 transition-all text-left group">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-gold-500/70" />
                      <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-gold-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                Your data is stored securely in Firebase and localized for peak performance. You can extract your complete organization history as a JSON file.
              </p>
              <button 
                onClick={handleExportData}
                disabled={exporting}
                className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-signature-gradient hover:brightness-110 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Compiling Format..." : "Export Data Protocol →"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
