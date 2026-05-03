"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/firebase";
import { verifyAndAcceptInvite } from "@/lib/db";
import { CheckCircle2, AlertCircle, Loader2, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function JoinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'needs-auth' | 'success' | 'error'>('verifying');
    const [error, setError] = useState<string | null>(null);
    const [clubName, setClubName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const inviteId = searchParams.get("token");
    const targetClubId = searchParams.get("clubId");

    useEffect(() => {
        if (authLoading) return;

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

        if (!user) {
            setStatus('needs-auth');
            return;
        }

        handleAcceptInvite();
    }, [user, authLoading, inviteId]);

    const handleAcceptInvite = async () => {
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
                // Redirect after 3 seconds
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

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            setError("Failed to sign in. Please try again.");
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
                    {status === 'verifying' && (
                        <motion.div 
                            key="verifying"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-8"
                        >
                            <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">Verifying Invitation</h2>
                            <p className="text-zinc-400 text-sm">Please wait while we check your access...</p>
                        </motion.div>
                    )}

                    {status === 'needs-auth' && (
                        <motion.div 
                            key="needs-auth"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
                                <Users className="w-8 h-8 text-gold-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">You're Invited!</h2>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                To join this club's core team and access the management workspace, please sign in with your Google account.
                            </p>
                            <button 
                                onClick={handleLogin}
                                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gold-500 transition-all active:scale-95 group"
                            >
                                Continue with Google
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
                            <p className="text-zinc-400 text-sm mb-6">
                                You have successfully joined <span className="text-gold-500 font-bold">{clubName}</span>.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 py-3 rounded-xl">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Redirecting to Dashboard...
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Invalid Invite</h2>
                            <p className="text-zinc-400 text-sm mb-8">{error}</p>
                            <button 
                                onClick={() => router.push("/")}
                                className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Back to Home
                            </button>
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
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        }>
            <JoinContent />
        </Suspense>
    );
}
