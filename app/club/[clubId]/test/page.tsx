"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Question } from '@/lib/types';

type Step = 'landing' | 'test' | 'result';

export default function OnlineTestPage() {
  const { clubId } = useParams() as { clubId: string };
  
  const [step, setStep] = useState<Step>('landing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Test Config State
  const [clubName, setClubName] = useState('');
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  
  // User State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Test Taking State
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Result State
  const [result, setResult] = useState<{ score: number; total: number; percentage: number; passed: boolean } | null>(null);

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/test/${clubId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch test details');
        
        setClubName(data.clubName);
        setTimeLimitMinutes(data.timeLimitMinutes);
        setQuestions(data.questions);
        setTimeLeftSeconds(data.timeLimitMinutes * 60);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [clubId]);

  // Timer Logic
  useEffect(() => {
    if (step === 'test' && timeLeftSeconds > 0) {
      const timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest(); // auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeftSeconds]);

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setStep('test');
  };

  const handleAnswerChange = (questionId: string, val: string, type: 'mcq' | 'multi' | 'short') => {
    setAnswers(prev => {
      const current = prev[questionId];
      if (type === 'multi') {
        const currentArr = Array.isArray(current) ? current : [];
        if (currentArr.includes(val)) {
          return { ...prev, [questionId]: currentArr.filter(item => item !== val) };
        } else {
          return { ...prev, [questionId]: [...currentArr, val] };
        }
      } else {
        return { ...prev, [questionId]: val };
      }
    });
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/test/${clubId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, answers })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit test');
      
      setResult(data);
      setStep('result');
    } catch (err: any) {
      setError(err.message);
      // Fallback to landing on critical error during submission
      if (step === 'test') {
        alert("Submission failed: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error && step !== 'test') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia p-4">
        <div className="bg-[#121212] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border border-white/10">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-astronomus text-white mb-2">Unavailable</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] font-destrubia text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-gold-500/30">
      <div className="max-w-3xl mx-auto">
        
        {step === 'landing' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative px-8 py-12 text-center border-b border-white/5">
              <h1 className="text-4xl md:text-5xl font-astronomus text-signature-gradient mb-3">{clubName}</h1>
              <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Membership Qualification Test</p>
            </div>
            
            <div className="p-8 relative">
              <div className="flex items-center justify-center space-x-8 mb-10 text-zinc-300">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gold-500" />
                  <span className="text-sm font-bold">{timeLimitMinutes} Minutes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-gold-500" />
                  <span className="text-sm font-bold">{questions.length} Questions</span>
                </div>
              </div>
              
              <form onSubmit={handleStartTest} className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-gold-500/50 outline-none transition-all text-white font-sans"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-gold-500/50 outline-none transition-all text-white font-sans"
                    placeholder="john@example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gold-gradient text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-xl mt-4"
                >
                  Start Test
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'test' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-4 sticky top-4 z-50 flex justify-between items-center">
              <h2 className="font-astronomus text-xl text-white tracking-wide">{clubName} <span className="text-gold-500 font-sans">Test</span></h2>
              <div className={`flex items-center font-mono text-lg font-bold px-4 py-2 rounded-xl border ${
                timeLeftSeconds < 60 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-gold-400 border-white/10'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeLeftSeconds)}
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={q.id} 
                  className="bg-[#121212] rounded-3xl shadow-xl border border-white/5 p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-lg font-sans text-white leading-relaxed">
                      <span className="text-gold-500 font-bold mr-3">{index + 1}.</span> 
                      {q.text}
                    </h3>
                    <span className="bg-white/5 border border-white/10 text-zinc-400 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full whitespace-nowrap ml-4">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  {(q.type === 'mcq' || q.type === 'multi') && q.options && (
                    <div className="space-y-3">
                      {q.options.map((opt, optIndex) => {
                        const isMulti = q.type === 'multi';
                        const isChecked = isMulti 
                          ? (answers[q.id!] as string[] || []).includes(opt)
                          : answers[q.id!] === opt;
                          
                        return (
                          <label 
                            key={optIndex} 
                            className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-gold-500/10 border-gold-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]' 
                                : 'bg-black/50 border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                          >
                            <input
                              type={isMulti ? "checkbox" : "radio"}
                              name={`question-${q.id}`}
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleAnswerChange(q.id!, opt, q.type as 'mcq' | 'multi')}
                              className={`w-5 h-5 appearance-none border border-white/20 bg-black checked:bg-gold-500 checked:border-gold-500 transition-colors ${isMulti ? 'rounded-md' : 'rounded-full'} relative after:content-[''] after:absolute after:inset-0 after:m-auto after:w-2 after:h-2 after:bg-black after:rounded-full after:opacity-0 checked:after:opacity-100 flex items-center justify-center`}
                            />
                            <span className={`ml-4 font-sans ${isChecked ? 'text-white' : 'text-zinc-300'}`}>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'short' && (
                    <textarea
                      rows={4}
                      value={answers[q.id!] as string || ''}
                      onChange={(e) => handleAnswerChange(q.id!, e.target.value, 'short')}
                      placeholder="Type your answer here..."
                      className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl focus:border-gold-500/50 outline-none transition-all resize-none text-white font-sans placeholder:text-zinc-600"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="pt-8 pb-12">
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="w-full bg-gold-gradient text-black font-bold uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl hover:scale-[1.01] flex items-center justify-center text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Submitting Test...
                  </>
                ) : (
                  'Submit Test'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="p-12 text-center relative border-b border-white/5">
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-black border border-white/10 shadow-2xl">
                {result.passed ? (
                  <CheckCircle className="w-10 h-10 text-gold-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-astronomus text-signature-gradient mb-3">
                {result.passed ? 'Congratulations!' : 'Test Failed'}
              </h1>
              <p className="text-zinc-400 font-sans">
                {result.passed 
                  ? 'You have successfully passed the membership qualification test.' 
                  : 'Unfortunately, you did not meet the required passing score.'}
              </p>
            </div>
            
            <div className="p-8 md:p-12 bg-black/40">
              <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
                <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Your Score</div>
                  <div className="text-3xl font-astronomus text-white">{result.score}</div>
                </div>
                <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Total Marks</div>
                  <div className="text-3xl font-astronomus text-white">{result.total}</div>
                </div>
                <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Percentage</div>
                  <div className={`text-3xl font-astronomus ${result.passed ? 'text-gold-400' : 'text-red-400'}`}>
                    {result.percentage}%
                  </div>
                </div>
              </div>
              
              {result.passed && (
                <div className="mt-8 p-6 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-start">
                  <CheckCircle className="w-5 h-5 mr-4 flex-shrink-0 mt-0.5 text-gold-500" />
                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">You are now a member!</h4>
                    <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                      Your profile has been automatically added to the club roster. You can now access all member privileges and resources.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
