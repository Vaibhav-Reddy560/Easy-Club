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
  Clock,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const lastSyncedUid = useRef<string | null>(typeof window !== 'undefined' ? localStorage.getItem('last_synced_uid') : null);


  // Lifecycle Modals State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [lifecycleTargetId, setLifecycleTargetId] = useState<string | null>(null);

  const activeClub = clubs.find(c => c.id === activeClubId);
  const activeEvent = activeClub?.events?.find((e: ClubEvent) => e.id === activeEventId);

  const pendingWrites = useRef<Set<string>>(new Set());

  // Optimized loading and syncing logic
  useEffect(() => {
    let isMounted = true;
    
    let safetyTimeout: NodeJS.Timeout;
    
    if (authLoading) return () => { isMounted = false; };
    
    if (user) {
      // INITIAL SYNC: Give it more time (8s) on first load for mobile/slow networks
      safetyTimeout = setTimeout(() => {
        if (isMounted && clubs.length === 0) {
          setIsSyncing(false);
          setLoading(false);
          console.warn("[Sync] Initial sync timed out. Data may still be loading in background.");
        }
      }, 8000); 

      if (lastSyncedUid.current !== user.uid) setLoading(true);
      
      const unsubscribe = subscribeUserClubs(user.uid, user.email, (fetchedClubs, syncing) => {
        if (isMounted) {
          // RECONCILIATION: Merge pending local items that haven't hit the server yet
          setClubs(prev => {
            const serverIds = new Set(fetchedClubs.map(c => c.id));
            pendingWrites.current.forEach(id => {
               if (serverIds.has(id)) pendingWrites.current.delete(id);
            });

            const optimisticItems = prev.filter(c => pendingWrites.current.has(c.id));
            const combined = [...fetchedClubs];
            optimisticItems.forEach(opt => {
                if (!serverIds.has(opt.id)) combined.push(opt);
            });
            
            return combined;
          });

          // Update sync status
          setIsSyncing(syncing);
          
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
      // EMERGENCY MOCK MODE: ONLY for unauthenticated users
      if (isMounted) {
          const mockClub: Club = {
            id: 'mock-club',
            name: 'Offline Design Lab',
            events: [{
              id: 'mock-event',
              name: 'AI Concept Workshop',
              status: 'Ideation',
              config: {
                description: 'Testing high-fidelity AI backgrounds and typography in offline mode.',
                type: 'Workshop',
                date: '2026-05-05',
                time: '18:00',
                venue: 'Studio A'
              }
            } as any]
          };
          setClubs([mockClub]);
          setActiveClubId('mock-club');
          setActiveEventId('mock-event');
          setLoading(false);
          setIsSyncing(false);
      }
    }
    
    return () => { 
      isMounted = false; 
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
    
    const capturedValue = inputValue.trim();
    if (!capturedValue) return;

    // 1. OPTIMISTIC UI UPDATE (Sync)
    if (modalOperation === 'create') {
      if (modalType === 'club') {
        const newClub: Club = {
          id: `club_${Date.now()}`,
          ownerId: user?.uid || "guest-id",
          name: capturedValue,
          members: [], 
          events: []
        };
        
        // MARK AS PENDING TO PROTECT FROM SNAPSHOT OVERWRITE
        pendingWrites.current.add(newClub.id);
        
        setClubs(prev => [...prev, newClub]);
        setIsSaving(true);
        setHasUnsavedChanges(true); 

        const saveTimer = setTimeout(() => setIsSaving(false), 4000);
        void saveClub(newClub as Club & { ownerId: string })
          .then(success => {
            if (success) setHasUnsavedChanges(false);
          })
          .finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
          
      } else if (activeClubId) {
        const newEvent: ClubEvent = {
          id: `event_${Date.now()}`,
          name: capturedValue,
          config: { city: "Bengaluru", type: 'Technical', subType: 'Workshop', isCollegeEvent: true, isLaunched: false }
        };
        
        pendingWrites.current.add(activeClubId);
        setIsSaving(true);
        setHasUnsavedChanges(true);

        const updatedClubs = clubs.map(c => c.id === activeClubId ? { ...c, events: [...(c.events || []), newEvent] } : c);
        setClubs(updatedClubs);
        
        const saveTimer = setTimeout(() => setIsSaving(false), 4000);
        const target = updatedClubs.find(c => c.id === activeClubId);
        if (target) {
          void saveClub(target as Club & { ownerId: string }).then(success => {
            if (success) setHasUnsavedChanges(false);
          }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      }
    } else {
      // Handle Rename Optimistically
      if (targetId) pendingWrites.current.add(modalType === 'club' ? targetId : activeClubId!);
      setIsSaving(true);

      const saveTimer = setTimeout(() => setIsSaving(false), 4000);
      if (modalType === 'club') {
        const updated = clubs.map(c => c.id === targetId ? { ...c, name: capturedValue } : c);
        setClubs(updated);
        const target = updated.find(x => x.id === targetId);
        if (target) {
          void saveClub(target as Club & { ownerId: string }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      } else {
        const updated = clubs.map(c => c.id === activeClubId ? {
          ...c, events: (c.events || []).map(e => e.id === targetId ? { ...e, name: capturedValue } : e)
        } : c);
        setClubs(updated);
        const target = updated.find(x => x.id === activeClubId);
        if (target) {
          void saveClub(target as Club & { ownerId: string }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      }
    }


    // 2. PHASE TWO: VISUAL HIDE (INSTANT)
    setIsModalOpen(false); 
    setInputValue("");
    setIsSubmitting(false);
  };


  const handleCreate = async (nameToSave: string) => {
    if (!user) return;
    
    setIsSaving(true);
    setHasUnsavedChanges(true); 

    try {
      if (modalType === 'club') {
        const newClub: Club = {
          id: `club_${Date.now()}`,
          ownerId: user.uid,
          name: nameToSave,
          events: []
        };

        setClubs(prev => [...prev, newClub]);
        void saveClub(newClub as Club & { ownerId: string }).finally(() => setIsSaving(false));
      } else if (activeClubId) {
        const newEvent: ClubEvent = {
          id: `event_${Date.now()}`,
          name: nameToSave,
          config: {
            city: "Bengaluru",
            type: 'Technical',
            subType: 'Workshop',
            isCollegeEvent: true
          }
        };
        
        const updatedClubs = clubs.map((c: Club) => {
          if (c.id === activeClubId) {
            return { ...c, events: [...(c.events || []), newEvent] };
          }
          return c;
        });
        setClubs(updatedClubs);
        
        const saveTimer = setTimeout(() => setIsSaving(false), 4000);
        const updated = updatedClubs.find(c => c.id === activeClubId);
        if (updated) {
          void saveClub(updated as Club & { ownerId: string }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Create failed:", err);
      setIsSaving(false);
    }
  };

  const handleAdoptIdea = async (title: string, ideaConfig: { subType: string, tags: string, description?: string }) => {
    const targetClubId = activeClubId || clubs[0]?.id;
    if (!targetClubId || !user) {
        setActiveNav('my-clubs');
        return;
    }

    const newEvent: ClubEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: title,
      config: {
        subType: ideaConfig.subType,
        description: ideaConfig.description || "",
        date: "", time: "", venue: "", city: "",
        isLaunched: false
      }
    };

    setIsSaving(true);
    const updatedClubs = clubs.map((c: Club) => {
      if (c.id === targetClubId) {
        return { ...c, events: [...(c.events || []), newEvent] };
      }
      return c;
    });
    setClubs(updatedClubs);
    
    const saveTimer = setTimeout(() => setIsSaving(false), 4000);
    const updated = updatedClubs.find(c => c.id === targetClubId);
    if (updated) {
      void saveClub(updated as Club & { ownerId: string }).finally(() => {
        clearTimeout(saveTimer);
        setIsSaving(false);
      });
    } else {
      clearTimeout(saveTimer);
      setIsSaving(false);
    }
    
    setActiveClubId(targetClubId);
    setActiveEventId(newEvent.id);
    setView('domains');
    setActiveNav('my-clubs');
  };

  const handleRename = async (newName: string) => {
    setIsSaving(true);

    try {
      if (modalType === 'club') {
        const updatedClubs = clubs.map((c: Club) => c.id === targetId ? { ...c, name: newName } : c);

        setClubs(updatedClubs);
        const saveTimer = setTimeout(() => setIsSaving(false), 4000);
        const c = updatedClubs.find(x => x.id === targetId);
        if (c) {
          void saveClub(c as Club & { ownerId: string }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      } else {
        const saveTimer = setTimeout(() => setIsSaving(false), 4000);
        const updatedClubs = clubs.map((c: Club) =>
          c.id === activeClubId ? {
            ...c,
            events: (c.events || []).map((e: ClubEvent) => e.id === targetId ? { ...e, name: newName } : e)
          } : c
        );
        setClubs(updatedClubs);
        const activeC = updatedClubs.find(x => x.id === activeClubId);
        if (activeC) {
          void saveClub(activeC as Club & { ownerId: string }).finally(() => {
            clearTimeout(saveTimer);
            setIsSaving(false);
          });
        } else {
          clearTimeout(saveTimer);
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error("Rename failed:", err);
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
        if (activeC) void saveClub(activeC as Club & { ownerId: string });
      }

    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };


  const handleLogActivity = (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => {
    if (!activeClubId || !user) return;
    
    // Structured Sync Event Handler
    if (action === 'Sync State' && details) {
        try {
            const parsed = JSON.parse(details);
            updateEventConfig(parsed);
            return;
        } catch (e) {
            console.error("Sync parse error", e);
        }
    }

    const newEvent: ActivityLogEvent = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      userName: user.displayName || "Unknown Member",
      action,
      domain,
      timestamp: new Date().toISOString(),
      details
    };

    setClubs(prev => {
      const updated = prev.map(c => {
        if (c.id === activeClubId) {
          const updatedClub = { ...c, activityLog: [...(c.activityLog || []), newEvent].slice(-50) };
          void saveClub(updatedClub as Club & { ownerId: string });
          return updatedClub;
        }
        return c;
      });
      return updated;
    });
  };

  const updateEventConfig = (newData: Partial<EventConfig>) => {
    if (!activeClubId || !activeEventId) return;

    setClubs(prev => {
      const updated = prev.map(c => {
        if (c.id === activeClubId) {
          const updatedEvents = (c.events || []).map(e =>
            e.id === activeEventId ? { ...e, config: { ...e.config, ...newData } } : e
          );
          const updatedClub = { ...c, events: updatedEvents };
          void saveClub(updatedClub as Club & { ownerId: string });
          return updatedClub;
        }
        return c;
      });
      return updated;
    });
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
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <PremiumLoader size="lg" />
          <p className="text-signature-gradient font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse mt-8">Syncing Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen text-white antialiased pb-20 md:pb-0 relative">
      <DynamicIsland isSaving={isSaving} isSyncing={isSyncing} />

      <Sidebar 
        user={{
          id: user?.uid || "guest-id",
          user_metadata: { 
            full_name: user?.displayName || "Guest Designer",
            avatar_url: user?.photoURL || undefined
          }
        } as any}
        onLogout={logout} 
        onAboutClick={() => setView('about')} 
        onAccountClick={() => setView('account')}
        onAnalyticsClick={() => setView('analytics')}
        onSettingsClick={() => setView('settings')}
      />


      <div className="flex relative z-10 w-full items-stretch">
        <AppSidebar 
          activeSection={activeNav} 
          onSectionChange={handleNavChange} 
          userRole={currentUserRole}
        />

        <div className="flex-1 min-w-0">
          <div className="max-w-[1400px] mx-auto px-4 md:px-12">
            <main className="pt-8 pb-28 md:py-16 min-w-0">
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
                  title="MY CLUBS"
                  subtitle="All Your Club Folders"
                  addLabel="Establish"
                />
              )}

              {view === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <button
                    onClick={() => { setView('clubs'); setActiveClubId(null); }}
                    className="flex items-center gap-2 mb-8 font-bold hover:text-gold-400 group transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" />
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
                    title={`${activeClub?.name || 'CLUB'} EVENTS`}
                    subtitle="Create your Events"
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
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-white" />
                        <span className="text-sm uppercase tracking-widest text-signature-gradient">Back to Dashboard</span>
                      </button>
                    <button
                      onClick={() => { setLifecycleTargetId(activeEventId); setIsStatusModalOpen(true); }}
                      className="flex items-center gap-2 px-6 py-2 bg-neutral-900 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-400 transition-all shadow-xl whitespace-nowrap"
                    >
                      <Clock className="w-3 h-3" /> Update Status
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
                        className={`p-8 rounded-[2rem] cursor-pointer relative overflow-hidden ${activeDomain === d.id ? 'glass-panel !bg-[#0f0f0f] shadow-gold-glow transform -translate-y-2' : 'glass-card hover:border-gold-500/30'}`}
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
                      {activeDomain === 'Social' && <SocialWorkspace activeEvent={activeEvent} updateConfig={updateEventConfig} />}
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
            <MyTeamView clubs={clubs} user={user} onUpdateClub={onUpdateClub} />
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
      </div>
    </div>

      {/* Modal for Creating/Renaming Clubs/Events */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md">
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
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient text-black font-bold py-4 rounded-xl shadow-xl uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? (
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
          clubName={activeClub?.name}
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
