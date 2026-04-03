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
import { BorderBeam } from "@/components/animations/BorderBeam";
import AccountView from "@/components/AccountView";
import AnalyticsView from "@/components/AnalyticsView";
import SettingsView from "@/components/SettingsView";
import MembershipView from "@/components/MembershipView";
import MyTeamView from "@/components/MyTeamView";
import MobileNav from "@/components/MobileNav";
import LoginView from "@/components/LoginView";
import { Club, ClubEvent, EventConfig, MemberRole, ActivityLogEvent } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle, logout } from "@/lib/firebase";
import { getUserClubs, saveClub, deleteClubFromDb } from "@/lib/db";

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

  // Load data from Firebase on mount
  useEffect(() => {
    let isMounted = true;
    
    if (authLoading) return;
    
    if (user) {
      void getUserClubs(user.uid, user.email).then(fetchedClubs => {
        if (isMounted) {
            setClubs(fetchedClubs);
            setLoading(false);
        }
      });
    } else {
      if (isMounted) {
          setClubs([]);
          setLoading(false);
      }
    }
    
    return () => { isMounted = false; };
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

  // Save data to Firebase (Debounced or on significant changes locally, 
  // but for immediate persistence we trigger saves in the handler functions directly)
  // We remove the auto-save useEffect to prevent aggressive writes on every state change.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalOperation === 'create') {
      handleCreate();
    } else {
      handleRename();
    }
  };

  const handleCreate = async () => {
    if (modalType === 'club') {
      const newClub = {
        id: Date.now().toString(),
        ownerId: user!.uid,
        name: inputValue,
        events: []
      };
      setClubs([...clubs, newClub]);
      await saveClub(newClub);
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
      const updatedClubs = clubs.map((c: Club) =>
        c.id === activeClubId ? { ...c, events: [...(c.events || []), newEvent] } : c
      );
      setClubs(updatedClubs);
      const activeC = updatedClubs.find(c => c.id === activeClubId);
      if (activeC) await saveClub(activeC as Club & { ownerId: string });
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

    const updatedClubs = clubs.map((c: Club) =>
      c.id === targetClubId ? { ...c, events: [...(c.events || []), newEvent] } : c
    );
    setClubs(updatedClubs);
    
    // Save to firebase
    const c = updatedClubs.find(c => c.id === targetClubId);
    if (c) void saveClub(c as Club & { ownerId: string });

    // Navigate to the new event
    setActiveClubId(targetClubId);
    setActiveEventId(newEvent.id);
    setView('domains');
    setActiveNav('my-clubs');
  };

  const handleRename = async () => {
    if (modalType === 'club') {
      const updatedClubs = clubs.map((c: Club) => c.id === targetId ? { ...c, name: inputValue } : c);
      setClubs(updatedClubs);
      const c = updatedClubs.find(x => x.id === targetId);
      if (c) await saveClub(c as Club & { ownerId: string });
    } else {
      const updatedClubs = clubs.map((c: Club) =>
        c.id === activeClubId ? {
          ...c,
          events: (c.events || []).map((e: ClubEvent) => e.id === targetId ? { ...e, name: inputValue } : e)
        } : c
      );
      setClubs(updatedClubs);
      const activeC = updatedClubs.find(x => x.id === activeClubId);
      if (activeC) await saveClub(activeC as Club & { ownerId: string });
    }
    setIsModalOpen(false);
    setInputValue("");
  };

  const confirmDelete = async () => {
    if (modalType === 'club') {
      setClubs(clubs.filter(c => c.id !== targetId));
      if (activeClubId === targetId) {
        setActiveClubId(null);
        setView('clubs');
      }
      if (targetId) await deleteClubFromDb(targetId);
    } else {
      const updatedClubs = clubs.map((c: Club) =>
        c.id === activeClubId ? {
          ...c,
          events: (c.events || []).filter((e: ClubEvent) => e.id !== targetId)
        } : c
      );
      setClubs(updatedClubs);
      const activeC = updatedClubs.find(x => x.id === activeClubId);
      if (activeC) await saveClub(activeC as Club & { ownerId: string });
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

    const updatedClubs = clubs.map(c => 
      c.id === activeClubId 
        ? { ...c, activityLog: [...(c.activityLog || []), newEvent].slice(-50) } // Keep last 50
        : c
    );
    setClubs(updatedClubs);
    
    // Fire and forget save
    const activeC = updatedClubs.find(c => c.id === activeClubId);
    if (activeC) void saveClub(activeC as Club & { ownerId: string });
  };

  const updateEventConfig = (newData: Partial<EventConfig>) => {
    if (!activeClubId || !activeEventId) return;
    const updatedClubs = clubs.map(c => {
      if (c.id === activeClubId) {
        return {
          ...c,
          events: (c.events || []).map((e: ClubEvent) =>
            e.id === activeEventId ? { ...e, config: { ...e.config, ...newData } } : e
          )
        };
      }
      return c;
    });
    setClubs(updatedClubs);
    
    const activeC = updatedClubs.find(c => c.id === activeClubId);
    if (activeC) void saveClub(activeC as Club & { ownerId: string });
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
    return <LoginView onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-dot-matrix text-white antialiased pb-20 md:pb-0 relative overflow-hidden">
      {/* Ambient Aurora Orbs */}
      <div className="ambient-glow" style={{ top: '10%', left: '20%', animationDelay: '0s' }} />
      <div className="ambient-glow" style={{ top: '60%', right: '10%', background: 'radial-gradient(circle at center, rgba(217, 119, 6, 0.1) 0%, transparent 60%)', animationDelay: '-10s' }} />

      <Sidebar 
        user={{
          id: user?.uid || "",
          user_metadata: { 
            full_name: user?.displayName || "Club Member",
            avatar_url: user?.photoURL || undefined
          }
        }} 
        onLogout={logout} 
        onAboutClick={() => setView('about')} 
        onAccountClick={() => setView('account')}
        onAnalyticsClick={() => setView('analytics')}
        onSettingsClick={() => setView('settings')}
      />

      <div className="max-w-[1600px] mx-auto flex px-4 md:px-6 relative z-10">
        <AppSidebar 
          activeSection={activeNav} 
          onSectionChange={handleNavChange} 
          userRole={currentUserRole}
        />

        <main className="flex-1 py-8 md:py-16 px-4 md:px-12">
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
                        className={`p-8 rounded-[2rem] cursor-pointer relative overflow-hidden ${activeDomain === d.id ? 'glass-panel !bg-neutral-900/60 shadow-gold-glow transform -translate-y-2' : 'glass-card hover:border-gold-500/30'}`}
                      >
                        {activeDomain === d.id && <BorderBeam duration={8} size={300} />}
                        <div className="relative z-10">
                          <d.icon className={`w-8 h-8 mb-4 transition-colors ${activeDomain === d.id ? 'text-gold-400' : 'text-neutral-500'}`} />
                          <h3 className="text-2xl font-normal font-astronomus leading-tight text-white/90">{d.id}</h3>
                          <p className={`text-[10px] font-bold uppercase mt-1 tracking-widest ${activeDomain === d.id ? 'text-signature-gradient' : 'text-neutral-500'}`}>{d.desc}</p>
                        </div>
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
            <MyTeamView clubs={clubs} setClubs={setClubs} />
          </div>

          <div className={`${activeNav === 'membership' ? 'block' : 'hidden'}`}>
            <MembershipView clubs={clubs} setClubs={setClubs} />
          </div>

          <div className={`${activeNav === 'social-tracker' ? 'block' : 'hidden'}`}>
            <SocialTracker clubs={clubs} />
          </div>

          <div className={`${activeNav === 'sponsorship' ? 'block' : 'hidden'}`}>
            <SponsorshipManager
              clubs={clubs}
              onUpdateClub={(updatedClub) => {
                setClubs(prev => prev.map(c => c.id === updatedClub.id ? updatedClub : c));
              }}
            />
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
      <MobileNav 
        activeSection={activeNav} 
        onSectionChange={handleNavChange} 
        userRole={currentUserRole}
      />
    </div>
  );
}