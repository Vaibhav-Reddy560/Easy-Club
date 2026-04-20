"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Check, ChevronDown, UserCheck, X, Users } from "lucide-react";
import { Club, ClubMember, MemberRole, RecruitmentBasis } from "@/lib/types";
import { saveClub } from "@/lib/db";

interface MembershipViewProps {
  clubs: Club[];
  setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
}

export default function MembershipView({ clubs, setClubs }: MembershipViewProps) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'junior-core' | 'recruitment-pool' | 'new-recruit'>('junior-core');

  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBasis, setNewBasis] = useState<RecruitmentBasis>('Fee Paid');
  const [newTestDetails, setNewTestDetails] = useState("");

  const activeClub = clubs.find((c: Club) => c.id === selectedClubId);
  const members = activeClub?.members || [];

  const handleUpdateActiveClub = async (updatedClub: (c: Club) => Club) => {
    if (!selectedClubId) return;
    const newClubs = clubs.map((c: Club) => c.id === selectedClubId ? updatedClub(c) : c);
    setClubs(newClubs);
    
    const activeC = newClubs.find(c => c.id === selectedClubId);
    if (activeC && activeC.ownerId) {
        await saveClub(activeC as Club & { ownerId: string });
    }
  };

  const handleRecruitMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember: ClubMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      email: newEmail,
      role: 'General Member',
      joinDate: new Date().toISOString().split('T')[0],
      basis: newBasis,
      testDetails: newBasis === 'Test Passed' ? newTestDetails : undefined
    };
    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: [...(c.members || []), newMember]
    }));

    // Reset Form
    setNewName("");
    setNewEmail("");
    setNewTestDetails("");
    setActiveTab('recruitment-pool');
  };

  const handlePromote = (memberId: string, currentRole: MemberRole) => {
    let newRole: MemberRole = 'General Member';
    if (currentRole === 'General Member') newRole = 'Junior Core';
    else if (currentRole === 'Junior Core') newRole = 'Senior Core';

    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: (c.members || []).map((m: ClubMember) => m.id === memberId ? { ...m, role: newRole } : m)
    }));
  };

  const handleRemove = (memberId: string) => {
    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: (c.members || []).filter((m: ClubMember) => m.id !== memberId)
    }));
  };

  if (!clubs || clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Users className="w-16 h-16 text-neutral-800 mb-6" />
        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">No Clubs Established</h3>
        <p className="text-neutral-500 text-sm">Create a club in &quot;My Clubs&quot; before tracking members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-airstream text-signature-gradient uppercase tracking-tighter">Membership and Recruitment</h2>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-2">
            Selective Onboarding and Core Team Management
          </p>
        </div>

        <div className="relative group min-w-[250px]">
          <select
            value={selectedClubId || ""}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500"
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none group-hover:text-gold-500 transition-colors" />
        </div>
      </div>

      {/* Stats Section Removed as per User Request */}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('junior-core')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'junior-core' ? 'text-signature-gradient border-gold-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
        >
          Junior Core Team
        </button>
        <button
          onClick={() => setActiveTab('recruitment-pool')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'recruitment-pool' ? 'text-signature-gradient border-gold-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
        >
          General Roster
        </button>
        <button
          onClick={() => setActiveTab('new-recruit')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'new-recruit' ? 'text-signature-gradient border-gold-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'}`}
        >
          New Recruitment
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'junior-core' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-[10px] font-black uppercase tracking-widest text-signature-gradient border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">Member</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5">Date Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.filter((m: ClubMember) => m.role === 'Junior Core').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-neutral-500 uppercase tracking-widest font-bold text-[10px]">
                      No Junior Core members recruited yet.
                    </td>
                  </tr>
                ) : (
                  members
                    .filter((m: ClubMember) => m.role === 'Junior Core')
                    .map((member: ClubMember) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-white mb-1">{member.name}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{member.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          member.role === 'Senior Core' ? 'bg-gold-500/20 text-signature-gradient border border-gold-500/30' :
                          member.role === 'Junior Core' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-white/5 text-neutral-400 border border-white/10'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {member.basis}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] text-neutral-400 font-mono">
                        {member.joinDate}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          {member.role !== 'Senior Core' && (
                            <button
                              onClick={() => handlePromote(member.id, member.role)}
                              className="px-4 py-2 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all"
                            >
                              Promote to {member.role === 'General Member' ? 'Junior Core' : 'Senior Core'}
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'recruitment-pool' && (
          <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-[10px] font-black uppercase tracking-widest text-neutral-500/70 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">General Member</th>
                  <th className="px-8 py-5 text-right">Selection for Core</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.filter((m: ClubMember) => m.role === 'General Member').length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-20 text-center text-neutral-500 uppercase tracking-widest font-bold text-[10px]">
                      No members available for promotion. Recruit first.
                    </td>
                  </tr>
                ) : (
                  members
                    .filter((m: ClubMember) => m.role === 'General Member')
                    .map((member: ClubMember) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-white mb-1">{member.name}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{member.email}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handlePromote(member.id, 'General Member')}
                          className="px-6 py-2 bg-gold-500 text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Select for Junior Core
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'new-recruit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleRecruitMember} className="bg-neutral-900/60 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><UserPlus className="w-5 h-5 text-gold-500" /> Admit New Member</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Verify and onboard candidates</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Verification Basis</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewBasis('Fee Paid')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Fee Paid' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-neutral-500 hover:border-white/30'}`}
                    >
                      Fee Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBasis('Test Passed')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Test Passed' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-neutral-500 hover:border-white/30'}`}
                    >
                      Test Passed
                    </button>
                  </div>
                </div>

                {newBasis === 'Test Passed' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Exercise/Test Details</label>
                    <textarea
                      required
                      value={newTestDetails}
                      onChange={e => setNewTestDetails(e.target.value)}
                      placeholder="e.g. Scored 85% in App Dev Sprint..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors h-24 resize-none"
                    />
                  </motion.div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button type="submit" className="w-full bg-gold-500 text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-xl hover:brightness-110 flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" /> Finalize Recruitment
                </button>
              </div>
            </form>

            {/* Core Promotion Info panel */}
            <div className="bg-neutral-900/40 border border-white/5 border-dashed rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
              <Shield className="w-16 h-16 text-neutral-700 mb-6" />
              <h4 className="text-xl font-bold text-white mb-4">Core Team Hierarchy</h4>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mb-8">
                The Club Core is composed of driven individuals who manage the club. Recruit members first, then promote exceptional candidates to <strong className="text-blue-400 font-bold">Junior Core</strong> and <strong className="text-signature-gradient font-bold">Senior Core</strong> from the Member Directory.
              </p>
              <button 
                onClick={() => setActiveTab('recruitment-pool')}
                className="px-6 py-3 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Go to Recruitment Pool
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
