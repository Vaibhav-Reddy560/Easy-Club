"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TrendingIdeas from "@/components/TrendingIdeas";
import SocialTracker from "@/components/SocialTracker";
import SponsorshipManager from "@/components/SponsorshipManager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Plus,
  Trash2,
  ChevronLeft,
  Palette,
  FileText,
  Share2,
  Layout,
  Sparkles,
  Edit3,
  Search,
  Zap,
  Clock,
  LayoutDashboard,
  Compass,
  Trophy
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
import { User, Club, ClubEvent, EventConfig } from "@/lib/types";

// --- MAIN APPLICATION ---

export default function App() {
  const [user] = useState<User>({
    id: "guest-user",
    user_metadata: { full_name: "Guest User" }
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeNav, setActiveNav] = useState<NavSection>('my-clubs');
  const [view, setView] = useState<'clubs' | 'events' | 'questionnaire' | 'domains' | 'about'>('clubs');
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<'Design' | 'Content' | 'Social'>('Design');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'club' | 'event'>('club');
  const [modalOperation, setModalOperation] = useState<'create' | 'rename'>('create');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeEvent = activeClub?.events?.find((e: ClubEvent) => e.id === activeEventId);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClubs = localStorage.getItem("easy-club-data");
    if (savedClubs) {
      try {
        setClubs(JSON.parse(savedClubs));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      // Default initial data if none exists
      setClubs([]);
    }
    setLoading(false);
  }, []);

  // Save data to localStorage whenever clubs state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("easy-club-data", JSON.stringify(clubs));
    }
  }, [clubs, loading]);

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

  const handleAdoptIdea = (title: string, config: any) => {
    // If we have clubs, add it to the first one as a default, or the active one
    const targetClubId = activeClubId || clubs[0]?.id;
    
    if (!targetClubId) {
        alert("Please establish at least one club folder before adopting a blueprint.");
        setActiveNav('my-clubs');
        return;
    }

    const newEvent: ClubEvent = {
      id: Date.now().toString(),
      name: title,
      config: {
        city: "Bengaluru",
        type: 'Technical', // Fallback
        subType: 'Workshop', // Fallback
        isLaunched: true, // Auto-launch since it's from a blueprint
        ...config
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-gold-500 font-bold uppercase tracking-widest">
        Loading Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white antialiased">
      <Sidebar user={user} onLogout={() => { }} onAboutClick={() => setView('about')} />

      <div className="max-w-[1600px] mx-auto flex px-6">
        <AppSidebar activeSection={activeNav} onSectionChange={handleNavChange} />

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
                    className="flex items-center gap-2 text-gold-500 mb-8 font-bold hover:text-gold-400 group transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm uppercase tracking-widest">Back to Clubs</span>
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
                      className="flex items-center gap-2 text-gold-500 font-bold hover:text-gold-400 group transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-sm uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                    <button
                      onClick={() => setView('questionnaire')}
                      className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Config
                    </button>
                  </div>

                  <div className="mb-12 border-b border-white/5 pb-8">
                    <h2 className="text-3xl font-bold tracking-tighter">
                      {activeEvent?.name} <span className="text-neutral-600 font-normal ml-3">/ Workspace</span>
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
                      {activeDomain === 'Design' && <DesignWorkspace activeEvent={activeEvent} />}
                      {activeDomain === 'Content' && <ContentWorkspace activeEvent={activeEvent} activeClub={activeClub} updateConfig={updateEventConfig} />}
                      {activeDomain === 'Social' && <SocialWorkspace activeEvent={activeEvent} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {view === 'about' && (
                <AboutPage onBack={() => setView('clubs')} />
              )}
            </AnimatePresence>
          </div>

          <div className={`${activeNav === 'explore-clubs' ? 'block' : 'hidden'}`}>
            <ExploreClubs />
          </div>

          <div className={`${activeNav === 'explore-events' ? 'block' : 'hidden'}`}>
            <ExploreEvents />
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