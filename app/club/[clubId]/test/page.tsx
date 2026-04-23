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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && step !== 'test') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-lg text-center border border-gray-100 dark:border-gray-700">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {step === 'landing' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center">
              <h1 className="text-3xl font-bold mb-2">{clubName}</h1>
              <p className="text-blue-100">Membership Qualification Test</p>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-center space-x-6 mb-8 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  <span>{timeLimitMinutes} Minutes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                  <span>{questions.length} Questions</span>
                </div>
              </div>
              
              <form onSubmit={handleStartTest} className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                >
                  Start Test
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'test' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4 z-10 flex justify-between items-center">
              <h2 className="font-semibold text-lg">{clubName} Test</h2>
              <div className={`flex items-center font-mono text-lg font-bold px-4 py-2 rounded-lg ${
                timeLeftSeconds < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeLeftSeconds)}
              </div>
            </div>

            <div className="space-y-8">
              {questions.map((q, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={q.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">{index + 1}.</span> 
                      {q.text}
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-4">
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
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500' 
                                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type={isMulti ? "checkbox" : "radio"}
                              name={`question-${q.id}`}
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleAnswerChange(q.id!, opt, q.type as 'mcq' | 'multi')}
                              className={`w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 ${isMulti ? 'rounded' : ''}`}
                            />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'short' && (
                    <textarea
                      rows={3}
                      value={answers[q.id!] as string || ''}
                      onChange={(e) => handleAnswerChange(q.id!, e.target.value, 'short')}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
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
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div className={`p-10 text-center ${result.passed ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'}`}>
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                {result.passed ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <XCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">
                {result.passed ? 'Congratulations!' : 'Test Failed'}
              </h1>
              <p className="text-lg opacity-90">
                {result.passed 
                  ? 'You have successfully passed the membership test.' 
                  : 'Unfortunately, you did not meet the required passing score.'}
              </p>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Your Score</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.score}</div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Marks</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.total}</div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Percentage</div>
                  <div className={`text-3xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                    {result.percentage}%
                  </div>
                </div>
              </div>
              
              {result.passed && (
                <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl flex items-start border border-blue-100 dark:border-blue-800/50">
                  <CheckCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">You are now a member!</h4>
                    <p className="opacity-90 leading-relaxed">Your profile has been automatically added to the club roster. You can now access all member privileges and resources.</p>
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
