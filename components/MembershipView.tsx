"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Check, ChevronDown, UserCheck, X, Users, Settings, Upload, Save, FileSpreadsheet } from "lucide-react";
import { Club, ClubMember, MemberRole, RecruitmentBasis, MembershipConfig } from "@/lib/types";
import { saveClub } from "@/lib/db";

interface MembershipViewProps {
  clubs: Club[];
  onUpdateClub: (updatedClub: Club) => void;
}

export default function MembershipView({ clubs, onUpdateClub }: MembershipViewProps) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'recruitment-pool' | 'new-recruit'>('recruitment-pool');

  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBasis, setNewBasis] = useState<RecruitmentBasis>('Fee Paid');
  const [newTestDetails, setNewTestDetails] = useState("");

  const activeClub = clubs.find((c: Club) => c.id === selectedClubId);
  const members = activeClub?.members || [];

  // Configuration State
  const [configMode, setConfigMode] = useState<'fee-based' | 'test-based'>('fee-based');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [paperLink, setPaperLink] = useState("");
  const [answers, setAnswers] = useState("");
  const [minimumMarks, setMinimumMarks] = useState<number>(0);

  // CSV Verification State
  const [csvData, setCsvData] = useState("");
  const [verificationResult, setVerificationResult] = useState<{name: string, email: string, status: string, passed: boolean}[] | null>(null);

  React.useEffect(() => {
    if (activeClub?.membershipConfig) {
      setConfigMode(activeClub.membershipConfig.mode);
      setFeeAmount(activeClub.membershipConfig.feeAmount || 0);
      setPaperLink(activeClub.membershipConfig.testDetails?.paperLink || "");
      setAnswers(activeClub.membershipConfig.testDetails?.answers || "");
      setMinimumMarks(activeClub.membershipConfig.testDetails?.minimumMarks || 0);
      setNewBasis(activeClub.membershipConfig.mode === 'fee-based' ? 'Fee Paid' : 'Test Passed');
      setNewTestDetails(activeClub.membershipConfig.testDetails?.paperLink ? `Paper: ${activeClub.membershipConfig.testDetails.paperLink}` : "");
    } else {
      setConfigMode('fee-based');
      setFeeAmount(0);
      setPaperLink("");
      setAnswers("");
      setMinimumMarks(0);
      setNewBasis('Fee Paid');
      setNewTestDetails("");
    }
  }, [activeClub?.id, activeClub?.membershipConfig]);

  const handleUpdateActiveClub = async (updatedClubFn: (c: Club) => Club) => {
    if (!selectedClubId) return;
    const activeClub = clubs.find(c => c.id === selectedClubId);
    if (!activeClub) return;
    
    // Apply the transformation and push to the centralized handler
    const updatedClub = updatedClubFn(activeClub);
    onUpdateClub(updatedClub);
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

  const handleSaveConfig = () => {
    handleUpdateActiveClub((c: Club) => ({
      ...c,
      membershipConfig: {
        mode: configMode,
        feeAmount: configMode === 'fee-based' ? feeAmount : undefined,
        testDetails: configMode === 'test-based' ? {
          paperLink,
          answers,
          minimumMarks
        } : undefined
      }
    }));
  };

  const handleVerifyCSV = () => {
    if (!csvData) return;
    
    // Format expected: Name, Email, Status (Paid/Marks)
    const lines = csvData.split('\n');
    const results: {name: string, email: string, status: string, passed: boolean}[] = [];
    
    // Skip header and empty lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        const name = parts[0].trim();
        const email = parts[1].trim();
        const statusValue = parts[2].trim();
        
        let passed = false;
        if (configMode === 'fee-based') {
          passed = statusValue.toLowerCase() === 'paid' || statusValue.toLowerCase() === 'yes';
        } else {
          const marks = parseInt(statusValue);
          passed = !isNaN(marks) && marks >= minimumMarks;
        }
        
        results.push({
          name,
          email,
          status: passed ? 'Verified' : 'Failed',
          passed
        });
      }
    }
    
    setVerificationResult(results);
  };
  
  const handleOnboardVerified = () => {
    if (!verificationResult) return;
    
    const passedCandidates = verificationResult.filter(r => r.passed);
    const newMembers: ClubMember[] = passedCandidates.map(c => ({
      id: Math.random().toString(36).substr(2, 9),
      name: c.name,
      email: c.email,
      role: 'General Member',
      joinDate: new Date().toISOString().split('T')[0],
      basis: configMode === 'fee-based' ? 'Fee Paid' : 'Test Passed'
    }));
    
    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: [...(c.members || []), ...newMembers]
    }));
    
    setVerificationResult(null);
    setCsvData("");
    setActiveTab('recruitment-pool');
  };

  if (!clubs || clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Users className="w-16 h-16 text-white mb-6" />
        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">No Clubs Established</h3>
        <p className="text-white text-sm">Create a club in &quot;My Clubs&quot; before tracking members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter py-2">Membership X Recruitment</h2>
          <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-[0.2em] mt-2">
            Selective Onboarding and Core Team Management
          </p>
        </div>

        <div className="relative group min-w-[250px]">
          <select
            value={selectedClubId || ""}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500"
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none group-hover:text-gold-500 transition-colors" />
        </div>
      </div>

      {/* Membership Configuration */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-gold-500" /> Membership Configuration</h3>
          <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Set rules for onboarding new members</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setConfigMode('fee-based')}
            className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${configMode === 'fee-based' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
          >
            Fee Based
          </button>
          <button
            type="button"
            onClick={() => setConfigMode('test-based')}
            className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${configMode === 'test-based' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
          >
            Test Based
          </button>
        </div>
        
        <div className="space-y-5">
          {configMode === 'fee-based' ? (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Membership Fee (INR)</label>
              <input
                type="number"
                value={feeAmount}
                onChange={e => setFeeAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                placeholder="e.g. 500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Test Paper Link (Google Forms)</label>
                <input
                  type="url"
                  value={paperLink}
                  onChange={e => setPaperLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  placeholder="https://forms.gle/..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Answer Key / Hints</label>
                  <input
                    type="text"
                    value={answers}
                    onChange={e => setAnswers(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Minimum Marks to Pass</label>
                  <input
                    type="number"
                    value={minimumMarks}
                    onChange={e => setMinimumMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="e.g. 40"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveConfig}
            className="px-6 py-3 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      {/* CSV Verification Section */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-gold-500" /> Automated Verification</h3>
          <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Upload Google Forms CSV export to verify candidates</p>
        </div>
        
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Paste CSV Data (Format: Name, Email, Status/Marks)</label>
          <textarea
            value={csvData}
            onChange={e => setCsvData(e.target.value)}
            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors resize-none font-mono text-[11px]"
            placeholder="Name, Email, Score&#10;John Doe, john@example.com, Paid&#10;Jane Smith, jane@example.com, 45"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleVerifyCSV}
            disabled={!csvData}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" /> Verify Submissions
          </button>
        </div>
        
        {verificationResult && (
          <div className="mt-8 border-t border-white/10 pt-8">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">Verification Results</h4>
            <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-signature-gradient border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verificationResult.map((result, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-white font-bold">{result.name}</td>
                      <td className="px-6 py-4 text-zinc-100 text-[10px] uppercase tracking-wider">{result.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${result.passed ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {verificationResult.some(r => r.passed) && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleOnboardVerified}
                  className="px-6 py-3 bg-signature-gradient text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Onboard Verified Candidates
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Section Removed as per User Request */}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('recruitment-pool')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'recruitment-pool' ? 'text-signature-gradient border-gold-500' : 'text-white border-transparent hover:text-white'}`}
        >
          General Roster
        </button>
        <button
          onClick={() => setActiveTab('new-recruit')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'new-recruit' ? 'text-signature-gradient border-gold-500' : 'text-white border-transparent hover:text-white'}`}
        >
          New Recruitment
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'recruitment-pool' && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
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
                {members.filter((m: ClubMember) => m.role === 'General Member').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-white uppercase tracking-widest font-bold text-[10px]">
                      No members in roster. Recruit first.
                    </td>
                  </tr>
                ) : (
                  members
                    .filter((m: ClubMember) => m.role === 'General Member')
                    .map((member: ClubMember) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-white mb-1">{member.name}</p>
                        <p className="text-[10px] text-zinc-100 uppercase tracking-wider">{member.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 text-white border border-white/10">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                            {member.basis}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] text-zinc-100 font-mono">
                        {member.joinDate}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePromote(member.id, 'General Member')}
                            className="px-4 py-2 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all"
                          >
                            Promote to Core Team
                          </button>
                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-2 text-white hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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


        {activeTab === 'new-recruit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleRecruitMember} className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><UserPlus className="w-5 h-5 text-gold-500" /> Admit New Member</h3>
                <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Verify and onboard candidates</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Verification Basis</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewBasis('Fee Paid')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Fee Paid' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                    >
                      Fee Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBasis('Test Passed')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Test Passed' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                    >
                      Test Passed
                    </button>
                  </div>
                </div>

                {newBasis === 'Test Passed' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Exercise/Test Details</label>
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
            <div className="bg-zinc-900/40 border border-white/5 border-dashed rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
              <Shield className="w-16 h-16 text-white mb-6" />
              <h4 className="text-xl font-bold text-white mb-4">Core Team Hierarchy</h4>
              <p className="text-sm text-zinc-100 leading-relaxed max-w-sm mb-8">
                The Club Core is composed of driven individuals who manage the club. Recruit members first, then promote exceptional candidates to the <strong className="text-signature-gradient font-bold">Core Team</strong> from the Member Directory to grant management access.
              </p>
              <button 
                onClick={() => setActiveTab('recruitment-pool')}
                className="px-6 py-3 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white hover:text-white hover:bg-white/5 transition-all"
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
