"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JCApplyPage() {
  const params = useParams();
  const clubId = params.clubId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  
  const [step, setStep] = useState<'verification' | 'application' | 'submitting' | 'result'>('verification');
  
  // Verification State
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedMemberName, setVerifiedMemberName] = useState("");

  // Form State
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");
  const [ideas, setIdeas] = useState("");

  const [result, setResult] = useState<{ passed: boolean, message: string } | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await fetch(`/api/jc-apply/${clubId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch club details");
        
        setClubName(data.clubName);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch(`/api/jc-apply/${clubId}?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerifiedMemberName(data.memberName);
      setStep('application');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim() || !experience.trim() || !reason.trim() || !ideas.trim()) {
      alert("Please complete all fields.");
      return;
    }

    setStep('submitting');

    try {
      const res = await fetch(`/api/jc-apply/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberEmail: email,
          skills,
          experience,
          reason,
          ideas
        })
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ passed: true, message: "Your application has been submitted to the Core Team for review." });
      } else {
        setResult({ passed: false, message: data.error || "Failed to submit application." });
      }
    } catch (err: any) {
      setResult({ passed: false, message: err.message || "Something went wrong." });
    } finally {
      setStep('result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error && step === 'verification' && !verifying && error === 'Recruitment is currently closed for this club.') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia p-4">
          <div className="bg-[#121212] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border border-white/10">
            <XCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h2 className="text-xl font-astronomus text-white mb-2">Recruitment Closed</h2>
            <p className="text-zinc-400 text-sm">The Junior Core selection protocol is currently paused for {clubName}. Check back later.</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-destrubia text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-gold-500/30">
      <div className="max-w-3xl mx-auto">
        
        {step === 'verification' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative max-w-xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative px-8 py-12 text-center border-b border-white/5">
              <h1 className="text-4xl md:text-5xl font-astronomus text-signature-gradient mb-3">{clubName}</h1>
              <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Junior Core Application Portal</p>
            </div>
            
            <div className="p-8 relative">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 text-center">Verify Your Membership</label>
                  <p className="text-center text-[10px] text-zinc-500 mb-4 tracking-widest">You must be an existing member to apply.</p>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-black border border-white/10 rounded-xl focus:border-gold-500/50 outline-none transition-all text-white font-sans text-center text-lg"
                    placeholder="Enter your registered email"
                  />
                </div>
                
                {error && (
                    <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 uppercase tracking-widest">
                        {error}
                    </div>
                )}
                
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-gold-gradient text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-xl mt-4 flex items-center justify-center disabled:opacity-50 disabled:scale-100"
                >
                  {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'application' && (
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative px-8 py-8 text-center border-b border-white/5 bg-black/40">
              <h2 className="text-3xl font-astronomus text-white mb-2">Junior Core Application</h2>
              <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Applicant: <span className="text-gold-500">{verifiedMemberName}</span></p>
            </div>
            
            <div className="p-8 md:p-10 relative">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Core Skills</label>
                        <p className="text-[10px] text-zinc-600 mb-3 font-sans">What hard and soft skills do you bring to the core team?</p>
                        <textarea 
                            required
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            className="w-full h-32 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-gold-500 font-sans transition-colors focus:bg-[#050505]"
                            placeholder="Design, Tech, Social Media, Management..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Relevant Experience</label>
                        <p className="text-[10px] text-zinc-600 mb-3 font-sans">List past projects, volunteering, or leadership roles.</p>
                        <textarea 
                            required
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                            className="w-full h-32 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-gold-500 font-sans transition-colors focus:bg-[#050505]"
                            placeholder="I previously led a team of 5 in..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Why do you want to join?</label>
                    <p className="text-[10px] text-zinc-600 mb-3 font-sans">Explain your motivation for wanting to take on more responsibility in the club.</p>
                    <textarea 
                        required
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full h-32 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-gold-500 font-sans transition-colors focus:bg-[#050505]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Proposed Ideas & Improvements</label>
                    <p className="text-[10px] text-zinc-600 mb-3 font-sans">What new initiatives or improvements would you bring if selected?</p>
                    <textarea 
                        required
                        value={ideas}
                        onChange={e => setIdeas(e.target.value)}
                        className="w-full h-32 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-gold-500 font-sans transition-colors focus:bg-[#050505]"
                    />
                </div>

                <div className="pt-6 border-t border-white/5">
                    <button
                    type="submit"
                    className="w-full md:w-auto md:px-12 bg-gold-gradient text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center mx-auto"
                    >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Portfolio
                    </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'submitting' && (
           <div className="flex flex-col items-center justify-center py-32">
             <Loader2 className="w-12 h-12 animate-spin text-gold-500 mb-6" />
             <h2 className="text-xl font-astronomus text-white">Submitting Application...</h2>
           </div>
        )}

        {step === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative max-w-xl mx-auto"
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
              <h1 className="text-4xl md:text-3xl font-astronomus text-white mb-3">
                {result.passed ? 'Application Received' : 'Submission Failed'}
              </h1>
              <p className="text-zinc-400 font-sans">
                {result.message}
              </p>
            </div>
            
            {!result.passed && (
               <div className="p-8 bg-black/40 text-center">
                 <button onClick={() => setStep('verification')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-sans text-sm font-bold">
                   Try Again
                 </button>
               </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
