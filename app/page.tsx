"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  Trophy, 
  Target, 
  Calendar, 
  Plus, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Menu,
  X,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  db, 
  auth, 
  getClubs, 
  addClub, 
  updateClub, 
  deleteClub 
} from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoginView from "@/components/LoginView";
import { AppSidebar } from "@/components/AppSidebar";
import MembershipView from "@/components/MembershipView";
import { MobileNav } from "@/components/MobileNav";
import { Club, Event, ClubMember } from "@/lib/types";

// --- Sub-components for better organization ---

const DashboardView = ({ clubs, onSelectClub }: { clubs: Club[], onSelectClub: (club: Club) => void }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 font-astronomus">Welcome Back!</h2>
          <p className="text-gray-400">Here's what's happening across your clubs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search clubs..." 
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <motion.div
            key={club.id}
            whileHover={{ y: -5 }}
            onClick={() => onSelectClub(club)}
            className="group cursor-pointer glass-morphism rounded-3xl overflow-hidden transition-all hover:border-purple-500/30"
          >
            <div className="h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="p-6 pt-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{club.name}</h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 uppercase tracking-wider">
                  {club.role}
                </span>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">
                {club.description || "Empowering students through innovation and collaborative projects."}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {club.members?.length || 0} Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {club.events?.length || 0} Events
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          whileHover={{ scale: 0.98 }}
          className="rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-purple-500/30 hover:bg-white/5 transition-all min-h-[320px]"
        >
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Register New Club</h3>
          <p className="text-sm text-gray-500 max-w-[200px]">Create a new space for your organization</p>
        </motion.div>
      </div>
    </div>
  );
};

const EventsView = ({ club }: { club: Club }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-astronomus">Event Portfolio</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
                ? "bg-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(club.events && club.events.length > 0) ? club.events.map((event) => (
          <div key={event.id} className="glass-morphism rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all">
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-purple-400 font-bold uppercase">Oct</span>
                <span className="text-2xl font-bold text-white">24</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 10:00 AM - 4:00 PM • Main Auditorium
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold tracking-tighter">Workshop</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase font-bold tracking-tighter">Budget Approved</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-800 flex items-center justify-center text-[10px] text-white">
                    JD
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-background bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                  +12
                </div>
              </div>
              <button className="flex-1 md:flex-none border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl text-sm transition-all">
                Details
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center glass-morphism rounded-3xl border-2 border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No events scheduled</h3>
            <p className="text-sm text-gray-500">Start by creating your first club event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SponsorshipView = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white font-astronomus">Sponsorship Pipeline</h2>
      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
        <Plus className="w-4 h-4" /> New Prospect
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: "Prospecting", count: 8, color: "blue", total: "$12,400" },
        { title: "In Discussion", count: 3, color: "purple", total: "$5,000" },
        { title: "Closed Won", count: 5, color: "green", total: "$28,500" }
      ].map((stage) => (
        <div key={stage.title} className="glass-morphism rounded-2xl p-6 border-t-4 border-t-purple-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">{stage.title}</h3>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{stage.count}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stage.total}</div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Volume</p>
        </div>
      ))}
    </div>

    <div className="glass-morphism rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-bold text-white">Active Campaigns</h3>
        <button className="text-sm text-purple-400 font-bold flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <th className="px-6 py-4">Sponsor</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { name: "TechGiant Corp", value: "$5,000", status: "Active", type: "Gold" },
              { name: "Global Finance", value: "$2,500", status: "Pending", type: "Silver" },
              { name: "StartUp Inc", value: "$1,000", status: "Active", type: "Bronze" }
            ].map((sponsor, i) => (
              <tr key={i} className="hover:bg-white/5 transition-all text-sm group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{sponsor.name}</div>
                  <div className="text-xs text-gray-500">{sponsor.type} Tier</div>
                </td>
                <td className="px-6 py-4 font-mono text-white">{sponsor.value}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    sponsor.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {sponsor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-500 hover:text-white transition-all"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchClubs();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSelectedClub(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    setActiveTab("Dashboard");
    setIsMobileMenuOpen(false);
  };

  const handleBackToClubs = () => {
    setSelectedClub(null);
    setActiveTab("Dashboard");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 animate-pulse" />
          </div>
          <span className="text-purple-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Terminal</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    if (!selectedClub) {
      return <DashboardView clubs={clubs} onSelectClub={handleSelectClub} />;
    }

    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Members", value: selectedClub.members?.length || 0, icon: Users, color: "blue" },
                { label: "Active Events", value: selectedClub.events?.length || 0, icon: Calendar, color: "purple" },
                { label: "Sponsorships", value: 12, icon: Target, color: "emerald" },
                { label: "Tasks", value: 5, icon: Trophy, color: "amber" }
              ].map((stat, i) => (
                <div key={i} className="glass-morphism rounded-3xl p-6 hover:bg-white/10 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-morphism rounded-3xl p-8 border-l-4 border-l-purple-500">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-astronomus">
                  <LayoutDashboard className="w-5 h-5 text-purple-400" /> Recent Activity
                </h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== 3 && <div className="absolute left-4 top-8 bottom-[-16px] w-[2px] bg-white/5"></div>}
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center z-10 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Updated event budget for "Spring Workshop"</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago • Admin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-morphism rounded-3xl p-8 border-l-4 border-l-blue-500">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-astronomus">
                  <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Deadlines
                </h3>
                <div className="space-y-4">
                  {[
                    { title: "Sponsorship Proposal", date: "Oct 28", priority: "High" },
                    { title: "Venue Confirmation", date: "Oct 30", priority: "Medium" }
                  ].map((task, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-white">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.date}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "Portfolio":
        return <EventsView club={selectedClub} />;
      case "Membership":
        return <MembershipView club={selectedClub} onUpdate={fetchClubs} />;
      case "Sponsorship":
        return <SponsorshipView />;
      case "Settings":
        return (
          <div className="glass-morphism rounded-3xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-6 font-astronomus">Club Configuration</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Club Name</label>
                <input type="text" defaultValue={selectedClub.name} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Visibility</label>
                <div className="flex gap-4">
                  <button className="flex-1 p-4 rounded-2xl border-2 border-purple-500 bg-purple-500/10 text-white font-bold text-sm">Public</button>
                  <button className="flex-1 p-4 rounded-2xl border-2 border-white/10 text-gray-500 font-bold text-sm hover:border-white/20 transition-all">Private</button>
                </div>
              </div>
              <div className="pt-4">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/20">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>View coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block h-full border-r border-white/5">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedClub={selectedClub}
          onBackToClubs={handleBackToClubs}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          userRole={selectedClub?.role}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full"></div>

        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-20 glass-morphism sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white font-astronomus tracking-tight truncate max-w-[150px] sm:max-w-none break-words">
                {selectedClub ? selectedClub.name : "Command Center"}
              </h1>
              {selectedClub && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Workspace</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-400 font-medium max-w-[100px] truncate">{user.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedClub ? `${selectedClub.id}-${activeTab}` : "dashboard"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedClub={selectedClub}
            userRole={selectedClub?.role}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-[#020617] border-r border-white/10 z-[60] lg:hidden p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white font-airstream tracking-wider">Easy Club</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Your Spaces</h3>
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => handleSelectClub(club)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      selectedClub?.id === club.id 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" />
                      <span className="font-bold text-sm truncate max-w-[150px]">{club.name}</span>
                    </div>
                    {selectedClub?.id === club.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
