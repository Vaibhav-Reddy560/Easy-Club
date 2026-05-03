"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/firebase";
import { verifyAndAcceptInvite, getClubMetadata, signOutUser } from "@/lib/db";
import { CheckCircle2, AlertCircle, Loader2, Users, ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function JoinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'preview' | 'verifying' | 'success' | 'error'>('preview');
    const [error, setError] = useState<string | null>(null);
    const [clubName, setClubName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const inviteId = searchParams.get("token");
    const targetClubId = searchParams.get("clubId");

    // Fetch club metadata even before user is logged in
    useEffect(() => {
        if (targetClubId) {
            getClubMetadata(targetClubId).then(data => {
                if (data) setClubName(data.name);
            });
        }
    }, [targetClubId]);

    // Initial check for link validity
    useEffect(() => {
        if (!inviteId) {
            setStatus('error');
            setError("Missing invitation token.");
            return;
        }

        if (!targetClubId) {
            setStatus('error');
            setError("This invitation link is outdated. Please ask the Founder to send a new invite.");
            return;
        }
    }, [inviteId, targetClubId]);

    const handleJoinClick = async () => {
        if (!user) {
            try {
                await signInWithGoogle();
                // Auth hook will re-run and user will be available
            } catch (err) {
                setError("Failed to sign in. Please try again.");
            }
            return;
        }
        
        // If user is logged in, perform the verification
        performVerification();
    };

    const performVerification = async () => {
        if (!user || !inviteId || isProcessing) return;
        
        setIsProcessing(true);
        setStatus('verifying');

        try {
            const result = await verifyAndAcceptInvite(inviteId, targetClubId!, {
                id: user.uid,
                email: user.email || "",
                name: user.displayName || "New Member"
            });

            if (result.success) {
                setClubName(result.clubName || "the club");
                setStatus('success');
                setTimeout(() => {
                    router.push("/");
                }, 3000);
            } else {
                setStatus('error');
                setError(result.error || "Failed to accept invitation.");
            }
        } catch (err) {
            setStatus('error');
            setError("A technical error occurred. Please try again later.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSwitchAccount = async () => {
        try {
            await signOutUser();
            await signInWithGoogle();
        } catch (err) {
            setError("Failed to switch account.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#080808]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                
                <AnimatePresence mode="wait">
                    {status === 'preview' && (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-gold-500/10 border border-gold-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                                <Users className="w-10 h-10 text-gold-500" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center border-4 border-[#080808]">
                                    <ShieldCheck className="w-3 h-3 text-black" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-astronomus text-white uppercase tracking-tighter mb-3">You're Invited!</h1>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                You have been invited to join the core team of <span className="text-gold-500 font-bold">{clubName || "a club"}</span>.
                            </p>

                            {user ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">
                                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Authenticated As</p>
                                        <p className="text-white font-bold text-sm truncate">{user.email}</p>
                                    </div>

                                    <button 
                                        onClick={handleJoinClick}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Team"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button 
                                        onClick={handleSwitchAccount}
                                        className="w-full py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Switch Account
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleJoinClick}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Continue to Verify
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </motion.div>
                    )}

                    {status === 'verifying' && (
                        <motion.div 
                            key="verifying"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-12"
                        >
                            <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Verifying Identity</h2>
                            <p className="text-zinc-500 text-sm">Connecting you to the core team...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-astronomus text-white uppercase tracking-tighter mb-3">Welcome Aboard!</h2>
                            <p className="text-zinc-400 text-sm mb-2">You are now a core member of {clubName}.</p>
                            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Redirecting to Dashboard...</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Verification Failed</h2>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed px-4">{error}</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={handleSwitchAccount}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 transition-all"
                                >
                                    Try Another Account
                                </button>
                                <button 
                                    onClick={() => router.push("/")}
                                    className="w-full py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Go to Home
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        }>
            <JoinContent />
        </Suspense>
    );
}
