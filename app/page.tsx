"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EventIdeation from "@/components/EventIdeation";
import SocialTracker from "@/components/SocialTracker";
import SponsorshipManager from "@/components/SponsorshipManager";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileText,
  Share2,
  Pencil,
  Loader2,
  CheckCircle2
} from "lucide-react";

// Import components from the components directory
import Sidebar from "@/components/Sidebar";
import AppSidebar, { NavSection } from "@/components/AppSidebar";
import ClubGrid from "@/components/ClubGrid";
import Questionnaire from "@/components/Questionnaire";
import AboutPage from "@/components/AboutPage";
import ExploreClubs from "@/components/ExploreClubs";
import PremiumLoader from "@/components/ui/PremiumLoader";
import ExploreEvents from "@/components/ExploreEvents";
import DesignWorkspace from "@/components/domains/DesignWorkspace";
import ContentWorkspace from "@/components/domains/ContentWorkspace";
import SocialWorkspace from "@/components/domains/SocialWorkspace";
import EventStatusModal from "@/components/EventStatusModal";
import EventReportModal from "@/components/EventReportModal";
import { BorderBeam } from "@/components/animations/BorderBeam";
import AccountView from "@/components/AccountView";
import AnalyticsView from "@/components/AnalyticsView";
import SettingsView from "@/components/SettingsView";
import MembershipView from "@/components/MembershipView";
import MyTeamView from "@/components/MyTeamView";
import MobileNav from "@/components/MobileNav";
import LoginView from "@/components/LoginView";
import { Club, ClubEvent, EventConfig, MemberRole, ActivityLogEvent, EventStatus, PostEventData } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle, logout } from "@/lib/firebase";
import { subscribeUserClubs, saveClub, deleteClubFromDb } from "@/lib/db";
import DynamicIsland from "@/components/DynamicIsland";

// --- MAIN APPLICATION ---

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSyncedUid = useRef<string | null>(typeof window !== 'undefined' ? localStorage.getItem('last_synced_uid') : null);


  // Lifecycle Modals State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [lifecycleTargetId, setLifecycleTargetId] = useState<string | null>(null);

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeEvent = activeClub?.events?.find((e: ClubEvent) => e.id === activeEventId);

  // Optimized loading and syncing logic
  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent infinite "Syncing Hub" hang
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 10000);

    if (authLoading) return () => { 
      isMounted = false; 
      clearTimeout(safetyTimeout); 
    };
    
    if (user) {
      // Only show full-screen loader if it's a completely new user UID
      if (lastSyncedUid.current !== user.uid) {
        setLoading(true);
      }
      
      const unsubscribe = subscribeUserClubs(user.uid, user.email, (fetchedClubs, syncing) => {
        if (isMounted) {
          setClubs(fetchedClubs);
          setIsSyncing(syncing);
          
          // Only stop the "Syncing Hub" if:
          // 1. We found some clubs (even from cache, to show them instantly)
          // 2. OR the server has finished syncing (syncing is false)
          if (fetchedClubs.length > 0 || !syncing) {
            setLoading(false);
            lastSyncedUid.current = user.uid;
            localStorage.setItem('last_synced_uid', user.uid);
            clearTimeout(safetyTimeout);
          }
        }
      });
      
      return () => {
        isMounted = false;
        unsubscribe();
        clearTimeout(safetyTimeout);
      };
    } else {
      if (isMounted) {
          setClubs([]);
          setLoading(false);
          lastSyncedUid.current = null;
          localStorage.removeItem('last_synced_uid');
          clearTimeout(safetyTimeout);
      }
    }
    
    return () => { 
      isMounted = false; 
      clearTimeout(safetyTimeout);
    };
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

  // Protect against accidental navigation during save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving || hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving, hasUnsavedChanges]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalOperation === 'create') {
      void handleCreate();
    } else {
      void handleRename();
    }
  };
  const handleCreate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setHasUnsavedChanges(true); // Mark as dirty
    try {
      if (modalType === 'club') {
        const newClub: Club = {
          id: `club_${Date.now()}`,
          ownerId: user.uid,
          name: inputValue,
          events: []
        };
        // Optimistic UI update
        setClubs(prev => [...prev, newClub]);
        setIsModalOpen(false); 
        setInputValue("");
        
        const success = await saveClub(newClub as Club & { ownerId: string });
        if (!success) {
          // Revert if failed
          setClubs(prev => prev.filter(c => c.id !== newClub.id));
          alert("Failed to establish club. Reverting changes.");
        }
      } else if (activeClubId) {
        const newEvent: ClubEvent = {
          id: `event_${Date.now()}`,
          name: inputValue,
          config: {
            city: "Bengaluru",
            type: 'Technical',
            subType: 'Workshop',
            isCollegeEvent: true
          }
        };
        
        let targetClub: Club | undefined;
        setClubs(prev => prev.map((c: Club) => {
          if (c.id === activeClubId) {
            targetClub = { ...c, events: [...(c.events || []), newEvent] };
            return targetClub;
          }
          return c;
        }));
        
        setIsModalOpen(false); 
        setInputValue("");
        
        if (targetClub) {
          const success = await saveClub(targetClub as Club & { ownerId: string });
          if (!success) alert("Failed to add event. Work might not be saved.");
        }
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdoptIdea = async (title: string, ideaConfig: { subType: string, tags: string, description?: string }) => {
    const targetClubId = activeClubId || clubs[0]?.id;
    
    if (!targetClubId || !user) {
        alert("Please establish at least one club folder before adopting a blueprint.");
        setActiveNav('my-clubs');
        return;
    }

    const newEvent: ClubEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: title,
      config: {
        subType: ideaConfig.subType,
        description: ideaConfig.description || "",
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
    
    // Switch completely immediately, save in background
    setActiveClubId(targetClubId);
    setActiveEventId(newEvent.id);
    setView('domains');
    setActiveNav('my-clubs');

    const c = updatedClubs.find(c => c.id === targetClubId);
    if (c) {
      setIsSaving(true);
      await saveClub(c as Club & { ownerId: string });
      setIsSaving(false);
    }
  };

  const handleRename = async () => {
    setIsSaving(true);
    try {
      if (modalType === 'club') {
        const updatedClubs = clubs.map((c: Club) => c.id === targetId ? { ...c, name: inputValue } : c);
        setClubs(updatedClubs);
        setIsModalOpen(false); // Close instantly
        setInputValue("");
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
        setIsModalOpen(false); // Close instantly
        setInputValue("");
        const activeC = updatedClubs.find(x => x.id === activeClubId);
        if (activeC) await saveClub(activeC as Club & { ownerId: string });
      }
    } catch (err) {
      console.error("Rename failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    try {
      if (modalType === 'club') {
        const oldClubs = [...clubs];
        setClubs(clubs.filter(c => c.id !== targetId));
        if (activeClubId === targetId) {
          setActiveClubId(null);
          setView('clubs');
        }
        setIsDeleteModalOpen(false); // Close instantly
        if (targetId) {
          const success = await deleteClubFromDb(targetId);
          if (!success) {
            setClubs(oldClubs); // Revert on failure
            throw new Error("Delete failed");
          }
        }
      } else {
        const updatedClubs = clubs.map((c: Club) =>
          c.id === activeClubId ? {
            ...c,
            events: (c.events || []).filter((e: ClubEvent) => e.id !== targetId)
          } : c
        );
        setClubs(updatedClubs);
        setIsDeleteModalOpen(false); // Close instantly
        const activeC = updatedClubs.find(x => x.id === activeClubId);
        if (activeC) await saveClub(activeC as Club & { ownerId: string });
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
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
    if (activeC) {
      setIsSaving(true);
      void saveClub(activeC as Club & { ownerId: string }).finally(() => setIsSaving(false));
    }
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
    if (activeC) {
      setIsSaving(true);
      void saveClub(activeC as Club & { ownerId: string }).finally(() => setIsSaving(false));
    }
  };

  /**
   * Centralized update handler for all modules.
   * Uses functional updates to ensure data integrity during rapid changes.
   */
  const onUpdateClub = async (updatedClub: Club) => {
    setIsSaving(true);
    try {
      // 1. Update local state using functional update to ensure we have the latest 'prev'
      setClubs(prev => prev.map(c => c.id === updatedClub.id ? updatedClub : c));
      
      // 2. Persist to Firestore
      const success = await saveClub(updatedClub as Club & { ownerId: string });
      if (!success) {
        console.error("[Persistence] Failed to sync club updates to cloud.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavChange = (section: NavSection) => {
    setActiveNav(section);
    // REMOVED: Reset internal view if switching back to My Clubs
    // This allows users to "leave off" where they were.
  };

  const lifecycleTargetEvent = activeClub?.events?.find(e => e.id === lifecycleTargetId);

  const handleStatusChange = (eventId: string, status: EventStatus, extra?: { postponedTo?: string; postEventData?: PostEventData; reportContent?: string }) => {
    if (!activeClubId) return;

    const updatedClubs = clubs.map(c => {
      if (c.id === activeClubId) {
        return {
          ...c,
          events: (c.events || []).map((e: ClubEvent) => {
            if (e.id === eventId) {
              const updatedConfig = { ...e.config, status };
              if (extra?.postponedTo) updatedConfig.postponedTo = extra.postponedTo;
              if (extra?.postEventData) updatedConfig.postEventData = extra.postEventData;
              if (extra?.reportContent) {
                updatedConfig.report = {
                  content: extra.reportContent,
                  generatedAt: new Date().toISOString()
                };
              }
              return { ...e, config: updatedConfig };
            }
            return e;
          })
        };
      }
      return c;
    });

    setClubs(updatedClubs);
    const activeC = updatedClubs.find(c => c.id === activeClubId);
    if (activeC) void saveClub(activeC as Club & { ownerId: string });
    
    // Log the status change
    handleLogActivity('Management', `Marked event "${lifecycleTargetEvent?.name}" as ${status.toUpperCase()}`);
  };

  const handleSaveReport = (updatedContent: string) => {
    if (!activeClubId || !lifecycleTargetId) return;

    const updatedClubs = clubs.map(c => {
      if (c.id === activeClubId) {
        return {
          ...c,
          events: (c.events || []).map((e: ClubEvent) => {
            if (e.id === lifecycleTargetId && e.config.report) {
              return {
                ...e,
                config: {
                  ...e.config,
                  report: {
                    ...e.config.report,
                    content: updatedContent,
                    lastEditedAt: new Date().toISOString()
                  }
                }
              };
            }
            return e;
          })
        };
      }
      return c;
    });

    setClubs(updatedClubs);
    const activeC = updatedClubs.find(c => c.id === activeClubId);
    if (activeC) void saveClub(activeC as Club & { ownerId: string });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-8">
        <PremiumLoader size="lg" />
        <p className="text-signature-gradient font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Hub...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white antialiased pb-20 md:pb-0 relative overflow-hidden">
      <DynamicIsland isSaving={isSaving} />



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

        <main className="flex-1 pt-8 pb-28 md:py-16 px-4 md:px-12 min-w-0">
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
                  title="CLUB OVERVIEW"
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
                    onStatusChange={(id) => {
                      setLifecycleTargetId(id);
                      setIsStatusModalOpen(true);
                    }}
                    onViewReport={(id) => {
                      setLifecycleTargetId(id);
                      setIsReportModalOpen(true);
                    }}
                    onRevive={(id) => {
                      setLifecycleTargetId(id);
                      handleStatusChange(id, 'upcoming');
                    }}
                    isEventGrid={true}
                    title="EVENT OVERVIEW"
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
                  <div className="flex justify-between items-center mb-8 gap-4">
                      <button
                        onClick={() => setView('events')}
                        className="flex items-center gap-2 font-bold hover:text-gold-400 group transition-colors flex-shrink-0"
                      >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-gold-500" />
                        <span className="text-sm uppercase tracking-widest text-signature-gradient">Back to Dashboard</span>
                      </button>
                    <button
                      onClick={() => setView('questionnaire')}
                      className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl whitespace-nowrap"
                    >
                      <Pencil className="w-3 h-3" /> Edit Config
                    </button>
                  </div>

                  <div className="mb-12 border-b border-white/15 pb-8">
                    <h2 className="text-3xl md:text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter leading-tight break-words">
                      {activeEvent?.name} <span className="text-white font-normal ml-3 font-astronomus">/ Workspace</span>
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
                          <d.icon className={`w-8 h-8 mb-4 transition-colors ${activeDomain === d.id ? 'text-gold-400' : 'text-zinc-100'}`} />
                          <h3 className="text-2xl font-normal font-astronomus leading-tight text-white/90">{d.id}</h3>
                          <p className={`text-[10px] font-bold uppercase mt-1 tracking-widest ${activeDomain === d.id ? 'text-signature-gradient' : 'text-zinc-100'}`}>{d.desc}</p>
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
            <MyTeamView clubs={clubs} onUpdateClub={onUpdateClub} />
          </div>

          <div className={`${activeNav === 'membership' ? 'block' : 'hidden'}`}>
            <MembershipView clubs={clubs} onUpdateClub={onUpdateClub} />
          </div>

          <div className={`${activeNav === 'social-tracker' ? 'block' : 'hidden'}`}>
            <SocialTracker clubs={clubs} />
          </div>

          <div className={`${activeNav === 'sponsorship' ? 'block' : 'hidden'}`}>
            <SponsorshipManager
              clubs={clubs}
              onUpdateClub={onUpdateClub}
            />
          </div>

          {activeNav === 'ideation' && (
            <EventIdeation clubs={clubs} onAdopt={handleAdoptIdea} />
          )}
        </main>
      </div>

      {/* Modal for Creating/Renaming Clubs/Events */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[120px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-[#121212] border border-gold-500/20 rounded-[2.5rem] p-10 shadow-2xl chassis-panel"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-white hover:text-gold-400 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-2">
                {modalOperation === 'create' ? (modalType === 'club' ? 'Establish Club' : 'Create Event') : `Rename ${modalType === 'club' ? 'Club' : 'Event'}`}
              </h3>
              <p className="text-zinc-100 text-xs mb-8">
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
                  disabled={isSaving}
                  className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl shadow-xl uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    modalOperation === 'create' ? (modalType === 'club' ? 'Establish Club' : 'Create Event') : (modalType === 'club' ? 'Rename Club' : 'Rename Event')
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-[#121212] border border-red-500/20 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Delete {modalType === 'club' ? 'Club' : 'Event'}?</h3>
              <p className="text-zinc-100 text-xs mb-8">
                This action is irreversible. You will lose all data in the <strong className="text-white">"{inputValue}"</strong> folder.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {lifecycleTargetEvent && (
        <EventStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          event={lifecycleTargetEvent}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {lifecycleTargetEvent && lifecycleTargetEvent.config.report && (
        <EventReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          eventName={lifecycleTargetEvent.name}
          report={lifecycleTargetEvent.config.report}
          onSave={handleSaveReport}
        />
      )}

      <MobileNav activeSection={activeNav} onSectionChange={handleNavChange} />
    </div>
  );
}
