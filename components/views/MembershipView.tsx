"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, Check, ChevronDown, UserCheck, X, Users, Settings, Upload, Save, FileSpreadsheet, Vote, ClipboardList, Info, Trophy, Copy, Plus, TrendingUp } from "lucide-react";
import { Club, ClubMember, MemberRole, RecruitmentBasis, MembershipConfig, Question, Skill, SkillLevel, JCApplication, JCSelectionConfig } from "@/lib/types";
import { saveClub, updateMemberSkills } from "@/lib/utils/db";

interface MembershipViewProps {
  clubs: Club[];
  onUpdateClub: (updatedClub: Club) => void;
}

export default function MembershipView({ clubs, onUpdateClub }: MembershipViewProps) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(clubs[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'recruitment-pool' | 'new-recruit' | 'jc-selection'>('recruitment-pool');

  // User detection for JC Application
  const [userEmail, setUserEmail] = useState("");
  React.useEffect(() => {
    // In a real app, this would come from auth. For now we use a simple input or state
    // For this UI, we'll let members enter their email to "Apply"
  }, []);

  // JC Selection State
  const [isApplying, setIsApplying] = useState(false);
  const [jcSkillDetails, setJcSkillDetails] = useState("");
  const [jcExperience, setJcExperience] = useState("");
  const [jcReason, setJcReason] = useState("");
  const [jcIdeas, setJcIdeas] = useState("");
  
  const [maxJC, setMaxJC] = useState(5);
  const [isJCOpen, setIsJCOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBasis, setNewBasis] = useState<RecruitmentBasis>('Fee Paid');
  const [newTestDetails, setNewTestDetails] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Beginner');

  const activeClub = clubs.find((c: Club) => c.id === selectedClubId);
  const members = activeClub?.members || [];

  // Configuration State
  const [configMode, setConfigMode] = useState<'fee-based' | 'test-based'>('fee-based');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>('');
  
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
      setRazorpayKeyId(activeClub.membershipConfig.razorpayKeyId || '');
      setRazorpayKeySecret(activeClub.membershipConfig.razorpayKeySecret || '');
      
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
      setRazorpayKeyId('');
      setRazorpayKeySecret('');
      setQuestions([]);
      setPassPercentage(60);
      setTimeLimitMinutes(20);
      setNewBasis('Fee Paid');
      setNewTestDetails("");
    }

    if (activeClub?.jcSelectionConfig) {
      setMaxJC(activeClub.jcSelectionConfig.maxJC);
      setIsJCOpen(activeClub.jcSelectionConfig.isRecruitmentOpen);
    }
  }, [activeClub?.id, activeClub?.membershipConfig, activeClub?.jcSelectionConfig]);

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
      ...(newBasis === 'Test Passed' ? { testDetails: newTestDetails } : {})
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

  const handleAddSkill = async (memberId: string) => {
    if (!newSkill.trim() || !activeClub) return;
    const member = members.find(m => m.id === memberId);
    const newSkillObj: Skill = { name: newSkill.trim(), level: newSkillLevel };
    const updatedSkills = [...(member?.skills || []), newSkillObj];
    
    // Update local state first for instant feedback
    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: (c.members || []).map(m => m.id === memberId ? { ...m, skills: updatedSkills } : m)
    }));

    // Persist to DB
    await updateMemberSkills(activeClub.id, memberId, updatedSkills);
    
    setNewSkill("");
    setNewSkillLevel('Beginner');
    setIsAddingSkill(null);
  };

  const handleRemoveSkill = async (memberId: string, skillName: string) => {
    if (!activeClub) return;
    const member = members.find(m => m.id === memberId);
    const updatedSkills = (member?.skills || []).filter(s => {
      const name = typeof s === 'string' ? s : s.name;
      return name !== skillName;
    });

    handleUpdateActiveClub((c: Club) => ({
      ...c,
      members: (c.members || []).map(m => m.id === memberId ? { ...m, skills: updatedSkills } : m)
    }));

    await updateMemberSkills(activeClub.id, memberId, updatedSkills);
  };

  const handleSaveConfig = () => {
    handleUpdateActiveClub((c: Club) => {
      const config: any = { mode: configMode };

      if (configMode === 'fee-based') {
        config.feeAmount = feeAmount || 0;
        config.razorpayKeyId = razorpayKeyId || '';
        config.razorpayKeySecret = razorpayKeySecret || '';
        config.testDetails = null;
      } else {
        config.feeAmount = null;
        config.razorpayKeyId = null;
        config.razorpayKeySecret = null;
        config.testDetails = {
          questions,
          passPercentage,
          timeLimitMinutes
        };
      }

      return { ...c, membershipConfig: config };
    });
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

  const handleApplyForJC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClub || !userEmail) return;

    // Link with existing member
    const member = activeClub.members?.find(m => m.email.toLowerCase() === userEmail.toLowerCase());
    if (!member) {
        alert("Email not found in club registry. Please use the email you registered with.");
        return;
    }

    // Check if already applied
    if (activeClub.jcApplications?.some(app => app.memberEmail === userEmail)) {
        alert("You have already applied for the Junior Core.");
        return;
    }

    const application: JCApplication = {
        id: `app_${Math.random().toString(36).substr(2, 9)}`,
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        skills: jcSkillDetails,
        experience: jcExperience,
        reason: jcReason,
        ideas: jcIdeas,
        appliedAt: new Date().toISOString(),
        votes: []
    };

    handleUpdateActiveClub((c) => ({
        ...c,
        jcApplications: [...(c.jcApplications || []), application]
    }));

    setIsApplying(false);
    setJcSkillDetails("");
    setJcExperience("");
    setJcReason("");
    setJcIdeas("");
    alert("Application submitted successfully!");
  };

  const handleToggleVote = (appId: string) => {
    // In a real app, we'd get the current user ID. 
    // We'll simulate voting as an SC (Senior Core)
    const currentSCId = "SC_USER_123"; // This should be dynamic

    handleUpdateActiveClub((c) => ({
        ...c,
        jcApplications: (c.jcApplications || []).map(app => {
            if (app.id === appId) {
                const hasVoted = app.votes.includes(currentSCId);
                return {
                    ...app,
                    votes: hasVoted ? app.votes.filter(id => id !== currentSCId) : [...app.votes, currentSCId]
                };
            }
            return app;
        })
    }));
  };

  const handleFinalizeJC = () => {
    if (!activeClub) return;
    
    // Sort by votes and take top maxJC
    const sortedApps = [...(activeClub.jcApplications || [])].sort((a, b) => b.votes.length - a.votes.length);
    const topApps = sortedApps.slice(0, maxJC);
    const topMemberEmails = topApps.map(app => app.memberEmail);

    handleUpdateActiveClub((c) => ({
        ...c,
        members: (c.members || []).map(m => 
            topMemberEmails.includes(m.email) ? { ...m, role: 'Junior Core' as MemberRole } : m
        ),
        jcSelectionConfig: { ...c.jcSelectionConfig!, isRecruitmentOpen: false }
    }));
    
    setIsJCOpen(false);
    alert(`Selection finalized! ${topApps.length} members promoted to Junior Core.`);
  };

  const handleUpdateJCConfig = () => {
    handleUpdateActiveClub((c) => ({
        ...c,
        jcSelectionConfig: {
            maxJC,
            isRecruitmentOpen: isJCOpen
        }
    }));
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
          <p className="text-zinc-100 text-[11px] mt-1 font-bold tracking-[0.2em] uppercase">
            Selective onboarding & pipeline management
          </p>
        </div>

        <div className="relative group min-w-[250px]">
          <select
            value={selectedClubId || ""}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full appearance-none bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black text-white uppercase tracking-widest outline-none hover:border-gold-500/50 transition-colors focus:border-gold-500 cursor-pointer"
          >
            <option value="" disabled className="bg-black text-white">Select a Club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id} className="bg-black text-white">{club.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none group-hover:text-gold-500 transition-colors" />
        </div>
      </div>

      {/* Membership Configuration */}
      <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-10 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Membership Configuration</h3>
          <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Set rules for onboarding new members</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setConfigMode('fee-based')}
            className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${configMode === 'fee-based' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black shadow-inner border-white/15 text-white hover:border-white/30'}`}
          >
            Fee Based
          </button>
          <button
            type="button"
            onClick={() => setConfigMode('test-based')}
            className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${configMode === 'test-based' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black shadow-inner border-white/15 text-white hover:border-white/30'}`}
          >
            Test Based
          </button>
        </div>
        
        <div className="space-y-5">
          {configMode === 'fee-based' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Membership Fee (INR)</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={e => setFeeAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  placeholder="e.g. 500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={razorpayKeyId}
                    onChange={e => setRazorpayKeyId(e.target.value)}
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors font-mono"
                    placeholder="rzp_test_..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={razorpayKeySecret}
                    onChange={e => setRazorpayKeySecret(e.target.value)}
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors font-mono"
                    placeholder="Secret Key"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                To collect payments directly into your account, generate API keys from your Razorpay Dashboard (Settings &gt; API Keys) and enter them here.
              </p>
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
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={e => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Questions ({questions.length})</h4>
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-black shadow-inner border border-white/15 rounded-xl p-4 relative group">
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
                    className="w-full h-20 bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors resize-none"
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
                      className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none"
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
                      className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {newQuestionType !== 'short' ? (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Options & Correct Answer</label>
                    {newQuestionOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {newQuestionType === 'mcq' ? (
                          <input 
                            type="radio" 
                            name="correctAnswer" 
                            checked={newQuestionCorrectAnswer === opt && opt !== ''}
                            onChange={() => setNewQuestionCorrectAnswer(opt)}
                            className="w-4 h-4 accent-gold-500"
                          />
                        ) : (
                          <input 
                            type="checkbox" 
                            checked={newQuestionCorrectAnswers.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) setNewQuestionCorrectAnswers([...newQuestionCorrectAnswers, opt]);
                              else setNewQuestionCorrectAnswers(newQuestionCorrectAnswers.filter(a => a !== opt));
                            }}
                            className="w-4 h-4 accent-gold-500 rounded"
                          />
                        )}
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
                          className="flex-1 bg-black shadow-inner border border-white/15 rounded-lg px-4 py-2 text-sm text-white outline-none"
                          placeholder={`Option ${idx + 1}`}
                        />
                        <button 
                          onClick={() => setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== idx))}
                          className="p-2 text-white/40 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setNewQuestionOptions([...newQuestionOptions, ''])}
                      className="text-[10px] font-bold text-gold-500 hover:text-gold-400 uppercase tracking-widest"
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
                      className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none"
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2 gap-4">
          {(configMode === 'test-based' || configMode === 'fee-based') && selectedClubId ? (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                {configMode === 'test-based' ? 'Test Link' : 'Payment Link'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider border border-white/15 bg-black shadow-inner px-3 py-2 rounded-lg select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/club/${selectedClubId}/${configMode === 'test-based' ? 'test' : 'join'}` : `/club/${selectedClubId}/${configMode === 'test-based' ? 'test' : 'join'}`}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/club/${selectedClubId}/${configMode === 'test-based' ? 'test' : 'join'}`);
                    alert(`${configMode === 'test-based' ? 'Test' : 'Payment'} link copied!`);
                  }}
                  className="text-[10px] font-bold text-gold-500 uppercase tracking-widest hover:text-gold-400 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ) : <div></div>}
          
          <button
            onClick={handleSaveConfig}
            className="px-6 py-3 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all flex items-center justify-center w-full md:w-auto gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Stats Section Removed as per User Request */}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/15">
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
        <button
          onClick={() => setActiveTab('jc-selection')}
          className={`pb-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'jc-selection' ? 'text-signature-gradient border-gold-500' : 'text-white border-transparent hover:text-white'}`}
        >
          JC Selection Hub
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'recruitment-pool' && (
          <div className="bg-[#050505] border border-white/15 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap xl:whitespace-normal min-w-[800px]">
              <thead className="bg-black shadow-inner text-[10px] font-black uppercase tracking-widest text-signature-gradient border-b border-white/5">
                <tr>
                  <th className="px-4 xl:px-8 py-5">Member</th>
                  <th className="px-4 xl:px-8 py-5">Role</th>
                  <th className="px-4 xl:px-8 py-5">Verification</th>
                  <th className="px-4 xl:px-8 py-5">Skills</th>
                  <th className="px-4 xl:px-8 py-5">Date Joined</th>
                  <th className="px-4 xl:px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white uppercase tracking-widest font-bold text-[10px]">
                      No members in roster. Recruit first.
                    </td>
                  </tr>
                ) : (
                  members.map((member: ClubMember) => (
                    <React.Fragment key={member.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 xl:px-8 py-6">
                          <p className="font-bold text-white mb-1">{member.name}</p>
                          <p className="text-[10px] text-zinc-100 uppercase tracking-wider">{member.email}</p>
                        </td>
                        <td className="px-4 xl:px-8 py-6">
                          <span className="inline-flex px-4 py-2 bg-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-transparent text-white">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-4 xl:px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                              {member.basis}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-8 py-6">
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {(member.skills || []).map((skill, idx) => {
                              const sName = typeof skill === 'string' ? skill : skill.name;
                              const sLevel = typeof skill === 'string' ? 'Beginner' : skill.level;
                              return (
                                <div key={idx} className="flex justify-between items-start p-2.5 rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-500 group/skill w-36">
                                  <div className="flex flex-col gap-1.5 min-w-0">
                                    <span className="text-[10px] font-bold leading-tight break-words pr-2 tracking-wider">
                                      {sName}
                                    </span>
                                    <span className={`self-start text-[7px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-widest ${
                                      sLevel === 'Expert' ? 'bg-gold-500 text-black' : 
                                      sLevel === 'Proficient' ? 'bg-white/10 text-white' : 
                                      'bg-white/5 text-zinc-400'
                                    }`}>
                                      {sLevel}
                                    </span>
                                  </div>
                                  <button onClick={() => handleRemoveSkill(member.id, sName)} className="hover:text-white transition-colors mt-0.5 shrink-0 opacity-50 hover:opacity-100">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                            
                            {isAddingSkill !== member.id && (
                              <button 
                                type="button"
                                onClick={() => setIsAddingSkill(member.id)}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 xl:px-8 py-6 text-[11px] text-zinc-100 font-mono whitespace-nowrap">
                          {member.joinDate.split('T')[0].split('-').reverse().join('-')}
                        </td>
                        <td className="px-4 xl:px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handlePromote(member.id, 'General Member')}
                              className="px-4 py-2 bg-white/5 hover:bg-gold-500/20 text-white hover:brightness-110 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-gold-500/30 transition-all whitespace-nowrap"
                            >
                              Promote to Core Team
                            </button>
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="p-2 text-white hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                              title="Remove Member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isAddingSkill === member.id && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={6} className="px-8 py-6 border-t border-white/5">
                            <div className="flex flex-col gap-4 p-6 bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl mx-auto">
                              <h4 className="text-sm font-destrubia text-white tracking-widest text-center">Add skills of {member.name}</h4>
                              
                              <div>
                                <input 
                                  autoFocus
                                  value={newSkill}
                                  onChange={e => setNewSkill(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleAddSkill(member.id)}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500 transition-colors mb-4"
                                  placeholder="e.g. Web Design"
                                />
                                
                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>Proficiency:</span>
                                    <span className={
                                      newSkillLevel === 'Expert' ? 'text-gold-500' :
                                      newSkillLevel === 'Proficient' ? 'text-white' : 'text-zinc-500'
                                    }>{newSkillLevel}</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="2" 
                                    step="1"
                                    value={newSkillLevel === 'Beginner' ? 0 : newSkillLevel === 'Proficient' ? 1 : 2}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      setNewSkillLevel(val === 0 ? 'Beginner' : val === 1 ? 'Proficient' : 'Expert');
                                    }}
                                    className="w-full accent-gold-500"
                                  />
                                  <div className="flex justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase mt-2">
                                    <span>Beginner</span>
                                    <span>Proficient</span>
                                    <span>Expert</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-2">
                                <button 
                                  type="button"
                                  onClick={() => handleAddSkill(member.id)}
                                  className="flex-1 bg-gold-gradient text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg"
                                >
                                  Add Skill
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setIsAddingSkill(null)}
                                  className="px-4 py-3 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}


        {activeTab === 'new-recruit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleRecruitMember} className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-10 space-y-8">
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
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white mb-2">Verification Basis</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewBasis('Fee Paid')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Fee Paid' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black shadow-inner border-white/15 text-white hover:border-white/30'}`}
                    >
                      Fee Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBasis('Test Passed')}
                      className={`py-4 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${newBasis === 'Test Passed' ? 'bg-gold-500/10 border-gold-500 text-signature-gradient' : 'bg-black shadow-inner border-white/15 text-white hover:border-white/30'}`}
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
                      className="w-full bg-black shadow-inner border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors h-24 resize-none"
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
          </div>
        )}

        {activeTab === 'jc-selection' && (
          <div className="space-y-10">
            {/* Admin/Founder Controls */}
            <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-6 md:p-10 space-y-8">
              <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">JC Selection Protocol</h3>
                  <p className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest">Vote and recruit your JC's</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-black border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Max JC Intake</span>
                        <input 
                            type="number" 
                            value={maxJC} 
                            onChange={e => setMaxJC(parseInt(e.target.value) || 0)}
                            className="w-12 bg-transparent text-white font-bold text-sm text-center outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                            <span className={`text-xs font-black uppercase ${isJCOpen ? 'text-green-500' : 'text-red-500'}`}>
                                {isJCOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                const newState = !isJCOpen;
                                setIsJCOpen(newState);
                                handleUpdateActiveClub(c => ({
                                    ...c,
                                    jcSelectionConfig: { maxJC, isRecruitmentOpen: newState }
                                }));
                            }}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isJCOpen ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-green-500/10 text-green-500 border border-green-500/30'}`}
                        >
                            {isJCOpen ? 'Close Applications' : 'Open Applications'}
                        </button>
                    </div>
                    <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/club/${selectedClubId}/jc-apply`);
                          alert("JC Application link copied!");
                        }}
                        className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all"
                        title="Copy JC Application Link"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={handleUpdateJCConfig} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10"><Save className="w-4 h-4 text-white" /></button>
                </div>
              </div>

              {/* Voting Dashboard for SCs */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-signature-gradient">Applications Received ({activeClub?.jcApplications?.length || 0})</h4>
                    <button 
                        onClick={handleFinalizeJC}
                        className="w-full sm:w-auto justify-center px-6 py-3 bg-gold-gradient text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-[1.02] transition-transform flex items-center gap-2"
                    >
                        <Trophy className="w-3.5 h-3.5" /> Finalize Selection (Top {maxJC})
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(activeClub?.jcApplications || []).map(app => (
                        <div key={app.id} className="bg-black border border-white/10 rounded-3xl p-8 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 flex flex-col items-center gap-1">
                                <button 
                                    onClick={() => handleToggleVote(app.id)}
                                    className={`p-3 rounded-full transition-all ${app.votes.includes("SC_USER_123") ? 'bg-gold-500 text-black shadow-gold-glow scale-110' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                                >
                                    <Vote className="w-5 h-5" />
                                </button>
                                <span className="text-[10px] font-black text-white">{app.votes.length} Votes</span>
                            </div>

                            <div className="mb-6">
                                <h5 className="text-lg font-bold text-white">{app.memberName}</h5>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">{app.memberEmail}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[8px] font-black uppercase text-gold-500 tracking-widest block mb-1">Key Skills</span>
                                    <p className="text-[11px] text-zinc-100 leading-relaxed">{app.skills}</p>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase text-gold-500 tracking-widest block mb-1">Experience</span>
                                    <p className="text-[11px] text-zinc-100 leading-relaxed">{app.experience}</p>
                                </div>
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Proposal for Improvements</span>
                                    <p className="text-[11px] text-zinc-300 italic leading-relaxed">"{app.ideas}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(activeClub?.jcApplications || []).length === 0 && (
                        <div className="col-span-full py-16 text-center bg-black/40 border border-dashed border-white/10 rounded-3xl">
                            <ClipboardList className="w-10 h-10 text-white/20 mx-auto mb-4" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No applications received yet</p>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Membership Growth Analytical Graph */}
      <div className="bg-[#050505] border border-white/15 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-gold-500" />
                    Membership Growth
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">New members acquired over the last 6 months</p>
            </div>
            <div className="text-right">
                <span className="text-3xl font-destrubia text-white">
                    {activeClub?.members?.length || 0}
                </span>
                <span className="block text-[9px] font-black uppercase tracking-widest text-gold-500 mt-1">Total Members</span>
            </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-4 relative">
            {/* Background grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-full border-t border-white/10 border-dashed" />
                ))}
            </div>

            {/* Bars */}
            {(() => {
                const members = activeClub?.members || [];
                const months = Array.from({length: 6}, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (5 - i));
                    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
                });
                
                const data = months.map(month => {
                    const count = members.filter(m => {
                        if(!m.joinDate) return false;
                        const d = new Date(m.joinDate);
                        return d.toLocaleString('default', { month: 'short', year: 'numeric' }) === month;
                    }).length;
                    return { month: month.split(' ')[0], count };
                });
                
                const maxCount = Math.max(...data.map(d => d.count), 5); // At least 5 to avoid completely filled bars for 1 member

                return data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-4 z-10 group">
                        <div className="w-full relative flex justify-center items-end h-[150px]">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.count / maxCount) * 100}%` }}
                                transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                                className="w-12 bg-gradient-to-t from-gold-500/20 to-gold-500 rounded-t-xl group-hover:brightness-125 transition-all relative"
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    {d.count}
                                </span>
                            </motion.div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{d.month}</span>
                    </div>
                ));
            })()}
        </div>
      </div>
    </div>
  );
}
