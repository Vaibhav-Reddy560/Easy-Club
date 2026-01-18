"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, FolderClosed, ChevronLeft, Palette, FileText, Share2, 
  Settings as SettingsIcon, Edit3, User, Plus, ExternalLink,
  Copy, Check, Linkedin, Image as ImageIcon, Download, Table,
  Calendar, MapPin, Clock, Users, Globe, Info, MessageSquare,
  Link as LinkIcon, Trash2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = "https://uzecgrofzvbnuvzjtabn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZWNncm9menZibnV2emp0YWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzA3OTEsImV4cCI6MjA4MjUwNjc5MX0.FrsJl-J6hDQhRCqj8-1vf9cUMZ9B73-7KyoG3KUX8ZM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- INTERNAL COMPONENTS (Consolidated for Error-Free Preview) ---

const Sidebar = ({ user, onLogout }: any) => (
  <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold-glow" />
      <h1 className="text-xl font-bold bg-gold-text bg-clip-text text-transparent tracking-tight italic">Easy Club</h1>
    </div>
    <div className="flex gap-6 items-center">
      <button onClick={onLogout} className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">Logout</button>
      <div className="w-9 h-9 rounded-full border border-gold-500/40 bg-neutral-900 flex items-center justify-center overflow-hidden">
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-gold-400" />
        )}
      </div>
    </div>
  </nav>
);

const GoldFolder = ({ name, onClick }: { name: string; onClick?: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -3 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="group flex flex-col items-center gap-3 cursor-pointer p-4 w-32"
  >
    <div className="relative w-20 h-16">
      <div className="absolute -top-1 left-1 w-10 h-4 bg-gold-600 rounded-t-lg -z-10 shadow-sm" />
      <div className="absolute inset-0 bg-gold-600 rounded-lg shadow-lg border border-gold-500/20" />
      <div className="absolute inset-0 top-2.5 bg-[#121212] rounded-md shadow-2xl border-t border-gold-100/40 flex items-center justify-center">
        <FolderClosed className="w-7 h-7 text-gold-100/40" />
      </div>
    </div>
    <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-gold-400 transition-colors text-center truncate w-full px-1">
      {name}
    </span>
  </motion.div>
);

const ClubGrid = ({ items, onItemClick, onAddClick, title, subtitle, addLabel }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <header className="mb-14 flex justify-between items-end border-b border-white/5 pb-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight italic">{title}</h2>
        <p className="text-neutral-500 text-sm mt-1 italic">{subtitle}</p>
      </div>
    </header>
    <div className="grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-6">
      <div onClick={onAddClick} className="group flex flex-col items-center gap-3 p-4 w-32 cursor-pointer">
        <div className="w-20 h-16 rounded-xl border-2 border-dashed border-neutral-800 flex items-center justify-center group-hover:border-gold-500/60 transition-all">
          <Plus className="w-7 h-7 text-neutral-700 group-hover:text-gold-400" />
        </div>
        <span className="text-[10px] font-bold text-neutral-600 group-hover:text-gold-500 uppercase tracking-widest">{addLabel}</span>
      </div>
      {items.map((item: any) => (
        <GoldFolder key={item.id} name={item.name} onClick={() => onItemClick(item.id)} />
      ))}
    </div>
  </motion.div>
);

const Questionnaire = ({ activeEvent, updateConfig, onBack }: any) => {
  const config = activeEvent?.config || {};

  return (
    <div className="space-y-12 pb-10">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold italic">Event Configuration</h2>
          <p className="text-gold-500/60 text-xs font-medium italic">Master Data for {activeEvent?.name}</p>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-6 h-6 text-neutral-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* SECTION 1: IDENTITY */}
        <div className="space-y-6">
          <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3 h-3" /> Event Identity
          </label>
          <div className="space-y-4">
             <input 
              placeholder="Tagline / Theme" 
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none"
              value={config.theme || ""} 
              onChange={(e) => updateConfig({ theme: e.target.value })}
            />
            <div className="flex gap-2">
              {['Technical', 'Social', 'Workshop', 'Hackathon'].map(type => (
                <button 
                  key={type}
                  onClick={() => updateConfig({ type })}
                  className={`flex-1 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${config.type === type ? 'bg-gold-500 text-black border-transparent' : 'bg-transparent border-neutral-800 text-neutral-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <textarea 
              placeholder="Full Event Description (for letters/PR)" 
              rows={3}
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none resize-none"
              value={config.description || ""} 
              onChange={(e) => updateConfig({ description: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 2: LOGISTICS */}
        <div className="space-y-6">
          <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Logistics & Schedule
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] text-neutral-500 uppercase font-bold ml-1">Date</span>
              <input type="date" className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={config.date || ""} onChange={(e) => updateConfig({ date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] text-neutral-500 uppercase font-bold ml-1">Time</span>
              <input type="time" className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={config.time || ""} onChange={(e) => updateConfig({ time: e.target.value })} />
            </div>
            <input placeholder="Venue (e.g. MSR Hall)" className="col-span-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={config.venue || ""} onChange={(e) => updateConfig({ venue: e.target.value })} />
            <input placeholder="City" className="col-span-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-gold-500/50 outline-none" value={config.city || ""} onChange={(e) => updateConfig({ city: e.target.value })} />
          </div>
        </div>

        {/* SECTION 3: CONTENT & RESOURCES */}
        <div className="space-y-6">
          <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-3 h-3" /> Content & Outreach
          </label>
          <div className="space-y-4">
            <input 
              placeholder="Tracks / Domains (comma separated)" 
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none"
              value={config.tracks || ""} 
              onChange={(e) => updateConfig({ tracks: e.target.value })}
            />
            <input 
              placeholder="Registration Link (G-Form/Unstop)" 
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm focus:border-gold-500/50 outline-none"
              value={config.regLink || ""} 
              onChange={(e) => updateConfig({ regLink: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 4: CONTACTS */}
        <div className="space-y-6">
          <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3" /> Points of Contact
          </label>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input placeholder="POC Name" className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none" value={config.poc1Name || ""} onChange={(e) => updateConfig({ poc1Name: e.target.value })} />
              <input placeholder="Phone" className="w-36 bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none" value={config.poc1Phone || ""} onChange={(e) => updateConfig({ poc1Phone: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <input placeholder="POC Name 2" className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none" value={config.poc2Name || ""} onChange={(e) => updateConfig({ poc2Name: e.target.value })} />
              <input placeholder="Phone 2" className="w-36 bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none" value={config.poc2Phone || ""} onChange={(e) => updateConfig({ poc2Phone: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <button onClick={onBack} className="w-full bg-gold-gradient text-black font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase tracking-widest mt-6">
        Sync Event Data
      </button>
    </div>
  );
};

// --- WORKSPACE MODULES ---

const DesignWorkspace = ({ activeEvent }: any) => (
  <div className="space-y-8 bg-neutral-900/40 border border-white/5 rounded-[3rem] p-12 shadow-2xl">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-4">
        <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">Poster Templates</label>
        <div className="grid grid-cols-3 gap-4">
          {['Instagram', 'WhatsApp', 'A3 Print'].map(dim => (
            <div key={dim} className="aspect-[3/4] bg-black border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-4 text-[9px] text-neutral-500 hover:text-gold-500 hover:border-gold-500/50 cursor-pointer transition-all">
              <ImageIcon className="w-4 h-4 mb-2 opacity-20" />
              {dim}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <label className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">Branding Assets</label>
        <div className="p-5 bg-gold-500/5 rounded-2xl border border-gold-500/20 flex justify-between items-center group cursor-pointer hover:bg-gold-500/10 transition-all">
          <span className="text-sm font-bold text-gold-100">Event Certificate</span>
          <ExternalLink className="w-4 h-4 text-gold-500" />
        </div>
      </div>
    </div>
  </div>
);

const ContentWorkspace = ({ activeEvent, activeClub, copyToClipboard, copiedId, generateMessage, generateLetter }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-neutral-900/60 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl">
      <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2"><Share2 className="w-4 h-4" /> Spam Generators</h4>
      <div className="space-y-5">
        {['short', 'long'].map(label => (
          <div key={label} className="p-6 bg-black rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">{label} Msg</span>
              <button onClick={() => copyToClipboard(generateMessage(label as any), label)} className="text-gold-500 text-[10px] font-bold flex items-center gap-1">
                {copiedId === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copiedId === label ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed italic line-clamp-3">"{generateMessage(label as any)}"</p>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-neutral-900/60 rounded-[3rem] p-10 border border-white/5 space-y-8 shadow-2xl text-center">
      <h4 className="text-gold-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2 justify-center"><FileText className="w-4 h-4" /> Official Docs</h4>
      {['Permission', 'Venue'].map(t => (
        <div key={t} className="flex flex-col gap-2">
          <button onClick={() => copyToClipboard(generateLetter(t === 'Permission' ? 'event' : 'venue' as any), t)} className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-xs font-bold text-neutral-400 hover:text-gold-500 transition-all uppercase tracking-widest">
            {copiedId === t ? 'Copied Text!' : `Preview ${t} Letter`}
          </button>
          <button className="flex items-center justify-center gap-2 text-[10px] text-gold-500/50 hover:text-gold-500 transition-colors uppercase font-bold">
            <Download className="w-3 h-3" /> Download DOCX
          </button>
        </div>
      ))}
      <div className="p-6 bg-gold-500/5 rounded-2xl border border-gold-500/20 flex flex-col gap-2 mt-4 text-center">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sheets Integration</span>
        <button className="w-full bg-gold-500 text-black text-[10px] font-bold py-2 rounded-lg"><Table className="w-3 h-3 inline mr-2" /> Link Responses</button>
      </div>
    </div>
  </div>
);

const SocialWorkspace = ({ getResourcePersons }: any) => (
  <div className="bg-neutral-900/40 border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl">
    <div className="flex justify-between items-center border-l-4 border-gold-500 pl-4">
      <h4 className="text-xl font-bold">Expert Sourcing</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {getResourcePersons().map((person: any, i: number) => (
        <div key={i} className="p-6 bg-black border border-white/5 rounded-3xl flex justify-between items-center group hover:border-gold-500 transition-all shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30">
              <Linkedin className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">{person.name}</h5>
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">{person.role}</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-neutral-700 group-hover:text-gold-500" />
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APPLICATION ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'clubs' | 'events' | 'domains'>('clubs');
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<'Design' | 'Content' | 'Social'>('Design');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'club' | 'event' | 'setup'>('club');
  const [inputValue, setInputValue] = useState("");
  const [themeValue, setThemeValue] = useState("");

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeEvent = activeClub?.events?.find((e: any) => e.id === activeEventId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchClubs(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchClubs(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin }});
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setClubs([]); setView('clubs');
  };

  const fetchClubs = async (userId: string) => {
    const { data, error } = await supabase.from('clubs').select('*').eq('user_id', userId);
    if (!error && data) setClubs(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (modalType === 'club') {
      const newClub = { name: inputValue, theme: themeValue, user_id: user.id, events: [] };
      const { data, error } = await supabase.from('clubs').insert([newClub]).select();
      if (!error && data) setClubs([...clubs, data[0]]);
    } else if (activeClubId) {
      const newEvent = { 
        id: Date.now().toString(), 
        name: inputValue, 
        config: { city: "Bengaluru", type: 'Technical', subType: 'Workshop' }
      };
      const updatedEvents = [...(activeClub.events || []), newEvent];
      const { error } = await supabase.from('clubs').update({ events: updatedEvents }).eq('id', activeClubId);
      if (!error) fetchClubs(user.id);
    }
    setIsModalOpen(false); setInputValue(""); setThemeValue("");
  };

  const updateConfig = async (newData: any) => {
    if (!activeClubId || !activeEventId || !user) return;
    const updatedEvents = activeClub.events.map((e: any) => e.id === activeEventId ? { ...e, config: { ...e.config, ...newData } } : e);
    const { error } = await supabase.from('clubs').update({ events: updatedEvents }).eq('id', activeClubId);
    if (!error) {
       setClubs(clubs.map(c => c.id === activeClubId ? { ...c, events: updatedEvents } : c));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateMessage = (type: 'short' | 'long') => {
    const c = activeEvent?.config || {};
    const base = `🚀 *${activeEvent?.name}* by *${activeClub?.name}*!\n📍 ${c.venue || 'TBA'}, ${c.city}\n📅 ${c.date || 'TBA'}`;
    return type === 'short' ? `${base}\nRegister now!` : `${base}\nTracks: ${c.tracks || 'General'}\nContact: ${c.poc1Name || 'POC'}`;
  };

  const generateLetter = (type: 'event' | 'venue') => {
    const c = activeEvent?.config || {};
    return `To,\nThe Authority,\nBMS College of Engineering,\n\nSubject: Request for ${type === 'event' ? 'Permission' : 'Venue'}\n\nWe, the ${activeClub?.name} club, are organizing "${activeEvent?.name}" on ${c.date || '[Date]'}. We request access to ${c.venue || '[Venue]'}.`;
  };

  const getResourcePersons = () => {
    const tracks = (activeEvent?.config?.tracks || "").split(',').map((t: string) => t.trim()).filter((t: string) => t !== "");
    return tracks.map((track: string) => ({
      role: `Expert - ${track}`, name: `${track} Specialist`, link: `https://www.linkedin.com/search/results/people/?keywords=${track}%20${activeEvent?.config?.city}`
    }));
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-gold-500 font-bold uppercase tracking-widest italic">Loading Hub...</div>;

  if (!user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gold-gradient rounded-[2.5rem] mb-8 flex items-center justify-center shadow-gold-glow">
        <FolderClosed className="w-10 h-10 text-black" />
      </div>
      <h1 className="text-4xl font-bold bg-gold-text bg-clip-text text-transparent mb-10 italic tracking-tighter">Easy Club</h1>
      <button onClick={handleLogin} className="bg-white text-black font-bold px-10 py-4 rounded-2xl shadow-xl flex items-center gap-3">Verify with Google</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white antialiased pb-20">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-10 py-16">
        <AnimatePresence mode="wait">
          {view === 'clubs' && (
            <ClubGrid 
              items={clubs} 
              onItemClick={(id: string) => { setActiveClubId(id); setView('events'); }}
              onAddClick={() => { setModalType('club'); setIsModalOpen(true); }}
              title="My Clubs" subtitle="Select your organization folder" addLabel="Establish"
            />
          )}

          {view === 'events' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => { setView('clubs'); setActiveClubId(null); }} className="flex items-center gap-2 text-gold-500 mb-8 font-bold hover:text-gold-400 group transition-colors">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-sm uppercase tracking-widest">Back to Clubs</span>
              </button>
              <header className="mb-14 border-b border-white/5 pb-8">
                <h2 className="text-4xl font-bold tracking-tight italic">{activeClub?.name}</h2>
              </header>
              <ClubGrid 
                items={activeClub?.events || []} 
                onItemClick={(id: string) => { setActiveEventId(id); setView('domains'); }}
                onAddClick={() => { setModalType('event'); setIsModalOpen(true); }}
                title="Event Projects" subtitle="Folders for production" addLabel="Add Event"
              />
            </motion.div>
          )}

          {view === 'domains' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setView('events')} className="flex items-center gap-2 text-gold-500 font-bold hover:text-gold-400 group transition-colors">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                  <span className="text-sm uppercase tracking-widest">Back to Events</span>
                </button>
                <button 
                  onClick={() => { setModalType('setup'); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl"
                >
                  <Edit3 className="w-3 h-3" /> Event Setup
                </button>
              </div>

              <div className="mb-12 border-b border-white/5 pb-8">
                <h2 className="text-3xl font-bold tracking-tighter italic">{activeEvent?.name} <span className="text-neutral-600 font-normal ml-3">/ Workspace</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  { id: 'Design', icon: Palette, desc: 'Visual Assets' },
                  { id: 'Content', icon: FileText, desc: 'Letters & Promo' },
                  { id: 'Social', icon: Share2, desc: 'Expert Outreach' }
                ].map((d) => (
                  <div 
                    key={d.id} 
                    onClick={() => setActiveDomain(d.id as any)} 
                    className={`p-8 rounded-[2rem] border cursor-pointer transition-all ${activeDomain === d.id ? 'bg-gold-500/10 border-gold-500 shadow-gold-glow' : 'bg-neutral-900/40 border-white/5 hover:border-gold-500/30'}`}
                  >
                    <d.icon className={`w-8 h-8 mb-4 ${activeDomain === d.id ? 'text-gold-400' : 'text-neutral-600'}`} />
                    <h3 className="text-xl font-bold">{d.id}</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1 tracking-wider">{d.desc}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeDomain} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {activeDomain === 'Design' && <DesignWorkspace activeEvent={activeEvent} />}
                  {activeDomain === 'Content' && <ContentWorkspace activeEvent={activeEvent} activeClub={activeClub} copyToClipboard={copyToClipboard} copiedId={copiedId} generateMessage={generateMessage} generateLetter={generateLetter} />}
                  {activeDomain === 'Social' && <SocialWorkspace getResourcePersons={getResourcePersons} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative w-full ${modalType === 'setup' ? 'max-w-4xl' : 'max-w-lg'} bg-[#121212] border border-gold-500/20 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]`}>
              {modalType === 'setup' ? (
                <Questionnaire activeEvent={activeEvent} updateConfig={updateConfig} onBack={() => setIsModalOpen(false)} />
              ) : (
                <>
                   <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
                  <h3 className="text-2xl font-bold text-white mb-8 italic">{modalType === 'club' ? 'Establish Club' : 'Create Event'}</h3>
                  <form onSubmit={handleCreate} className="space-y-6">
                    <input required type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Folder Name..." className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-gold-500/50 transition-all" />
                    <button type="submit" className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl shadow-xl uppercase tracking-widest">Confirm Generation</button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}