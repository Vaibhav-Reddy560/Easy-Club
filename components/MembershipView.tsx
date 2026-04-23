"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Check, ChevronDown, UserCheck, X, Users, Settings, Upload, Save, FileSpreadsheet } from "lucide-react";
import { Club, ClubMember, MemberRole, RecruitmentBasis, MembershipConfig, Question } from "@/lib/types";
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
  
  // Test Builder State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passPercentage, setPassPercentage] = useState<number>(60);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(20);

  // Question Form State
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<'mcq' | 'multi' | 'short'>('mcq');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', '']);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState<string>('');
  const [newQuestionCorrectAnswers, setNewQuestionCorrectAnswers] = useState<string[]>([]);
  const [newQuestionMarks, setNewQuestionMarks] = useState<number>(1);

  React.useEffect(() => {
    if (activeClub?.membershipConfig) {
      setConfigMode(activeClub.membershipConfig.mode);
      setFeeAmount(activeClub.membershipConfig.feeAmount || 0);
      
      const testDetails = activeClub.membershipConfig.testDetails;
      if (testDetails) {
        setQuestions(testDetails.questions || []);
        setPassPercentage(testDetails.passPercentage || 60);
        setTimeLimitMinutes(testDetails.timeLimitMinutes || 20);
      } else {
        setQuestions([]);
        setPassPercentage(60);
        setTimeLimitMinutes(20);
      }
      setNewBasis(activeClub.membershipConfig.mode === 'fee-based' ? 'Fee Paid' : 'Test Passed');
      setNewTestDetails(testDetails ? `Online Test (${testDetails.questions?.length || 0} questions)` : "");
    } else {
      setConfigMode('fee-based');
      setFeeAmount(0);
      setQuestions([]);
      setPassPercentage(60);
      setTimeLimitMinutes(20);
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
          questions,
          passPercentage,
          timeLimitMinutes
        } : undefined
      }
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestionText,
      type: newQuestionType,
      options: newQuestionType !== 'short' ? newQuestionOptions.filter(o => o.trim()) : [],
      correctAnswer: newQuestionType === 'multi' ? newQuestionCorrectAnswers : newQuestionCorrectAnswer,
      marks: newQuestionMarks
    };

    setQuestions([...questions, newQuestion]);

    // Reset Form
    setNewQuestionText("");
    setNewQuestionOptions(['', '']);
    setNewQuestionCorrectAnswer('');
    setNewQuestionCorrectAnswers([]);
    setNewQuestionMarks(1);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Passing Percentage (%)</label>
                  <input
                    type="number"
                    value={passPercentage}
                    onChange={e => setPassPercentage(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={e => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Questions ({questions.length})</h4>
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-black/40 border border-white/10 rounded-xl p-4 relative group">
                    <button onClick={() => handleRemoveQuestion(q.id)} className="absolute top-4 right-4 text-white/40 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-white font-bold mb-2">Q{idx + 1}. {q.text}</p>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-100 font-bold mb-3">
                      <span className="bg-white/5 px-2 py-1 rounded">{q.type}</span>
                      <span className="bg-white/5 px-2 py-1 rounded">{q.marks} Marks</span>
                    </div>
                    {q.type !== 'short' && (
                      <div className="space-y-1">
                        {q.options.map((opt, i) => {
                          const isCorrect = q.type === 'multi' ? (q.correctAnswer as string[]).includes(opt) : q.correctAnswer === opt;
                          return (
                            <div key={i} className={`text-xs p-2 rounded ${isCorrect ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/5 text-zinc-100'}`}>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.type === 'short' && (
                      <div className="text-xs p-2 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        Answer: {q.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Form */}
              <div className="bg-black/20 border border-white/5 border-dashed rounded-2xl p-6 space-y-5">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gold-500">Add New Question</h4>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Question Text</label>
                  <textarea
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors resize-none"
                    placeholder="Enter question text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Question Type</label>
                    <select
                      value={newQuestionType}
                      onChange={(e) => {
                        setNewQuestionType(e.target.value as any);
                        setNewQuestionCorrectAnswer('');
                        setNewQuestionCorrectAnswers([]);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="mcq">Single Choice (MCQ)</option>
                      <option value="multi">Multiple Select</option>
                      <option value="short">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Marks</label>
                    <input
                      type="number"
                      value={newQuestionMarks}
                      onChange={e => setNewQuestionMarks(parseInt(e.target.value) || 1)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {newQuestionType !== 'short' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-2">
                      <div className="w-10 text-center text-[9px] font-black uppercase tracking-widest text-green-500">Correct</div>
                      <div className="flex-1 text-[9px] font-black uppercase tracking-widest text-white">Option Text</div>
                      <div className="w-8"></div>
                    </div>
                    {newQuestionOptions.map((opt, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-2 rounded-xl border transition-all ${
                        (newQuestionType === 'mcq' && newQuestionCorrectAnswer === opt && opt !== '') ||
                        (newQuestionType === 'multi' && newQuestionCorrectAnswers.includes(opt))
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-black/20 border-white/5'
                      }`}>
                        <div className="w-10 flex justify-center">
                          {newQuestionType === 'mcq' ? (
                            <input 
                              type="radio" 
                              name="correctAnswer" 
                              checked={newQuestionCorrectAnswer === opt && opt !== ''}
                              onChange={() => setNewQuestionCorrectAnswer(opt)}
                              className="w-4 h-4 accent-green-500"
                              title="Mark as correct answer"
                            />
                          ) : (
                            <input 
                              type="checkbox" 
                              checked={newQuestionCorrectAnswers.includes(opt)}
                              onChange={(e) => {
                                if (e.target.checked) setNewQuestionCorrectAnswers([...newQuestionCorrectAnswers, opt]);
                                else setNewQuestionCorrectAnswers(newQuestionCorrectAnswers.filter(a => a !== opt));
                              }}
                              className="w-4 h-4 accent-green-500 rounded"
                              title="Mark as correct answer"
                            />
                          )}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...newQuestionOptions];
                            const oldVal = newOpts[idx];
                            newOpts[idx] = e.target.value;
                            setNewQuestionOptions(newOpts);
                            
                            // Update correct answer if it was selected
                            if (newQuestionType === 'mcq' && newQuestionCorrectAnswer === oldVal) {
                              setNewQuestionCorrectAnswer(e.target.value);
                            } else if (newQuestionType === 'multi' && newQuestionCorrectAnswers.includes(oldVal)) {
                              setNewQuestionCorrectAnswers(newQuestionCorrectAnswers.map(a => a === oldVal ? e.target.value : a));
                            }
                          }}
                          className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
                          placeholder={`Enter Option ${idx + 1}...`}
                        />
                        <button 
                          onClick={() => setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== idx))}
                          className="w-8 flex justify-center p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove Option"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setNewQuestionOptions([...newQuestionOptions, ''])}
                      className="mt-2 text-[10px] font-bold text-gold-500 hover:text-gold-400 uppercase tracking-widest inline-flex items-center gap-1"
                    >
                      + Add Option
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Correct Answer (Exact Match)</label>
                    <input
                      type="text"
                      value={newQuestionCorrectAnswer}
                      onChange={e => setNewQuestionCorrectAnswer(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      placeholder="Enter the correct short answer..."
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={handleAddQuestion}
                    className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    Save Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          {configMode === 'test-based' && selectedClubId ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider border border-white/10 bg-black/40 px-3 py-2 rounded-lg select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/club/${selectedClubId}/test` : `/club/${selectedClubId}/test`}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/club/${selectedClubId}/test`);
                  alert("Test link copied!");
                }}
                className="text-[10px] font-bold text-gold-500 uppercase tracking-widest hover:text-gold-400 transition-colors"
              >
                Copy Link
              </button>
            </div>
          ) : <div></div>}
          
          <button
            onClick={handleSaveConfig}
            className="px-6 py-3 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
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
