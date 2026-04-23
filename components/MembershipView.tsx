"use client";

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Trash2, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  FileText,
  Settings,
  ChevronDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateClub } from "@/lib/firebase";
import { Club, ClubMember, Question, TestDetails, MembershipConfig } from "@/lib/types";

interface MembershipViewProps {
  club: Club;
  onUpdate: () => void;
}

export default function MembershipView({ club, onUpdate }: MembershipViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'config' | 'test-builder'>('roster');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Membership Config State
  const [config, setConfig] = useState<MembershipConfig>(
    club.membershipConfig || { mode: 'open' }
  );

  // Test Builder State
  const [testDetails, setTestDetails] = useState<TestDetails>(
    club.membershipConfig?.testDetails || {
      timeLimitMinutes: 20,
      passPercentage: 60,
      questions: []
    }
  );

  const handleUpdateConfig = async () => {
    setIsUpdating(true);
    try {
      const updatedConfig = {
        ...config,
        testDetails: config.mode === 'test-based' ? testDetails : undefined
      };
      await updateClub(club.id, { membershipConfig: updatedConfig });
      onUpdate();
    } catch (error) {
      console.error("Error updating config:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1
    };
    setTestDetails({
      ...testDetails,
      questions: [...testDetails.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setTestDetails({
      ...testDetails,
      questions: testDetails.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  };

  const removeQuestion = (id: string) => {
    setTestDetails({
      ...testDetails,
      questions: testDetails.questions.filter(q => q.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 font-astronomus">Membership Control</h2>
          <p className="text-gray-400">Manage how users join and view your current roster.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
          {[
            { id: 'roster', label: 'Roster', icon: Users },
            { id: 'config', label: 'Access', icon: Shield },
            { id: 'test-builder', label: 'Test Builder', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeSubTab === tab.id 
                  ? "bg-purple-600 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'roster' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-morphism rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{club.members?.length || 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Members</div>
                </div>
              </div>
              <div className="glass-morphism rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">12</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">New (30d)</div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search roster..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      <th className="px-6 py-4">Member</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined Via</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {club.members?.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                            member.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-white font-medium">{member.basis || 'Admin Added'}</div>
                          <div className="text-[10px] text-gray-500">{member.joinDate}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'config' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="max-w-2xl"
          >
            <div className="glass-morphism rounded-3xl p-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 font-astronomus">Joining Protocol</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'invite-only', label: 'Invite Only', desc: 'Members can only be added manually by Admins.', icon: Shield },
                    { id: 'open', label: 'Open Enrollment', desc: 'Anyone can join the club instantly.', icon: UserPlus },
                    { id: 'test-based', label: 'Test-Based Admission', desc: 'Candidates must pass an online test to join.', icon: FileText }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setConfig({ ...config, mode: mode.id as any })}
                      className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex gap-4 ${
                        config.mode === mode.id 
                          ? "border-purple-500 bg-purple-500/10" 
                          : "border-white/5 bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.mode === mode.id ? "bg-purple-500 text-white" : "bg-white/5 text-gray-500"}`}>
                        <mode.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${config.mode === mode.id ? "text-white" : "text-gray-400"}`}>{mode.label}</div>
                        <p className="text-sm text-gray-500 mt-1">{mode.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {config.mode === 'test-based' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <p className="text-xs text-purple-300">
                    Admission test is active. Go to "Test Builder" to configure questions and pass requirements.
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleUpdateConfig}
                  disabled={isUpdating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
                >
                  {isUpdating ? "Processing..." : "Update Protocol"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'test-builder' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div className="glass-morphism rounded-2xl p-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Passing Criteria (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={testDetails.passPercentage}
                    onChange={(e) => setTestDetails({ ...testDetails, passPercentage: parseInt(e.target.value) })}
                    className="flex-1 accent-purple-500" 
                  />
                  <span className="text-xl font-bold text-white w-12">{testDetails.passPercentage}%</span>
                </div>
              </div>
              <div className="glass-morphism rounded-2xl p-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Time Limit (Minutes)</label>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <input 
                    type="number"
                    value={testDetails.timeLimitMinutes}
                    onChange={(e) => setTestDetails({ ...testDetails, timeLimitMinutes: parseInt(e.target.value) })}
                    className="bg-transparent text-xl font-bold text-white w-20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white font-astronomus">Question Bank</h3>
                <button 
                  onClick={addQuestion}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {testDetails.questions.length === 0 ? (
                <div className="py-20 text-center glass-morphism rounded-3xl border-2 border-dashed border-white/10">
                  <p className="text-gray-500">No questions added yet. Click above to start building.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testDetails.questions.map((q, idx) => (
                    <div key={q.id} className="glass-morphism rounded-3xl p-6 border border-white/5 relative group">
                      <button 
                        onClick={() => removeQuestion(q.id)}
                        className="absolute top-6 right-6 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-1 text-2xl font-bold text-purple-500/30">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </div>
                        <div className="md:col-span-11 space-y-4">
                          <div className="flex gap-4">
                            <select 
                              value={q.type}
                              onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                              className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                            >
                              <option value="mcq">Single Choice (MCQ)</option>
                              <option value="multi">Multiple Choice</option>
                              <option value="short">Short Answer</option>
                            </select>
                            <input 
                              type="number"
                              value={q.marks}
                              onChange={(e) => updateQuestion(q.id, { marks: parseInt(e.target.value) })}
                              className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white w-20 focus:outline-none"
                              placeholder="Marks"
                            />
                          </div>
                          
                          <input 
                            type="text" 
                            placeholder="Type your question here..."
                            value={q.question}
                            onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                            className="w-full bg-transparent text-lg font-bold text-white border-b border-white/10 pb-2 focus:outline-none focus:border-purple-500 transition-all"
                          />

                          {(q.type === 'mcq' || q.type === 'multi') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options?.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input 
                                    type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                                    checked={q.type === 'mcq' ? q.correctAnswer === opt : (q.correctAnswer as string[]).includes(opt)}
                                    onChange={() => {
                                      if (q.type === 'mcq') {
                                        updateQuestion(q.id, { correctAnswer: opt });
                                      } else {
                                        const current = q.correctAnswer as string[];
                                        const updated = current.includes(opt) 
                                          ? current.filter(c => c !== opt)
                                          : [...current, opt];
                                        updateQuestion(q.id, { correctAnswer: updated });
                                      }
                                    }}
                                    className="accent-purple-500"
                                  />
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(q.options || [])];
                                      newOpts[optIdx] = e.target.value;
                                      updateQuestion(q.id, { options: newOpts });
                                    }}
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-gray-300 focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === 'short' && (
                            <input 
                              type="text"
                              value={q.correctAnswer as string}
                              onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                              placeholder="Type correct answer (for auto-grading)"
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 max-w-4xl pt-6">
              <button 
                onClick={handleUpdateConfig}
                disabled={isUpdating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Test Configuration"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
