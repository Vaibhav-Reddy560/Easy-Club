"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import TrendingIdeas from "@/components/TrendingIdeas";
import SocialTracker from "@/components/SocialTracker";
import SponsorshipManager from "@/components/SponsorshipManager";
import {
  Trash2,
  ChevronLeft,
  Palette,
  FileText,
  Share2,
  Pencil
} from "lucide-react";

// Import components from the components directory
import Sidebar from "@/components/Sidebar";
import AppSidebar, { NavSection } from "@/components/AppSidebar";
import ClubGrid from "@/components/ClubGrid";
import Questionnaire from "@/components/Questionnaire";
import AboutPage from "@/components/AboutPage";
import ExploreClubs from "@/components/ExploreClubs";
import ExploreEvents from "@/components/ExploreEvents";
import DesignWorkspace from "@/components/domains/DesignWorkspace";
import ContentWorkspace from "@/components/domains/ContentWorkspace";
import SocialWorkspace from "@/components/domains/SocialWorkspace";
import AccountView from "@/components/AccountView";
import AnalyticsView from "@/components/AnalyticsView";
import SettingsView from "@/components/SettingsView";
import MembershipView from "@/components/MembershipView";
import MyTeamView from "@/components/MyTeamView";
import { Club, ClubEvent, EventConfig, MemberRole, ActivityLogEvent } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle, logout } from "@/lib/firebase";

// --- MAIN APPLICATION ---

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeNav, setActiveNav] = useState<NavSection>('my-clubs');
  const [view, setView] = useState<'clubs' | 'events' | 'questionnaire' | 'domains' | 'about' | 'account' | 'analytics' | 'settings'>('clubs');
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<'Design' | 'Content' | 'Social'>('Design');

  const [currentUserRole, setCurrentUserRole] = useState<MemberRole>('Admin');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'club' | 'event'>('club');
  const [modalOperation, setModalOperation] = useState<'create' | 'rename'>('create');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeEvent = activeClub?.events?.find((e: ClubEvent) => e.id === activeEventId);

  // Load data for the specific user from localStorage on mount
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is known
    
    if (user) {
      const savedClubs = localStorage.getItem(`easy-club-data-${user.uid}`);
      if (savedClubs) {
        try {
          setClubs(JSON.parse(savedClubs));
        } catch (e) {
          console.error("Failed to parse saved data", e);
          setClubs([]);
        }
      } else {
        // Default initial data if none exists
        setClubs([]);
      }
    } else {
      setClubs([]);
    }
    setLoading(false);
  }, [user, authLoading]);

  // Calculate current user role whenever club or user changes
  useEffect(() => {
    if (!user || !activeClub) {
      setCurrentUserRole('Admin'); // Default to Admin for personal clips
      return;
    }

    const memberMatch = activeClub.members?.find(m => m.email === user.email);
    if (memberMatch) {
      setCurrentUserRole(memberMatch.role);
    } else {
      setCurrentUserRole('Admin'); // Original owner
    }
  }, [user, activeClub]);

  // Save data to localStorage whenever clubs state changes
  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem(`easy-club-data-${user.uid}`, JSON.stringify(clubs));
    }
  }, [clubs, loading, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalOperation === 'create') {
      handleCreate();
    } else {
      handleRename();
    }
  };

  const handleCreate = () => {
    if (modalType === 'club') {
      const newClub = {
        id: Date.now().toString(),
        name: inputValue,
        events: []
      };
      setClubs([...clubs, newClub]);
    } else if (activeClubId) {
      const newEvent: ClubEvent = {
        id: Date.now().toString(),
        name: inputValue,
        config: {
          city: "Bengaluru",
          type: 'Technical',
          subType: 'Workshop',
          isCollegeEvent: true
        }
      };
      setClubs(clubs.map((c: Club) =>
        c.id === activeClubId ? { ...c, events: [...(c.events || []), newEvent] } : c
      ));
    }
    setIsModalOpen(false);
    setInputValue("");
  };

  const handleAdoptIdea = (title: string, ideaConfig: { subType: string, tags: string }) => {
    // If we have clubs, add it to the first one as a default, or the active one
    const targetClubId = activeClubId || clubs[0]?.id;
    
    if (!targetClubId) {
        alert("Please establish at least one club folder before adopting a blueprint.");
        setActiveNav('my-clubs');
        return;
    }

    const newEvent: ClubEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: title,
      config: {
        subType: ideaConfig.subType,
        description: "",
        date: "",
        time: "",
        venue: "",
        city: "",
        isLaunched: false
      }
    };

    setClubs(clubs.map((c: Club) =>
      c.id === targetClubId ? { ...c, events: [...(c.events || []), newEvent] } : c
    ));

    // Navigate to the new event
    setActiveClubId(targetClubId);
    setActiveEventId(newEvent.id);
    setView('domains');
    setActiveNav('my-clubs');
  };

  const handleRename = () => {
    if (modalType === 'club') {
      setClubs(clubs.map((c: Club) => c.id === targetId ? { ...c, name: inputValue } : c));
    } else {
      setClubs(clubs.map((c: Club) =>
        c.id === activeClubId ? {
          ...c,
          events: (c.events || []).map((e: ClubEvent) => e.id === targetId ? { ...e, name: inputValue } : e)
        } : c
      ));
    }
    setIsModalOpen(false);
    setInputValue("");
  };

  const confirmDelete = () => {
    if (modalType === 'club') {
      setClubs(clubs.filter(c => c.id !== targetId));
      if (activeClubId === targetId) {
        setActiveClubId(null);
        setView('clubs');
      }
    } else {
      setClubs(clubs.map((c: Club) =>
        c.id === activeClubId ? {
          ...c,
          events: (c.events || []).filter((e: ClubEvent) => e.id !== targetId)
        } : c
      ));
    }
    setIsDeleteModalOpen(false);
  };


  const handleLogActivity = (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => {
    if (!activeClubId || !user) return;
    
    const newEvent: ActivityLogEvent = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      userName: user.displayName || "Unknown Member",
      action,
      domain,
      timestamp: new Date().toISOString(),
      details
    };

    setClubs(prev => prev.map(c => 
      c.id === activeClubId 
        ? { ...c, activityLog: [...(c.activityLog || []), newEvent].slice(-50) } // Keep last 50
        : c
    ));
  };

  const updateEventConfig = (newData: Partial<EventConfig>) => {
    if (!activeClubId || !activeEventId) return;
    setClubs(clubs.map(c => {
      if (c.id === activeClubId) {
        return {
          ...c,
          events: (c.events || []).map((e: ClubEvent) =>
            e.id === activeEventId ? { ...e, config: { ...e.config, ...newData } } : e
          )
        };
      }
      return c;
    }));
  };

  const handleNavChange = (section: NavSection) => {
    setActiveNav(section);
    // REMOVED: Reset internal view if switching back to My Clubs
    // This allows users to "leave off" where they were.
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
        <p className="text-signature-gradient font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Hub...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,164,26,0.05)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full z-10 text-center space-y-10 px-4"
        >
          <div className="space-y-6 pt-8">
            <div className="relative inline-block px-4 overflow-visible">
              <div className="absolute inset-0 bg-[#FFA500] blur-3xl opacity-20 animate-pulse" />
              <h1 className="relative text-6xl sm:text-7xl font-normal text-signature-gradient tracking-tight font-airstream leading-none pr-4">Easy Club</h1>
            </div>
            <p className="text-neutral-500 text-sm font-medium tracking-wide max-w-[280px] mx-auto leading-relaxed">
              Professional club management and nationwide networking, made easy.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={signInWithGoogle}
              className="w-full group relative flex items-center justify-center gap-4 px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] transition-all duration-500 hover:bg-gold-500 hover:text-black hover:shadow-[0_20px_40px_-15px_rgba(250,164,26,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Image src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" className="w-4 h-4" unoptimized />
              Sign in with Google
            </button>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white antialiased">
      <Sidebar 
        user={{
          id: user.uid,
          user_metadata: { 
            full_name: user.displayName || "Club Member",
            avatar_url: user.photoURL || undefined
          }
        }} 
        onLogout={logout} 
        onAboutClick={() => setView('about')} 
        onAccountClick={() => setView('account')}
        onAnalyticsClick={() => setView('analytics')}
        onSettingsClick={() => setView('settings')}
      />

      <div className="max-w-[1600px] mx-auto flex px-6">
        <AppSidebar 
          activeSection={activeNav} 
          onSectionChange={handleNavChange} 
          userRole={currentUserRole}
        />

        <main className="flex-1 py-16 px-12">
          {/* We use display management instead of simple conditional rendering for Explore tabs 
              to keep their state alive without deep prop lifting for every search field. */}
          <div className={`${activeNav === 'my-clubs' ? 'block' : 'hidden'}`}>
            <AnimatePresence mode="wait">
              {view === 'clubs' && (
                <ClubGrid
                  key="clubs"
                  items={clubs}
                  onItemClick={(id: string) => { setActiveClubId(id); setView('events'); }}
                  onRename={(id, name) => {
                    setTargetId(id);
                    setInputValue(name);
                    setModalType('club');
                    setModalOperation('rename');
                    setIsModalOpen(true);
                  }}
                  onDelete={(id, name) => {
                    setTargetId(id);
                    setInputValue(name);
                    setModalType('club');
                    setIsDeleteModalOpen(true);
                  }}
                  onAddClick={() => {
                    setModalType('club');
                    setModalOperation('create');
                    setInputValue("");
                    setIsModalOpen(true);
                  }}
                  title="My Clubs"
                  subtitle="Select your organization folder"
                  addLabel="Establish"
                />
              )}

              {view === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <button
                    onClick={() => { setView('clubs'); setActiveClubId(null); }}
                    className="flex items-center gap-2 mb-8 font-bold hover:text-gold-400 group transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-gold-500" />
                    <span className="text-sm uppercase tracking-widest text-signature-gradient">Back to Clubs</span>
                  </button>
                  <ClubGrid
                    items={activeClub?.events || []}
                    onItemClick={(id: string) => {
                      setActiveEventId(id);
                      const clickedEvent = activeClub?.events.find(e => e.id === id);
                      if (clickedEvent?.config?.isLaunched) {
                        setView('domains');
                      } else {
                        setView('questionnaire');
                      }
                    }}
                    onRename={(id, name) => {
                      setTargetId(id);
                      setInputValue(name);
                      setModalType('event');
                      setModalOperation('rename');
                      setIsModalOpen(true);
                    }}
                    onDelete={(id, name) => {
                      setTargetId(id);
                      setInputValue(name);
                      setModalType('event');
                      setIsDeleteModalOpen(true);
                    }}
                    onAddClick={() => {
                      setModalType('event');
                      setModalOperation('create');
                      setInputValue("");
                      setIsModalOpen(true);
                    }}
                    title={activeClub?.name || "Organization"}
                    subtitle="Event Projects / Production Folders"
                    addLabel="Add Event"
                  />
                </motion.div>
              )}

              {view === 'questionnaire' && (
                <Questionnaire
                  key="questionnaire"
                  activeEvent={activeEvent}
                  activeEventId={activeEventId}
                  updateConfig={updateEventConfig}
                  onBack={() => setView('events')}
                  onProceed={() => {
                    updateEventConfig({ isLaunched: true });
                    setView('domains');
                  }}
                />
              )}

              {view === 'domains' && (
                <motion.div key="domains" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-center mb-8">
                      <button
                        onClick={() => setView('events')}
                        className="flex items-center gap-2 font-bold hover:text-gold-400 group transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-gold-500" />
                        <span className="text-sm uppercase tracking-widest text-signature-gradient">Back to Dashboard</span>
                      </button>
                    <button
                      onClick={() => setView('questionnaire')}
                      className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl"
                    >
                      <Pencil className="w-3 h-3" /> Edit Config
                    </button>
                  </div>

                  <div className="mb-12 border-b border-white/5 pb-8">
                    <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">
                      {activeEvent?.name} <span className="text-neutral-600 font-normal ml-3 font-sans">/ Workspace</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                      { id: 'Design', icon: Palette, desc: 'Visual Assets' },
                      { id: 'Content', icon: FileText, desc: 'Letters & Promo' },
                      { id: 'Social', icon: Share2, desc: 'Expert Outreach' }
                    ].map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setActiveDomain(d.id as 'Design' | 'Content' | 'Social')}
                        className={`p-8 rounded-[2rem] border cursor-pointer transition-all ${activeDomain === d.id ? 'bg-gold-500/10 border-gold-500 shadow-gold-glow' : 'bg-neutral-900/40 border-white/5 hover:border-gold-500/30'}`}
                      >
                        <d.icon className={`w-8 h-8 mb-4 ${activeDomain === d.id ? 'text-gold-400' : 'text-neutral-600'}`} />
                        <h3 className="text-2xl font-normal font-astronomus leading-tight text-white/90">{d.id}</h3>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1 tracking-widest">{d.desc}</p>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDomain}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {activeDomain === 'Design' && <DesignWorkspace activeEvent={activeEvent} onLogActivity={handleLogActivity} />}
                      {activeDomain === 'Content' && <ContentWorkspace activeEvent={activeEvent} activeClub={activeClub} updateConfig={updateEventConfig} onLogActivity={handleLogActivity} />}
                      {activeDomain === 'Social' && <SocialWorkspace activeEvent={activeEvent} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {view === 'about' && (
                <AboutPage onBack={() => setView('clubs')} />
              )}

              {view === 'account' && (
                <AccountView user={user} onBack={() => setView('clubs')} />
              )}

              {view === 'analytics' && (
                <AnalyticsView 
                  clubsCount={clubs.length} 
                  eventsCount={clubs.reduce((acc, c) => acc + (c.events?.length || 0), 0)} 
                  onBack={() => setView('clubs')} 
                />
              )}

              {view === 'settings' && (
                <SettingsView onBack={() => setView('clubs')} />
              )}
            </AnimatePresence>
          </div>

          <div className={`${activeNav === 'explore-clubs' ? 'block' : 'hidden'}`}>
            <ExploreClubs />
          </div>

          <div className={`${activeNav === 'explore-events' ? 'block' : 'hidden'}`}>
            <ExploreEvents />
          </div>

          <div className={`${activeNav === 'my-team' ? 'block' : 'hidden'}`}>
            <MyTeamView 
              activeClub={activeClub} 
              onUpdateClub={(updatedClub: Club) => {
                setClubs(prev => prev.map(c => c.id === activeClubId ? updatedClub : c));
              }}
            />
          </div>

          <div className={`${activeNav === 'membership' ? 'block' : 'hidden'}`}>
            <MembershipView clubs={clubs} setClubs={setClubs} />
          </div>

          <div className={`${activeNav === 'social-tracker' ? 'block' : 'hidden'}`}>
            <SocialTracker clubs={clubs} />
          </div>

          <div className={`${activeNav === 'sponsorship' ? 'block' : 'hidden'}`}>
            <SponsorshipManager clubs={clubs} />
          </div>

          {activeNav === 'trending' && (
            <TrendingIdeas onAdopt={handleAdoptIdea} />
          )}
        </main>
      </div>

      {/* Modal for Creating/Renaming Clubs/Events */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-[#121212] border border-gold-500/20 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-neutral-500 hover:text-white"
              >
                <ChevronLeft className="w-6 h-6 rotate-180" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-2">
                {modalOperation === 'create' ? (modalType === 'club' ? 'Establish Club' : 'Create Event') : `Rename ${modalType === 'club' ? 'Club' : 'Event'}`}
              </h3>
              <p className="text-neutral-500 text-xs mb-8">
                {modalOperation === 'create'
                  ? (modalType === 'club' ? 'Create a master folder for your organization.' : 'Start a new project folder under this club.')
                  : `Change the name of your ${modalType}.`}
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  required
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Folder Name..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-gold-500/50 transition-all font-sans"
                />
                <button
                  type="submit"
                  className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl shadow-xl uppercase tracking-widest hover:scale-[1.02] transition-transform"
                >
                  Confirm {modalOperation === 'create' ? 'Generation' : 'Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-[#121212] border border-red-500/20 rounded-[2.5rem] p-10 shadow-3xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete {modalType === 'club' ? 'Club' : 'Event'}?</h3>
              <p className="text-neutral-500 text-xs mb-8 leading-relaxed">
                You are about to delete <span className="text-white font-bold">{inputValue}</span>.
                This action is permanent and all associated files will be lost.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}