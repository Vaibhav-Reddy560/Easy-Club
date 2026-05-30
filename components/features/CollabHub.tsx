"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Handshake, 
  Search, 
  Settings, 
  MessageSquare, 
  Users, 
  Zap, 
  Plus, 
  Check, 
  X,
  Send,
  Filter,
  Globe,
  Lock,
  ChevronRight,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { Club, CollabRequest, Collaboration, Message, MemberRole } from "@/lib/types";
import { 
  getAllPublicClubs, 
  updateCollabPreferences, 
  sendCollabRequest, 
  respondToCollabRequest,
  sendCollabMessage 
} from "@/lib/utils/db";
import { BorderBeam } from "@/components/animations/BorderBeam";

interface CollabHubProps {
  clubs: Club[];
  activeClubId: string | null;
  setActiveClubId: (id: string | null) => void;
  userRole: MemberRole;
  user: any;
  onUpdateClub: (club: Club) => Promise<void>;
}

const CLUB_TYPES = [
    "Bio", "Math", "Physics", "Chemistry", "Racing", "Dance", "Singing",
    "Theatre/Acting", "Astronomy/Space", "Coding", "Mountaineering",
    "Fashion", "Photography", "Social Service", "Debating", "Fine Arts",
    "Literary", "Comedy", "Electronics", "Robotics", "Cultural", "Business"
];

const PREDEFINED_TAGS = [
    "Hackathons", "Workshops", "Concerts", "Festivals", "Networking", 
    "Guest Lectures", "Competitions", "Bootcamps", "Exhibitions", 
    "Fundraisers", "Sponsorships"
];

export default function CollabHub({ clubs, activeClubId, setActiveClubId, userRole, user, onUpdateClub }: CollabHubProps) {
  const [activeTab, setActiveTab] = useState<'scout' | 'workspace' | 'settings'>('scout');
  const [publicClubs, setPublicClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collaboration | null>(null);
  const [messageText, setMessageText] = useState("");
  const [scoutSearch, setScoutSearch] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");
  const [selectedFilterLocation, setSelectedFilterLocation] = useState("All");

  const activeClub = clubs.find(c => c.id === activeClubId);
  const isSenior = userRole === 'Admin' || userRole === 'Senior Core';

  useEffect(() => {
    if (activeTab === 'scout') {
      loadPublicClubs();
    }
  }, [activeTab]);

  const loadPublicClubs = async () => {
    setLoading(true);
    const results = await getAllPublicClubs();
    // Filter out our own club
    setPublicClubs(results.filter(c => c.id !== activeClubId));
    setLoading(false);
  };

  const handleUpdateSettings = async (prefs: any) => {
    if (!activeClubId) return;
    const success = await updateCollabPreferences(activeClubId, prefs);
    if (success && activeClub) {
      await onUpdateClub({ ...activeClub, collabPreferences: prefs });
    }
  };

  const handleSendRequest = async (toClubId: string) => {
    if (!activeClub || !isSenior) return;
    setIsSendingRequest(true);
    const success = await sendCollabRequest(
      { id: activeClub.id, name: activeClub.name },
      toClubId,
      requestMessage,
      activeClub.collabPreferences?.interestedIdeas || []
    );
    if (success) {
      setRequestMessage("");
      // Add a small toast or notification here
    }
    setIsSendingRequest(false);
  };

  const handleRespond = async (requestId: string, response: 'accepted' | 'declined') => {
    if (!activeClubId || !isSenior) return;
    const success = await respondToCollabRequest(activeClubId, requestId, response);
    if (success && activeClub) {
        // Refresh local data
        const updatedRequests = activeClub.collabRequests?.map(r => 
            r.id === requestId ? { ...r, status: response } : r
        );
        await onUpdateClub({ ...activeClub, collabRequests: updatedRequests });
    }
  };

  const handleSendMessage = async () => {
    if (!activeClubId || !selectedCollab || !messageText.trim()) return;
    const success = await sendCollabMessage(
      activeClubId,
      selectedCollab.id,
      { id: user.uid, name: user.displayName || "Member" },
      messageText
    );
    if (success) {
      setMessageText("");
      // Refresh messages logic... in a real app this would be a subscription
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tight">Collab Hub</h2>
          <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase">
            Forge Strategic Partnerships
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 p-1.5 backdrop-blur-xl">
            {[
              { id: 'scout', label: 'Scout', icon: Search },
              { id: 'workspace', label: 'Workspace', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id 
                  ? 'bg-gold-gradient text-black shadow-gold-glow scale-105' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Club Selector */}
          <div className="relative group min-w-[250px]">
            <select
              value={activeClubId || ""}
              onChange={(e) => setActiveClubId(e.target.value || null)}
              className="w-full appearance-none bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500 cursor-pointer"
            >
              <option value="" disabled className="bg-black text-white">Select a Club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id} className="bg-black text-white">{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none group-hover:text-gold-500 transition-colors" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SCOUT TAB */}
        {activeTab === 'scout' && (
          <motion.div
            key="scout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-gold-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search clubs by name, category or location..."
                  value={scoutSearch}
                  onChange={(e) => setScoutSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-4 pl-12 pr-6 text-sm text-white placeholder:text-zinc-600 focus:border-gold-500/50 focus:outline-none transition-all outline-none"
                />
              </div>
              <div className="relative z-20">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 border rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'}`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {(selectedFilterCategory !== "All" || selectedFilterLocation !== "All") && (
                     <span className="w-2 h-2 rounded-full bg-gold-500 ml-1" />
                  )}
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl p-4 z-40 shadow-2xl"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Filter by Category</h4>
                      <div className="relative group">
                        <select 
                          value={selectedFilterCategory}
                          onChange={(e) => setSelectedFilterCategory(e.target.value)}
                          className="w-full appearance-none bg-black border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-white outline-none focus:border-gold-500/50 cursor-pointer"
                        >
                          <option value="All">All Categories</option>
                          {CLUB_TYPES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-gold-500 transition-colors" />
                      </div>

                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 mt-4">Filter by Location</h4>
                      <div className="relative group">
                        <select 
                          value={selectedFilterLocation}
                          onChange={(e) => setSelectedFilterLocation(e.target.value)}
                          className="w-full appearance-none bg-black border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-white outline-none focus:border-gold-500/50 cursor-pointer"
                        >
                          <option value="All">All Locations</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-gold-500 transition-colors" />
                      </div>

                      <button 
                        onClick={() => { setSelectedFilterCategory("All"); setSelectedFilterLocation("All"); setShowFilters(false); }}
                        className="w-full mt-4 py-2 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/5 transition-all"
                      >
                        Clear Filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Recommendation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 glass-card animate-pulse" />
                ))
              ) : (
                publicClubs
                  .filter(c => {
                      if (!scoutSearch) return true;
                      const s = scoutSearch.toLowerCase();
                      return c.name.toLowerCase().includes(s) || 
                             (c.collabPreferences?.categories && c.collabPreferences.categories.some(cat => cat.toLowerCase().includes(s)));
                  })
                  .filter(c => selectedFilterCategory === "All" || (c.collabPreferences?.categories && c.collabPreferences.categories.includes(selectedFilterCategory)))
                  .map(club => (
                  <motion.div 
                    key={club.id}
                    whileHover={{ y: -5 }}
                    className="glass-panel p-6 relative overflow-hidden group border border-white/5 hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-[1px]">
                        <div className="w-full h-full bg-[#0a0a0a] rounded-2xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-gold-400" />
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {club.collabPreferences?.categories?.[0] || 'Uncategorized'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{club.name}</h3>
                    <p className="text-zinc-500 text-xs mb-6 line-clamp-2">{club.description || "No description provided."}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {club.collabPreferences?.interestedIdeas?.slice(0, 3).map(idea => (
                        <span key={idea} className="px-2 py-1 bg-gold-500/10 border border-gold-500/20 rounded-md text-[8px] font-bold text-gold-400 uppercase tracking-widest">
                          {idea}
                        </span>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleSendRequest(club.id)}
                      disabled={!isSenior}
                      className="w-full py-3 bg-white/5 hover:bg-gold-gradient hover:text-black border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                    >
                      {isSenior ? 'Send Collab Request' : 'Admin Restricted'}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]"
          >
            {/* Sidebar: Requests and active collabs */}
            <div className="lg:col-span-4 space-y-8">
              {/* Incoming Requests */}
              <div className="glass-panel p-6 border border-gold-500/10">
                <h3 className="text-xs font-black text-signature-gradient uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  Requests ({activeClub?.collabRequests?.filter(r => r.status === 'pending').length || 0})
                </h3>
                <div className="space-y-4">
                  {activeClub?.collabRequests?.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-white">{req.fromClubName}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Pending Request</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRespond(req.id, 'accepted')}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-black transition-all"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleRespond(req.id, 'declined')}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-black transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic line-clamp-2">"{req.message}"</p>
                    </div>
                  ))}
                  {!activeClub?.collabRequests?.some(r => r.status === 'pending') && (
                    <div className="text-center py-8">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No pending requests</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Partnerships */}
              <div className="glass-panel p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">
                  Active Partners
                </h3>
                <div className="space-y-3">
                  {activeClub?.activeCollabs?.map(collab => (
                    <button
                      key={collab.id}
                      onClick={() => setSelectedCollab(collab)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all ${selectedCollab?.id === collab.id ? 'bg-gold-gradient text-black' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${selectedCollab?.id === collab.id ? 'bg-black/20' : 'bg-black/40'}`}>
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-left">{collab.partnerClubName}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedCollab?.id === collab.id ? 'text-black' : 'text-zinc-500'}`} />
                    </button>
                  ))}
                  {!activeClub?.activeCollabs?.length && (
                    <div className="text-center py-8">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No active partnerships</p>
                      <button 
                        onClick={() => setActiveTab('scout')}
                        className="text-[9px] font-bold text-gold-400 uppercase tracking-widest mt-4 hover:underline"
                      >
                        Start Scouting →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Chat / Collaboration Area */}
            <div className="lg:col-span-8">
              {selectedCollab ? (
                <div className="glass-panel h-full flex flex-col border border-white/10 relative overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold-gradient p-[1px]">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gold-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedCollab.partnerClubName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Secure Workspace</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {selectedCollab.messages?.map((msg, i) => (
                      <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs ${msg.senderId === user.uid ? 'bg-gold-gradient text-black rounded-tr-none' : 'bg-white/5 border border-white/10 text-white rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-2 px-1">
                          {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {!selectedCollab.messages?.length && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Encrypted Channel Established</p>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-6 border-t border-white/10 bg-black/20">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                      className="flex gap-4"
                    >
                      <input 
                        type="text" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message to your partners..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-gold-500/50 outline-none transition-all"
                      />
                      <button 
                        type="submit"
                        className="px-6 py-4 bg-gold-gradient text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-gold-glow hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="glass-panel h-full flex flex-col items-center justify-center p-20 border-dashed border-white/10 bg-white/[0.02]">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                    <Handshake className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-2xl font-astronomus text-white mb-2 uppercase">Select a Partnership</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center max-w-sm">
                    Select an active collaboration from the sidebar to enter the secure workspace and start communicating.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="glass-panel p-10 relative overflow-hidden">
              <BorderBeam duration={12} size={400} />
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gold-gradient flex items-center justify-center shadow-gold-glow">
                  <Settings className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-astronomus text-white uppercase">Collab Preferences</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure your visibility and discovery rules</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Visibility Toggle */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-signature-gradient uppercase tracking-widest mb-4">Platform Visibility</h4>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Public Scouting</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Appear in the Collab Registry</p>
                        </div>
                        <button 
                          onClick={() => handleUpdateSettings({ ...activeClub?.collabPreferences, isVisible: !activeClub?.collabPreferences?.isVisible })}
                          className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${activeClub?.collabPreferences?.isVisible ? 'bg-gold-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-black transition-all duration-500 ${activeClub?.collabPreferences?.isVisible ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-gold-500/10">
                        {activeClub?.collabPreferences?.isVisible ? <Globe className="w-4 h-4 text-gold-400" /> : <Lock className="w-4 h-4 text-zinc-500" />}
                        <p className="text-[10px] font-medium text-zinc-400">
                          {activeClub?.collabPreferences?.isVisible 
                            ? "Other clubs can find you and send collaboration proposals."
                            : "Your club is hidden from the registry. You can still send requests."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-6">
                   <div>
                    <h4 className="text-xs font-black text-signature-gradient uppercase tracking-widest mb-4">Scouting Algorithm</h4>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Primary Club Category</label>
                        <div className="relative group">
                          <select 
                            value={activeClub?.collabPreferences?.categories?.[0] || ""}
                            onChange={(e) => handleUpdateSettings({ ...activeClub?.collabPreferences, categories: [e.target.value] })}
                            className="w-full appearance-none bg-black border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-white focus:border-gold-500/50 outline-none cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            {CLUB_TYPES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-focus-within:text-gold-500 transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Collab Interest Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set([...PREDEFINED_TAGS, ...(activeClub?.collabPreferences?.interestedIdeas || [])])).map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                const current = activeClub?.collabPreferences?.interestedIdeas || [];
                                const updated = current.includes(tag) 
                                  ? current.filter(t => t !== tag)
                                  : [...current, tag];
                                handleUpdateSettings({ ...activeClub?.collabPreferences, interestedIdeas: updated });
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${activeClub?.collabPreferences?.interestedIdeas?.includes(tag) 
                                ? 'bg-gold-500/20 border-gold-500 text-gold-400' 
                                : 'bg-black/40 border-white/10 text-zinc-500 hover:border-white/30'}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                          <input 
                             type="text" 
                             placeholder="Add custom tag..."
                             value={customTag}
                             onChange={(e) => setCustomTag(e.target.value)}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter' && customTag.trim()) {
                                   e.preventDefault();
                                   const current = activeClub?.collabPreferences?.interestedIdeas || [];
                                   if (!current.includes(customTag.trim())) {
                                      handleUpdateSettings({ ...activeClub?.collabPreferences, interestedIdeas: [...current, customTag.trim()] });
                                   }
                                   setCustomTag("");
                                }
                             }}
                             className="bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-gold-500/50 outline-none flex-1"
                          />
                          <button 
                             onClick={() => {
                                if (customTag.trim()) {
                                   const current = activeClub?.collabPreferences?.interestedIdeas || [];
                                   if (!current.includes(customTag.trim())) {
                                      handleUpdateSettings({ ...activeClub?.collabPreferences, interestedIdeas: [...current, customTag.trim()] });
                                   }
                                   setCustomTag("");
                                }
                             }}
                             className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-black uppercase tracking-widest text-[10px] shadow-gold-glow hover:scale-105 transition-all"
                          >
                             Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-gold-500/5 border border-gold-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-gold-gradient rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Smart Matching System</h4>
                  <p className="text-[10px] text-zinc-400 font-medium max-w-lg mt-1">Our algorithm uses these preferences to suggest compatible clubs for your next big event. Complete your profile to get 2x better matches.</p>
                </div>
                <button className="md:ml-auto px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Optimize Profile
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
